import { Metadata } from "next";
import { notFound } from "next/navigation";
import { COMPARISONS } from "@/lib/comparisonData";
import CompareSlugClient from "./CompareSlugClient";

interface CompareSlugProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return Object.keys(COMPARISONS).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: CompareSlugProps): Promise<Metadata> {
  const resolvedParams = await params;
  const comp = COMPARISONS[resolvedParams.slug];

  if (!comp) {
    return {
      title: "Software Comparison | Beraxis AI",
      description: "Compare Beraxis AI against traditional ERP, CRM, and accounting software.",
    };
  }

  const title = `${comp.competitorName} Alternative & 2026 Comparison | Beraxis AI`;
  const description = `Looking for the best ${comp.competitorName} alternative? Compare ${comp.heroHeadline.toLowerCase()}. Save ${comp.annualSavings} with Beraxis AI. Double-entry accounting, POS, and 25M+ leads for $1/month.`;
  const url = `https://www.beraxis.online/compare/${comp.slug}`;

  return {
    title,
    description,
    keywords: [
      `${comp.competitorName} alternative`,
      `${comp.competitorName} vs Beraxis`,
      `replace ${comp.competitorName}`,
      "best cloud ERP alternative",
      "small business accounting and CRM",
      "all in one business platform",
      "25M leads engine",
      "Beraxis comparison"
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Beraxis AI",
      images: [
        {
          url: "https://www.beraxis.online/social_media_assets/ad4_carousel_comparison_square.png",
          width: 1080,
          height: 1080,
          alt: `${comp.competitorName} vs. Beraxis AI Comparison Matrix`,
        },
      ],
      locale: "en_US",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://www.beraxis.online/social_media_assets/ad4_carousel_comparison_square.png"],
    },
  };
}

export default async function CompareSlugPage({ params }: CompareSlugProps) {
  const resolvedParams = await params;
  const comp = COMPARISONS[resolvedParams.slug];

  if (!comp) {
    return notFound();
  }

  const otherComparisons = Object.values(COMPARISONS).filter(c => c.slug !== comp.slug);

  // Structured Data (JSON-LD) for Google Rich Snippets
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": comp.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Beraxis AI",
    "operatingSystem": "All (Cloud, Web, iOS, Android)",
    "applicationCategory": "BusinessApplication",
    "offers": {
      "@type": "Offer",
      "price": "1.00",
      "priceCurrency": "USD",
      "priceValidUntil": "2027-12-31"
    },
    "description": `Autonomous AI ERP, CRM, and POS platform replacing ${comp.competitorName} with double-entry accounting, 25M+ leads, and multi-warehouse operations for $1/month.`
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
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
        "name": "Comparisons",
        "item": "https://www.beraxis.online/compare"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": `${comp.competitorName} Alternative`,
        "item": `https://www.beraxis.online/compare/${comp.slug}`
      }
    ]
  };

  return (
    <>
      {/* Inject Structured Data for Google Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <CompareSlugClient comp={comp} otherComparisons={otherComparisons} />
    </>
  );
}
