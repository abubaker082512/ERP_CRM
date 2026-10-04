import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/super-admin/', '/api/'],
    },
    sitemap: 'https://erp-crm-puce.vercel.app/sitemap.xml',
  };
}
