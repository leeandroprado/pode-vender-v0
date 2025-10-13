/*
  # Update system_settings table structure
  
  1. Changes
    - Add category column to system_settings
    - Rename key to setting_key
    - Rename value to setting_value
    - Migrate existing data to new structure
  
  2. Notes
    - Preserves existing data
    - Adds default category 'general' for existing records
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'system_settings' AND column_name = 'category') THEN
    ALTER TABLE public.system_settings ADD COLUMN category TEXT NOT NULL DEFAULT 'general';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'system_settings_key_key') THEN
    ALTER TABLE public.system_settings DROP CONSTRAINT system_settings_key_key;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'system_settings' AND column_name = 'key') THEN
    ALTER TABLE public.system_settings RENAME COLUMN key TO setting_key;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'system_settings' AND column_name = 'value') THEN
    ALTER TABLE public.system_settings RENAME COLUMN value TO setting_value;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS system_settings_category_setting_key_key ON public.system_settings(category, setting_key);

UPDATE public.system_settings SET category = 'general' WHERE category IS NULL OR category = 'general';

INSERT INTO public.system_settings (category, setting_key, setting_value, description) VALUES
  ('apizap', 'base_url', 'https://api.apizap.tech', 'URL base da API ApiZap'),
  ('apizap', 'create_instance_endpoint', '/instance/create', 'Endpoint para criar instância'),
  ('apizap', 'send_text_endpoint', '/message/sendText', 'Endpoint para enviar mensagem de texto'),
  ('apizap', 'webhook_enabled', 'true', 'Habilitar webhook'),
  ('apizap', 'webhook_url', '', 'URL do webhook para receber mensagens'),
  ('apizap', 'webhook_content_type', 'application/json', 'Content-Type do webhook'),
  ('apizap', 'webhook_auth_header', '', 'Header de autenticação do webhook'),
  ('apizap', 'default_integration', 'WHATSAPP-BAILEYS', 'Integração padrão do WhatsApp'),
  ('apizap', 'qrcode_enabled', 'true', 'Habilitar QR Code'),
  ('apizap', 'reject_call', 'false', 'Rejeitar chamadas'),
  ('apizap', 'groups_ignore', 'true', 'Ignorar grupos'),
  ('apizap', 'sync_full_history', 'false', 'Sincronizar histórico completo'),
  ('apizap', 'token_prefix', 'apizap_token_', 'Prefixo do token')
ON CONFLICT (category, setting_key) DO NOTHING;