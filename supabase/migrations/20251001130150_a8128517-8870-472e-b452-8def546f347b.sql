-- Add missing system settings for WhatsApp instance creation
INSERT INTO public.system_settings (category, setting_key, setting_value, description, is_encrypted) 
VALUES 
  ('apizap', 'msg_call', 'Desculpe, não aceito chamadas no momento. Por favor, envie uma mensagem de texto.', 'Mensagem automática para rejeitar chamadas', false),
  ('apizap', 'read_status', 'true', 'Marcar status de mensagens como lido', false),
  ('apizap', 'token_prefix', 'apizap_token_', 'Prefixo para gerar tokens únicos das instâncias', false)
ON CONFLICT (category, setting_key) DO UPDATE 
SET 
  setting_value = EXCLUDED.setting_value,
  description = EXCLUDED.description,
  updated_at = now();

-- Update webhook_enabled to true by default
UPDATE public.system_settings 
SET setting_value = 'true' 
WHERE category = 'apizap' 
  AND setting_key = 'webhook_enabled' 
  AND (setting_value IS NULL OR setting_value = 'false');