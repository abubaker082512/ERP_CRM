import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { 
  RotateCcw, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  Mail, 
  HelpCircle, 
  ArrowRight,
  MapPin,
  Phone,
  FileText
} from "lucide-react";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | Beraxis Systems",
  description: "Read the official Beraxis 14-day Money-Back Guarantee and Refund Policy. Learn how refund requests, subscription cancellations, and Merchant of Record transactions are processed.",
  alternates: {
    canonical: "https://www.beraxis.online/refund-policy",
  },
  openGraph: {
    title: "Refund & Cancellation Policy | Beraxis Systems",
    description: "14-Day Money-Back Guarantee, zero-hassle cancellations, and clear billing terms for Beraxis Autonomous Cloud ERP & AI CRM.",
    url: "https://www.beraxis.online/refund-policy",
    siteName: "Beraxis",
  },
};

export default function RefundPolicyPage() {
  const lastUpdated = "October 25, 2026";

  return (
    <main className="min-h-screen bg-[#020205] text-white overflow-hidden font-sans">
      <Navbar />

      <div className="relative z-10 pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-300 uppercase tracking-wider mb-4">
            <RotateCcw size={14} className="text-emerald-400" /> Buyer Protection &amp; Guarantee
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4 text-white">
            Refund &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Cancellation Policy</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Effective Date: {lastUpdated} · Beraxis Systems Inc.
          </p>
        </div>

        {/* 14-Day Guarantee Callout Card */}
        <div className="mb-12 p-8 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/30 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-500/30 shadow-lg">
              <ShieldCheck size={32} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-black text-white mb-1.5 flex items-center gap-2">
                <span>14-Day Money-Back Guarantee</span>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  100% Risk Free
                </span>
              </h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                We stand behind the quality and reliability of the Beraxis autonomous ERP &amp; CRM suite. If you are not completely satisfied with your subscription, you may request a <strong className="text-white">full refund within 14 calendar days</strong> of your initial purchase — no complicated questions or hidden deductions.
              </p>
            </div>
          </div>
        </div>

        {/* Policy Details Grid */}
        <div className="space-y-10 text-gray-300 text-sm leading-relaxed">
          
          {/* Section 1: Eligibility */}
          <section className="bg-[#0b0e17]/80 border border-white/5 rounded-3xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-black">1</span>
              <span>Refund Eligibility</span>
            </h2>
            <p>
              Our 14-day refund policy applies to all first-time purchases across the Beraxis platform, including:
            </p>
            <ul className="space-y-2.5 pl-2">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Standard Plan:</strong> Both monthly ($5.00/mo) and annual ($1.00/mo billed at $12.00/year) licenses.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Custom Enterprise Plan:</strong> Monthly and annual enterprise deployments.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Leads Pool Solo:</strong> Standalone monthly directory subscriptions requested within 14 days of activation.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Accidental Renewals:</strong> If you did not intend to renew an annual subscription and notify us within 7 calendar days of the charge without utilizing lead exports, we will issue a full refund.</span>
              </li>
            </ul>
          </section>

          {/* Section 2: Merchant of Record (Paddle) */}
          <section className="bg-[#0b0e17]/80 border border-white/5 rounded-3xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm font-black">2</span>
              <span>Merchant of Record &amp; Payment Processing</span>
            </h2>
            <p>
              Our order process is conducted by our online reseller <strong className="text-white">Paddle.com</strong>. Paddle.com is the <strong className="text-cyan-300">Merchant of Record (MoR)</strong> for all our orders.
            </p>
            <div className="bg-[#070913] border border-cyan-500/20 rounded-2xl p-4 text-xs space-y-2">
              <p className="text-gray-300">
                Paddle provides customer service inquiries, handles international tax/VAT calculations, maintains Level-1 PCI-DSS card security, and executes official refund authorizations. All billing descriptors on your card or bank statement will display as <code className="text-cyan-300 font-mono">PADDLE.NET* BERAXIS</code> or <code className="text-cyan-300 font-mono">PADDLE.COM</code>.
              </p>
            </div>
          </section>

          {/* Section 3: How to Request a Refund */}
          <section className="bg-[#0b0e17]/80 border border-white/5 rounded-3xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center text-sm font-black">3</span>
              <span>How to Request a Refund</span>
            </h2>
            <p>
              Requesting a refund is simple and rapid. You can initiate a request through either of the following channels:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-[#070913] border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Mail size={16} className="text-pink-400" />
                  <span>Email Support</span>
                </div>
                <p className="text-xs text-gray-400">
                  Send an email to <a href="mailto:support@beraxis.online" className="text-pink-300 underline font-medium">support@beraxis.online</a> with your account email and Paddle Transaction / Order ID.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#070913] border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold">
                  <CreditCard size={16} className="text-emerald-400" />
                  <span>Paddle Customer Portal</span>
                </div>
                <p className="text-xs text-gray-400">
                  Visit Paddle&apos;s direct buyer assistance page at <a href="https://paddle.net" target="_blank" rel="noreferrer" className="text-emerald-300 underline font-medium">paddle.net</a> to view order history, download invoices, or submit inquiry tickets.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Refund Processing Timelines */}
          <section className="bg-[#0b0e17]/80 border border-white/5 rounded-3xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-black">4</span>
              <span>Refund Processing &amp; Payout Timelines</span>
            </h2>
            <p>
              Once approved by our support team or Paddle:
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#070913] border border-white/5">
                <Clock size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white text-xs">Authorization within 24–48 Hours</p>
                  <p className="text-xs text-gray-400 mt-0.5">We review and approve valid requests within 1 to 2 business days.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#070913] border border-white/5">
                <CreditCard size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white text-xs">Bank Crediting within 5–10 Business Days</p>
                  <p className="text-xs text-gray-400 mt-0.5">Paddle immediately credits your original payment method (Visa, Mastercard, Amex, Apple Pay, Google Pay, or PayPal). Depending on your issuing bank, funds appear on your statement in 5–10 business days.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Subscription Cancellation */}
          <section className="bg-[#0b0e17]/80 border border-white/5 rounded-3xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-black">5</span>
              <span>Subscription Cancellation Terms</span>
            </h2>
            <p>
              You may cancel your recurring SaaS subscription at any time with zero termination penalties. 
            </p>
            <ul className="space-y-2 pl-2 text-xs">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">•</span>
                <span>Navigate to <Link href="/billing" className="text-blue-300 underline font-semibold">Billing Settings</Link> inside your Beraxis workspace, or contact our support desk.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">•</span>
                <span>Upon cancellation, your access remains fully unlocked and functional until the conclusion of the paid term.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">•</span>
                <span>No subsequent billing renewals will be scheduled once canceled.</span>
              </li>
            </ul>
          </section>

          {/* Section 6: Official Business Contact Details */}
          <section className="bg-[#0b0e17]/80 border border-white/5 rounded-3xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-black">6</span>
              <span>Corporate Identity &amp; Physical Address</span>
            </h2>
            <p className="text-xs text-gray-300">
              For any billing inquiries, refund verifications, or postal correspondence, contact Beraxis Systems directly:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="p-4 rounded-xl bg-[#070913] border border-white/5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-white font-bold">
                  <MapPin size={14} className="text-rose-400" />
                  <span>Physical Address</span>
                </div>
                <p className="text-gray-300 font-medium">
                  20, 21, Mobile Arena, SOAN Garden, Islamabad
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#070913] border border-white/5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-white font-bold">
                  <Phone size={14} className="text-purple-400" />
                  <span>Support &amp; WhatsApp Hotline</span>
                </div>
                <p className="text-gray-300 font-medium">
                  <a href="tel:+19707807993" className="hover:text-white transition-colors">+1 (970) 780-7993</a>
                </p>
                <p className="text-gray-400 text-[11px]">
                  Email: <a href="mailto:support@beraxis.online" className="text-cyan-300 hover:underline">support@beraxis.online</a>
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Bottom CTA Row */}
        <div className="mt-16 text-center">
          <div className="p-8 rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-emerald-500/10 border border-white/10 max-w-2xl mx-auto space-y-4">
            <h3 className="text-xl font-bold text-white">Have questions about your billing?</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Our 24/7 client concierge is ready to assist you with subscription upgrades, renewals, and invoice management.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link 
                href="/contact"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
              >
                <span>Contact Support</span> <ArrowRight size={14} />
              </Link>
              <Link 
                href="/pricing"
                className="bg-white/10 hover:bg-white/15 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all border border-white/15 flex items-center gap-2"
              >
                <span>View Plans &amp; Pricing</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
