import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Beraxis · Enterprise Scoping & 24/7 Dedicated Support",
  description: "Get in touch with the Beraxis engineering and deployment team. 24/7 technical hotline, WhatsApp VIP support desk, and custom enterprise ERP scoping.",
  keywords: [
    "Contact Beraxis",
    "Beraxis customer support",
    "ERP customer helpline",
    "WhatsApp business software support",
    "Enterprise ERP scoping",
    "Migrate to Beraxis support",
    "Beraxis phone number",
    "Beraxis email",
    "24/7 technical assistance"
  ],
  alternates: {
    canonical: "https://www.beraxis.online/contact",
  },
  openGraph: {
    title: "Contact Beraxis | Enterprise Scoping & 24/7 Support",
    description: "Connect with the Beraxis team for enterprise migrations, custom workflows, and 24/7 VIP support.",
    url: "https://www.beraxis.online/contact",
    siteName: "Beraxis",
    images: ["https://www.beraxis.online/og-image.png?v=3"],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Beraxis | Enterprise Scoping & 24/7 Support",
    description: "Connect with the Beraxis team for enterprise migrations, custom workflows, and 24/7 VIP support.",
    images: ["https://www.beraxis.online/og-image.png?v=3"],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact Beraxis Support & Sales",
    "description": "Reach Beraxis for technical support, onboarding assistance, or enterprise software scoping.",
    "url": "https://www.beraxis.online/contact",
    "mainEntity": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "telephone": "+1-970-780-7993",
      "email": "support@beraxis.online",
      "availableLanguage": ["English", "Arabic", "Urdu"],
      "contactOption": "TollFree",
      "hoursAvailable": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "00:00",
        "closes": "23:59"
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />
      {children}
    </>
  );
}
