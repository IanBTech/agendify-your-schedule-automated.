
-- Update handle_new_user to store tipo_conta and handle referral
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _indicador_id uuid;
  _tipo_conta text;
  _codigo text;
BEGIN
  _tipo_conta := COALESCE(NEW.raw_user_meta_data->>'tipo_conta', 'individual');
  _codigo := NEW.raw_user_meta_data->>'codigo_indicacao_usado';
  
  IF _codigo IS NOT NULL AND _codigo != '' THEN
    SELECT id INTO _indicador_id FROM public.profiles WHERE codigo_indicacao = _codigo LIMIT 1;
  END IF;

  INSERT INTO public.profiles (user_id, nome, email, profissao, tipo_conta, indicador_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'profissao', ''),
    _tipo_conta,
    _indicador_id
  );
  RETURN NEW;
END;
$function$;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Recreate role trigger
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();
