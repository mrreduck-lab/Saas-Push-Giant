import { marketingMetadata } from '../route-metadata';

export const metadata = marketingMetadata(
  'Документация Push Giant',
  'Документация по API, JavaScript SDK, PWA, service worker, подпискам и интеграции web push.',
  '/docs',
);

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
