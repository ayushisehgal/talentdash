
export type Level = 'L3' | 'L4' | 'L5' | 'L6' | 'SDE_I' | 'SDE_II' | 'SDE_III' | 'STAFF' | 'PRINCIPAL' | 'IC4' | 'IC5';
export type Currency = 'INR' | 'USD' | 'GBP' | 'EUR';
export type Source = 'CONTRIBUTOR' | 'SCRAPED' | 'AI_INFERRED';

export interface Company {
  id: string;
  name: string;
  slug: string;
  normalized_name: string;
  industry?: string;
  headquarters?: string;
  founded_year?: number;
  headcount_range?: string;
}

export interface SalaryRecord {
  id: string;
  company_id: string;
  company?: Company;
  role: string;
  level: Level;
  location: string;
  currency: Currency;
  experience_years: number;
  base_salary: number;
  bonus: number;
  stock: number;
  total_compensation: number;
  source: Source;
  confidence_score: number;
  is_verified: boolean;
  submitted_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
