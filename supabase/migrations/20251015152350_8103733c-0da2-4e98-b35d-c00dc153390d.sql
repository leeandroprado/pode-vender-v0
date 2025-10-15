-- ========================================
-- PASSO 1: Adicionar organization_id nas tabelas
-- ========================================
ALTER TABLE products ADD COLUMN organization_id uuid;
ALTER TABLE clients ADD COLUMN organization_id uuid;
ALTER TABLE conversations ADD COLUMN organization_id uuid;

-- Popular organization_id existente baseado no user_id
UPDATE products p
SET organization_id = (SELECT organization_id FROM profiles WHERE id = p.user_id);

UPDATE clients c
SET organization_id = (SELECT organization_id FROM profiles WHERE id = c.user_id);

UPDATE conversations c
SET organization_id = (SELECT organization_id FROM profiles WHERE id = c.user_id);

-- ========================================
-- PASSO 2: Criar funções de verificação organizacional
-- ========================================
CREATE OR REPLACE FUNCTION public.same_organization(_user_id uuid, _owner_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p1
    JOIN public.profiles p2 ON p1.organization_id = p2.organization_id
    WHERE p1.id = _user_id
      AND p2.id = _owner_id
      AND p1.organization_id IS NOT NULL
  )
$$;

CREATE OR REPLACE FUNCTION public.current_user_organization()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
$$;

-- ========================================
-- PASSO 3: Criar triggers para auto-popular organization_id
-- ========================================
CREATE OR REPLACE FUNCTION set_organization_id_products()
RETURNS TRIGGER AS $$
BEGIN
  NEW.organization_id := (SELECT organization_id FROM profiles WHERE id = NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_set_organization_id_products
BEFORE INSERT ON products
FOR EACH ROW
EXECUTE FUNCTION set_organization_id_products();

CREATE OR REPLACE FUNCTION set_organization_id_clients()
RETURNS TRIGGER AS $$
BEGIN
  NEW.organization_id := (SELECT organization_id FROM profiles WHERE id = NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_set_organization_id_clients
BEFORE INSERT ON clients
FOR EACH ROW
EXECUTE FUNCTION set_organization_id_clients();

CREATE OR REPLACE FUNCTION set_organization_id_conversations()
RETURNS TRIGGER AS $$
BEGIN
  NEW.organization_id := (SELECT organization_id FROM profiles WHERE id = NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_set_organization_id_conversations
BEFORE INSERT ON conversations
FOR EACH ROW
EXECUTE FUNCTION set_organization_id_conversations();

-- ========================================
-- PASSO 4: Atualizar políticas RLS - PRODUCTS
-- ========================================
DROP POLICY IF EXISTS "Users can view their own products" ON products;
DROP POLICY IF EXISTS "Users can create their own products" ON products;
DROP POLICY IF EXISTS "Users can update their own products" ON products;
DROP POLICY IF EXISTS "Users can delete their own products" ON products;

CREATE POLICY "Users can view organization products"
ON products FOR SELECT
USING (
  organization_id = current_user_organization()
);

CREATE POLICY "Users can create organization products"
ON products FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  organization_id = current_user_organization()
);

CREATE POLICY "Users can update products"
ON products FOR UPDATE
USING (
  organization_id = current_user_organization() AND (
    auth.uid() = user_id OR
    has_role(auth.uid(), 'admin'::user_role) OR
    has_role(auth.uid(), 'super_admin'::user_role)
  )
);

CREATE POLICY "Users can delete products"
ON products FOR DELETE
USING (
  organization_id = current_user_organization() AND (
    auth.uid() = user_id OR
    has_role(auth.uid(), 'admin'::user_role) OR
    has_role(auth.uid(), 'super_admin'::user_role)
  )
);

-- ========================================
-- PASSO 4: Atualizar políticas RLS - CLIENTS
-- ========================================
DROP POLICY IF EXISTS "Users can view their own clients" ON clients;
DROP POLICY IF EXISTS "Users can create their own clients" ON clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON clients;

CREATE POLICY "Users can view organization clients"
ON clients FOR SELECT
USING (
  organization_id = current_user_organization()
);

CREATE POLICY "Users can create organization clients"
ON clients FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  organization_id = current_user_organization()
);

CREATE POLICY "Users can update clients"
ON clients FOR UPDATE
USING (
  organization_id = current_user_organization() AND (
    auth.uid() = user_id OR
    has_role(auth.uid(), 'admin'::user_role) OR
    has_role(auth.uid(), 'super_admin'::user_role)
  )
);

CREATE POLICY "Users can delete clients"
ON clients FOR DELETE
USING (
  organization_id = current_user_organization() AND (
    auth.uid() = user_id OR
    has_role(auth.uid(), 'admin'::user_role) OR
    has_role(auth.uid(), 'super_admin'::user_role)
  )
);

-- ========================================
-- PASSO 4: Atualizar políticas RLS - CONVERSATIONS
-- ========================================
DROP POLICY IF EXISTS "Users can view their own conversations or assigned ones" ON conversations;
DROP POLICY IF EXISTS "Users can create their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their own conversations or assigned ones" ON conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON conversations;

CREATE POLICY "Users can view organization conversations"
ON conversations FOR SELECT
USING (
  organization_id = current_user_organization() AND (
    auth.uid() = assigned_to OR
    has_role(auth.uid(), 'admin'::user_role) OR
    has_role(auth.uid(), 'super_admin'::user_role)
  )
);

CREATE POLICY "Users can create organization conversations"
ON conversations FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  organization_id = current_user_organization()
);

CREATE POLICY "Users can update conversations"
ON conversations FOR UPDATE
USING (
  organization_id = current_user_organization() AND (
    auth.uid() = assigned_to OR
    auth.uid() = user_id OR
    has_role(auth.uid(), 'admin'::user_role) OR
    has_role(auth.uid(), 'super_admin'::user_role)
  )
);

CREATE POLICY "Users can delete conversations"
ON conversations FOR DELETE
USING (
  organization_id = current_user_organization() AND (
    has_role(auth.uid(), 'admin'::user_role) OR
    has_role(auth.uid(), 'super_admin'::user_role)
  )
);

-- ========================================
-- PASSO 5: Atualizar trigger de novo usuário
-- ========================================
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_count INT;
  has_pending_invite BOOLEAN;
  invite_org_id UUID;
  inviter_org_id UUID;
BEGIN
  -- Verificar se existe convite pendente para este email
  SELECT EXISTS (
    SELECT 1 FROM public.invites 
    WHERE email = NEW.email 
    AND status = 'pending'
  ) INTO has_pending_invite;
  
  -- Se tem convite pendente, buscar organization_id do convidador
  IF has_pending_invite THEN
    SELECT p.organization_id INTO inviter_org_id
    FROM public.invites i
    JOIN public.profiles p ON p.id = i.invited_by
    WHERE i.email = NEW.email 
    AND i.status = 'pending'
    LIMIT 1;
    
    -- Atualizar profiles com organization_id do convidador
    UPDATE public.profiles
    SET organization_id = inviter_org_id
    WHERE id = NEW.id;
    
    RETURN NEW;
  END IF;
  
  -- Caso contrário, criar role padrão e definir organization_id = user_id
  SELECT COUNT(*) INTO user_count FROM auth.users;
  
  IF user_count = 1 THEN
    -- Primeiro usuário: Super Admin com organization_id = user_id
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin');
    
    UPDATE public.profiles
    SET organization_id = NEW.id
    WHERE id = NEW.id;
  ELSE
    -- Outros usuários sem convite: usuário padrão com organization_id = user_id
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    UPDATE public.profiles
    SET organization_id = NEW.id
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$function$;