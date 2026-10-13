import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "25M+ Verified B2B Leads Pool & Live Prospect Mining",
    description: "Search, filter, and instantly ingest 25,000,000+ verified B2B decision-makers worldwide directly into your CRM. Zero third-party scraper plugins needed.",
    alternates: {
        canonical: "https://www.beraxis.online/leads-pool",
    },
    openGraph: {
        title: "25M+ Verified B2B Leads Pool | Beraxis",
        description: "Mine verified C-level, VP, and Director contacts across 70+ countries directly into your CRM.",
        url: "https://www.beraxis.online/leads-pool",
        images: ["https://www.beraxis.online/og-image.png"]
    }
};

export default function LeadsPoolLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
