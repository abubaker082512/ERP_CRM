import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Free ERP, Free CRM & $1/Mo Early Bird Pricing · Beraxis",
    description: "Start free with our Forever Free Tier (Free CRM, Free POS, or Free ERP). Unlock all 28 modules and 1,500 lead credits/month for just $1/month ($12 billed annually) or $5/month.",
    keywords: [
        "Free ERP",
        "Free CRM",
        "Free POS",
        "Free Tier Business Software",
        "Free accounting software",
        "Free inventory management",
        "1 dollar ERP",
        "Affordable cloud ERP",
        "Cheapest CRM for small business",
        "Beraxis pricing",
        "Odoo pricing alternative"
    ],
    alternates: {
        canonical: "https://www.beraxis.online/pricing",
    },
    openGraph: {
        title: "Free ERP & CRM Pricing · Forever Free or $1/Month Early Bird",
        description: "Forever Free Tier for Free CRM & POS. Or unlock all 28 enterprise modules and 1,500 verified lead credits/mo for $1/month.",
        url: "https://www.beraxis.online/pricing",
        images: ["https://www.beraxis.online/og-image.png?v=3"]
    }
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
