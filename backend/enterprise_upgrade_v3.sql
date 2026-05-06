-- ============================================================
-- Galaxy ERP - Enterprise Upgrade V3 (Accounting)
-- Adding Payments and Reconciliation for Odoo-parity
-- ============================================================

CREATE TABLE IF NOT EXISTS account_payment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL DEFAULT 'PAY/New',
    date DATE DEFAULT CURRENT_DATE,
    amount NUMERIC(15, 2) NOT NULL,
    payment_type TEXT NOT NULL, -- inbound, outbound
    partner_id UUID REFERENCES contacts(id),
    journal_id UUID REFERENCES account_journal(id),
    state TEXT DEFAULT 'draft', -- draft, posted, cancel
    ref TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-name payments
CREATE OR REPLACE FUNCTION auto_name_account_payment()
RETURNS TRIGGER AS $$
DECLARE
    seq_val INTEGER;
BEGIN
    IF NEW.name = 'PAY/New' OR NEW.name IS NULL THEN
        SELECT COUNT(*) + 1 INTO seq_val FROM account_payment;
        NEW.name := 'PAY/' || TO_CHAR(CURRENT_DATE, 'YYYY') || '/' || LPAD(seq_val::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_name_account_payment ON account_payment;
CREATE TRIGGER trg_auto_name_account_payment
    BEFORE INSERT ON account_payment
    FOR EACH ROW EXECUTE FUNCTION auto_name_account_payment();

-- Link invoices to payments (Reconciliation)
CREATE TABLE IF NOT EXISTS account_payment_invoice_rel (
    payment_id UUID REFERENCES account_payment(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES account_move(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2),
    PRIMARY KEY (payment_id, invoice_id)
);

-- Update account_move with payment_state
ALTER TABLE account_move ADD COLUMN IF NOT EXISTS payment_state TEXT DEFAULT 'not_paid';
ALTER TABLE account_move ADD COLUMN IF NOT EXISTS amount_residual NUMERIC(15, 2) DEFAULT 0.0;
