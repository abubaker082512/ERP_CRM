-- POINT OF SALE (POS) MODULE TABLES

-- POS Config (Shop/Restaurant settings)
CREATE TABLE IF NOT EXISTS pos_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    currency_id TEXT DEFAULT 'USD',
    receipt_header TEXT,
    receipt_footer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- POS Session (Cashier shift)
CREATE TABLE IF NOT EXISTS pos_session (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_id UUID REFERENCES pos_config(id),
    user_id UUID REFERENCES hr_employee(id), -- or auth_user
    start_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    stop_at TIMESTAMP WITH TIME ZONE,
    state TEXT DEFAULT 'opening_control', -- opening_control, opened, closing_control, closed
    start_cash NUMERIC(15, 2) DEFAULT 0.0,
    stop_cash NUMERIC(15, 2) DEFAULT 0.0
);

-- POS Order
CREATE TABLE IF NOT EXISTS pos_order (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- Order Ref e.g. 0001-001-0001
    session_id UUID REFERENCES pos_session(id),
    date_order TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    partner_id UUID REFERENCES contacts(id),
    amount_total NUMERIC(15, 2) DEFAULT 0.0,
    amount_tax NUMERIC(15, 2) DEFAULT 0.0,
    amount_paid NUMERIC(15, 2) DEFAULT 0.0,
    amount_return NUMERIC(15, 2) DEFAULT 0.0,
    state TEXT DEFAULT 'draft' -- draft, paid, done, invoiced, cancel
);

-- POS Order Line
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

-- POS Payment
CREATE TABLE IF NOT EXISTS pos_payment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES pos_order(id),
    amount NUMERIC(15, 2) DEFAULT 0.0,
    payment_method TEXT DEFAULT 'cash', -- cash, card, bank
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE pos_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_order_line ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_payment ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for all users" ON pos_config FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON pos_config FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON pos_config FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON pos_session FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON pos_session FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON pos_session FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON pos_order FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON pos_order FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON pos_order FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON pos_order_line FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON pos_order_line FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON pos_order_line FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON pos_payment FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON pos_payment FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON pos_payment FOR UPDATE USING (true);
