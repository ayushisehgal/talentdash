
import { PrismaClient, Level, Currency, Source } from '@prisma/client';

const prisma = new PrismaClient();

function normalizeCompanyName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s*(pvt\.?|ltd\.?|inc\.?|llc\.?|private|limited|technologies|internet|india|web services|bpo|\.com)\s*/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(name: string): string {
  return name.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

const companies = [
  { name: 'Google', slug: 'google', normalized_name: 'google', industry: 'Technology', headquarters: 'Bengaluru', founded_year: 1998, headcount_range: '10000+' },
  { name: 'Amazon', slug: 'amazon', normalized_name: 'amazon', industry: 'Technology', headquarters: 'Bengaluru', founded_year: 1994, headcount_range: '10000+' },
  { name: 'Meta', slug: 'meta', normalized_name: 'meta', industry: 'Technology', headquarters: 'Mumbai', founded_year: 2004, headcount_range: '5000-10000' },
  { name: 'Microsoft', slug: 'microsoft', normalized_name: 'microsoft', industry: 'Technology', headquarters: 'Hyderabad', founded_year: 1975, headcount_range: '10000+' },
  { name: 'Flipkart', slug: 'flipkart', normalized_name: 'flipkart', industry: 'E-Commerce', headquarters: 'Bengaluru', founded_year: 2007, headcount_range: '5000-10000' },
  { name: 'Meesho', slug: 'meesho', normalized_name: 'meesho', industry: 'E-Commerce', headquarters: 'Bengaluru', founded_year: 2015, headcount_range: '1000-5000' },
  { name: 'NVIDIA', slug: 'nvidia', normalized_name: 'nvidia', industry: 'Semiconductors', headquarters: 'Pune', founded_year: 1993, headcount_range: '1000-5000' },
  { name: 'TCS', slug: 'tcs', normalized_name: 'tcs', industry: 'IT Services', headquarters: 'Mumbai', founded_year: 1968, headcount_range: '10000+' },
  { name: 'Infosys', slug: 'infosys', normalized_name: 'infosys', industry: 'IT Services', headquarters: 'Bengaluru', founded_year: 1981, headcount_range: '10000+' },
  { name: 'Razorpay', slug: 'razorpay', normalized_name: 'razorpay', industry: 'Fintech', headquarters: 'Bengaluru', founded_year: 2014, headcount_range: '1000-5000' },
];

const salaryData = [
  // Google
  { companySlug: 'google', role: 'Software Engineer', level: Level.L3, location: 'Bengaluru', currency: Currency.INR, experience_years: 1, base_salary: 2000000n, bonus: 400000n, stock: 600000n, source: Source.CONTRIBUTOR, confidence_score: 0.95 },
  { companySlug: 'google', role: 'Software Engineer', level: Level.L4, location: 'Bengaluru', currency: Currency.INR, experience_years: 3, base_salary: 3200000n, bonus: 700000n, stock: 1200000n, source: Source.CONTRIBUTOR, confidence_score: 0.95 },
  { companySlug: 'google', role: 'Software Engineer', level: Level.L5, location: 'Bengaluru', currency: Currency.INR, experience_years: 6, base_salary: 4800000n, bonus: 1200000n, stock: 2400000n, source: Source.CONTRIBUTOR, confidence_score: 0.9 },
  { companySlug: 'google', role: 'Software Engineer', level: Level.L6, location: 'Mumbai', currency: Currency.INR, experience_years: 10, base_salary: 7000000n, bonus: 2000000n, stock: 4000000n, source: Source.SCRAPED, confidence_score: 0.8 },
  { companySlug: 'google', role: 'Product Manager', level: Level.L5, location: 'Bengaluru', currency: Currency.INR, experience_years: 7, base_salary: 5500000n, bonus: 1500000n, stock: 3000000n, source: Source.CONTRIBUTOR, confidence_score: 0.9 },
  { companySlug: 'google', role: 'Software Engineer', level: Level.L4, location: 'San Francisco', currency: Currency.USD, experience_years: 4, base_salary: 18000000n, bonus: 3000000n, stock: 6000000n, source: Source.CONTRIBUTOR, confidence_score: 0.95 },
  // Amazon
  { companySlug: 'amazon', role: 'Software Engineer', level: Level.SDE_I, location: 'Bengaluru', currency: Currency.INR, experience_years: 1, base_salary: 1800000n, bonus: 300000n, stock: 500000n, source: Source.CONTRIBUTOR, confidence_score: 0.9 },
  { companySlug: 'amazon', role: 'Software Engineer', level: Level.SDE_II, location: 'Bengaluru', currency: Currency.INR, experience_years: 4, base_salary: 3000000n, bonus: 600000n, stock: 1000000n, source: Source.CONTRIBUTOR, confidence_score: 0.9 },
  { companySlug: 'amazon', role: 'Software Engineer', level: Level.SDE_III, location: 'Hyderabad', currency: Currency.INR, experience_years: 8, base_salary: 5000000n, bonus: 1200000n, stock: 2500000n, source: Source.SCRAPED, confidence_score: 0.75 },
  { companySlug: 'amazon', role: 'Data Engineer', level: Level.SDE_II, location: 'Bengaluru', currency: Currency.INR, experience_years: 5, base_salary: 2800000n, bonus: 500000n, stock: 900000n, source: Source.CONTRIBUTOR, confidence_score: 0.85 },
  { companySlug: 'amazon', role: 'Software Engineer', level: Level.SDE_I, location: 'Pune', currency: Currency.INR, experience_years: 2, base_salary: 1900000n, bonus: 0n, stock: 400000n, source: Source.SCRAPED, confidence_score: 0.7 },
  { companySlug: 'amazon', role: 'Software Engineer', level: Level.SDE_II, location: 'London', currency: Currency.GBP, experience_years: 5, base_salary: 9500000n, bonus: 1500000n, stock: 3000000n, source: Source.CONTRIBUTOR, confidence_score: 0.85 },
  // Meta
  { companySlug: 'meta', role: 'Software Engineer', level: Level.IC4, location: 'Bengaluru', currency: Currency.INR, experience_years: 5, base_salary: 4500000n, bonus: 1000000n, stock: 2000000n, source: Source.CONTRIBUTOR, confidence_score: 0.9 },
  { companySlug: 'meta', role: 'Software Engineer', level: Level.IC5, location: 'Bengaluru', currency: Currency.INR, experience_years: 9, base_salary: 6500000n, bonus: 1800000n, stock: 4000000n, source: Source.CONTRIBUTOR, confidence_score: 0.9 },
  { companySlug: 'meta', role: 'Product Manager', level: Level.IC4, location: 'Mumbai', currency: Currency.INR, experience_years: 6, base_salary: 5000000n, bonus: 1200000n, stock: 2500000n, source: Source.SCRAPED, confidence_score: 0.75 },
  // Microsoft
  { companySlug: 'microsoft', role: 'Software Engineer', level: Level.L4, location: 'Hyderabad', currency: Currency.INR, experience_years: 3, base_salary: 2800000n, bonus: 550000n, stock: 1000000n, source: Source.CONTRIBUTOR, confidence_score: 0.9 },
  { companySlug: 'microsoft', role: 'Software Engineer', level: Level.L5, location: 'Hyderabad', currency: Currency.INR, experience_years: 7, base_salary: 4200000n, bonus: 1000000n, stock: 2000000n, source: Source.CONTRIBUTOR, confidence_score: 0.85 },
  { companySlug: 'microsoft', role: 'Software Engineer', level: Level.PRINCIPAL, location: 'Bengaluru', currency: Currency.INR, experience_years: 15, base_salary: 9000000n, bonus: 3000000n, stock: 6000000n, source: Source.CONTRIBUTOR, confidence_score: 0.9 },
  { companySlug: 'microsoft', role: 'Data Analyst', level: Level.L3, location: 'Hyderabad', currency: Currency.INR, experience_years: 2, base_salary: 1500000n, bonus: 200000n, stock: 0n, source: Source.SCRAPED, confidence_score: 0.7 },
  // Flipkart
  { companySlug: 'flipkart', role: 'Software Engineer', level: Level.SDE_I, location: 'Bengaluru', currency: Currency.INR, experience_years: 1, base_salary: 1600000n, bonus: 250000n, stock: 300000n, source: Source.CONTRIBUTOR, confidence_score: 0.85 },
  { companySlug: 'flipkart', role: 'Software Engineer', level: Level.SDE_II, location: 'Bengaluru', currency: Currency.INR, experience_years: 4, base_salary: 2600000n, bonus: 500000n, stock: 800000n, source: Source.CONTRIBUTOR, confidence_score: 0.85 },
  { companySlug: 'flipkart', role: 'Product Manager', level: Level.L4, location: 'Bengaluru', currency: Currency.INR, experience_years: 5, base_salary: 3500000n, bonus: 800000n, stock: 1500000n, source: Source.SCRAPED, confidence_score: 0.7 },
  // Meesho
  { companySlug: 'meesho', role: 'Software Engineer', level: Level.SDE_I, location: 'Bengaluru', currency: Currency.INR, experience_years: 2, base_salary: 1400000n, bonus: 200000n, stock: 400000n, source: Source.CONTRIBUTOR, confidence_score: 0.8 },
  { companySlug: 'meesho', role: 'Software Engineer', level: Level.SDE_II, location: 'Bengaluru', currency: Currency.INR, experience_years: 5, base_salary: 2400000n, bonus: 400000n, stock: 700000n, source: Source.CONTRIBUTOR, confidence_score: 0.8 },
  { companySlug: 'meesho', role: 'Data Analyst', level: Level.L3, location: 'Bengaluru', currency: Currency.INR, experience_years: 2, base_salary: 1200000n, bonus: 0n, stock: 0n, source: Source.SCRAPED, confidence_score: 0.65 },
  // NVIDIA
  { companySlug: 'nvidia', role: 'Software Engineer', level: Level.L5, location: 'Pune', currency: Currency.INR, experience_years: 8, base_salary: 6000000n, bonus: 1500000n, stock: 8000000n, source: Source.CONTRIBUTOR, confidence_score: 0.9 },
  { companySlug: 'nvidia', role: 'Software Engineer', level: Level.L4, location: 'Pune', currency: Currency.INR, experience_years: 4, base_salary: 3800000n, bonus: 800000n, stock: 3000000n, source: Source.CONTRIBUTOR, confidence_score: 0.85 },
  // TCS
  { companySlug: 'tcs', role: 'Software Engineer', level: Level.L3, location: 'Mumbai', currency: Currency.INR, experience_years: 1, base_salary: 700000n, bonus: 50000n, stock: 0n, source: Source.CONTRIBUTOR, confidence_score: 0.85 },
  { companySlug: 'tcs', role: 'Software Engineer', level: Level.L4, location: 'Bengaluru', currency: Currency.INR, experience_years: 4, base_salary: 1100000n, bonus: 100000n, stock: 0n, source: Source.CONTRIBUTOR, confidence_score: 0.85 },
  { companySlug: 'tcs', role: 'Data Analyst', level: Level.L3, location: 'Pune', currency: Currency.INR, experience_years: 2, base_salary: 800000n, bonus: 60000n, stock: 0n, source: Source.SCRAPED, confidence_score: 0.7 },
  // Infosys
  { companySlug: 'infosys', role: 'Software Engineer', level: Level.L3, location: 'Bengaluru', currency: Currency.INR, experience_years: 1, base_salary: 750000n, bonus: 60000n, stock: 0n, source: Source.CONTRIBUTOR, confidence_score: 0.85 },
  { companySlug: 'infosys', role: 'Software Engineer', level: Level.L4, location: 'Hyderabad', currency: Currency.INR, experience_years: 5, base_salary: 1300000n, bonus: 120000n, stock: 0n, source: Source.CONTRIBUTOR, confidence_score: 0.8 },
  // Razorpay
  { companySlug: 'razorpay', role: 'Software Engineer', level: Level.SDE_II, location: 'Bengaluru', currency: Currency.INR, experience_years: 4, base_salary: 2800000n, bonus: 600000n, stock: 1200000n, source: Source.CONTRIBUTOR, confidence_score: 0.9 },
  { companySlug: 'razorpay', role: 'Software Engineer', level: Level.STAFF, location: 'Bengaluru', currency: Currency.INR, experience_years: 10, base_salary: 5500000n, bonus: 1500000n, stock: 3500000n, source: Source.CONTRIBUTOR, confidence_score: 0.9 },
  { companySlug: 'razorpay', role: 'Product Manager', level: Level.L4, location: 'Bengaluru', currency: Currency.INR, experience_years: 6, base_salary: 3200000n, bonus: 800000n, stock: 1500000n, source: Source.SCRAPED, confidence_score: 0.75 },
];

async function main() {
  console.log('Seeding database...');

  for (const c of companies) {
    await prisma.company.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  await prisma.salary.deleteMany();

  for (const s of salaryData) {
    const company = await prisma.company.findUnique({ where: { slug: s.companySlug } });
    if (!company) continue;
    const total_compensation = s.base_salary + (s.bonus ?? 0n) + (s.stock ?? 0n);
    await prisma.salary.create({
      data: {
        company_id: company.id,
        role: s.role,
        level: s.level,
        location: s.location,
        currency: s.currency,
        experience_years: s.experience_years,
        base_salary: s.base_salary,
        bonus: s.bonus ?? 0n,
        stock: s.stock ?? 0n,
        total_compensation,
        source: s.source,
        confidence_score: s.confidence_score,
        is_verified: s.source === Source.CONTRIBUTOR,
      },
    });
  }

  console.log('Seeding complete.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
