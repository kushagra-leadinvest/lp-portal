-- ============================================================
-- LP Portal — Phase 2 Schema
-- ============================================================

-- Drop any old tables from previous attempts
DROP TABLE IF EXISTS public.audit_log CASCADE;
DROP TABLE IF EXISTS public.updates CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.capital_calls CASCADE;
DROP TABLE IF EXISTS public.cash_flows CASCADE;
DROP TABLE IF EXISTS public.investments CASCADE;
DROP TABLE IF EXISTS public.schemes CASCADE;
DROP TABLE IF EXISTS public.admin_roles CASCADE;
DROP TABLE IF EXISTS public.investors CASCADE;
DROP TABLE IF EXISTS public.investment_schemes CASCADE;
DROP TABLE IF EXISTS public.investment_values CASCADE;

-- ============================================================
-- ADMIN ROLES (created first — other policies reference it)
-- ============================================================
CREATE TABLE public.admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text DEFAULT 'view_only' CHECK (role IN ('edit_data', 'publish_updates', 'view_only')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin reads own role"
  ON public.admin_roles FOR SELECT
  USING (auth_user_id = auth.uid());

-- ============================================================
-- INVESTORS
-- ============================================================
CREATE TABLE public.investors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.investors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "LP reads own investor row"
  ON public.investors FOR SELECT
  USING (auth_user_id = auth.uid());
CREATE POLICY "Admin reads all investors"
  ON public.investors FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.admin_roles WHERE auth_user_id = auth.uid()));
CREATE POLICY "Admin writes investors"
  ON public.investors FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admin_roles WHERE auth_user_id = auth.uid()));

-- ============================================================
-- SCHEMES (portfolio companies)
-- ============================================================
CREATE TABLE public.schemes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sector text,
  stage text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'exited', 'written_off')),
  entry_date date,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users read schemes"
  ON public.schemes FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin writes schemes"
  ON public.schemes FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admin_roles WHERE auth_user_id = auth.uid()));

-- ============================================================
-- INVESTMENTS (per-LP holding per scheme)
-- ============================================================
CREATE TABLE public.investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid NOT NULL REFERENCES public.investors(id) ON DELETE CASCADE,
  scheme_id uuid NOT NULL REFERENCES public.schemes(id) ON DELETE CASCADE,
  committed numeric,
  deployed numeric,
  current_value numeric,
  moic numeric,
  ownership_pct numeric,
  entry_valuation numeric,
  created_at timestamptz DEFAULT now(),
  UNIQUE(investor_id, scheme_id)
);
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "LP reads own investments"
  ON public.investments FOR SELECT
  USING (investor_id = (SELECT id FROM public.investors WHERE auth_user_id = auth.uid()));
CREATE POLICY "Admin reads all investments"
  ON public.investments FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.admin_roles WHERE auth_user_id = auth.uid()));
CREATE POLICY "Admin writes investments"
  ON public.investments FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admin_roles WHERE auth_user_id = auth.uid()));

-- ============================================================
-- CASH FLOWS
-- ============================================================
CREATE TABLE public.cash_flows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid NOT NULL REFERENCES public.investors(id) ON DELETE CASCADE,
  scheme_id uuid REFERENCES public.schemes(id) ON DELETE SET NULL,
  direction text NOT NULL CHECK (direction IN ('call', 'distribution')),
  amount numeric NOT NULL,
  date date NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.cash_flows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "LP reads own cash flows"
  ON public.cash_flows FOR SELECT
  USING (investor_id = (SELECT id FROM public.investors WHERE auth_user_id = auth.uid()));
CREATE POLICY "Admin reads all cash flows"
  ON public.cash_flows FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.admin_roles WHERE auth_user_id = auth.uid()));
CREATE POLICY "Admin writes cash flows"
  ON public.cash_flows FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admin_roles WHERE auth_user_id = auth.uid()));

-- ============================================================
-- CAPITAL CALLS
-- ============================================================
CREATE TABLE public.capital_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid NOT NULL REFERENCES public.investors(id) ON DELETE CASCADE,
  scheme_id uuid REFERENCES public.schemes(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  due_date date NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.capital_calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "LP reads own capital calls"
  ON public.capital_calls FOR SELECT
  USING (investor_id = (SELECT id FROM public.investors WHERE auth_user_id = auth.uid()));
CREATE POLICY "Admin reads all capital calls"
  ON public.capital_calls FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.admin_roles WHERE auth_user_id = auth.uid()));
CREATE POLICY "Admin writes capital calls"
  ON public.capital_calls FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admin_roles WHERE auth_user_id = auth.uid()));

-- ============================================================
-- DOCUMENTS
-- ============================================================
CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid NOT NULL REFERENCES public.investors(id) ON DELETE CASCADE,
  scheme_id uuid REFERENCES public.schemes(id) ON DELETE SET NULL,
  name text NOT NULL,
  storage_path text NOT NULL,
  type text DEFAULT 'other' CHECK (type IN ('quarterly_report', 'capital_account', 'tax', 'other')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "LP reads own documents"
  ON public.documents FOR SELECT
  USING (investor_id = (SELECT id FROM public.investors WHERE auth_user_id = auth.uid()));
CREATE POLICY "Admin reads all documents"
  ON public.documents FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.admin_roles WHERE auth_user_id = auth.uid()));
CREATE POLICY "Admin writes documents"
  ON public.documents FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admin_roles WHERE auth_user_id = auth.uid()));

-- ============================================================
-- UPDATES (published per scheme, LP sees only their schemes)
-- ============================================================
CREATE TABLE public.updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_ids uuid[] NOT NULL,
  title text NOT NULL,
  content text,
  quarter text,
  published_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "LP reads updates for their schemes"
  ON public.updates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.investments i
      JOIN public.investors inv ON inv.id = i.investor_id
      WHERE inv.auth_user_id = auth.uid()
      AND i.scheme_id = ANY(scheme_ids)
    )
  );
CREATE POLICY "Admin reads all updates"
  ON public.updates FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.admin_roles WHERE auth_user_id = auth.uid()));
CREATE POLICY "Admin writes updates"
  ON public.updates FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admin_roles WHERE auth_user_id = auth.uid()));

-- ============================================================
-- AUDIT LOG (append-only, no UPDATE/DELETE via API)
-- ============================================================
CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid,
  action text NOT NULL,
  target_table text,
  target_id uuid,
  details jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin reads audit log"
  ON public.audit_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.admin_roles WHERE auth_user_id = auth.uid()));

-- ============================================================
-- is_registered_lp FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_registered_lp(check_email text)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.investors WHERE email = check_email
  );
$$;
-- ============================================================
-- handle_new_auth_user trigger (fixed: was referencing wrong column)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.investors
  SET auth_user_id = NEW.id
  WHERE email = NEW.email
    AND auth_user_id IS NULL;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ============================================================
-- GRANTs for authenticated and anon roles
-- ============================================================
GRANT USAGE ON SCHEMA public TO authenticated, anon;

GRANT SELECT ON public.investors TO authenticated;
GRANT SELECT ON public.schemes TO authenticated;
GRANT SELECT ON public.investments TO authenticated;
GRANT SELECT ON public.cash_flows TO authenticated;
GRANT SELECT ON public.capital_calls TO authenticated;
GRANT SELECT ON public.documents TO authenticated;
GRANT SELECT ON public.updates TO authenticated;
GRANT SELECT ON public.audit_log TO authenticated;
GRANT SELECT ON public.admin_roles TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.investors TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.schemes TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.investments TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.cash_flows TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.capital_calls TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.updates TO authenticated;

GRANT SELECT ON public.investors TO anon;
GRANT SELECT ON public.schemes TO anon;
GRANT SELECT ON public.investments TO anon;
GRANT SELECT ON public.cash_flows TO anon;
GRANT SELECT ON public.capital_calls TO anon;
GRANT SELECT ON public.documents TO anon;
GRANT SELECT ON public.updates TO anon;
GRANT SELECT ON public.audit_log TO anon;
GRANT SELECT ON public.admin_roles TO anon;
