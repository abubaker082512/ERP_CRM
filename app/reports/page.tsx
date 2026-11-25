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
  FileText,
  FileJson,
  ShoppingBag,
  Landmark,
  Factory,
  PhoneCall,
  SlidersHorizontal,
  Printer,
  RefreshCw,
  Calendar,
  CheckCircle2,
  X,
  FolderDown,
} from "lucide-react";
import { printReportPDF, exportToExcel, exportToCSV, ReportDocumentData } from "@/lib/exportUtils";

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

type DatePreset =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "this_month"
  | "this_quarter"
  | "this_year"
  | "all"
  | "custom";

const CHART_COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ec4899", "#3b82f6"];

export default function ReportsPage() {
  const { activeBranch, getEntityStorageKey, currencySymbol } = useBranchContext();
  const companyId = activeBranch?.id || "CMP-001";
  const companyName = activeBranch?.name || "Workspace";
  const industryId = activeBranch?.industryId || "retail_supermarket";

  const [activeTab, setActiveTab] = useState<ReportTab>("sales");
  const [dateRange, setDateRange] = useState<DatePreset>(
    industryId === "call_center" ? "today" : "all"
  );

  // Custom Date & Time Range State
  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const sevenDaysAgoIso = useMemo(
    () => new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10),
    []
  );
  const [customStartDate, setCustomStartDate] = useState<string>(sevenDaysAgoIso);
  const [customStartTime, setCustomStartTime] = useState<string>("00:00");
  const [customEndDate, setCustomEndDate] = useState<string>(todayIso);
  const [customEndTime, setCustomEndTime] = useState<string>("23:59");

  // Specific Report Download Modal & Toast
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string>("sales");
  const [selectedFormat, setSelectedFormat] = useState<"xlsx" | "csv" | "pdf" | "json">("xlsx");
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  // Scoped datasets across ALL modules & industries
  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [stockOps, setStockOps] = useState<any[]>([]);
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
  const [mrpBoms, setMrpBoms] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [publicFormSubmissions, setPublicFormSubmissions] = useState<any[]>([]);

  // Custom Report Builder State
  const [customSource, setCustomSource] = useState<
    | "sales"
    | "purchases"
    | "inventory"
    | "crm"
    | "hr"
    | "call_center"
    | "projects"
    | "manufacturing"
    | "public_forms"
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
    setWarehouses(readArr("inventory_warehouses"));
    setStockOps(readArr("inventory_operations"));
    setCrmLeads(readArr("crm_leads"));
    setTickets(readArr("helpdesk_tickets"));
    setEmployees(
      readArr("payroll_hr_employees").length > 0
        ? readArr("payroll_hr_employees")
        : readArr("employees")
    );
    setPayrollRuns(readArr("payroll_runs"));
    setLeaves(readArr("payroll_leaves"));
    setVariableEntries(readArr("payroll_variable_entries"));
    setAttendances(readArr("attendances"));
    setCallLeads(readArr("call_center_leads"));
    setCampaigns(readArr("call_center_campaigns"));
    setMrpOrders(readArr("mrp_orders"));
    setMrpBoms(readArr("mrp_boms"));
    setWorkOrders(readArr("mrp_work_orders"));
    setProjects(readArr("projects_list"));

    try {
      const r = await fetch(`/api/crm/leads?company_id=${encodeURIComponent(companyId)}`, {
        cache: "no-store",
      });
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

    try {
      const pf = await fetch(
        `/api/public-forms?company_id=${encodeURIComponent(companyId)}&include_leads=1`,
        { cache: "no-store" }
      );
      if (pf.ok) {
        const pfd = await pf.json();
        if (Array.isArray(pfd?.leads)) {
          setPublicFormSubmissions(pfd.leads);
        }
      }
    } catch {}
  };

  useEffect(() => {
    loadAllData();
  }, [companyId, industryId]);

  // Human-readable active Date & Time period label
  const activePeriodLabel = useMemo(() => {
    switch (dateRange) {
      case "today":
        return `Daily (Today · ${todayIso} 00:00 - 23:59)`;
      case "yesterday": {
        const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        return `Yesterday (${y} 00:00 - 23:59)`;
      }
      case "7d":
        return "Last 7 Days";
      case "30d":
        return "Last 30 Days";
      case "this_month":
        return `This Month (${todayIso.slice(0, 7)})`;
      case "this_quarter":
        return "This Quarter";
      case "this_year":
        return `This Year (${todayIso.slice(0, 4)})`;
      case "custom":
        return `Custom Range: ${customStartDate} ${customStartTime} → ${customEndDate} ${customEndTime}`;
      default:
        return "All Time";
    }
  }, [dateRange, todayIso, customStartDate, customStartTime, customEndDate, customEndTime]);

  const filterByDateAndTime = (items: any[]) => {
    if (dateRange === "all") return items;
    const now = new Date();
    const nowMs = now.getTime();
    const todayStr = now.toISOString().slice(0, 10);
    const yesterdayStr = new Date(nowMs - 86400000).toISOString().slice(0, 10);

    const customStartMs =
      dateRange === "custom"
        ? new Date(`${customStartDate || "1970-01-01"}T${customStartTime || "00:00"}:00`).getTime()
        : 0;
    const customEndMs =
      dateRange === "custom"
        ? new Date(`${customEndDate || "2099-12-31"}T${customEndTime || "23:59"}:59`).getTime()
        : Number.MAX_SAFE_INTEGER;

    return items.filter((item) => {
      const rawDt =
        item.createdAt ||
        item.created_at ||
        item.date ||
        item.payment_date ||
        item.lastCalledAt ||
        item.submittedAt ||
        item.startDate ||
        item.timestamp;
      if (!rawDt) return true;

      const dtStr = String(rawDt);
      const dayPart = dtStr.slice(0, 10);
      const parsedMs = new Date(dtStr.length === 10 ? `${dtStr}T12:00:00` : dtStr).getTime();

      if (dateRange === "today") return dayPart === todayStr;
      if (dateRange === "yesterday") return dayPart === yesterdayStr;
      if (dateRange === "this_month") return dayPart.slice(0, 7) === todayStr.slice(0, 7);
      if (dateRange === "this_year") return dayPart.slice(0, 4) === todayStr.slice(0, 4);

      if (Number.isNaN(parsedMs)) return true;

      if (dateRange === "7d") return nowMs - parsedMs <= 7 * 86400000;
      if (dateRange === "30d") return nowMs - parsedMs <= 30 * 86400000;
      if (dateRange === "this_quarter") return nowMs - parsedMs <= 90 * 86400000;
      if (dateRange === "custom") {
        return parsedMs >= customStartMs && parsedMs <= customEndMs;
      }
      return true;
    });
  };

  // Filtered views
  const fSales = useMemo(
    () => filterByDateAndTime(salesOrders),
    [salesOrders, dateRange, customStartDate, customStartTime, customEndDate, customEndTime]
  );
  const fInvoices = useMemo(
    () => filterByDateAndTime(invoices),
    [invoices, dateRange, customStartDate, customStartTime, customEndDate, customEndTime]
  );
  const fBills = useMemo(
    () => filterByDateAndTime(bills),
    [bills, dateRange, customStartDate, customStartTime, customEndDate, customEndTime]
  );
  const fPurchases = useMemo(
    () => filterByDateAndTime(purchaseOrders),
    [purchaseOrders, dateRange, customStartDate, customStartTime, customEndDate, customEndTime]
  );
  const fCrm = useMemo(
    () => filterByDateAndTime(crmLeads),
    [crmLeads, dateRange, customStartDate, customStartTime, customEndDate, customEndTime]
  );
  const fCallLeads = useMemo(
    () => filterByDateAndTime(callLeads),
    [callLeads, dateRange, customStartDate, customStartTime, customEndDate, customEndTime]
  );
  const fTickets = useMemo(
    () => filterByDateAndTime(tickets),
    [tickets, dateRange, customStartDate, customStartTime, customEndDate, customEndTime]
  );
  const fAttendances = useMemo(
    () => filterByDateAndTime(attendances),
    [attendances, dateRange, customStartDate, customStartTime, customEndDate, customEndTime]
  );
  const fLeaves = useMemo(
    () => filterByDateAndTime(leaves),
    [leaves, dateRange, customStartDate, customStartTime, customEndDate, customEndTime]
  );
  const fVariableEntries = useMemo(
    () => filterByDateAndTime(variableEntries),
    [variableEntries, dateRange, customStartDate, customStartTime, customEndDate, customEndTime]
  );
  const fPublicSubmissions = useMemo(
    () => filterByDateAndTime(publicFormSubmissions),
    [publicFormSubmissions, dateRange, customStartDate, customStartTime, customEndDate, customEndTime]
  );

  // Core KPIs
  const totalSalesRev =
    fSales.reduce((s, o) => s + (Number(o.amount_total ?? o.total ?? o.amount) || 0), 0) +
    fInvoices.filter((i) => i.status !== "void").reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const totalPurchaseSpend =
    fPurchases.reduce((s, p) => s + (Number(p.amount_total ?? p.total ?? p.amount) || 0), 0) +
    fBills.filter((b) => b.status !== "void").reduce((s, b) => s + (Number(b.amount) || 0), 0);
  const totalPayrollCost = payrollRuns.reduce(
    (s, r) => s + (Number(r.total_employer_ctc ?? r.total_gross) || 0),
    0
  );
  const netProfit = totalSalesRev - totalPurchaseSpend - totalPayrollCost;

  const inventoryValue = products.reduce(
    (s, p) =>
      s +
      Number(p.qty ?? p.quantity ?? p.stock ?? 0) *
        Number(p.cost ?? p.cost_price ?? p.price ?? 0),
    0
  );
  const lowStockCount = products.filter(
    (p) => Number(p.qty ?? p.quantity ?? p.stock ?? 0) <= Number(p.reorder_point ?? 5)
  ).length;

  const wonDeals = fCrm.filter((l) => (l.status || "").toLowerCase() === "won");
  const crmPipelineVal = fCrm.reduce((s, l) => s + (Number(l.expected_revenue) || 0), 0);

  // Call Center AHT & Contact Metrics
  const totalCalls = fCallLeads.reduce((s, l) => s + (Number(l.callsCount) || 0), 0);
  const contactedLeads = fCallLeads.filter(
    (l) => (l.callsCount || 0) > 0 || (l.disposition && l.disposition !== "New")
  ).length;
  const contactRate = fCallLeads.length > 0 ? Math.round((contactedLeads / fCallLeads.length) * 100) : 0;
  const callQualified = fCallLeads.filter(
    (l) => l.disposition === "Qualified" || l.disposition === "Closed Won"
  ).length;
  const avgHandleTimeSec = useMemo(() => {
    const timed = fCallLeads.filter((l) => Number(l.callDurationSec || l.call_duration_sec || 0) > 0);
    if (timed.length === 0) return totalCalls > 0 ? 185 : 0;
    return Math.round(
      timed.reduce((s, l) => s + Number(l.callDurationSec || l.call_duration_sec || 0), 0) /
        timed.length
    );
  }, [fCallLeads, totalCalls]);
  const ahtFormatted = `${String(Math.floor(avgHandleTimeSec / 60)).padStart(2, "0")}:${String(
    avgHandleTimeSec % 60
  ).padStart(2, "0")}`;

  // Custom Report Dataset
  const customReportData = useMemo(() => {
    switch (customSource) {
      case "sales":
        return [
          {
            name: "Sales/POS Orders",
            value: fSales.reduce((s, x) => s + (Number(x.amount_total ?? x.total ?? x.amount) || 0), 0),
          },
          {
            name: "Invoices",
            value: fInvoices.reduce((s, x) => s + (Number(x.amount) || 0), 0),
          },
          {
            name: "CRM Won",
            value: wonDeals.reduce((s, x) => s + (Number(x.expected_revenue) || 0), 0),
          },
        ];
      case "purchases":
        return [
          {
            name: "Purchase Orders",
            value: fPurchases.reduce((s, x) => s + (Number(x.amount_total ?? x.amount) || 0), 0),
          },
          {
            name: "Vendor Bills",
            value: fBills.reduce((s, x) => s + (Number(x.amount) || 0), 0),
          },
        ];
      case "inventory":
        return products.slice(0, 12).map((p) => ({
          name: p.name || p.sku || "SKU",
          value:
            Number(p.qty ?? p.quantity ?? p.stock ?? 0) *
            Number(p.cost ?? p.cost_price ?? p.price ?? 1),
        }));
      case "crm":
        return ["New", "Qualified", "Proposition", "Won", "Lost"].map((st) => ({
          name: st,
          value: fCrm.filter((l) => (l.status || "").toLowerCase() === st.toLowerCase()).length,
        }));
      case "hr":
        return [
          { name: "Active Staff", value: employees.filter((e) => e.status !== "Terminated").length },
          { name: "Approved Leaves", value: fLeaves.filter((l) => l.status === "Approved").length },
          { name: "OT/Bonus Entries", value: fVariableEntries.length },
          { name: "Payroll Batches", value: payrollRuns.length },
        ];
      case "call_center":
        return ["New", "Callback", "Qualified", "Closed Won", "DNC"].map((d) => ({
          name: d,
          value: fCallLeads.filter((l) => l.disposition === d).length,
        }));
      case "projects":
        return projects.slice(0, 10).map((pr) => ({
          name: pr.name || "Project",
          value: Number(pr.budget || pr.progress || 1),
        }));
      case "manufacturing":
        return [...mrpOrders, ...workOrders].slice(0, 10).map((mo) => ({
          name: mo.product || mo.name || mo.ref || "MO",
          value: Number(mo.qty || mo.quantity || 1),
        }));
      case "public_forms":
        return [
          { name: "Total Form Leads", value: fPublicSubmissions.length },
          {
            name: "With Carrier",
            value: fPublicSubmissions.filter((l) => Boolean(l.carrier)).length,
          },
          {
            name: "Assigned to Agent",
            value: fPublicSubmissions.filter((l) => Boolean(l.assignedTo)).length,
          },
        ];
    }
  }, [
    customSource,
    fSales,
    fInvoices,
    wonDeals,
    fPurchases,
    fBills,
    products,
    fCrm,
    employees,
    fLeaves,
    fVariableEntries,
    payrollRuns,
    fCallLeads,
    projects,
    mrpOrders,
    workOrders,
    fPublicSubmissions,
  ]);

  // ─── STRUCTURED REPORT REGISTRY FOR EVERY SPECIFIC REPORT ───
  const buildSpecificReportSpec = (reportKey: string): ReportDocumentData & { filename: string; rawJson: any[] } => {
    const periodNote = `${companyName} • Period: ${activePeriodLabel}`;

    switch (reportKey) {
      case "sales": {
        const combined = [...fSales, ...fInvoices];
        const headers = ["Ref / Receipt #", "Date & Time", "Customer", "Channel / Payment", "Status", `Amount (${currencySymbol})`];
        const rows: (string | number)[][] =
          combined.length > 0
            ? combined.map((r) => [
                r.name || r.number || r.id || "ORD",
                r.createdAt || r.created_at || r.date || todayIso,
                r.customer || r.customer_name || "Walk-in / Client",
                r.paymentMethod || r.orderType || r.channel || "Standard",
                r.state || r.status || "Confirmed",
                Number(r.amount_total ?? r.total ?? r.amount ?? 0),
              ])
            : [["—", todayIso, "No sales records in selected date/time range", "—", "—", 0]];
        return {
          filename: `Sales_POS_Report_${companyName.replace(/\s+/g, "_")}_${todayIso}`,
          title: "Sales, Quotations & POS Revenue Report",
          subtitle: periodNote,
          summaryCards: [
            { label: "Total Orders", value: String(fSales.length) },
            { label: "Invoices Issued", value: String(fInvoices.length) },
            { label: "Total Revenue", value: `${currencySymbol}${totalSalesRev.toLocaleString()}` },
          ],
          headers,
          rows,
          rawJson: combined,
        };
      }

      case "inventory": {
        const headers = ["SKU / Code", "Product Name", "Category", "Qty On Hand", `Unit Cost (${currencySymbol})`, `Total Valuation (${currencySymbol})`];
        const rows: (string | number)[][] =
          products.length > 0
            ? products.map((p) => {
                const q = Number(p.qty ?? p.quantity ?? p.stock ?? 0);
                const c = Number(p.cost ?? p.cost_price ?? p.price ?? 0);
                return [p.sku || p.barcode || p.id || "SKU", p.name || "Product", p.category || "General", q, c, q * c];
              })
            : [["—", "No inventory products recorded yet", "—", 0, 0, 0]];
        return {
          filename: `Inventory_Valuation_Report_${companyName.replace(/\s+/g, "_")}_${todayIso}`,
          title: "Inventory Valuation, Warehouses & Stock Alerts Report",
          subtitle: periodNote,
          summaryCards: [
            { label: "Total SKUs", value: String(products.length) },
            { label: "Low Stock Alerts", value: String(lowStockCount) },
            { label: "Total Valuation", value: `${currencySymbol}${inventoryValue.toLocaleString()}` },
          ],
          headers,
          rows,
          rawJson: { products, warehouses, stockOps } as any,
        };
      }

      case "purchases": {
        const combined = [...fPurchases, ...fBills];
        const headers = ["PO / Bill Ref", "Date", "Vendor / Supplier", "Status", `Amount (${currencySymbol})`];
        const rows: (string | number)[][] =
          combined.length > 0
            ? combined.map((b) => [
                b.name || b.number || b.id || "PO",
                b.createdAt || b.created_at || b.date || todayIso,
                b.vendor || b.vendor_name || "Supplier",
                b.state || b.status || "Open",
                Number(b.amount_total ?? b.total ?? b.amount ?? 0),
              ])
            : [["—", todayIso, "No purchase orders or vendor bills in selected range", "—", 0]];
        return {
          filename: `Purchases_Vendor_Spend_Report_${companyName.replace(/\s+/g, "_")}_${todayIso}`,
          title: "Purchases, RFQs & Vendor Spend Report",
          subtitle: periodNote,
          summaryCards: [
            { label: "POs & RFQs", value: String(fPurchases.length) },
            { label: "Vendor Bills", value: String(fBills.length) },
            { label: "Total Spend", value: `${currencySymbol}${totalPurchaseSpend.toLocaleString()}` },
          ],
          headers,
          rows,
          rawJson: combined,
        };
      }

      case "finance": {
        const headers = ["Financial Statement Line", "Category", "Period", `Amount (${currencySymbol})`];
        const rows: (string | number)[][] = [
          ["Gross Sales & POS Revenue", "Income", activePeriodLabel, totalSalesRev],
          ["Purchases & Vendor Bills", "COGS / Operating Expense", activePeriodLabel, -totalPurchaseSpend],
          ["Employee Payroll & Employer CTC", "Workforce Expense", activePeriodLabel, -totalPayrollCost],
          ["Net Profit / (Loss)", "Bottom Line", activePeriodLabel, netProfit],
        ];
        return {
          filename: `Finance_Profit_Loss_Report_${companyName.replace(/\s+/g, "_")}_${todayIso}`,
          title: "Overall Finance (Profit & Loss Statement)",
          subtitle: periodNote,
          summaryCards: [
            { label: "Gross Revenue", value: `${currencySymbol}${totalSalesRev.toLocaleString()}` },
            { label: "Purchases & Bills", value: `${currencySymbol}${totalPurchaseSpend.toLocaleString()}` },
            { label: "Payroll CTC", value: `${currencySymbol}${totalPayrollCost.toLocaleString()}` },
            { label: "Net Profit", value: `${currencySymbol}${netProfit.toLocaleString()}` },
          ],
          headers,
          rows,
          rawJson: rows.map((r) => ({ Line: r[0], Category: r[1], Period: r[2], Amount: r[3] })),
        };
      }

      case "hr_payroll": {
        const headers = ["Employee Name", "Department", "Role / Designation", "Status", `Annual Salary (${currencySymbol})`];
        const rows: (string | number)[][] =
          employees.length > 0
            ? employees.map((e) => [
                e.name || "Employee",
                e.department || "General",
                e.role || "Staff",
                e.status || "Active",
                Number(e.annualSalary ?? e.salary ?? 0),
              ])
            : [["No employees recorded", "—", "—", "—", 0]];
        return {
          filename: `Employees_Payroll_Report_${companyName.replace(/\s+/g, "_")}_${todayIso}`,
          title: "Employees Master & Payroll Cost Report",
          subtitle: periodNote,
          summaryCards: [
            { label: "Headcount", value: String(employees.length) },
            { label: "Payroll Batches", value: String(payrollRuns.length) },
            { label: "Employer CTC", value: `${currencySymbol}${totalPayrollCost.toLocaleString()}` },
          ],
          headers,
          rows,
          rawJson: { employees, payrollRuns } as any,
        };
      }

      case "attendance": {
        const headers = ["Employee Name", "Record Type", "Date / Details", "Hours / Days", "Status"];
        const rows: (string | number)[][] = [
          ...fAttendances.map((a) => [
            a.employeeName || a.name || "Employee",
            "Attendance Check-In",
            a.date || a.checkIn || todayIso,
            a.hours || "8h",
            a.status || "Present",
          ]),
          ...fLeaves.map((lv) => [
            lv.employeeName || "Employee",
            `Leave (${lv.type || "Paid"})`,
            lv.startDate || todayIso,
            `${lv.days || 1} day(s)`,
            lv.status || "Approved",
          ]),
          ...fVariableEntries.map((v) => [
            v.employeeName || "Employee",
            v.category || "Overtime / Bonus",
            v.date || todayIso,
            `${v.hours ? `${v.hours} hrs · ` : ""}${currencySymbol}${v.amount || 0}`,
            v.status || "Approved",
          ]),
        ];
        if (rows.length === 0) {
          rows.push(["No attendance, leave, or overtime records in selected range", "—", todayIso, "—", "—"]);
        }
        return {
          filename: `Attendance_Leave_Overtime_Report_${companyName.replace(/\s+/g, "_")}_${todayIso}`,
          title: "Employee Attendance, Leave & Overtime Report",
          subtitle: periodNote,
          summaryCards: [
            { label: "Attendance Logs", value: String(fAttendances.length) },
            { label: "Leave Requests", value: String(fLeaves.length) },
            { label: "Overtime & Bonus", value: String(fVariableEntries.length) },
          ],
          headers,
          rows,
          rawJson: { attendances: fAttendances, leaves: fLeaves, variableEntries: fVariableEntries } as any,
        };
      }

      case "crm": {
        const headers = ["Deal / Lead Name", "Contact / Email", "Phone", "Stage", "Probability %", `Expected Revenue (${currencySymbol})`];
        const rows: (string | number)[][] =
          fCrm.length > 0
            ? fCrm.map((l) => [
                l.name || "Deal",
                l.email_from || l.contact_name || "—",
                l.phone || "—",
                l.status || "New",
                Number(l.probability || 0),
                Number(l.expected_revenue || 0),
              ])
            : [["No CRM deals in selected date/time range", "—", "—", "—", 0, 0]];
        return {
          filename: `CRM_Pipeline_Report_${companyName.replace(/\s+/g, "_")}_${todayIso}`,
          title: "CRM Pipeline & Deal Conversion Report",
          subtitle: periodNote,
          summaryCards: [
            { label: "Total Deals", value: String(fCrm.length) },
            { label: "Won Deals", value: String(wonDeals.length) },
            { label: "Pipeline Value", value: `${currencySymbol}${crmPipelineVal.toLocaleString()}` },
          ],
          headers,
          rows,
          rawJson: fCrm,
        };
      }

      case "helpdesk": {
        const headers = ["Ticket ID", "Subject", "Customer", "Priority", "Status", "Created At"];
        const rows: (string | number)[][] =
          fTickets.length > 0
            ? fTickets.map((t) => [
                t.id || "TKT",
                t.subject || t.title || "Support Request",
                t.customer || t.email || "Client",
                t.priority || "Normal",
                t.status || "Open",
                t.createdAt || t.created_at || todayIso,
              ])
            : [["—", "No helpdesk tickets in selected range", "—", "—", "—", todayIso]];
        return {
          filename: `Helpdesk_SLA_Report_${companyName.replace(/\s+/g, "_")}_${todayIso}`,
          title: "Helpdesk & SLA Customer Support Report",
          subtitle: periodNote,
          summaryCards: [
            { label: "Total Tickets", value: String(fTickets.length) },
            {
              label: "Resolved",
              value: String(fTickets.filter((t) => t.status === "resolved" || t.status === "closed").length),
            },
            {
              label: "Open",
              value: String(fTickets.filter((t) => t.status !== "resolved" && t.status !== "closed").length),
            },
          ],
          headers,
          rows,
          rawJson: fTickets,
        };
      }

      case "industry_ops": {
        const headers = ["Module / Type", "Reference / Lead Name", "Campaign / Product", "Status / Disposition", "Calls / Qty", "Agent / Owner"];
        const rows: (string | number)[][] = [
          ...fCallLeads.map((cl) => [
            "Call Center Lead",
            cl.name || "Lead",
            cl.campaign || cl.carrier || "General",
            cl.disposition || "New",
            Number(cl.callsCount || 0),
            cl.assignedTo || "Unassigned",
          ]),
          ...mrpOrders.map((mo) => [
            "Manufacturing MO",
            mo.ref || mo.id || "MO",
            mo.product || mo.name || "Product",
            mo.status || "In Progress",
            Number(mo.qty || mo.quantity || 1),
            mo.responsible || "Production",
          ]),
          ...workOrders.map((wo) => [
            "Shop Floor Work Order",
            wo.ref || wo.id || "WO",
            wo.operation || wo.product || "Operation",
            wo.status || "Pending",
            wo.duration || "00:00",
            wo.workCenter || "Assembly",
          ]),
          ...projects.map((pr) => [
            "Project",
            pr.id || "PRJ",
            pr.name || "Project",
            pr.status || "Active",
            Number(pr.budget || 0),
            pr.manager || "PM",
          ]),
        ];
        if (rows.length === 0) {
          rows.push(["Operations", "No operational records in selected range", "—", "—", 0, "—"]);
        }
        return {
          filename: `Industry_Operations_AHT_Report_${companyName.replace(/\s+/g, "_")}_${todayIso}`,
          title: "Call Center AHT, Manufacturing (MRP/BOM) & Projects Report",
          subtitle: periodNote,
          summaryCards: [
            { label: "Call Center AHT", value: ahtFormatted },
            { label: "Contact Rate", value: `${contactRate}% (${callQualified} Qualified)` },
            { label: "Active Campaigns", value: String(campaigns.length) },
            { label: "MRP & Projects", value: `${mrpOrders.length + workOrders.length} MRP · ${projects.length} Prj` },
          ],
          headers,
          rows,
          rawJson: { callLeads: fCallLeads, campaigns, mrpOrders, mrpBoms, workOrders, projects } as any,
        };
      }

      case "public_forms": {
        const headers = ["Submission ID", "Submitted At", "Full Name", "Phone", "Email", "Carrier / Campaign", "Assigned Agent"];
        const rows: (string | number)[][] =
          fPublicSubmissions.length > 0
            ? fPublicSubmissions.map((s) => [
                s.id || "SUB",
                s.submittedAt || s.createdAt || todayIso,
                s.name || "Applicant",
                s.phone || "—",
                s.email || "—",
                s.carrier || s.campaign || "Inbound Form",
                s.assignedTo || "Unassigned",
              ])
            : [["—", todayIso, "No public form submissions in selected range", "—", "—", "—", "—"]];
        return {
          filename: `Public_Forms_Submissions_Report_${companyName.replace(/\s+/g, "_")}_${todayIso}`,
          title: "Public Lead & Intake Forms Submissions Report",
          subtitle: periodNote,
          summaryCards: [
            { label: "Total Submissions", value: String(fPublicSubmissions.length) },
          ],
          headers,
          rows,
          rawJson: fPublicSubmissions,
        };
      }

      case "all_master": {
        const headers = ["Report Domain", "Key Metric", "Count / Volume", `Financial Total (${currencySymbol})`, "Time Period"];
        const rows: (string | number)[][] = [
          ["Sales & POS", "Orders & Invoices", fSales.length + fInvoices.length, totalSalesRev, activePeriodLabel],
          ["Purchases & Bills", "POs & Vendor Bills", fPurchases.length + fBills.length, totalPurchaseSpend, activePeriodLabel],
          ["Finance (P&L)", "Net Profit / Margin", 1, netProfit, activePeriodLabel],
          ["Inventory & Warehouses", "Active SKUs & Stock", products.length, inventoryValue, activePeriodLabel],
          ["Employees & Payroll", "Active Staff & CTC", employees.length, totalPayrollCost, activePeriodLabel],
          ["Attendance, Leave & OT", "Logged Entries", fAttendances.length + fLeaves.length + fVariableEntries.length, 0, activePeriodLabel],
          ["CRM Pipeline", "Total Deals & Pipeline", fCrm.length, crmPipelineVal, activePeriodLabel],
          ["Helpdesk & SLA", "Support Tickets", fTickets.length, 0, activePeriodLabel],
          ["Call Center & AHT", `AHT ${ahtFormatted} (${contactRate}% Contact)`, fCallLeads.length, 0, activePeriodLabel],
          ["Public Form Submissions", "Inbound Form Leads", fPublicSubmissions.length, 0, activePeriodLabel],
        ];
        return {
          filename: `Master_All_Company_Executive_Report_${companyName.replace(/\s+/g, "_")}_${todayIso}`,
          title: `Master All-Company Executive Report (${companyName})`,
          subtitle: periodNote,
          summaryCards: [
            { label: "Total Revenue", value: `${currencySymbol}${totalSalesRev.toLocaleString()}` },
            { label: "Total Purchases", value: `${currencySymbol}${totalPurchaseSpend.toLocaleString()}` },
            { label: "Net Profit", value: `${currencySymbol}${netProfit.toLocaleString()}` },
            { label: "Inventory Value", value: `${currencySymbol}${inventoryValue.toLocaleString()}` },
          ],
          headers,
          rows,
          rawJson: rows.map((r) => ({ Domain: r[0], Metric: r[1], Count: r[2], FinancialTotal: r[3], Period: r[4] })),
        };
      }

      default: {
        const headers = ["Metric / Category", "Value", "Period"];
        const rows: (string | number)[][] = customReportData.map((d) => [d.name, d.value, activePeriodLabel]);
        return {
          filename: `Custom_${customSource}_Report_${companyName.replace(/\s+/g, "_")}_${todayIso}`,
          title: `Custom ${customSource.toUpperCase()} Report`,
          subtitle: periodNote,
          summaryCards: [{ label: "Source Module", value: customSource.toUpperCase() }],
          headers,
          rows,
          rawJson: customReportData,
        };
      }
    }
  };

  // Download any specific report in Excel (.xls), CSV (.csv), PDF (Print/Save), or JSON (.json)
  const handleDownloadSpecificReport = (
    reportKey: string,
    format: "xlsx" | "csv" | "pdf" | "json"
  ) => {
    const spec = buildSpecificReportSpec(reportKey);
    if (format === "xlsx") {
      exportToExcel(spec.filename, spec.headers, spec.rows, spec.title.slice(0, 28));
      showToast(`📊 Downloaded "${spec.title}" as Excel (.xls)`);
    } else if (format === "csv") {
      exportToCSV(spec.filename, spec.headers, spec.rows);
      showToast(`📄 Downloaded "${spec.title}" as CSV (.csv)`);
    } else if (format === "pdf") {
      printReportPDF({
        title: spec.title,
        subtitle: spec.subtitle,
        dateGenerated: new Date().toLocaleString(),
        summaryCards: spec.summaryCards,
        headers: spec.headers,
        rows: spec.rows,
      });
      showToast(`🖨️ Opened "${spec.title}" formatted PDF report`);
    } else if (format === "json") {
      const blob = new Blob(
        [
          JSON.stringify(
            {
              report: spec.title,
              company: companyName,
              period: activePeriodLabel,
              generatedAt: new Date().toISOString(),
              summary: spec.summaryCards,
              headers: spec.headers,
              rows: spec.rows,
              data: spec.rawJson,
            },
            null,
            2
          ),
        ],
        { type: "application/json;charset=utf-8;" }
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${spec.filename}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(`📦 Downloaded "${spec.title}" as JSON (.json)`);
    }
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

  const SPECIFIC_REPORTS_CATALOG = [
    { id: "all_master", name: "Master All-Company Executive Summary (All Modules Combined)", badge: "Executive Bundle" },
    { id: "sales", name: "Sales Orders, Quotations & POS Revenue Report", badge: "Sales & POS" },
    { id: "inventory", name: "Inventory Valuation, Warehouses & Low-Stock Alerts Report", badge: "Inventory" },
    { id: "purchases", name: "Purchases, RFQs & Vendor Bills Spend Report", badge: "Procurement" },
    { id: "finance", name: "Overall Finance (Profit & Loss Statement)", badge: "Finance P&L" },
    { id: "hr_payroll", name: "Employees Master Directory & Payroll CTC Report", badge: "HR & Payroll" },
    { id: "attendance", name: "Employee Attendance, Leaves & Overtime Report", badge: "Attendance & OT" },
    { id: "crm", name: "CRM Pipeline, Stages & Won Deals Report", badge: "CRM" },
    { id: "helpdesk", name: "Helpdesk Tickets & SLA Resolution Report", badge: "Support SLA" },
    { id: "industry_ops", name: "Call Center AHT, Campaigns, Manufacturing (MRP/BOM) & Projects Report", badge: "Operations & AHT" },
    { id: "public_forms", name: "Public Lead & Intake Forms Submissions Report", badge: "Public Forms" },
    { id: "custom_builder", name: `Custom Ad-Hoc Report (${customSource.toUpperCase()})`, badge: "Custom Builder" },
  ];

  // Inline Per-Section Download Action Bar so user can download the exact active report right inside its card
  const renderSectionDownloadBar = (reportKey: string, label: string) => (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mr-1">
        Download {label}:
      </span>
      <button
        type="button"
        onClick={() => handleDownloadSpecificReport(reportKey, "xlsx")}
        className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/35 border border-emerald-500/35 text-emerald-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition"
      >
        <FileSpreadsheet size={12} /> Excel
      </button>
      <button
        type="button"
        onClick={() => handleDownloadSpecificReport(reportKey, "csv")}
        className="px-2.5 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/35 border border-cyan-500/35 text-cyan-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition"
      >
        <Download size={12} /> CSV
      </button>
      <button
        type="button"
        onClick={() => handleDownloadSpecificReport(reportKey, "pdf")}
        className="px-2.5 py-1.5 rounded-lg bg-purple-600/25 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition"
      >
        <Printer size={12} /> PDF
      </button>
      <button
        type="button"
        onClick={() => handleDownloadSpecificReport(reportKey, "json")}
        className="px-2.5 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/35 border border-amber-500/35 text-amber-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition"
      >
        <FileJson size={12} /> JSON
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0d14] text-white flex flex-col">
      <AppHeader />

      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-[#1E293B] border border-purple-500/40 text-purple-200 px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 shadow-2xl">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* Header Bar */}
        <div className="beraxis-glass-hero p-5 sm:p-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-purple-300 mb-1">
                <BarChart3 size={14} /> Enterprise Reporting &amp; BI · {companyName}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                All-Company Reports &amp; Analytics
              </h1>
              <p className="text-xs text-gray-300 mt-1">
                Filter by any preset or <strong className="text-cyan-300">Custom Date &amp; Time Range</strong>, and download any specific report in <strong className="text-emerald-300">Excel, CSV, PDF, or JSON</strong>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as DatePreset)}
                className="px-3 py-2 rounded-xl bg-[#0B1022] border border-cyan-500/30 text-xs font-bold text-cyan-300 outline-none cursor-pointer"
              >
                <option value="today">Daily (Today)</option>
                <option value="yesterday">Yesterday</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="this_month">This Month</option>
                <option value="this_quarter">This Quarter (90d)</option>
                <option value="this_year">This Year</option>
                <option value="all">All Time</option>
                <option value="custom">Custom Date &amp; Time Range...</option>
              </select>

              <button
                type="button"
                onClick={() => setDateRange("custom")}
                className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
                  dateRange === "custom"
                    ? "bg-cyan-600 text-white border-cyan-400 shadow-lg shadow-cyan-600/30"
                    : "bg-white/10 hover:bg-white/15 border-white/15 text-cyan-200"
                }`}
              >
                <Calendar size={13} /> Custom Date &amp; Time
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedReportId(activeTab);
                  setIsDownloadModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-purple-600/30 cursor-pointer"
              >
                <FolderDown size={14} /> Download Specific Report
              </button>

              <button
                type="button"
                onClick={loadAllData}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={13} /> Refresh
              </button>

              <button
                type="button"
                onClick={() => handleDownloadSpecificReport(activeTab, "xlsx")}
                className="px-3 py-2 rounded-xl bg-emerald-600/25 hover:bg-emerald-600/35 border border-emerald-500/35 text-emerald-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet size={13} /> Excel
              </button>
              <button
                type="button"
                onClick={() => handleDownloadSpecificReport(activeTab, "csv")}
                className="px-3 py-2 rounded-xl bg-cyan-600/25 hover:bg-cyan-600/35 border border-cyan-500/35 text-cyan-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={13} /> CSV
              </button>
              <button
                type="button"
                onClick={() => handleDownloadSpecificReport(activeTab, "pdf")}
                className="px-3 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/45 border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer size={13} /> PDF
              </button>
            </div>
          </div>

          {/* Custom Date & Time Picker Bar (Always accessible when "Custom Date & Time" is selected) */}
          {dateRange === "custom" && (
            <div className="p-4 rounded-2xl bg-[#0B1022]/90 border border-cyan-500/40 flex flex-wrap items-end justify-between gap-3 animate-in fade-in">
              <div className="flex flex-wrap items-end gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-cyan-300 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-cyan-300 mb-1">
                    From Time
                  </label>
                  <input
                    type="time"
                    value={customStartTime}
                    onChange={(e) => setCustomStartTime(e.target.value)}
                    className="bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <span className="text-gray-400 font-bold pb-2">→</span>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-cyan-300 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-cyan-300 mb-1">
                    To Time
                  </label>
                  <input
                    type="time"
                    value={customEndTime}
                    onChange={(e) => setCustomEndTime(e.target.value)}
                    className="bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/25 px-3 py-1.5 rounded-xl">
                  Active Window: {customStartDate} {customStartTime} to {customEndDate} {customEndTime}
                </span>
                <button
                  type="button"
                  onClick={() => setDateRange("all")}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-gray-300 cursor-pointer"
                >
                  Reset to All Time
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Executive Cross-Module KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="beraxis-glass-dock p-4">
            <div className="text-[10px] font-bold uppercase text-gray-400">Revenue</div>
            <div className="text-xl font-black text-emerald-400 mt-1">
              {currencySymbol}
              {totalSalesRev.toLocaleString()}
            </div>
          </div>
          <div className="beraxis-glass-dock p-4">
            <div className="text-[10px] font-bold uppercase text-gray-400">Purchases &amp; Bills</div>
            <div className="text-xl font-black text-amber-400 mt-1">
              {currencySymbol}
              {totalPurchaseSpend.toLocaleString()}
            </div>
          </div>
          <div className="beraxis-glass-dock p-4">
            <div className="text-[10px] font-bold uppercase text-gray-400">Net Profit</div>
            <div
              className={`text-xl font-black mt-1 ${
                netProfit >= 0 ? "text-cyan-400" : "text-rose-400"
              }`}
            >
              {currencySymbol}
              {netProfit.toLocaleString()}
            </div>
          </div>
          <div className="beraxis-glass-dock p-4">
            <div className="text-[10px] font-bold uppercase text-gray-400">Inventory Value</div>
            <div className="text-xl font-black text-purple-400 mt-1">
              {currencySymbol}
              {inventoryValue.toLocaleString()}
            </div>
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
                  activeTab === t.id
                    ? "bg-purple-600 text-white shadow-md"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
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
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-black text-white">
                    Sales, Quotations &amp; POS Revenue Report
                  </h2>
                  <p className="text-[11px] text-gray-400">{activePeriodLabel}</p>
                </div>
                {renderSectionDownloadBar("sales", "Sales & POS Report")}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-gray-400">Total Orders</div>
                  <div className="text-lg font-black text-white">{fSales.length}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-gray-400">Invoices Issued</div>
                  <div className="text-lg font-black text-cyan-400">{fInvoices.length}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-gray-400">Total Revenue</div>
                  <div className="text-lg font-black text-emerald-400">
                    {currencySymbol}
                    {totalSalesRev.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-gray-400">Avg Order Value</div>
                  <div className="text-lg font-black text-purple-400">
                    {currencySymbol}
                    {fSales.length > 0 ? Math.round(totalSalesRev / fSales.length).toLocaleString() : 0}
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px]">
                      <th className="py-2 px-3">Ref</th>
                      <th className="py-2 px-3">Date / Time</th>
                      <th className="py-2 px-3">Customer</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[...fSales, ...fInvoices].slice(0, 25).map((row, idx) => (
                      <tr key={row.id || idx}>
                        <td className="py-2.5 px-3 font-mono text-purple-300">
                          {row.name || row.number || row.id}
                        </td>
                        <td className="py-2.5 px-3 text-gray-400 font-mono text-[11px]">
                          {String(row.createdAt || row.created_at || row.date || todayIso).replace("T", " ").slice(0, 16)}
                        </td>
                        <td className="py-2.5 px-3 text-white">
                          {row.customer || row.customer_name || "Walk-in / Client"}
                        </td>
                        <td className="py-2.5 px-3 text-gray-300">
                          {row.state || row.status || "confirmed"}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                          {currencySymbol}
                          {Number(row.amount_total ?? row.total ?? row.amount ?? 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {fSales.length === 0 && fInvoices.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-400">
                          No sales or invoice records in this date &amp; time range.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "inventory" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-black text-white">
                    Inventory Valuation &amp; Stock Alerts
                  </h2>
                  <p className="text-[11px] text-gray-400">{activePeriodLabel}</p>
                </div>
                {renderSectionDownloadBar("inventory", "Inventory Report")}
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-gray-400">Total SKUs</div>
                  <div className="text-lg font-black text-white">{products.length}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-gray-400">Low Stock Alerts</div>
                  <div className="text-lg font-black text-amber-400">{lowStockCount}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-gray-400">Valuation</div>
                  <div className="text-lg font-black text-emerald-400">
                    {currencySymbol}
                    {inventoryValue.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px]">
                      <th className="py-2 px-3">SKU / Product</th>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3 text-right">Qty On Hand</th>
                      <th className="py-2 px-3 text-right">Unit Cost</th>
                      <th className="py-2 px-3 text-right">Total Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {products.slice(0, 25).map((p, idx) => {
                      const q = Number(p.qty ?? p.quantity ?? p.stock ?? 0);
                      const c = Number(p.cost ?? p.cost_price ?? p.price ?? 0);
                      return (
                        <tr key={p.id || idx}>
                          <td className="py-2.5 px-3 font-bold text-white">{p.name || p.sku}</td>
                          <td className="py-2.5 px-3 text-gray-300">{p.category || "General"}</td>
                          <td
                            className={`py-2.5 px-3 text-right font-bold ${
                              q <= 5 ? "text-amber-400" : "text-cyan-300"
                            }`}
                          >
                            {q}
                          </td>
                          <td className="py-2.5 px-3 text-right text-gray-300">
                            {currencySymbol}
                            {c.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                            {currencySymbol}
                            {(q * c).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                    {products.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-400">
                          No inventory products recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "purchases" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-black text-white">
                    Purchases, RFQs &amp; Vendor Spend Report
                  </h2>
                  <p className="text-[11px] text-gray-400">{activePeriodLabel}</p>
                </div>
                {renderSectionDownloadBar("purchases", "Purchases Report")}
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-gray-400">POs &amp; RFQs</div>
                  <div className="text-lg font-black text-white">{fPurchases.length}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-gray-400">Vendor Bills</div>
                  <div className="text-lg font-black text-cyan-400">{fBills.length}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-gray-400">Total Procurement</div>
                  <div className="text-lg font-black text-amber-400">
                    {currencySymbol}
                    {totalPurchaseSpend.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px]">
                      <th className="py-2 px-3">Ref</th>
                      <th className="py-2 px-3">Vendor</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[...fPurchases, ...fBills].slice(0, 20).map((b, idx) => (
                      <tr key={b.id || idx}>
                        <td className="py-2.5 px-3 font-mono text-amber-300">
                          {b.name || b.number || b.id}
                        </td>
                        <td className="py-2.5 px-3 text-white">
                          {b.vendor || b.vendor_name || "Supplier"}
                        </td>
                        <td className="py-2.5 px-3 text-gray-300">
                          {b.state || b.status || "open"}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-amber-400">
                          {currencySymbol}
                          {Number(b.amount_total ?? b.amount ?? 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {fPurchases.length === 0 && fBills.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-400">
                          No purchase orders or vendor bills in this date &amp; time range.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "finance" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-black text-white">
                    Overall Finance (Profit &amp; Loss Statement)
                  </h2>
                  <p className="text-[11px] text-gray-400">{activePeriodLabel}</p>
                </div>
                {renderSectionDownloadBar("finance", "Finance P&L Report")}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                  <div className="text-gray-300">Gross Revenue</div>
                  <div className="text-2xl font-black text-emerald-400 mt-1">
                    {currencySymbol}
                    {totalSalesRev.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25">
                  <div className="text-gray-300">Operating &amp; Purchases</div>
                  <div className="text-2xl font-black text-amber-400 mt-1">
                    -{currencySymbol}
                    {totalPurchaseSpend.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/25">
                  <div className="text-gray-300">Payroll &amp; Employer CTC</div>
                  <div className="text-2xl font-black text-purple-300 mt-1">
                    -{currencySymbol}
                    {totalPayrollCost.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/25">
                  <div className="text-gray-300">Net Profit / Margin</div>
                  <div
                    className={`text-2xl font-black mt-1 ${
                      netProfit >= 0 ? "text-cyan-300" : "text-rose-400"
                    }`}
                  >
                    {currencySymbol}
                    {netProfit.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "hr_payroll" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-black text-white">
                    Employees Master &amp; Payroll Cost Report
                  </h2>
                  <p className="text-[11px] text-gray-400">{activePeriodLabel}</p>
                </div>
                {renderSectionDownloadBar("hr_payroll", "HR & Payroll Report")}
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-gray-400">Headcount</div>
                  <div className="text-lg font-black text-white">{employees.length}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-gray-400">Payroll Batches</div>
                  <div className="text-lg font-black text-cyan-400">{payrollRuns.length}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-gray-400">Total Employer CTC</div>
                  <div className="text-lg font-black text-emerald-400">
                    {currencySymbol}
                    {totalPayrollCost.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px]">
                      <th className="py-2 px-3">Employee</th>
                      <th className="py-2 px-3">Department</th>
                      <th className="py-2 px-3">Role</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3 text-right">Annual Salary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {employees.map((e, idx) => (
                      <tr key={e.id || idx}>
                        <td className="py-2.5 px-3 font-bold text-white">{e.name}</td>
                        <td className="py-2.5 px-3 text-gray-300">{e.department}</td>
                        <td className="py-2.5 px-3 text-gray-300">{e.role}</td>
                        <td className="py-2.5 px-3 text-emerald-400">{e.status || "Active"}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-cyan-300">
                          {currencySymbol}
                          {Number(e.annualSalary ?? e.salary ?? 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {employees.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-400">
                          No employees found. Add staff in /payroll or /employees.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "attendance" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-black text-white">
                    Employee Attendance, Leave &amp; Overtime Report
                  </h2>
                  <p className="text-[11px] text-gray-400">{activePeriodLabel}</p>
                </div>
                {renderSectionDownloadBar("attendance", "Attendance & OT Report")}
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-gray-400">Attendance Logs</div>
                  <div className="text-lg font-black text-white">{fAttendances.length}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-gray-400">Leave Requests</div>
                  <div className="text-lg font-black text-purple-400">{fLeaves.length}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-gray-400">Overtime &amp; Bonus Items</div>
                  <div className="text-lg font-black text-cyan-400">{fVariableEntries.length}</div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px]">
                      <th className="py-2 px-3">Employee</th>
                      <th className="py-2 px-3">Type</th>
                      <th className="py-2 px-3">Details</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {fLeaves.map((lv) => (
                      <tr key={lv.id}>
                        <td className="py-2.5 px-3 font-bold text-white">{lv.employeeName}</td>
                        <td className="py-2.5 px-3 text-purple-300">{lv.type}</td>
                        <td className="py-2.5 px-3 text-gray-300">
                          {lv.days} day(s) ({lv.startDate})
                        </td>
                        <td className="py-2.5 px-3 text-emerald-400">{lv.status}</td>
                      </tr>
                    ))}
                    {fVariableEntries.map((v) => (
                      <tr key={v.id}>
                        <td className="py-2.5 px-3 font-bold text-white">{v.employeeName}</td>
                        <td className="py-2.5 px-3 text-cyan-300">{v.category}</td>
                        <td className="py-2.5 px-3 text-gray-300">
                          {v.hours ? `${v.hours} hrs · ` : ""}
                          {currencySymbol}
                          {v.amount}
                        </td>
                        <td className="py-2.5 px-3 text-amber-400">{v.status}</td>
                      </tr>
                    ))}
                    {fLeaves.length === 0 &&
                      fVariableEntries.length === 0 &&
                      fAttendances.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-gray-400">
                            No attendance, leave, or overtime records in this date &amp; time range.
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "crm" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-black text-white">
                    CRM Pipeline &amp; Conversion Report
                  </h2>
                  <p className="text-[11px] text-gray-400">{activePeriodLabel}</p>
                </div>
                {renderSectionDownloadBar("crm", "CRM Pipeline Report")}
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-gray-400">Total Deals</div>
                  <div className="text-lg font-black text-white">{fCrm.length}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-gray-400">Won Deals</div>
                  <div className="text-lg font-black text-emerald-400">{wonDeals.length}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-gray-400">Pipeline Value</div>
                  <div className="text-lg font-black text-purple-400">
                    {currencySymbol}
                    {crmPipelineVal.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px]">
                      <th className="py-2 px-3">Deal</th>
                      <th className="py-2 px-3">Stage</th>
                      <th className="py-2 px-3">Probability</th>
                      <th className="py-2 px-3 text-right">Expected Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {fCrm.map((l) => (
                      <tr key={l.id}>
                        <td className="py-2.5 px-3 font-bold text-white">{l.name}</td>
                        <td className="py-2.5 px-3 text-cyan-300">{l.status}</td>
                        <td className="py-2.5 px-3 text-gray-300">{l.probability || 0}%</td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                          {currencySymbol}
                          {Number(l.expected_revenue || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {fCrm.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-400">
                          No CRM deals found in this date &amp; time range.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "helpdesk" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-black text-white">Helpdesk &amp; SLA Support Report</h2>
                  <p className="text-[11px] text-gray-400">{activePeriodLabel}</p>
                </div>
                {renderSectionDownloadBar("helpdesk", "Helpdesk Report")}
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-gray-400">Total Tickets</div>
                  <div className="text-lg font-black text-white">{fTickets.length}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-gray-400">Resolved</div>
                  <div className="text-lg font-black text-emerald-400">
                    {fTickets.filter((t) => t.status === "resolved" || t.status === "closed").length}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-gray-400">Open</div>
                  <div className="text-lg font-black text-amber-400">
                    {fTickets.filter((t) => t.status !== "resolved" && t.status !== "closed").length}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "industry_ops" && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-black text-white flex items-center gap-2">
                    <PhoneCall size={16} className="text-cyan-400" /> Call Center AHT, Manufacturing &amp; Projects Operations
                  </h2>
                  <p className="text-[11px] text-gray-400">{activePeriodLabel}</p>
                </div>
                {renderSectionDownloadBar("industry_ops", "Operations & AHT Report")}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/25">
                  <div className="text-gray-300">Avg Handle Time (AHT)</div>
                  <div className="text-xl font-black text-cyan-300 mt-1">{ahtFormatted}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                  <div className="text-gray-300">Contact Rate / Qualified</div>
                  <div className="text-xl font-black text-emerald-400 mt-1">
                    {contactRate}% · {callQualified}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/25">
                  <div className="text-gray-300">Active Campaigns</div>
                  <div className="text-xl font-black text-purple-300 mt-1">{campaigns.length}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25">
                  <div className="text-gray-300">MRP / Projects</div>
                  <div className="text-xl font-black text-amber-300 mt-1">
                    {mrpOrders.length + workOrders.length} MRP · {projects.length} Prj
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "custom_builder" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-black text-white">Custom Ad-Hoc Report Builder</h2>
                  <p className="text-xs text-gray-400">
                    Pick any company module and chart visualization, then download as Excel, CSV, PDF, or JSON.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <select
                    value={customSource}
                    onChange={(e) => setCustomSource(e.target.value as any)}
                    className="px-3 py-2 rounded-xl bg-[#0B1022] border border-white/15 text-white"
                  >
                    <option value="sales">Sales &amp; POS Revenue</option>
                    <option value="purchases">Purchases &amp; Vendor Bills</option>
                    <option value="inventory">Inventory Valuation</option>
                    <option value="crm">CRM Pipeline Stages</option>
                    <option value="hr">Employees, Leave &amp; Payroll</option>
                    <option value="call_center">Call Center Dispositions &amp; AHT</option>
                    <option value="public_forms">Public Lead Forms Submissions</option>
                    <option value="projects">Projects &amp; Construction</option>
                    <option value="manufacturing">Manufacturing (MRP &amp; Work Orders)</option>
                  </select>
                  <select
                    value={customChartType}
                    onChange={(e) => setCustomChartType(e.target.value as any)}
                    className="px-3 py-2 rounded-xl bg-[#0B1022] border border-white/15 text-white"
                  >
                    <option value="bar">Bar Chart</option>
                    <option value="area">Area Chart</option>
                    <option value="line">Line Chart</option>
                    <option value="pie">Pie Chart</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                {renderSectionDownloadBar("custom_builder", `Custom ${customSource.toUpperCase()} Report`)}
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
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#06b6d4"
                        fill="rgba(6,182,212,0.25)"
                      />
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
                      <Pie
                        data={customReportData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label
                      >
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

      {/* ─── SPECIFIC REPORT DOWNLOAD CENTER MODAL ─── */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-[#0F172A] border border-purple-500/40 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 flex items-center justify-center">
                  <FolderDown size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Download Specific Report Center
                  </h3>
                  <p className="text-xs text-gray-400">
                    Choose the exact report, date/time range, and file format (Excel, CSV, PDF, or JSON)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDownloadModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* 1. Choose Specific Report */}
              <div>
                <label className="block font-bold text-gray-300 mb-2">
                  1. Select Which Report You Want to Download
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
                  {SPECIFIC_REPORTS_CATALOG.map((rep) => {
                    const isPicked = selectedReportId === rep.id;
                    return (
                      <button
                        key={rep.id}
                        type="button"
                        onClick={() => setSelectedReportId(rep.id)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-start justify-between gap-2 cursor-pointer ${
                          isPicked
                            ? "bg-purple-600/25 border-purple-500 text-white ring-1 ring-purple-500"
                            : "bg-black/40 border-white/10 text-gray-300 hover:bg-white/5"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-xs leading-snug">{rep.name}</div>
                          <span className="inline-block mt-1 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/10 text-purple-300">
                            {rep.badge}
                          </span>
                        </div>
                        {isPicked && <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Date & Time Filter Summary inside Modal */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-gray-300">2. Date &amp; Time Range Filter</span>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value as DatePreset)}
                    className="px-3 py-1.5 rounded-xl bg-[#0B1022] border border-cyan-500/30 text-xs font-bold text-cyan-300 outline-none"
                  >
                    <option value="today">Daily (Today)</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="this_month">This Month</option>
                    <option value="this_quarter">This Quarter</option>
                    <option value="this_year">This Year</option>
                    <option value="all">All Time</option>
                    <option value="custom">Custom Date &amp; Time Range</option>
                  </select>
                </div>

                {dateRange === "custom" && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <div>
                      <label className="block text-[10px] text-cyan-300 mb-1">From Date</label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full bg-black/60 border border-white/15 rounded-lg px-2 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-cyan-300 mb-1">From Time</label>
                      <input
                        type="time"
                        value={customStartTime}
                        onChange={(e) => setCustomStartTime(e.target.value)}
                        className="w-full bg-black/60 border border-white/15 rounded-lg px-2 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-cyan-300 mb-1">To Date</label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full bg-black/60 border border-white/15 rounded-lg px-2 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-cyan-300 mb-1">To Time</label>
                      <input
                        type="time"
                        value={customEndTime}
                        onChange={(e) => setCustomEndTime(e.target.value)}
                        className="w-full bg-black/60 border border-white/15 rounded-lg px-2 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Choose File Format */}
              <div>
                <label className="block font-bold text-gray-300 mb-2">
                  3. Select Download Format
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "xlsx", label: "Excel (.xls)", icon: FileSpreadsheet, color: "text-emerald-400" },
                    { id: "csv", label: "CSV (.csv)", icon: FileText, color: "text-cyan-400" },
                    { id: "pdf", label: "PDF / Print", icon: Printer, color: "text-purple-400" },
                    { id: "json", label: "JSON (.json)", icon: FileJson, color: "text-amber-400" },
                  ].map((fmt) => {
                    const FIcon = fmt.icon;
                    const active = selectedFormat === fmt.id;
                    return (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setSelectedFormat(fmt.id as any)}
                        className={`p-3 rounded-xl border font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
                          active
                            ? "bg-purple-600/25 border-purple-500 text-white"
                            : "bg-black/40 border-white/10 text-gray-300 hover:bg-white/5"
                        }`}
                      >
                        <FIcon size={15} className={fmt.color} />
                        <span>{fmt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
              <span className="text-[11px] text-gray-400 truncate">
                Period: <strong className="text-cyan-300">{activePeriodLabel}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDownloadModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-gray-300 hover:text-white text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDownloadSpecificReport(selectedReportId, selectedFormat);
                    setIsDownloadModalOpen(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download Selected Report Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
