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

// 1. Sync lib/industryData.ts -> frontend/lib/industryData.ts
writeBoth('lib/industryData.ts', fs.readFileSync(path.join(ROOT, 'lib/industryData.ts'), 'utf8'));

// 2. Sync lib/industryTaxonomy.ts -> frontend/lib/industryTaxonomy.ts
writeBoth('lib/industryTaxonomy.ts', fs.readFileSync(path.join(ROOT, 'lib/industryTaxonomy.ts'), 'utf8'));

// 3. Update app/layout.tsx
updateAndSync('app/layout.tsx', (c) => {
  c = c.replace(
    /description:\s*"[^"]+",/,
    `description: "BERAXIS AI is the #1 Autonomous AI ERP, CRM & Office Automation Software across 15 Global Industries. Use our 1-Click 'Explain Your Business' AI Auto-Setup Engine to deploy 30+ apps—Accounting, CRM, Call Center Dialer, Public Form Builder, POS, Spreadsheets, Slides, Docs, Video Meet & 25M+ B2B Leads—for $1/month or 1 App Free Forever.",`
  );
  c = c.replace(
    `"BERAXIS AI",`,
    `"BERAXIS AI",\n        "Explain Your Business AI ERP auto setup",\n        "1-click AI business software setup",\n        "AI auto-setup ERP and CRM",\n        "15 global industry ERP archetypes",\n        "Call center CRM and power dialer software",\n        "BPO campaign management and AHT analytics",\n        "Hotel management PMS and resort POS ERP",\n        "Agriculture farm management and solar EPC ERP",\n        "Public form builder with CRM campaign routing",\n        "WebRTC video conferencing ERP Meet",\n        "Custom dashboard chart builder ERP",`
  );
  c = c.replace(
    `"12 Industry Operational Blueprints",`,
    `"1-Click 'Explain Your Business' AI Auto-Setup Engine",\n                    "15 Global Industry Operational Blueprints (Retail, F&B, Clinics, Padel, Hotels, Agriculture/Solar, Call Centers & More)",\n                    "Call Center Power Dialer, Campaign Management, Lead Sheet Dispositions & AHT Analytics",\n                    "Public Form Builder with System Fields & Automated CRM Routing",\n                    "All-Industry Enterprise BI Reports & Custom Dashboard Chart Builder",`
  );
  c = c.replace(
    /Beraxis comes pre-engineered with dedicated operational blueprints for 12 global industries[^"]+/,
    `BERAXIS AI comes pre-engineered with dedicated operational blueprints for 15 global industries—including padel and sports clubs, call centers and BPOs, hotels and resorts, agriculture and solar EPC contractors, dental and medical clinics, bakeries and restaurants, supermarkets and retail, auto repair workshops, real estate brokerages, construction contractors, schools, NGOs, logistics, professional services, and discrete manufacturing. Plus, with our 1-Click 'Explain Your Business' AI Auto-Setup Engine, you can simply describe your company in plain English and BERAXIS AI automatically configures your workspace and apps in seconds.`
  );
  return c;
});

// 4. Update components/landing/Hero.tsx
updateAndSync('components/landing/Hero.tsx', (c) => {
  c = c.replace(
    `<span>30-Second Setup</span>`,
    `<span>1-Click "Explain Business" AI Auto-Setup</span>`
  );
  c = c.replace(
    /BERAXIS AI covers all ERP, CRM, and Office Automation in 30\+ unified modules/,
    `BERAXIS AI covers all ERP, CRM, Call Center Dialer, Public Forms, and Office Automation across 15 Global Industries with our 1-Click "Explain Your Business" Auto-Setup Engine`
  );
  return c;
});

// 5. Update components/landing/Features.tsx
updateAndSync('components/landing/Features.tsx', (c) => {
  if (!c.includes('Explain Your Business')) {
    c = c.replace(
      `title: "AI Dual-Brain Context Engine",`,
      `title: "1-Click 'Explain Business' Auto-Setup",`
    );
    c = c.replace(
      `description: "Macro-Brain global intelligence combined with micro-tenant vector memory for hyper-personalized, secure data insights.",`,
      `description: "Describe your business in plain English and BERAXIS AI automatically detects your industry archetype (across 15 global verticals) and configures your exact ERP, POS, and CRM apps in 1 click.",`
    );
    c = c.replace(
      `title: "Executive BI Dashboards",`,
      `title: "Call Center Dialer, Forms & BI Reports",`
    );
    c = c.replace(
      `description: "Bird's-eye view analytics, financial statements, real-time KPI graphs, and custom reporting for data-driven decisions.",`,
      `description: "Multi-campaign Call Center Power Dialer, Lead Sheet dispositions, AHT telemetry, Public Form Builder with System Fields, and Custom Dashboard Chart Builder.",`
    );
  }
  return c;
});

// 6. Update components/landing/IndustryShowcase.tsx
updateAndSync('components/landing/IndustryShowcase.tsx', (c) => {
  if (!c.includes('Headphones')) {
    c = c.replace(
      `  HeartHandshake,`,
      `  HeartHandshake,\n  Headphones,\n  Hotel,\n  Sprout,`
    );
    c = c.replace(
      `  HeartHandshake\n};`,
      `  HeartHandshake,\n  Headphones,\n  Hotel,\n  Sprout\n};`
    );
    c = c.replace(
      `  HeartHandshake\r\n};`,
      `  HeartHandshake,\r\n  Headphones,\r\n  Hotel,\r\n  Sprout\r\n};`
    );
  }
  if (!c.includes('call-centers-bpo')) {
    c = c.replace(
      `  professional_services: "professional-services",`,
      `  professional_services: "professional-services",\n  call_center: "call-centers-bpo",\n  hospitality_travel: "hospitality-hotels",\n  agriculture_agritech: "agriculture-agritech",`
    );
  }
  c = c.replace(/12 Global Industries/g, '15 Global Industries');
  c = c.replace(
    /From padel clubs, NGOs, and artisan bakeries[^<]+/,
    `From padel clubs, call centers, hotels & resorts, and agriculture/solar EPC to dental clinics, bakeries, auto repair garages, real estate, and manufacturing — or simply type what your company does into our 1-Click "Explain Your Business" Engine and BERAXIS AI auto-sets up your apps in seconds.`
  );
  return c;
});

// 7. Update app/industries/page.tsx
updateAndSync('app/industries/page.tsx', (c) => {
  c = c.replace(/12 Vertical AI ERP/g, '15 Vertical AI ERP');
  c = c.replace(/12 global industries/g, '15 global industries');
  c = c.replace(/12 Global Industries/g, '15 Global Industries');
  c = c.replace(/12 Global Industry Blueprints/g, '15 Global Industry Blueprints');
  c = c.replace(
    /One size never fits all\. Rather than generic software bloat,[^<]+/,
    `One size never fits all. BERAXIS AI comes pre-engineered for 15 global industries—including Call Centers & BPO, Hotels & Resorts, Agriculture & Solar EPC, Padel Clubs, Clinics, Dining KDS, and Retail—plus our 1-Click "Explain Your Business" AI Auto-Setup Engine that configures your exact apps automatically.`
  );
  return c;
});

// 8. Update components/landing/Footer.tsx
updateAndSync('components/landing/Footer.tsx', (c) => {
  if (!c.includes('/industries/call-centers-bpo')) {
    c = c.replace(
      `<li><Link href="/industries/professional-services" className="hover:text-white transition-colors">Professional Services</Link></li>`,
      `<li><Link href="/industries/professional-services" className="hover:text-white transition-colors">Professional Services</Link></li>\n                            <li><Link href="/industries/call-centers-bpo" className="hover:text-cyan-300 font-medium text-cyan-400">Call Centers &amp; BPO Dialer</Link></li>\n                            <li><Link href="/industries/hospitality-hotels" className="hover:text-amber-300 font-medium text-amber-400">Hotels, Resorts &amp; Travel</Link></li>\n                            <li><Link href="/industries/agriculture-agritech" className="hover:text-emerald-300 font-medium text-emerald-400">Agriculture &amp; Solar EPC</Link></li>`
    );
  }
  c = c.replace(/All 12 Archetypes/g, 'All 15 Archetypes');
  c = c.replace(/12 Industry Archetypes/g, '15 Industry Archetypes');
  if (!c.includes('/ai-auto-setup')) {
    c = c.replace(
      `<li><Link href="/ai" className="hover:text-cyan-300 transition-colors font-medium text-cyan-400">Autonomous AI Copilot</Link></li>`,
      `<li><Link href="/ai" className="hover:text-cyan-300 transition-colors font-medium text-cyan-400">Autonomous AI Copilot</Link></li>\n                            <li><Link href="/ai-auto-setup" className="hover:text-emerald-300 transition-colors font-semibold text-emerald-400">✨ 1-Click AI Business Auto-Setup</Link></li>`
    );
  }
  return c;
});

// 9. Update components/landing/Navbar.tsx
updateAndSync('components/landing/Navbar.tsx', (c) => {
  c = c.replace(
    `Voice-driven autonomous copilot &amp; real-time OCR.`,
    `1-Click "Explain Business" Auto-Setup, Voice Pilot &amp; 3s OCR.`
  );
  c = c.replace(
    `Full breakdown of all 34+ integrated enterprise modules.`,
    `34+ Apps, 15 Industry Engines, Call Center, Forms &amp; BI Reports.`
  );
  return c;
});

// 10. Create dedicated SEO Landing Page: app/ai-auto-setup/page.tsx
const aiAutoSetupPage = `import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  Globe,
  Flame,
  HelpCircle,
  Building2,
  Headphones,
  Hotel,
  Sprout,
  Layers,
  Mic,
  FileSpreadsheet
} from "lucide-react";

export const metadata: Metadata = {
  title: "1-Click 'Explain Your Business' AI ERP Auto-Setup & 15 Industry Blueprints | BERAXIS AI",
  description: "Describe your business in plain English and BERAXIS AI automatically sets up your entire ERP, CRM, POS, Call Center Dialer, Public Forms, and Accounting across 15 Global Industry Archetypes in under 30 seconds.",
  keywords: [
    "Explain Your Business AI ERP auto setup",
    "1-click AI business software setup",
    "AI auto-setup ERP and CRM",
    "15 global industry ERP archetypes",
    "automated ERP configuration without consultants",
    "call center BPO CRM software",
    "hotel resort PMS ERP software",
    "agriculture farm management solar EPC ERP",
    "Odoo alternative without implementation consultants",
    "BERAXIS AI auto setup"
  ],
  alternates: {
    canonical: "https://www.beraxis.online/ai-auto-setup",
  },
  openGraph: {
    title: "Explain Your Business — BERAXIS AI Auto-Sets Up Your ERP & CRM in 1 Click",
    description: "No $150/hr consultants. Type what your company does and BERAXIS AI provisions your tailored workspace across 15 Global Industries and 34+ unified modules.",
    url: "https://www.beraxis.online/ai-auto-setup",
    siteName: "BERAXIS AI",
    images: [
      {
        url: "https://www.beraxis.online/og-image.png?v=3",
        width: 1200,
        height: 630,
        alt: "BERAXIS AI 1-Click Explain Your Business Auto-Setup Engine",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

const faqs = [
  {
    q: "How does the 1-Click 'Explain Your Business — BERAXIS Auto-Sets Up Your Apps' Engine work?",
    a: "During onboarding or inside your Apps Cockpit, simply describe your company in natural language (for example: 'We run a 40-seat outbound solar sales call center', 'We operate a boutique resort hotel with a restaurant and gift shop', or 'We manage a dairy farm and wholesale distribution'). Our semantic AI engine scores your description against 15 global industry archetypes, selects your optimal sub-sector and operating mode, and automatically enables the exact ERP, CRM, POS, and reporting modules your business needs."
  },
  {
    q: "What are the 15 Global Industry Archetypes included in BERAXIS AI?",
    a: "BERAXIS AI includes pre-engineered operational blueprints for: (1) Food & Beverage / Dining KDS, (2) Retail & Supermarkets, (3) Professional Services & Agencies, (4) Discrete Manufacturing & MRP, (5) Healthcare & Dental Clinics (EMR), (6) Automotive & Repair Workshops, (7) Real Estate & Property Leases, (8) Education & Academies, (9) Logistics, Wholesale & 3PL, (10) Construction & Contracting, (11) Gyms, Fitness & Padel Clubs, (12) NGOs & Grant Management, (13) Call Centers, BPO & Outbound Sales, (14) Hospitality, Hotels, Resorts & Travel, and (15) Agriculture, Livestock & Solar/Energy EPC."
  },
  {
    q: "What new Call Center, Public Form Builder, and Reporting features are included?",
    a: "BERAXIS AI now includes a full Call Center Campaign Management suite integrated with an interactive Agent Lead Sheet, Power Dialer, Call Dispositions, and Average Handle Time (AHT) Analytics; a drag-and-drop Public Form Builder with System Fields (Campaigns, CRM Stages, Departments, Amount, Date, Address) and Excel/CSV export; Live WebRTC Video Conferencing (Beraxis Meet with waiting room lobby); and an All-Industry Enterprise Reports & Custom Dashboard Chart Builder."
  },
  {
    q: "Can I customize or add more apps after the AI Auto-Setup completes?",
    a: "Yes! While the AI Auto-Setup provisions your ideal starting workspace in 1 click, you can open the Manage Apps wizard at any time to toggle any of our 34+ unified modules on or off instantly."
  }
];

export default function AiAutoSetupPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "BERAXIS AI 1-Click Explain Your Business Auto-Setup Engine",
        "applicationCategory": "BusinessApplication",
        "applicationSubCategory": "Autonomous AI ERP & CRM Onboarding Engine",
        "operatingSystem": "Web, Cloud, iOS, Android",
        "description": "1-Click natural-language business onboarding engine that auto-configures 34+ ERP, CRM, POS, Call Center, and Office apps across 15 Global Industry Archetypes.",
        "offers": {
          "@type": "Offer",
          "price": "1.00",
          "priceCurrency": "USD",
          "priceValidUntil": "2027-12-31"
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": faqs.map(f => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": f.a
          }
        }))
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[#020205] text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-black relative overflow-hidden">
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-grow pt-28 sm:pt-36 pb-20 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-6 font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-emerald-400 font-semibold">1-Click AI Business Auto-Setup</span>
          </div>

          {/* Hero */}
          <div className="text-center max-w-4xl mx-auto space-y-5 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} className="text-emerald-400" />
              <span>Zero Consultants • 15 Global Industry Archetypes</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Explain Your Business —{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400">
                BERAXIS AI Auto-Sets Up Your Apps
              </span>
            </h1>

            <p className="text-gray-300 text-sm sm:text-lg max-w-3xl mx-auto font-normal leading-relaxed">
              Forget 90-day ERP consulting projects. Describe what your business does in one sentence, and BERAXIS AI automatically detects your industry archetype across <strong>15 global sectors</strong>, configures your operating mode, and launches your exact ERP, CRM, Call Center, POS, and Accounting apps in <strong>1 click</strong>.
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center pt-3">
              <Link
                href="/apps?onboarding=true"
                className="galaxy-btn-primary !px-8 !py-4 text-sm font-extrabold flex items-center justify-center gap-2"
              >
                Try 1-Click AI Auto-Setup Live <ArrowRight size={16} />
              </Link>
              <Link
                href="/industries"
                className="galaxy-btn-secondary !px-8 !py-4 text-sm font-bold flex items-center justify-center gap-2"
              >
                Explore All 15 Industry Blueprints
              </Link>
            </div>
          </div>

          {/* 3 Newest Industry Archetypes Highlight */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <Link href="/industries/call-centers-bpo" className="bg-[#0F172A]/80 border border-cyan-500/30 hover:border-cyan-400 rounded-2xl p-6 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
                <Headphones size={20} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Archetype #13</span>
              <h3 className="text-lg font-bold text-white mt-1 mb-2 group-hover:text-cyan-300">Call Centers, BPO &amp; Outbound Sales</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Multi-campaign power dialer, interactive Agent Lead Sheet, call dispositioning, Public Form Builder with System Fields, and live AHT analytics.
              </p>
            </Link>

            <Link href="/industries/hospitality-hotels" className="bg-[#0F172A]/80 border border-amber-500/30 hover:border-amber-400 rounded-2xl p-6 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <Hotel size={20} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Archetype #14</span>
              <h3 className="text-lg font-bold text-white mt-1 mb-2 group-hover:text-amber-300">Hospitality, Hotels, Resorts &amp; Travel</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Room &amp; suite booking calendar (PMS), front-desk check-in folios, housekeeping dispatch, restaurant KDS/POS room charges, and tour CRM.
              </p>
            </Link>

            <Link href="/industries/agriculture-agritech" className="bg-[#0F172A]/80 border border-emerald-500/30 hover:border-emerald-400 rounded-2xl p-6 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <Sprout size={20} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Archetype #15</span>
              <h3 className="text-lg font-bold text-white mt-1 mb-2 group-hover:text-emerald-300">Agriculture, Livestock &amp; Solar EPC</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Crop &amp; harvest lot traceability, seed/feed/fertilizer BOMs, livestock herd logs, serialized solar panel/inverter tracking, and wholesale B2B leads.
              </p>
            </Link>
          </div>

          {/* FAQs */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center mb-8">
              Frequently Asked Questions About 1-Click AI Auto-Setup
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-[#0F172A]/80 border border-white/10 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <HelpCircle size={16} className="text-emerald-400 shrink-0" />
                    <span>{faq.q}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed pl-6">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
`;

writeBoth('app/ai-auto-setup/page.tsx', aiAutoSetupPage);

// 11. Update components/layout/GalaxyAppShell.tsx (whitelist /ai-auto-setup in isPublic)
updateAndSync('components/layout/GalaxyAppShell.tsx', (c) => {
  if (!c.includes("pathname.startsWith('/ai-auto-setup')")) {
    c = c.replace(
      "pathname.startsWith('/ai') ||",
      "pathname.startsWith('/ai') ||\n        pathname.startsWith('/ai-auto-setup') ||"
    );
  }
  return c;
});

// 12. Update app/sitemap.ts
updateAndSync('app/sitemap.ts', (c) => {
  if (!c.includes('/ai-auto-setup')) {
    c = c.replace(
      "{ url: `${baseUrl}/ai`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },",
      "{ url: `${baseUrl}/ai`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },\n    { url: `${baseUrl}/ai-auto-setup`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },"
    );
  }
  c = c.replace(/12 Archetypes/g, '15 Archetypes');
  return c;
});

// 13. Update lib/comparisonData.ts (12 -> 15 Global Industry Archetypes & 1-Click AI Auto-Setup)
updateAndSync('lib/comparisonData.ts', (c) => {
  c = c.replace(/12 Global Industry Archetypes/g, '15 Global Industry Archetypes & 1-Click AI Auto-Setup');
  c = c.replace(/12 industry blueprints/g, '15 industry blueprints & 1-Click "Explain Your Business" AI Auto-Setup');
  return c;
});

// 14. Update Pitch Deck files (generate_international_investor_deck.py & app/pitch-deck/page.tsx)
for (const f of ['generate_international_investor_deck.py', 'app/pitch-deck/page.tsx', 'frontend/app/pitch-deck/page.tsx']) {
  const fullP = path.join(ROOT, f);
  let c = fs.readFileSync(fullP, 'utf8');
  c = c.replace(/12 Turnkey Industry Archetypes/g, '15 Turnkey Industry Archetypes & 1-Click AI Auto-Setup');
  c = c.replace(/\+ 12 Industry Blueprints/g, '+ 15 Industry Blueprints');
  c = c.replace(/\+ 12 Industry Archetypes/g, '+ 15 Industry Archetypes');
  c = c.replace(/12 global industry archetypes/g, "15 global industry archetypes with our 1-Click 'Explain Your Business' Auto-Setup Engine");
  c = c.replace(/12 Industry Archetypes/g, '15 Industry Archetypes');
  c = c.replace(/12 Industry Blueprints/g, '15 Industry Blueprints');
  c = c.replace(/12 Industry Engines/g, '15 Industry Engines');
  c = c.replace(/1\. 30-Second Industry Blueprints \(Zero Consultants\):/g, "1. 1-Click 'Explain Your Business' AI Auto-Setup (15 Industries):");
  c = c.replace(/1\. 30-Second Industry Blueprints/g, "1. 1-Click 'Explain Business' AI Auto-Setup");
  fs.writeFileSync(fullP, c, 'utf8');
  console.log('[UPDATED PITCH DECK]', f);
}

console.log('ALL SEO & 15-INDUSTRY AUTO-SETUP UPGRADES COMPLETED!');
