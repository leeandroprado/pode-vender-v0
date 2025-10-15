-- Remover política incompleta de UPDATE
DROP POLICY IF EXISTS "Admins can update user roles" ON user_roles;

-- Recriar com USING e WITH CHECK
CREATE POLICY "Admins can update user roles"
ON user_roles
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::user_role) 
  OR 
  has_role(auth.uid(), 'super_admin'::user_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::user_role) 
  OR 
  has_role(auth.uid(), 'super_admin'::user_role)
);