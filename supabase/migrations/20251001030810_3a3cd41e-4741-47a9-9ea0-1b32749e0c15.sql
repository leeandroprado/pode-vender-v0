-- Create enum for WhatsApp instance status
CREATE TYPE whatsapp_instance_status AS ENUM ('connecting', 'connected', 'disconnected', 'error');

-- Create whatsapp_instances table
CREATE TABLE public.whatsapp_instances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agent_id UUID NOT NULL UNIQUE REFERENCES public.agents(id) ON DELETE CASCADE,
  instance_name TEXT NOT NULL UNIQUE,
  instance_id UUID,
  hash TEXT,
  status whatsapp_instance_status NOT NULL DEFAULT 'connecting',
  qr_code_base64 TEXT,
  qr_code_text TEXT,
  integration TEXT NOT NULL DEFAULT 'WHATSAPP-BAILEYS',
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.whatsapp_instances ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for whatsapp_instances
CREATE POLICY "Users can view their own instances"
  ON public.whatsapp_instances
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own instances"
  ON public.whatsapp_instances
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own instances"
  ON public.whatsapp_instances
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own instances"
  ON public.whatsapp_instances
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER update_whatsapp_instances_updated_at
  BEFORE UPDATE ON public.whatsapp_instances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_whatsapp_instances_agent_id ON public.whatsapp_instances(agent_id);
CREATE INDEX idx_whatsapp_instances_user_id ON public.whatsapp_instances(user_id);
CREATE INDEX idx_whatsapp_instances_instance_name ON public.whatsapp_instances(instance_name);