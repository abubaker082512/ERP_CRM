const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function writeBoth(relPath, content) {
  const rootTarget = path.join(ROOT, relPath);
  const frontTarget = path.join(ROOT, 'frontend', relPath);
  fs.mkdirSync(path.dirname(rootTarget), { recursive: true });
  fs.mkdirSync(path.dirname(frontTarget), { recursive: true });
  fs.writeFileSync(rootTarget, content, 'utf8');
  fs.writeFileSync(frontTarget, content, 'utf8');
  console.log(`[UPDATED & SYNCED] ${relPath}`);
}

function updateAndSync(relPath, replacerFn) {
  const rootTarget = path.join(ROOT, relPath);
  let content = fs.readFileSync(rootTarget, 'utf8');
  const updated = replacerFn(content);
  writeBoth(relPath, updated);
}

// -------------------------------------------------------------------------
// 1. UPDATE app/compare/[slug]/page.tsx (High-CTR Titles & Snippets for Odoo & Salesforce)
// -------------------------------------------------------------------------
updateAndSync('app/compare/[slug]/page.tsx', (c) => {
  const oldBlockRegex = /const title = comp\.slug === 'odoo-alternative'[\s\S]*?const description = comp\.slug === 'odoo-alternative'[\s\S]*?verified B2B leads for \$1\/mo\.`;/;
  const newBlock = `const title = comp.slug === 'odoo-alternative'
    ? \`Best Free Odoo Alternative & Top Odoo Alternatives (2026) – $1/Mo AI ERP | BERAXIS AI\`
    : comp.slug === 'salesforce-alternative'
    ? \`Best Free Salesforce Alternative (2026) – $1/Mo AI CRM, Power Dialer & 25M Leads | BERAXIS AI\`
    : \`Best Free \${comp.competitorName} Alternative (2026) – $1/Mo Cloud ERP & CRM | BERAXIS AI\`;

  const description = comp.slug === 'odoo-alternative'
    ? \`Compare the #1 Free Odoo Alternative in 2026. Skip $150/hr consultants with our 1-Click "Explain Your Business" AI Auto-Setup across 15 industries. Full Accounting, CRM, POS, Call Center & 25M+ B2B Leads for $1/mo or 1 App Free Forever.\`
    : comp.slug === 'salesforce-alternative'
    ? \`Looking for a modern Salesforce alternative for enterprise or mid-market? Replace $300/seat CRM bloat with BERAXIS AI: Visual Kanban CRM, 25M+ verified B2B leads, Call Center Power Dialer, Public Form Builder & full ERP for $1/month.\`
    : \`\${comp.heroHeadline}. \${comp.heroSubheadline.slice(0, 150)}... Save \${comp.annualSavings} annually with double-entry accounting, CRM, POS, and verified B2B leads for $1/mo.\`;`;

  if (oldBlockRegex.test(c)) {
    c = c.replace(oldBlockRegex, newBlock);
  }
  return c;
});

// -------------------------------------------------------------------------
// 2. UPDATE lib/comparisonData.ts (Boost Odoo Alternatives plural & Salesforce Enterprise RFP / Call Center)
// -------------------------------------------------------------------------
updateAndSync('lib/comparisonData.ts', (c) => {
  // Odoo Alternative headline & FAQ boost for both singular & plural
  c = c.replace(
    `heroHeadline: "The #1 Free Odoo Alternative: Autonomous AI ERP & CRM Without Consultant Traps",`,
    `heroHeadline: "The #1 Free Odoo Alternative (2026): 1-Click AI Auto-Setup Without Consultant Traps",`
  );
  if (!c.includes('What are the top Odoo alternatives in 2026 compared?')) {
    c = c.replace(
      `{ q: "What is the best free Odoo alternative in 2026?",`,
      `{ q: "What are the top Odoo alternatives in 2026 compared?", a: "When comparing the top Odoo alternatives in 2026—including BERAXIS AI, NetSuite, SAP Business One, ERPNext, Zoho One, and Dolibarr—BERAXIS AI ranks #1 for growing businesses because it eliminates $150/hr consultant fees with a 1-Click 'Explain Your Business' AI Auto-Setup across 15 global industries, includes full GAAP double-entry accounting, a built-in 25M+ B2B Leads Pool, Call Center Power Dialer, and offers a 1-App Free Forever tier or $1.00/month Early Bird all-apps plan." },\n      { q: "What is the best free Odoo alternative in 2026?",`
    );
  }

  // Salesforce Alternative boost for enterprise/mid-market RFP & Call Center Power Dialer
  c = c.replace(
    `heroHeadline: "The Modern Salesforce Alternative With 25 Million Built-In B2B Leads",`,
    `heroHeadline: "The #1 Free Salesforce Alternative (2026): AI CRM, Power Dialer & 25M Built-In B2B Leads",`
  );
  if (!c.includes('Is BERAXIS AI suitable as an enterprise or mid-market Salesforce alternative')) {
    c = c.replace(
      `{ q: "How does Beraxis compare to Salesforce Sales Cloud for B2B sales teams?",`,
      `{ q: "Is BERAXIS AI suitable as an enterprise or mid-market Salesforce alternative in North America, UK, and Europe?", a: "Yes. BERAXIS AI is engineered for high-velocity B2B sales, mid-market, and enterprise CRM replacement across the United States, Canada, the United Kingdom, and Europe. It combines a no-code visual Kanban CRM, 25M+ verified global B2B leads, a native Call Center Power Dialer with Campaign Management & AHT analytics, a Public Lead Intake Form Builder, and full GAAP double-entry ERP—without $300/seat lock-in." },\n      { q: "How does Beraxis compare to Salesforce Sales Cloud for B2B sales teams?",`
    );
  }
  return c;
});

// -------------------------------------------------------------------------
// 3. UPDATE lib/industryData.ts (Boost Padel Club CRM & Industrial Manufacturing ERP)
// -------------------------------------------------------------------------
updateAndSync('lib/industryData.ts', (c) => {
  // Padel Clubs: Put "CRM for Padel Club" right at the front of metaTitle & H1
  c = c.replace(
    `h1: "Padel Club Management Software & CRM",`,
    `h1: "The #1 CRM for Padel Clubs, Court Booking & Pro-Shop POS",`
  );
  c = c.replace(
    `metaTitle: "Padel Club Management Software & CRM | Court Bookings, Pro Shop POS & Memberships · BERAXIS AI",`,
    `metaTitle: "CRM for Padel Club & Padel Court Booking Software ($1/Mo) | BERAXIS AI",`
  );
  c = c.replace(
    `metaDescription: "The #1 CRM and management software for padel clubs & sports centers. Real-time court bookings, 4-way split bills, pro-shop POS, and member subscriptions for $1/month.",`,
    `metaDescription: "Looking for the best CRM for a padel club? Automate court bookings, 4-player split payments, member WhatsApp alerts, pro-shop POS, and tournament ladders in 1 click for $1/month or 1 App Free Forever.",`
  );

  // Manufacturing: Add "rds alternatives for industrial erp applications" keywords & cloud database scalability
  c = c.replace(
    `"discrete manufacturing ERP",`,
    `"discrete manufacturing ERP",\n      "rds alternatives for industrial erp applications",\n      "cloud industrial ERP database architecture",\n      "manufacturing BOM and work order software",`
  );
  return c;
});

// -------------------------------------------------------------------------
// 4. UPDATE app/cheap-erp-for-small-business/page.tsx (Exact-match "Cheap ERP System" hook)
// -------------------------------------------------------------------------
updateAndSync('app/cheap-erp-for-small-business/page.tsx', (c) => {
  c = c.replace(
    `title: "Best Cheap ERP Software for Small Business (2026) | Free & $1/Mo · BERAXIS AI",`,
    `title: "Best Cheap ERP System for Small Business (2026) – Free & $1/Mo Cloud ERP | BERAXIS AI",`
  );
  c = c.replace(
    `description: "Looking for the best cheap ERP software for small business in 2026? BERAXIS AI replaces expensive tool sprawl with full double-entry accounting, CRM, POS, and inventory for $1/month or 1 App 100% Free Forever.",`,
    `description: "Looking for a cheap ERP system that doesn't cut corners? BERAXIS AI gives small businesses all 30+ apps—GAAP accounting, CRM, POS, inventory, Call Center & 1-Click AI Auto-Setup across 15 industries—for $1/month or 1 App Free Forever.",`
  );
  c = c.replace(
    `"cheap erp for small business",`,
    `"cheap erp system",\n    "best cheap erp system 2026",\n    "cheap erp for small business",`
  );
  c = c.replace(
    `The Best Cheap ERP Software for{" "}`,
    `The #1 Cheap ERP System for{" "}`
  );
  return c;
});

// -------------------------------------------------------------------------
// 5. CREATE EXACT-MATCH ROUTE: app/cheap-erp-system/page.tsx
// -------------------------------------------------------------------------
const cheapErpSystemPage = `import { Metadata } from "next";
import CheapErpForSmallBusinessPage from "../cheap-erp-for-small-business/page";

export const metadata: Metadata = {
  title: "Cheap ERP System (2026) – Full 30+ App Cloud ERP for $1/Month | BERAXIS AI",
  description: "Need a powerful, cheap ERP system for your growing company? Deploy BERAXIS AI in 30 seconds with our 1-Click 'Explain Your Business' Auto-Setup: Double-entry accounting, CRM, POS, Inventory & 25M+ B2B Leads for $1/mo or 1 App Free Forever.",
  keywords: [
    "cheap erp system",
    "best cheap erp system",
    "cheap cloud erp system",
    "affordable cloud erp options with monthly subscription pricing",
    "low cost erp system for small business",
    "1 dollar erp system",
    "free erp system 2026",
    "BERAXIS AI"
  ],
  alternates: {
    canonical: "https://www.beraxis.online/cheap-erp-system",
  },
  openGraph: {
    title: "Cheap ERP System (2026) – Full 30+ App Cloud ERP for $1/Month | BERAXIS AI",
    description: "Run your entire business for $1/month. GAAP Accounting, CRM, Touch POS, Multi-Warehouse Inventory & 1-Click AI Auto-Setup across 15 industries.",
    url: "https://www.beraxis.online/cheap-erp-system",
    siteName: "BERAXIS AI",
    images: [
      {
        url: "https://www.beraxis.online/og-image.png?v=3",
        width: 1200,
        height: 630,
        alt: "BERAXIS AI - The #1 Cheap ERP System ($1/Month)",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default CheapErpForSmallBusinessPage;
`;
writeBoth('app/cheap-erp-system/page.tsx', cheapErpSystemPage);

// -------------------------------------------------------------------------
// 6. UPDATE app/affordable-cloud-erp/page.tsx (145 Impressions -> High-CTR Hook)
// -------------------------------------------------------------------------
updateAndSync('app/affordable-cloud-erp/page.tsx', (c) => {
  c = c.replace(
    `title: "Affordable Cloud ERP with Monthly Subscription Pricing ($1/mo) | BERAXIS AI",`,
    `title: "Affordable Cloud ERP Options with Monthly Subscription Pricing ($1/Mo) | BERAXIS AI",`
  );
  c = c.replace(
    `description: "Looking for affordable cloud ERP options with monthly subscription pricing? BERAXIS AI provides all 28 business modules: GAAP accounting, CRM, POS & inventory for $1/month. 1 App 100% Free Forever with zero credit card required.",`,
    `description: "Compare the #1 affordable cloud ERP with flat monthly subscription pricing ($1/mo or 1 App Free Forever). Includes 1-Click 'Explain Your Business' AI Auto-Setup across 15 industries, GAAP Accounting, CRM, POS, Inventory & 25M+ B2B Leads.",`
  );
  return c;
});

// -------------------------------------------------------------------------
// 7. WHITELIST /cheap-erp-system IN GalaxyAppShell.tsx & ADD TO sitemap.ts & Footer.tsx
// -------------------------------------------------------------------------
updateAndSync('components/layout/GalaxyAppShell.tsx', (c) => {
  if (!c.includes("pathname.startsWith('/cheap-erp-system')")) {
    c = c.replace(
      "pathname.startsWith('/cheap-erp-for-small-business') ||",
      "pathname.startsWith('/cheap-erp-for-small-business') ||\n        pathname.startsWith('/cheap-erp-system') ||"
    );
  }
  return c;
});

updateAndSync('app/sitemap.ts', (c) => {
  if (!c.includes('/cheap-erp-system')) {
    c = c.replace(
      "{ url: `${baseUrl}/cheap-erp-for-small-business`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },",
      "{ url: `${baseUrl}/cheap-erp-for-small-business`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },\n    { url: `${baseUrl}/cheap-erp-system`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },"
    );
  }
  return c;
});

updateAndSync('components/landing/Footer.tsx', (c) => {
  if (!c.includes('/cheap-erp-system')) {
    c = c.replace(
      `<li><Link href="/cheap-erp-for-small-business" className="hover:text-purple-300 font-semibold text-purple-400">Cheap ERP for Small Business</Link></li>`,
      `<li><Link href="/cheap-erp-for-small-business" className="hover:text-purple-300 font-semibold text-purple-400">Cheap ERP for Small Business</Link></li>\n                            <li><Link href="/cheap-erp-system" className="hover:text-amber-300 font-semibold text-amber-400">Cheap ERP System ($1/mo)</Link></li>`
    );
  }
  return c;
});

console.log('ALL NOV 26 GSC CTR BOOSTERS APPLIED & SYNCED!');
