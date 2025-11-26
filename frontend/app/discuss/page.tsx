"use client";

import DiscussHeader from "@/components/discuss/DiscussHeader";
import { useEffect, useState } from "react";
import { Hash, Send, User } from "lucide-react";

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
        fetch("http://localhost:8000/api/v1/discuss/channels")
            .then((r) => r.json())
            .then((data) => {
                setChannels(data);
                if (data.length > 0) setActiveChannel(data[0]);
            })
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (activeChannel) {
            fetch(`http://localhost:8000/api/v1/discuss/messages?channel_id=${activeChannel.id}`)
                .then((r) => r.json())
                .then(setMessages)
                .catch(console.error);
        }
    }, [activeChannel]);

    const sendMessage = async () => {
        if (!newMessage.trim() || !activeChannel) return;

        const res = await fetch("http://localhost:8000/api/v1/discuss/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                channel_id: activeChannel.id,
                body: newMessage,
                message_type: "comment"
            }),
        });

        if (res.ok) {
            const msg = await res.json();
            setMessages([...messages, msg]);
            setNewMessage("");
        }
    };

    const createChannel = async () => {
        const name = prompt("Enter channel name:");
        if (!name) return;
        const res = await fetch("http://localhost:8000/api/v1/discuss/channels", {
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
        <div className="flex flex-col h-screen">
            <DiscussHeader />

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
