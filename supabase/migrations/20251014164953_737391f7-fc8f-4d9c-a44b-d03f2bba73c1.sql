-- Habilitar webhook e configurar URL do n8n
UPDATE system_settings 
SET setting_value = 'true', updated_at = now()
WHERE setting_category = 'apizap' 
  AND setting_key = 'webhook_enabled';

UPDATE system_settings 
SET setting_value = 'https://n8n.portalolimpico.com.br/webhook-test/podevender', updated_at = now()
WHERE setting_category = 'apizap' 
  AND setting_key = 'webhook_url';