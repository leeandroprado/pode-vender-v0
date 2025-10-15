-- Adicionar constraint UNIQUE para permitir UPSERT de clientes
-- Isso garante que não haverá telefones duplicados por usuário
ALTER TABLE public.clients 
ADD CONSTRAINT clients_phone_user_id_unique UNIQUE (phone, user_id);