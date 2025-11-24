-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Leads Table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company_name TEXT,
    status TEXT DEFAULT 'New', -- New, Contacted, Qualified, Lost
    source TEXT,
    notes TEXT,
    probability FLOAT DEFAULT 0.0, -- AI Score
    sentiment_score FLOAT DEFAULT 0.0 -- AI Sentiment
);

-- Opportunities Table
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    lead_id UUID REFERENCES leads(id),
    name TEXT NOT NULL,
    expected_revenue NUMERIC(15, 2),
    stage TEXT DEFAULT 'New', -- New, Qualified, Proposition, Won
    close_date DATE,
    win_probability FLOAT DEFAULT 0.0 -- AI Score
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    description TEXT,
    list_price NUMERIC(15, 2) DEFAULT 0.0,
    cost_price NUMERIC(15, 2) DEFAULT 0.0,
    category TEXT,
    sku TEXT,
    quantity_on_hand INTEGER DEFAULT 0,
    image_url TEXT
);

-- Sales Orders Table
CREATE TABLE IF NOT EXISTS sales_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL, -- e.g., SO001
    customer_name TEXT NOT NULL,
    date_order TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    state TEXT DEFAULT 'draft', -- draft, sent, sale, done, cancel
    amount_total NUMERIC(15, 2) DEFAULT 0.0,
    user_id UUID -- Reference to user (if we had a users table)
);

-- Sales Order Lines Table
CREATE TABLE IF NOT EXISTS sales_order_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES sales_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    name TEXT NOT NULL, -- Description
    product_uom_qty NUMERIC(15, 2) DEFAULT 1.0,
    price_unit NUMERIC(15, 2) DEFAULT 0.0,
    price_subtotal NUMERIC(15, 2) DEFAULT 0.0
);

-- Enable Row Level Security (RLS)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_order_lines ENABLE ROW LEVEL SECURITY;

-- Create Policies (Public access for demo purposes, restrict in production)
CREATE POLICY "Enable read access for all users" ON leads FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON leads FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON opportunities FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON opportunities FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON opportunities FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON products FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON products FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON sales_orders FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON sales_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON sales_orders FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON sales_order_lines FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON sales_order_lines FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON sales_order_lines FOR UPDATE USING (true);
