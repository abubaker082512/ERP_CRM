import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

import CosmicBackground from "@/components/CosmicBackground";
import GalaxyAppShell from "@/components/layout/GalaxyAppShell";

export const metadata: Metadata = {
    metadataBase: new URL("https://erp-crm-puce.vercel.app"),
    title: {
        default: "Beraxis ERP - Autonomous AI ERP & Next-Gen Business Operating System",
        template: "%s | Beraxis Autonomous AI ERP"
    },
    description: "Beraxis is the premier AI-driven autonomous enterprise ERP & CRM command center. Unify CRM, 25.4M+ B2B Leads Pool, Point of Sale, Multi-Industry Operations, Smart Inventory, Accounting, HRMS, and Voice Pilot automation.",
    keywords: [
        "Beraxis",
        "Beraxis ERP",
        "Beraxis CRM",
        "Autonomous ERP",
        "Next Gen ERP",
        "B2B Leads Pool",
        "25M verified B2B leads database",
        "AI ERP System",
        "Cloud ERP software",
        "Gym management software",
        "Fitness club ERP",
        "Padel club court booking software",
        "Sports club membership software",
        "Automotive garage workshop ERP",
        "Car repair job card software",
        "Restaurant POS and Kitchen Display System KDS",
        "Food and beverage recipe BOM ERP",
        "Real estate property lease management ERP",
        "Healthcare clinic patient EMR EHR software",
        "Construction contractor project costing ERP",
        "Retail omnichannel multi-store POS",
        "School academy student LMS billing software",
        "Hotel resort PMS front desk ERP",
        "Professional services billable hours agency ERP",
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
        title: "Beraxis ERP - Autonomous AI ERP & Business Operating System",
        description: "The ultimate AI-driven business operating system unifying CRM, Sales, Inventory, Accounting, HRMS & Voice Automation. Sub-50ms speed with built-in 25M+ Leads Pool.",
        url: "https://erp-crm-puce.vercel.app",
        siteName: "Beraxis ERP",
        images: [
            {
                url: "https://erp-crm-puce.vercel.app/logo2.png",
                width: 1200,
                height: 630,
                alt: "Beraxis ERP - Autonomous AI ERP & Business Command Center",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Beraxis ERP - Autonomous AI ERP & CRM",
        description: "Unify CRM, Sales, Inventory, Accounting, HRMS, and Voice Pilot. Built-in 25M+ B2B Leads Pool for modern high-growth enterprises.",
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
                    "description": "Free One App Forever or Early Bird Pro Plan"
                },
                "description": "Beraxis is the premier AI-driven autonomous multi-industry ERP unifying CRM, 25.4M+ B2B Leads Pool, POS, Gym & Club Hub, Automotive, Real Estate, Inventory, Accounting, HRMS, and Voice Assistant automation.",
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
