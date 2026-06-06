
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { computeMedian } from '@/lib/utils';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const company = await prisma.company.findUnique({
    where: { slug: params.slug },
    include: { salaries: { orderBy: { total_compensation: 'desc' } } },
  });

  if (!company) return NextResponse.json({ error: true, message: 'Company not found' }, { status: 404 });

  const tcValues = company.salaries.map(s => Number(s.total_compensation));
  const median_total_compensation = computeMedian(tcValues);

  const level_distribution: Record<string, number> = {};
  for (const s of company.salaries) {
    level_distribution[s.level] = (level_distribution[s.level] || 0) + 1;
  }

  const response = NextResponse.json({
    ...company,
    salaries: company.salaries.map(s => ({ ...s, base_salary: s.base_salary.toString(), bonus: s.bonus.toString(), stock: s.stock.toString(), total_compensation: s.total_compensation.toString() })),
    median_total_compensation,
    level_distribution,
  });

  response.headers.set('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  return response;
}
