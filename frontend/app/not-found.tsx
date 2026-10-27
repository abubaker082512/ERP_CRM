import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import {
  Compass,
  ArrowRight,
  Globe,
  DollarSign,
  Building2,
  FileText,
  PhoneCall,
  Search,
  Sparkles
} from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#020205] text-white flex flex-col justify-between font-sans selection:bg-purple-500 selection:text-white">
      <Navbar />

      <div className="relative z-10 flex-grow flex items-center justify-center pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
            <Compass size={14} className="animate-spin text-purple-400" />
            <span>Error 404 · Navigation Assistance</span>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight text-white">
              4<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-amber-400">0</span>4
            </h1>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-200">
              Page Not Found in the Beraxis Universe
            </h2>
            <p className="text-gray-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
              The page or resource you requested may have been moved, renamed, or is temporarily unavailable. Use the directory below to find what you need.
            </p>
          </div>

          {/* Search Simulation / Redirect Bar */}
          <form action="/leads-pool" method="GET" className="max-w-md mx-auto relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="query"
              placeholder="Search Leads or modules..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-24 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 transition-colors"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Helpful Navigation Grid (Google Starter Guide Recommended) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-4 text-left">
            <Link
              href="/"
              className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-400/50 hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">Home Page</span>
                <ArrowRight size={14} className="text-gray-400 group-hover:translate-x-1 group-hover:text-purple-400 transition-all" />
              </div>
              <p className="text-xs text-gray-400">Main cockpit and enterprise overview.</p>
            </Link>

            <Link
              href="/pricing"
              className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-400/50 hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">Plan Pricing</span>
                <DollarSign size={14} className="text-emerald-400" />
              </div>
              <p className="text-xs text-gray-400">$1/month Early Bird deal &amp; Free tier.</p>
            </Link>

            <Link
              href="/leads-pool"
              className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-400/50 hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">B2B Leads Directory</span>
                <Globe size={14} className="text-cyan-400" />
              </div>
              <p className="text-xs text-gray-400">Verified B2B contacts directory.</p>
            </Link>

            <Link
              href="/industries"
              className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-400/50 hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">12 Industries</span>
                <Building2 size={14} className="text-amber-400" />
              </div>
              <p className="text-xs text-gray-400">Padel, dental, bakeries, automotive, etc.</p>
            </Link>

            <Link
              href="/compare"
              className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-400/50 hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">Comparisons</span>
                <Sparkles size={14} className="text-pink-400" />
              </div>
              <p className="text-xs text-gray-400">Odoo, QuickBooks, HubSpot &amp; Toast alts.</p>
            </Link>

            <Link
              href="/contact"
              className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-400/50 hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">24/7 Support</span>
                <PhoneCall size={14} className="text-emerald-400" />
              </div>
              <p className="text-xs text-gray-400">Direct hotline &amp; WhatsApp help.</p>
            </Link>
          </div>

          {/* Quick Return Button */}
          <div className="pt-4">
            <Link
              href="/"
              className="galaxy-btn-primary !px-8 !py-3.5 text-sm inline-flex items-center gap-2 font-bold group"
            >
              Return to Homepage <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
