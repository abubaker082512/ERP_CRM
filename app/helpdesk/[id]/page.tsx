"use client";
import { fetchAPI } from "@/lib/api";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Send, Trash2, Clock, CheckCircle, AlertTriangle,
  MessageCircle, User, Tag, ChevronRight
} from "lucide-react";

const STAGES = ["new", "in_progress", "pending", "done"];
const STAGE_LABELS: Record<string, string> = {
  new: "New", in_progress: "In Progress", pending: "Pending", done: "Resolved"
};
const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
  "0": { label: "Low", color: "text-gray-400" },
  "1": { label: "Normal", color: "text-blue-400" },
  "2": { label: "High", color: "text-yellow-400" },
  "3": { label: "Urgent", color: "text-red-400" },
};

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [ticket, setTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => { fetchTicket(); }, [params.id]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const fetchTicket = async () => {
    try {
      const res = await fetchAPI(`/helpdesk/tickets/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setTicket(data);
        setMessages(data.messages || []);
      } else router.push("/helpdesk");
    } catch { router.push("/helpdesk"); }
    finally { setLoading(false); }
  };

  const handleStageChange = async (stage: string) => {
    const res = await fetchAPI(`/helpdesk/tickets/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage_id: stage }),
    });
    if (res.ok) { const d = await res.json(); setTicket(d); showToast(`Stage updated to ${STAGE_LABELS[stage]}`); }
  };

  const handleSendMessage = async () => {
    if (!newMsg.trim()) return;
    setSending(true);
    try {
      const res = await fetchAPI("/helpdesk/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket_id: params.id, body: newMsg, author_name: "Support Agent" }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages([...messages, msg]);
        setNewMsg("");
        showToast("Reply sent");
      }
    } finally { setSending(false); }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this ticket?")) return;
    await fetchAPI(`/helpdesk/tickets/${params.id}`, { method: "DELETE" });
    router.push("/helpdesk");
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!ticket) return null;

  const priority = PRIORITY_LABELS[ticket.priority || "0"];
  const currentStageIdx = STAGES.indexOf(ticket.stage_id || "new");

  return (
    <div className="min-h-screen p-6 max-w-5xl mx-auto">
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-medium bg-green-500/20 border border-green-500/30 text-green-400 shadow-lg">
          {toast}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-400">
        <Link href="/helpdesk" className="flex items-center gap-1 hover:text-purple-400 transition-colors">
          <ArrowLeft size={16} /> Helpdesk
        </Link>
        <span>/</span>
        <span className="text-white truncate">{ticket.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="galaxy-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-white mb-2">{ticket.name}</h1>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold ${priority.color}`}>⚡ {priority.label} Priority</span>
                </div>
              </div>
              <button onClick={handleDelete}
                className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs transition-all">
                <Trash2 size={12} /> Delete
              </button>
            </div>

            {ticket.description && (
              <p className="text-gray-300 text-sm leading-relaxed">{ticket.description}</p>
            )}
          </div>

          {/* Stage Pipeline */}
          <div className="galaxy-card p-5">
            <h3 className="text-xs text-gray-400 font-semibold mb-3 uppercase tracking-wider">Status Pipeline</h3>
            <div className="flex items-center gap-1">
              {STAGES.map((stage, i) => {
                const isActive = ticket.stage_id === stage;
                const isPast = currentStageIdx > i;
                return (
                  <button key={stage} onClick={() => handleStageChange(stage)}
                    className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                      isActive ? "bg-purple-600 text-white shadow-lg" :
                      isPast ? "bg-purple-900/40 text-purple-400" :
                      "bg-white/5 text-gray-400 hover:bg-white/10"
                    }`}>
                    {stage === "done" ? "✅ " : stage === "in_progress" ? "🔄 " : ""}
                    {STAGE_LABELS[stage]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message Thread */}
          <div className="galaxy-card p-6">
            <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <MessageCircle size={16} className="text-purple-400" />
              Conversation ({messages.length})
            </h3>

            <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-6">No messages yet. Send the first reply.</p>
              ) : messages.map((msg) => (
                <div key={msg.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center shrink-0">
                    <User size={14} className="text-purple-400" />
                  </div>
                  <div className="flex-1 bg-white/5 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-purple-300">{msg.author_name || "Agent"}</span>
                      <span className="text-xs text-gray-500">{msg.created_at ? new Date(msg.created_at).toLocaleString() : ""}</span>
                    </div>
                    <p className="text-sm text-gray-200">{msg.body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Box */}
            <div className="flex gap-3">
              <textarea
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSendMessage(); }}
                rows={3}
                placeholder="Type your reply... (Ctrl+Enter to send)"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-500 resize-none transition-colors"
              />
              <button onClick={handleSendMessage} disabled={sending || !newMsg.trim()}
                className="self-end flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-3 rounded-xl text-sm font-medium transition-colors">
                <Send size={16} /> {sending ? "..." : "Send"}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="galaxy-card p-5">
            <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-4">Ticket Info</h3>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-gray-500">Created</span>
                <p className="text-sm text-white">{ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : "—"}</p>
              </div>
              {ticket.closed_at && (
                <div>
                  <span className="text-xs text-gray-500">Closed</span>
                  <p className="text-sm text-white">{new Date(ticket.closed_at).toLocaleDateString()}</p>
                </div>
              )}
              <div>
                <span className="text-xs text-gray-500">Stage</span>
                <p className="text-sm text-white">{STAGE_LABELS[ticket.stage_id || "new"]}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Priority</span>
                <p className={`text-sm font-semibold ${priority.color}`}>{priority.label}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="galaxy-card p-5">
            <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button onClick={() => handleStageChange("in_progress")}
                className="w-full flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-3 py-2 rounded-lg text-sm transition-all">
                <Clock size={14} /> Mark In Progress
              </button>
              <button onClick={() => handleStageChange("done")}
                className="w-full flex items-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 px-3 py-2 rounded-lg text-sm transition-all">
                <CheckCircle size={14} /> Resolve Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
