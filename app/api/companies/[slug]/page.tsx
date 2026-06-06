
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LevelBadge from '@/components/ui/LevelBadge';
import SalaryCell from '@/components/ui/SalaryCell';
import { formatSalary } from '@/lib/utils';
import { prisma } from '@/lib/db';
import { mkdir } from 'fs/promises';

export async function generateStaticParams() {
  const companies = await prisma.company.findMany({ select: { slug: true } });
  return companies.map(c => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const company = await prisma.company.findUnique({ where: { slug: params.slug } });
  if (!company) return {};
  return {
    title: `${company.name} Salaries in India | TalentDash`,
    description: `View salary data, levels, and compensation ranges for ${company.name} employees in India.`,
    alternates: { canonical: `https://talentdash.vercel.app/companies/${params.slug}` },
  };
}

export default async function CompanyPage({ params }: { params: { slug: string } }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/companies/${params.slug}`, { cache: 'no-store' });
  if (!res.ok) notFound();
  const data = await res.json();

  const totalLevels = Object.values(data.level_distribution as Record<string, number>).reduce((a, b) => a + b, 0);

  return (
    <div>
      {/* Company Header */}
      <div className="bg-white rounded-xl border border-border p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-deep-text">{data.name}</h1>
            <div className="flex gap-3 mt-2 text-sm text-muted-text">
              {data.industry && <span className="bg-app-bg px-2 py-0.5 rounded">{data.industry}</span>}
              {data.headquarters && <span>📍 {data.headquarters}</span>}
              {data.founded_year && <span>Founded {data.founded_year}</span>}
              {data.headcount_range && <span>👥 {data.headcount_range}</span>}
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-data-blue">
              {formatSalary(data.median_total_compensation, 'INR', 'INR')}
            </div>
            <div className="text-xs text-muted-text mt-1">Median Total Comp • {data.salaries.length} records</div>
          </div>
        </div>
      </div>

      {/* Level Distribution */}
      <div className="bg-white rounded-xl border border-border p-6 mb-6">
        <h2 className="text-lg font-semibold text-deep-text mb-4">Level Distribution</h2>
        <div className="flex h-6 rounded-full overflow-hidden gap-0.5">
          {Object.entries(data.level_distribution as Record<string, number>).map(([level, count]) => {
            const pct = (count / totalLevels) * 100;
            return <div key={level} style={{ width: `${pct}%` }} className="bg-data-blue opacity-80 hover:opacity-100 transition-opacity" title={`${level}: ${count}`} />;
          })}
        </div>
        <div className="flex flex-wrap gap-3 mt-3">
          {Object.entries(data.level_distribution as Record<string, number>).map(([level, count]) => (
            <div key={level} className="flex items-center gap-1 text-xs text-body-text">
              <LevelBadge level={level} /> <span>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Salary Table */}
      <div className="bg-white rounded-xl border border-border overflow-x-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-deep-text">Compensation Records</h2>
          <a href={`/compare?c1=${params.slug}`} className="text-sm text-data-blue border border-data-blue px-3 py-1 rounded-lg hover:bg-data-blue hover:text-white transition-colors">Compare</a>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-app-bg border-b border-border">
              {['Role','Level','Location','Exp','Base','Stock','Total Comp'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-text">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.salaries.map((row: any) => (
              <tr key={row.id} className="border-b border-border hover:bg-hover-surface">
                <td className="px-4 py-3 text-body-text">{row.role}</td>
                <td className="px-4 py-3"><LevelBadge level={row.level} /></td>
                <td className="px-4 py-3 text-body-text">{row.location}</td>
                <td className="px-4 py-3 text-body-text">{row.experience_years}y</td>
                <td className="px-4 py-3"><SalaryCell amount={Number(row.base_salary)} currency={row.currency} displayCurrency="INR" /></td>
                <td className="px-4 py-3"><SalaryCell amount={Number(row.stock)} currency={row.currency} displayCurrency="INR" /></td>
                <td className="px-4 py-3"><SalaryCell amount={Number(row.total_compensation)} currency={row.currency} displayCurrency="INR" dominant /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
