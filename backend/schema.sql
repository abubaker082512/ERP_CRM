-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    type TEXT DEFAULT 'customer' -- customer, supplier
);

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
    contact_id UUID REFERENCES contacts(id), -- Linked to Contact
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

-- INVENTORY MODULE TABLES

-- Warehouses
CREATE TABLE IF NOT EXISTS warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT NOT NULL
);

-- Locations
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- e.g., WH/Stock
    usage TEXT DEFAULT 'internal', -- internal, customer, supplier, inventory, production
    warehouse_id UUID REFERENCES warehouses(id)
);

-- Stock Moves
CREATE TABLE IF NOT EXISTS stock_moves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL, -- e.g., WH/IN/0001
    product_id UUID REFERENCES products(id),
    quantity NUMERIC(15, 2) DEFAULT 0.0,
    location_id UUID REFERENCES locations(id), -- Source Location
    location_dest_id UUID REFERENCES locations(id), -- Destination Location
    state TEXT DEFAULT 'draft', -- draft, confirmed, assigned, done, cancel
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock Quant (Current Stock)
CREATE TABLE IF NOT EXISTS stock_quant (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    location_id UUID REFERENCES locations(id),
    quantity NUMERIC(15, 2) DEFAULT 0.0,
    UNIQUE(product_id, location_id)
);

-- PURCHASE MODULE TABLES

-- Purchase Orders Table
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL, -- e.g., PO001
    partner_id UUID REFERENCES contacts(id), -- Supplier
    date_order TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    state TEXT DEFAULT 'draft', -- draft, sent, purchase, done, cancel
    amount_total NUMERIC(15, 2) DEFAULT 0.0,
    user_id UUID
);

-- Purchase Order Lines Table
CREATE TABLE IF NOT EXISTS purchase_order_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    name TEXT NOT NULL, -- Description
    product_qty NUMERIC(15, 2) DEFAULT 1.0,
    price_unit NUMERIC(15, 2) DEFAULT 0.0,
    price_subtotal NUMERIC(15, 2) DEFAULT 0.0
);

-- Enable Row Level Security (RLS)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_order_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_quant ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_lines ENABLE ROW LEVEL SECURITY;

-- Create Policies (Public access for demo purposes, restrict in production)
CREATE POLICY "Enable read access for all users" ON contacts FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON contacts FOR UPDATE USING (true);

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

CREATE POLICY "Enable read access for all users" ON warehouses FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON warehouses FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON warehouses FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON locations FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON locations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON locations FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON stock_moves FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON stock_moves FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON stock_moves FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON stock_quant FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON stock_quant FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON stock_quant FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON purchase_orders FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON purchase_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON purchase_orders FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON purchase_order_lines FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON purchase_order_lines FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON purchase_order_lines FOR UPDATE USING (true);
