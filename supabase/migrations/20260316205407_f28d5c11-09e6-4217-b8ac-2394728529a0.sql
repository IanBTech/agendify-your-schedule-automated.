
-- Tighten the update policy for invitations - only allow updating status to 'accepted'
DROP POLICY IF EXISTS "Anyone can accept invitation" ON public.invitations;

CREATE POLICY "Authenticated users can accept invitation" ON public.invitations
  FOR UPDATE TO authenticated 
  USING (status = 'pending')
  WITH CHECK (status = 'accepted');
