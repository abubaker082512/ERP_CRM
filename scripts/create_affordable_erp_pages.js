const fs = require('fs');
const path = require('path');

function syncFile(relPath) {
  const src = path.join(__dirname, '..', 'frontend', relPath);
  const dest = path.join(__dirname, '..', relPath);
  if (fs.existsSync(src)) {
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(dest, fs.readFileSync(src, 'utf8'), 'utf8');
    console.log(`[SYNCED] frontend/${relPath} -> ${relPath}`);
  }
}

// -------------------------------------------------------------
// 1. UPDATE INDUSTRY DATA (Padel Club CRM & Management Software)
// -------------------------------------------------------------
console.log('1. Updating padel-clubs in frontend/lib/industryData.ts...');
let indData = fs.readFileSync(path.join(__dirname, '../frontend/lib/industryData.ts'), 'utf8');

indData = indData.replace(
  `h1: 'ERP for Padel Clubs & Sports Centers',`,
  `h1: 'Padel Club Management Software & CRM',`
);
indData = indData.replace(
  `metaTitle: 'ERP for Padel Clubs & Sports Centers | Beraxis AI',`,
  `metaTitle: 'Padel Club Management Software & CRM | Court Bookings, Pro Shop POS & Memberships · BERAXIS AI',`
);
indData = indData.replace(
  `metaDescription: 'Streamline court booking calendars, padel racket rental POS, tournament ladders, and recurring membership billing. Automated sports club ERP for $1/month.',`,
  `metaDescription: 'The #1 CRM and management software for padel clubs & sports centers. Real-time court bookings, 4-way split bills, pro-shop POS, and member subscriptions for $1/month.',`
);
indData = indData.replace(
  `keywords: [\n    'ERP for padel clubs',`,
  `keywords: [\n    'CRM for padel club',\n    'padel club management software',\n    'padel club CRM',\n    'padel court booking software',\n    'ERP for padel clubs',`
);
indData = indData.replace(
  `keywords: [\r\n    'ERP for padel clubs',`,
  `keywords: [\r\n    'CRM for padel club',\r\n    'padel club management software',\r\n    'padel club CRM',\r\n    'padel court booking software',\r\n    'ERP for padel clubs',`
);

fs.writeFileSync(path.join(__dirname, '../frontend/lib/industryData.ts'), indData, 'utf8');
syncFile('lib/industryData.ts');

// -------------------------------------------------------------
// 2. UPDATE COMPARISON DATA & COMPARISON SLUG PAGE (Odoo CTR Hook)
// -------------------------------------------------------------
console.log('2. Updating Odoo comparison CTR hook...');
let compSlug = fs.readFileSync(path.join(__dirname, '../frontend/app/compare/[slug]/page.tsx'), 'utf8');

compSlug = compSlug.replace(
  `  const title = \`Best Free \${comp.competitorName} Alternative (2026) | BERAXIS AI\`;\n  const description = \`\${comp.heroHeadline}. \${comp.heroSubheadline.slice(0, 150)}... Save \${comp.annualSavings} annually with double-entry accounting, CRM, POS, and verified B2B leads for $1/mo.\`;`,
  `  const title = comp.slug === 'odoo-alternative'\n    ? \`Best Free Odoo Alternative (2026) – $1/Mo Cloud ERP | BERAXIS AI\`\n    : \`Best Free \${comp.competitorName} Alternative (2026) | BERAXIS AI\`;\n  const description = comp.slug === 'odoo-alternative'\n    ? \`Switch from Odoo in 15 mins. Save $2,400+/yr with built-in accounting, CRM, POS & AI receipt OCR. 1 App 100% Free Forever. No credit card required.\`\n    : \`\${comp.heroHeadline}. \${comp.heroSubheadline.slice(0, 150)}... Save \${comp.annualSavings} annually with double-entry accounting, CRM, POS, and verified B2B leads for $1/mo.\`;`
);
compSlug = compSlug.replace(
  `  const title = \`Best Free \${comp.competitorName} Alternative (2026) | BERAXIS AI\`;\r\n  const description = \`\${comp.heroHeadline}. \${comp.heroSubheadline.slice(0, 150)}... Save \${comp.annualSavings} annually with double-entry accounting, CRM, POS, and verified B2B leads for $1/mo.\`;`,
  `  const title = comp.slug === 'odoo-alternative'\r\n    ? \`Best Free Odoo Alternative (2026) – $1/Mo Cloud ERP | BERAXIS AI\`\r\n    : \`Best Free \${comp.competitorName} Alternative (2026) | BERAXIS AI\`;\r\n  const description = comp.slug === 'odoo-alternative'\r\n    ? \`Switch from Odoo in 15 mins. Save $2,400+/yr with built-in accounting, CRM, POS & AI receipt OCR. 1 App 100% Free Forever. No credit card required.\`\r\n    : \`\${comp.heroHeadline}. \${comp.heroSubheadline.slice(0, 150)}... Save \${comp.annualSavings} annually with double-entry accounting, CRM, POS, and verified B2B leads for $1/mo.\`;`
);

fs.writeFileSync(path.join(__dirname, '../frontend/app/compare/[slug]/page.tsx'), compSlug, 'utf8');
syncFile('app/compare/[slug]/page.tsx');

// -------------------------------------------------------------
// 3. UPDATE /erp/page.tsx (Affordable Cloud ERP Hook)
// -------------------------------------------------------------
console.log('3. Updating frontend/app/erp/page.tsx metadata...');
let erpPage = fs.readFileSync(path.join(__dirname, '../frontend/app/erp/page.tsx'), 'utf8');

erpPage = erpPage.replace(
  `  title: "Cloud ERP Software | Best Free & Affordable ERP System 2026 | Beraxis",\n  description: "Beraxis is the premier AI Cloud ERP software. Unify 28 enterprise modules: double-entry accounting, multi-warehouse inventory, touch POS, HRMS payroll, and CRM for just $1/month. Start 1 app 100% free forever.",`,
  `  title: "Affordable Cloud ERP Options with Monthly Subscription Pricing ($1/mo) | BERAXIS AI",\n  description: "Looking for affordable cloud ERP options with monthly subscription pricing? BERAXIS AI delivers full double-entry accounting, CRM, POS, and inventory for $1/month. 1 App 100% Free Forever.",`
);
erpPage = erpPage.replace(
  `  title: "Cloud ERP Software | Best Free & Affordable ERP System 2026 | Beraxis",\r\n  description: "Beraxis is the premier AI Cloud ERP software. Unify 28 enterprise modules: double-entry accounting, multi-warehouse inventory, touch POS, HRMS payroll, and CRM for just $1/month. Start 1 app 100% free forever.",`,
  `  title: "Affordable Cloud ERP Options with Monthly Subscription Pricing ($1/mo) | BERAXIS AI",\r\n  description: "Looking for affordable cloud ERP options with monthly subscription pricing? BERAXIS AI delivers full double-entry accounting, CRM, POS, and inventory for $1/month. 1 App 100% Free Forever.",`
);
erpPage = erpPage.replace(
  `  keywords: [\n    "ERP",`,
  `  keywords: [\n    "affordable cloud erp options with monthly subscription pricing",\n    "affordable cloud erp",\n    "cloud erp monthly subscription",\n    "1 dollar erp",\n    "one dollar erp",\n    "cheap erp for small business",\n    "ERP",`
);
erpPage = erpPage.replace(
  `  keywords: [\r\n    "ERP",`,
  `  keywords: [\r\n    "affordable cloud erp options with monthly subscription pricing",\r\n    "affordable cloud erp",\r\n    "cloud erp monthly subscription",\r\n    "1 dollar erp",\r\n    "one dollar erp",\r\n    "cheap erp for small business",\r\n    "ERP",`
);

fs.writeFileSync(path.join(__dirname, '../frontend/app/erp/page.tsx'), erpPage, 'utf8');
syncFile('app/erp/page.tsx');

// -------------------------------------------------------------
// 4. UPDATE PRICING LAYOUT (Affordable ERP Search Keywords)
// -------------------------------------------------------------
console.log('4. Updating pricing layout...');
let pricingLayout = fs.readFileSync(path.join(__dirname, '../frontend/app/pricing/layout.tsx'), 'utf8');

pricingLayout = pricingLayout.replace(
  `  title: "Free AI ERP, Free AI CRM & $1/Mo Early Bird Pricing · BERAXIS AI (#1 Free Odoo Alternative)",\n  description: "Start free with our Forever Free Tier (Free CRM, Free POS, or Free ERP). Unlock all 28 modules and 1,500 verified B2B lead credits/month for just $1/month ($12 billed annually) or $5/month month-to-month.",`,
  `  title: "Affordable Cloud ERP with Monthly Subscription Pricing ($1/mo) · BERAXIS AI",\n  description: "Looking for affordable cloud ERP options with monthly subscription pricing? Deploy all 28 apps: double-entry accounting, CRM, POS & inventory for $1/month. 1 App 100% Free Forever with zero credit card.",`
);
pricingLayout = pricingLayout.replace(
  `  title: "Free AI ERP, Free AI CRM & $1/Mo Early Bird Pricing · BERAXIS AI (#1 Free Odoo Alternative)",\r\n  description: "Start free with our Forever Free Tier (Free CRM, Free POS, or Free ERP). Unlock all 28 modules and 1,500 verified B2B lead credits/month for just $1/month ($12 billed annually) or $5/month month-to-month.",`,
  `  title: "Affordable Cloud ERP with Monthly Subscription Pricing ($1/mo) · BERAXIS AI",\r\n  description: "Looking for affordable cloud ERP options with monthly subscription pricing? Deploy all 28 apps: double-entry accounting, CRM, POS & inventory for $1/month. 1 App 100% Free Forever with zero credit card.",`
);

fs.writeFileSync(path.join(__dirname, '../frontend/app/pricing/layout.tsx'), pricingLayout, 'utf8');
syncFile('app/pricing/layout.tsx');

console.log('Phase 1 snippet updates completed successfully.');
