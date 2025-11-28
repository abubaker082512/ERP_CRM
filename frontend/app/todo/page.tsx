"use client";

import TodoHeader from "@/components/todo/TodoHeader";
import { useEffect, useState } from "react";
import { Plus, CheckCircle, Circle, Trash2 } from "lucide-react";

type Task = {
    id: string;
    title: string;
    is_completed: boolean;
};

export default function TodoPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState("");

    useEffect(() => {
        fetch("http://localhost:8000/api/v1/todo/tasks")
            .then((r) => r.json())
            .then(setTasks)
            .catch(console.error);
    }, []);

    const addTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        const res = await fetch("http://localhost:8000/api/v1/todo/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newTask }),
        });

        if (res.ok) {
            const task = await res.json();
            setTasks([...tasks, task]);
            setNewTask("");
        }
    };

    const toggleTask = async (id: string, currentStatus: boolean) => {
        const res = await fetch(`http://localhost:8000/api/v1/todo/tasks/${id}/toggle?is_completed=${!currentStatus}`, {
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
                                className={`group flex items-center gap-3 p-4 rounded-lg border transition-all ${task.is_completed
                                        ? "bg-[#1E293B]/50 border-gray-800 opacity-60"
                                        : "bg-[#1E293B] border-gray-700 hover:border-blue-500/50"
                                    }`}
                            >
                                <button
                                    onClick={() => toggleTask(task.id, task.is_completed)}
                                    className={`flex-shrink-0 transition-colors ${task.is_completed ? "text-green-500" : "text-gray-400 hover:text-blue-500"
                                        }`}
                                >
                                    {task.is_completed ? <CheckCircle size={24} /> : <Circle size={24} />}
                                </button>

                                <span className={`flex-1 text-lg ${task.is_completed ? "line-through text-gray-500" : "text-gray-200"}`}>
                                    {task.title}
                                </span>

                                <button className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
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
