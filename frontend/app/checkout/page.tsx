"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import { 
  CreditCard, 
  CheckCircle, 
  ArrowLeft, 
  ShieldCheck, 
  Lock, 
  Zap, 
  Building2, 
  Check, 
  Globe, 
  AlertCircle, 
  Loader2,
  Sparkles,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { getPaddlePrice, PaddlePriceMapping } from "@/lib/paddleConfig";
import { getCreemCheckoutUrl } from "@/lib/creemConfig";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [paddleLoading, setPaddleLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [verifiedTxId, setVerifiedTxId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const planParam = searchParams?.get("plan") || "standard";
  const billingParam = searchParams?.get("billing") || "annual";
  const paddleStatus = searchParams?.get("paddle_status");

  const [selectedPlan, setSelectedPlan] = useState<PaddlePriceMapping>(() =>
    getPaddlePrice(planParam, billingParam)
  );

  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: ""
  });

  // Prepopulate form if user is logged in
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const u = JSON.parse(storedUser);
        setForm(prev => ({
          ...prev,
          name: u.name || prev.name,
          email: u.email || prev.email,
          company: u.company_name || prev.company
        }));
      }
      const phone = localStorage.getItem("beraxis_user_phone");
      if (phone) setForm(prev => ({ ...prev, phone }));
    } catch {}
  }, []);

  // Update selected plan if searchParams change
  useEffect(() => {
    const p = getPaddlePrice(planParam, billingParam);
    setSelectedPlan(p);
  }, [planParam, billingParam]);

  // Check if returning from a successful Paddle checkout
  useEffect(() => {
    if (paddleStatus === "success") {
      setSuccess(true);
      setVerifiedTxId(`pad_${Date.now()}`);
      try {
        localStorage.setItem("user_plan", planParam);
        localStorage.setItem("beraxis_user_plan", planParam);
        if (planParam === "leadspool" || planParam === "leads-pool") {
          localStorage.setItem("has_leads_pool_access", "true");
        }
      } catch {}
    }
  }, [paddleStatus, planParam]);

  // Initialize Paddle.js client
  useEffect(() => {
    const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || "live_6645496fe6160096b0d5e7c19fe";
    const env = (process.env.NEXT_PUBLIC_PADDLE_ENV || "production") as "sandbox" | "production";

    setPaddleLoading(true);
    initializePaddle({
      token: clientToken,
      environment: env,
      eventCallback: (event) => {
        if (event.name === "checkout.completed") {
          setSuccess(true);
          const txId = event.data?.transaction_id || `pad_${Date.now()}`;
          setVerifiedTxId(txId);
          try {
            localStorage.setItem("user_plan", selectedPlan.planId);
            localStorage.setItem("beraxis_user_plan", selectedPlan.planId);
          } catch {}
        }
      }
    })
      .then((p) => {
        if (p) setPaddle(p);
      })
      .catch((err) => {
        console.warn("Paddle initialization warning:", err);
      })
      .finally(() => {
        setPaddleLoading(false);
      });
  }, [selectedPlan.planId]);

  const handleOpenPaddleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setProcessing(true);

    // Save company details to local storage
    try {
      if (form.phone) localStorage.setItem("beraxis_user_phone", form.phone);
      if (form.company) localStorage.setItem("beraxis_company_name", form.company);
      if (form.email) localStorage.setItem("beraxis_billing_email", form.email);
    } catch {}

    const creemUrl = getCreemCheckoutUrl(planParam, billingParam);
    if (typeof window !== "undefined") {
      const a = document.createElement("a");
      a.href = creemUrl;
      a.setAttribute("data-creem-checkout", "");
      a.setAttribute("data-creem-theme", "dark");
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) document.body.removeChild(a);
        setProcessing(false);
      }, 1000);
      return;
    }
    setProcessing(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#020205] text-white flex flex-col font-sans relative overflow-hidden">
        <Navbar />
        <main className="flex-grow pt-32 pb-20 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-[#0F172A] border border-emerald-500/30 rounded-3xl p-8 text-center shadow-2xl space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle size={36} />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Payment Completed</span>
              <h1 className="text-2xl font-black text-white mt-1">Welcome to Beraxis {selectedPlan.name}!</h1>
              <p className="text-xs text-gray-400 mt-2">
                Your workspace has been upgraded. All enterprise modules and AI lead credits are active immediately.
              </p>
              {verifiedTxId && (
                <p className="text-[11px] font-mono text-gray-500 mt-2 bg-black/40 p-2 rounded-xl border border-white/5">
                  Reference: {verifiedTxId}
                </p>
              )}
            </div>
            <div className="pt-2">
              <Link
                href="/apps"
                className="galaxy-btn-primary !w-full !py-3.5 text-xs font-bold shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
              >
                <span>Launch Your Workspace Cockpit</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020205] text-white flex flex-col font-sans selection:bg-purple-500 selection:text-white relative overflow-hidden">
      <Navbar />

      <main className="flex-grow pt-28 sm:pt-36 pb-20 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-8 font-medium">
            <Link href="/pricing" className="hover:text-white transition flex items-center gap-1">
              <ArrowLeft size={12} /> Back to Pricing
            </Link>
            <span>/</span>
            <span className="text-purple-400 font-semibold">Secure Checkout</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Customer Form */}
            <div className="lg:col-span-7 bg-[#0F172A]/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400 block mb-1">
                  Step 1 of 2 • Account & Workspace Details
                </span>
                <h2 className="text-2xl font-black text-white">Billing Information</h2>
                <p className="text-xs text-gray-400 mt-1">
                  Enter your contact information to activate your plan license and invoice receipt.
                </p>
              </div>

              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-300">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleOpenPaddleCheckout} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-300 font-semibold block mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Alex Morgan"
                      className="w-full bg-[#090D1A] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-300 font-semibold block mb-1.5">Work Email *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="e.g. marcus@company.com"
                      className="w-full bg-[#090D1A] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-purple-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-300 font-semibold block mb-1.5">Company / Workspace Name</label>
                    <input
                      type="text"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      placeholder="e.g. Acme Corporation"
                      className="w-full bg-[#090D1A] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-300 font-semibold block mb-1.5">Mobile / WhatsApp (Optional)</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-[#090D1A] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-purple-500 outline-none"
                    />
                  </div>
                </div>

                {/* Payment Gateway Callout */}
                <div className="p-4 rounded-2xl bg-[#090D1A] border border-purple-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck size={16} className="text-emerald-400" />
                      Creem Global Merchant of Record
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider">
                      Live Production
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Transactions are processed securely through Creem MoR. Supports Apple Pay, Google Pay, Visa, Mastercard, American Express, PayPal, and regional bank transfers.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={processing || paddleLoading}
                  className="w-full galaxy-btn-primary !py-4 text-xs font-extrabold shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {processing || paddleLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Opening Secure Checkout...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={15} />
                      <span>Proceed to Creem Secure Checkout (${selectedPlan.unitAmountUsd.toFixed(2)})</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Column: Order Summary Card */}
            <div className="lg:col-span-5 bg-[#0F172A]/90 border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                  Order Summary
                </span>
                <h3 className="text-xl font-bold text-white">{selectedPlan.name}</h3>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider border border-purple-500/30">
                  Early Bird Special Active
                </span>
              </div>

              {/* Price Breakdown */}
              <div className="p-4 rounded-2xl bg-[#090D1A] border border-white/5 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Billing Cadence:</span>
                  <span className="text-white font-semibold capitalize">{selectedPlan.billingCycle}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Regular Price:</span>
                  <span className="text-rose-400 line-through font-mono">
                    ${selectedPlan.billingCycle === "annual" ? "298.80" : "31.10"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Early Bird Discount:</span>
                  <span className="text-emerald-400 font-bold font-mono">
                    -${selectedPlan.billingCycle === "annual" ? "286.80" : "26.10"} (96% OFF)
                  </span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-white">Total Due Today:</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-400 font-mono">
                      ${selectedPlan.unitAmountUsd.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-gray-500 block">
                      {selectedPlan.billingCycle === "annual" ? "Billed $12/yr ($1.00/mo)" : "Billed $5.00/mo"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Inclusions checklist */}
              <div className="space-y-2 text-xs text-gray-300 pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">Plan Inclusions:</span>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400" />
                  <span>All 28 ERP &amp; CRM Modules Unlocked</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400" />
                  <span>1,500 Monthly Verified Lead Credits</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400" />
                  <span>Full GAAP/IFRS Double-Entry Accounting</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400" />
                  <span>AI Voice Pilot &amp; Dual-Brain Copilot</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400" />
                  <span>Cancel Anytime with 1 Click</span>
                </div>
              </div>

              {/* Guarantee */}
              <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/20 text-center">
                <span className="text-xs text-purple-300 font-semibold block">
                  30-Day Money-Back Guarantee
                </span>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  If you aren't completely satisfied, contact support for a prompt refund.
                </p>
              </div>

            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070B16] text-white flex items-center justify-center">Loading checkout...</div>}>
      <CheckoutPageContent />
    </Suspense>
  );
}
