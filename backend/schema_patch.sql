-- =============================================================
-- SCHEMA PATCH: Missing tables not in full_schema.sql
-- Apply this in Supabase SQL Editor
-- =============================================================

-- 1. PAYROLL RUN (referenced in payroll.py but missing from schema)
CREATE TABLE IF NOT EXISTS payroll_run (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    run_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    state TEXT DEFAULT 'draft', -- draft, confirmed, done
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. MRP BOM LINES (referenced in mrp.py but missing from schema)
CREATE TABLE IF NOT EXISTS mrp_bom_line (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bom_id UUID REFERENCES mrp_bom(id) ON DELETE CASCADE,
    product_id UUID REFERENCES product_product(id),
    product_qty NUMERIC(15, 2) DEFAULT 1.0
);

-- 3. WEBSITE ORDER LINES (referenced in website.py but missing from schema)
CREATE TABLE IF NOT EXISTS website_order_line (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES website_order(id) ON DELETE CASCADE,
    product_id UUID REFERENCES product_product(id),
    quantity NUMERIC(15, 2) DEFAULT 1.0,
    price_unit NUMERIC(15, 2) DEFAULT 0.0,
    price_subtotal NUMERIC(15, 2) DEFAULT 0.0
);

-- 4. Add missing columns to crm_lead for opportunity fields
ALTER TABLE crm_lead ADD COLUMN IF NOT EXISTS expected_revenue NUMERIC(15, 2) DEFAULT 0.0;
ALTER TABLE crm_lead ADD COLUMN IF NOT EXISTS close_date DATE;
ALTER TABLE crm_lead ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;
ALTER TABLE crm_lead ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE crm_lead ADD COLUMN IF NOT EXISTS lead_id UUID;
ALTER TABLE crm_lead ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE crm_lead ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE crm_lead ADD COLUMN IF NOT EXISTS sentiment_score NUMERIC(5, 2) DEFAULT 0.0;

-- 5. Add missing columns to product_product for frontend use
ALTER TABLE product_product ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE product_product ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 6. Add missing columns to sale_order
ALTER TABLE sale_order ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE sale_order ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 7. Add missing columns to purchase_order
ALTER TABLE purchase_order ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Enable RLS
ALTER TABLE payroll_run ENABLE ROW LEVEL SECURITY;
ALTER TABLE mrp_bom_line ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_order_line ENABLE ROW LEVEL SECURITY;

-- Open policies for dev
CREATE POLICY "Public Access" ON payroll_run FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON mrp_bom_line FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON website_order_line FOR ALL USING (true) WITH CHECK (true);
