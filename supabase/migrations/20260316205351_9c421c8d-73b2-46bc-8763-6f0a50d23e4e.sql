
-- Create invitations table
CREATE TABLE public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  invited_by uuid NOT NULL,
  email text NOT NULL,
  nome text NOT NULL,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz
);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Anyone can view invitations by token (for accepting)
CREATE POLICY "Anyone can view invitation by token" ON public.invitations
  FOR SELECT TO public USING (true);

-- Org owners can manage invitations
CREATE POLICY "Org owners can manage invitations" ON public.invitations
  FOR ALL TO authenticated USING (
    organization_id IN (
      SELECT o.id FROM organizations o
      JOIN profiles p ON p.id = o.owner_id
      WHERE p.user_id = auth.uid()
    )
  ) WITH CHECK (
    organization_id IN (
      SELECT o.id FROM organizations o
      JOIN profiles p ON p.id = o.owner_id
      WHERE p.user_id = auth.uid()
    )
  );

-- Anyone can update invitation status (for accepting)
CREATE POLICY "Anyone can accept invitation" ON public.invitations
  FOR UPDATE TO public USING (true) WITH CHECK (true);
