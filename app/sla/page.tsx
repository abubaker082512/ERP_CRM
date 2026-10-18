import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Gauge, CheckCircle2, AlertCircle, Clock, ShieldCheck, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Service Level Agreement (SLA) & 99.9% Uptime Commitment | Beraxis",
  description: "Review the official Beraxis Service Level Agreement (SLA): 99.9% monthly production uptime guarantee, response time commitments, and service credit terms.",
  alternates: {
    canonical: "https://www.beraxis.online/sla",
  },
  openGraph: {
    title: "Service Level Agreement (SLA) & Uptime Guarantee | Beraxis",
    description: "99.9% monthly production uptime guarantee and 24/7 technical hotline at Beraxis Systems Inc.",
    url: "https://www.beraxis.online/sla",
    siteName: "Beraxis",
  },
};

export default function SlaPage() {
  return (
    <main className="min-h-screen bg-[#020205] text-white overflow-hidden font-sans">
      <Navbar />

      <div className="relative z-10 pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-bold text-cyan-300 uppercase tracking-wider mb-4">
            <Gauge size={14} className="text-cyan-400" /> Operational Reliability
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4 text-white">
            Service Level <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-400">Agreement (SLA)</span>
          </h1>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto">
            Our contractual commitment to high availability, edge infrastructure uptime, and rapid incident response.
          </p>
        </div>

        {/* Big 99.9% Stat Card */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-cyan-950/40 via-[#0B0F19] to-blue-950/30 border border-cyan-500/30 shadow-2xl mb-16 text-center">
          <div className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 mb-2">
            99.9%
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Monthly Uptime Guarantee</h2>
          <p className="text-gray-300 text-sm max-w-xl mx-auto leading-relaxed">
            Beraxis guarantees that core production services—including Point of Sale terminal endpoints, double-entry accounting ledgers, and CRM pipelines—will be available at least 99.9% of the time during any monthly billing cycle.
          </p>
        </div>

        {/* SLA Tiers & Response Times */}
        <div className="space-y-8 text-gray-300 text-sm leading-relaxed mb-16">
          <div className="p-8 rounded-3xl bg-[#090D1A]/90 border border-white/10 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock size={18} className="text-purple-400" /> Support Severity &amp; Response Targets
            </h2>
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Severity Level</th>
                    <th className="py-3 px-4">Definition</th>
                    <th className="py-3 px-4 text-purple-300">Initial Response Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="py-4 px-4 font-bold text-rose-400">Critical (Sev-1)</td>
                    <td className="py-4 px-4 text-gray-400">Core system down, cannot process POS sales or customer invoices.</td>
                    <td className="py-4 px-4 font-bold text-emerald-400">&lt; 15 Minutes</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-bold text-amber-400">Major (Sev-2)</td>
                    <td className="py-4 px-4 text-gray-400">Significant module degradation (e.g. leads pool search slow, reports delayed).</td>
                    <td className="py-4 px-4 font-bold text-cyan-300">&lt; 1 Hour</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-bold text-blue-400">Minor (Sev-3)</td>
                    <td className="py-4 px-4 text-gray-400">Non-critical questions, feature configuration advice, general inquiries.</td>
                    <td className="py-4 px-4 text-gray-300">&lt; 4 Hours</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-[#090D1A]/90 border border-white/10 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-400" /> Service Credit Policy
            </h2>
            <p>
              In the unlikely event that monthly availability falls below the 99.9% threshold (excluding scheduled off-peak maintenance), customers on paid subscriptions are eligible to claim service credits applied toward future billing:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-400">
              <li><strong className="text-gray-200">99.0% to 99.89% Uptime:</strong> 10% Service Credit on current monthly invoice.</li>
              <li><strong className="text-gray-200">95.0% to 98.99% Uptime:</strong> 25% Service Credit on current monthly invoice.</li>
              <li><strong className="text-gray-200">Below 95.0% Uptime:</strong> 50% Service Credit on current monthly invoice.</li>
            </ul>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center p-8 rounded-2xl bg-[#0F172A]/80 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/terms" className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold flex items-center gap-1">
            Review Terms of Service <ArrowRight size={13} />
          </Link>
          <a href="https://wa.me/19707807993" target="_blank" rel="noreferrer" className="galaxy-btn-primary !px-6 !py-2.5 text-xs">
            Contact 24/7 Hotline
          </a>
        </div>
      </div>

      <Footer />
    </main>
  );
}
