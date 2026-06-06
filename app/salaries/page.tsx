import { Suspense } from 'react';
import { Metadata } from 'next';
import SalaryTable from '@/components/features/SalaryTable';

export const metadata: Metadata = {
  title: 'Software Engineer Salaries in India — All Levels | TalentDash',
  description: 'Browse structured salary data for tech roles across Google, Amazon, Flipkart and more.',
  alternates: { canonical: 'https://talentdash.vercel.app/salaries' },
  openGraph: {
    title: 'Software Engineer Salaries in India | TalentDash',
    description: 'Structured compensation data for Indian tech professionals.',
    url: 'https://talentdash.vercel.app/salaries',
  },
};

async function getSalaries() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/salaries?limit=25&sort=total_comp_desc`,
      { cache: 'no-store' }
    );
    return await res.json();
  } catch {
    return { data: [], meta: { total: 0, page: 1, limit: 25, totalPages: 0 } };
  }
}

export default async function SalariesPage() {
  const { data, meta } = await getSalaries();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'TalentDash India Salary Data',
    description: 'Structured salary records for tech professionals in India',
    url: 'https://talentdash.vercel.app/salaries',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-deep-text">Salary Data</h1>
        <p className="text-muted-text mt-1">
          Structured compensation records from contributors and public sources.
        </p>
      </div>
      <Suspense fallback={<div className="text-muted-text">Loading...</div>}>
        <SalaryTable
          initialData={data || []}
          initialMeta={meta || { total: 0, page: 1, limit: 25, totalPages: 0 }}
        />
      </Suspense>
    </>
  );
}