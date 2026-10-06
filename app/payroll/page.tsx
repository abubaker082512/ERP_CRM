"use client";

import { useState, useEffect } from "react";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import {
    DollarSign,
    Plus,
    Play,
    Calendar,
    Search,
    Users,
    Settings,
    FileText,
    CheckCircle2,
    Clock,
    Download,
    Sparkles,
    Trash2,
    Eye,
    Shield,
    TrendingUp,
    Send,
    X,
    CreditCard
} from "lucide-react";
import { printReportPDF } from "@/lib/exportUtils";

const MENU_ITEMS = [
    { name: "Payroll Batches", href: "/payroll" },
    { name: "Payslips", href: "/payroll/payslips" },
    { name: "Salary Runs", href: "/payroll/runs" },
    { name: "Salary Structures", href: "/payroll/structures" },
];

export type PayrollRun = {
    id: string;
    name: string;
    period: string;
    total_gross: number;
    total_deductions: number;
    total_net: number;
    employee_count: number;
    status: "draft" | "processing" | "disbursed";
    created_at: string;
};

export type Payslip = {
    id: string;
    run_id: string;
    employee_name: string;
    employee_role: string;
    department: string;
    base_salary: number;
    allowances: number;
    tax_deduction: number;
    net_pay: number;
    status: "paid" | "pending";
    payment_date?: string;
};

const INITIAL_RUNS: PayrollRun[] = [
    {
        id: "PAY-2026-03",
        name: "March 2026 Regular Company Payroll",
        period: "March 2026",
        total_gross: 61500,
        total_deductions: 9225,
        total_net: 52275,
        employee_count: 6,
        status: "disbursed",
        created_at: "2026-03-01"
    },
    {
        id: "PAY-2026-02",
        name: "February 2026 Executive & Staff Payroll",
        period: "February 2026",
        total_gross: 61500,
        total_deductions: 9225,
        total_net: 52275,
        employee_count: 6,
        status: "disbursed",
        created_at: "2026-02-01"
    },
    {
        id: "PAY-2026-04",
        name: "April 2026 Projected Sprint Payroll Run",
        period: "April 2026",
        total_gross: 68000,
        total_deductions: 10200,
        total_net: 57800,
        employee_count: 7,
        status: "draft",
        created_at: "2026-03-08"
    }
];

const INITIAL_PAYSLIPS: Payslip[] = [
    { id: "PS-001", run_id: "PAY-2026-03", employee_name: "Salim Ghauri", employee_role: "Principal Architect", department: "Engineering", base_salary: 12000, allowances: 1500, tax_deduction: 2025, net_pay: 11475, status: "paid", payment_date: "2026-03-05" },
    { id: "PS-002", run_id: "PAY-2026-03", employee_name: "Sarah Vance", employee_role: "Lead UI/UX Designer", department: "Design", base_salary: 10000, allowances: 1000, tax_deduction: 1650, net_pay: 9350, status: "paid", payment_date: "2026-03-05" },
    { id: "PS-003", run_id: "PAY-2026-03", employee_name: "Bilal Mahmood", employee_role: "ERP Specialist & Controller", department: "Finance", base_salary: 10800, allowances: 1200, tax_deduction: 1800, net_pay: 10200, status: "paid", payment_date: "2026-03-05" },
    { id: "PS-004", run_id: "PAY-2026-03", employee_name: "Jane Smith", employee_role: "Mobile Engineering Lead", department: "Engineering", base_salary: 10600, allowances: 1100, tax_deduction: 1755, net_pay: 9945, status: "paid", payment_date: "2026-03-05" },
    { id: "PS-005", run_id: "PAY-2026-03", employee_name: "Marcus Jenkins", employee_role: "DevOps & Cloud Engineer", department: "Operations", base_salary: 9800, allowances: 900, tax_deduction: 1605, net_pay: 9095, status: "paid", payment_date: "2026-03-05" },
    { id: "PS-006", run_id: "PAY-2026-03", employee_name: "Bob Wilson", employee_role: "Supply Chain Engineer", department: "Operations", base_salary: 7900, allowances: 800, tax_deduction: 1305, net_pay: 7395, status: "paid", payment_date: "2026-03-05" }
];

export default function PayrollPage() {
    const [runs, setRuns] = useState<PayrollRun[]>(INITIAL_RUNS);
    const [payslips, setPayslips] = useState<Payslip[]>(INITIAL_PAYSLIPS);
    const [activeTab, setActiveTab] = useState<"batches" | "payslips">("batches");
    const [searchQuery, setSearchQuery] = useState("");
    const [toastMsg, setToastMsg] = useState("");

    // Create Modal
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newRunName, setNewRunName] = useState("");
    const [newPeriod, setNewPeriod] = useState("May 2026");

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(""), 5000);
    };

    const handleCreateRun = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRunName.trim()) return;

        const newRun: PayrollRun = {
            id: `PAY-2026-${Math.floor(10 + Math.random() * 90)}`,
            name: newRunName.trim(),
            period: newPeriod,
            total_gross: 63500,
            total_deductions: 9525,
            total_net: 53975,
            employee_count: 6,
            status: "draft",
            created_at: new Date().toISOString().slice(0, 10)
        };

        setRuns([newRun, ...runs]);
        setIsCreateModalOpen(false);
        setNewRunName("");
        showToast(`💼 Created Payroll Batch "${newRun.name}"!`);
    };

    const handleDisburseBatch = (id: string) => {
        setRuns(runs.map(r => r.id === id ? { ...r, status: "disbursed" } : r));
        showToast(`✅ Disbursed salaries for Batch ${id} across all employee accounts!`);
    };

    const handleDownloadPayslipPDF = (ps: Payslip) => {
        printReportPDF({
            title: `OFFICIAL SALARY PAYSLIP - ${ps.employee_name}`,
            subtitle: `Department: ${ps.department} • Role: ${ps.employee_role} • Ref: ${ps.id}`,
            summaryCards: [
                { label: "Gross Salary", value: `$${(ps.base_salary + ps.allowances).toLocaleString()}` },
                { label: "Tax / Deductions", value: `-$${ps.tax_deduction.toLocaleString()}` },
                { label: "Net Disbursed", value: `$${ps.net_pay.toLocaleString()}` },
            ],
            headers: ["Earnings Item", "Allowance", "Statutory Deductions", "Net Take-Home"],
            rows: [
                [
                    `Base Pay: $${ps.base_salary.toLocaleString()}`,
                    `Allowances: $${ps.allowances.toLocaleString()}`,
                    `Tax (15%): -$${ps.tax_deduction.toLocaleString()}`,
                    `Net Amount: $${ps.net_pay.toLocaleString()}`
                ]
            ]
        });
        showToast(`📥 Exported official payslip PDF for ${ps.employee_name}!`);
    };

    const handleExportCSV = () => {
        const headers = ["Payslip ID", "Employee", "Role", "Department", "Base Salary", "Allowances", "Tax Deduction", "Net Pay", "Status"];
        const rows = payslips.map(p => [
            p.id,
            `"${p.employee_name}"`,
            `"${p.employee_role}"`,
            `"${p.department}"`,
            p.base_salary,
            p.allowances,
            p.tax_deduction,
            p.net_pay,
            p.status
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `beraxis_payroll_report_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("📥 Exported Payroll Master CSV!");
    };

    const totalDisbursedYTD = runs.filter(r => r.status === "disbursed").reduce((sum, r) => sum + r.total_net, 0);

    return (
        <div className="flex flex-col min-h-screen bg-[#0a0d14] text-white">
            <StandardModuleHeader
                moduleName="Payroll"
                moduleIcon={<DollarSign size={20} className="text-emerald-400" />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search payroll batch, employee, payslip..."
                onSearch={setSearchQuery}
                onNewClick={() => setIsCreateModalOpen(true)}
                newButtonText="+ New Payroll Batch"
            />

            {/* Toast Notification */}
            {toastMsg && (
                <div className="fixed top-16 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl shadow-emerald-900/50 flex items-center gap-3 border border-emerald-400 animate-in fade-in slide-in-from-top-4 duration-300">
                    <Sparkles size={18} className="animate-spin text-emerald-200" />
                    <span className="text-sm font-medium">{toastMsg}</span>
                </div>
            )}

            <div className="flex-1 overflow-auto p-6 max-w-7xl mx-auto w-full space-y-6">
                {/* Header Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900/60 p-4 rounded-2xl border border-gray-800 backdrop-blur-xl">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                                Payroll & Compensation Management
                            </h2>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                                Automated Tax & Direct Deposit
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            Salary batch calculation, payslip PDF generation, statutory deductions & automated direct disbursements
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                        <button
                            onClick={handleExportCSV}
                            className="bg-gray-800/90 hover:bg-gray-700 text-gray-200 border border-gray-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                        >
                            <Download size={15} className="text-emerald-400" /> Export CSV
                        </button>

                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-0.5 flex items-center gap-1.5"
                        >
                            <Plus size={16} /> + New Payroll Run
                        </button>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-gray-900/80 to-emerald-950/20 p-5 rounded-2xl border border-gray-800 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-400 font-semibold uppercase">Total Disbursed (YTD)</span>
                            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <DollarSign size={18} />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-emerald-400">${totalDisbursedYTD.toLocaleString()}</div>
                        <div className="text-[11px] text-emerald-300 mt-1">Reconciled with General Ledger</div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900/80 to-purple-950/20 p-5 rounded-2xl border border-gray-800 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-400 font-semibold uppercase">Active Employees On Payroll</span>
                            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                <Users size={18} />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-purple-300">{payslips.length} Staff</div>
                        <div className="text-[11px] text-purple-300 mt-1">100% automated calculation</div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900/80 to-blue-950/20 p-5 rounded-2xl border border-gray-800 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-400 font-semibold uppercase">Average Net Take-Home</span>
                            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                <TrendingUp size={18} />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-white">${(totalDisbursedYTD / (runs.length || 1) / payslips.length).toFixed(0)}/mo</div>
                        <div className="text-[11px] text-gray-400 mt-1">Net compensation average</div>
                    </div>
                </div>

                {/* Submodule Tabs */}
                <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
                    <button
                        onClick={() => setActiveTab("batches")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                            activeTab === "batches"
                                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                                : "bg-gray-800/80 text-gray-400 hover:text-white"
                        }`}
                    >
                        <Calendar size={15} /> Payroll Batches ({runs.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("payslips")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                            activeTab === "payslips"
                                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                                : "bg-gray-800/80 text-gray-400 hover:text-white"
                        }`}
                    >
                        <FileText size={15} /> Individual Payslips ({payslips.length})
                    </button>
                </div>

                {/* TAB 1: BATCHES */}
                {activeTab === "batches" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {runs.map(run => (
                            <div
                                key={run.id}
                                className="bg-gray-900/80 border border-gray-800 hover:border-emerald-500/50 rounded-2xl p-5 shadow-xl transition-all duration-200 hover:-translate-y-1 backdrop-blur-xl flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-bold text-white text-base">{run.name}</h3>
                                            <span className="font-mono text-xs text-gray-400">Period: {run.period}</span>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                            run.status === "disbursed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                            "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                        }`}>
                                            {run.status}
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-xs bg-gray-950/60 p-3.5 rounded-xl border border-gray-800 mb-4">
                                        <div className="flex justify-between text-gray-400">
                                            <span>Staff Covered:</span>
                                            <span className="text-white font-semibold">{run.employee_count} Employees</span>
                                        </div>
                                        <div className="flex justify-between text-gray-400">
                                            <span>Gross Total:</span>
                                            <span className="text-gray-300 font-mono">${run.total_gross.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-400">
                                            <span>Tax Deductions:</span>
                                            <span className="text-rose-400 font-mono">-${run.total_deductions.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-white font-bold border-t border-gray-800 pt-1.5">
                                            <span>Net Payout:</span>
                                            <span className="text-emerald-400 font-mono">${run.total_net.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-gray-800 flex justify-end gap-2">
                                    {run.status === "draft" && (
                                        <button
                                            onClick={() => handleDisburseBatch(run.id)}
                                            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition flex items-center gap-1.5"
                                        >
                                            <Play size={13} /> Disburse Salaries
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* TAB 2: PAYSLIPS */}
                {activeTab === "payslips" && (
                    <div className="bg-gray-900/80 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl backdrop-blur-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-gray-950 text-gray-400 uppercase text-[10px] border-b border-gray-800 font-semibold">
                                    <tr>
                                        <th className="px-5 py-3.5">Payslip ID</th>
                                        <th className="px-4 py-3.5">Employee Name & Role</th>
                                        <th className="px-4 py-3.5">Department</th>
                                        <th className="px-4 py-3.5 text-right">Base Salary</th>
                                        <th className="px-4 py-3.5 text-right">Allowances</th>
                                        <th className="px-4 py-3.5 text-right">Tax Deduction</th>
                                        <th className="px-4 py-3.5 text-right">Net Take-Home</th>
                                        <th className="px-5 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/60">
                                    {payslips.map(ps => (
                                        <tr key={ps.id} className="hover:bg-emerald-950/10 transition">
                                            <td className="px-5 py-3.5 font-mono font-bold text-white">{ps.id}</td>
                                            <td className="px-4 py-3.5">
                                                <div className="font-bold text-white text-sm">{ps.employee_name}</div>
                                                <div className="text-[11px] text-gray-400">{ps.employee_role}</div>
                                            </td>
                                            <td className="px-4 py-3.5 text-gray-300">{ps.department}</td>
                                            <td className="px-4 py-3.5 text-right font-mono text-gray-300">${ps.base_salary.toLocaleString()}</td>
                                            <td className="px-4 py-3.5 text-right font-mono text-emerald-400">+${ps.allowances.toLocaleString()}</td>
                                            <td className="px-4 py-3.5 text-right font-mono text-rose-400">-${ps.tax_deduction.toLocaleString()}</td>
                                            <td className="px-4 py-3.5 text-right font-mono font-black text-sm text-emerald-300">${ps.net_pay.toLocaleString()}</td>
                                            <td className="px-5 py-3.5 text-right">
                                                <button
                                                    onClick={() => handleDownloadPayslipPDF(ps)}
                                                    className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl text-xs font-semibold transition border border-gray-700 flex items-center gap-1.5 ml-auto"
                                                >
                                                    <Download size={13} className="text-emerald-400" /> PDF Payslip
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal: Create Payroll Run */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setIsCreateModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                                <DollarSign size={22} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Create New Payroll Batch</h3>
                                <p className="text-xs text-gray-400">Generate monthly employee compensation run</p>
                            </div>
                        </div>

                        <form onSubmit={handleCreateRun} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Payroll Batch Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={newRunName}
                                    onChange={(e) => setNewRunName(e.target.value)}
                                    placeholder="e.g. May 2026 Monthly Staff Disbursement"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Fiscal Period</label>
                                <input
                                    type="text"
                                    value={newPeriod}
                                    onChange={(e) => setNewPeriod(e.target.value)}
                                    placeholder="e.g. May 2026"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 text-xs font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30"
                                >
                                    Generate Batch
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
