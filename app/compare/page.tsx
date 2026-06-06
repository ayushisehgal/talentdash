'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LevelBadge from '@/components/ui/LevelBadge';
import { formatSalary } from '@/lib/utils';

function CompareContent() {
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
      router.replace('/compare?s1=' + s1 + '&s2=' + s2, { scroll: false });
      setLoading(true);
      fetch('/api/compare?s1=' + s1 + '&s2=' + s2)
        .then(r => r.json())
        .then(d => { setResult(d); setLoading(false); });
    }
  }, [s1, s2]);

  const fmt = (n: number) => formatSalary(n, 'INR', 'INR');

  const delta = (n: number) => {
    if (!n || n === 0) return <span style={{ color: '#717171' }}>—</span>;
    const color = n > 0 ? '#008A05' : '#D93025';
    return <span style={{ fontWeight: 500, color }}>{n > 0 ? '+' : '-'}{fmt(Math.abs(n))}</span>;
  };

  const fields = [
    { label: 'Base Salary', key: 'base_salary', deltaKey: 'base_delta', dominant: false },
    { label: 'Bonus', key: 'bonus', deltaKey: 'bonus_delta', dominant: false },
    { label: 'Stock', key: 'stock', deltaKey: 'stock_delta', dominant: false },
    { label: 'Total Comp', key: 'total_compensation', deltaKey: 'tc_delta', dominant: true },
  ];

  return (
    <div>
      <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#222222', marginBottom: '24px' }}>Compare Offers</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
        {[{ val: s1, set: setS1, label: 'Offer A' }, { val: s2, set: setS2, label: 'Offer B' }].map(({ val, set, label }) => (
          <div key={label}>
            <label style={{ fontSize: '14px', fontWeight: 500, color: '#717171', display: 'block', marginBottom: '4px' }}>{label}</label>
            <select value={val} onChange={e => set(e.target.value)}
              style={{ width: '100%', border: '1px solid #EBEBEB', borderRadius: '8px', padding: '8px 12px', fontSize: '14px', outline: 'none', backgroundColor: '#fff' }}>
              <option value="">Select a record...</option>
              {salaries.map((s: any) => (
                <option key={s.id} value={s.id}>{s.company?.name} · {s.role} · {s.level} · {s.location}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {loading && <div style={{ color: '#717171', textAlign: 'center', padding: '32px' }}>Comparing...</div>}

      {result && !loading && !result.error && (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #EBEBEB', overflow: 'hidden' }}>
          {result.delta.tc_delta !== 0 && (
            <div style={{ backgroundColor: '#0369A1', color: '#fff', padding: '8px 16px', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {result.delta.tc_delta > 0 ? result.record1.company?.name : result.record2.company?.name} offers higher total compensation
              <span style={{ backgroundColor: '#fff', color: '#0369A1', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}>Higher TC</span>
            </div>
          )}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F7F7F7', borderBottom: '1px solid #EBEBEB' }}>
                {['Field', result.record1.company?.name, result.record2.company?.name, 'Difference'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#717171' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #EBEBEB' }}>
                <td style={{ padding: '12px 16px', color: '#717171' }}>Role</td>
                <td style={{ padding: '12px 16px' }}>{result.record1.role}</td>
                <td style={{ padding: '12px 16px' }}>{result.record2.role}</td>
                <td style={{ padding: '12px 16px' }}>—</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #EBEBEB' }}>
                <td style={{ padding: '12px 16px', color: '#717171' }}>Level</td>
                <td style={{ padding: '12px 16px' }}><LevelBadge level={result.record1.level} /></td>
                <td style={{ padding: '12px 16px' }}><LevelBadge level={result.record2.level} /></td>
                <td style={{ padding: '12px 16px' }}>—</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #EBEBEB' }}>
                <td style={{ padding: '12px 16px', color: '#717171' }}>Location</td>
                <td style={{ padding: '12px 16px' }}>{result.record1.location}</td>
                <td style={{ padding: '12px 16px' }}>{result.record2.location}</td>
                <td style={{ padding: '12px 16px' }}>—</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #EBEBEB' }}>
                <td style={{ padding: '12px 16px', color: '#717171' }}>Experience</td>
                <td style={{ padding: '12px 16px' }}>{result.record1.experience_years}y</td>
                <td style={{ padding: '12px 16px' }}>{result.record2.experience_years}y</td>
                <td style={{ padding: '12px 16px' }}>{delta(result.delta.experience_delta)}</td>
              </tr>
              {fields.map(f => (
                <tr key={f.key} style={{ borderBottom: '1px solid #EBEBEB' }}>
                  <td style={{ padding: '12px 16px', color: '#717171' }}>{f.label}</td>
                  <td style={{ padding: '12px 16px', fontWeight: f.dominant ? 700 : 400, color: f.dominant ? '#0369A1' : '#484848' }}>{fmt(Number(result.record1[f.key]))}</td>
                  <td style={{ padding: '12px 16px', fontWeight: f.dominant ? 700 : 400, color: f.dominant ? '#0369A1' : '#484848' }}>{fmt(Number(result.record2[f.key]))}</td>
                  <td style={{ padding: '12px 16px' }}>{delta(result.delta[f.deltaKey])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div style={{ color: '#717171', padding: '32px' }}>Loading...</div>}>
      <CompareContent />
    </Suspense>
  );
}
