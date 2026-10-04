import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://erp-crm-puce.vercel.app';

  const routes = [
    '',
    '/pricing',
    '/about',
    '/contact',
    '/apps',
    '/billing',
    '/team',
    '/login',
    '/signup',
    '/crm',
    '/sales',
    '/inventory',
    '/purchase',
    '/accounting',
    '/employees',
    '/payroll',
    '/attendances',
    '/manufacturing',
    '/helpdesk',
    '/documents',
    '/discuss',
    '/pos',
    '/shop',
    '/calendar',
    '/appointments',
    '/knowledge',
    '/planning',
    '/surveys',
    '/timesheets',
    '/recruitment',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
