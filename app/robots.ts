import { MetadataRoute } from 'next/types';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://molendadevelopment.pl';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
