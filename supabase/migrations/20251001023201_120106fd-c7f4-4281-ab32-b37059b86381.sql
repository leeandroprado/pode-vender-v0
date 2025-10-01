-- Create enum for agent status
CREATE TYPE agent_status AS ENUM ('active', 'inactive', 'training');

-- Create enum for AI models
CREATE TYPE ai_model AS ENUM (
  'google/gemini-2.5-pro',
  'google/gemini-2.5-flash',
  'google/gemini-2.5-flash-lite',
  'openai/gpt-5',
  'openai/gpt-5-mini',
  'openai/gpt-5-nano'
);

-- Create agents table
CREATE TABLE public.agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  model ai_model NOT NULL DEFAULT 'google/gemini-2.5-flash',
  status agent_status NOT NULL DEFAULT 'active',
  whatsapp_connected BOOLEAN NOT NULL DEFAULT false,
  whatsapp_phone TEXT,
  qr_code TEXT,
  conversations_count INTEGER NOT NULL DEFAULT 0,
  prompt_system TEXT NOT NULL DEFAULT 'Você é um assistente útil.',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own agents"
  ON public.agents
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agents"
  ON public.agents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agents"
  ON public.agents
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agents"
  ON public.agents
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();