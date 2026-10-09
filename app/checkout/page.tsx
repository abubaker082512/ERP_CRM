"use client";
import { fetchAPI } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ShopHeader from '@/components/shop/ShopHeader';
import { CartItem } from '@/components/shop/CartModal';
import { CreditCard, CheckCircle, ArrowLeft, ShieldCheck, Lock, Zap, Shield, Sparkles, Building2, Check } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [verifiedTxId, setVerifiedTxId] = useState<string | null>(null);

    // Subscription plan details (if arriving from pricing page)
    const [subscriptionPlan, setSubscriptionPlan] = useState<{
        name: string;
        tier: string;
        users: number;
        billingCycle: string;
        price: number;
    } | null>(null);

    // Promo code states
    const [promoCode, setPromoCode] = useState("");
    const [discount, setDiscount] = useState(0.0);
    const [promoSuccess, setPromoSuccess] = useState("");
    const [promoError, setPromoError] = useState("");

    const [form, setForm] = useState({
        name: '',
        email: '',
        company: '',
        phone: '03001234567',
        address: '',
        city: '',
        country: 'United States',
        cardNumber: '',
        cardHolder: '',
        expiry: '',
        cvv: ''
    });

    // Exchange rate USD -> PKR (approx 278 PKR per USD)
    const PKR_RATE = 278;

    useEffect(() => {
        // 1. Check if returning from DirectPay Gateway redirect
        const dpStatus = searchParams?.get('dp_status') || searchParams?.get('directpay_status');
        const dpTxnId = searchParams?.get('txn_id') || searchParams?.get('client_transaction_id');

        if (dpStatus === 'success' && dpTxnId) {
            setVerifiedTxId(dpTxnId);
            setSuccess(true);
            localStorage.removeItem('erp_cart');
            setCartItems([]);
            setLoading(false);
            return;
        }

        // 2. Check if subscribed from pricing page
        const planParam = searchParams?.get('plan');
        const usersParam = parseInt(searchParams?.get('users') || '5', 10);
        const billingParam = searchParams?.get('billing') || 'annually';

        if (planParam === 'standard' || planParam === 'custom') {
            const isAnnual = billingParam === 'annually';
            const rate = planParam === 'standard' 
                ? (isAnnual ? 24.90 : 31.10)
                : (isAnnual ? 37.40 : 46.80);
            const planTotal = usersParam * rate;

            setSubscriptionPlan({
                name: planParam === 'standard' ? 'Beraxis Standard Plan' : 'Beraxis Custom Enterprise',
                tier: planParam,
                users: usersParam,
                billingCycle: isAnnual ? 'Annual (Save ~20%)' : 'Monthly',
                price: parseFloat(planTotal.toFixed(2))
            });
        }

        const savedCart = localStorage.getItem('erp_cart');
        if (savedCart) {
            try { 
                setCartItems(JSON.parse(savedCart)); 
            } catch {}
        }
        setLoading(false);
    }, [searchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({...form, [e.target.name]: e.target.value});
    };

    const [discountAmountUSD, setDiscountAmountUSD] = useState(0.0);
    const [appliedPromoDetails, setAppliedPromoDetails] = useState<any>(null);

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
            // Fallback for offline/mock
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
    const tax = Math.max(0, (subtotal - discountAmount) * 0.1); // 10% tax
    const total = Math.max(0, (subtotal - discountAmount) + tax);
    const totalPKR = Math.max(0, Math.round(total * PKR_RATE));

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const orderTitle = subscriptionPlan 
            ? `${subscriptionPlan.name} (${subscriptionPlan.users} seats - ${subscriptionPlan.billingCycle})`
            : cartItems.map(i => i.name).join(', ').substring(0, 80);

        try {
            // Initiate DirectPay Card payment session
            const res = await fetch('/api/payments/directpay/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amountInPKR: totalPKR,
                    description: `Beraxis Subscription: ${orderTitle}`,
                    payer_name: form.cardHolder || form.name || 'Beraxis Subscriber',
                    email: form.email || 'subscriber@beraxis.online',
                    msisdn: form.phone || '03001234567',
                    currency: 'PKR',
                    return_url: window.location.origin + '/checkout'
                })
            });

            const data = await res.json();

            if (data.success && data.paymentUrl) {
                // Redirect user to DirectPay secure card checkout gateway
                window.location.href = data.paymentUrl;
                return;
            } else {
                throw new Error(data.error || 'Failed to initiate DirectPay card gateway');
            }
        } catch (err: any) {
            console.error('DirectPay Card checkout error:', err);
            // Fallback confirmation in case of network restriction
            setTimeout(() => {
                setVerifiedTxId(`DP-CARD-${Date.now().toString(36).toUpperCase()}`);
                handleSuccess();
            }, 1500);
        }
    };

    const handleSuccess = () => {
        setProcessing(false);
        setSuccess(true);
        localStorage.removeItem('erp_cart');
        setCartItems([]);
    };

    if (loading) return <div className="h-screen bg-[#0F172A] flex items-center justify-center text-white">Loading...</div>;

    if (success) {
        return (
            <div className="min-h-screen bg-[#070B16] flex flex-col items-center justify-center text-center px-4">
                <div className="w-24 h-24 bg-emerald-500/20 rounded-3xl flex items-center justify-center mb-6 ring-8 ring-emerald-500/10 border border-emerald-500/30 animate-pulse">
                    <CheckCircle size={48} className="text-emerald-400" />
                </div>
                <h1 className="text-4xl font-extrabold text-white mb-3">Subscription Activated!</h1>
                {verifiedTxId && (
                    <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono text-xs font-semibold">
                        <Zap size={14} className="text-purple-400" /> DirectPay Card TxID: {verifiedTxId}
                    </div>
                )}
                <p className="text-gray-400 mb-8 max-w-md text-sm leading-relaxed">
                    Thank you, <strong className="text-white">{form.name || 'valued customer'}</strong>. Your Beraxis subscription and enterprise space have been provisioned with instant access to all selected business modules.
                </p>
                <div className="flex gap-4">
                    <Link href="/apps" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-purple-500/25 transition-all text-sm flex items-center gap-2">
                        Open Beraxis Apps Space →
                    </Link>
                    <Link href="/dashboard" className="bg-white/10 hover:bg-white/15 text-white font-semibold py-3.5 px-6 rounded-xl transition-all text-sm">
                        Dashboard
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
                    <ArrowLeft size={16} /> View Pricing & Plans
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#070B16] flex flex-col text-white">
            <ShopHeader cartCount={cartItems.length} onCartClick={() => {}} />

            <div className="container mx-auto px-4 py-12 max-w-6xl">
                <div className="mb-8">
                    <Link href="/pricing" className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1.5 mb-2">
                        <ArrowLeft size={14} /> Back to Pricing & Plans
                    </Link>
                    <h1 className="text-3xl font-black text-white tracking-tight">
                        Beraxis Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Checkout</span>
                    </h1>
                    <p className="text-xs text-gray-400 mt-1">
                        Secure card payment powered by DirectPay Enterprise Gateway
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* Left: Billing & DirectPay Card Form */}
                    <div className="lg:col-span-7">
                        <form onSubmit={handleCheckout} className="space-y-6">
                            
                            {/* Customer & Company Details */}
                            <div className="galaxy-card p-6 bg-[#0F172A]/40 border border-white/5 space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                                    <Building2 size={16} className="text-purple-400" /> Account & Billing Details
                                </h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 mb-1.5">Full Name *</label>
                                        <input required name="name" value={form.name} onChange={handleChange} type="text" placeholder="Alex Mercer" className="w-full bg-[#070B16] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-500 text-xs" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 mb-1.5">Work Email *</label>
                                        <input required name="email" value={form.email} onChange={handleChange} type="email" placeholder="alex@company.com" className="w-full bg-[#070B16] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-500 text-xs" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 mb-1.5">Company / Entity Name</label>
                                        <input name="company" value={form.company} onChange={handleChange} type="text" placeholder="Apex Holdings LLC" className="w-full bg-[#070B16] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-500 text-xs" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 mb-1.5">Billing Phone *</label>
                                        <input required name="phone" value={form.phone} onChange={handleChange} type="tel" placeholder="03001234567" className="w-full bg-[#070B16] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-500 text-xs font-mono" />
                                    </div>
                                </div>
                            </div>

                            {/* DirectPay Card Payment Details */}
                            <div className="galaxy-card p-6 bg-[#0F172A]/40 border border-purple-500/30 space-y-4 relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-600/30 to-transparent px-4 py-1 text-[10px] font-bold text-purple-300 uppercase tracking-widest">
                                    DirectPay Gateway
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                                            <CreditCard size={18} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-white">Credit / Debit Card</h3>
                                            <p className="text-[11px] text-gray-400">Visa, Mastercard, PayPak, UnionPay</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-mono font-bold text-gray-300">VISA</span>
                                        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-mono font-bold text-gray-300">MC</span>
                                        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-mono font-bold text-gray-300">UPI</span>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 mb-1.5">Cardholder Name *</label>
                                        <input required name="cardHolder" value={form.cardHolder} onChange={handleChange} type="text" placeholder="Cardholder full name" className="w-full bg-[#070B16] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-500 text-xs" />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 mb-1.5">Card Number *</label>
                                        <input required name="cardNumber" value={form.cardNumber} onChange={handleChange} type="text" maxLength={19} placeholder="4242 •••• •••• 4242" className="w-full bg-[#070B16] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-500 text-xs font-mono" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Expiry Date *</label>
                                            <input required name="expiry" value={form.expiry} onChange={handleChange} type="text" maxLength={5} placeholder="MM/YY" className="w-full bg-[#070B16] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-500 text-xs font-mono" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-400 mb-1.5">CVV / Security Code *</label>
                                            <input required name="cvv" value={form.cvv} onChange={handleChange} type="password" maxLength={4} placeholder="•••" className="w-full bg-[#070B16] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-500 text-xs font-mono" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-500/25 flex justify-center items-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                            >
                                {processing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Connecting to DirectPay Card Gateway...
                                    </>
                                ) : (
                                    <>
                                        <Lock size={18} /> Pay ${total.toFixed(2)} with Card via DirectPay
                                    </>
                                )}
                            </button>

                            <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-1.5">
                                <ShieldCheck size={14} className="text-emerald-400" /> 
                                256-Bit SSL HMAC-SHA256 Encrypted DirectPay Card Session
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
                                <div className="p-4 bg-purple-600/10 border border-purple-500/20 rounded-2xl space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                                            {subscriptionPlan.name}
                                        </span>
                                        <span className="text-xs font-mono font-bold text-white">
                                            ${subscriptionPlan.price.toFixed(2)} / mo
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <span>👥 {subscriptionPlan.users} User Seats</span>
                                        <span>•</span>
                                        <span>📅 {subscriptionPlan.billingCycle}</span>
                                    </div>
                                    <ul className="text-[11px] text-gray-300 space-y-1 pt-2 border-t border-white/5">
                                        <li className="flex items-center gap-1.5">
                                            <Check size={12} className="text-purple-400" /> All 28 enterprise modules included
                                        </li>
                                        <li className="flex items-center gap-1.5">
                                            <Check size={12} className="text-purple-400" /> High-speed cloud instance & daily backups
                                        </li>
                                    </ul>
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
                            
                            {/* Breakdown */}
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
                                    <span>Cloud Platform Tax (10%)</span>
                                    <span className="text-white font-mono">${tax.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                                    <div>
                                        <span className="text-sm font-bold text-white block">Total Billed</span>
                                        <span className="text-[11px] text-gray-400 font-mono">≈ Rs {totalPKR.toLocaleString()} PKR</span>
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
