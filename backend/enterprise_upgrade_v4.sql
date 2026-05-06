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
