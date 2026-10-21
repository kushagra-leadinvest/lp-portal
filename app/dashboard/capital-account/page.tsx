import { redirect } from "next/navigation";
import { getCapitalAccountData } from "@/lib/queries";
import { AS_OF_DATE, FUND_NAME } from "@/lib/constants";
import { inr, short, aggregate, formatDate } from "@/lib/format";
import DownloadButton from "./download-button";

export default async function CapitalAccountPage() {
  const data = await getCapitalAccountData();
  if (!data) redirect("/login");

  const { investor, investments, cashFlows } = data;
  const stats = aggregate(investments);

  const sortedFlows = [...cashFlows].sort((a, b) => a.date.localeCompare(b.date));
  let runningBalance = 0;
  const flowsWithBalance = sortedFlows.map((cf) => {
    const scheme = (cf as unknown as { schemes: { name: string } | null }).schemes;
    if (cf.direction === "call") runningBalance += Number(cf.amount);
    else runningBalance -= Number(cf.amount);
    return { ...cf, schemeName: scheme?.name ?? "—", balance: runningBalance };
  });

  return (
    <div className="min-h-full flex flex-col">
      <div className="px-8 pt-7 pb-6 print:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Capital Account Statement</h1>
            <p className="text-xs text-gray-400 mt-0.5">One-click PDF for your records · As of {AS_OF_DATE}</p>
          </div>
          <DownloadButton />
        </div>
      </div>

      <div className="px-8 pb-12 max-w-3xl mx-auto w-full print:px-0 print:max-w-none print:mx-0">
        <div className="hidden print:block mb-8">
          <div className="flex items-start justify-between border-b-2 border-gray-900 pb-4 mb-6">
            <div>
              <p className="text-2xl font-bold text-gray-900">Lead Invest</p>
              <p className="text-sm text-gray-500 mt-0.5">Capital Account Statement</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">UNAUDITED ESTIMATE</p>
              <p className="text-xs text-gray-400 mt-0.5">As of {AS_OF_DATE}</p>
            </div>
          </div>
        </div>

        <section className="bg-white border border-gray-200 rounded-xl px-6 py-5 mb-5 print:border-gray-300 print:rounded-none">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">LP Name</p>
              <p className="text-sm font-semibold text-gray-900">{investor.full_name}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">Fund</p>
              <p className="text-sm font-semibold text-gray-900">{FUND_NAME}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">Statement date</p>
              <p className="text-sm text-gray-700">{AS_OF_DATE}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">Statement type</p>
              <p className="text-sm text-gray-700">Unaudited estimate</p>
            </div>
          </div>
        </section>

        <section className="mb-5">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Account summary</h2>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden print:rounded-none print:border-gray-300">
            {investments.length === 0 ? (
              <p className="px-4 py-6 text-sm text-gray-400 text-center">
                No investment data yet. Data will appear here once populated by the fund manager.
              </p>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  <StatRow label="Total commitment" value={inr(stats.totalCommitted)} />
                  <StatRow label="Total capital called" value={inr(stats.totalDeployed)} />
                  <StatRow label="Remaining undrawn" value={inr(stats.undrawn)} />
                  <StatRow label="Total distributions" value={inr(stats.totalDistributions)} />
                  <StatRow label="Estimated current value" value={inr(stats.totalCurrentValue)} highlight />
                  <StatRow label="Unrealised gain / (loss)" value={`${stats.totalGain >= 0 ? "+" : ""}${inr(stats.totalGain)}`} />
                  <StatRow label="MOIC" value={`${stats.overallMoic.toFixed(2)}x`} />
                  <StatRow label="DPI" value={`${stats.overallDpi.toFixed(2)}x`} />
                </tbody>
              </table>
            )}
          </div>
        </section>

        {investments.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Holdings</h2>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden print:rounded-none print:border-gray-300">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <Th align="left">Company</Th>
                    <Th>Committed</Th>
                    <Th>Deployed</Th>
                    <Th>Current value</Th>
                    <Th>MOIC</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {investments.map((inv) => {
                    const scheme = (inv as unknown as { schemes: { name: string; sector: string } | null }).schemes;
                    const currentValue = inv.current_value !== null ? Number(inv.current_value) : null;
                    const deployed = Number(inv.deployed);
                    const moic = inv.moic !== null
                      ? Number(inv.moic)
                      : (currentValue !== null && deployed > 0 ? currentValue / deployed : 0);
                    return (
                      <tr key={inv.id}>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-800">{scheme?.name ?? "—"}</p>
                          <p className="text-[11px] text-gray-400">{scheme?.sector ?? ""}</p>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-gray-600">{inr(Number(inv.committed))}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-gray-600">{inr(deployed)}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-gray-700 font-medium">
                          {currentValue !== null
                            ? inr(currentValue)
                            : <span className="text-gray-400 italic font-sans text-[11px]">Valuation pending</span>
                          }
                        </td>
                        <td className="px-4 py-3 text-right text-xs font-semibold text-gray-700">{moic.toFixed(2)}x</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200 bg-gray-50/80 font-semibold">
                    <td className="px-4 py-3 text-xs text-gray-700">Total</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-gray-700">{inr(stats.totalCommitted)}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-gray-700">{inr(stats.totalDeployed)}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-gray-700">{inr(stats.totalCurrentValue)}</td>
                    <td className="px-4 py-3 text-right text-xs font-semibold text-gray-700">{stats.overallMoic.toFixed(2)}x</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        )}

        <section className="mb-5">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Transaction history</h2>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden print:rounded-none print:border-gray-300">
            {flowsWithBalance.length === 0 ? (
              <p className="px-4 py-6 text-sm text-gray-400 text-center">No transactions yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <Th align="left">Date</Th>
                    <Th align="left">Company</Th>
                    <Th align="left">Type</Th>
                    <Th>Amount</Th>
                    <Th>Running balance</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {flowsWithBalance.map((cf) => (
                    <tr key={cf.id}>
                      <td className="px-4 py-2.5 text-xs text-gray-500 font-mono">{formatDate(cf.date)}</td>
                      <td className="px-4 py-2.5 text-xs font-medium text-gray-800">{cf.schemeName}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-500">
                        {cf.direction === "call" ? "Capital call" : "Distribution"}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs text-gray-700">
                        {cf.direction === "distribution" && "+"}
                        {inr(Number(cf.amount))}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs text-gray-600">
                        {inr(cf.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 print:bg-white print:rounded-none print:border-t print:border-gray-300 print:mt-6">
          <p className="text-[11px] text-gray-500 leading-relaxed">
            <strong>Important:</strong> This capital account statement is an unaudited estimate prepared by Lead Invest for informational purposes only. Valuations are as of {AS_OF_DATE} and are based on the most recent information available. Past performance does not guarantee future results. This document does not constitute financial or tax advice. For audited statements, capital account details, or tax documents, contact your fund manager. Fees, carry, and tax treatment are subject to compliance and CA review before real data is published.
          </p>
        </section>
      </div>
    </div>
  );
}

function StatRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <tr className={`border-b border-gray-50 last:border-0 ${highlight ? "bg-[#8B1A1A]/5" : ""}`}>
      <td className="px-4 py-3 text-xs text-gray-600">{label}</td>
      <td className={`px-4 py-3 text-right font-mono text-xs font-medium ${highlight ? "text-[#8B1A1A]" : "text-gray-700"}`}>
        {value}
      </td>
    </tr>
  );
}

function Th({ children, align = "right" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th className={`px-4 py-2.5 text-[11px] font-medium text-gray-500 uppercase tracking-wider ${align === "right" ? "text-right" : "text-left"}`}>
      {children}
    </th>
  );
}
