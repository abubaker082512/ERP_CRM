"use client";

import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Settings, Filter, Calendar as CalendarIcon, Share2, Plus } from 'lucide-react';
import NewAppointmentModal from '@/components/NewAppointmentModal';

export default function CalendarPage() {
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 6am to 11pm
    const days = [
        { name: 'SUN', date: 23, isToday: true },
        { name: 'MON', date: 24 },
        { name: 'TUE', date: 25 },
        { name: 'WED', date: 26 },
        { name: 'THU', date: 27 },
        { name: 'FRI', date: 28 },
        { name: 'SAT', date: 29 },
    ];

    return (
        <div className="flex flex-col h-full relative">
            <NewAppointmentModal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} />
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-[#1E293B]">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsNewModalOpen(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
                    >
                        New
                    </button>
                    <span className="text-lg font-semibold text-gray-200">Meetings</span>
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
                        <button className="p-1.5 hover:bg-gray-700 rounded text-gray-400"><CalendarIcon size={16} /></button>
                        <button className="p-1.5 hover:bg-gray-700 rounded text-gray-400"><Filter size={16} /></button>
                    </div>
                </div>
            </div>

            {/* Secondary Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-[#1E293B]">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <button className="p-1 hover:bg-gray-700 rounded"><ChevronLeft size={20} /></button>
                        <button className="p-1 hover:bg-gray-700 rounded"><ChevronRight size={20} /></button>
                    </div>
                    <button className="px-3 py-1 bg-[#0F172A] border border-gray-600 rounded text-sm hover:bg-gray-700">Week</button>
                    <button className="px-3 py-1 bg-[#0F172A] border border-gray-600 rounded text-sm hover:bg-gray-700">Today</button>
                    <span className="text-sm font-medium text-gray-300">November 2025 Week 48</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Synchronize with</span>
                    <button className="px-3 py-1 bg-purple-600/20 text-purple-400 border border-purple-600/50 rounded text-sm hover:bg-purple-600/30">Google</button>
                    <button className="px-3 py-1 bg-[#0F172A] border border-gray-600 rounded text-sm hover:bg-gray-700 flex items-center gap-2">
                        Share <Share2 size={14} />
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Calendar Grid */}
                <div className="flex-1 flex flex-col overflow-y-auto bg-[#1E293B]">
                    {/* Days Header */}
                    <div className="grid grid-cols-8 border-b border-gray-700 sticky top-0 bg-[#1E293B] z-10">
                        <div className="p-2 border-r border-gray-700 w-16"></div> {/* Time column header */}
                        {days.map((day) => (
                            <div key={day.date} className="p-2 border-r border-gray-700 text-center">
                                <div className="text-xs text-gray-400 uppercase mb-1">{day.name}</div>
                                <div className={`text-lg font-bold inline-flex items-center justify-center w-8 h-8 rounded-full ${day.isToday ? 'bg-red-500 text-white' : 'text-gray-200'}`}>
                                    {day.date}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Time Slots */}
                    <div className="flex-1">
                        {hours.map((hour) => (
                            <div key={hour} className="grid grid-cols-8 border-b border-gray-700/50 min-h-[60px]">
                                <div className="p-2 border-r border-gray-700 text-xs text-gray-500 text-right pr-3 -mt-2.5">
                                    {hour > 12 ? `${hour - 12}pm` : `${hour}am`}
                                </div>
                                {days.map((day) => (
                                    <div key={`${day.date}-${hour}`} className="border-r border-gray-700/50 relative hover:bg-white/5 transition-colors group">
                                        {/* Add button on hover */}
                                        <button className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                            <Plus className="text-gray-500" size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="w-72 bg-[#1E293B] border-l border-gray-700 p-4 hidden lg:block overflow-y-auto">
                    {/* Mini Calendar Mockup */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <button><ChevronLeft size={16} /></button>
                            <span className="text-sm font-medium">November 2025</span>
                            <button><ChevronRight size={16} /></button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 text-gray-400">
                            <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-sm">
                            {/* Mock days */}
                            {Array.from({ length: 30 }, (_, i) => (
                                <div key={i} className={`p-1 rounded hover:bg-gray-700 cursor-pointer ${i === 22 ? 'bg-red-500 text-white' : 'text-gray-300'}`}>
                                    {i + 1}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Attendees */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                                <input type="checkbox" checked readOnly className="rounded bg-gray-700 border-gray-600 text-purple-600" />
                                Attendees
                            </h3>
                            <ChevronLeft size={14} className="rotate-270" />
                        </div>
                        <div className="space-y-2 pl-6">
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                <div className="w-5 h-5 bg-green-600 rounded text-[10px] flex items-center justify-center font-bold text-white">A</div>
                                <span>Muhammad Abu Baker...</span>
                            </div>
                            <button className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 mt-2">
                                <Plus size={12} /> Add Attendees
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
