"use client";
import { fetchAPI } from "@/lib/api";
import { useState, useEffect, useRef, useCallback } from "react";
import AppHeader from "@/components/layout/AppHeader";
import {
  Hash, MessageSquare, Send, Users, Plus, X, Smile,
  Search, ChevronDown, Circle, MoreHorizontal, Trash2,
  AtSign, Bell, Settings, Lock, Phone, Video, User,
  CheckCheck, Loader2
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Channel {
  id: string;
  name: string;
  description?: string;
  channel_type: "channel" | "dm";
  members?: string[];
}

interface Message {
  id: string;
  channel_id: string;
  body: string;
  author_name: string;
  author_email?: string;
  author_id?: string;
  created_at: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  online?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const EMOJI_QUICK = ["👍", "❤️", "😂", "🎉", "🙏", "🔥", "✅", "👀"];

function avatarColor(name: string) {
  const colors = [
    "bg-purple-600", "bg-blue-600", "bg-green-600",
    "bg-pink-600", "bg-orange-500", "bg-teal-600",
    "bg-red-600", "bg-indigo-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const dims = size === "sm" ? "w-7 h-7 text-xs" : size === "lg" ? "w-11 h-11 text-base" : "w-9 h-9 text-sm";
  return (
    <div className={`${dims} ${avatarColor(name)} rounded-full flex items-center justify-center font-bold text-white shrink-0 shadow-md`}>
      {(name || "?")[0].toUpperCase()}
    </div>
  );
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" }) + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── Message Component ────────────────────────────────────────────────────────

function MessageBubble({
  msg,
  isMe,
  showAvatar,
  onDelete,
  onReact,
}: {
  msg: Message;
  isMe: boolean;
  showAvatar: boolean;
  onDelete: (id: string) => void;
  onReact: (msgId: string, emoji: string) => void;
}) {
  const [hover, setHover] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  return (
    <div
      className={`group flex gap-3 px-4 py-1 hover:bg-white/[0.02] transition-colors relative ${isMe ? "flex-row-reverse" : ""}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setShowEmoji(false); }}
    >
      {/* Avatar */}
      <div className="w-9 shrink-0">
        {showAvatar && <Avatar name={msg.author_name} />}
      </div>

      {/* Content */}
      <div className={`flex flex-col max-w-[72%] ${isMe ? "items-end" : "items-start"}`}>
        {showAvatar && (
          <div className={`flex items-baseline gap-2 mb-1 ${isMe ? "flex-row-reverse" : ""}`}>
            <span className="text-[13px] font-bold text-gray-200">{msg.author_name}</span>
            <span className="text-[11px] text-gray-600">{formatTime(msg.created_at)}</span>
          </div>
        )}
        <div className={`relative group/bubble`}>
          <div className={`px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed whitespace-pre-wrap break-words shadow-sm transition-all ${
            isMe
              ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-tr-sm"
              : "bg-[#1E293B] text-gray-200 border border-white/5 rounded-tl-sm"
          }`}>
            {msg.body}
          </div>
          {!showAvatar && (
            <span className={`absolute -bottom-5 text-[10px] text-gray-600 ${isMe ? "right-1" : "left-1"} opacity-0 group-hover/bubble:opacity-100 transition-opacity whitespace-nowrap`}>
              {formatTime(msg.created_at)}
            </span>
          )}
        </div>
      </div>

      {/* Hover Actions */}
      {hover && (
        <div className={`absolute top-0 ${isMe ? "left-4" : "right-4"} flex items-center gap-1 bg-[#1E293B] border border-white/10 rounded-xl px-2 py-1 shadow-lg z-10`}>
          <button onClick={() => setShowEmoji(v => !v)}
            className="text-gray-400 hover:text-yellow-400 p-1 rounded-lg hover:bg-white/5 transition-colors" title="React">
            <Smile size={14} />
          </button>
          {isMe && (
            <button onClick={() => onDelete(msg.id)}
              className="text-gray-400 hover:text-red-400 p-1 rounded-lg hover:bg-white/5 transition-colors" title="Delete">
              <Trash2 size={14} />
            </button>
          )}
          {showEmoji && (
            <div className="absolute top-8 right-0 bg-[#0F172A] border border-white/10 rounded-xl p-2 flex gap-1 shadow-xl z-20">
              {EMOJI_QUICK.map(e => (
                <button key={e} onClick={() => { onReact(msg.id, e); setShowEmoji(false); }}
                  className="text-lg hover:scale-125 transition-transform p-0.5">{e}</button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function DiscussPage() {
  // State
  const [channels, setChannels] = useState<Channel[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDesc, setNewChannelDesc] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [lastMessageTime, setLastMessageTime] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [membersExpanded, setMembersExpanded] = useState(true);
  const [channelsExpanded, setChannelsExpanded] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Bootstrap ───────────────────────────────────────────────────────────

  useEffect(() => {
    // Load current user from localStorage
    try {
      const stored = localStorage.getItem("auth_data") || localStorage.getItem("user_data");
      if (stored) {
        const parsed = JSON.parse(stored);
        const name = parsed.name || parsed.user?.name || parsed.email?.split("@")[0] || "You";
        setCurrentUser({ id: parsed.id || parsed.user?.id || "", email: parsed.email || parsed.user?.email || "", name });
      }
    } catch { }

    loadChannels();
    loadMembers();

    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  // ─── Auto-scroll on new messages ─────────────────────────────────────────

  useEffect(() => {
    if (messages.length) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  // ─── Polling for new messages ─────────────────────────────────────────────

  const startPolling = useCallback((channelId: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      const url = lastMessageTime
        ? `/discuss/channels/${channelId}/messages?after=${encodeURIComponent(lastMessageTime)}&limit=50`
        : `/discuss/channels/${channelId}/messages?limit=100`;
      try {
        const res = await fetchAPI(url);
        if (!res.ok) return;
        const newMsgs: Message[] = await res.json();
        if (newMsgs.length > 0) {
          setMessages(prev => {
            const existingIds = new Set(prev.map(m => m.id));
            const fresh = newMsgs.filter(m => !existingIds.has(m.id));
            if (fresh.length === 0) return prev;
            const latest = fresh[fresh.length - 1].created_at;
            setLastMessageTime(latest);
            return [...prev, ...fresh];
          });
        }
      } catch { }
    }, 3000); // Poll every 3 seconds
  }, [lastMessageTime]);

  // ─── Channel Selection ────────────────────────────────────────────────────

  useEffect(() => {
    if (activeChannel) {
      setMessages([]);
      setLastMessageTime(null);
      if (pollingRef.current) clearInterval(pollingRef.current);
      loadMessages(activeChannel.id);
    }
  }, [activeChannel?.id]);

  // Restart polling when lastMessageTime changes
  useEffect(() => {
    if (activeChannel) startPolling(activeChannel.id);
  }, [activeChannel?.id, startPolling]);

  // ─── API Calls ────────────────────────────────────────────────────────────

  const loadChannels = async () => {
    try {
      const res = await fetchAPI("/discuss/channels");
      if (res.ok) {
        const data: Channel[] = await res.json();
        // Only show public channels (not DMs) in the channel list
        const publicChannels = data.filter(c => c.channel_type !== "dm");
        setChannels(publicChannels);
        if (publicChannels.length > 0 && !activeChannel) {
          setActiveChannel(publicChannels[0]);
        }
      }
    } catch { }
    setLoading(false);
  };

  const loadMembers = async () => {
    try {
      const res = await fetchAPI("/discuss/members");
      if (res.ok) {
        const data: Member[] = await res.json();
        setMembers(data);
      }
    } catch { }
  };

  const loadMessages = async (channelId: string) => {
    try {
      const res = await fetchAPI(`/discuss/channels/${channelId}/messages?limit=100`);
      if (res.ok) {
        const data: Message[] = await res.json();
        setMessages(data);
        if (data.length > 0) setLastMessageTime(data[data.length - 1].created_at);
      }
    } catch { }
  };

  const createChannel = async () => {
    const trimmedName = newChannelName.trim();
    if (!trimmedName) return;
    setCreateLoading(true);
    setCreateError("");
    try {
      const res = await fetchAPI("/discuss/channels", {
        method: "POST",
        body: JSON.stringify({ name: trimmedName, description: newChannelDesc.trim(), channel_type: "channel" }),
      });
      if (res.ok) {
        const ch = await res.json();
        setIsModalOpen(false);
        setNewChannelName("");
        setNewChannelDesc("");
        await loadChannels();
        setActiveChannel(ch);
      } else {
        let detail = "Failed to create channel";
        try { const j = await res.json(); detail = j.detail || detail; } catch {}
        setCreateError(detail);
      }
    } catch (e: any) {
      setCreateError(`Network error: ${e.message || 'Could not reach server'}`);
    } finally {
      setCreateLoading(false);
    }
  };

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const body = newMsg.trim();
    if (!body || !activeChannel) return;
    setSending(true);
    setNewMsg("");

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const tempMsg: Message = {
      id: tempId,
      channel_id: activeChannel.id,
      body,
      author_name: currentUser?.name || "You",
      author_email: currentUser?.email,
      author_id: currentUser?.id,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const res = await fetchAPI("/discuss/messages", {
        method: "POST",
        body: JSON.stringify({
          channel_id: activeChannel.id,
          body,
          author_name: currentUser?.name || "You",
          author_email: currentUser?.email,
        }),
      });
      if (res.ok) {
        const saved: Message = await res.json();
        // Replace temp message with real one
        setMessages(prev => prev.map(m => m.id === tempId ? saved : m));
        setLastMessageTime(saved.created_at);
      } else {
        // Remove temp on failure
        setMessages(prev => prev.filter(m => m.id !== tempId));
        setNewMsg(body); // restore input
      }
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setNewMsg(body);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const deleteMessage = async (msgId: string) => {
    setMessages(prev => prev.filter(m => m.id !== msgId));
    await fetchAPI(`/discuss/messages/${msgId}`, { method: "DELETE" });
  };

  const reactToMessage = async (msgId: string, emoji: string) => {
    await fetchAPI("/discuss/reactions", {
      method: "POST",
      body: JSON.stringify({ message_id: msgId, emoji }),
    });
  };

  const startDM = async (member: Member) => {
    try {
      const res = await fetchAPI("/discuss/dm", {
        method: "POST",
        body: JSON.stringify({ target_user_id: member.id }),
      });
      if (res.ok) {
        const dmCh: Channel = await res.json();
        // Add display name for DM
        (dmCh as any).display_name = member.name;
        setActiveChannel(dmCh);
      }
    } catch (e) {
      // If DM endpoint not fully ready, just show a toast
      console.error("DM error", e);
    }
  };

  // ─── Derived ──────────────────────────────────────────────────────────────

  const isMe = (msg: Message) => {
    if (currentUser?.id && msg.author_id === currentUser.id) return true;
    if (currentUser?.name && msg.author_name === currentUser.name) return true;
    return false;
  };

  const filteredChannels = channels.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // Group consecutive messages by same author
  const shouldShowAvatar = (msgs: Message[], idx: number) => {
    if (idx === 0) return true;
    const prev = msgs[idx - 1];
    const curr = msgs[idx];
    if (prev.author_id !== curr.author_id || prev.author_name !== curr.author_name) return true;
    // More than 5 minutes apart → show avatar again
    const timeDiff = new Date(curr.created_at).getTime() - new Date(prev.created_at).getTime();
    return timeDiff > 5 * 60 * 1000;
  };

  const activeChannelName = activeChannel
    ? ((activeChannel as any).display_name || activeChannel.name)
    : "";

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-screen bg-[#0B101E]">
      <AppHeader title="Discuss" />

      <div className="flex-1 flex overflow-hidden">

        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <div className="w-64 bg-[#0D1117] border-r border-white/[0.06] flex flex-col shrink-0">

          {/* Search */}
          <div className="p-3 border-b border-white/[0.06]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={13} />
              <input
                type="text"
                placeholder="Search channels..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-[#161B26] border border-white/5 rounded-lg pl-8 pr-3 py-2 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-purple-500/40"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-2 space-y-0.5">

            {/* Channels Section */}
            <div>
              <button
                onClick={() => setChannelsExpanded(v => !v)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-500 hover:text-gray-300 transition-colors group"
              >
                <span className="flex items-center gap-1.5">
                  <ChevronDown size={12} className={`transition-transform ${channelsExpanded ? "" : "-rotate-90"}`} />
                  Channels
                </span>
                <button
                  onClick={e => { e.stopPropagation(); setIsModalOpen(true); }}
                  className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-white p-0.5 rounded hover:bg-white/10 transition-all"
                  title="Add channel"
                >
                  <Plus size={13} />
                </button>
              </button>

              {channelsExpanded && (
                <div className="space-y-0.5 pb-2">
                  {loading ? (
                    <div className="px-4 py-2 flex items-center gap-2 text-xs text-gray-600">
                      <Loader2 size={12} className="animate-spin" /> Loading...
                    </div>
                  ) : filteredChannels.length === 0 ? (
                    <div className="px-4 py-2 text-xs text-gray-600">No channels yet</div>
                  ) : (
                    filteredChannels.map(ch => (
                      <button
                        key={ch.id}
                        onClick={() => setActiveChannel(ch)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg mx-1.5 text-sm transition-all ${
                          activeChannel?.id === ch.id
                            ? "bg-purple-600/20 text-purple-300 font-semibold"
                            : "text-gray-500 hover:bg-white/5 hover:text-gray-200"
                        }`}
                      >
                        <Hash size={14} className={activeChannel?.id === ch.id ? "text-purple-400" : "text-gray-600"} />
                        <span className="truncate flex-1 text-left">{ch.name}</span>
                        {(unreadCounts[ch.id] || 0) > 0 && (
                          <span className="bg-purple-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shrink-0">
                            {unreadCounts[ch.id]}
                          </span>
                        )}
                      </button>
                    ))
                  )}
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg mx-1.5 text-xs text-gray-600 hover:text-gray-400 hover:bg-white/5 transition-all"
                  >
                    <Plus size={13} /> Add a channel
                  </button>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-white/[0.05] my-1 mx-3" />

            {/* Direct Messages Section */}
            <div>
              <button
                onClick={() => setMembersExpanded(v => !v)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-500 hover:text-gray-300 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <ChevronDown size={12} className={`transition-transform ${membersExpanded ? "" : "-rotate-90"}`} />
                  Direct Messages
                </span>
              </button>

              {membersExpanded && (
                <div className="space-y-0.5 pb-2">
                  {members.length === 0 && (
                    <div className="px-4 py-2 text-xs text-gray-600 italic">
                      Team members will appear here when they join your workspace.
                    </div>
                  )}
                  {members.map(member => (
                    <button
                      key={member.id}
                      onClick={() => startDM(member)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg mx-1.5 text-sm text-gray-400 hover:bg-white/5 hover:text-gray-200 transition-all group"
                    >
                      <div className="relative shrink-0">
                        <Avatar name={member.name} size="sm" />
                        <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0D1117] ${member.online ? "bg-green-400" : "bg-gray-600"}`} />
                      </div>
                      <span className="truncate flex-1 text-left text-xs">{member.name}</span>
                    </button>
                  ))}

                  {/* Current user at bottom (always online) */}
                  {currentUser && (
                    <div className="flex items-center gap-2.5 px-3 py-2 mx-1.5 text-sm text-gray-300">
                      <div className="relative shrink-0">
                        <Avatar name={currentUser.name} size="sm" />
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0D1117] bg-green-400" />
                      </div>
                      <span className="truncate flex-1 text-left text-xs">{currentUser.name} <span className="text-gray-600">(you)</span></span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Chat Area ────────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col bg-[#0F172A] min-w-0">
          {activeChannel ? (
            <>
              {/* Chat Header */}
              <div className="h-14 px-5 border-b border-white/[0.06] flex items-center justify-between shrink-0 bg-[#0D1117]">
                <div className="flex items-center gap-2.5">
                  {activeChannel.channel_type === "dm"
                    ? <AtSign size={18} className="text-purple-400" />
                    : <Hash size={18} className="text-purple-400" />
                  }
                  <h2 className="text-base font-bold text-white">{activeChannelName}</h2>
                  {activeChannel.description && (
                    <>
                      <div className="w-px h-4 bg-gray-700" />
                      <p className="text-xs text-gray-500 hidden sm:block">{activeChannel.description}</p>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors" title="Members">
                    <Users size={16} />
                  </button>
                  <button className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors" title="Search">
                    <Search size={16} />
                  </button>
                  <button className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors" title="Settings">
                    <Settings size={16} />
                  </button>
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto py-4">
                {/* Channel intro */}
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center px-8">
                    <div className="w-16 h-16 bg-purple-600/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mb-4">
                      {activeChannel.channel_type === "dm"
                        ? <AtSign size={28} className="text-purple-400" />
                        : <Hash size={28} className="text-purple-400" />
                      }
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {activeChannel.channel_type === "dm"
                        ? `Message ${activeChannelName}`
                        : `Welcome to #${activeChannelName}`
                      }
                    </h3>
                    <p className="text-gray-500 text-sm max-w-sm">
                      {activeChannel.description || (
                        activeChannel.channel_type === "dm"
                          ? "This is the start of your direct message history."
                          : `This is the very beginning of the #${activeChannelName} channel. Say hi! 👋`
                      )}
                    </p>
                  </div>
                )}

                {/* Messages */}
                <div className="space-y-0.5">
                  {messages.map((msg, idx) => {
                    const showAv = shouldShowAvatar(messages, idx);
                    return (
                      <MessageBubble
                        key={msg.id}
                        msg={msg}
                        isMe={isMe(msg)}
                        showAvatar={showAv}
                        onDelete={deleteMessage}
                        onReact={reactToMessage}
                      />
                    );
                  })}
                </div>
                <div ref={bottomRef} className="h-4" />
              </div>

              {/* Message Input */}
              <div className="px-4 pb-4 shrink-0">
                <div className="bg-[#1E293B] border border-white/8 rounded-2xl overflow-hidden shadow-lg focus-within:border-purple-500/40 transition-colors">
                  {/* Toolbar row */}
                  <div className="flex items-center gap-1 px-3 pt-2 pb-1 border-b border-white/5">
                    <button className="text-gray-500 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors text-xs font-bold">B</button>
                    <button className="text-gray-500 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors text-xs italic">I</button>
                    <button className="text-gray-500 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors text-xs underline">U</button>
                    <div className="w-px h-4 bg-gray-700 mx-1" />
                    <button className="text-gray-500 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors">
                      <AtSign size={13} />
                    </button>
                    <button className="text-gray-500 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors">
                      <Smile size={13} />
                    </button>
                  </div>

                  {/* Text area */}
                  <form onSubmit={sendMessage}>
                    <div className="flex items-end gap-2 px-3 py-2">
                      <textarea
                        ref={inputRef}
                        value={newMsg}
                        onChange={e => { setNewMsg(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px"; }}
                        onKeyDown={handleKeyDown}
                        placeholder={`Message ${activeChannel.channel_type === "dm" ? activeChannelName : `#${activeChannelName}`}... (Enter to send, Shift+Enter for new line)`}
                        rows={1}
                        className="flex-1 bg-transparent text-gray-200 text-sm placeholder-gray-600 outline-none resize-none min-h-[24px] max-h-[160px] leading-relaxed"
                        style={{ height: "24px" }}
                      />
                      <button
                        type="submit"
                        disabled={!newMsg.trim() || sending}
                        className="p-2.5 bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-md hover:shadow-purple-500/25 active:scale-95 shrink-0"
                        title="Send (Enter)"
                      >
                        {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                      </button>
                    </div>
                  </form>

                  {/* Hint */}
                  <div className="px-3 pb-2 flex items-center gap-3 text-[10px] text-gray-700">
                    <span><kbd className="font-mono">Enter</kbd> to send</span>
                    <span><kbd className="font-mono">Shift+Enter</kbd> new line</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <div className="w-20 h-20 bg-[#1E293B] rounded-2xl flex items-center justify-center mb-5 border border-white/5">
                <MessageSquare size={36} className="opacity-30" />
              </div>
              <h3 className="text-lg font-bold text-gray-400 mb-2">Welcome to Discuss</h3>
              <p className="text-sm text-gray-600 text-center max-w-xs">
                Select a channel to start messaging your team,<br />or create a new one.
              </p>
              <button onClick={() => setIsModalOpen(true)}
                className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold text-sm transition-colors shadow-lg">
                <Plus size={16} /> Create a Channel
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ── Create Channel Modal ─────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A2236] rounded-2xl p-6 w-full max-w-md border border-white/8 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-white">Create a Channel</h3>
                <p className="text-gray-500 text-xs mt-0.5">Channels are where your team communicates</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Channel Name *</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                  <input
                    type="text"
                    value={newChannelName}
                    onChange={e => setNewChannelName(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))}
                    onKeyDown={e => { if (e.key === "Enter") createChannel(); }}
                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all"
                    placeholder="e.g. general, announcements"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-gray-600 mt-1">Lowercase letters, numbers, and hyphens only</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Description (optional)</label>
                <input
                  type="text"
                  value={newChannelDesc}
                  onChange={e => setNewChannelDesc(e.target.value)}
                  className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-purple-500 outline-none transition-all"
                  placeholder="What is this channel about?"
                />
              </div>
            </div>

            {/* Inline error — no browser alert needed */}
            {createError && (
              <div className="mt-3 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-start gap-2">
                <span className="shrink-0 mt-0.5">⚠</span>
                <span>{createError}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/5">
              <button onClick={() => { setIsModalOpen(false); setCreateError(""); }} disabled={createLoading}
                className="px-4 py-2.5 text-sm text-gray-400 hover:text-white font-medium transition-colors">
                Cancel
              </button>
              <button
                onClick={createChannel}
                disabled={!newChannelName.trim() || createLoading}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center gap-2"
              >
                {createLoading ? <><Loader2 size={15} className="animate-spin" /> Creating...</> : <><Plus size={15} /> Create Channel</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
