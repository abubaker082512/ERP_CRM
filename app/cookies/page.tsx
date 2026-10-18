import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Cookie, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Cookie & Tracking Policy | Beraxis Systems Inc.",
  description: "Read the Beraxis Cookie Policy. Learn about our zero third-party advertising cookie policy, essential session cookies, and privacy controls.",
  alternates: {
    canonical: "https://www.beraxis.online/cookies",
  },
  openGraph: {
    title: "Cookie & Tracking Policy | Beraxis Systems Inc.",
    description: "Zero third-party advertising cookies and minimal session token storage at Beraxis.",
    url: "https://www.beraxis.online/cookies",
    siteName: "Beraxis",
  },
};

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-[#020205] text-white overflow-hidden font-sans">
      <Navbar />

      <div className="relative z-10 pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-300 uppercase tracking-wider mb-4">
            <Cookie size={14} className="text-amber-400" /> Transparent Data Tracking
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4 text-white">
            Cookie &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-pink-400 to-purple-400">Tracking Policy</span>
          </h1>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto">
            Beraxis enforces a strict zero-ad-tracking philosophy. We do not use third-party behavioral advertising cookies.
          </p>
        </div>

        {/* Policy Body */}
        <div className="space-y-8 text-gray-300 text-sm leading-relaxed mb-16">
          <div className="p-8 rounded-3xl bg-[#090D1A]/90 border border-white/10 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-400" /> 1. Essential Session Cookies &amp; Local Storage
            </h2>
            <p>
              Beraxis uses minimal first-party cookies and browser local storage strictly to ensure safe and authenticated user sessions:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-400">
              <li><strong className="text-gray-200">Authentication Token (&quot;token&quot;):</strong> Encrypted session token that keeps you logged into your active company workspace across page reloads.</li>
              <li><strong className="text-gray-200">User Preferences:</strong> Storing UI theme tokens, sidebar collapse preferences, and active company workspace IDs.</li>
              <li><strong className="text-gray-200">Cart &amp; Checkout State:</strong> Preserving selected subscription billing cycles during checkout flow.</li>
            </ul>
          </div>

          <div className="p-8 rounded-3xl bg-[#090D1A]/90 border border-white/10 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CheckCircle2 size={18} className="text-purple-400" /> 2. Zero Third-Party Advertising Cookies
            </h2>
            <p>
              Unlike legacy enterprise websites that embed hundreds of third-party tracking pixels, Beraxis <strong className="text-white">does not sell ad space or embed third-party retargeting cookies</strong> that track your web browsing activity across other sites.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[#090D1A]/90 border border-white/10 space-y-4">
            <h2 className="text-xl font-bold text-white">3. Managing &amp; Clearing Cookies</h2>
            <p>
              You can instruct your browser to refuse all cookies or notify you when a cookie is sent. However, because our session tokens are required for user login authentication, disabling local storage may prevent you from accessing authenticated ERP apps.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center p-8 rounded-2xl bg-[#0F172A]/80 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/privacy" className="text-amber-400 hover:text-amber-300 text-xs font-semibold flex items-center gap-1">
            Read Full Privacy Policy <ArrowRight size={13} />
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
