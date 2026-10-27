import { NextResponse } from 'next/server';
import { BLOG_POSTS } from '@/lib/blog-data';
import { COMPARISONS } from '@/lib/comparisonData';
import { INDUSTRIES_MAP } from '@/lib/industryData';

const BASE_URL = 'https://www.beraxis.online';
const INDEXNOW_KEY = 'e82f70b2be8b7b20';
const KEY_LOCATION = `${BASE_URL}/${INDEXNOW_KEY}.txt`;

function getAllSitemapUrls(): string[] {
  const staticPaths = [
    '',
    '/erp',
    '/crm-software',
    '/pricing',
    '/leads-pool',
    '/compare',
    '/features',
    '/industries',
    '/blog',
    '/about',
    '/contact',
    '/team',
    '/apps',
    '/signup',
    '/login',
    '/privacy',
    '/terms',
    '/sla',
    '/security',
    '/cookies'
  ].map(p => `${BASE_URL}${p}`);

  const featurePaths = [
    'crm-pipeline',
    'inventory',
    'voice-pilot'
  ].map(f => `${BASE_URL}/features/${f}`);

  const comparisonPaths = Object.keys(COMPARISONS).map(c => `${BASE_URL}/compare/${c}`);
  const industryPaths = Object.keys(INDUSTRIES_MAP).map(i => `${BASE_URL}/industries/${i}`);
  const blogPaths = BLOG_POSTS.map(b => `${BASE_URL}/blog/${b.slug}`);

  return Array.from(new Set([
    ...staticPaths,
    ...featurePaths,
    ...comparisonPaths,
    ...industryPaths,
    ...blogPaths
  ]));
}

async function triggerSearchEnginePings() {
  const urls = getAllSitemapUrls();
  const results: Record<string, any> = {};

  // 1. Submit to IndexNow (Bing, Yandex, Seznam, Naver)
  try {
    const indexNowPayload = {
      host: 'www.beraxis.online',
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList: urls
    };

    const indexNowRes = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(indexNowPayload)
    });

    results.indexnow = {
      status: indexNowRes.status,
      ok: indexNowRes.ok,
      message: indexNowRes.ok ? 'Successfully submitted URLs to IndexNow network' : `IndexNow returned status ${indexNowRes.status}`,
      urlsSubmitted: urls.length
    };
  } catch (err: any) {
    results.indexnow = { ok: false, error: err.message };
  }

  // 2. Ping Google Sitemap Ping Endpoint
  try {
    const googleRes = await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(`${BASE_URL}/sitemap.xml`)}`);
    results.google = {
      status: googleRes.status,
      ok: googleRes.ok,
      message: 'Google sitemap ping dispatched'
    };
  } catch (err: any) {
    results.google = { ok: false, error: err.message };
  }

  // 3. Ping Bing Sitemap Ping Endpoint
  try {
    const bingRes = await fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(`${BASE_URL}/sitemap.xml`)}`);
    results.bing = {
      status: bingRes.status,
      ok: bingRes.ok,
      message: 'Bing sitemap ping dispatched'
    };
  } catch (err: any) {
    results.bing = { ok: false, error: err.message };
  }

  return {
    timestamp: new Date().toISOString(),
    totalUrls: urls.length,
    results
  };
}

export async function GET() {
  const summary = await triggerSearchEnginePings();
  return NextResponse.json(summary);
}

export async function POST() {
  const summary = await triggerSearchEnginePings();
  return NextResponse.json(summary);
}
