import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "About Beraxis · Next-Gen Autonomous AI Business Operating System",
    description: "Learn about Beraxis, the autonomous AI ERP and CRM platform built to eliminate subscription fragmentation, per-user pricing penalties, and legacy monolithic software.",
    alternates: {
        canonical: "https://www.beraxis.online/about",
    },
    openGraph: {
        title: "About Beraxis | Autonomous AI ERP & CRM",
        description: "The autonomous business operating system unifying CRM, leads pool, and multi-industry operations.",
        url: "https://www.beraxis.online/about",
        images: ["https://www.beraxis.online/og-image.png"]
    }
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
