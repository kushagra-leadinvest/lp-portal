import { redirect } from "next/navigation";
import { getCashFlowData } from "@/lib/queries";
import { AS_OF_DATE } from "@/lib/constants";
import { inr, short, formatDate, fyQuarter } from "@/lib/format";

type SchemeRef = { id: string; name: string };
type FlowRow = { id: string; direction: string; amount: string | number; date: string; notes: string | null; schemes: SchemeRef[] | null };
type CallRow = { id: string; amount: string | number; due_date: string | null; schemes: SchemeRef[] | null };

function CashFlowChart({ flows }: { flows: FlowRow[] }) {
  type QuarterBucket = { quarter: string; calls: number; distributions: number };
  const buckets: Record<string, QuarterBucket> = {};
  const qKey = (q: string) => {
    const m = q.match(/Q(\d) FY(\d+)/);
    if (!m) return 0;
    return parseInt(m[2]) * 10 + parseInt(m[1]);
  };
  flows.forEach((cf) => {
    const q = fyQuarter(cf.date);
    if (!buckets[q]) buckets[q] = { quarter: q, calls: 0, distributions: 0 };
    if (cf.direction === "call") buckets[q].calls += Number(cf.amount);
    else buckets[q].distributions += Number(cf.amount);
  });
  const sorted = Object.values(buckets).sort((a, b) => qKey(a.quarter) - qKey(b.quarter));
  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <svg className="mb-3 text-gray-200" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
        <p className="text-sm text-gray-400">No cash flow history yet</p>
      </div>
    );
  }
  const W = 520; const H = 160;
  const PAD = { top: 16, right: 20, bottom: 36, left: 60 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const n = sorted.length;
  const maxVal = Math.max(...sorted.map((b) => Math.max(b.calls, b.distributions)), 1);
  const barW = (plotW / n) * 0.35;
  const groupW = plotW / n;
  const barHeight = (val: number) => (val / maxVal) * plotH;
  const barX = (i: number, offset: number) => PAD.left + i * groupW + groupW * 0.1 + offset;
  const barY = (val: number) => PAD.top + plotH - barHeight(val);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 160 }} aria-label="Cash flows by quarter">
      {[0, 0.5, 1].map((frac) => {
        const y = PAD.top + plotH - frac * plotH;
        return (
          <g key={frac}>
            <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#f0f0f0" strokeWidth="1" />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">{short(frac * maxVal)}</text>
          </g>
        );
      })}
      {sorted.map((b, i) => (
        <g key={b.quarter}>
          {b.calls > 0 && <rect x={barX(i, 0)} y={barY(b.calls)} width={barW} height={barHeight(b.calls)} fill="#8B1A1A" rx="2" />}
          {b.distributions > 0 && <rect x={barX(i, barW + 4)} y={barY(b.distributions)} width={barW} height={barHeight(b.distributions)} fill="#16a34a" rx="2" />}
          <text x={PAD.left + i * groupW + groupW / 2} y={H - 6} textAnchor="middle" fontSize="9" fill="#9ca3af">{b.quarter}</text>
        </g>
      ))}
      <g>
        <rect x={PAD.left} y={H - 28} width="8" height="8" fill="#8B1A1A" rx="1" />
        <text x={PAD.left + 11} y={H - 21} fontSize="9" fill="#6b7280">Capital calls</text>
        <rect x={PAD.left + 80} y={H - 28} width="8" height="8" fill="#16a34a" rx="1" />
        <text x={PAD.left + 91} y={H - 21} fontSize="9" fill="#6b7280">Distributions</text>
      </g>
    </svg>
  );
}

export default async function CashFlowsPage() {
  const data = await getCashFlowData();
  if (!data) redirect("/login");

  const cashFlows = data.cashFlows as unknown as FlowRow[];
  const capitalCalls = data.capitalCalls as unknown as CallRow[];

  const totalCalls = cashFlows.filter((cf) => cf.direction === "call").reduce((s, cf) => s + Number(cf.amount), 0);
  const totalDistributions = cashFlows.filter((cf) => cf.direction === "distribution").reduce((s, cf) => s + Number(cf.amount), 0);
  const netCashFlow = totalDistributions - totalCalls;
  const sorted = [...cashFlows].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="min-h-full flex flex-col">
      <div className="px-8 pt-7 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Cash Flows</h1>
            <p className="text-xs text-gray-400 mt-0.5">All capital calls and distributions · As of {AS_OF_DATE}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <SummaryCard label="Total called" value={cashFlows.length === 0 ? "—" : short(totalCalls)} sub={cashFlows.length === 0 ? "No transactions yet" : inr(totalCalls)} muted={cashFlows.length === 0} />
          <SummaryCard label="Distributions" value={totalDistributions === 0 ? "—" : short(totalDistributions)} sub={totalDistributions === 0 ? "None yet" : inr(totalDistributions)} muted={totalDistributions === 0} />
          <SummaryCard label="Net cash flow" value={cashFlows.length === 0 ? "—" : short(Math.abs(netCashFlow))} sub={cashFlows.length === 0 ? "No transactions yet" : netCashFlow <= 0 ? `${inr(Math.abs(netCashFlow))} net outflow` : `${inr(netCashFlow)} net inflow`} negative={netCashFlow < 0} muted={cashFlows.length === 0} />
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-5 pt-4 pb-3 mb-6">
          <p className="text-xs font-semibold text-gray-600 mb-1">Capital calls vs distributions by quarter</p>
          <p className="text-[11px] text-gray-400 mb-3">Indian fiscal year (Apr–Mar)</p>
          <CashFlowChart flows={cashFlows} />
        </div>
        {capitalCalls.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Upcoming capital calls</h2>
            <div className="space-y-2">
              {capitalCalls.map((call) => {
                const scheme = call.schemes?.[0] ?? null;
                return (
                  <div key={call.id} className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                        <p className="text-sm font-medium text-gray-800">{scheme?.name ?? "—"}</p>
                      </div>
                      <p className="text-xs text-gray-500 ml-3.5">Due {call.due_date ? formatDate(call.due_date) : "—"}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-gray-800">{inr(Number(call.amount))}</p>
                      <p className="text-[11px] text-gray-400">{short(Number(call.amount))}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <section className="px-8 mb-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Transaction ledger</h2>
        {sorted.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-xl px-6 py-10 text-center">
            <p className="text-sm text-gray-400">No transactions yet. Data will appear here once populated by the fund manager.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-2.5 text-right text-[11px] font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sorted.map((cf) => {
                    const scheme = cf.schemes?.[0] ?? null;
                    return (
                      <tr key={cf.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-4 py-3 text-xs text-gray-500 font-mono">{formatDate(cf.date)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{scheme?.name ?? "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${cf.direction === "call" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                            {cf.direction === "call" ? "Capital call" : "Distribution"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs">
                          <span className={cf.direction === "distribution" ? "text-green-700" : "text-gray-800"}>
                            {cf.direction === "distribution" && "+"}{inr(Number(cf.amount))}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">{cf.notes ?? "–"}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200 bg-gray-50/80 font-semibold">
                    <td className="px-4 py-3 text-xs text-gray-700" colSpan={3}>Total called</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-gray-800">{inr(totalCalls)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </section>
      <footer className="mt-auto px-8 py-6 border-t border-gray-100">
        <p className="text-[11px] text-gray-400 leading-relaxed max-w-2xl">
          Cash flow dates and amounts shown are for your LP account only. All figures are as of {AS_OF_DATE} and subject to reconciliation.
        </p>
      </footer>
    </div>
  );
}

function SummaryCard({ label, value, sub, muted, negative }: { label: string; value: string; sub?: string; muted?: boolean; negative?: boolean }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-semibold tracking-tight ${muted ? "text-gray-400" : negative ? "text-red-600" : "text-gray-900"}`}>{value}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}
