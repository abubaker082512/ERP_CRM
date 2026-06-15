import Link from 'next/link';
import { ArrowRight, PlayCircle, ShieldCheck, Zap, Globe } from 'lucide-react';

export default function Hero() {
    return (
        <div className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
            {/* Immersive Background */}

            {/* Glowing Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                    </span>
                    <span className="text-xs font-medium text-purple-300 uppercase tracking-wider">Beraxis ERP 2.0 is Live</span>
                </div>

                {/* Headline */}
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
                    Manage your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">universe</span><br />
                    with AI & Voice Pilot
                </h1>

                {/* Subheadline */}
                <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
                    The ultimate SaaS platform that unifies CRM, Sales, Inventory, and Accounting under a context-aware AI Dual-Brain framework and real-time duplex Voice Pilot. Speak naturally to manage transactions, analyze metrics, and trigger secure sandboxed automation.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link href="/signup" className="galaxy-btn-primary !px-8 !py-4 text-lg w-full sm:w-auto flex items-center justify-center gap-2 group">
                        Launch Your Workspace <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                    </Link>
                    <Link href="/contact" className="px-8 py-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all flex items-center justify-center gap-2 w-full sm:w-auto backdrop-blur-sm">
                        <PlayCircle size={20} className="text-gray-400" /> Book a Demo
                    </Link>
                </div>

                {/* Trust Indicators */}
                <div className="mt-20 pt-10 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-400 font-medium">
                        <ShieldCheck size={18} /> Enterprise Security
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-400 font-medium">
                        <Zap size={18} /> Real-time Sync
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-400 font-medium">
                        <Globe size={18} /> Global Cloud
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-400 font-medium">
                        <Database className="w-4 h-4" /> Multi-tenant SaaS
                    </div>
                </div>
            </div>
        </div>
    );
}

// Quick inline Database icon for trust indicators
function Database(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  );
}
