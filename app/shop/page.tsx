"use client";
import { fetchAPI } from '@/lib/api';

import { useState, useEffect } from 'react';
import ShopHeader from '@/components/shop/ShopHeader';
import CartModal, { CartItem } from '@/components/shop/CartModal';
import Link from 'next/link';

type Product = {
    id: string;
    name: string;
    sale_price: number;
    currency: string;
    is_published: boolean;
};

export default function ShopPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetchAPI("/website/products");
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data.filter((p: Product) => p.is_published));
                } else {
                    throw new Error("API failed");
                }
            } catch (err) {
                // Mock fallback products
                setProducts([
                    { id: '1', name: 'Premium ERP Subscription (Monthly)', sale_price: 299.00, currency: 'USD', is_published: true },
                    { id: '2', name: 'Advanced CRM Add-on', sale_price: 49.00, currency: 'USD', is_published: true },
                    { id: '3', name: 'Dedicated Support Package', sale_price: 150.00, currency: 'USD', is_published: true },
                    { id: '4', name: 'One-Time Setup & Training', sale_price: 999.00, currency: 'USD', is_published: true },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();

        // Load cart from local storage
        const savedCart = localStorage.getItem('erp_cart');
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch {}
        }
    }, []);

    // Save cart to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem('erp_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product: Product) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { id: product.id, name: product.name, price: product.sale_price, quantity: 1 }];
        });
        setIsCartOpen(true);
    };

    const updateQuantity = (id: string, quantity: number) => {
        setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
    };

    const removeItem = (id: string) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

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
                updateQuantity={updateQuantity}
                removeItem={removeItem}
            />

            <main className="flex-1 container mx-auto px-4 py-12">
                <div className="mb-12 text-center max-w-2xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
                        Discover Solutions for Your Business
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Explore our enterprise-grade software packages and professional services designed to scale your operations.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center p-20">
                        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {products.map((product) => (
                            <div key={product.id} className="bg-[#1E293B] border border-gray-800 rounded-2xl overflow-hidden hover:border-purple-500 group transition-all duration-300 shadow-lg hover:shadow-purple-500/10 flex flex-col">
                                <Link href={`/shop/${product.id}`} className="block h-48 bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden flex-shrink-0">
                                    <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:scale-110 transition-transform duration-500">
                                        <span className="text-6xl">📦</span>
                                    </div>
                                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-xs font-semibold py-1 px-2 rounded-md text-white border border-gray-700">
                                        Software
                                    </div>
                                </Link>
                                
                                <div className="p-5 flex-1 flex flex-col justify-between">
                                    <div>
                                        <Link href={`/shop/${product.id}`}>
                                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors line-clamp-2">
                                                {product.name}
                                            </h3>
                                        </Link>
                                        <p className="text-3xl font-bold text-white mt-4 tracking-tight">
                                            <span className="text-lg text-gray-400 align-top mr-1 font-normal">$</span>
                                            {product.sale_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    
                                    <button 
                                        onClick={() => addToCart(product)}
                                        className="mt-6 w-full bg-purple-600/10 text-purple-400 hover:bg-purple-600 hover:text-white border border-purple-600/50 hover:border-purple-600 transition-all font-semibold py-2.5 rounded-xl"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <footer className="border-t border-gray-800 bg-[#1E293B] mt-auto py-12">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-gray-500 text-sm">© 2026 Next-Gen AI ERP. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
