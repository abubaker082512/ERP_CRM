-- ============================================================
-- Galaxy ERP - Enterprise Upgrade V8 (Fleet, Expenses, Maintenance)
-- ============================================================

-- Fleet Management
CREATE TABLE IF NOT EXISTS fleet_vehicle (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id TEXT NOT NULL, -- e.g. 'Tesla Model 3'
    license_plate TEXT,
    driver_id UUID REFERENCES auth.users(id),
    vin_sn TEXT,
    acquisition_date DATE,
    state TEXT DEFAULT 'active', -- active, inactive, sold
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses
CREATE TABLE IF NOT EXISTS hr_expense (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    employee_id UUID REFERENCES hr_employee(id),
    product_id UUID REFERENCES product(id),
    total_amount NUMERIC(15, 2) DEFAULT 0.0,
    unit_amount NUMERIC(15, 2) DEFAULT 0.0,
    quantity NUMERIC(15, 2) DEFAULT 1.0,
    state TEXT DEFAULT 'draft', -- draft, reported, approved, done, refused
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance
CREATE TABLE IF NOT EXISTS maintenance_equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    equipment_assign_to TEXT DEFAULT 'department', -- department, employee, other
    employee_id UUID REFERENCES hr_employee(id),
    department_id UUID REFERENCES hr_department(id),
    maintenance_team_id UUID,
    technician_user_id UUID REFERENCES auth.users(id),
    category_id UUID,
    serial_no TEXT,
    effective_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS maintenance_request (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    equipment_id UUID REFERENCES maintenance_equipment(id),
    user_id UUID REFERENCES auth.users(id), -- Requested by
    technician_user_id UUID REFERENCES auth.users(id),
    priority TEXT DEFAULT '0',
    kanban_state TEXT DEFAULT 'normal',
    stage_id TEXT DEFAULT 'new',
    schedule_date TIMESTAMP WITH TIME ZONE,
    duration NUMERIC(15, 2),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
