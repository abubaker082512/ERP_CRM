import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Beraxis AI vs. Odoo, HubSpot, Zoho CRM, Salesforce & QuickBooks",
  description: "Comprehensive 2026 software comparisons. See why businesses are switching from Odoo, HubSpot, Zoho, Salesforce, and QuickBooks to Beraxis AI for unified double-entry accounting, 25M+ verified B2B leads, POS, and multi-warehouse ERP for $1/month.",
  keywords: [
    "Odoo alternative",
    "Odoo alternatives",
    "Best Odoo alternative 2026",
    "Odoo vs Beraxis",
    "HubSpot alternative",
    "HubSpot alternatives",
    "Best HubSpot alternative 2026",
    "HubSpot vs Beraxis",
    "Zoho CRM alternative",
    "Zoho alternative",
    "Zoho One alternative",
    "Zoho vs Beraxis",
    "Salesforce alternative",
    "Salesforce alternatives",
    "Best Salesforce alternative 2026",
    "Salesforce vs Beraxis",
    "QuickBooks alternative",
    "QuickBooks vs Beraxis",
    "Free Odoo alternative",
    "Free HubSpot alternative",
    "Free QuickBooks alternative",
    "Free Salesforce alternative",
    "Free Zoho CRM alternative",
    "Free Square POS alternative",
    "Free Toast POS alternative",
    "Free ERP software",
    "Free CRM software",
    "NetSuite alternative",
    "SAP alternative",
    "Cloud ERP comparison",
    "SaaS cost comparison",
    "All-in-one business software"
  ],
  alternates: {
    canonical: "https://www.beraxis.online/compare",
  },
  openGraph: {
    title: "Compare Beraxis AI vs. Odoo, HubSpot, Zoho CRM, Salesforce & QuickBooks",
    description: "Replace 5 fragmented tools and stop overpaying $400/month. Compare Beraxis AI head-to-head with Odoo, HubSpot, Zoho CRM, Salesforce, and QuickBooks.",
    url: "https://www.beraxis.online/compare",
    siteName: "Beraxis AI",
    images: [
      {
        url: "https://www.beraxis.online/social_media_assets/ad4_carousel_comparison_square.png",
        width: 1080,
        height: 1080,
        alt: "Beraxis AI vs. Competitors Software Stack Comparison",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Compare Beraxis AI vs. Odoo, HubSpot, Zoho CRM, Salesforce & QuickBooks",
    description: "Stop paying the $400/mo SaaS tax. Full double-entry accounting, 25M+ verified B2B leads, POS, and ERP for $1/month.",
    images: ["https://www.beraxis.online/social_media_assets/ad4_carousel_comparison_square.png"],
  },
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hubSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Beraxis AI Software Comparisons & Alternatives",
    "description": "Head-to-head operational comparisons between Beraxis AI and Odoo, HubSpot, Zoho CRM, Salesforce, QuickBooks, SAP, NetSuite, and Square.",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Beraxis vs. Odoo ERP",
        "url": "https://www.beraxis.online/compare/odoo-alternative"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Beraxis vs. HubSpot CRM",
        "url": "https://www.beraxis.online/compare/hubspot-alternative"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Beraxis vs. Zoho CRM & Zoho One",
        "url": "https://www.beraxis.online/compare/zoho-crm-alternative"
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": "Beraxis vs. Salesforce Sales Cloud",
        "url": "https://www.beraxis.online/compare/salesforce-alternative"
      },
      {
        "@type": "ListItem",
        "position": 5,
        "name": "Beraxis vs. QuickBooks Online",
        "url": "https://www.beraxis.online/compare/quickbooks-alternative"
      },
      {
        "@type": "ListItem",
        "position": 6,
        "name": "Beraxis vs. Traditional ERP (SAP & NetSuite)",
        "url": "https://www.beraxis.online/compare/traditional-erp-vs-beraxis"
      },
      {
        "@type": "ListItem",
        "position": 7,
        "name": "Beraxis vs. Toast & Square POS",
        "url": "https://www.beraxis.online/compare/toast-square-pos-alternative"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hubSchema) }}
      />
      {children}
    </>
  );
}
