-- ATTENDANCE MODULE TABLES

-- Attendance
CREATE TABLE IF NOT EXISTS hr_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES hr_employee(id) NOT NULL,
    check_in TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    check_out TIMESTAMP WITH TIME ZONE,
    worked_hours NUMERIC(5, 2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE hr_attendance ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for all users" ON hr_attendance FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON hr_attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON hr_attendance FOR UPDATE USING (true);
