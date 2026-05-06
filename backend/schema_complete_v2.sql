-- ============================================================
-- Galaxy ERP - Complete Schema V2 (Idempotent)
-- Run this in Supabase SQL Editor to set up all tables
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. CORE / CONTACTS
-- ============================================================
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    is_company BOOLEAN DEFAULT FALSE,
    company_name TEXT,
    street TEXT,
    city TEXT,
    country TEXT,
    website TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 2. PRODUCTS & INVENTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS product_category (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    parent_id UUID REFERENCES product_category(id)
);

CREATE TABLE IF NOT EXISTS product_product (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT DEFAULT 'consu',
    default_code TEXT,
    barcode TEXT,
    list_price NUMERIC(15, 2) DEFAULT 0.0,
    standard_price NUMERIC(15, 2) DEFAULT 0.0,
    categ_id UUID REFERENCES product_category(id),
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_warehouse (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS inventory_location (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    usage TEXT DEFAULT 'internal',
    warehouse_id UUID REFERENCES inventory_warehouse(id)
);

CREATE TABLE IF NOT EXISTS inventory_quant (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES product_product(id),
    location_id UUID REFERENCES inventory_location(id),
    quantity NUMERIC(15, 2) DEFAULT 0.0,
    reserved_quantity NUMERIC(15, 2) DEFAULT 0.0
);

CREATE TABLE IF NOT EXISTS inventory_move (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    product_id UUID REFERENCES product_product(id),
    location_id UUID REFERENCES inventory_location(id),
    location_dest_id UUID REFERENCES inventory_location(id),
    product_uom_qty NUMERIC(15, 2) DEFAULT 0.0,
    quantity NUMERIC(15, 2) DEFAULT 0.0,
    state TEXT DEFAULT 'draft',
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reference TEXT
);

-- ============================================================
-- 3. CRM
-- ============================================================
CREATE TABLE IF NOT EXISTS crm_lead (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email_from TEXT,
    phone TEXT,
    probability NUMERIC(5, 2) DEFAULT 0.0,
    stage_id TEXT DEFAULT 'new',
    type TEXT DEFAULT 'lead',
    expected_revenue NUMERIC(15, 2) DEFAULT 0.0,
    company_name TEXT,
    notes TEXT,
    close_date DATE,
    priority INTEGER DEFAULT 0,
    sentiment_score NUMERIC(5, 2) DEFAULT 0.0,
    partner_id UUID REFERENCES contacts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 4. SALES
-- ============================================================
CREATE TABLE IF NOT EXISTS sale_order (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL DEFAULT 'SO/New',
    partner_id UUID REFERENCES contacts(id),
    customer_name TEXT,
    date_order TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    state TEXT DEFAULT 'draft',
    amount_total NUMERIC(15, 2) DEFAULT 0.0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sale_order_line (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES sale_order(id) ON DELETE CASCADE,
    product_id UUID REFERENCES product_product(id),
    name TEXT,
    product_uom_qty NUMERIC(15, 2) DEFAULT 1.0,
    price_unit NUMERIC(15, 2) DEFAULT 0.0,
    price_subtotal NUMERIC(15, 2) DEFAULT 0.0
);

-- Auto-name sales orders
CREATE OR REPLACE FUNCTION auto_name_sale_order()
RETURNS TRIGGER AS $$
DECLARE
    seq_val INTEGER;
BEGIN
    IF NEW.name = 'SO/New' OR NEW.name IS NULL THEN
        SELECT COUNT(*) + 1 INTO seq_val FROM sale_order;
        NEW.name := 'SO' || LPAD(seq_val::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_name_sale_order ON sale_order;
CREATE TRIGGER trg_auto_name_sale_order
    BEFORE INSERT ON sale_order
    FOR EACH ROW EXECUTE FUNCTION auto_name_sale_order();

-- ============================================================
-- 5. PURCHASE
-- ============================================================
CREATE TABLE IF NOT EXISTS purchase_order (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL DEFAULT 'PO/New',
    partner_id UUID REFERENCES contacts(id),
    date_order TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    state TEXT DEFAULT 'draft',
    amount_total NUMERIC(15, 2) DEFAULT 0.0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_order_line (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES purchase_order(id) ON DELETE CASCADE,
    product_id UUID REFERENCES product_product(id),
    name TEXT,
    product_qty NUMERIC(15, 2) DEFAULT 1.0,
    price_unit NUMERIC(15, 2) DEFAULT 0.0,
    price_subtotal NUMERIC(15, 2) DEFAULT 0.0
);

CREATE OR REPLACE FUNCTION auto_name_purchase_order()
RETURNS TRIGGER AS $$
DECLARE
    seq_val INTEGER;
BEGIN
    IF NEW.name = 'PO/New' OR NEW.name IS NULL THEN
        SELECT COUNT(*) + 1 INTO seq_val FROM purchase_order;
        NEW.name := 'PO' || LPAD(seq_val::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_name_purchase_order ON purchase_order;
CREATE TRIGGER trg_auto_name_purchase_order
    BEFORE INSERT ON purchase_order
    FOR EACH ROW EXECUTE FUNCTION auto_name_purchase_order();

-- ============================================================
-- 6. ACCOUNTING
-- ============================================================
CREATE TABLE IF NOT EXISTS account_account (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS account_journal (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    code TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS account_move (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL DEFAULT '/',
    date DATE DEFAULT CURRENT_DATE,
    journal_id UUID REFERENCES account_journal(id),
    state TEXT DEFAULT 'draft',
    move_type TEXT DEFAULT 'entry',
    partner_id UUID REFERENCES contacts(id),
    amount_total NUMERIC(15, 2) DEFAULT 0.0,
    payment_state TEXT DEFAULT 'not_paid',
    ref TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS account_move_line (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    move_id UUID REFERENCES account_move(id) ON DELETE CASCADE,
    account_id UUID REFERENCES account_account(id),
    name TEXT,
    debit NUMERIC(15, 2) DEFAULT 0.0,
    credit NUMERIC(15, 2) DEFAULT 0.0,
    quantity NUMERIC(15, 2) DEFAULT 1.0,
    price_unit NUMERIC(15, 2) DEFAULT 0.0
);

-- ============================================================
-- 7. HR / EMPLOYEES
-- ============================================================
CREATE TABLE IF NOT EXISTS hr_department (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS hr_employee (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    department_id UUID REFERENCES hr_department(id),
    job_title TEXT,
    work_email TEXT,
    work_phone TEXT,
    mobile_phone TEXT,
    image_url TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 8. MANUFACTURING (MRP)
-- ============================================================
CREATE TABLE IF NOT EXISTS mrp_bom (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES product_product(id),
    code TEXT,
    product_qty NUMERIC(15, 2) DEFAULT 1.0,
    type TEXT DEFAULT 'normal',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mrp_bom_line (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bom_id UUID REFERENCES mrp_bom(id) ON DELETE CASCADE,
    product_id UUID REFERENCES product_product(id),
    product_qty NUMERIC(15, 2) DEFAULT 1.0
);

CREATE TABLE IF NOT EXISTS mrp_production (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL DEFAULT 'MO/New',
    product_id UUID REFERENCES product_product(id),
    product_qty NUMERIC(15, 2) DEFAULT 1.0,
    state TEXT DEFAULT 'draft',
    bom_id UUID REFERENCES mrp_bom(id),
    scheduled_date TIMESTAMP WITH TIME ZONE,
    date_finished TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION auto_name_production()
RETURNS TRIGGER AS $$
DECLARE
    seq_val INTEGER;
BEGIN
    IF NEW.name = 'MO/New' OR NEW.name IS NULL THEN
        SELECT COUNT(*) + 1 INTO seq_val FROM mrp_production;
        NEW.name := 'MO' || LPAD(seq_val::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_name_production ON mrp_production;
CREATE TRIGGER trg_auto_name_production
    BEFORE INSERT ON mrp_production
    FOR EACH ROW EXECUTE FUNCTION auto_name_production();

-- ============================================================
-- 9. HELPDESK
-- ============================================================
CREATE TABLE IF NOT EXISTS helpdesk_ticket (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    partner_id UUID REFERENCES contacts(id),
    stage_id TEXT DEFAULT 'new',
    priority TEXT DEFAULT '0',
    assigned_to UUID REFERENCES hr_employee(id),
    tag_ids TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS helpdesk_message (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES helpdesk_ticket(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    author_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 10. PAYROLL
-- ============================================================
CREATE TABLE IF NOT EXISTS payroll_salary_structure (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    basic_wage NUMERIC(15, 2) DEFAULT 0.0,
    allowances NUMERIC(15, 2) DEFAULT 0.0,
    deductions NUMERIC(15, 2) DEFAULT 0.0
);

CREATE TABLE IF NOT EXISTS payroll_run (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    run_date DATE DEFAULT CURRENT_DATE,
    date_start DATE,
    date_end DATE,
    state TEXT DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payroll_payslip (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES hr_employee(id),
    run_id UUID REFERENCES payroll_run(id),
    date_from DATE,
    date_to DATE,
    struct_id UUID REFERENCES payroll_salary_structure(id),
    gross_wage NUMERIC(15, 2) DEFAULT 0.0,
    net_wage NUMERIC(15, 2) DEFAULT 0.0,
    state TEXT DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 11. DOCUMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS documents_document (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT DEFAULT 'file',
    folder_id UUID REFERENCES documents_document(id),
    file_url TEXT,
    file_size INTEGER DEFAULT 0,
    mimetype TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 12. DISCUSS
-- ============================================================
CREATE TABLE IF NOT EXISTS mail_channel (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    channel_type TEXT DEFAULT 'channel',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mail_message (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID REFERENCES mail_channel(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    author_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 13. POS
-- ============================================================
CREATE TABLE IF NOT EXISTS pos_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    currency_id TEXT DEFAULT 'USD',
    receipt_header TEXT,
    receipt_footer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pos_session (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_id UUID REFERENCES pos_config(id),
    user_id UUID REFERENCES hr_employee(id),
    start_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    stop_at TIMESTAMP WITH TIME ZONE,
    state TEXT DEFAULT 'open',
    start_cash NUMERIC(15, 2) DEFAULT 0.0,
    stop_cash NUMERIC(15, 2) DEFAULT 0.0
);

CREATE TABLE IF NOT EXISTS pos_order (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    session_id UUID REFERENCES pos_session(id),
    date_order TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    partner_id UUID REFERENCES contacts(id),
    amount_total NUMERIC(15, 2) DEFAULT 0.0,
    amount_tax NUMERIC(15, 2) DEFAULT 0.0,
    amount_paid NUMERIC(15, 2) DEFAULT 0.0,
    amount_return NUMERIC(15, 2) DEFAULT 0.0,
    state TEXT DEFAULT 'draft'
);

CREATE TABLE IF NOT EXISTS pos_order_line (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES pos_order(id) ON DELETE CASCADE,
    product_id UUID REFERENCES product_product(id),
    qty NUMERIC(15, 2) DEFAULT 1.0,
    price_unit NUMERIC(15, 2) DEFAULT 0.0,
    price_subtotal NUMERIC(15, 2) DEFAULT 0.0,
    price_subtotal_incl NUMERIC(15, 2) DEFAULT 0.0,
    discount NUMERIC(5, 2) DEFAULT 0.0
);

CREATE TABLE IF NOT EXISTS pos_payment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES pos_order(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) DEFAULT 0.0,
    payment_method TEXT DEFAULT 'cash',
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 14. RECRUITMENT
-- ============================================================
CREATE TABLE IF NOT EXISTS hr_job (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    department_id UUID REFERENCES hr_department(id),
    no_of_recruitment INTEGER DEFAULT 1,
    state TEXT DEFAULT 'recruit',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hr_applicant (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    job_id UUID REFERENCES hr_job(id),
    department_id UUID REFERENCES hr_department(id),
    email_from TEXT,
    phone TEXT,
    stage_id TEXT DEFAULT 'new',
    salary_expected NUMERIC(15, 2),
    salary_proposed NUMERIC(15, 2),
    availability DATE,
    resume_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 15. ATTENDANCE
-- ============================================================
CREATE TABLE IF NOT EXISTS hr_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES hr_employee(id) NOT NULL,
    check_in TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    check_out TIMESTAMP WITH TIME ZONE,
    worked_hours NUMERIC(8, 4) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-calculate worked_hours on checkout
CREATE OR REPLACE FUNCTION calc_worked_hours()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.check_out IS NOT NULL AND NEW.check_in IS NOT NULL THEN
        NEW.worked_hours := EXTRACT(EPOCH FROM (NEW.check_out - NEW.check_in)) / 3600.0;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calc_worked_hours ON hr_attendance;
CREATE TRIGGER trg_calc_worked_hours
    BEFORE INSERT OR UPDATE ON hr_attendance
    FOR EACH ROW EXECUTE FUNCTION calc_worked_hours();

-- ============================================================
-- 16. KNOWLEDGE
-- ============================================================
CREATE TABLE IF NOT EXISTS knowledge_article (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    body TEXT,
    category TEXT DEFAULT 'General',
    is_published BOOLEAN DEFAULT FALSE,
    icon TEXT DEFAULT '📄',
    cover_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 17. TO DO
-- ============================================================
CREATE TABLE IF NOT EXISTS todo_task (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    priority TEXT DEFAULT 'normal',
    due_date DATE,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 18. APPOINTMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS calendar_appointment_type (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    duration INTEGER DEFAULT 60,
    location TEXT,
    description TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS calendar_appointment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_type_id UUID REFERENCES calendar_appointment_type(id),
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    state TEXT DEFAULT 'confirmed',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 19. PLANNING
-- ============================================================
CREATE TABLE IF NOT EXISTS planning_slot (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES hr_employee(id),
    role TEXT,
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    state TEXT DEFAULT 'draft',
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 20. SURVEYS
-- ============================================================
CREATE TABLE IF NOT EXISTS survey_survey (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    state TEXT DEFAULT 'draft',
    access_token TEXT DEFAULT encode(gen_random_bytes(16), 'hex'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS survey_question (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID REFERENCES survey_survey(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    question_type TEXT DEFAULT 'text',
    options JSONB,
    sequence INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS survey_response (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID REFERENCES survey_survey(id),
    respondent_name TEXT,
    respondent_email TEXT,
    answers JSONB,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 21. SIGN (eSignature)
-- ============================================================
CREATE TABLE IF NOT EXISTS sign_request (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    document_url TEXT,
    state TEXT DEFAULT 'sent',
    signers JSONB DEFAULT '[]',
    signed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 22. BARCODE
-- ============================================================
CREATE TABLE IF NOT EXISTS stock_barcode_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barcode TEXT NOT NULL,
    product_id UUID REFERENCES product_product(id),
    product_name TEXT,
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    action TEXT DEFAULT 'scan'
);

-- ============================================================
-- 23. WEBSITE / E-COMMERCE
-- ============================================================
CREATE TABLE IF NOT EXISTS website_product (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES product_product(id),
    website_published BOOLEAN DEFAULT FALSE,
    website_description TEXT
);

CREATE TABLE IF NOT EXISTS website_order (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    partner_id UUID REFERENCES contacts(id),
    amount_total NUMERIC(15, 2) DEFAULT 0.0,
    state TEXT DEFAULT 'cart',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY (ALL TABLES)
-- ============================================================
DO $$ 
DECLARE
    t TEXT;
    tables TEXT[] := ARRAY[
        'contacts','product_category','product_product',
        'inventory_warehouse','inventory_location','inventory_quant','inventory_move',
        'crm_lead','sale_order','sale_order_line',
        'purchase_order','purchase_order_line',
        'account_account','account_journal','account_move','account_move_line',
        'hr_department','hr_employee',
        'mrp_bom','mrp_bom_line','mrp_production',
        'helpdesk_ticket','helpdesk_message',
        'payroll_salary_structure','payroll_run','payroll_payslip',
        'documents_document','mail_channel','mail_message',
        'pos_config','pos_session','pos_order','pos_order_line','pos_payment',
        'hr_job','hr_applicant','hr_attendance',
        'knowledge_article','todo_task',
        'calendar_appointment_type','calendar_appointment',
        'planning_slot','survey_survey','survey_question','survey_response',
        'sign_request','stock_barcode_log',
        'website_product','website_order'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    END LOOP;
END $$;

-- ============================================================
-- CREATE OPEN ACCESS POLICIES (Development Mode)
-- ============================================================
DO $$
DECLARE
    t TEXT;
    tables TEXT[] := ARRAY[
        'contacts','product_category','product_product',
        'inventory_warehouse','inventory_location','inventory_quant','inventory_move',
        'crm_lead','sale_order','sale_order_line',
        'purchase_order','purchase_order_line',
        'account_account','account_journal','account_move','account_move_line',
        'hr_department','hr_employee',
        'mrp_bom','mrp_bom_line','mrp_production',
        'helpdesk_ticket','helpdesk_message',
        'payroll_salary_structure','payroll_run','payroll_payslip',
        'documents_document','mail_channel','mail_message',
        'pos_config','pos_session','pos_order','pos_order_line','pos_payment',
        'hr_job','hr_applicant','hr_attendance',
        'knowledge_article','todo_task',
        'calendar_appointment_type','calendar_appointment',
        'planning_slot','survey_survey','survey_question','survey_response',
        'sign_request','stock_barcode_log',
        'website_product','website_order'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        BEGIN
            EXECUTE format(
                'CREATE POLICY "Dev Open Access" ON %I FOR ALL USING (true) WITH CHECK (true)',
                t
            );
        EXCEPTION WHEN duplicate_object THEN
            NULL; -- Policy already exists, skip
        END;
    END LOOP;
END $$;
