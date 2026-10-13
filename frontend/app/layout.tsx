import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

import CosmicBackground from "@/components/CosmicBackground";
import GalaxyAppShell from "@/components/layout/GalaxyAppShell";

export const metadata: Metadata = {
    metadataBase: new URL("https://www.beraxis.online"),
    title: {
        default: "Beraxis | Autonomous AI ERP & CRM · 25M+ B2B Leads",
        template: "%s | Beraxis"
    },
    description: "Beraxis is the premier autonomous AI ERP & CRM command center. Unify CRM, 25.4M+ verified B2B leads directory, POS, multi-industry operations, accounting, inventory, and HRMS for just $1/month.",
    keywords: [
        "Beraxis",
        "Beraxis ERP",
        "Beraxis CRM",
        "Beraxis AI",
        "beraxis.online",
        "Autonomous ERP",
        "Next Gen ERP",
        "B2B Leads Pool",
        "25M verified B2B leads database",
        "AI ERP System",
        "Cloud ERP software",
        "Gym management software",
        "Fitness club ERP",
        "Padel club court booking software",
        "Automotive garage workshop ERP",
        "Restaurant POS and Kitchen Display System KDS",
        "Food and beverage recipe BOM ERP",
        "Real estate property lease management ERP",
        "Healthcare clinic patient EMR EHR software",
        "NGOs grant management software",
        "Construction contractor project costing ERP",
        "Retail omnichannel multi-store POS",
        "School academy student LMS billing software",
        "Accounting software",
        "Inventory management software",
        "HRMS Payroll system",
        "POS software",
        "Voice AI business assistant",
        "Enterprise Resource Planning"
    ],
    authors: [{ name: "Beraxis Team", url: "https://www.beraxis.online" }],
    creator: "Beraxis Platform",
    publisher: "Beraxis Systems",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    alternates: {
        canonical: "https://www.beraxis.online",
    },
    icons: {
        icon: [
            { url: "/favicon.ico", sizes: "any" },
            { url: "/icon-48.png", type: "image/png", sizes: "48x48" },
            { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
            { url: "/icon.png", type: "image/png", sizes: "512x512" },
        ],
        apple: [
            { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
        ],
        shortcut: "/favicon.ico",
    },
    manifest: "/site.webmanifest",
    openGraph: {
        title: "Beraxis | Autonomous AI ERP & CRM · 25M+ B2B Leads Pool",
        description: "The premier AI business operating system. Built-in 25.4M+ verified B2B leads directory, POS, multi-industry hubs, accounting & HRMS.",
        url: "https://www.beraxis.online",
        siteName: "Beraxis",
        images: [
            {
                url: "https://www.beraxis.online/og-image.png",
                width: 1200,
                height: 630,
                alt: "Beraxis - Autonomous AI ERP & CRM Platform",
            },
            {
                url: "https://www.beraxis.online/icon.png",
                width: 512,
                height: 512,
                alt: "Beraxis Logo",
            }
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Beraxis | Autonomous AI ERP & CRM · 25M+ B2B Leads Pool",
        description: "The AI-driven business command center. Built-in 25M+ verified B2B leads directory, POS, inventory, accounting & HRMS.",
        images: ["https://www.beraxis.online/og-image.png"],
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
                "@type": "Organization",
                "@id": "https://www.beraxis.online/#organization",
                "name": "Beraxis",
                "legalName": "Beraxis",
                "alternateName": ["Beraxis ERP", "Beraxis CRM", "Beraxis AI", "Beraxis AI ERP"],
                "url": "https://www.beraxis.online",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://www.beraxis.online/icon.png",
                    "width": "512",
                    "height": "512"
                },
                "image": "https://www.beraxis.online/og-image.png",
                "description": "Beraxis is an autonomous AI-driven enterprise ERP and CRM command center unifying business operations, CRM, 25.4M+ verified B2B Leads Pool, POS, multi-industry blueprints, inventory, and financial bookkeeping.",
                "sameAs": [
                    "https://www.beraxis.online",
                    "https://wa.me/19707807993",
                    "https://twitter.com/beraxis"
                ],
                "contactPoint": {
                    "@type": "ContactPoint",
                    "contactType": "customer support",
                    "url": "https://www.beraxis.online/contact",
                    "telephone": "+1-970-780-7993"
                }
            },
            {
                "@type": "WebSite",
                "@id": "https://www.beraxis.online/#website",
                "url": "https://www.beraxis.online",
                "name": "Beraxis",
                "alternateName": "Beraxis ERP",
                "publisher": {
                    "@id": "https://www.beraxis.online/#organization"
                },
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://www.beraxis.online/leads-pool?query={search_term_string}",
                    "query-input": "required name=search_term_string"
                }
            },
            {
                "@type": "SoftwareApplication",
                "@id": "https://www.beraxis.online/#software",
                "name": "Beraxis Autonomous AI ERP",
                "operatingSystem": "Web, Cloud, iOS, Android",
                "applicationCategory": "BusinessApplication",
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "4.9",
                    "reviewCount": "1280"
                },
                "offers": {
                    "@type": "AggregateOffer",
                    "lowPrice": "0",
                    "highPrice": "37.40",
                    "priceCurrency": "USD",
                    "offerCount": "3"
                },
                "description": "Beraxis is the premier AI-driven autonomous multi-industry ERP unifying CRM, 25.4M+ B2B Leads Pool, POS, Club Hub, Automotive, Real Estate, Inventory, Accounting, HRMS, and Voice Assistant automation.",
                "url": "https://www.beraxis.online"
            },
            {
                "@type": "SiteNavigationElement",
                "name": [
                    "Lead Pool",
                    "Pricing",
                    "Features",
                    "Blog",
                    "About",
                    "Contact",
                    "Sign Up"
                ],
                "url": [
                    "https://www.beraxis.online/leads-pool",
                    "https://www.beraxis.online/pricing",
                    "https://www.beraxis.online/#features",
                    "https://www.beraxis.online/blog",
                    "https://www.beraxis.online/about",
                    "https://www.beraxis.online/contact",
                    "https://www.beraxis.online/signup"
                ]
            }
        ]
    };

    return (
        <html lang="en">
            <head>
                {/* Explicit search engine icon links */}
                <link rel="icon" href="/favicon.ico" sizes="any" />
                <link rel="icon" type="image/png" sizes="48x48" href="/icon-48.png" />
                <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
                <link rel="icon" type="image/png" sizes="512x512" href="/icon.png" />
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <link rel="manifest" href="/site.webmanifest" />
                <meta name="theme-color" content="#020205" />

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
