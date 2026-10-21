// ─── lib/queries.ts ───────────────────────────────────────────────────────────
import { createClient } from "@/lib/supabase/server";

// ─── Shared: resolve investor_id from auth session ────────────────────────────

async function resolveInvestorId(): Promise<{ supabase: ReturnType<typeof createClient>; investorId: string } | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: investor } = await supabase
    .from("investors")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (!investor) return null;
  return { supabase, investorId: investor.id };
}

// ─── Helper: extract id from a Supabase joined scheme (always returns array) ──

function schemeId(schemes: unknown): string {
  return (schemes as Array<{ id: string }> | null)?.[0]?.id ?? "";
}

// ─── Investor profile ─────────────────────────────────────────────────────────

export async function getInvestorProfile() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("investors")
    .select("id, full_name, email, phone")
    .eq("auth_user_id", user.id)
    .single();

  return data ?? null;
}

// ─── Portfolio overview — dashboard/page.tsx ──────────────────────────────────

export async function getPortfolioData() {
  const ctx = await resolveInvestorId();
  if (!ctx) return null;
  const { supabase, investorId } = ctx;

  const [investmentsRes, cashFlowsRes, capitalCallsRes, recentUpdatesRes] = await Promise.all([
    supabase
      .from("investments")
      .select(`
        id, committed, deployed, current_value, moic, ownership_pct, entry_valuation,
        schemes ( id, name, sector, stage, entry_date )
      `)
      .eq("investor_id", investorId),

    supabase
      .from("cash_flows")
      .select("id, scheme_id, direction, amount, date")
      .eq("investor_id", investorId),

    supabase
      .from("capital_calls")
      .select(`
        id, amount, due_date, status,
        schemes ( id, name )
      `)
      .eq("investor_id", investorId)
      .eq("status", "upcoming")
      .order("due_date", { ascending: true }),

    supabase
      .from("updates")
      .select("id, scheme_ids, title, content, quarter, published_at")
      .order("published_at", { ascending: false })
      .limit(5),
  ]);

  // Build per-scheme distribution totals from cash_flows
  const distributionByScheme: Record<string, number> = {};
  for (const cf of cashFlowsRes.data ?? []) {
    if (cf.direction === "distribution") {
      distributionByScheme[cf.scheme_id] = (distributionByScheme[cf.scheme_id] ?? 0) + Number(cf.amount);
    }
  }

  // Attach distributions to each investment row
  const investments = (investmentsRes.data ?? []).map((inv) => ({
    ...inv,
    distributions: distributionByScheme[schemeId(inv.schemes)] ?? 0,
  }));

  return {
    investments,
    capitalCalls: capitalCallsRes.data ?? [],
    recentUpdates: recentUpdatesRes.data ?? [],
  };
}

// ─── Cash flows page — dashboard/cash-flows/page.tsx ─────────────────────────

export async function getCashFlowData() {
  const ctx = await resolveInvestorId();
  if (!ctx) return null;
  const { supabase, investorId } = ctx;

  const [cashFlowsRes, capitalCallsRes] = await Promise.all([
    supabase
      .from("cash_flows")
      .select(`
        id, direction, amount, date, notes,
        schemes ( id, name )
      `)
      .eq("investor_id", investorId)
      .order("date", { ascending: true }),

    supabase
      .from("capital_calls")
      .select(`
        id, amount, due_date,
        schemes ( id, name )
      `)
      .eq("investor_id", investorId)
      .eq("status", "upcoming")
      .order("due_date", { ascending: true }),
  ]);

  return {
    cashFlows: cashFlowsRes.data ?? [],
    capitalCalls: capitalCallsRes.data ?? [],
  };
}

// ─── Documents page — dashboard/documents/page.tsx ───────────────────────────

export async function getDocuments() {
  const ctx = await resolveInvestorId();
  if (!ctx) return null;
  const { supabase, investorId } = ctx;

  const { data } = await supabase
    .from("documents")
    .select(`
      id, name, type, storage_path, created_at,
      schemes ( id, name )
    `)
    .eq("investor_id", investorId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

// ─── Updates page — dashboard/updates/page.tsx ───────────────────────────────

export async function getUpdates() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [updatesRes, schemesRes] = await Promise.all([
    supabase
      .from("updates")
      .select("id, scheme_ids, title, content, quarter, published_at")
      .order("published_at", { ascending: false }),

    supabase
      .from("schemes")
      .select("id, name"),
  ]);

  return {
    updates: updatesRes.data ?? [],
    schemes: schemesRes.data ?? [],
  };
}

// ─── Capital account statement — dashboard/capital-account/page.tsx ───────────

export async function getCapitalAccountData() {
  const ctx = await resolveInvestorId();
  if (!ctx) return null;
  const { supabase, investorId } = ctx;

  const supabaseRaw = createClient();
  const { data: { user } } = await supabaseRaw.auth.getUser();
  if (!user) return null;

  const { data: investor } = await supabase
    .from("investors")
    .select("id, full_name, email, phone")
    .eq("auth_user_id", user.id)
    .single();
  if (!investor) return null;

  const [investmentsRes, cashFlowsRes] = await Promise.all([
    supabase
      .from("investments")
      .select(`
        id, committed, deployed, current_value, moic,
        schemes ( id, name, sector )
      `)
      .eq("investor_id", investorId),

    supabase
      .from("cash_flows")
      .select(`
        id, direction, amount, date, notes,
        schemes ( id, name )
      `)
      .eq("investor_id", investorId)
      .order("date", { ascending: true }),
  ]);

  // Compute per-scheme distributions from cash_flows
  const distributionByScheme: Record<string, number> = {};
  for (const cf of cashFlowsRes.data ?? []) {
    if (cf.direction === "distribution") {
      const sid = schemeId(cf.schemes);
      distributionByScheme[sid] = (distributionByScheme[sid] ?? 0) + Number(cf.amount);
    }
  }

  const investments = (investmentsRes.data ?? []).map((inv) => ({
    ...inv,
    distributions: distributionByScheme[schemeId(inv.schemes)] ?? 0,
  }));

  return {
    investor,
    investments,
    cashFlows: cashFlowsRes.data ?? [],
  };
}

// ─── Portfolio detail — dashboard/portfolio/[id]/page.tsx ────────────────────

export async function getInvestmentDetail(schemeId: string) {
  const ctx = await resolveInvestorId();
  if (!ctx) return null;
  const { supabase, investorId } = ctx;

  const [investmentRes, schemeRes, cashFlowsRes, updatesRes] = await Promise.all([
    supabase
      .from("investments")
      .select(`
        id, committed, deployed, current_value, moic, ownership_pct, entry_valuation,
        schemes ( id, name, sector, stage, entry_date )
      `)
      .eq("investor_id", investorId)
      .eq("scheme_id", schemeId)
      .single(),

    supabase
      .from("schemes")
      .select("id, name, sector, stage, entry_date, status")
      .eq("id", schemeId)
      .single(),

    supabase
      .from("cash_flows")
      .select("id, direction, amount, date, notes")
      .eq("investor_id", investorId)
      .eq("scheme_id", schemeId)
      .order("date", { ascending: false }),

    supabase
      .from("updates")
      .select("id, title, content, quarter, published_at")
      .contains("scheme_ids", [schemeId])
      .order("published_at", { ascending: false }),
  ]);

  if (!investmentRes.data) return null;

  const cashFlows = cashFlowsRes.data ?? [];
  const distributions = cashFlows
    .filter((cf) => cf.direction === "distribution")
    .reduce((sum, cf) => sum + Number(cf.amount), 0);

  return {
    investment: investmentRes.data,
    scheme: schemeRes.data,
    cashFlows,
    distributions,
    updates: updatesRes.data ?? [],
  };
}
