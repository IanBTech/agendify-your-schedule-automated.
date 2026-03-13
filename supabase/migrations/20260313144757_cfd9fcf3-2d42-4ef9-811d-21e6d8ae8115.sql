
-- Add tipo_conta to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tipo_conta text NOT NULL DEFAULT 'individual';

-- Create organizations table
CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  slug text UNIQUE,
  owner_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Organization members table with org-specific roles
CREATE TYPE public.org_role AS ENUM ('owner', 'employee');

CREATE TABLE public.organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role org_role NOT NULL DEFAULT 'employee',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Add organization_id to profiles (nullable, only for company members)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);

-- RLS for organizations
CREATE POLICY "Org owners can manage their org"
  ON public.organizations FOR ALL
  USING (owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Members can view their org"
  ON public.organizations FOR SELECT
  USING (id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Public can view orgs for booking"
  ON public.organizations FOR SELECT
  USING (true);

-- RLS for organization_members
CREATE POLICY "Org owners can manage members"
  ON public.organization_members FOR ALL
  USING (organization_id IN (SELECT id FROM organizations WHERE owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())))
  WITH CHECK (organization_id IN (SELECT id FROM organizations WHERE owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

CREATE POLICY "Members can view their own membership"
  ON public.organization_members FOR SELECT
  USING (user_id = auth.uid());
