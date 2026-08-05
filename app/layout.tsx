import type { Metadata, Viewport } from 'next';
import './base.css';
import './pushgiant-critical.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://pushgiant.ru'),
  applicationName: 'Push Giant',
  title: {
    default: 'Push Giant — PWA и push-уведомления для сайтов',
    template: '%s | Push Giant',
  },
  description: 'Платформа мобильного маркетинга: PWA-приложение, web push-уведомления, сегментация, аналитика и интеграции с WordPress и другими CMS.',
  keywords: [
    'PWA для сайта',
    'push-уведомления',
    'web push',
    'мобильное приложение для сайта',
    'PWA платформа',
    'push-рассылки',
    'WordPress push plugin',
  ],
  authors: [{ name: 'Push Giant', url: 'https://pushgiant.ru' }],
  creator: 'Push Giant',
  publisher: 'Push Giant',
  category: 'technology',
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'Push Giant',
    title: 'Push Giant — PWA и push-уведомления для сайтов',
    description: 'Превратите сайт в PWA-приложение и запускайте персональные push-уведомления без разработки нового сайта.',
    url: 'https://pushgiant.ru',
    images: [{ url: '/brand/icon-512.png', width: 512, height: 512, alt: 'Push Giant' }],
  },
  twitter: {
    card: 'summary',
    title: 'Push Giant — PWA и push-уведомления для сайтов',
    description: 'PWA, web push, сегментация, аналитика и CMS-интеграции в одной платформе.',
    images: ['/brand/icon-512.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: [
      { url: '/brand/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/brand/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/brand/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Push Giant',
  },
};

export const viewport: Viewport = {
  themeColor: '#f6f3ee',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
