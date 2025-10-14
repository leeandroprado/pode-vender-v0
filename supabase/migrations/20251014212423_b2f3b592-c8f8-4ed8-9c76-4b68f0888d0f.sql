-- Add 'vendedor' role to user_role enum
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'vendedor' 
    AND enumtypid = 'user_role'::regtype
  ) THEN
    ALTER TYPE user_role ADD VALUE 'vendedor';
  END IF;
END $$;

-- Add assigned_to column to conversations table
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_conversations_assigned_to ON conversations(assigned_to);

-- Drop ALL existing policies for conversations to recreate them
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON conversations;
DROP POLICY IF EXISTS "Service role can view all conversations" ON conversations;
DROP POLICY IF EXISTS "Service role can create conversations" ON conversations;
DROP POLICY IF EXISTS "Service role can update conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view their own conversations or assigned ones" ON conversations;
DROP POLICY IF EXISTS "Users can update their own conversations or assigned ones" ON conversations;

-- Create new RLS policies for conversations with vendedor support
CREATE POLICY "Users can view their own conversations or assigned ones" 
ON conversations FOR SELECT 
USING (
  auth.uid() = user_id OR 
  auth.uid() = assigned_to OR
  has_role(auth.uid(), 'admin'::user_role) OR 
  has_role(auth.uid(), 'super_admin'::user_role)
);

CREATE POLICY "Users can update their own conversations or assigned ones" 
ON conversations FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  auth.uid() = assigned_to OR
  has_role(auth.uid(), 'admin'::user_role) OR 
  has_role(auth.uid(), 'super_admin'::user_role)
);

CREATE POLICY "Users can create their own conversations" 
ON conversations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" 
ON conversations FOR DELETE 
USING (
  auth.uid() = user_id OR
  has_role(auth.uid(), 'admin'::user_role) OR 
  has_role(auth.uid(), 'super_admin'::user_role)
);

-- Service role policies
CREATE POLICY "Service role can view all conversations" 
ON conversations FOR SELECT 
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

CREATE POLICY "Service role can create conversations" 
ON conversations FOR INSERT 
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

CREATE POLICY "Service role can update conversations" 
ON conversations FOR UPDATE 
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);