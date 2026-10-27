import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Mic, Cpu, Zap, CheckCircle2, ArrowRight, Sparkles, Volume2, Globe, Radio } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Voice Pilot & Natural Speech ERP Assistant | Beraxis",
  description: "Command your entire enterprise by voice. Issue natural spoken commands to create invoices, query warehouse inventory, and import B2B leads hands-free. $1/month.",
  keywords: [
    "AI voice pilot",
    "voice ERP assistant",
    "voice business operations",
    "hands free ERP software",
    "voice accounting assistant",
    "speech to invoice AI",
    "Beraxis voice pilot"
  ],
  alternates: {
    canonical: "https://www.beraxis.online/features/voice-pilot",
  },
  openGraph: {
    title: "AI Voice Pilot & Natural Speech ERP Assistant | Beraxis",
    description: "Issue spoken commands like 'Invoice Client X $1,200' or 'Check warehouse stock for SKU-402' and watch Beraxis execute in under 45ms. $1/month.",
    url: "https://www.beraxis.online/features/voice-pilot",
    siteName: "Beraxis",
    images: [
      {
        url: "https://www.beraxis.online/og-image.png",
        width: 1200,
        height: 630,
        alt: "Beraxis AI Voice Pilot Preview",
      },
    ],
  },
};

export default function VoicePilotFeaturePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How does the Beraxis AI Voice Pilot execute ERP actions?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The Voice Pilot uses deep neural speech recognition and an autonomous intent-parser. When you speak, it converts your voice into structured API instructions (such as creating invoices, updating CRM deals, or querying stock levels) and executes them in under 45 milliseconds."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need special hardware to use the Voice Pilot?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. The Voice Pilot operates natively inside any modern browser or mobile smartphone with standard microphone access. No specialized hardware or third-party plugins required."
        }
      },
      {
        "@type": "Question",
        "name": "Is spoken audio encrypted and kept private?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Audio streams are encrypted via TLS 1.3 in real-time, processed ephemerally, and never stored or used to train external commercial AI models."
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
        "name": "Voice Pilot",
        "item": "https://www.beraxis.online/features/voice-pilot"
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
          <span className="text-purple-400">AI Voice Pilot</span>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-bold text-purple-300 uppercase tracking-wider mb-6">
            <Mic size={14} className="text-purple-400 animate-pulse" /> Hands-Free Enterprise Control
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
            AI Voice Pilot: <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">Command Your Business</span> Hands-Free
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 font-light leading-relaxed mb-8 max-w-3xl mx-auto">
            Say goodbye to clicking through 15 nested menus. Simply speak your operational intent: draft invoices, log CRM meeting notes, verify warehouse stock, and trigger lead searches in real-time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/pricing" className="galaxy-btn-primary !px-8 !py-4 text-base font-bold shadow-xl shadow-purple-500/25 flex items-center gap-2">
              Claim Early Bird ($1/mo) <ArrowRight size={16} />
            </Link>
            <Link href="/signup" className="px-7 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold text-base transition-all">
              Try Voice Demo Free
            </Link>
          </div>
        </div>

        {/* Voice Interactive Simulation Card */}
        <div className="max-w-4xl mx-auto mb-24 p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-purple-950/40 via-[#0B0F19] to-pink-950/30 border border-purple-500/30 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-8">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-purple-400 animate-ping"></span>
              <span className="text-xs font-mono uppercase tracking-wider text-purple-300 font-bold">Voice Engine Listening</span>
            </div>
            <span className="text-xs font-mono text-gray-400">Response Latency: 45ms</span>
          </div>

          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                <Mic size={20} />
              </div>
              <div>
                <span className="text-xs text-purple-400 font-bold block mb-1">Spoken Input:</span>
                <p className="text-base text-white font-medium italic">&quot;Beraxis, generate and send an invoice for $4,500 to TechNova for cloud architecture consulting.&quot;</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Zap size={20} />
              </div>
              <div>
                <span className="text-xs text-emerald-400 font-bold block mb-1">Autonomous Execution:</span>
                <p className="text-sm text-gray-200">
                  Created Invoice #INV-2026-089 · Customer: TechNova · Subtotal: $4,500.00 · PDF compiled &amp; sent to billing@technova.com · GL Journal logged automatically.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="galaxy-card p-8 bg-[#0F172A]/40 border-white/10 hover:border-purple-500/40 transition-all rounded-3xl">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-6">
              <Cpu size={24} />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">Natural Intent Parsing</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              No need to memorize rigid syntax. Speak naturally, and our neural dual-brain engine detects entity names, amounts, currencies, and intended ERP destinations.
            </p>
          </div>

          <div className="galaxy-card p-8 bg-[#0F172A]/40 border-white/10 hover:border-pink-500/40 transition-all rounded-3xl">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center mb-6">
              <Radio size={24} />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">Instant Voice Notes to CRM</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Step out of a client meeting and dictate a quick 30-second summary. Beraxis transcribes the note, scores the opportunity, and sets automated calendar reminders.
            </p>
          </div>

          <div className="galaxy-card p-8 bg-[#0F172A]/40 border-white/10 hover:border-amber-500/40 transition-all rounded-3xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-6">
              <Zap size={24} />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">Sub-Second Execution</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Edge-hosted AI inference delivers response times under 45ms. Faster than typing, finding links, or waiting for legacy ERP pages to load.
            </p>
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
        <div className="text-center p-12 rounded-3xl bg-gradient-to-r from-purple-950/60 via-pink-950/60 to-amber-950/60 border border-purple-500/30">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4">
            Experience Voice ERP for Just $1/Month
          </h2>
          <p className="text-gray-300 text-sm max-w-xl mx-auto mb-6">
            Get unlimited voice commands, global B2B leads directory, and all 28 integrated modules with our Early Bird Launch Special.
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
