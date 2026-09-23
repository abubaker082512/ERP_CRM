-- 1. PROJECT MODULE
CREATE TABLE IF NOT EXISTS project_project (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    partner_id UUID REFERENCES contacts(id),
    user_id UUID REFERENCES hr_employee(id),
    color INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_task (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    project_id UUID REFERENCES project_project(id) ON DELETE CASCADE,
    stage_id TEXT DEFAULT 'todo',
    kanban_state TEXT DEFAULT 'normal',
    user_id UUID REFERENCES hr_employee(id),
    date_deadline TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. KNOWLEDGE MODULE
CREATE TABLE IF NOT EXISTS knowledge_article (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    body TEXT,
    category TEXT DEFAULT 'general',
    author_id UUID REFERENCES contacts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TO DO MODULE
CREATE TABLE IF NOT EXISTS todo_task (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    user_id UUID REFERENCES hr_employee(id),
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. APPOINTMENTS MODULE
CREATE TABLE IF NOT EXISTS calendar_appointment_type (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    duration NUMERIC(5, 2) DEFAULT 1.0,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS calendar_appointment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    appointment_type_id UUID REFERENCES calendar_appointment_type(id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    state TEXT DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. PLANNING MODULE
CREATE TABLE IF NOT EXISTS planning_slot (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES hr_employee(id),
    role_id UUID REFERENCES hr_job(id),
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. SURVEYS MODULE
CREATE TABLE IF NOT EXISTS survey_survey (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    state TEXT DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS survey_question (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID REFERENCES survey_survey(id),
    question TEXT NOT NULL,
    type TEXT DEFAULT 'text',
    sequence INTEGER DEFAULT 0
);

-- 7. SIGN MODULE
CREATE TABLE IF NOT EXISTS sign_request (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    file_url TEXT,
    state TEXT DEFAULT 'sent',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sign_signer (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES sign_request(id),
    partner_id UUID REFERENCES contacts(id),
    role TEXT DEFAULT 'signer',
    state TEXT DEFAULT 'sent'
);

-- 8. BARCODE MODULE
CREATE TABLE IF NOT EXISTS stock_barcode_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barcode TEXT NOT NULL,
    product_id UUID REFERENCES product_product(id),
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES hr_employee(id)
);

-- Enable RLS
ALTER TABLE project_project ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_task ENABLE ROW LEVEL SECURITY;
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

-- Policies
CREATE POLICY "Public Access" ON project_project FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON project_task FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON knowledge_article FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON todo_task FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON calendar_appointment_type FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON calendar_appointment FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON planning_slot FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON survey_survey FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON survey_question FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON sign_request FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON sign_signer FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON stock_barcode_log FOR ALL USING (true) WITH CHECK (true);
