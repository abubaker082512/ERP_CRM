"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Trash2,
  Edit2,
  Save,
  X,
  CheckCircle,
  FileText,
  DollarSign,
  User,
  Calendar,
  Download,
  FileSpreadsheet,
  Truck,
  Receipt,
  RotateCcw,
} from "lucide-react";
import { useBranchContext } from "@/lib/branchContext";
import { printQuotationPDF, exportToExcel, exportToCSV } from "@/lib/exportUtils";

const STATE_STYLES: Record<string, string> = {
  draft: "bg-gray-500/20 text-gray-300 border border-gray-500/30",
  sent: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  sale: "bg-green-500/20 text-green-300 border border-green-500/30",
  dispatched: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
  invoiced: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  returned: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  cancel: "bg-red-500/20 text-red-400 border border-red-500/30",
};

const STAGES = [
  { key: "draft", label: "1. Quotation" },
  { key: "sale", label: "2. Confirmed Order" },
  { key: "dispatched", label: "3. Dispatched / Fulfilled" },
  { key: "invoiced", label: "4. Invoiced & Paid" },
];

export default function SalesOrderDetailPage() {
  const router = useRouter();
  const rawParams = useParams();
  const id = rawParams?.id as string;
  const { activeBranch } = useBranchContext();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const getAuthMeta = () => {
    const companyId =
      activeBranch?.id ||
      (typeof window !== "undefined" ? localStorage.getItem("beraxis_active_branch_id") : null) ||
      "CMP-001";
    let email = "";
    try {
      if (typeof window !== "undefined") {
        email = JSON.parse(localStorage.getItem("user") || "{}").email || "";
      }
    } catch {}
    return { companyId, email };
  };

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { companyId, email } = getAuthMeta();
      const res = await fetch(
        `/api/sales?company_id=${encodeURIComponent(companyId)}&email=${encodeURIComponent(email)}&id=${encodeURIComponent(id)}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          setOrder(data.order);
          setForm(data.order);
          return;
        }
      }
      router.push("/sales");
    } catch {
      router.push("/sales");
    } finally {
      setLoading(false);
    }
  }, [id, activeBranch?.id, router]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { companyId, email } = getAuthMeta();
      const res = await fetch("/api/sales", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: companyId,
          email,
          id: order.id,
          customer_name: form.customer_name,
          notes: form.notes,
        }),
      });
      if (res.ok) {
        const d = await res.json();
        setOrder(d.order);
        setEditing(false);
        showToast("Sales order updated");
      } else showToast("Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const transitionState = async (nextState: string, successMessage: string) => {
    setSaving(true);
    try {
      const { companyId, email } = getAuthMeta();
      const res = await fetch("/api/sales", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_id: companyId, email, id: order.id, state: nextState }),
      });
      if (res.ok) {
        const d = await res.json();
        setOrder(d.order);
        showToast(successMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCreateReturn = async () => {
    setSaving(true);
    try {
      const { companyId, email } = getAuthMeta();
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_return",
          company_id: companyId,
          email,
          orderId: order.id,
          reason: "Customer RMA / Credit Note Return",
          restock: true,
        }),
      });
      if (res.ok) {
        await fetchOrder();
        showToast("Credit Note issued & stock restored to Inventory!");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const { companyId, email } = getAuthMeta();
    await fetch(
      `/api/sales?company_id=${encodeURIComponent(companyId)}&email=${encodeURIComponent(email)}&id=${encodeURIComponent(order.id)}`,
      { method: "DELETE" }
    );
    router.push("/sales");
  };

  const lines = order?.lines || [];
  const lineTotal = lines.reduce((sum: number, l: any) => sum + Number(l.subtotal ?? l.price_subtotal ?? 0), 0);

  const handleDownloadPDF = () => {
    if (!order) return;
    const formattedLines = lines.map((line: any) => ({
      name: line.name || "Item",
      description: line.description || "",
      quantity: line.quantity ?? line.product_uom_qty ?? 1,
      unitPrice: line.unitPrice ?? line.price_unit ?? 0,
      subtotal: line.subtotal ?? line.price_subtotal ?? 0,
    }));

    printQuotationPDF({
      documentNumber: order.name,
      documentType: ["sale", "dispatched", "invoiced"].includes(order.state) ? "Sales Order" : "Quotation",
      customerName: order.customer_name || "Valued Customer",
      customerEmail: order.customer_email,
      date: new Date(order.date_order || order.created_at || Date.now()).toLocaleDateString(),
      status: (order.state || "Draft").toUpperCase(),
      lines: formattedLines,
      amountTotal: order.amount_total || lineTotal || 0,
      notes: order.notes || "Thank you for your business.",
    });
  };

  const handleExportExcel = () => {
    if (!order) return;
    const headers = ["SKU", "Item", "Quantity", "UoM", "Unit Price ($)", "Subtotal ($)"];
    const rows = lines.map((line: any) => [
      line.sku || "",
      line.name || "Item",
      line.quantity ?? 1,
      line.uom || "Units",
      line.unitPrice ?? 0,
      line.subtotal ?? 0,
    ]);
    exportToExcel(`${order.name}_Lines`, headers, rows, "Order_Lines");
  };

  const handleExportCSV = () => {
    if (!order) return;
    const headers = ["Order #", "Customer", "Item", "Quantity", "Unit Price", "Subtotal", "Status"];
    const rows = lines.map((line: any) => [
      order.name,
      order.customer_name,
      line.name,
      line.quantity ?? 1,
      line.unitPrice ?? 0,
      line.subtotal ?? 0,
      order.state,
    ]);
    exportToCSV(`${order.name}_Data`, headers, rows);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0F172A]">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!order) return null;

  const activeStageIdx = STAGES.findIndex((s) => s.key === order.state);

  return (
    <div className="min-h-screen bg-[#0F172A] text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {toast && (
          <div
            className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-bold shadow-lg border ${
              toast.type === "success"
                ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
                : "bg-red-500/20 border-red-500/30 text-red-400"
            }`}
          >
            {toast.msg}
          </div>
        )}

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Link href="/sales" className="flex items-center gap-1 hover:text-purple-400 transition-colors">
              <ArrowLeft size={16} /> Order-to-Cash Hub
            </Link>
            <span>/</span>
            <span className="text-white font-semibold">{order.name}</span>
          </div>

          {/* 4-Step Pipeline Stepper */}
          <div className="flex items-center gap-1.5 text-xs">
            {STAGES.map((st, idx) => {
              const reached = activeStageIdx >= idx;
              return (
                <span
                  key={st.key}
                  className={`px-3 py-1 rounded-full font-bold ${
                    reached
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-gray-800 text-gray-500 border border-gray-700"
                  }`}
                >
                  {st.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Header Card */}
        <div className="bg-[#1E293B] border border-gray-700 rounded-2xl p-6 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">{order.name}</h1>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${STATE_STYLES[order.state] || STATE_STYLES.draft}`}>
                  {order.state}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Channel: <span className="text-purple-300 font-semibold">{order.channel || "Direct Sales"}</span>
                {order.deliveryRef && <> • Delivery Slip: <span className="text-cyan-300 font-mono">{order.deliveryRef}</span></>}
                {order.invoiceRef && <> • Paid Invoice: <span className="text-emerald-300 font-mono">{order.invoiceRef}</span></>}
                {order.returnRef && <> • Credit Note: <span className="text-amber-300 font-mono">{order.returnRef}</span></>}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {order.state === "draft" && (
                <button
                  onClick={() => transitionState("sale", "Order confirmed!")}
                  disabled={saving}
                  className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  <CheckCircle size={14} /> Confirm Order
                </button>
              )}
              {order.state === "sale" && (
                <button
                  onClick={() => transitionState("dispatched", "Dispatched & Inventory Stock Deducted!")}
                  disabled={saving}
                  className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  <Truck size={14} /> Deliver &amp; Deduct Stock
                </button>
              )}
              {(order.state === "sale" || order.state === "dispatched") && (
                <button
                  onClick={() => transitionState("invoiced", "Invoice Posted & Synced to Accounting!")}
                  disabled={saving}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  <Receipt size={14} /> Issue Paid Invoice
                </button>
              )}
              {(order.state === "dispatched" || order.state === "invoiced") && (
                <button
                  onClick={handleCreateReturn}
                  disabled={saving}
                  className="flex items-center gap-1.5 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  <RotateCcw size={14} /> Return / Credit Note
                </button>
              )}

              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                <Download size={14} /> PDF
              </button>
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 bg-[#0F172A] border border-gray-700 text-gray-200 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                <FileSpreadsheet size={14} className="text-emerald-400" /> Excel
              </button>

              {editing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1 bg-purple-600 text-white px-3 py-2 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    <Save size={13} /> Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="flex items-center gap-1 bg-gray-800 text-gray-300 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    <X size={13} /> Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1 bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-[#0F172A] rounded-xl p-3 border border-gray-800">
              <div className="flex items-center gap-1 text-gray-400 mb-1"><User size={11} /> Customer</div>
              {editing ? (
                <input
                  value={form.customer_name || ""}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                  className="w-full bg-[#1E293B] border border-gray-700 rounded px-2 py-1 text-white"
                />
              ) : (
                <p className="text-white font-bold">{order.customer_name}</p>
              )}
            </div>
            <div className="bg-[#0F172A] rounded-xl p-3 border border-gray-800">
              <div className="flex items-center gap-1 text-gray-400 mb-1"><FileText size={11} /> Pricelist &amp; Terms</div>
              <p className="text-white font-bold">{order.pricelistName || "Standard"} • {order.paymentTerms || "Immediate"}</p>
            </div>
            <div className="bg-[#0F172A] rounded-xl p-3 border border-gray-800">
              <div className="flex items-center gap-1 text-gray-400 mb-1"><Calendar size={11} /> Order Date</div>
              <p className="text-white font-bold">{new Date(order.date_order || order.created_at).toLocaleDateString()}</p>
            </div>
            <div className="bg-[#0F172A] rounded-xl p-3 border border-gray-800">
              <div className="flex items-center gap-1 text-gray-400 mb-1"><DollarSign size={11} /> Total Value</div>
              <p className="text-emerald-400 font-black text-base">
                ${(order.amount_total || lineTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Order Lines */}
        <div className="bg-[#1E293B] border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white">Order Lines ({lines.length})</h2>
            <button onClick={handleExportCSV} className="text-xs text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer">
              <Download size={13} /> Export CSV
            </button>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400 uppercase border-b border-gray-700">
                <th className="text-left py-2">SKU</th>
                <th className="text-left py-2">Item / Description</th>
                <th className="text-right py-2">Qty</th>
                <th className="text-right py-2">Unit Price</th>
                <th className="text-right py-2">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {lines.map((line: any, idx: number) => (
                <tr key={line.id || idx}>
                  <td className="py-3 font-mono text-gray-400">{line.sku || "—"}</td>
                  <td className="py-3 text-white font-semibold">{line.name}</td>
                  <td className="py-3 text-right text-gray-300">{line.quantity ?? 1} {line.uom || ""}</td>
                  <td className="py-3 text-right text-gray-300">${Number(line.unitPrice ?? line.price_unit ?? 0).toFixed(2)}</td>
                  <td className="py-3 text-right font-bold text-emerald-400">${Number(line.subtotal ?? line.price_subtotal ?? 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-700">
                <td colSpan={4} className="py-3 text-right text-gray-300 font-bold">Grand Total</td>
                <td className="py-3 text-right text-lg font-black text-emerald-400">
                  ${(order.amount_total || lineTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
