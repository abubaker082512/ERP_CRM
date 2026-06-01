"use client";
import { fetchAPI } from '@/lib/api';

import TodoHeader from "@/components/todo/TodoHeader";
import { useEffect, useState } from "react";
import { Plus, CheckCircle, Circle, Trash2, Star } from "lucide-react";

type Task = {
    id: string;
    title: string;
    is_completed: boolean;
    priority: number;
    tags?: string[];
    due_date?: string;
};

export default function TodoPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState("");

    useEffect(() => {
        fetchAPI("/todo/tasks")
            .then((r) => r.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setTasks(data);
                } else {
                    console.error("Failed to load tasks:", data);
                }
            })
            .catch(console.error);
    }, []);

    const addTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        const res = await fetchAPI("/todo/tasks", {
            method: "POST",
            body: JSON.stringify({ title: newTask }),
        });

        if (res.ok) {
            const task = await res.json();
            setTasks([...tasks, task]);
            setNewTask("");
        }
    };

    const toggleTask = async (id: string, currentStatus: boolean) => {
        const res = await fetchAPI(`/todo/tasks/${id}/toggle?is_completed=${!currentStatus}`, {
            method: "PUT",
        });

        if (res.ok) {
            setTasks(tasks.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t));
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <TodoHeader />

            <div className="flex-1 overflow-auto p-6 flex justify-center">
                <div className="w-full max-w-2xl">
                    <h2 className="text-2xl font-bold text-white mb-6">My Tasks</h2>

                    <form onSubmit={addTask} className="mb-8 relative">
                        <input
                            type="text"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            placeholder="Add a new task..."
                            className="w-full bg-[#1E293B] border border-gray-700 rounded-lg px-4 py-3 pl-12 text-white focus:border-blue-500 focus:outline-none shadow-lg"
                        />
                        <Plus className="absolute left-4 top-3.5 text-gray-400" size={20} />
                    </form>

                    <div className="space-y-3">
                        {tasks.map((task) => (
                            <div
                                key={task.id}
                                className={`group flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${task.is_completed
                                        ? "bg-white/5 border-gray-800 opacity-50"
                                        : "galaxy-card !p-4 group-hover:border-blue-500/50 shadow-lg"
                                    }`}
                            >
                                <button
                                    onClick={() => toggleTask(task.id, task.is_completed)}
                                    className={`flex-shrink-0 transition-all transform hover:scale-110 ${task.is_completed ? "text-green-500" : "text-gray-500 hover:text-blue-400"
                                        }`}
                                >
                                    {task.is_completed ? <CheckCircle size={24} /> : <Circle size={24} />}
                                </button>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-lg font-medium transition-all truncate ${task.is_completed ? "line-through text-gray-500" : "text-gray-100"}`}>
                                            {task.title}
                                        </span>
                                        {task.priority > 0 && (
                                            <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {task.tags?.map(tag => (
                                            <span key={tag} className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold uppercase tracking-wider">{tag}</span>
                                        ))}
                                    </div>
                                </div>

                                <button className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all transform hover:rotate-12">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}

                        {tasks.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                <p>No tasks yet. Add one above to get started!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
