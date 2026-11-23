-- BERAXIS Enterprise Upgrade v10: 50+ User Hierarchical Company & Approval Routing
-- Run this migration in Supabase SQL Editor to enable persistent multi-user org trees and approvals.

CREATE TABLE IF NOT EXISTS public.company_roles (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  data_scope TEXT NOT NULL DEFAULT 'own' CHECK (data_scope IN ('own', 'team', 'company')),
  allowed_modules JSONB NOT NULL DEFAULT '["pos"]'::jsonb,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_company_roles_company_id ON public.company_roles(company_id);

CREATE TABLE IF NOT EXISTS public.company_members (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  user_id UUID NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Specialist',
  department TEXT NOT NULL DEFAULT 'Operations',
  title TEXT DEFAULT '',
  reports_to_id TEXT NULL,
  data_scope TEXT NOT NULL DEFAULT 'own' CHECK (data_scope IN ('own', 'team', 'company')),
  allowed_modules JSONB NOT NULL DEFAULT '["pos"]'::jsonb,
  company_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  type TEXT NOT NULL DEFAULT 'full_time',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'away', 'offline', 'invited', 'deactivated')),
  two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  avatar_bg TEXT DEFAULT 'bg-indigo-600',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_company_members_company_id ON public.company_members(company_id);
CREATE INDEX IF NOT EXISTS idx_company_members_reports_to ON public.company_members(reports_to_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_company_members_company_email ON public.company_members(company_id, lower(email));

CREATE TABLE IF NOT EXISTS public.approval_requests (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  requester_id TEXT NOT NULL,
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  approver_id TEXT NULL,
  approver_name TEXT DEFAULT '',
  approver_email TEXT DEFAULT '',
  module TEXT NOT NULL CHECK (module IN ('leave', 'expense', 'purchase', 'sales_discount')),
  reference_id TEXT DEFAULT '',
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  amount NUMERIC(14, 2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewer_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  decided_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_approval_requests_company ON public.approval_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_approver ON public.approval_requests(approver_id, status);
CREATE INDEX IF NOT EXISTS idx_approval_requests_requester ON public.approval_requests(requester_id);

CREATE TABLE IF NOT EXISTS public.company_quotas (
  company_id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL DEFAULT 'custom',
  plan_name TEXT NOT NULL DEFAULT 'Custom Enterprise Plan',
  total_seats INTEGER NOT NULL DEFAULT 50,
  max_companies INTEGER NOT NULL DEFAULT 3,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
