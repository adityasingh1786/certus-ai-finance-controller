import type { Metadata } from 'next';
import './globals.css';
import ParticleBackground from '@/components/ParticleBackground';

export const metadata: Metadata = {
  title: 'AI Finance Controller | Razorpay AI Buildathon 2026',
  description:
    'Autonomous, dual-gated financial reconciliation and predictive cash forecasting engine. Provable reliability at the trust boundary.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#05070d] text-slate-100 min-h-screen relative selection:bg-cyan-500 selection:text-black">
        <div className="fixed inset-0 space-grid-bg pointer-events-none z-0" />
        <ParticleBackground />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
