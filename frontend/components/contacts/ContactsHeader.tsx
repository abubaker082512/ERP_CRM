"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Settings, MessageSquare, Bot, LayoutGrid, List, Filter, ChevronDown, Users } from 'lucide-react';

export default function ContactsHeader({ onNewClick }: { onNewClick?: () => void }) {
    return (
        <header className="bg-[#1E293B] border-b border-gray-700 text-white">
            <div className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-gray-200 hover:text-white">
                        <div className="bg-blue-600 w-7 h-7 flex items-center justify-center rounded text-sm font-bold text-white">
                            <Users size={16} />
                        </div>
                        Contacts
                    </Link>

                    <nav className="flex items-center gap-6 ml-4">
                        <Link href="/contacts" className="text-white text-sm font-medium">Contacts</Link>
                        <Link href="/contacts/config" className="text-gray-400 hover:text-gray-200 text-sm font-medium">Configuration</Link>
                    </nav>
                </div>

                <div className="flex-1 max-w-xl mx-8">
                    <div className="relative flex items-center">
                        <Search className="absolute left-3 text-gray-400" size={16} />
                        <div className="absolute left-9 bg-purple-600/20 text-purple-300 px-2 py-0.5 rounded text-xs flex items-center gap-1 border border-purple-600/30">
                            <Filter size={10} />
                            Individuals
                            <button className="hover:text-white"><span className="sr-only">Remove</span>×</button>
                        </div>
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full bg-[#0F172A] border border-gray-600 rounded px-10 py-1.5 pl-32 text-sm text-gray-200 focus:outline-none focus:border-purple-500"
                        />
                        <button className="absolute right-2 text-gray-400 hover:text-white">
                            <ChevronDown size={14} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-[#0F172A] rounded border border-gray-600 p-0.5 mr-4">
                        <button className="p-1.5 bg-gray-700 rounded text-white"><LayoutGrid size={16} /></button>
                        <button className="p-1.5 hover:bg-gray-700 rounded text-gray-400"><List size={16} /></button>
                    </div>

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
