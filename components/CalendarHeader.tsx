"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, MessageSquare, Bot } from 'lucide-react';

export default function CalendarHeader() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Calendar', href: '/calendar' },
        { name: 'Appointments', href: '/calendar/appointments' },
        { name: 'Reporting', href: '/calendar/reporting' },
        { name: 'Configuration', href: '/calendar/configuration' },
    ];

    return (
        <header className="bg-[#1E293B] border-b border-gray-700 text-white">
            <div className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-gray-200 hover:text-white">
                        <div className="bg-purple-600 w-7 h-7 flex items-center justify-center rounded text-sm font-bold">31</div>
                        Calendar
                    </Link>
                    <nav className="flex items-center gap-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`text-sm font-medium transition-colors ${pathname === item.href ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <button className="text-gray-400 hover:text-white flex items-center gap-1">
                        <Bot size={18} className="text-purple-400" />
                    </button>
                    <button className="text-gray-400 hover:text-white relative">
                        <MessageSquare size={18} />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-[8px] flex items-center justify-center">1</span>
                    </button>
                    <button className="text-gray-400 hover:text-white">
                        <Settings size={18} />
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
