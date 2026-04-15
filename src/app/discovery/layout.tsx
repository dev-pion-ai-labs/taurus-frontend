import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AI Readiness Scanner — Taurus',
  description:
    'Get an instant AI maturity score for your company. Paste your URL and discover your AI readiness in seconds.',
};

export default function DiscoveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F5F5F4]">
      <header className="flex items-center justify-between px-6 py-4 lg:px-12">
        <Link href="/" className="text-[20px] font-bold text-[#1C1917]">
          Taurus
        </Link>
        <Link
          href="/login"
          className="rounded-lg bg-[#1C1917] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#292524]"
        >
          Sign in
        </Link>
      </header>
      <main>{children}</main>
    </div>
  );
}
