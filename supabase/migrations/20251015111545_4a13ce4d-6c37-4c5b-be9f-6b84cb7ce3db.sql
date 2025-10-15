-- Adicionar o endpoint de envio de texto que está faltando na tabela system_settings
-- Este endpoint é necessário para a edge function whatsapp-send-message funcionar corretamente

-- Inserir apenas se não existir um registro com essas chaves
INSERT INTO public.system_settings (
  setting_category, 
  setting_key, 
  setting_value, 
  description,
  is_encrypted
)
SELECT 
  'apizap',
  'send_text_endpoint',
  '/message/sendText',
  'Endpoint para enviar mensagens de texto via WhatsApp',
  false
WHERE NOT EXISTS (
  SELECT 1 
  FROM public.system_settings 
  WHERE setting_category = 'apizap' 
  AND setting_key = 'send_text_endpoint'
);