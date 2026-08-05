import { marketingMetadata } from '../route-metadata';

export const metadata = marketingMetadata(
  'Тарифы на PWA и push-уведомления',
  'Тарифы Push Giant для запуска PWA-приложения, web push-рассылок, сегментации и аналитики.',
  '/pricing',
);

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
