"use client";
import { fetchAPI } from '@/lib/api';

import DiscussHeader from "@/components/discuss/DiscussHeader";
import { useEffect, useState } from "react";
import { Hash, Send, User } from "lucide-react";
import { supabase } from '@/lib/supabaseClient';

type Channel = {
    id: string;
    name: string;
    channel_type: string;
};

type Message = {
    id: string;
    channel_id: string;
    body: string;
    created_at: string;
    author_id?: string;
};

export default function DiscussPage() {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");

    useEffect(() => {
        fetchAPI("/discuss/channels")
            .then((r) => r.ok ? r.json() : [])
            .then((data) => {
                const channelsArray = Array.isArray(data) ? data : [];
                setChannels(channelsArray);
                if (channelsArray.length > 0) setActiveChannel(channelsArray[0]);
            })
            .catch((err) => {
                console.error(err);
                setChannels([]);
            });
    }, []);

    useEffect(() => {
        if (!activeChannel) return;

        // 1. Fetch historical messages
        fetchAPI(`/discuss/messages?channel_id=${activeChannel.id}`)
            .then((r) => r.ok ? r.json() : [])
            .then(setMessages)
            .catch(console.error);

        // 2. Subscribe to real-time new messages
        const channelSubscription = supabase
            .channel(`public:mail_message:channel_id=eq.${activeChannel.id}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'mail_message', filter: `channel_id=eq.${activeChannel.id}` },
                (payload) => {
                    const newMsg = payload.new as Message;
                    // Prevent duplicate if we just sent it (React state might already have it, though usually we rely on DB)
                    setMessages(prev => {
                        if (prev.find(m => m.id === newMsg.id)) return prev;
                        return [...prev, newMsg];
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channelSubscription);
        };
    }, [activeChannel]);

    const sendMessage = async () => {
        if (!newMessage.trim() || !activeChannel) return;
        
        const optimisticMsg = {
            id: 'temp-' + Date.now(),
            channel_id: activeChannel.id,
            body: newMessage,
            created_at: new Date().toISOString(),
        };
        
        // Optimistic UI update
        setMessages(prev => [...prev, optimisticMsg]);
        setNewMessage("");

        const res = await fetchAPI("/discuss/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                channel_id: activeChannel.id,
                body: optimisticMsg.body,
                message_type: "comment"
            }),
        });

        if (!res.ok) {
            console.error("Failed to send message");
            // Revert optimistic update on failure
            setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
            setNewMessage(optimisticMsg.body);
        }
    };

    const createChannel = async () => {
        const name = prompt("Enter channel name:");
        if (!name) return;
        const res = await fetchAPI("/discuss/channels", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, channel_type: "channel" }),
        });
        if (res.ok) {
            const ch = await res.json();
            setChannels([...channels, ch]);
            setActiveChannel(ch);
        }
    }

    return (
        <div className="flex h-[calc(100vh-120px)] overflow-hidden rounded-2xl border border-white/5 bg-[#0F172A]/40 backdrop-blur-xl shadow-2xl">

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 bg-[#1E293B] border-r border-gray-700 flex flex-col">
                    <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-300">Channels</h3>
                        <button onClick={createChannel} className="text-gray-400 hover:text-white">+</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {channels.map(ch => (
                            <button
                                key={ch.id}
                                onClick={() => setActiveChannel(ch)}
                                className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 text-sm ${activeChannel?.id === ch.id ? 'bg-pink-600/20 text-pink-400' : 'text-gray-400 hover:bg-gray-800'
                                    }`}
                            >
                                <Hash size={14} /> {ch.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-[#0F172A]">
                    {activeChannel ? (
                        <>
                            <div className="p-4 border-b border-gray-700 flex items-center gap-2">
                                <Hash size={20} className="text-gray-400" />
                                <h2 className="font-semibold text-white">{activeChannel.name}</h2>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map(msg => (
                                    <div key={msg.id} className="flex gap-3 group">
                                        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center shrink-0">
                                            <User size={14} className="text-gray-400" />
                                        </div>
                                        <div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="font-medium text-gray-200 text-sm">User</span>
                                                <span className="text-xs text-gray-500">{new Date(msg.created_at).toLocaleTimeString()}</span>
                                            </div>
                                            <p className="text-gray-300 text-sm mt-0.5">{msg.body}</p>
                                        </div>
                                    </div>
                                ))}
                                {messages.length === 0 && (
                                    <div className="text-center text-gray-500 mt-10">
                                        No messages yet. Start the conversation!
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-gray-700">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                        placeholder={`Message #${activeChannel.name}`}
                                        className="w-full bg-[#1E293B] border border-gray-600 rounded-lg pl-4 pr-10 py-2.5 text-white focus:border-pink-500 outline-none"
                                    />
                                    <button
                                        onClick={sendMessage}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-400"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            Select a channel to start chatting
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
