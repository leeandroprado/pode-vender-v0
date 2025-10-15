-- Corrigir search_path nos triggers para segurança
CREATE OR REPLACE FUNCTION set_organization_id_products()
RETURNS TRIGGER AS $$
BEGIN
  NEW.organization_id := (SELECT organization_id FROM profiles WHERE id = NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION set_organization_id_clients()
RETURNS TRIGGER AS $$
BEGIN
  NEW.organization_id := (SELECT organization_id FROM profiles WHERE id = NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION set_organization_id_conversations()
RETURNS TRIGGER AS $$
BEGIN
  NEW.organization_id := (SELECT organization_id FROM profiles WHERE id = NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;