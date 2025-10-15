-- Adicionar colunas CPF e Cidade na tabela clients
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS cpf text,
ADD COLUMN IF NOT EXISTS city text;

-- Adicionar comentários descritivos
COMMENT ON COLUMN public.clients.cpf IS 'CPF do cliente (opcional)';
COMMENT ON COLUMN public.clients.city IS 'Cidade do cliente (opcional)';