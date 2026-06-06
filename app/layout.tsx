import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TalentDash — India Salary Intelligence',
  description: 'Structured, comparable, decision-ready compensation data for Indian professionals.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#F7F7F7', margin: 0, fontFamily: 'Inter, system-ui, sans-serif' }}>
        <nav style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #EBEBEB',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          <div style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 24px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <a href="/" style={{ fontSize: '20px', fontWeight: 700, color: '#FF5A5F', textDecoration: 'none' }}>
              TalentDash
            </a>
            <div style={{ display: 'flex', gap: '24px' }}>
              <a href="/salaries" style={{ fontSize: '14px', fontWeight: 500, color: '#484848', textDecoration: 'none' }}>
                Salaries
              </a>
              <a href="/compare" style={{ fontSize: '14px', fontWeight: 500, color: '#484848', textDecoration: 'none' }}>
                Compare
              </a>
            </div>
          </div>
        </nav>
        <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
          {children}
        </main>
      </body>
    </html>
  );
}