-- Modificar o trigger para não criar role automático quando há convite pendente
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INT;
  has_pending_invite BOOLEAN;
BEGIN
  -- Verificar se existe convite pendente para este email
  SELECT EXISTS (
    SELECT 1 FROM public.invites 
    WHERE email = NEW.email 
    AND status = 'pending'
  ) INTO has_pending_invite;
  
  -- Se tem convite pendente, não criar role (deixar edge function fazer)
  IF has_pending_invite THEN
    RETURN NEW;
  END IF;
  
  -- Caso contrário, criar role padrão
  SELECT COUNT(*) INTO user_count FROM auth.users;
  
  IF user_count = 1 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
  END IF;
  
  RETURN NEW;
END;
$$;