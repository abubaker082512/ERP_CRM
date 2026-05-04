"use client";

import { CheckCircle, Lock } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { fetchAPI } from '@/lib/api';

export default function BillingPage() {

    const [loading, setLoading] = useState(false);

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            const res = await fetchAPI("/billing/create-checkout-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    price_id: "price_12345", // Mock price ID
                    plan_name: "pro"
                })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.checkout_url) {
                    window.location.href = data.checkout_url;
                } else {
                    alert("No checkout URL returned.");
                }
            } else {
                alert("Failed to initialize checkout.");
            }
        } catch (error) {
            console.error("Checkout error:", error);
            alert("An error occurred while starting checkout.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-4">
            <div className="absolute top-8 left-8 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                Next-Gen AI ERP
            </div>

            <div className="max-w-4xl w-full flex flex-col md:flex-row gap-8 items-center bg-[#1E293B] p-8 rounded-xl border border-gray-800 shadow-2xl">
                
                {/* Left Side: Lock & Message */}
                <div className="flex-1 text-center md:text-left space-y-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 text-red-400 mb-2">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                        Your 7-Day Free Trial Has Expired
                    </h1>
                    <p className="text-gray-400 text-lg">
                        You have lost access to the Next-Gen AI ERP workspace. Subscribe to our Pro tier to instantly unlock your workspace, restore access to all your data, and continue scaling your business.
                    </p>
                    
                    <div className="space-y-3 pt-4 border-t border-gray-700">
                        <div className="flex items-center gap-3 text-gray-300">
                            <CheckCircle className="text-purple-400" size={20} />
                            <span>Unlimited Users & Departments</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300">
                            <CheckCircle className="text-purple-400" size={20} />
                            <span>Full Suite (CRM, MRP, Payroll, HR)</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300">
                            <CheckCircle className="text-purple-400" size={20} />
                            <span>AI Predictive AI Engine</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Pricing Card */}
                <div className="w-full md:w-[380px] bg-gradient-to-b from-purple-900/40 to-black/40 p-6 rounded-lg border border-purple-500/30 flex flex-col text-center">
                    <div className="text-sm uppercase tracking-wider text-purple-400 font-bold mb-2">Pro Tier</div>
                    <div className="flex items-end justify-center gap-1 mb-6">
                        <span className="text-5xl font-extrabold text-white">$199</span>
                        <span className="text-gray-400 mb-1">/mo</span>
                    </div>

                    <button 
                        onClick={handleSubscribe}
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold py-3 px-4 rounded transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/25 mb-4 group relative overflow-hidden"
                    >
                        <div className="relative z-10 flex items-center justify-center gap-2">
                            {loading ? (
                                <span>Starting Checkout...</span>
                            ) : (
                                <>
                                    <Lock size={16} className="group-hover:hidden" />
                                    <span>Subscribe & Unlock</span>
                                </>
                            )}
                        </div>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    </button>
                    
                    <p className="text-xs text-gray-500">
                        Secure payment processing by Stripe. Cancel anytime.
                    </p>
                    
                    <div className="mt-6">
                        <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors underline underline-offset-4">
                            Logout or switch accounts
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
