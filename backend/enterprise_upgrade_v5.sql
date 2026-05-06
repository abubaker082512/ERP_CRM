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
