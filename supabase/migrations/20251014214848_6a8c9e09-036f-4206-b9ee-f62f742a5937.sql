-- Adicionar colunas necessárias para sistema de convites via WhatsApp
ALTER TABLE public.invites
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone DEFAULT (now() + interval '7 days');

-- Atualizar token para ser NOT NULL com valor padrão
ALTER TABLE public.invites
ALTER COLUMN token SET NOT NULL,
ALTER COLUMN token SET DEFAULT gen_random_uuid()::text;

-- Adicionar índice para busca rápida por token
CREATE INDEX IF NOT EXISTS idx_invites_token ON public.invites(token) WHERE status = 'pending';

-- Adicionar índice para busca por email e status
CREATE INDEX IF NOT EXISTS idx_invites_email_status ON public.invites(email, status);

-- Comentários para documentação
COMMENT ON COLUMN public.invites.phone IS 'Telefone do convidado para envio via WhatsApp';
COMMENT ON COLUMN public.invites.expires_at IS 'Data de expiração do convite (padrão 7 dias)';
COMMENT ON COLUMN public.invites.token IS 'Token UUID único para validação do convite';