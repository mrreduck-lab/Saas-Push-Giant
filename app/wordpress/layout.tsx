import { marketingMetadata } from '../route-metadata';

export const metadata = marketingMetadata(
  'Push-уведомления и PWA для WordPress',
  'Плагин Push Giant для WordPress и WooCommerce: PWA, service worker, web push и синхронизация пользователей.',
  '/wordpress',
);

export default function WordPressLayout({ children }: { children: React.ReactNode }) {
  return children;
}
