
export default function Home() {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold text-deep-text mb-4">India's Salary Intelligence Platform</h1>
      <p className="text-body-text text-lg mb-8">Structured, comparable, decision-ready compensation data.</p>
      <div className="flex gap-4 justify-center">
        <a href="/salaries" className="bg-coral text-white px-6 py-3 rounded-xl font-semibold hover:bg-opacity-90 transition-colors">Browse Salaries</a>
        <a href="/compare" className="border border-border text-body-text px-6 py-3 rounded-xl font-semibold hover:border-coral transition-colors">Compare Offers</a>
      </div>
    </div>
  );
}
