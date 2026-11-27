"use client";

import { useState, useEffect } from "react";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { useBranchContext } from "@/lib/branchContext";
import { Wrench, Package, Layers, Plus, Trash2, X } from "lucide-react";

const MENU_ITEMS = [
  { name: "Manufacturing Orders", href: "/manufacturing" },
  { name: "Work Orders", href: "/manufacturing/work-orders" },
  { name: "Bill of Materials", href: "/manufacturing/bom" },
  { name: "Reporting", href: "/manufacturing/reporting" },
  { name: "Configuration", href: "/manufacturing/configuration" },
];

type BOM = {
  id: string;
  product: string;
  reference: string;
  quantity: number;
  type: "Manufacture" | "Kit" | "Subcontract";
  components: number;
  costEstimate?: number;
};

const DEFAULT_BOMS: BOM[] = [
  { id: "BOM-001", product: "Office Chair", reference: "Standard Chair", quantity: 1, type: "Manufacture", components: 5, costEstimate: 45 },
  { id: "BOM-002", product: "Wooden Desk", reference: "Executive Desk", quantity: 1, type: "Manufacture", components: 8, costEstimate: 120 },
];

export default function BOMPage() {
  const { activeBranch, userEmail, getEntityStorageKey, currencySymbol } = useBranchContext();
  const [boms, setBoms] = useState<BOM[]>(DEFAULT_BOMS);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ product: "", reference: "", quantity: 1, type: "Manufacture" as BOM["type"], components: 4, costEstimate: 50 });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(getEntityStorageKey("mrp_boms"));
      if (saved) setBoms(JSON.parse(saved));
    } catch {}
    if (activeBranch?.id || userEmail) {
      const params = new URLSearchParams({ domain: "mrp_boms" });
      if (activeBranch?.id) params.set("company_id", activeBranch.id);
      if (userEmail) params.set("email", userEmail);
      fetch(`/api/industry-ops?${params.toString()}`, { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d && Array.isArray(d.items) && d.items.length > 0) {
            setBoms(d.items);
            try { localStorage.setItem(getEntityStorageKey("mrp_boms"), JSON.stringify(d.items)); } catch {}
          }
        })
        .catch(() => {});
    }
  }, [activeBranch?.id, userEmail]);

  const persist = (next: BOM[]) => {
    setBoms(next);
    try { localStorage.setItem(getEntityStorageKey("mrp_boms"), JSON.stringify(next)); } catch {}
    if (activeBranch?.id || userEmail) {
      fetch("/api/industry-ops", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: "mrp_boms", company_id: activeBranch?.id, email: userEmail, records: next }),
      }).catch(() => {});
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product.trim()) return;
    const item: BOM = {
      id: `BOM-${String(boms.length + 1).padStart(3, "0")}`,
      product: form.product.trim(),
      reference: form.reference.trim() || `REF-${boms.length + 1}`,
      quantity: Math.max(1, Number(form.quantity) || 1),
      type: form.type,
      components: Math.max(1, Number(form.components) || 1),
      costEstimate: Number(form.costEstimate) || 0,
    };
    persist([item, ...boms]);
    setForm({ product: "", reference: "", quantity: 1, type: "Manufacture", components: 4, costEstimate: 50 });
    setIsModalOpen(false);
  };

  const filtered = boms.filter((b) => b.product.toLowerCase().includes(search.toLowerCase()) || b.reference.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col h-screen bg-[#0F172A] text-white">
      <StandardModuleHeader
        moduleName="Manufacturing"
        moduleIcon={<Wrench size={20} />}
        menuItems={MENU_ITEMS}
        searchPlaceholder="Search BOMs..."
        onSearch={setSearch}
        onNewClick={() => setIsModalOpen(true)}
        newButtonText="+ Create BOM"
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-200">Bill of Materials (BOM)</h2>
            <p className="text-sm text-gray-400 mt-1">{filtered.length} active BOM recipes for {activeBranch?.name || "Workspace"}</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer">
            <Layers size={15} /> + Create BOM
          </button>
        </div>

        <div className="bg-[#1E293B] rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#0F172A] border-b border-gray-700 text-xs uppercase text-gray-400">
              <tr>
                <th className="px-4 py-3">BOM ID</th>
                <th className="px-4 py-3">Finished Product</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Batch Qty</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Components</th>
                <th className="px-4 py-3 text-right">Est. Cost</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/70">
              {filtered.map((bom) => (
                <tr key={bom.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-mono text-xs text-purple-300">{bom.id}</td>
                  <td className="px-4 py-3 font-bold text-white flex items-center gap-2"><Package size={15} className="text-blue-400" /> {bom.product}</td>
                  <td className="px-4 py-3 text-gray-300">{bom.reference}</td>
                  <td className="px-4 py-3 text-white">{bom.quantity}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-500/20 text-blue-300">{bom.type}</span></td>
                  <td className="px-4 py-3 text-gray-300">{bom.components} items</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-400">{currencySymbol}{(bom.costEstimate || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => persist(boms.filter((x) => x.id !== bom.id))} className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"><Trash2 size={14} /></button>
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
              <h3 className="text-base font-bold text-white">Create Bill of Materials (BOM)</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <input required value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} placeholder="Finished Product Name *" className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-3 py-2 text-white" />
              <input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="Reference / Version" className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-3 py-2 text-white" />
              <div className="grid grid-cols-3 gap-2">
                <div><label className="text-gray-400 block mb-1">Batch Qty</label><input type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-3 py-2 text-white" /></div>
                <div><label className="text-gray-400 block mb-1">Components</label><input type="number" min={1} value={form.components} onChange={(e) => setForm({ ...form, components: Number(e.target.value) })} className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-3 py-2 text-white" /></div>
                <div><label className="text-gray-400 block mb-1">Est. Cost</label><input type="number" min={0} value={form.costEstimate} onChange={(e) => setForm({ ...form, costEstimate: Number(e.target.value) })} className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-3 py-2 text-white" /></div>
              </div>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })} className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-3 py-2 text-white">
                <option value="Manufacture">Manufacture</option>
                <option value="Kit">Kit / Phantom BOM</option>
                <option value="Subcontract">Subcontracting</option>
              </select>
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2.5 rounded-xl font-bold cursor-pointer">Save BOM</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
