import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Beraxis AI vs. QuickBooks, Odoo, HubSpot, Zoho CRM & Legacy ERP",
  description: "Detailed 2026 software comparisons. See why businesses are ditching the $400/mo SaaS tax and upgrading to Beraxis AI for double-entry accounting, verified B2B leads, POS, and multi-warehouse ERP for $1/month.",
  keywords: [
    "Free Odoo alternative",
    "Free HubSpot alternative",
    "Free QuickBooks alternative",
    "Free Salesforce alternative",
    "Free Square POS alternative",
    "Free Toast POS alternative",
    "Free Zoho CRM alternative",
    "Free ERP software",
    "Free CRM software",
    "QuickBooks alternative",
    "Odoo alternative",
    "HubSpot alternative",
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
    title: "Compare Beraxis AI vs. QuickBooks, Odoo, HubSpot, Zoho CRM & Legacy ERP",
    description: "Replace 5 fragmented tools and stop overpaying $400/month. Compare Beraxis AI head-to-head with leading accounting, CRM, and ERP platforms.",
    url: "https://www.beraxis.online/compare",
    siteName: "Beraxis AI",
    images: [
      {
        url: "https://www.beraxis.online/social_media_assets/ad4_carousel_comparison_square.png",
        width: 1080,
        height: 1080,
        alt: "Beraxis AI vs. Legacy Software Stack Comparison",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Compare Beraxis AI vs. QuickBooks, Odoo, HubSpot, Zoho CRM & Legacy ERP",
    description: "Stop paying the $400/mo SaaS tax. Full double-entry accounting, verified B2B leads, POS, and ERP for $1/month.",
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
    "description": "Head-to-head operational comparisons between Beraxis AI and QuickBooks, Odoo, HubSpot, SAP, NetSuite, and Square.",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Beraxis vs. QuickBooks Online",
        "url": "https://www.beraxis.online/compare/quickbooks-alternative"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Beraxis vs. Odoo ERP",
        "url": "https://www.beraxis.online/compare/odoo-alternative"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Beraxis vs. HubSpot CRM",
        "url": "https://www.beraxis.online/compare/hubspot-alternative"
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": "Beraxis vs. Traditional ERP (SAP & NetSuite)",
        "url": "https://www.beraxis.online/compare/traditional-erp-vs-beraxis"
      },
      {
        "@type": "ListItem",
        "position": 5,
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
