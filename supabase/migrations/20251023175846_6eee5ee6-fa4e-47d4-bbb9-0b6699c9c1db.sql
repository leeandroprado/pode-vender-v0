-- 1. Criar tabela de funcionalidades (catálogo)
CREATE TABLE plan_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('core', 'limits', 'integrations', 'support')),
  feature_type TEXT NOT NULL CHECK (feature_type IN ('boolean', 'numeric', 'text')),
  default_value TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criar tabela de valores por plano
CREATE TABLE plan_feature_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
  feature_id UUID NOT NULL REFERENCES plan_features(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(plan_id, feature_id)
);

-- 3. Índices para performance
CREATE INDEX idx_plan_feature_values_plan_id ON plan_feature_values(plan_id);
CREATE INDEX idx_plan_feature_values_feature_id ON plan_feature_values(feature_id);
CREATE INDEX idx_plan_features_category ON plan_features(category);

-- 4. Triggers para updated_at
CREATE TRIGGER update_plan_features_updated_at
  BEFORE UPDATE ON plan_features
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plan_feature_values_updated_at
  BEFORE UPDATE ON plan_feature_values
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. RLS Policies
ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_feature_values ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado pode ver funcionalidades ativas
CREATE POLICY "Anyone can view active features"
  ON plan_features FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Apenas owner pode gerenciar funcionalidades
CREATE POLICY "Owner can manage features"
  ON plan_features FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'owner'));

-- Qualquer usuário pode ver valores das funcionalidades
CREATE POLICY "Anyone can view feature values"
  ON plan_feature_values FOR SELECT
  TO authenticated
  USING (true);

-- Apenas owner pode gerenciar valores
CREATE POLICY "Owner can manage feature values"
  ON plan_feature_values FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'owner'));

-- 6. Popular funcionalidades base (seed data)
INSERT INTO plan_features (feature_key, name, description, category, feature_type, display_order) VALUES
  ('whatsapp_instances', 'Instâncias WhatsApp', 'Número de instâncias WhatsApp simultâneas', 'limits', 'numeric', 1),
  ('max_agents', 'Máximo de Agentes IA', 'Número máximo de agentes de IA (-1 = ilimitado)', 'limits', 'numeric', 2),
  ('max_team_members', 'Máximo de Membros', 'Número máximo de membros na equipe', 'limits', 'numeric', 3),
  ('max_products', 'Máximo de Produtos', 'Número máximo de produtos no catálogo', 'limits', 'numeric', 4),
  ('max_conversations_per_month', 'Conversas por Mês', 'Limite mensal de conversas', 'limits', 'numeric', 5),
  ('can_use_ai_agents', 'Usar Agentes IA', 'Permite criar e usar agentes de IA', 'core', 'boolean', 10),
  ('can_create_agendas', 'Criar Agendas', 'Permite criar e gerenciar agendas', 'core', 'boolean', 11),
  ('can_manage_team', 'Gerenciar Equipe', 'Permite adicionar e gerenciar membros', 'core', 'boolean', 12),
  ('can_export_reports', 'Exportar Relatórios', 'Permite exportar relatórios e dados', 'core', 'boolean', 13),
  ('api_access', 'Acesso à API', 'Permite integração via API REST', 'integrations', 'boolean', 20),
  ('custom_branding', 'Marca Personalizada', 'Personalização de marca e identidade', 'core', 'boolean', 21),
  ('priority_support', 'Suporte Prioritário', 'Atendimento com prioridade', 'support', 'boolean', 30),
  ('dedicated_support', 'Suporte Dedicado', 'Gerente de conta dedicado', 'support', 'boolean', 31);

-- 7. Migrar dados existentes do JSON para as novas tabelas
DO $$
DECLARE
  plan_record RECORD;
  feature_record RECORD;
  feature_value TEXT;
BEGIN
  -- Para cada plano existente
  FOR plan_record IN SELECT id, features FROM subscription_plans LOOP
    -- Para cada funcionalidade cadastrada
    FOR feature_record IN SELECT id, feature_key FROM plan_features LOOP
      -- Extrair valor do JSON
      feature_value := plan_record.features->>feature_record.feature_key;
      
      -- Se existe valor, inserir na nova tabela
      IF feature_value IS NOT NULL THEN
        INSERT INTO plan_feature_values (plan_id, feature_id, value)
        VALUES (plan_record.id, feature_record.id, feature_value)
        ON CONFLICT (plan_id, feature_id) DO NOTHING;
      END IF;
    END LOOP;
  END LOOP;
END $$;