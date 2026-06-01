"use client";

import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Settings, Filter, Calendar as CalendarIcon, Share2, Plus, X } from 'lucide-react';
import NewAppointmentModal from '@/components/NewAppointmentModal';
import { fetchAPI } from '@/lib/api';

type Appointment = {
    id: string;
    name: string;
    start_time: string;
    end_time: string;
    state?: string;
};

export default function CalendarPage() {
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [weekOffset, setWeekOffset] = useState(0);
    const [selectedMeeting, setSelectedMeeting] = useState<Appointment | null>(null);
    
    const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 6am to 11pm

    // Dynamically calculate days of the week based on weekOffset state
    const getWeekDays = () => {
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + (weekOffset * 7)));
        const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        
        return dayNames.map((name, i) => {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            return {
                name,
                date: d.getDate(),
                fullDate: d,
                isToday: d.toDateString() === new Date().toDateString()
            };
        });
    };

    const days = getWeekDays();
    const currentMonthLabel = days[0].fullDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const loadAppointments = async () => {
        const res = await fetchAPI('/appointments/appointments');
        if (res.ok) {
            setAppointments(await res.json());
        }
    };

    useEffect(() => {
        loadAppointments();
    }, []);

    // Filter appointments for the visible day & hour in the grid
    const getAppointmentForSlot = (date: Date, hour: number) => {
        return appointments.find(appt => {
            const apptDate = new Date(appt.start_time);
            return apptDate.toDateString() === date.toDateString() && apptDate.getHours() === hour;
        });
    };

    return (
        <div className="flex flex-col h-full relative text-white bg-[#0B101E]">
            <NewAppointmentModal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} onSuccess={loadAppointments} />
            
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-800 bg-[#141A28] shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsNewModalOpen(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-purple-600/20 active:scale-95"
                    >
                        New Meeting
                    </button>
                    <span className="text-lg font-bold text-gray-200">Meetings Calendar</span>
                    <button className="text-gray-500 hover:text-white"><Settings size={16} /></button>
                </div>

                <div className="flex-1 max-w-xl mx-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search meetings..."
                            className="w-full bg-[#1E293B] border border-gray-700 rounded-xl pl-11 pr-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-purple-500"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-[#1E293B] rounded-lg border border-gray-700 p-0.5">
                        <button className="p-2 hover:bg-gray-700 rounded-md text-gray-400"><CalendarIcon size={16} /></button>
                        <button className="p-2 hover:bg-gray-700 rounded-md text-gray-400"><Filter size={16} /></button>
                    </div>
                </div>
            </div>

            {/* Secondary Navigation Toolbar */}
            <div className="flex items-center justify-between px-6 py-2.5 border-b border-gray-800 bg-[#141A28] shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 bg-[#1E293B] p-0.5 border border-gray-700 rounded-lg">
                        <button onClick={() => setWeekOffset(w => w - 1)} className="p-1.5 hover:bg-gray-700 rounded-md text-gray-400 hover:text-white transition-colors"><ChevronLeft size={18} /></button>
                        <button onClick={() => setWeekOffset(w => w + 1)} className="p-1.5 hover:bg-gray-700 rounded-md text-gray-400 hover:text-white transition-colors"><ChevronRight size={18} /></button>
                    </div>
                    <button onClick={() => setWeekOffset(0)} className="px-3.5 py-1.5 bg-[#1E293B] border border-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-700 text-gray-300">Today</button>
                    <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{currentMonthLabel}</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Synchronize</span>
                    <button className="px-3 py-1.5 bg-purple-600/10 text-purple-400 border border-purple-500/20 rounded-lg text-xs font-bold hover:bg-purple-600/20 transition-all">Google Sync</button>
                    <button className="px-3 py-1.5 bg-[#1E293B] border border-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-700 text-gray-300 flex items-center gap-1.5">
                        Share <Share2 size={12} />
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Calendar Grid */}
                <div className="flex-1 flex flex-col overflow-y-auto bg-[#0F172A] pr-1">
                    {/* Days Header */}
                    <div className="grid grid-cols-8 border-b border-gray-800 sticky top-0 bg-[#0F172A] z-10">
                        <div className="p-3 border-r border-gray-800 w-16"></div> {/* Time column header */}
                        {days.map((day) => (
                            <div key={day.date} className="p-3 border-r border-gray-800 text-center">
                                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">{day.name}</div>
                                <div className={`text-sm font-bold inline-flex items-center justify-center w-7 h-7 rounded-full ${day.isToday ? 'bg-red-500 text-white shadow-lg' : 'text-gray-300'}`}>
                                    {day.date}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Time Slots */}
                    <div className="flex-1">
                        {hours.map((hour) => (
                            <div key={hour} className="grid grid-cols-8 border-b border-gray-800/40 min-h-[60px]">
                                <div className="p-2 border-r border-gray-800 text-[10px] text-gray-500 text-right pr-3 -mt-2 font-semibold">
                                    {hour > 12 ? `${hour - 12}pm` : `${hour}am`}
                                </div>
                                {days.map((day) => {
                                    const appt = getAppointmentForSlot(day.fullDate, hour);
                                    return (
                                        <div key={`${day.date}-${hour}`} className="border-r border-gray-800/40 relative hover:bg-white/5 transition-colors group p-1 flex flex-col justify-end">
                                            {appt ? (
                                                <button 
                                                    onClick={() => setSelectedMeeting(appt)}
                                                    className="w-full h-full bg-purple-600/30 hover:bg-purple-600/45 border border-purple-500/35 rounded-lg p-2 text-left transition-all overflow-hidden flex flex-col justify-between"
                                                >
                                                    <span className="text-[11px] font-bold text-white leading-tight truncate w-full">{appt.name}</span>
                                                    <span className="text-[9px] text-purple-300 font-mono">1 hour slot</span>
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => setIsNewModalOpen(true)}
                                                    className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-gray-500 hover:text-white transition-opacity"
                                                >
                                                    <Plus size={18} />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Sidebar (Mini calendar navigation details) */}
                <div className="w-72 bg-[#141A28] border-l border-gray-800 p-5 hidden lg:block overflow-y-auto shrink-0">
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <button onClick={() => setWeekOffset(w => w - 1)} className="text-gray-500 hover:text-white"><ChevronLeft size={16} /></button>
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-300">{currentMonthLabel}</span>
                            <button onClick={() => setWeekOffset(w => w + 1)} className="text-gray-500 hover:text-white"><ChevronRight size={16} /></button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase font-bold mb-2 text-gray-500">
                            <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-xs">
                            {Array.from({ length: 28 }, (_, i) => (
                                <div key={i} className={`p-1.5 rounded hover:bg-gray-800 cursor-pointer ${i === 15 ? 'bg-purple-600 text-white font-bold shadow' : 'text-gray-400'}`}>
                                    {i + 1}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-800">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Visible Attendees</h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2.5 text-sm text-gray-300">
                                <div className="w-6 h-6 bg-purple-600 rounded-full text-[10px] flex items-center justify-center font-bold text-white shadow-inner">A</div>
                                <span>Muhammad Abu Baker</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-sm text-gray-300">
                                <div className="w-6 h-6 bg-green-600 rounded-full text-[10px] flex items-center justify-center font-bold text-white shadow-inner">S</div>
                                <span>Super Admin</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Meeting Detail Modal */}
            {selectedMeeting && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1E293B] border border-gray-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold text-white leading-tight pr-4">{selectedMeeting.name}</h3>
                            <button onClick={() => setSelectedMeeting(null)} className="p-1 hover:bg-white/5 text-gray-400 hover:text-white rounded-lg transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="space-y-3 border-t border-white/5 pt-4">
                            <div className="text-xs text-gray-400">
                                <strong className="text-gray-300 block mb-0.5">Start Time:</strong>
                                {new Date(selectedMeeting.start_time).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-400">
                                <strong className="text-gray-300 block mb-0.5">End Time:</strong>
                                {new Date(selectedMeeting.end_time).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-400">
                                <strong className="text-gray-300 block mb-0.5">Meeting Reference ID:</strong>
                                <span className="font-mono text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">{selectedMeeting.id}</span>
                            </div>
                        </div>
                        <div className="flex justify-end pt-6">
                            <button onClick={() => setSelectedMeeting(null)} className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-lg transition-all">
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
