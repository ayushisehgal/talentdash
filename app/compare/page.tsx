'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LevelBadge from '@/components/ui/LevelBadge';
import { formatSalary } from '@/lib/utils';

export default function ComparePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [salaries, setSalaries] = useState<any[]>([]);
  const [s1, setS1] = useState(searchParams.get('s1') || '');
  const [s2, setS2] = useState(searchParams.get('s2') || '');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/salaries?limit=100')
      .then(r => r.json())
      .then(d => setSalaries(d.data || []));
  }, []);

  useEffect(() => {
    if (s1 && s2 && s1 !== s2) {
      router.replace(`/compare?s1=${s1}&s2=${s2}`, { scroll: false });
      setLoading(true);
      fetch(`/api/compare?s1=${s1}&s2=${s2}`)
        .then(r => r.json())
        .then(d => { setResult(d); setLoading(false); });
    }
  }, [s1, s2]);

  const fmt = (n: number, cur: string) => formatSalary(n, cur, 'INR');

  const delta = (n: number) => {
    if (!n || n === 0) return <span className="text-muted-text">—</span>;
    const color = n > 0 ? 'text-success-green' : 'text-error-red';
    return (
      <span className={`font-medium ${color}`}>
        {n > 0 ? '+' : '-'}
        {fmt(Math.abs(n), 'INR')}
      </span>
    );
  };

  const fields = [
    { label: 'Base Salary', key: 'base_salary', deltaKey: 'base_delta', dominant: false },
    { label: 'Bonus', key: 'bonus', deltaKey: 'bonus_delta', dominant: false },
    { label: 'Stock', key: 'stock', deltaKey: 'stock_delta', dominant: false },
    { label: 'Total Comp', key: 'total_compensation', deltaKey: 'tc_delta', dominant: true },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-deep-text mb-6">Compare Offers</h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {[
          { val: s1, set: setS1, label: 'Offer A' },
          { val: s2, set: setS2, label: 'Offer B' },
        ].map(({ val, set, label }) => (
          <div key={label}>
            <label className="text-sm font-medium text-muted-text mb-1 block">{label}</label>
            <select
              value={val}
              onChange={e => set(e.target.value)}
              className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-data-blue"
            >
              <option value="">Select a record...</option>
              {salaries.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.company?.name} · {s.role} · {s.level} · {s.location}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {loading && (
        <div className="text-muted-text text-center py-8">Comparing...</div>
      )}

      {result && !loading && !result.error && (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          {result.delta.tc_delta !== 0 && (
            <div className="bg-data-blue text-white text-sm px-4 py-2 font-medium flex items-center gap-2">
              {result.delta.tc_delta > 0
                ? result.record1.company?.name
                : result.record2.company?.name}{' '}
              offers higher total compensation
              <span className="bg-white text-data-blue px-2 py-0.5 rounded text-xs font-bold">
                Higher TC
              </span>
            </div>
          )}
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-app-bg border-b border-border">
                <th className="px-4 py-3 text-left text-xs text-muted-text">Field</th>
                <th className="px-4 py-3 text-left text-xs text-muted-text">
                  {result.record1.company?.name}
                </th>
                <th className="px-4 py-3 text-left text-xs text-muted-text">
                  {result.record2.company?.name}
                </th>
                <th className="px-4 py-3 text-left text-xs text-muted-text">Difference</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="px-4 py-3 text-muted-text">Role</td>
                <td className="px-4 py-3">{result.record1.role}</td>
                <td className="px-4 py-3">{result.record2.role}</td>
                <td className="px-4 py-3">—</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-3 text-muted-text">Level</td>
                <td className="px-4 py-3"><LevelBadge level={result.record1.level} /></td>
                <td className="px-4 py-3"><LevelBadge level={result.record2.level} /></td>
                <td className="px-4 py-3">—</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-3 text-muted-text">Location</td>
                <td className="px-4 py-3">{result.record1.location}</td>
                <td className="px-4 py-3">{result.record2.location}</td>
                <td className="px-4 py-3">—</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-3 text-muted-text">Experience</td>
                <td className="px-4 py-3">{result.record1.experience_years}y</td>
                <td className="px-4 py-3">{result.record2.experience_years}y</td>
                <td className="px-4 py-3">{delta(result.delta.experience_delta)}</td>
              </tr>
              {fields.map(f => (
                <tr key={f.key} className="border-b border-border hover:bg-hover-surface">
                  <td className="px-4 py-3 text-muted-text">{f.label}</td>
                  <td className={`px-4 py-3 ${f.dominant ? 'font-bold text-data-blue' : ''}`}>
                    {fmt(Number(result.record1[f.key]), result.record1.currency)}
                  </td>
                  <td className={`px-4 py-3 ${f.dominant ? 'font-bold text-data-blue' : ''}`}>
                    {fmt(Number(result.record2[f.key]), result.record2.currency)}
                  </td>
                  <td className="px-4 py-3">{delta(result.delta[f.deltaKey])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}