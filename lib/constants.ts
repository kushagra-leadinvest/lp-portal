// Set NEXT_PUBLIC_AS_OF_DATE in Vercel environment variables (e.g. "30 Sep 2024").
// The fallback "DATE NOT SET" makes a missing env var immediately visible in the UI.
export const AS_OF_DATE = process.env.NEXT_PUBLIC_AS_OF_DATE ?? "DATE NOT SET";
export const FUND_NAME  = process.env.NEXT_PUBLIC_FUND_NAME  ?? "Lead Invest NxtGen";
