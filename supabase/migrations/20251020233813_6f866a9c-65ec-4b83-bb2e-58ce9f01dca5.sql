-- Add apizap base_url to system_settings
INSERT INTO system_settings (setting_category, setting_key, setting_value, description)
VALUES ('apizap', 'base_url', 'https://application.wpp.imidiahouse.com.br', 'URL base da API Evolution WhatsApp')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;