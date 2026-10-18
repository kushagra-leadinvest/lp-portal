export interface Investor {
  id: string;
  full_name: string;
  email: string;
  pan?: string;
  phone?: string;
  created_at: string;
}

export interface Scheme {
  id: string;
  name: string;
  vintage_year: number;
  target_corpus_cr: number;
}

export interface Commitment {
  id: string;
  investor_id: string;
  scheme_id: string;
  committed_cr: number;
  drawn_cr: number;
  undrawn_cr: number;
}

export interface PortfolioCompany {
  id: string;
  name: string;
  sector: string;
  stage: string;
  invested_cr: number;
  current_value_cr: number;
  investment_date: string;
}

export interface LPSummary {
  total_committed_cr: number;
  total_drawn_cr: number;
  total_current_value_cr: number;
  xirr_percent: number | null;
}
