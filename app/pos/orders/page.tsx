"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { useBranchContext } from "@/lib/branchContext";
import { exportToCSV } from "@/lib/exportUtils";
import {
  ShoppingBag,
  Wallet,
  Download,
  Receipt,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const MENU_ITEMS = [
  { name: "POS Terminal", href: "/pos" },
  { name: "Orders & Shift Z-Reports", href: "/pos/orders" },
  { name: "Kitchen Display (KDS)", href: "/pos/kds" },
  { name: "Floor Plan & Tables", href: "/pos/tables" },
  { name: "Recipe BOM", href: "/pos/recipes" },
];

export default function POSOrdersAndShiftsPage() {
  const { activeBranch } = useBranchContext();
  const [orders, setOrders] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"orders" | "shifts">("orders");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadPosHistory = useCallback(async () => {
    setLoading(true);
    try {
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

      const res = await fetch(
        `/api/pos?company_id=${encodeURIComponent(companyId)}&email=${encodeURIComponent(email)}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data.orders) ? data.orders : []);
        setShifts(Array.isArray(data.shifts) ? data.shifts : []);
      }
    } finally {
      setLoading(false);
    }
  }, [activeBranch?.id]);

  useEffect(() => {
    loadPosHistory();
  }, [loadPosHistory]);

  const filteredOrders = orders.filter((o) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      String(o.name || "").toLowerCase().includes(q) ||
      String(o.customerName || "").toLowerCase().includes(q) ||
      String(o.shiftNumber || "").toLowerCase().includes(q)
    );
  });

  const handleExportOrdersCsv = () => {
    exportToCSV(
      `POS_Orders_${new Date().toISOString().slice(0, 10)}`,
      ["Receipt #", "Shift #", "Terminal", "Customer", "Method", "Total", "Status", "Date"],
      filteredOrders.map((o) => [
        o.name,
        o.shiftNumber || "—",
        o.terminalName || "Register #1",
        o.customerName || "Walk-In",
        o.paymentMethod || "Card",
        o.total ?? 0,
        o.status || "APPROVED",
        o.date || o.created_at || "",
      ])
    );
  };

  const grossPosSales = orders
    .filter((o) => !o.isRefund)
    .reduce((s, o) => s + Number(o.total || 0), 0);

  return (
    <div className="flex flex-col h-screen bg-[#0F172A] text-white">
      <StandardModuleHeader
        moduleName="POS Orders & Shift Z-Reports"
        moduleIcon={<ShoppingBag size={20} />}
        menuItems={MENU_ITEMS}
        searchPlaceholder="Search receipt #, shift #, or customer..."
        onSearch={setSearch}
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#1E293B] border border-gray-700 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400 uppercase font-bold">Total POS Receipts</span>
              <div className="text-2xl font-black text-white mt-1">{orders.length}</div>
            </div>
            <Receipt size={22} className="text-purple-400" />
          </div>
          <div className="bg-[#1E293B] border border-gray-700 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400 uppercase font-bold">Gross Register Sales</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">${grossPosSales.toFixed(2)}</div>
            </div>
            <CheckCircle2 size={22} className="text-emerald-400" />
          </div>
          <div className="bg-[#1E293B] border border-gray-700 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400 uppercase font-bold">Register Shifts &amp; Z-Reports</span>
              <div className="text-2xl font-black text-cyan-300 mt-1">{shifts.length}</div>
            </div>
            <Wallet size={22} className="text-cyan-400" />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex p-1 rounded-xl bg-[#1E293B] border border-gray-700 text-xs font-bold gap-1">
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-4 py-2 rounded-lg cursor-pointer ${
                activeTab === "orders" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              POS Orders &amp; Refunds ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab("shifts")}
              className={`px-4 py-2 rounded-lg cursor-pointer ${
                activeTab === "shifts" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Shift Cash Drawers &amp; Z-Reports ({shifts.length})
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExportOrdersCsv}
              className="px-3.5 py-2 rounded-xl bg-[#1E293B] border border-gray-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={14} className="text-cyan-400" /> Export CSV
            </button>
            <Link
              href="/pos"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
            >
              Open POS Terminal <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeTab === "orders" ? (
          <div className="bg-[#1E293B] rounded-2xl border border-gray-700 overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#0F172A] border-b border-gray-700 text-gray-300 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Receipt #</th>
                  <th className="px-4 py-3">Shift / Terminal</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 font-bold text-white">{o.name}</td>
                    <td className="px-4 py-3 text-cyan-300 font-mono">
                      {o.shiftNumber || "AUTO"} • {o.terminalName || "Register #1"}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{o.customerName || "Walk-In"}</td>
                    <td className="px-4 py-3 text-gray-300">{o.paymentMethod}</td>
                    <td className={`px-4 py-3 font-bold ${o.isRefund ? "text-amber-400" : "text-emerald-400"}`}>
                      ${Number(o.total || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          o.isRefund
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-emerald-500/20 text-emerald-300"
                        }`}
                      >
                        {o.status || "APPROVED"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{o.date}</td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                      No POS orders recorded yet in this workspace cluster.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-[#1E293B] rounded-2xl border border-gray-700 overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#0F172A] border-b border-gray-700 text-gray-300 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Shift #</th>
                  <th className="px-4 py-3">Terminal &amp; Cashier</th>
                  <th className="px-4 py-3">Opening Float</th>
                  <th className="px-4 py-3">Cash Sales / Drops</th>
                  <th className="px-4 py-3">Expected Drawer</th>
                  <th className="px-4 py-3">Counted / Variance</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {shifts.map((s) => (
                  <tr key={s.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 font-bold text-white">{s.shiftNumber}</td>
                    <td className="px-4 py-3 text-gray-300">
                      {s.terminalName} • <span className="text-purple-300">{s.cashierName}</span>
                    </td>
                    <td className="px-4 py-3 font-mono">${Number(s.openingFloat || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 font-mono text-emerald-400">
                      +${Number(s.cashSalesNet || 0).toFixed(2)} / -${Number(s.cashOutsTotal || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 font-bold text-cyan-300">
                      ${Number(s.expectedDrawerCash || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {s.status === "closed"
                        ? `$${Number(s.countedClosingCash || 0).toFixed(2)} (Var: $${Number(
                            s.varianceAmount || 0
                          ).toFixed(2)})`
                        : "Open Shift"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          s.status === "open"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-purple-500/20 text-purple-300"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {shifts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                      No POS shifts opened yet. Click &ldquo;Open Shift &amp; Cash Float&rdquo; in the POS Terminal.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
