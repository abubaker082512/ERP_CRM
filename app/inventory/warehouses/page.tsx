"use client";

import { useState, useEffect } from "react";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { useBranchContext } from "@/lib/branchContext";
import { Package, MapPin, Users, Plus, Trash2, X } from "lucide-react";

const MENU_ITEMS = [
  { name: "Products", href: "/inventory" },
  { name: "Operations", href: "/inventory/operations" },
  { name: "Warehouses", href: "/inventory/warehouses" },
  { name: "Reporting", href: "/inventory/reporting" },
  { name: "Configuration", href: "/inventory/configuration" },
];

type Warehouse = {
  id: string;
  name: string;
  location: string;
  capacity: number;
  current: number;
  manager: string;
};

const DEFAULT_WAREHOUSES: Warehouse[] = [
  { id: "WH-001", name: "Primary Distribution Hub", location: "Main Facility", capacity: 10000, current: 6400, manager: "Operations Lead" },
];

export default function InventoryWarehousesPage() {
  const { activeBranch, getEntityStorageKey } = useBranchContext();
  const [warehouses, setWarehouses] = useState<Warehouse[]>(DEFAULT_WAREHOUSES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", location: "", capacity: 10000, current: 2500, manager: "" });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(getEntityStorageKey("inventory_warehouses"));
      if (saved) setWarehouses(JSON.parse(saved));
    } catch {}
  }, [activeBranch?.id]);

  const persist = (next: Warehouse[]) => {
    setWarehouses(next);
    try { localStorage.setItem(getEntityStorageKey("inventory_warehouses"), JSON.stringify(next)); } catch {}
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const item: Warehouse = {
      id: `WH-${String(warehouses.length + 1).padStart(3, "0")}`,
      name: form.name.trim(),
      location: form.location.trim() || "Global",
      capacity: Math.max(100, Number(form.capacity) || 5000),
      current: Math.max(0, Number(form.current) || 0),
      manager: form.manager.trim() || "Warehouse Manager",
    };
    persist([item, ...warehouses]);
    setForm({ name: "", location: "", capacity: 10000, current: 2500, manager: "" });
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0F172A] text-white">
      <StandardModuleHeader
        moduleName="Inventory"
        moduleIcon={<Package size={20} />}
        menuItems={MENU_ITEMS}
        searchPlaceholder="Search warehouses..."
        onNewClick={() => setIsModalOpen(true)}
        newButtonText="+ Add Warehouse"
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-200">Multi-Warehouse Locations</h2>
            <p className="text-sm text-gray-400 mt-1">{warehouses.length} active warehouse(s) for {activeBranch?.name || "Workspace"}</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer">
            <Plus size={15} /> + Add Warehouse
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {warehouses.map((wh) => {
            const utilization = Math.min(100, Math.round((wh.current / Math.max(1, wh.capacity)) * 100));
            return (
              <div key={wh.id} className="bg-[#1E293B] border border-gray-700 rounded-2xl p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">{wh.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1"><MapPin size={13} /> {wh.location}</div>
                  </div>
                  <button onClick={() => persist(warehouses.filter((x) => x.id !== wh.id))} className="text-rose-400 p-1 cursor-pointer"><Trash2 size={14} /></button>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Capacity Utilization</span>
                    <span className="font-bold text-white">{utilization}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${utilization}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-700 text-xs">
                  <div><div className="text-gray-400">Current Stock</div><div className="text-base font-bold text-white">{wh.current.toLocaleString()}</div></div>
                  <div><div className="text-gray-400">Max Capacity</div><div className="text-base font-bold text-white">{wh.capacity.toLocaleString()}</div></div>
                </div>

                <div className="pt-2 border-t border-gray-700 flex items-center gap-2 text-xs text-gray-300">
                  <Users size={13} className="text-purple-400" /> Manager: <strong>{wh.manager}</strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141A28] border border-gray-700 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Add Warehouse / Fulfillment Hub</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Warehouse Name *" className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-3 py-2 text-white" />
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City / Address" className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-3 py-2 text-white" />
              <div className="grid grid-cols-2 gap-2">
                <input type="number" value={form.current} onChange={(e) => setForm({ ...form, current: Number(e.target.value) })} placeholder="Current Stock" className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-3 py-2 text-white" />
                <input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} placeholder="Max Capacity" className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-3 py-2 text-white" />
              </div>
              <input value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })} placeholder="Warehouse Manager" className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-3 py-2 text-white" />
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2.5 rounded-xl font-bold cursor-pointer">Save Warehouse</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
