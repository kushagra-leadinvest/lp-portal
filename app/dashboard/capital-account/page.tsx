import { createClient } from "@/lib/supabase/server";
import {
  getInvestor,
  getInvestments,
  getCashFlows,
  aggregateInvestments,
  type CashFlow,
} from "@/lib/queries";

function short(n: number): string {
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(2)} L`;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between py-3 border-t border-gray-100 first:border-t-0 ${bold ? "font-semibold" : ""}`}>
      <span className={`text-sm ${bold ? "text-gray-900" : "text-gray-600"}`}>{label}</span>
      <span className={`text-sm ${bold ? "text-gray-900" : "text-gray-700"}`}>{value}</span>
    </div>
  );
}

function CashFlowRow({ flow }: { flow: CashFlow }) {
  const isCall = flow.direction === "call";
  return (
    <div className="flex items-center justify-between py-3 border-t border-gray-100 first:border-t-0">
      <div>
        <p className="text-sm text-gray-900">{flow.schemes.name}</p>
        <p className="text-xs text-gray-400">{fmtDate(flow.date)}</p>
      </div>
      <span className={`text-sm font-medium ${isCall ? "text-gray-900" : "text-green-700"}`}>
        {isCall ? `-${short(flow.amount)}` : `+${short(flow.amount)}`}
      </span>
    </div>
  );
}

export default async function CapitalAccountPage() {
  const supabase = createClient();
  const [investor, investments, cashFlows] = await Promise.all([
    getInvestor(supabase),
    getInvestments(supabase),
    getCashFlows(supabase),
  ]);

  const stats = aggregateInvestments(investments);
  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const totalCalled = cashFlows
    .filter((f) => f.direction === "call")
    .reduce((s, f) => s + f.amount, 0);
  const totalDistributed = cashFlows
    .filter((f) => f.direction === "distribution")
    .reduce((s, f) => s + f.amount, 0);

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Capital Account</h1>
          <p className="text-sm text-gray-400 mt-0.5">As of {today}</p>
        </div>
        <button
          disabled
          className="text-sm px-4 py-2 border border-gray-200 rounded-lg text-gray-400 cursor-not-allowed"
          title="PDF download coming soon"
        >
          Download PDF
        </button>
      </div>

      {/* Statement */}
      <div className="bg-white rounded-xl border border-gray-200 px-5 py-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-3 pb-2">
          Investor
        </p>
        <Row label="Name" value={investor?.name ?? "—"} />
        <Row label="Email" value={investor?.email ?? "—"} />

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-4 pb-2">
          Commitment
        </p>
        <Row label="Total Committed" value={short(stats.totalCommitted)} />
        <Row label="Capital Called" value={short(totalCalled)} />
        <Row label="Undrawn Commitment" value={short(stats.undrawn)} />

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-4 pb-2">
          Portfolio
        </p>
        <Row label="Capital Deployed" value={short(stats.totalDeployed)} />
        <Row label="Current Value" value={short(stats.totalCurrentValue)} bold />
        <Row label="Unrealised Gain / (Loss)" value={short(stats.totalGain)} />
        <Row label="MOIC" value={`${stats.overallMoic.toFixed(2)}x`} />

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-4 pb-2">
          Distributions
        </p>
        <Row label="Total Distributed" value={short(totalDistributed)} />
        <Row label="DPI" value="0.00x" />
      </div>

      {/* Cash flow history */}
      {cashFlows.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-3 pb-2">
            Transaction History
          </p>
          {cashFlows.map((f) => (
            <CashFlowRow key={f.id} flow={f} />
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400">
        This statement is for informational purposes only. Valuations marked
        "pending" reflect cost basis. For official statements, contact Lead
        Invest. Fees, carry, and tax details are subject to compliance review
        before inclusion.
      </p>
    </div>
  );
}
