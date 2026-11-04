const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, transforms) {
  if (!fs.existsSync(filePath)) {
    console.error(`File does not exist: ${filePath}`);
    return false;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  for (const { search, replace } of transforms) {
    if (typeof search === 'string') {
      if (!content.includes(search)) {
        console.warn(`[WARN] Search string not found in ${path.basename(filePath)}: "${search.slice(0, 40)}..."`);
      } else {
        content = content.split(search).join(replace);
      }
    } else if (search instanceof RegExp) {
      if (!search.test(content)) {
        console.warn(`[WARN] Regex not matched in ${path.basename(filePath)}: ${search}`);
      } else {
        content = content.replace(search, replace);
      }
    }
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[SUCCESS] Updated ${filePath}`);
    return true;
  } else {
    console.log(`[NO CHANGE] ${filePath}`);
    return false;
  }
}

function syncToRoot(frontendRelPath, rootRelPath) {
  const src = path.join(__dirname, '..', frontendRelPath);
  const dest = path.join(__dirname, '..', rootRelPath);
  if (fs.existsSync(src)) {
    const data = fs.readFileSync(src, 'utf8');
    fs.writeFileSync(dest, data, 'utf8');
    console.log(`[SYNCED] ${frontendRelPath} -> ${rootRelPath}`);
  }
}

console.log('--- 1. Updating Layout (frontend/app/layout.tsx) ---');
replaceInFile(path.join(__dirname, '../frontend/app/layout.tsx'), [
  {
    search: `    title: {\n        default: "Beraxis | AI ERP & CRM Software · Free Cloud ERP, CRM & POS System",\n        template: "%s | Beraxis"\n    },`,
    replace: `    title: {\n        default: "BERAXIS AI | Autonomous AI ERP & AI CRM · #1 Free Odoo Alternative (2026)",\n        template: "%s | BERAXIS AI"\n    },`
  },
  {
    search: `    title: {\r\n        default: "Beraxis | AI ERP & CRM Software · Free Cloud ERP, CRM & POS System",\r\n        template: "%s | Beraxis"\r\n    },`,
    replace: `    title: {\r\n        default: "BERAXIS AI | Autonomous AI ERP & AI CRM · #1 Free Odoo Alternative (2026)",\r\n        template: "%s | BERAXIS AI"\r\n    },`
  },
  {
    search: `    description: "The #1 AI ERP & CRM Software for growing businesses. Deploy Free ERP, Free CRM, Point of Sale (POS), Accounting, and Global B2B Leads Directory for $1/month across 12 custom industries.",`,
    replace: `    description: "BERAXIS AI is the #1 Autonomous AI ERP & AI CRM Software for growing businesses. Deploy Free AI ERP, Free AI CRM, Point of Sale (POS), Accounting, and 25M+ Global B2B Leads Directory for $1/month across 12 custom industries. The leading free alternative to Odoo, HubSpot, and Salesforce.",`
  },
  {
    search: `    keywords: [\n        "ERP",`,
    replace: `    keywords: [\n        "BERAXIS AI",\n        "Beraxis AI",\n        "AI ERP",\n        "AI CRM",\n        "Autonomous AI ERP",\n        "AI ERP Software",\n        "AI CRM Software",\n        "AI Business Operating System",\n        "AI Accounting Software",\n        "AI Voice Pilot ERP",\n        "AI Invoice OCR",\n        "Odoo AI alternative",\n        "Odoo alternative",\n        "Odoo alternatives",\n        "Best Odoo alternative 2026",\n        "Free Odoo alternative",\n        "Odoo free alternative 2026",\n        "Odoo ERP alternative",\n        "Odoo Community alternative",\n        "Odoo Enterprise alternative",\n        "Odoo vs BERAXIS AI",\n        "BERAXIS AI vs Odoo",\n        "Odoo pricing alternative",\n        "Odoo competitors",\n        "Switch from Odoo to BERAXIS AI",\n        "Migrate from Odoo",\n        "ERP",`
  },
  {
    search: `    keywords: [\r\n        "ERP",`,
    replace: `    keywords: [\r\n        "BERAXIS AI",\r\n        "Beraxis AI",\r\n        "AI ERP",\r\n        "AI CRM",\r\n        "Autonomous AI ERP",\r\n        "AI ERP Software",\r\n        "AI CRM Software",\r\n        "AI Business Operating System",\r\n        "AI Accounting Software",\r\n        "AI Voice Pilot ERP",\r\n        "AI Invoice OCR",\r\n        "Odoo AI alternative",\r\n        "Odoo alternative",\r\n        "Odoo alternatives",\r\n        "Best Odoo alternative 2026",\r\n        "Free Odoo alternative",\r\n        "Odoo free alternative 2026",\r\n        "Odoo ERP alternative",\r\n        "Odoo Community alternative",\r\n        "Odoo Enterprise alternative",\r\n        "Odoo vs BERAXIS AI",\r\n        "BERAXIS AI vs Odoo",\r\n        "Odoo pricing alternative",\r\n        "Odoo competitors",\r\n        "Switch from Odoo to BERAXIS AI",\r\n        "Migrate from Odoo",\r\n        "ERP",`
  },
  {
    search: `    authors: [{ name: "Beraxis Team", url: "https://www.beraxis.online" }],\n    creator: "Beraxis Platform",\n    publisher: "Beraxis Systems",`,
    replace: `    authors: [{ name: "BERAXIS AI Team", url: "https://www.beraxis.online" }],\n    creator: "BERAXIS AI Platform",\n    publisher: "BERAXIS AI Systems Inc.",`
  },
  {
    search: `    authors: [{ name: "Beraxis Team", url: "https://www.beraxis.online" }],\r\n    creator: "Beraxis Platform",\r\n    publisher: "Beraxis Systems",`,
    replace: `    authors: [{ name: "BERAXIS AI Team", url: "https://www.beraxis.online" }],\r\n    creator: "BERAXIS AI Platform",\r\n    publisher: "BERAXIS AI Systems Inc.",`
  },
  {
    search: `    openGraph: {\n        title: "Beraxis | AI ERP & CRM Software · Free Cloud ERP, CRM & POS System",`,
    replace: `    openGraph: {\n        title: "BERAXIS AI | Autonomous AI ERP & AI CRM · #1 Free Odoo Alternative (2026)",`
  },
  {
    search: `    openGraph: {\r\n        title: "Beraxis | AI ERP & CRM Software · Free Cloud ERP, CRM & POS System",`,
    replace: `    openGraph: {\r\n        title: "BERAXIS AI | Autonomous AI ERP & AI CRM · #1 Free Odoo Alternative (2026)",`
  },
  {
    search: `        siteName: "Beraxis",`,
    replace: `        siteName: "BERAXIS AI",`
  },
  {
    search: `    twitter: {\n        card: "summary_large_image",\n        title: "Beraxis | AI ERP & CRM Software · Free Cloud ERP, CRM & POS System",`,
    replace: `    twitter: {\n        card: "summary_large_image",\n        title: "BERAXIS AI | Autonomous AI ERP & AI CRM · #1 Free Odoo Alternative (2026)",`
  },
  {
    search: `    twitter: {\r\n        card: "summary_large_image",\r\n        title: "Beraxis | AI ERP & CRM Software · Free Cloud ERP, CRM & POS System",`,
    replace: `    twitter: {\r\n        card: "summary_large_image",\r\n        title: "BERAXIS AI | Autonomous AI ERP & AI CRM · #1 Free Odoo Alternative (2026)",`
  },
  {
    search: `                "@type": "Organization",\n                "@id": "https://www.beraxis.online/#organization",\n                "name": "Beraxis",\n                "legalName": "Beraxis Systems Inc.",\n                "alternateName": ["Beraxis ERP", "Beraxis CRM", "Beraxis AI", "Beraxis AI ERP"],`,
    replace: `                "@type": "Organization",\n                "@id": "https://www.beraxis.online/#organization",\n                "name": "BERAXIS AI",\n                "legalName": "BERAXIS AI Systems Inc.",\n                "alternateName": ["BERAXIS AI", "Beraxis AI", "Beraxis", "Beraxis AI ERP", "Beraxis AI CRM", "Autonomous AI ERP"],`
  },
  {
    search: `                "@type": "Organization",\r\n                "@id": "https://www.beraxis.online/#organization",\r\n                "name": "Beraxis",\r\n                "legalName": "Beraxis Systems Inc.",\r\n                "alternateName": ["Beraxis ERP", "Beraxis CRM", "Beraxis AI", "Beraxis AI ERP"],`,
    replace: `                "@type": "Organization",\r\n                "@id": "https://www.beraxis.online/#organization",\r\n                "name": "BERAXIS AI",\r\n                "legalName": "BERAXIS AI Systems Inc.",\r\n                "alternateName": ["BERAXIS AI", "Beraxis AI", "Beraxis", "Beraxis AI ERP", "Beraxis AI CRM", "Autonomous AI ERP"],`
  },
  {
    search: `                "@type": "WebSite",\n                "@id": "https://www.beraxis.online/#website",\n                "url": "https://www.beraxis.online",\n                "name": "Beraxis",\n                "alternateName": "Beraxis ERP",`,
    replace: `                "@type": "WebSite",\n                "@id": "https://www.beraxis.online/#website",\n                "url": "https://www.beraxis.online",\n                "name": "BERAXIS AI",\n                "alternateName": ["BERAXIS AI ERP", "Beraxis AI"],`
  },
  {
    search: `                "@type": "WebSite",\r\n                "@id": "https://www.beraxis.online/#website",\r\n                "url": "https://www.beraxis.online",\r\n                "name": "Beraxis",\r\n                "alternateName": "Beraxis ERP",`,
    replace: `                "@type": "WebSite",\r\n                "@id": "https://www.beraxis.online/#website",\r\n                "url": "https://www.beraxis.online",\r\n                "name": "BERAXIS AI",\r\n                "alternateName": ["BERAXIS AI ERP", "Beraxis AI"],`
  },
  {
    search: `                "@type": "SoftwareApplication",\n                "@id": "https://www.beraxis.online/#software",\n                "name": "Beraxis",`,
    replace: `                "@type": "SoftwareApplication",\n                "@id": "https://www.beraxis.online/#software",\n                "name": "BERAXIS AI Autonomous Enterprise Suite",\n                "alternateName": "BERAXIS AI",`
  },
  {
    search: `                "@type": "SoftwareApplication",\r\n                "@id": "https://www.beraxis.online/#software",\r\n                "name": "Beraxis",`,
    replace: `                "@type": "SoftwareApplication",\r\n                "@id": "https://www.beraxis.online/#software",\r\n                "name": "BERAXIS AI Autonomous Enterprise Suite",\r\n                "alternateName": "BERAXIS AI",`
  },
  {
    search: `                        "name": "How does Beraxis compare to Odoo and HubSpot?",\n                        "acceptedAnswer": {\n                            "@type": "Answer",\n                            "text": "Unlike Odoo (which charges high fees per module) and HubSpot (which imposes steep pricing tiers based on contact counts), Beraxis includes all 28 modules, unlimited user seats, and 1,500 monthly lead generation credits for just $1.00/month."\n                        }`,
    replace: `                        "name": "What is the best free Odoo alternative in 2026?",\n                        "acceptedAnswer": {\n                            "@type": "Answer",\n                            "text": "BERAXIS AI is rated the #1 best free Odoo alternative in 2026. Unlike Odoo (which charges $24.90–$37.40/user/month, strips dynamic accounting from Community, and requires thousands in consultant fees), BERAXIS AI includes all 28 modules, AI OCR bill scanner, AI Voice Pilot, double-entry accounting, and 1,500 monthly lead generation credits with a 1-App Free Forever tier or $1.00/month Early Bird plan."\n                        }`
  },
  {
    search: `                        "name": "How does Beraxis compare to Odoo and HubSpot?",\r\n                        "acceptedAnswer": {\r\n                            "@type": "Answer",\r\n                            "text": "Unlike Odoo (which charges high fees per module) and HubSpot (which imposes steep pricing tiers based on contact counts), Beraxis includes all 28 modules, unlimited user seats, and 1,500 monthly lead generation credits for just $1.00/month."\r\n                        }`,
    replace: `                        "name": "What is the best free Odoo alternative in 2026?",\r\n                        "acceptedAnswer": {\r\n                            "@type": "Answer",\r\n                            "text": "BERAXIS AI is rated the #1 best free Odoo alternative in 2026. Unlike Odoo (which charges $24.90–$37.40/user/month, strips dynamic accounting from Community, and requires thousands in consultant fees), BERAXIS AI includes all 28 modules, AI OCR bill scanner, AI Voice Pilot, double-entry accounting, and 1,500 monthly lead generation credits with a 1-App Free Forever tier or $1.00/month Early Bird plan."\r\n                        }`
  }
]);
syncToRoot('frontend/app/layout.tsx', 'app/layout.tsx');

console.log('--- 2. Updating Comparison Data (frontend/lib/comparisonData.ts) ---');
replaceInFile(path.join(__dirname, '../frontend/lib/comparisonData.ts'), [
  {
    search: `    competitorName: "Odoo ERP",\n    competitorTagline: "Modular ERP with Complex Setup and Escalating Costs",\n    badge: "The Streamlined Cloud ERP",\n    heroHeadline: "The Fast, Transparent Odoo Alternative Without Bloat or Hidden Costs",\n    heroSubheadline: "Tired of confusing Odoo Community vs. Enterprise licensing, endless module dependencies, and expensive implementation partners? Beraxis gives you a modern AI-native workspace with zero complex setup.",\n    competitorCostAnnual: "$2,400 - $12,000/yr",\n    beraxisCostAnnual: "$12/yr (Early Bird)",\n    annualSavings: "$2,388+/yr",\n    keySummary: "Odoo has impressive breadth, but customization frequently breaks upon updates, implementation consultants charge thousands, and mobile usability is clunky. Beraxis provides unified, auto-configured industry archetypes in seconds.",`,
    replace: `    competitorName: "Odoo ERP",\n    competitorTagline: "Modular Legacy ERP with Complex Setup, Consultant Fees & High User Taxes",\n    badge: "The #1 Free Odoo Alternative (2026)",\n    heroHeadline: "The #1 Free Odoo Alternative: Autonomous AI ERP & CRM Without Consultant Traps",\n    heroSubheadline: "Escape Odoo's broken module upgrades, expensive $150/hr consultant fees, and confusing Community vs. Enterprise paywalls. BERAXIS AI gives you a blazing-fast, complete 28-module autonomous business suite with AI OCR, AI Voice Pilot, double-entry accounting, and 25M+ verified B2B leads for just $1/month.",\n    competitorCostAnnual: "$2,400 - $12,000/yr + $15k Consulting",\n    beraxisCostAnnual: "$12/yr (Early Bird) • 1 App Free Forever",\n    annualSavings: "$5,000 - $25,000+/yr",\n    keySummary: "Odoo has breadth, but customization frequently breaks upon major upgrades, implementation partners charge $150/hr, and mobile usability is clunky. BERAXIS AI delivers unified, auto-configured industry archetypes in seconds with zero consultant dependence and built-in AI Voice Pilot.",`
  },
  {
    search: `    competitorName: "Odoo ERP",\r\n    competitorTagline: "Modular ERP with Complex Setup and Escalating Costs",\r\n    badge: "The Streamlined Cloud ERP",\r\n    heroHeadline: "The Fast, Transparent Odoo Alternative Without Bloat or Hidden Costs",\r\n    heroSubheadline: "Tired of confusing Odoo Community vs. Enterprise licensing, endless module dependencies, and expensive implementation partners? Beraxis gives you a modern AI-native workspace with zero complex setup.",\r\n    competitorCostAnnual: "$2,400 - $12,000/yr",\r\n    beraxisCostAnnual: "$12/yr (Early Bird)",\r\n    annualSavings: "$2,388+/yr",\r\n    keySummary: "Odoo has impressive breadth, but customization frequently breaks upon updates, implementation consultants charge thousands, and mobile usability is clunky. Beraxis provides unified, auto-configured industry archetypes in seconds.",`,
    replace: `    competitorName: "Odoo ERP",\r\n    competitorTagline: "Modular Legacy ERP with Complex Setup, Consultant Fees & High User Taxes",\r\n    badge: "The #1 Free Odoo Alternative (2026)",\r\n    heroHeadline: "The #1 Free Odoo Alternative: Autonomous AI ERP & CRM Without Consultant Traps",\r\n    heroSubheadline: "Escape Odoo's broken module upgrades, expensive $150/hr consultant fees, and confusing Community vs. Enterprise paywalls. BERAXIS AI gives you a blazing-fast, complete 28-module autonomous business suite with AI OCR, AI Voice Pilot, double-entry accounting, and 25M+ verified B2B leads for just $1/month.",\r\n    competitorCostAnnual: "$2,400 - $12,000/yr + $15k Consulting",\r\n    beraxisCostAnnual: "$12/yr (Early Bird) • 1 App Free Forever",\r\n    annualSavings: "$5,000 - $25,000+/yr",\r\n    keySummary: "Odoo has breadth, but customization frequently breaks upon major upgrades, implementation partners charge $150/hr, and mobile usability is clunky. BERAXIS AI delivers unified, auto-configured industry archetypes in seconds with zero consultant dependence and built-in AI Voice Pilot.",`
  },
  {
    search: `      { q: "How is Beraxis different from Odoo Community?", a: "Odoo Community lacks full double-entry accounting reports, multi-company features, and requires self-hosting maintenance. Beraxis is a managed, ultra-fast cloud command center with full accounting, global leads directory, and AI voice assistance." },\n      { q: "Do I need a technical developer to configure Beraxis?", a: "No. Unlike Odoo, which requires Python/XML adjustments, Beraxis auto-configures your departments, roles, and POS layouts based on your selected industry archetype." },\n      { q: "Can my retail cashiers use the Beraxis POS without training?", a: "Yes. Our Point of Sale is designed like modern tablet apps (Square/Toast), with visual categories, barcode scanning, and instant split bills." }`,
    replace: `      { q: "What is the best free Odoo alternative in 2026?", a: "BERAXIS AI is recognized as the best free Odoo alternative in 2026. Unlike Odoo, which locks dynamic accounting, barcode scanning, and multi-company tools behind expensive Enterprise licenses, BERAXIS AI provides complete double-entry accounting, mobile POS, and inventory across all tiers—including a 100% Free Forever single-app tier with unlimited users and no credit card required." },\n      { q: "Why are companies switching from Odoo to BERAXIS AI?", a: "Businesses switch to BERAXIS AI to escape the Odoo 'consultant trap' ($120–$200/hr implementation fees) and brittle upgrades. BERAXIS AI comes pre-configured with 12 industry blueprints (Retail, F&B, Clinics, Garages, Manufacturing) that launch in under 15 minutes with zero technical overhead." },\n      { q: "Is Odoo Community really free or does it have hidden costs?", a: "Odoo Community is technically open source, but it deliberately strips out essential business tools (dynamic profit & loss, balance sheets, mobile barcode scanning, and multi-company). Hosting, maintenance, security patches, and custom module upgrades typically cost $3,000 to $15,000 per year. BERAXIS AI is a fully managed cloud platform starting at $1/month with zero hidden fees." },\n      { q: "How does BERAXIS AI handle accounting compared to Odoo Enterprise?", a: "BERAXIS AI includes complete GAAP/IFRS-compliant double-entry accounting: real-time balance sheets, automated trial balance, tax reconciliation, multi-currency support, and a 3-second AI OCR receipt scanner that drops expense receipts straight into your ledger without manual data entry." },\n      { q: "Can I migrate my existing data from Odoo to BERAXIS AI?", a: "Yes. BERAXIS AI provides an automated CSV and Excel data migration tool that lets you import your Odoo Partners, Products, Chart of Accounts, and Stock levels in less than 5 minutes with free white-glove assistance from our engineering team." },\n      { q: "Does BERAXIS AI charge per user seat like Odoo?", a: "No. While Odoo charges $24.90 to $37.40 per user per month, BERAXIS AI offers a flat Early Bird Standard Plan for $1.00/month ($12 billed annually) or $5/month month-to-month for all 28 modules, plus 1,500 monthly verified B2B lead generation credits." },\n      { q: "How does the BERAXIS AI Voice Pilot replace manual ERP navigation?", a: "Instead of navigating through 10 nested submenus in Odoo, BERAXIS AI features a native Duplex Voice Pilot. You can speak naturally: 'Create a quote for Acme Corp for 50 units', 'Show me today's cash register totals', or 'Check stock in warehouse B', and the action executes instantly." }`
  },
  {
    search: `      { q: "How is Beraxis different from Odoo Community?", a: "Odoo Community lacks full double-entry accounting reports, multi-company features, and requires self-hosting maintenance. Beraxis is a managed, ultra-fast cloud command center with full accounting, global leads directory, and AI voice assistance." },\r\n      { q: "Do I need a technical developer to configure Beraxis?", a: "No. Unlike Odoo, which requires Python/XML adjustments, Beraxis auto-configures your departments, roles, and POS layouts based on your selected industry archetype." },\r\n      { q: "Can my retail cashiers use the Beraxis POS without training?", a: "Yes. Our Point of Sale is designed like modern tablet apps (Square/Toast), with visual categories, barcode scanning, and instant split bills." }`,
    replace: `      { q: "What is the best free Odoo alternative in 2026?", a: "BERAXIS AI is recognized as the best free Odoo alternative in 2026. Unlike Odoo, which locks dynamic accounting, barcode scanning, and multi-company tools behind expensive Enterprise licenses, BERAXIS AI provides complete double-entry accounting, mobile POS, and inventory across all tiers—including a 100% Free Forever single-app tier with unlimited users and no credit card required." },\r\n      { q: "Why are companies switching from Odoo to BERAXIS AI?", a: "Businesses switch to BERAXIS AI to escape the Odoo 'consultant trap' ($120–$200/hr implementation fees) and brittle upgrades. BERAXIS AI comes pre-configured with 12 industry blueprints (Retail, F&B, Clinics, Garages, Manufacturing) that launch in under 15 minutes with zero technical overhead." },\r\n      { q: "Is Odoo Community really free or does it have hidden costs?", a: "Odoo Community is technically open source, but it deliberately strips out essential business tools (dynamic profit & loss, balance sheets, mobile barcode scanning, and multi-company). Hosting, maintenance, security patches, and custom module upgrades typically cost $3,000 to $15,000 per year. BERAXIS AI is a fully managed cloud platform starting at $1/month with zero hidden fees." },\r\n      { q: "How does BERAXIS AI handle accounting compared to Odoo Enterprise?", a: "BERAXIS AI includes complete GAAP/IFRS-compliant double-entry accounting: real-time balance sheets, automated trial balance, tax reconciliation, multi-currency support, and a 3-second AI OCR receipt scanner that drops expense receipts straight into your ledger without manual data entry." },\r\n      { q: "Can I migrate my existing data from Odoo to BERAXIS AI?", a: "Yes. BERAXIS AI provides an automated CSV and Excel data migration tool that lets you import your Odoo Partners, Products, Chart of Accounts, and Stock levels in less than 5 minutes with free white-glove assistance from our engineering team." },\r\n      { q: "Does BERAXIS AI charge per user seat like Odoo?", a: "No. While Odoo charges $24.90 to $37.40 per user per month, BERAXIS AI offers a flat Early Bird Standard Plan for $1.00/month ($12 billed annually) or $5/month month-to-month for all 28 modules, plus 1,500 monthly verified B2B lead generation credits." },\r\n      { q: "How does the BERAXIS AI Voice Pilot replace manual ERP navigation?", a: "Instead of navigating through 10 nested submenus in Odoo, BERAXIS AI features a native Duplex Voice Pilot. You can speak naturally: 'Create a quote for Acme Corp for 50 units', 'Show me today's cash register totals', or 'Check stock in warehouse B', and the action executes instantly." }`
  }
]);
syncToRoot('frontend/lib/comparisonData.ts', 'lib/comparisonData.ts');

console.log('--- 3. Updating Comparison Layout (frontend/app/compare/layout.tsx) ---');
replaceInFile(path.join(__dirname, '../frontend/app/compare/layout.tsx'), [
  {
    search: `title: "Compare Beraxis AI vs. Odoo, HubSpot, Zoho CRM, Salesforce & QuickBooks",`,
    replace: `title: "Compare BERAXIS AI vs. Odoo, HubSpot, Zoho CRM, Salesforce & QuickBooks · #1 Free Odoo Alternative (2026)",`
  },
  {
    search: `    "Odoo alternative",\n    "Odoo alternatives",`,
    replace: `    "Odoo AI alternative",\n    "Best Odoo alternative 2026",\n    "Free Odoo alternative",\n    "Odoo free alternative 2026",\n    "Odoo alternative",\n    "Odoo alternatives",\n    "Odoo vs BERAXIS AI",\n    "BERAXIS AI vs Odoo",\n    "Switch from Odoo to BERAXIS AI",\n    "BERAXIS AI",`
  },
  {
    search: `    "Odoo alternative",\r\n    "Odoo alternatives",`,
    replace: `    "Odoo AI alternative",\r\n    "Best Odoo alternative 2026",\r\n    "Free Odoo alternative",\r\n    "Odoo free alternative 2026",\r\n    "Odoo alternative",\r\n    "Odoo alternatives",\r\n    "Odoo vs BERAXIS AI",\r\n    "BERAXIS AI vs Odoo",\r\n    "Switch from Odoo to BERAXIS AI",\r\n    "BERAXIS AI",`
  },
  {
    search: `"name": "Beraxis vs. Odoo ERP",`,
    replace: `"name": "BERAXIS AI vs. Odoo ERP (#1 Free 2026 Alternative)",`
  }
]);
syncToRoot('frontend/app/compare/layout.tsx', 'app/compare/layout.tsx');

console.log('--- 4. Updating Comparison Hub (frontend/app/compare/page.tsx) ---');
replaceInFile(path.join(__dirname, '../frontend/app/compare/page.tsx'), [
  {
    search: `const [selectedCompetitor, setSelectedCompetitor] = useState<string>("quickbooks-alternative");`,
    replace: `const [selectedCompetitor, setSelectedCompetitor] = useState<string>("odoo-alternative");`
  },
  {
    search: `Why High-Growth Businesses Are Replacing Their <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-400">Entire SaaS Stack</span> With Beraxis`,
    replace: `Why High-Growth Businesses Are Replacing Odoo & Legacy SaaS With <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-400">BERAXIS AI</span>`
  },
  {
    search: `Stop paying $400+/month for fragmented apps, brittle integrations, and $20,000 consultant onboarding. See how Beraxis unifies your operations for just $1/month.`,
    replace: `Stop paying $400+/month for fragmented apps, brittle Odoo modules, and $20,000 consultant onboarding. See how BERAXIS AI unifies your operations for just $1/month.`
  }
]);
syncToRoot('frontend/app/compare/page.tsx', 'app/compare/page.tsx');

console.log('--- 5. Updating Comparison Slug Page (frontend/app/compare/[slug]/page.tsx) ---');
replaceInFile(path.join(__dirname, '../frontend/app/compare/[slug]/page.tsx'), [
  {
    search: `const title = \`Best Free \${comp.competitorName} Alternative (2026) | Beraxis AI\`;`,
    replace: `const title = \`Best Free \${comp.competitorName} Alternative (2026) | BERAXIS AI\`;`
  },
  {
    search: `siteName: "Beraxis AI",`,
    replace: `siteName: "BERAXIS AI",`
  },
  {
    search: `"name": "Beraxis AI Autonomous ERP & CRM",`,
    replace: `"name": "BERAXIS AI Autonomous Enterprise Suite",\n    "alternateName": "BERAXIS AI",`
  }
]);
syncToRoot('frontend/app/compare/[slug]/page.tsx', 'app/compare/[slug]/page.tsx');

console.log('--- 6. Updating Navbar (frontend/components/landing/Navbar.tsx) ---');
replaceInFile(path.join(__dirname, '../frontend/components/landing/Navbar.tsx'), [
  {
    search: `alt="Beraxis Autonomous AI ERP & CRM Platform"`,
    replace: `alt="BERAXIS AI - #1 Autonomous AI ERP & CRM Platform (Free Odoo Alternative)"`
  },
  {
    search: `<div className="text-[10px] text-gray-400">vs Odoo, HubSpot, QuickBooks, Zoho.</div>`,
    replace: `<div className="text-[10px] text-gray-400">#1 Odoo, HubSpot &amp; QuickBooks Alternative.</div>`
  }
]);
syncToRoot('frontend/components/landing/Navbar.tsx', 'components/landing/Navbar.tsx');

console.log('--- 7. Updating Footer (frontend/components/landing/Footer.tsx) ---');
replaceInFile(path.join(__dirname, '../frontend/components/landing/Footer.tsx'), [
  {
    search: `alt="Beraxis Autonomous AI ERP & CRM Platform"`,
    replace: `alt="BERAXIS AI - #1 Autonomous AI ERP & CRM Platform"`
  },
  {
    search: `The #1 autonomous AI ERP &amp; CRM command center. Unify 28 business modules with built-in global B2B leads directory, point of sale, smart inventory, and voice assist pilot for $1/month.`,
    replace: `BERAXIS AI is the #1 autonomous AI ERP &amp; CRM command center. Unify 28 business modules with built-in 25M+ global B2B leads directory, point of sale, double-entry accounting, smart inventory, and AI Voice Pilot for $1/month. The leading free alternative to Odoo and HubSpot.`
  },
  {
    search: `<li><Link href="/compare/odoo-alternative" className="hover:text-white transition-colors">Odoo ERP Alternative</Link></li>`,
    replace: `<li><Link href="/compare/odoo-alternative" className="hover:text-amber-300 font-semibold text-amber-400">⚡ Odoo AI Alternative (Free 2026)</Link></li>`
  },
  {
    search: `<p>© {currentYear} Beraxis Systems Inc. All rights reserved. The Premier Autonomous Cloud ERP &amp; AI CRM System.</p>`,
    replace: `<p>© {currentYear} BERAXIS AI Systems Inc. All rights reserved. The Premier Autonomous AI ERP &amp; AI CRM Suite · #1 Free Odoo Alternative.</p>`
  }
]);
syncToRoot('frontend/components/landing/Footer.tsx', 'components/landing/Footer.tsx');

console.log('--- 8. Updating Hero (frontend/components/landing/Hero.tsx) ---');
replaceInFile(path.join(__dirname, '../frontend/components/landing/Hero.tsx'), [
  {
    search: `Replace 5+ expensive, disconnected tools like Odoo, Salesforce, and QuickBooks. Run Accounting, POS, Inventory, HR &amp; CRM across 28 unified modules — with <strong className="text-cyan-300 font-semibold drop-shadow-[0_0_8px_rgba(103,232,249,0.3)]">integrated B2B lead discovery</strong> built-in.`,
    replace: `The #1 Free Odoo Alternative in 2026. Replace 5+ expensive, disconnected tools like Odoo, Salesforce, and QuickBooks with BERAXIS AI. Run Accounting, POS, Inventory, HR &amp; CRM across 28 unified modules — with <strong className="text-cyan-300 font-semibold drop-shadow-[0_0_8px_rgba(103,232,249,0.3)]">25M+ integrated B2B leads</strong> and AI Voice Pilot built-in.`
  }
]);
syncToRoot('frontend/components/landing/Hero.tsx', 'components/landing/Hero.tsx');

console.log('--- 9. Updating Features (frontend/components/landing/Features.tsx) ---');
replaceInFile(path.join(__dirname, '../frontend/components/landing/Features.tsx'), [
  {
    search: `<th className="py-4 px-6 bg-purple-500/10 text-purple-300 font-bold rounded-t-xl">Beraxis ERP</th>`,
    replace: `<th className="py-4 px-6 bg-purple-500/10 text-purple-300 font-bold rounded-t-xl">BERAXIS AI</th>`
  },
  {
    search: `<th className="py-4 px-6 text-gray-400">Other Tools & Legacy Suites</th>`,
    replace: `<th className="py-4 px-6 text-gray-400">Odoo &amp; Legacy ERP Suites</th>`
  },
  {
    search: `Legacy Tools to Beraxis`,
    replace: `Legacy Tools &amp; Odoo to BERAXIS AI`
  }
]);
syncToRoot('frontend/components/landing/Features.tsx', 'components/landing/Features.tsx');

console.log('--- 10. Updating Blog Data (frontend/lib/blog-data.ts) ---');
replaceInFile(path.join(__dirname, '../frontend/lib/blog-data.ts'), [
  {
    search: `title: "Odoo vs Beraxis: The True Cost of Implementation Consultants vs. Instant AI ERP",`,
    replace: `title: "Best Free Odoo Alternative (2026): The True Cost of Implementation Consultants vs. BERAXIS AI",`
  },
  {
    search: `title: "Why Growing Businesses Are Switching from Odoo, HubSpot, Zoho, and Salesforce to Beraxis in 2026",`,
    replace: `title: "Why Growing Businesses Are Switching from Odoo, HubSpot, Zoho, and Salesforce to BERAXIS AI in 2026",`
  }
]);
syncToRoot('frontend/lib/blog-data.ts', 'lib/blog-data.ts');

console.log('--- 11. Updating Pricing Layout (frontend/app/pricing/layout.tsx) ---');
replaceInFile(path.join(__dirname, '../frontend/app/pricing/layout.tsx'), [
  {
    search: `title: "Free ERP, Free CRM & $1/Mo Early Bird Pricing · Beraxis",`,
    replace: `title: "Free AI ERP, Free AI CRM & $1/Mo Early Bird Pricing · BERAXIS AI (#1 Free Odoo Alternative)",`
  },
  {
    search: `"Odoo pricing alternative",`,
    replace: `"Odoo AI alternative",\n    "Best Odoo alternative 2026",\n    "Free Odoo alternative",\n    "Odoo pricing alternative",\n    "BERAXIS AI",`
  },
  {
    search: `siteName: "Beraxis",`,
    replace: `siteName: "BERAXIS AI",`
  },
  {
    search: `"name": "Beraxis"`,
    replace: `"name": "BERAXIS AI"`
  }
]);
syncToRoot('frontend/app/pricing/layout.tsx', 'app/pricing/layout.tsx');

console.log('--- ALL BRANDING & ODOO SEO UPGRADES COMPLETE ---');
