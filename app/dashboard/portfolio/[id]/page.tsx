import { notFound } from "next/navigation";
import Link from "next/link";
import { HOLDINGS, aggregate, inr, short, type Holding } from "@/lib/dummy-data";

// Build lookup from shared HOLDINGS array
const COMPANIES: Record<string, Holding> = Object.fromEntries(
  HOLDINGS.map((h) => [h.id, h])
);

// ─── Commitment bar (expanded) ────────────────────────────────────────────────

function CommitmentBar({ h }: { h: Holding }) {
  const undrawn = h.committed - h.deployed;
  const pct = h.committed > 0 ? (h.deployed / h.committed) * 100 : 0;
  const fullyDeployed = undrawn <= 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray-500">Drawdown</span>
        <span className="text-xs font-medium text-gray-700">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1.5">
        <div className="h-2 bg-[#8B1A1A] rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      {fullyDeployed ? (
        <p className="text-[11px] text-gray-400">
          Fully deployed · Speak to your relationship manager about future opportunities
        </p>
      ) : (
        <p className="text-[11px] text-gray-400">
          {inr(h.deployed)} deployed of {inr(h.committed)} committed · {inr(undrawn)} remaining
        </p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PortfolioDetailPage({ params }: { params: { id: string } }) {
  const h = COMPANIES[params.id];
  if (!h) notFound();

  const moic = h.deployed > 0 ? h.currentValue / h.deployed : 0;
  const dpi = h.deployed > 0 ? h.distributions / h.deployed : 0;
  const gain = h.currentValue - h.deployed;
  const gainPct = h.deployed > 0 ? (gain / h.deployed) * 100 : 0;

  return (
    <div className="px-8 pt-7 pb-12 max-w-3xl">

      {/* Back */}
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 mb-6 transition-colors">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to portfolio
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{h.company}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{h.sector}</span>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{h.stage}</span>
              <span className="text-xs text-gray-400">First invested {h.investmentDate}</span>
            </div>
          </div>
          <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full flex-shrink-0">
            Dummy data · testing only
          </span>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed mt-3">{h.description}</p>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-[#8B1A1A] text-white rounded-xl px-4 py-4">
          <p className="text-[10px] font-medium text-white/70 uppercase tracking-wider mb-1">Current value</p>
          {h.valuationAvailable ? (
            <>
              <p className="text-lg font-semibold">{short(h.currentValue)}</p>
              <p className="text-[11px] text-white/60 mt-0.5">{inr(h.currentValue)}</p>
            </>
          ) : (
            <p className="text-sm italic text-white/60">Valuation pending</p>
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-4">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Deployed</p>
          <p className="text-lg font-semibold text-gray-900">{short(h.deployed)}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{inr(h.deployed)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-4">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">MOIC</p>
          <p className="text-lg font-semibold text-gray-900">{h.valuationAvailable ? `${moic.toFixed(2)}x` : "—"}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">DPI: {dpi.toFixed(2)}x</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-4">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Unrealised gain</p>
          {h.valuationAvailable ? (
            <>
              <p className={`text-lg font-semibold ${gain >= 0 ? "text-green-600" : "text-red-600"}`}>
                {gain >= 0 ? "+" : ""}{short(gain)}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">{gainPct >= 0 ? "+" : ""}{gainPct.toFixed(1)}% on deployed</p>
            </>
          ) : (
            <p className="text-sm text-gray-300">—</p>
          )}
        </div>
      </div>

      {/* Commitment bar */}
      <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 mb-5">
        <p className="text-xs font-semibold text-gray-600 mb-3">Capital commitment</p>
        <CommitmentBar h={h} />
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-50">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Committed</p>
            <p className="text-sm font-medium text-gray-700">{inr(h.committed)}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Deployed</p>
            <p className="text-sm font-medium text-gray-700">{inr(h.deployed)}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Undrawn</p>
            <p className="text-sm font-medium text-gray-700">{inr(h.committed - h.deployed)}</p>
          </div>
        </div>
      </div>

      {/* Updates */}
      <div>
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Company updates</h2>
        <div className="space-y-3">
          {h.updates.map((u, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl px-5 py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-700">{u.date}</span>
                {u.publishedBy && (
                  <span className="text-[10px] text-gray-400">Published by {u.publishedBy}</span>
                )}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{u.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
