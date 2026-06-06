import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LevelBadge from '@/components/ui/LevelBadge';
import SalaryCell from '@/components/ui/SalaryCell';
import { formatSalary } from '@/lib/utils';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const company = await prisma.company.findUnique({ where: { slug } });
  if (!company) return {};
  return {
    title: company.name + ' Salaries in India | TalentDash',
    description: 'View salary data for ' + company.name + ' employees in India.',
  };
}

const LEVEL_COLORS: Record<string, string> = {
  L3: '#94a3b8', SDE_I: '#94a3b8',
  L4: '#3b82f6', SDE_II: '#3b82f6',
  L5: '#6366f1', SDE_III: '#6366f1',
  L6: '#a855f7', STAFF: '#a855f7',
  IC4: '#3b82f6', IC5: '#6366f1',
  PRINCIPAL: '#1e1b4b',
};

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let data: any;
  try {
    const res = await fetch(
      process.env.NEXT_PUBLIC_BASE_URL + '/api/companies/' + slug,
      { cache: 'no-store' }
    );
    if (!res.ok) notFound();
    data = await res.json();
  } catch {
    notFound();
  }

  if (!data || data.error) notFound();

  const totalLevels = Object.values(data.level_distribution as Record<string, number>).reduce((a: number, b: number) => a + b, 0);

  return (
    <div>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #EBEBEB', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#222222', margin: 0 }}>{data.name}</h1>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '12px', marginTop: '8px', fontSize: '14px', color: '#717171' }}>
              {data.industry && <span style={{ backgroundColor: '#F7F7F7', padding: '2px 8px', borderRadius: '4px' }}>{data.industry}</span>}
              {data.headquarters && <span>📍 {data.headquarters}</span>}
              {data.founded_year && <span>Founded {data.founded_year}</span>}
              {data.headcount_range && <span>👥 {data.headcount_range}</span>}
            </div>
          </div>
          <div style={{ textAlign: 'right' as const }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#0369A1' }}>
              {formatSalary(data.median_total_compensation, 'INR', 'INR')}
            </div>
            <div style={{ fontSize: '12px', color: '#717171', marginTop: '4px' }}>
              Median Total Comp • {data.salaries.length} records
            </div>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #EBEBEB', padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#222222', margin: '0 0 16px 0' }}>Level Distribution</h2>
        <div style={{ display: 'flex', height: '24px', borderRadius: '999px', overflow: 'hidden', gap: '2px' }}>
          {Object.entries(data.level_distribution as Record<string, number>).map(([level, count]) => (
            <div key={level} style={{ width: ((count / totalLevels) * 100) + '%', backgroundColor: LEVEL_COLORS[level] || '#6b7280', height: '100%' }} title={level + ': ' + count} />
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '12px', marginTop: '12px' }}>
          {Object.entries(data.level_distribution as Record<string, number>).map(([level, count]) => (
            <div key={level} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
              <LevelBadge level={level} />
              <span>{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #EBEBEB', overflowX: 'auto' as const }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #EBEBEB' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#222222', margin: 0 }}>Compensation Records</h2>
          <a href={'/compare?c1=' + slug} style={{ fontSize: '14px', color: '#0369A1', border: '1px solid #0369A1', padding: '4px 12px', borderRadius: '8px', textDecoration: 'none' }}>
            Compare
          </a>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#F7F7F7' }}>
              {['Role','Level','Location','Exp','Base','Bonus','Stock','Total Comp'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left' as const, fontSize: '12px', fontWeight: 500, color: '#717171', borderBottom: '1px solid #EBEBEB' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.salaries.map((row: any) => (
              <tr key={row.id} style={{ borderBottom: '1px solid #EBEBEB' }}>
                <td style={{ padding: '12px 16px', color: '#484848' }}>{row.role}</td>
                <td style={{ padding: '12px 16px' }}><LevelBadge level={row.level} /></td>
                <td style={{ padding: '12px 16px', color: '#484848' }}>{row.location}</td>
                <td style={{ padding: '12px 16px', color: '#484848' }}>{row.experience_years}y</td>
                <td style={{ padding: '12px 16px' }}><SalaryCell amount={Number(row.base_salary)} currency={row.currency} displayCurrency="INR" /></td>
                <td style={{ padding: '12px 16px' }}><SalaryCell amount={Number(row.bonus)} currency={row.currency} displayCurrency="INR" /></td>
                <td style={{ padding: '12px 16px' }}><SalaryCell amount={Number(row.stock)} currency={row.currency} displayCurrency="INR" /></td>
                <td style={{ padding: '12px 16px' }}><SalaryCell amount={Number(row.total_compensation)} currency={row.currency} displayCurrency="INR" dominant /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
