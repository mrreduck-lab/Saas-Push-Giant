import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/pricing', '/wordpress', '/bitrix', '/docs'],
      disallow: ['/api/', '/dashboard', '/admin', '/login', '/register', '/push-admin', '/debug-push', '/raschini-demo'],
    },
    sitemap: 'https://pushgiant.ru/sitemap.xml',
    host: 'https://pushgiant.ru',
  };
}
