"use client";

import { useState, useEffect } from "react";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { useBranchContext } from "@/lib/branchContext";
import { Wrench, Play, Pause, CheckCircle, Plus, X, Trash2 } from "lucide-react";

const MENU_ITEMS = [
  { name: "Manufacturing Orders", href: "/manufacturing" },
  { name: "Work Orders", href: "/manufacturing/work-orders" },
  { name: "Bill of Materials", href: "/manufacturing/bom" },
  { name: "Reporting", href: "/manufacturing/reporting" },
  { name: "Configuration", href: "/manufacturing/configuration" },
];

type WorkOrder = {
  id: string;
  operation: string;
  work_center: string;
  mo_reference: string;
  product: string;
  status: "ready" | "in_progress" | "paused" | "done";
  duration: number;
};

const DEFAULT_WOS: WorkOrder[] = [
  { id: "WO-001", operation: "Assembly", work_center: "Assembly Line 1", mo_reference: "MO-001", product: "Office Chair", status: "ready", duration: 60 },
  { id: "WO-002", operation: "Quality Check & Finishing", work_center: "QC Station", mo_reference: "MO-001", product: "Office Chair", status: "in_progress", duration: 30 },
];

export default function WorkOrdersPage() {
  const { activeBranch, userEmail, getEntityStorageKey } = useBranchContext();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(DEFAULT_WOS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ operation: "", work_center: "Assembly Line 1", mo_reference: "MO-001", product: "", duration: 45 });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(getEntityStorageKey("mrp_work_orders"));
      if (saved) setWorkOrders(JSON.parse(saved));
    } catch {}
    if (activeBranch?.id || userEmail) {
      const params = new URLSearchParams({ domain: "mrp_work_orders" });
      if (activeBranch?.id) params.set("company_id", activeBranch.id);
      if (userEmail) params.set("email", userEmail);
      fetch(`/api/industry-ops?${params.toString()}`, { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d && Array.isArray(d.items) && d.items.length > 0) {
            setWorkOrders(d.items);
            try { localStorage.setItem(getEntityStorageKey("mrp_work_orders"), JSON.stringify(d.items)); } catch {}
          }
        })
        .catch(() => {});
    }
  }, [activeBranch?.id, userEmail]);

  const persist = (next: WorkOrder[]) => {
    setWorkOrders(next);
    try { localStorage.setItem(getEntityStorageKey("mrp_work_orders"), JSON.stringify(next)); } catch {}
    if (activeBranch?.id || userEmail) {
      fetch("/api/industry-ops", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: "mrp_work_orders", company_id: activeBranch?.id, email: userEmail, records: next }),
      }).catch(() => {});
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.operation.trim() || !form.product.trim()) return;
    const item: WorkOrder = {
      id: `WO-${String(workOrders.length + 1).padStart(3, "0")}`,
      operation: form.operation.trim(),
      work_center: form.work_center.trim(),
      mo_reference: form.mo_reference.trim() || "MO-001",
      product: form.product.trim(),
      status: "ready",
      duration: Math.max(5, Number(form.duration) || 30),
    };
    persist([item, ...workOrders]);
    setIsModalOpen(false);
  };

  const setStatus = (id: string, status: WorkOrder["status"]) => {
    persist(workOrders.map((w) => (w.id === id ? { ...w, status } : w)));
  };

  return (
    <div className="flex flex-col h-screen bg-[#0F172A] text-white">
      <StandardModuleHeader
        moduleName="Manufacturing"
        moduleIcon={<Wrench size={20} />}
        menuItems={MENU_ITEMS}
        searchPlaceholder="Search work orders..."
        onNewClick={() => setIsModalOpen(true)}
        newButtonText="+ New Work Order"
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-200">Work Center Operations</h2>
            <p className="text-sm text-gray-400 mt-1">{workOrders.length} floor operations</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer">
            <Plus size={15} /> + New Work Order
          </button>
        </div>

        <div className="bg-[#1E293B] rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#0F172A] border-b border-gray-700 text-xs uppercase text-gray-400">
              <tr>
                <th className="px-4 py-3">Work Order</th>
                <th className="px-4 py-3">Operation</th>
                <th className="px-4 py-3">Work Center</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/70">
              {workOrders.map((wo) => (
                <tr key={wo.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-mono text-xs text-purple-300">{wo.id}</td>
                  <td className="px-4 py-3 font-bold text-white">{wo.operation}</td>
                  <td className="px-4 py-3 text-gray-300">{wo.work_center}</td>
                  <td className="px-4 py-3 text-gray-200">{wo.product}</td>
                  <td className="px-4 py-3 text-gray-300">{wo.duration} min</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                      wo.status === "done" ? "bg-emerald-500/20 text-emerald-300" : wo.status === "in_progress" ? "bg-cyan-500/20 text-cyan-300" : "bg-amber-500/20 text-amber-300"
                    }`}>
                      {wo.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-1.5">
                    {wo.status !== "in_progress" && wo.status !== "done" && (
                      <button onClick={() => setStatus(wo.id, "in_progress")} className="px-2.5 py-1 rounded-lg bg-cyan-600 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"><Play size={11} /> Start</button>
                    )}
                    {wo.status === "in_progress" && (
                      <button onClick={() => setStatus(wo.id, "paused")} className="px-2.5 py-1 rounded-lg bg-amber-600 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"><Pause size={11} /> Pause</button>
                    )}
                    {wo.status !== "done" && (
                      <button onClick={() => setStatus(wo.id, "done")} className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"><CheckCircle size={11} /> Done</button>
                    )}
                    <button onClick={() => persist(workOrders.filter((x) => x.id !== wo.id))} className="text-rose-400 p-1 cursor-pointer"><Trash2 size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141A28] border border-gray-700 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Create Work Order</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <input required value={form.operation} onChange={(e) => setForm({ ...form, operation: e.target.value })} placeholder="Operation (e.g. CNC Cutting) *" className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-3 py-2 text-white" />
              <input required value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} placeholder="Product *" className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-3 py-2 text-white" />
              <input value={form.work_center} onChange={(e) => setForm({ ...form, work_center: e.target.value })} placeholder="Work Center" className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-3 py-2 text-white" />
              <input type="number" min={5} value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} placeholder="Duration (minutes)" className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-3 py-2 text-white" />
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2.5 rounded-xl font-bold cursor-pointer">Create Work Order</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
