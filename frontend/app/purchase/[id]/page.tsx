"use client";
import { fetchAPI } from "@/lib/api";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Edit2, Save, X, CheckCircle, Trash2,
  Calendar, DollarSign, FileText, User
} from "lucide-react";

const STATE_STYLES: Record<string, string> = {
  draft: "bg-gray-500/20 text-gray-400",
  sent: "bg-blue-500/20 text-blue-400",
  purchase: "bg-green-500/20 text-green-400",
  done: "bg-purple-500/20 text-purple-400",
  cancel: "bg-red-500/20 text-red-400",
};

export default function PurchaseOrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => { fetchOrder(); }, [params.id]);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchOrder = async () => {
    try {
      const res = await fetchAPI(`/purchase/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data); setForm(data);
      } else router.push("/purchase");
    } catch { router.push("/purchase"); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetchAPI(`/purchase/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, amount_total: parseFloat(form.amount_total) || 0 }),
      });
      if (res.ok) { const d = await res.json(); setOrder(d); setEditing(false); showToast("Order saved"); }
      else showToast("Failed to save", "error");
    } finally { setSaving(false); }
  };

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const res = await fetchAPI(`/purchase/${params.id}/confirm`, { method: "POST" });
      if (res.ok) {
        const d = await res.json();
        setOrder(d);
        showToast("Order confirmed! Vendor bill and incoming shipment created.");
      } else showToast("Failed to confirm", "error");
    } finally { setConfirming(false); }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this purchase order?")) return;
    await fetchAPI(`/purchase/${params.id}`, { method: "DELETE" });
    router.push("/purchase");
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!order) return null;

  const lines = order.lines || order.purchase_order_line || [];
  const lineTotal = lines.reduce((sum: number, l: any) => sum + (l.price_subtotal || l.product_qty * l.price_unit || 0), 0);

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
        <Link href="/purchase" className="flex items-center gap-1 hover:text-purple-400 transition-colors">
          <ArrowLeft size={16} /> Purchase
        </Link>
        <span>/</span>
        <span className="text-white">{order.name}</span>
      </div>

      {/* Header */}
      <div className="galaxy-card p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            {editing ? (
              <input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="text-2xl font-bold bg-transparent border-b border-purple-500 text-white outline-none mb-1" />
            ) : (
              <h1 className="text-2xl font-bold text-white mb-1">{order.name}</h1>
            )}
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATE_STYLES[order.state] || STATE_STYLES.draft}`}>
              {order.state?.toUpperCase()}
            </span>
          </div>
          <div className="flex gap-2">
            {order.state === "draft" && !editing && (
              <button onClick={handleConfirm} disabled={confirming}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <CheckCircle size={16} /> {confirming ? "Confirming..." : "Confirm Order"}
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
            { icon: User, label: "Vendor", value: order.contacts?.name || "—" },
            { icon: Calendar, label: "Order Date", value: order.date_order ? new Date(order.date_order).toLocaleDateString() : "—" },
            { icon: DollarSign, label: "Total Amount", value: `$${(order.amount_total || lineTotal || 0).toLocaleString()}` },
            { icon: FileText, label: "Reference", value: order.name },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white/3 rounded-xl p-3 border border-white/5">
              <div className="flex items-center gap-1 text-xs text-gray-400 mb-1"><Icon size={11} /> {label}</div>
              <p className="text-white font-medium text-sm">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Order Lines */}
      <div className="galaxy-card p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Order Lines</h2>
        {lines.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No order lines. Edit the order to add products.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase border-b border-white/10">
                <th className="text-left py-2">Product</th>
                <th className="text-right py-2">Qty</th>
                <th className="text-right py-2">Unit Price</th>
                <th className="text-right py-2">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line: any) => (
                <tr key={line.id} className="border-b border-white/5 hover:bg-white/3">
                  <td className="py-3 text-white">{line.name || line.product_product?.name || line.product_id || "Product"}</td>
                  <td className="py-3 text-right text-gray-300">{line.product_qty || line.qty || 1}</td>
                  <td className="py-3 text-right text-gray-300">${(line.price_unit || 0).toFixed(2)}</td>
                  <td className="py-3 text-right font-medium text-white">${(line.price_subtotal || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/10">
                <td colSpan={3} className="py-3 text-right text-gray-400 font-medium">Total</td>
                <td className="py-3 text-right text-xl font-bold text-white">
                  ${(order.amount_total || lineTotal || 0).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}
