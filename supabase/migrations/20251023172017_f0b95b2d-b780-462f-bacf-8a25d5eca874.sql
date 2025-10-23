-- Atualizar role do primeiro usuário para owner
UPDATE user_roles 
SET role = 'owner'
WHERE user_id = '4bf40c5e-7d1d-4897-8875-120267318f30';