'use client';
import { formatSalary } from '@/lib/utils';

interface Props {
  amount: number;
  currency: string;
  displayCurrency: string;
  dominant?: boolean;
}

export default function SalaryCell({
  amount,
  currency,
  displayCurrency,
  dominant,
}: Props) {
  if (!amount || amount === 0) {
    return <span className="text-muted-text">—</span>;
  }
  const formatted = formatSalary(amount, currency, displayCurrency);
  if (dominant) {
    return <span className="text-data-blue font-bold text-base">{formatted}</span>;
  }
  return <span className="text-body-text">{formatted}</span>;
}
