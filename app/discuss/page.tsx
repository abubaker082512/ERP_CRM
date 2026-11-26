"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import AppHeader from "@/components/layout/AppHeader";
import { useBranchContext } from "@/lib/branchContext";
import { useNotifications, triggerNotificationRefresh } from "@/lib/notificationContext";
import {
  Hash,
  MessageSquare,
  Send,
  Users,
  Plus,
  X,
  Smile,
  Search,
  ChevronDown,
  Trash2,
  Lock,
  UserPlus,
  UserMinus,
  Check,
  Shield,
  CheckSquare,
} from "lucide-react";

interface Channel {
  id: string;
  name: string;
  description?: string;
  channel_type: "channel" | "group" | "dm" | "task";
  taskId?: string;
  taskTitle?: string;
  priority?: string;
  deadlineAt?: string;
  members?: string[]; // array of member emails or IDs
}

interface Message {
  id: string;
  channel_id: string;
  body: string;
  author_name: string;
  author_email?: string;
  created_at: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  role?: string;
  online?: boolean;
}

const EMOJI_QUICK = ["👍", "❤️", "😂", "🎉", "🙏", "🔥", "✅", "👀"];

function avatarColor(name: string) {
  const colors = [
    "bg-purple-600",
    "bg-blue-600",
    "bg-green-600",
    "bg-pink-600",
    "bg-orange-500",
    "bg-teal-600",
    "bg-indigo-600",
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
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" }) + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function DiscussPage() {
  const { activeBranch, getEntityStorageKey } = useBranchContext();
  const { channelUnreads, markChannelSeen } = useNotifications();
  const companyId = activeBranch?.id || "default";

  const [channels, setChannels] = useState<Channel[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [search, setSearch] = useState("");
  const [tasksExpanded, setTasksExpanded] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string }>({
    id: "USR-001",
    name: "Workspace User",
    email: "user@company.com",
  });

  // Create Channel / Specific Group Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDesc, setNewChannelDesc] = useState("");
  const [newChannelType, setNewChannelType] = useState<"channel" | "group">("group");
  const [selectedNewMembers, setSelectedNewMembers] = useState<string[]>([]);

  // Manage Channel Members Modal (Add / Remove)
  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);
  const [quickMemberName, setQuickMemberName] = useState("");
  const [quickMemberEmail, setQuickMemberEmail] = useState("");

  const [channelsExpanded, setChannelsExpanded] = useState(true);
  const [groupsExpanded, setGroupsExpanded] = useState(true);
  const [membersExpanded, setMembersExpanded] = useState(true);
  const [hoverMsgId, setHoverMsgId] = useState<string | null>(null);
  const [emojiMsgId, setEmojiMsgId] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let me = { id: "USR-001", name: "Workspace User", email: "user@company.com" };
    try {
      const raw = localStorage.getItem("user") || localStorage.getItem("auth_data") || localStorage.getItem("user_data");
      if (raw) {
        const p = JSON.parse(raw);
        const email = p.email || p.user?.email || "user@company.com";
        const name = p.name || p.user?.name || p.user_metadata?.full_name || email.split("@")[0];
        me = { id: p.id || p.user?.id || "USR-001", name, email };
      }
    } catch {}
    setCurrentUser(me);

    // Load team members from entity-scoped team_members + API
    const DUMMY = new Set(["abubaker@galaxy.com", "elena.rostova@galaxy.com", "alex.vance@galaxy.com", "sarah.j@galaxy.com"]);
    let loadedMembers: Member[] = [];
    try {
      const rawTeam = localStorage.getItem(getEntityStorageKey("team_members"));
      if (rawTeam) {
        const parsed = JSON.parse(rawTeam);
        if (Array.isArray(parsed)) {
          loadedMembers = parsed
            .filter((m: any) => m.email && (!DUMMY.has(m.email.toLowerCase()) || me.email.toLowerCase() === "abubaker@galaxy.com"))
            .map((m: any) => ({ id: m.id, name: m.name, email: m.email, role: m.role, online: m.status === "active" }));
        }
      }
    } catch {}
    if (!loadedMembers.some((m) => m.email.toLowerCase() === me.email.toLowerCase())) {
      loadedMembers.unshift({ id: me.id, name: me.name, email: me.email, role: "Owner", online: true });
    }
    setMembers(loadedMembers);

    fetch(`/api/team/members?company_id=${encodeURIComponent(companyId)}&owner_name=${encodeURIComponent(me.name)}&owner_email=${encodeURIComponent(me.email)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.success && Array.isArray(d.allMembers) && d.allMembers.length > 0) {
          const clean = d.allMembers
            .filter((m: any) => m.email && (!DUMMY.has(m.email.toLowerCase()) || me.email.toLowerCase() === "abubaker@galaxy.com"))
            .map((m: any) => ({ id: m.id, name: m.name, email: m.email, role: m.role, online: m.status === "active" }));
          if (clean.length > 0) setMembers(clean);
        }
      })
      .catch(() => {});

    // Load channels (merge local + live isolated cluster channels including Task Discussions!)
    const defaultChannels: Channel[] = [
      { id: "CH-GENERAL", name: "general", description: "Company-wide announcements & operations", channel_type: "channel", members: [me.email] },
      { id: "CH-FLOOR", name: "call-floor-ops", description: "Live call center floor & escalations", channel_type: "group", members: [me.email] },
    ];
    let initialChannels = defaultChannels;
    try {
      const rawCh = localStorage.getItem(getEntityStorageKey("discuss_channels"));
      if (rawCh) {
        const parsed = JSON.parse(rawCh);
        if (Array.isArray(parsed) && parsed.length > 0) {
          initialChannels = parsed;
        }
      }
    } catch {}

    const urlChannelParam =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("channel")
        : null;

    setChannels(initialChannels);
    const matchedLocal = urlChannelParam
      ? initialChannels.find((c) => c.id === urlChannelParam || c.name === urlChannelParam)
      : null;
    setActiveChannel(matchedLocal || initialChannels[0]);

    // Sync live channels from isolated cluster (/api/discuss)
    fetch(`/api/discuss?company_id=${encodeURIComponent(companyId)}&email=${encodeURIComponent(me.email)}`, {
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((d) => {
        if (d?.success && Array.isArray(d.channels)) {
          const byId = new Map<string, Channel>();
          for (const c of initialChannels) byId.set(c.id, c);
          for (const c of d.channels) byId.set(c.id, c);
          const merged = Array.from(byId.values());
          setChannels(merged);
          try {
            localStorage.setItem(getEntityStorageKey("discuss_channels"), JSON.stringify(merged));
          } catch {}
          if (urlChannelParam) {
            const foundTarget = merged.find(
              (c) => c.id === urlChannelParam || c.name === urlChannelParam
            );
            if (foundTarget) setActiveChannel(foundTarget);
          }
        }
      })
      .catch(() => {});
  }, [companyId]);

  // Load & poll messages from isolated cluster when activeChannel changes
  useEffect(() => {
    if (!activeChannel) return;
    let cancelled = false;
    const msgKey = getEntityStorageKey(`discuss_msgs_${activeChannel.id}`);
    try {
      const raw = localStorage.getItem(msgKey);
      if (raw) setMessages(JSON.parse(raw));
    } catch {
      setMessages([]);
    }

    const syncChannelMsgs = async () => {
      try {
        const res = await fetch(
          `/api/discuss?company_id=${encodeURIComponent(companyId)}&channel_id=${encodeURIComponent(activeChannel.id)}&email=${encodeURIComponent(currentUser.email)}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (!cancelled && data?.success && Array.isArray(data.messages)) {
          if (data.messages.length > 0) {
            setMessages(data.messages);
            try {
              localStorage.setItem(msgKey, JSON.stringify(data.messages));
            } catch {}
          }
          markChannelSeen(activeChannel.id, data.messages.length);
        }
      } catch {}
    };

    syncChannelMsgs();
    const interval = setInterval(syncChannelMsgs, 6000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [activeChannel?.id, companyId, currentUser.email]);

  useEffect(() => {
    if (messages.length > 0) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const persistChannels = (next: Channel[]) => {
    setChannels(next);
    try {
      localStorage.setItem(getEntityStorageKey("discuss_channels"), JSON.stringify(next));
    } catch {}
  };

  const persistMessages = (channelId: string, next: Message[]) => {
    setMessages(next);
    try {
      localStorage.setItem(getEntityStorageKey(`discuss_msgs_${channelId}`), JSON.stringify(next));
    } catch {}
  };

  const handleCreateChannelOrGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newChannelName.trim();
    if (!trimmed) return;
    const memberEmails = Array.from(new Set([currentUser.email, ...selectedNewMembers]));
    const created: Channel = {
      id: `CH-${Date.now()}`,
      name: trimmed.toLowerCase().replace(/\s+/g, "-"),
      description: newChannelDesc.trim() || (newChannelType === "group" ? "Private team group" : "Team channel"),
      channel_type: newChannelType,
      members: memberEmails,
    };
    const next = [...channels, created];
    persistChannels(next);
    setActiveChannel(created);
    setNewChannelName("");
    setNewChannelDesc("");
    setSelectedNewMembers([]);
    setIsCreateOpen(false);
    fetch("/api/discuss", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...created, company_id: companyId }),
    }).catch(() => {});
  };

  const handleToggleMemberInActiveChannel = (email: string) => {
    if (!activeChannel) return;
    const current = activeChannel.members || [];
    const exists = current.some((e) => e.toLowerCase() === email.toLowerCase());
    const nextMembers = exists
      ? current.filter((e) => e.toLowerCase() !== email.toLowerCase())
      : [...current, email];
    const updatedChannel = { ...activeChannel, members: nextMembers };
    setActiveChannel(updatedChannel);
    persistChannels(channels.map((c) => (c.id === activeChannel.id ? updatedChannel : c)));
    fetch("/api/discuss", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: activeChannel.id, members: nextMembers, company_id: companyId }),
    }).catch(() => {});
  };

  const handleAddExternalMemberToGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickMemberEmail.trim() || !activeChannel) return;
    const email = quickMemberEmail.trim().toLowerCase();
    const name = quickMemberName.trim() || email.split("@")[0];
    if (!members.some((m) => m.email.toLowerCase() === email)) {
      const newMem: Member = { id: `MEM-${Date.now()}`, name, email, role: "Member", online: true };
      setMembers((prev) => [...prev, newMem]);
    }
    if (!(activeChannel.members || []).some((m) => m.toLowerCase() === email)) {
      handleToggleMemberInActiveChannel(email);
    }
    setQuickMemberName("");
    setQuickMemberEmail("");
  };

  const handleDeleteChannel = (channelId: string) => {
    if (channels.length <= 1) return;
    const next = channels.filter((c) => c.id !== channelId);
    persistChannels(next);
    if (activeChannel?.id === channelId) setActiveChannel(next[0]);
    fetch(`/api/discuss?company_id=${encodeURIComponent(companyId)}&channel_id=${encodeURIComponent(channelId)}`, { method: "DELETE" }).catch(() => {});
  };

  const handleOpenDM = (m: Member) => {
    const existing = channels.find(
      (c) => c.channel_type === "dm" && (c.members || []).includes(m.email)
    );
    if (existing) {
      setActiveChannel(existing);
      return;
    }
    const dm: Channel = {
      id: `DM-${Date.now()}`,
      name: m.name,
      description: `Direct message with ${m.name}`,
      channel_type: "dm",
      members: [currentUser.email, m.email],
    };
    persistChannels([...channels, dm]);
    setActiveChannel(dm);
  };

  const sendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    const body = newMsg.trim();
    if (!body || !activeChannel) return;
    const msg: Message = {
      id: `MSG-${Date.now()}`,
      channel_id: activeChannel.id,
      body,
      author_name: currentUser.name,
      author_email: currentUser.email,
      created_at: new Date().toISOString(),
    };
    const nextMsgs = [...messages, msg];
    persistMessages(activeChannel.id, nextMsgs);
    markChannelSeen(activeChannel.id, nextMsgs.length);
    setNewMsg("");
    fetch("/api/discuss", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "send_message", company_id: companyId, ...msg }),
    })
      .then(() => triggerNotificationRefresh())
      .catch(() => {});
  };

  const deleteMessage = (id: string) => {
    if (!activeChannel) return;
    persistMessages(activeChannel.id, messages.filter((m) => m.id !== id));
  };

  const reactMessage = (msgId: string, emoji: string) => {
    if (!activeChannel) return;
    persistMessages(
      activeChannel.id,
      messages.map((m) => (m.id === msgId ? { ...m, body: `${m.body}  ${emoji}` } : m))
    );
    setEmojiMsgId(null);
  };

  const taskChannels = channels.filter(
    (c) =>
      (c.channel_type === "task" || c.id.startsWith("TASK-")) &&
      (c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.taskTitle || "").toLowerCase().includes(search.toLowerCase()))
  );
  const publicChannels = channels.filter((c) => c.channel_type === "channel" && c.name.toLowerCase().includes(search.toLowerCase()));
  const privateGroups = channels.filter((c) => c.channel_type === "group" && c.name.toLowerCase().includes(search.toLowerCase()));
  const dmChannels = channels.filter((c) => c.channel_type === "dm");

  return (
    <div className="flex flex-col h-screen bg-[#0B101E] text-white">
      <AppHeader title="Discuss" />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 bg-[#111622] border-r border-gray-800 flex flex-col shrink-0">
          <div className="p-4 border-b border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black tracking-wide text-white flex items-center gap-2">
                <MessageSquare size={16} className="text-purple-400" /> Channels &amp; Groups
              </h2>
              <button
                onClick={() => {
                  setNewChannelType("group");
                  setIsCreateOpen(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-bold flex items-center gap-1 cursor-pointer"
                title="Create Channel or Specific Group"
              >
                <Plus size={13} /> New
              </button>
            </div>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-2.5 text-gray-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search channels, tasks, groups..."
                className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {/* Task Discussions (Single & Group Tasks) */}
            <div>
              <button
                onClick={() => setTasksExpanded((v) => !v)}
                className="w-full flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-orange-400 px-1 mb-1.5 cursor-pointer"
              >
                <span className="flex items-center gap-1">
                  <ChevronDown size={12} className={tasksExpanded ? "" : "-rotate-90"} /> Task Discussions ({taskChannels.length})
                </span>
                <Link href="/tasks" onClick={(e) => e.stopPropagation()} className="hover:text-white text-[10px]">
                  + Task
                </Link>
              </button>
              {tasksExpanded && (
                <div className="space-y-1">
                  {taskChannels.map((ch) => {
                    const unread = channelUnreads[ch.id] || 0;
                    return (
                      <button
                        key={ch.id}
                        onClick={() => setActiveChannel(ch)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                          activeChannel?.id === ch.id ? "bg-orange-600 text-white" : "text-gray-300 hover:bg-white/5"
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <CheckSquare size={13} className="shrink-0" />
                          <span className="truncate">{ch.taskTitle || ch.name}</span>
                        </span>
                        {unread > 0 ? (
                          <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                            {unread}
                          </span>
                        ) : (
                          <span className="text-[10px] opacity-70">{(ch.members || []).length}</span>
                        )}
                      </button>
                    );
                  })}
                  {taskChannels.length === 0 && (
                    <p className="text-[11px] text-gray-500 px-2">
                      Tasks created in the Tasks app automatically open a chat thread here.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Public Channels */}
            <div>
              <button
                onClick={() => setChannelsExpanded((v) => !v)}
                className="w-full flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-400 px-1 mb-1.5 cursor-pointer"
              >
                <span className="flex items-center gap-1"><ChevronDown size={12} className={channelsExpanded ? "" : "-rotate-90"} /> Public Channels</span>
                <span onClick={(e) => { e.stopPropagation(); setNewChannelType("channel"); setIsCreateOpen(true); }} className="hover:text-white"><Plus size={13} /></span>
              </button>
              {channelsExpanded && (
                <div className="space-y-1">
                  {publicChannels.map((ch) => {
                    const unread = channelUnreads[ch.id] || 0;
                    return (
                      <button
                        key={ch.id}
                        onClick={() => setActiveChannel(ch)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                          activeChannel?.id === ch.id ? "bg-purple-600 text-white" : "text-gray-300 hover:bg-white/5"
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate"><Hash size={13} /> {ch.name}</span>
                        {unread > 0 ? (
                          <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                            {unread}
                          </span>
                        ) : (
                          <span className="text-[10px] opacity-70">{(ch.members || []).length}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Specific / Private Groups */}
            <div>
              <button
                onClick={() => setGroupsExpanded((v) => !v)}
                className="w-full flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-cyan-400 px-1 mb-1.5 cursor-pointer"
              >
                <span className="flex items-center gap-1"><ChevronDown size={12} className={groupsExpanded ? "" : "-rotate-90"} /> Specific Groups</span>
                <span onClick={(e) => { e.stopPropagation(); setNewChannelType("group"); setIsCreateOpen(true); }} className="hover:text-white"><Plus size={13} /></span>
              </button>
              {groupsExpanded && (
                <div className="space-y-1">
                  {privateGroups.map((ch) => {
                    const unread = channelUnreads[ch.id] || 0;
                    return (
                      <button
                        key={ch.id}
                        onClick={() => setActiveChannel(ch)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                          activeChannel?.id === ch.id ? "bg-cyan-600 text-white" : "text-gray-300 hover:bg-white/5"
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate"><Lock size={12} /> {ch.name}</span>
                        {unread > 0 ? (
                          <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                            {unread}
                          </span>
                        ) : (
                          <span className="text-[10px] opacity-70">{(ch.members || []).length}</span>
                        )}
                      </button>
                    );
                  })}
                  {privateGroups.length === 0 && (
                    <p className="text-[11px] text-gray-500 px-2">No specific groups yet.</p>
                  )}
                </div>
              )}
            </div>

            {/* Team Members / Direct Messages */}
            <div>
              <button
                onClick={() => setMembersExpanded((v) => !v)}
                className="w-full flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-400 px-1 mb-1.5 cursor-pointer"
              >
                <span className="flex items-center gap-1"><ChevronDown size={12} className={membersExpanded ? "" : "-rotate-90"} /> Team Members ({members.length})</span>
              </button>
              {membersExpanded && (
                <div className="space-y-1">
                  {members.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleOpenDM(m)}
                      className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs text-gray-300 hover:bg-white/5 transition cursor-pointer"
                    >
                      <Avatar name={m.name} size="sm" />
                      <div className="text-left min-w-0 flex-1">
                        <div className="font-semibold truncate">{m.name}</div>
                        <div className="text-[10px] text-gray-500 truncate">{m.role || m.email}</div>
                      </div>
                    </button>
                  ))}
                  {dmChannels.length > 0 && (
                    <div className="pt-1 text-[10px] text-gray-500 px-2">{dmChannels.length} active DM(s)</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#0B101E]">
          {activeChannel ? (
            <>
              <header className="px-6 py-3.5 border-b border-gray-800 bg-[#111622]/70 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {activeChannel.channel_type === "group" ? (
                      <Lock size={16} className="text-cyan-400" />
                    ) : (
                      <Hash size={16} className="text-purple-400" />
                    )}
                    <h1 className="text-base font-bold text-white truncate">{activeChannel.name}</h1>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-300 uppercase font-bold">
                      {activeChannel.channel_type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{activeChannel.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {(activeChannel.channel_type === "task" || activeChannel.id.startsWith("TASK-")) && (
                    <Link
                      href="/tasks"
                      className="px-3 py-1.5 rounded-xl bg-orange-600/20 hover:bg-orange-600/35 border border-orange-500/35 text-orange-300 text-xs font-bold flex items-center gap-1.5"
                    >
                      <CheckSquare size={13} /> Open in Tasks App →
                    </Link>
                  )}
                  <button
                    onClick={() => setIsManageMembersOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Users size={14} /> Manage Members ({(activeChannel.members || []).length})
                  </button>
                  {channels.length > 1 && (
                    <button
                      onClick={() => handleDeleteChannel(activeChannel.id)}
                      className="p-2 rounded-xl bg-gray-800 hover:bg-rose-900/50 text-rose-400 cursor-pointer"
                      title="Delete channel/group"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </header>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto py-4 space-y-2">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-6">
                    <div className="w-14 h-14 rounded-2xl bg-purple-600/15 border border-purple-500/25 flex items-center justify-center text-purple-400 mb-3">
                      {activeChannel.channel_type === "group" ? <Lock size={24} /> : <Hash size={24} />}
                    </div>
                    <h3 className="text-sm font-bold text-white">Welcome to {activeChannel.name}</h3>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm">
                      Add or remove specific team members using "Manage Members" above and start collaborating.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = (msg.author_email || "").toLowerCase() === currentUser.email.toLowerCase();
                    return (
                      <div
                        key={msg.id}
                        className={`group flex gap-3 px-5 py-1 hover:bg-white/[0.02] relative ${isMe ? "flex-row-reverse" : ""}`}
                        onMouseEnter={() => setHoverMsgId(msg.id)}
                        onMouseLeave={() => { setHoverMsgId(null); setEmojiMsgId(null); }}
                      >
                        <Avatar name={msg.author_name} />
                        <div className={`flex flex-col max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-xs font-bold text-gray-200">{msg.author_name}</span>
                            <span className="text-[10px] text-gray-500">{formatTime(msg.created_at)}</span>
                          </div>
                          <div className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
                            isMe ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white" : "bg-[#1E293B] text-gray-200 border border-white/5"
                          }`}>
                            {msg.body}
                          </div>
                        </div>
                        {hoverMsgId === msg.id && (
                          <div className={`absolute top-1 ${isMe ? "left-5" : "right-5"} flex items-center gap-1 bg-[#1E293B] border border-white/10 rounded-xl px-2 py-1 shadow-lg`}>
                            <button onClick={() => setEmojiMsgId(emojiMsgId === msg.id ? null : msg.id)} className="text-gray-400 hover:text-yellow-400 p-1 cursor-pointer"><Smile size={14} /></button>
                            {isMe && <button onClick={() => deleteMessage(msg.id)} className="text-gray-400 hover:text-rose-400 p-1 cursor-pointer"><Trash2 size={14} /></button>}
                            {emojiMsgId === msg.id && (
                              <div className="absolute top-8 right-0 bg-[#0F172A] border border-white/10 rounded-xl p-2 flex gap-1 shadow-xl z-20">
                                {EMOJI_QUICK.map((em) => (
                                  <button key={em} onClick={() => reactMessage(msg.id, em)} className="text-base hover:scale-125 p-0.5 cursor-pointer">{em}</button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* Composer */}
              <form onSubmit={sendMessage} className="p-4 pb-16 border-t border-gray-800 bg-[#111622]/70">
                <div className="flex items-center gap-2 bg-gray-950 border border-gray-800 focus-within:border-purple-500 rounded-2xl px-4 py-2">
                  <input
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    placeholder={`Message ${activeChannel.name}...`}
                    className="flex-1 bg-transparent text-sm text-white outline-none placeholder-gray-500"
                  />
                  <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                    <Send size={13} /> Send
                  </button>
                </div>
              </form>
            </>
          ) : null}
        </main>
      </div>

      {/* CREATE CHANNEL / SPECIFIC GROUP MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Create Channel or Specific Group</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateChannelOrGroup} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewChannelType("group")}
                  className={`py-2 rounded-xl font-bold border flex items-center justify-center gap-1.5 cursor-pointer ${
                    newChannelType === "group" ? "bg-cyan-600/20 border-cyan-500 text-cyan-300" : "bg-gray-950 border-gray-800 text-gray-400"
                  }`}
                >
                  <Lock size={13} /> Specific Group
                </button>
                <button
                  type="button"
                  onClick={() => setNewChannelType("channel")}
                  className={`py-2 rounded-xl font-bold border flex items-center justify-center gap-1.5 cursor-pointer ${
                    newChannelType === "channel" ? "bg-purple-600/20 border-purple-500 text-purple-300" : "bg-gray-950 border-gray-800 text-gray-400"
                  }`}
                >
                  <Hash size={13} /> Public Channel
                </button>
              </div>
              <input
                required
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="Group / Channel Name (e.g. outbound-vip-team)"
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white"
              />
              <input
                value={newChannelDesc}
                onChange={(e) => setNewChannelDesc(e.target.value)}
                placeholder="Description / Purpose"
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white"
              />
              <div>
                <div className="text-[11px] font-bold text-gray-400 mb-1.5">Add Team Members to this Group</div>
                <div className="max-h-36 overflow-y-auto space-y-1 bg-gray-950 border border-gray-800 rounded-xl p-2">
                  {members.map((m) => {
                    const checked = selectedNewMembers.includes(m.email) || m.email.toLowerCase() === currentUser.email.toLowerCase();
                    return (
                      <label key={m.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setSelectedNewMembers((prev) =>
                              prev.includes(m.email) ? prev.filter((x) => x !== m.email) : [...prev, m.email]
                            )
                          }
                          className="accent-cyan-500"
                        />
                        <span className="text-white font-semibold">{m.name}</span>
                        <span className="text-[10px] text-gray-500 ml-auto">{m.email}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2.5 rounded-xl font-bold cursor-pointer">
                Create {newChannelType === "group" ? "Specific Group" : "Channel"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MANAGE MEMBERS (ADD / REMOVE) MODAL */}
      {isManageMembersOpen && activeChannel && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield size={16} className="text-cyan-400" /> Manage Members: {activeChannel.name}
              </h3>
              <button onClick={() => setIsManageMembersOpen(false)} className="text-gray-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto">
              {members.map((m) => {
                const isIn = (activeChannel.members || []).some((e) => e.toLowerCase() === m.email.toLowerCase());
                return (
                  <div key={m.id} className="flex items-center justify-between bg-gray-950 border border-gray-800 rounded-xl px-3 py-2">
                    <div className="min-w-0">
                      <div className="font-bold text-white truncate">{m.name}</div>
                      <div className="text-[10px] text-gray-400 truncate">{m.email}</div>
                    </div>
                    <button
                      onClick={() => handleToggleMemberInActiveChannel(m.email)}
                      className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer ${
                        isIn ? "bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30" : "bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      {isIn ? <><UserMinus size={12} /> Remove</> : <><UserPlus size={12} /> Add</>}
                    </button>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleAddExternalMemberToGroup} className="border-t border-gray-800 pt-3 space-y-2">
              <div className="text-[11px] font-bold text-gray-400">Or Add Member by Name &amp; Email</div>
              <div className="grid grid-cols-2 gap-2">
                <input value={quickMemberName} onChange={(e) => setQuickMemberName(e.target.value)} placeholder="Name" className="bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white" />
                <input required type="email" value={quickMemberEmail} onChange={(e) => setQuickMemberEmail(e.target.value)} placeholder="Email" className="bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white" />
              </div>
              <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                <Check size={14} /> Add to {activeChannel.name}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
