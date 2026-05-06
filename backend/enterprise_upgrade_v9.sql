-- ============================================================
-- Galaxy ERP - Enterprise Upgrade V9 (Timesheets)
-- ============================================================

CREATE TABLE IF NOT EXISTS hr_timesheet (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- Description
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    project_id UUID REFERENCES project_project(id),
    task_id UUID REFERENCES project_task(id),
    date DATE DEFAULT CURRENT_DATE,
    unit_amount NUMERIC(15, 2) DEFAULT 0.0, -- Hours
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
