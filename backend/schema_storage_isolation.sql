-- =============================================================
-- SaaS STORAGE ISOLATION PATCh
-- Configures Supabase Storage for multi-tenant isolation
-- =============================================================

-- 1. Create the 'documents' bucket if it doesn't exist
-- Note: This is usually done via the Supabase Dashboard, but can be done via SQL
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage RLS Policies
-- We restrict access so users can only access files in a folder named after their tenant_id.
-- In our system, the tenant_id is the user's UUID (for now) or the Workspace UUID.

-- Allow users to upload to their own folder
CREATE POLICY "Users can upload to their own tenant folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own tenant folder
CREATE POLICY "Users can view their own tenant folder"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own tenant folder
CREATE POLICY "Users can delete their own tenant folder"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
