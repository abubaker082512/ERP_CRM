"use client";

import React, { useState } from "react";
import {
  Download,
  FileSpreadsheet,
  Database,
  ShieldCheck,
  CheckCircle2,
  FileJson,
  Layers,
  ArrowRight,
  Clock,
  Sparkles,
  Lock
} from "lucide-react";
import { useBranchContext } from "@/lib/branchContext";

export default function DataExportCenter() {
  const { activeBranch, getEntityStorageKey } = useBranchContext();
  const [downloading, setDownloading] = useState<string | null>(null);
  const [lastExport, setLastExport] = useState<{ type: string; count: number; date: string } | null>(null);

  // Helper to safely fetch entity data from local storage
  const getEntityRecords = (resource: string): any[] => {
    try {
      const scopedKey = getEntityStorageKey ? getEntityStorageKey(resource) : "";
      const rawScoped = scopedKey ? localStorage.getItem(scopedKey) : null;
      if (rawScoped) {
        const parsed = JSON.parse(rawScoped);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      // Fallback global key
      const rawGlobal = localStorage.getItem(resource);
      if (rawGlobal) {
        const parsed = JSON.parse(rawGlobal);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(`Failed to read records for ${resource}:`, e);
    }
    return [];
  };

  // Convert array of objects to downloadable CSV
  const downloadCSV = (records: any[], filename: string, headers: string[], rowMapper: (r: any) => string[]) => {
    const csvRows = [
      headers.join(","),
      ...records.map(r => {
        const values = rowMapper(r);
        return values.map(v => {
          const str = String(v ?? "").replace(/"/g, '""');
          return `"${str}"`;
        }).join(",");
      })
    ];

    const blob = new Blob(["\uFEFF" + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export Invoices
  const handleExportInvoices = () => {
    setDownloading("invoices");
    const records = getEntityRecords("accounting_invoices");
    const filename = `beraxis_invoices_${activeBranch?.name?.replace(/\s+/g, "_") || "entity"}_${new Date().toISOString().split("T")[0]}.csv`;
    
    downloadCSV(
      records,
      filename,
      ["Invoice Number", "Customer Name", "Invoice Date", "Due Date", "Total Amount", "Status"],
      (r) => [
        r.number || r.id || "INV-001",
        r.partner_name || r.customer || "Walk-in Customer",
        r.date || new Date().toISOString().split("T")[0],
        r.due_date || "",
        r.amount ?? r.total ?? "0.00",
        r.status || "Paid"
      ]
    );

    setLastExport({ type: "Invoices & Revenue", count: records.length, date: new Date().toLocaleTimeString() });
    setTimeout(() => setDownloading(null), 800);
  };

  // Export CRM Leads & Contacts
  const handleExportLeads = () => {
    setDownloading("leads");
    const records = getEntityRecords("crm_leads");
    const filename = `beraxis_crm_contacts_${new Date().toISOString().split("T")[0]}.csv`;

    downloadCSV(
      records,
      filename,
      ["Company / Contact Name", "Email Address", "Phone Number", "Stage / Status", "Expected Revenue", "Country", "Industry"],
      (r) => [
        r.name || r.partner_name || r.contact_name || "Lead",
        r.email || "",
        r.phone || "",
        r.stage || r.status || "Lead",
        r.expected_revenue ?? r.revenue ?? "0",
        r.country || "Global",
        r.industry || "General"
      ]
    );

    setLastExport({ type: "CRM Leads & Contacts", count: records.length, date: new Date().toLocaleTimeString() });
    setTimeout(() => setDownloading(null), 800);
  };

  // Export Products & Inventory
  const handleExportInventory = () => {
    setDownloading("inventory");
    const records = getEntityRecords("inventory_products");
    const filename = `beraxis_inventory_${new Date().toISOString().split("T")[0]}.csv`;

    downloadCSV(
      records,
      filename,
      ["Product Name", "SKU", "Sales Price", "Cost", "Stock On Hand", "Category"],
      (r) => [
        r.name || "Product Item",
        r.sku || r.default_code || "",
        r.price ?? r.sale_price ?? "0.00",
        r.cost ?? r.standard_price ?? "0.00",
        r.stock ?? r.qty_available ?? "0",
        r.category || r.categ_name || "Standard"
      ]
    );

    setLastExport({ type: "Products & Inventory", count: records.length, date: new Date().toLocaleTimeString() });
    setTimeout(() => setDownloading(null), 800);
  };

  // Full Database JSON Backup
  const handleExportFullJSON = () => {
    setDownloading("full");
    const invoices = getEntityRecords("accounting_invoices");
    const leads = getEntityRecords("crm_leads");
    const inventory = getEntityRecords("inventory_products");
    const accounts = getEntityRecords("chart_of_accounts");

    const fullArchive = {
      system: "Beraxis AI ERP & CRM",
      version: "2.0",
      exportTimestamp: new Date().toISOString(),
      activeBranch: {
        id: activeBranch?.id,
        name: activeBranch?.name,
        industry: activeBranch?.industry
      },
      summary: {
        totalInvoices: invoices.length,
        totalLeads: leads.length,
        totalProducts: inventory.length,
        totalAccounts: accounts.length
      },
      data: {
        invoices,
        leads,
        inventory,
        accounts
      },
      compliance: {
        guarantee: "100% Unencumbered Customer Ownership. Zero Vendor Lock-In.",
        portableStandard: "Open JSON Schema / Beraxis Interchange v2"
      }
    };

    const blob = new Blob([JSON.stringify(fullArchive, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `beraxis_full_backup_${activeBranch?.name?.replace(/\s+/g, "_") || "entity"}_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    const totalCount = invoices.length + leads.length + inventory.length + accounts.length;
    setLastExport({ type: "Full Enterprise Archive (JSON)", count: totalCount, date: new Date().toLocaleTimeString() });
    setTimeout(() => setDownloading(null), 800);
  };

  return (
    <div className="space-y-6 text-white">
      {/* Executive Zero Lock-In Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-950/40 via-[#0B0F19] to-cyan-950/30 border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck size={14} /> Zero Vendor Lock-In Guarantee
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Universal Data Backup &amp; Portability Center
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Your business records belong strictly to you. Export your entire active workspace, ledgers, customer pipelines, and inventory anytime in 1 click in open standard formats (Excel, CSV, and full JSON archive).
            </p>
          </div>

          <button
            onClick={handleExportFullJSON}
            disabled={downloading === "full"}
            className="shrink-0 flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-purple-600/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Database size={16} />
            <span>{downloading === "full" ? "Packaging Archive..." : "Download Full Database (JSON)"}</span>
          </button>
        </div>

        {lastExport && (
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>Successfully exported {lastExport.count} records for <strong>{lastExport.type}</strong> at {lastExport.date}.</span>
          </div>
        )}
      </div>

      {/* 1-Click Entity Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Invoices Card */}
        <div className="p-5 rounded-2xl bg-[#0D121F] border border-white/10 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <FileSpreadsheet size={20} />
            </div>
            <h3 className="font-bold text-white text-base">Invoices &amp; Revenue</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Customer billings, due dates, payment status, and revenue amounts formatted for Excel and accounting auditors.
            </p>
          </div>
          <button
            onClick={handleExportInvoices}
            disabled={downloading === "invoices"}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 text-purple-300 hover:text-white font-bold text-xs transition-all active:scale-95 cursor-pointer"
          >
            <Download size={14} />
            <span>{downloading === "invoices" ? "Exporting..." : "Export Invoices (.CSV)"}</span>
          </button>
        </div>

        {/* CRM Leads Card */}
        <div className="p-5 rounded-2xl bg-[#0D121F] border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Layers size={20} />
            </div>
            <h3 className="font-bold text-white text-base">CRM Contacts &amp; Leads</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Full contact phone numbers, verified emails, pipeline deal stages, and expected contract values.
            </p>
          </div>
          <button
            onClick={handleExportLeads}
            disabled={downloading === "leads"}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 text-cyan-300 hover:text-white font-bold text-xs transition-all active:scale-95 cursor-pointer"
          >
            <Download size={14} />
            <span>{downloading === "leads" ? "Exporting..." : "Export Leads (.CSV)"}</span>
          </button>
        </div>

        {/* Products Card */}
        <div className="p-5 rounded-2xl bg-[#0D121F] border border-white/10 hover:border-pink-500/40 transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <FileJson size={20} />
            </div>
            <h3 className="font-bold text-white text-base">Products &amp; Inventory</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Active product catalogs, SKU barcodes, sales pricing, unit purchase cost, and multi-warehouse stock levels.
            </p>
          </div>
          <button
            onClick={handleExportInventory}
            disabled={downloading === "inventory"}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-500/30 text-pink-300 hover:text-white font-bold text-xs transition-all active:scale-95 cursor-pointer"
          >
            <Download size={14} />
            <span>{downloading === "inventory" ? "Exporting..." : "Export Products (.CSV)"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
