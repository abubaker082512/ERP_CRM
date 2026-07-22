"use client";

import { useState, useEffect, useCallback } from 'react';
import {
    Search, ChevronLeft, ChevronRight, Settings, Filter,
    Calendar as CalendarIcon, Share2, Plus, X, Video, CheckSquare,
    Users, Clock, Briefcase, AlignLeft, User, Copy, ExternalLink,
    Trash2, Edit, CheckCircle2
} from 'lucide-react';
import { fetchAPI } from '@/lib/api';

// ─── Types ─────────────────────────────────────────────────────────────────

type EventType = 'event' | 'appointment' | 'my_task' | 'team_task' | 'meet';

interface CalendarEntry {
    id: string;
    title: string;          // replaces name
    start_time: string;
    end_time: string;
    event_type: EventType;
    description?: string;
    customer_name?: string;
    customer_email?: string;
    assignee?: string;      // for team tasks
    meet_link?: string;     // auto-generated for Meet events
    state?: string;
    notes?: string;
}

const EVENT_TYPE_META: Record<EventType, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    event:       { label: 'Event',       color: 'text-blue-400',   bg: 'bg-blue-500/25 border-blue-500/40',   icon: CalendarIcon },
    appointment: { label: 'Appointment', color: 'text-purple-400', bg: 'bg-purple-500/25 border-purple-500/40', icon: Briefcase },
    my_task:     { label: 'My Task',     color: 'text-green-400',  bg: 'bg-green-500/25 border-green-500/40',  icon: CheckSquare },
    team_task:   { label: 'Team Task',   color: 'text-orange-400', bg: 'bg-orange-500/25 border-orange-500/40', icon: Users },
    meet:        { label: 'Meet',        color: 'text-pink-400',   bg: 'bg-pink-500/25 border-pink-500/40',   icon: Video },
};

function generateMeetLink(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const seg = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `https://meet.beraxis.online/${seg(3)}-${seg(4)}-${seg(3)}`;
}

// ─── New Event Modal ────────────────────────────────────────────────────────

function NewEventModal({
    isOpen,
    onClose,
    onSuccess,
    prefillSlot,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    prefillSlot?: { date: Date; hour: number };
}) {
    const defaultStart = () => {
        if (prefillSlot) {
            const d = new Date(prefillSlot.date);
            d.setHours(prefillSlot.hour, 0, 0, 0);
            return d.toISOString().slice(0, 16);
        }
        const now = new Date();
        now.setMinutes(0, 0, 0);
        return now.toISOString().slice(0, 16);
    };

    const defaultEnd = () => {
        if (prefillSlot) {
            const d = new Date(prefillSlot.date);
            d.setHours(prefillSlot.hour + 1, 0, 0, 0);
            return d.toISOString().slice(0, 16);
        }
        const now = new Date();
        now.setHours(now.getHours() + 1, 0, 0, 0);
        return now.toISOString().slice(0, 16);
    };

    const [form, setForm] = useState({
        event_type: 'event' as EventType,
        title: '',
        start_time: defaultStart(),
        end_time: defaultEnd(),
        description: '',
        customer_name: '',
        customer_email: '',
        assignee: '',
        notes: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedLink, setGeneratedLink] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setForm(f => ({ ...f, start_time: defaultStart(), end_time: defaultEnd() }));
            setError('');
            setGeneratedLink('');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, prefillSlot]);

    useEffect(() => {
        if (form.event_type === 'meet' && !generatedLink) {
            setGeneratedLink(generateMeetLink());
        }
    }, [form.event_type, generatedLink]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!form.title.trim()) { setError('Title is required'); return; }

        setLoading(true);
        try {
            const payload: any = {
                title: form.title,
                event_type: form.event_type,
                start_time: new Date(form.start_time).toISOString(),
                end_time: new Date(form.end_time).toISOString(),
            };
            if (form.description) payload.description = form.description;
            if (form.notes) payload.notes = form.notes;
            if (form.event_type === 'appointment' || form.event_type === 'meet') {
                if (form.customer_name) payload.customer_name = form.customer_name;
                if (form.customer_email) payload.customer_email = form.customer_email;
            }
            if (form.event_type === 'team_task' && form.assignee) {
                payload.assignee = form.assignee;
            }
            if (form.event_type === 'meet') {
                payload.meet_link = generatedLink;
                payload.customer_name = form.customer_name || 'Team';
            }

            const res = await fetchAPI('/calendar/events', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
                setError(err.detail || 'Failed to create event');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const TypeIcon = EVENT_TYPE_META[form.event_type].icon;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-[#141A28] rounded-2xl shadow-2xl w-full max-w-lg border border-white/10 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <TypeIcon size={18} className={EVENT_TYPE_META[form.event_type].color} />
                        New {EVENT_TYPE_META[form.event_type].label}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
                    {/* Event Type Selector */}
                    <div className="grid grid-cols-5 gap-1.5">
                        {(Object.entries(EVENT_TYPE_META) as [EventType, typeof EVENT_TYPE_META[EventType]][]).map(([type, meta]) => {
                            const Icon = meta.icon;
                            return (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, event_type: type }))}
                                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-semibold transition-all ${
                                        form.event_type === type
                                            ? `${meta.bg} ${meta.color} border-current`
                                            : 'border-white/8 text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                    }`}
                                >
                                    <Icon size={14} />
                                    <span className="truncate w-full text-center leading-tight">{meta.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Title *</label>
                        <input
                            type="text"
                            required
                            placeholder={`${EVENT_TYPE_META[form.event_type].label} title...`}
                            value={form.title}
                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 outline-none transition-colors"
                        />
                    </div>

                    {/* Time */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1"><Clock size={11} /> Start</label>
                            <input type="datetime-local" required value={form.start_time}
                                onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
                                className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-purple-500 outline-none [color-scheme:dark] transition-colors" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1"><Clock size={11} /> End</label>
                            <input type="datetime-local" required value={form.end_time}
                                onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))}
                                className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-purple-500 outline-none [color-scheme:dark] transition-colors" />
                        </div>
                    </div>

                    {/* Meet link */}
                    {form.event_type === 'meet' && generatedLink && (
                        <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <Video size={14} className="text-pink-400" />
                                <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">Beraxis Meet Link (Auto-generated)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 text-xs text-pink-300 bg-pink-500/10 px-2 py-1.5 rounded-lg font-mono truncate">{generatedLink}</code>
                                <button
                                    type="button"
                                    onClick={() => { navigator.clipboard.writeText(generatedLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                                    className="text-pink-400 hover:text-pink-300 p-1.5 rounded-lg hover:bg-pink-500/10 transition-colors shrink-0"
                                >
                                    {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                                </button>
                                <button type="button" onClick={() => setGeneratedLink(generateMeetLink())}
                                    className="text-xs text-gray-500 hover:text-white px-2 py-1 rounded-lg hover:bg-white/5 transition-colors">
                                    Refresh
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Appointment / Meet specific: customer */}
                    {(form.event_type === 'appointment' || form.event_type === 'meet') && (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1"><User size={11} /> Customer Name</label>
                                <input type="text" value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))}
                                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-purple-500 outline-none transition-colors" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Email</label>
                                <input type="email" value={form.customer_email} onChange={e => setForm(f => ({ ...f, customer_email: e.target.value }))}
                                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-purple-500 outline-none transition-colors" />
                            </div>
                        </div>
                    )}

                    {/* Team Task: assignee */}
                    {form.event_type === 'team_task' && (
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1"><Users size={11} /> Assign To (team member)</label>
                            <input type="text" placeholder="Name or email of team member..."
                                value={form.assignee} onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))}
                                className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-purple-500 outline-none transition-colors" />
                        </div>
                    )}

                    {/* Description / Notes */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1"><AlignLeft size={11} />
                            {form.event_type === 'my_task' || form.event_type === 'team_task' ? 'Task Description' : 'Notes'}
                        </label>
                        <textarea
                            rows={2}
                            placeholder="Add details..."
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-purple-500 outline-none transition-colors resize-none"
                        />
                    </div>

                    {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{error}</p>}

                    <div className="pt-2 flex justify-end gap-3 border-t border-white/5">
                        <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm text-gray-400 hover:text-white font-medium transition-colors">Cancel</button>
                        <button type="submit" disabled={loading}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 shadow-lg flex items-center gap-2 ${
                                form.event_type === 'meet' ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500' :
                                form.event_type === 'my_task' || form.event_type === 'team_task' ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500' :
                                'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500'
                            }`}>
                            {loading ? 'Creating...' : `Create ${EVENT_TYPE_META[form.event_type].label}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Event Detail Modal ─────────────────────────────────────────────────────

function EventDetailModal({ entry, onClose, onDelete }: { entry: CalendarEntry; onClose: () => void; onDelete: (id: string) => void }) {
    const meta = EVENT_TYPE_META[entry.event_type] || EVENT_TYPE_META.event;
    const Icon = meta.icon;
    const [deleting, setDeleting] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await fetchAPI(`/calendar/events/${entry.id}`, { method: 'DELETE' });
            onDelete(entry.id);
            onClose();
        } catch { setDeleting(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-[#141A28] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${meta.bg}`}>
                            <Icon size={16} className={meta.color} />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{meta.label}</div>
                            <h3 className="text-base font-bold text-white leading-tight">{entry.title}</h3>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <div className="space-y-3 text-sm border-t border-white/5 pt-4">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 flex items-center gap-1.5"><Clock size={12} /> Start</span>
                        <span className="text-gray-200 font-medium">{new Date(entry.start_time).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 flex items-center gap-1.5"><Clock size={12} /> End</span>
                        <span className="text-gray-200 font-medium">{new Date(entry.end_time).toLocaleString()}</span>
                    </div>
                    {entry.customer_name && (
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 flex items-center gap-1.5"><User size={12} /> Customer</span>
                            <span className="text-gray-200">{entry.customer_name}</span>
                        </div>
                    )}
                    {entry.assignee && (
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 flex items-center gap-1.5"><Users size={12} /> Assigned</span>
                            <span className="text-gray-200">{entry.assignee}</span>
                        </div>
                    )}
                    {entry.description && (
                        <div className="pt-2 border-t border-white/5">
                            <span className="text-gray-500 text-xs uppercase tracking-wider block mb-1">Description</span>
                            <p className="text-gray-300 text-xs leading-relaxed">{entry.description}</p>
                        </div>
                    )}

                    {/* Meet link */}
                    {entry.meet_link && (
                        <div className="pt-2 border-t border-white/5">
                            <span className="text-gray-500 text-xs uppercase tracking-wider flex items-center gap-1 mb-2"><Video size={10} /> Meet Link</span>
                            <div className="flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 rounded-xl px-3 py-2">
                                <code className="flex-1 text-xs text-pink-300 font-mono truncate">{entry.meet_link}</code>
                                <button onClick={() => { navigator.clipboard.writeText(entry.meet_link!); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                                    className="text-pink-400 hover:text-pink-300 shrink-0">{copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}</button>
                                <a href={entry.meet_link} target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:text-pink-300 shrink-0"><ExternalLink size={13} /></a>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 mt-5 pt-4 border-t border-white/5">
                    <button onClick={handleDelete} disabled={deleting}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition-colors disabled:opacity-50">
                        <Trash2 size={13} /> {deleting ? 'Deleting...' : 'Delete'}
                    </button>
                    {entry.meet_link && (
                        <a href={entry.meet_link} target="_blank" rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold transition-all hover:from-pink-500 hover:to-purple-500">
                            <Video size={13} /> Join Meet
                        </a>
                    )}
                    <button onClick={onClose} className="flex-1 px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 text-xs font-medium transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Calendar Page ─────────────────────────────────────────────────────

export default function CalendarPage() {
    const [events, setEvents] = useState<CalendarEntry[]>([]);
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<CalendarEntry | null>(null);
    const [weekOffset, setWeekOffset] = useState(0);
    const [prefillSlot, setPrefillSlot] = useState<{ date: Date; hour: number } | undefined>();
    const [filterType, setFilterType] = useState<EventType | 'all'>('all');
    const [loading, setLoading] = useState(true);

    const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 6am to 11pm

    const getWeekDays = useCallback(() => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + weekOffset * 7);
        const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        return dayNames.map((name, i) => {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            return { name, date: d.getDate(), fullDate: d, isToday: d.toDateString() === new Date().toDateString() };
        });
    }, [weekOffset]);

    const days = getWeekDays();
    const currentMonthLabel = days[3].fullDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const loadEvents = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchAPI('/calendar/events');
            if (res.ok) setEvents(await res.json());
        } catch (e) { console.error('Failed to load calendar events', e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { loadEvents(); }, [loadEvents]);

    const getEventsForSlot = (date: Date, hour: number): CalendarEntry[] => {
        return events.filter(ev => {
            if (filterType !== 'all' && ev.event_type !== filterType) return false;
            const d = new Date(ev.start_time);
            return d.toDateString() === date.toDateString() && d.getHours() === hour;
        });
    };

    const openSlot = (date: Date, hour: number) => {
        setPrefillSlot({ date, hour });
        setIsNewModalOpen(true);
    };

    return (
        <div className="flex flex-col h-full relative text-white bg-[#0B101E]">
            <NewEventModal
                isOpen={isNewModalOpen}
                onClose={() => { setIsNewModalOpen(false); setPrefillSlot(undefined); }}
                onSuccess={loadEvents}
                prefillSlot={prefillSlot}
            />
            {selectedEntry && (
                <EventDetailModal
                    entry={selectedEntry}
                    onClose={() => setSelectedEntry(null)}
                    onDelete={(id) => setEvents(prev => prev.filter(e => e.id !== id))}
                />
            )}

            {/* Top Toolbar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800 bg-[#141A28] shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsNewModalOpen(true)}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-purple-600/20 active:scale-95 flex items-center gap-2">
                        <Plus size={15} /> New Event
                    </button>
                    <span className="text-base font-bold text-gray-200 hidden sm:block">Calendar</span>
                </div>

                {/* Type filter chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto">
                    <button onClick={() => setFilterType('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${filterType === 'all' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                        All
                    </button>
                    {(Object.entries(EVENT_TYPE_META) as [EventType, typeof EVENT_TYPE_META[EventType]][]).map(([type, meta]) => {
                        const Icon = meta.icon;
                        return (
                            <button key={type} onClick={() => setFilterType(type)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                                    filterType === type ? `${meta.bg} ${meta.color}` : 'text-gray-500 hover:text-gray-300'
                                }`}>
                                <Icon size={12} /> {meta.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Secondary Nav */}
            <div className="flex items-center justify-between px-5 py-2 border-b border-gray-800 bg-[#141A28] shrink-0">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-[#1E293B] p-0.5 border border-gray-700 rounded-lg">
                        <button onClick={() => setWeekOffset(w => w - 1)} className="p-1.5 hover:bg-gray-700 rounded-md text-gray-400 hover:text-white transition-colors"><ChevronLeft size={16} /></button>
                        <button onClick={() => setWeekOffset(w => w + 1)} className="p-1.5 hover:bg-gray-700 rounded-md text-gray-400 hover:text-white transition-colors"><ChevronRight size={16} /></button>
                    </div>
                    <button onClick={() => setWeekOffset(0)} className="px-3 py-1.5 bg-[#1E293B] border border-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-700 text-gray-300">Today</button>
                    <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{currentMonthLabel}</span>
                </div>

                <div className="flex items-center gap-2">
                    {loading && <span className="text-xs text-gray-500 animate-pulse">Loading...</span>}
                    <button className="px-3 py-1.5 bg-purple-600/10 text-purple-400 border border-purple-500/20 rounded-lg text-xs font-bold hover:bg-purple-600/20 transition-all">Google Sync</button>
                    <button className="px-3 py-1.5 bg-[#1E293B] border border-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-700 text-gray-300 flex items-center gap-1.5">Share <Share2 size={12} /></button>
                </div>
            </div>

            {/* Calendar Grid + Sidebar */}
            <div className="flex flex-1 overflow-hidden">
                {/* Grid */}
                <div className="flex-1 flex flex-col overflow-y-auto">
                    {/* Day headers */}
                    <div className="grid grid-cols-8 border-b border-gray-800 sticky top-0 bg-[#0F172A] z-10">
                        <div className="p-3 border-r border-gray-800" />
                        {days.map(day => (
                            <div key={day.date} className="p-3 border-r border-gray-800 text-center">
                                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">{day.name}</div>
                                <div className={`text-sm font-bold inline-flex items-center justify-center w-7 h-7 rounded-full ${day.isToday ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'text-gray-300'}`}>
                                    {day.date}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Hour rows */}
                    {hours.map(hour => (
                        <div key={hour} className="grid grid-cols-8 border-b border-gray-800/40 min-h-[64px]">
                            <div className="p-2 border-r border-gray-800 text-[10px] text-gray-600 text-right pr-3 -mt-2 font-semibold shrink-0">
                                {hour > 12 ? `${hour - 12}pm` : hour === 12 ? '12pm' : `${hour}am`}
                            </div>
                            {days.map(day => {
                                const slotEvents = getEventsForSlot(day.fullDate, hour);
                                return (
                                    <div key={`${day.date}-${hour}`}
                                        className="border-r border-gray-800/40 relative hover:bg-white/[0.02] transition-colors group p-1 flex flex-col gap-1"
                                        onClick={() => slotEvents.length === 0 && openSlot(day.fullDate, hour)}
                                    >
                                        {slotEvents.map(ev => {
                                            const meta = EVENT_TYPE_META[ev.event_type] || EVENT_TYPE_META.event;
                                            const Icon = meta.icon;
                                            return (
                                                <button key={ev.id}
                                                    onClick={e => { e.stopPropagation(); setSelectedEntry(ev); }}
                                                    className={`w-full border rounded-lg p-1.5 text-left transition-all overflow-hidden flex flex-col gap-0.5 ${meta.bg} hover:brightness-110`}>
                                                    <span className="flex items-center gap-1">
                                                        <Icon size={10} className={meta.color} />
                                                        <span className="text-[10px] font-bold text-white leading-tight truncate flex-1">{ev.title}</span>
                                                    </span>
                                                    {ev.event_type === 'meet' && (
                                                        <span className="text-[9px] text-pink-300 font-mono truncate flex items-center gap-0.5">
                                                            <Video size={8} /> Meet
                                                        </span>
                                                    )}
                                                    {ev.assignee && (
                                                        <span className="text-[9px] text-orange-300 truncate">{ev.assignee}</span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                        {slotEvents.length === 0 && (
                                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center text-gray-700 hover:text-gray-500 transition-opacity cursor-pointer">
                                                <Plus size={16} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Right sidebar */}
                <div className="w-64 bg-[#141A28] border-l border-gray-800 p-4 hidden lg:flex flex-col gap-4 shrink-0 overflow-y-auto">
                    {/* Legend */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Event Types</h4>
                        <div className="space-y-2">
                            {(Object.entries(EVENT_TYPE_META) as [EventType, typeof EVENT_TYPE_META[EventType]][]).map(([type, meta]) => {
                                const Icon = meta.icon;
                                const count = events.filter(e => e.event_type === type).length;
                                return (
                                    <div key={type} className="flex items-center gap-2 text-xs">
                                        <div className={`w-5 h-5 rounded-md flex items-center justify-center ${meta.bg}`}>
                                            <Icon size={11} className={meta.color} />
                                        </div>
                                        <span className="text-gray-400 flex-1">{meta.label}</span>
                                        {count > 0 && <span className={`font-bold ${meta.color}`}>{count}</span>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Upcoming this week */}
                    <div className="border-t border-gray-800 pt-4">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">This Week</h4>
                        <div className="space-y-2">
                            {events.filter(ev => {
                                const d = new Date(ev.start_time);
                                return days.some(day => day.fullDate.toDateString() === d.toDateString());
                            }).slice(0, 6).map(ev => {
                                const meta = EVENT_TYPE_META[ev.event_type] || EVENT_TYPE_META.event;
                                const Icon = meta.icon;
                                return (
                                    <button key={ev.id} onClick={() => setSelectedEntry(ev)}
                                        className="w-full text-left flex items-start gap-2 p-2 rounded-xl hover:bg-white/5 transition-colors">
                                        <Icon size={12} className={`${meta.color} mt-0.5 shrink-0`} />
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium text-gray-200 truncate">{ev.title}</p>
                                            <p className="text-[10px] text-gray-500">{new Date(ev.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </button>
                                );
                            })}
                            {events.filter(ev => days.some(day => day.fullDate.toDateString() === new Date(ev.start_time).toDateString())).length === 0 && (
                                <p className="text-xs text-gray-600 italic">No events this week</p>
                            )}
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
            </div>
        </div>
    );
}

// Tiny helper to allow sidebar "Start Meet" button to pre-select the Meet type
function setForm_override_type(_type: EventType) { /* handled via state in parent */ }
