-- PASSO 1: Popular organization_id nos profiles
-- Para super_admins e admins: organization_id = próprio user_id
UPDATE profiles p
SET organization_id = p.id
WHERE organization_id IS NULL
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = p.id
      AND ur.role IN ('super_admin', 'admin')
  );

-- Para usuários convidados: buscar organization_id do inviter
UPDATE profiles p
SET organization_id = inviter_profile.organization_id
FROM (
  SELECT 
    i.email,
    inviter.organization_id
  FROM invites i
  JOIN profiles inviter ON inviter.id = i.invited_by
  WHERE i.status = 'accepted'
) AS inviter_profile
WHERE p.email = inviter_profile.email
  AND p.organization_id IS NULL;

-- Para usuários restantes sem organização: usar próprio ID
UPDATE profiles
SET organization_id = id
WHERE organization_id IS NULL;

-- PASSO 2: Popular organization_id nas conversas
UPDATE conversations c
SET organization_id = (SELECT organization_id FROM profiles WHERE id = c.user_id)
WHERE organization_id IS NULL;

-- PASSO 3: Popular organization_id nos produtos
UPDATE products p
SET organization_id = (SELECT organization_id FROM profiles WHERE id = p.user_id)
WHERE organization_id IS NULL;

-- PASSO 4: Popular organization_id nos clientes
UPDATE clients c
SET organization_id = (SELECT organization_id FROM profiles WHERE id = c.user_id)
WHERE organization_id IS NULL;