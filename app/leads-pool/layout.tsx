import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Global B2B Leads Directory & Free Prospect Mining · 25M+ Verified Contacts · Beraxis",
  description: "Search, filter, and instantly ingest 25,000,000+ verified B2B decision-makers worldwide directly into your CRM. Free lead preview and 1,500 monthly export credits included.",
  keywords: [
    "Free B2B leads",
    "Free lead generation software",
    "Free CRM with leads",
    "B2B prospect database",
    "25 million verified B2B leads",
    "Apollo alternative free",
    "ZoomInfo alternative free",
    "Cold email lead directory",
    "Verified CEO emails",
    "1-click CRM lead import",
    "Sales intelligence database",
    "Direct dial phone numbers B2B",
    "Sales prospecting tool with CRM",
    "Beraxis leads pool"
  ],
  alternates: {
    canonical: "https://www.beraxis.online/leads-pool",
  },
  openGraph: {
    title: "Global B2B Leads Directory · 25M+ Verified Contacts · Beraxis",
    description: "Mine verified C-level, VP, and Director contacts across 70+ countries directly into your visual Kanban sales pipeline.",
    url: "https://www.beraxis.online/leads-pool",
    siteName: "Beraxis",
    images: ["https://www.beraxis.online/og-image.png?v=3"],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Global B2B Leads Directory · 25M+ Verified Contacts · Beraxis",
    description: "Mine verified C-level, VP, and Director contacts across 70+ countries directly into your visual Kanban sales pipeline.",
    images: ["https://www.beraxis.online/og-image.png?v=3"],
  },
};

export default function LeadsPoolLayout({ children }: { children: React.ReactNode }) {
  const leadsCatalogSchema = {
    "@context": "https://schema.org",
    "@type": "DataCatalog",
    "name": "Beraxis Global Verified B2B Leads Directory",
    "description": "Global directory of 25,000,000+ verified corporate contacts and business decision-makers with direct emails, telephone numbers, and buying intent scores.",
    "url": "https://www.beraxis.online/leads-pool",
    "provider": {
      "@type": "Organization",
      "name": "Beraxis Systems Inc."
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(leadsCatalogSchema) }}
      />
      {children}
    </>
  );
}
