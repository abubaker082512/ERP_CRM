-- APPOINTMENTS MODULE
CREATE TABLE IF NOT EXISTS calendar_appointment_type (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    duration NUMERIC(5, 2) DEFAULT 1.0, -- Hours
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS calendar_appointment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- Customer Name
    email TEXT,
    phone TEXT,
    appointment_type_id UUID REFERENCES calendar_appointment_type(id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    state TEXT DEFAULT 'scheduled', -- scheduled, done, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PLANNING MODULE
CREATE TABLE IF NOT EXISTS planning_slot (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES hr_employee(id),
    role_id UUID REFERENCES hr_job(id),
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE calendar_appointment_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_appointment ENABLE ROW LEVEL SECURITY;
ALTER TABLE planning_slot ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public Access" ON calendar_appointment_type FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON calendar_appointment FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON planning_slot FOR ALL USING (true) WITH CHECK (true);
