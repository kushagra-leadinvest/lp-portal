// ─────────────────────────────────────────────────────────────────────────────
// DUMMY DATA — replace with real Supabase queries after testing + compliance.
// All money values are stored as ₹ (rupees), NOT crores or lakhs.
// Column names in the DB may end in _cr but this project stores lakhs (known
// naming quirk — do not convert here, just use as rupees).
// ─────────────────────────────────────────────────────────────────────────────

export const LP_NAME = "Kushagra Sanwal";
export const AS_OF_DATE = "30 Sep 2024";
export const FUND_NAME = "Lead Invest NxtGen";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PortfolioUpdate {
  date: string;
  text: string;
  publishedBy?: string;
}

export interface Holding {
  id: string;
  company: string;
  sector: string;
  stage: string;
  investmentDate: string;
  committed: number;
  deployed: number;
  distributions: number;
  currentValue: number;
  companyValuation: number;
  valuationAvailable: boolean;
  description: string;
  updates: PortfolioUpdate[];
}

export interface CashFlow {
  id: string;
  date: string;
  displayDate: string;
  type: "drawdown" | "distribution";
  company: string;
  amount: number;
  notes?: string;
}

export interface CapitalCall {
  company: string;
  dueDate: string;
  amount: number;
  notes?: string;
}

export interface ValueSnapshot {
  quarter: string;
  date: string;
  value: number;
}

export interface PortfolioDocument {
  id: string;
  name: string;
  company?: string;
  category: "subscription" | "quarterly-report" | "tax" | "general";
  date: string;
  displayDate: string;
  size: string;
}

export interface PublishedUpdate {
  id: string;
  company: string;
  quarter: string;
  date: string;
  displayDate: string;
  title: string;
  body: string;
  publishedBy: string;
  publishedAt: string;
}

// ─── Holdings ────────────────────────────────────────────────────────────────

export const HOLDINGS: Holding[] = [
  {
    id: "freshcon",
    company: "Freshcon",
    sector: "Agritech",
    stage: "Series A (upcoming)",
    investmentDate: "10 Jan 2024",
    committed: 250000,
    deployed: 250000,
    distributions: 0,
    currentValue: 312500,
    companyValuation: 15000000,
    valuationAvailable: true,
    description:
      "Freshcon builds cold-chain logistics infrastructure for fresh produce in Tier-2 and Tier-3 markets, reducing post-harvest wastage.",
    updates: [
      { date: "Sep 2024", text: "Revenue grew 40% YoY. Series A process initiated with two lead investors. Management expects close by Q1 FY26.", publishedBy: "Lead Invest" },
      { date: "Jun 2024", text: "Expanded to 4 new cities. Monthly GMV crossed ₹80L.", publishedBy: "Lead Invest" },
      { date: "Mar 2024", text: "Closed seed extension. Deploying capital into warehouse expansion.", publishedBy: "Lead Invest" },
    ],
  },
  {
    id: "floworks-ai",
    company: "Floworks.ai",
    sector: "AI / SaaS",
    stage: "Seed",
    investmentDate: "20 Mar 2024",
    committed: 280000,
    deployed: 280000,
    distributions: 0,
    currentValue: 350000,
    companyValuation: 22000000,
    valuationAvailable: true,
    description:
      "Floworks.ai is an AI-native workflow automation platform helping sales and ops teams eliminate repetitive tasks.",
    updates: [
      { date: "Sep 2024", text: "ARR crossed ₹1.2Cr. Three enterprise pilots converting to paid contracts. Team has grown to 18 people.", publishedBy: "Lead Invest" },
      { date: "Jul 2024", text: "Launched v2 product with LLM-powered workflow builder. NPS at 68.", publishedBy: "Lead Invest" },
      { date: "Apr 2024", text: "First 10 paying customers onboarded. Burn rate at ₹12L/month.", publishedBy: "Lead Invest" },
    ],
  },
  {
    id: "nawgati",
    company: "Nawgati",
    sector: "Logistics",
    stage: "Seed",
    investmentDate: "1 Oct 2023",
    committed: 180000,
    deployed: 120000,
    distributions: 0,
    currentValue: 108000,
    companyValuation: 18000000,
    valuationAvailable: true,
    description:
      "Nawgati provides last-mile logistics software for D2C brands, integrating with 15+ courier partners and providing real-time tracking.",
    updates: [
      { date: "Sep 2024", text: "Expanding to 3 new cities. Final capital drawdown (₹60K for your account) expected Q3 FY25.", publishedBy: "Lead Invest" },
      { date: "Jun 2024", text: "Shipment volume up 3x. Working on Series A fundraise.", publishedBy: "Lead Invest" },
      { date: "Jan 2024", text: "Signed anchor enterprise client — 50,000 shipments/month.", publishedBy: "Lead Invest" },
    ],
  },
  {
    id: "fdm",
    company: "FDM",
    sector: "B2B Commerce",
    stage: "Series A",
    investmentDate: "1 Jun 2023",
    committed: 230000,
    deployed: 230000,
    distributions: 0,
    currentValue: 287500,
    companyValuation: 25000000,
    valuationAvailable: true,
    description:
      "FDM digitises B2B procurement for FMCG distributors, replacing manual WhatsApp orders with a structured ordering and credit platform.",
    updates: [
      { date: "Sep 2024", text: "GMV up 65% QoQ. Unit economics profitable for 3 consecutive months. Secondary transaction being explored.", publishedBy: "Lead Invest" },
      { date: "May 2024", text: "Expanded credit book to ₹3Cr. Default rate below 1%.", publishedBy: "Lead Invest" },
      { date: "Oct 2023", text: "Series A closed. Lead Invest participated in the bridge tranche.", publishedBy: "Lead Invest" },
    ],
  },
  {
    id: "spintly",
    company: "Spintly",
    sector: "PropTech",
    stage: "Series A",
    investmentDate: "15 Aug 2023",
    committed: 160000,
    deployed: 160000,
    distributions: 0,
    currentValue: 200000,
    companyValuation: 20000000,
    valuationAvailable: true,
    description:
      "Spintly delivers wireless access-control-as-a-service for commercial real estate, replacing legacy wired systems with a cloud-managed SaaS.",
    updates: [
      { date: "Sep 2024", text: "Signed 2 enterprise clients. SaaS ARR at ₹80L. Exploring UAE and Singapore expansion.", publishedBy: "Lead Invest" },
      { date: "Apr 2024", text: "Product launched in UAE. First 3 buildings live.", publishedBy: "Lead Invest" },
      { date: "Sep 2023", text: "Series A closed. Lead Invest led the round.", publishedBy: "Lead Invest" },
    ],
  },
];

// ─── Cash flows ──────────────────────────────────────────────────────────────

export const CASH_FLOWS: CashFlow[] = [
  { id: "cf-1", date: "2023-06-01", displayDate: "1 Jun 2023", type: "drawdown", company: "FDM", amount: 230000 },
  { id: "cf-2", date: "2023-08-15", displayDate: "15 Aug 2023", type: "drawdown", company: "Spintly", amount: 160000 },
  { id: "cf-3", date: "2023-10-01", displayDate: "1 Oct 2023", type: "drawdown", company: "Nawgati", amount: 80000, notes: "First tranche" },
  { id: "cf-4", date: "2024-01-10", displayDate: "10 Jan 2024", type: "drawdown", company: "Freshcon", amount: 250000 },
  { id: "cf-5", date: "2024-03-20", displayDate: "20 Mar 2024", type: "drawdown", company: "Floworks.ai", amount: 280000 },
  { id: "cf-6", date: "2024-04-15", displayDate: "15 Apr 2024", type: "drawdown", company: "Nawgati", amount: 40000, notes: "Second tranche" },
];

// ─── Upcoming capital calls ───────────────────────────────────────────────────

export const UPCOMING_CALLS: CapitalCall[] = [
  {
    company: "Nawgati",
    dueDate: "Dec 2024 (est.)",
    amount: 60000,
    notes: "Third and final tranche. Exact date to be confirmed by the company.",
  },
];

// ─── Portfolio value history (quarterly) ─────────────────────────────────────

export const VALUE_HISTORY: ValueSnapshot[] = [
  { quarter: "Q1 FY24", date: "2023-06-30", value: 230000 },
  { quarter: "Q2 FY24", date: "2023-09-30", value: 405000 },
  { quarter: "Q3 FY24", date: "2023-12-31", value: 475000 },
  { quarter: "Q4 FY24", date: "2024-03-31", value: 990000 },
  { quarter: "Q1 FY25", date: "2024-06-30", value: 1140000 },
  { quarter: "Q2 FY25", date: "2024-09-30", value: 1258000 },
];

// ─── Documents ───────────────────────────────────────────────────────────────

export const DOCUMENTS: PortfolioDocument[] = [
  { id: "doc-1", name: "Subscription Agreement — Lead Invest NxtGen", category: "subscription", date: "2023-05-15", displayDate: "15 May 2023", size: "1.2 MB" },
  { id: "doc-2", name: "Q2 FY24 Portfolio Update", category: "quarterly-report", date: "2023-10-15", displayDate: "15 Oct 2023", size: "890 KB" },
  { id: "doc-3", name: "Q3 FY24 Portfolio Update", category: "quarterly-report", date: "2024-01-20", displayDate: "20 Jan 2024", size: "920 KB" },
  { id: "doc-4", name: "Q4 FY24 Portfolio Update", category: "quarterly-report", date: "2024-04-18", displayDate: "18 Apr 2024", size: "1.1 MB" },
  { id: "doc-5", name: "Q1 FY25 Portfolio Update", category: "quarterly-report", date: "2024-07-20", displayDate: "20 Jul 2024", size: "1.0 MB" },
];

// ─── Published updates ───────────────────────────────────────────────────────

export const PUBLISHED_UPDATES: PublishedUpdate[] = [
  { id: "upd-1", company: "Freshcon", quarter: "Q2 FY25", date: "2024-09-30", displayDate: "30 Sep 2024", title: "Q2 FY25 — Freshcon", body: "Revenue grew 40% YoY. Series A process initiated with two lead investors. Management expects close by Q1 FY26. The cold-chain network now spans 12 cities.", publishedBy: "Lead Invest", publishedAt: "2024-10-12" },
  { id: "upd-2", company: "Floworks.ai", quarter: "Q2 FY25", date: "2024-09-30", displayDate: "30 Sep 2024", title: "Q2 FY25 — Floworks.ai", body: "ARR crossed ₹1.2Cr. Three enterprise pilots are converting to paid contracts. The team has grown to 18 people.", publishedBy: "Lead Invest", publishedAt: "2024-10-12" },
  { id: "upd-3", company: "Nawgati", quarter: "Q2 FY25", date: "2024-09-30", displayDate: "30 Sep 2024", title: "Q2 FY25 — Nawgati", body: "Expanding to 3 new cities in Q3 FY25. The final capital drawdown (₹60,000 for your account) is expected in December 2024.", publishedBy: "Lead Invest", publishedAt: "2024-10-12" },
  { id: "upd-4", company: "FDM", quarter: "Q2 FY25", date: "2024-09-30", displayDate: "30 Sep 2024", title: "Q2 FY25 — FDM", body: "GMV up 65% QoQ. The company has been unit-economics profitable for 3 consecutive months. A secondary transaction is being explored.", publishedBy: "Lead Invest", publishedAt: "2024-10-12" },
  { id: "upd-5", company: "Spintly", quarter: "Q2 FY25", date: "2024-09-30", displayDate: "30 Sep 2024", title: "Q2 FY25 — Spintly", body: "Signed 2 enterprise clients. SaaS ARR at ₹80L. Exploring UAE and Singapore expansion with a local distribution partner.", publishedBy: "Lead Invest", publishedAt: "2024-10-12" },
  { id: "upd-6", company: "Freshcon", quarter: "Q1 FY25", date: "2024-06-30", displayDate: "30 Jun 2024", title: "Q1 FY25 — Freshcon", body: "Expanded to 4 new cities. Monthly GMV crossed ₹80L for the first time.", publishedBy: "Lead Invest", publishedAt: "2024-07-18" },
];

// ─── Number helpers ───────────────────────────────────────────────────────────

export function inr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function short(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(2)}Cr`;
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(2)}L`;
  if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(0)}K`;
  return `${sign}₹${abs.toLocaleString("en-IN")}`;
}

export function aggregate(holdings: Holding[]) {
  const totalCommitted = holdings.reduce((s, h) => s + h.committed, 0);
  const totalDeployed = holdings.reduce((s, h) => s + h.deployed, 0);
  const totalCurrentValue = holdings.reduce((s, h) => s + h.currentValue, 0);
  const totalDistributions = holdings.reduce((s, h) => s + h.distributions, 0);
  const undrawn = totalCommitted - totalDeployed;
  const drawdownPct = totalCommitted > 0 ? (totalDeployed / totalCommitted) * 100 : 0;
  const overallMoic = totalDeployed > 0 ? totalCurrentValue / totalDeployed : 0;
  const overallDpi = totalDeployed > 0 ? totalDistributions / totalDeployed : 0;
  const totalGain = totalCurrentValue - totalDeployed;
  const gainPct = totalDeployed > 0 ? (totalGain / totalDeployed) * 100 : 0;
  return { totalCommitted, totalDeployed, totalCurrentValue, totalDistributions, undrawn, drawdownPct, overallMoic, overallDpi, totalGain, gainPct };
}
