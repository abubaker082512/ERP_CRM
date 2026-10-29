import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All 28 Enterprise Business Apps & ERP Modules · Free Forever Tier · Beraxis",
  description: "Explore all 28 fully integrated business modules in Beraxis: Free CRM pipeline, omnichannel touch POS, double-entry general ledger, smart inventory, HRMS payroll, and global B2B leads directory for $1/month.",
  keywords: [
    "All business apps",
    "Free ERP apps",
    "Free CRM app",
    "Free POS app",
    "Cloud accounting app",
    "Warehouse inventory management app",
    "HRMS payroll app",
    "B2B lead generation app",
    "Voice AI business assistant app",
    "Complete ERP app suite",
    "Point of sale app",
    "Invoicing app",
    "Integrated business software",
    "Best free business software 2026",
    "Beraxis apps directory"
  ],
  alternates: {
    canonical: "https://www.beraxis.online/apps",
  },
  openGraph: {
    title: "All 28 Enterprise Business Apps & ERP Modules · Beraxis",
    description: "Explore all 28 integrated modules: CRM, POS, Accounting, Inventory, HRMS, and Global Leads for $1/mo with 1 App Free Forever.",
    url: "https://www.beraxis.online/apps",
    siteName: "Beraxis",
    images: [
      {
        url: "https://www.beraxis.online/og-image.png?v=3",
        width: 1200,
        height: 630,
        alt: "Beraxis All 28 Apps Directory",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "All 28 Enterprise Business Apps & ERP Modules · Beraxis",
    description: "Explore all 28 integrated modules: CRM, POS, Accounting, Inventory, HRMS, and Global Leads for $1/mo with 1 App Free Forever.",
    images: ["https://www.beraxis.online/og-image.png?v=3"],
  },
};

export default function AppsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const appsSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Beraxis All 28 Business Applications & Enterprise Modules",
    "description": "Comprehensive suite of 28 integrated cloud enterprise applications covering CRM, double-entry accounting, point of sale, multi-warehouse inventory, and global B2B lead generation.",
    "url": "https://www.beraxis.online/apps",
    "hasPart": [
      {
        "@type": "SoftwareApplication",
        "name": "Beraxis Sales CRM",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web, iOS, Android, Cloud",
        "description": "Visual Kanban sales pipeline, deal stage tracking, proposal builder, and contact management."
      },
      {
        "@type": "SoftwareApplication",
        "name": "Beraxis Double-Entry Accounting",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web, iOS, Android, Cloud",
        "description": "GAAP/IFRS compliant general ledger, P&L, balance sheets, and automated invoice OCR."
      },
      {
        "@type": "SoftwareApplication",
        "name": "Beraxis Point of Sale (POS)",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web, iOS, Android, Cloud",
        "description": "High-speed retail and restaurant touch POS with barcode scanning and table management."
      },
      {
        "@type": "SoftwareApplication",
        "name": "Beraxis Multi-Warehouse Inventory",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web, iOS, Android, Cloud",
        "description": "Real-time stock valuation, serial/lot tracking, automated reordering, and bin management."
      },
      {
        "@type": "SoftwareApplication",
        "name": "Beraxis Global B2B Leads Pool",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web, iOS, Android, Cloud",
        "description": "25,000,000+ verified corporate decision-maker contacts with AI intent scoring."
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appsSchema) }}
      />
      {children}
    </>
  );
}
