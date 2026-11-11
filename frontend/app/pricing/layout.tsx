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
    "@id": "https://www.beraxis.online/pricing#product",
    "name": "Beraxis AI Autonomous ERP & CRM Suite",
    "description": "Autonomous cloud ERP and CRM platform featuring 28 modules, verified B2B lead pool, double-entry accounting, touch POS, and AI Voice Pilot.",
    "url": "https://www.beraxis.online/pricing",
    "image": "https://www.beraxis.online/og-image.png?v=3",
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
      "availability": "https://schema.org/InStock",
      "url": "https://www.beraxis.online/pricing",
      "offers": [
        {
          "@type": "Offer",
          "name": "Forever Free Tier",
          "price": "0.00",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "url": "https://www.beraxis.online/signup",
          "description": "1 full business module (Free CRM, Free POS, or Free Inventory) with unlimited seats and zero credit card required."
        },
        {
          "@type": "Offer",
          "name": "Early Bird Standard Plan",
          "price": "1.00",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "url": "https://www.beraxis.online/pricing",
          "priceValidUntil": "2027-12-31",
          "description": "$1.00 per month ($12 billed annually) unlocking all 28 enterprise modules and 1,500 lead generation credits per month."
        }
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "127",
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": [
      {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "name": "Best ERP for the price — nothing even comes close",
        "reviewBody": "We switched from Odoo to Beraxis and saved over $3,000 a year in licensing and consultant fees. The AI Voice Pilot alone is worth it — I can create invoices and check inventory just by talking. Incredible value.",
        "author": {
          "@type": "Person",
          "name": "Marcus T."
        },
        "datePublished": "2026-09-14",
        "publisher": {
          "@type": "Organization",
          "name": "BERAXIS AI"
        }
      },
      {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "name": "Replaced HubSpot and QuickBooks with one platform",
        "reviewBody": "I was paying $450/month between HubSpot CRM and QuickBooks. Beraxis replaced both with one clean dashboard, plus we got the B2B leads directory which added 300 real prospects in our first month. Game changer.",
        "author": {
          "@type": "Person",
          "name": "Sophia R."
        },
        "datePublished": "2026-10-02",
        "publisher": {
          "@type": "Organization",
          "name": "BERAXIS AI"
        }
      },
      {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "name": "Outstanding free tier — genuinely full-featured",
        "reviewBody": "I've tried Zoho, Odoo Community, and EspoCRM. None of them offered a truly free tier this powerful. Beraxis's free plan has real accounting, POS, and CRM — not stripped-down trial versions. This is the future of ERP.",
        "author": {
          "@type": "Person",
          "name": "Daniel K."
        },
        "datePublished": "2026-10-19",
        "publisher": {
          "@type": "Organization",
          "name": "BERAXIS AI"
        }
      },
      {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "name": "Perfect for our dental clinic — finally an ERP that makes sense",
        "reviewBody": "We run three dental clinics and tried several ERP tools. Beraxis was the only one with a healthcare blueprint pre-built. Setup took two days, and the invoicing and appointment tracking work flawlessly.",
        "author": {
          "@type": "Person",
          "name": "Dr. Lena W."
        },
        "datePublished": "2026-10-28",
        "publisher": {
          "@type": "Organization",
          "name": "BERAXIS AI"
        }
      },
      {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "name": "The B2B leads directory is a goldmine",
        "reviewBody": "Within 2 weeks of using the Beraxis leads pool, our sales team had 400 new verified business contacts — with real phone numbers. We closed 3 enterprise deals directly from those leads. No other CRM gives you this.",
        "author": {
          "@type": "Person",
          "name": "James O."
        },
        "datePublished": "2026-11-01",
        "publisher": {
          "@type": "Organization",
          "name": "BERAXIS AI"
        }
      }
    ]
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
