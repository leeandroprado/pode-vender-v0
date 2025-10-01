-- Add super_admin to existing user_role enum if not exists
DO $$ BEGIN
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create system_settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  setting_key TEXT NOT NULL,
  setting_value TEXT,
  description TEXT,
  is_encrypted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(category, setting_key)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check super_admin role
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'::user_role
  );
$$;

-- RLS Policies for user_roles
CREATE POLICY "Super admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.is_super_admin());

CREATE POLICY "Super admins can manage roles"
ON public.user_roles FOR ALL
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- RLS Policies for system_settings
CREATE POLICY "Super admins can view all settings"
ON public.system_settings FOR SELECT
USING (public.is_super_admin());

CREATE POLICY "Super admins can manage settings"
ON public.system_settings FOR ALL
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default ApiZap configurations
INSERT INTO public.system_settings (category, setting_key, setting_value, description) VALUES
  -- Base URLs and Endpoints
  ('apizap', 'base_url', 'https://api.apizap.tech', 'URL base da API ApiZap'),
  ('apizap', 'create_instance_endpoint', '/instance/create', 'Endpoint para criar instância'),
  ('apizap', 'connection_state_endpoint', '/instance/connectionState/{instanceName}', 'Endpoint para verificar estado da conexão'),
  ('apizap', 'logout_endpoint', '/instance/logout/{instanceName}', 'Endpoint para fazer logout da instância'),
  
  -- Instance Settings
  ('apizap', 'default_integration', 'WHATSAPP-BAILEYS', 'Integração padrão para novas instâncias'),
  ('apizap', 'qrcode_enabled', 'true', 'Habilitar QR Code para autenticação'),
  ('apizap', 'reject_call', 'true', 'Rejeitar chamadas automaticamente'),
  ('apizap', 'groups_ignore', 'true', 'Ignorar mensagens de grupos'),
  ('apizap', 'always_online', 'true', 'Manter sempre online'),
  ('apizap', 'read_messages', 'false', 'Marcar mensagens como lidas automaticamente'),
  ('apizap', 'sync_full_history', 'true', 'Sincronizar histórico completo'),
  ('apizap', 'api_timeout', '30000', 'Timeout para requisições da API (ms)'),
  
  -- Webhook Settings
  ('apizap', 'webhook_enabled', 'false', 'Habilitar webhook para eventos'),
  ('apizap', 'webhook_url', '', 'URL do webhook (n8n)'),
  ('apizap', 'webhook_by_events', 'true', 'Enviar eventos individuais ao webhook'),
  ('apizap', 'webhook_base64', 'true', 'Enviar mídia em base64'),
  ('apizap', 'webhook_auth_header', '', 'Token de autorização para o webhook'),
  ('apizap', 'webhook_content_type', 'application/json', 'Content-Type do webhook')
ON CONFLICT (category, setting_key) DO NOTHING;