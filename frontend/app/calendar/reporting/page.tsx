"use client";

import { Search, BarChart2, PieChart, LineChart, Settings } from 'lucide-react';

export default function ReportingPage() {
    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-[#1E293B]">
                <div className="flex items-center gap-4">
                    <span className="text-lg font-semibold text-gray-200">All Appointments</span>
                    <button className="text-gray-400 hover:text-white">
                        <Settings size={16} />
                    </button>
                </div>

                <div className="flex-1 max-w-xl mx-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full bg-[#0F172A] border border-gray-600 rounded px-10 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-purple-500"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-[#0F172A] rounded border border-gray-600 p-0.5">
                        <button className="px-3 py-1 bg-gray-700 text-white text-xs rounded-sm">Measures</button>
                        <button className="px-3 py-1 text-gray-400 text-xs hover:text-white">Insert in Spreadsheet</button>
                    </div>
                    <div className="flex items-center bg-[#0F172A] rounded border border-gray-600 p-0.5">
                        <button className="p-1.5 hover:bg-gray-700 rounded text-gray-400"><BarChart2 size={16} /></button>
                        <button className="p-1.5 hover:bg-gray-700 rounded text-gray-400"><LineChart size={16} /></button>
                        <button className="p-1.5 hover:bg-gray-700 rounded text-gray-400"><PieChart size={16} /></button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center bg-[#1E293B] text-center">
                <div className="bg-white/5 p-8 rounded-full mb-4">
                    <div className="w-16 h-16 bg-white rounded flex items-center justify-center">
                        <span className="text-2xl">📄</span>
                    </div>
                </div>
                <h2 className="text-xl font-bold text-gray-200 mb-2">No data yet!</h2>
                <p className="text-gray-400">Use this menu to overview your Appointments once you get some bookings.</p>
            </div>
        </div>
    );
}
