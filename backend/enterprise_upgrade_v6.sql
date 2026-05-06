-- ============================================================
-- Galaxy ERP - Enterprise Upgrade V6 (HR, Recruitment, Payroll)
-- ============================================================

-- HR Departments
CREATE TABLE IF NOT EXISTS hr_department (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    parent_id UUID REFERENCES hr_department(id),
    manager_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employee Enhancements
ALTER TABLE hr_employee ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES hr_department(id);
ALTER TABLE hr_employee ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES hr_employee(id); -- Manager
ALTER TABLE hr_employee ADD COLUMN IF NOT EXISTS coach_id UUID REFERENCES hr_employee(id);
ALTER TABLE hr_employee ADD COLUMN IF NOT EXISTS birthday DATE;
ALTER TABLE hr_employee ADD COLUMN IF NOT EXISTS private_email TEXT;
ALTER TABLE hr_employee ADD COLUMN IF NOT EXISTS private_phone TEXT;
ALTER TABLE hr_employee ADD COLUMN IF NOT EXISTS gender TEXT; -- male, female, other
ALTER TABLE hr_employee ADD COLUMN IF NOT EXISTS marital TEXT; -- single, married, cohabitant, widower, divorced

-- Recruitment (Enterprise Parity)
CREATE TABLE IF NOT EXISTS hr_job (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    department_id UUID REFERENCES hr_department(id),
    no_of_recruitment INTEGER DEFAULT 1,
    state TEXT DEFAULT 'recruit', -- recruit, open, closed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hr_applicant (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- Applicant Name
    partner_name TEXT, -- Contact Name
    email_from TEXT,
    partner_phone TEXT,
    job_id UUID REFERENCES hr_job(id),
    salary_expected NUMERIC(15, 2),
    salary_proposed NUMERIC(15, 2),
    availability DATE,
    stage_id TEXT DEFAULT 'initial',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payroll (Basic Enterprise Schema)
CREATE TABLE IF NOT EXISTS hr_payslip (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES hr_employee(id) NOT NULL,
    number TEXT, -- SLIP/001
    date_from DATE NOT NULL,
    date_to DATE NOT NULL,
    state TEXT DEFAULT 'draft', -- draft, verify, done, cancel
    basic_wage NUMERIC(15, 2) DEFAULT 0.0,
    net_wage NUMERIC(15, 2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
