import { INR_TO_USD, INR_TO_GBP, INR_TO_EUR } from './config';

export function formatSalary(amount: number, currency: string, displayCurrency: string): string {
  let converted = amount;

  if (currency === 'INR' && displayCurrency === 'USD') {
    converted = amount * INR_TO_USD;
    return `$${formatUSD(converted)}`;
  }
  if (currency === 'USD' && displayCurrency === 'INR') {
    converted = amount / INR_TO_USD;
    return `₹${formatINR(converted)}`;
  }
  if (currency === 'GBP' && displayCurrency === 'INR') {
    converted = amount / INR_TO_GBP;
    return `₹${formatINR(converted)}`;
  }
  if (currency === 'INR') return `₹${formatINR(amount)}`;
  if (currency === 'USD') return `$${formatUSD(amount)}`;
  if (currency === 'GBP') return `£${formatUSD(amount)}`;
  if (currency === 'EUR') return `€${formatUSD(amount)}`;
  return String(amount);
}

function formatINR(amount: number): string {
  if (amount >= 10000000) return `${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `${(amount / 100000).toFixed(2)} L`;
  return amount.toLocaleString('en-IN');
}

function formatUSD(amount: number): string {
  return amount.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export function normalizeCompanyName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s*(pvt\.?|ltd\.?|inc\.?|llc\.?|private|limited|technologies|internet|india|web services|bpo|\.com)\s*/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export function computeMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

