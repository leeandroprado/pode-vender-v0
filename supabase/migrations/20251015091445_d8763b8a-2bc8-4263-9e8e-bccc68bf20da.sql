-- Adicionar política de INSERT para admins criarem user roles
-- Isso resolve o erro "new row violates row-level security policy"
-- que ocorre quando o UPSERT tenta fazer INSERT
CREATE POLICY "Admins can insert user roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::user_role) OR 
  has_role(auth.uid(), 'super_admin'::user_role)
);