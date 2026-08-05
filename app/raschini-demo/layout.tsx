import type { Metadata } from 'next';
import '../globals.css';
import '../overrides.css';
import '../no-parallax.css';

export const metadata: Metadata = {
  title: 'Demo tenant',
  robots: { index: false, follow: false, nocache: true },
};

export default function DemoTenantLayout({ children }: { children: React.ReactNode }) {
  return children;
}
