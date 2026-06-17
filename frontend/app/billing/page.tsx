"use client";

import { CheckCircle, Lock, Zap, Shield, ArrowRight, Loader2, Copy, ExternalLink, Bitcoin, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';

// Supported crypto currencies
const CRYPTO_CURRENCIES = [
    { id: "BTC",  name: "Bitcoin",    symbol: "BTC",  color: "#F7931A", emoji: "₿" },
    { id: "ETH",  name: "Ethereum",   symbol: "ETH",  color: "#627EEA", emoji: "Ξ" },
    { id: "LTC",  name: "Litecoin",   symbol: "LTC",  color: "#A6A9AA", emoji: "Ł" },
    { id: "USDT", name: "Tether",     symbol: "USDT", color: "#26A17B", emoji: "₮" },
    { id: "USDC", name: "USD Coin",   symbol: "USDC", color: "#2775CA", emoji: "◎" },
    { id: "BNB",  name: "BNB",        symbol: "BNB",  color: "#F3BA2F", emoji: "◈" },
    { id: "TRX",  name: "TRON",       symbol: "TRX",  color: "#FF0013", emoji: "◈" },
    { id: "DOGE", name: "Dogecoin",   symbol: "DOGE", color: "#C2A633", emoji: "Ð" },
];

const PLAN_FEATURES = [
    "Unlimited user seats & department workspaces",
    "Full Suite access: CRM, MRP, Accounting, Payroll",
    "Antigravity AI Brain + Voice Command Center",
    "24/7 Phone & WhatsApp Support Hotline",
    "Priority data pipeline & real-time sync",
    "Advanced analytics & custom reporting",
];

function BillingPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isCanceled = searchParams.get("canceled") === "true";

    // Flow states
    const [step, setStep] = useState<"plan" | "crypto" | "freemius" | "promo" | "pending" | "success">("plan");
    const [loading, setLoading] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState("BTC");
    const [invoiceUrl, setInvoiceUrl] = useState("");
    const [txnId, setTxnId] = useState("");
    const [orderNumber, setOrderNumber] = useState("");
    const [copyFeedback, setCopyFeedback] = useState(false);
    const [userEmail, setUserEmail] = useState("");

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user && user.email) {
                    setUserEmail(user.email);
                }
            } catch (e) {
                console.error("Error parsing user from localStorage:", e);
            }
        }
    }, []);

    // Promo code states
    const [promoCode, setPromoCode] = useState("");
    const [promoDiscount, setPromoDiscount] = useState(0.0);
    const [promoSuccess, setPromoSuccess] = useState("");
    const [promoError, setPromoError] = useState("");
    const [promoLoading, setPromoLoading] = useState(false);

    const planPrice = 199.00;
    const discountedPrice = planPrice * (1 - promoDiscount);

    const handleApplyPromo = (e: React.MouseEvent) => {
        e.preventDefault();
        setPromoError("");
        setPromoSuccess("");
        const code = promoCode.trim().toUpperCase();
        if (["FREE100", "BERAXIS100", "BERAXIS"].includes(code)) {
            setPromoDiscount(1.0);
            setPromoSuccess("🎉 100% Discount Applied! Plan is now free.");
        } else if (code === "LAUNCH50") {
            setPromoDiscount(0.5);
            setPromoSuccess("🎉 50% Discount Applied!");
        } else if (code === "LAUNCH20") {
            setPromoDiscount(0.2);
            setPromoSuccess("🎉 20% Discount Applied!");
        } else if (code === "") {
            setPromoError("Please enter a promo code first.");
        } else {
            setPromoError("Invalid promo code.");
            setPromoDiscount(0.0);
        }
    };

    const handleManualActivate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!promoCode.trim()) {
            setPromoError("Please enter a valid promo code for free activation.");
            return;
        }
        setPromoLoading(true);
        try {
            const res = await fetchAPI("/billing/manual-activate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ promo_code: promoCode })
            });
            if (res.ok) {
                setStep("success");
                setTimeout(() => router.push("/dashboard"), 2500);
            } else {
                const err = await res.json();
                setPromoError(err.detail || "Activation failed.");
            }
        } catch {
            setPromoError("An error occurred. Please try again.");
        } finally {
            setPromoLoading(false);
        }
    };

    const handleCreateCryptoInvoice = async () => {
        setLoading(true);
        try {
            const res = await fetchAPI("/billing/create-invoice", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    plan_name: "pro",
                    currency: selectedCurrency
                })
            });
            const data = await res.json();

            if (res.ok && data.invoice_url) {
                setInvoiceUrl(data.invoice_url);
                setTxnId(data.txn_id || "");
                setOrderNumber(data.order_number || "");

                if (data.mock) {
                    // Development mode - redirect directly
                    router.push(data.invoice_url);
                } else {
                    setStep("pending");
                }
            } else {
                alert(data.detail || "Failed to create payment invoice. Please try again.");
            }
        } catch (error) {
            console.error("Invoice creation error:", error);
            alert("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const copyTxnId = () => {
        navigator.clipboard.writeText(txnId);
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
    };

    // ---- SUCCESS STATE ----
    if (step === "success") {
        return (
            <div className="min-h-screen bg-[#020205] flex flex-col items-center justify-center text-center px-4">
                <div className="relative">
                    <div className="w-28 h-28 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-6 animate-bounce">
                        <CheckCircle size={52} />
                    </div>
                    <div className="absolute inset-0 bg-green-500/10 rounded-full blur-2xl animate-pulse" />
                </div>
                <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500 mb-4 mt-4">
                    Workspace Activated!
                </h1>
                <p className="text-gray-400 text-lg max-w-md mb-4">
                    Your subscription is now active. All 28 modules are being unlocked. Redirecting to your command center...
                </p>
                <div className="flex gap-1 mt-2">
                    {[0, 1, 2].map(i => (
                        <div key={i} className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                </div>
            </div>
        );
    }

    // ---- PENDING PAYMENT STATE ----
    if (step === "pending") {
        const selectedCoin = CRYPTO_CURRENCIES.find(c => c.id === selectedCurrency);
        return (
            <div className="min-h-screen bg-[#020205] flex flex-col items-center justify-center p-4">
                <div className="max-w-lg w-full">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: `${selectedCoin?.color}20`, border: `1px solid ${selectedCoin?.color}40` }}>
                            <span className="text-3xl">{selectedCoin?.emoji}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Complete Your Payment</h1>
                        <p className="text-gray-400 text-sm">Pay with {selectedCoin?.name} on Plisio's secure payment page</p>
                    </div>

                    {/* Invoice Card */}
                    <div className="bg-[#0F172A]/90 border border-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-2xl space-y-4">
                        {/* Amount */}
                        <div className="flex items-center justify-between py-3 border-b border-white/5">
                            <span className="text-gray-400 text-sm">Plan</span>
                            <span className="text-white font-semibold">Pro Enterprise</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-white/5">
                            <span className="text-gray-400 text-sm">Amount (USD)</span>
                            <span className="text-white font-bold text-lg">${planPrice.toFixed(2)}/mo</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-white/5">
                            <span className="text-gray-400 text-sm">Payment Currency</span>
                            <span className="font-bold" style={{ color: selectedCoin?.color }}>{selectedCoin?.emoji} {selectedCoin?.name}</span>
                        </div>
                        {orderNumber && (
                            <div className="flex items-center justify-between py-3 border-b border-white/5">
                                <span className="text-gray-400 text-sm">Order #</span>
                                <span className="text-white font-mono text-sm">{orderNumber}</span>
                            </div>
                        )}
                        {txnId && (
                            <div className="flex items-center justify-between py-3">
                                <span className="text-gray-400 text-sm">Transaction ID</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-white font-mono text-xs truncate max-w-[140px]">{txnId}</span>
                                    <button onClick={copyTxnId} className="text-purple-400 hover:text-purple-300 transition-colors">
                                        {copyFeedback ? <CheckCircle size={14} /> : <Copy size={14} />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* CTA */}
                        <a
                            href={invoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-purple-500/25 text-sm active:scale-95"
                        >
                            Pay Now on Plisio
                            <ExternalLink size={16} />
                        </a>

                        <p className="text-xs text-gray-500 text-center pt-1">
                            After payment, your workspace will be activated automatically. <br />
                            Keep your Transaction ID for reference.
                        </p>
                    </div>

                    {/* Bottom links */}
                    <div className="flex justify-center gap-6 mt-6">
                        <button onClick={() => setStep("crypto")} className="text-xs text-gray-500 hover:text-white transition-colors underline">
                            Change Currency
                        </button>
                        <Link href="/login" className="text-xs text-gray-500 hover:text-white transition-colors underline">
                            Log out
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ---- MAIN BILLING PAGE ----
    return (
        <div className="min-h-screen bg-[#020205] relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/8 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-pink-600/8 rounded-full blur-[120px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/4 rounded-full blur-[150px]" />
            </div>

            {/* Logo Header */}
            <div className="absolute top-8 left-8 flex items-center gap-2 z-10">
                <img src="/logo2.png" alt="Beraxis Logo" className="h-8 w-auto" />
                <span className="text-xl font-bold tracking-tighter text-white">
                    BERAXIS<span className="text-purple-500">.</span>
                </span>
            </div>

            {/* Error banner if canceled */}
            {isCanceled && (
                <div className="absolute top-8 right-8 bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-2 rounded-xl z-10">
                    Payment was canceled. You can try again below.
                </div>
            )}

            <div className="flex flex-col items-center justify-center min-h-screen p-4 pt-20 pb-12 relative z-10">
                <div className="max-w-5xl w-full">

                    {/* Hero Text */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
                            <Lock size={12} />
                            Trial Expired
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                            Unlock Your Full<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">
                                Command Center
                            </span>
                        </h1>
                        <p className="text-gray-400 text-base max-w-xl mx-auto">
                            Your 7-day trial has concluded. Upgrade to Pro Enterprise to keep all 28 modules active and unlock the full Beraxis suite.
                        </p>
                    </div>

                    {/* Main Card */}
                    <div className="flex flex-col lg:flex-row gap-6 items-start">

                        {/* Left: Features list */}
                        <div className="flex-1 bg-[#0F172A]/60 border border-white/8 backdrop-blur-xl rounded-3xl p-8">
                            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <Zap className="text-purple-400" size={18} />
                                Pro Enterprise includes
                            </h2>
                            <div className="space-y-4">
                                {PLAN_FEATURES.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="mt-0.5 w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                                            <CheckCircle className="text-purple-400" size={12} />
                                        </div>
                                        <span className="text-gray-300 text-sm leading-relaxed">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Security badge */}
                            <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-3">
                                <Shield className="text-green-400 shrink-0" size={16} />
                                <p className="text-xs text-gray-500">
                                    Payments processed by <span className="text-white font-medium">Plisio</span> — secure, decentralized crypto payment gateway supporting 30+ cryptocurrencies.
                                </p>
                            </div>
                        </div>

                        {/* Right: Payment panel */}
                        <div className="w-full lg:w-[420px] space-y-4">

                            {/* --- CRYPTO PAYMENT FLOW --- */}
                            {step === "plan" && (
                                <div className="bg-gradient-to-b from-purple-950/30 to-[#0F172A]/80 border border-purple-500/20 backdrop-blur-xl rounded-3xl p-7 shadow-2xl">
                                    <div className="text-center mb-6">
                                        <span className="text-[10px] bg-purple-500/10 text-purple-400 font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-purple-500/20">
                                            Pro Enterprise
                                        </span>
                                        <div className="flex items-baseline justify-center gap-1 mt-5 mb-2">
                                            <span className="text-6xl font-black text-white">${planPrice.toFixed(0)}</span>
                                            <span className="text-gray-500 text-sm">/ month</span>
                                        </div>
                                        <p className="text-xs text-gray-500">Billed monthly. Cancel anytime.</p>
                                    </div>

                                    <div className="space-y-3">
                                        <button
                                            onClick={() => setStep("freemius")}
                                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg shadow-blue-500/25 active:scale-95 text-sm"
                                        >
                                            <CreditCard size={16} />
                                            Pay with Card / PayPal
                                            <ArrowRight size={16} />
                                        </button>
                                        <button
                                            onClick={() => setStep("crypto")}
                                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg shadow-purple-500/25 active:scale-95 text-sm"
                                        >
                                            <Bitcoin size={16} />
                                            Pay with Cryptocurrency
                                            <ArrowRight size={16} />
                                        </button>
                                        <button
                                            onClick={() => setStep("promo")}
                                            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-medium py-3 px-4 rounded-xl transition-all text-sm"
                                        >
                                            I have a promo code
                                        </button>
                                        <div className="text-center">
                                            <Link href="/login" className="text-xs text-gray-500 hover:text-white transition-colors underline">
                                                Log out or Switch Workspace
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- CARD / PAYPAL (FREEMIUS) FLOW --- */}
                            {step === "freemius" && (
                                <div className="bg-[#0F172A]/90 border border-white/10 backdrop-blur-xl rounded-3xl p-7 shadow-2xl space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Choose Card / PayPal Plan</h3>
                                        <button onClick={() => setStep("plan")} className="text-xs text-gray-500 hover:text-white transition-colors">
                                            ← Back
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Plan 1: One App Free */}
                                        <div className="border border-white/5 bg-white/3 p-4 rounded-2xl hover:border-blue-500/30 transition-all flex flex-col justify-between">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="text-white text-sm font-bold">One App Free</h4>
                                                    <p className="text-gray-400 text-[10px] mt-1">Unlock 1 ERP/CRM module of choice</p>
                                                </div>
                                                <div className="text-right flex flex-col items-end">
                                                    <span className="text-white font-black text-lg">$2.99</span>
                                                    <span className="text-gray-500 text-[10px]">/mo</span>
                                                </div>
                                            </div>
                                            <a
                                                href={`https://checkout.freemius.com/product/31108/plan/51030/?user_email=${encodeURIComponent(userEmail)}&readonly_user=true`}
                                                className="w-full mt-2 text-center bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 font-bold py-2 px-3 rounded-lg text-xs transition-all flex items-center justify-center gap-1"
                                            >
                                                Checkout
                                                <ExternalLink size={12} />
                                            </a>
                                        </div>

                                        {/* Plan 2: Standard (Recommended) */}
                                        <div className="border border-blue-500/20 bg-blue-500/5 p-4 rounded-2xl hover:border-blue-500/40 transition-all flex flex-col justify-between relative overflow-hidden">
                                            <div className="absolute top-0 right-0 bg-blue-600 text-white text-[8px] font-extrabold uppercase px-2.5 py-0.5 rounded-bl-lg">
                                                Recommended
                                            </div>
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="text-white text-sm font-bold">Standard</h4>
                                                    <p className="text-gray-400 text-[10px] mt-1">Unlock all 28 integrated modules</p>
                                                </div>
                                                <div className="text-right flex flex-col items-end">
                                                    <span className="text-white font-black text-lg">$31.10</span>
                                                    <span className="text-gray-500 text-[10px]">/mo</span>
                                                </div>
                                            </div>
                                            <a
                                                href={`https://checkout.freemius.com/product/31108/plan/51032/?user_email=${encodeURIComponent(userEmail)}&readonly_user=true`}
                                                className="w-full mt-2 text-center bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-3 rounded-lg text-xs transition-all flex items-center justify-center gap-1 shadow-lg shadow-blue-600/20"
                                            >
                                                Checkout Standard
                                                <ExternalLink size={12} />
                                            </a>
                                        </div>

                                        {/* Plan 3: Premium */}
                                        <div className="border border-white/5 bg-white/3 p-4 rounded-2xl hover:border-blue-500/30 transition-all flex flex-col justify-between">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="text-white text-sm font-bold">Premium</h4>
                                                    <p className="text-gray-400 text-[10px] mt-1">Multi-company management</p>
                                                </div>
                                                <div className="text-right flex flex-col items-end">
                                                    <span className="text-white font-black text-lg">$46.80</span>
                                                    <span className="text-gray-500 text-[10px]">/mo</span>
                                                </div>
                                            </div>
                                            <a
                                                href={`https://checkout.freemius.com/product/31108/plan/51034/?user_email=${encodeURIComponent(userEmail)}&readonly_user=true`}
                                                className="w-full mt-2 text-center bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 font-bold py-2 px-3 rounded-lg text-xs transition-all flex items-center justify-center gap-1"
                                            >
                                                Checkout Premium
                                                <ExternalLink size={12} />
                                            </a>
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-gray-500 text-center">
                                        Securely processed by Freemius.
                                    </p>
                                </div>
                            )}

                            {/* --- CRYPTO CURRENCY SELECTOR --- */}
                            {step === "crypto" && (
                                <div className="bg-[#0F172A]/90 border border-white/10 backdrop-blur-xl rounded-3xl p-7 shadow-2xl">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Select Currency</h3>
                                        <button onClick={() => setStep("plan")} className="text-xs text-gray-500 hover:text-white transition-colors">
                                            ← Back
                                        </button>
                                    </div>

                                    {/* Amount summary */}
                                    <div className="bg-purple-500/5 border border-purple-500/15 p-3.5 rounded-xl flex justify-between items-center mb-5">
                                        <span className="text-xs font-semibold text-gray-400">Total (USD)</span>
                                        <span className="text-xl font-black text-white">${planPrice.toFixed(2)}</span>
                                    </div>

                                    {/* Currency grid */}
                                    <div className="grid grid-cols-2 gap-2.5 mb-6">
                                        {CRYPTO_CURRENCIES.map(coin => (
                                            <button
                                                key={coin.id}
                                                onClick={() => setSelectedCurrency(coin.id)}
                                                className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all text-left ${
                                                    selectedCurrency === coin.id
                                                        ? "border-purple-500/60 bg-purple-500/10 shadow-md shadow-purple-500/10"
                                                        : "border-white/8 bg-white/3 hover:bg-white/6"
                                                }`}
                                            >
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0"
                                                    style={{ background: `${coin.color}20`, border: `1px solid ${coin.color}30` }}>
                                                    <span style={{ color: coin.color }}>{coin.emoji}</span>
                                                </div>
                                                <div>
                                                    <div className="text-white text-xs font-bold">{coin.symbol}</div>
                                                    <div className="text-gray-500 text-[10px]">{coin.name}</div>
                                                </div>
                                                {selectedCurrency === coin.id && (
                                                    <CheckCircle className="text-purple-400 ml-auto shrink-0" size={14} />
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={handleCreateCryptoInvoice}
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg shadow-purple-500/25 active:scale-95 text-sm disabled:opacity-60"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Creating Invoice...
                                            </>
                                        ) : (
                                            <>
                                                Proceed to Payment
                                                <ArrowRight size={16} />
                                            </>
                                        )}
                                    </button>

                                    <p className="text-[10px] text-gray-500 text-center mt-3">
                                        You'll be redirected to Plisio's secure checkout page
                                    </p>
                                </div>
                            )}

                            {/* --- PROMO CODE / FREE ACTIVATION --- */}
                            {step === "promo" && (
                                <form onSubmit={handleManualActivate} className="bg-[#0F172A]/90 border border-white/10 backdrop-blur-xl rounded-3xl p-7 shadow-2xl space-y-5">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Promo Code</h3>
                                        <button type="button" onClick={() => setStep("plan")} className="text-xs text-gray-500 hover:text-white transition-colors">
                                            ← Back
                                        </button>
                                    </div>

                                    {/* Price display */}
                                    <div className="bg-purple-500/5 border border-purple-500/15 p-3.5 rounded-xl flex justify-between items-center">
                                        <span className="text-xs font-semibold text-gray-400">Amount:</span>
                                        <div className="flex items-center gap-2">
                                            {promoDiscount > 0 && (
                                                <span className="text-gray-500 line-through text-sm">${planPrice.toFixed(2)}</span>
                                            )}
                                            <span className={`text-xl font-black ${promoDiscount === 1.0 ? "text-green-400" : "text-white"}`}>
                                                {promoDiscount === 1.0 ? "FREE" : `$${discountedPrice.toFixed(2)}`}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Promo input */}
                                    <div className="space-y-2">
                                        <label className="block text-[10px] uppercase font-bold text-gray-500">Enter Promo Code</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="e.g. BERAXIS100"
                                                value={promoCode}
                                                onChange={e => setPromoCode(e.target.value)}
                                                className="flex-1 bg-[#0F172A]/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-500 transition-colors"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleApplyPromo}
                                                className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-3 rounded-xl text-xs transition-colors shrink-0"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                        {promoSuccess && <p className="text-xs text-green-400 font-medium">{promoSuccess}</p>}
                                        {promoError && <p className="text-xs text-red-400 font-medium">{promoError}</p>}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={promoLoading || !promoCode.trim()}
                                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg active:scale-95 text-sm disabled:opacity-50"
                                    >
                                        {promoLoading ? (
                                            <><Loader2 size={16} className="animate-spin" /> Activating...</>
                                        ) : (
                                            `Activate Workspace ${promoDiscount === 1.0 ? "(Free)" : promoDiscount > 0 ? `($${discountedPrice.toFixed(2)})` : ""}`
                                        )}
                                    </button>

                                    <p className="text-[10px] text-gray-500 text-center">
                                        Or{" "}
                                        <button type="button" onClick={() => setStep("crypto")} className="text-purple-400 hover:text-purple-300 underline">
                                            pay with crypto
                                        </button>{" "}
                                        instead
                                    </p>
                                </form>
                            )}

                        </div>
                    </div>

                    {/* Trust indicators */}
                    <div className="flex flex-wrap items-center justify-center gap-6 mt-10">
                        {["Bitcoin", "Ethereum", "USDT", "Litecoin", "30+ Cryptos"].map((item, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                                <CheckCircle size={11} className="text-purple-500" />
                                <span>{item}</span>
                            </div>
                        ))}
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Shield size={11} className="text-green-500" />
                            <span>Secured by Plisio</span>
                        </div>
                    </div>
                </div>
            </div>
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
