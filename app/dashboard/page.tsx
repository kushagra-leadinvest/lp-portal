import { createClient } from "@/lib/supabase/server";

function formatL(cr: number) {
  const l = cr * 100;
  return `₹${l % 1 === 0 ? l.toFixed(0) : l.toFixed(1)}L`;
}

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: investor } = await supabase
    .from("investors")
    .select("*")
    .eq("email", user?.email ?? "")
    .single();

  const { data: commitments } = await supabase
    .from("commitments")
    .select(
      `committed_amount_cr, deployed_amount_cr, investment_schemes ( company_name, sector, investment_date, post_money_valuation_cr, status )`
    )
    .eq("investor_id", investor?.id ?? "");

  const totalDeployed =
    commitments?.reduce((sum, c) => sum + (c.deployed_amount_cr ?? 0), 0) ?? 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back, {investor?.full_name ?? user?.email}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Committed", value: investor ? formatL(investor.committed_amount_cr) : "—" },
          { label: "Total Drawn", value: investor ? formatL(investor.drawn_amount_cr) : "—" },
          { label:
