-- RECRUITMENT MODULE TABLES

-- Job Positions
CREATE TABLE IF NOT EXISTS hr_job (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    department_id UUID REFERENCES hr_department(id),
    no_of_recruitment INTEGER DEFAULT 1,
    state TEXT DEFAULT 'recruit', -- recruit, open
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applicants
CREATE TABLE IF NOT EXISTS hr_applicant (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- Applicant Name
    job_id UUID REFERENCES hr_job(id),
    department_id UUID REFERENCES hr_department(id),
    email_from TEXT,
    phone TEXT,
    stage_id TEXT DEFAULT 'new', -- new, interview, contract, signed, refused
    salary_expected NUMERIC(15, 2),
    salary_proposed NUMERIC(15, 2),
    availability DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE hr_job ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_applicant ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for all users" ON hr_job FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON hr_job FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON hr_job FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON hr_applicant FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON hr_applicant FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON hr_applicant FOR UPDATE USING (true);
