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
