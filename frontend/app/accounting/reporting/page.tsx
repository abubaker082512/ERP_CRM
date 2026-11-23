"use client";

import { useState, useEffect } from "react";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { DollarSign, TrendingUp, FileText, PieChart, X } from "lucide-react";
import { useBranchContext } from "@/lib/branchContext";

const MENU_ITEMS = [
    { name: "Dashboard", href: "/accounting" },
    { name: "Customers", href: "/accounting/customers" },
    { name: "Vendors", href: "/accounting/vendors" },
    { name: "Accounting", href: "/accounting/journal" },
    { name: "Reporting", href: "/accounting/reporting" },
    { name: "Configuration", href: "/accounting/configuration" },
];

export default function AccountingReportingPage() {
    const { activeBranch, getEntityStorageKey, currencySymbol } = useBranchContext();
    const [activeReport, setActiveReport] = useState<string | null>(null);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [bills, setBills] = useState<any[]>([]);
    const [entries, setEntries] = useState<any[]>([]);

    useEffect(() => {
        try {
            setInvoices(JSON.parse(localStorage.getItem(getEntityStorageKey("accounting_invoices")) || "[]"));
            setBills(JSON.parse(localStorage.getItem(getEntityStorageKey("accounting_bills")) || "[]"));
            setEntries(JSON.parse(localStorage.getItem(getEntityStorageKey("accounting_entries")) || "[]"));
        } catch {}
    }, [activeBranch, getEntityStorageKey]);

    const revenue = invoices.filter((i) => i.status !== "void").reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const expenses = bills.filter((b) => b.status !== "void").reduce((s, b) => s + (Number(b.amount) || 0), 0);
    const netProfit = revenue - expenses;
    const ar = invoices.filter((i) => i.status !== "paid" && i.status !== "void").reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const ap = bills.filter((b) => b.status !== "paid" && b.status !== "void").reduce((s, b) => s + (Number(b.amount) || 0), 0);
    const cashPaid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + (Number(i.amount) || 0), 0) - bills.filter((b) => b.status === "paid").reduce((s, b) => s + (Number(b.amount) || 0), 0);
    const equity = entries.filter((e) => e.category === "equity").reduce((s, e) => s + (Number(e.amount) || 0), 0);

    return (
        <div className="flex flex-col min-h-screen bg-[#0F172A] overflow-x-hidden">
            <StandardModuleHeader
                moduleName="Accounting"
                moduleIcon={<DollarSign size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search reports..."
            />

            <div className="flex-1 overflow-auto p-4 sm:p-6 pb-24">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-200">Financial Reports</h2>
                    <p className="text-sm text-gray-400 mt-1">Real-time financial statements for {activeBranch?.name || "your entity"}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <button type="button" onClick={() => setActiveReport("bs")} className="text-left bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-blue-500/20 p-3 rounded-lg w-fit mb-4"><FileText size={24} className="text-blue-400" /></div>
                        <h3 className="text-lg font-semibold text-white mb-2">Balance Sheet</h3>
                        <p className="text-sm text-gray-400 mb-4">Assets, Liabilities, and Equity snapshot</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">View Report →</div>
                    </button>

                    <button type="button" onClick={() => setActiveReport("pnl")} className="text-left bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-green-500/20 p-3 rounded-lg w-fit mb-4"><TrendingUp size={24} className="text-green-400" /></div>
                        <h3 className="text-lg font-semibold text-white mb-2">Profit &amp; Loss</h3>
                        <p className="text-sm text-gray-400 mb-4">Net Profit: {currencySymbol}{netProfit.toLocaleString()}</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">View Report →</div>
                    </button>

                    <button type="button" onClick={() => setActiveReport("cf")} className="text-left bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-purple-500/20 p-3 rounded-lg w-fit mb-4"><DollarSign size={24} className="text-purple-400" /></div>
                        <h3 className="text-lg font-semibold text-white mb-2">Cash Flow Statement</h3>
                        <p className="text-sm text-gray-400 mb-4">Net Cash Position: {currencySymbol}{(cashPaid + equity).toLocaleString()}</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">View Report →</div>
                    </button>

                    <button type="button" onClick={() => setActiveReport("ar")} className="text-left bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-yellow-500/20 p-3 rounded-lg w-fit mb-4"><PieChart size={24} className="text-yellow-400" /></div>
                        <h3 className="text-lg font-semibold text-white mb-2">Aged Receivable</h3>
                        <p className="text-sm text-gray-400 mb-4">Outstanding AR: {currencySymbol}{ar.toLocaleString()}</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">View Report →</div>
                    </button>

                    <button type="button" onClick={() => setActiveReport("ap")} className="text-left bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-red-500/20 p-3 rounded-lg w-fit mb-4"><PieChart size={24} className="text-red-400" /></div>
                        <h3 className="text-lg font-semibold text-white mb-2">Aged Payable</h3>
                        <p className="text-sm text-gray-400 mb-4">Outstanding AP: {currencySymbol}{ap.toLocaleString()}</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">View Report →</div>
                    </button>

                    <button type="button" onClick={() => setActiveReport("gl")} className="text-left bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-cyan-500/20 p-3 rounded-lg w-fit mb-4"><FileText size={24} className="text-cyan-400" /></div>
                        <h3 className="text-lg font-semibold text-white mb-2">General Ledger</h3>
                        <p className="text-sm text-gray-400 mb-4">{entries.length} ledger postings recorded</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">View Report →</div>
                    </button>
                </div>
            </div>

            {activeReport && (
                <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#1E293B] border border-gray-700 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-700 pb-3">
                            <h3 className="text-lg font-bold">
                                {activeReport === "pnl" ? "Profit & Loss Statement" :
                                 activeReport === "bs" ? "Balance Sheet Snapshot" :
                                 activeReport === "cf" ? "Cash Flow Statement" :
                                 activeReport === "ar" ? "Aged Accounts Receivable" :
                                 activeReport === "ap" ? "Aged Accounts Payable" : "General Ledger Summary"}
                            </h3>
                            <button onClick={() => setActiveReport(null)} className="text-gray-400 hover:text-white"><X size={18} /></button>
                        </div>

                        {activeReport === "pnl" && (
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between py-2 border-b border-gray-800"><span>Operating Revenue (Invoiced)</span><span className="text-emerald-400 font-bold">{currencySymbol}{revenue.toLocaleString()}</span></div>
                                <div className="flex justify-between py-2 border-b border-gray-800"><span>Operating Expenses (Bills)</span><span className="text-red-400 font-bold">-{currencySymbol}{expenses.toLocaleString()}</span></div>
                                <div className="flex justify-between py-2 text-base font-extrabold"><span>Net Profit (YTD)</span><span className={netProfit >= 0 ? "text-emerald-400" : "text-red-400"}>{currencySymbol}{netProfit.toLocaleString()}</span></div>
                                <p className="text-xs text-gray-400">Note: Equity/Capital injections ({currencySymbol}{equity.toLocaleString()}) are excluded from Operating P&amp;L and reflected on the Balance Sheet.</p>
                            </div>
                        )}

                        {activeReport === "bs" && (
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between py-2 border-b border-gray-800"><span>Cash &amp; Bank Assets</span><span className="font-bold">{currencySymbol}{(cashPaid + equity).toLocaleString()}</span></div>
                                <div className="flex justify-between py-2 border-b border-gray-800"><span>Accounts Receivable</span><span className="font-bold">{currencySymbol}{ar.toLocaleString()}</span></div>
                                <div className="flex justify-between py-2 border-b border-gray-800"><span>Accounts Payable (Liabilities)</span><span className="text-red-400 font-bold">{currencySymbol}{ap.toLocaleString()}</span></div>
                                <div className="flex justify-between py-2 border-b border-gray-800"><span>Owner Capital / Equity</span><span className="text-blue-400 font-bold">{currencySymbol}{equity.toLocaleString()}</span></div>
                                <div className="flex justify-between py-2 font-bold"><span>Retained Earnings (Net Profit)</span><span className="text-emerald-400">{currencySymbol}{netProfit.toLocaleString()}</span></div>
                            </div>
                        )}

                        {activeReport !== "pnl" && activeReport !== "bs" && (
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between py-2 border-b border-gray-800"><span>Total Invoices</span><span>{invoices.length} ({currencySymbol}{revenue.toLocaleString()})</span></div>
                                <div className="flex justify-between py-2 border-b border-gray-800"><span>Total Vendor Bills</span><span>{bills.length} ({currencySymbol}{expenses.toLocaleString()})</span></div>
                                <div className="flex justify-between py-2"><span>Total GL Postings</span><span>{entries.length}</span></div>
                            </div>
                        )}

                        <div className="flex justify-end pt-2">
                            <button onClick={() => setActiveReport(null)} className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
