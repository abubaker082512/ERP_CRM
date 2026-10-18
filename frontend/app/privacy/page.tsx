import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Shield, Lock, Eye, FileText, CheckCircle2, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Beraxis Systems Inc.",
  description: "Learn how Beraxis protects your enterprise data, user privacy, and business records with end-to-end encryption, GDPR compliance, and strict zero-data-selling guarantees.",
  alternates: {
    canonical: "https://www.beraxis.online/privacy",
  },
  openGraph: {
    title: "Privacy Policy | Beraxis Systems Inc.",
    description: "Enterprise data privacy, GDPR compliance, and strict zero-data-selling policies at Beraxis.",
    url: "https://www.beraxis.online/privacy",
    siteName: "Beraxis",
  },
};

export default function PrivacyPage() {
  const lastUpdated = "October 19, 2026";

  return (
    <main className="min-h-screen bg-[#020205] text-white overflow-hidden font-sans">
      <Navbar />

      <div className="relative z-10 pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-bold text-purple-300 uppercase tracking-wider mb-4">
            <Shield size={14} className="text-purple-400" /> Enterprise Data Governance
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4 text-white">
            Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">Policy</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Effective Date: {lastUpdated} · Beraxis Systems Inc.
          </p>
        </div>

        {/* Commitment Banner */}
        <div className="mb-12 p-6 rounded-2xl bg-[#0F172A]/80 border border-purple-500/30 shadow-xl backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <Lock size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Our Core Privacy Commitment</h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                At Beraxis Systems Inc. (&quot;Beraxis&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), we operate on a fundamental principle: <strong className="text-white">your operational data belongs to you</strong>. We do not sell your personal or enterprise data to third-party brokers, advertisers, or AI training syndicates.
              </p>
            </div>
          </div>
        </div>

        {/* Policy Body */}
        <div className="space-y-10 text-gray-300 text-sm leading-relaxed">
          <section className="bg-[#0b0e17]/80 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText size={18} className="text-purple-400" /> 1. Information We Collect
            </h2>
            <p>
              When you register for or interact with the Beraxis Autonomous ERP &amp; CRM platform, we collect information necessary to provide, secure, and maintain your workspace:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-400">
              <li><strong className="text-gray-200">Account Credentials:</strong> Name, work email address, phone number, and hashed authentication credentials.</li>
              <li><strong className="text-gray-200">Company &amp; Workspace Data:</strong> Company legal name, tax identifiers, billing address, employee seats, and industry classification selected during onboarding.</li>
              <li><strong className="text-gray-200">Operational Records:</strong> Invoices, transactions, leads, customer interactions, inventory balances, and journals you store within your tenant workspace. All customer workspace data is isolated via Row-Level Security (RLS).</li>
              <li><strong className="text-gray-200">Telemetry &amp; Diagnostics:</strong> IP addresses, browser types, edge response latencies, and anonymized diagnostic crash logs to ensure 99.9% uptime SLA compliance.</li>
            </ul>
          </section>

          <section className="bg-[#0b0e17]/80 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Eye size={18} className="text-cyan-400" /> 2. How We Use Your Information
            </h2>
            <p>Your data is processed strictly for the following business purposes:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>Delivering core ERP, POS, and CRM functionality</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>Executing AI Voice Assistant commands at your request</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>Facilitating B2B Lead Pool query filters and 1-click CRM imports</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>Processing subscription billing and fraud prevention</span>
              </div>
            </div>
          </section>

          <section className="bg-[#0b0e17]/80 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Lock size={18} className="text-pink-400" /> 3. Data Protection &amp; Security Standards
            </h2>
            <p>
              Beraxis enforces military-grade transport and storage controls across all cloud instances:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-400">
              <li><strong className="text-gray-200">Encryption in Transit &amp; at Rest:</strong> All web traffic is strictly encrypted using TLS 1.3. Databases utilize AES-256 block encryption at rest.</li>
              <li><strong className="text-gray-200">Strict Multi-Tenant Isolation:</strong> Database tables use Row-Level Security (RLS) and cryptographic tenant scoping, guaranteeing that no company workspace can ever read or leak data to another tenant.</li>
              <li><strong className="text-gray-200">Zero Retention of Payment Card Data:</strong> All payments are processed directly via PCI-DSS Level 1 compliant processors (Stripe, PayPal, Plisio Crypto). Beraxis never stores raw credit card numbers.</li>
            </ul>
          </section>

          <section className="bg-[#0b0e17]/80 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-white">4. GDPR &amp; CCPA Compliance</h2>
            <p>
              In accordance with European General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA), you retain full rights over your data:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-400">
              <li><strong className="text-gray-200">Right to Access &amp; Portability:</strong> Export all company records, financial ledgers, and contact lists anytime in standard JSON/CSV format.</li>
              <li><strong className="text-gray-200">Right to Erasure (&quot;Right to be Forgotten&quot;):</strong> Request full deletion of your user account and tenant records by contacting our data protection officer.</li>
              <li><strong className="text-gray-200">No Sale of Personal Information:</strong> We do not sell or monetize personal or commercial records under any circumstance.</li>
            </ul>
          </section>

          <section className="bg-[#0b0e17]/80 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-white">5. Contact Our Privacy Team</h2>
            <p>
              For privacy inquiries, data subject access requests (DSAR), or compliance audits, contact our dedicated legal hotline:
            </p>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
              <p><strong className="text-white">Beraxis Systems Inc. — Data Protection Office</strong></p>
              <p>Email: <a href="mailto:support@beraxis.online" className="text-purple-400 hover:underline">support@beraxis.online</a></p>
              <p>Hotline: <a href="tel:+19707807993" className="text-purple-400 hover:underline">+1 (970) 780-7993</a></p>
              <p>Global Headquarters: Wyoming, USA</p>
            </div>
          </section>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/terms" className="text-purple-400 hover:text-purple-300 text-xs font-semibold flex items-center gap-1">
            Read Terms of Service <ArrowRight size={13} />
          </Link>
          <Link href="/signup" className="galaxy-btn-primary !px-6 !py-2.5 text-xs">
            Start Free Workspace
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
