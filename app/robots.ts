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
        userAgent: 'Googlebot-Image',
        allow: ['/icon.png', '/icon-192.png', '/icon-48.png', '/apple-touch-icon.png', '/favicon.ico', '/logo.png', '/logo2.png', '/logo-full.png', '/logo-full-suite.png', '/og-image.png'],
      }
    ],
    sitemap: 'https://www.beraxis.online/sitemap.xml',
  };
}
