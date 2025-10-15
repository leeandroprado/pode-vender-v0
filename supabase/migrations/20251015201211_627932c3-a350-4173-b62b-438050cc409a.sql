-- Enum para escopos da API
CREATE TYPE api_scope AS ENUM (
  'read:appointments',
  'write:appointments',
  'read:clients',
  'write:clients',
  'read:products',
  'write:products',
  'read:agendas',
  'write:agendas',
  'admin:all'
);

-- Tabela de tokens
CREATE TABLE public.api_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'base64'),
  name TEXT NOT NULL,
  description TEXT,
  scopes api_scope[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  allowed_ips TEXT[],
  rate_limit_per_minute INTEGER DEFAULT 60,
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_api_tokens_organization ON api_tokens(organization_id);
CREATE INDEX idx_api_tokens_token ON api_tokens(token) WHERE is_active = true;
CREATE INDEX idx_api_tokens_active ON api_tokens(is_active, expires_at);

-- Trigger para updated_at
CREATE TRIGGER update_api_tokens_updated_at 
  BEFORE UPDATE ON api_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE api_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view organization tokens"
  ON api_tokens FOR SELECT
  USING (
    (SELECT organization_id FROM profiles WHERE id = auth.uid()) = organization_id
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'))
  );

CREATE POLICY "Admins can create organization tokens"
  ON api_tokens FOR INSERT
  WITH CHECK (
    (SELECT organization_id FROM profiles WHERE id = auth.uid()) = organization_id
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'))
    AND auth.uid() = created_by
  );

CREATE POLICY "Admins can update organization tokens"
  ON api_tokens FOR UPDATE
  USING (
    (SELECT organization_id FROM profiles WHERE id = auth.uid()) = organization_id
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'))
  );

CREATE POLICY "Admins can delete organization tokens"
  ON api_tokens FOR DELETE
  USING (
    (SELECT organization_id FROM profiles WHERE id = auth.uid()) = organization_id
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'))
  );

-- Tabela para logs de uso de API
CREATE TABLE public.api_request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id UUID NOT NULL REFERENCES api_tokens(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  request_body JSONB,
  response_body JSONB,
  error_message TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_api_logs_token ON api_request_logs(token_id, created_at DESC);
CREATE INDEX idx_api_logs_org ON api_request_logs(organization_id, created_at DESC);
CREATE INDEX idx_api_logs_created ON api_request_logs(created_at DESC);

-- RLS
ALTER TABLE api_request_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view organization logs"
  ON api_request_logs FOR SELECT
  USING (
    (SELECT organization_id FROM profiles WHERE id = auth.uid()) = organization_id
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'))
  );

CREATE POLICY "Service role can insert logs"
  ON api_request_logs FOR INSERT
  WITH CHECK ((auth.jwt()->>'role')::text = 'service_role');