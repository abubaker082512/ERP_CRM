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
    freemiusPlanId: string;
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
        freemiusPlanId: "51030",
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
        freemiusPlanId: "51032",
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
        freemiusPlanId: "51034",
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
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <div>
                        <h2 className="text-xl font-black text-white">Choose Your Free Module</h2>
                        <p className="text-sm text-gray-400 mt-1">Select 1 module to use forever, free. You can upgrade anytime.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5">
                        <X size={20} />
                    </button>
                </div>

                {/* Module Grid */}
                <div className="p-6 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2 max-h-80 overflow-y-auto">
                    {ALL_MODULES.map((mod) => (
                        <button
                            key={mod}
                            onClick={() => setSelected(mod)}
                            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all text-xs font-medium gap-1 ${
                                selected === mod
                                    ? "border-purple-500 bg-purple-500/20 text-white shadow-lg shadow-purple-500/20 scale-105"
                                    : "border-white/8 bg-white/3 text-gray-400 hover:bg-white/8 hover:text-white hover:border-white/20"
                            }`}
                        >
                            {selected === mod && (
                                <Check size={12} className="text-purple-400" />
                            )}
                            <span className="leading-tight">{mod}</span>
                        </button>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-6 pt-3 border-t border-white/5 flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-gray-400 hover:text-white transition-colors text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={!selected}
                        onClick={() => selected && onSelect(selected)}
                        className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {selected ? (
                            <>Start Free with {selected} <ArrowRight size={14} /></>
                        ) : (
                            "Select a module first"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Crypto Selector ─────────────────────────────────────────────────────────

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
    const [selected, setSelected] = useState("BTC");
    const [loading, setLoading] = useState(false);
    const [invoiceUrl, setInvoiceUrl] = useState("");
    const [txnId, setTxnId] = useState("");
    const [orderNumber, setOrderNumber] = useState("");
    const [copyFeedback, setCopyFeedback] = useState(false);
    const router = useRouter();

    const handleCreate = async () => {
        setLoading(true);
        try {
            const res = await fetchAPI("/billing/create-invoice", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    plan_name: plan.cryptoPlanKey,
                    currency: selected,
                    amount_usd: totalPrice
                }),
            });
            const data = await res.json();
            if (res.ok && data.invoice_url) {
                setInvoiceUrl(data.invoice_url);
                setTxnId(data.txn_id || "");
                setOrderNumber(data.order_number || "");
                if (data.mock) router.push(data.invoice_url);
            } else {
                alert(data.detail || "Failed to create payment. Try again.");
            }
        } catch { alert("Network error. Please try again."); }
        finally { setLoading(false); }
    };

    if (invoiceUrl && !loading) {
        return (
            <div className="space-y-4">
                <button onClick={onBack} className="text-xs text-gray-500 hover:text-white transition-colors">← Back</button>
                <div className="bg-[#0F172A]/90 border border-white/10 rounded-2xl p-6 space-y-3">
                    <h3 className="font-bold text-white">Complete Your Payment</h3>
                    {[
                        ["Plan", plan.name],
                        ["Duration", durationLabel],
                        ["Total Amount", `$${totalPrice.toFixed(2)}`],
                        ["Currency", selected],
                        orderNumber && ["Order #", orderNumber],
                        txnId && ["Txn ID", txnId.slice(0, 20) + "..."],
                    ].filter(Boolean).map(([k, v]: any) => (
                        <div key={k} className="flex justify-between text-sm border-b border-white/5 pb-2">
                            <span className="text-gray-400">{k}</span>
                            <span className="text-white font-medium">{v}</span>
                        </div>
                    ))}
                    <a href={invoiceUrl} target="_blank" rel="noopener noreferrer"
                       className="w-full mt-3 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 rounded-xl transition-all text-sm">
                        Pay on Plisio <ExternalLink size={14} />
                    </a>
                    {txnId && (
                        <button onClick={() => { navigator.clipboard.writeText(txnId); setCopyFeedback(true); setTimeout(() => setCopyFeedback(false), 2000); }}
                                className="w-full flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-white transition-colors">
                            {copyFeedback ? <><CheckCircle size={12} /> Copied!</> : <><Copy size={12} /> Copy Transaction ID</>}
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Select Crypto Currency</h3>
                <button onClick={onBack} className="text-xs text-gray-500 hover:text-white transition-colors">← Back</button>
            </div>
            <div className="bg-purple-500/5 border border-purple-500/15 p-3 rounded-xl flex justify-between items-center">
                <span className="text-xs text-gray-400">Total ({durationLabel})</span>
                <span className="text-xl font-black text-white">${totalPrice.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
                {CRYPTO_CURRENCIES.map(coin => (
                    <button key={coin.id} onClick={() => setSelected(coin.id)}
                            className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-left ${
                                selected === coin.id
                                    ? "border-purple-500/60 bg-purple-500/10"
                                    : "border-white/8 bg-white/3 hover:bg-white/6"
                            }`}>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0"
                             style={{ background: `${coin.color}20`, border: `1px solid ${coin.color}30` }}>
                            <span style={{ color: coin.color }}>{coin.emoji}</span>
                        </div>
                        <div>
                            <div className="text-white text-xs font-bold">{coin.id}</div>
                            <div className="text-gray-500 text-[10px]">{coin.name}</div>
                        </div>
                        {selected === coin.id && <CheckCircle className="text-purple-400 ml-auto" size={12} />}
                    </button>
                ))}
            </div>
            <button onClick={handleCreate} disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3.5 rounded-xl transition-all text-sm disabled:opacity-60">
                {loading ? <><Loader2 size={14} className="animate-spin" /> Creating Invoice...</> : <>Proceed to Payment <ArrowRight size={14} /></>}
            </button>
        </div>
    );
}

// ─── Plan Card ────────────────────────────────────────────────────────────────

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
    const monthlyRate = billing === "annual" ? plan.annualPrice : plan.monthlyPrice;
    const monthsTotal = billing === "annual" ? durationCount * 12 : durationCount;
    const totalPrice = monthlyRate * monthsTotal;
    const durationLabel = billing === "annual"
        ? `${durationCount} ${durationCount === 1 ? 'Year' : 'Years'}`
        : `${durationCount} ${durationCount === 1 ? 'Month' : 'Months'}`;

    const freemiusUrl = `https://checkout.freemius.com/product/31108/plan/${plan.freemiusPlanId}/?user_email=${encodeURIComponent(userEmail)}&billing_cycle=${billing === "annual" ? "annual" : "monthly"}&readonly_user=true`;

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
                {/* Card / PayPal */}
                {plan.isFree ? (
                    <button
                        onClick={onSelectFree}
                        className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
                            plan.highlight
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25"
                                : "bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/20"
                        }`}
                    >
                        <CreditCard size={14} /> Choose Module & Pay <ArrowRight size={14} />
                    </button>
                ) : (
                    <a
                        href={freemiusUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
                            plan.highlight
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25"
                                : "bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/20"
                        }`}
                    >
                        <CreditCard size={14} /> Pay with Card / PayPal <ExternalLink size={12} />
                    </a>
                )}

                {/* Crypto */}
                <button
                    onClick={() => onSelectCrypto(plan, totalPrice, durationLabel)}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
                        plan.highlight
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/25"
                            : "bg-purple-600/15 hover:bg-purple-600/25 text-purple-400 border border-purple-500/20"
                    }`}
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
        // Check billing_success from Freemius/Plisio redirect
        if (searchParams.get("billing_success") === "true") {
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
        const plan = PLANS.find(p => p.isFree)!;
        const url = `https://checkout.freemius.com/product/31108/plan/${plan.freemiusPlanId}/?user_email=${encodeURIComponent(userEmail)}&billing_cycle=${billing === "annual" ? "annual" : "monthly"}&readonly_user=true`;
        window.open(url, "_blank");
    };

    const handleApplyPromo = (e: React.MouseEvent) => {
        e.preventDefault();
        setPromoError(""); setPromoSuccess("");
        const code = promoCode.trim().toUpperCase();
        if (["FREE100", "BERAXIS100", "BERAXIS"].includes(code)) { setPromoDiscount(1.0); setPromoSuccess("🎉 100% Discount Applied!"); }
        else if (code === "LAUNCH50") { setPromoDiscount(0.5); setPromoSuccess("🎉 50% off applied!"); }
        else if (code === "LAUNCH20") { setPromoDiscount(0.2); setPromoSuccess("🎉 20% off applied!"); }
        else if (!code) { setPromoError("Enter a promo code first."); }
        else { setPromoError("Invalid promo code."); setPromoDiscount(0); }
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
                        className="text-sm text-gray-500 hover:text-white transition-colors underline mb-8"
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
                                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-3 rounded-xl text-xs transition-colors">
                                Apply
                            </button>
                        </div>
                        {promoSuccess && <p className="text-xs text-green-400">{promoSuccess}</p>}
                        {promoError && <p className="text-xs text-red-400">{promoError}</p>}
                        {promoDiscount > 0 && (
                            <button type="submit" disabled={promoLoading}
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                                {promoLoading ? <><Loader2 size={14} className="animate-spin" /> Activating...</> : "Activate Workspace"}
                            </button>
                        )}
                    </form>
                )}

                {/* Trust badges */}
                <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-600">
                    {["Bitcoin", "Ethereum", "USDT", "30+ Cryptos", "Visa / Mastercard", "PayPal"].map(item => (
                        <div key={item} className="flex items-center gap-1.5">
                            <CheckCircle size={11} className="text-purple-500" />
                            <span>{item}</span>
                        </div>
                    ))}
                    <div className="flex items-center gap-1.5">
                        <Shield size={11} className="text-green-500" />
                        <span>Secured by Freemius &amp; Plisio</span>
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
