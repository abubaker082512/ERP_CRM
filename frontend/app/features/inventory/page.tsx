import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Package, Layers, Barcode, Warehouse, CheckCircle2, ArrowRight, RefreshCw, AlertTriangle, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Free Smart Cloud Inventory & Multi-Warehouse Software | Beraxis",
  description: "Track inventory across unlimited warehouses in real-time. Free inventory tier with automated reorder points, barcode tracking, and POS integration.",
  keywords: [
    "Free inventory management software",
    "Free cloud inventory",
    "Free warehouse management",
    "smart cloud inventory",
    "multi warehouse inventory management",
    "automated reorder points",
    "barcode lot tracking ERP",
    "FIFO inventory costing",
    "retail inventory software",
    "Beraxis inventory"
  ],
  alternates: {
    canonical: "https://www.beraxis.online/features/inventory",
  },
  openGraph: {
    title: "Smart Cloud Inventory & Multi-Warehouse Software | Beraxis",
    description: "Eliminate stockouts and manual inventory spreadsheets. Real-time multi-warehouse tracking, barcode scanning, and auto-purchase orders for $1/month.",
    url: "https://www.beraxis.online/features/inventory",
    siteName: "Beraxis",
    images: [
      {
        url: "https://www.beraxis.online/og-image.png",
        width: 1200,
        height: 630,
        alt: "Beraxis Smart Inventory Preview",
      },
    ],
  },
};

export default function InventoryFeaturePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Does Beraxis support multi-warehouse stock transfers?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. You can manage unlimited warehouse locations, transit locations, and retail backrooms with 1-click inter-warehouse stock transfer orders and automated audit trails."
        }
      },
      {
        "@type": "Question",
        "name": "How do automated reorder rules work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You set minimum and maximum inventory thresholds per SKU. When stock dips below minimum, Beraxis autonomously drafts purchase orders to your designated supplier, factoring in lead times and quantity discounts."
        }
      },
      {
        "@type": "Question",
        "name": "Can I track lot numbers, batch expiry dates, and serial codes?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Beraxis includes full support for serial number tracking (electronics, appliances) and batch/lot expiry tracking (pharmaceuticals, bakeries, food & beverage) with barcode label printing."
        }
      }
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
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
        "name": "Features",
        "item": "https://www.beraxis.online/features"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Smart Inventory",
        "item": "https://www.beraxis.online/features/inventory"
      }
    ]
  };

  return (
    <main className="min-h-screen bg-[#020205] text-white overflow-hidden font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Navbar />

      <div className="relative z-10 pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Breadcrumb nav */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/features" className="hover:text-white">Features</Link>
          <span>/</span>
          <span className="text-purple-400">Smart Inventory</span>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-300 uppercase tracking-wider mb-6">
            <Package size={14} className="text-emerald-400" /> Real-Time Stock Control
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
            Smart Cloud Inventory &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Multi-Warehouse</span> Control
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 font-light leading-relaxed mb-8 max-w-3xl mx-auto">
            Eliminate stockouts, dead capital, and warehouse confusion. Sync real-time inventory across retail stores, e-commerce channels, and regional warehouses with automated reorders and barcode tracking.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/pricing" className="galaxy-btn-primary !px-8 !py-4 text-base font-bold shadow-xl shadow-emerald-500/25 flex items-center gap-2">
              Claim Early Bird ($1/mo) <ArrowRight size={16} />
            </Link>
            <Link href="/signup" className="px-7 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold text-base transition-all">
              Deploy 1 App Free ($0)
            </Link>
          </div>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="galaxy-card p-8 bg-[#0F172A]/40 border-white/10 hover:border-emerald-500/40 transition-all rounded-3xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
              <Warehouse size={24} />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">Multi-Location &amp; Warehouse Sync</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Manage unlimited stock locations, retail storefronts, and third-party fulfillment centers. Track inventory movements in real-time as sales ring through POS.
            </p>
          </div>

          <div className="galaxy-card p-8 bg-[#0F172A]/40 border-white/10 hover:border-teal-500/40 transition-all rounded-3xl">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-6">
              <RefreshCw size={24} />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">Automated Reorder Triggers</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Never run out of high-demand items. Set automated reorder thresholds that generate draft supplier purchase orders before stock hits critical levels.
            </p>
          </div>

          <div className="galaxy-card p-8 bg-[#0F172A]/40 border-white/10 hover:border-cyan-500/40 transition-all rounded-3xl">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-6">
              <Barcode size={24} />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">Barcode Scanning &amp; Lot Tracking</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Scan standard EAN/UPC barcodes from smartphones or USB scanners. Track batches, expiration dates, and unique serial numbers effortlessly.
            </p>
          </div>
        </div>

        {/* Feature Highlights Table */}
        <div className="bg-[#0b0e17]/90 border border-white/10 rounded-3xl p-8 sm:p-12 mb-24">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-8 text-center">
            Complete Inventory &amp; Logistics Capabilities
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Real-Time POS & E-Commerce Sync",
              "FIFO, LIFO & Weighted Average Costing",
              "Supplier Lead Time Forecasting",
              "Lot Expiry & Quarantine Holds",
              "Internal Warehouse Stock Transfers",
              "Automated Landed Cost Allocation",
              "Discrepancy Stock Count Adjustments",
              "Direct Double-Entry Inventory Valuation",
              "Multi-Unit Conversions (Kg, Box, Pallet)"
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/5">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                <span className="text-sm text-gray-200 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqSchema.mainEntity.map((faq, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-[#0F172A]/60 border border-white/10">
                <h3 className="text-base font-bold text-white mb-2">{faq.name}</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{faq.acceptedAnswer.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="text-center p-12 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-purple-950/60 to-cyan-950/60 border border-emerald-500/30">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4">
            Take Control of Your Warehouses Today
          </h2>
          <p className="text-gray-300 text-sm max-w-xl mx-auto mb-6">
            Get unlimited warehouses, barcode tracking, and all 28 business modules for just $1/month.
          </p>
          <Link href="/pricing" className="galaxy-btn-primary !px-8 !py-3.5 text-sm font-bold inline-flex items-center gap-2">
            Claim Early Bird ($1/mo) <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
