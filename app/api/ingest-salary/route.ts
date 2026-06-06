import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { normalizeCompanyName, slugify } from '@/lib/utils';

const VALID_LEVELS = ['L3','L4','L5','L6','SDE_I','SDE_II','SDE_III','STAFF','PRINCIPAL','IC4','IC5'];
const VALID_CURRENCIES = ['INR','USD','GBP','EUR'];
const VALID_SOURCES = ['CONTRIBUTOR','SCRAPED','AI_INFERRED'];

export async function POST(req: NextRequest) {
  const body = await req.json();
  const errors: { field: string; message: string }[] = [];

  if (!body.company) errors.push({ field: 'company', message: 'Company is required' });
  if (!body.role) errors.push({ field: 'role', message: 'Role is required' });
  if (!body.level) errors.push({ field: 'level', message: 'Level is required' });
  if (body.level && !VALID_LEVELS.includes(body.level)) errors.push({ field: 'level', message: 'Level must be one of: ' + VALID_LEVELS.join(', ') });
  if (!body.location) errors.push({ field: 'location', message: 'Location is required' });
  if (!body.currency || !VALID_CURRENCIES.includes(body.currency)) errors.push({ field: 'currency', message: 'Invalid currency' });
  if (!body.source || !VALID_SOURCES.includes(body.source)) errors.push({ field: 'source', message: 'Invalid source' });
  if (body.experience_years === undefined || body.experience_years <= 0 || body.experience_years > 50) errors.push({ field: 'experience_years', message: 'experience_years must be between 1 and 50' });
  if (!body.base_salary || body.base_salary <= 0) errors.push({ field: 'base_salary', message: 'base_salary must be greater than 0' });
  if (body.confidence_score === undefined || body.confidence_score < 0 || body.confidence_score > 1) errors.push({ field: 'confidence_score', message: 'confidence_score must be between 0.0 and 1.0' });

  if (errors.length > 0) return NextResponse.json({ error: true, errors }, { status: 400 });

  const normalized = normalizeCompanyName(body.company);
  const slug = slugify(normalized);

  let company = await prisma.company.findFirst({ where: { normalized_name: normalized } });
  if (!company) {
    company = await prisma.company.create({
      data: { name: body.company, slug, normalized_name: normalized, industry: body.industry || null, headquarters: body.headquarters || null },
    });
  }

  const base = BigInt(body.base_salary);
  const bonus = BigInt(body.bonus ?? 0);
  const stock = BigInt(body.stock ?? 0);
  const total_compensation = base + bonus + stock;

  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const existing = await prisma.salary.findFirst({
    where: { company_id: company.id, role: body.role, level: body.level, location: body.location, submitted_at: { gte: fortyEightHoursAgo } },
  });

  if (existing) {
    const diff = Math.abs(Number(existing.base_salary) - Number(base)) / Number(base);
    if (diff <= 0.1) return NextResponse.json({ error: true, message: 'Duplicate record detected within 48 hours' }, { status: 409 });
  }

  const record = await prisma.salary.create({
    data: { company_id: company.id, role: body.role, level: body.level, location: body.location, currency: body.currency, experience_years: body.experience_years, base_salary: base, bonus, stock, total_compensation, source: body.source, confidence_score: body.confidence_score, is_verified: false },
    include: { company: true },
  });

  return NextResponse.json({
    ...record,
    base_salary: record.base_salary.toString(),
    bonus: record.bonus.toString(),
    stock: record.stock.toString(),
    total_compensation: record.total_compensation.toString(),
  }, { status: 201 });
}
