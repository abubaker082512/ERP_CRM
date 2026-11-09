import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affordable Cloud ERP with Monthly Subscription Pricing ($1/mo) · BERAXIS AI",
  description: "Looking for affordable cloud ERP options with monthly subscription pricing? Deploy all 28 apps: double-entry accounting, CRM, POS & inventory for $1/month. 1 App 100% Free Forever with zero credit card.",
  keywords: [
    "Free ERP",
    "Free CRM",
    "Free POS",
    "Free Tier Business Software",
    "Free accounting software",
    "Free inventory management",
    "1 dollar ERP",
    "One dollar ERP software",
    "Affordable cloud ERP",
    "Cheapest CRM for small business",
    "Beraxis pricing",
    "Odoo AI alternative",
    "Best Odoo alternative 2026",
    "Free Odoo alternative",
    "Odoo pricing alternative",
    "BERAXIS AI",
    "HubSpot pricing alternative",
    "Zoho pricing alternative",
    "Salesforce pricing alternative",
    "Best value ERP software 2026",
    "SaaS subscription pricing",
    "No credit card free CRM"
  ],
  alternates: {
    canonical: "https://www.beraxis.online/pricing",
  },
  openGraph: {
    title: "Free ERP & CRM Pricing · Forever Free or $1/Month Early Bird · Beraxis",
    description: "Forever Free Tier for Free CRM & POS. Or unlock all 28 enterprise modules and 1,500 verified lead credits/mo for $1/month ($12/yr).",
    url: "https://www.beraxis.online/pricing",
    siteName: "BERAXIS AI",
    images: ["https://www.beraxis.online/og-image.png?v=3"],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free ERP & CRM Pricing · Forever Free or $1/Month Early Bird · Beraxis",
    description: "Forever Free Tier for Free CRM & POS. Or unlock all 28 enterprise modules and 1,500 verified lead credits/mo for $1/month ($12/yr).",
    images: ["https://www.beraxis.online/og-image.png?v=3"],
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  const pricingSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Beraxis AI Autonomous ERP & CRM Suite",
    "description": "Autonomous cloud ERP and CRM platform featuring 28 modules, verified B2B lead pool, double-entry accounting, touch POS, and AI Voice Pilot.",
    "brand": {
      "@type": "Brand",
      "name": "BERAXIS AI"
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "USD",
      "lowPrice": "0.00",
      "highPrice": "1.00",
      "offerCount": 2,
      "offers": [
        {
          "@type": "Offer",
          "name": "Forever Free Tier",
          "price": "0.00",
          "priceCurrency": "USD",
          "description": "1 full business module (Free CRM, Free POS, or Free Inventory) with unlimited seats and zero credit card required."
        },
        {
          "@type": "Offer",
          "name": "Early Bird Standard Plan",
          "price": "1.00",
          "priceCurrency": "USD",
          "description": "$1.00 per month ($12 billed annually) unlocking all 28 enterprise modules and 1,500 lead generation credits per month."
        }
      ]
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingSchema) }}
      />
      {children}
    </>
  );
}
