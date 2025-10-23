-- Adicionar campos de dados de pagamento na tabela profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cpf_cnpj TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Criar índice para busca rápida por CPF/CNPJ
CREATE INDEX IF NOT EXISTS idx_profiles_cpf_cnpj ON profiles(cpf_cnpj);