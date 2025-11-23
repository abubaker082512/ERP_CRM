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
    stage TEXT DEFAULT 'New', -- New, Qualification, Proposition, Negotiation, Won, Lost
    close_date DATE,
    win_probability FLOAT DEFAULT 0.0 -- AI Score
);

-- Enable Row Level Security (RLS)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

-- Create Policies (Public access for demo purposes, restrict in production)
CREATE POLICY "Enable read access for all users" ON leads FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON leads FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON opportunities FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON opportunities FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON opportunities FOR UPDATE USING (true);
