"use client";

import { useState, useEffect } from "react";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { useBranchContext } from "@/lib/branchContext";
import { Package, TruckIcon, Clock, CheckCircle2, Plus, X, Trash2 } from "lucide-react";

const MENU_ITEMS = [
  { name: "Products", href: "/inventory" },
  { name: "Operations", href: "/inventory/operations" },
  { name: "Warehouses", href: "/inventory/warehouses" },
  { name: "Reporting", href: "/inventory/reporting" },
  { name: "Configuration", href: "/inventory/configuration" },
];

type Operation = {
  id: string;
  type: "receipt" | "delivery" | "transfer";
  product: string;
  quantity: number;
  status: "draft" | "in_progress" | "done";
  date: string;
};

const DEFAULT_OPS: Operation[] = [
  { id: "WH-IN-001", type: "receipt", product: "Inbound Shipment Batch", quantity: 100, status: "done", date: new Date().toISOString().slice(0, 10) },
];

export default function InventoryOperationsPage() {
  const { activeBranch, userEmail, getEntityStorageKey } = useBranchContext();
  const [operations, setOperations] = useState<Operation[]>(DEFAULT_OPS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({ type: "receipt" as Operation["type"], product: "", quantity: 25 });

  useEffect(() => {
    const loadOps = async () => {
      try {
        const saved = localStorage.getItem(getEntityStorageKey("inventory_operations"));
        if (saved) setOperations(JSON.parse(saved));
      } catch {}
      if (!activeBranch?.id && !userEmail) return;
      const params = new URLSearchParams({ domain: "inventory_operations" });
      if (activeBranch?.id) params.set("company_id", activeBranch.id);
      if (userEmail) params.set("email", userEmail);
      try {
        const res = await fetch(`/api/industry-ops?${params.toString()}`, { cache: "no-store" });
        const data = await res.json();
        if (data.success && Array.isArray(data.records) && data.records.length > 0) {
          setOperations(data.records);
        }
      } catch {}
    };
    loadOps();
  }, [activeBranch?.id, userEmail]);

  const persist = async (next: Operation[]) => {
    setOperations(next);
    try { localStorage.setItem(getEntityStorageKey("inventory_operations"), JSON.stringify(next)); } catch {}
    if (activeBranch?.id || userEmail) {
      try {
        await fetch("/api/industry-ops", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            domain: "inventory_operations",
            company_id: activeBranch?.id,
            email: userEmail,
            records: next,
          }),
        });
      } catch {}
    }
  };

  const handleValidate = async (op: Operation) => {
    try {
      const res = await fetch("/api/industry-ops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "validate_warehouse_operation",
          company_id: activeBranch?.id,
          email: userEmail,
          operation_id: op.id,
          type: op.type,
          product: op.product,
          quantity: op.quantity,
        }),
      });
      const data = await res.json();
      const next = operations.map((x) => (x.id === op.id ? { ...x, status: "done" as const } : x));
      setOperations(next);
      try { localStorage.setItem(getEntityStorageKey("inventory_operations"), JSON.stringify(next)); } catch {}
      if (data.success) {
        setToast(`Validated ${op.id}: ${op.type === "receipt" ? `+${op.quantity} added to` : op.type === "delivery" ? `-${op.quantity} picked from` : `${op.quantity} transferred in`} Inventory!`);
        setTimeout(() => setToast(""), 4000);
      }
    } catch {
      persist(operations.map((x) => (x.id === op.id ? { ...x, status: "done" } : x)));
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product.trim()) return;
    const prefix = form.type === "receipt" ? "WH-IN" : form.type === "delivery" ? "WH-OUT" : "WH-INT";
    const item: Operation = {
      id: `${prefix}-${String(operations.length + 1).padStart(3, "0")}`,
      type: form.type,
      product: form.product.trim(),
      quantity: Math.max(1, Number(form.quantity) || 1),
      status: "in_progress",
      date: new Date().toISOString().slice(0, 10),
    };
    persist([item, ...operations]);
    setForm({ type: "receipt", product: "", quantity: 25 });
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0F172A] text-white">
      <StandardModuleHeader
        moduleName="Inventory"
        moduleIcon={<Package size={20} />}
        menuItems={MENU_ITEMS}
        searchPlaceholder="Search receipts, deliveries, transfers..."
        onNewClick={() => setIsModalOpen(true)}
        newButtonText="+ New Operation"
      />

      <div className="flex-1 overflow-auto p-6">
        {toast && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
            {toast}
          </div>
        )}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-200">Receipts, Deliveries &amp; Internal Transfers</h2>
            <p className="text-sm text-gray-400 mt-1">{operations.length} warehouse movement(s)</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer">
            <Plus size={15} /> New Operation
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#1E293B] rounded-xl p-4 border border-gray-700"><div className="text-xs text-gray-400">Receipts</div><div className="text-2xl font-bold text-blue-400 mt-1">{operations.filter((o) => o.type === "receipt").length}</div></div>
          <div className="bg-[#1E293B] rounded-xl p-4 border border-gray-700"><div className="text-xs text-gray-400">Deliveries (Pick/Pack/Ship)</div><div className="text-2xl font-bold text-emerald-400 mt-1">{operations.filter((o) => o.type === "delivery").length}</div></div>
          <div className="bg-[#1E293B] rounded-xl p-4 border border-gray-700"><div className="text-xs text-gray-400">Internal Transfers</div><div className="text-2xl font-bold text-purple-400 mt-1">{operations.filter((o) => o.type === "transfer").length}</div></div>
          <div className="bg-[#1E293B] rounded-xl p-4 border border-gray-700"><div className="text-xs text-gray-400">In Progress</div><div className="text-2xl font-bold text-amber-400 mt-1">{operations.filter((o) => o.status === "in_progress").length}</div></div>
        </div>

        <div className="bg-[#1E293B] rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#0F172A] border-b border-gray-700 text-xs uppercase text-gray-400">
              <tr>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Product / Batch</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/70">
              {operations.map((op) => (
                <tr key={op.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-mono text-xs text-purple-300">{op.id}</td>
                  <td className="px-4 py-3 uppercase text-xs font-bold text-cyan-300">{op.type}</td>
                  <td className="px-4 py-3 font-semibold text-white">{op.product}</td>
                  <td className="px-4 py-3 text-gray-200">{op.quantity}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${op.status === "done" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}>{op.status}</span></td>
                  <td className="px-4 py-3 text-gray-400">{op.date}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {op.status !== "done" && (
                      <button onClick={() => handleValidate(op)} className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"><CheckCircle2 size={12} /> Validate</button>
                    )}
                    <button onClick={() => persist(operations.filter((x) => x.id !== op.id))} className="text-rose-400 p-1 cursor-pointer"><Trash2 size={14} /></button>
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
              <h3 className="text-base font-bold text-white">New Warehouse Operation</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })} className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-3 py-2 text-white">
                <option value="receipt">Inbound Goods Receipt (GRN)</option>
                <option value="delivery">Outbound Delivery (Pick / Pack / Ship)</option>
                <option value="transfer">Internal Warehouse Transfer</option>
              </select>
              <input required value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} placeholder="Product / SKU *" className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-3 py-2 text-white" />
              <input type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} placeholder="Quantity" className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-3 py-2 text-white" />
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2.5 rounded-xl font-bold cursor-pointer">Create Operation</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
