"use client";

import {
    CheckCircle, Lock, Zap, Shield, ArrowRight, Loader2,
    Copy, ExternalLink, Bitcoin, CreditCard, Star, X, Check, Calendar as CalendarIcon, Plus, Minus
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';

// ─── Constants ───────────────────────────────────────────────────────────────

const CRYPTO_CURRENCIES = [
    { id: "BTC",  name: "Bitcoin",  color: "#F7931A", emoji: "₿" },
    { id: "ETH",  name: "Ethereum", color: "#627EEA", emoji: "Ξ" },
    { id: "LTC",  name: "Litecoin", color: "#A6A9AA", emoji: "Ł" },
    { id: "USDT", name: "Tether",   color: "#26A17B", emoji: "₮" },
    { id: "USDC", name: "USD Coin", color: "#2775CA", emoji: "◎" },
    { id: "BNB",  name: "BNB",      color: "#F3BA2F", emoji: "◈" },
    { id: "TRX",  name: "TRON",     color: "#FF0013", emoji: "◈" },
    { id: "DOGE", name: "Dogecoin", color: "#C2A633", emoji: "Ð" },
];

const ALL_MODULES = [
    "CRM", "Sales", "Accounting", "Inventory", "Purchase",
    "Manufacturing", "Payroll", "Recruitment", "Employees", "Attendances",
    "Project", "Timesheets", "Planning", "Helpdesk", "Documents",
    "Point of Sale", "Contacts", "Knowledge", "Discuss", "Surveys",
    "Sign", "Barcode", "Calendar", "Appointments", "To Do",
    "Team", "Dashboards", "Settings",
];

interface Plan {
    id: string;
    name: string;
    tagline: string;
    monthlyPrice: number;
    annualPrice: number;
    highlight: boolean;
    badge?: string;
    features: string[];
    cryptoPlanKey: string;
    isFree?: boolean;
}

const PLANS: Plan[] = [
    {
        id: "free",
        name: "One App Free",
        tagline: "Pick any 1 module, use it forever",
        monthlyPrice: 2.99,
        annualPrice: 2.42,
        highlight: false,
        isFree: true,
        features: [
            "1 module of your choice",
            "Unlimited user seats",
            "Managed cloud hosting",
            "Community support",
        ],
        cryptoPlanKey: "free",
    },
    {
        id: "standard",
        name: "Standard",
        tagline: "Full suite — all 28 modules",
        monthlyPrice: 31.10,
        annualPrice: 25.19,
        highlight: true,
        badge: "Most Popular",
        features: [
            "All 28 ERP/CRM modules",
            "Unlimited user seats & workspaces",
            "Antigravity AI Brain included",
            "Priority 24/7 support",
            "Real-time data sync",
            "Advanced analytics & reporting",
        ],
        cryptoPlanKey: "standard",
    },
    {
        id: "premium",
        name: "Premium",
        tagline: "Multi-company management",
        monthlyPrice: 46.80,
        annualPrice: 37.91,
        highlight: false,
        features: [
            "Everything in Standard",
            "Multi-company management",
            "Custom branding & white-label",
            "Dedicated account manager",
            "SLA-backed uptime guarantee",
            "API access & integrations",
        ],
        cryptoPlanKey: "premium",
    },
];

// ─── Module Selector Modal ────────────────────────────────────────────────────

function ModuleSelectorModal({
    onSelect,
    onClose,
}: {
    onSelect: (module: string) => void;
    onClose: () => void;
}) {
    const [selected, setSelected] = useState<string | null>(null);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ background: "rgba(2,2,5,0.92)", backdropFilter: "blur(16px)" }}>
            <div className="max-w-2xl w-full bg-[#0F172A] border border-purple-500/20 rounded-3xl shadow-2xl shadow-purple-500/10 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/8 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-black text-white">Choose Your Free App</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Select any 1 module to unlock unlimited usage.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Grid */}
                <div className="p-6 max-h-[60vh] overflow-y-auto grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {ALL_MODULES.map((mod) => {
                        const isSelected = selected === mod;
                        return (
                            <button
                                key={mod}
                                onClick={() => setSelected(mod)}
                                className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all ${
                                    isSelected
                                        ? "bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-500/30 scale-95"
                                        : "bg-white/5 border-white/5 text-gray-300 hover:bg-white/10 hover:border-white/10"
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm">⚡</span>
                                    {isSelected && <Check size={12} className="text-white" />}
                                </div>
                                <span>{mod}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/8 flex justify-end gap-3 bg-[#070B16]">
                    <button onClick={onClose} className="px-5 py-2.5 text-xs text-gray-400 hover:text-white font-bold">
                        Cancel
                    </button>
                    <button
                        disabled={!selected}
                        onClick={() => selected && onSelect(selected)}
                        className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-purple-500/25 transition-all"
                    >
                        Confirm & Continue to Card Checkout →
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Crypto Payment Step ──────────────────────────────────────────────────────

function CryptoStep({
    plan,
    totalPrice,
    durationLabel,
    onBack,
    userEmail,
}: {
    plan: Plan;
    totalPrice: number;
    durationLabel: string;
    onBack: () => void;
    userEmail: string;
}) {
    const [selectedCrypto, setSelectedCrypto] = useState("USDT");
    const [loading, setLoading] = useState(false);
    const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCreateInvoice = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchAPI("/billing/crypto/create-invoice", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    plan_key: plan.cryptoPlanKey,
                    currency: selectedCrypto,
                    amount_usd: totalPrice,
                    email: userEmail,
                }),
            });
            const data = await res.json();
            if (res.ok && data.invoice_url) {
                setInvoiceUrl(data.invoice_url);
                window.location.href = data.invoice_url;
            } else {
                setError(data.detail || "Failed to generate crypto invoice.");
            }
        } catch (e: any) {
            setError(e.message || "Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/8">
                <div>
                    <h3 className="text-sm font-bold text-gray-300">Selected Plan</h3>
                    <p className="text-xl font-black text-white">{plan.name} <span className="text-xs text-purple-400 font-bold">({durationLabel})</span></p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-400">Total Due</p>
                    <p className="text-2xl font-black text-emerald-400">${totalPrice.toFixed(2)}</p>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Select Cryptocurrency</label>
                <div className="grid grid-cols-4 gap-2.5">
                    {CRYPTO_CURRENCIES.map(c => {
                        const isSel = selectedCrypto === c.id;
                        return (
                            <button
                                key={c.id}
                                onClick={() => setSelectedCrypto(c.id)}
                                className={`p-3 rounded-2xl border text-center transition-all ${
                                    isSel
                                        ? "bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-500/20"
                                        : "bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                                }`}
                            >
                                <span className="text-xl block mb-1">{c.emoji}</span>
                                <span className="text-xs font-bold">{c.id}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                    {error}
                </div>
            )}

            <div className="flex gap-3 pt-2">
                <button
                    onClick={onBack}
                    className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold transition-all"
                >
                    Back
                </button>
                <button
                    onClick={handleCreateInvoice}
                    disabled={loading}
                    className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Bitcoin size={16} />}
                    Pay with {selectedCrypto}
                </button>
            </div>
        </div>
    );
}

// ─── Plan Card Component ──────────────────────────────────────────────────────

function PlanCard({
    plan,
    billing,
    durationCount,
    userEmail,
    onSelectFree,
    onSelectCrypto,
}: {
    plan: Plan;
    billing: "monthly" | "annual";
    durationCount: number;
    userEmail: string;
    onSelectFree: () => void;
    onSelectCrypto: (plan: Plan, totalPrice: number, durationLabel: string) => void;
}) {
    const router = useRouter();
    const monthlyRate = billing === "annual" ? plan.annualPrice : plan.monthlyPrice;
    const monthsTotal = billing === "annual" ? durationCount * 12 : durationCount;
    const totalPrice = monthlyRate * monthsTotal;
    const durationLabel = billing === "annual"
        ? `${durationCount} ${durationCount === 1 ? 'Year' : 'Years'}`
        : `${durationCount} ${durationCount === 1 ? 'Month' : 'Months'}`;

    const handleCardCheckout = () => {
        if (plan.isFree) {
            onSelectFree();
            return;
        }
        router.push(`/checkout?plan=${plan.id}&billing=${billing}&duration=${durationCount}`);
    };

    return (
        <div className={`relative flex flex-col rounded-3xl border p-7 transition-all duration-300 ${
            plan.highlight
                ? "border-purple-500/40 bg-gradient-to-b from-purple-950/50 to-[#0F172A]/80 shadow-2xl shadow-purple-500/15 scale-[1.02]"
                : "border-white/8 bg-[#0F172A]/40 hover:border-white/20"
        }`}>
            {/* Badge */}
            {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-extrabold uppercase tracking-widest px-4 py-1 rounded-full shadow-lg">
                    {plan.badge}
                </div>
            )}

            {/* Plan header */}
            <div className="mb-5">
                <h3 className="text-lg font-black text-white mb-1">{plan.name}</h3>
                <p className="text-xs text-gray-400">{plan.tagline}</p>
            </div>

            {/* Price */}
            <div className="flex items-end gap-1 mb-1">
                <span className={`text-5xl font-black ${plan.highlight ? "text-white" : "text-gray-200"}`}>
                    ${monthlyRate.toFixed(2)}
                </span>
                <span className="text-gray-500 text-xs mb-2">/mo</span>
            </div>

            {/* Total Duration Badge */}
            <div className="mb-5">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-xl">
                    <span>Total: <strong className="text-white">${totalPrice.toFixed(2)}</strong> for {durationLabel}</span>
                </div>
            </div>

            {/* Features */}
            <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle className={plan.highlight ? "text-purple-400" : "text-gray-500"} size={14} style={{ marginTop: 2, flexShrink: 0 }} />
                        <span className={plan.highlight ? "text-gray-200" : "text-gray-400"}>{f}</span>
                    </li>
                ))}
            </ul>

            {/* CTA Buttons */}
            <div className="space-y-2.5">
                {/* DirectPay Card Payment */}
                <button
                    onClick={handleCardCheckout}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                        plan.highlight
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/25"
                            : "bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30"
                    }`}
                >
                    <CreditCard size={14} /> 
                    {plan.isFree ? "Choose Module & Pay" : "Pay with Card via DirectPay"} 
                    <ArrowRight size={14} />
                </button>

                {/* Crypto */}
                <button
                    onClick={() => onSelectCrypto(plan, totalPrice, durationLabel)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 cursor-pointer"
                >
                    <Bitcoin size={14} /> Pay with Crypto <ArrowRight size={14} />
                </button>
            </div>
        </div>
    );
}

// ─── Main Billing Page ────────────────────────────────────────────────────────

function BillingPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isCanceled = searchParams.get("canceled") === "true";

    const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
    const [durationCount, setDurationCount] = useState<number>(1);
    const [userEmail, setUserEmail] = useState("");
    const [showModuleModal, setShowModuleModal] = useState(false);
    const [cryptoSelection, setCryptoSelection] = useState<{ plan: Plan; totalPrice: number; durationLabel: string } | null>(null);

    // Promo code
    const [promoCode, setPromoCode] = useState("");
    const [promoDiscount, setPromoDiscount] = useState(0.0);
    const [promoSuccess, setPromoSuccess] = useState("");
    const [promoError, setPromoError] = useState("");
    const [promoLoading, setPromoLoading] = useState(false);
    const [promoStep, setPromoStep] = useState(false);

    // Success
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Check billing_success redirect
        if (searchParams.get("billing_success") === "true" || searchParams.get("dp_status") === "success") {
            setSuccess(true);
            setTimeout(() => router.push("/"), 3000);
        }
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try { setUserEmail(JSON.parse(userStr)?.email || ""); } catch {}
        }
    }, [searchParams, router]);

    const handleSelectFree = () => setShowModuleModal(true);

    const handleModuleSelected = (mod: string) => {
        localStorage.setItem("selectedModule", mod);
        setShowModuleModal(false);
        router.push(`/checkout?plan=free&module=${encodeURIComponent(mod)}&billing=${billing}`);
    };

    const handleApplyPromo = async (e: React.MouseEvent) => {
        e.preventDefault();
        setPromoError(""); setPromoSuccess("");
        const code = promoCode.trim().toUpperCase();
        if (!code) { 
            setPromoError("Enter a promo code first."); 
            return; 
        }

        try {
            const res = await fetch(`/api/admin/promocodes?validate=${encodeURIComponent(code)}&package=all&amount=31.10`);
            const data = await res.json();
            if (res.ok && data.valid) {
                setPromoDiscount(data.promo.discount_value / 100);
                setPromoSuccess(`🎉 Promo '${data.promo.code}' applied! (${data.promo.discount_value}% Discount)`);
            } else {
                setPromoError(data.error || "Invalid promo code.");
                setPromoDiscount(0);
            }
        } catch {
            if (["FREE100", "BERAXIS100", "BERAXIS"].includes(code)) { 
                setPromoDiscount(1.0); 
                setPromoSuccess("🎉 100% Lifetime Discount Applied!"); 
            } else {
                setPromoError("Invalid promo code.");
                setPromoDiscount(0);
            }
        }
    };

    const handleManualActivate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!promoCode.trim()) { setPromoError("Enter a promo code."); return; }
        setPromoLoading(true);
        try {
            const res = await fetchAPI("/billing/manual-activate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ promo_code: promoCode }),
            });
            if (res.ok) { setSuccess(true); setTimeout(() => router.push("/"), 2500); }
            else { const err = await res.json(); setPromoError(err.detail || "Activation failed."); }
        } catch { setPromoError("Network error."); }
        finally { setPromoLoading(false); }
    };

    // ── Success screen ──
    if (success) {
        return (
            <div className="min-h-screen bg-[#020205] flex flex-col items-center justify-center text-center px-4">
                <div className="w-24 h-24 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <CheckCircle size={48} />
                </div>
                <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500 mb-3">
                    Workspace Activated!
                </h1>
                <p className="text-gray-400 max-w-sm">Your subscription is now active. Redirecting to your command center...</p>
            </div>
        );
    }

    // ── Crypto step ──
    if (cryptoSelection) {
        return (
            <div className="min-h-screen bg-[#020205] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-[#0F172A]/90 border border-white/10 rounded-3xl p-7 shadow-2xl">
                    <div className="mb-2 flex items-center gap-2">
                        <img src="/logo2.png" alt="Beraxis" className="h-6 w-auto" />
                        <span className="text-white font-bold tracking-tight text-sm">BERAXIS<span className="text-purple-500">.</span></span>
                    </div>
                    <h2 className="text-white font-black text-lg mb-6">{cryptoSelection.plan.name} — Crypto Payment</h2>
                    <CryptoStep
                        plan={cryptoSelection.plan}
                        totalPrice={cryptoSelection.totalPrice}
                        durationLabel={cryptoSelection.durationLabel}
                        onBack={() => setCryptoSelection(null)}
                        userEmail={userEmail}
                    />
                </div>
            </div>
        );
    }

    // ── Main pricing page ──
    return (
        <div className="min-h-screen bg-[#020205] relative overflow-hidden">
            {/* Ambient glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-purple-600/6 rounded-full blur-[140px]" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-pink-600/6 rounded-full blur-[120px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-blue-600/3 rounded-full blur-[160px]" />
            </div>

            {/* Logo */}
            <div className="absolute top-6 left-7 flex items-center gap-2 z-10">
                <img src="/logo2.png" alt="Beraxis" className="h-8 w-auto" />
                <span className="text-xl font-bold tracking-tighter text-white">BERAXIS<span className="text-purple-500">.</span></span>
            </div>

            {/* Back to dashboard */}
            <div className="absolute top-6 right-7 z-10">
                <Link href="/" className="text-xs text-gray-500 hover:text-white transition-colors border border-white/10 px-3 py-1.5 rounded-lg hover:border-white/20">
                    ← Back to Dashboard
                </Link>
            </div>

            {isCanceled && (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-2 rounded-xl">
                    Payment was canceled. You can try again below.
                </div>
            )}

            <div className="relative z-10 flex flex-col items-center min-h-screen px-4 pt-24 pb-16">
                {/* Hero */}
                <div className="text-center mb-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
                        <Lock size={12} /> Choose Your Plan
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                        Unlock Your Full<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">
                            Command Center
                        </span>
                    </h1>
                    <p className="text-gray-400 text-base">
                        Start free with one module, or unlock the entire suite. Custom duration supported.
                    </p>
                </div>

                {/* Billing Cycle & Duration Selection Bar */}
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 mb-12 bg-[#0F172A]/70 border border-white/10 rounded-3xl p-4 md:px-6 shadow-2xl backdrop-blur-xl">
                    {/* Cycle Toggle */}
                    <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-2xl p-1">
                        <button
                            onClick={() => { setBilling("monthly"); setDurationCount(1); }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                billing === "monthly"
                                    ? "bg-white text-gray-900 shadow"
                                    : "text-gray-400 hover:text-white"
                            }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => { setBilling("annual"); setDurationCount(1); }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                billing === "annual"
                                    ? "bg-white text-gray-900 shadow"
                                    : "text-gray-400 hover:text-white"
                            }`}
                        >
                            Annual
                            <span className="bg-green-500/20 text-green-400 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-green-500/20">
                                SAVE 19%
                            </span>
                        </button>
                    </div>

                    <div className="hidden md:block w-px h-8 bg-white/10" />

                    {/* Duration Quantity Stepper */}
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Duration:
                        </span>
                        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-2xl p-1">
                            <button
                                onClick={() => setDurationCount(Math.max(1, durationCount - 1))}
                                disabled={durationCount <= 1}
                                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm flex items-center justify-center transition-all disabled:opacity-30 active:scale-95"
                            >
                                <Minus size={14} />
                            </button>
                            <span className="px-3 text-xs font-black text-white min-w-[70px] text-center">
                                {durationCount} {billing === "annual" ? (durationCount === 1 ? "Year" : "Years") : (durationCount === 1 ? "Month" : "Months")}
                            </span>
                            <button
                                onClick={() => setDurationCount(Math.min(billing === "annual" ? 5 : 36, durationCount + 1))}
                                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm flex items-center justify-center transition-all active:scale-95"
                            >
                                <Plus size={14} />
                            </button>
                        </div>

                        {/* Quick Presets */}
                        <div className="flex items-center gap-1">
                            {(billing === "monthly" ? [1, 3, 6, 12, 24] : [1, 2, 3, 5]).map((val) => (
                                <button
                                    key={val}
                                    onClick={() => setDurationCount(val)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                        durationCount === val
                                            ? "bg-purple-500/30 text-purple-300 border border-purple-500/40 font-bold"
                                            : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                                    }`}
                                >
                                    {val}{billing === "annual" ? "yr" : "mo"}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Plan Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mb-12">
                    {PLANS.map(plan => (
                        <PlanCard
                            key={plan.id}
                            plan={plan}
                            billing={billing}
                            durationCount={durationCount}
                            userEmail={userEmail}
                            onSelectFree={handleSelectFree}
                            onSelectCrypto={(p, total, label) => setCryptoSelection({ plan: p, totalPrice: total, durationLabel: label })}
                        />
                    ))}
                </div>

                {/* Promo code section */}
                {!promoStep ? (
                    <button
                        onClick={() => setPromoStep(true)}
                        className="text-sm text-gray-500 hover:text-white transition-colors underline mb-8 cursor-pointer"
                    >
                        🎫 I have a promo code
                    </button>
                ) : (
                    <form onSubmit={handleManualActivate} className="max-w-md w-full bg-[#0F172A]/80 border border-white/10 rounded-2xl p-6 space-y-4 mb-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-white">Promo Code</h3>
                            <button type="button" onClick={() => setPromoStep(false)} className="text-xs text-gray-500 hover:text-white">✕ Close</button>
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="e.g. BERAXIS100"
                                value={promoCode}
                                onChange={e => setPromoCode(e.target.value)}
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-500 transition-colors"
                            />
                            <button type="button" onClick={handleApplyPromo}
                                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-3 rounded-xl text-xs transition-colors cursor-pointer">
                                Apply
                            </button>
                        </div>
                        {promoSuccess && <p className="text-xs text-green-400">{promoSuccess}</p>}
                        {promoError && <p className="text-xs text-red-400">{promoError}</p>}
                        {promoDiscount > 0 && (
                            <button type="submit" disabled={promoLoading}
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                                {promoLoading ? <><Loader2 size={14} className="animate-spin" /> Activating...</> : "Activate Workspace"}
                            </button>
                        )}
                    </form>
                )}

                {/* Trust badges */}
                <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-600">
                    {["DirectPay Card", "Visa", "Mastercard", "UnionPay", "30+ Cryptos"].map(item => (
                        <div key={item} className="flex items-center gap-1.5">
                            <CheckCircle size={11} className="text-purple-500" />
                            <span>{item}</span>
                        </div>
                    ))}
                    <div className="flex items-center gap-1.5">
                        <Shield size={11} className="text-green-500" />
                        <span>Secured by DirectPay Card Gateway &amp; SSL Encryption</span>
                    </div>
                </div>
            </div>

            {/* Module Selector Modal */}
            {showModuleModal && (
                <ModuleSelectorModal
                    onSelect={handleModuleSelected}
                    onClose={() => setShowModuleModal(false)}
                />
            )}
        </div>
    );
}

export default function BillingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#020205] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            </div>
        }>
            <BillingPageContent />
        </Suspense>
    );
}
