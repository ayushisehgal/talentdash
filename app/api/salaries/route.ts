import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const company = searchParams.get('company') || '';
  const role = searchParams.get('role') || '';
  const level = searchParams.get('level') || '';
  const location = searchParams.get('location') || '';
  const sort = searchParams.get('sort') || 'total_comp_desc';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '25')));
  const skip = (page - 1) * limit;

  const where: any = {};
  if (company) where.company = { normalized_name: { contains: company.toLowerCase() } };
  if (role) where.role = { contains: role, mode: 'insensitive' };
  if (level) where.level = level;
  if (location) where.location = { contains: location, mode: 'insensitive' };

  const orderBy: any =
    sort === 'total_comp_asc' ? { total_compensation: 'asc' } :
    sort === 'date_desc' ? { submitted_at: 'desc' } :
    { total_compensation: 'desc' };

  const [records, total] = await Promise.all([
    prisma.salary.findMany({ where, orderBy, skip, take: limit, include: { company: true } }),
    prisma.salary.count({ where }),
  ]);

  const response = NextResponse.json({
    data: records.map(r => ({ ...r, base_salary: r.base_salary.toString(), bonus: r.bonus.toString(), stock: r.stock.toString(), total_compensation: r.total_compensation.toString() })),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });

  response.headers.set('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
  return response;
}
