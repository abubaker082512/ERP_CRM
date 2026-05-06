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
