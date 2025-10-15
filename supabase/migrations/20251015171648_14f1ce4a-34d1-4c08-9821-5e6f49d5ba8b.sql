-- Criar tabela de agendamentos
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID,
  
  -- Informações do agendamento
  title TEXT NOT NULL,
  description TEXT,
  
  -- Data e hora
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Cliente (opcional)
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'scheduled',
  
  -- Tipo de serviço
  appointment_type TEXT,
  
  -- Localização
  location TEXT,
  
  -- Notas internas
  internal_notes TEXT,
  
  -- Lembretes
  reminder_sent BOOLEAN DEFAULT false,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT valid_status CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed', 'no_show'))
);

-- Trigger para auto-popular organization_id
CREATE OR REPLACE FUNCTION public.set_organization_id_appointments()
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

CREATE TRIGGER set_appointments_organization_id
  BEFORE INSERT ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_organization_id_appointments();

-- Trigger para atualizar updated_at
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX idx_appointments_organization_id ON public.appointments(organization_id);
CREATE INDEX idx_appointments_client_id ON public.appointments(client_id);
CREATE INDEX idx_appointments_start_time ON public.appointments(start_time);
CREATE INDEX idx_appointments_end_time ON public.appointments(end_time);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_appointments_date_range ON public.appointments(start_time, end_time);

-- Habilitar RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
-- Usuários podem ver agendamentos da própria organização
CREATE POLICY "Users can view organization appointments"
  ON public.appointments
  FOR SELECT
  USING (organization_id = current_user_organization());

-- Usuários podem criar seus próprios agendamentos
CREATE POLICY "Users can create their own appointments"
  ON public.appointments
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND organization_id = current_user_organization()
  );

-- Usuários podem atualizar seus próprios agendamentos ou admins podem atualizar todos
CREATE POLICY "Users can update appointments"
  ON public.appointments
  FOR UPDATE
  USING (
    organization_id = current_user_organization() 
    AND (
      auth.uid() = user_id 
      OR has_role(auth.uid(), 'admin'::user_role) 
      OR has_role(auth.uid(), 'super_admin'::user_role)
    )
  );

-- Usuários podem deletar seus próprios agendamentos ou admins podem deletar todos
CREATE POLICY "Users can delete appointments"
  ON public.appointments
  FOR DELETE
  USING (
    organization_id = current_user_organization() 
    AND (
      auth.uid() = user_id 
      OR has_role(auth.uid(), 'admin'::user_role) 
      OR has_role(auth.uid(), 'super_admin'::user_role)
    )
  );