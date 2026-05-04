"use client";

import { useState, useEffect } from 'react';
import { Search, Command } from 'lucide-react';

export default function GlobalSearch() {
    const [focused, setFocused] = useState(false);
    const [query, setQuery] = useState('');

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('global-search-input')?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className={`relative group transition-all duration-300 ${focused ? 'w-80' : 'w-64'}`}>
            <div className={`absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur-lg transition-opacity duration-300 ${focused ? 'opacity-100' : 'opacity-0'}`}></div>
            
            <div className={`relative flex items-center bg-white/5 border rounded-xl px-3 py-2 transition-all duration-300 ${
                focused ? 'border-purple-500 bg-white/10' : 'border-white/10 group-hover:border-white/20'
            }`}>
                <Search size={16} className={`mr-2 transition-colors duration-300 ${focused ? 'text-purple-400' : 'text-gray-500'}`} />
                <input
                    id="global-search-input"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder="Search Galaxy..."
                    className="bg-transparent border-none outline-none text-sm text-white placeholder-gray-500 w-full"
                />
                <div className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 text-[10px] text-gray-500">
                    <Command size={10} />
                    <span>K</span>
                </div>
            </div>

            {/* Results Dropdown (Simplified for now) */}
            {focused && query.length > 1 && (
                <div className="absolute top-full left-0 right-0 mt-2 galaxy-card p-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 px-2 py-1">Quick Links</div>
                    <button className="w-full text-left px-2 py-2 hover:bg-white/5 rounded text-sm text-gray-300 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                        Go to Sales Orders
                    </button>
                    <button className="w-full text-left px-2 py-2 hover:bg-white/5 rounded text-sm text-gray-300 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-pink-500"></div>
                        Create New Lead
                    </button>
                </div>
            )}
        </div>
    );
}
