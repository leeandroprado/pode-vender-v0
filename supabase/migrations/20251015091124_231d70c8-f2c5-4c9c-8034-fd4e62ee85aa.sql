-- Adicionar política para admins verem todos os roles
-- Isso resolve o problema do SELECT na linha 125 de useTeamMembers.ts
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::user_role) OR 
  has_role(auth.uid(), 'super_admin'::user_role)
);