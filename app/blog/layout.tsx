import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Operational Intelligence, Architecture & Zudo Comparison Briefings",
    description: "Strategic insights, architectural teardowns, and actionable comparisons on why fast-growing companies are migrating to Beraxis.",
    alternates: {
        canonical: "https://www.beraxis.online/blog",
    },
    openGraph: {
        title: "Beraxis Blog & Operational Briefings",
        description: "Articles on autonomous ERP, global B2B lead discovery, and migrating from legacy monolithic software.",
        url: "https://www.beraxis.online/blog",
        images: ["https://www.beraxis.online/og-image.png"]
    }
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
