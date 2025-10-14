-- Update webhook URL to correct value without -test
UPDATE system_settings 
SET setting_value = 'https://n8n.portalolimpico.com.br/webhook/podevender',
    updated_at = now()
WHERE setting_key = 'webhook_url';