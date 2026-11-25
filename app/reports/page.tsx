"use client";

import { useState, useEffect, useMemo } from "react";
import AppHeader from "@/components/layout/AppHeader";
import { useBranchContext } from "@/lib/branchContext";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Package,
  Users,
  Target,
  Clock,
  HelpCircle,
  Download,
  FileSpreadsheet,
  DollarSign,
  ShoppingBag,
  Landmark,
  Factory,
  PhoneCall,
  SlidersHorizontal,
  Printer,
  RefreshCw,
} from "lucide-react";
import { printReportPDF, exportToExcel, exportToCSV } from "@/lib/exportUtils";

type ReportTab =
  | "sales"
  | "inventory"
  | "purchases"
  | "finance"
  | "hr_payroll"
  | "attendance"
  | "crm"
  | "helpdesk"
  | "industry_ops"
  | "custom_builder";

const CHART_COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ec4899", "#3b82f6"];

export default function ReportsPage() {
  const { activeBranch, getEntityStorageKey, currencySymbol } = useBranchContext();
  const companyId = activeBranch?.id || "CMP-001";
  const companyName = activeBranch?.name || "Workspace";
  const industryId = activeBranch?.industryId || "retail_supermarket";

  const [activeTab, setActiveTab] = useState<ReportTab>("sales");
  const [dateRange, setDateRange] = useState<"today" | "7d" | "30d" | "all">(
    industryId === "call_center" ? "today" : "all"
  );

  // Scoped datasets across ALL modules & industries
  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [crmLeads, setCrmLeads] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [payrollRuns, setPayrollRuns] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [variableEntries, setVariableEntries] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [callLeads, setCallLeads] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [mrpOrders, setMrpOrders] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  // Custom Report Builder State
  const [customSource, setCustomSource] = useState<
    "sales" | "purchases" | "inventory" | "crm" | "hr" | "call_center" | "projects" | "manufacturing"
  >("sales");
  const [customChartType, setCustomChartType] = useState<"bar" | "area" | "line" | "pie">("bar");

  const loadAllData = async () => {
    const readArr = (key: string): any[] => {
      try {
        const raw = localStorage.getItem(getEntityStorageKey(key));
        if (raw) {
          const p = JSON.parse(raw);
          if (Array.isArray(p)) return p;
        }
      } catch {}
      return [];
    };

    setSalesOrders([...readArr("sales_orders"), ...readArr("pos_orders")]);
    setInvoices(readArr("accounting_invoices"));
    setBills(readArr("accounting_bills"));
    setPurchaseOrders([...readArr("purchase_orders"), ...readArr("purchase_rfqs")]);
    setProducts(readArr("inventory_products"));
    setCrmLeads(readArr("crm_leads"));
    setTickets(readArr("helpdesk_tickets"));
    setEmployees(readArr("payroll_hr_employees").length > 0 ? readArr("payroll_hr_employees") : readArr("employees"));
    setPayrollRuns(readArr("payroll_runs"));
    setLeaves(readArr("payroll_leaves"));
    setVariableEntries(readArr("payroll_variable_entries"));
    setAttendances(readArr("attendances"));
    setCallLeads(readArr("call_center_leads"));
    setCampaigns(readArr("call_center_campaigns"));
    setMrpOrders(readArr("mrp_orders"));
    setProjects(readArr("projects_list"));

    // Also hydrate CRM leads from Next.js API if available
    try {
      const r = await fetch(`/api/crm/leads?company_id=${encodeURIComponent(companyId)}`, { cache: "no-store" });
      if (r.ok) {
        const d = await r.json();
        if (Array.isArray(d?.leads) && d.leads.length > 0) {
          setCrmLeads((prev) => {
            const merged = [...prev];
            d.leads.forEach((x: any) => {
              if (!merged.some((m) => m.id === x.id)) merged.push(x);
            });
            return merged;
          });
        }
      }
    } catch {}
  };

  useEffect(() => {
    loadAllData();
    if (industryId === "call_center") setDateRange("today");
  }, [companyId, industryId]);

  const filterByDate = (items: any[]) => {
    if (dateRange === "all") return items;
    const now = Date.now();
    const todayStr = new Date().toISOString().slice(0, 10);
    return items.filter((item) => {
      const dt = item.createdAt || item.created_at || item.date || item.payment_date || item.lastCalledAt;
      if (!dt) return true;
      if (dateRange === "today") return String(dt).slice(0, 10) === todayStr;
      const ms = new Date(dt).getTime();
      if (Number.isNaN(ms)) return true;
      const days = dateRange === "7d" ? 7 : 30;
      return now - ms <= days * 86400000;
    });
  };

  // Filtered views
  const fSales = useMemo(() => filterByDate(salesOrders), [salesOrders, dateRange]);
  const fInvoices = useMemo(() => filterByDate(invoices), [invoices, dateRange]);
  const fBills = useMemo(() => filterByDate(bills), [bills, dateRange]);
  const fPurchases = useMemo(() => filterByDate(purchaseOrders), [purchaseOrders, dateRange]);
  const fCrm = useMemo(() => filterByDate(crmLeads), [crmLeads, dateRange]);
  const fCallLeads = useMemo(() => filterByDate(callLeads), [callLeads, dateRange]);
  const fTickets = useMemo(() => filterByDate(tickets), [tickets, dateRange]);

  // Core KPIs
  const totalSalesRev =
    fSales.reduce((s, o) => s + (Number(o.amount_total ?? o.total ?? o.amount) || 0), 0) +
    fInvoices.filter((i) => i.status !== "void").reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const totalPurchaseSpend =
    fPurchases.reduce((s, p) => s + (Number(p.amount_total ?? p.total ?? p.amount) || 0), 0) +
    fBills.filter((b) => b.status !== "void").reduce((s, b) => s + (Number(b.amount) || 0), 0);
  const totalPayrollCost = payrollRuns.reduce((s, r) => s + (Number(r.total_employer_ctc ?? r.total_gross) || 0), 0);
  const netProfit = totalSalesRev - totalPurchaseSpend - totalPayrollCost;

  const inventoryValue = products.reduce(
    (s, p) => s + (Number(p.qty ?? p.quantity ?? p.stock ?? 0) * Number(p.cost ?? p.cost_price ?? p.price ?? 0)),
    0
  );
  const lowStockCount = products.filter((p) => Number(p.qty ?? p.quantity ?? p.stock ?? 0) <= Number(p.reorder_point ?? 5)).length;

  const wonDeals = fCrm.filter((l) => (l.status || "").toLowerCase() === "won");
  const crmPipelineVal = fCrm.reduce((s, l) => s + (Number(l.expected_revenue) || 0), 0);

  // Call Center AHT & Contact Metrics
  const totalCalls = fCallLeads.reduce((s, l) => s + (Number(l.callsCount) || 0), 0);
  const contactedLeads = fCallLeads.filter((l) => (l.callsCount || 0) > 0 || (l.disposition && l.disposition !== "New")).length;
  const contactRate = fCallLeads.length > 0 ? Math.round((contactedLeads / fCallLeads.length) * 100) : 0;
  const callQualified = fCallLeads.filter((l) => l.disposition === "Qualified" || l.disposition === "Closed Won").length;
  const avgHandleTimeSec = useMemo(() => {
    const timed = fCallLeads.filter((l) => Number(l.callDurationSec || l.call_duration_sec || 0) > 0);
    if (timed.length === 0) return totalCalls > 0 ? 185 : 0; // default 3m05s benchmark if calls logged without timer
    return Math.round(timed.reduce((s, l) => s + Number(l.callDurationSec || l.call_duration_sec || 0), 0) / timed.length);
  }, [fCallLeads, totalCalls]);
  const ahtFormatted = `${String(Math.floor(avgHandleTimeSec / 60)).padStart(2, "0")}:${String(avgHandleTimeSec % 60).padStart(2, "0")}`;

  // Custom Report Dataset
  const customReportData = useMemo(() => {
    switch (customSource) {
      case "sales":
        return [
          { name: "Sales/POS Orders", value: fSales.reduce((s, x) => s + (Number(x.amount_total ?? x.amount) || 0), 0) },
          { name: "Invoices", value: fInvoices.reduce((s, x) => s + (Number(x.amount) || 0), 0) },
          { name: "CRM Won", value: wonDeals.reduce((s, x) => s + (Number(x.expected_revenue) || 0), 0) },
        ];
      case "purchases":
        return [
          { name: "Purchase Orders", value: fPurchases.reduce((s, x) => s + (Number(x.amount_total ?? x.amount) || 0), 0) },
          { name: "Vendor Bills", value: fBills.reduce((s, x) => s + (Number(x.amount) || 0), 0) },
        ];
      case "inventory":
        return products.slice(0, 8).map((p) => ({
          name: p.name || p.sku || "SKU",
          value: Number(p.qty ?? p.quantity ?? p.stock ?? 0) * Number(p.cost ?? p.price ?? 1),
        }));
      case "crm":
        return ["New", "Qualified", "Proposition", "Won", "Lost"].map((st) => ({
          name: st,
          value: fCrm.filter((l) => (l.status || "").toLowerCase() === st.toLowerCase()).length,
        }));
      case "hr":
        return [
          { name: "Active Staff", value: employees.filter((e) => e.status !== "Terminated").length },
          { name: "Approved Leaves", value: leaves.filter((l) => l.status === "Approved").length },
          { name: "OT/Bonus Entries", value: variableEntries.length },
          { name: "Payroll Batches", value: payrollRuns.length },
        ];
      case "call_center":
        return ["New", "Callback", "Qualified", "Closed Won", "DNC"].map((d) => ({
          name: d,
          value: fCallLeads.filter((l) => l.disposition === d).length,
        }));
      case "projects":
        return projects.slice(0, 8).map((pr) => ({
          name: pr.name || "Project",
          value: Number(pr.budget || pr.progress || 1),
        }));
      case "manufacturing":
        return mrpOrders.slice(0, 8).map((mo) => ({
          name: mo.product || mo.name || "MO",
          value: Number(mo.qty || mo.quantity || 1),
        }));
    }
  }, [customSource, fSales, fInvoices, wonDeals, fPurchases, fBills, products, fCrm, employees, leaves, variableEntries, payrollRuns, fCallLeads, projects, mrpOrders]);

  const handleExportCurrentTab = (format: "xlsx" | "csv") => {
    const mapByTab: Record<ReportTab, { title: string; rows: any[] }> = {
      sales: { title: "Sales_Report", rows: [...fSales, ...fInvoices] },
      inventory: { title: "Inventory_Valuation", rows: products },
      purchases: { title: "Purchases_Report", rows: [...fPurchases, ...fBills] },
      finance: {
        title: "Finance_PnL_Summary",
        rows: [
          { Metric: "Total Revenue", Amount: totalSalesRev },
          { Metric: "Purchases & Vendor Bills", Amount: totalPurchaseSpend },
          { Metric: "Payroll & HR Cost", Amount: totalPayrollCost },
          { Metric: "Net Profit", Amount: netProfit },
        ],
      },
      hr_payroll: { title: "Employees_Payroll_Report", rows: employees.length > 0 ? employees : payrollRuns },
      attendance: { title: "Attendance_Leave_OT_Report", rows: [...attendances, ...leaves, ...variableEntries] },
      crm: { title: "CRM_Pipeline_Report", rows: fCrm },
      helpdesk: { title: "Helpdesk_SLA_Report", rows: fTickets },
      industry_ops: { title: "Industry_Operations_Report", rows: [...fCallLeads, ...mrpOrders, ...projects] },
      custom_builder: { title: `Custom_${customSource}_Report`, rows: customReportData },
    };
    const target = mapByTab[activeTab];
    const safeRows = target.rows.length > 0 ? target.rows : [{ Info: "No records for selected period" }];
    if (format === "xlsx") exportToExcel(safeRows, target.title);
    else exportToCSV(safeRows, target.title);
  };

  const TABS: { id: ReportTab; label: string; icon: any }[] = [
    { id: "sales", label: "Sales & POS", icon: TrendingUp },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "purchases", label: "Purchases", icon: ShoppingBag },
    { id: "finance", label: "Finance (P&L)", icon: Landmark },
    { id: "hr_payroll", label: "Employees & Payroll", icon: Users },
    { id: "attendance", label: "Attendance & OT", icon: Clock },
    { id: "crm", label: "CRM Pipeline", icon: Target },
    { id: "helpdesk", label: "Helpdesk & SLA", icon: HelpCircle },
    { id: "industry_ops", label: "Industry & AHT", icon: Factory },
    { id: "custom_builder", label: "Custom Builder", icon: SlidersHorizontal },
  ];

  return (
    <div className="min-h-screen bg-[#0a0d14] text-white flex flex-col">
      <AppHeader />

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* Header Bar */}
        <div className="beraxis-glass-hero p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-purple-300 mb-1">
              <BarChart3 size={14} /> Enterprise Reporting &amp; BI · {companyName}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">All-Company Reports &amp; Analytics</h1>
            <p className="text-xs text-gray-300 mt-1">
              Real-time Sales, Inventory, Purchases, Finance P&amp;L, HR &amp; Attendance, Call Center AHT, Manufacturing, and Custom Reports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-[#0B1022] border border-cyan-500/30 text-xs font-bold text-cyan-300 outline-none"
            >
              <option value="today">Daily (Today)</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
            <button onClick={loadAllData} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
              <RefreshCw size={13} /> Refresh
            </button>
            <button onClick={() => handleExportCurrentTab("xlsx")} className="px-3 py-2 rounded-xl bg-emerald-600/25 hover:bg-emerald-600/35 border border-emerald-500/35 text-emerald-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
              <FileSpreadsheet size={13} /> Excel
            </button>
            <button onClick={() => handleExportCurrentTab("csv")} className="px-3 py-2 rounded-xl bg-cyan-600/25 hover:bg-cyan-600/35 border border-cyan-500/35 text-cyan-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
              <Download size={13} /> CSV
            </button>
            <button onClick={() => printReportPDF()} className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer">
              <Printer size={13} /> Print / PDF
            </button>
          </div>
        </div>

        {/* Executive Cross-Module KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="beraxis-glass-dock p-4">
            <div className="text-[10px] font-bold uppercase text-gray-400">Revenue</div>
            <div className="text-xl font-black text-emerald-400 mt-1">{currencySymbol}{totalSalesRev.toLocaleString()}</div>
          </div>
          <div className="beraxis-glass-dock p-4">
            <div className="text-[10px] font-bold uppercase text-gray-400">Purchases &amp; Bills</div>
            <div className="text-xl font-black text-amber-400 mt-1">{currencySymbol}{totalPurchaseSpend.toLocaleString()}</div>
          </div>
          <div className="beraxis-glass-dock p-4">
            <div className="text-[10px] font-bold uppercase text-gray-400">Net Profit</div>
            <div className={`text-xl font-black mt-1 ${netProfit >= 0 ? "text-cyan-400" : "text-rose-400"}`}>{currencySymbol}{netProfit.toLocaleString()}</div>
          </div>
          <div className="beraxis-glass-dock p-4">
            <div className="text-[10px] font-bold uppercase text-gray-400">Inventory Value</div>
            <div className="text-xl font-black text-purple-400 mt-1">{currencySymbol}{inventoryValue.toLocaleString()}</div>
          </div>
          <div className="beraxis-glass-dock p-4">
            <div className="text-[10px] font-bold uppercase text-gray-400">Workforce / Payroll</div>
            <div className="text-xl font-black text-blue-400 mt-1">{employees.length} Staff</div>
          </div>
          <div className="beraxis-glass-dock p-4">
            <div className="text-[10px] font-bold uppercase text-gray-400">Call Center AHT</div>
            <div className="text-xl font-black text-pink-400 mt-1">{ahtFormatted}</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1.5 bg-[#111622] p-2 rounded-2xl border border-gray-800">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
                  activeTab === t.id ? "bg-purple-600 text-white shadow-md" : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={13} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Report Content Panels */}
        <div className="beraxis-glass-dock p-5 space-y-5">
          {activeTab === "sales" && (
            <div className="space-y-4">
              <h2 className="text-base font-black text-white">Sales, Quotations &amp; POS Revenue Report</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10"><div className="text-gray-400">Total Orders</div><div className="text-lg font-black text-white">{fSales.length}</div></div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10"><div className="text-gray-400">Invoices Issued</div><div className="text-lg font-black text-cyan-400">{fInvoices.length}</div></div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10"><div className="text-gray-400">Total Revenue</div><div className="text-lg font-black text-emerald-400">{currencySymbol}{totalSalesRev.toLocaleString()}</div></div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10"><div className="text-gray-400">Avg Order Value</div><div className="text-lg font-black text-purple-400">{currencySymbol}{fSales.length > 0 ? Math.round(totalSalesRev / fSales.length).toLocaleString() : 0}</div></div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead><tr className="border-b border-white/10 text-gray-400 uppercase text-[10px]"><th className="py-2 px-3">Ref</th><th className="py-2 px-3">Customer</th><th className="py-2 px-3">Status</th><th className="py-2 px-3 text-right">Amount</th></tr></thead>
                  <tbody className="divide-y divide-white/5">
                    {[...fSales, ...fInvoices].slice(0, 20).map((row, idx) => (
                      <tr key={row.id || idx}>
                        <td className="py-2.5 px-3 font-mono text-purple-300">{row.name || row.number || row.id}</td>
                        <td className="py-2.5 px-3 text-white">{row.customer || row.customer_name || "Walk-in / Client"}</td>
                        <td className="py-2.5 px-3 text-gray-300">{row.state || row.status || "confirmed"}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-400">{currencySymbol}{Number(row.amount_total ?? row.amount ?? 0).toLocaleString()}</td>
                      </tr>
                    ))}
                    {fSales.length === 0 && fInvoices.length === 0 && (
                      <tr><td colSpan={4} className="py-8 text-center text-gray-400">No sales or invoice records in this date range.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "inventory" && (
            <div className="space-y-4">
              <h2 className="text-base font-black text-white">Inventory Valuation &amp; Stock Alerts</h2>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10"><div className="text-gray-400">Total SKUs</div><div className="text-lg font-black text-white">{products.length}</div></div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10"><div className="text-gray-400">Low Stock Alerts</div><div className="text-lg font-black text-amber-400">{lowStockCount}</div></div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10"><div className="text-gray-400">Valuation</div><div className="text-lg font-black text-emerald-400">{currencySymbol}{inventoryValue.toLocaleString()}</div></div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead><tr className="border-b border-white/10 text-gray-400 uppercase text-[10px]"><th className="py-2 px-3">SKU / Product</th><th className="py-2 px-3">Category</th><th className="py-2 px-3 text-right">Qty On Hand</th><th className="py-2 px-3 text-right">Unit Cost</th><th className="py-2 px-3 text-right">Total Value</th></tr></thead>
                  <tbody className="divide-y divide-white/5">
                    {products.slice(0, 25).map((p, idx) => {
                      const q = Number(p.qty ?? p.quantity ?? p.stock ?? 0);
                      const c = Number(p.cost ?? p.cost_price ?? p.price ?? 0);
                      return (
                        <tr key={p.id || idx}>
                          <td className="py-2.5 px-3 font-bold text-white">{p.name || p.sku}</td>
                          <td className="py-2.5 px-3 text-gray-300">{p.category || "General"}</td>
                          <td className={`py-2.5 px-3 text-right font-bold ${q <= 5 ? "text-amber-400" : "text-cyan-300"}`}>{q}</td>
                          <td className="py-2.5 px-3 text-right text-gray-300">{currencySymbol}{c.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-400">{currencySymbol}{(q * c).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                    {products.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-gray-400">No inventory products recorded yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "purchases" && (
            <div className="space-y-4">
              <h2 className="text-base font-black text-white">Purchases, RFQs &amp; Vendor Spend Report</h2>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10"><div className="text-gray-400">POs &amp; RFQs</div><div className="text-lg font-black text-white">{fPurchases.length}</div></div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10"><div className="text-gray-400">Vendor Bills</div><div className="text-lg font-black text-cyan-400">{fBills.length}</div></div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10"><div className="text-gray-400">Total Procurement</div><div className="text-lg font-black text-amber-400">{currencySymbol}{totalPurchaseSpend.toLocaleString()}</div></div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead><tr className="border-b border-white/10 text-gray-400 uppercase text-[10px]"><th className="py-2 px-3">Ref</th><th className="py-2 px-3">Vendor</th><th className="py-2 px-3">Status</th><th className="py-2 px-3 text-right">Amount</th></tr></thead>
                  <tbody className="divide-y divide-white/5">
                    {[...fPurchases, ...fBills].slice(0, 20).map((b, idx) => (
                      <tr key={b.id || idx}>
                        <td className="py-2.5 px-3 font-mono text-amber-300">{b.name || b.number || b.id}</td>
                        <td className="py-2.5 px-3 text-white">{b.vendor || b.vendor_name || "Supplier"}</td>
                        <td className="py-2.5 px-3 text-gray-300">{b.state || b.status || "open"}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-amber-400">{currencySymbol}{Number(b.amount_total ?? b.amount ?? 0).toLocaleString()}</td>
                      </tr>
                    ))}
                    {fPurchases.length === 0 && fBills.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-gray-400">No purchase orders or vendor bills yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "finance" && (
            <div className="space-y-4">
              <h2 className="text-base font-black text-white">Overall Finance (Profit &amp; Loss Statement)</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25"><div className="text-gray-300">Gross Revenue</div><div className="text-2xl font-black text-emerald-400 mt-1">{currencySymbol}{totalSalesRev.toLocaleString()}</div></div>
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25"><div className="text-gray-300">Operating &amp; Purchases</div><div className="text-2xl font-black text-amber-400 mt-1">-{currencySymbol}{totalPurchaseSpend.toLocaleString()}</div></div>
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/25"><div className="text-gray-300">Payroll &amp; Employer CTC</div><div className="text-2xl font-black text-purple-300 mt-1">-{currencySymbol}{totalPayrollCost.toLocaleString()}</div></div>
                <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/25"><div className="text-gray-300">Net Profit / Margin</div><div className={`text-2xl font-black mt-1 ${netProfit >= 0 ? "text-cyan-300" : "text-rose-400"}`}>{currencySymbol}{netProfit.toLocaleString()}</div></div>
              </div>
            </div>
          )}

          {activeTab === "hr_payroll" && (
            <div className="space-y-4">
              <h2 className="text-base font-black text-white">Employees Master &amp; Payroll Cost Report</h2>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10"><div className="text-gray-400">Headcount</div><div className="text-lg font-black text-white">{employees.length}</div></div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10"><div className="text-gray-400">Payroll Batches</div><div className="text-lg font-black text-cyan-400">{payrollRuns.length}</div></div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10"><div className="text-gray-400">Total Employer CTC</div><div className="text-lg font-black text-emerald-400">{currencySymbol}{totalPayrollCost.toLocaleString()}</div></div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead><tr className="border-b border-white/10 text-gray-400 uppercase text-[10px]"><th className="py-2 px-3">Employee</th><th className="py-2 px-3">Department</th><th className="py-2 px-3">Role</th><th className="py-2 px-3">Status</th><th className="py-2 px-3 text-right">Annual Salary</th></tr></thead>
                  <tbody className="divide-y divide-white/5">
                    {employees.map((e, idx) => (
                      <tr key={e.id || idx}>
                        <td className="py-2.5 px-3 font-bold text-white">{e.name}</td>
                        <td className="py-2.5 px-3 text-gray-300">{e.department}</td>
                        <td className="py-2.5 px-3 text-gray-300">{e.role}</td>
                        <td className="py-2.5 px-3 text-emerald-400">{e.status || "Active"}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-cyan-300">{currencySymbol}{Number(e.annualSalary ?? e.salary ?? 0).toLocaleString()}</td>
                      </tr>
                    ))}
                    {employees.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-gray-400">No employees found. Add staff in /payroll or /employees.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "attendance" && (
            <div className="space-y-4">
              <h2 className="text-base font-black text-white">Employee Attendance, Leave &amp; Overtime Report</h2>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10"><div className="text-gray-400">Attendance Logs</div><div className="text-lg font-black text-white">{attendances.length}</div></div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10"><div className="text-gray-400">Leave Requests</div><div className="text-lg font-black text-purple-400">{leaves.length}</div></div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10"><div className="text-gray-400">Overtime &amp; Bonus Items</div><div className="text-lg font-black text-cyan-400">{variableEntries.length}</div></div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead><tr className="border-b border-white/10 text-gray-400 uppercase text-[10px]"><th className="py-2 px-3">Employee</th><th className="py-2 px-3">Type</th><th className="py-2 px-3">Details</th><th className="py-2 px-3">Status</th></tr></thead>
                  <tbody className="divide-y divide-white/5">
                    {leaves.map((lv) => (
                      <tr key={lv.id}>
                        <td className="py-2.5 px-3 font-bold text-white">{lv.employeeName}</td>
                        <td className="py-2.5 px-3 text-purple-300">{lv.type}</td>
                        <td className="py-2.5 px-3 text-gray-300">{lv.days} day(s) ({lv.startDate})</td>
                        <td className="py-2.5 px-3 text-emerald-400">{lv.status}</td>
                      </tr>
                    ))}
                    {variableEntries.map((v) => (
                      <tr key={v.id}>
                        <td className="py-2.5 px-3 font-bold text-white">{v.employeeName}</td>
                        <td className="py-2.5 px-3 text-cyan-300">{v.category}</td>
                        <td className="py-2.5 px-3 text-gray-300">{v.hours ? `${v.hours} hrs · ` : ""}{currencySymbol}{v.amount}</td>
                        <td className="py-2.5 px-3 text-amber-400">{v.status}</td>
                      </tr>
                    ))}
                    {leaves.length === 0 && variableEntries.length === 0 && attendances.length === 0 && (
                      <tr><td colSpan={4} className="py-8 text-center text-gray-400">No attendance, leave, or overtime records logged yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "crm" && (
            <div className="space-y-4">
              <h2 className="text-base font-black text-white">CRM Pipeline &amp; Conversion Report</h2>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10"><div className="text-gray-400">Total Deals</div><div className="text-lg font-black text-white">{fCrm.length}</div></div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10"><div className="text-gray-400">Won Deals</div><div className="text-lg font-black text-emerald-400">{wonDeals.length}</div></div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10"><div className="text-gray-400">Pipeline Value</div><div className="text-lg font-black text-purple-400">{currencySymbol}{crmPipelineVal.toLocaleString()}</div></div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead><tr className="border-b border-white/10 text-gray-400 uppercase text-[10px]"><th className="py-2 px-3">Deal</th><th className="py-2 px-3">Stage</th><th className="py-2 px-3">Probability</th><th className="py-2 px-3 text-right">Expected Revenue</th></tr></thead>
                  <tbody className="divide-y divide-white/5">
                    {fCrm.map((l) => (
                      <tr key={l.id}>
                        <td className="py-2.5 px-3 font-bold text-white">{l.name}</td>
                        <td className="py-2.5 px-3 text-cyan-300">{l.status}</td>
                        <td className="py-2.5 px-3 text-gray-300">{l.probability || 0}%</td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-400">{currencySymbol}{Number(l.expected_revenue || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                    {fCrm.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-gray-400">No CRM deals found in this date range.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "helpdesk" && (
            <div className="space-y-4">
              <h2 className="text-base font-black text-white">Helpdesk &amp; SLA Support Report</h2>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10"><div className="text-gray-400">Total Tickets</div><div className="text-lg font-black text-white">{fTickets.length}</div></div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10"><div className="text-gray-400">Resolved</div><div className="text-lg font-black text-emerald-400">{fTickets.filter((t) => t.status === "resolved" || t.status === "closed").length}</div></div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10"><div className="text-gray-400">Open</div><div className="text-lg font-black text-amber-400">{fTickets.filter((t) => t.status !== "resolved" && t.status !== "closed").length}</div></div>
              </div>
            </div>
          )}

          {activeTab === "industry_ops" && (
            <div className="space-y-5">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <PhoneCall size={16} className="text-cyan-400" /> Call Center AHT, Manufacturing &amp; Projects Operations
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/25"><div className="text-gray-300">Avg Handle Time (AHT)</div><div className="text-xl font-black text-cyan-300 mt-1">{ahtFormatted}</div></div>
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25"><div className="text-gray-300">Contact Rate / Qualified</div><div className="text-xl font-black text-emerald-400 mt-1">{contactRate}% · {callQualified}</div></div>
                <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/25"><div className="text-gray-300">Active Campaigns</div><div className="text-xl font-black text-purple-300 mt-1">{campaigns.length}</div></div>
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25"><div className="text-gray-300">MRP / Projects</div><div className="text-xl font-black text-amber-300 mt-1">{mrpOrders.length} MO · {projects.length} Prj</div></div>
              </div>
            </div>
          )}

          {activeTab === "custom_builder" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-black text-white">Custom Ad-Hoc Report Builder</h2>
                  <p className="text-xs text-gray-400">Pick any company module and chart visualization, then export to Excel, CSV, or PDF.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <select value={customSource} onChange={(e) => setCustomSource(e.target.value as any)} className="px-3 py-2 rounded-xl bg-[#0B1022] border border-white/15 text-white">
                    <option value="sales">Sales &amp; POS Revenue</option>
                    <option value="purchases">Purchases &amp; Vendor Bills</option>
                    <option value="inventory">Inventory Valuation</option>
                    <option value="crm">CRM Pipeline Stages</option>
                    <option value="hr">Employees, Leave &amp; Payroll</option>
                    <option value="call_center">Call Center Dispositions &amp; AHT</option>
                    <option value="projects">Projects &amp; Construction</option>
                    <option value="manufacturing">Manufacturing (MRP)</option>
                  </select>
                  <select value={customChartType} onChange={(e) => setCustomChartType(e.target.value as any)} className="px-3 py-2 rounded-xl bg-[#0B1022] border border-white/15 text-white">
                    <option value="bar">Bar Chart</option>
                    <option value="area">Area Chart</option>
                    <option value="line">Line Chart</option>
                    <option value="pie">Pie Chart</option>
                  </select>
                </div>
              </div>

              <div className="h-72 w-full bg-black/20 border border-white/10 rounded-2xl p-4">
                <ResponsiveContainer width="100%" height="100%">
                  {customChartType === "bar" ? (
                    <BarChart data={customReportData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  ) : customChartType === "area" ? (
                    <AreaChart data={customReportData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke="#06b6d4" fill="rgba(6,182,212,0.25)" />
                    </AreaChart>
                  ) : customChartType === "line" ? (
                    <LineChart data={customReportData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2.5} />
                    </LineChart>
                  ) : (
                    <PieChart>
                      <Pie data={customReportData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                        {customReportData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
