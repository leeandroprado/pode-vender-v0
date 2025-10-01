-- Fix RLS policies for conversations table
-- Drop conflicting INSERT policy
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.conversations;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can create their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON public.conversations;

-- Create service_role policy for N8N and automations
CREATE POLICY "Service role full access" ON public.conversations
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- Create policies for authenticated users
CREATE POLICY "Users can manage their conversations" ON public.conversations
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Fix RLS policies for messages table
-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can update messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can delete messages from their conversations" ON public.messages;

-- Create service_role policy for N8N and automations
CREATE POLICY "Service role full access" ON public.messages
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- Create policies for authenticated users
CREATE POLICY "Users can manage messages in their conversations" ON public.messages
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.conversations
  WHERE conversations.id = messages.conversation_id
  AND conversations.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.conversations
  WHERE conversations.id = messages.conversation_id
  AND conversations.user_id = auth.uid()
));