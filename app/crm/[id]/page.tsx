"use client";
import { fetchAPI } from "@/lib/api";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Star, Trophy, XCircle, Trash2, Edit2, Save, X,
  DollarSign, Calendar, TrendingUp, FileText, User
} from "lucide-react";

import ActivityHistory from "@/components/shared/ActivityHistory";

const STAGES = ["New", "Qualified", "Proposition", "Won", "Lost"];

export default function OpportunityDetailPage() {
  const router = useRouter();
  const rawParams = useParams();
  const id = rawParams?.id as string;
  const [opp, setOpp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [activityRefresh, setActivityRefresh] = useState(0);

  useEffect(() => {
    if (id) fetchOpp();
  }, [id]);

  const fetchOpp = async () => {
    try {
      const res = await fetchAPI(`/opportunities/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOpp(data);
        setForm(data);
      } else router.push("/crm");
    } catch { router.push("/crm"); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetchAPI(`/opportunities/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          expected_revenue: parseFloat(form.expected_revenue) || 0,
          stage: form.stage,
          notes: form.notes,
          win_probability: parseFloat(form.win_probability) || 0,
          priority: form.priority !== undefined ? parseInt(form.priority) : opp.priority,
          close_date: form.close_date ? form.close_date : null,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOpp(updated);
        setForm(updated);
        setEditing(false);
        setActivityRefresh((prev) => prev + 1);
      }
    } catch (e) {
      console.error("Failed to save opportunity", e);
    } finally {
      setSaving(false);
    }
  };

  const handleStageChange = async (newStage: string) => {
    let win_prob = opp.win_probability;
    if (newStage === "Won") win_prob = 100;
    else if (newStage === "Lost") win_prob = 0;

    const payload: any = { stage: newStage };
    if (win_prob !== undefined) payload.win_probability = win_prob;

    // Optimistic UI update
    setOpp((prev: any) => ({ ...prev, stage: newStage, win_probability: win_prob }));
    setForm((prev: any) => ({ ...prev, stage: newStage, win_probability: win_prob }));

    try {
      const res = await fetchAPI(`/opportunities/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updated = await res.json();
        setOpp(updated);
        setForm(updated);
        setActivityRefresh((prev) => prev + 1);
      }
    } catch (e) {
      console.error("Failed to update stage", e);
    }
  };

  const handlePriorityChange = async (starLevel: number) => {
    const currentPriority = editing ? (form.priority || 0) : (opp.priority || 0);
    const newPriority = currentPriority === starLevel ? 0 : starLevel;

    if (editing) {
      setForm({ ...form, priority: newPriority });
    } else {
      setOpp((prev: any) => ({ ...prev, priority: newPriority }));
      setForm((prev: any) => ({ ...prev, priority: newPriority }));
      try {
        const res = await fetchAPI(`/opportunities/${params.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priority: newPriority }),
        });
        if (res.ok) {
          const updated = await res.json();
          setOpp(updated);
          setForm(updated);
          setActivityRefresh((prev) => prev + 1);
        }
      } catch (e) {
        console.error("Failed to update priority", e);
      }
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this opportunity?")) return;
    await fetchAPI(`/opportunities/${params.id}`, { method: "DELETE" });
    router.push("/crm");
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!opp) return null;

  const probability = opp.win_probability || 0;
  const probColor = probability >= 70 ? "text-green-400" : probability >= 30 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/crm" className="flex items-center gap-1 hover:text-purple-400 transition-colors">
          <ArrowLeft size={16} /> CRM
        </Link>
        <span>/</span>
        <span className="text-white">{opp.name}</span>
      </div>

      {/* Header Card */}
      <div className="galaxy-card p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {editing ? (
              <input
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="text-2xl font-bold bg-transparent border-b border-purple-500 text-white outline-none w-full mb-2"
              />
            ) : (
              <h1 className="text-2xl font-bold text-white mb-1">{opp.name}</h1>
            )}
            <span className={`text-sm font-semibold ${probColor}`}>
              {probability}% win probability
            </span>
          </div>
          <div className="flex items-center gap-2 ml-4">
            {editing ? (
              <>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                  <Save size={14} /> {saving ? "Saving..." : "Save"}
                </button>
                <button onClick={() => { setEditing(false); setForm(opp); }}
                  className="flex items-center gap-1 bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                  <X size={14} /> Cancel
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)}
                  className="flex items-center gap-1 bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                  <Edit2 size={14} /> Edit
                </button>
                <button onClick={handleDelete}
                  className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                  <Trash2 size={14} /> Delete
                </button>
              </>
            )}
          </div>
        </div>

        {/* Stage Pipeline */}
        <div className="flex items-center gap-1 mb-6 overflow-x-auto">
          {STAGES.map((stage, i) => {
            const isActive = opp.stage === stage;
            const isPast = STAGES.indexOf(opp.stage) > i;
            return (
              <button key={stage}
                onClick={() => handleStageChange(stage)}
                className={`flex-1 min-w-[80px] py-2 px-3 text-xs font-medium rounded transition-all cursor-pointer ${
                  isActive ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20 font-bold" :
                  isPast ? "bg-purple-900/40 text-purple-300" :
                  "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                }`}>
                {stage === "Won" ? "🏆 Won" : stage === "Lost" ? "❌ Lost" : stage}
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button onClick={() => handleStageChange("Won")}
            className={`flex items-center gap-2 border px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              opp.stage === "Won"
                ? "bg-green-600 text-white border-green-500 shadow-md shadow-green-900/40"
                : "bg-green-500/10 hover:bg-green-500/20 border-green-500/30 text-green-400"
            }`}>
            <Trophy size={16} /> Mark as Won
          </button>
          <button onClick={() => handleStageChange("Lost")}
            className={`flex items-center gap-2 border px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              opp.stage === "Lost"
                ? "bg-red-600 text-white border-red-500 shadow-md shadow-red-900/40"
                : "bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-400"
            }`}>
            <XCircle size={16} /> Mark as Lost
          </button>
          <button onClick={async () => {
            try {
              const res = await fetchAPI(`/opportunities/${params.id}/convert-to-sale`, {
                method: "POST"
              });
              if (res.ok) {
                const data = await res.json();
                alert(`Successfully converted to Sales Order: ${data.sale_order?.name || ''}`);
                router.push("/sales");
              } else {
                alert("Failed to convert opportunity to Sales Order.");
              }
            } catch (e: any) {
              alert(`Error: ${e.message || 'Could not connect'}`);
            }
          }}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md active:scale-95 cursor-pointer">
            <FileText size={16} /> Convert to Quotation
          </button>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expected Revenue */}
        <div className="galaxy-card p-5">
          <label className="text-xs text-gray-400 font-medium flex items-center gap-1 mb-2">
            <DollarSign size={12} /> Expected Revenue
          </label>
          {editing ? (
            <input type="number" value={form.expected_revenue ?? ""}
              onChange={(e) => setForm({ ...form, expected_revenue: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500 transition-colors"
            />
          ) : (
            <p className="text-2xl font-bold text-white">${(opp.expected_revenue || 0).toLocaleString()}</p>
          )}
        </div>

        {/* Win Probability */}
        <div className="galaxy-card p-5">
          <label className="text-xs text-gray-400 font-medium flex items-center gap-1 mb-2">
            <TrendingUp size={12} /> Win Probability (%)
          </label>
          {editing ? (
            <input type="number" min="0" max="100" value={form.win_probability ?? ""}
              onChange={(e) => setForm({ ...form, win_probability: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500 transition-colors"
            />
          ) : (
            <>
              <p className={`text-2xl font-bold ${probColor}`}>{probability}%</p>
              <div className="mt-2 bg-white/5 rounded-full h-2">
                <div className={`h-2 rounded-full transition-all ${probability >= 70 ? "bg-green-500" : probability >= 30 ? "bg-yellow-500" : "bg-red-500"}`}
                  style={{ width: `${Math.min(100, Math.max(0, probability))}%` }} />
              </div>
            </>
          )}
        </div>

        {/* Priority Stars */}
        <div className="galaxy-card p-5">
          <label className="text-xs text-gray-400 font-medium flex items-center gap-1 mb-3">
            <Star size={12} /> Priority
          </label>
          <div className="flex gap-1 items-center">
            {[1, 2, 3].map((i) => {
              const activePriority = editing ? (form.priority || 0) : (opp.priority || 0);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handlePriorityChange(i)}
                  className="focus:outline-none p-1 hover:scale-110 transition-transform cursor-pointer"
                  title={`Set priority to ${i} star${i > 1 ? 's' : ''}`}
                >
                  <Star
                    size={24}
                    className={`transition-colors ${
                      activePriority >= i
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-600 hover:text-gray-400"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Close Date */}
        <div className="galaxy-card p-5">
          <label className="text-xs text-gray-400 font-medium flex items-center gap-1 mb-2">
            <Calendar size={12} /> Expected Close Date
          </label>
          {editing ? (
            <input type="date" value={form.close_date ? form.close_date.split("T")[0] : ""}
              onChange={(e) => setForm({ ...form, close_date: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500"
            />
          ) : (
            <p className="text-white">{opp.close_date ? new Date(opp.close_date).toLocaleDateString() : "Not set"}</p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="galaxy-card p-5">
        <label className="text-xs text-gray-400 font-medium flex items-center gap-1 mb-3">
          <FileText size={12} /> Internal Notes
        </label>
        {editing ? (
          <textarea value={form.notes || ""}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500 resize-none transition-colors"
            placeholder="Add notes about this opportunity..."
          />
        ) : (
          <p className="text-gray-300 whitespace-pre-wrap">{opp.notes || "No notes yet."}</p>
        )}
      </div>

      {/* Audit History & Activity Stream */}
      <ActivityHistory
        entityId={params.id}
        module="crm"
        entityType="opportunity"
        entityName={opp.name}
        title="Opportunity Activity & Audit Trail"
        allowAddNote={true}
        refreshKey={activityRefresh}
      />
    </div>
  );
}
