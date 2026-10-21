"use client";
import { fetchAPI } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ShopHeader from '@/components/shop/ShopHeader';
import { CartItem } from '@/components/shop/CartModal';
import { CreditCard, CheckCircle, ArrowLeft, ShieldCheck, Lock, Zap, Building2, Check, Globe, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [verifiedTxId, setVerifiedTxId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Subscription plan details (if arriving from pricing/billing page)
    const [subscriptionPlan, setSubscriptionPlan] = useState<{
        name: string;
        tier: string;
        users: number;
        billingCycle: string;
        price: number;
    } | null>(null);

    // Promo code states
    const [promoCode, setPromoCode] = useState("");
    const [discountAmountUSD, setDiscountAmountUSD] = useState(0.0);
    const [appliedPromoDetails, setAppliedPromoDetails] = useState<any>(null);
    const [promoSuccess, setPromoSuccess] = useState("");
    const [promoError, setPromoError] = useState("");

    const [form, setForm] = useState({
        name: '',
        email: '',
        company: '',
        phone: '',
        address: '',
        city: '',
        country: 'United States',
        cardNumber: '',
        cardHolder: '',
        expiry: '',
        cvv: ''
    });



    useEffect(() => {
        // 1. Check if returning from DirectPay Gateway redirect
        const dpStatus = searchParams?.get('dp_status') || searchParams?.get('directpay_status');
        const dpTxnId = searchParams?.get('txn_id') || searchParams?.get('client_transaction_id');

        if (dpStatus === 'success' && dpTxnId) {
            setVerifiedTxId(dpTxnId);
            setSuccess(true);
            const planParam = searchParams?.get('plan') || 'standard';
            try {
                localStorage.setItem('user_plan', planParam);
                localStorage.setItem('beraxis_user_plan', planParam);
                if (planParam === 'leadspool' || planParam === 'leads-pool') {
                    localStorage.setItem('has_leads_pool_access', 'true');
                }
            } catch {}
            localStorage.removeItem('erp_cart');
            setCartItems([]);
            setLoading(false);
            return;
        }

        // 2. Check if returning from real Stripe Checkout redirect
        const stripeStatus = searchParams?.get('stripe_status');
        const stripeSessionId = searchParams?.get('session_id');

        // Dismiss any old simulated session IDs
        if (stripeSessionId && stripeSessionId.startsWith('STRIPE-SIM-')) {
            const planClean = searchParams?.get('plan') || 'standard';
            router.replace(`/checkout?plan=${planClean}&billing=annual`);
            setLoading(false);
            return;
        }

        if (stripeStatus === 'success' && stripeSessionId && (stripeSessionId.startsWith('cs_') || stripeSessionId.startsWith('sub_'))) {
            const planParam = searchParams?.get('plan') || 'standard';
            setVerifiedTxId(stripeSessionId);
            setSuccess(true);
            try {
                localStorage.setItem('user_plan', planParam);
                localStorage.setItem('beraxis_user_plan', planParam);
                if (planParam === 'leadspool' || planParam === 'leads-pool') {
                    localStorage.setItem('has_leads_pool_access', 'true');
                }
            } catch {}
            localStorage.removeItem('erp_cart');
            setCartItems([]);
            setLoading(false);
            return;
        }

        // 3. Check if subscribed from pricing or billing page
        const planParam = searchParams?.get('plan');
        const usersParam = parseInt(searchParams?.get('users') || '1', 10);
        const billingParam = searchParams?.get('billing') || 'annually';

        if (planParam === 'standard' || planParam === 'custom' || planParam === 'premium' || planParam === 'leadspool' || planParam === 'leads-pool') {
            const isAnnual = billingParam === 'annually' || billingParam === 'annual';

            if (planParam === 'leadspool' || planParam === 'leads-pool') {
                setSubscriptionPlan({
                    name: 'Leads Pool Solo (1,500 Contacts/mo)',
                    tier: 'leadspool',
                    users: 1,
                    billingCycle: 'Monthly Dedicated Access',
                    price: 10.00
                });
            } else {
                const rate = (planParam === 'standard')
                    ? (isAnnual ? 12.00 : 5.00)
                    : (isAnnual ? 448.80 : 46.80);
                const planTotal = usersParam * rate;

                setSubscriptionPlan({
                    name: planParam === 'standard' ? 'Beraxis Standard Plan' : 'Beraxis Custom Enterprise',
                    tier: planParam,
                    users: usersParam,
                    billingCycle: isAnnual ? 'Annual Billing (Early Bird Special)' : 'Monthly Billing',
                    price: parseFloat(planTotal.toFixed(2))
                });
            }
        }

        const savedCart = localStorage.getItem('erp_cart');
        if (savedCart) {
            try { 
                setCartItems(JSON.parse(savedCart)); 
            } catch {}
        }

        // 4. Pre-fill customer billing details from user's profile/session
        try {
            let loadedName = '';
            let loadedEmail = '';
            let loadedCompany = '';
            let loadedPhone = '';

            const userStr = localStorage.getItem('user');
            if (userStr) {
                const u = JSON.parse(userStr);
                loadedName = u.name || u.full_name || u.user_metadata?.name || u.user_metadata?.full_name || '';
                loadedEmail = u.email || u.user_metadata?.email || '';
                loadedCompany = u.company_name || u.user_metadata?.company_name || u.tenant?.company_name || u.tenant?.name || '';
                loadedPhone = u.phone || u.phone_number || u.mobile || u.user_metadata?.phone || u.user_metadata?.phone_number || '';
                
                if (!loadedName && loadedEmail) {
                    loadedName = loadedEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
                }

                if (!loadedCompany && loadedName) {
                    loadedCompany = `${loadedName}'s Entity`;
                }
            }

            const activeBranchStr = localStorage.getItem('beraxis_active_branch');
            if (activeBranchStr) {
                try {
                    const ab = JSON.parse(activeBranchStr);
                    if (!loadedCompany && ab.name) loadedCompany = ab.name;
                    if (!loadedPhone && ab.phone) loadedPhone = ab.phone;
                } catch {}
            }

            const savedPhone = localStorage.getItem('beraxis_user_phone') || localStorage.getItem('billing_phone');
            if (!loadedPhone && savedPhone) loadedPhone = savedPhone;

            const savedCompany = localStorage.getItem('beraxis_company_name') || localStorage.getItem('settings_company_name');
            if (!loadedCompany && savedCompany) loadedCompany = savedCompany;

            setForm(prev => ({
                ...prev,
                name: prev.name || loadedName,
                email: prev.email || loadedEmail,
                company: prev.company || loadedCompany,
                phone: prev.phone || loadedPhone,
                cardHolder: prev.cardHolder || prev.name || loadedName,
            }));

            const token = localStorage.getItem('token');
            if (token) {
                fetchAPI('/auth/me')
                    .then(res => res.ok ? res.json() : null)
                    .then(meData => {
                        if (meData) {
                            const meta = meData.metadata || {};
                            const tenant = meData.tenant || {};
                            const fetchedName = meta.name || meData.name || '';
                            const fetchedEmail = meData.email || '';
                            const fetchedCompany = meta.company_name || tenant.company_name || tenant.name || '';
                            const fetchedPhone = meta.phone || tenant.phone || '';

                            setForm(current => ({
                                ...current,
                                name: current.name || fetchedName,
                                email: current.email || fetchedEmail,
                                company: current.company || fetchedCompany,
                                phone: current.phone || fetchedPhone,
                                cardHolder: current.cardHolder || current.name || fetchedName,
                            }));
                        }
                    })
                    .catch(() => {});
            }
        } catch (e) {
            console.error('Error pre-filling checkout details:', e);
        }

        setLoading(false);
    }, [searchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => {
            const next = { ...prev, [name]: value };
            if (name === 'name' && (!prev.cardHolder || prev.cardHolder === prev.name)) {
                next.cardHolder = value;
            }
            return next;
        });

        try {
            if (name === 'phone') localStorage.setItem('beraxis_user_phone', value);
            if (name === 'company') localStorage.setItem('beraxis_company_name', value);
        } catch {}
    };

    // Card Input Formatters
    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setErrorMessage(null);
        const raw = e.target.value.replace(/\D/g, '').substring(0, 16);
        const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
        setForm(prev => ({ ...prev, cardNumber: formatted }));
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setErrorMessage(null);
        let raw = e.target.value.replace(/\D/g, '').substring(0, 4);
        if (raw.length >= 3) {
            raw = raw.substring(0, 2) + '/' + raw.substring(2);
        }
        setForm(prev => ({ ...prev, expiry: raw }));
    };

    const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setErrorMessage(null);
        const raw = e.target.value.replace(/\D/g, '').substring(0, 4);
        setForm(prev => ({ ...prev, cvv: raw }));
    };

    const handleApplyPromo = async (e: React.MouseEvent) => {
        e.preventDefault();
        setPromoError("");
        setPromoSuccess("");

        const code = promoCode.trim().toUpperCase();
        if (!code) {
            setPromoError("Please enter a promo code.");
            return;
        }

        try {
            const pkg = subscriptionPlan?.tier || "all";
            const res = await fetch(`/api/admin/promocodes?validate=${encodeURIComponent(code)}&package=${pkg}&amount=${subtotal}`);
            const data = await res.json();

            if (res.ok && data.valid) {
                const disc = data.promo.calculatedDiscountUSD;
                setDiscountAmountUSD(disc);
                setAppliedPromoDetails(data.promo);
                if (data.promo.discount_type === "percentage") {
                    setPromoSuccess(`🎉 ${data.promo.discount_value}% Discount applied! (-$${disc.toFixed(2)})`);
                } else {
                    setPromoSuccess(`🎉 $${data.promo.discount_value} Flat Discount applied! (-$${disc.toFixed(2)})`);
                }
            } else {
                setPromoError(data.error || "Invalid promo code for this package.");
                setDiscountAmountUSD(0);
                setAppliedPromoDetails(null);
            }
        } catch (err) {
            if (["FREE100", "BERAXIS100", "BERAXIS"].includes(code)) {
                setDiscountAmountUSD(subtotal);
                setPromoSuccess("🎉 100% Promo applied! Plan is $0.00.");
            } else if (code === "LAUNCH50") {
                setDiscountAmountUSD(subtotal * 0.5);
                setPromoSuccess("🎉 50% Promo applied!");
            } else {
                setPromoError("Invalid code.");
                setDiscountAmountUSD(0);
            }
        }
    };

    // Calculate subtotal from cart or subscription plan
    const cartSubtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const subtotal = subscriptionPlan ? subscriptionPlan.price : cartSubtotal;
    const discountAmount = Math.min(subtotal, discountAmountUSD);
    const tax = 0; // 0% tax for now
    const total = Math.max(0, (subtotal - discountAmount) + tax);

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);
        setProcessing(true);

        // Sync details to localStorage
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const u = JSON.parse(userStr);
                if (form.name) u.name = form.name;
                if (form.company) u.company_name = form.company;
                if (form.phone) u.phone = form.phone;
                localStorage.setItem('user', JSON.stringify(u));
            }
            if (form.phone) localStorage.setItem('beraxis_user_phone', form.phone);
            if (form.company) localStorage.setItem('beraxis_company_name', form.company);
        } catch {}

        const currentPlanKey = subscriptionPlan?.tier || 'standard';
        const isAnnual = (subscriptionPlan?.billingCycle || '').toLowerCase().includes('annual');

    // 1. STRIPE SECURE CHECKOUT FLOW (Directly launches Stripe Checkout)
    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);
        setProcessing(true);

        // Sync details to localStorage
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const u = JSON.parse(userStr);
                if (form.name) u.name = form.name;
                if (form.company) u.company_name = form.company;
                if (form.phone) u.phone = form.phone;
                localStorage.setItem('user', JSON.stringify(u));
            }
            if (form.phone) localStorage.setItem('beraxis_user_phone', form.phone);
            if (form.company) localStorage.setItem('beraxis_company_name', form.company);
        } catch {}

        const currentPlanKey = subscriptionPlan?.tier || 'standard';
        const isAnnual = (subscriptionPlan?.billingCycle || '').toLowerCase().includes('annual');

        try {
            const res = await fetch('/api/payments/stripe/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    plan: currentPlanKey,
                    billing: isAnnual ? 'annual' : 'monthly',
                    users: subscriptionPlan?.users || 1,
                    email: form.email || 'customer@beraxis.online',
                    name: form.name || 'Beraxis Subscriber',
                    company: form.company,
                    phone: form.phone,
                    return_url: `${window.location.origin}/checkout`
                })
            });

            const data = await res.json();

            if (!res.ok || !data.success || !data.url) {
                setProcessing(false);
                setErrorMessage(data.error || "Failed to initialize Stripe payment. Please check your Stripe keys in Super Admin (/super-admin).");
                return;
            }

            // Redirect to official Stripe Checkout portal!
            window.location.href = data.url;
            return;
        } catch (stripeErr: any) {
            console.error('Stripe Checkout error:', stripeErr);
            setProcessing(false);
            setErrorMessage(stripeErr.message || "Network error while connecting to Stripe. Please try again.");
            return;
        }
    };
    };

    const handleSuccess = () => {
        setProcessing(false);
        setSuccess(true);
        localStorage.removeItem('erp_cart');
        setCartItems([]);
    };

    if (loading) return <div className="h-screen bg-[#0F172A] flex items-center justify-center text-white">Loading...</div>;

    if (success) {
        const isLeadsPool = subscriptionPlan?.tier === 'leadspool' || searchParams?.get('plan') === 'leadspool' || searchParams?.get('plan') === 'leads-pool';

        return (
            <div className="min-h-screen bg-[#070B16] flex flex-col items-center justify-center text-center px-4">
                <div className="w-24 h-24 bg-emerald-500/20 rounded-3xl flex items-center justify-center mb-6 ring-8 ring-emerald-500/10 border border-emerald-500/30 animate-pulse">
                    <CheckCircle size={48} className="text-emerald-400" />
                </div>
                <h1 className="text-4xl font-extrabold text-white mb-3">Subscription Activated!</h1>
                {verifiedTxId && (
                    <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono text-xs font-semibold">
                        <Zap size={14} className="text-purple-400" /> Payment TxID: {verifiedTxId}
                    </div>
                )}
                <p className="text-gray-400 mb-8 max-w-md text-sm leading-relaxed">
                    Thank you, <strong className="text-white">{form.name || 'valued customer'}</strong>. Your payment has been confirmed and your subscription is active.
                    {isLeadsPool && (
                        <span className="block mt-2 text-amber-300 font-medium">
                            🎯 1,500 Lead credits have been assigned to your workspace. The 25.8M+ Leads Pool is now fully unlocked!
                        </span>
                    )}
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                    {isLeadsPool ? (
                        <Link href="/crm/leads-pool" className="bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-amber-500/25 transition-all text-sm flex items-center gap-2">
                            Open Leads Pool Cockpit 🎯
                        </Link>
                    ) : (
                        <Link href="/apps" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-purple-500/25 transition-all text-sm flex items-center gap-2">
                            Open Beraxis Apps Space →
                        </Link>
                    )}
                    <Link href="/dashboard" className="bg-white/10 hover:bg-white/15 text-white font-semibold py-3.5 px-6 rounded-xl transition-all text-sm">
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const hasItems = subscriptionPlan !== null || cartItems.length > 0;

    if (!hasItems) {
        return (
            <div className="min-h-screen bg-[#070B16] flex flex-col items-center justify-center text-center px-4">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 text-gray-500">
                    <CreditCard size={32} />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">No Active Subscription or Items Selected</h1>
                <p className="text-sm text-gray-400 mb-6 max-w-sm">Please choose a Beraxis enterprise plan or select modules from the pricing catalog.</p>
                <Link href="/pricing" className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-xl transition-colors text-sm flex items-center gap-2">
                    <ArrowLeft size={16} /> View Pricing &amp; Plans
                </Link>
            </div>
        );
    }

    const isLeadsPool = subscriptionPlan?.tier === 'leadspool';

    return (
        <div className="min-h-screen bg-[#070B16] flex flex-col text-white">
            <ShopHeader cartCount={cartItems.length} onCartClick={() => {}} />

            <div className="container mx-auto px-4 py-12 max-w-6xl">
                <div className="mb-8">
                    <Link href="/pricing" className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1.5 mb-2">
                        <ArrowLeft size={14} /> Back to Pricing &amp; Plans
                    </Link>
                    <h1 className="text-3xl font-black text-white tracking-tight">
                        Beraxis Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Checkout</span>
                    </h1>
                    <p className="text-xs text-gray-400 mt-1">
                        Secure card payment powered by Stripe Global Enterprise (Visa, Mastercard, Amex, Apple Pay)
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* Left: Billing & Payment Form */}
                    <div className="lg:col-span-7">
                        <form onSubmit={handleCheckout} className="space-y-6">
                            
                            {/* Customer & Company Details */}
                            <div className="galaxy-card p-6 bg-[#0F172A]/40 border border-white/5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                                        <Building2 size={16} className="text-purple-400" /> Account &amp; Billing Details
                                    </h3>
                                    <span className="text-[11px] text-purple-400/90 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full font-medium">
                                        Auto-linked from profile
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 mb-1.5">Full Name *</label>
                                        <input required name="name" value={form.name} onChange={handleChange} type="text" placeholder="e.g. John Doe" className="w-full bg-[#070B16] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-500 text-xs" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 mb-1.5">Work Email *</label>
                                        <input required name="email" value={form.email} onChange={handleChange} type="email" placeholder="name@company.com" className="w-full bg-[#070B16] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-500 text-xs" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 mb-1.5">Company / Entity Name</label>
                                        <input name="company" value={form.company} onChange={handleChange} type="text" placeholder="e.g. Acme Corp or Sole Proprietor" className="w-full bg-[#070B16] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-500 text-xs" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 mb-1.5">Billing Phone *</label>
                                        <input required name="phone" value={form.phone} onChange={handleChange} type="tel" placeholder="e.g. +1 555-0199 or 03001234567" className="w-full bg-[#070B16] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-500 text-xs font-mono" />
                                    </div>
                                </div>
                            </div>

                            {/* Stripe Global Card Payments Container */}
                            <div className="galaxy-card p-6 bg-[#0F172A]/40 border border-purple-500/30 space-y-4 relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-600/30 to-transparent px-4 py-1 text-[10px] font-bold text-purple-300 uppercase tracking-widest">
                                    Stripe Global Checkout
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                                            <Globe size={18} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-white">Stripe Global Card Payments</h3>
                                            <p className="text-[11px] text-gray-400">Visa, Mastercard, Amex, Discover, Apple Pay, Google Pay • 3D Secure</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-mono font-bold text-gray-300">VISA</span>
                                        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-mono font-bold text-gray-300">MC</span>
                                        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-mono font-bold text-gray-300">AMEX</span>
                                        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-mono font-bold text-gray-300">DISCOVER</span>
                                        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-mono font-bold text-gray-300">APPLE PAY</span>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2 text-xs text-gray-300">
                                    <div className="flex items-center justify-between">
                                        <span>Amount to be charged in USD:</span>
                                        <strong className="text-white font-mono text-sm">${total.toFixed(2)} USD</strong>
                                    </div>
                                    <p className="text-[11px] text-gray-400 leading-relaxed">
                                        Clicking <strong className="text-white">Pay via Stripe Checkout</strong> below securely opens the official Stripe Checkout portal pre-populated with your verified email (<strong className="text-purple-300">{form.email || 'your email'}</strong>) where you will enter your card details with instant activation.
                                    </p>
                                </div>
                            </div>

                            {/* Error Alert Banner */}
                            {errorMessage && (
                                <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
                                    <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                                    <div className="leading-relaxed">
                                        <strong className="block font-bold text-rose-200 mb-0.5">Payment Failed</strong>
                                        {errorMessage}
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-500/25 flex justify-center items-center gap-2 cursor-pointer transition-all active:scale-[0.99] disabled:opacity-60"
                            >
                                {processing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Connecting to Stripe Gateway...
                                    </>
                                ) : (
                                    <>
                                        <Lock size={18} /> Pay ${total.toFixed(2)} USD via Stripe Checkout →
                                    </>
                                )}
                            </button>

                            <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-1.5">
                                <ShieldCheck size={14} className="text-emerald-400" /> 
                                256-Bit SSL Encrypted Session • Real-time 3D Secure Protection
                            </p>
                        </form>
                    </div>

                    {/* Right: Plan Summary & Price Calculation */}
                    <div className="lg:col-span-5">
                        <div className="galaxy-card p-6 bg-[#0F172A]/40 border border-white/10 sticky top-24 space-y-6">
                            <h2 className="text-lg font-bold text-white border-b border-white/5 pb-4">
                                Subscription Summary
                            </h2>

                            {/* Plan Pill */}
                            {subscriptionPlan ? (
                                <div className={`p-4 rounded-2xl space-y-2 border ${isLeadsPool ? 'bg-amber-500/10 border-amber-500/25' : 'bg-purple-600/10 border-purple-500/20'}`}>
                                    <div className="flex items-center justify-between">
                                        <span className={`text-xs font-bold uppercase tracking-wider ${isLeadsPool ? 'text-amber-300' : 'text-purple-300'}`}>
                                            {subscriptionPlan.name}
                                        </span>
                                        <span className="text-xs font-mono font-bold text-white">
                                            ${subscriptionPlan.price.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <span>👥 {subscriptionPlan.users} User Seat(s)</span>
                                        <span>•</span>
                                        <span>📅 {subscriptionPlan.billingCycle}</span>
                                    </div>

                                    {isLeadsPool ? (
                                        <ul className="text-[11px] text-gray-300 space-y-1 pt-2 border-t border-white/5">
                                            <li className="flex items-center gap-1.5">
                                                <Check size={12} className="text-amber-400" /> 1,500 Verified B2B Contacts / month
                                            </li>
                                            <li className="flex items-center gap-1.5">
                                                <Check size={12} className="text-amber-400" /> Direct Mobile &amp; WhatsApp dials included
                                            </li>
                                            <li className="flex items-center gap-1.5">
                                                <Check size={12} className="text-amber-400" /> Real-time deliverable corporate emails
                                            </li>
                                            <li className="flex items-center gap-1.5">
                                                <Check size={12} className="text-amber-400" /> Dedicated Leads Pool &amp; Contacts apps unlocked
                                            </li>
                                        </ul>
                                    ) : (
                                        <ul className="text-[11px] text-gray-300 space-y-1 pt-2 border-t border-white/5">
                                            <li className="flex items-center gap-1.5">
                                                <Check size={12} className="text-purple-400" /> All 28 enterprise modules included
                                            </li>
                                            <li className="flex items-center gap-1.5">
                                                <Check size={12} className="text-purple-400" /> 1,500 Lead Credits/mo (25.8M+ Pool)
                                            </li>
                                            <li className="flex items-center gap-1.5">
                                                <Check size={12} className="text-purple-400" /> High-speed cloud instance &amp; daily backups
                                            </li>
                                        </ul>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-2">
                                    {cartItems.map(item => (
                                        <div key={item.id} className="flex justify-between items-center text-xs">
                                            <div>
                                                <h4 className="font-semibold text-white">{item.name}</h4>
                                                <p className="text-[11px] text-gray-400">Qty: {item.quantity}</p>
                                            </div>
                                            <span className="font-mono font-bold text-white">${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Promo Code Fields */}
                            <div className="border-t border-white/5 pt-4">
                                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Promo / Partner Code</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="e.g. LAUNCH50" 
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        className="flex-1 bg-[#070B16] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                                    />
                                    <button 
                                        type="button"
                                        onClick={handleApplyPromo}
                                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-3 py-2 rounded-xl text-xs transition-colors shrink-0 cursor-pointer"
                                    >
                                        Apply
                                    </button>
                                </div>
                                {promoSuccess && <p className="text-[10px] text-emerald-400 font-medium mt-1.5">{promoSuccess}</p>}
                                {promoError && <p className="text-[10px] text-rose-400 font-medium mt-1.5">{promoError}</p>}
                            </div>
                            
                            {/* Breakdown with 0% Taxes */}
                            <div className="border-t border-white/5 pt-4 space-y-2.5 text-xs text-gray-400">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="text-white font-mono">${subtotal.toFixed(2)}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-emerald-400 font-medium">
                                        <span>Discount</span>
                                        <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>Taxes</span>
                                    <span className="text-emerald-400 font-medium">$0.00 (0% Tax)</span>
                                </div>
                                <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                                    <div>
                                        <span className="text-sm font-bold text-white block">Total Billed</span>
                                        <span className="text-[11px] text-gray-400 font-mono">
                                            ${total.toFixed(2)} USD
                                        </span>
                                    </div>
                                    <span className="text-2xl font-black text-purple-400">${total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
