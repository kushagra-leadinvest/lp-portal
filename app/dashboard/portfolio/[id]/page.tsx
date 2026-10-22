import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getInvestmentDetail } from "@/lib/queries";
import { AS_OF_DATE } from "@/lib/constants";
import { inr, short, formatDate } from "@/lib/format";

export default async function PortfolioDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getInvestmentDetail(params.id);
  if (data === null) redirect("/login");

  const { investment, scheme, cashFlows, distributions, updates } = data;
  if (!scheme) notFound();

  const currentValue = investment.current_value !== null ? Number(investment.current_value) : null;
  const deployed    = Number(investment.deployed);
  const committed   = Number(investment.committed);
  const undrawn     = committed - deployed;
  const moic        = investment.moic !== null
    ? Number(investment.moic)
    : (currentValue !== null && deployed > 0 ? currentValue / deployed : 1);
  const dpi         = deployed > 0 ? distributions / deployed : 0;
  const gain        = currentValue !== null ? currentValue - deployed : null;
  const gainPct     = gain !== null && deployed > 0 ? (gain / deployed) * 100 : null;
  const drawdownPct = committed > 0 ? (deployed / committed) * 100 : 0;

  return (
    <div className="min-h-full flex flex-col">
      <div className="px-8 pt-7 pb-0">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#8B1A1A] transition-colors mb-5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Portfolio
        </Link>

        <div className="flex items-start justify-between mb-1">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{scheme.name}</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {scheme.sector && `${scheme.sector} · `}
              {scheme.stage && `${scheme.stage} · `}
              {scheme.entry_date && `Invested ${formatDate(scheme.entry_date)}`}
            </p>
          </div>
          <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full mt-1">
            As of {AS_OF_DATE}
          </span>
        </div>

        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 mt-7">
          Your investment
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <DetailCard label="Committed" value={short(committed)} sub={inr(committed)} />
          <DetailCard label="Deployed" value={short(deployed)} sub={inr(deployed)} />
          <DetailCard
            label="Undrawn"
            value={undrawn <= 0 ? "Fully deployed" : short(undrawn)}
            sub={undrawn <= 0 ? undefined : inr(undrawn)}
            muted={undrawn <= 0}
          />
          {currentValue !== null ? (
            <DetailCard
              label="Current Value"
              value={short(currentValue)}
              sub={
                gain !== null && gainPct !== null ? (
                  <span className={gain >= 0 ? "text-green-300" : "text-red-300"}>
                    {gain >= 0 ? "+" : ""}{short(gain)} ({gainPct >= 0 ? "+" : ""}{gainPct.toFixed(1)}%)
                  </span>
                ) : undefined
              }
              highlight
            />
          ) : (
            <DetailCard label="Current Value" value="Valuation pending" muted />
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>Capital drawdown</span>
            <span className="font-medium text-gray-700">{drawdownPct.toFixed(1)}% drawn</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-2 bg-[#8B1A1A] rounded-full transition-all"
              style={{ width: `${Math.min(drawdownPct, 100)}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] text-gray-400">
            {undrawn <= 0 ? (
              <p>Fully deployed · Speak to your relationship manager about future opportunities</p>
            ) : (
              <>
                <span>{inr(deployed)} deployed</span>
                <span>{inr(undrawn)} remaining</span>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <MetricBadge label="MOIC" value={`${moic.toFixed(2)}x`} />
          <MetricBadge label="DPI" value={`${dpi.toFixed(2)}x`} />
          <MetricBadge label="XIRR" value="Coming soon" muted />
        </div>
      </div>

      {(investment.ownership_pct !== null || investment.entry_valuation !== null) && (
        <section className="px-8 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 grid grid-cols-2 gap-4">
            {investment.ownership_pct !== null && (
              <div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">Your ownership %</p>
                <p className="text-sm font-semibold text-gray-800">{Number(investment.ownership_pct).toFixed(2)}%</p>
                <p className="text-[11px] text-gray-400 mt-0.5">As of entry</p>
              </div>
            )}
            {investment.entry_valuation !== null && (
              <div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">Entry valuation</p>
                <p className="text-sm font-semibold text-gray-800">{short(Number(investment.entry_valuation))}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Post-money at investment date</p>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="px-8 mb-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Cash flows</h2>
        {cashFlows.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-xl px-5 py-6 text-center">
            <p className="text-sm text-gray-400">No cash flows yet.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {cashFlows.map((cf) => (
                  <tr key={cf.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">{formatDate(cf.date)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex text-xs px-2 py-0.5 rounded-full font-medium ${
                        cf.direction === "call" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
                      }`}>
                        {cf.direction === "call" ? "Capital call" : "Distribution"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">
                      <span className={cf.direction === "distribution" ? "text-green-700" : "text-gray-800"}>
                        {cf.direction === "distribution" && "+"}
                        {inr(Number(cf.amount))}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{cf.notes ?? "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="px-8 mb-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Company updates</h2>
        {updates.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-xl px-5 py-6 text-center">
            <p className="text-sm text-gray-400">No updates yet for this investment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {updates.map((u, i) => (
              <div key={u.id} className="flex gap-4 bg-white border border-gray-200 rounded-xl px-5 py-4">
                <div className="flex flex-col items-center">
                  <span className="w-2 h-2 rounded-full bg-[#8B1A1A] mt-0.5 flex-shrink-0" />
                  {i < updates.length - 1 && <div className="w-px flex-1 bg-gray-100 mt-1.5" />}
                </div>
                <div className="pb-1 min-w-0">
                  <p className="text-[11px] font-medium text-gray-400 mb-1">
                    {u.published_at ? formatDate(u.published_at) : "—"} · {u.quarter ?? ""}
                  </p>
                  <p className="text-sm font-medium text-gray-800 mb-1">{u.title}</p>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{u.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="px-8 mb-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Documents</h2>
        <div className="bg-white border border-dashed border-gray-200 rounded-xl px-5 py-8 text-center">
          <svg className="mx-auto mb-2 text-gray-300" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <p className="text-sm text-gray-400">Documents coming soon</p>
          <p className="text-xs text-gray-300 mt-1">Term sheets, cap tables, and reports will appear here once uploaded.</p>
        </div>
      </section>

      <footer className="mt-auto px-8 py-6 border-t border-gray-100">
        <p className="text-[11px] text-gray-400 leading-relaxed max-w-2xl">
          All valuations are unaudited estimates as of {AS_OF_DATE} (last quarter-end) and are subject to change. Past performance does not guarantee future results.
        </p>
        <p className="text-[11px] text-gray-400 mt-2">
          Questions?{" "}
          <a href="mailto:kushagra@leadinvest.in" className="text-[#8B1A1A] hover:underline">
            kushagra@leadinvest.in
          </a>
        </p>
      </footer>
    </div>
  );
}

function DetailCard({
  label, value, sub, highlight, muted,
}: {
  label: string; value: string; sub?: React.ReactNode; highlight?: boolean; muted?: boolean;
}) {
  return (
    <div className={`rounded-xl border px-5 py-4 ${highlight ? "bg-[#8B1A1A] border-[#8B1A1A]" : "bg-white border-gray-200"}`}>
      <p className={`text-xs font-medium mb-1 ${highlight ? "text-white/70" : "text-gray-500"}`}>{label}</p>
      <p className={`font-semibold tracking-tight ${highlight ? "text-white text-xl" : muted ? "text-gray-400 text-sm italic" : "text-gray-900 text-xl"}`}>
        {value}
      </p>
      {sub && (
        <p className={`text-[11px] mt-1 ${highlight ? "text-white/60" : "text-gray-400"}`}>{sub}</p>
      )}
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
