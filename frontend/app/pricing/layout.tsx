import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Transparent ERP & CRM Pricing · Early Bird From $1/Month",
    description: "Deploy Beraxis Standard for $1/month ($12 billed annually) with 1,500 lead credits/month and all 28 modules included. Free forever tier available.",
    alternates: {
        canonical: "https://www.beraxis.online/pricing",
    },
    openGraph: {
        title: "Beraxis Pricing · Early Bird $1/Month",
        description: "All 28 enterprise modules, 1,500 verified lead credits/mo, and automated cloud backups.",
        url: "https://www.beraxis.online/pricing",
        images: ["https://www.beraxis.online/og-image.png"]
    }
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
