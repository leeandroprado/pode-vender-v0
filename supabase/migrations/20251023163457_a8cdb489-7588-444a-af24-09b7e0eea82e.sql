-- Corrigir search_path nas funções

-- Atualizar increment_conversation_usage
CREATE OR REPLACE FUNCTION increment_conversation_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Atualizar reset_monthly_usage
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE organization_subscriptions
  SET current_usage = jsonb_build_object(
    'conversations_this_month', 0,
    'messages_this_month', 0
  );
END;
$$;