import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { ShieldCheck, Lock, Database, Server, Key, CheckCircle2, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Enterprise Security & Data Protection | Beraxis",
  description: "Learn about the multi-layer security architecture of Beraxis: Row-Level Security (RLS), AES-256 database encryption, TLS 1.3 transit encryption, and daily automated snapshots.",
  alternates: {
    canonical: "https://www.beraxis.online/security",
  },
  openGraph: {
    title: "Enterprise Security & Data Protection | Beraxis",
    description: "Multi-tenant Row-Level Security, AES-256 database encryption, and automated backups at Beraxis Systems Inc.",
    url: "https://www.beraxis.online/security",
    siteName: "Beraxis",
  },
};

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-[#020205] text-white overflow-hidden font-sans">
      <Navbar />

      <div className="relative z-10 pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-300 uppercase tracking-wider mb-4">
            <ShieldCheck size={14} className="text-emerald-400" /> Enterprise-Grade Trust
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4 text-white">
            Security &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Data Protection</span>
          </h1>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto">
            How Beraxis protects your company ledgers, customer records, and operational databases against threats, data loss, and unauthorized access.
          </p>
        </div>

        {/* 4 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className="p-8 rounded-3xl bg-[#090D1A]/90 border border-emerald-500/20 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Database size={24} />
            </div>
            <h2 className="text-xl font-bold text-white">Multi-Tenant Row-Level Security (RLS)</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Every database query executed in Beraxis is scoped by tenant cryptographic keys. Row-Level Security guarantees that one company workspace can never access, query, or leak data into another tenant under any circumstance.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[#090D1A]/90 border border-teal-500/20 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Lock size={24} />
            </div>
            <h2 className="text-xl font-bold text-white">AES-256 &amp; TLS 1.3 Encryption</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              All web communication utilizes TLS 1.3 with Perfect Forward Secrecy (PFS). All database volumes, automated backups, and file storage use military-grade AES-256 block encryption at rest.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[#090D1A]/90 border border-cyan-500/20 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Server size={24} />
            </div>
            <h2 className="text-xl font-bold text-white">Daily Snapshots &amp; Point-in-Time Recovery</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Automated database snapshots are captured daily and mirrored across geographically distributed cloud datacenters. Point-in-time recovery ensures zero catastrophic data loss even in worst-case disaster scenarios.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[#090D1A]/90 border border-purple-500/20 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Key size={24} />
            </div>
            <h2 className="text-xl font-bold text-white">Role-Based Access Control (RBAC)</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Fine-grained employee permission groups allow administrators to restrict view, edit, and export privileges across Accounting GL, Employee Salaries, POS Registers, and Customer Lists down to individual fields.
            </p>
          </div>
        </div>

        {/* Compliance Checklist */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#0b0e17]/90 border border-white/10 mb-16 space-y-6">
          <h2 className="text-2xl font-bold text-white">Standards &amp; Regulatory Compliance</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              "GDPR & European Data Protection Compliance",
              "CCPA / CPRA California Consumer Privacy Ready",
              "PCI-DSS Level 1 Hosted Payment Gateways",
              "Zero-Data-Selling Guarantee",
              "Ephemeral Voice Stream Processing (No Model Training)",
              "Audit Log Tracking on All Financial Transactions"
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/5 text-sm text-gray-200">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Inquiries */}
        <div className="p-8 rounded-2xl bg-[#0F172A]/80 border border-white/10 text-center space-y-4">
          <h2 className="text-xl font-bold text-white">Have a Security Audit or Penetration Test Inquiry?</h2>
          <p className="text-gray-300 text-sm max-w-xl mx-auto">
            Our engineering team welcomes vulnerability disclosures and enterprise compliance questionnaires.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <a href="mailto:support@beraxis.online" className="galaxy-btn-primary !px-6 !py-2.5 text-xs">
              Contact Security Team
            </a>
            <Link href="/privacy" className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-semibold">
              Read Privacy Policy
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
