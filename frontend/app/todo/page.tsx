"use client";

import { useState } from 'react';
import TodoHeader from '@/components/TodoHeader';
import { Plus, MoreHorizontal, Clock, Trash2, CheckCircle2, Settings } from 'lucide-react';

type Task = {
    id: string;
    title: string;
    deadline?: string;
    status: 'Inbox' | 'Today' | 'This Week' | 'This Month' | 'Later' | 'Done' | 'Cancelled';
};

const initialTasks: Task[] = [
    { id: '1', title: 'Welcome Administrator!', status: 'Inbox' },
];

const columns = [
    { name: 'Inbox', id: 'Inbox' },
    { name: 'Today', id: 'Today' },
    { name: 'This Week', id: 'This Week' },
    { name: 'This Month', id: 'This Month' },
    { name: 'Later', id: 'Later' },
];

const foldedColumns = [
    { name: 'Done', id: 'Done' },
    { name: 'Cancelled', id: 'Cancelled' },
];

export default function TodoPage() {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDeadline, setNewTaskDeadline] = useState('');

    const handleAddTask = () => {
        if (!newTaskTitle.trim()) return;

        const newTask: Task = {
            id: Date.now().toString(),
            title: newTaskTitle,
            deadline: newTaskDeadline,
            status: 'Inbox',
        };

        setTasks([...tasks, newTask]);
        setNewTaskTitle('');
        setNewTaskDeadline('');
        setIsNewTaskOpen(false);
    };

    return (
        <div className="flex flex-col h-screen">
            <TodoHeader onNewClick={() => setIsNewTaskOpen(true)} />

            <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
                <div className="flex h-full gap-4 min-w-max">
                    {/* Main Columns */}
                    {columns.map((col) => {
                        const colTasks = tasks.filter(t => t.status === col.id);
                        return (
                            <div key={col.id} className="w-80 flex flex-col h-full">
                                {/* Column Header */}
                                <div className="flex items-center justify-between mb-2 px-1 group">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-gray-200">{col.name}</h3>
                                        <span className="text-gray-500 text-sm font-medium">{colTasks.length}</span>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                                        <button
                                            onClick={() => {
                                                if (col.id === 'Inbox') setIsNewTaskOpen(true);
                                            }}
                                            className="text-gray-400 hover:text-white p-1"
                                        >
                                            <Plus size={16} />
                                        </button>
                                        <button className="text-gray-400 hover:text-white p-1">
                                            <Settings size={14} /> {/* Using Settings as gear icon placeholder */}
                                        </button>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="h-1 bg-gray-700 rounded-full mb-4 overflow-hidden">
                                    <div className="h-full bg-purple-500 w-0"></div>
                                </div>

                                {/* Tasks Container */}
                                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                                    {/* New Task Form (Only in Inbox) */}
                                    {col.id === 'Inbox' && isNewTaskOpen && (
                                        <div className="bg-[#1E293B] rounded border border-purple-500/50 p-3 shadow-lg animate-in fade-in slide-in-from-top-2">
                                            <div className="mb-3">
                                                <label className="text-xs text-purple-400 font-medium mb-1 block">To-do Title <span className="text-purple-400">*</span></label>
                                                <input
                                                    type="text"
                                                    value={newTaskTitle}
                                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                                    placeholder="e.g. Send Invitations"
                                                    className="w-full bg-transparent border-b border-purple-500/50 focus:border-purple-500 outline-none text-sm py-1 text-white placeholder-gray-500"
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="text-xs text-gray-400 font-medium mb-1 block">Deadline</label>
                                                <input
                                                    type="text" // Using text for simplicity to match screenshot look, could be date
                                                    value={newTaskDeadline}
                                                    onChange={(e) => setNewTaskDeadline(e.target.value)}
                                                    className="w-full bg-transparent border-b border-gray-600 focus:border-purple-500 outline-none text-sm py-1 text-white"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleAddTask}
                                                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs font-medium uppercase"
                                                    >
                                                        Add
                                                    </button>
                                                    <button
                                                        onClick={() => setIsNewTaskOpen(false)}
                                                        className="bg-transparent border border-gray-600 hover:bg-gray-700 text-gray-300 px-3 py-1 rounded text-xs font-medium uppercase"
                                                    >
                                                        Edit
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => setIsNewTaskOpen(false)}
                                                    className="text-gray-500 hover:text-red-400"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Task Cards */}
                                    {colTasks.map((task) => (
                                        <div key={task.id} className="bg-[#1E293B] p-3 rounded border border-gray-700 hover:border-gray-500 cursor-pointer group relative">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="text-sm font-medium text-gray-200">{task.title}</h4>
                                                <div className="w-2 h-2 rounded-full bg-green-500"></div> {/* Priority/Status indicator */}
                                            </div>

                                            <div className="flex items-center justify-between mt-3">
                                                <div className="flex gap-1">
                                                    {[1, 2, 3].map(i => (
                                                        <span key={i} className="text-gray-600 hover:text-yellow-500 cursor-pointer text-xs">★</span>
                                                    ))}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock size={14} className="text-gray-500" />
                                                    <div className="w-5 h-5 bg-gray-700 rounded-full flex items-center justify-center text-[10px] text-gray-300">
                                                        A
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {/* Folded Columns */}
                    {foldedColumns.map((col) => {
                        const colTasks = tasks.filter(t => t.status === col.id);
                        return (
                            <div key={col.id} className="w-10 flex flex-col h-full bg-[#1E293B]/50 border-l border-gray-700 items-center py-2 cursor-pointer hover:bg-[#1E293B]">
                                <div className="flex flex-col items-center gap-4 mt-2">
                                    <span className="text-gray-400 text-xs font-medium">{colTasks.length}</span>
                                    <div className="writing-vertical-rl transform rotate-180 text-gray-400 text-sm font-medium tracking-wide whitespace-nowrap">
                                        {col.name}
                                    </div>
                                    <div className="flex flex-col gap-1 mt-2">
                                        <div className="w-1 h-1 rounded-full bg-gray-600"></div>
                                        <div className="w-1 h-1 rounded-full bg-gray-600"></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
