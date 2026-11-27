"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { useEffect, useState, useCallback } from "react";
import {
  BarChart3,
  CheckCircle,
  Package,
  DollarSign,
  ArrowRight,
  FileText,
  Download,
  FileSpreadsheet,
  Plus,
  Truck,
  Receipt,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useBranchContext } from "@/lib/branchContext";
import { exportToCSV, exportToExcel, printQuotationPDF } from "@/lib/exportUtils";

const MENU_ITEMS = [
  { name: "Order-to-Cash Hub", href: "/sales" },
  { name: "Confirmed Orders", href: "/sales/orders" },
  { name: "New Quotation / Order", href: "/sales/quotations/new" },
  { name: "Customers", href: "/sales/customers" },
  { name: "Products", href: "/sales/products" },
  { name: "Reporting", href: "/sales/reporting" },
];

type Order = {
  id: string;
  name: string;
  customer_name?: string;
  channel?: string;
  amount_total: number;
  state: string;
  deliveryRef?: string;
  invoiceRef?: string;
  date_order?: string;
  created_at: string;
  lines?: any[];
};

export default function SalesOrdersPage() {
  const router = useRouter();
  const { activeBranch } = useBranchContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>("list");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const getAuthMeta = () => {
    if (typeof window === "undefined") return { companyId: "CMP-001", email: "" };
    const companyId = activeBranch?.id || localStorage.getItem("beraxis_active_branch_id") || "CMP-001";
    let email = "";
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      email = u.email || "";
    } catch {}
    return { companyId, email };
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { companyId, email } = getAuthMeta();
      const res = await fetch(
        `/api/sales?company_id=${encodeURIComponent(companyId)}&email=${encodeURIComponent(email)}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        const all = Array.isArray(data.orders) ? data.orders : [];
        setOrders(all);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [activeBranch?.id]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const advanceOrderState = async (e: React.MouseEvent, orderId: string, nextState: string) => {
    e.stopPropagation();
    const { companyId, email } = getAuthMeta();
    const res = await fetch("/api/sales", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company_id: companyId, email, id: orderId, state: nextState }),
    });
    if (res.ok) fetchOrders();
  };

  const confirmedOrders = orders.filter((o) =>
    ["sale", "dispatched", "invoiced"].includes(o.state)
  );
  const totalRevenue = confirmedOrders.reduce((sum, o) => sum + (o.amount_total || 0), 0);

  const filteredOrders = orders.filter((o) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (o.name || "").toLowerCase().includes(q) ||
      (o.customer_name || "").toLowerCase().includes(q) ||
      (o.channel || "").toLowerCase().includes(q)
    );
  });

  const handleExportCSV = () => {
    const headers = ["Order #", "Channel", "Customer", "Total Amount", "Status", "Delivery Ref", "Invoice Ref", "Order Date"];
    const rows = filteredOrders.map((o) => [
      o.name || o.id,
      o.channel || "Direct Sales",
      o.customer_name || "Customer",
      o.amount_total || 0,
      o.state || "draft",
      o.deliveryRef || "",
      o.invoiceRef || "",
      o.date_order || o.created_at || "",
    ]);
    exportToCSV(`Sales_Orders_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  const handleExportExcel = () => {
    const headers = ["Order #", "Channel", "Customer", "Total ($)", "Status", "Delivery Ref", "Invoice Ref", "Order Date"];
    const rows = filteredOrders.map((o) => [
      o.name || o.id,
      o.channel || "Direct Sales",
      o.customer_name || "Customer",
      o.amount_total || 0,
      o.state || "draft",
      o.deliveryRef || "",
      o.invoiceRef || "",
      o.date_order ? new Date(o.date_order).toLocaleDateString() : "",
    ]);
    exportToExcel(`Sales_Orders_${new Date().toISOString().slice(0, 10)}`, headers, rows, "Sales_Orders");
  };

  const handleDownloadOrderPDF = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    const linesData = order.lines || [];
    const formattedLines = linesData.map((line: any) => ({
      name: line.name || "Product Item",
      description: line.description || "",
      quantity: line.quantity || line.product_uom_qty || 1,
      unitPrice: line.unitPrice ?? line.price_unit ?? 0,
      subtotal: line.subtotal ?? line.price_subtotal ?? 0,
    }));

    printQuotationPDF({
      documentNumber: order.name || `SO-${order.id.slice(0, 8)}`,
      documentType: ["sale", "dispatched", "invoiced"].includes(order.state) ? "Sales Order" : "Quotation",
      customerName: order.customer_name || "Valued Customer",
      date: new Date(order.date_order || order.created_at).toLocaleDateString(),
      status: (order.state || "Draft").toUpperCase(),
      lines: formattedLines,
      amountTotal: order.amount_total || 0,
      notes: `Channel: ${order.channel || "Direct Sales"}${order.deliveryRef ? ` | Delivery: ${order.deliveryRef}` : ""}${order.invoiceRef ? ` | Invoice: ${order.invoiceRef}` : ""}`,
    });
  };

  return (
    <div className="flex flex-col h-screen bg-[#0F172A] text-white">
      <StandardModuleHeader
        moduleName="Sales Orders"
        moduleIcon={<BarChart3 size={20} />}
        menuItems={MENU_ITEMS}
        searchPlaceholder="Search order #, customer, or channel..."
        onSearch={setSearch}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-200">
                Confirmed &amp; Fulfilled Sales Orders
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {confirmedOrders.length} active/fulfilled orders • $
                {totalRevenue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                confirmed revenue
              </p>
            </div>
            <ViewSwitcher
              currentView={currentView}
              availableViews={["list", "kanban"]}
              onViewChange={setCurrentView}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportExcel}
              className="bg-[#1E293B] hover:bg-[#334155] border border-gray-700 text-gray-300 hover:text-white px-3 py-2 rounded-lg flex items-center gap-1.5 text-sm font-medium transition cursor-pointer"
            >
              <FileSpreadsheet size={16} className="text-emerald-400" />
              <span className="hidden sm:inline">Export Excel</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="bg-[#1E293B] hover:bg-[#334155] border border-gray-700 text-gray-300 hover:text-white px-3 py-2 rounded-lg flex items-center gap-1.5 text-sm font-medium transition cursor-pointer"
            >
              <Download size={16} className="text-cyan-400" />
              <span className="hidden sm:inline">CSV</span>
            </button>
            <Link
              href="/sales/quotations/new"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-md shadow-purple-900/30 transition-all cursor-pointer"
            >
              <Plus size={18} /> New Quotation / Order
            </Link>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#1E293B] rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">All Pipeline Documents</span>
              <Package size={16} className="text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white">{orders.length}</div>
          </div>
          <div className="bg-[#1E293B] rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Confirmed Revenue</span>
              <DollarSign size={16} className="text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-[#1E293B] rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Dispatched / Delivered</span>
              <Truck size={16} className="text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {orders.filter((o) => o.state === "dispatched" || o.state === "invoiced").length}
            </div>
          </div>
          <div className="bg-[#1E293B] rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Invoiced &amp; Paid</span>
              <Receipt size={16} className="text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {orders.filter((o) => o.state === "invoiced").length}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : currentView === "list" ? (
          <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-hidden shadow-xl">
            <table className="w-full text-sm">
              <thead className="bg-[#0F172A] border-b border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-300">Order #</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-300">Channel</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-300">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-300">Total</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-300">Stage</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-300">Date</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => router.push(`/sales/${order.id}`)}
                    className="border-b border-gray-700/60 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 font-semibold text-white">{order.name || order.id}</td>
                    <td className="px-4 py-3 text-xs text-purple-300">{order.channel || "Direct Sales"}</td>
                    <td className="px-4 py-3 text-gray-300 font-medium">{order.customer_name || "Customer"}</td>
                    <td className="px-4 py-3 text-green-400 font-semibold">
                      ${(order.amount_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
                          order.state === "invoiced"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : order.state === "dispatched"
                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                            : order.state === "sale"
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                        }`}
                      >
                        {order.state}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(order.date_order || order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {order.state === "draft" && (
                          <button
                            onClick={(e) => advanceOrderState(e, order.id, "sale")}
                            className="px-2 py-1 bg-green-600/25 hover:bg-green-600/40 text-green-300 rounded text-xs font-bold cursor-pointer"
                          >
                            Confirm
                          </button>
                        )}
                        {order.state === "sale" && (
                          <button
                            onClick={(e) => advanceOrderState(e, order.id, "dispatched")}
                            className="px-2 py-1 bg-cyan-600/25 hover:bg-cyan-600/40 text-cyan-300 rounded text-xs font-bold cursor-pointer"
                          >
                            Dispatch
                          </button>
                        )}
                        {order.state === "dispatched" && (
                          <button
                            onClick={(e) => advanceOrderState(e, order.id, "invoiced")}
                            className="px-2 py-1 bg-emerald-600/25 hover:bg-emerald-600/40 text-emerald-300 rounded text-xs font-bold cursor-pointer"
                          >
                            Invoice &amp; Pay
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDownloadOrderPDF(e, order)}
                          className="p-1.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 rounded border border-purple-500/30 flex items-center gap-1 text-xs font-medium transition cursor-pointer"
                        >
                          <Download size={13} /> PDF
                        </button>
                        <span className="text-purple-400 hover:text-purple-300 text-xs font-medium flex items-center gap-1 ml-1">
                          Open <ArrowRight size={13} />
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                      No sales orders yet. Click{" "}
                      <Link href="/sales/quotations/new" className="text-purple-400 underline">
                        + New Quotation / Order
                      </Link>{" "}
                      or open the{" "}
                      <Link href="/sales" className="text-emerald-400 underline">
                        Order-to-Cash Hub
                      </Link>{" "}
                      to load an industry blueprint.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {(
              [
                { id: "draft", label: "Quotations (Draft)" },
                { id: "sale", label: "Confirmed Orders" },
                { id: "dispatched", label: "Dispatched / Delivered" },
                { id: "invoiced", label: "Invoiced & Paid" },
              ] as const
            ).map((col) => {
              const filtered = filteredOrders.filter((o) => o.state === col.id);
              return (
                <div key={col.id} className="bg-[#1E293B]/70 rounded-lg p-4 border border-gray-700 flex flex-col">
                  <h3 className="font-semibold text-white mb-3 pb-2 border-b border-gray-700 text-sm">
                    {col.label} ({filtered.length})
                  </h3>
                  <div className="space-y-3 flex-1">
                    {filtered.map((order) => (
                      <div
                        key={order.id}
                        onClick={() => router.push(`/sales/${order.id}`)}
                        className="bg-[#1E293B] border border-gray-700 rounded-lg p-3.5 hover:border-purple-500 transition-all cursor-pointer shadow"
                      >
                        <div className="font-semibold text-white text-sm">{order.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{order.customer_name}</div>
                        <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-800">
                          <span className="text-green-400 font-bold text-sm">
                            ${(order.amount_total || 0).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-purple-300">{order.channel || "Direct"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
