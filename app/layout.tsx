import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

import CosmicBackground from "@/components/CosmicBackground";
import GalaxyAppShell from "@/components/layout/GalaxyAppShell";

export const metadata: Metadata = {
    metadataBase: new URL("https://erp-crm-puce.vercel.app"),
    title: {
        default: "Beraxis ERP - #1 Next-Gen AI ERP & Odoo Alternative for Business Automation",
        template: "%s | Beraxis AI ERP & Odoo Alternative"
    },
    description: "Beraxis is the premier AI-driven open-source Odoo alternative. Unify CRM, Sales, Inventory, Accounting, HRMS, Manufacturing, and POS with Voice Assistant technology. Migrate from Odoo to Beraxis today for 10x faster business growth.",
    keywords: [
        "Beraxis",
        "Beraxis ERP",
        "Beraxis CRM",
        "Odoo alternative",
        "best Odoo alternative",
        "Odoo vs Beraxis",
        "Odoo competitor",
        "Odoo pricing comparison",
        "migrate from Odoo",
        "Open Source ERP",
        "Cloud ERP software",
        "AI ERP System",
        "ERP CRM software",
        "Accounting software",
        "Inventory management software",
        "HRMS Payroll system",
        "POS software",
        "Voice AI business assistant",
        "Enterprise Resource Planning"
    ],
    authors: [{ name: "Beraxis Team", url: "https://erp-crm-puce.vercel.app" }],
    creator: "Beraxis Platform",
    publisher: "Beraxis Systems",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    alternates: {
        canonical: "https://erp-crm-puce.vercel.app",
    },
    openGraph: {
        title: "Beraxis ERP - #1 Next-Gen AI ERP & Odoo Alternative",
        description: "The ultimate AI-driven open-source ERP system unifying CRM, Sales, Inventory, Accounting, HRMS & Voice Automation. Better, faster, and more affordable than Odoo.",
        url: "https://erp-crm-puce.vercel.app",
        siteName: "Beraxis ERP",
        images: [
            {
                url: "https://erp-crm-puce.vercel.app/logo2.png",
                width: 1200,
                height: 630,
                alt: "Beraxis ERP - Next-Gen AI ERP & Odoo Alternative",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Beraxis ERP - #1 Next-Gen AI ERP & Odoo Alternative",
        description: "Unify CRM, Sales, Inventory, Accounting, HRMS, and Voice Pilot. The ultimate alternative to Odoo for modern enterprises.",
        images: ["https://erp-crm-puce.vercel.app/logo2.png"],
        creator: "@beraxis",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "SoftwareApplication",
                "name": "Beraxis ERP",
                "operatingSystem": "Web, Cloud, All",
                "applicationCategory": "BusinessApplication",
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "4.9",
                    "ratingCount": "1280"
                },
                "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD",
                    "description": "Free One App Forever or $199 Pro Unlimited Plan"
                },
                "description": "Beraxis is the premier AI-driven open-source Odoo alternative unifying CRM, Sales, Inventory, Accounting, HRMS, Manufacturing, and POS.",
                "url": "https://erp-crm-puce.vercel.app"
            },
            {
                "@type": "Organization",
                "name": "Beraxis",
                "url": "https://erp-crm-puce.vercel.app",
                "logo": "https://erp-crm-puce.vercel.app/logo2.png",
                "sameAs": [
                    "https://wa.me/19707807993"
                ]
            }
        ]
    };

    return (
        <html lang="en">
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            <body className={`${inter.className} relative min-h-screen text-white bg-transparent`}>
                <div className="aurora-bg" />
                <CosmicBackground />
                <GalaxyAppShell>{children}</GalaxyAppShell>
            </body>
        </html>
    );
}
