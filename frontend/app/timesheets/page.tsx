"use client";
import { fetchAPI } from '@/lib/api';
import { useState, useEffect } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import { Plus, Clock, Calendar, Play, Save, X } from 'lucide-react';

type Project = {
    id: string;
    name: string;
};

type Timesheet = {
    id: string;
    date: string;
    project_id: string;
    project_name?: string;
    name: string;
    unit_amount: number;
};

export default function TimesheetPage() {
    const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState("");
    const [hours, setHours] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [tsRes, projRes] = await Promise.all([
                fetchAPI("/timesheets/"),
                fetchAPI("/projects/projects")
            ]);
            
            let loadedProjects: Project[] = [];
            if (projRes.ok) {
                loadedProjects = await projRes.json();
                setProjects(loadedProjects);
            }
            
            if (tsRes.ok) {
                const logs: Timesheet[] = await tsRes.json();
                // Map project_id to project name for display
                const mappedLogs = logs.map(log => ({
                    ...log,
                    project_name: loadedProjects.find(p => p.id === log.project_id)?.name || 'General'
                }));
                setTimesheets(mappedLogs);
            }
        } catch (e) {
            console.error("Failed to load timesheet details", e);
        } finally {
            setLoading(false);
        }
    };

    const handleLogHours = async (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseFloat(hours);
        if (!selectedProject || isNaN(amt) || amt <= 0 || !description.trim()) return;

        setSaving(true);
        try {
            const res = await fetchAPI("/timesheets/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    project_id: selectedProject,
                    unit_amount: amt,
                    name: description,
                    date: new Date(date).toISOString()
                })
            });

            if (res.ok) {
                setSelectedProject("");
                setHours("");
                setDescription("");
                setIsModalOpen(false);
                loadData();
            }
        } catch (e) {
            console.error("Error logging hours", e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#0B101E]">
            <AppHeader title="Timesheets" />
            
            <div className="flex-1 overflow-auto p-6 max-w-6xl mx-auto w-full">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Clock className="text-indigo-500" /> My Timesheets
                    </h1>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all text-sm"
                    >
                        <Plus size={18} /> Log Hours
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
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
                                        <td className="px-6 py-4 font-bold text-gray-200">{ts.project_name}</td>
                                        <td className="px-6 py-4 text-gray-400">{ts.name}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-lg font-bold border border-indigo-500/20">
                                                {ts.unit_amount} h
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {timesheets.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                                            No time logs found for this period. Click &quot;Log Hours&quot; to add one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Log Hours Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1E293B] rounded-2xl p-6 w-full max-w-md border border-gray-700 shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <Clock className="text-indigo-400" /> Log Worked Hours
                        </h3>
                        <form onSubmit={handleLogHours} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Select Project</label>
                                <select 
                                    required 
                                    value={selectedProject} 
                                    onChange={(e) => setSelectedProject(e.target.value)}
                                    className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors"
                                >
                                    <option value="">Choose a project...</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Hours worked</label>
                                    <input 
                                        type="number" 
                                        step="0.5" 
                                        required 
                                        min="0.5" 
                                        max="24"
                                        value={hours} 
                                        onChange={(e) => setHours(e.target.value)}
                                        placeholder="e.g. 4.5"
                                        className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Log Date</label>
                                    <input 
                                        type="date" 
                                        required 
                                        value={date} 
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description / Task Details</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={description} 
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="What did you work on?" 
                                    className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-400 hover:text-white font-bold text-sm">
                                    <X size={16} className="inline mr-1" /> Discard
                                </button>
                                <button type="submit" disabled={saving || !selectedProject || !hours || !description} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-1.5">
                                    <Save size={16} /> {saving ? "Saving..." : "Log Entry"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
