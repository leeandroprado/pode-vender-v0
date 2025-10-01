-- Add default temporary number format configuration
INSERT INTO public.system_settings (category, setting_key, setting_value, description, is_encrypted) 
VALUES 
  ('apizap', 'default_temp_number_format', '0000000.temp.{agentId}', 'Formato padrão para números temporários quando o agente não tem WhatsApp configurado', false)
ON CONFLICT (category, setting_key) DO UPDATE 
SET 
  setting_value = EXCLUDED.setting_value,
  description = EXCLUDED.description,
  updated_at = now();