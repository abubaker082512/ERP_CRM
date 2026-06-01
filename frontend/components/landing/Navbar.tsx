import Link from 'next/link';
import { Database, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed w-full z-50 transition-all duration-300 bg-[#0F172A]/80 backdrop-blur-md border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <Database className="text-purple-500" size={28} />
                        <span className="text-2xl font-bold tracking-tighter text-white">BERAXIS<span className="text-purple-500">.</span></span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex space-x-8 items-center">
                        <Link href="#features" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Features</Link>
                        <Link href="/about" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">About</Link>
                        <Link href="/contact" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Contact</Link>
                        <div className="flex items-center gap-4 ml-4">
                            <Link href="/login" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Log in</Link>
                            <Link href="/signup" className="galaxy-btn-primary !px-5 !py-2 text-sm shadow-lg shadow-purple-500/25">
                                Get Started Free
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-300 hover:text-white focus:outline-none"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-[#0F172A]/95 backdrop-blur-xl border-b border-white/10 absolute w-full">
                    <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col">
                        <Link href="#features" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-md">Features</Link>
                        <Link href="/about" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-md">About</Link>
                        <Link href="/contact" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-md">Contact</Link>
                        <div className="h-px bg-white/10 my-4"></div>
                        <Link href="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-md">Log in</Link>
                        <Link href="/signup" onClick={() => setIsOpen(false)} className="block px-3 py-2 mt-2 text-center galaxy-btn-primary">
                            Get Started Free
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
