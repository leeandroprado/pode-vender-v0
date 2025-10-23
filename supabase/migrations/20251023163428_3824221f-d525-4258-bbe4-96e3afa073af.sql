-- ==========================================
-- SISTEMA DE ASSINATURA - TABELAS E POLICIES
-- ==========================================

-- 1. Criar tabela subscription_plans
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  billing_cycle TEXT NOT NULL DEFAULT 'MONTHLY',
  
  features JSONB NOT NULL DEFAULT '{}',
  limits JSONB NOT NULL DEFAULT '{}',
  
  trial_days INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_custom BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS para subscription_plans
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active plans"
  ON subscription_plans FOR SELECT
  USING (is_active = true);

CREATE POLICY "Owner can manage plans"
  ON subscription_plans FOR ALL
  USING (has_role(auth.uid(), 'owner'::user_role));

-- 2. Criar tabela organization_subscriptions
CREATE TABLE IF NOT EXISTS organization_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  
  status TEXT NOT NULL DEFAULT 'trial',
  
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  
  asaas_customer_id TEXT,
  asaas_subscription_id TEXT,
  asaas_next_due_date DATE,
  
  current_usage JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(organization_id)
);

-- RLS para organization_subscriptions
ALTER TABLE organization_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization subscription"
  ON organization_subscriptions FOR SELECT
  USING (organization_id = current_user_organization());

CREATE POLICY "Super admins can manage their subscription"
  ON organization_subscriptions FOR ALL
  USING (
    organization_id = current_user_organization() 
    AND (has_role(auth.uid(), 'super_admin'::user_role) OR has_role(auth.uid(), 'owner'::user_role))
  );

CREATE POLICY "Owner can view all subscriptions"
  ON organization_subscriptions FOR SELECT
  USING (has_role(auth.uid(), 'owner'::user_role));

-- 3. Criar tabela subscription_invoices
CREATE TABLE IF NOT EXISTS subscription_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  subscription_id UUID REFERENCES organization_subscriptions(id),
  
  asaas_payment_id TEXT NOT NULL UNIQUE,
  asaas_invoice_url TEXT,
  
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  payment_date DATE,
  
  status TEXT NOT NULL,
  billing_type TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS para subscription_invoices
ALTER TABLE subscription_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization invoices"
  ON subscription_invoices FOR SELECT
  USING (organization_id = current_user_organization());

CREATE POLICY "Service role can manage invoices"
  ON subscription_invoices FOR ALL
  USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- 4. Seed de planos iniciais
INSERT INTO subscription_plans (name, slug, description, price, billing_cycle, features, display_order, trial_days, is_active) VALUES
('Trial', 'trial', 'Teste grátis por 3 dias', 0.00, 'MONTHLY', '{
  "max_agents": 1,
  "max_conversations_per_month": 100,
  "max_products": 20,
  "can_use_ai_agents": true,
  "can_export_reports": false,
  "can_manage_team": false,
  "max_team_members": 1,
  "whatsapp_instances": 1,
  "api_access": false,
  "custom_branding": false,
  "priority_support": false,
  "can_create_agendas": false
}'::jsonb, 0, 3, true),

('Básico', 'basic', 'Ideal para começar', 49.90, 'MONTHLY', '{
  "max_agents": 2,
  "max_conversations_per_month": 500,
  "max_products": 100,
  "can_use_ai_agents": true,
  "can_export_reports": true,
  "can_manage_team": true,
  "max_team_members": 3,
  "whatsapp_instances": 1,
  "api_access": false,
  "custom_branding": false,
  "priority_support": false,
  "can_create_agendas": true
}'::jsonb, 1, 0, true),

('Profissional', 'professional', 'Para empresas em crescimento', 149.90, 'MONTHLY', '{
  "max_agents": 10,
  "max_conversations_per_month": 5000,
  "max_products": 1000,
  "can_use_ai_agents": true,
  "can_export_reports": true,
  "can_manage_team": true,
  "max_team_members": 10,
  "whatsapp_instances": 3,
  "api_access": true,
  "custom_branding": true,
  "priority_support": true,
  "can_create_agendas": true
}'::jsonb, 2, 0, true),

('Enterprise', 'enterprise', 'Soluções personalizadas', 0.00, 'MONTHLY', '{
  "max_agents": -1,
  "max_conversations_per_month": -1,
  "max_products": -1,
  "can_use_ai_agents": true,
  "can_export_reports": true,
  "can_manage_team": true,
  "max_team_members": -1,
  "whatsapp_instances": -1,
  "api_access": true,
  "custom_branding": true,
  "priority_support": true,
  "can_create_agendas": true,
  "dedicated_support": true
}'::jsonb, 3, 0, true)
ON CONFLICT (slug) DO NOTHING;

-- 5. Função para criar trial automaticamente
CREATE OR REPLACE FUNCTION create_trial_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  trial_plan_id UUID;
  org_id UUID;
BEGIN
  -- Buscar ID do plano Trial
  SELECT id INTO trial_plan_id
  FROM subscription_plans
  WHERE slug = 'trial'
  LIMIT 1;
  
  -- Buscar organization_id do usuário
  SELECT organization_id INTO org_id
  FROM profiles
  WHERE id = NEW.user_id;
  
  -- Apenas criar trial para super_admins (donos de organização)
  IF NEW.role = 'super_admin' AND org_id IS NOT NULL AND trial_plan_id IS NOT NULL THEN
    -- Verificar se já existe subscription para essa organização
    IF NOT EXISTS (SELECT 1 FROM organization_subscriptions WHERE organization_id = org_id) THEN
      INSERT INTO organization_subscriptions (
        organization_id,
        plan_id,
        status,
        trial_ends_at,
        current_period_start,
        current_period_end
      ) VALUES (
        org_id,
        trial_plan_id,
        'trial',
        NOW() + INTERVAL '3 days',
        NOW(),
        NOW() + INTERVAL '3 days'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger no insert de user_roles
DROP TRIGGER IF EXISTS on_user_role_created_trial ON user_roles;
CREATE TRIGGER on_user_role_created_trial
  AFTER INSERT ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION create_trial_subscription();

-- 6. Função para incrementar uso de conversas
CREATE OR REPLACE FUNCTION increment_conversation_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE organization_subscriptions
  SET 
    current_usage = jsonb_set(
      COALESCE(current_usage, '{}'::jsonb),
      '{conversations_this_month}',
      to_jsonb(COALESCE((current_usage->>'conversations_this_month')::int, 0) + 1)
    ),
    updated_at = NOW()
  WHERE organization_id = NEW.organization_id;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_conversation_created_usage ON conversations;
CREATE TRIGGER on_conversation_created_usage
  AFTER INSERT ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION increment_conversation_usage();

-- 7. Função para resetar contadores mensais
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE organization_subscriptions
  SET current_usage = jsonb_build_object(
    'conversations_this_month', 0,
    'messages_this_month', 0
  );
END;
$$;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_org_subscriptions_org_id ON organization_subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_subscriptions_status ON organization_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscription_invoices_org_id ON subscription_invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscription_invoices_status ON subscription_invoices(status);