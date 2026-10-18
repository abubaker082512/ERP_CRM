import { Metadata } from "next";
import { notFound } from "next/navigation";
import { INDUSTRIES_MAP, IndustryData } from "@/lib/industryData";
import IndustrySlugClient from "./IndustrySlugClient";

interface IndustrySlugProps {
  params: Promise<{
    slug: string;
  }>;
}

// Aliases mapping for common user searches & alternative naming
const SLUG_ALIASES: Record<string, string> = {
  "fitness-sports-clubs": "padel-clubs",
  "gym-fitness": "padel-clubs",
  "sports-clubs": "padel-clubs",
  "padel": "padel-clubs",
  "healthcare-wellness": "dental-clinics",
  "dental": "dental-clinics",
  "clinics": "dental-clinics",
  "food-beverage": "bakeries-restaurants",
  "bakeries": "bakeries-restaurants",
  "restaurants": "bakeries-restaurants",
  "automotive-workshop": "automotive-garages",
  "auto-repair": "automotive-garages",
  "garage": "automotive-garages",
  "retail-supermarket": "retail-supermarkets",
  "supermarkets": "retail-supermarkets",
  "retail": "retail-supermarkets",
  "construction": "construction-contracting",
  "contracting": "construction-contracting",
  "education": "education-academies",
  "schools": "education-academies",
  "academies": "education-academies",
  "ngos": "ngos-non-profits",
  "charity": "ngos-non-profits",
  "non-profits": "ngos-non-profits",
  "consulting": "professional-services",
  "agencies": "professional-services",
  "wholesale": "logistics-wholesale",
  "logistics": "logistics-wholesale",
};

function resolveIndustry(slug: string): IndustryData | undefined {
  if (INDUSTRIES_MAP[slug]) {
    return INDUSTRIES_MAP[slug];
  }
  const canonicalSlug = SLUG_ALIASES[slug];
  if (canonicalSlug && INDUSTRIES_MAP[canonicalSlug]) {
    return INDUSTRIES_MAP[canonicalSlug];
  }
  return undefined;
}

export async function generateStaticParams() {
  const primarySlugs = Object.keys(INDUSTRIES_MAP);
  const aliasSlugs = Object.keys(SLUG_ALIASES);
  const allSlugs = Array.from(new Set([...primarySlugs, ...aliasSlugs]));
  return allSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: IndustrySlugProps): Promise<Metadata> {
  const resolvedParams = await params;
  const industry = resolveIndustry(resolvedParams.slug);

  if (!industry) {
    return {
      title: "Industry Solutions | Beraxis AI",
      description: "Pre-engineered ERP & CRM blueprints for global commercial industries.",
    };
  }

  const canonicalUrl = `https://www.beraxis.online/industries/${industry.slug}`;

  return {
    title: industry.metaTitle,
    description: industry.metaDescription,
    keywords: industry.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: industry.metaTitle,
      description: industry.metaDescription,
      url: canonicalUrl,
      siteName: "Beraxis AI",
      images: [
        {
          url: "https://www.beraxis.online/og-image.png",
          width: 1200,
          height: 630,
          alt: `${industry.name} ERP Blueprint`,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: industry.metaTitle,
      description: industry.metaDescription,
      images: ["https://www.beraxis.online/og-image.png"],
    },
  };
}

export default async function IndustrySlugPage({ params }: IndustrySlugProps) {
  const resolvedParams = await params;
  const industry = resolveIndustry(resolvedParams.slug);

  if (!industry) {
    return notFound();
  }

  const otherIndustries = Object.values(INDUSTRIES_MAP).filter(
    (i) => i.slug !== industry.slug
  );

  // Structured Data (JSON-LD) for Google Rich Snippets
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": industry.faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a,
      },
    })),
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `${industry.name} ERP & Management Software`,
    "serviceType": "Cloud ERP & CRM Software",
    "provider": {
      "@type": "Organization",
      "name": "Beraxis Systems Inc.",
      "url": "https://www.beraxis.online",
    },
    "offers": {
      "@type": "Offer",
      "price": "1.00",
      "priceCurrency": "USD",
      "priceValidUntil": "2027-12-31",
      "availability": "https://schema.org/InStock",
    },
    "description": industry.metaDescription,
    "url": `https://www.beraxis.online/industries/${industry.slug}`,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.beraxis.online",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Industries",
        "item": "https://www.beraxis.online/industries",
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": industry.name,
        "item": `https://www.beraxis.online/industries/${industry.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <IndustrySlugClient industry={industry} otherIndustries={otherIndustries} />
    </>
  );
}
