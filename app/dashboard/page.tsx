import Link from "next/link";
import {
  LP_NAME,
  AS_OF_DATE,
  FUND_NAME,
  HOLDINGS,
  UPCOMING_CALLS,
  VALUE_HISTORY,
  PUBLISHED_UPDATES,
  aggregate,
  inr,
  short,
  type Holding,
  type ValueSnapshot,
} from "@/lib/dummy-data";

// ─── Value-over-time chart (SVG line) ────────────────────────────────────────

function ValueChart({ data }: { data: ValueSnapshot[] }) {
  const W = 500, H = 150;
  const PAD = { top: 16, right: 20, bottom: 32, left: 64 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const maxVal = Math.max(...data.map((d) => d.value));
  const minVal = 0;
  const range = maxVal - minVal || 1;

  const x = (i: number) => PAD.left + (i / (data.length - 1)) * plotW;
  const y = (v: number) => PAD.top + plotH - ((v - minVal) / range) * plotH;

  const points = data.map((d, i) => `${x(i)},${y(d.value)}`).join(" ");
  const areaPoints = [
    `${PAD.left},${PAD.top + plotH}`,
    ...data.map((d, i) => `${x(i)},${y(d.value)}`),
    `${x(data.length - 1)},${PAD.top + plotH}`,
  ].join(" ");

  const gridVals = [0, maxVal * 0.5, maxVal];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 150 }} aria-label="Portfolio value over time">
      {gridVals.map((v) => (
        <g key={v}>
          <line x1={PAD.left} y1={y(v)} x2={W - PAD.right} y2={y(v)} stroke="#f0f0f0" strokeWidth="1" />
          <text x={PAD.left - 6} y={y(v) + 4} textAnchor="end" fontSize="9" fill="#9ca3af">{short(v)}</text>
        </g>
      ))}
      <polygon points={areaPoints} fill="#8B1A1A" fillOpacity="0.07" />
      <polyline points={points} fill="none" stroke="#8B1A1A" strokeWidth="1.5" strokeLinejoin="round" />
      {data.map((d, i) => (
        <circle key={i} cx={x(i)} cy={y(d.value)} r="3" fill="#8B1A1A" />
      ))}
      {data.map((d, i) => (
        <text key={i} x={x(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="#9ca3af">{d.quarter}</text>
      ))}
    </svg>
  );
}

// ─── Commitment bar (per holding row) ────────────────────────────────────────

function CommitmentBar({ h }: { h: Holding }) {
  const undrawn = h.committed - h.deployed;
  const pct = h.committed > 0 ? (h.deployed / h.committed) * 100 : 0;
  const fullyDeployed = undrawn <= 0;
  return (
    <div>
      <div className="h-1 bg-gray-100 rounded-full overflow-hidden mb-1">
        <div className="h-1 bg-[#8B1A1A] rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      {fullyDeployed ? (
        <p className="text-[10px] text-gray-400">Fully deployed · Speak to your relationship manager about future opportunities</p>
      ) : (
        <p className="text-[10px] text-gray-400">{inr(h.deployed)} deployed of {inr(h.committed)}, {inr(undrawn)} undrawn</p>
      )}
    </div>
  );
}

// ─── Summary card ─────────────────────────────────────────────────────────────

function SummaryCard({
  label, value, sub, highlight,
}: {
  label: string; value: string; sub?: string; highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl px-5 py-4 border ${highlight ? "bg-[#8B1A1A] border-[#8B1A1A] text-white" : "bg-white border-gray-200"}`}>
      <p className={`text-xs font-medium mb-1 ${highlight ? "text-white/70" : "text-gray-500"}`}>{label}</p>
      <p className={`text-xl font-semibold tracking-tight ${highlight ? "text-white" : "text-gray-900"}`}>{value}</p>
      {sub && <p className={`text-[11px] mt-1 ${highlight ? "text-white/60" : "text-gray-400"}`}>{sub}</p>}
    </div>
  );
}

// ─── Metric badge ─────────────────────────────────────────────────────────────

function MetricBadge({ label, value, pending }: { label: string; value?: string; pending?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{label}</span>
      {pending ? (
        <span className="text-xs text-gray-300 italic">Coming soon</span>
      ) : (
        <span className="text-sm font-semibold text-gray-700">{value}</span>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const stats = aggregate(HOLDINGS);
  const latestUpdates = PUBLISHED_UPDATES.slice(0, 3);

  return (
    <div className="px-8 pt-7 pb-12">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Portfolio overview</h1>
          <p className="text-xs text-gray-400 mt-0.5">{FUND_NAME} · {LP_NAME} · As of {AS_OF_DATE}</p>
        </div>
        <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
          Dummy data · testing only
        </span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <SummaryCard label="Current value" value={short(stats.totalCurrentValue)} sub={inr(stats.totalCurrentValue)} highlight />
        <SummaryCard label="Capital deployed" value={short(stats.totalDeployed)} sub={`${stats.drawdownPct.toFixed(0)}% of commitment`} />
        <SummaryCard label="Undrawn" value={short(stats.undrawn)} sub={inr(stats.undrawn)} />
        <SummaryCard label="Unrealised gain" value={`+${short(stats.totalGain)}`} sub={`+${stats.gainPct.toFixed(1)}% on deployed`} />
      </div>

      {/* Metrics row */}
      <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-8 mb-6">
        <MetricBadge label="MOIC" value={`${stats.overallMoic.toFixed(2)}x`} />
        <MetricBadge label="DPI" value={`${stats.overallDpi.toFixed(2)}x`} />
        <MetricBadge label="XIRR" pending />
        <div className="flex-1" />
        <div className="text-right">
          <p className="text-[10px] text-gray-400 mb-1">Overall drawdown</p>
          <div className="w-40 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-2 bg-[#8B1A1A] rounded-full" style={{ width: `${Math.min(stats.drawdownPct, 100)}%` }} />
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">{stats.drawdownPct.toFixed(0)}% called</p>
        </div>
      </div>

      {/* Value chart */}
      <div className="bg-white border border-gray-200 rounded-xl px-5 pt-4 pb-3 mb-6">
        <p className="text-xs font-semibold text-gray-600 mb-1">Portfolio value over time</p>
        <p className="text-[11px] text-gray-400 mb-3">Estimated fair value · quarterly</p>
        <ValueChart data={VALUE_HISTORY} />
      </div>

      {/* Upcoming capital calls */}
      {UPCOMING_CALLS.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Upcoming capital calls</h2>
          <div className="space-y-2">
            {UPCOMING_CALLS.map((call) => (
              <div key={call.company} className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <p className="text-sm font-medium text-gray-800">{call.company}</p>
                  </div>
                  <p className="text-xs text-gray-500 ml-3.5">Due {call.dueDate}</p>
                  {call.notes && <p className="text-xs text-gray-400 ml-3.5">{call.notes}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">{inr(call.amount)}</p>
                  <p className="text-[11px] text-gray-400">{short(call.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Holdings table */}
      <div className="mb-6">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Holdings</h2>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Commitment</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-medium text-gray-500 uppercase tracking-wider">Current value</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-medium text-gray-500 uppercase tracking-wider">Gain / Loss</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-medium text-gray-500 uppercase tracking-wider">MOIC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {HOLDINGS.map((h) => {
                const gain = h.currentValue - h.deployed;
                const gainPct = h.deployed > 0 ? (gain / h.deployed) * 100 : 0;
                const moic = h.deployed > 0 ? h.currentValue / h.deployed : 0;
                return (
                  <tr key={h.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/portfolio/${h.id}`} className="text-sm font-medium text-gray-800 hover:text-[#8B1A1A] transition-colors">
                        {h.company}
                      </Link>
                      <p className="text-[11px] text-gray-400">{h.sector}</p>
                    </td>
                    <td className="px-4 py-3 w-52">
                      <CommitmentBar h={h} />
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-gray-700 font-medium">
                      {h.valuationAvailable ? inr(h.currentValue) : <span className="text-gray-400 italic font-sans text-[11px]">Valuation pending</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-xs">
                      {h.valuationAvailable ? (
                        <span className={gain >= 0 ? "text-green-600" : "text-red-600"}>
                          {gain >= 0 ? "+" : ""}{inr(gain)}<br />
                          <span className="text-[10px]">({gainPct >= 0 ? "+" : ""}{gainPct.toFixed(1)}%)</span>
                        </span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-semibold text-gray-700">
                      {h.valuationAvailable ? `${moic.toFixed(2)}x` : <span className="text-gray-300">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 bg-gray-50/80 font-semibold">
                <td className="px-4 py-3 text-xs text-gray-700">Total · 5 companies</td>
                <td className="px-4 py-3" />
                <td className="px-4 py-3 text-right font-mono text-xs text-gray-700">{inr(stats.totalCurrentValue)}</td>
                <td className="px-4 py-3 text-right text-xs text-green-600">+{inr(stats.totalGain)}</td>
                <td className="px-4 py-3 text-right text-xs font-semibold text-gray-700">{stats.overallMoic.toFixed(2)}x</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Latest updates */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Latest updates</h2>
          <Link href="/dashboard/updates" className="text-xs text-[#8B1A1A] hover:underline">View all</Link>
        </div>
        <div className="space-y-2">
          {latestUpdates.map((u) => (
            <Link key={u.id} href={`/dashboard/portfolio/${u.company.toLowerCase().replace(/[\s.]/g, "-")}`}>
              <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-gray-300 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-800">{u.company}</p>
                  <span className="text-[10px] text-gray-400">{u.displayDate}</span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{u.body}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-10 pt-6 border-t border-gray-100">
        <p className="text-[11px] text-gray-400 leading-relaxed max-w-2xl">
          All valuations are unaudited estimates as of {AS_OF_DATE}. MOIC and DPI figures are based on deployed capital only and do not constitute financial advice. For queries, contact{" "}
          <a href="mailto:kushagra@leadinvest.in" className="text-[#8B1A1A] hover:underline">kushagra@leadinvest.in</a>
        </p>
      </div>
    </div>
  );
}
