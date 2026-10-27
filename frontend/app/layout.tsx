import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

import CosmicBackground from "@/components/CosmicBackground";
import CreemScript from "@/components/CreemScript";
import GalaxyAppShell from "@/components/layout/GalaxyAppShell";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
    metadataBase: new URL("https://www.beraxis.online"),
    title: {
        default: "Beraxis | AI ERP & CRM Software · Free Cloud ERP, CRM & POS System",
        template: "%s | Beraxis"
    },
    description: "The #1 AI ERP & CRM Software for growing businesses. Deploy Free ERP, Free CRM, Point of Sale (POS), Accounting, and Global B2B Leads Directory for $1/month across 12 custom industries.",
    keywords: [
        "ERP",
        "CRM",
        "ERP Software",
        "CRM Software",
        "Cloud ERP",
        "AI CRM",
        "Best ERP",
        "Best CRM",
        "Our Industries",
        "Industry ERP",
        "Small business ERP",
        "B2B CRM",
        "Free ERP",
        "Free CRM",
        "Free POS",
        "Free Point of Sale",
        "Free Accounting software",
        "Free Inventory management software",
        "Free HRMS Payroll system",
        "Free Invoicing software",
        "Free B2B Leads",
        "Free Lead generation software",
        "Free CRM for small business",
        "Free POS for retail and restaurants",
        "Best free ERP 2026",
        "Best free CRM for startups",
        "Best free POS system",
        "Odoo free alternative",
        "HubSpot free alternative",
        "QuickBooks free alternative",
        "Salesforce free alternative",
        "Zoho CRM free alternative",
        "Square POS free alternative",
        "Toast POS free alternative",
        "Open source ERP alternative",
        "Beraxis",
        "Beraxis ERP",
        "Beraxis CRM",
        "Beraxis AI",
        "beraxis.online",
        "Autonomous ERP",
        "Next Gen ERP",
        "B2B Leads Pool",
        "Verified B2B leads database",
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
        "Voice AI business assistant",
        "Enterprise Resource Planning",
        "1 dollar ERP",
        "one dollar ERP software",
        "free ERP with B2B leads pool",
        "free CRM with unlimited users",
        "free retail POS software",
        "Odoo alternative",
        "Odoo free alternative 2026",
        "HubSpot free alternative",
        "QuickBooks alternative with CRM",
        "Toast POS alternative",
        "Square POS alternative for small business",
        "Apollo alternative with built-in CRM",
        "padel club management software",
        "padel court booking and POS system",
        "automotive garage workshop ERP",
        "dental clinic patient management software",
        "bakery recipe costing POS system",
        "real estate lease management CRM",
        "subcontractor project costing ERP",
        "non-profit grant tracking CRM",
        "ERP with B2B leads directory",
        "Voice AI autonomous ERP copilot",
        "Affordable ERP software"
    ],
    other: {
        "revisit-after": "1 days",
        "rating": "General",
        "distribution": "Global",
    },
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
            { url: "/favicon.ico?v=3", sizes: "any" },
            { url: "/icon-48.png?v=3", type: "image/png", sizes: "48x48" },
            { url: "/icon-192.png?v=3", type: "image/png", sizes: "192x192" },
            { url: "/icon.png?v=3", type: "image/png", sizes: "512x512" },
        ],
        apple: [
            { url: "/apple-touch-icon.png?v=3", sizes: "180x180", type: "image/png" },
        ],
        shortcut: "/favicon.ico?v=3",
    },
    manifest: "/site.webmanifest",
    openGraph: {
        title: "Beraxis | AI ERP & CRM Software · Free Cloud ERP, CRM & POS System",
        description: "The #1 AI ERP & CRM Software for growing businesses. Deploy Free ERP, Free CRM, Point of Sale (POS), Accounting, and Global B2B Leads Directory for $1/month across 12 custom industries.",
        url: "https://www.beraxis.online",
        siteName: "Beraxis",
        images: [
            {
                url: "https://www.beraxis.online/og-image.png?v=3",
                width: 1200,
                height: 630,
                alt: "Beraxis - Free ERP, Free CRM & Free POS Autonomous AI Platform",
            },
            {
                url: "https://www.beraxis.online/icon.png?v=3",
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
        title: "Beraxis | AI ERP & CRM Software · Free Cloud ERP, CRM & POS System",
        description: "The #1 AI ERP & CRM Software for growing businesses. Deploy Free ERP, Free CRM, Point of Sale (POS), Accounting, and Global B2B Leads Directory for $1/month across 12 custom industries.",
        images: ["https://www.beraxis.online/og-image.png?v=3"],
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
    verification: {
        google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "googlee82f70b2be8b7b20",
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
                "legalName": "Beraxis Systems Inc.",
                "alternateName": ["Beraxis ERP", "Beraxis CRM", "Beraxis AI", "Beraxis AI ERP"],
                "url": "https://www.beraxis.online",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://www.beraxis.online/icon.png?v=3",
                    "width": "512",
                    "height": "512"
                },
                "image": "https://www.beraxis.online/og-image.png?v=3",
                "description": "Beraxis Systems Inc. is an autonomous AI-driven enterprise ERP and CRM command center unifying business operations, CRM, verified B2B Leads Directory, POS, multi-industry blueprints, inventory, and financial bookkeeping.",
                "sameAs": [
                    "https://www.beraxis.online",
                    "https://wa.me/19707807993",
                    "https://twitter.com/beraxis"
                ],
                "contactPoint": {
                    "@type": "ContactPoint",
                    "contactType": "customer support",
                    "url": "https://www.beraxis.online/contact",
                    "telephone": "+1-970-780-7993",
                    "email": "support@beraxis.online"
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
                "name": "Beraxis",
                "operatingSystem": "Cloud, Web, iOS, Android",
                "applicationCategory": "BusinessApplication",
                "offers": [
                    {
                        "@type": "Offer",
                        "price": "0.00",
                        "priceCurrency": "USD",
                        "availability": "https://schema.org/InStock",
                        "description": "Forever Free Tier: 1 full business app (Free CRM, Free POS, or Free Inventory) with unlimited user seats and zero credit card required."
                    },
                    {
                        "@type": "Offer",
                        "price": "1.00",
                        "priceCurrency": "USD",
                        "priceValidUntil": "2027-12-31",
                        "availability": "https://schema.org/InStock",
                        "description": "Early Bird Plan: $1/seat/month billed annually ($12/year) or $5/seat/month month-to-month. All 28 enterprise modules included with 1,500 lead credits/month."
                    }
                ],
                "featureList": [
                    "Autonomous AI Voice Pilot Cockpit",
                    "Global B2B Leads Directory",
                    "Double-Entry General Ledger & Accounting",
                    "Visual Kanban CRM & Sales Pipeline",
                    "Omnichannel Touch Point of Sale (POS)",
                    "Multi-Warehouse Inventory & Barcode Tracking",
                    "HRMS, Attendance & Payroll Management",
                    "12 Industry Operational Blueprints"
                ],
                "description": "Beraxis is an autonomous AI ERP & CRM platform featuring Free CRM, Free POS, and Free ERP modules, Global B2B Leads Directory, accounting, inventory, and Voice Pilot for $1/month.",
                "url": "https://www.beraxis.online"
            },
            {
                "@type": "FAQPage",
                "@id": "https://www.beraxis.online/#faq",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "What is the best free ERP and CRM in 2026?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Beraxis is rated one of the best free ERP and CRM platforms in 2026, offering a Forever Free tier that unifies CRM pipelines, double-entry accounting, point of sale (POS), and inventory management with an AI Voice Pilot and verified B2B leads directory."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "How does Beraxis compare to Odoo and HubSpot?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Unlike Odoo (which charges high fees per module) and HubSpot (which imposes steep pricing tiers based on contact counts), Beraxis includes all 28 modules, unlimited user seats, and 1,500 monthly lead generation credits for just $1.00/month."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Is there really an ERP for $1 per month?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Yes! Beraxis provides an Early Bird Standard Plan for $1.00 per month ($12 billed annually) that unlocks all 28 business applications—including accounting, payroll, CRM, multi-warehouse inventory, touch POS, and 1,500 lead credits per month."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Does Beraxis offer software for padel clubs and sports venues?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Yes! Beraxis includes a specialized padel and fitness archetype featuring automated court booking, member subscriptions, racket rental inventory, and front-desk touch POS."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Does Beraxis offer a Free CRM, Free POS, and Free ERP?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Yes! Beraxis offers a Forever Free tier that lets businesses deploy a complete core application—such as Free CRM, Free POS, or Free Inventory management—with unlimited user seats and zero credit card required. You can upgrade anytime to unlock all 28 enterprise modules and 1,500 lead credits/month for just $1.00/month."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "What is Beraxis?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Beraxis is an autonomous AI-powered ERP and CRM platform that unifies 28 business modules—including double-entry accounting, point of sale (POS), inventory management, HRMS payroll, an AI Voice Pilot, and a built-in global B2B leads directory—into a single glassmorphic command deck."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "How much does Beraxis cost?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Beraxis offers a Forever Free tier (1 full module free with unlimited seats). The Early Bird Standard Plan unlocks all 28 enterprise modules and 1,500 lead credits/month for just $1.00/month ($12 billed annually) or $5.00/month on month-to-month billing."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "What is the Beraxis B2B Leads Directory?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "The Leads Directory is an integrated global B2B contact search tool containing verified corporate decision-makers, direct dials, and verified emails across global markets. Users can search and 1-click import leads directly into their Beraxis CRM pipeline with zero extra third-party software subscriptions."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "How does the AI Voice Pilot work?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "The AI Voice Pilot allows business owners and staff to control their ERP using natural voice commands. You can issue instructions such as 'Create a $500 invoice for Acme Corp' or 'Check inventory for SKU-402', and the autonomous engine executes the workflow in real-time."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Which industries does Beraxis support?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Beraxis comes pre-engineered with dedicated operational blueprints for 12 global industries, including padel and sports clubs, dental and healthcare clinics, artisan bakeries and restaurants, supermarkets and retail, auto repair workshops, real estate brokerages, construction contractors, schools, and discrete manufacturing."
                        }
                    }
                ]
            },
            {
                "@type": "SiteNavigationElement",
                "name": [
                    "Lead Pool",
                    "Pricing",
                    "Compare",
                    "Features",
                    "Industries",
                    "Blog",
                    "About",
                    "Contact",
                    "Sign Up"
                ],
                "url": [
                    "https://www.beraxis.online/leads-pool",
                    "https://www.beraxis.online/pricing",
                    "https://www.beraxis.online/compare",
                    "https://www.beraxis.online/features",
                    "https://www.beraxis.online/industries",
                    "https://www.beraxis.online/blog",
                    "https://www.beraxis.online/about",
                    "https://www.beraxis.online/contact",
                    "https://www.beraxis.online/signup"
                ]
            },
            {
                "@type": "BreadcrumbList",
                "@id": "https://www.beraxis.online/#breadcrumbs",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Home",
                        "item": "https://www.beraxis.online"
                    },
                    {
                        "@type": "ListItem",
                        "position": 2,
                        "name": "Pricing ($1/mo)",
                        "item": "https://www.beraxis.online/pricing"
                    },
                    {
                        "@type": "ListItem",
                        "position": 3,
                        "name": "B2B Leads Directory",
                        "item": "https://www.beraxis.online/leads-pool"
                    },
                    {
                        "@type": "ListItem",
                        "position": 4,
                        "name": "12 Industry Solutions",
                        "item": "https://www.beraxis.online/industries"
                    },
                    {
                        "@type": "ListItem",
                        "position": 5,
                        "name": "Software Comparisons",
                        "item": "https://www.beraxis.online/compare"
                    }
                ]
            }
        ]
    };

    return (
        <html lang="en" className="bg-[#020205] text-white">
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
            <body className={`${inter.className} relative min-h-screen text-white bg-[#020205]`}>
                <div className="aurora-bg" />
                <CosmicBackground />
                <CreemScript />
                <GalaxyAppShell>{children}</GalaxyAppShell>
                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    );
}
