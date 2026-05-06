"use client";
import { fetchAPI } from "@/lib/api";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Edit2, Save, X, CheckCircle, Trash2, PlayCircle,
  Calendar, FileText, Package, CheckSquare
} from "lucide-react";

const STATE_STYLES: Record<string, string> = {
  draft: "bg-gray-500/20 text-gray-400",
  confirmed: "bg-blue-500/20 text-blue-400",
  progress: "bg-yellow-500/20 text-yellow-400",
  to_close: "bg-purple-500/20 text-purple-400",
  done: "bg-green-500/20 text-green-400",
};

export default function ManufacturingOrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => { fetchOrder(); }, [params.id]);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchOrder = async () => {
    try {
      const res = await fetchAPI(`/mrp/production/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data); setForm(data);
      } else router.push("/manufacturing");
    } catch { router.push("/manufacturing"); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetchAPI(`/mrp/production/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_qty: parseFloat(form.product_qty) || 1 }),
      });
      if (res.ok) { const d = await res.json(); setOrder({ ...order, ...d }); setEditing(false); showToast("Order saved"); }
      else showToast("Failed to save", "error");
    } finally { setSaving(false); }
  };

  const handleAction = async (action: "confirm" | "done") => {
    try {
      const res = await fetchAPI(`/mrp/production/${params.id}/${action}`, { method: "POST" });
      if (res.ok) {
        showToast(action === "confirm" ? "Order confirmed!" : "Production finished!");
        fetchOrder();
      } else showToast(`Failed to ${action}`, "error");
    } catch { showToast(`Failed to ${action}`, "error"); }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this manufacturing order?")) return;
    await fetchAPI(`/mrp/production/${params.id}`, { method: "DELETE" });
    router.push("/manufacturing");
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!order) return null;

  const bomLines = order.mrp_bom?.mrp_bom_line || [];

  return (
    <div className="min-h-screen p-6 max-w-5xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg border ${toast.type === "success" ? "bg-green-500/20 border-green-500/30 text-green-400" : "bg-red-500/20 border-red-500/30 text-red-400"}`}>
          {toast.msg}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-400">
        <Link href="/manufacturing" className="flex items-center gap-1 hover:text-purple-400 transition-colors">
          <ArrowLeft size={16} /> Manufacturing
        </Link>
        <span>/</span>
        <span className="text-white">{order.name}</span>
      </div>

      {/* Header */}
      <div className="galaxy-card p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">{order.name}</h1>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATE_STYLES[order.state] || STATE_STYLES.draft}`}>
              {order.state?.replace("_", " ").toUpperCase()}
            </span>
          </div>
          <div className="flex gap-2">
            {order.state === "draft" && (
              <button onClick={() => handleAction("confirm")}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <CheckCircle size={16} /> Confirm
              </button>
            )}
            {order.state === "confirmed" && (
              <button onClick={() => handleAction("done")}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <CheckSquare size={16} /> Mark as Done
              </button>
            )}
            {editing ? (
              <>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm">
                  <Save size={14} /> {saving ? "Saving..." : "Save"}
                </button>
                <button onClick={() => { setEditing(false); setForm(order); }}
                  className="flex items-center gap-1 bg-white/5 text-gray-300 px-4 py-2 rounded-lg text-sm">
                  <X size={14} /> Cancel
                </button>
              </>
            ) : (
              <>
                {order.state === "draft" && (
                  <button onClick={() => setEditing(true)}
                    className="flex items-center gap-1 bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2 rounded-lg text-sm">
                    <Edit2 size={14} /> Edit
                  </button>
                )}
                <button onClick={handleDelete}
                  className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm">
                  <Trash2 size={14} /> Delete
                </button>
              </>
            )}
          </div>
        </div>

        {/* Info Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Package, label: "Product", value: order.product_product?.name || "—" },
            { icon: FileText, label: "Quantity To Produce", value: editing ? null : order.product_qty },
            { icon: FileText, label: "Bill of Materials", value: order.mrp_bom?.code || "—" },
            { icon: Calendar, label: "Created On", value: order.created_at ? new Date(order.created_at).toLocaleDateString() : "—" },
          ].map(({ icon: Icon, label, value }, i) => (
            <div key={i} className="bg-white/3 rounded-xl p-3 border border-white/5">
              <div className="flex items-center gap-1 text-xs text-gray-400 mb-1"><Icon size={11} /> {label}</div>
              {value === null ? (
                <input type="number" value={form.product_qty || ""} onChange={(e) => setForm({ ...form, product_qty: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm" />
              ) : (
                <p className="text-white font-medium text-sm">{value}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Components */}
      <div className="galaxy-card p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Components (To Consume)</h2>
        {bomLines.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No components linked in the BOM.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase border-b border-white/10">
                <th className="text-left py-2">Product</th>
                <th className="text-right py-2">To Consume</th>
              </tr>
            </thead>
            <tbody>
              {bomLines.map((line: any, idx: number) => (
                <tr key={idx} className="border-b border-white/5 hover:bg-white/3">
                  <td className="py-3 text-white">{line.product_product?.name || line.product_id || "Component"}</td>
                  <td className="py-3 text-right text-yellow-400 font-medium">
                    {(line.product_qty * order.product_qty).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
