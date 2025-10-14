-- Inserir configurações do sistema para ApiZap
INSERT INTO public.system_settings (setting_key, setting_value, setting_category, description) VALUES
  ('base_url', 'https://api.apizap.tech', 'apizap', 'URL base da API do ApiZap'),
  ('create_instance_endpoint', '/instance/create', 'apizap', 'Endpoint para criar instâncias'),
  ('default_integration', 'WHATSAPP-BAILEYS', 'apizap', 'Tipo de integração padrão'),
  ('token_prefix', 'apizap_token_', 'apizap', 'Prefixo do token de autenticação'),
  ('qrcode_enabled', 'true', 'apizap', 'Habilitar geração de QR Code'),
  ('webhook_enabled', 'false', 'apizap', 'Habilitar webhook para receber mensagens'),
  ('webhook_url', '', 'apizap', 'URL do webhook (se habilitado)'),
  ('webhook_content_type', 'application/json', 'apizap', 'Content-Type do webhook'),
  ('webhook_auth_header', '', 'apizap', 'Header de autenticação do webhook'),
  ('reject_call', 'false', 'apizap', 'Rejeitar chamadas automaticamente'),
  ('groups_ignore', 'true', 'apizap', 'Ignorar mensagens de grupos'),
  ('sync_full_history', 'false', 'apizap', 'Sincronizar histórico completo');