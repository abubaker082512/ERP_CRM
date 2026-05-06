-- ============================================================
-- Galaxy ERP - Final Enterprise Sync (Fixed)
-- ============================================================

-- 1. Sales Order Enhancements
ALTER TABLE sale_order 
ADD COLUMN IF NOT EXISTS user_id UUID,
ADD COLUMN IF NOT EXISTS team_id UUID,
ADD COLUMN IF NOT EXISTS payment_term_id UUID,
ADD COLUMN IF NOT EXISTS pricelist_id UUID,
ADD COLUMN IF NOT EXISTS fiscal_position_id UUID,
ADD COLUMN IF NOT EXISTS validity_date DATE,
ADD COLUMN IF NOT EXISTS require_signature BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS require_payment BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS invoice_status TEXT DEFAULT 'no';

-- 2. Sales Order Line Enhancements
ALTER TABLE sale_order_line
ADD COLUMN IF NOT EXISTS product_uom_id UUID,
ADD COLUMN IF NOT EXISTS discount NUMERIC(5, 2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS price_tax NUMERIC(15, 2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS price_total NUMERIC(15, 2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS qty_delivered NUMERIC(15, 2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS qty_invoiced NUMERIC(15, 2) DEFAULT 0.0;

-- 3. Inventory Pickings (Transfers)
CREATE TABLE IF NOT EXISTS inventory_picking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL DEFAULT 'WH/OUT/New',
    partner_id UUID REFERENCES contacts(id),
    sale_id UUID REFERENCES sale_order(id),
    purchase_id UUID REFERENCES purchase_order(id),
    state TEXT DEFAULT 'draft',
    picking_type_code TEXT NOT NULL,
    scheduled_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date_done TIMESTAMP WITH TIME ZONE,
    origin TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE inventory_move ADD COLUMN IF NOT EXISTS picking_id UUID REFERENCES inventory_picking(id) ON DELETE CASCADE;

-- 4. Accounting Payments
CREATE TABLE IF NOT EXISTS account_payment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL DEFAULT 'PAY/New',
    date DATE DEFAULT CURRENT_DATE,
    amount NUMERIC(15, 2) NOT NULL,
    payment_type TEXT NOT NULL,
    partner_id UUID REFERENCES contacts(id),
    journal_id UUID REFERENCES account_journal(id),
    state TEXT DEFAULT 'draft',
    ref TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS account_payment_invoice_rel (
    payment_id UUID REFERENCES account_payment(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES account_move(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2),
    PRIMARY KEY (payment_id, invoice_id)
);

ALTER TABLE account_move ADD COLUMN IF NOT EXISTS payment_state TEXT DEFAULT 'not_paid';
ALTER TABLE account_move ADD COLUMN IF NOT EXISTS amount_residual NUMERIC(15, 2) DEFAULT 0.0;

-- 5. Manufacturing (Work Centers & Work Orders)
CREATE TABLE IF NOT EXISTS mrp_workcenter (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT,
    capacity NUMERIC(15, 2) DEFAULT 1.0,
    time_efficiency NUMERIC(15, 2) DEFAULT 100.0,
    oee_target NUMERIC(15, 2) DEFAULT 90.0,
    cost_per_hour NUMERIC(15, 2) DEFAULT 0.0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mrp_workorder (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    production_id UUID REFERENCES mrp_production(id) ON DELETE CASCADE,
    workcenter_id UUID REFERENCES mrp_workcenter(id),
    state TEXT DEFAULT 'pending',
    duration_expected NUMERIC(15, 2) DEFAULT 60.0,
    duration NUMERIC(15, 2) DEFAULT 0.0,
    date_start TIMESTAMP WITH TIME ZONE,
    date_finished TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE mrp_production ADD COLUMN IF NOT EXISTS reservation_state TEXT DEFAULT 'waiting';

-- 6. CRM & Helpdesk
ALTER TABLE crm_lead ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'lead';
ALTER TABLE crm_lead ADD COLUMN IF NOT EXISTS expected_revenue NUMERIC(15, 2) DEFAULT 0.0;
ALTER TABLE crm_lead ADD COLUMN IF NOT EXISTS prorated_revenue NUMERIC(15, 2) DEFAULT 0.0;
ALTER TABLE crm_lead ADD COLUMN IF NOT EXISTS date_deadline DATE;
ALTER TABLE crm_lead ADD COLUMN IF NOT EXISTS lost_reason TEXT;
ALTER TABLE crm_lead ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS helpdesk_team (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS helpdesk_ticket (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    team_id UUID REFERENCES helpdesk_team(id),
    user_id UUID REFERENCES auth.users(id),
    partner_id UUID REFERENCES contacts(id),
    priority TEXT DEFAULT '0',
    stage_id TEXT DEFAULT 'new',
    sla_deadline TIMESTAMP WITH TIME ZONE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. HR & Recruitment
CREATE TABLE IF NOT EXISTS hr_department (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    parent_id UUID REFERENCES hr_department(id),
    manager_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE hr_employee ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES hr_department(id);
ALTER TABLE hr_employee ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES hr_employee(id);
ALTER TABLE hr_employee ADD COLUMN IF NOT EXISTS coach_id UUID REFERENCES hr_employee(id);
ALTER TABLE hr_employee ADD COLUMN IF NOT EXISTS birthday DATE;
ALTER TABLE hr_employee ADD COLUMN IF NOT EXISTS private_email TEXT;
ALTER TABLE hr_employee ADD COLUMN IF NOT EXISTS private_phone TEXT;
ALTER TABLE hr_employee ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE hr_employee ADD COLUMN IF NOT EXISTS marital TEXT;

CREATE TABLE IF NOT EXISTS hr_job (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    department_id UUID REFERENCES hr_department(id),
    no_of_recruitment INTEGER DEFAULT 1,
    state TEXT DEFAULT 'recruit',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hr_applicant (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    partner_name TEXT,
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

-- 8. Payroll
CREATE TABLE IF NOT EXISTS hr_payslip (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES hr_employee(id) NOT NULL,
    number TEXT,
    date_from DATE NOT NULL,
    date_to DATE NOT NULL,
    state TEXT DEFAULT 'draft',
    basic_wage NUMERIC(15, 2) DEFAULT 0.0,
    net_wage NUMERIC(15, 2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Projects & Timesheets
CREATE TABLE IF NOT EXISTS project_project (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    partner_id UUID REFERENCES contacts(id),
    color INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_task (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    project_id UUID REFERENCES project_project(id),
    user_id UUID REFERENCES auth.users(id),
    stage_id TEXT DEFAULT 'todo',
    priority TEXT DEFAULT '0',
    date_deadline DATE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hr_timesheet (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    project_id UUID REFERENCES project_project(id),
    task_id UUID REFERENCES project_task(id),
    date DATE DEFAULT CURRENT_DATE,
    unit_amount NUMERIC(15, 2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Fleet, Expenses, Maintenance
CREATE TABLE IF NOT EXISTS fleet_vehicle (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id TEXT NOT NULL,
    license_plate TEXT,
    driver_id UUID REFERENCES auth.users(id),
    vin_sn TEXT,
    acquisition_date DATE,
    state TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hr_expense (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    employee_id UUID REFERENCES hr_employee(id),
    product_id UUID REFERENCES product_product(id),
    total_amount NUMERIC(15, 2) DEFAULT 0.0,
    unit_amount NUMERIC(15, 2) DEFAULT 0.0,
    quantity NUMERIC(15, 2) DEFAULT 1.0,
    state TEXT DEFAULT 'draft',
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS maintenance_equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    equipment_assign_to TEXT DEFAULT 'department',
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
    user_id UUID REFERENCES auth.users(id),
    technician_user_id UUID REFERENCES auth.users(id),
    priority TEXT DEFAULT '0',
    kanban_state TEXT DEFAULT 'normal',
    stage_id TEXT DEFAULT 'new',
    schedule_date TIMESTAMP WITH TIME ZONE,
    duration NUMERIC(15, 2),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Payroll Runs (Batches) — required by Payroll API
CREATE TABLE IF NOT EXISTS hr_payroll_run (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    run_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    state TEXT DEFAULT 'draft', -- draft, done
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Todo task enhancements
ALTER TABLE todo_task ADD COLUMN IF NOT EXISTS date_deadline DATE;
ALTER TABLE todo_task ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;
ALTER TABLE todo_task ADD COLUMN IF NOT EXISTS tag_ids TEXT[];
