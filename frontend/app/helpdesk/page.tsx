"use client";

import HelpdeskHeader from '@/components/helpdesk/HelpdeskHeader';
import { Plus, MessageSquare, Clock, User } from 'lucide-react';
import { useEffect, useState } from 'react';

type Ticket = {
    id: string;
    title: string;
    description?: string;
    state: string;
    priority: string;
    created_at: string;
};

export default function HelpdeskPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');

    useEffect(() => {
        fetch('http://localhost:8000/api/v1/helpdesk/tickets')
            .then((r) => r.json())
            .then(setTickets)
            .catch(console.error);
    }, []);

    const createTicket = async () => {
        if (!newTitle.trim()) return;
        const res = await fetch('http://localhost:8000/api/v1/helpdesk/tickets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newTitle, description: newDesc }),
        });
        if (res.ok) {
            const ticket = await res.json();
            setTickets([...tickets, ticket]);
            setNewTitle('');
            setNewDesc('');
            setIsModalOpen(false);
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <HelpdeskHeader />
            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-200">Tickets</h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded flex items-center gap-1"
                    >
                        <Plus size={16} /> New Ticket
                    </button>
                </div>

                {/* Ticket Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tickets.map((t) => (
                        <div
                            key={t.id}
                            className="bg-[#1E293B] border border-gray-700 rounded-lg p-4 hover:border-purple-500 transition-colors cursor-pointer group"
                        >
                            <h3 className="font-semibold text-gray-200 mb-1 truncate group-hover:text-purple-400">
                                {t.title}
                            </h3>
                            <p className="text-xs text-gray-400 mb-2">{t.state} • {t.priority}</p>
                            <p className="text-sm text-gray-300 line-clamp-2">{t.description}</p>
                            <div className="mt-3 flex items-center text-xs text-gray-500">
                                <Clock size={12} className="mr-1" />
                                {new Date(t.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* New Ticket Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-[#1E293B] rounded-lg shadow-xl w-full max-w-md border border-gray-700 p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Create Ticket</h2>
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Title"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-purple-500"
                            />
                            <textarea
                                placeholder="Description"
                                value={newDesc}
                                onChange={(e) => setNewDesc(e.target.value)}
                                rows={4}
                                className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-purple-500"
                            />
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-gray-300 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createTicket}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
