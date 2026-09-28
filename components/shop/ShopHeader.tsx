"use client";

import Link from 'next/link';
import { ShoppingCart, Search, Menu, Package } from 'lucide-react';

export default function ShopHeader({ cartCount, onCartClick }: { cartCount: number, onCartClick: () => void }) {
    return (
        <header className="bg-[#1E293B] border-b border-gray-700 text-white sticky top-0 z-40 shadow-sm transition-colors">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                
                {/* Logo Area */}
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="bg-purple-600 w-8 h-8 rounded flex items-center justify-center text-white">
                            <Package size={20} />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white hover:text-purple-400 transition-colors">ERP Shop</span>
                    </Link>
                    
                    <nav className="hidden md:flex items-center gap-6 ml-4">
                        <Link href="/shop" className="text-sm font-medium text-purple-400">Products</Link>
                        <Link href="#" className="text-sm font-medium text-gray-400 hover:text-white transition">Categories</Link>
                        <Link href="#" className="text-sm font-medium text-gray-400 hover:text-white transition">About Us</Link>
                        <Link href="/" className="text-sm font-medium text-gray-400 hover:text-white transition">Employee Portal</Link>
                    </nav>
                </div>
                
                {/* Right Actions */}
                <div className="flex items-center gap-5">
                    <button className="text-gray-400 hover:text-white transition">
                        <Search size={20} />
                    </button>
                    <button onClick={onCartClick} className="relative text-gray-400 hover:text-white transition">
                        <ShoppingCart size={20} />
                        {cartCount > 0 && (
                            <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                                {cartCount}
                            </span>
                        )}
                    </button>
                    <button className="md:hidden text-gray-400 hover:text-white transition">
                        <Menu size={24} />
                    </button>
                </div>
            </div>
        </header>
    );
}
