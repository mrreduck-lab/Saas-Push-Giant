import { marketingMetadata } from '../route-metadata';

export const metadata = marketingMetadata(
  'PWA и push-уведомления для 1С-Битрикс',
  'Модуль Push Giant для сайтов и интернет-магазинов на 1С-Битрикс: PWA, web push, CRM-события и диагностика.',
  '/bitrix',
);

export default function BitrixLayout({ children }: { children: React.ReactNode }) {
  return children;
}
