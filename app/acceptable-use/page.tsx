import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { ShieldAlert, ShieldCheck, Sparkles, Ban, FileWarning, AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Acceptable Use Policy (AUP) | Beraxis Systems Inc.",
  description: "Review the Beraxis Acceptable Use Policy governing use of the platform, the AI copilot, Voice Pilot, and generated content. Learn about our strict NSFW prohibition and content safety guidelines.",
  alternates: {
    canonical: "https://www.beraxis.online/acceptable-use",
  },
  openGraph: {
    title: "Acceptable Use Policy | Beraxis Systems Inc.",
    description: "Acceptable Use Policy for Beraxis Autonomous ERP & CRM. Specific safety rules governing AI copilot usage, content generation, and strict NSFW/adult content prohibitions.",
    url: "https://www.beraxis.online/acceptable-use",
    siteName: "Beraxis",
  },
};

export default function AcceptableUsePolicyPage() {
  const lastUpdated = "October 27, 2026";

  return (
    <main className="min-h-screen bg-[#020205] text-white overflow-hidden font-sans">
      <Navbar />

      <div className="relative z-10 pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-xs font-bold text-red-300 uppercase tracking-wider mb-4">
            <ShieldAlert size={14} className="text-red-400" /> Platform &amp; AI Safety Standards
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4 text-white">
            Acceptable <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-pink-400 to-purple-400">Use Policy</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Effective Date: {lastUpdated} · Beraxis Systems Inc.
          </p>
        </div>

        {/* Highlight Card */}
        <div className="mb-12 p-6 rounded-2xl bg-[#0F172A]/80 border border-red-500/30 shadow-xl backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <Ban size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Zero-Tolerance Content Safety Notice</h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                Beraxis provides autonomous ERP, CRM, and AI business productivity tools designed solely for legitimate enterprise operations. We maintain strict zero-tolerance prohibitions against generating, storing, or transmitting <strong className="text-white">NSFW, sexually explicit, adult entertainment, non-consensual sexual depictions, or abusive content</strong> through our AI copilot, Voice Pilot, or any platform service.
              </p>
            </div>
          </div>
        </div>

        {/* Policy Sections */}
        <div className="space-y-10 text-gray-300 text-sm leading-relaxed">
          {/* Section 1: Scope */}
          <section className="bg-[#0b0e17]/80 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck size={18} className="text-cyan-400" /> 1. Scope &amp; Applicability
            </h2>
            <p>
              This Acceptable Use Policy (&quot;AUP&quot;) governs all access to and use of Beraxis software, web portals, APIs, mobile applications, AI assistants, Voice Pilot, and communication channels provided by Beraxis Systems Inc. (&quot;Beraxis&quot;, &quot;we&quot;, &quot;us&quot;).
            </p>
            <p>
              This policy applies universally to all account owners, tenant administrators, workspace members, API clients, and free or paid subscribers. By using Beraxis, you agree to comply with this policy and incorporate these restrictions across your organization.
            </p>
          </section>

          {/* Section 2: AI Copilot & Generated Content (NSFW Prohibition) */}
          <section className="bg-[#0b0e17]/80 border border-red-500/20 rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles size={18} className="text-purple-400" /> 2. AI Copilot &amp; Generative Content Standards (Strict NSFW Prohibition)
            </h2>
            <p>
              Beraxis incorporates generative artificial intelligence models, natural language assistants, and an autonomous Voice Pilot to assist business users with administrative productivity, such as creating invoices, summarizing operational journals, analyzing pipeline health, and drafting professional customer correspondence.
            </p>
            <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 space-y-3">
              <h3 className="font-bold text-red-300 text-sm uppercase tracking-wide flex items-center gap-2">
                <FileWarning size={16} /> Strictly Prohibited AI Content Categories:
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-300 text-xs sm:text-sm">
                <li>
                  <strong className="text-white">NSFW &amp; Sexually Explicit Content:</strong> You may not use the AI copilot to generate, draft, prompt, edit, summarize, store, or distribute any Not-Safe-For-Work (NSFW) material, sexually explicit text, pornography, erotic depictions, sexually suggestive content, or adult entertainment material.
                </li>
                <li>
                  <strong className="text-white">Non-Consensual Sexual Depictions &amp; Harassment:</strong> Any use of AI tools to simulate sexual harassment, intimate imagery, deepfakes, sexually degrading communications, or unsolicited adult solicitations is strictly forbidden.
                </li>
                <li>
                  <strong className="text-white">Child Sexual Abuse &amp; Exploitation:</strong> Child Sexual Abuse Material (CSAM) or any form of child exploitation is subject to immediate account termination, evidence preservation, and mandatory reporting to the National Center for Missing and Exploited Children (NCMEC) and law enforcement.
                </li>
                <li>
                  <strong className="text-white">Violence, Weapons &amp; Self-Harm:</strong> Prompts or outputs encouraging violence, weapons manufacture, terrorist promotion, or suicide/self-harm instructions are prohibited.
                </li>
                <li>
                  <strong className="text-white">Hate Speech &amp; Harassment:</strong> Generating defamatory, derogatory, discriminatory, or harassing language targeting race, religion, gender, sexual orientation, disability, or nationality.
                </li>
              </ul>
            </div>
            <p className="text-xs text-gray-400">
              Our AI architecture utilizes automated prompt inspection and output safety moderation filters. Any attempt to jailbreak, bypass, obfuscate, or evade these content safety guardrails constitutes an immediate material breach of our Terms of Service.
            </p>
          </section>

          {/* Section 3: B2B Leads Directory & Outbound Communications */}
          <section className="bg-[#0b0e17]/80 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-400" /> 3. Responsible Use of B2B Leads Directory &amp; Messaging
            </h2>
            <p>
              Subscribers who access the Global B2B Leads Directory or use built-in email and WhatsApp messaging integrations agree to maintain high commercial communications standards:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-400">
              <li>Adhere strictly to international commercial messaging standards including the US CAN-SPAM Act, the EU General Data Protection Regulation (GDPR), the UK Data Protection Act, and Canada CASL.</li>
              <li>Include visible, functional unsubscribe/opt-out mechanisms in all outbound commercial emails and immediately honor opt-out requests.</li>
              <li>Refrain from purchasing or uploading known spam lists, harvested email dumps, or non-business consumer directories.</li>
              <li>Refrain from scraping, reselling, or sub-licensing directory data to third parties outside of your authorized workspace seats.</li>
            </ul>
          </section>

          {/* Section 4: System Integrity & Prohibited Technical Conduct */}
          <section className="bg-[#0b0e17]/80 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-400" /> 4. Platform Security &amp; Technical Conduct
            </h2>
            <p>
              Users shall not engage in any activity that compromises the reliability, security, or tenant isolation of the Beraxis cloud infrastructure:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-400">
              <li>Attempting to probe, scan, or test the vulnerability of any Beraxis system or network without prior written authorization.</li>
              <li>Interfering with service to any user, host, or network (e.g. denial of service attacks, flooding, or packet manipulation).</li>
              <li>Attempting to bypass database Row-Level Security (RLS) to access data belonging to another tenant or enterprise workspace.</li>
              <li>Decompiling, reverse engineering, or disassembling any proprietary platform binary or algorithmic component.</li>
              <li>Using automated bots, crawlers, or scrapers to extract platform assets, UI designs, or source code.</li>
            </ul>
          </section>

          {/* Section 5: Enforcement, Suspension & Termination */}
          <section className="bg-[#0b0e17]/80 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldAlert size={18} className="text-red-400" /> 5. Enforcement &amp; Account Termination
            </h2>
            <p>
              Beraxis reserves the right, at its sole discretion, to investigate suspected violations of this Acceptable Use Policy. In the event of an AUP breach, Beraxis may:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-400">
              <li>Issue an administrative warning and mandate immediate removal of infringing material.</li>
              <li>Temporarily suspend or revoke access to the AI copilot, Voice Pilot, or outbound messaging modules.</li>
              <li>Immediately terminate the subscriber&apos;s workspace and user credentials without notice.</li>
              <li>Deny any refund for prepaid subscription balances where termination results from willful violations of safety, fraud, or NSFW restrictions.</li>
              <li>Refer unlawful conduct and provide necessary records to law enforcement agencies.</li>
            </ul>
          </section>

          {/* Section 6: Reporting Violations */}
          <section className="bg-[#0b0e17]/80 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-white">6. Reporting Abuse &amp; Contact Information</h2>
            <p>
              If you discover or suspect that another user or tenant is generating NSFW content, violating this Acceptable Use Policy, or abusing Beraxis services, please report the incident immediately:
            </p>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
              <p><strong className="text-white">Beraxis Systems Inc. — Abuse &amp; Trust Team</strong></p>
              <p>Abuse Inquiries: <a href="mailto:abuse@beraxis.online" className="text-red-400 hover:underline">abuse@beraxis.online</a></p>
              <p>General Compliance &amp; Support: <a href="mailto:support@beraxis.online" className="text-purple-400 hover:underline">support@beraxis.online</a></p>
              <p>US Corporate Office: <span className="text-gray-300">Miami, Florida, United States</span></p>
              <p>Hotline: <a href="tel:+19707807993" className="text-gray-300 hover:underline">+1 (970) 780-7993</a></p>
            </div>
          </section>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/terms" className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold flex items-center gap-1">
            Read Full Terms of Service <ArrowRight size={13} />
          </Link>
          <Link href="/privacy" className="text-purple-400 hover:text-purple-300 text-xs font-semibold flex items-center gap-1">
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
