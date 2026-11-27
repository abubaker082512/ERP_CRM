"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { useBranchContext } from "@/lib/branchContext";
import {
  Grid3x3,
  Plus,
  Users,
  DollarSign,
  CheckCircle2,
  X,
  ArrowRight,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

const MENU_ITEMS = [
  { name: "Point of Sale", href: "/pos" },
  { name: "Kitchen Display (KDS)", href: "/pos/kds" },
  { name: "Recipe BOM", href: "/pos/recipes" },
  { name: "Floor Plan & Tables", href: "/pos/tables" },
  { name: "Orders", href: "/pos/orders" },
  { name: "Products", href: "/pos/products" },
];

type TableStatus = "available" | "occupied" | "reserved" | "billed";

type RestaurantTable = {
  id: string;
  number: string;
  zone: "Main Dining Hall" | "Outdoor Patio" | "Espresso Bar" | "VIP Private Lounge";
  capacity: number;
  seats?: number;
  currentGuests?: number;
  status: TableStatus;
  server?: string;
  waiter?: string;
  seatedSince?: string;
  activeOrderTotal?: number;
  currentTotal?: number;
};

const STARTER_FLOOR_TABLES: RestaurantTable[] = [
  { id: "TBL-1", number: "Table 1", zone: "Main Dining Hall", capacity: 2, status: "available", server: "Alex" },
  { id: "TBL-2", number: "Table 2", zone: "Main Dining Hall", capacity: 4, status: "occupied", currentGuests: 3, activeOrderTotal: 43.5, server: "Alex" },
  { id: "TBL-3", number: "Table 3", zone: "Main Dining Hall", capacity: 4, status: "available", server: "Sara" },
  { id: "TBL-4", number: "Table 4", zone: "Main Dining Hall", capacity: 6, status: "available", server: "Sara" },
  { id: "TBL-5", number: "Table 5", zone: "Outdoor Patio", capacity: 2, status: "available", server: "Omar" },
  { id: "TBL-6", number: "Table 6", zone: "Outdoor Patio", capacity: 4, status: "reserved", currentGuests: 4, server: "Omar" },
  { id: "TBL-7", number: "Table 7", zone: "Espresso Bar", capacity: 2, status: "available", server: "Mia" },
  { id: "TBL-8", number: "Table 8", zone: "VIP Private Lounge", capacity: 8, status: "available", server: "Elena" },
];

export default function FloorPlanTablesPage() {
  const { activeBranch, getEntityStorageKey } = useBranchContext();
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>("ALL");
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);

  const [newTblNum, setNewTblNum] = useState("");
  const [newTblZone, setNewTblZone] = useState<RestaurantTable["zone"]>("Main Dining Hall");
  const [newTblCap, setNewTblCap] = useState(4);

  const getAuthMeta = useCallback(() => {
    if (typeof window === "undefined") return { companyId: "CMP-001", email: "" };
    const companyId = activeBranch?.id || localStorage.getItem("beraxis_active_branch_id") || "CMP-001";
    let email = "";
    try {
      email = JSON.parse(localStorage.getItem("user") || "{}").email || "";
    } catch {}
    return { companyId, email };
  }, [activeBranch?.id]);

  const normalizeTable = (t: any): RestaurantTable => ({
    id: t.id || `tbl-${Math.random().toString(36).slice(2, 7)}`,
    number: t.number || "Table 1",
    zone:
      t.zone === "Main Hall"
        ? "Main Dining Hall"
        : t.zone === "VIP Lounge"
        ? "VIP Private Lounge"
        : t.zone || "Main Dining Hall",
    capacity: Number(t.capacity ?? t.seats ?? 4),
    currentGuests: t.currentGuests,
    status: t.status === "cleaning" ? "billed" : t.status || "available",
    server: t.server || t.waiter || "Staff",
    activeOrderTotal: Number(t.activeOrderTotal ?? t.currentTotal ?? 0),
  });

  const loadTables = useCallback(async () => {
    const key = getEntityStorageKey("pos_tables");
    let loaded: RestaurantTable[] = [];
    try {
      const saved = localStorage.getItem(key);
      if (saved) loaded = JSON.parse(saved).map(normalizeTable);
    } catch {}

    try {
      const { companyId, email } = getAuthMeta();
      const res = await fetch(
        `/api/pos?company_id=${encodeURIComponent(companyId)}&email=${encodeURIComponent(email)}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.tables) && data.tables.length > 0) {
          loaded = data.tables.map(normalizeTable);
          localStorage.setItem(key, JSON.stringify(loaded));
        }
      }
    } catch {}

    setTables(loaded);
    if (loaded.length > 0 && !selectedTable) setSelectedTable(loaded[0]);
  }, [getAuthMeta, getEntityStorageKey]);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  const persistTables = async (updated: RestaurantTable[]) => {
    setTables(updated);
    try {
      localStorage.setItem(getEntityStorageKey("pos_tables"), JSON.stringify(updated));
      const { companyId, email } = getAuthMeta();
      await fetch("/api/pos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_tables", company_id: companyId, email, tables: updated }),
      });
    } catch {}
  };

  const handleSeedFloorPlan = () => {
    persistTables(STARTER_FLOOR_TABLES);
    setSelectedTable(STARTER_FLOOR_TABLES[0]);
  };

  const zones = ["ALL", "Main Dining Hall", "Outdoor Patio", "Espresso Bar", "VIP Private Lounge"];
  const filteredTables = tables.filter((t) => selectedZone === "ALL" || t.zone === selectedZone);

  const occupiedCount = tables.filter((t) => t.status === "occupied" || t.status === "billed").length;
  const availableCount = tables.filter((t) => t.status === "available").length;
  const occupancyPct = tables.length > 0 ? Math.round((occupiedCount / tables.length) * 100) : 0;
  const totalGuests = tables.reduce((acc, t) => acc + (t.currentGuests || (t.status === "occupied" ? t.capacity : 0)), 0);
  const totalOpenRevenue = tables.reduce((acc, t) => acc + (t.activeOrderTotal || 0), 0);

  const handleCreateTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTblNum.trim()) return;
    const newTbl: RestaurantTable = {
      id: `tbl-${Date.now()}`,
      number: newTblNum.trim(),
      zone: newTblZone,
      capacity: Number(newTblCap),
      status: "available",
      server: "Floor Staff",
    };
    const updated = [...tables, newTbl];
    persistTables(updated);
    setSelectedTable(newTbl);
    setIsAddTableOpen(false);
    setNewTblNum("");
  };

  const handleUpdateStatus = (tableId: string, status: TableStatus) => {
    const updated = tables.map((t) =>
      t.id === tableId
        ? {
            ...t,
            status,
            currentGuests: status === "available" ? 0 : t.currentGuests || t.capacity,
            activeOrderTotal: status === "available" ? 0 : t.activeOrderTotal,
          }
        : t
    );
    persistTables(updated);
    if (selectedTable?.id === tableId) {
      const next = updated.find((u) => u.id === tableId) || null;
      setSelectedTable(next);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#07090f] text-white">
      <StandardModuleHeader
        moduleName="Floor Plan & Table Layout"
        moduleIcon={<Grid3x3 size={20} />}
        menuItems={MENU_ITEMS}
        searchPlaceholder="Search tables & zones..."
      />

      <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-6">
        {/* KPI Header — Safe 0% when 0 tables (no NaN%!) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="galaxy-card p-4 rounded-2xl bg-[#101422] border border-blue-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Occupancy Rate</span>
              <h3 className="text-2xl font-bold text-blue-400 mt-0.5">{occupancyPct}%</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {occupiedCount} of {tables.length} Tables Active
              </p>
            </div>
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
              <Users size={20} />
            </div>
          </div>

          <div className="galaxy-card p-4 rounded-2xl bg-[#101422] border border-emerald-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Available Tables</span>
              <h3 className="text-2xl font-bold text-emerald-400 mt-0.5">{availableCount} Tables</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Ready for immediate seating</p>
            </div>
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <CheckCircle2 size={20} />
            </div>
          </div>

          <div className="galaxy-card p-4 rounded-2xl bg-[#101422] border border-purple-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Total Seated Guests</span>
              <h3 className="text-2xl font-bold text-purple-400 mt-0.5">{totalGuests} Guests</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Currently dining</p>
            </div>
            <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
              <Users size={20} />
            </div>
          </div>

          <div className="galaxy-card p-4 rounded-2xl bg-[#101422] border border-amber-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Open Table Tabs</span>
              <h3 className="text-2xl font-bold text-amber-400 mt-0.5">${totalOpenRevenue.toFixed(2)}</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Unsettled guest checks</p>
            </div>
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
              <DollarSign size={20} />
            </div>
          </div>
        </div>

        {/* Zone Selector Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#101422] p-3.5 rounded-2xl border border-gray-800">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {zones.map((z) => (
              <button
                key={z}
                onClick={() => setSelectedZone(z)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer ${
                  selectedZone === z ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white bg-gray-900/60"
                }`}
              >
                {z}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSeedFloorPlan}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              <Sparkles size={13} /> Seed 8-Table Floor Plan
            </button>
            <Link
              href="/pos?mode=food_beverage"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
            >
              <ShoppingBag size={14} /> Launch Restaurant POS
            </Link>
            <button
              onClick={() => setIsAddTableOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              <Plus size={14} /> + Add Table
            </button>
          </div>
        </div>

        {/* Selected Table Quick Action Strip */}
        {selectedTable && (
          <div className="bg-[#101422] border border-purple-500/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-purple-400 font-bold uppercase text-[10px]">{selectedTable.zone}</span>
              <div className="font-extrabold text-base text-white">
                {selectedTable.number} ({selectedTable.capacity} Seats) —{" "}
                <span className="uppercase text-emerald-300">{selectedTable.status}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(["available", "occupied", "reserved", "billed"] as TableStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => handleUpdateStatus(selectedTable.id, st)}
                  className={`px-3 py-1.5 rounded-xl font-bold capitalize cursor-pointer border ${
                    selectedTable.status === st
                      ? "bg-purple-600 text-white border-purple-400"
                      : "bg-gray-900 text-gray-300 border-gray-800 hover:text-white"
                  }`}
                >
                  Mark {st}
                </button>
              ))}
              <Link
                href={`/pos?mode=food_beverage&table=${encodeURIComponent(selectedTable.number)}`}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1"
              >
                Ring Up {selectedTable.number} in POS <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        )}

        {/* Interactive Floor Plan Grid */}
        {filteredTables.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-gray-800 rounded-3xl bg-[#0e121d]/40 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
              <Grid3x3 size={32} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No Dining Tables in This Zone</h3>
            <p className="text-sm text-gray-400 max-w-sm mb-6">
              Seed our 8-table restaurant layout in one click or add custom tables.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleSeedFloorPlan}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Seed 8-Table Floor Plan
              </button>
              <button
                onClick={() => setIsAddTableOpen(true)}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                + Add Custom Table
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredTables.map((tbl) => {
              const isSelected = selectedTable?.id === tbl.id;
              return (
                <div
                  key={tbl.id}
                  onClick={() => setSelectedTable(tbl)}
                  className={`p-4 rounded-3xl border cursor-pointer transition-all flex flex-col justify-between min-h-[160px] shadow-lg ${
                    isSelected
                      ? "bg-[#182035] border-purple-500 ring-2 ring-purple-500"
                      : tbl.status === "available"
                      ? "bg-[#0d141e] border-emerald-500/30 hover:border-emerald-500/60"
                      : tbl.status === "billed"
                      ? "bg-[#181410] border-amber-500/40"
                      : tbl.status === "reserved"
                      ? "bg-[#14121a] border-blue-500/30"
                      : "bg-[#141824] border-purple-500/40"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase">{tbl.zone}</span>
                      <h3 className="text-base font-extrabold text-white mt-0.5">{tbl.number}</h3>
                    </div>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                        tbl.status === "available"
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                          : tbl.status === "billed"
                          ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                          : tbl.status === "reserved"
                          ? "bg-blue-500/10 text-blue-300 border-blue-500/30"
                          : "bg-purple-500/10 text-purple-300 border-purple-500/30"
                      }`}
                    >
                      {tbl.status}
                    </span>
                  </div>

                  <div className="space-y-1 my-2">
                    <div className="flex items-center justify-between text-xs text-gray-300">
                      <span className="flex items-center gap-1">
                        <Users size={12} className="text-gray-400" /> {tbl.capacity} Seats
                      </span>
                      {tbl.status === "occupied" && (
                        <span className="font-bold text-white">{tbl.currentGuests || tbl.capacity} Seated</span>
                      )}
                    </div>
                    {tbl.server && (
                      <div className="text-[10px] text-gray-400 truncate">
                        Server: <strong className="text-gray-200">{tbl.server}</strong>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-gray-800 flex items-center justify-between text-xs">
                    {tbl.activeOrderTotal ? (
                      <span className="font-extrabold text-emerald-400">${tbl.activeOrderTotal.toFixed(2)}</span>
                    ) : (
                      <span className="text-gray-500 text-[10px]">Open Table</span>
                    )}
                    <Link
                      href={`/pos?mode=food_beverage&table=${encodeURIComponent(tbl.number)}`}
                      onClick={(e) => e.stopPropagation()}
                      className="px-2.5 py-1 rounded-lg bg-purple-600/25 hover:bg-purple-600 text-purple-200 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-colors"
                    >
                      Order <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ADD TABLE MODAL */}
      {isAddTableOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateTable}
            className="bg-[#101422] border border-gray-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs text-white"
          >
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Grid3x3 size={18} className="text-purple-400" /> Add Floor Table
              </h3>
              <button type="button" onClick={() => setIsAddTableOpen(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="font-bold text-gray-300 block mb-1">Table Number / Name *</label>
              <input
                type="text"
                required
                value={newTblNum}
                onChange={(e) => setNewTblNum(e.target.value)}
                placeholder="e.g. Table 9, Patio P2"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-gray-300 block mb-1">Zone / Room</label>
                <select
                  value={newTblZone}
                  onChange={(e) => setNewTblZone(e.target.value as any)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Main Dining Hall">Main Dining Hall</option>
                  <option value="Outdoor Patio">Outdoor Patio</option>
                  <option value="Espresso Bar">Espresso Bar</option>
                  <option value="VIP Private Lounge">VIP Private Lounge</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-gray-300 block mb-1">Seating Capacity</label>
                <input
                  type="number"
                  min="1"
                  value={newTblCap}
                  onChange={(e) => setNewTblCap(Number(e.target.value))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setIsAddTableOpen(false)}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Save Table
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
