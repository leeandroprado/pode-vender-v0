-- Add send text endpoint configuration to system_settings
INSERT INTO public.system_settings (category, setting_key, setting_value, description)
VALUES ('apizap', 'send_text_endpoint', '/message/sendText', 'Endpoint para enviar mensagens de texto via WhatsApp')
ON CONFLICT DO NOTHING;