-- Drop existing SELECT policy on profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Create new policy allowing users to view their own profile OR admins/super_admins to view all
CREATE POLICY "Users can view their own profile or admins can view all"
ON profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id 
  OR 
  has_role(auth.uid(), 'admin') 
  OR 
  has_role(auth.uid(), 'super_admin')
);