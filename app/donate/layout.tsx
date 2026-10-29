import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Donate to BERAXIS Environmental & Community Fund · Green Cloud & Tech Philanthropy",
  description: "Support carbon-neutral green cloud computing, 100% paperless business digitalization, native tree planting, and free enterprise ERP/CRM software licenses for underprivileged students and entrepreneurs worldwide.",
  keywords: [
    "Donate to green tech",
    "Environmental Protection Fund",
    "Carbon neutral cloud ERP",
    "Paperless business donation",
    "Tree planting tech sponsor",
    "Support fair business software",
    "Donate to Beraxis fund",
    "Tech philanthropy",
    "Green cloud computing",
    "Eco-cloud guardian",
    "Student software scholarship fund",
    "Open sustainability tech fund",
    "Support small business digitalization",
    "Carbon offset business software",
    "Nonprofit ERP sponsor",
    "Beraxis environmental fund"
  ],
  alternates: {
    canonical: "https://www.beraxis.online/donate",
  },
  openGraph: {
    title: "Donate to BERAXIS Environmental & Community Fund",
    description: "Every dollar accelerates carbon-neutral cloud computing, 100% paperless business operations, tree planting, and sponsored ERP licenses for students and founders.",
    url: "https://www.beraxis.online/donate",
    siteName: "Beraxis",
    images: [
      {
        url: "https://www.beraxis.online/og-image.png?v=3",
        width: 1200,
        height: 630,
        alt: "BERAXIS Environmental Protection & Community Fund",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Donate to BERAXIS Environmental & Community Fund",
    description: "Support green cloud compute, native tree planting, and free enterprise software for students and emerging startups.",
    images: ["https://www.beraxis.online/og-image.png?v=3"],
  },
};

export default function DonateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const donateSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "DonateAction",
        "name": "Donate to BERAXIS Environmental Protection & Community Fund",
        "description": "Donations directly accelerate carbon-neutral cloud hosting, paperless enterprise digitalization, native tree planting, and free enterprise software licenses for students and rural entrepreneurs.",
        "recipient": {
          "@type": "Organization",
          "name": "BERAXIS Environmental Protection & Community Fund",
          "url": "https://www.beraxis.online/donate"
        },
        "target": "https://www.beraxis.online/donate"
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://www.beraxis.online"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Donate",
            "item": "https://www.beraxis.online/donate"
          }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How are donations to the BERAXIS Fund used?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "100% of contributions fund four key pillars: offsetting server compute emissions with renewable green power, planting native trees through verified reforestation partners, transitioning small businesses from paper invoices to digital ERP ledgers, and sponsoring free software licenses and AI credits for university students and underfunded entrepreneurs."
            }
          },
          {
            "@type": "Question",
            "name": "Is my donation secure?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. All donations are processed through our PCI-DSS Level 1 compliant payment infrastructure with 256-bit SSL encryption. We accept major credit cards, Apple Pay, Google Pay, and bank transfers with zero hidden processing fees."
            }
          },
          {
            "@type": "Question",
            "name": "Can I receive proof or recognition for my contribution?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! Donors contributing $25 or more receive a digital verified impact certificate, and founding sponsors ($250+) receive permanent honorary recognition on our Open Sustainability Wall."
            }
          }
        ]
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(donateSchema) }}
      />
      {children}
    </>
  );
}
