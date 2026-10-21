import Link from "next/link";
import { redirect } from "next/navigation";
import { getPortfolioData } from "@/lib/queries";
import { AS_OF_DATE } from "@/lib/constants";
import { inr, short, aggregate, formatDate } from "@/lib/format";

function CommitmentBar({ committed, deployed }: { committed: number; deployed: number }) {
  const undrawn = committed - deployed;
  const pct = committed > 0 ? (deployed / committed) * 100 : 0;
  const fullyDeployed = undrawn <= 0;
  return (
    <div>
      <div className="h-1 bg-gray-100 rounded-full overflow-hidden mb-1">
        <div className="h-1 bg-[#8B1A1A] rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      {fullyDeployed ? (
        <p className="text-[10px] text-gray-400">Fully deployed · Speak to your RM about future opportunities</p>
      ) : (
        <p className="text-[10px] text-gray-400">{inr(deployed)} deployed of {inr(committed)}, {inr(undrawn)} undrawn</p>
      )}
    </div>
  );
}

export default async function DashboardPage() {
  const data = await getPortfolioData();
  if (!data) redirect("/login");
  const { investments, capitalCalls, recentUpdates } = data;
  const stats = aggregate(investments);

  return (
    <div className="min-h-full flex flex-col">
      <div className="px-8 pt-7 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">My Portfolio</h1>
            <p className="text-xs text-gray-400 mt-0.5">As of {AS_OF_DATE}</p>
          </div>
        </div>

        {investments.length === 0 ? (
          <EmptyState message="No investments found. Data will appear here once populated by the fund manager." />
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <SummaryCard label="Total Committed" value={short(stats.totalCommitted)} sub={inr(stats.totalCommitted)} />
              <SummaryCard label="Deployed" value={short(stats.totalDeployed)} sub={inr(stats.totalDeployed)} />
              <SummaryCard label="Undrawn" value={short(stats.undrawn)} sub={inr(stats.undrawn)} muted={stats.undrawn === 0} />
              <SummaryCard
                label="Current Value"
                value={short(stats.totalCurrentValue)}
                sub={
                  <span className={stats.totalGain >= 0 ? "text-green-500" : "text-red-500"}>
                    {stats.totalGain >= 0 ? "+" : ""}{short(stats.totalGain)} ({stats.gainPct >= 0 ? "+" : ""}{stats.gainPct.toFixed(1)}%)
                  </span>
                }
                highlight
              />
            </div>

            <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Capital drawdown</span>
                <span className="font-medium text-gray-700">{stats.drawdownPct.toFixed(1)}% drawn</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-2 bg-[#8B1A1A] rounded-full transition-all" style={{ width: `${Math.min(stats.drawdownPct, 100)}%` }} />
              </div>
              <div className="flex justify-between text-[11px] text-gray-400 mt-1.5">
                <span>{short(stats.totalDeployed)} deployed</span>
                <span>{short(stats.undrawn)} remaining</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <MetricBadge label="MOIC" value={`${stats.overallMoic.toFixed(2)}x`} />
              <MetricBadge label="DPI" value={`${stats.overallDpi.toFixed(2)}x`} />
              <MetricBadge label="XIRR" value="Coming soon" muted />
            </div>
          </>
        )}
      </div>

      <section className="px-8 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl px-5 pt-4 pb-5">
          <p className="text-xs font-semibold text-gray-600 mb-1">Portfolio value over time</p>
          <p className="text-[11px] text-gray-400 mb-3">Estimated LP holding value, quarterly</p>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <svg className="mb-3 text-gray-200" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <p className="text-sm text-gray-400">Quarterly value history</p>
            <p className="text-xs text-gray-300 mt-1">Will appear here after the first quarter-end. Current estimated value shown above.</p>
          </div>
        </div>
      </section>

      {capitalCalls.length > 0 && (
        <section className="px-8 mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Upcoming capital calls</h2>
          <div className="space-y-2">
            {capitalCalls.map((call) => {
              const scheme = call.schemes as { id: string; name: string } | null;
              return (
                <div key={call.id} className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{scheme?.name ?? "—"}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Due {call.due_date ? formatDate(call.due_date) : "—"}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-800">{inr(Number(call.amount))}</p>
                    <p className="text-[11px] text-gray-400">{short(Number(call.amount))}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="px-8 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">Latest updates</h2>
          <Link href="/dashboard/updates" className="text-xs text-[#8B1A1A] hover:underline">View all</Link>
        </div>
        {recentUpdates.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No updates yet.</p>
        ) : (
          <div className="space-y-2">
            {recentUpdates.map((u) => (
              <div key={u.id} className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#8B1A1A] flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-700">{u.title}</p>
                  <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{u.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {investments.length > 0 && (
        <section className="px-8 mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Portfolio holdings</h2>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <Th align="left">Company</Th>
                    <Th align="left">Sector</Th>
                    <Th align="left">Commitment</Th>
                    <Th>Current Value</Th>
                    <Th>Gain / Loss</Th>
                    <Th>MOIC</Th>
                    <Th>DPI</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {investments.map((inv) => {
                    const scheme = inv.schemes as { id: string; name: string; sector: string; entry_date: string } | null;
                    const currentValue = inv.current_value !== null ? Number(inv.current_value) : null;
                    const deployed = Number(inv.deployed);
                    const committed = Number(inv.committed);
                    const moic = inv.moic !== null ? Number(inv.moic) : (currentValue !== null && deployed > 0 ? currentValue / deployed : 0);
                    const dpi = deployed > 0 ? inv.distributions / deployed : 0;
                    const diff = currentValue !== null ? currentValue - deployed : null;
                    const diffPct = diff !== null && deployed > 0 ? (diff / deployed) * 100 : null;
                    return (
                      <tr key={inv.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-4 py-3">
                          <Link href={`/dashboard/portfolio/${scheme?.id ?? ""}`} className="font-medium text-gray-900 hover:text-[#8B1A1A] transition-colors">
                            {scheme?.name ?? "—"}
                          </Link>
                          <p className="text-[11px] text-gray-400">{scheme?.entry_date ? formatDate(scheme.entry_date) : "—"}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{scheme?.sector ?? "—"}</td>
                        <td className="px-4 py-3 min-w-[220px]"><CommitmentBar committed={committed} deployed={deployed} /></td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-gray-700">
                          {currentValue !== null ? inr(currentValue) : <span className="text-gray-400 italic font-sans">Valuation pending</span>}
                        </td>
                        <td className="px-4 py-3 text-right text-xs">
                          {diff !== null && diffPct !== null ? (
                            <span className={diff >= 0 ? "text-green-600" : "text-red-600"}>
                              {diff >= 0 ? "+" : ""}{inr(diff)}<br />
                              <span className="text-[11px] opacity-80">({diffPct >= 0 ? "+" : ""}{diffPct.toFixed(1)}%)</span>
                            </span>
                          ) : <span className="text-gray-400">–</span>}
                        </td>
                        <td className="px-4 py-3 text-right text-xs font-medium">
                          <span className={moic >= 1 ? "text-green-700" : "text-red-600"}>{moic.toFixed(2)}x</span>
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-gray-500">{dpi.toFixed(2)}x</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200 bg-gray-50/80 font-semibold">
                    <td className="px-4 py-3 text-xs text-gray-700" colSpan={2}>Total</td>
                    <td className="px-4 py-3">
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden mb-1">
                        <div className="h-1 bg-[#8B1A1A] rounded-full" style={{ width: `${Math.min(stats.drawdownPct, 100)}%` }} />
                      </div>
                      <p className="text-[10px] text-gray-400">{inr(stats.totalDeployed)} of {inr(stats.totalCommitted)}, {inr(stats.undrawn)} undrawn</p>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-gray-700">{inr(stats.totalCurrentValue)}</td>
                    <td className="px-4 py-3 text-right text-xs">
                      <span className={stats.totalGain >= 0 ? "text-green-600" : "text-red-600"}>
                        {stats.totalGain >= 0 ? "+" : ""}{inr(stats.totalGain)}<br />
                        <span className="text-[11px] opacity-80">({stats.gainPct >= 0 ? "+" : ""}{stats.gainPct.toFixed(1)}%)</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-semibold text-green-700">{stats.overallMoic.toFixed(2)}x</td>
                    <td className="px-4 py-3 text-right text-xs text-gray-500">{stats.overallDpi.toFixed(2)}x</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </section>
      )}

      <footer className="mt-auto px-8 py-6 border-t border-gray-100">
        <p className="text-[11px] text-gray-400 leading-relaxed max-w-2xl">
          All valuations are unaudited estimates as of {AS_OF_DATE} (last quarter-end) and are subject to change. Past performance does not guarantee future results. This portal is for registered Lead Invest LPs only.
        </p>
        <p className="text-[11px] text-gray-400 mt-2">
          Questions? <a href="mailto:kushagra@leadinvest.in" className="text-[#8B1A1A] hover:underline">kushagra@leadinvest.in</a>
        </p>
      </footer>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white border border-dashed border-gray-200 rounded-xl px-6 py-10 text-center mb-6">
      <svg className="mx-auto mb-3 text-gray-200" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}

function SummaryCard({ label, value, sub, highlight, muted }: { label: string; value: string; sub?: React.ReactNode; highlight?: boolean; muted?: boolean }) {
  return (
    <div className={`rounded-xl border px-5 py-4 ${highlight ? "bg-[#8B1A1A] border-[#8B1A1A]" : "bg-white border-gray-200"}`}>
      <p className={`text-xs font-medium mb-1 ${highlight ? "text-white/70" : "text-gray-500"}`}>{label}</p>
      <p className={`text-xl font-semibold tracking-tight ${highlight ? "text-white" : muted ? "text-gray-400" : "text-gray-900"}`}>{value}</p>
      {sub && <p className={`text-[11px] mt-1 ${highlight ? "text-white/60" : "text-gray-400"}`}>{sub}</p>}
    </div>
  );
}

function MetricBadge({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-3 flex items-center justify-between">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-sm font-semibold ${muted ? "text-gray-400 italic text-xs font-normal" : "text-gray-900"}`}>{value}</span>
    </div>
  );
}

function Th({ children, align = "right" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th className={`px-4 py-2.5 text-[11px] font-medium text-gray-500 uppercase tracking-wider ${align === "right" ? "text-right" : "text-left"}`}>
      {children}
    </th>
  );
}
