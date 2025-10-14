-- Inserir usuário atual como super_admin
INSERT INTO user_roles (user_id, role)
VALUES ('4430e6af-29b3-4854-ab95-44e27c90363b', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Inserir segundo usuário como user
INSERT INTO user_roles (user_id, role)
VALUES ('40c38f94-a242-4378-888a-3b5909761f6c', 'user')
ON CONFLICT (user_id, role) DO NOTHING;

-- Limpar funções has_role duplicadas com CASCADE
DROP FUNCTION IF EXISTS public.has_role(user_role, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, user_role) CASCADE;

-- Recriar função has_role correta
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

-- Recriar policies que foram dropadas
CREATE POLICY "Admins can create invites" ON public.invites
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::user_role) OR has_role(auth.uid(), 'super_admin'::user_role));

CREATE POLICY "Admins can view system settings" ON public.system_settings
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::user_role) OR has_role(auth.uid(), 'super_admin'::user_role));

CREATE POLICY "Admins can update system settings" ON public.system_settings
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::user_role) OR has_role(auth.uid(), 'super_admin'::user_role));

CREATE POLICY "Admins can insert system settings" ON public.system_settings
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::user_role) OR has_role(auth.uid(), 'super_admin'::user_role));

CREATE POLICY "Users can view their own conversations or assigned ones" ON public.conversations
  FOR SELECT
  USING (
    (auth.uid() = user_id) OR 
    (auth.uid() = assigned_to) OR 
    has_role(auth.uid(), 'admin'::user_role) OR 
    has_role(auth.uid(), 'super_admin'::user_role)
  );

CREATE POLICY "Users can update their own conversations or assigned ones" ON public.conversations
  FOR UPDATE
  USING (
    (auth.uid() = user_id) OR 
    (auth.uid() = assigned_to) OR 
    has_role(auth.uid(), 'admin'::user_role) OR 
    has_role(auth.uid(), 'super_admin'::user_role)
  );

CREATE POLICY "Users can delete their own conversations" ON public.conversations
  FOR DELETE
  USING (
    (auth.uid() = user_id) OR 
    has_role(auth.uid(), 'admin'::user_role) OR 
    has_role(auth.uid(), 'super_admin'::user_role)
  );

-- Criar função para atribuir role automaticamente a novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INT;
BEGIN
  SELECT COUNT(*) INTO user_count FROM auth.users;
  
  IF user_count = 1 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para novos usuários
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();