import { createClient } from "@/lib/supabase/server";
import {
  getInvestor,
  getInvestments,
  getUpcomingCapitalCalls,
  getRecentUpdates,
  aggregateInvestments,
  type Investment,
  type CapitalCall,
  type Update,
} from "@/lib/queries";

// ─── Formatters ───────────────────────────────────────────────────────────────

function inr(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function short(n: number): string {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)} Cr`;
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(2)} L`;
  return inr(n);
}

function fmt(n: number, dp = 2): string {
  return n.toFixed(dp);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p
        className={`text-2xl font-semibold ${
          highlight ? "text-[#8B1A1A]" : "text-gray-900"
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function MetricBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function CommitmentBar({ pct }: { pct: number }) {
  const clamped = Math.min(100, Math.max(0, pct));
  return (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div
        className="bg-[#8B1A1A] h-2 rounded-full transition-all"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

function HoldingRow({ inv }: { inv: Investment }) {
  const valuationAvailable = inv.current_value !== null;
  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="py-3 px-4">
        <p className="text-sm font-medium text-gray-900">{inv.schemes.name}</p>
        <p className="text-xs text-gray-400">
          {[inv.schemes.sector, inv.schemes.stage].filter(Boolean).join(" · ")}
        </p>
      </td>
      <td className="py-3 px-4 text-sm text-gray-700 text-right">
        {short(inv.committed_amount)}
      </td>
      <td className="py-3 px-4 text-sm text-gray-700 text-right">
        {short(inv.deployed_amount)}
      </td>
      <td className="py-3 px-4 text-sm text-right">
        {valuationAvailable ? (
          <span className="text-gray-900">{short(inv.current_value!)}</span>
        ) : (
          <span className="text-gray-400 italic">Valuation pending</span>
        )}
      </td>
      <td className="py-3 px-4 text-sm text-right">
        {inv.moic !== null ? (
          <span className="text-gray-900">{fmt(inv.moic)}x</span>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>
      <td className="py-3 px-4 text-sm text-gray-500 text-right">
        {inv.ownership_pct !== null
          ? `${fmt(inv.ownership_pct, 3)}%`
          : "—"}
      </td>
    </tr>
  );
}

function CapitalCallRow({ call }: { call: CapitalCall }) {
  const due = new Date(call.due_date);
  const daysLeft = Math.ceil(
    (due.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  return (
    <div className="flex items-center justify-between py-3 border-t border-gray-100 first:border-t-0">
      <div>
        <p className="text-sm font-medium text-gray-900">
          {call.schemes.name}
        </p>
        <p className="text-xs text-gray-400">
          Due {due.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          {daysLeft <= 14 && (
            <span className="ml-2 text-amber-600 font-medium">
              ({daysLeft}d left)
            </span>
          )}
        </p>
      </div>
      <p className="text-sm font-semibold text-gray-900">{short(call.amount)}</p>
    </div>
  );
}

function UpdateCard({ update }: { update: Update }) {
  const d = new Date(update.published_at);
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-xs text-gray-400 mb-1">
        {d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
      </p>
      <p className="text-sm font-semibold text-gray-900 mb-1">{update.title}</p>
      <p className="text-sm text-gray-600 line-clamp-3">{update.body}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = createClient();

  const [investor, investments, upcomingCalls, recentUpdates] =
    await Promise.all([
      getInvestor(supabase),
      getInvestments(supabase),
      getUpcomingCapitalCalls(supabase),
      getRecentUpdates(supabase, 3),
    ]);

  const stats = aggregateInvestments(investments);
  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Portfolio Overview
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">As of {today}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Current Value"
          value={short(stats.totalCurrentValue)}
          sub={`${stats.gainPct >= 0 ? "+" : ""}${fmt(stats.gainPct)}% unrealised`}
          highlight
        />
        <SummaryCard
          label="Capital Deployed"
          value={short(stats.totalDeployed)}
          sub={`of ${short(stats.totalCommitted)} committed`}
        />
        <SummaryCard
          label="Undrawn Commitment"
          value={short(stats.undrawn)}
        />
        <SummaryCard
          label="Unrealised Gain"
          value={short(stats.totalGain)}
          sub={`${fmt(stats.gainPct)}% on cost`}
        />
      </div>

      {/* Metrics row */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-4">
          <MetricBadge label="MOIC" value={`${fmt(stats.overallMoic)}x`} />
          <MetricBadge label="DPI" value="0.00x" />
          <MetricBadge label="XIRR" value="Pending" />
          <MetricBadge
            label="Drawdown"
            value={`${fmt(stats.drawdownPct)}%`}
          />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Drawdown</span>
            <span>{fmt(stats.drawdownPct)}% of commitment</span>
          </div>
          <CommitmentBar pct={stats.drawdownPct} />
        </div>
      </div>

      {/* Value chart placeholder */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-sm font-medium text-gray-700 mb-3">
          Portfolio Value Over Time
        </p>
        <div className="h-32 flex items-center justify-center text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg">
          Chart available after first NAV snapshot is recorded
        </div>
      </div>

      {/* Upcoming capital calls */}
      {upcomingCalls.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-semibold text-gray-900 mb-3">
            Upcoming Capital Calls
          </p>
          {upcomingCalls.map((c) => (
            <CapitalCallRow key={c.id} call={c} />
          ))}
        </div>
      )}

      {/* Holdings table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-900">Holdings</p>
        </div>
        {investments.length === 0 ? (
          <p className="text-sm text-gray-400 p-5">No investments recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500">
                  <th className="py-2 px-4 font-medium">Company</th>
                  <th className="py-2 px-4 font-medium text-right">Committed</th>
                  <th className="py-2 px-4 font-medium text-right">Deployed</th>
                  <th className="py-2 px-4 font-medium text-right">Current Value</th>
                  <th className="py-2 px-4 font-medium text-right">MOIC</th>
                  <th className="py-2 px-4 font-medium text-right">Ownership</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((inv) => (
                  <HoldingRow key={inv.id} inv={inv} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent updates */}
      {recentUpdates.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-900 mb-3">
            Latest Updates
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recentUpdates.map((u) => (
              <UpdateCard key={u.id} update={u} />
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <p className="text-xs text-gray-400 pb-4">
        All figures are as of {today}. Valuations marked "pending" reflect cost
        basis until updated by Lead Invest. Past performance is not indicative
        of future results. For queries, contact your relationship manager.
      </p>
    </div>
  );
}
