"use client";
import { useState } from 'react';
import { Search, Settings, Share2, MoreHorizontal } from 'lucide-react';
import NewAppointmentModal from '@/components/NewAppointmentModal';

const appointments = [
    { id: 1, name: 'Paid Consultation', duration: '30 min', type: 'A', color: 'bg-emerald-500', upcoming: 0, total: 0 },
    { id: 2, name: 'Meeting', duration: '1 hour', type: 'A', color: 'bg-emerald-500', upcoming: 0, total: 0 },
    { id: 3, name: 'Video Call', duration: '30 min', type: 'A', color: 'bg-emerald-500', upcoming: 0, total: 0 },
    { id: 4, name: 'Table', duration: '2 hours', type: 'T', color: 'bg-purple-600', upcoming: 0, total: 0, extra: ['Table 4 (6)', 'Table 3 (4)'] },
    { id: 5, name: 'Book a Resource', duration: '1 hour', type: 'R', color: 'bg-yellow-600', upcoming: 0, total: 0, extra: ['Resource 4', 'Resource 3'] },
    { id: 6, name: 'Paid Consultation', duration: '30 min', type: 'A', color: 'bg-emerald-500', upcoming: 0, total: 0 },
    { id: 7, name: 'Paid Seats', duration: '1 hour', type: 'R', color: 'bg-lime-600', upcoming: 0, total: 0, extra: ['Room 4 (20)', 'Room 3 (15)'] },
];

export default function AppointmentsPage() {
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);

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
                    <button className="px-3 py-1.5 bg-[#0F172A] border border-gray-600 rounded text-sm hover:bg-gray-700 text-gray-300">
                        Share
                    </button>
                    <span className="text-lg font-semibold text-gray-200">Appointments</span>
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
                    <span className="text-sm text-gray-400">1-7 / 7</span>
                    <div className="flex items-center bg-[#0F172A] rounded border border-gray-600 p-0.5">
                        <button className="p-1.5 hover:bg-gray-700 rounded text-gray-400"><MoreHorizontal size={16} /></button>
                    </div>
                </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto bg-[#1E293B]">
                <div className="w-full">
                    {appointments.map((apt) => (
                        <div key={apt.id} className="flex items-center justify-between p-4 border-b border-gray-700 hover:bg-white/5 transition-colors">
                            <div className="w-1/4 font-medium text-gray-200">{apt.name}</div>

                            <div className="w-1/6 text-sm text-gray-400">
                                <div>{apt.duration}</div>
                                <div className="text-xs">Duration</div>
                            </div>

                            <div className="w-1/4 flex items-center gap-2">
                                <div className={`w-6 h-6 ${apt.color} rounded flex items-center justify-center text-xs font-bold text-white`}>
                                    {apt.type}
                                </div>
                                {apt.extra && apt.extra.map((ex, i) => (
                                    <div key={i} className={`px-2 py-0.5 rounded text-xs bg-gray-700 text-gray-300 border border-gray-600`}>
                                        {ex}
                                    </div>
                                ))}
                            </div>

                            <div className="w-1/6 text-sm text-gray-400">
                                <div className="text-gray-200">{apt.upcoming} Meetings</div>
                                <div className="text-xs">Upcoming</div>
                            </div>

                            <div className="w-1/6 text-sm text-gray-400">
                                <div className="text-gray-200">{apt.total} Meetings</div>
                                <div className="text-xs">Total</div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button className="px-3 py-1 bg-purple-600/20 text-purple-400 border border-purple-600/50 rounded text-xs hover:bg-purple-600/30">
                                    Share
                                </button>
                                <button className="px-3 py-1 bg-[#0F172A] border border-gray-600 rounded text-xs hover:bg-gray-700 text-gray-300">
                                    Configure
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
