"use client";
import { fetchAPI } from '@/lib/api';
import { useState, useEffect } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import { Plus, LayoutGrid, List as ListIcon, Palette, Users, Clock, X } from 'lucide-react';
import Link from 'next/link';

type Project = {
    id: string;
    name: string;
    user_id?: string;
    created_at: string;
};

export default function ProjectPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res = await fetchAPI("/projects/projects");
            if (res.ok) {
                setProjects(await res.json());
            }
        } catch (e) {
            console.error("Failed to fetch projects", e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectName.trim()) return;

        setCreating(true);
        try {
            const res = await fetchAPI("/projects/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: projectName })
            });
            if (res.ok) {
                setProjectName("");
                setIsModalOpen(false);
                fetchProjects();
            }
        } catch (e) {
            console.error("Error creating project", e);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#0B101E]">
            <AppHeader title="Projects" />
            
            <div className="flex-1 overflow-auto p-6 max-w-7xl mx-auto w-full">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Palette className="text-blue-500" /> My Projects
                    </h1>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="galaxy-btn-primary !py-2.5 flex items-center gap-2 text-sm font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                    >
                        <Plus size={18} /> New Project
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {projects.map(p => (
                            <Link href={`/project/${p.id}`} key={p.id} className="galaxy-card p-6 group block hover:border-blue-500/30 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
                                        <Palette size={22} />
                                    </div>
                                    <span className="text-gray-500 hover:text-white p-1 rounded hover:bg-white/5"><ListIcon size={16} /></span>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors truncate">{p.name}</h3>
                                <div className="flex items-center justify-between text-xs text-gray-500 mt-4 pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-1">
                                        <Users size={12} className="text-blue-400" /> Team Members
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock size={12} /> {new Date(p.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {projects.length === 0 && (
                            <div className="col-span-full text-center py-20 border-2 border-dashed border-gray-800 rounded-2xl text-gray-500 italic">
                                <Palette size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="text-sm">No projects created yet. Click &quot;New Project&quot; to begin.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Create Project Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1E293B] rounded-2xl p-6 w-full max-w-sm border border-gray-700 shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-6">Create New Project</h3>
                        <form onSubmit={handleCreateProject} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Project Name</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={projectName} 
                                    onChange={(e) => setProjectName(e.target.value)}
                                    placeholder="e.g. ERP Parity Phase 2" 
                                    className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-400 hover:text-white font-bold text-sm">Cancel</button>
                                <button type="submit" disabled={creating || !projectName} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all">
                                    {creating ? "Creating..." : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
