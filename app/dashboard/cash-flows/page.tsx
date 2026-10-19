import { AS_OF_DATE, CASH_FLOWS, UPCOMING_CALLS, inr, short, type CashFlow } from "@/lib/dummy-data";

// ─── SVG bar chart: calls vs distributions by quarter ────────────────────────

function CashFlowChart({ flows }: { flows: CashFlow[] }) {
  type QuarterBucket = { quarter: string; drawdowns: number; distributions: number };
  const buckets: Record<string, QuarterBucket> = {};

  const fiscalQuarter = (iso: string): string => {
    const d = new Date(iso);
    const m = d.getMonth();
    const y = d.getFullYear();
    let q: number, fy: number;
    if (m >= 3 && m <= 5) { q = 1; fy = y + 1; }
    else if (m >= 6 && m <= 8) { q = 2; fy = y + 1; }
    else if (m >= 9 && m <= 11) { q = 3; fy = y + 1; }
    else { q = 4; fy = y; }
    return `Q${q} FY${String(fy).slice(2)}`;
  };

  const qKey = (q: string) => {
    const m = q.match(/Q(\d) FY(\d+)/);
    if (!m) return 0;
    return parseInt(m[2]) * 10 + parseInt(m[1]);
  };

  flows.forEach((cf) => {
    const q = fiscalQuarter(cf.date);
    if (!buckets[q]) buckets[q] = { quarter: q, drawdowns: 0, distributions: 0 };
    if (cf.type === "drawdown") buckets[q].drawdowns += cf.amount;
    else buckets[q].distributions += cf.amount;
  });

  const sorted = Object.values(buckets).sort((a, b) => qKey(a.quarter) - qKey(b.quarter));

  const W = 520;
  const H = 160;
  const PAD = { top: 16, right: 20, bottom: 36, left: 60 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const n = sorted.length;

  const maxVal = Math.max(...sorted.map((b) => Math.max(b.drawdowns, b.distributions)), 1);
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
            <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">
              {short(frac * maxVal)}
            </text>
          </g>
        );
      })}
      {sorted.map((b, i) => (
        <g key={b.quarter}>
          {b.drawdowns > 0 && (
            <rect x={barX(i, 0)} y={barY(b.drawdowns)} width={barW} height={barHeight(b.drawdowns)} fill="#8B1A1A" rx="2" />
          )}
          {b.distributions > 0 && (
            <rect x={barX(i, barW + 4)} y={barY(b.distributions)} width={barW} height={barHeight(b.distributions)} fill="#16a34a" rx="2" />
          )}
          <text x={PAD.left + i * groupW + groupW / 2} y={H - 6} textAnchor="middle" fontSize="9" fill="#9ca3af">
            {b.quarter}
          </text>
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CashFlowsPage() {
  const totalDrawdowns = CASH_FLOWS.filter((cf) => cf.type === "drawdown").reduce((s, cf) => s + cf.amount, 0);
  const totalDistributions = CASH_FLOWS.filter((cf) => cf.type === "distribution").reduce((s, cf) => s + cf.amount, 0);
  const netCashFlow = totalDistributions - totalDrawdowns;
  const sorted = [...CASH_FLOWS].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="min-h-full flex flex-col">
      <div className="px-8 pt-7 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Cash Flows</h1>
            <p className="text-xs text-gray-400 mt-0.5">All capital calls and distributions · As of {AS_OF_DATE}</p>
          </div>
          <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
            Dummy data · testing only
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <SummaryCard label="Total called" value={short(totalDrawdowns)} sub={inr(totalDrawdowns)} />
          <SummaryCard label="Distributions" value={short(totalDistributions)} sub={totalDistributions === 0 ? "None yet" : inr(totalDistributions)} muted={totalDistributions === 0} />
          <SummaryCard
            label="Net cash flow"
            value={short(Math.abs(netCashFlow))}
            sub={netCashFlow <= 0 ? `${inr(Math.abs(netCashFlow))} net outflow` : `${inr(netCashFlow)} net inflow`}
            negative={netCashFlow < 0}
          />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl px-5 pt-4 pb-3 mb-6">
          <p className="text-xs font-semibold text-gray-600 mb-1">Capital calls vs distributions by quarter</p>
          <p className="text-[11px] text-gray-400 mb-3">Indian fiscal year (Apr–Mar)</p>
          <CashFlowChart flows={CASH_FLOWS} />
        </div>

        {UPCOMING_CALLS.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Upcoming capital calls</h2>
            <div className="space-y-2">
              {UPCOMING_CALLS.map((call) => (
                <div key={call.company} className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                      <p className="text-sm font-medium text-gray-800">{call.company}</p>
                    </div>
                    <p className="text-xs text-gray-500 ml-3.5">Due {call.dueDate}</p>
                    {call.notes && <p className="text-xs text-gray-400 ml-3.5 mt-0.5">{call.notes}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-800">{inr(call.amount)}</p>
                    <p className="text-[11px] text-gray-400">{short(call.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <section className="px-8 mb-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Transaction ledger</h2>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
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
              {sorted.map((cf) => (
                <tr key={cf.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-500 font-mono">{cf.displayDate}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{cf.company}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${cf.type === "drawdown" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                      {cf.type === "drawdown" ? "Capital call" : "Distribution"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs">
                    <span className={cf.type === "drawdown" ? "text-gray-800" : "text-green-700"}>
                      {cf.type === "distribution" && "+"}{inr(cf.amount)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{cf.notes ?? "–"}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 bg-gray-50/80 font-semibold">
                <td className="px-4 py-3 text-xs text-gray-700" colSpan={3}>Total called</td>
                <td className="px-4 py-3 text-right font-mono text-xs text-gray-800">{inr(totalDrawdowns)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <footer className="mt-auto px-8 py-6 border-t border-gray-100">
        <p className="text-[11px] text-gray-400 leading-relaxed max-w-2xl">
          Cash flow dates and amounts shown are for your LP account only. All figures are as of {AS_OF_DATE} and subject to reconciliation. This is a dummy data preview — real transaction data will be populated after compliance approval.
        </p>
      </footer>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SummaryCard({ label, value, sub, muted, negative }: { label: string; value: string; sub?: string; muted?: boolean; negative?: boolean; }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-semibold tracking-tight ${muted ? "text-gray-400" : negative ? "text-red-600" : "text-gray-900"}`}>
        {value}
      </p>
      {sub && <p className="text-[11px] text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}
