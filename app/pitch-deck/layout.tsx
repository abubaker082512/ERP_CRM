import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "International Investor Pitch Deck (100+ Users Milestone) | BERAXIS AI",
  description: "Confidential International Investor Presentation for BERAXIS AI — The Autonomous AI ERP & CRM Operating System. 100+ Active Users Milestone, 28 Enterprise Modules, 12 Industry Archetypes, 25M+ B2B Leads, and 26.6x LTV:CAC.",
  alternates: {
    canonical: "https://www.beraxis.online/pitch-deck",
  },
  openGraph: {
    title: "BERAXIS AI — International Investor Pitch Deck (2026) | 100+ Users Milestone",
    description: "Scaling the Autonomous AI ERP & CRM Operating System from 100+ early-adopter workspaces to $62M ARR. 28 unified apps, 25M+ B2B leads, 84% gross margin.",
    url: "https://www.beraxis.online/pitch-deck",
    siteName: "BERAXIS AI",
    images: [
      {
        url: "https://www.beraxis.online/og-image.png?v=3",
        width: 1200,
        height: 630,
        alt: "BERAXIS AI International Investor Pitch Deck",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BERAXIS AI — International Investor Pitch Deck (2026) | 100+ Users Milestone",
    description: "100+ Active Users Milestone ($0 CAC), 28 Enterprise Modules, 25M+ B2B Leads, 26.6x LTV:CAC.",
    images: ["https://www.beraxis.online/og-image.png?v=3"],
  },
};

export default function PitchDeckLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
