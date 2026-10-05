"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Search, Menu, Package, ArrowLeft, LayoutGrid, Globe } from 'lucide-react';

export default function ShopHeader({ cartCount, onCartClick }: { cartCount: number, onCartClick: () => void }) {
    return (
        <header className="bg-[#1E293B] border-b border-gray-700 text-white sticky top-0 z-40 shadow-sm transition-colors">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                
                {/* Logo Area */}
                <div className="flex items-center gap-6">
                    
                    {/* Back Button */}
                    <button
                        onClick={() => router.back()}
                        title="Go back"
                        className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-semibold cursor-pointer shrink-0"
                    >
                        <ArrowLeft size={16} />
                        <span className="hidden sm:inline">Back</span>
                    </button>

                    {/* Apps Dashboard Launcher Button */}
                    <Link
                        href="/apps"
                        title="Workspace Apps Dashboard"
                        className="flex items-center gap-1 text-gray-400 hover:text-purple-300 transition-colors p-1.5 rounded-lg hover:bg-purple-600/20 shrink-0"
                    >
                        <LayoutGrid size={18} />
                    </Link>

                    {/* Public Website Button */}
                    <Link
                        href="/"
                        title="Public Website"
                        className="flex items-center gap-1 text-gray-400 hover:text-cyan-300 transition-colors p-1.5 rounded-lg hover:bg-cyan-600/20 shrink-0"
                    >
                        <Globe size={18} />
                    </Link>

                    <Link href="/shop" className="flex items-center gap-2">
                        <div className="bg-purple-600 w-8 h-8 rounded flex items-center justify-center text-white">
                            <Package size={20} />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white hover:text-purple-400 transition-colors">ERP Shop</span>
                    </Link>
                    
                    <nav className="hidden md:flex items-center gap-6 ml-4">
                        <Link href="/shop" className="text-sm font-medium text-purple-400">Products</Link>
                        <Link href="/shop" className="text-sm font-medium text-gray-400 hover:text-white transition">Categories</Link>
                        <Link href="/pricing" className="text-sm font-medium text-gray-400 hover:text-white transition">About Us</Link>
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
