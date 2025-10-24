-- ========================================
-- PASSO 1: Verificar e Atualizar Roles Antigas
-- ========================================

-- Atualizar usuários com roles antigas para 'user'
UPDATE user_roles 
SET role = 'user' 
WHERE role IN ('moderator', 'vendedor');

-- ========================================
-- PASSO 2: Atualizar Enum user_role
-- ========================================

-- Remover DEFAULT temporariamente
ALTER TABLE user_roles ALTER COLUMN role DROP DEFAULT;
ALTER TABLE invites ALTER COLUMN role DROP DEFAULT;

-- Dropar função has_role que depende do enum
DROP FUNCTION IF EXISTS public.has_role(uuid, user_role) CASCADE;

-- Dropar função is_super_admin que também pode depender
DROP FUNCTION IF EXISTS public.is_super_admin() CASCADE;

-- Renomear enum antigo
ALTER TYPE user_role RENAME TO user_role_old;

-- Criar novo enum apenas com roles válidas
CREATE TYPE user_role AS ENUM ('owner', 'super_admin', 'admin', 'user');

-- Atualizar tabela user_roles para usar novo enum
ALTER TABLE user_roles 
  ALTER COLUMN role TYPE user_role 
  USING role::text::user_role;

-- Atualizar invites table
ALTER TABLE invites 
  ALTER COLUMN role TYPE user_role 
  USING role::text::user_role;

-- Restaurar DEFAULT
ALTER TABLE user_roles ALTER COLUMN role SET DEFAULT 'user'::user_role;
ALTER TABLE invites ALTER COLUMN role SET DEFAULT 'user'::user_role;

-- Remover enum antigo com CASCADE
DROP TYPE user_role_old CASCADE;

-- ========================================
-- PASSO 2.5: Recriar Funções de Segurança
-- ========================================

-- Recriar função has_role com novo enum
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Recriar função is_super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT public.has_role(auth.uid(), 'super_admin'::user_role) 
    OR public.has_role(auth.uid(), 'owner'::user_role);
$$;

-- ========================================
-- PASSO 3: Atualizar Trigger handle_new_user_role
-- ========================================

CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_count INT;
  has_pending_invite BOOLEAN;
  inviter_org_id UUID;
  trial_plan_id UUID;
  new_org_id UUID;
BEGIN
  -- Verificar se existe convite pendente para este email
  SELECT EXISTS (
    SELECT 1 FROM public.invites 
    WHERE email = NEW.email 
    AND status = 'pending'
  ) INTO has_pending_invite;
  
  -- Se tem convite pendente, apenas atualizar organization_id
  -- (a role será criada quando o convite for aceito)
  IF has_pending_invite THEN
    SELECT p.organization_id INTO inviter_org_id
    FROM public.invites i
    JOIN public.profiles p ON p.id = i.invited_by
    WHERE i.email = NEW.email 
    AND i.status = 'pending'
    LIMIT 1;
    
    UPDATE public.profiles
    SET organization_id = inviter_org_id
    WHERE id = NEW.id;
    
    RETURN NEW;
  END IF;
  
  -- Contar usuários existentes (excluindo o atual)
  SELECT COUNT(*) INTO user_count 
  FROM auth.users 
  WHERE id != NEW.id;
  
  -- Buscar ID do plano Trial
  SELECT id INTO trial_plan_id 
  FROM public.subscription_plans 
  WHERE slug = 'trial' 
  LIMIT 1;
  
  -- Definir organization_id como o próprio user_id (nova organização)
  new_org_id := NEW.id;
  
  -- Atualizar profile com organization_id
  UPDATE public.profiles
  SET organization_id = new_org_id
  WHERE id = NEW.id;
  
  IF user_count = 0 THEN
    -- ========================================
    -- PRIMEIRO USUÁRIO DO SISTEMA: OWNER
    -- ========================================
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'owner');
    
  ELSE
    -- ========================================
    -- NOVOS USUÁRIOS SEM CONVITE: SUPER_ADMIN
    -- ========================================
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin');
    
  END IF;
  
  -- ========================================
  -- CRIAR SUBSCRIPTION NO PLANO TRIAL
  -- ========================================
  IF trial_plan_id IS NOT NULL THEN
    INSERT INTO public.organization_subscriptions (
      organization_id,
      plan_id,
      status,
      trial_ends_at,
      current_period_start,
      current_period_end
    )
    VALUES (
      new_org_id,
      trial_plan_id,
      'trial',
      NOW() + INTERVAL '3 days',
      NOW(),
      NOW() + INTERVAL '3 days'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- ========================================
-- PASSO 4: Remover Triggers e Funções Antigas
-- ========================================

-- Remover triggers antigos (não são mais necessários)
DROP TRIGGER IF EXISTS on_user_role_created ON user_roles;
DROP TRIGGER IF EXISTS on_user_role_created_trial ON user_roles;

-- Remover função antiga com CASCADE para remover dependências
DROP FUNCTION IF EXISTS public.create_trial_subscription() CASCADE;