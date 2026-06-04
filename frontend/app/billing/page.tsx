"use client";

import { CheckCircle, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { fetchAPI } from '@/lib/api';

export default function BillingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [success, setSuccess] = useState(false);

    // Promo code states
    const [promoCode, setPromoCode] = useState("");
    const [discount, setDiscount] = useState(0.0);
    const [promoSuccess, setPromoSuccess] = useState("");
    const [promoError, setPromoError] = useState("");

    // Billing form states
    const [form, setForm] = useState({
        name: "",
        email: "",
        cardNumber: "",
        expiry: "",
        cvv: ""
    });

    const handleApplyPromo = (e: React.MouseEvent) => {
        e.preventDefault();
        setPromoError("");
        setPromoSuccess("");

        const code = promoCode.trim().toUpperCase();
        if (["FREE100", "BERAXIS100", "BERAXIS"].includes(code)) {
            setDiscount(1.0);
            setPromoSuccess("🎉 100% Discount Applied! Plan is now free.");
        } else if (code === "LAUNCH50") {
            setDiscount(0.5);
            setPromoSuccess("🎉 50% Discount Applied!");
        } else if (code === "LAUNCH20") {
            setDiscount(0.2);
            setPromoSuccess("🎉 20% Discount Applied!");
        } else if (code === "") {
            setPromoError("Please enter a promo code first.");
        } else {
            setPromoError("Invalid promo code. Please try another.");
            setDiscount(0.0);
        }
    };

    const handleManualCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetchAPI("/billing/manual-activate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    promo_code: promoCode,
                    card_name: form.name,
                    card_number: form.cardNumber
                })
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    router.push("/");
                }, 2000);
            } else {
                const errData = await res.json();
                alert(errData.detail || "Activation failed. Please check card details.");
            }
        } catch (error) {
            console.error("Manual checkout error:", error);
            alert("An error occurred during activation.");
        } finally {
            setLoading(false);
        }
    };

    const planPrice = 199.00;
    const currentPrice = planPrice * (1 - discount);

    if (success) {
        return (
            <div className="min-h-screen bg-[#020205] flex flex-col items-center justify-center text-center px-4">
                <div className="w-24 h-24 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <CheckCircle size={48} />
                </div>
                <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 mb-4">
                    Workspace Activated!
                </h1>
                <p className="text-gray-400 text-lg max-w-md mb-8">
                    Your manual payment has been processed successfully. Unlocking all 28 modules now. Redirecting you to command center...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020205] flex flex-col items-center justify-center p-4 relative font-sans overflow-y-auto">
            {/* Logo */}
            <div className="absolute top-8 left-8 flex items-center gap-2">
                <img src="/logo2.png" alt="Beraxis Logo" className="h-8 w-auto" />
                <span className="text-xl font-bold tracking-tighter text-white">BERAXIS<span className="text-purple-500">.</span></span>
            </div>

            <div className="max-w-4xl w-full flex flex-col md:flex-row gap-8 items-stretch bg-[#0F172A]/80 border border-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl mt-16 mb-8">
                
                {/* Left Side: Lock & Message */}
                <div className="flex-1 text-left space-y-6 flex flex-col justify-between">
                    <div>
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 mb-4">
                            <Lock size={28} />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4">
                            Trial Period <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500">Expired</span>
                        </h1>
                        <p className="text-gray-400 text-base leading-relaxed">
                            Your 7-day free trial of the Beraxis Command Center has concluded. Upgrade to the Pro Enterprise workspace to unlock all active data pipelines and modules immediately.
                        </p>
                    </div>
                    
                    <div className="space-y-3.5 pt-6 border-t border-white/5">
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                            <CheckCircle className="text-purple-400 shrink-0" size={16} />
                            <span>Unlimited user seats & department workspaces</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                            <CheckCircle className="text-purple-400 shrink-0" size={16} />
                            <span>Full Suite access (CRM, MRP, Accounting, Payroll)</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                            <CheckCircle className="text-purple-400 shrink-0" size={16} />
                            <span>24/7 Phone & WhatsApp Support Hotline</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Manual Pricing & Checkout Card */}
                <div className="w-full md:w-[400px] bg-gradient-to-b from-purple-950/20 to-black/40 p-6 rounded-2xl border border-purple-500/20 flex flex-col justify-between shadow-2xl">
                    {!showCheckout ? (
                        /* Pricing View */
                        <div className="h-full flex flex-col justify-between">
                            <div className="text-center pt-4">
                                <span className="text-[10px] bg-purple-500/10 text-purple-400 font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-purple-500/20">
                                    Pro Enterprise
                                </span>
                                <div className="flex items-baseline justify-center gap-1 mt-6 mb-8">
                                    <span className="text-6xl font-black text-white">${planPrice.toFixed(0)}</span>
                                    <span className="text-gray-500 text-sm">/ month</span>
                                </div>
                                <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                                    Unlocks full data persistence and synchronizes multi-channel operations across your entire team.
                                </p>
                            </div>

                            <div className="space-y-4 mt-8">
                                <button 
                                    onClick={() => setShowCheckout(true)}
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 active:scale-95 text-sm"
                                >
                                    Proceed to Checkout
                                </button>
                                <div className="text-center">
                                    <Link href="/login" className="text-xs text-gray-500 hover:text-white transition-colors underline">
                                        Log out or Switch Workspace
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Manual Credit Card Form + Promo Code */
                        <form onSubmit={handleManualCheckout} className="space-y-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400">Manual Checkout</h3>
                                <button 
                                    type="button" 
                                    onClick={() => setShowCheckout(false)}
                                    className="text-xs text-gray-500 hover:text-white transition-colors"
                                >
                                    Go Back
                                </button>
                            </div>

                            {/* Billing Amount */}
                            <div className="bg-[#0F172A]/50 border border-white/5 p-3.5 rounded-xl flex justify-between items-center mb-4">
                                <span className="text-xs font-semibold text-gray-400">Total Billed:</span>
                                <span className="text-lg font-black text-white">${currentPrice.toFixed(2)}</span>
                            </div>

                            {/* Promo Code Input */}
                            <div className="space-y-1">
                                <label className="block text-[10px] uppercase font-bold text-gray-500">Promo Code</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="e.g. FREE100" 
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        className="flex-1 bg-[#0F172A]/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                                    />
                                    <button 
                                        onClick={handleApplyPromo}
                                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-3 py-2 rounded-lg text-xs transition-colors shrink-0"
                                    >
                                        Apply
                                    </button>
                                </div>
                                {promoSuccess && <p className="text-[10px] text-green-400 font-medium mt-1">{promoSuccess}</p>}
                                {promoError && <p className="text-[10px] text-red-400 font-medium mt-1">{promoError}</p>}
                            </div>

                            {/* Card Details */}
                            <div className="space-y-3 pt-2">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Cardholder Name</label>
                                    <input 
                                        required 
                                        type="text" 
                                        placeholder="John Doe" 
                                        value={form.name} 
                                        onChange={(e) => setForm({...form, name: e.target.value})}
                                        className="w-full bg-[#0F172A]/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Card Number</label>
                                    <input 
                                        required 
                                        type="text" 
                                        placeholder="•••• •••• •••• ••••" 
                                        value={form.cardNumber} 
                                        onChange={(e) => setForm({...form, cardNumber: e.target.value})}
                                        className="w-full bg-[#0F172A]/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Expiry</label>
                                        <input 
                                            required 
                                            type="text" 
                                            placeholder="MM/YY" 
                                            value={form.expiry} 
                                            onChange={(e) => setForm({...form, expiry: e.target.value})}
                                            className="w-full bg-[#0F172A]/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">CVV</label>
                                        <input 
                                            required 
                                            type="text" 
                                            placeholder="CVC" 
                                            value={form.cvv} 
                                            onChange={(e) => setForm({...form, cvv: e.target.value})}
                                            className="w-full bg-[#0F172A]/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 text-xs disabled:opacity-50"
                            >
                                {loading ? "Authorizing Payment..." : `Activate Workspace ($${currentPrice.toFixed(2)})`}
                            </button>
                        </form>
                    )}
                </div>

            </div>
        </div>
    );
}
