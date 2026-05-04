-- =============================================================
-- SaaS TEAM & MULTI-USER SUPPORT PATCh
-- Upgrades the system from 1-User-Per-Tenant to Multi-User-Per-Tenant
-- =============================================================

-- 1. Create standalone Workspaces
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    owner_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create User-to-Workspace mapping
CREATE TABLE IF NOT EXISTS public.user_workspaces (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member', -- owner, admin, member
    PRIMARY KEY (user_id, workspace_id)
);

-- 3. Create Invitations table
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    invited_by UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'pending', -- pending, accepted, expired
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Updated handle_new_user function (V2)
-- This function now checks if a user was invited to a workspace.
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
DECLARE
    target_workspace_id UUID;
BEGIN
  -- Check if this user was invited
  SELECT workspace_id INTO target_workspace_id 
  FROM public.invitations 
  WHERE email = new.email AND status = 'pending'
  ORDER BY created_at DESC
  LIMIT 1;

  IF target_workspace_id IS NOT NULL THEN
    -- Join the existing workspace
    INSERT INTO public.user_workspaces (user_id, workspace_id, role)
    VALUES (new.id, target_workspace_id, 'member');
    
    -- Mark invite as accepted
    UPDATE public.invitations SET status = 'accepted' WHERE email = new.email;
  ELSE
    -- Create a NEW workspace for organic signup
    INSERT INTO public.workspaces (name, owner_id)
    VALUES (new.email || '''s Workspace', new.id)
    RETURNING id INTO target_workspace_id;

    -- Join as owner
    INSERT INTO public.user_workspaces (user_id, workspace_id, role)
    VALUES (new.id, target_workspace_id, 'owner');
  END IF;

  -- Create compatibility billing record in 'tenants' table
  -- We use the user's ID as the key for billing owners.
  INSERT INTO public.tenants (id, email, company_name, subscription_status)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name', 'trialing')
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Helper function for RLS
CREATE OR REPLACE FUNCTION public.get_my_workspaces()
RETURNS TABLE (workspace_id UUID) AS $$
  SELECT workspace_id FROM public.user_workspaces WHERE user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 6. Apply Updated RLS Policy (Example)
-- All tables now check if the user belongs to the workspace in the tenant_id column.
-- ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Tenant Isolation" ON contacts;
-- CREATE POLICY "Team Workspace Access" ON contacts 
--     FOR ALL USING (tenant_id IN (SELECT get_my_workspaces()));
