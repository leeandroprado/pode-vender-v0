-- ============================================================================
-- FASE 1: CORREÇÕES DE SEGURANÇA URGENTES
-- ============================================================================

-- 1.0: Primeiro, atualizar a policy que depende de profiles.role
DROP POLICY IF EXISTS "Admins can create invites" ON public.invites;

-- 1.1: Migrar roles de profiles para user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, role 
FROM public.profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- 1.2: Criar função has_role como SECURITY DEFINER para evitar recursão em RLS
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 1.3: Recriar a policy de invites usando has_role
CREATE POLICY "Admins can create invites"
ON public.invites
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'super_admin')
);

-- 1.4: Agora podemos remover a coluna role de profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- 1.5: Atualizar políticas RLS da tabela profiles para remover acesso público
DROP POLICY IF EXISTS "Service role full access to profiles" ON public.profiles;

-- Criar políticas corretas para profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- 1.6: Adicionar políticas RLS para system_settings
DROP POLICY IF EXISTS "Admins can view system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can update system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can insert system settings" ON public.system_settings;

CREATE POLICY "Admins can view system settings"
ON public.system_settings
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Admins can update system settings"
ON public.system_settings
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Admins can insert system settings"
ON public.system_settings
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'super_admin')
);

-- ============================================================================
-- FASE 2: CORREÇÕES DE ESTRUTURA DE PRODUCTS
-- ============================================================================

-- 2.1: Adicionar coluna category_id à tabela products se não existir
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL;

-- 2.2: Adicionar colunas adicionais para products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS sku text;

-- 2.3: Migrar coluna status para active (boolean) - atualizar apenas se active for null
UPDATE public.products
SET active = CASE 
  WHEN status = 'active' OR status = 'ativo' THEN true
  WHEN status = 'inactive' OR status = 'inativo' THEN false
  ELSE true
END
WHERE active IS NULL;

-- 2.4: Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(active);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);

-- ============================================================================
-- FASE 4: CORREÇÕES ADICIONAIS
-- ============================================================================

-- 4.1: Atualizar funções existentes para incluir search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT public.has_role(auth.uid(), 'super_admin');
$function$;