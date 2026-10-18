import { createClient } from "@/lib/supabase/server";

function formatL(cr: number) {
  const l = cr * 100;
  const rounded = l % 1 === 0 ? l.toFixed(0) : l.toFixed(1);
  return "Rs." + rounded + "L";
}

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: investor } = await supabase
    .from("investors")
    .select("*")
    .eq("email", user?.email ?? "")
    .single();

  const { data: commitments } = await supabase
    .from("commitments")
    .select("committed_amount_cr, deployed_amount_cr, investment_schemes ( company_name, sector, investment_date, post_money_valuation_cr, status )")
    .eq("investor_id", investor?.id ?? "");

  const totalDeployed = commitments?.reduce((sum, c) => sum + (c.deployed_amount_cr ?? 0), 0) ?? 0;

  const cards = [
    { label: "Total Committed", value: investor ? formatL(investor.committed_amount_cr) : "-" },
    { label: "Total Drawn", value: investor ? formatL(investor.drawn_amount_cr) : "-" },
    { label: "Total Deployed", value: investor ? formatL(totalDeployed) : "-" },
    { label: "XIRR", value: "Coming soon" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back, {investor?.full_name ?? user?.email}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{card.label}</p>
            <p className="text-2xl font-semibold text-gray-900 mt-2">{card.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Your Portfolio</h2>
        {commitments && commitments.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <th className="pb-3 font-medium">Company</th>
                <th className="pb-3 font-medium">Sector</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium text-right">Committed</th>
                <th className="pb-3 font-medium text-right">Deployed</th>
                <th className="pb-3 font-medium text-right">Valuation</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {commitments.map((c, i) => {
                const s = Array.isArray(c.investment_schemes) ? c.investment_schemes[0] : c.investment_schemes;
                return (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 font-medium text-gray-900">{s?.company_name}</td>
                    <td className="py-3 text-gray-500">{s?.sector}</td>
                    <td className="py-3 text-gray-500">{s?.investment_date}</td>
                    <td className="py-3 text-right text-gray-900">{formatL(c.committed_amount_cr)}</td>
                    <td className="py-3 text-right text-gray-900">{formatL(c.deployed_amount_cr)}</td>
                    <td className="py-3 text-right text-gray-500">{s?.post_money_valuation_cr ? "Rs." + s.post_money_valuation_cr + "Cr" : "-"}</td>
                    <td className="py-3">
                      <span className={"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium " + (s?.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600")}>
                        {s?.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">No portfolio data found</div>
        )}
      </div>
    </div>
  );
}