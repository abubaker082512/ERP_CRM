import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "25M+ Verified B2B Leads Pool & Free Prospect Mining · Beraxis",
    description: "Search, filter, and instantly ingest 25,000,000+ verified B2B decision-makers worldwide directly into your CRM. Free lead preview and 1,500 monthly export credits included.",
    keywords: [
        "Free B2B leads",
        "Free lead generation software",
        "Free CRM with leads",
        "B2B prospect database",
        "Apollo alternative",
        "ZoomInfo alternative",
        "Cold email lead directory",
        "Verified CEO emails",
        "1-click CRM lead import"
    ],
    alternates: {
        canonical: "https://www.beraxis.online/leads-pool",
    },
    openGraph: {
        title: "25M+ Verified B2B Leads Pool | Beraxis",
        description: "Mine verified C-level, VP, and Director contacts across 70+ countries directly into your CRM.",
        url: "https://www.beraxis.online/leads-pool",
        images: ["https://www.beraxis.online/og-image.png?v=3"]
    }
};

export default function LeadsPoolLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
