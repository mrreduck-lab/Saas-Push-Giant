import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import PushPrompt from './components/PushPrompt';
import './globals.css';
import './overrides.css';
import './no-parallax.css';

const display = Cormorant_Garamond({
  subsets: ['cyrillic', 'latin'],
  variable: '--font-display',
  weight: ['400', '500', '600'],
  display: 'swap',
});

const sans = Manrope({
  subsets: ['cyrillic', 'latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Raschini — Сила спокойствия',
  description: 'Неаполитанское портновское искусство и современный стиль Raschini.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Raschini',
  },
};

export const viewport: Viewport = {
  themeColor: '#090806',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${display.variable} ${sans.variable}`}>
      <body>{children}<PushPrompt /></body>
    </html>
  );
}
