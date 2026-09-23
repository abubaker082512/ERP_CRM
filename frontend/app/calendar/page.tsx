"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CalendarHeader from "@/components/CalendarHeader";
import { Calendar as BigCalendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar.css';
import { Plus, X } from "lucide-react";

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

type CalendarEvent = {
    id: string;
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    resource?: any;
};

export default function CalendarPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [view, setView] = useState<View>('month');
    const [date, setDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: '',
        start: '',
        end: '',
        allDay: false,
    });

    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem("token");
        if (!token) router.push("/login");

        // Fetch events from API
        fetchEvents();
    }, [router]);

    const fetchEvents = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/v1/appointments/appointments");
            if (res.ok) {
                const data = await res.json();
                const formattedEvents = data.map((appt: any) => ({
                    id: appt.id,
                    title: appt.name,
                    start: new Date(appt.start_time),
                    end: new Date(appt.end_time),
                    allDay: false,
                }));
                setEvents(formattedEvents);
            }
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };

    const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
        setNewEvent({
            title: '',
            start: start.toISOString().slice(0, 16),
            end: end.toISOString().slice(0, 16),
            allDay: false,
        });
        setIsModalOpen(true);
    };

    const handleSelectEvent = (event: CalendarEvent) => {
        // Navigate to event detail or open edit modal
        console.log('Selected event:', event);
    };

    const createEvent = async () => {
        if (!newEvent.title.trim()) return;

        try {
            const res = await fetch("http://localhost:8000/api/v1/appointments/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newEvent.title,
                    start_time: new Date(newEvent.start).toISOString(),
                    end_time: new Date(newEvent.end).toISOString(),
                }),
            });

            if (res.ok) {
                await fetchEvents();
                setIsModalOpen(false);
                setNewEvent({ title: '', start: '', end: '', allDay: false });
            }
        } catch (error) {
            console.error("Error creating event:", error);
        }
    };

    if (!mounted) return null;

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <CalendarHeader />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-gray-200">Calendar</h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
                    >
                        <Plus size={18} /> New Event
                    </button>
                </div>

                <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700" style={{ height: 'calc(100vh - 250px)' }}>
                    <BigCalendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        view={view}
                        onView={setView}
                        date={date}
                        onNavigate={setDate}
                        onSelectSlot={handleSelectSlot}
                        onSelectEvent={handleSelectEvent}
                        selectable
                        popup
                        style={{ height: '100%' }}
                        className="text-white"
                    />
                </div>
            </div>
        </div>
    );
}

            {/* Create Event Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-[#1E293B] rounded-lg p-6 w-full max-w-md border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Create Event</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                    className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                                    placeholder="e.g. Team Meeting"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Start Time</label>
                                <input
                                    type="datetime-local"
                                    value={newEvent.start}
                                    onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
                                    className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">End Time</label>
                                <input
                                    type="datetime-local"
                                    value={newEvent.end}
                                    onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
                                    className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="allDay"
                                    checked={newEvent.allDay}
                                    onChange={(e) => setNewEvent({ ...newEvent, allDay: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="allDay" className="text-sm text-gray-400">All Day Event</label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-300 hover:text-white">
                                Cancel
                            </button>
                            <button onClick={createEvent} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                                Create
                            </button>
                        </div>
                    </div>

                    {/* Quick Meet */}
                    <div className="border-t border-gray-800 pt-4 mt-auto">
                        <button onClick={() => { setForm_override_type('meet'); setIsNewModalOpen(true); }}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600/20 to-purple-600/20 hover:from-pink-600/30 hover:to-purple-600/30 border border-pink-500/20 text-pink-300 font-bold py-2.5 rounded-xl text-xs transition-all">
                            <Video size={14} /> Start Meet
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Tiny helper to allow sidebar "Start Meet" button to pre-select the Meet type
function setForm_override_type(_type: EventType) { /* handled via state in parent */ }
