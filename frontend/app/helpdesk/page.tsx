"use client";
import { fetchAPI } from '@/lib/api';

import HelpdeskHeader from '@/components/helpdesk/HelpdeskHeader';
import { Plus, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Ticket = {
    id: string;
    title: string;
    description?: string;
    state: string;
    priority: string;
    team_id?: string;
    created_at: string;
};

type Team = {
    id: string;
    name: string;
};

export default function HelpdeskPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'my' | 'teams'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ticketsRes, teamsRes] = await Promise.all([
                    fetchAPI("/helpdesk/tickets"),
                    fetchAPI("/helpdesk/teams")
                ]);
                if (ticketsRes.ok) setTickets(await ticketsRes.json());
                if (teamsRes.ok) setTeams(await teamsRes.json());
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const createTicket = async () => {
        if (!newTitle.trim()) return;
        const res = await fetchAPI("/helpdesk/tickets", {
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
                <div className="flex gap-1 mb-6 bg-[#1E293B] rounded-lg p-1 w-fit">
                    <button onClick={() => setActiveTab('all')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'all' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                        All Tickets
                    </button>
                    <button onClick={() => setActiveTab('teams')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'teams' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                        Support Teams
                    </button>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-200">
                        {activeTab === 'teams' ? 'Support Teams' : 'Tickets'}
                    </h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded flex items-center gap-1 font-bold shadow-lg shadow-purple-900/20 transition-all"
                    >
                        <Plus size={16} /> New Ticket
                    </button>
                </div>

                {activeTab === 'teams' ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {teams.map(team => (
                            <div key={team.id} className="galaxy-card p-6 border-l-4 border-purple-500">
                                <h3 className="text-white font-bold text-lg mb-2">{team.name}</h3>
                                <div className="flex justify-between items-center text-xs text-gray-400">
                                    <span>Active Tickets</span>
                                    <span className="text-purple-400 font-bold">{tickets.filter(t => t.team_id === team.id).length}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tickets.map((t) => (
                            <Link
                                key={t.id}
                                href={`/helpdesk/${t.id}`}
                                className="block galaxy-card !p-5 group"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-bold text-gray-200 truncate pr-2 group-hover:text-purple-400 transition-colors">
                                        {t.title}
                                    </h3>
                                    <div className={`shrink-0 w-2 h-2 rounded-full ${
                                        t.priority === 'urgent' ? 'bg-red-500 animate-pulse' :
                                        t.priority === 'high' ? 'bg-orange-500' : 'bg-green-500'
                                    }`}></div>
                                </div>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/5 text-gray-400 border border-white/5">{t.state}</span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20">{t.priority}</span>
                                </div>
                                <p className="text-sm text-gray-400 line-clamp-2 mb-6 h-10 leading-relaxed">{t.description}</p>
                                <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest border-t border-white/5 pt-4">
                                    <div className="flex items-center gap-1">
                                        <Clock size={12} className="text-purple-500" />
                                        {new Date(t.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="flex -space-x-2">
                                        <div className="w-5 h-5 rounded-full bg-purple-600 border border-[#0F172A] flex items-center justify-center text-white text-[8px]">U</div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
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
