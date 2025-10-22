-- Garantir REPLICA IDENTITY FULL para whatsapp_instances
ALTER TABLE whatsapp_instances REPLICA IDENTITY FULL;

-- Adicionar URLs dos webhooks no system_settings
INSERT INTO system_settings (setting_category, setting_key, setting_value, description)
VALUES 
  ('apizap', 'webhook_qrcode_path', '/webhook-qrcode-updated', 'Path do webhook para QR Code'),
  ('apizap', 'webhook_connection_path', '/webhook-connection-update', 'Path do webhook para status de conexão')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;