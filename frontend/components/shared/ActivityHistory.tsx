"use client";

import { useState, useEffect } from "react";
import { fetchAPI } from "@/lib/api";
import {
  Clock, MessageSquare, Plus, CheckCircle, XCircle, Trophy,
  FileText, ArrowRight, User, Send, RefreshCw, Activity as ActivityIcon
} from "lucide-react";

export type ActivityEntry = {
  id: string;
  module: string;
  entity_type: string;
  entity_id: string;
  entity_name?: string;
  action: string;
  description: string;
  user_email?: string;
  metadata?: Record<string, any>;
  created_at: string;
};

interface ActivityHistoryProps {
  entityId?: string;
  module?: string;
  entityType?: string;
  entityName?: string;
  title?: string;
  allowAddNote?: boolean;
  refreshKey?: number;
}

export default function ActivityHistory({
  entityId,
  module = "crm",
  entityType = "opportunity",
  entityName = "Record",
  title = "Activity & Audit History",
  allowAddNote = true,
  refreshKey = 0,
}: ActivityHistoryProps) {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchActivities = async () => {
    try {
      let url = "/activities?";
      if (entityId) {
        url += `entity_id=${encodeURIComponent(entityId)}&`;
      } else if (module) {
        url += `module=${encodeURIComponent(module)}&`;
      }
      const res = await fetchAPI(url);
      if (res.ok) {
        const data = await res.json();
        setActivities(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to load activity logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [entityId, module, refreshKey]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetchAPI("/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module,
          entity_type: entityType,
          entity_id: entityId || "general",
          entity_name: entityName,
          action: "note",
          description: newNote.trim(),
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setActivities((prev) => [created, ...prev]);
        setNewNote("");
      }
    } catch (err) {
      console.error("Failed to add note", err);
    } finally {
      setSubmitting(false);
    }
  };

  const getActionBadge = (action: string) => {
    const act = (action || "").toLowerCase();
    if (act.includes("lost")) {
      return {
        label: "Marked Lost",
        color: "bg-red-500/10 text-red-400 border-red-500/30",
        icon: <XCircle size={14} className="text-red-400" />,
      };
    }
    if (act.includes("won")) {
      return {
        label: "Marked Won",
        color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        icon: <Trophy size={14} className="text-emerald-400" />,
      };
    }
    if (act.includes("convert")) {
      return {
        label: "Converted",
        color: "bg-purple-500/10 text-purple-400 border-purple-500/30",
        icon: <FileText size={14} className="text-purple-400" />,
      };
    }
    if (act.includes("confirm")) {
      return {
        label: "Confirmed",
        color: "bg-green-500/10 text-green-400 border-green-500/30",
        icon: <CheckCircle size={14} className="text-green-400" />,
      };
    }
    if (act.includes("create")) {
      return {
        label: "Created",
        color: "bg-blue-500/10 text-blue-400 border-blue-500/30",
        icon: <Plus size={14} className="text-blue-400" />,
      };
    }
    if (act.includes("stage") || act.includes("status")) {
      return {
        label: "Stage Changed",
        color: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        icon: <ArrowRight size={14} className="text-amber-400" />,
      };
    }
    if (act.includes("note")) {
      return {
        label: "Note",
        color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
        icon: <MessageSquare size={14} className="text-cyan-400" />,
      };
    }
    return {
      label: "Updated",
      color: "bg-gray-500/10 text-gray-300 border-gray-500/30",
      icon: <ActivityIcon size={14} className="text-gray-400" />,
    };
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return {
        relative: date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        full: date.toLocaleString(),
      };
    } catch {
      return { relative: "Just now", full: "" };
    }
  };

  return (
    <div className="galaxy-card p-6 border border-white/10 rounded-xl bg-[#1E293B]/80 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-purple-400" />
          <h3 className="font-semibold text-white text-base">{title}</h3>
          <span className="text-xs bg-purple-500/20 text-purple-300 font-mono px-2 py-0.5 rounded-full">
            {activities.length} {activities.length === 1 ? "entry" : "entries"}
          </span>
        </div>
        <button
          onClick={fetchActivities}
          disabled={loading}
          title="Refresh History"
          className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Note / Log Input */}
      {allowAddNote && (
        <form onSubmit={handleAddNote} className="mb-6">
          <div className="relative">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder={`Log a note or activity update for ${entityName}...`}
              rows={2}
              className="w-full bg-black/30 border border-white/10 rounded-xl p-3 pr-24 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/80 transition-colors resize-none"
            />
            <button
              type="submit"
              disabled={submitting || !newNote.trim()}
              className="absolute right-2.5 bottom-3.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Send size={12} /> {submitting ? "Saving..." : "Log Note"}
            </button>
          </div>
        </form>
      )}

      {/* Timeline List */}
      <div className="space-y-4">
        {loading && activities.length === 0 ? (
          <div className="py-8 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            Loading activity history...
          </div>
        ) : activities.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-white/10 rounded-xl">
            <MessageSquare size={28} className="mx-auto text-gray-600 mb-2" />
            <p className="text-sm text-gray-400 font-medium">No activity history recorded yet.</p>
            <p className="text-xs text-gray-500 mt-1">
              Actions like stage updates, conversions, and notes will automatically appear here.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-purple-500/40 before:via-white/10 before:to-transparent">
            {activities.map((item) => {
              const badge = getActionBadge(item.action);
              const times = formatTime(item.created_at);
              return (
                <div key={item.id} className="relative group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-[#1E293B] border-2 border-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  </div>

                  {/* Card */}
                  <div className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 rounded-xl p-3.5 transition-all">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${badge.color}`}
                        >
                          {badge.icon}
                          {badge.label}
                        </span>
                        {item.entity_name && item.entity_name !== entityName && (
                          <span className="text-xs text-purple-300 font-medium">
                            {item.entity_name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400" title={times.full}>
                        <User size={12} className="text-gray-500" />
                        <span className="text-gray-400 font-mono text-[11px]">
                          {item.user_email || "admin@galaxy.erp"}
                        </span>
                        <span>•</span>
                        <span>{times.relative}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-200 leading-relaxed font-normal whitespace-pre-wrap">
                      {item.description}
                    </p>

                    {item.metadata && Object.keys(item.metadata).length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-white/5 flex flex-wrap gap-2 text-[11px]">
                        {Object.entries(item.metadata).map(([k, v]) => (
                          <span
                            key={k}
                            className="bg-black/20 text-gray-400 px-2 py-0.5 rounded font-mono"
                          >
                            <strong className="text-gray-300 capitalize">{k.replace("_", " ")}:</strong>{" "}
                            {typeof v === "number" ? v.toLocaleString() : String(v)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
