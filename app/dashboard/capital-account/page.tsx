"use client";

import {
  LP_NAME,
  AS_OF_DATE,
  FUND_NAME,
  HOLDINGS,
  CASH_FLOWS,
  aggregate,
  inr,
} from "@/lib/dummy-data";

function DownloadButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 bg-[#8B1A1A] hover:bg-[#7a1616] text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors print:hidden"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Download PDF
    </button>
  );
}

export default function CapitalAccountPage() {
  const stats = aggregate(HOLDINGS);
  const sortedFlows = [...CASH_FLOWS].sort((a, b) => a.date.localeCompare(b.date));

  let runningBalance = 0;
  const flowsWithBalance = sortedFlows.map((cf) => {
    if (cf.type === "drawdown") runningBalance += cf.amount;
    else runningBalance -= cf.amount;
    return { ...cf, balance: runningBalance };
  });

  return (
    <div className="min-h-full flex flex-col">
      {/* Screen header */}
      <div className="px-8 pt-7 pb-6 print:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Capital Account Statement</h1>
            <p className="text-xs text-gray-400 mt-0.5">One-click PDF for your records · As of {AS_OF_DATE}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
              Dummy data · testing only
            </span>
            <DownloadButton />
          </div>
        </div>
      </div>

      <div className="px-8 pb-12 max-w-3xl mx-auto w-full print:px-0 print:max-w-none print:mx-0">

        {/* Print-only header */}
        <div className="hidden print:block mb-8">
          <div className="flex items-start justify-between border-b-2 border-gray-900 pb-4 mb-6">
            <div>
              <p className="text-2xl font-bold text-gray-900">Lead Invest</p>
              <p className="text-sm text-gray-500 mt-0.5">Capital Account Statement</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">DRAFT / DUMMY DATA</p>
              <p className="text-xs text-gray-400 mt-0.5">As of {AS_OF_DATE}</p>
            </div>
          </div>
        </div>

        {/* LP details */}
        <section className="bg-white border border-gray-200 rounded-xl px-6 py-5 mb-5 print:border-gray-300 print:rounded-none">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">LP Name</p>
              <p className="text-sm font-semibold text-gray-900">{LP_NAME}</p>
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

        {/* Account summary */}
        <section className="mb-5">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Account summary</h2>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden print:rounded-none print:border-gray-300">
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
          </div>
        </section>

        {/* Holdings */}
        <section className="mb-5">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Holdings</h2>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden print:rounded-none print:border-gray-300">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-medium text-gray-500 uppercase tracking-wider">Committed</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-medium text-gray-500 uppercase tracking-wider">Deployed</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-medium text-gray-500 uppercase tracking-wider">Current value</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-medium text-gray-500 uppercase tracking-wider">MOIC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {HOLDINGS.map((h) => {
                  const rowMoic = h.deployed > 0 ? h.currentValue / h.deployed : 0;
                  return (
                    <tr key={h.id}>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-800">{h.company}</p>
                        <p className="text-[11px] text-gray-400">{h.sector}</p>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-gray-600">{inr(h.committed)}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-gray-600">{inr(h.deployed)}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-gray-700 font-medium">
                        {h.valuationAvailable ? inr(h.currentValue) : <span className="text-gray-400 italic font-sans text-[11px]">Valuation pending</span>}
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-semibold text-gray-700">{rowMoic.toFixed(2)}x</td>
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

        {/* Transaction ledger */}
        <section className="mb-5">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Transaction history</h2>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden print:rounded-none print:border-gray-300">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {flowsWithBalance.map((cf) => (
                  <tr key={cf.id}>
                    <td className="px-4 py-2.5 text-xs text-gray-500 font-mono">{cf.displayDate}</td>
                    <td className="px-4 py-2.5 text-xs font-medium text-gray-800">{cf.company}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">
                      {cf.type === "drawdown" ? "Capital call" : "Distribution"}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs text-gray-700">
                      {cf.type === "distribution" ? "+" : ""}{inr(cf.amount)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs text-gray-600">
                      {inr(cf.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 print:bg-white print:rounded-none print:border-t print:border-gray-300 print:mt-6">
          <p className="text-[11px] text-gray-500 leading-relaxed">
            <strong>Important:</strong> This capital account statement is an unaudited estimate prepared by Lead Invest for informational purposes only. Valuations are as of {AS_OF_DATE} and are based on the most recent information available. Past performance does not guarantee future results. This document does not constitute financial or tax advice. For audited statements, capital account details, or tax documents, contact your fund manager.
          </p>
          <p className="text-[11px] text-gray-400 mt-2">
            <strong>DRAFT — DUMMY DATA ONLY.</strong> Not to be relied upon for any financial, legal, or tax purposes.
          </p>
        </section>
      </div>
    </div>
  );
}

function StatRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean; }) {
  return (
    <tr className={`border-b border-gray-50 last:border-0 ${highlight ? "bg-[#8B1A1A]/5" : ""}`}>
      <td className="px-4 py-3 text-xs text-gray-600">{label}</td>
      <td className={`px-4 py-3 text-right font-mono text-xs font-medium ${highlight ? "text-[#8B1A1A]" : "text-gray-700"}`}>
        {value}
      </td>
    </tr>
  );
}
