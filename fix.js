const fs = require('fs');

// Fix SalaryTable.tsx
const salaryTable = `'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LevelBadge from '@/components/ui/LevelBadge';
import SalaryCell from '@/components/ui/SalaryCell';

const ITEMS_PER_PAGE = 25;
const LEVELS = ['L3','L4','L5','L6','SDE_I','SDE_II','SDE_III','STAFF','PRINCIPAL','IC4','IC5'];
const LOCATIONS = ['Bengaluru','Mumbai','Hyderabad','Pune','Delhi','San Francisco','London','Remote'];
const ROLES = ['Software Engineer','Product Manager','Data Engineer','Data Analyst'];

interface Meta { total: number; page: number; limit: number; totalPages: number; }

export default function SalaryTable({ initialData, initialMeta }: { initialData: any[]; initialMeta: Meta; }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState(initialData);
  const [meta, setMeta] = useState(initialMeta);
  const [company, setCompany] = useState(searchParams.get('company') || '');
  const [role, setRole] = useState(searchParams.get('role') || '');
  const [selectedLevels, setSelectedLevels] = useState<string[]>(
    searchParams.get('level') ? searchParams.get('level')!.split(',') : []
  );
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [displayCurrency, setDisplayCurrency] = useState(searchParams.get('currency') || 'INR');
  const [sort, setSort] = useState(searchParams.get('sort') || 'total_comp_desc');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback(async (params: Record<string, string>) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams(params).toString();
      const res = await fetch('/api/salaries?' + qs);
      const json = await res.json();
      setData(json.data || []);
      setMeta(json.meta || initialMeta);
      const url = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => { if (v) url.set(k, v); });
      router.replace('/salaries?' + url.toString(), { scroll: false });
    } catch { setData([]); }
    setLoading(false);
  }, [router, initialMeta]);

  const buildParams = useCallback((overrides: Record<string, string> = {}) => ({
    company, role, level: selectedLevels.join(','), location, sort,
    page: String(page), limit: String(ITEMS_PER_PAGE), ...overrides,
  }), [company, role, selectedLevels, location, sort, page]);

  useEffect(() => {
    if (timer) clearTimeout(timer);
    const t = setTimeout(() => fetchData(buildParams({ page: '1' })), 300);
    setTimer(t);
  }, [company, role, selectedLevels, location, sort, displayCurrency]);

  useEffect(() => { fetchData(buildParams()); }, [page]);

  const toggleLevel = (l: string) => setSelectedLevels(prev =>
    prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]
  );

  const clearAll = () => {
    setCompany(''); setRole(''); setSelectedLevels([]); setLocation(''); setPage(1);
    fetchData({ sort, page: '1', limit: String(ITEMS_PER_PAGE) });
  };

  const start = (meta.page - 1) * meta.limit + 1;
  const end = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div>
      <div style={{ backgroundColor: '#fff', border: '1px solid #EBEBEB', borderRadius: '12px', padding: '16px', marginBottom: '16px', display: 'flex', flexWrap: 'wrap' as const, gap: '12px', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '4px' }}>
          <label style={{ fontSize: '12px', color: '#717171' }}>Company</label>
          <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Search company..." style={{ border: '1px solid #EBEBEB', borderRadius: '8px', padding: '8px 12px', fontSize: '14px', width: '180px', outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '4px' }}>
          <label style={{ fontSize: '12px', color: '#717171' }}>Role</label>
          <select value={role} onChange={e => setRole(e.target.value)} style={{ border: '1px solid #EBEBEB', borderRadius: '8px', padding: '8px 12px', fontSize: '14px', width: '180px', outline: 'none', backgroundColor: '#fff' }}>
            <option value="">All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '4px' }}>
          <label style={{ fontSize: '12px', color: '#717171' }}>Location</label>
          <select value={location} onChange={e => setLocation(e.target.value)} style={{ border: '1px solid #EBEBEB', borderRadius: '8px', padding: '8px 12px', fontSize: '14px', width: '160px', outline: 'none', backgroundColor: '#fff' }}>
            <option value="">All Locations</option>
            {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '4px' }}>
          <label style={{ fontSize: '12px', color: '#717171' }}>Currency</label>
          <div style={{ display: 'flex', border: '1px solid #EBEBEB', borderRadius: '8px', overflow: 'hidden' }}>
            {['INR','USD'].map(c => (
              <button key={c} onClick={() => setDisplayCurrency(c)} style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 500, border: 'none', cursor: 'pointer', backgroundColor: displayCurrency === c ? '#0369A1' : '#fff', color: displayCurrency === c ? '#fff' : '#484848' }}>{c}</button>
            ))}
          </div>
        </div>
        <button onClick={clearAll} style={{ fontSize: '12px', color: '#0369A1', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', paddingBottom: '8px' }}>Clear all</button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '8px', marginBottom: '16px' }}>
        {LEVELS.map(l => (
          <button key={l} onClick={() => toggleLevel(l)} style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', border: selectedLevels.includes(l) ? '1px solid #0369A1' : '1px solid #EBEBEB', backgroundColor: selectedLevels.includes(l) ? '#0369A1' : '#fff', color: selectedLevels.includes(l) ? '#fff' : '#484848' }}>
            {l.replace('_', '-')}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #EBEBEB', padding: '48px', textAlign: 'center' as const, color: '#717171' }}>Loading...</div>
      ) : data.length === 0 ? (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #EBEBEB', padding: '48px', textAlign: 'center' as const }}>
          <p style={{ color: '#484848', marginBottom: '8px' }}>No records found for these filters.</p>
          <button onClick={clearAll} style={{ color: '#0369A1', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}>Try removing a filter.</button>
        </div>
      ) : (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #EBEBEB', overflowX: 'auto' as const }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F7F7F7', borderBottom: '1px solid #EBEBEB' }}>
                {['Company','Role','Level','Location','Exp','Base','Bonus','Stock','Total Comp'].map((col, i) => (
                  <th key={col} onClick={() => i === 8 ? setSort(sort === 'total_comp_desc' ? 'total_comp_asc' : 'total_comp_desc') : undefined}
                    style={{ padding: '12px 16px', textAlign: 'left' as const, fontSize: '12px', fontWeight: 500, color: i === 8 ? '#0369A1' : '#717171', cursor: i === 8 ? 'pointer' : 'default', whiteSpace: 'nowrap' as const }}>
                    {col}{i === 8 ? (sort === 'total_comp_desc' ? ' \u2193' : ' \u2191') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row: any) => (
                <tr key={row.id} style={{ borderBottom: '1px solid #EBEBEB' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F7F7F7')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#222222' }}>
                    <a href={'/companies/' + row.company?.slug} style={{ color: '#222222', textDecoration: 'none' }}>{row.company?.name}</a>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#484848' }}>{row.role}</td>
                  <td style={{ padding: '12px 16px' }}><LevelBadge level={row.level} /></td>
                  <td style={{ padding: '12px 16px', color: '#484848' }}>{row.location}</td>
                  <td style={{ padding: '12px 16px', color: '#484848' }}>{row.experience_years}</td>
                  <td style={{ padding: '12px 16px' }}><SalaryCell amount={Number(row.base_salary)} currency={row.currency} displayCurrency={displayCurrency} /></td>
                  <td style={{ padding: '12px 16px' }}><SalaryCell amount={Number(row.bonus)} currency={row.currency} displayCurrency={displayCurrency} /></td>
                  <td style={{ padding: '12px 16px' }}><SalaryCell amount={Number(row.stock)} currency={row.currency} displayCurrency={displayCurrency} /></td>
                  <td style={{ padding: '12px 16px' }}><SalaryCell amount={Number(row.total_compensation)} currency={row.currency} displayCurrency={displayCurrency} dominant /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #EBEBEB' }}>
            <span style={{ fontSize: '12px', color: '#717171' }}>Showing {start}\u2013{end} of {meta.total} records</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '4px 12px', fontSize: '12px', border: '1px solid #EBEBEB', borderRadius: '6px', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, backgroundColor: '#fff' }}>Previous</button>
              <button disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: '4px 12px', fontSize: '12px', border: '1px solid #EBEBEB', borderRadius: '6px', cursor: page >= meta.totalPages ? 'not-allowed' : 'pointer', opacity: page >= meta.totalPages ? 0.4 : 1, backgroundColor: '#fff' }}>Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;

fs.writeFileSync('components/features/SalaryTable.tsx', salaryTable);
console.log('SalaryTable.tsx written');

// Fix config
const config = `export const INR_TO_USD = 0.012;
export const INR_TO_GBP = 0.0095;
export const INR_TO_EUR = 0.011;
export const ITEMS_PER_PAGE = 25;
export const CURRENCY_SYMBOLS: Record<string, string> = { INR: '₹', USD: '$', GBP: '£', EUR: '€' };
`;
fs.writeFileSync('lib/config.ts', config);
console.log('config.ts written');