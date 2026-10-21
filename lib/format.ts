// ─── Formatting helpers ───────────────────────────────────────────────────────

/** Format a number as Indian Rupees, e.g. ₹12,34,567 */
export function inr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Short form: ₹1.2Cr, ₹45L, ₹3.2K */
export function short(amount: number): string {
  if (amount >= 1_00_00_000) return `₹${(amount / 1_00_00_000).toFixed(1)}Cr`;
  if (amount >= 1_00_000)    return `₹${(amount / 1_00_000).toFixed(1)}L`;
  if (amount >= 1_000)       return `₹${(amount / 1_000).toFixed(1)}K`;
  return inr(amount);
}

/** "2024-09-30" → "30 Sep 2024" */
export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** "2024-09-30" → "Q2 FY25" (Indian fiscal year: Apr–Mar) */
export function fyQuarter(isoDate: string): string {
  const d = new Date(isoDate);
  const month = d.getMonth() + 1; // 1–12
  const year  = d.getFullYear();
  // FY runs Apr–Mar; Apr = Q1 of the fiscal year starting that calendar year
  const fy    = month >= 4 ? year + 1 : year; // FY25 = Apr 2024–Mar 2025
  const q     = month >= 4 ? Math.ceil((month - 3) / 3) : Math.ceil((month + 9) / 3);
  return `Q${q} FY${String(fy).slice(-2)}`;
}

// ─── Aggregate helper ─────────────────────────────────────────────────────────

export interface InvestmentSummary {
  committed:      number | string;
  deployed:       number | string;
  current_value:  number | string | null;
  distributions?: number | string;
}

export function aggregate(investments: InvestmentSummary[]) {
  let totalCommitted    = 0;
  let totalDeployed     = 0;
  let totalCurrentValue = 0;
  let totalDistributions = 0;

  for (const inv of investments) {
    const committed   = Number(inv.committed);
    const deployed    = Number(inv.deployed);
    const cv          = inv.current_value !== null ? Number(inv.current_value) : deployed;
    const dist        = inv.distributions ? Number(inv.distributions) : 0;

    totalCommitted    += committed;
    totalDeployed     += deployed;
    totalCurrentValue += cv;
    totalDistributions += dist;
  }

  const undrawn      = totalCommitted - totalDeployed;
  const totalGain    = totalCurrentValue - totalDeployed;
  const overallMoic  = totalDeployed > 0 ? totalCurrentValue / totalDeployed : 0;
  const overallDpi   = totalDeployed > 0 ? totalDistributions / totalDeployed : 0;

  return {
    totalCommitted,
    totalDeployed,
    totalCurrentValue,
    totalDistributions,
    undrawn,
    totalGain,
    overallMoic,
    overallDpi,
  };
}
