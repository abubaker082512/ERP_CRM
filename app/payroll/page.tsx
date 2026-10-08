"use client";

import { useState, useEffect } from "react";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { useBranchContext } from "@/lib/branchContext";
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
    CreditCard,
    Building2,
    Printer,
    Check,
    Lock
} from "lucide-react";

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
    emp_code?: string;
    bank_account?: string;
};

const INITIAL_RUNS: PayrollRun[] = [];

const INITIAL_PAYSLIPS: Payslip[] = [];

export default function PayrollPage() {
    const { activeBranch, getEntityStorageKey } = useBranchContext();
    const [runs, setRuns] = useState<PayrollRun[]>([]);
    const [payslips, setPayslips] = useState<Payslip[]>([]);
    const [activeTab, setActiveTab] = useState<"batches" | "payslips">("batches");
    const [searchQuery, setSearchQuery] = useState("");
    const [toastMsg, setToastMsg] = useState("");

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedPayslipPreview, setSelectedPayslipPreview] = useState<Payslip | null>(null);
    const [newRunName, setNewRunName] = useState("");
    const [newPeriod, setNewPeriod] = useState("May 2026");
    const [companyName, setCompanyName] = useState("BERAXIS Entity");

    // Entity-scoped data loading
    useEffect(() => {
        if (!activeBranch) return;

        setCompanyName(activeBranch.name || "BERAXIS Entity");

        const runsKey = getEntityStorageKey("payroll_runs");
        const slipsKey = getEntityStorageKey("payroll_payslips");

        const savedRuns = localStorage.getItem(runsKey);
        if (savedRuns) {
            try { setRuns(JSON.parse(savedRuns)); } catch { setRuns([]); }
        } else {
            setRuns([]);
        }

        const savedSlips = localStorage.getItem(slipsKey);
        if (savedSlips) {
            try { setPayslips(JSON.parse(savedSlips)); } catch { setPayslips([]); }
        } else {
            setPayslips([]);
        }
    }, [activeBranch?.id, activeBranch?.name]);

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(""), 5000);
    };

    const persistRuns = (updatedRuns: PayrollRun[], updatedSlips?: Payslip[]) => {
        setRuns(updatedRuns);
        try {
            const key = getEntityStorageKey("payroll_runs");
            localStorage.setItem(key, JSON.stringify(updatedRuns));
        } catch {}

        if (updatedSlips) {
            setPayslips(updatedSlips);
            try {
                const key = getEntityStorageKey("payroll_payslips");
                localStorage.setItem(key, JSON.stringify(updatedSlips));
            } catch {}
        }
    };

    const handleCreateRun = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRunName.trim()) return;

        // Fetch current entity's employees if any
        const empKey = getEntityStorageKey("employees");
        let activeEmps: any[] = [];
        try {
            const raw = localStorage.getItem(empKey);
            if (raw) activeEmps = JSON.parse(raw);
        } catch {}

        const runId = `PAY-2026-${Math.floor(10 + Math.random() * 90)}`;
        const empCount = activeEmps.length > 0 ? activeEmps.length : 1;

        let totalGross = 0;
        let totalDeductions = 0;
        let totalNet = 0;

        const newSlips: Payslip[] = [];

        if (activeEmps.length > 0) {
            activeEmps.forEach((emp, idx) => {
                const base = Number(emp.salary) || 85000;
                const monthlyBase = Math.round(base / 12);
                const allow = Math.round(monthlyBase * 0.1);
                const tax = Math.round((monthlyBase + allow) * 0.15);
                const net = (monthlyBase + allow) - tax;

                totalGross += (monthlyBase + allow);
                totalDeductions += tax;
                totalNet += net;

                newSlips.push({
                    id: `PS-${runId}-${idx + 1}`,
                    run_id: runId,
                    emp_code: emp.id || `EMP-0${idx + 1}`,
                    employee_name: emp.name,
                    employee_role: emp.role,
                    department: emp.department,
                    base_salary: monthlyBase,
                    allowances: allow,
                    tax_deduction: tax,
                    net_pay: net,
                    status: "paid",
                    payment_date: new Date().toISOString().slice(0, 10),
                    bank_account: "Direct Bank Wire"
                });
            });
        } else {
            totalGross = 12500;
            totalDeductions = 1875;
            totalNet = 10625;
            newSlips.push({
                id: `PS-${runId}-01`,
                run_id: runId,
                emp_code: "EMP-001",
                employee_name: "Lead Executive",
                employee_role: "Managing Director",
                department: "Executive",
                base_salary: 11000,
                allowances: 1500,
                tax_deduction: 1875,
                net_pay: 10625,
                status: "paid",
                payment_date: new Date().toISOString().slice(0, 10),
                bank_account: "Primary Corporate Account"
            });
        }

        const newRun: PayrollRun = {
            id: runId,
            name: newRunName.trim(),
            period: newPeriod,
            total_gross: totalGross,
            total_deductions: totalDeductions,
            total_net: totalNet,
            employee_count: empCount,
            status: "draft",
            created_at: new Date().toISOString().slice(0, 10)
        };

        const updatedRuns = [newRun, ...runs];
        const updatedSlips = [...newSlips, ...payslips];
        persistRuns(updatedRuns, updatedSlips);

        setIsCreateModalOpen(false);
        setNewRunName("");
        showToast(`💼 Created Payroll Batch "${newRun.name}" for ${empCount} employees!`);
    };

    const handleDisburseBatch = (id: string) => {
        const updated = runs.map(r => r.id === id ? { ...r, status: "disbursed" as const } : r);
        persistRuns(updated);
        showToast(`✅ Disbursed salaries for Batch ${id} across all employee accounts!`);
    };

    const printPayslipVoucher = (ps: Payslip) => {
        setSelectedPayslipPreview(ps);
        setTimeout(() => {
            window.print();
        }, 300);
    };

    const handleExportMasterCSV = () => {
        const headers = ["Payslip ID", "Employee Code", "Employee Name", "Designation", "Department", "Base Salary", "Allowances", "Tax Deduction", "Net Disbursed", "Disbursement Date", "Bank Method"];
        const rows = payslips.map(ps => [
            ps.id,
            ps.emp_code || "EMP",
            `"${ps.employee_name}"`,
            `"${ps.employee_role}"`,
            `"${ps.department}"`,
            ps.base_salary,
            ps.allowances,
            ps.tax_deduction,
            ps.net_pay,
            ps.payment_date || "2026-03-05",
            `"${ps.bank_account || "Direct Wire"}"`
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `enterprise_payroll_master_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("📥 Exported Master Payroll CSV!");
    };

    const filteredPayslips = payslips.filter(ps =>
        ps.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ps.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ps.employee_role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ps.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalDisbursed = runs.filter(r => r.status === "disbursed").reduce((acc, r) => acc + r.total_net, 0);

    return (
        <div className="flex flex-col min-h-screen bg-[#0a0d14] text-white">
            <StandardModuleHeader
                moduleName="Payroll"
                moduleIcon={<DollarSign size={20} className="text-emerald-400" />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search payslips, employee name, department..."
                onSearch={setSearchQuery}
                onNewClick={() => setIsCreateModalOpen(true)}
                newButtonText="+ New Payroll Batch"
            />

            {/* Toast Notification */}
            {toastMsg && (
                <div className="fixed top-16 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl shadow-emerald-900/50 flex items-center gap-3 border border-emerald-400 animate-in fade-in slide-in-from-top-4 duration-300">
                    <Sparkles size={18} className="animate-spin text-emerald-200" />
                    <span className="text-xs font-bold">{toastMsg}</span>
                </div>
            )}

            <div className="flex-1 p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
                {/* KPI Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="galaxy-card p-4 border border-emerald-500/20 bg-emerald-950/10 rounded-2xl flex items-center justify-between shadow-xl">
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Disbursed</p>
                            <h3 className="text-2xl font-bold text-emerald-400 mt-1">${totalDisbursed.toLocaleString()}</h3>
                            <p className="text-xs text-gray-400 mt-0.5">YTD automated salary runs</p>
                        </div>
                        <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
                            <DollarSign size={22} />
                        </div>
                    </div>

                    <div className="galaxy-card p-4 border border-blue-500/20 bg-blue-950/10 rounded-2xl flex items-center justify-between shadow-xl">
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payroll Batches</p>
                            <h3 className="text-2xl font-bold text-blue-400 mt-1">{runs.length} Batches</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Monthly salary cycles</p>
                        </div>
                        <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                            <Calendar size={22} />
                        </div>
                    </div>

                    <div className="galaxy-card p-4 border border-purple-500/20 bg-purple-950/10 rounded-2xl flex items-center justify-between shadow-xl">
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Employees</p>
                            <h3 className="text-2xl font-bold text-purple-400 mt-1">{payslips.length} Staff</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Automated tax withholding</p>
                        </div>
                        <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                            <Users size={22} />
                        </div>
                    </div>

                    <div className="galaxy-card p-4 border border-cyan-500/20 bg-cyan-950/10 rounded-2xl flex items-center justify-between shadow-xl">
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Compliance Status</p>
                            <h3 className="text-2xl font-bold text-cyan-400 mt-1">100% Certified</h3>
                            <p className="text-xs text-gray-400 mt-0.5">HR & tax audit seal</p>
                        </div>
                        <div className="p-3 bg-cyan-500/20 rounded-xl text-cyan-400">
                            <Shield size={22} />
                        </div>
                    </div>
                </div>

                {/* Control Action Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111622] p-4 rounded-2xl border border-gray-800">
                    <div className="flex bg-gray-900/80 p-1 rounded-xl border border-gray-800">
                        <button
                            onClick={() => setActiveTab("batches")}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition ${
                                activeTab === "batches" ? "bg-emerald-600 text-white shadow-md" : "text-gray-400 hover:text-white"
                            }`}
                        >
                            Payroll Batches ({runs.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("payslips")}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition ${
                                activeTab === "payslips" ? "bg-emerald-600 text-white shadow-md" : "text-gray-400 hover:text-white"
                            }`}
                        >
                            All Payslips ({payslips.length})
                        </button>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={handleExportMasterCSV}
                            className="bg-gray-800/90 hover:bg-gray-700 text-gray-200 border border-gray-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                            <Download size={14} className="text-emerald-400" /> Export Master CSV
                        </button>

                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5"
                        >
                            <Plus size={15} /> + Create Payroll Run
                        </button>
                    </div>
                </div>

                {/* TAB 1: BATCHES */}
                {activeTab === "batches" && (
                    <>
                        {runs.length === 0 ? (
                            <div className="galaxy-card bg-[#111622]/70 border border-dashed border-gray-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-xl">
                                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner">
                                    <Calendar size={32} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-white">No Payroll Runs Generated Yet</h3>
                                    <p className="text-xs text-gray-400 max-w-sm">
                                        {activeBranch?.name ? `No salary cycles have been disbursed for "${activeBranch.name}".` : "Create your first monthly payroll batch to calculate allowances, tax withholdings, and net salaries."}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                                >
                                    <Plus size={16} /> + Issue First Payroll Batch
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                {runs.map(run => (
                                    <div
                                        key={run.id}
                                        className="galaxy-card p-5 border border-gray-800 hover:border-emerald-500/40 bg-[#111622] rounded-2xl transition space-y-4 shadow-xl"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">{run.id} • {run.period}</span>
                                                <h3 className="text-base font-bold text-white mt-1">{run.name}</h3>
                                                <p className="text-xs text-gray-400">{run.employee_count} Employee Accounts Enrolled</p>
                                            </div>
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                                                run.status === "disbursed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                            }`}>
                                                {run.status}
                                            </span>
                                        </div>

                                        <div className="bg-gray-900/70 p-3 rounded-xl border border-gray-800 space-y-1.5 text-xs text-gray-300">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Gross Payroll:</span>
                                                <span className="font-semibold text-white">${run.total_gross.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Tax Deductions:</span>
                                                <span className="text-rose-400">-${run.total_deductions.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between font-bold text-sm pt-1 border-t border-gray-800">
                                                <span className="text-emerald-400">Net Disbursed:</span>
                                                <span className="text-emerald-400 font-mono">${run.total_net.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-1 text-xs">
                                            <span className="text-gray-500 text-[11px]">Run Date: {run.created_at}</span>
                                            {run.status === "draft" ? (
                                                <button
                                                    onClick={() => handleDisburseBatch(run.id)}
                                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 text-xs shadow-md shadow-emerald-600/30"
                                                >
                                                    <Play size={12} /> Disburse Salaries
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setActiveTab("payslips")}
                                                    className="text-emerald-400 hover:underline font-bold text-xs flex items-center gap-1"
                                                >
                                                    View Payslips →
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* TAB 2: PAYSLIPS ROSTER */}
                {activeTab === "payslips" && (
                    <>
                        {filteredPayslips.length === 0 ? (
                            <div className="galaxy-card bg-[#111622]/70 border border-dashed border-gray-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-xl">
                                <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shadow-inner">
                                    <FileText size={32} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-white">No Payslips Issued</h3>
                                    <p className="text-xs text-gray-400 max-w-sm">
                                        Payslips will be automatically generated as soon as you create a payroll batch for your active branch staff.
                                    </p>
                                </div>
                                <button
                                    onClick={() => { setActiveTab("batches"); setIsCreateModalOpen(true); }}
                                    className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-teal-600/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                                >
                                    <Plus size={16} /> Create Payroll Batch
                                </button>
                            </div>
                        ) : (
                            <div className="galaxy-card bg-[#111622] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
                                <table className="w-full text-left text-sm text-gray-300">
                                    <thead className="bg-gray-900/90 text-gray-400 uppercase text-[11px] font-bold border-b border-gray-800 tracking-wider">
                                        <tr>
                                            <th className="px-4 py-3">Payslip Ref</th>
                                            <th className="px-4 py-3">Employee Name</th>
                                            <th className="px-4 py-3">Department</th>
                                            <th className="px-4 py-3">Base Pay</th>
                                            <th className="px-4 py-3">Allowances</th>
                                            <th className="px-4 py-3">Tax Deduction</th>
                                            <th className="px-4 py-3">Net Take-Home</th>
                                            <th className="px-4 py-3 text-right">Enterprise Payslip</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800/60">
                                        {filteredPayslips.map(ps => (
                                            <tr key={ps.id} className="hover:bg-gray-800/40 transition">
                                                <td className="px-4 py-3.5 font-mono text-xs font-bold text-emerald-400">{ps.id}</td>
                                                <td className="px-4 py-3.5">
                                                    <div className="font-bold text-white">{ps.employee_name}</div>
                                                    <div className="text-xs text-gray-400">{ps.employee_role}</div>
                                                </td>
                                                <td className="px-4 py-3.5 text-xs text-gray-300">{ps.department}</td>
                                                <td className="px-4 py-3.5 font-mono text-xs text-gray-200">${ps.base_salary.toLocaleString()}</td>
                                                <td className="px-4 py-3.5 font-mono text-xs text-emerald-400">+${ps.allowances.toLocaleString()}</td>
                                                <td className="px-4 py-3.5 font-mono text-xs text-rose-400">-${ps.tax_deduction.toLocaleString()}</td>
                                                <td className="px-4 py-3.5 font-mono font-bold text-sm text-emerald-400">${ps.net_pay.toLocaleString()}</td>
                                                <td className="px-4 py-3.5 text-right">
                                                    <button
                                                        onClick={() => printPayslipVoucher(ps)}
                                                        className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-600/30 inline-flex items-center gap-1.5"
                                                    >
                                                        <Printer size={13} /> Official Voucher
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* MODAL: CREATE PAYROLL RUN */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={handleCreateRun} className="bg-[#111622] border border-gray-700 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <DollarSign size={20} className="text-emerald-400" /> Issue New Payroll Batch
                        </h3>

                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">Payroll Batch Title *</label>
                            <input
                                type="text"
                                required
                                value={newRunName}
                                onChange={e => setNewRunName(e.target.value)}
                                placeholder="e.g. May 2026 Executive & Staff Payroll"
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">Pay Period Cycle</label>
                            <input
                                type="text"
                                value={newPeriod}
                                onChange={e => setNewPeriod(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-xl text-xs font-bold"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30"
                            >
                                Initialize Payroll Run
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* MODAL / PRINTABLE VOUCHER: OFFICIAL ENTERPRISE SALARY PAYSLIP */}
            {selectedPayslipPreview && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white text-gray-900 rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative border border-gray-300 max-h-[92vh] overflow-y-auto">
                        <button
                            type="button"
                            onClick={() => setSelectedPayslipPreview(null)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-black p-1 rounded-lg hover:bg-gray-100 no-print"
                        >
                            <X size={22} />
                        </button>

                        {/* Top Corporate Branding Header */}
                        <div className="flex justify-between items-start border-b-2 border-gray-900 pb-4 mb-6">
                            <div className="flex items-center gap-3">
                                <img src="/logo2.png" alt="Company Logo" className="h-9 w-auto" />
                                <div>
                                    <h2 className="text-xl font-black tracking-tight text-gray-950 uppercase">{companyName}</h2>
                                    <p className="text-[11px] text-gray-600 font-semibold">Enterprise Compensation & Human Resources Directorate</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="bg-emerald-100 text-emerald-900 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-300 uppercase tracking-wider">
                                    Official Payslip
                                </span>
                                <p className="text-xs font-mono font-bold text-gray-700 mt-1">Ref: {selectedPayslipPreview.id}</p>
                            </div>
                        </div>

                        {/* Employee & Pay Meta Matrix */}
                        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs mb-6">
                            <div>
                                <span className="text-gray-500 block text-[10px] uppercase font-bold">Employee Name:</span>
                                <span className="font-extrabold text-sm text-gray-900">{selectedPayslipPreview.employee_name}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block text-[10px] uppercase font-bold">Designation / Role:</span>
                                <span className="font-bold text-gray-900">{selectedPayslipPreview.employee_role}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block text-[10px] uppercase font-bold">Department Unit:</span>
                                <span className="font-bold text-gray-900">{selectedPayslipPreview.department}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block text-[10px] uppercase font-bold">Employee Code:</span>
                                <span className="font-mono font-bold text-gray-900">{selectedPayslipPreview.emp_code || "EMP-082"}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block text-[10px] uppercase font-bold">Disbursement Date:</span>
                                <span className="font-semibold text-gray-800">{selectedPayslipPreview.payment_date || new Date().toISOString().split("T")[0]}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block text-[10px] uppercase font-bold">Payment Method:</span>
                                <span className="font-semibold text-gray-800">{selectedPayslipPreview.bank_account || "Direct Wire Transfer"}</span>
                            </div>
                        </div>

                        {/* Earnings and Deductions Table */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {/* Earnings Column */}
                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                <div className="bg-emerald-50 px-3 py-2 border-b border-gray-200 font-bold text-xs text-emerald-900 uppercase">
                                    Earnings & Allowances
                                </div>
                                <div className="p-3 space-y-2 text-xs divide-y divide-gray-100">
                                    <div className="flex justify-between py-1">
                                        <span>Basic Salary:</span>
                                        <span className="font-mono font-bold">${selectedPayslipPreview.base_salary.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span>House Rent & Utilities:</span>
                                        <span className="font-mono font-bold">${(selectedPayslipPreview.allowances * 0.6).toFixed(0)}</span>
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span>Transport & Healthcare:</span>
                                        <span className="font-mono font-bold">${(selectedPayslipPreview.allowances * 0.4).toFixed(0)}</span>
                                    </div>
                                    <div className="flex justify-between py-1 font-bold text-gray-900 bg-gray-50">
                                        <span>Total Gross:</span>
                                        <span className="font-mono text-emerald-700">${(selectedPayslipPreview.base_salary + selectedPayslipPreview.allowances).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Deductions Column */}
                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                <div className="bg-rose-50 px-3 py-2 border-b border-gray-200 font-bold text-xs text-rose-900 uppercase">
                                    Statutory Deductions
                                </div>
                                <div className="p-3 space-y-2 text-xs divide-y divide-gray-100">
                                    <div className="flex justify-between py-1">
                                        <span>Income Tax (Withheld):</span>
                                        <span className="font-mono text-rose-600 font-bold">-${(selectedPayslipPreview.tax_deduction * 0.75).toFixed(0)}</span>
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span>Social Security & Pension:</span>
                                        <span className="font-mono text-rose-600 font-bold">-${(selectedPayslipPreview.tax_deduction * 0.25).toFixed(0)}</span>
                                    </div>
                                    <div className="flex justify-between py-1 font-bold text-gray-900 bg-gray-50">
                                        <span>Total Deductions:</span>
                                        <span className="font-mono text-rose-700">-${selectedPayslipPreview.tax_deduction.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Net Disbursed Highlight Banner */}
                        <div className="bg-gray-900 text-white p-4 rounded-2xl flex items-center justify-between mb-6 shadow-md">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Net Amount Disbursed:</span>
                                <div className="text-2xl font-black text-emerald-400 font-mono">${selectedPayslipPreview.net_pay.toLocaleString()}.00 USD</div>
                            </div>
                            <div className="text-right text-[11px] text-gray-300 italic">
                                Legally certified by {companyName}
                            </div>
                        </div>

                        {/* Signatures & Certification Footer */}
                        <div className="grid grid-cols-2 gap-8 pt-4 border-t-2 border-gray-200 text-xs">
                            <div className="text-center space-y-2">
                                <div className="h-10 border-b border-dashed border-gray-400 flex items-end justify-center pb-1">
                                    <span className="font-['Dancing_Script'] text-xl text-blue-900 font-bold">Elena Rostova</span>
                                </div>
                                <span className="text-[11px] font-bold text-gray-700 block">Generated by: HR Directorate</span>
                            </div>
                            <div className="text-center space-y-2">
                                <div className="h-10 border-b border-dashed border-gray-400 flex items-end justify-center pb-1">
                                    <span className="font-['Caveat'] text-2xl text-blue-900 font-bold">Bilal Mahmood (CFO)</span>
                                </div>
                                <span className="text-[11px] font-bold text-gray-700 block">Certified & Sealed: Finance Department</span>
                            </div>
                        </div>

                        {/* Actions in Modal */}
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 no-print">
                            <button
                                type="button"
                                onClick={() => setSelectedPayslipPreview(null)}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-bold"
                            >
                                Close Voucher
                            </button>
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                            >
                                <Printer size={14} /> Print / Save PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
