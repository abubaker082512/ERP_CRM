"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { useBranchContext } from "@/lib/branchContext";
import {
  TAX_JURISDICTIONS,
  TaxJurisdiction,
  PayFrequency,
  HREmployeeRecord,
  LeaveRequest,
  OvertimeBonusEntry,
  EmployeeLoan,
  PayrollAuditLog,
  calculateGrossToNet,
} from "@/lib/payrollHrTypes";
import {
  DollarSign,
  Plus,
  Play,
  Calendar,
  Users,
  FileText,
  CheckCircle2,
  Clock,
  Download,
  Sparkles,
  Trash2,
  Eye,
  Shield,
  Printer,
  X,
  Building2,
  Briefcase,
  HeartPulse,
  Landmark,
  FileSpreadsheet,
  UserPlus,
  UserMinus,
  AlertCircle,
  Check,
  History,
  BadgeDollarSign,
  Scale,
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
  frequency?: PayFrequency;
  jurisdiction?: TaxJurisdiction;
  total_gross: number;
  total_deductions: number;
  total_net: number;
  total_employer_ctc?: number;
  total_income_tax?: number;
  total_social_pension?: number;
  employee_count: number;
  status: "draft" | "processing" | "disbursed";
  created_at: string;
};

export type Payslip = {
  id: string;
  run_id: string;
  employee_id?: string;
  employee_name: string;
  employee_role: string;
  department: string;
  base_salary: number;
  allowances: number;
  overtime_pay?: number;
  bonus_pay?: number;
  reimbursements?: number;
  lwp_deduction?: number;
  tax_deduction: number;
  social_pension_deduction?: number;
  health_deduction?: number;
  loan_deduction?: number;
  garnishment_deduction?: number;
  employer_ctc?: number;
  net_pay: number;
  status: "paid" | "pending";
  payment_date?: string;
  emp_code?: string;
  bank_account?: string;
  iban?: string;
  tax_id?: string;
  jurisdiction?: TaxJurisdiction;
  period?: string;
};

const DEFAULT_HR_EMPLOYEES: HREmployeeRecord[] = [
  {
    id: "EMP-001",
    empCode: "EMP-001",
    name: "Lead Executive",
    email: "executive@company.com",
    department: "Executive",
    role: "Managing Director",
    employmentType: "Full-Time",
    status: "Active",
    annualSalary: 132000,
    housingAllowancePct: 10,
    transportAllowancePct: 5,
    medicalAllowancePct: 3,
    jurisdiction: "US_FEDERAL",
    taxId: "XXX-XX-4821",
    bankName: "Chase Corporate",
    bankAccount: "****8821",
    ibanOrRouting: "021000021",
    joinDate: "2024-01-15",
    leaveBalanceDays: 18,
    healthPlan: "Executive",
    healthMonthlyPremium: 240,
    pensionContributionPct: 5,
    employerMatchPct: 5,
  },
];

type TabKey = "batches" | "payslips" | "hr_ops" | "leave_ot" | "benefits_loans" | "compliance";

export default function PayrollPage() {
  const { activeBranch, getEntityStorageKey } = useBranchContext();

  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [hrEmployees, setHrEmployees] = useState<HREmployeeRecord[]>(DEFAULT_HR_EMPLOYEES);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [variableEntries, setVariableEntries] = useState<OvertimeBonusEntry[]>([]);
  const [loans, setLoans] = useState<EmployeeLoan[]>([]);
  const [auditLogs, setAuditLogs] = useState<PayrollAuditLog[]>([]);

  const [activeTab, setActiveTab] = useState<TabKey>("batches");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [companyName, setCompanyName] = useState("BERAXIS Entity");

  // Create Payroll Run Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRunName, setNewRunName] = useState("");
  const [newPeriod, setNewPeriod] = useState("November 2026");
  const [newFrequency, setNewFrequency] = useState<PayFrequency>("Monthly");
  const [newJurisdiction, setNewJurisdiction] = useState<TaxJurisdiction>("US_FEDERAL");

  // Payslip Voucher Preview
  const [selectedPayslipPreview, setSelectedPayslipPreview] = useState<Payslip | null>(null);

  // HR Employee Add/Edit Modal
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmpId, setEditingEmpId] = useState<string | null>(null);
  const [empForm, setEmpForm] = useState<Omit<HREmployeeRecord, "id">>({
    empCode: "",
    name: "",
    email: "",
    phone: "",
    department: "Operations",
    role: "Specialist",
    employmentType: "Full-Time",
    status: "Active",
    annualSalary: 60000,
    housingAllowancePct: 10,
    transportAllowancePct: 5,
    medicalAllowancePct: 3,
    jurisdiction: "US_FEDERAL",
    taxId: "",
    bankName: "",
    bankAccount: "",
    ibanOrRouting: "",
    joinDate: new Date().toISOString().slice(0, 10),
    leaveBalanceDays: 20,
    healthPlan: "Basic",
    healthMonthlyPremium: 120,
    pensionContributionPct: 4,
    employerMatchPct: 4,
  });

  // Offboarding / F&F Settlement Modal
  const [isFnfOpen, setIsFnfOpen] = useState(false);
  const [fnfEmpId, setFnfEmpId] = useState("");
  const [fnfWorkedDays, setFnfWorkedDays] = useState(15);
  const [fnfGratuity, setFnfGratuity] = useState(0);
  const [fnfNoticeDeduction, setFnfNoticeDeduction] = useState(0);

  // Leave Form
  const [leaveEmpId, setLeaveEmpId] = useState("");
  const [leaveType, setLeaveType] = useState<LeaveRequest["type"]>("Annual");
  const [leaveStart, setLeaveStart] = useState(new Date().toISOString().slice(0, 10));
  const [leaveEnd, setLeaveEnd] = useState(new Date().toISOString().slice(0, 10));
  const [leaveDays, setLeaveDays] = useState(1);
  const [leaveReason, setLeaveReason] = useState("");

  // Overtime / Bonus Form
  const [varEmpId, setVarEmpId] = useState("");
  const [varCategory, setVarCategory] = useState<OvertimeBonusEntry["category"]>("Overtime");
  const [varHours, setVarHours] = useState(8);
  const [varAmount, setVarAmount] = useState(0);
  const [varNotes, setVarNotes] = useState("");

  // Loan Form
  const [loanEmpId, setLoanEmpId] = useState("");
  const [loanType, setLoanType] = useState<EmployeeLoan["type"]>("Salary Advance");
  const [loanPrincipal, setLoanPrincipal] = useState(1000);
  const [loanEmi, setLoanEmi] = useState(250);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 5000);
  };

  const appendAudit = (category: PayrollAuditLog["category"], action: string, details: string) => {
    const entry: PayrollAuditLog = {
      id: `AUD-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toLocaleString(),
      actor: "HR & Payroll Admin",
      action,
      details,
      category,
    };
    setAuditLogs((prev) => {
      const next = [entry, ...prev].slice(0, 100);
      try {
        localStorage.setItem(getEntityStorageKey("payroll_audit_logs"), JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Load entity-scoped Payroll + HR data
  useEffect(() => {
    if (!activeBranch) return;
    setCompanyName(activeBranch.name || "BERAXIS Entity");

    const loadJson = <T,>(suffix: string, fallback: T): T => {
      try {
        const raw = localStorage.getItem(getEntityStorageKey(suffix));
        if (raw) return JSON.parse(raw) as T;
      } catch {}
      return fallback;
    };

    setRuns(loadJson<PayrollRun[]>("payroll_runs", []));
    setPayslips(loadJson<Payslip[]>("payroll_payslips", []));
    setLeaveRequests(loadJson<LeaveRequest[]>("payroll_leaves", []));
    setVariableEntries(loadJson<OvertimeBonusEntry[]>("payroll_variable_entries", []));
    setLoans(loadJson<EmployeeLoan[]>("payroll_loans", []));
    setAuditLogs(loadJson<PayrollAuditLog[]>("payroll_audit_logs", []));

    // Load HR master or bootstrap from entity's employees list
    const savedHr = loadJson<HREmployeeRecord[]>("payroll_hr_employees", []);
    if (savedHr.length > 0) {
      setHrEmployees(savedHr);
    } else {
      const baseEmps = loadJson<any[]>("employees", []);
      if (baseEmps.length > 0) {
        const mapped: HREmployeeRecord[] = baseEmps.map((e, i) => ({
          id: e.id || `EMP-${String(i + 1).padStart(3, "0")}`,
          empCode: e.id || `EMP-${String(i + 1).padStart(3, "0")}`,
          name: e.name || "Employee",
          email: e.email || `emp${i + 1}@company.com`,
          phone: e.phone || "",
          department: e.department || "Operations",
          role: e.role || "Specialist",
          employmentType: "Full-Time",
          status: e.status === "On Leave" ? "On Leave" : "Active",
          annualSalary: Number(e.salary) || 60000,
          housingAllowancePct: 10,
          transportAllowancePct: 5,
          medicalAllowancePct: 3,
          jurisdiction: "US_FEDERAL",
          taxId: e.taxId || "",
          bankName: e.bankName || "Corporate Wire",
          bankAccount: e.bankAccount || "****0000",
          ibanOrRouting: e.iban || "",
          joinDate: e.joinDate || new Date().toISOString().slice(0, 10),
          leaveBalanceDays: 20,
          healthPlan: "Basic",
          healthMonthlyPremium: 120,
          pensionContributionPct: 4,
          employerMatchPct: 4,
        }));
        setHrEmployees(mapped);
      } else {
        setHrEmployees(DEFAULT_HR_EMPLOYEES);
      }
    }
  }, [activeBranch?.id, activeBranch?.name]);

  const persistHrEmployees = (next: HREmployeeRecord[]) => {
    setHrEmployees(next);
    try {
      localStorage.setItem(getEntityStorageKey("payroll_hr_employees"), JSON.stringify(next));
      // Sync back to /employees directory
      const directoryFormat = next.map((e) => ({
        id: e.empCode || e.id,
        name: e.name,
        email: e.email,
        phone: e.phone || "",
        department: e.department,
        role: e.role,
        salary: e.annualSalary,
        status: e.status,
        joinDate: e.joinDate,
      }));
      localStorage.setItem(getEntityStorageKey("employees"), JSON.stringify(directoryFormat));
    } catch {}
  };

  const persistRunsAndSlips = (updatedRuns: PayrollRun[], updatedSlips?: Payslip[]) => {
    setRuns(updatedRuns);
    try {
      localStorage.setItem(getEntityStorageKey("payroll_runs"), JSON.stringify(updatedRuns));
    } catch {}
    if (updatedSlips) {
      setPayslips(updatedSlips);
      try {
        localStorage.setItem(getEntityStorageKey("payroll_payslips"), JSON.stringify(updatedSlips));
      } catch {}
    }
  };

  // Create Automated Enterprise Payroll Batch
  const handleCreateRun = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRunName.trim()) return;

    const activeStaff = hrEmployees.filter((emp) => emp.status !== "Terminated");
    const staffPool = activeStaff.length > 0 ? activeStaff : DEFAULT_HR_EMPLOYEES;
    const runId = `PAY-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;
    let totalEmployerCtc = 0;
    let totalIncomeTax = 0;
    let totalSocialPension = 0;

    const newSlips: Payslip[] = [];
    const appliedEntryIds = new Set<string>();

    staffPool.forEach((emp, idx) => {
      const empForRun: HREmployeeRecord = { ...emp, jurisdiction: newJurisdiction || emp.jurisdiction };

      // Approved unpaid leave days
      const unpaidDays = leaveRequests
        .filter((l) => l.employeeId === emp.id && l.status === "Approved" && l.type === "Unpaid (LWP)")
        .reduce((sum, l) => sum + l.days, 0);

      // Approved variable entries (overtime, bonus, commission, reimbursement, arrears, garnishment)
      const empVars = variableEntries.filter((v) => v.employeeId === emp.id && v.status === "Approved");
      let overtimeAmount = 0;
      let bonusAmount = 0;
      let reimbursementAmount = 0;
      let arrearsAmount = 0;
      let garnishmentAmount = 0;

      empVars.forEach((v) => {
        appliedEntryIds.add(v.id);
        if (v.category === "Overtime") overtimeAmount += v.amount;
        else if (v.category === "Bonus" || v.category === "Commission") bonusAmount += v.amount;
        else if (v.category === "Reimbursement") reimbursementAmount += v.amount;
        else if (v.category === "Arrears") arrearsAmount += v.amount;
        else if (v.category === "Garnishment") garnishmentAmount += v.amount;
      });

      // Active loan EMI deduction
      const activeLoan = loans.find((ln) => ln.employeeId === emp.id && ln.status === "Active" && ln.remainingBalance > 0);
      const loanInstallment = activeLoan ? Math.min(activeLoan.monthlyInstallment, activeLoan.remainingBalance) : 0;

      const calc = calculateGrossToNet({
        emp: empForRun,
        frequency: newFrequency,
        overtimeAmount,
        bonusAmount,
        reimbursementAmount,
        arrearsAmount,
        unpaidLeaveDays: unpaidDays,
        loanInstallment,
        garnishmentAmount,
      });

      totalGross += calc.totalGross;
      totalDeductions += calc.totalDeductions;
      totalNet += calc.netPay;
      totalEmployerCtc += calc.employerTotalCost;
      totalIncomeTax += calc.incomeTax;
      totalSocialPension += calc.statutorySocial + calc.pensionDeduction;

      newSlips.push({
        id: `PS-${runId}-${idx + 1}`,
        run_id: runId,
        employee_id: emp.id,
        emp_code: emp.empCode || emp.id,
        employee_name: emp.name,
        employee_role: emp.role,
        department: emp.department,
        base_salary: calc.basePay,
        allowances: calc.allowances,
        overtime_pay: calc.overtimeAmount,
        bonus_pay: calc.bonusAmount + calc.arrearsAmount,
        reimbursements: calc.reimbursementAmount,
        lwp_deduction: calc.lwpDeduction,
        tax_deduction: calc.incomeTax,
        social_pension_deduction: calc.statutorySocial + calc.pensionDeduction,
        health_deduction: calc.healthDeduction,
        loan_deduction: calc.loanInstallment,
        garnishment_deduction: calc.garnishmentAmount,
        employer_ctc: calc.employerTotalCost,
        net_pay: calc.netPay,
        status: "pending",
        payment_date: new Date().toISOString().slice(0, 10),
        bank_account: `${emp.bankName || "Direct Wire"} (${emp.bankAccount || "****0000"})`,
        iban: emp.ibanOrRouting || "N/A",
        tax_id: emp.taxId || "On File",
        jurisdiction: empForRun.jurisdiction,
        period: newPeriod,
      });
    });

    // Mark applied variable entries
    if (appliedEntryIds.size > 0) {
      const updatedVars = variableEntries.map((v) =>
        appliedEntryIds.has(v.id) ? { ...v, status: "Applied" as const } : v
      );
      setVariableEntries(updatedVars);
      try {
        localStorage.setItem(getEntityStorageKey("payroll_variable_entries"), JSON.stringify(updatedVars));
      } catch {}
    }

    const newRun: PayrollRun = {
      id: runId,
      name: newRunName.trim(),
      period: newPeriod,
      frequency: newFrequency,
      jurisdiction: newJurisdiction,
      total_gross: totalGross,
      total_deductions: totalDeductions,
      total_net: totalNet,
      total_employer_ctc: totalEmployerCtc,
      total_income_tax: totalIncomeTax,
      total_social_pension: totalSocialPension,
      employee_count: staffPool.length,
      status: "draft",
      created_at: new Date().toISOString().slice(0, 10),
    };

    persistRunsAndSlips([newRun, ...runs], [...newSlips, ...payslips]);
    appendAudit("Payroll", "Created Payroll Batch", `${runId} (${newPeriod} · ${newFrequency}) for ${staffPool.length} staff. Net: $${totalNet.toLocaleString()}`);

    setIsCreateModalOpen(false);
    setNewRunName("");
    showToast(`Created Payroll Batch "${newRun.name}" (${staffPool.length} employees, Net $${totalNet.toLocaleString()})`);
  };

  const handleDisburseBatch = (id: string) => {
    const updatedRuns = runs.map((r) => (r.id === id ? { ...r, status: "disbursed" as const } : r));
    const updatedSlips = payslips.map((s) => (s.run_id === id ? { ...s, status: "paid" as const } : s));

    // Deduct loan balances for payslips in this batch
    const batchSlips = payslips.filter((s) => s.run_id === id && (s.loan_deduction || 0) > 0);
    if (batchSlips.length > 0) {
      const updatedLoans = loans.map((ln) => {
        const slip = batchSlips.find((s) => s.employee_id === ln.employeeId);
        if (!slip || ln.status !== "Active") return ln;
        const nextBal = Math.max(0, ln.remainingBalance - (slip.loan_deduction || 0));
        return {
          ...ln,
          remainingBalance: nextBal,
          status: nextBal === 0 ? ("Paid Off" as const) : ("Active" as const),
        };
      });
      setLoans(updatedLoans);
      try {
        localStorage.setItem(getEntityStorageKey("payroll_loans"), JSON.stringify(updatedLoans));
      } catch {}
    }

    persistRunsAndSlips(updatedRuns, updatedSlips);
    appendAudit("Payroll", "Disbursed Payroll Batch", `Batch ${id} marked Disbursed & payslips released to Employee Self-Service.`);
    showToast(`Disbursed salaries for Batch ${id} across all employee accounts!`);
  };

  const handleDeleteBatch = (id: string) => {
    persistRunsAndSlips(
      runs.filter((r) => r.id !== id),
      payslips.filter((s) => s.run_id !== id)
    );
    appendAudit("Payroll", "Deleted Payroll Batch", `Removed batch ${id} and associated draft payslips.`);
    showToast(`Removed batch ${id}.`);
  };

  // CSV Download Helper
  const downloadCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportMasterCSV = () => {
    downloadCsv(
      `enterprise_payroll_master_${new Date().toISOString().slice(0, 10)}.csv`,
      ["Payslip ID", "Run ID", "Emp Code", "Name", "Role", "Department", "Base", "Allowances", "Overtime", "Bonus", "Tax", "Social/Pension", "Health", "Loan", "Net Pay", "Employer CTC", "Status", "Bank"],
      payslips.map((ps) => [
        ps.id,
        ps.run_id,
        ps.emp_code || "",
        ps.employee_name,
        ps.employee_role,
        ps.department,
        ps.base_salary,
        ps.allowances,
        ps.overtime_pay || 0,
        ps.bonus_pay || 0,
        ps.tax_deduction,
        ps.social_pension_deduction || 0,
        ps.health_deduction || 0,
        ps.loan_deduction || 0,
        ps.net_pay,
        ps.employer_ctc || ps.net_pay,
        ps.status,
        ps.bank_account || "",
      ])
    );
    showToast("Exported Enterprise Master Payroll CSV!");
  };

  const handleExportBankACH = (runId?: string) => {
    const targetSlips = runId ? payslips.filter((s) => s.run_id === runId) : payslips;
    downloadCsv(
      `bank_ach_wps_disbursement_${runId || "all"}_${new Date().toISOString().slice(0, 10)}.csv`,
      ["Beneficiary Name", "Employee Code", "Bank & Account", "IBAN / Routing", "Currency", "Net Amount", "Payment Reference", "Value Date"],
      targetSlips.map((s) => [
        s.employee_name,
        s.emp_code || s.id,
        s.bank_account || "Direct Wire",
        s.iban || "N/A",
        TAX_JURISDICTIONS.find((j) => j.id === (s.jurisdiction || "US_FEDERAL"))?.currency || "USD",
        s.net_pay,
        `SAL-${s.run_id}-${s.emp_code || s.id}`,
        s.payment_date || new Date().toISOString().slice(0, 10),
      ])
    );
    appendAudit("Compliance", "Exported Bank ACH/WPS File", `Generated direct deposit file for ${targetSlips.length} employees.`);
    showToast("Downloaded Bank Direct Deposit (ACH / WPS) file!");
  };

  const handleExportGLJournal = () => {
    const grossSum = runs.reduce((a, r) => a + r.total_gross, 0);
    const taxSum = runs.reduce((a, r) => a + (r.total_income_tax || r.total_deductions), 0);
    const socialSum = runs.reduce((a, r) => a + (r.total_social_pension || 0), 0);
    const netSum = runs.reduce((a, r) => a + r.total_net, 0);
    downloadCsv(
      `payroll_gl_journal_${new Date().toISOString().slice(0, 10)}.csv`,
      ["Account Code", "Account Name", "Debit", "Credit", "Memo"],
      [
        ["6100", "Salaries & Wages Expense", grossSum, 0, `${companyName} Payroll Gross`],
        ["2110", "Income Tax Withholding Payable", 0, taxSum, "Statutory Tax Liability"],
        ["2120", "Social Security / Pension Payable", 0, socialSum, "Employee & Statutory Contributions"],
        ["2100", "Net Salaries & Wages Payable", 0, netSum, "Direct Deposit Clearing"],
      ]
    );
    appendAudit("Compliance", "Exported GL Journal", `Generated Accounting General Ledger entries totaling $${grossSum.toLocaleString()}.`);
    showToast("Exported Accounting General Ledger (GL) Journal CSV!");
  };

  // Save HR Employee
  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empForm.name.trim()) return;
    if (editingEmpId) {
      const next = hrEmployees.map((emp) => (emp.id === editingEmpId ? { ...empForm, id: editingEmpId } : emp));
      persistHrEmployees(next);
      appendAudit("HR", "Updated Employee Record", `Updated HR & compensation profile for ${empForm.name} ($${empForm.annualSalary.toLocaleString()}/yr).`);
      showToast(`Updated HR profile for ${empForm.name}`);
    } else {
      const id = empForm.empCode.trim() || `EMP-${String(hrEmployees.length + 1).padStart(3, "0")}`;
      const newEmp: HREmployeeRecord = { ...empForm, id, empCode: id };
      persistHrEmployees([newEmp, ...hrEmployees]);
      appendAudit("HR", "Onboarded Employee", `Onboarded ${newEmp.name} (${newEmp.role} · ${newEmp.department}) at $${newEmp.annualSalary.toLocaleString()}/yr.`);
      showToast(`Onboarded ${newEmp.name} into HR & Payroll!`);
    }
    setIsEmployeeModalOpen(false);
    setEditingEmpId(null);
  };

  // Full & Final (F&F) Settlement Calculator & Off-Cycle Issuance
  const fnfSelectedEmp = hrEmployees.find((e) => e.id === fnfEmpId) || hrEmployees[0];
  const fnfCalc = useMemo(() => {
    if (!fnfSelectedEmp) return null;
    const monthly = Math.round(fnfSelectedEmp.annualSalary / 12);
    const daily = Math.round(monthly / 22);
    const proRataPay = Math.max(0, fnfWorkedDays * daily);
    const leaveEncashment = Math.max(0, fnfSelectedEmp.leaveBalanceDays * daily);
    const activeLoanBal = loans
      .filter((l) => l.employeeId === fnfSelectedEmp.id && l.status === "Active")
      .reduce((s, l) => s + l.remainingBalance, 0);
    const netSettlement = Math.max(0, proRataPay + leaveEncashment + fnfGratuity - fnfNoticeDeduction - activeLoanBal);
    return { monthly, daily, proRataPay, leaveEncashment, activeLoanBal, netSettlement };
  }, [fnfSelectedEmp, fnfWorkedDays, fnfGratuity, fnfNoticeDeduction, loans]);

  const handleIssueFnF = () => {
    if (!fnfSelectedEmp || !fnfCalc) return;
    const runId = `FNF-${Date.now().toString().slice(-5)}`;
    const fnfRun: PayrollRun = {
      id: runId,
      name: `F&F Settlement — ${fnfSelectedEmp.name}`,
      period: new Date().toISOString().slice(0, 7),
      frequency: "Off-Cycle",
      jurisdiction: fnfSelectedEmp.jurisdiction,
      total_gross: fnfCalc.proRataPay + fnfCalc.leaveEncashment + fnfGratuity,
      total_deductions: fnfNoticeDeduction + fnfCalc.activeLoanBal,
      total_net: fnfCalc.netSettlement,
      total_employer_ctc: fnfCalc.netSettlement,
      employee_count: 1,
      status: "draft",
      created_at: new Date().toISOString().slice(0, 10),
    };
    const fnfSlip: Payslip = {
      id: `PS-${runId}`,
      run_id: runId,
      employee_id: fnfSelectedEmp.id,
      emp_code: fnfSelectedEmp.empCode,
      employee_name: fnfSelectedEmp.name,
      employee_role: fnfSelectedEmp.role,
      department: fnfSelectedEmp.department,
      base_salary: fnfCalc.proRataPay,
      allowances: fnfCalc.leaveEncashment + fnfGratuity,
      tax_deduction: fnfNoticeDeduction,
      loan_deduction: fnfCalc.activeLoanBal,
      net_pay: fnfCalc.netSettlement,
      status: "pending",
      payment_date: new Date().toISOString().slice(0, 10),
      bank_account: `${fnfSelectedEmp.bankName || "Wire"} (${fnfSelectedEmp.bankAccount || "****"})`,
      period: "Full & Final Settlement",
    };

    persistRunsAndSlips([fnfRun, ...runs], [fnfSlip, ...payslips]);
    persistHrEmployees(
      hrEmployees.map((e) => (e.id === fnfSelectedEmp.id ? { ...e, status: "Terminated", leaveBalanceDays: 0 } : e))
    );
    appendAudit("Settlement", "Issued Full & Final Settlement", `Offboarded ${fnfSelectedEmp.name} with net F&F settlement of $${fnfCalc.netSettlement.toLocaleString()}.`);
    setIsFnfOpen(false);
    setActiveTab("batches");
    showToast(`Issued Full & Final Settlement for ${fnfSelectedEmp.name} ($${fnfCalc.netSettlement.toLocaleString()})`);
  };

  // Leave Submit & Approve
  const handleAddLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = hrEmployees.find((x) => x.id === (leaveEmpId || hrEmployees[0]?.id));
    if (!emp) return;
    const req: LeaveRequest = {
      id: `LV-${Date.now().toString().slice(-5)}`,
      employeeId: emp.id,
      employeeName: emp.name,
      type: leaveType,
      startDate: leaveStart,
      endDate: leaveEnd,
      days: Math.max(1, Number(leaveDays) || 1),
      reason: leaveReason || "Requested via HR Operations",
      status: "Pending",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    const next = [req, ...leaveRequests];
    setLeaveRequests(next);
    try { localStorage.setItem(getEntityStorageKey("payroll_leaves"), JSON.stringify(next)); } catch {}
    setLeaveReason("");
    showToast(`Submitted ${req.type} leave request for ${emp.name}`);
  };

  const handleLeaveAction = (id: string, status: "Approved" | "Rejected") => {
    const target = leaveRequests.find((l) => l.id === id);
    const next = leaveRequests.map((l) => (l.id === id ? { ...l, status } : l));
    setLeaveRequests(next);
    try { localStorage.setItem(getEntityStorageKey("payroll_leaves"), JSON.stringify(next)); } catch {}
    if (status === "Approved" && target && target.type !== "Unpaid (LWP)") {
      persistHrEmployees(
        hrEmployees.map((e) =>
          e.id === target.employeeId ? { ...e, leaveBalanceDays: Math.max(0, e.leaveBalanceDays - target.days) } : e
        )
      );
    }
    appendAudit("HR", `Leave ${status}`, `${target?.employeeName} (${target?.type}, ${target?.days}d) -> ${status}`);
    showToast(`Leave request ${status.toLowerCase()}!`);
  };

  // Overtime / Bonus Entry
  const handleAddVariableEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = hrEmployees.find((x) => x.id === (varEmpId || hrEmployees[0]?.id));
    if (!emp) return;
    const hourlyRate = Math.round(emp.annualSalary / 2080);
    const computedAmount =
      varCategory === "Overtime" && varAmount <= 0
        ? Math.round(hourlyRate * 1.5 * Math.max(1, varHours))
        : Math.max(1, Number(varAmount) || 0);

    const entry: OvertimeBonusEntry = {
      id: `VAR-${Date.now().toString().slice(-5)}`,
      employeeId: emp.id,
      employeeName: emp.name,
      category: varCategory,
      hours: varCategory === "Overtime" ? varHours : undefined,
      amount: computedAmount,
      period: newPeriod,
      notes: varNotes || `${varCategory} adjustment`,
      status: "Approved",
    };
    const next = [entry, ...variableEntries];
    setVariableEntries(next);
    try { localStorage.setItem(getEntityStorageKey("payroll_variable_entries"), JSON.stringify(next)); } catch {}
    setVarAmount(0);
    setVarNotes("");
    appendAudit("Payroll", `Added ${varCategory}`, `${emp.name}: $${computedAmount.toLocaleString()} queued for next payroll run.`);
    showToast(`Queued ${varCategory} ($${computedAmount.toLocaleString()}) for ${emp.name}`);
  };

  // Issue Loan / Advance
  const handleIssueLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = hrEmployees.find((x) => x.id === (loanEmpId || hrEmployees[0]?.id));
    if (!emp) return;
    const newLoan: EmployeeLoan = {
      id: `LN-${Date.now().toString().slice(-5)}`,
      employeeId: emp.id,
      employeeName: emp.name,
      type: loanType,
      principal: Math.max(50, Number(loanPrincipal) || 500),
      monthlyInstallment: Math.max(25, Number(loanEmi) || 100),
      remainingBalance: Math.max(50, Number(loanPrincipal) || 500),
      status: "Active",
      issuedDate: new Date().toISOString().slice(0, 10),
    };
    const next = [newLoan, ...loans];
    setLoans(next);
    try { localStorage.setItem(getEntityStorageKey("payroll_loans"), JSON.stringify(next)); } catch {}
    appendAudit("Benefits", `Issued ${loanType}`, `${emp.name}: $${newLoan.principal.toLocaleString()} (EMI $${newLoan.monthlyInstallment}/cycle)`);
    showToast(`Issued ${loanType} ($${newLoan.principal.toLocaleString()}) to ${emp.name}`);
  };

  const filteredPayslips = payslips.filter(
    (ps) =>
      ps.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ps.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ps.employee_role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ps.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalDisbursed = runs.filter((r) => r.status === "disbursed").reduce((acc, r) => acc + r.total_net, 0);
  const totalTaxLiability = runs.reduce((acc, r) => acc + (r.total_income_tax || r.total_deductions), 0);
  const totalEmployerCost = runs.reduce((acc, r) => acc + (r.total_employer_ctc || r.total_gross), 0);
  const activeHeadcount = hrEmployees.filter((e) => e.status !== "Terminated").length;

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0d14] text-white">
      <StandardModuleHeader
        moduleName="Payroll & Full HR"
        moduleIcon={<DollarSign size={20} className="text-emerald-400" />}
        menuItems={MENU_ITEMS}
        searchPlaceholder="Search payslips, employees, departments..."
        onSearch={setSearchQuery}
        onNewClick={() => setIsCreateModalOpen(true)}
        newButtonText="+ New Payroll Run"
      />

      {toastMsg && (
        <div className="fixed top-16 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl shadow-emerald-900/50 flex items-center gap-3 border border-emerald-400 animate-in fade-in slide-in-from-top-4 duration-300">
          <Sparkles size={18} className="text-emerald-200" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

      <div className="flex-1 p-4 sm:p-6 space-y-5 max-w-7xl mx-auto w-full">
        {/* Quick HR Operations Navigation Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-[#111622]/90 border border-gray-800 rounded-2xl px-4 py-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
            <Briefcase size={15} className="text-emerald-400" />
            <span>Integrated HR & Payroll Operations ({companyName})</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
            <Link href="/employees" className="px-2.5 py-1 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-200 transition">Employees</Link>
            <Link href="/employees/contracts" className="px-2.5 py-1 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-200 transition">Contracts</Link>
            <Link href="/attendances" className="px-2.5 py-1 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-200 transition">Attendances</Link>
            <Link href="/recruitment" className="px-2.5 py-1 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-200 transition">Recruitment</Link>
            <Link href="/approvals" className="px-2.5 py-1 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-200 transition">Approvals</Link>
            <Link href="/team" className="px-2.5 py-1 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-200 transition">Team Seats</Link>
          </div>
        </div>

        {/* KPI Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="galaxy-card p-4 border border-emerald-500/20 bg-emerald-950/10 rounded-2xl flex items-center justify-between shadow-xl">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Net Disbursed</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">${totalDisbursed.toLocaleString()}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{runs.length} payroll batch(es)</p>
            </div>
            <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400"><DollarSign size={22} /></div>
          </div>

          <div className="galaxy-card p-4 border border-blue-500/20 bg-blue-950/10 rounded-2xl flex items-center justify-between shadow-xl">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Employer CTC</p>
              <h3 className="text-2xl font-bold text-blue-400 mt-1">${totalEmployerCost.toLocaleString()}</h3>
              <p className="text-xs text-gray-400 mt-0.5">Incl. employer tax & match</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400"><Building2 size={22} /></div>
          </div>

          <div className="galaxy-card p-4 border border-purple-500/20 bg-purple-950/10 rounded-2xl flex items-center justify-between shadow-xl">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">HR Workforce</p>
              <h3 className="text-2xl font-bold text-purple-400 mt-1">{activeHeadcount} Active</h3>
              <p className="text-xs text-gray-400 mt-0.5">{leaveRequests.filter((l) => l.status === "Pending").length} pending leave reqs</p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400"><Users size={22} /></div>
          </div>

          <div className="galaxy-card p-4 border border-cyan-500/20 bg-cyan-950/10 rounded-2xl flex items-center justify-between shadow-xl">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tax Withheld</p>
              <h3 className="text-2xl font-bold text-cyan-400 mt-1">${totalTaxLiability.toLocaleString()}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{auditLogs.length} audit events logged</p>
            </div>
            <div className="p-3 bg-cyan-500/20 rounded-xl text-cyan-400"><Shield size={22} /></div>
          </div>
        </div>

        {/* Tab Bar + Actions */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-[#111622] p-3.5 rounded-2xl border border-gray-800">
          <div className="flex flex-wrap gap-1.5 bg-gray-900/80 p-1 rounded-xl border border-gray-800">
            {[
              { id: "batches" as TabKey, label: `Payroll Batches (${runs.length})` },
              { id: "payslips" as TabKey, label: `Payslips (${payslips.length})` },
              { id: "hr_ops" as TabKey, label: `Full HR & F&F (${hrEmployees.length})` },
              { id: "leave_ot" as TabKey, label: `Leave & Overtime (${leaveRequests.length})` },
              { id: "benefits_loans" as TabKey, label: `Benefits & Loans (${loans.length})` },
              { id: "compliance" as TabKey, label: "Tax, GL & Audit" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === t.id ? "bg-emerald-600 text-white shadow-md" : "text-gray-400 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => handleExportBankACH()} className="bg-gray-800/90 hover:bg-gray-700 text-gray-200 border border-gray-700 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
              <Landmark size={14} className="text-cyan-400" /> Bank ACH / WPS
            </button>
            <button onClick={handleExportMasterCSV} className="bg-gray-800/90 hover:bg-gray-700 text-gray-200 border border-gray-700 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
              <Download size={14} className="text-emerald-400" /> Master CSV
            </button>
            <button onClick={() => setIsCreateModalOpen(true)} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer">
              <Plus size={15} /> Run Payroll
            </button>
          </div>
        </div>

        {/* TAB 1: PAYROLL BATCHES */}
        {activeTab === "batches" && (
          <>
            {runs.length === 0 ? (
              <div className="galaxy-card bg-[#111622]/70 border border-dashed border-gray-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Calendar size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">No Payroll Runs Generated Yet</h3>
                  <p className="text-xs text-gray-400 max-w-md">
                    Run automated Gross-to-Net payroll with progressive tax brackets, statutory social deductions, overtime, unpaid leave (LWP), benefits, and loan EMIs.
                  </p>
                </div>
                <button onClick={() => setIsCreateModalOpen(true)} className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer">
                  <Plus size={16} /> Issue First Payroll Batch
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {runs.map((run) => (
                  <div key={run.id} className="galaxy-card p-5 border border-gray-800 hover:border-emerald-500/40 bg-[#111622] rounded-2xl space-y-4 shadow-xl">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">{run.id} • {run.period} • {run.frequency || "Monthly"}</span>
                        <h3 className="text-base font-bold text-white mt-1">{run.name}</h3>
                        <p className="text-xs text-gray-400">{run.employee_count} Employee(s) • {run.jurisdiction || "US_FEDERAL"}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${run.status === "disbursed" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                        {run.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-gray-900/60 p-3 rounded-xl border border-gray-800/80 text-center">
                      <div>
                        <p className="text-[10px] text-gray-400">Gross</p>
                        <p className="text-xs font-bold text-white">${run.total_gross.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400">Deductions</p>
                        <p className="text-xs font-bold text-rose-400">-${run.total_deductions.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400">Net Pay</p>
                        <p className="text-xs font-bold text-emerald-400">${run.total_net.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {run.status !== "disbursed" ? (
                        <button onClick={() => handleDisburseBatch(run.id)} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                          <Play size={13} /> Disburse
                        </button>
                      ) : (
                        <button onClick={() => setActiveTab("payslips")} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-200 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                          <Eye size={13} /> Payslips
                        </button>
                      )}
                      <button onClick={() => handleExportBankACH(run.id)} title="Export ACH / Bank Wire" className="p-2 bg-gray-800 hover:bg-gray-700 text-cyan-400 rounded-xl cursor-pointer">
                        <Landmark size={15} />
                      </button>
                      <button onClick={() => handleDeleteBatch(run.id)} title="Delete Batch" className="p-2 bg-gray-800 hover:bg-rose-900/50 text-rose-400 rounded-xl cursor-pointer">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* TAB 2: PAYSLIPS */}
        {activeTab === "payslips" && (
          <div className="galaxy-card bg-[#111622] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-900/90 text-gray-400 uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Period</th>
                    <th className="px-4 py-3 text-right">Base + Allow</th>
                    <th className="px-4 py-3 text-right">OT / Bonus</th>
                    <th className="px-4 py-3 text-right">Tax & Social</th>
                    <th className="px-4 py-3 text-right">Benefits / Loan</th>
                    <th className="px-4 py-3 text-right">Net Pay</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Voucher</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/70">
                  {filteredPayslips.length === 0 ? (
                    <tr><td colSpan={9} className="px-4 py-10 text-center text-gray-500">No payslips found. Run a payroll batch first.</td></tr>
                  ) : (
                    filteredPayslips.map((ps) => (
                      <tr key={ps.id} className="hover:bg-gray-900/40">
                        <td className="px-4 py-3">
                          <div className="font-bold text-white">{ps.employee_name}</div>
                          <div className="text-[10px] text-gray-400">{ps.emp_code} • {ps.employee_role} • {ps.department}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-300">{ps.period || ps.payment_date}</td>
                        <td className="px-4 py-3 text-right text-gray-200">${(ps.base_salary + ps.allowances).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-cyan-400">+${((ps.overtime_pay || 0) + (ps.bonus_pay || 0) + (ps.reimbursements || 0)).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-rose-400">-${(ps.tax_deduction + (ps.social_pension_deduction || 0)).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-amber-400">-${((ps.health_deduction || 0) + (ps.loan_deduction || 0) + (ps.lwp_deduction || 0)).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-400">${ps.net_pay.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${ps.status === "paid" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>{ps.status}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => setSelectedPayslipPreview(ps)} className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer">
                            <Printer size={12} /> View / Print
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: FULL HR OPERATIONS (EMPLOYEE MASTER, ONBOARDING & OFFBOARDING F&F) */}
        {activeTab === "hr_ops" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111622] p-4 rounded-2xl border border-gray-800">
              <div>
                <h3 className="text-sm font-bold text-white">Employee Master, Compensation & Offboarding</h3>
                <p className="text-xs text-gray-400">Synced with Employees directory. Configure salary structures, tax IDs, bank IBAN, benefits & Full-and-Final (F&F) settlements.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setFnfEmpId(hrEmployees[0]?.id || "");
                    setIsFnfOpen(true);
                  }}
                  className="bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-300 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <UserMinus size={14} /> Full & Final (F&F) Settlement
                </button>
                <button
                  onClick={() => {
                    setEditingEmpId(null);
                    setEmpForm({
                      empCode: `EMP-${String(hrEmployees.length + 1).padStart(3, "0")}`,
                      name: "",
                      email: "",
                      phone: "",
                      department: "Operations",
                      role: "Specialist",
                      employmentType: "Full-Time",
                      status: "Active",
                      annualSalary: 60000,
                      housingAllowancePct: 10,
                      transportAllowancePct: 5,
                      medicalAllowancePct: 3,
                      jurisdiction: "US_FEDERAL",
                      taxId: "",
                      bankName: "",
                      bankAccount: "",
                      ibanOrRouting: "",
                      joinDate: new Date().toISOString().slice(0, 10),
                      leaveBalanceDays: 20,
                      healthPlan: "Basic",
                      healthMonthlyPremium: 120,
                      pensionContributionPct: 4,
                      employerMatchPct: 4,
                    });
                    setIsEmployeeModalOpen(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus size={14} /> Onboard Employee
                </button>
              </div>
            </div>

            <div className="galaxy-card bg-[#111622] border border-gray-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-900/90 text-gray-400 uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Employee</th>
                      <th className="px-4 py-3">Type & Status</th>
                      <th className="px-4 py-3 text-right">Annual Base</th>
                      <th className="px-4 py-3">Jurisdiction & Tax ID</th>
                      <th className="px-4 py-3">Bank / IBAN</th>
                      <th className="px-4 py-3 text-center">Leave Bal</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/70">
                    {hrEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-gray-900/40">
                        <td className="px-4 py-3">
                          <div className="font-bold text-white">{emp.name}</div>
                          <div className="text-[10px] text-gray-400">{emp.empCode} • {emp.role} • {emp.department}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-semibold text-gray-300 block">{emp.employmentType}</span>
                          <span className={`text-[10px] font-bold ${emp.status === "Active" ? "text-emerald-400" : emp.status === "Terminated" ? "text-rose-400" : "text-amber-400"}`}>{emp.status}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-400">${emp.annualSalary.toLocaleString()}/yr</td>
                        <td className="px-4 py-3 text-gray-300">
                          <div>{emp.jurisdiction}</div>
                          <div className="text-[10px] text-gray-500">Tax ID: {emp.taxId || "Not set"}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-300">
                          <div>{emp.bankName || "Wire"} {emp.bankAccount}</div>
                          <div className="text-[10px] text-gray-500">{emp.ibanOrRouting || "—"}</div>
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-cyan-400">{emp.leaveBalanceDays}d</td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingEmpId(emp.id);
                              setEmpForm({ ...emp });
                              setIsEmployeeModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-[11px] font-semibold cursor-pointer"
                          >
                            Edit HR
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LEAVE, OVERTIME & VARIABLE PAY */}
        {activeTab === "leave_ot" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Leave Requests */}
            <div className="galaxy-card bg-[#111622] border border-gray-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><Calendar size={16} className="text-purple-400" /> Leave & Absence Management (Syncs LWP to Payroll)</h3>
              <form onSubmit={handleAddLeave} className="grid grid-cols-2 gap-2.5 bg-gray-900/60 p-3.5 rounded-xl border border-gray-800">
                <select value={leaveEmpId} onChange={(e) => setLeaveEmpId(e.target.value)} className="bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-2 text-xs text-white">
                  {hrEmployees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
                <select value={leaveType} onChange={(e) => setLeaveType(e.target.value as any)} className="bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-2 text-xs text-white">
                  <option value="Annual">Annual Leave</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Casual">Casual Leave</option>
                  <option value="Unpaid (LWP)">Unpaid Leave (LWP - Deducts Pay)</option>
                  <option value="Parental">Parental Leave</option>
                </select>
                <input type="date" value={leaveStart} onChange={(e) => setLeaveStart(e.target.value)} className="bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-2 text-xs text-white" />
                <input type="number" min={1} value={leaveDays} onChange={(e) => setLeaveDays(Number(e.target.value))} placeholder="Days" className="bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-2 text-xs text-white" />
                <input type="text" value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} placeholder="Reason..." className="col-span-2 bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-2 text-xs text-white" />
                <button type="submit" className="col-span-2 bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-lg text-xs font-bold cursor-pointer">Submit Leave Request</button>
              </form>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {leaveRequests.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4">No leave requests logged.</p>
                ) : (
                  leaveRequests.map((lv) => (
                    <div key={lv.id} className="flex items-center justify-between bg-gray-900/50 border border-gray-800 rounded-xl px-3 py-2.5 text-xs">
                      <div>
                        <div className="font-bold text-white">{lv.employeeName} • <span className="text-purple-300">{lv.type}</span> ({lv.days}d)</div>
                        <div className="text-[10px] text-gray-400">{lv.startDate} • {lv.reason}</div>
                      </div>
                      {lv.status === "Pending" ? (
                        <div className="flex gap-1.5">
                          <button onClick={() => handleLeaveAction(lv.id, "Approved")} className="px-2 py-1 bg-emerald-600 rounded-lg text-[10px] font-bold cursor-pointer">Approve</button>
                          <button onClick={() => handleLeaveAction(lv.id, "Rejected")} className="px-2 py-1 bg-rose-600 rounded-lg text-[10px] font-bold cursor-pointer">Reject</button>
                        </div>
                      ) : (
                        <span className={`text-[10px] font-bold ${lv.status === "Approved" ? "text-emerald-400" : "text-rose-400"}`}>{lv.status}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Overtime, Bonuses, Arrears, Reimbursements */}
            <div className="galaxy-card bg-[#111622] border border-gray-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><Clock size={16} className="text-cyan-400" /> Overtime (1.5x), Bonuses, Arrears & Garnishments</h3>
              <form onSubmit={handleAddVariableEntry} className="grid grid-cols-2 gap-2.5 bg-gray-900/60 p-3.5 rounded-xl border border-gray-800">
                <select value={varEmpId} onChange={(e) => setVarEmpId(e.target.value)} className="bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-2 text-xs text-white">
                  {hrEmployees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
                <select value={varCategory} onChange={(e) => setVarCategory(e.target.value as any)} className="bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-2 text-xs text-white">
                  <option value="Overtime">Overtime (Auto 1.5x)</option>
                  <option value="Bonus">Performance Bonus</option>
                  <option value="Commission">Sales Commission</option>
                  <option value="Reimbursement">Expense Reimbursement</option>
                  <option value="Arrears">Retroactive Arrears</option>
                  <option value="Garnishment">Wage Garnishment (Deduction)</option>
                </select>
                {varCategory === "Overtime" ? (
                  <input type="number" min={1} value={varHours} onChange={(e) => setVarHours(Number(e.target.value))} placeholder="Overtime Hours" className="bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-2 text-xs text-white" />
                ) : (
                  <input type="number" min={1} value={varAmount} onChange={(e) => setVarAmount(Number(e.target.value))} placeholder="Amount ($)" className="bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-2 text-xs text-white" />
                )}
                <input type="text" value={varNotes} onChange={(e) => setVarNotes(e.target.value)} placeholder="Notes / Shift ref" className="bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-2 text-xs text-white" />
                <button type="submit" className="col-span-2 bg-cyan-600 hover:bg-cyan-500 text-white py-2 rounded-lg text-xs font-bold cursor-pointer">Queue for Next Payroll Run</button>
              </form>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {variableEntries.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4">No overtime or variable pay entries queued.</p>
                ) : (
                  variableEntries.map((v) => (
                    <div key={v.id} className="flex items-center justify-between bg-gray-900/50 border border-gray-800 rounded-xl px-3 py-2.5 text-xs">
                      <div>
                        <div className="font-bold text-white">{v.employeeName} • <span className="text-cyan-300">{v.category}</span></div>
                        <div className="text-[10px] text-gray-400">{v.hours ? `${v.hours} hrs • ` : ""}{v.notes}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-emerald-400">${v.amount.toLocaleString()}</div>
                        <div className="text-[10px] text-gray-400">{v.status}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: BENEFITS & LOANS */}
        {activeTab === "benefits_loans" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="galaxy-card bg-[#111622] border border-gray-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><HeartPulse size={16} className="text-rose-400" /> Benefits, Health Insurance & Retirement Match</h3>
              <div className="space-y-2.5">
                {hrEmployees.map((emp) => (
                  <div key={emp.id} className="flex items-center justify-between bg-gray-900/50 border border-gray-800 rounded-xl p-3 text-xs">
                    <div>
                      <div className="font-bold text-white">{emp.name}</div>
                      <div className="text-[10px] text-gray-400">Health: {emp.healthPlan} (${emp.healthMonthlyPremium}/mo) • Pension: {emp.pensionContributionPct}% + {emp.employerMatchPct}% Match</div>
                    </div>
                    <button
                      onClick={() => { setEditingEmpId(emp.id); setEmpForm({ ...emp }); setIsEmployeeModalOpen(true); }}
                      className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-[11px] font-semibold cursor-pointer"
                    >
                      Configure
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="galaxy-card bg-[#111622] border border-gray-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><BadgeDollarSign size={16} className="text-amber-400" /> Employee Loans & Salary Advances (Auto-EMI)</h3>
              <form onSubmit={handleIssueLoan} className="grid grid-cols-2 gap-2.5 bg-gray-900/60 p-3.5 rounded-xl border border-gray-800">
                <select value={loanEmpId} onChange={(e) => setLoanEmpId(e.target.value)} className="bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-2 text-xs text-white">
                  {hrEmployees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
                <select value={loanType} onChange={(e) => setLoanType(e.target.value as any)} className="bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-2 text-xs text-white">
                  <option value="Salary Advance">Salary Advance</option>
                  <option value="Personal Loan">Personal Loan</option>
                  <option value="Equipment Loan">Equipment Loan</option>
                </select>
                <input type="number" min={50} value={loanPrincipal} onChange={(e) => setLoanPrincipal(Number(e.target.value))} placeholder="Principal ($)" className="bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-2 text-xs text-white" />
                <input type="number" min={25} value={loanEmi} onChange={(e) => setLoanEmi(Number(e.target.value))} placeholder="Monthly EMI ($)" className="bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-2 text-xs text-white" />
                <button type="submit" className="col-span-2 bg-amber-600 hover:bg-amber-500 text-white py-2 rounded-lg text-xs font-bold cursor-pointer">Issue Loan / Advance</button>
              </form>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {loans.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4">No active employee loans or advances.</p>
                ) : (
                  loans.map((ln) => (
                    <div key={ln.id} className="flex items-center justify-between bg-gray-900/50 border border-gray-800 rounded-xl px-3 py-2.5 text-xs">
                      <div>
                        <div className="font-bold text-white">{ln.employeeName} • {ln.type}</div>
                        <div className="text-[10px] text-gray-400">Principal: ${ln.principal.toLocaleString()} • EMI: ${ln.monthlyInstallment}/cycle</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-amber-400">Bal: ${ln.remainingBalance.toLocaleString()}</div>
                        <div className="text-[10px] text-emerald-400">{ln.status}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: TAX COMPLIANCE, GL & AUDIT TRAIL */}
        {activeTab === "compliance" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="galaxy-card bg-[#111622] border border-gray-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><Scale size={16} className="text-emerald-400" /> Statutory Tax & GL Exports</h3>
              <p className="text-xs text-gray-400">Download statutory filings, bank direct deposit files, and General Ledger journal entries for your Accounting team.</p>
              <div className="space-y-2.5">
                <button onClick={handleExportGLJournal} className="w-full py-2.5 px-4 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer">
                  <span>Export Accounting GL Journal</span> <FileSpreadsheet size={15} />
                </button>
                <button onClick={() => handleExportBankACH()} className="w-full py-2.5 px-4 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-300 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer">
                  <span>Export Bank ACH / WPS Disbursement</span> <Landmark size={15} />
                </button>
                <button onClick={handleExportMasterCSV} className="w-full py-2.5 px-4 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer">
                  <span>Export Tax & Payroll Master CSV</span> <Download size={15} />
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 galaxy-card bg-[#111622] border border-gray-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><History size={16} className="text-cyan-400" /> Immutable Payroll & HR Audit Trail</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {auditLogs.length === 0 ? (
                  <p className="text-xs text-gray-500 py-6 text-center">Audit events will appear here as you run payroll, onboard staff, or approve leaves.</p>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log.id} className="flex items-start justify-between gap-3 bg-gray-900/50 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-gray-800 text-cyan-300 mr-2">{log.category}</span>
                        <span className="font-bold text-white">{log.action}</span>
                        <p className="text-[11px] text-gray-400 mt-0.5">{log.details}</p>
                      </div>
                      <span className="text-[10px] text-gray-500 whitespace-nowrap">{log.timestamp}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CREATE PAYROLL RUN MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Create Automated Payroll Run</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateRun} className="space-y-3 text-xs">
              <div>
                <label className="text-gray-400 block mb-1">Batch Title</label>
                <input required value={newRunName} onChange={(e) => setNewRunName(e.target.value)} placeholder="e.g., November 2026 Staff Payroll" className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1">Pay Period</label>
                  <input value={newPeriod} onChange={(e) => setNewPeriod(e.target.value)} className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Pay Frequency</label>
                  <select value={newFrequency} onChange={(e) => setNewFrequency(e.target.value as PayFrequency)} className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white">
                    <option value="Monthly">Monthly</option>
                    <option value="Bi-Weekly">Bi-Weekly</option>
                    <option value="Semi-Monthly">Semi-Monthly</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Off-Cycle">Off-Cycle Bonus</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Tax & Statutory Jurisdiction</label>
                <select value={newJurisdiction} onChange={(e) => setNewJurisdiction(e.target.value as TaxJurisdiction)} className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white">
                  {TAX_JURISDICTIONS.map((j) => <option key={j.id} value={j.id}>{j.label}</option>)}
                </select>
              </div>
              <p className="text-[11px] text-emerald-300/90 bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-2.5">
                Auto-includes {activeHeadcount} active HR staff, approved Overtime/Bonuses, Unpaid Leave (LWP) deductions, Health & Pension, and active Loan EMIs.
              </p>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold cursor-pointer">Generate Payroll Batch & Payslips</button>
            </form>
          </div>
        </div>
      )}

      {/* EMPLOYEE ONBOARD / EDIT HR MODAL */}
      {isEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111622] border border-gray-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">{editingEmpId ? "Edit Employee HR & Compensation" : "Onboard New Employee"}</h3>
              <button onClick={() => setIsEmployeeModalOpen(false)} className="text-gray-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveEmployee} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <input required value={empForm.name} onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })} placeholder="Full Name" className="bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white" />
              <input required type="email" value={empForm.email} onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })} placeholder="Email" className="bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white" />
              <input value={empForm.empCode} onChange={(e) => setEmpForm({ ...empForm, empCode: e.target.value })} placeholder="Emp Code (EMP-002)" className="bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white" />
              <input value={empForm.department} onChange={(e) => setEmpForm({ ...empForm, department: e.target.value })} placeholder="Department" className="bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white" />
              <input value={empForm.role} onChange={(e) => setEmpForm({ ...empForm, role: e.target.value })} placeholder="Designation / Role" className="bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white" />
              <select value={empForm.employmentType} onChange={(e) => setEmpForm({ ...empForm, employmentType: e.target.value as any })} className="bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white">
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contractor">Contractor</option>
                <option value="Intern">Intern</option>
              </select>
              <div>
                <label className="text-[10px] text-gray-400">Annual Base Salary ($)</label>
                <input type="number" value={empForm.annualSalary} onChange={(e) => setEmpForm({ ...empForm, annualSalary: Number(e.target.value) })} className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400">Tax Jurisdiction</label>
                <select value={empForm.jurisdiction} onChange={(e) => setEmpForm({ ...empForm, jurisdiction: e.target.value as TaxJurisdiction })} className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white">
                  {TAX_JURISDICTIONS.map((j) => <option key={j.id} value={j.id}>{j.id}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-400">Tax ID / SSN / CNIC</label>
                <input value={empForm.taxId || ""} onChange={(e) => setEmpForm({ ...empForm, taxId: e.target.value })} className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400">Bank Name</label>
                <input value={empForm.bankName || ""} onChange={(e) => setEmpForm({ ...empForm, bankName: e.target.value })} className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400">Bank Account #</label>
                <input value={empForm.bankAccount || ""} onChange={(e) => setEmpForm({ ...empForm, bankAccount: e.target.value })} className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400">IBAN / Routing #</label>
                <input value={empForm.ibanOrRouting || ""} onChange={(e) => setEmpForm({ ...empForm, ibanOrRouting: e.target.value })} className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400">Housing Allow (%)</label>
                <input type="number" value={empForm.housingAllowancePct} onChange={(e) => setEmpForm({ ...empForm, housingAllowancePct: Number(e.target.value) })} className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400">Health Plan ($/mo)</label>
                <input type="number" value={empForm.healthMonthlyPremium} onChange={(e) => setEmpForm({ ...empForm, healthMonthlyPremium: Number(e.target.value) })} className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400">Pension Match (%)</label>
                <input type="number" value={empForm.employerMatchPct} onChange={(e) => setEmpForm({ ...empForm, employerMatchPct: Number(e.target.value) })} className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white" />
              </div>
              <button type="submit" className="sm:col-span-3 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold cursor-pointer mt-2">
                Save Employee HR & Payroll Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FULL & FINAL (F&F) SETTLEMENT MODAL */}
      {isFnfOpen && fnfSelectedEmp && fnfCalc && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Offboarding & Full-and-Final (F&F) Settlement</h3>
              <button onClick={() => setIsFnfOpen(false)} className="text-gray-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>
            <select value={fnfSelectedEmp.id} onChange={(e) => setFnfEmpId(e.target.value)} className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white">
              {hrEmployees.map((e) => <option key={e.id} value={e.id}>{e.name} ({e.empCode})</option>)}
            </select>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-gray-400">Worked Days</label>
                <input type="number" value={fnfWorkedDays} onChange={(e) => setFnfWorkedDays(Number(e.target.value))} className="w-full bg-gray-950 border border-gray-700 rounded-lg px-2 py-1.5 text-white" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400">Gratuity ($)</label>
                <input type="number" value={fnfGratuity} onChange={(e) => setFnfGratuity(Number(e.target.value))} className="w-full bg-gray-950 border border-gray-700 rounded-lg px-2 py-1.5 text-white" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400">Notice Ded ($)</label>
                <input type="number" value={fnfNoticeDeduction} onChange={(e) => setFnfNoticeDeduction(Number(e.target.value))} className="w-full bg-gray-950 border border-gray-700 rounded-lg px-2 py-1.5 text-white" />
              </div>
            </div>
            <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-3 space-y-1.5">
              <div className="flex justify-between"><span className="text-gray-400">Pro-Rata Salary ({fnfWorkedDays}d):</span><span className="text-white font-bold">${fnfCalc.proRataPay.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Leave Encashment ({fnfSelectedEmp.leaveBalanceDays}d):</span><span className="text-white font-bold">${fnfCalc.leaveEncashment.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Gratuity / Severance:</span><span className="text-emerald-400 font-bold">+${fnfGratuity.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Active Loans & Notice Recovery:</span><span className="text-rose-400 font-bold">-${(fnfCalc.activeLoanBal + fnfNoticeDeduction).toLocaleString()}</span></div>
              <div className="flex justify-between border-t border-gray-800 pt-1.5 text-sm"><span className="font-bold text-white">Net F&F Settlement:</span><span className="font-bold text-emerald-400">${fnfCalc.netSettlement.toLocaleString()}</span></div>
            </div>
            <button onClick={handleIssueFnF} className="w-full bg-amber-600 hover:bg-amber-500 text-white py-2.5 rounded-xl font-bold cursor-pointer">Issue Off-Cycle F&F Settlement</button>
          </div>
        </div>
      )}

      {/* PRINTABLE ENTERPRISE PAYSLIP VOUCHER MODAL */}
      {selectedPayslipPreview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-gray-900 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h2 className="text-lg font-black text-gray-900">{companyName}</h2>
                <p className="text-xs text-gray-500">Official Itemized Payslip • {selectedPayslipPreview.period || selectedPayslipPreview.payment_date}</p>
              </div>
              <div className="flex items-center gap-2 print:hidden">
                <button onClick={() => window.print()} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer"><Printer size={13} /> Print / PDF</button>
                <button onClick={() => setSelectedPayslipPreview(null)} className="p-1.5 bg-gray-200 rounded-lg cursor-pointer"><X size={15} /></button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded-xl">
              <div><strong>Employee:</strong> {selectedPayslipPreview.employee_name}</div>
              <div><strong>Emp Code:</strong> {selectedPayslipPreview.emp_code}</div>
              <div><strong>Designation:</strong> {selectedPayslipPreview.employee_role}</div>
              <div><strong>Department:</strong> {selectedPayslipPreview.department}</div>
              <div><strong>Tax ID:</strong> {selectedPayslipPreview.tax_id || "On File"}</div>
              <div><strong>Bank:</strong> {selectedPayslipPreview.bank_account}</div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5 border rounded-xl p-3">
                <div className="font-bold text-emerald-700 uppercase text-[10px]">Earnings</div>
                <div className="flex justify-between"><span>Base Salary</span><span>${selectedPayslipPreview.base_salary.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Allowances (HRA/Med/Trans)</span><span>${selectedPayslipPreview.allowances.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Overtime Pay</span><span>${(selectedPayslipPreview.overtime_pay || 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Bonus / Arrears</span><span>${(selectedPayslipPreview.bonus_pay || 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Reimbursements</span><span>${(selectedPayslipPreview.reimbursements || 0).toLocaleString()}</span></div>
              </div>
              <div className="space-y-1.5 border rounded-xl p-3">
                <div className="font-bold text-rose-700 uppercase text-[10px]">Deductions</div>
                <div className="flex justify-between"><span>Income Tax / TDS</span><span>-${selectedPayslipPreview.tax_deduction.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Social / Pension</span><span>-${(selectedPayslipPreview.social_pension_deduction || 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Health Insurance</span><span>-${(selectedPayslipPreview.health_deduction || 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Unpaid Leave (LWP)</span><span>-${(selectedPayslipPreview.lwp_deduction || 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Loan EMI / Garnish</span><span>-${((selectedPayslipPreview.loan_deduction || 0) + (selectedPayslipPreview.garnishment_deduction || 0)).toLocaleString()}</span></div>
              </div>
            </div>
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div>
                <div className="text-xs font-bold text-emerald-800">NET DISBURSED PAY</div>
                <div className="text-[10px] text-emerald-700">Employer CTC: ${(selectedPayslipPreview.employer_ctc || selectedPayslipPreview.net_pay).toLocaleString()}</div>
              </div>
              <div className="text-2xl font-black text-emerald-700">${selectedPayslipPreview.net_pay.toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
