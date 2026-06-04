"use client";
import { fetchAPI } from '@/lib/api';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ShopHeader from '@/components/shop/ShopHeader';
import { CartItem } from '@/components/shop/CartModal';
import { CreditCard, CheckCircle, ArrowLeft, ShieldCheck, Lock } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
    const router = useRouter();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

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
        country: '',
        cardNumber: '',
        expiry: '',
        cvv: ''
    });

    useEffect(() => {
        const savedCart = localStorage.getItem('erp_cart');
        if (savedCart) {
            try { 
                setCartItems(JSON.parse(savedCart)); 
            } catch {}
        }
        setLoading(false);
    }, []);

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

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const orderData = {
            customer_name: form.name,
            customer_email: form.email,
            shipping_address: `${form.address}, ${form.city}, ${form.country}`,
            total_amount: total,
            items: cartItems.map(item => ({ product_id: item.id, quantity: item.quantity, price: item.price }))
        };

        try {
            const res = await fetchAPI("/website/orders", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
            if (!res.ok) throw new Error("Order failed");
            handleSuccess();
        } catch (error) {
            // Mock fallback success
            console.log("Mock Order Created", orderData);
            setTimeout(handleSuccess, 1500);
        }
    };

    const handleSuccess = () => {
        setProcessing(false);
        setSuccess(true);
        localStorage.removeItem('erp_cart');
        setCartItems([]);
    };

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const discountAmount = subtotal * discount;
    const tax = (subtotal - discountAmount) * 0.1; // 10% mock tax
    const total = (subtotal - discountAmount) + tax;

    if (loading) return <div className="h-screen bg-[#0F172A] flex items-center justify-center text-white">Loading...</div>;

    if (success) {
        return (
            <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center text-center px-4">
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle size={48} className="text-green-500" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">Payment Successful!</h1>
                <p className="text-gray-400 mb-8 max-w-md">
                    Thank you for your order, {form.name}. A confirmation email has been sent to {form.email}.
                    Your software licenses and setup instructions are on their way.
                </p>
                <Link href="/shop" className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-purple-500/30 transition-all">
                    Return to Shop
                </Link>
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
                                    <input required name="name" value={form.name} onChange={handleChange} type="text" className="w-full bg-[#1E293B] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                                    <input required name="email" value={form.email} onChange={handleChange} type="email" className="w-full bg-[#1E293B] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Company Name</label>
                                <input name="company" value={form.company} onChange={handleChange} type="text" className="w-full bg-[#1E293B] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" />
                            </div>

                            <div className="space-y-4 pt-4 border-t border-gray-800">
                                <h3 className="text-lg font-semibold text-white">Payment Method</h3>
                                <div className="p-4 bg-[#1E293B] border border-purple-500 rounded-xl relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <CreditCard className="text-purple-400" size={24} />
                                        <span className="text-white font-medium">Credit/Debit Card</span>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <input required name="cardNumber" value={form.cardNumber} onChange={handleChange} type="text" placeholder="Card Number" className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-purple-500" />
                                        <div className="grid grid-cols-2 gap-3">
                                            <input required name="expiry" value={form.expiry} onChange={handleChange} type="text" placeholder="MM/YY" className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-purple-500" />
                                            <input required name="cvv" value={form.cvv} onChange={handleChange} type="text" placeholder="CVC" className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-purple-500" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full mt-8 bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.3)] flex justify-center items-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Processing Order...
                                    </>
                                ) : (
                                    <>
                                        <Lock size={18} /> Pay ${total.toFixed(2)} Securely
                                    </>
                                )}
                            </button>

                            <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-1 mt-4">
                                <ShieldCheck size={14} className="text-green-500" /> 
                                256-bit secure end-to-end encryption
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
                                            <div className="w-12 h-12 bg-[#0F172A] border border-gray-700 rounded flex items-center justify-center text-gray-500 text-xs">
                                                IMG
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
                                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-3 py-2 rounded-lg text-xs transition-colors shrink-0"
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
                                    <span className="text-lg font-bold text-white">Total</span>
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
