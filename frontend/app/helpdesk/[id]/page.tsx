"use client";
import { fetchAPI } from '@/lib/api';
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import HelpdeskHeader from "@/components/helpdesk/HelpdeskHeader";
import { ArrowLeft, Clock, User, MessageSquare, Send, ShieldAlert, Star } from "lucide-react";

type Ticket = {
    id: string;
    title: string;
    description?: string;
    state: string;
    priority: string;
    created_at: string;
};

type Message = {
    id: string;
    body: string;
    author_name: string;
    created_at: string;
};

export default function TicketDetail() {
    const { id } = useParams();
    const router = useRouter();
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        
        const fetchData = async () => {
            try {
                const ticketRes = await fetchAPI(`/helpdesk/tickets/${id}`);
                if (ticketRes.ok) setTicket(await ticketRes.json());
                
                const msgRes = await fetchAPI(`/helpdesk/tickets/${id}/messages`);
                if (msgRes.ok) setMessages(await msgRes.json());
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [id]);

    const sendMessage = async () => {
        if (!newMessage.trim()) return;
        const res = await fetchAPI(`/helpdesk/tickets/${id}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ body: newMessage }),
        });
        if (res.ok) {
            const msg = await res.json();
            setMessages([...messages, msg]);
            setNewMessage("");
        }
    };

    if (loading) return <div className="p-8 text-white bg-[#0F172A] h-screen">Loading...</div>;
    if (!ticket) return <div className="p-8 text-white bg-[#0F172A] h-screen">Ticket not found.</div>;

    return (
        <div className="flex flex-col h-screen bg-[#0F172A] text-gray-200">
            <HelpdeskHeader />
            
            <div className="flex-1 overflow-auto p-6 max-w-5xl mx-auto w-full">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft size={18} /> Back to Helpdesk
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Ticket Summary */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-[#1E293B] border border-gray-700 rounded-xl p-6 shadow-xl">
                            <div className="flex justify-between items-start mb-6">
                                <h1 className="text-xl font-bold text-white">{ticket.title}</h1>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    ticket.state === 'closed' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                                }`}>
                                    {ticket.state}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <ShieldAlert size={18} className="text-purple-400" />
                                    <div>
                                        <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block">Priority</label>
                                        <p className="text-sm font-medium text-white uppercase">{ticket.priority}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock size={18} className="text-blue-400" />
                                    <div>
                                        <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block">Created At</label>
                                        <p className="text-sm font-medium text-white">{new Date(ticket.created_at).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-gray-800">
                                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-2">Description</label>
                                    <p className="text-sm text-gray-400 leading-relaxed italic">
                                        "{ticket.description || "No description provided."}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Communication / Timeline */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-[#1E293B] border border-gray-700 rounded-xl flex flex-col h-[600px] shadow-xl overflow-hidden">
                            <div className="p-4 border-b border-gray-700 flex items-center gap-2 bg-[#1E293B]/50">
                                <MessageSquare size={20} className="text-purple-500" />
                                <h2 className="font-bold text-white">Timeline / Conversation</h2>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4 opacity-50">
                                        <MessageSquare size={48} />
                                        <p>No messages yet. Send a response below.</p>
                                    </div>
                                ) : (
                                    messages.map(msg => (
                                        <div key={msg.id} className="flex gap-4">
                                            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center shrink-0">
                                                <User size={20} className="text-gray-400" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-baseline gap-2 mb-1">
                                                    <span className="font-bold text-gray-200">{msg.author_name || "Support Team"}</span>
                                                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{new Date(msg.created_at).toLocaleString()}</span>
                                                </div>
                                                <div className="bg-[#0F172A]/50 border border-gray-800 rounded-lg p-3 text-sm text-gray-300 leading-relaxed shadow-sm">
                                                    {msg.body}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-4 border-t border-gray-700 bg-[#0F172A]/30">
                                <div className="relative">
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type your message here..."
                                        className="w-full bg-[#1E293B] border border-gray-700 rounded-lg pl-4 pr-12 py-3 text-sm text-white focus:border-purple-500 outline-none resize-none shadow-inner"
                                        rows={3}
                                    />
                                    <button 
                                        onClick={sendMessage}
                                        className="absolute right-3 bottom-3 p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-all shadow-lg"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
