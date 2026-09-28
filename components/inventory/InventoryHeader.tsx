"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Settings, MessageSquare, Bot, LayoutGrid, List, Filter, ChevronDown, Package } from 'lucide-react';

export default function InventoryHeader({ onNewClick }: { onNewClick?: () => void }) {
    const pathname = usePathname();

    const navItems = [
        { name: 'Overview', href: '/inventory' },
        { name: 'Operations', href: '/inventory/operations' },
        { name: 'Products', href: '/inventory/products' },
        { name: 'Reporting', href: '/inventory/reporting' },
        { name: 'Configuration', href: '/inventory/configuration' },
    ];

    return (
        <header className="bg-[#1E293B] border-b border-gray-700 text-white">
            <div className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-gray-200 hover:text-white">
                        <div className="bg-orange-500 w-7 h-7 flex items-center justify-center rounded text-sm font-bold text-white">
                            <Package size={16} />
                        </div>
                        Inventory
                    </Link>

                    <nav className="flex items-center gap-6 ml-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`text-sm font-medium transition-colors ${pathname === item.href || (item.href !== '/inventory' && pathname.startsWith(item.href)) ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex-1 max-w-xl mx-8">
                    <div className="relative flex items-center">
                        <Search className="absolute left-3 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full bg-[#0F172A] border border-gray-600 rounded px-10 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-purple-500"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className="text-gray-400 hover:text-white flex items-center gap-1">
                        <Bot size={18} className="text-purple-400" />
                    </button>
                    <button className="text-gray-400 hover:text-white relative">
                        <MessageSquare size={18} />
                    </button>
                    <div className="flex items-center gap-2 border-l border-gray-600 pl-4">
                        <span className="text-xs text-gray-300 hidden md:inline">ABT IT Innovation PVT LTD.</span>
                        <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center text-xs font-bold">
                            A
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
