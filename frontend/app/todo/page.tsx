"use client";
import { fetchAPI } from '@/lib/api';

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { useState } from "react";
import { CheckSquare, Clock, Star, Plus, Calendar } from "lucide-react";

const MENU_ITEMS = [
    { name: "My Tasks", href: "/todo" },
    { name: "History", href: "/todo/history" },
    { name: "Configuration", href: "/todo/configuration" },
];

type Todo = {
    id: string;
    title: string;
    due_date: string;
    priority: string;
    status: string;
    tags: string[];
};

const mockTodos: Todo[] = [
    { id: "TODO/001", title: "Review Q4 Marketing Plan", due_date: "2025-12-05", priority: "high", status: "pending", tags: ["Marketing", "Q4"] },
    { id: "TODO/002", title: "Update Client Contact Info", due_date: "2025-12-03", priority: "medium", status: "pending", tags: ["Admin"] },
    { id: "TODO/003", title: "Prepare Weekly Report", due_date: "2025-12-02", priority: "low", status: "done", tags: ["Reporting"] },
];

export default function TodoPage() {
    const [todos] = useState<Todo[]>(mockTodos);
    const [currentView, setCurrentView] = useState<ViewType>("list");

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="To Do"
                moduleIcon={<CheckSquare size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search tasks..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-200">My Tasks</h2>
                            <p className="text-sm text-gray-400 mt-1">{todos.filter(t => t.status === 'pending').length} pending tasks</p>
                        </div>
                        <ViewSwitcher
                            currentView={currentView}
                            availableViews={["list", "kanban"]}
                            onViewChange={setCurrentView}
                        />
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2">
                        <Plus size={18} /> Add Task
                    </button>
                </div>

                {currentView === "list" && (
                    <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-[#0F172A] border-b border-gray-700">
                                <tr>
                                    <th className="w-10 px-4 py-3"></th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Title</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Due Date</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Priority</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Tags</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {todos.map(todo => (
                                    <tr key={todo.id} className={`border-b border-gray-700 hover:bg-[#1E293B] transition-colors ${todo.status === 'done' ? 'opacity-50' : ''}`}>
                                        <td className="px-4 py-3">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer ${todo.status === 'done' ? 'bg-blue-600 border-blue-600' : 'border-gray-500 hover:border-blue-500'}`}>
                                                {todo.status === 'done' && <CheckSquare size={14} className="text-white" />}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-white">{todo.title}</td>
                                        <td className="px-4 py-3 text-gray-400">{new Date(todo.due_date).toLocaleDateString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${todo.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                                    todo.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-blue-500/20 text-blue-400'
                                                }`}>
                                                {todo.priority}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">
                                                {todo.tags.map(tag => (
                                                    <span key={tag} className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-sm ${todo.status === 'done' ? 'text-green-400' : 'text-gray-400'}`}>
                                                {todo.status === 'done' ? 'Completed' : 'Pending'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {currentView === "kanban" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {['pending', 'done'].map(status => (
                            <div key={status} className="bg-[#1E293B]/50 rounded-lg p-4 border border-gray-700">
                                <h3 className="font-semibold text-white mb-4 capitalize">{status === 'pending' ? 'To Do' : 'Done'}</h3>
                                <div className="space-y-3">
                                    {todos.filter(t => (status === 'pending' ? t.status !== 'done' : t.status === 'done')).map(todo => (
                                        <div key={todo.id} className={`bg-[#1E293B] border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-all ${todo.status === 'done' ? 'opacity-75' : ''}`}>
                                            <div className="flex justify-between mb-2">
                                                <span className={`font-medium ${todo.status === 'done' ? 'text-gray-400 line-through' : 'text-white'}`}>{todo.title}</span>
                                                <span className={`px-2 py-0.5 rounded text-xs h-fit ${todo.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                                        todo.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                            'bg-blue-500/20 text-blue-400'
                                                    }`}>{todo.priority}</span>
                                            </div>

                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700 text-xs text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    {new Date(todo.due_date).toLocaleDateString()}
                                                </div>
                                                <div className="flex gap-1">
                                                    {todo.tags.map(tag => (
                                                        <span key={tag} className="px-1.5 py-0.5 bg-gray-700 rounded text-[10px] text-gray-400">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
