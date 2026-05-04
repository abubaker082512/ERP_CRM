-- =============================================================
-- SaaS REGISTRATION PATCH
-- Updates the signup trigger to use the company_name from metadata
-- =============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
DECLARE
    target_workspace_id UUID;
    ws_name TEXT;
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
    -- Determine workspace name from metadata or default to email
    ws_name := COALESCE(new.raw_user_meta_data->>'company_name', new.email || '''s Workspace');

    -- Create a NEW workspace for organic signup
    INSERT INTO public.workspaces (name, owner_id)
    VALUES (ws_name, new.id)
    RETURNING id INTO target_workspace_id;

    -- Join as owner
    INSERT INTO public.user_workspaces (user_id, workspace_id, role)
    VALUES (new.id, target_workspace_id, 'owner');
  END IF;

  -- Create compatibility billing record in 'tenants' table
  INSERT INTO public.tenants (id, email, company_name, subscription_status)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'company_name', new.raw_user_meta_data->>'name'), 'trialing')
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
