"use client";
import { fetchAPI } from "@/lib/api";
import { useState, useEffect } from "react";
import AppHeader from "@/components/layout/AppHeader";
import { Hash, MessageSquare, Send, Users, Plus } from "lucide-react";

export default function DiscussPage() {
  const [channels, setChannels] = useState<any[]>([]);
  const [activeChannel, setActiveChannel] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");

  useEffect(() => { loadChannels(); }, []);
  useEffect(() => {
    if (activeChannel) loadMessages(activeChannel.id);
  }, [activeChannel]);

  const loadChannels = async () => {
    const res = await fetchAPI("/discuss/channels");
    if (res.ok) {
      const data = await res.json();
      setChannels(data);
      if (data.length > 0 && !activeChannel) setActiveChannel(data[0]);
    }
    setLoading(false);
  };

  const loadMessages = async (channelId: string) => {
    const res = await fetchAPI(`/discuss/channels/${channelId}/messages`);
    if (res.ok) setMessages(await res.json());
  };

  const createChannel = async () => {
    if (!newChannelName.trim()) return;
    const res = await fetchAPI("/discuss/channels", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newChannelName })
    });
    if (res.ok) {
      setNewChannelName("");
      setIsModalOpen(false);
      loadChannels();
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeChannel) return;
    
    const res = await fetchAPI("/discuss/messages", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel_id: activeChannel.id, body: newMsg, author_name: "You" })
    });
    if (res.ok) {
      setNewMsg("");
      loadMessages(activeChannel.id); // Reload to get new message
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0B101E]">
      <AppHeader title="Discuss" />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-[#141A28] border-r border-gray-800 flex flex-col shrink-0">
          <div className="p-4 flex items-center justify-between border-b border-gray-800">
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Channels</h2>
            <button onClick={() => setIsModalOpen(true)} className="text-gray-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors">
              <Plus size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {channels.map(ch => (
              <button key={ch.id} onClick={() => setActiveChannel(ch)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeChannel?.id === ch.id ? "bg-indigo-600/20 text-indigo-400" : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                }`}>
                <Hash size={16} className={activeChannel?.id === ch.id ? "text-indigo-400" : "text-gray-500"} />
                <span className="truncate">{ch.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-[#0F172A]">
          {activeChannel ? (
            <>
              {/* Chat Header */}
              <div className="h-14 px-6 border-b border-gray-800 flex items-center gap-2 shadow-sm shrink-0 bg-[#141A28]">
                <Hash size={20} className="text-gray-500" />
                <h2 className="text-lg font-bold text-white">{activeChannel.name}</h2>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col-reverse">
                <div className="space-y-6">
                  {messages.map((msg, i) => {
                    const isMe = msg.author_name === "You";
                    return (
                      <div key={msg.id} className={`flex gap-4 max-w-3xl ${isMe ? "ml-auto flex-row-reverse" : ""}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-lg shadow-sm ${isMe ? "bg-indigo-600" : "bg-gray-600"}`}>
                          {(msg.author_name || "U")[0].toUpperCase()}
                        </div>
                        <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-sm font-bold text-gray-200">{msg.author_name || "User"}</span>
                            <span className="text-xs text-gray-500">{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                          <div className={`px-4 py-2.5 rounded-2xl text-[15px] shadow-sm whitespace-pre-wrap ${
                            isMe ? "bg-indigo-600 text-white rounded-tr-none" : "bg-[#1E293B] text-gray-200 border border-gray-700 rounded-tl-none"
                          }`}>
                            {msg.body}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {messages.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                      <MessageSquare size={48} className="mx-auto mb-4 opacity-30" />
                      <p>This is the start of the #{activeChannel.name} channel.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Input Area */}
              <div className="p-4 bg-[#141A28] border-t border-gray-800 shrink-0">
                <form onSubmit={sendMessage} className="relative max-w-4xl mx-auto">
                  <input type="text" value={newMsg} onChange={e => setNewMsg(e.target.value)}
                    placeholder={`Message #${activeChannel.name}...`}
                    className="w-full bg-[#1E293B] border border-gray-700 rounded-xl pl-4 pr-12 py-3.5 text-white outline-none focus:border-indigo-500 shadow-inner" />
                  <button type="submit" disabled={!newMsg.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-lg transition-colors">
                    <Send size={16} className="ml-0.5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <MessageSquare size={64} className="mb-4 opacity-30" />
              <p className="text-lg font-medium">Select a channel to start messaging</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] rounded-2xl p-6 w-full max-w-sm border border-gray-700 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Create Channel</h3>
            <input type="text" value={newChannelName} onChange={(e) => setNewChannelName(e.target.value)}
              className="w-full bg-[#0F172A] border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none mb-6" 
              placeholder="e.g. general" autoFocus />
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white font-medium">Cancel</button>
              <button onClick={createChannel} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl font-bold">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
