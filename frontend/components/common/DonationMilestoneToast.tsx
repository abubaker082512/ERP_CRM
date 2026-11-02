"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, Heart, X, ArrowRight, Coffee, Sparkles } from "lucide-react";

export default function DonationMilestoneToast() {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Do not show on billing, donate, super-admin, checkout, or login pages
        if (
            !pathname ||
            pathname.startsWith("/donate") ||
            pathname.startsWith("/checkout") ||
            pathname.startsWith("/billing") ||
            pathname.startsWith("/login") ||
            pathname.startsWith("/signup") ||
            pathname.startsWith("/super-admin")
        ) {
            setIsVisible(false);
            return;
        }

        // Check 30-day dismissal in localStorage
        try {
            const dismissedUntil = localStorage.getItem("beraxis_donation_dismissed_until");
            if (dismissedUntil && parseInt(dismissedUntil, 10) > Date.now()) {
                return;
            }
        } catch {
            // Ignore localStorage errors (e.g., incognito)
        }

        // Trigger after 45 seconds of active user productivity
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 45000);

        return () => clearTimeout(timer);
    }, [pathname]);

    const handleDismiss = () => {
        setIsVisible(false);
        try {
            // Dismiss for 30 days
            const thirtyDays = Date.now() + 30 * 24 * 60 * 60 * 1000;
            localStorage.setItem("beraxis_donation_dismissed_until", thirtyDays.toString());
        } catch {
            // Ignore localStorage errors
        }
    };

    if (!isVisible) return null;

    return (
        <aside 
            aria-label="Environmental fund milestone announcement"
            className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
        >
            <div className="bg-[#0B1322]/95 border border-emerald-500/40 rounded-2xl p-4 shadow-2xl shadow-emerald-500/10 backdrop-blur-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-start justify-between gap-3 relative z-10">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                        <Leaf size={16} className="animate-pulse" />
                    </div>

                    <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">Enjoying zero-waste paperless ERP?</span>
                        </div>
                        <p className="text-[11px] text-gray-300 leading-relaxed">
                            Beraxis operates on 100% renewable cloud compute. Offset server emissions or buy the team a coffee starting at just <strong className="text-emerald-300">$3.00</strong>.
                        </p>

                        <div className="pt-2 flex items-center gap-2">
                            <Link
                                href="/donate"
                                onClick={handleDismiss}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-[11px] font-bold shadow-md shadow-emerald-500/20 transition-all active:scale-95"
                            >
                                <Heart size={12} className="fill-white" />
                                <span>Support Fund ($3+)</span>
                                <ArrowRight size={11} />
                            </Link>

                            <button
                                type="button"
                                onClick={handleDismiss}
                                className="px-2.5 py-1.5 rounded-lg text-[11px] text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-medium cursor-pointer"
                            >
                                Maybe Later
                            </button>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleDismiss}
                        className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5 cursor-pointer shrink-0"
                        title="Dismiss for 30 days"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
