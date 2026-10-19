import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/super-admin/', '/billing/', '/checkout/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/super-admin/', '/billing/', '/checkout/'],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
        disallow: ['/api/'],
      }
    ],
    sitemap: 'https://www.beraxis.online/sitemap.xml',
  };
}
