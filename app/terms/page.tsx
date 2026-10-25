import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { FileCheck, ShieldCheck, CreditCard, Scale, CheckCircle2, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | Beraxis Systems Inc.",
  description: "Review the Beraxis Terms of Service. Learn about our $1/month Early Bird subscription terms, 99.9% uptime SLA, acceptable use guidelines, and account rights.",
  alternates: {
    canonical: "https://www.beraxis.online/terms",
  },
  openGraph: {
    title: "Terms of Service | Beraxis Systems Inc.",
    description: "Terms of Service, $1/mo pricing guarantee, SLA commitments, and usage rights for Beraxis Autonomous ERP & CRM.",
    url: "https://www.beraxis.online/terms",
    siteName: "Beraxis",
  },
};

export default function TermsPage() {
  const lastUpdated = "October 19, 2026";

  return (
    <main className="min-h-screen bg-[#020205] text-white overflow-hidden font-sans">
      <Navbar />

      <div className="relative z-10 pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-bold text-cyan-300 uppercase tracking-wider mb-4">
            <Scale size={14} className="text-cyan-400" /> Transparent Legal Agreements
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4 text-white">
            Terms of <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">Service</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Effective Date: {lastUpdated} · Beraxis Systems Inc.
          </p>
        </div>

        {/* Highlight Card */}
        <div className="mb-12 p-6 rounded-2xl bg-[#0F172A]/80 border border-cyan-500/30 shadow-xl backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <FileCheck size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Agreement Overview</h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                By accessing or subscribing to Beraxis (available at beraxis.online), you enter into a binding agreement with Beraxis Systems Inc. We believe in radically simple, predictable, and fair business terms with zero hidden fees.
              </p>
            </div>
          </div>
        </div>

        {/* Terms Sections */}
        <div className="space-y-10 text-gray-300 text-sm leading-relaxed">
          <section className="bg-[#0b0e17]/80 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CreditCard size={18} className="text-amber-400" /> 1. Subscriptions &amp; Early Bird Pricing Guarantee
            </h2>
            <p>
              Beraxis offers three straightforward tiers: Forever Free (One App), Standard Early Bird, and Custom Enterprise:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-400">
              <li><strong className="text-gray-200">Forever Free Plan:</strong> Choose any single full ERP module forever with unlimited users and zero credit card required.</li>
              <li><strong className="text-gray-200">Early Bird Standard Plan ($1.00/mo billed annually at $12/year, or $5.00/mo monthly):</strong> Unlocks all 28 integrated modules, single company workspace, and 1,500 verified lead credits per seat per month. Lock in your rate for the full annual billing cycle.</li>
              <li><strong className="text-gray-200">Billing &amp; Cancellation:</strong> You can cancel your subscription at any time directly through your billing portal. Your workspace will remain active until the conclusion of your current prepaid billing term.</li>
            </ul>
          </section>

          <section className="bg-[#0b0e17]/80 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck size={18} className="text-purple-400" /> 2. Uptime SLA &amp; Service Commitments
            </h2>
            <p>
              Beraxis commits to delivering a 99.9% monthly Service Level Agreement (SLA) for production core services including POS terminal endpoints, double-entry accounting engines, and CRM operations.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>Automated daily backups with point-in-time recovery</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>Sub-second globally distributed edge CDN response</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>24/7 technical hotline &amp; WhatsApp developer support</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>Tenant isolation via Row-Level Security (RLS)</span>
              </div>
            </div>
          </section>

          <section className="bg-[#0b0e17]/80 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-white">3. Acceptable Use of 25M+ Leads Pool</h2>
            <p>
              Subscribers receive access to the integrated 25M+ Global B2B Leads Pool. By using this service, you agree to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-400">
              <li>Adhere to applicable international communications regulations (including CAN-SPAM Act, GDPR, and CASL).</li>
              <li>Refrain from scraping, reselling, or distributing bulk contact data to unauthorized third parties.</li>
              <li>Use verified corporate contacts solely for legitimate B2B commercial outreach and CRM pipeline enrichment.</li>
            </ul>
          </section>

          <section className="bg-[#0b0e17]/80 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-white">4. Intellectual Property &amp; Data Ownership</h2>
            <p>
              You retain 100% intellectual property ownership of all customer records, transactions, catalogs, recipes, and financial ledgers entered into your Beraxis instance. Beraxis retains ownership of platform code, trademarks, algorithms, and glassmorphic UI assets.
            </p>
          </section>

          <section className="bg-[#0b0e17]/80 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-white">5. Governing Law &amp; Arbitration</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of Wyoming, USA, without regard to conflict of law principles. Any dispute arising under these Terms shall be resolved via binding individual arbitration.
            </p>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
              <p><strong className="text-white">Beraxis Systems Inc. — Legal &amp; Billing Inquiries</strong></p>
              <p>US Corporate Office: <span className="text-gray-300">Miami, Florida, United States</span></p>
              <p>Operations Office: <span className="text-gray-300">20, 21, Mobile Arena, SOAN Garden, Islamabad</span></p>
              <p>Email: <a href="mailto:support@beraxis.online" className="text-purple-400 hover:underline">support@beraxis.online</a></p>
              <p>Phone: <a href="tel:+19707807993" className="text-purple-400 hover:underline">+1 (970) 780-7993</a></p>
              <p>Refunds &amp; Cancellations: <Link href="/refund-policy" className="text-emerald-400 hover:underline">14-Day Money-Back Guarantee Policy</Link></p>
            </div>
          </section>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold flex items-center gap-1">
            Read Privacy Policy <ArrowRight size={13} />
          </Link>
          <Link href="/pricing" className="galaxy-btn-primary !px-6 !py-2.5 text-xs">
            View Pricing Plans ($1/mo)
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
