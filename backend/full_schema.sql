-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CORE / CONTACTS
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    is_company BOOLEAN DEFAULT FALSE,
    company_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PRODUCTS & INVENTORY
CREATE TABLE IF NOT EXISTS product_category (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    parent_id UUID REFERENCES product_category(id)
);

CREATE TABLE IF NOT EXISTS product_product (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT DEFAULT 'consu', -- consu, service, product
    default_code TEXT,
    list_price NUMERIC(15, 2) DEFAULT 0.0,
    standard_price NUMERIC(15, 2) DEFAULT 0.0,
    categ_id UUID REFERENCES product_category(id),
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
    usage TEXT DEFAULT 'internal', -- internal, customer, supplier, inventory, production
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
    location_id UUID REFERENCES inventory_location(id), -- Source
    location_dest_id UUID REFERENCES inventory_location(id), -- Dest
    product_uom_qty NUMERIC(15, 2) DEFAULT 0.0,
    state TEXT DEFAULT 'draft', -- draft, confirmed, assigned, done
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CRM
CREATE TABLE IF NOT EXISTS crm_lead (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email_from TEXT,
    phone TEXT,
    probability NUMERIC(5, 2) DEFAULT 0.0,
    stage_id TEXT DEFAULT 'new',
    type TEXT DEFAULT 'lead', -- lead, opportunity
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SALES
CREATE TABLE IF NOT EXISTS sale_order (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    partner_id UUID REFERENCES contacts(id),
    date_order TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    state TEXT DEFAULT 'draft', -- draft, sent, sale, done, cancel
    amount_total NUMERIC(15, 2) DEFAULT 0.0
);

CREATE TABLE IF NOT EXISTS sale_order_line (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES sale_order(id) ON DELETE CASCADE,
    product_id UUID REFERENCES product_product(id),
    product_uom_qty NUMERIC(15, 2) DEFAULT 1.0,
    price_unit NUMERIC(15, 2) DEFAULT 0.0,
    price_subtotal NUMERIC(15, 2) DEFAULT 0.0
);

-- 5. PURCHASE
CREATE TABLE IF NOT EXISTS purchase_order (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    partner_id UUID REFERENCES contacts(id),
    date_order TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    state TEXT DEFAULT 'draft', -- draft, sent, purchase, done, cancel
    amount_total NUMERIC(15, 2) DEFAULT 0.0
);

CREATE TABLE IF NOT EXISTS purchase_order_line (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES purchase_order(id) ON DELETE CASCADE,
    product_id UUID REFERENCES product_product(id),
    product_qty NUMERIC(15, 2) DEFAULT 1.0,
    price_unit NUMERIC(15, 2) DEFAULT 0.0,
    price_subtotal NUMERIC(15, 2) DEFAULT 0.0
);

-- 6. ACCOUNTING
CREATE TABLE IF NOT EXISTS account_account (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL -- receivable, payable, liquidity, etc.
);

CREATE TABLE IF NOT EXISTS account_journal (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- sale, purchase, cash, bank, general
    code TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS account_move (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    journal_id UUID REFERENCES account_journal(id),
    state TEXT DEFAULT 'draft', -- draft, posted
    move_type TEXT DEFAULT 'entry', -- entry, out_invoice, in_invoice, etc.
    partner_id UUID REFERENCES contacts(id),
    amount_total NUMERIC(15, 2) DEFAULT 0.0
);

CREATE TABLE IF NOT EXISTS account_move_line (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    move_id UUID REFERENCES account_move(id) ON DELETE CASCADE,
    account_id UUID REFERENCES account_account(id),
    name TEXT,
    debit NUMERIC(15, 2) DEFAULT 0.0,
    credit NUMERIC(15, 2) DEFAULT 0.0
);

-- 7. HR
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
    mobile_phone TEXT
);

-- 8. MANUFACTURING (MRP)
CREATE TABLE IF NOT EXISTS mrp_bom (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES product_product(id),
    code TEXT,
    product_qty NUMERIC(15, 2) DEFAULT 1.0
);

CREATE TABLE IF NOT EXISTS mrp_production (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    product_id UUID REFERENCES product_product(id),
    product_qty NUMERIC(15, 2) DEFAULT 1.0,
    state TEXT DEFAULT 'draft', -- draft, confirmed, progress, to_close, done
    bom_id UUID REFERENCES mrp_bom(id)
);

-- 9. HELPDESK
CREATE TABLE IF NOT EXISTS helpdesk_ticket (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    partner_id UUID REFERENCES contacts(id),
    stage_id TEXT DEFAULT 'new',
    priority TEXT DEFAULT '0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS helpdesk_message (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES helpdesk_ticket(id),
    body TEXT NOT NULL,
    author_id UUID REFERENCES contacts(id), -- or user
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. PAYROLL
CREATE TABLE IF NOT EXISTS payroll_salary_structure (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    basic_wage NUMERIC(15, 2) DEFAULT 0.0
);

CREATE TABLE IF NOT EXISTS payroll_payslip (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES hr_employee(id),
    date_from DATE,
    date_to DATE,
    struct_id UUID REFERENCES payroll_salary_structure(id),
    net_wage NUMERIC(15, 2) DEFAULT 0.0,
    state TEXT DEFAULT 'draft'
);

-- 11. WEBSITE / ECOMMERCE
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
    state TEXT DEFAULT 'cart'
);

-- 12. DOCUMENTS
CREATE TABLE IF NOT EXISTS documents_document (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT DEFAULT 'file', -- file, folder
    folder_id UUID REFERENCES documents_document(id),
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. DISCUSS
CREATE TABLE IF NOT EXISTS mail_channel (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    channel_type TEXT DEFAULT 'channel' -- channel, group, chat
);

CREATE TABLE IF NOT EXISTS mail_message (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID REFERENCES mail_channel(id),
    body TEXT NOT NULL,
    author_id UUID REFERENCES contacts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. POS
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
    state TEXT DEFAULT 'opening_control',
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
    order_id UUID REFERENCES pos_order(id),
    amount NUMERIC(15, 2) DEFAULT 0.0,
    payment_method TEXT DEFAULT 'cash',
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. RECRUITMENT
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. ATTENDANCE
CREATE TABLE IF NOT EXISTS hr_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES hr_employee(id) NOT NULL,
    check_in TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    check_out TIMESTAMP WITH TIME ZONE,
    worked_hours NUMERIC(5, 2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ENABLE RLS FOR ALL TABLES
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_category ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_product ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_warehouse ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_location ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_quant ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_move ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_lead ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_order_line ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_line ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_account ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_move ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_move_line ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_department ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_employee ENABLE ROW LEVEL SECURITY;
ALTER TABLE mrp_bom ENABLE ROW LEVEL SECURITY;
ALTER TABLE mrp_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE helpdesk_ticket ENABLE ROW LEVEL SECURITY;
ALTER TABLE helpdesk_message ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_salary_structure ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_payslip ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_product ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents_document ENABLE ROW LEVEL SECURITY;
ALTER TABLE mail_channel ENABLE ROW LEVEL SECURITY;
ALTER TABLE mail_message ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_order_line ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_payment ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_job ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_applicant ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_attendance ENABLE ROW LEVEL SECURITY;

-- CREATE OPEN POLICIES (FOR DEV)
CREATE POLICY "Public Access" ON contacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON product_category FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON product_product FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON inventory_warehouse FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON inventory_location FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON inventory_quant FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON inventory_move FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON crm_lead FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON sale_order FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON sale_order_line FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON purchase_order FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON purchase_order_line FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON account_account FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON account_journal FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON account_move FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON account_move_line FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON hr_department FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON hr_employee FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON mrp_bom FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON mrp_production FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON helpdesk_ticket FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON helpdesk_message FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON payroll_salary_structure FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON payroll_payslip FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON website_product FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON website_order FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON documents_document FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON mail_channel FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON mail_message FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON pos_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON pos_session FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON pos_order FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON pos_order_line FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON pos_payment FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON hr_job FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON hr_applicant FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON hr_attendance FOR ALL USING (true) WITH CHECK (true);
