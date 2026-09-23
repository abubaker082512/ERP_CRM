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

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { MessageSquare, Hash, Star, Inbox, Send, Settings } from "lucide-react";
import { useState } from "react";

const MENU_ITEMS = [
    { name: "Inbox", href: "/discuss" },
    { name: "Channels", href: "/discuss/channels" },
    { name: "Configuration", href: "/discuss/configuration" },
];

type Message = {
    id: string;
    sender: string;
    subject: string;
    preview: string;
    date: string;
    read: boolean;
    starred: boolean;
};

const mockMessages: Message[] = [
    { id: "MSG/001", sender: "System Notification", subject: "Welcome to ERP", preview: "Your account has been successfully created...", date: "10:30 AM", read: false, starred: true },
    { id: "MSG/002", sender: "John Doe", subject: "Project Update", preview: "Hey, just wanted to share the latest progress on...", date: "Yesterday", read: true, starred: false },
    { id: "MSG/003", sender: "Jane Smith", subject: "Meeting Reminder", preview: "Don't forget about the team meeting at 2 PM...", date: "Dec 01", read: true, starred: false },
];

export default function DiscussPage() {
    const [activeTab, setActiveTab] = useState("inbox");

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Discuss"
                moduleIcon={<MessageSquare size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search messages..."
            />

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 bg-[#1E293B] border-r border-gray-700 flex flex-col">
                    <div className="p-4 space-y-2">
                        <button
                            onClick={() => setActiveTab("inbox")}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'inbox' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                        >
                            <Inbox size={18} />
                            <span className="font-medium">Inbox</span>
                            <span className="ml-auto bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">1</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("starred")}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'starred' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                        >
                            <Star size={18} />
                            <span className="font-medium">Starred</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("history")}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                        >
                            <Clock size={18} /> {/* Using Clock icon, need to import it */}
                            <span className="font-medium">History</span>
                        </button>
                    </div>

                    <div className="p-4 border-t border-gray-700">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Channels</h3>
                        <div className="space-y-1">
                            <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:bg-gray-700 hover:text-white rounded-lg transition-colors">
                                <Hash size={18} />
                                <span>general</span>
                            </button>
                            <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:bg-gray-700 hover:text-white rounded-lg transition-colors">
                                <Hash size={18} />
                                <span>sales</span>
                            </button>
                            <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:bg-gray-700 hover:text-white rounded-lg transition-colors">
                                <Hash size={18} />
                                <span>random</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Message List */}
                <div className="flex-1 overflow-auto bg-[#0F172A] p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-semibold text-gray-200 capitalize">{activeTab}</h2>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2">
                            <Send size={18} /> New Message
                        </button>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-hidden">
                        {mockMessages.map((msg) => (
                            <div key={msg.id} className={`flex items-center p-4 border-b border-gray-700 hover:bg-[#2D3748] transition-colors cursor-pointer ${!msg.read ? 'bg-[#2D3748]/50' : ''}`}>
                                <div className="mr-4">
                                    <Star size={18} className={`${msg.starred ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500 hover:text-yellow-400'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`font-medium ${!msg.read ? 'text-white' : 'text-gray-300'}`}>{msg.sender}</span>
                                        <span className="text-xs text-gray-500">{msg.date}</span>
                                    </div>
                                    <div className={`text-sm mb-1 ${!msg.read ? 'text-gray-200 font-medium' : 'text-gray-400'}`}>{msg.subject}</div>
                                    <div className="text-sm text-gray-500 truncate">{msg.preview}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
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

// Need to import Clock icon
import { Clock } from "lucide-react";
