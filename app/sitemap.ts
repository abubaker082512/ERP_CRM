import { MetadataRoute } from 'next';
import { BLOG_POSTS } from '@/lib/blog-data';
import { COMPARISONS } from '@/lib/comparisonData';
import { INDUSTRIES_MAP } from '@/lib/industryData';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.beraxis.online';
  const now = new Date().toISOString();

  // Core Static Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/erp`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/crm-software`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/leads-pool`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/compare`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/features`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/industries`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/pricing`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/affiliates`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/referrals`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/acceptable-use`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/sla`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/security`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/cookies`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/apps`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/signup`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/login`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  ];

  // Semantic Feature Landing Routes
  const featureRoutes: MetadataRoute.Sitemap = [
    'crm-pipeline',
    'inventory',
    'voice-pilot'
  ].map(slug => ({
    url: `${baseUrl}/features/${slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.90,
  }));

  // Dedicated Industry Landing Routes (12 Archetypes)
  const industrySubRoutes: MetadataRoute.Sitemap = Object.keys(INDUSTRIES_MAP).map(slug => ({
    url: `${baseUrl}/industries/${slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.90,
  }));

  // Programmatic Competitor Comparison Routes
  const comparisonRoutes: MetadataRoute.Sitemap = Object.keys(COMPARISONS).map(slug => ({
    url: `${baseUrl}/compare/${slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.90,
  }));

  // Legacy Industry Landing Routes (Compatibility)
  const legacyIndustryRoutes: MetadataRoute.Sitemap = [
    'automotive',
    'club',
    'education',
    'ngos',
    'real-estate',
  ].map(ind => ({
    url: `${baseUrl}/${ind}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.80,
  }));

  // Blog Article Routes
  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    ...staticRoutes,
    ...featureRoutes,
    ...industrySubRoutes,
    ...comparisonRoutes,
    ...legacyIndustryRoutes,
    ...blogRoutes
  ];
}
