-- =============================================================
-- SaaS RLS PATCH: WORKSPACE-AWARE ISOLATION
-- This patch ensures that all users in the same workspace can see each other's data.
-- =============================================================

-- 1. Helper function (re-defined just in case)
CREATE OR REPLACE FUNCTION public.get_my_workspaces()
RETURNS TABLE (workspace_id UUID) AS $$
  SELECT workspace_id FROM public.user_workspaces WHERE user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 2. Update Core Policies to use "IN (SELECT get_my_workspaces())"
-- We will loop through the core tables and update their "Tenant Isolation" policies.

DO $$ 
DECLARE
    t TEXT;
    core_tables TEXT[] := ARRAY[
        'contacts', 'product_product', 'product_category', 
        'inventory_warehouse', 'inventory_location', 'inventory_quant', 'inventory_move',
        'crm_lead', 'sale_order', 'sale_order_line', 'purchase_order', 'purchase_order_line',
        'account_account', 'account_journal', 'account_move', 'account_move_line',
        'hr_department', 'hr_employee', 'mrp_bom', 'mrp_bom_line', 'mrp_production',
        'helpdesk_ticket', 'helpdesk_message', 'payroll_salary_structure', 'payroll_payslip', 'payroll_run'
    ];
BEGIN
    FOREACH t IN ARRAY core_tables LOOP
        -- Drop old user-only policy
        EXECUTE format('DROP POLICY IF EXISTS "Tenant Isolation" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Team Workspace Access" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Strict SaaS Access" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "SaaS Workspace Access" ON %I', t);
        
        -- Create new workspace-aware policy
        EXECUTE format('CREATE POLICY "SaaS Workspace Access" ON %I FOR ALL USING (tenant_id IN (SELECT get_my_workspaces()))', t);
        
        -- Ensure RLS is enabled
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    END LOOP;
END $$;

-- 3. Special case for Workspaces and UserWorkspaces
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "View my workspaces" ON public.workspaces;
CREATE POLICY "View my workspaces" ON public.workspaces FOR SELECT USING (id IN (SELECT get_my_workspaces()));

ALTER TABLE public.user_workspaces ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "View my mappings" ON public.user_workspaces;
CREATE POLICY "View my mappings" ON public.user_workspaces FOR SELECT USING (
  user_id = auth.uid() OR 
  workspace_id IN (SELECT get_my_workspaces())
);
