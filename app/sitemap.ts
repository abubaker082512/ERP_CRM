import { MetadataRoute } from 'next';
import { BLOG_POSTS } from '@/lib/blog-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.beraxis.online';

  const staticRoutes = [
    { url: `${baseUrl}`, lastModified: new Date().toISOString(), changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${baseUrl}/leads-pool`, lastModified: new Date().toISOString(), changeFrequency: 'daily' as const, priority: 0.95 },
    { url: `${baseUrl}/pricing`, lastModified: new Date().toISOString(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date().toISOString(), changeFrequency: 'daily' as const, priority: 0.85 },
    { url: `${baseUrl}/about`, lastModified: new Date().toISOString(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: new Date().toISOString(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/signup`, lastModified: new Date().toISOString(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/login`, lastModified: new Date().toISOString(), changeFrequency: 'monthly' as const, priority: 0.7 },
  ];

  const blogRoutes = BLOG_POSTS.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...blogRoutes];
}
