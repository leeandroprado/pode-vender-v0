
-- Criar subscription trial inicial para o owner
INSERT INTO organization_subscriptions (
  organization_id,
  plan_id,
  status,
  trial_ends_at,
  current_period_start,
  current_period_end
)
SELECT 
  '4bf40c5e-7d1d-4897-8875-120267318f30'::uuid,
  id,
  'trial',
  NOW() + INTERVAL '7 days',
  NOW(),
  NOW() + INTERVAL '7 days'
FROM subscription_plans 
WHERE slug = 'trial'
ON CONFLICT (organization_id) DO NOTHING;
