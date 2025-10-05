-- Atualizar URL do webhook para a nova URL do n8n
UPDATE system_settings 
SET setting_value = 'https://n8n.portalolimpico.com.br/webhook/podevender', 
    updated_at = now()
WHERE category = 'apizap' AND setting_key = 'webhook_url';