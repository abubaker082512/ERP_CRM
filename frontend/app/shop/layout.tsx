import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Official App & Add-on Store · Beraxis AI ERP & CRM",
  description: "Explore official add-ons, modules, and premium services for Beraxis Cloud ERP & CRM. Upgrade your enterprise stack with specialized apps, dedicated support packages, and onboarding.",
  keywords: [
    "ERP modules",
    "CRM add-ons",
    "Business software store",
    "Beraxis apps",
    "Enterprise modules store",
    "ERP implementation packages"
  ],
  alternates: {
    canonical: "https://www.beraxis.online/shop",
  },
  openGraph: {
    title: "Official App & Add-on Store · Beraxis AI ERP & CRM",
    description: "Browse official business modules, add-ons, and implementation services for Beraxis.",
    url: "https://www.beraxis.online/shop",
    siteName: "Beraxis",
    images: [
      {
        url: "https://www.beraxis.online/og-image.png?v=3",
        width: 1200,
        height: 630,
        alt: "Beraxis Business Store",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Official App & Add-on Store · Beraxis AI",
    description: "Browse official business modules, add-ons, and implementation services for Beraxis.",
    images: ["https://www.beraxis.online/og-image.png?v=3"],
  },
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Beraxis App & Add-on Store",
    "description": "Browse and deploy official business modules and implementation packages for Beraxis Cloud ERP & CRM.",
    "publisher": {
      "@type": "Organization",
      "name": "Beraxis Systems Inc.",
      "url": "https://www.beraxis.online"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }}
      />
      {children}
    </>
  );
}
