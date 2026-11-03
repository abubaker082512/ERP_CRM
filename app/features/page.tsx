import { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import FeaturesContent from "./FeaturesContent";
import { ALL_ENTERPRISE_MODULES } from "@/lib/featuresData";

export const metadata: Metadata = {
  title: "34+ Unified Enterprise Modules & Platform Architecture | Beraxis AI ERP & CRM",
  description: "Explore all 34+ Beraxis enterprise modules: AI CRM, Double-Entry Accounting, Omnichannel POS, KDS, Smart Inventory, Payroll, e-Sign, B2B Leads Directory, and Streaming Voice Pilot for $1/month.",
  keywords: [
    "Free ERP",
    "Free CRM",
    "Free POS",
    "Free inventory management",
    "Free CRM software",
    "Beraxis features",
    "cloud ERP modules",
    "AI CRM software",
    "smart inventory system",
    "AI voice ERP",
    "Verified leads database",
    "Double-entry accounting software",
    "Omnichannel POS system",
    "Kitchen display system KDS",
    "HR and payroll software",
    "Digital e-signature tool",
    "QuickBooks alternative",
    "Odoo alternative",
    "HubSpot alternative",
    "Salesforce alternative",
    "business automation tools",
    "multi-branch ERP"
  ],
  alternates: {
    canonical: "https://www.beraxis.online/features",
  },
  openGraph: {
    title: "34+ Unified Enterprise Modules | Beraxis AI ERP & CRM",
    description: "Replace 8+ fragmented subscriptions with one cohesive glassmorphic command deck. Accounting, POS, Inventory, HR, CRM, e-Sign & Leads Pool for $1/month.",
    url: "https://www.beraxis.online/features",
    siteName: "Beraxis",
    images: [
      {
        url: "/images/showcase/apps-screen.png",
        width: 1200,
        height: 630,
        alt: "Beraxis 34 Unified Business Modules Cockpit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "34+ Unified Enterprise Modules | Beraxis AI ERP & CRM",
    description: "Every business tool in one place. Accounting, POS, Inventory, HR, CRM, e-Sign & 1,500 Lead Credits/mo for $1/month.",
    images: ["/images/showcase/apps-screen.png"],
  },
};

export default function FeaturesHubPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Beraxis Autonomous AI ERP & CRM Platform",
    "operatingSystem": "Web, iOS, Android, macOS, Windows",
    "applicationCategory": "BusinessApplication, ERPApplication, CRMApplication",
    "description": "Unified business management suite with 34+ modules: Double-Entry Accounting, POS & KDS, Inventory, HR & Payroll, AI CRM, e-Sign, and verified B2B Leads Directory.",
    "url": "https://www.beraxis.online/features",
    "offers": {
      "@type": "Offer",
      "price": "1.00",
      "priceCurrency": "USD",
      "priceValidUntil": "2027-12-31",
      "availability": "https://schema.org/InStock"
    },
    "featureList": ALL_ENTERPRISE_MODULES.map((m) => m.title).join(", "),
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "1280"
    }
  };

  return (
    <main className="min-h-screen bg-[#020205] text-white overflow-hidden font-sans">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <FeaturesContent />
      <Footer />
    </main>
  );
}
