import { createClient } from "@/lib/supabase/server";
import {
  getCashFlows,
  getAllCapitalCalls,
  type CashFlow,
  type CapitalCall,
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

function CashFlowRow({ flow }: { flow: CashFlow }) {
  const isCall = flow.direction === "call";
  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="py-3 px-4 text-sm text-gray-500">{fmtDate(flow.date)}</td>
      <td className="py-3 px-4 text-sm font-medium text-gray-900">
        {flow.schemes.name}
      </td>
      <td className="py-3 px-4">
        <span
          className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
            isCall
              ? "bg-amber-50 text-amber-700"
              : "bg-green-50 text-green-700"
          }`}
        >
          {isCall ? "Capital Call" : "Distribution"}
        </span>
      </td>
      <td className="py-3 px-4 text-sm text-right font-medium text-gray-900">
        {isCall ? `-${short(flow.amount)}` : `+${short(flow.amount)}`}
      </td>
      {flow.notes && (
        <td className="py-3 px-4 text-xs text-gray-400">{flow.notes}</td>
      )}
    </tr>
  );
}

function CapitalCallRow({ call }: { call: CapitalCall }) {
  const statusColor =
    call.status === "upcoming"
      ? "bg-amber-50 text-amber-700"
      : call.status === "called"
      ? "bg-green-50 text-green-700"
      : "bg-red-50 text-red-600";

  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="py-3 px-4 text-sm text-gray-500">{fmtDate(call.due_date)}</td>
      <td className="py-3 px-4 text-sm font-medium text-gray-900">
        {call.schemes.name}
      </td>
      <td className="py-3 px-4">
        <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${statusColor}`}>
          {call.status.charAt(0).toUpperCase() + call.status.slice(1)}
        </span>
      </td>
      <td className="py-3 px-4 text-sm text-right font-medium text-gray-900">
        {short(call.amount)}
      </td>
    </tr>
  );
}

export default async function CashFlowsPage() {
  const supabase = createClient();
  const [cashFlows, capitalCalls] = await Promise.all([
    getCashFlows(supabase),
    getAllCapitalCalls(supabase),
  ]);

  const totalCalls = cashFlows
    .filter((f) => f.direction === "call")
    .reduce((s, f) => s + f.amount, 0);
  const totalDistributions = cashFlows
    .filter((f) => f.direction === "distribution")
    .reduce((s, f) => s + f.amount, 0);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-semibold text-gray-900">Cash Flows</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 mb-1">Total Called</p>
          <p className="text-2xl font-semibold text-gray-900">
            {short(totalCalls)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 mb-1">Total Distributed</p>
          <p className="text-2xl font-semibold text-gray-900">
            {short(totalDistributions)}
          </p>
        </div>
      </div>

      {/* Capital Calls */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-900">Capital Calls</p>
        </div>
        {capitalCalls.length === 0 ? (
          <p className="text-sm text-gray-400 p-5">No capital calls recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500">
                  <th className="py-2 px-4 font-medium">Due Date</th>
                  <th className="py-2 px-4 font-medium">Company</th>
                  <th className="py-2 px-4 font-medium">Status</th>
                  <th className="py-2 px-4 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {capitalCalls.map((c) => (
                  <CapitalCallRow key={c.id} call={c} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Full cash flow ledger */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-900">Transaction Ledger</p>
        </div>
        {cashFlows.length === 0 ? (
          <p className="text-sm text-gray-400 p-5">No transactions recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500">
                  <th className="py-2 px-4 font-medium">Date</th>
                  <th className="py-2 px-4 font-medium">Company</th>
                  <th className="py-2 px-4 font-medium">Type</th>
                  <th className="py-2 px-4 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {cashFlows.map((f) => (
                  <CashFlowRow key={f.id} flow={f} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
