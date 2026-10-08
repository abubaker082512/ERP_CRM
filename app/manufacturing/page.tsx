"use client";

import { useState, useEffect } from "react";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { useBranchContext } from "@/lib/branchContext";
import { 
  Wrench, 
  Settings, 
  Package, 
  Clock, 
  AlertTriangle, 
  Plus, 
  CheckCircle2, 
  Download, 
  Play, 
  Layers, 
  Cpu, 
  Activity,
  Calendar,
  User,
  Sparkles,
  ArrowRight,
  ClipboardList
} from "lucide-react";

type MOStatus = "draft" | "confirmed" | "in_progress" | "quality" | "done";

type BOMItem = {
  material: string;
  qtyPerUnit: number;
  unit: string;
  unitCost: number;
};

type BOM = {
  id: string;
  product: string;
  sku: string;
  items: BOMItem[];
  estProductionTimeHours: number;
};

type ManufacturingOrder = {
  id: string;
  product: string;
  bomId: string;
  quantity: number;
  status: MOStatus;
  deadline: string;
  supervisor: string;
  workCenter: string;
  createdAt: string;
  notes?: string;
};

const MENU_ITEMS = [
  { name: "Manufacturing Orders", href: "/manufacturing" },
  { name: "Work Orders", href: "/manufacturing" },
  { name: "Bill of Materials", href: "/manufacturing" },
  { name: "Work Centers", href: "/manufacturing" },
];

const INITIAL_BOMS: BOM[] = [];

const INITIAL_ORDERS: ManufacturingOrder[] = [];

const STAGES: { id: MOStatus; label: string; color: string }[] = [
  { id: "draft", label: "Draft Orders", color: "bg-gray-500/10 text-gray-400 border-gray-600" },
  { id: "confirmed", label: "Confirmed / Ready", color: "bg-blue-500/10 text-blue-400 border-blue-500" },
  { id: "in_progress", label: "In Production", color: "bg-amber-500/10 text-amber-400 border-amber-500" },
  { id: "quality", label: "Quality Inspection", color: "bg-purple-500/10 text-purple-400 border-purple-500" },
  { id: "done", label: "Finished & Closed", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500" },
];

export default function ManufacturingPage() {
  const { activeBranch, getEntityStorageKey } = useBranchContext();
  const [orders, setOrders] = useState<ManufacturingOrder[]>([]);
  const [boms, setBoms] = useState<BOM[]>([]);
  const [activeTab, setActiveTab] = useState<"orders" | "bom" | "workcenters">("orders");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals
  const [isMoModalOpen, setIsMoModalOpen] = useState(false);
  const [isBomModalOpen, setIsBomModalOpen] = useState(false);
  const [selectedMo, setSelectedMo] = useState<ManufacturingOrder | null>(null);

  // New MO Form state
  const [selectedBomId, setSelectedBomId] = useState("");
  const [moQuantity, setMoQuantity] = useState(10);
  const [moDeadline, setMoDeadline] = useState("2026-10-20");
  const [moSupervisor, setMoSupervisor] = useState("Production Lead");
  const [moWorkCenter, setMoWorkCenter] = useState("Assembly Line 1");
  const [moNotes, setMoNotes] = useState("");

  // Entity-scoped data loading
  useEffect(() => {
    if (!activeBranch) return;

    const ordersKey = getEntityStorageKey("mrp_orders");
    const bomsKey = getEntityStorageKey("mrp_boms");

    const savedOrders = localStorage.getItem(ordersKey);
    if (savedOrders) {
      try { setOrders(JSON.parse(savedOrders)); } catch { setOrders([]); }
    } else {
      setOrders([]);
    }

    const savedBoms = localStorage.getItem(bomsKey);
    if (savedBoms) {
      try {
        const parsed = JSON.parse(savedBoms);
        setBoms(parsed);
        if (parsed.length > 0) setSelectedBomId(parsed[0].id);
      } catch {
        setBoms([]);
      }
    } else {
      setBoms([]);
    }
  }, [activeBranch?.id]);

  const persistOrders = (updated: ManufacturingOrder[]) => {
    setOrders(updated);
    try {
      const key = getEntityStorageKey("mrp_orders");
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}
  };

  const persistBoms = (updated: BOM[]) => {
    setBoms(updated);
    try {
      const key = getEntityStorageKey("mrp_boms");
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}
  };

  const handleCreateMo = (e: React.FormEvent) => {
    e.preventDefault();
    const bom = boms.find(b => b.id === selectedBomId) || { product: "Custom Assembly", id: "BOM-CUSTOM" };
    const newMo: ManufacturingOrder = {
      id: `MO-2026-${(orders.length + 1).toString().padStart(3, "0")}`,
      product: bom.product,
      bomId: bom.id,
      quantity: Number(moQuantity),
      status: "confirmed",
      deadline: moDeadline,
      supervisor: moSupervisor,
      workCenter: moWorkCenter,
      createdAt: new Date().toISOString().split("T")[0],
      notes: moNotes
    };

    const updated = [newMo, ...orders];
    persistOrders(updated);
    setIsMoModalOpen(false);
    setMoNotes("");
  };

  const handleMoveStatus = (orderId: string, newStatus: MOStatus) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    if (selectedMo && selectedMo.id === orderId) {
      setSelectedMo(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const exportOrdersCSV = () => {
    const headers = ["Order ID", "Product", "BOM Code", "Quantity", "Stage", "Deadline", "Supervisor", "Work Center", "Created At"];
    const rows = orders.map(o => [
      o.id,
      `"${o.product}"`,
      o.bomId,
      o.quantity,
      o.status,
      o.deadline,
      `"${o.supervisor}"`,
      `"${o.workCenter}"`,
      o.createdAt
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `manufacturing_orders_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.supervisor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.workCenter.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeOrdersCount = orders.filter(o => o.status !== "done").length;
  const inProductionCount = orders.filter(o => o.status === "in_progress").length;
  const inQualityCount = orders.filter(o => o.status === "quality").length;
  const totalUnitsProduced = orders.filter(o => o.status === "done").reduce((acc, o) => acc + o.quantity, 0);

  return (
    <div className="flex flex-col h-screen bg-[#0a0d14] text-white">
      <StandardModuleHeader
        moduleName="Manufacturing"
        moduleIcon={<Wrench size={20} />}
        menuItems={MENU_ITEMS}
        searchPlaceholder="Search MOs, BOM products, supervisors..."
      />

      <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-6">
        {/* KPI Dashboards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="galaxy-card p-4 border border-blue-500/20 bg-blue-950/10 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active MOs</p>
              <h3 className="text-2xl font-bold text-blue-400 mt-1">{activeOrdersCount} Active</h3>
              <p className="text-xs text-gray-400 mt-1">Across all plant centers</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
              <ClipboardList size={22} />
            </div>
          </div>

          <div className="galaxy-card p-4 border border-amber-500/20 bg-amber-950/10 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">In Production</p>
              <h3 className="text-2xl font-bold text-amber-400 mt-1">{inProductionCount} Orders</h3>
              <p className="text-xs text-gray-400 mt-1">Live routing active</p>
            </div>
            <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400">
              <Activity size={22} />
            </div>
          </div>

          <div className="galaxy-card p-4 border border-purple-500/20 bg-purple-950/10 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quality Bench</p>
              <h3 className="text-2xl font-bold text-purple-400 mt-1">{inQualityCount} Batches</h3>
              <p className="text-xs text-gray-400 mt-1">Undergoing QA testing</p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
              <Sparkles size={22} />
            </div>
          </div>

          <div className="galaxy-card p-4 border border-teal-500/20 bg-teal-950/10 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Completed Units</p>
              <h3 className="text-2xl font-bold text-teal-400 mt-1">{totalUnitsProduced} Units</h3>
              <p className="text-xs text-gray-400 mt-1">Yield 99.2% efficiency</p>
            </div>
            <div className="p-3 bg-teal-500/20 rounded-xl text-teal-400">
              <CheckCircle2 size={22} />
            </div>
          </div>
        </div>

        {/* Action Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111622] p-3.5 rounded-xl border border-gray-800">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-gray-900/80 p-1 rounded-lg border border-gray-800">
              <button
                onClick={() => setActiveTab("orders")}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                  activeTab === "orders" ? "bg-amber-600 text-white shadow-md shadow-amber-900/40" : "text-gray-400 hover:text-white"
                }`}
              >
                Manufacturing Orders
              </button>
              <button
                onClick={() => setActiveTab("bom")}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                  activeTab === "bom" ? "bg-amber-600 text-white shadow-md shadow-amber-900/40" : "text-gray-400 hover:text-white"
                }`}
              >
                Bill of Materials (BOM)
              </button>
              <button
                onClick={() => setActiveTab("workcenters")}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                  activeTab === "workcenters" ? "bg-amber-600 text-white shadow-md shadow-amber-900/40" : "text-gray-400 hover:text-white"
                }`}
              >
                Work Centers & Plant
              </button>
            </div>

            {activeTab === "orders" && (
              <div className="flex bg-gray-900/80 p-1 rounded-lg border border-gray-800 ml-2">
                <button
                  onClick={() => setViewMode("kanban")}
                  className={`px-3 py-1 rounded text-xs font-semibold ${viewMode === "kanban" ? "bg-gray-800 text-white" : "text-gray-400"}`}
                >
                  Kanban
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1 rounded text-xs font-semibold ${viewMode === "list" ? "bg-gray-800 text-white" : "text-gray-400"}`}
                >
                  List
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportOrdersCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/80 hover:bg-gray-700 text-gray-200 rounded-lg text-xs font-semibold border border-gray-700 transition-all active:scale-95"
            >
              <Download size={14} /> Export CSV
            </button>
            <button
              onClick={() => setIsMoModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-lg shadow-amber-600/30 transition-all active:scale-95"
            >
              <Plus size={14} /> New Manufacturing Order
            </button>
          </div>
        </div>

        {/* TAB 1: MANUFACTURING ORDERS */}
        {activeTab === "orders" && viewMode === "kanban" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-start min-h-[500px]">
            {STAGES.map(stage => {
              const stageOrders = filteredOrders.filter(o => o.status === stage.id);
              return (
                <div key={stage.id} className="bg-[#111622] rounded-xl border border-gray-800 flex flex-col max-h-[750px]">
                  <div className="p-3 border-b border-gray-800 flex items-center justify-between rounded-t-xl bg-gray-900/40">
                    <span className="text-xs font-bold text-gray-200">{stage.label}</span>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-gray-800 text-gray-300">
                      {stageOrders.length}
                    </span>
                  </div>

                  <div className="p-2 space-y-2.5 overflow-y-auto flex-1">
                    {stageOrders.length === 0 ? (
                      <div className="py-8 text-center border-2 border-dashed border-gray-800/60 rounded-lg">
                        <p className="text-xs text-gray-500">No orders in stage</p>
                      </div>
                    ) : (
                      stageOrders.map(mo => (
                        <div
                          key={mo.id}
                          onClick={() => setSelectedMo(mo)}
                          className="galaxy-card p-3.5 border border-gray-800 hover:border-amber-500/50 bg-[#161c2d] hover:bg-[#1c243a] transition-all rounded-xl cursor-pointer group"
                        >
                          <div className="flex items-start justify-between">
                            <span className="text-xs font-bold text-amber-400 group-hover:text-amber-300">{mo.id}</span>
                            <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-gray-800 text-white">
                              {mo.quantity} Units
                            </span>
                          </div>
                          
                          <h4 className="text-sm font-bold text-white mt-1.5">{mo.product}</h4>
                          <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                            <Cpu size={12} className="text-gray-500" /> {mo.workCenter}
                          </p>

                          <div className="mt-2.5 pt-2 border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar size={11} className="text-gray-500" />
                              <span>Due: {mo.deadline}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User size={11} className="text-gray-500" />
                              <span>{mo.supervisor.split(" ")[0]}</span>
                            </div>
                          </div>

                          {/* Quick progression buttons */}
                          <div className="mt-2 pt-2 border-t border-gray-800/80 flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            {stage.id === "draft" && (
                              <button
                                onClick={() => handleMoveStatus(mo.id, "confirmed")}
                                className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded text-[10px] font-bold"
                              >
                                Confirm MO
                              </button>
                            )}
                            {stage.id === "confirmed" && (
                              <button
                                onClick={() => handleMoveStatus(mo.id, "in_progress")}
                                className="flex items-center gap-1 px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold"
                              >
                                <Play size={10} /> Start Production
                              </button>
                            )}
                            {stage.id === "in_progress" && (
                              <button
                                onClick={() => handleMoveStatus(mo.id, "quality")}
                                className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[10px] font-bold"
                              >
                                Send to QA
                              </button>
                            )}
                            {stage.id === "quality" && (
                              <button
                                onClick={() => handleMoveStatus(mo.id, "done")}
                                className="flex items-center gap-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                              >
                                <CheckCircle2 size={10} /> Mark Done
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 1: LIST VIEW */}
        {activeTab === "orders" && viewMode === "list" && (
          <div className="galaxy-card bg-[#111622] rounded-xl border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-gray-900/90 text-gray-400 uppercase text-[11px] font-bold border-b border-gray-800 tracking-wider">
                  <tr>
                    <th className="px-4 py-3">MO Reference</th>
                    <th className="px-4 py-3">Product Name</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Work Center</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Deadline</th>
                    <th className="px-4 py-3">Supervisor</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {filteredOrders.map(mo => {
                    const stageConfig = STAGES.find(s => s.id === mo.status);
                    return (
                      <tr
                        key={mo.id}
                        className="hover:bg-gray-800/40 transition-colors cursor-pointer"
                        onClick={() => setSelectedMo(mo)}
                      >
                        <td className="px-4 py-3.5 font-bold text-amber-400">{mo.id}</td>
                        <td className="px-4 py-3.5 font-semibold text-white">{mo.product}</td>
                        <td className="px-4 py-3.5 font-bold text-gray-200">{mo.quantity} pcs</td>
                        <td className="px-4 py-3.5 text-xs text-gray-400">{mo.workCenter}</td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${stageConfig?.color}`}>
                            {stageConfig?.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-400">{mo.deadline}</td>
                        <td className="px-4 py-3.5 text-xs text-gray-300">{mo.supervisor}</td>
                        <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedMo(mo)}
                            className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded text-xs font-semibold"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: BILL OF MATERIALS (BOM) */}
        {activeTab === "bom" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {boms.map(bom => {
              const totalCostPerUnit = bom.items.reduce((acc, item) => acc + (item.qtyPerUnit * item.unitCost), 0);
              return (
                <div key={bom.id} className="galaxy-card p-5 border border-gray-800 bg-[#111622] rounded-xl space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">{bom.id} • SKU: {bom.sku}</span>
                      <h3 className="text-base font-bold text-white mt-1">{bom.product}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Est. {bom.estProductionTimeHours} hrs / unit cycle</p>
                    </div>
                    <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-400">
                      <Layers size={20} />
                    </div>
                  </div>

                  <div className="bg-gray-900/70 rounded-lg p-3 border border-gray-800/80 space-y-2">
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex justify-between">
                      <span>Raw Materials Breakdown</span>
                      <span>Unit Cost</span>
                    </div>
                    <div className="divide-y divide-gray-800 text-xs">
                      {bom.items.map((item, idx) => (
                        <div key={idx} className="py-1.5 flex justify-between items-center text-gray-300">
                          <div>
                            <span className="font-semibold">{item.material}</span>
                            <span className="text-gray-500 ml-1.5">({item.qtyPerUnit} {item.unit})</span>
                          </div>
                          <span className="font-mono text-gray-400">${(item.qtyPerUnit * item.unitCost).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase">Estimated Unit Cost</span>
                      <span className="font-bold text-emerald-400 text-sm">${totalCostPerUnit.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedBomId(bom.id);
                        setIsMoModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-md shadow-amber-600/30"
                    >
                      <Plus size={12} /> Launch MO
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: WORK CENTERS & PLANT STATUS */}
        {activeTab === "workcenters" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="galaxy-card p-5 border border-gray-800 bg-[#111622] rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-white">Assembly Line 1</h4>
                  <p className="text-xs text-gray-400">Mechanical Ergonomics Bench</p>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold">
                  Operational
                </span>
              </div>
              <div className="space-y-2 text-xs bg-gray-900/60 p-3 rounded-lg">
                <div className="flex justify-between text-gray-300">
                  <span>Current Load:</span>
                  <span className="font-bold text-amber-400">85% Capacity</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Active Operator:</span>
                  <span className="font-semibold text-white">Alex Vance + 4 Technicians</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>OEE Efficiency:</span>
                  <span className="font-bold text-emerald-400">96.8%</span>
                </div>
              </div>
            </div>

            <div className="galaxy-card p-5 border border-gray-800 bg-[#111622] rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-white">CNC Woodworking Station</h4>
                  <p className="text-xs text-gray-400">5-Axis High-Precision Milling</p>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold">
                  Operational
                </span>
              </div>
              <div className="space-y-2 text-xs bg-gray-900/60 p-3 rounded-lg">
                <div className="flex justify-between text-gray-300">
                  <span>Current Load:</span>
                  <span className="font-bold text-blue-400">60% Capacity</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Active Operator:</span>
                  <span className="font-semibold text-white">Elena Rostova</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>OEE Efficiency:</span>
                  <span className="font-bold text-emerald-400">98.1%</span>
                </div>
              </div>
            </div>

            <div className="galaxy-card p-5 border border-gray-800 bg-[#111622] rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-white">Clean Room & Sound Bench</h4>
                  <p className="text-xs text-gray-400">Acoustic & Vibration Certification</p>
                </div>
                <span className="px-2.5 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-full text-xs font-bold">
                  Testing Mode
                </span>
              </div>
              <div className="space-y-2 text-xs bg-gray-900/60 p-3 rounded-lg">
                <div className="flex justify-between text-gray-300">
                  <span>Current Load:</span>
                  <span className="font-bold text-purple-400">100% (Batch Testing)</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Active Operator:</span>
                  <span className="font-semibold text-white">Marcus Vance</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>OEE Efficiency:</span>
                  <span className="font-bold text-emerald-400">99.4%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CREATE MO MODAL */}
      {isMoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateMo} className="bg-[#111622] border border-gray-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Wrench size={20} className="text-amber-400" /> Issue Manufacturing Order (MO)
            </h3>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">Target Bill of Materials (BOM) *</label>
              <select
                value={selectedBomId}
                onChange={e => setSelectedBomId(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                {boms.map(b => (
                  <option key={b.id} value={b.id}>{b.product} ({b.sku})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Batch Production Qty *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={moQuantity}
                  onChange={e => setMoQuantity(Number(e.target.value))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Target Completion Due Date</label>
                <input
                  type="date"
                  required
                  value={moDeadline}
                  onChange={e => setMoDeadline(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Production Supervisor</label>
                <input
                  type="text"
                  value={moSupervisor}
                  onChange={e => setMoSupervisor(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Work Center Routing</label>
                <select
                  value={moWorkCenter}
                  onChange={e => setMoWorkCenter(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Assembly Line 1">Assembly Line 1</option>
                  <option value="CNC Woodworking Station">CNC Woodworking Station</option>
                  <option value="Clean Room & Sound Bench">Clean Room & Sound Bench</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">Production Work Notes / Specifications</label>
              <textarea
                rows={2}
                value={moNotes}
                onChange={e => setMoNotes(e.target.value)}
                placeholder="Tolerance limits, special packing, QA check reminders..."
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setIsMoModalOpen(false)}
                className="px-4 py-2 bg-gray-800 text-gray-300 hover:text-white rounded-lg text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-lg shadow-amber-600/30"
              >
                Confirm Manufacturing Order
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MO DETAIL DRAWER */}
      {selectedMo && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-gray-700 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex justify-between items-start border-b border-gray-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">{selectedMo.id}</span>
                <h3 className="text-xl font-bold text-white mt-1">{selectedMo.product}</h3>
                <p className="text-xs text-gray-400">Assigned Center: {selectedMo.workCenter}</p>
              </div>
              <button
                onClick={() => setSelectedMo(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-gray-900/60 p-4 rounded-xl border border-gray-800 text-xs">
              <div>
                <span className="text-gray-500 block">Quantity</span>
                <span className="font-bold text-white text-sm">{selectedMo.quantity} Units</span>
              </div>
              <div>
                <span className="text-gray-500 block">Supervisor</span>
                <span className="font-bold text-gray-200">{selectedMo.supervisor}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Created Date</span>
                <span className="font-semibold text-gray-300">{selectedMo.createdAt}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Target Deadline</span>
                <span className="font-semibold text-amber-400">{selectedMo.deadline}</span>
              </div>
            </div>

            {selectedMo.notes && (
              <div className="text-xs bg-gray-900/80 p-3 rounded-lg border border-gray-800 text-gray-300">
                <span className="font-bold text-gray-400 block mb-1">Production Notes:</span>
                {selectedMo.notes}
              </div>
            )}

            <div>
              <label className="text-xs font-bold uppercase text-gray-400 block mb-2">Advance Production Stage</label>
              <div className="flex flex-wrap gap-2">
                {STAGES.map(st => (
                  <button
                    key={st.id}
                    onClick={() => handleMoveStatus(selectedMo.id, st.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      selectedMo.status === st.id
                        ? "bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-900/40"
                        : "bg-gray-900 text-gray-400 border-gray-800 hover:text-white"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800 flex justify-end">
              <button
                onClick={() => setSelectedMo(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-bold"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
