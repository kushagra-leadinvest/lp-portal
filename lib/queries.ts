import { SupabaseClient } from "@supabase/supabase-js";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Investor = {
  id: string;
  name: string;
  email: string;
  auth_user_id: string;
};

export type Scheme = {
  id: string;
  name: string;
  sector: string | null;
  stage: string | null;
};

export type Investment = {
  id: string;
  investor_id: string;
  scheme_id: string;
  committed_amount: number;
  deployed_amount: number;
  current_value: number | null;
  moic: number | null;
  ownership_pct: number | null;
  schemes: Scheme;
};

export type CashFlow = {
  id: string;
  investor_id: string;
  scheme_id: string;
  direction: "call" | "distribution";
  amount: number;
  date: string;
  notes: string | null;
  schemes: { name: string };
};

export type CapitalCall = {
  id: string;
  investor_id: string;
  scheme_id: string;
  amount: number;
  due_date: string;
  status: "pending" | "paid" | "cancelled";
  notes: string | null;
  schemes: { name: string };
};

export type Document = {
  id: string;
  investor_id: string;
  filename: string;
  storage_path: string;
  uploaded_at: string;
  document_type: string | null;
};

export type Update = {
  id: string;
  title: string;
  body: string;
  published_at: string;
  scheme_ids: string[];
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getInvestor(
  supabase: SupabaseClient
): Promise<Investor | null> {
  const { data } = await supabase
    .from("investors")
    .select("id, name, email, auth_user_id")
    .single();
  return data ?? null;
}

export async function getInvestments(
  supabase: SupabaseClient
): Promise<Investment[]> {
  const { data } = await supabase
    .from("investments")
    .select(
      "id, investor_id, scheme_id, committed_amount, deployed_amount, current_value, moic, ownership_pct, schemes(id, name, sector, stage)"
    )
    .order("committed_amount", { ascending: false });
    return (data ?? []) as unknown as Investment[];
}

export async function getUpcomingCapitalCalls(
  supabase: SupabaseClient
): Promise<CapitalCall[]> {
  const today = new Date().toISOString().split("T")[0];
  const { data } = await supabase
    .from("capital_calls")
    .select(
      "id, investor_id, scheme_id, amount, due_date, status, notes, schemes(name)"
    )
    .eq("status", "pending")
    .gte("due_date", today)
    .order("due_date", { ascending: true });
  return (data ?? []) as CapitalCall[];
}

export async function getAllCapitalCalls(
  supabase: SupabaseClient
): Promise<CapitalCall[]> {
  const { data } = await supabase
    .from("capital_calls")
    .select(
      "id, investor_id, scheme_id, amount, due_date, status, notes, schemes(name)"
    )
    .order("due_date", { ascending: false });
  return (data ?? []) as CapitalCall[];
}

export async function getCashFlows(
  supabase: SupabaseClient
): Promise<CashFlow[]> {
  const { data } = await supabase
    .from("cash_flows")
    .select(
      "id, investor_id, scheme_id, direction, amount, date, notes, schemes(name)"
    )
    .order("date", { ascending: false });
  return (data ?? []) as CashFlow[];
}

export async function getDocuments(
  supabase: SupabaseClient
): Promise<Document[]> {
  const { data } = await supabase
    .from("documents")
    .select("id, investor_id, filename, storage_path, uploaded_at, document_type")
    .order("uploaded_at", { ascending: false });
  return (data ?? []) as Document[];
}

export async function getRecentUpdates(
  supabase: SupabaseClient,
  limit = 3
): Promise<Update[]> {
  const { data } = await supabase
    .from("updates")
    .select("id, title, body, published_at, scheme_ids")
    .order("published_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as Update[];
}

export async function getAllUpdates(
  supabase: SupabaseClient
): Promise<Update[]> {
  const { data } = await supabase
    .from("updates")
    .select("id, title, body, published_at, scheme_ids")
    .order("published_at", { ascending: false });
  return (data ?? []) as Update[];
}

// ─── Aggregation ──────────────────────────────────────────────────────────────

export type PortfolioStats = {
  totalCommitted: number;
  totalDeployed: number;
  totalCurrentValue: number;
  undrawn: number;
  totalGain: number;
  gainPct: number;
  drawdownPct: number;
  overallMoic: number;
};

export function aggregateInvestments(investments: Investment[]): PortfolioStats {
  const totalCommitted = investments.reduce(
    (sum, i) => sum + (i.committed_amount ?? 0),
    0
  );
  const totalDeployed = investments.reduce(
    (sum, i) => sum + (i.deployed_amount ?? 0),
    0
  );
  // For investments with no valuation yet, use deployed_amount as cost floor
  const totalCurrentValue = investments.reduce(
    (sum, i) => sum + (i.current_value ?? i.deployed_amount ?? 0),
    0
  );
  const undrawn = totalCommitted - totalDeployed;
  const totalGain = totalCurrentValue - totalDeployed;
  const gainPct = totalDeployed > 0 ? (totalGain / totalDeployed) * 100 : 0;
  const drawdownPct =
    totalCommitted > 0 ? (totalDeployed / totalCommitted) * 100 : 0;
  const overallMoic = totalDeployed > 0 ? totalCurrentValue / totalDeployed : 0;

  return {
    totalCommitted,
    totalDeployed,
    totalCurrentValue,
    undrawn,
    totalGain,
    gainPct,
    drawdownPct,
    overallMoic,
  };
}
