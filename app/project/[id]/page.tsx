"use client";
import { fetchAPI } from "@/lib/api";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppHeader from "@/components/layout/AppHeader";
import { ArrowLeft, Plus, Calendar, CheckSquare, Trash2, ArrowRight, ArrowLeftRight, Clock, User } from "lucide-react";

type Task = {
    id: string;
    name: string;
    stage: 'todo' | 'progress' | 'done';
    date_deadline?: string;
    project_id: string;
};

export default function ProjectDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [project, setProject] = useState<any>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form state
    const [taskName, setTaskName] = useState("");
    const [deadline, setDeadline] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!id) return;
        fetchProjectDetails();
    }, [id]);

    const fetchProjectDetails = async () => {
        try {
            // First load the project name
            const projRes = await fetchAPI("/projects/projects");
            if (projRes.ok) {
                const projs = await projRes.json();
                const currentProj = projs.find((p: any) => p.id === id);
                if (currentProj) {
                    setProject(currentProj);
                } else {
                    router.push("/project");
                    return;
                }
            }
            
            // Load project tasks
            const tasksRes = await fetchAPI(`/projects/tasks?project_id=${id}`);
            if (tasksRes.ok) {
                const data = await tasksRes.json();
                setTasks(Array.isArray(data) ? data : []);
            }
        } catch (e) {
            console.error("Failed to load project details", e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!taskName.trim()) return;

        setSaving(true);
        try {
            const res = await fetchAPI("/projects/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: taskName,
                    project_id: id,
                    stage: "todo",
                    date_deadline: deadline ? new Date(deadline).toISOString() : null
                })
            });

            if (res.ok) {
                setTaskName("");
                setDeadline("");
                setIsModalOpen(false);
                fetchProjectDetails();
            }
        } catch (e) {
            console.error("Error creating project task", e);
        } finally {
            setSaving(false);
        }
    };

    const moveTask = async (task: Task, nextStage: 'todo' | 'progress' | 'done') => {
        // Optimistic UI update
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, stage: nextStage } : t));
        
        try {
            // Simulates updating task stage (usually via a PUT endpoint if present, or locally)
            await fetchAPI(`/projects/tasks`, {
                method: "POST", // Simple reload-on-save wrapper
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...task, stage: nextStage })
            });
            fetchProjectDetails();
        } catch (e) {
            console.error("Failed to persist task stage change", e);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-[#0F172A]">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!project) return null;

    const todoTasks = tasks.filter(t => t.stage === 'todo');
    const progressTasks = tasks.filter(t => t.stage === 'progress');
    const doneTasks = tasks.filter(t => t.stage === 'done');

    return (
        <div className="flex flex-col h-screen bg-[#0B101E]">
            <AppHeader title={`Project: ${project.name}`} />

            <div className="flex-1 overflow-hidden flex flex-col p-6 max-w-7xl mx-auto w-full">
                {/* Dashboard Subheader */}
                <div className="flex items-center justify-between mb-8 shrink-0">
                    <div className="flex items-center gap-3">
                        <Link href="/project" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/5 shadow-inner">
                            <ArrowLeft size={18} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">{project.name}</h1>
                            <p className="text-xs text-gray-500 font-medium">Task checklist board & scheduling</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95 text-sm"
                    >
                        <Plus size={18} /> Add Task
                    </button>
                </div>

                {/* Columns Grid */}
                <div className="flex-1 overflow-x-auto gap-6 flex pb-4 items-start select-none">
                    {/* TO DO COLUMN */}
                    <div className="w-96 shrink-0 bg-[#141A28] border border-gray-800 rounded-2xl p-4 flex flex-col max-h-full">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-800">
                            <h3 className="font-bold text-gray-300 text-sm tracking-wider uppercase flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> To Do
                            </h3>
                            <span className="bg-blue-500/15 text-blue-400 font-bold px-2 py-0.5 rounded text-xs">{todoTasks.length}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                            {todoTasks.map(t => (
                                <div key={t.id} className="bg-[#1E293B] border border-gray-700 rounded-xl p-4 shadow-sm hover:border-blue-500/30 transition-all group">
                                    <h4 className="text-white font-bold text-sm mb-3 leading-tight">{t.name}</h4>
                                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/5">
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                            <Calendar size={12} className="text-blue-400" />
                                            <span>{t.date_deadline ? new Date(t.date_deadline).toLocaleDateString() : 'No deadline'}</span>
                                        </div>
                                        <button onClick={() => moveTask(t, 'progress')} className="p-1 text-blue-400 hover:bg-blue-500/10 rounded-md transition-colors" title="Start task">
                                            <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {todoTasks.length === 0 && (
                                <div className="text-center py-8 text-gray-500 text-xs italic">No tasks in To Do.</div>
                            )}
                        </div>
                    </div>

                    {/* IN PROGRESS COLUMN */}
                    <div className="w-96 shrink-0 bg-[#141A28] border border-gray-800 rounded-2xl p-4 flex flex-col max-h-full">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-800">
                            <h3 className="font-bold text-gray-300 text-sm tracking-wider uppercase flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span> In Progress
                            </h3>
                            <span className="bg-yellow-500/15 text-yellow-400 font-bold px-2 py-0.5 rounded text-xs">{progressTasks.length}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                            {progressTasks.map(t => (
                                <div key={t.id} className="bg-[#1E293B] border border-gray-700 rounded-xl p-4 shadow-sm hover:border-yellow-500/30 transition-all group">
                                    <h4 className="text-white font-bold text-sm mb-3 leading-tight">{t.name}</h4>
                                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/5">
                                        <div className="flex gap-2">
                                            <button onClick={() => moveTask(t, 'todo')} className="p-1 text-gray-400 hover:bg-white/10 rounded-md transition-colors" title="Move back to To Do">
                                                <ArrowLeft size={14} />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                            <Calendar size={12} className="text-yellow-400" />
                                            <span>{t.date_deadline ? new Date(t.date_deadline).toLocaleDateString() : 'No deadline'}</span>
                                        </div>
                                        <button onClick={() => moveTask(t, 'done')} className="p-1 text-green-400 hover:bg-green-500/10 rounded-md transition-colors" title="Complete task">
                                            <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {progressTasks.length === 0 && (
                                <div className="text-center py-8 text-gray-500 text-xs italic">No tasks in Progress.</div>
                            )}
                        </div>
                    </div>

                    {/* DONE COLUMN */}
                    <div className="w-96 shrink-0 bg-[#141A28] border border-gray-800 rounded-2xl p-4 flex flex-col max-h-full">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-800">
                            <h3 className="font-bold text-gray-300 text-sm tracking-wider uppercase flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Done
                            </h3>
                            <span className="bg-green-500/15 text-green-400 font-bold px-2 py-0.5 rounded text-xs">{doneTasks.length}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                            {doneTasks.map(t => (
                                <div key={t.id} className="bg-[#1E293B] border border-gray-700 rounded-xl p-4 shadow-sm hover:border-green-500/30 transition-all group opacity-85">
                                    <h4 className="text-gray-400 font-bold text-sm mb-3 line-through leading-tight">{t.name}</h4>
                                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/5">
                                        <button onClick={() => moveTask(t, 'progress')} className="p-1 text-gray-400 hover:bg-white/10 rounded-md transition-colors" title="Re-open task">
                                            <ArrowLeft size={14} />
                                        </button>
                                        <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded">
                                            Completed
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {doneTasks.length === 0 && (
                                <div className="text-center py-8 text-gray-500 text-xs italic">No completed tasks.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Task Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1E293B] rounded-2xl p-6 w-full max-w-md border border-gray-700 shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-6">Create New Task</h3>
                        <form onSubmit={handleCreateTask} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Task Title</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={taskName} 
                                    onChange={(e) => setTaskName(e.target.value)}
                                    placeholder="e.g. Design platform wireframes" 
                                    className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors" 
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Deadline Date</label>
                                <input 
                                    type="date" 
                                    value={deadline} 
                                    onChange={(e) => setDeadline(e.target.value)}
                                    className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors" 
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-400 hover:text-white font-bold text-sm">Cancel</button>
                                <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all">
                                    {saving ? "Creating..." : "Create Task"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
