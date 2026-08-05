import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const updatedAt = new Date();
  return [
    { url: 'https://pushgiant.ru', lastModified: updatedAt, changeFrequency: 'weekly', priority: 1 },
    { url: 'https://pushgiant.ru/pricing', lastModified: updatedAt, changeFrequency: 'monthly', priority: 0.9 },
    { url: 'https://pushgiant.ru/wordpress', lastModified: updatedAt, changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://pushgiant.ru/bitrix', lastModified: updatedAt, changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://pushgiant.ru/docs', lastModified: updatedAt, changeFrequency: 'weekly', priority: 0.8 },
  ];
}
