import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Beraxis · Enterprise Scoping & 24/7 Dedicated Support",
    description: "Get in touch with the Beraxis engineering and deployment team. 24/7 assistance, WhatsApp VIP support, and custom ERP scoping.",
    alternates: {
        canonical: "https://www.beraxis.online/contact",
    },
    openGraph: {
        title: "Contact Beraxis | Enterprise Scoping & Support",
        description: "Connect with the Beraxis team for enterprise migrations, custom workflows, and VIP support.",
        url: "https://www.beraxis.online/contact",
        images: ["https://www.beraxis.online/og-image.png"]
    }
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
