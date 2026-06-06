import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const s1 = searchParams.get('s1');
  const s2 = searchParams.get('s2');

  if (!s1 || !s2) return NextResponse.json({ error: true, message: 's1 and s2 are required' }, { status: 400 });
  if (s1 === s2) return NextResponse.json({ error: true, message: 'IDs must be different' }, { status: 400 });

  const [r1, r2] = await Promise.all([
    prisma.salary.findUnique({ where: { id: s1 }, include: { company: true } }),
    prisma.salary.findUnique({ where: { id: s2 }, include: { company: true } }),
  ]);

  if (!r1) return NextResponse.json({ error: true, message: 'Record ' + s1 + ' not found' }, { status: 404 });
  if (!r2) return NextResponse.json({ error: true, message: 'Record ' + s2 + ' not found' }, { status: 404 });

  const delta = {
    base_delta: Number(r1.base_salary) - Number(r2.base_salary),
    bonus_delta: Number(r1.bonus) - Number(r2.bonus),
    stock_delta: Number(r1.stock) - Number(r2.stock),
    tc_delta: Number(r1.total_compensation) - Number(r2.total_compensation),
    experience_delta: r1.experience_years - r2.experience_years,
  };

  const serialize = (r: any) => ({
    ...r,
    base_salary: r.base_salary.toString(),
    bonus: r.bonus.toString(),
    stock: r.stock.toString(),
    total_compensation: r.total_compensation.toString(),
  });

  return NextResponse.json({ record1: serialize(r1), record2: serialize(r2), delta });
}
