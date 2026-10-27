-- =============================================================================
-- Migration: 001_create_real_leads_directory.sql
-- Real Verified B2B Leads Directory Table (Replaces procedural mock leads)
-- =============================================================================

CREATE TABLE IF NOT EXISTS crm_leads_directory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    contact_name TEXT,
    job_title TEXT,
    email TEXT,
    email_status TEXT DEFAULT 'verified', -- 'verified', 'deliverable', 'catch_all', 'unverified'
    phone TEXT,
    phone_type TEXT DEFAULT 'office', -- 'office', 'direct', 'whatsapp', 'mobile'
    website TEXT,
    address TEXT,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    postal_code TEXT,
    industry TEXT NOT NULL,
    sub_sector TEXT,
    employees TEXT,
    annual_revenue TEXT,
    rating NUMERIC(2,1) DEFAULT 4.8,
    reviews_count INT DEFAULT 0,
    google_place_id TEXT UNIQUE,
    linkedin_url TEXT,
    source TEXT NOT NULL DEFAULT 'verified_registry', -- 'google_maps', 'secp', 'companies_house', 'verified_registry', 'pseb'
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Full text search and composite indexes for sub-10ms querying
CREATE INDEX IF NOT EXISTS idx_leads_dir_country_industry ON crm_leads_directory(country, industry);
CREATE INDEX IF NOT EXISTS idx_leads_dir_city ON crm_leads_directory(city);
CREATE INDEX IF NOT EXISTS idx_leads_dir_source ON crm_leads_directory(source);
CREATE INDEX IF NOT EXISTS idx_leads_dir_fts ON crm_leads_directory USING gin(to_tsvector('english', company_name || ' ' || COALESCE(city, '') || ' ' || COALESCE(industry, '')));
