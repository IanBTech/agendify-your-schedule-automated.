
-- Create a function for admin cascade deletion of users
CREATE OR REPLACE FUNCTION public.admin_delete_user(_profile_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _user_id uuid;
  _org_id uuid;
BEGIN
  -- Only allow admins
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Get user_id and org
  SELECT user_id, organization_id INTO _user_id, _org_id FROM public.profiles WHERE id = _profile_id;
  
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Delete related data
  DELETE FROM public.agendamentos WHERE profissional_id = _profile_id;
  DELETE FROM public.bloqueios WHERE profissional_id = _profile_id;
  DELETE FROM public.disponibilidade WHERE profissional_id = _profile_id;
  DELETE FROM public.servicos WHERE profissional_id = _profile_id;
  DELETE FROM public.clientes WHERE profissional_id = _profile_id;
  DELETE FROM public.lista_espera WHERE profissional_id = _profile_id;
  DELETE FROM public.feedback WHERE user_id = _user_id;
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  
  -- If company owner, delete org members profiles, then org
  IF _org_id IS NOT NULL THEN
    -- Delete employee data
    DELETE FROM public.agendamentos WHERE profissional_id IN (
      SELECT p.id FROM profiles p 
      JOIN organization_members om ON om.user_id = p.user_id 
      WHERE om.organization_id = _org_id AND p.id != _profile_id
    );
    DELETE FROM public.bloqueios WHERE profissional_id IN (
      SELECT p.id FROM profiles p 
      JOIN organization_members om ON om.user_id = p.user_id 
      WHERE om.organization_id = _org_id AND p.id != _profile_id
    );
    DELETE FROM public.disponibilidade WHERE profissional_id IN (
      SELECT p.id FROM profiles p 
      JOIN organization_members om ON om.user_id = p.user_id 
      WHERE om.organization_id = _org_id AND p.id != _profile_id
    );
    DELETE FROM public.servicos WHERE profissional_id IN (
      SELECT p.id FROM profiles p 
      JOIN organization_members om ON om.user_id = p.user_id 
      WHERE om.organization_id = _org_id AND p.id != _profile_id
    );
    DELETE FROM public.clientes WHERE profissional_id IN (
      SELECT p.id FROM profiles p 
      JOIN organization_members om ON om.user_id = p.user_id 
      WHERE om.organization_id = _org_id AND p.id != _profile_id
    );
    
    -- Delete employee profiles
    DELETE FROM public.profiles WHERE id IN (
      SELECT p.id FROM profiles p 
      JOIN organization_members om ON om.user_id = p.user_id 
      WHERE om.organization_id = _org_id AND p.id != _profile_id
    );
    
    DELETE FROM public.organization_members WHERE organization_id = _org_id;
    DELETE FROM public.organizations WHERE id = _org_id;
  END IF;

  -- Delete the profile itself
  DELETE FROM public.profiles WHERE id = _profile_id;
END;
$function$;
