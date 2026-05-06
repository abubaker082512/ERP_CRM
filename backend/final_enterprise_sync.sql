-- ============================================================
-- Galaxy ERP - Enterprise Upgrade V1
-- Adding missing fields to align with Odoo 17.0
-- ============================================================

-- 1. Sales Order Enhancements
ALTER TABLE sale_order 
ADD COLUMN IF NOT EXISTS user_id UUID, -- Salesperson
ADD COLUMN IF NOT EXISTS team_id UUID, -- Sales Team
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

-- 3. Inventory Enhancements
ALTER TABLE inventory_move
ADD COLUMN IF NOT EXISTS lot_id UUID,
ADD COLUMN IF NOT EXISTS picking_id UUID;

-- 4. Accounting Enhancements
ALTER TABLE account_move
ADD COLUMN IF NOT EXISTS payment_state TEXT DEFAULT 'not_paid',
ADD COLUMN IF NOT EXISTS invoice_date_due DATE;
-- ============================================================
-- Galaxy ERP - Enterprise Upgrade V2 (Inventory)
-- Adding Transfers (Pickings) for Odoo-parity
-- ============================================================

CREATE TABLE IF NOT EXISTS inventory_picking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL DEFAULT 'WH/OUT/New',
    partner_id UUID REFERENCES contacts(id),
    sale_id UUID REFERENCES sale_order(id),
    purchase_id UUID REFERENCES purchase_order(id),
    state TEXT DEFAULT 'draft', -- draft, waiting, confirmed, assigned, done, cancel
    picking_type_code TEXT NOT NULL, -- outgoing, incoming, internal
    scheduled_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date_done TIMESTAMP WITH TIME ZONE,
    origin TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-name pickings
CREATE OR REPLACE FUNCTION auto_name_inventory_picking()
RETURNS TRIGGER AS $$
DECLARE
    seq_val INTEGER;
    prefix TEXT;
BEGIN
    prefix := CASE 
        WHEN NEW.picking_type_code = 'outgoing' THEN 'WH/OUT/'
        WHEN NEW.picking_type_code = 'incoming' THEN 'WH/IN/'
        ELSE 'WH/INT/'
    END;
    
    IF NEW.name LIKE '%/New' OR NEW.name IS NULL THEN
        SELECT COUNT(*) + 1 INTO seq_val FROM inventory_picking WHERE picking_type_code = NEW.picking_type_code;
        NEW.name := prefix || LPAD(seq_val::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_name_inventory_picking ON inventory_picking;
CREATE TRIGGER trg_auto_name_inventory_picking
    BEFORE INSERT ON inventory_picking
    FOR EACH ROW EXECUTE FUNCTION auto_name_inventory_picking();

-- Link moves to pickings
ALTER TABLE inventory_move ADD COLUMN IF NOT EXISTS picking_id UUID REFERENCES inventory_picking(id) ON DELETE CASCADE;
-- ============================================================
-- Galaxy ERP - Enterprise Upgrade V3 (Accounting)
-- Adding Payments and Reconciliation for Odoo-parity
-- ============================================================

CREATE TABLE IF NOT EXISTS account_payment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL DEFAULT 'PAY/New',
    date DATE DEFAULT CURRENT_DATE,
    amount NUMERIC(15, 2) NOT NULL,
    payment_type TEXT NOT NULL, -- inbound, outbound
    partner_id UUID REFERENCES contacts(id),
    journal_id UUID REFERENCES account_journal(id),
    state TEXT DEFAULT 'draft', -- draft, posted, cancel
    ref TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-name payments
CREATE OR REPLACE FUNCTION auto_name_account_payment()
RETURNS TRIGGER AS $$
DECLARE
    seq_val INTEGER;
BEGIN
    IF NEW.name = 'PAY/New' OR NEW.name IS NULL THEN
        SELECT COUNT(*) + 1 INTO seq_val FROM account_payment;
        NEW.name := 'PAY/' || TO_CHAR(CURRENT_DATE, 'YYYY') || '/' || LPAD(seq_val::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_name_account_payment ON account_payment;
CREATE TRIGGER trg_auto_name_account_payment
    BEFORE INSERT ON account_payment
    FOR EACH ROW EXECUTE FUNCTION auto_name_account_payment();

-- Link invoices to payments (Reconciliation)
CREATE TABLE IF NOT EXISTS account_payment_invoice_rel (
    payment_id UUID REFERENCES account_payment(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES account_move(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2),
    PRIMARY KEY (payment_id, invoice_id)
);

-- Update account_move with payment_state
ALTER TABLE account_move ADD COLUMN IF NOT EXISTS payment_state TEXT DEFAULT 'not_paid';
ALTER TABLE account_move ADD COLUMN IF NOT EXISTS amount_residual NUMERIC(15, 2) DEFAULT 0.0;
-- ============================================================
-- Galaxy ERP - Enterprise Upgrade V4 (Manufacturing)
-- Adding Work Centers and Work Orders for Odoo-parity
-- ============================================================

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
    production_id UUID REFERENCES manufacturing_order(id) ON DELETE CASCADE,
    workcenter_id UUID REFERENCES mrp_workcenter(id),
    state TEXT DEFAULT 'pending', -- pending, ready, progress, done, cancel
    duration_expected NUMERIC(15, 2) DEFAULT 60.0, -- minutes
    duration NUMERIC(15, 2) DEFAULT 0.0,
    date_start TIMESTAMP WITH TIME ZONE,
    date_finished TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update manufacturing_order with readiness
ALTER TABLE manufacturing_order ADD COLUMN IF NOT EXISTS reservation_state TEXT DEFAULT 'waiting';
-- ============================================================
-- Galaxy ERP - Enterprise Upgrade V5 (CRM & Helpdesk)
-- Adding Enterprise Fields for Odoo Parity
-- ============================================================

-- CRM Enhancements
ALTER TABLE lead ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'lead'; -- 'lead' or 'opportunity'
ALTER TABLE lead ADD COLUMN IF NOT EXISTS expected_revenue NUMERIC(15, 2) DEFAULT 0.0;
ALTER TABLE lead ADD COLUMN IF NOT EXISTS prorated_revenue NUMERIC(15, 2) DEFAULT 0.0;
ALTER TABLE lead ADD COLUMN IF NOT EXISTS date_deadline DATE;
ALTER TABLE lead ADD COLUMN IF NOT EXISTS lost_reason TEXT;
ALTER TABLE lead ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;

-- Helpdesk Enhancements
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
    partner_id UUID REFERENCES contact(id),
    priority TEXT DEFAULT '0', -- 0: Low, 1: Medium, 2: High, 3: Urgent
    stage_id TEXT DEFAULT 'new',
    sla_deadline TIMESTAMP WITH TIME ZONE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default Helpdesk Teams
INSERT INTO helpdesk_team (name) VALUES ('General Support'), ('Technical Support'), ('Billing') ON CONFLICT DO NOTHING;
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
-- ============================================================
-- Galaxy ERP - Enterprise Upgrade V7 (Todo & Projects)
-- ============================================================

-- Project System
CREATE TABLE IF NOT EXISTS project_project (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id), -- Project Manager
    partner_id UUID REFERENCES contact(id), -- Customer
    color INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_task (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    project_id UUID REFERENCES project_project(id),
    user_id UUID REFERENCES auth.users(id), -- Assigned to
    stage_id TEXT DEFAULT 'todo', -- todo, in_progress, done, cancelled
    priority TEXT DEFAULT '0',
    date_deadline DATE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Todo Enhancements (Unified with Project Tasks if needed, or standalone)
ALTER TABLE todo_task ADD COLUMN IF NOT EXISTS date_deadline DATE;
ALTER TABLE todo_task ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;
ALTER TABLE todo_task ADD COLUMN IF NOT EXISTS tag_ids TEXT[]; -- Simple array of tags for now
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
