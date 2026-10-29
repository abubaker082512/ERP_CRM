import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Beraxis · Next-Gen Autonomous AI Business Operating System",
  description: "Learn about Beraxis, the autonomous AI ERP and CRM platform built to eliminate subscription fragmentation, per-user pricing penalties, and legacy monolithic software.",
  keywords: [
    "About Beraxis",
    "Beraxis story",
    "Autonomous AI ERP",
    "Next generation CRM",
    "Business operating system",
    "Muhammad Abu Baker Bin Tariq",
    "Sheikh Abu Baker",
    "Beraxis Systems Inc",
    "Cloud ERP founders",
    "AI business automation"
  ],
  alternates: {
    canonical: "https://www.beraxis.online/about",
  },
  openGraph: {
    title: "About Beraxis | Autonomous AI ERP & CRM",
    description: "The autonomous business operating system unifying CRM, double-entry accounting, POS, leads pool, and multi-industry operations.",
    url: "https://www.beraxis.online/about",
    siteName: "Beraxis",
    images: ["https://www.beraxis.online/og-image.png?v=3"],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Beraxis | Autonomous AI ERP & CRM",
    description: "Unifying CRM, accounting, POS, leads pool, and multi-industry operations into a single modern cockpit.",
    images: ["https://www.beraxis.online/og-image.png?v=3"],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About Beraxis",
    "description": "Learn about Beraxis, the autonomous AI business operating system created by Muhammad Abu Baker Bin Tariq to replace bloated enterprise software.",
    "url": "https://www.beraxis.online/about",
    "mainEntity": {
      "@type": "Organization",
      "name": "Beraxis Systems Inc.",
      "founder": {
        "@type": "Person",
        "name": "Muhammad Abu Baker Bin Tariq",
        "alternateName": "Sheikh Abu Baker"
      },
      "url": "https://www.beraxis.online",
      "logo": "https://www.beraxis.online/icon.png?v=3",
      "sameAs": [
        "https://www.beraxis.online",
        "https://twitter.com/beraxis",
        "https://wa.me/19707807993"
      ]
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      {children}
    </>
  );
}
