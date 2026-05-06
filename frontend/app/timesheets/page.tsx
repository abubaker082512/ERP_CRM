"use client";
import { fetchAPI } from '@/lib/api';
import { useState, useEffect } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import { Plus, Clock, Calendar, Play } from 'lucide-react';

export default function TimesheetPage() {
    const [timesheets, setTimesheets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAPI("/timesheets/")
            .then(r => r.ok ? r.json() : [])
            .then(setTimesheets)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="flex flex-col h-screen">
            <AppHeader title="Timesheets" />
            <div className="flex-1 overflow-auto p-6 max-w-6xl mx-auto w-full">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Clock className="text-indigo-500" /> My Timesheets
                    </h1>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
                        <Plus size={16} /> Log Hours
                    </button>
                </div>

                <div className="galaxy-card overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#1E293B] text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-800">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Project</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4 text-right">Hours</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {timesheets.map(ts => (
                                <tr key={ts.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={12} className="text-indigo-400" />
                                            {new Date(ts.date).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-200">{ts.project_name || 'General'}</td>
                                    <td className="px-6 py-4 text-gray-400">{ts.name}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-lg font-bold border border-indigo-500/20">
                                            {ts.unit_amount} h
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {timesheets.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                                        No time logs found for this period.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
