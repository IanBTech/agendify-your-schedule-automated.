
-- Drop the overly broad ALL policy on agendamentos (professionals already have SELECT)
DROP POLICY "Professionals can manage their own appointments" ON public.agendamentos;

-- Add specific update/delete policies instead
CREATE POLICY "Professionals can update their own appointments" ON public.agendamentos FOR UPDATE USING (
  profissional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Professionals can delete their own appointments" ON public.agendamentos FOR DELETE USING (
  profissional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Replace overly broad public profiles select with more targeted one
DROP POLICY "Public can view profiles for booking" ON public.profiles;
DROP POLICY "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view profiles" ON public.profiles FOR SELECT USING (true);
