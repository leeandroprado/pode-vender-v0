-- Remover constraint existente que permite múltiplos roles por usuário
ALTER TABLE public.user_roles 
DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;

-- Adicionar constraint para garantir apenas 1 role por usuário
ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);