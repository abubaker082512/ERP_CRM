-- =========================================================================
-- EXPANSION MODULES SAAS CONFIGURATION (IDEMPOTENT VERSION)
-- Sets up the remaining 10 tables specifically for SaaS Multi-Tenant Isolation
-- Integrates Knowledge, To-Do, Appointments, Planning, Surveys, Sign, Barcode
-- =========================================================================

-- ----------------------------------------------------
-- 1. KNOWLEDGE MODULE
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS knowledge_article (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID DEFAULT auth.uid(),
    title TEXT NOT NULL,
    body TEXT,
    category TEXT DEFAULT 'general',
    author_id UUID, -- References contacts(id) if needed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------
-- 2. TO DO MODULE
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS todo_task (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID DEFAULT auth.uid(),
    title TEXT NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    user_id UUID, -- References hr_employee(id) if needed
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------
-- 3. APPOINTMENTS MODULE
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS calendar_appointment_type (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID DEFAULT auth.uid(),
    name TEXT NOT NULL,
    duration NUMERIC(5, 2) DEFAULT 1.0, -- Hours
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS calendar_appointment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID DEFAULT auth.uid(),
    name TEXT NOT NULL, -- Customer Name
    email TEXT,
    phone TEXT,
    appointment_type_id UUID REFERENCES calendar_appointment_type(id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    state TEXT DEFAULT 'scheduled', -- scheduled, done, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------
-- 4. PLANNING MODULE
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS planning_slot (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID DEFAULT auth.uid(),
    employee_id UUID,
    role_id UUID,
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------
-- 5. SURVEYS MODULE
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS survey_survey (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID DEFAULT auth.uid(),
    title TEXT NOT NULL,
    description TEXT,
    state TEXT DEFAULT 'draft', -- draft, open, closed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS survey_question (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID DEFAULT auth.uid(),
    survey_id UUID REFERENCES survey_survey(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    type TEXT DEFAULT 'text', -- text, choice, rating
    sequence INTEGER DEFAULT 0
);

-- ----------------------------------------------------
-- 6. SIGN MODULE
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS sign_request (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID DEFAULT auth.uid(),
    title TEXT NOT NULL,
    file_url TEXT, -- Link to document
    state TEXT DEFAULT 'sent', -- sent, signed, refused
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sign_signer (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID DEFAULT auth.uid(),
    request_id UUID REFERENCES sign_request(id) ON DELETE CASCADE,
    partner_id UUID,
    role TEXT DEFAULT 'signer', -- signer, viewer
    state TEXT DEFAULT 'sent' -- sent, signed
);

-- ----------------------------------------------------
-- 7. BARCODE MODULE
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS stock_barcode_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID DEFAULT auth.uid(),
    barcode TEXT NOT NULL,
    product_id UUID,
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID
);


-- =========================================================================
-- TEAM-AWARE SAAS ROW LEVEL SECURITY POLICIES
-- =========================================================================

-- Enable RLS on all tables
ALTER TABLE knowledge_article ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_task ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_appointment_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_appointment ENABLE ROW LEVEL SECURITY;
ALTER TABLE planning_slot ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_survey ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_question ENABLE ROW LEVEL SECURITY;
ALTER TABLE sign_request ENABLE ROW LEVEL SECURITY;
ALTER TABLE sign_signer ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_barcode_log ENABLE ROW LEVEL SECURITY;

-- Idempotent Policy Creation (Drop first, then Create)
-- These use the Team Workspace logic: tenant_id must match a workspace the user belongs to.

DO $$ 
BEGIN
    -- Knowledge
    DROP POLICY IF EXISTS "Strict SaaS Access" ON knowledge_article;
    CREATE POLICY "Strict SaaS Access" ON knowledge_article FOR ALL USING (tenant_id IN (SELECT workspace_id FROM public.user_workspaces WHERE user_id = auth.uid()));

    -- To-Do
    DROP POLICY IF EXISTS "Strict SaaS Access" ON todo_task;
    CREATE POLICY "Strict SaaS Access" ON todo_task FOR ALL USING (tenant_id IN (SELECT workspace_id FROM public.user_workspaces WHERE user_id = auth.uid()));

    -- Appointments
    DROP POLICY IF EXISTS "Strict SaaS Access" ON calendar_appointment_type;
    CREATE POLICY "Strict SaaS Access" ON calendar_appointment_type FOR ALL USING (tenant_id IN (SELECT workspace_id FROM public.user_workspaces WHERE user_id = auth.uid()));

    DROP POLICY IF EXISTS "Strict SaaS Access" ON calendar_appointment;
    CREATE POLICY "Strict SaaS Access" ON calendar_appointment FOR ALL USING (tenant_id IN (SELECT workspace_id FROM public.user_workspaces WHERE user_id = auth.uid()));

    -- Planning
    DROP POLICY IF EXISTS "Strict SaaS Access" ON planning_slot;
    CREATE POLICY "Strict SaaS Access" ON planning_slot FOR ALL USING (tenant_id IN (SELECT workspace_id FROM public.user_workspaces WHERE user_id = auth.uid()));

    -- Surveys
    DROP POLICY IF EXISTS "Strict SaaS Access" ON survey_survey;
    CREATE POLICY "Strict SaaS Access" ON survey_survey FOR ALL USING (tenant_id IN (SELECT workspace_id FROM public.user_workspaces WHERE user_id = auth.uid()));

    DROP POLICY IF EXISTS "Strict SaaS Access" ON survey_question;
    CREATE POLICY "Strict SaaS Access" ON survey_question FOR ALL USING (tenant_id IN (SELECT workspace_id FROM public.user_workspaces WHERE user_id = auth.uid()));

    -- Sign
    DROP POLICY IF EXISTS "Strict SaaS Access" ON sign_request;
    CREATE POLICY "Strict SaaS Access" ON sign_request FOR ALL USING (tenant_id IN (SELECT workspace_id FROM public.user_workspaces WHERE user_id = auth.uid()));

    DROP POLICY IF EXISTS "Strict SaaS Access" ON sign_signer;
    CREATE POLICY "Strict SaaS Access" ON sign_signer FOR ALL USING (tenant_id IN (SELECT workspace_id FROM public.user_workspaces WHERE user_id = auth.uid()));

    -- Barcode
    DROP POLICY IF EXISTS "Strict SaaS Access" ON stock_barcode_log;
    CREATE POLICY "Strict SaaS Access" ON stock_barcode_log FOR ALL USING (tenant_id IN (SELECT workspace_id FROM public.user_workspaces WHERE user_id = auth.uid()));
END $$;
