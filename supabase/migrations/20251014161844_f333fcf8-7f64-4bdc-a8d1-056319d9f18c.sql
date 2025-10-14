-- Adicionar colunas faltantes na tabela whatsapp_instances
ALTER TABLE public.whatsapp_instances 
ADD COLUMN IF NOT EXISTS hash TEXT,
ADD COLUMN IF NOT EXISTS qr_code_base64 TEXT,
ADD COLUMN IF NOT EXISTS qr_code_text TEXT,
ADD COLUMN IF NOT EXISTS integration TEXT DEFAULT 'WHATSAPP-BAILEYS',
ADD COLUMN IF NOT EXISTS settings JSONB;

-- Criar índice na coluna hash para buscar instâncias rapidamente
CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_hash 
ON public.whatsapp_instances(hash);

-- Atualizar instâncias existentes para ter valores padrão
UPDATE public.whatsapp_instances 
SET integration = 'WHATSAPP-BAILEYS' 
WHERE integration IS NULL;