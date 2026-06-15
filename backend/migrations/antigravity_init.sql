-- ==========================================
-- PROJECT ANTIGRAVITY DATABASE INITIALIZATION
-- ==========================================

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the tenant micro-brain memories table
CREATE TABLE IF NOT EXISTS public.tenant_micro_brain_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'trend_analysis', 'user_preference', 'brand_voice'
    summary TEXT NOT NULL,
    embedding vector(1536) NOT NULL -- Matches standard OpenAI text-embedding-3-small dimensions
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.tenant_micro_brain_memories ENABLE ROW LEVEL SECURITY;

-- Drop policy if exists to make script idempotent
DROP POLICY IF EXISTS tenant_isolation_policy ON public.tenant_micro_brain_memories;

-- Apply Tenant Isolation Policy (consistent with auth.uid() pattern in Beraxis)
CREATE POLICY tenant_isolation_policy ON public.tenant_micro_brain_memories
    FOR ALL USING (tenant_id = auth.uid());
