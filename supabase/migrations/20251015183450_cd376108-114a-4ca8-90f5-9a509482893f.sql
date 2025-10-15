-- Criar tabela de agendas
CREATE TABLE agendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  user_id UUID NOT NULL,
  
  -- Identificação
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3b82f6',
  is_active BOOLEAN DEFAULT true,
  
  -- Configurações de Funcionamento
  working_hours JSONB NOT NULL DEFAULT '{"monday":{"start":"08:00","end":"18:00","enabled":true},"tuesday":{"start":"08:00","end":"18:00","enabled":true},"wednesday":{"start":"08:00","end":"18:00","enabled":true},"thursday":{"start":"08:00","end":"18:00","enabled":true},"friday":{"start":"08:00","end":"18:00","enabled":true},"saturday":{"start":"08:00","end":"12:00","enabled":false},"sunday":{"start":"08:00","end":"12:00","enabled":false}}',
  slot_duration INTEGER NOT NULL DEFAULT 30,
  
  -- Intervalos/Pausas
  breaks JSONB DEFAULT '[]',
  
  -- Regras de Agendamento
  min_advance_hours INTEGER DEFAULT 2,
  max_advance_days INTEGER DEFAULT 90,
  buffer_time INTEGER DEFAULT 0,
  
  -- Notificações
  reminder_hours_before INTEGER DEFAULT 24,
  send_confirmation BOOLEAN DEFAULT true,
  
  -- Metadata
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT valid_slot_duration CHECK (slot_duration > 0 AND slot_duration <= 1440),
  CONSTRAINT valid_advance CHECK (min_advance_hours >= 0 AND max_advance_days > 0)
);

-- Índices para performance
CREATE INDEX idx_agendas_org ON agendas(organization_id);
CREATE INDEX idx_agendas_user ON agendas(user_id);
CREATE INDEX idx_agendas_active ON agendas(is_active) WHERE is_active = true;

-- RLS Policies
ALTER TABLE agendas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view organization agendas"
ON agendas FOR SELECT
USING (organization_id = current_user_organization());

CREATE POLICY "Users can create organization agendas"
ON agendas FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND 
  organization_id = current_user_organization()
);

CREATE POLICY "Admins can update agendas"
ON agendas FOR UPDATE
USING (
  organization_id = current_user_organization() AND
  (auth.uid() = user_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'))
);

CREATE POLICY "Admins can delete agendas"
ON agendas FOR DELETE
USING (
  organization_id = current_user_organization() AND
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'))
);

-- Trigger para atualizar organization_id automaticamente
CREATE OR REPLACE FUNCTION public.set_organization_id_agendas()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.organization_id := (SELECT organization_id FROM profiles WHERE id = NEW.user_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_agenda_organization_id
  BEFORE INSERT ON agendas
  FOR EACH ROW
  EXECUTE FUNCTION set_organization_id_agendas();

-- Trigger para updated_at
CREATE TRIGGER update_agendas_updated_at
  BEFORE UPDATE ON agendas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Adicionar agenda_id na tabela appointments
ALTER TABLE appointments 
ADD COLUMN agenda_id UUID REFERENCES agendas(id) ON DELETE CASCADE;

CREATE INDEX idx_appointments_agenda ON appointments(agenda_id);