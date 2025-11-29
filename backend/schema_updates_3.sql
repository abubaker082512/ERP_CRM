-- SURVEYS MODULE
CREATE TABLE IF NOT EXISTS survey_survey (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    state TEXT DEFAULT 'draft', -- draft, open, closed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS survey_question (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID REFERENCES survey_survey(id),
    question TEXT NOT NULL,
    type TEXT DEFAULT 'text', -- text, choice, rating
    sequence INTEGER DEFAULT 0
);

-- SIGN MODULE
CREATE TABLE IF NOT EXISTS sign_request (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    file_url TEXT, -- Link to document
    state TEXT DEFAULT 'sent', -- sent, signed, refused
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sign_signer (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES sign_request(id),
    partner_id UUID REFERENCES contacts(id),
    role TEXT DEFAULT 'signer', -- signer, viewer
    state TEXT DEFAULT 'sent' -- sent, signed
);

-- BARCODE MODULE
-- (Mainly frontend driven, but we can store scan logs)
CREATE TABLE IF NOT EXISTS stock_barcode_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barcode TEXT NOT NULL,
    product_id UUID REFERENCES product_product(id),
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES hr_employee(id)
);

-- Enable RLS
ALTER TABLE survey_survey ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_question ENABLE ROW LEVEL SECURITY;
ALTER TABLE sign_request ENABLE ROW LEVEL SECURITY;
ALTER TABLE sign_signer ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_barcode_log ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public Access" ON survey_survey FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON survey_question FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON sign_request FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON sign_signer FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON stock_barcode_log FOR ALL USING (true) WITH CHECK (true);
