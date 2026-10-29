import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partner & Affiliate Program · Earn 30% Recurring SaaS Commission · Beraxis",
  description: "Join the high-paying Beraxis Partner & Affiliate Program. Earn 30% lifetime recurring commissions promoting the #1 AI ERP, CRM, and POS platform for small businesses and global enterprises.",
  keywords: [
    "SaaS affiliate program",
    "ERP affiliate program",
    "CRM affiliate program",
    "Earn recurring SaaS commissions",
    "B2B affiliate marketing",
    "High paying software affiliate",
    "Beraxis partner program",
    "Cloud software affiliate 2026",
    "Software referral partner",
    "Recurring commission software",
    "Earn money promoting CRM"
  ],
  alternates: {
    canonical: "https://www.beraxis.online/affiliates",
  },
  openGraph: {
    title: "Partner & Affiliate Program · Earn 30% Recurring Commission · Beraxis",
    description: "Earn up to 30% lifetime recurring commissions on every customer you refer to the Beraxis AI business operating system.",
    url: "https://www.beraxis.online/affiliates",
    siteName: "Beraxis",
    images: [
      {
        url: "https://www.beraxis.online/og-image.png?v=3",
        width: 1200,
        height: 630,
        alt: "Beraxis Partner & Affiliate Program",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Partner & Affiliate Program · Earn 30% Recurring Commission · Beraxis",
    description: "Earn up to 30% lifetime recurring commissions on every customer you refer to the Beraxis AI business operating system.",
    images: ["https://www.beraxis.online/og-image.png?v=3"],
  },
};

export default function AffiliatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const affiliatesSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Beraxis Partner & Affiliate Program",
    "description": "Earn 30% lifetime recurring revenue by referring businesses to the Beraxis AI ERP & CRM platform.",
    "url": "https://www.beraxis.online/affiliates",
    "mainEntity": {
      "@type": "Offer",
      "name": "Beraxis Affiliate Commission Offer",
      "description": "30% recurring monthly commission on all referred subscriptions with a 60-day cookie window and monthly automated payouts.",
      "price": "0.00",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(affiliatesSchema) }}
      />
      {children}
    </>
  );
}
