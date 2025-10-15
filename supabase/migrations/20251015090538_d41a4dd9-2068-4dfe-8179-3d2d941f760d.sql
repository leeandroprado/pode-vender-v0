-- Dropar política existente que está causando problema
DROP POLICY IF EXISTS "Admins can update user roles" ON public.user_roles;

-- Criar política corrigida sem with_check restritivo
CREATE POLICY "Admins can update user roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::user_role) OR 
  has_role(auth.uid(), 'super_admin'::user_role)
)
WITH CHECK (true);  -- Permite qualquer valor novo desde que passou no USING