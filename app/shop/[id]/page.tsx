"use client";
import { fetchAPI } from '@/lib/api';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ShopHeader from '@/components/shop/ShopHeader';
import CartModal, { CartItem } from '@/components/shop/CartModal';
import { ArrowLeft, Check, Package, Shield, Truck, Zap } from 'lucide-react';
import Link from 'next/link';

type Product = {
    id: string;
    name: string;
    description: string;
    sale_price: number;
    currency: string;
    is_published: boolean;
};

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetchAPI(`/website/products/${id}`);
                if (res.ok) {
                    setProduct(await res.json());
                } else {
                    throw new Error("Failed");
                }
            } catch (err) {
                // Mock fallback
                setProduct({
                    id,
                    name: "Enterprise Software Subscription",
                    description: "Unlock full capabilities of your ERP platform with our enterprise subscription. Includes advanced AI features, priority support, and unlimited data retention. Designed specifically to scale with massive teams and highly complex workflows. Built by industry veterans.",
                    sale_price: 299.00,
                    currency: 'USD',
                    is_published: true
                });
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();

        const savedCart = localStorage.getItem('erp_cart');
        if (savedCart) {
            try { setCartItems(JSON.parse(savedCart)); } catch {}
        }
    }, [id]);

    useEffect(() => {
        localStorage.setItem('erp_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = () => {
        if (!product) return;
        setCartItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
            }
            return [...prev, { id: product.id, name: product.name, price: product.sale_price, quantity }];
        });
        setIsCartOpen(true);
    };

    if (loading) return <div className="h-screen bg-[#0F172A] flex items-center justify-center text-white">Loading...</div>;
    if (!product) return <div className="h-screen bg-[#0F172A] flex items-center justify-center text-white">Product Not Found</div>;

    return (
        <div className="flex flex-col min-h-screen bg-[#0F172A]">
            <ShopHeader 
                cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)} 
                onCartClick={() => setIsCartOpen(true)} 
            />

            <CartModal 
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                items={cartItems}
                updateQuantity={(id, q) => setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: q } : item))}
                removeItem={(id) => setCartItems(prev => prev.filter(item => item.id !== id))}
            />

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <Link href="/shop" className="inline-flex items-center text-gray-400 hover:text-white transition gap-2 mb-8 font-medium text-sm">
                    <ArrowLeft size={16} /> Back to Catalog
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                    
                    {/* Left: Product Image Placeholder */}
                    <div className="bg-[#1E293B] border border-gray-800 rounded-3xl overflow-hidden aspect-square flex items-center justify-center relative shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/20 to-blue-900/10"></div>
                        <Package size={120} className="text-gray-700 relative z-10" />
                    </div>

                    {/* Right: Product Details & Actions */}
                    <div className="flex flex-col justify-center">
                        <div className="mb-2">
                            <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold px-2 py-1 uppercase tracking-wider rounded">Software Product</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4">{product.name}</h1>
                        <p className="text-4xl font-black text-white mb-6">
                            <span className="text-2xl text-gray-400 font-bold align-top mr-1">$</span>
                            {product.sale_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>

                        <div className="bg-[#1E293B]/50 border border-gray-800 rounded-xl p-5 mb-8">
                            <h3 className="text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">Description</h3>
                            <p className="text-gray-400 leading-relaxed text-base">{product.description}</p>
                        </div>

                        {/* Add to Cart Control */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className="flex items-center bg-[#1E293B] border border-gray-700 rounded-xl overflow-hidden h-14">
                                <button 
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="px-4 text-gray-400 hover:text-white hover:bg-gray-800 h-full transition"
                                >-</button>
                                <span className="w-12 text-center text-lg font-bold text-white">{quantity}</span>
                                <button 
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="px-4 text-gray-400 hover:text-white hover:bg-gray-800 h-full transition"
                                >+</button>
                            </div>
                            
                            <button 
                                onClick={addToCart}
                                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold text-lg h-14 rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] transition-all"
                            >
                                Add to Cart
                            </button>
                        </div>

                        {/* Feature Badges */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
                            <div className="flex items-center gap-3 text-gray-400">
                                <Zap className="text-yellow-500" size={20} />
                                <span className="text-sm font-medium">Instant Activation</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-400">
                                <Shield className="text-green-500" size={20} />
                                <span className="text-sm font-medium">Secure Payment</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-400">
                                <Check className="text-blue-500" size={20} />
                                <span className="text-sm font-medium">Money-back Guarantee</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-400">
                                <Truck className="text-purple-500" size={20} />
                                <span className="text-sm font-medium">Digital Delivery</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
