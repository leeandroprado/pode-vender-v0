-- Permitir admins e super_admins atualizarem roles de usuários
CREATE POLICY "Admins can update user roles"
ON user_roles
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin') 
  OR 
  has_role(auth.uid(), 'super_admin')
);

-- Permitir admins e super_admins deletarem roles de usuários
CREATE POLICY "Admins can delete user roles"
ON user_roles
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin') 
  OR 
  has_role(auth.uid(), 'super_admin')
);