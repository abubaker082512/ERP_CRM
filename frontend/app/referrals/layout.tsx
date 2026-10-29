import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer Referral Program · Give $5, Get Free Lead Credits · Beraxis",
  description: "Invite fellow entrepreneurs and businesses to Beraxis. Your referrals receive instant subscription discounts, and you earn free B2B lead generation credits and software upgrades.",
  keywords: [
    "Software referral program",
    "ERP referral rewards",
    "Free CRM lead credits",
    "Business software invite program",
    "Beraxis customer referral",
    "Earn free SaaS credits"
  ],
  alternates: {
    canonical: "https://www.beraxis.online/referrals",
  },
  openGraph: {
    title: "Customer Referral Program · Beraxis",
    description: "Invite fellow founders and teams to Beraxis. Give $5, get free B2B lead credits and subscription rewards.",
    url: "https://www.beraxis.online/referrals",
    siteName: "Beraxis",
    images: [
      {
        url: "https://www.beraxis.online/og-image.png?v=3",
        width: 1200,
        height: 630,
        alt: "Beraxis Customer Referral Program",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Customer Referral Program · Beraxis",
    description: "Invite fellow founders and teams to Beraxis. Give $5, get free B2B lead credits and subscription rewards.",
    images: ["https://www.beraxis.online/og-image.png?v=3"],
  },
};

export default function ReferralsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const referralsSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Beraxis Customer Referral Program",
    "description": "Invite business colleagues to Beraxis and unlock free B2B leads and subscription credits.",
    "url": "https://www.beraxis.online/referrals"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(referralsSchema) }}
      />
      {children}
    </>
  );
}
