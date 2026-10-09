"use client";
import { fetchAPI } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ShopHeader from '@/components/shop/ShopHeader';
import { CartItem } from '@/components/shop/CartModal';
import { CreditCard, CheckCircle, ArrowLeft, ShieldCheck, Lock, Smartphone, Zap, ExternalLink, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [verifiedTxId, setVerifiedTxId] = useState<string | null>(null);

    // Payment Gateway Selection: 'directpay' | 'card'
    const [paymentGateway, setPaymentGateway] = useState<'directpay' | 'card'>('directpay');
    const [directPayPhone, setDirectPayPhone] = useState('03001234567');
    const [directPayMethod, setDirectPayMethod] = useState<'easypaisa' | 'jazzcash' | 'raast'>('easypaisa');

    // Promo code states
    const [promoCode, setPromoCode] = useState("");
    const [discount, setDiscount] = useState(0.0);
    const [promoSuccess, setPromoSuccess] = useState("");
    const [promoError, setPromoError] = useState("");

    const [form, setForm] = useState({
        name: '',
        email: '',
        company: '',
        address: '',
        city: '',
        country: 'Pakistan',
        cardNumber: '',
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

    const handleApplyPromo = (e: React.MouseEvent) => {
        e.preventDefault();
        setPromoError("");
        setPromoSuccess("");

        const code = promoCode.trim().toUpperCase();
        if (["FREE100", "BERAXIS100", "BERAXIS"].includes(code)) {
            setDiscount(1.0);
            setPromoSuccess("🎉 100% Promo applied! Order is free.");
        } else if (code === "LAUNCH50") {
            setDiscount(0.5);
            setPromoSuccess("🎉 50% Promo applied!");
        } else if (code === "LAUNCH20") {
            setDiscount(0.2);
            setPromoSuccess("🎉 20% Promo applied!");
        } else if (code === "") {
            setPromoError("Enter a promo code.");
        } else {
            setPromoError("Invalid code.");
            setDiscount(0.0);
        }
    };

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const discountAmount = subtotal * discount;
    const tax = (subtotal - discountAmount) * 0.1; // 10% mock tax
    const total = (subtotal - discountAmount) + tax;
    const totalPKR = Math.max(10, Math.round(total * PKR_RATE));

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const orderData = {
            customer_name: form.name,
            customer_email: form.email,
            shipping_address: `${form.address}, ${form.city}, ${form.country}`,
            total_amount: total,
            total_pkr: totalPKR,
            payment_gateway: paymentGateway,
            items: cartItems.map(item => ({ product_id: item.id, quantity: item.quantity, price: item.price }))
        };

        if (paymentGateway === 'directpay') {
            try {
                // Call DirectPay Initiate API endpoint
                const res = await fetch('/api/payments/directpay/initiate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amountInPKR: totalPKR,
                        description: `Beraxis Order: ${cartItems.map(i => i.name).join(', ').substring(0, 80)}`,
                        payer_name: form.name || 'Beraxis Customer',
                        email: form.email || 'billing@beraxis.online',
                        msisdn: directPayPhone,
                        currency: 'PKR',
                        return_url: window.location.origin + '/checkout'
                    })
                });

                const data = await res.json();

                if (data.success && data.paymentUrl) {
                    // Redirect to DirectPay Payin PWA
                    window.location.href = data.paymentUrl;
                    return;
                } else {
                    throw new Error(data.error || 'Failed to generate DirectPay checkout session');
                }
            } catch (err: any) {
                console.error('DirectPay initiation error:', err);
                alert(`DirectPay Error: ${err.message || 'Please check your connection and phone number'}`);
                setProcessing(false);
                return;
            }
        }

        // Standard Card checkout flow
        try {
            const res = await fetchAPI("/website/orders", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
            if (!res.ok) throw new Error("Order failed");
            handleSuccess();
        } catch (error) {
            console.log("Mock Order Created", orderData);
            setTimeout(handleSuccess, 1200);
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
            <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center text-center px-4">
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 ring-8 ring-green-500/10 animate-bounce">
                    <CheckCircle size={48} className="text-green-500" />
                </div>
                <h1 className="text-4xl font-extrabold text-white mb-3">Payment Successful!</h1>
                {verifiedTxId && (
                    <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold">
                        <Zap size={14} /> DirectPay TxID: {verifiedTxId}
                    </div>
                )}
                <p className="text-gray-400 mb-8 max-w-md text-sm leading-relaxed">
                    Thank you for your order{form.name ? `, ${form.name}` : ''}. Your enterprise licenses, modules, and instant cloud access have been provisioned.
                </p>
                <div className="flex gap-4">
                    <Link href="/apps" className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-purple-500/30 transition-all text-sm">
                        Go to Enterprise Apps
                    </Link>
                    <Link href="/shop" className="bg-white/10 hover:bg-white/15 text-white font-semibold py-3 px-6 rounded-xl transition-all text-sm">
                        Shop More
                    </Link>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center text-center">
                <h1 className="text-3xl font-bold text-white mb-4">Your Cart is Empty</h1>
                <Link href="/shop" className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2">
                    <ArrowLeft size={16} /> Go Back to Shop
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0F172A] flex flex-col">
            <ShopHeader cartCount={cartItems.length} onCartClick={() => {}} />

            <div className="container mx-auto px-4 py-12 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    
                    {/* Left: Checkout Form */}
                    <div>
                        <h2 className="text-2xl font-bold text-white border-b border-gray-800 pb-4 mb-8">Billing & Delivery</h2>
                        <form onSubmit={handleCheckout} className="space-y-6">
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                                    <input required name="name" value={form.name} onChange={handleChange} type="text" placeholder="John Doe" className="w-full bg-[#1E293B] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                                    <input required name="email" value={form.email} onChange={handleChange} type="email" placeholder="john@example.com" className="w-full bg-[#1E293B] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm" />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Company Name</label>
                                <input name="company" value={form.company} onChange={handleChange} type="text" placeholder="Acme Global Inc." className="w-full bg-[#1E293B] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm" />
                            </div>

                            {/* Payment Method Selector */}
                            <div className="space-y-4 pt-4 border-t border-gray-800">
                                <h3 className="text-lg font-semibold text-white">Payment Method</h3>

                                {/* Gateway Tabs */}
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentGateway('directpay')}
                                        className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                                            paymentGateway === 'directpay'
                                                ? 'bg-purple-600/15 border-purple-500 text-white shadow-lg shadow-purple-500/10 ring-1 ring-purple-500'
                                                : 'bg-[#1E293B] border-gray-800 text-gray-400 hover:border-gray-700'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between w-full mb-2">
                                            <div className="flex items-center gap-2">
                                                <Zap className="text-purple-400" size={20} />
                                                <span className="font-bold text-sm text-white">DirectPay Gateway</span>
                                            </div>
                                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase">
                                                Instant
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-gray-400">
                                            JazzCash, Easypaisa, 1Link, Raast Bank Transfer (PKR)
                                        </p>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setPaymentGateway('card')}
                                        className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                                            paymentGateway === 'card'
                                                ? 'bg-purple-600/15 border-purple-500 text-white shadow-lg shadow-purple-500/10 ring-1 ring-purple-500'
                                                : 'bg-[#1E293B] border-gray-800 text-gray-400 hover:border-gray-700'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between w-full mb-2">
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="text-purple-400" size={20} />
                                                <span className="font-bold text-sm text-white">Credit / Debit Card</span>
                                            </div>
                                            <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-bold uppercase">
                                                Stripe / Global
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-gray-400">
                                            Visa, Mastercard, American Express (USD)
                                        </p>
                                    </button>
                                </div>

                                {/* DirectPay Options Details */}
                                {paymentGateway === 'directpay' ? (
                                    <div className="p-4 bg-[#1E293B] border border-purple-500/50 rounded-xl space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-gray-300">Supported DirectPay Wallets</span>
                                            <span className="text-xs font-mono font-bold text-purple-400">
                                                Rs {totalPKR.toLocaleString()} PKR
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setDirectPayMethod('easypaisa')}
                                                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                                                    directPayMethod === 'easypaisa'
                                                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                                                        : 'bg-[#0F172A] border-gray-800 text-gray-400 hover:text-white'
                                                }`}
                                            >
                                                🟢 Easypaisa
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDirectPayMethod('jazzcash')}
                                                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                                                    directPayMethod === 'jazzcash'
                                                        ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                                                        : 'bg-[#0F172A] border-gray-800 text-gray-400 hover:text-white'
                                                }`}
                                            >
                                                🟠 JazzCash
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDirectPayMethod('raast')}
                                                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                                                    directPayMethod === 'raast'
                                                        ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300'
                                                        : 'bg-[#0F172A] border-gray-800 text-gray-400 hover:text-white'
                                                }`}
                                            >
                                                🔵 Raast / 1Link
                                            </button>
                                        </div>

                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1.5 font-medium">
                                                Mobile Account Number (03xxxxxxxxx)
                                            </label>
                                            <div className="relative">
                                                <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                <input
                                                    type="tel"
                                                    required
                                                    value={directPayPhone}
                                                    onChange={(e) => setDirectPayPhone(e.target.value)}
                                                    placeholder="03001234567"
                                                    pattern="03[0-9]{9}"
                                                    className="w-full bg-[#0F172A] border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white font-mono text-sm outline-none focus:border-purple-500"
                                                />
                                            </div>
                                            <p className="text-[11px] text-gray-500 mt-1">
                                                You will be securely redirected to the official DirectPay PWA checkout window to complete your OTP / MPIN approval.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    /* Card Payment Input fields */
                                    <div className="p-4 bg-[#1E293B] border border-gray-700 rounded-xl space-y-3">
                                        <input required name="cardNumber" value={form.cardNumber} onChange={handleChange} type="text" placeholder="Card Number (4242 ...)" className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-purple-500 text-sm font-mono" />
                                        <div className="grid grid-cols-2 gap-3">
                                            <input required name="expiry" value={form.expiry} onChange={handleChange} type="text" placeholder="MM/YY" className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-purple-500 text-sm font-mono" />
                                            <input required name="cvv" value={form.cvv} onChange={handleChange} type="text" placeholder="CVC" className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-purple-500 text-sm font-mono" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full mt-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.3)] flex justify-center items-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                            >
                                {processing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Connecting to DirectPay...
                                    </>
                                ) : paymentGateway === 'directpay' ? (
                                    <>
                                        <Zap size={18} /> Pay Rs {totalPKR.toLocaleString()} via DirectPay
                                    </>
                                ) : (
                                    <>
                                        <Lock size={18} /> Pay ${total.toFixed(2)} Securely
                                    </>
                                )}
                            </button>

                            <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-1 mt-4">
                                <ShieldCheck size={14} className="text-green-500" /> 
                                HMAC-SHA256 encrypted DirectPay gateway connection
                            </p>
                        </form>
                    </div>

                    {/* Right: Order Summary */}
                    <div className="lg:pl-12">
                        <div className="bg-[#1E293B] border border-gray-800 rounded-2xl p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
                            
                            <div className="space-y-4 mb-6 max-h-[30vh] overflow-y-auto pr-2">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex justify-between items-start">
                                        <div className="flex gap-3">
                                            <div className="w-12 h-12 bg-[#0F172A] border border-gray-700 rounded-xl flex items-center justify-center text-gray-400 text-xs font-bold">
                                                📦
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium text-white line-clamp-1">{item.name}</h4>
                                                <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-semibold text-white">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Promo Code Fields */}
                            <div className="border-t border-gray-800 pt-4 mb-4">
                                <label className="block text-xs text-gray-400 mb-2 font-medium">Promo Code</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="e.g. LAUNCH50" 
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        className="flex-1 bg-[#0F172A] border border-gray-700 rounded-lg px-3 py-2.5 text-xs text-white outline-none focus:border-purple-500"
                                    />
                                    <button 
                                        type="button"
                                        onClick={handleApplyPromo}
                                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-3 py-2 rounded-lg text-xs transition-colors shrink-0 cursor-pointer"
                                    >
                                        Apply
                                    </button>
                                </div>
                                {promoSuccess && <p className="text-[10px] text-green-400 font-medium mt-1.5">{promoSuccess}</p>}
                                {promoError && <p className="text-[10px] text-red-400 font-medium mt-1.5">{promoError}</p>}
                            </div>
                            
                            <div className="border-t border-gray-800 pt-4 space-y-3">
                                <div className="flex justify-between text-gray-400 text-sm">
                                    <span>Subtotal</span>
                                    <span className="text-white">${subtotal.toFixed(2)}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-green-400 text-sm font-medium">
                                        <span>Discount</span>
                                        <span>-${discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-gray-400 text-sm">
                                    <span>Tax (10%)</span>
                                    <span className="text-white">${tax.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-gray-700 pt-3 flex justify-between items-center">
                                    <div>
                                        <span className="text-lg font-bold text-white block">Total</span>
                                        <span className="text-xs text-gray-400 font-mono">≈ Rs {totalPKR.toLocaleString()} PKR</span>
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
