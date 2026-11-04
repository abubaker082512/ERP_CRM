import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/super-admin/',
          '/billing/',
          '/checkout/',
          '/_next/',
          '/*?ref=*',
          '/*?utm_*',
          '/*.woff2$',
          '/*.webmanifest$',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/super-admin/',
          '/billing/',
          '/checkout/',
          '/_next/',
          '/*?ref=*',
          '/*?utm_*',
          '/*.woff2$',
          '/*.webmanifest$',
        ],
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
