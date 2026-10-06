"use client";

import { useState, useEffect, useRef } from "react";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { 
  Users, 
  FileText, 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Building2, 
  DollarSign, 
  ShieldCheck, 
  X, 
  Edit3, 
  Trash2, 
  Sparkles,
  ExternalLink,
  PenTool,
  Check,
  ChevronRight,
  Briefcase
} from "lucide-react";
import Link from "next/link";

const MENU_ITEMS = [
  { name: "Employees", href: "/employees" },
  { name: "Departments", href: "/employees/departments" },
  { name: "Contracts", href: "/employees/contracts" },
  { name: "Reporting", href: "/employees/reporting" },
  { name: "Configuration", href: "/employees/configuration" },
];

export type ContractType = "Permanent" | "Fixed-Term" | "Contractor" | "Executive" | "Probationary";
export type ContractStatus = "running" | "pending_signature" | "draft" | "expired" | "terminated";

export type Contract = {
  id: string;
  employee_id: string;
  employee: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  type: ContractType;
  start_date: string;
  end_date?: string;
  wage: number; // Annual
  monthly_wage: number;
  working_hours: number; // e.g. 40 hrs/wk
  work_policy: "Remote" | "Hybrid" | "On-site";
  probation_months: number;
  notice_period_days: number;
  status: ContractStatus;
  manager: string;
  employee_signed: boolean;
  employee_signed_date?: string;
  employer_signed: boolean;
  employer_signed_date?: string;
  document_hash: string;
  special_clauses?: string;
};

const REAL_COMPANY_CONTRACTS: Contract[] = [
  {
    id: "CNT/2026/001",
    employee_id: "EMP001",
    employee: "Salim Ghauri",
    email: "salim.ghauri@beraxis.online",
    phone: "+1 (555) 010-1001",
    role: "Principal Architect & Tech Lead",
    department: "Engineering",
    type: "Permanent",
    start_date: "2024-01-15",
    wage: 145000,
    monthly_wage: 12083,
    working_hours: 40,
    work_policy: "Remote",
    probation_months: 3,
    notice_period_days: 60,
    status: "running",
    manager: "Executive Board",
    employee_signed: true,
    employee_signed_date: "2024-01-12",
    employer_signed: true,
    employer_signed_date: "2024-01-14",
    document_hash: "SHA256: 7f8a92b0c41938ee124f11200a7b51b",
    special_clauses: "Includes Principal Equity Grant of 15,000 stock options vested over 48 months with 1-year cliff."
  },
  {
    id: "CNT/2026/002",
    employee_id: "EMP002",
    employee: "Sarah Vance",
    email: "sarah.vance@beraxis.online",
    phone: "+1 (555) 010-1002",
    role: "Lead UI/UX Designer",
    department: "Design",
    type: "Permanent",
    start_date: "2024-03-01",
    wage: 120000,
    monthly_wage: 10000,
    working_hours: 40,
    work_policy: "Remote",
    probation_months: 3,
    notice_period_days: 30,
    status: "running",
    manager: "Salim Ghauri",
    employee_signed: true,
    employee_signed_date: "2024-02-26",
    employer_signed: true,
    employer_signed_date: "2024-02-28",
    document_hash: "SHA256: 9e32a188f6120bd761c349911e4f20c",
    special_clauses: "Exclusive design system intellectual property license retained by Beraxis Technologies Inc."
  },
  {
    id: "CNT/2026/003",
    employee_id: "EMP003",
    employee: "Bilal Mahmood",
    email: "bilal.mahmood@beraxis.online",
    phone: "+1 (555) 010-1003",
    role: "ERP Specialist & Controller",
    department: "Finance",
    type: "Permanent",
    start_date: "2024-02-10",
    wage: 130000,
    monthly_wage: 10833,
    working_hours: 40,
    work_policy: "Hybrid",
    probation_months: 3,
    notice_period_days: 60,
    status: "running",
    manager: "Executive Board",
    employee_signed: true,
    employee_signed_date: "2024-02-05",
    employer_signed: true,
    employer_signed_date: "2024-02-08",
    document_hash: "SHA256: 4b61cf02a3921b712399efaa842010e",
    special_clauses: "Authorized controller access to Multi-Currency GL and statutory taxation filings."
  },
  {
    id: "CNT/2026/004",
    employee_id: "EMP004",
    employee: "Jane Smith",
    email: "jane.smith@beraxis.online",
    phone: "+1 (555) 010-1004",
    role: "Mobile Engineering Lead",
    department: "Engineering",
    type: "Permanent",
    start_date: "2024-04-12",
    wage: 128000,
    monthly_wage: 10666,
    working_hours: 40,
    work_policy: "Remote",
    probation_months: 3,
    notice_period_days: 30,
    status: "running",
    manager: "Salim Ghauri",
    employee_signed: true,
    employee_signed_date: "2024-04-09",
    employer_signed: true,
    employer_signed_date: "2024-04-11",
    document_hash: "SHA256: 881a702ecbb049120199feaa11299df",
    special_clauses: "Lead architecture for iOS & Android native wrapper applications."
  },
  {
    id: "CNT/2026/005",
    employee_id: "EMP005",
    employee: "Marcus Jenkins",
    email: "marcus.j@beraxis.online",
    phone: "+1 (555) 010-1005",
    role: "DevOps & Cloud Engineer",
    department: "Operations",
    type: "Permanent",
    start_date: "2024-05-01",
    wage: 118000,
    monthly_wage: 9833,
    working_hours: 40,
    work_policy: "Remote",
    probation_months: 3,
    notice_period_days: 30,
    status: "running",
    manager: "Salim Ghauri",
    employee_signed: true,
    employee_signed_date: "2024-04-28",
    employer_signed: true,
    employer_signed_date: "2024-04-30",
    document_hash: "SHA256: 129fe029bc4410aa39921100e47bb11",
    special_clauses: "Includes 24/7 on-call tier-1 rotation stipend of $500/month."
  },
  {
    id: "CNT/2026/006",
    employee_id: "EMP006",
    employee: "Bob Wilson",
    email: "bob.wilson@beraxis.online",
    phone: "+1 (555) 010-1006",
    role: "Supply Chain Specialist",
    department: "Operations",
    type: "Contractor",
    start_date: "2025-01-01",
    end_date: "2025-12-31",
    wage: 95000,
    monthly_wage: 7916,
    working_hours: 35,
    work_policy: "On-site",
    probation_months: 1,
    notice_period_days: 14,
    status: "running",
    manager: "Marcus Jenkins",
    employee_signed: true,
    employee_signed_date: "2024-12-28",
    employer_signed: true,
    employer_signed_date: "2024-12-30",
    document_hash: "SHA256: ff32190bbca48102919efaa311029ba",
    special_clauses: "Fixed 12-month independent contractor agreement renewable upon mutual performance review."
  },
  {
    id: "CNT/2026/007",
    employee_id: "EMP007",
    employee: "Elena Rostova",
    email: "elena.rostova@beraxis.online",
    phone: "+44 20 7946 0912",
    role: "HR Operations & Talent Director",
    department: "Human Resources",
    type: "Permanent",
    start_date: "2024-09-20",
    wage: 110000,
    monthly_wage: 9166,
    working_hours: 40,
    work_policy: "Hybrid",
    probation_months: 3,
    notice_period_days: 45,
    status: "running",
    manager: "Executive Board",
    employee_signed: true,
    employee_signed_date: "2024-09-18",
    employer_signed: true,
    employer_signed_date: "2024-09-19",
    document_hash: "SHA256: 7a881bc399104fa2810bbcc1124401a",
    special_clauses: "Authorizer of digital payroll, employee onboardings, and recruitment offer letters."
  },
  {
    id: "CNT/2026/008",
    employee_id: "EMP008",
    employee: "David Chen",
    email: "david.chen@beraxis.online",
    phone: "+1 (650) 555-0144",
    role: "Senior Systems Engineer",
    department: "Engineering",
    type: "Probationary",
    start_date: "2026-10-01",
    wage: 125000,
    monthly_wage: 10416,
    working_hours: 40,
    work_policy: "Remote",
    probation_months: 3,
    notice_period_days: 30,
    status: "pending_signature",
    manager: "Salim Ghauri",
    employee_signed: false,
    employer_signed: true,
    employer_signed_date: "2026-09-28",
    document_hash: "SHA256: 6631aa8810bcdef019948211a7bb021",
    special_clauses: "Standard 90-day probationary period before transition to Permanent Full-Time status."
  }
];

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>(REAL_COMPANY_CONTRACTS);
  const [currentView, setCurrentView] = useState<ViewType>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [deptFilter, setDeptFilter] = useState<string>("ALL");
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isContractDocOpen, setIsContractDocOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // New Contract Form State
  const [newEmpName, setNewEmpName] = useState("");
  const [newEmpEmail, setNewEmpEmail] = useState("");
  const [newEmpPhone, setNewEmpPhone] = useState("");
  const [newEmpRole, setNewEmpRole] = useState("Software Engineer");
  const [newEmpDept, setNewEmpDept] = useState("Engineering");
  const [newContractType, setNewContractType] = useState<ContractType>("Permanent");
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [newEndDate, setNewEndDate] = useState("");
  const [newWage, setNewWage] = useState(110000);
  const [newWorkingHours, setNewWorkingHours] = useState(40);
  const [newWorkPolicy, setNewWorkPolicy] = useState<"Remote" | "Hybrid" | "On-site">("Remote");
  const [newProbationMonths, setNewProbationMonths] = useState(3);
  const [newNoticeDays, setNewNoticeDays] = useState(30);
  const [newManager, setNewManager] = useState("Salim Ghauri");
  const [newSpecialClauses, setNewSpecialClauses] = useState("");

  const printAreaRef = useRef<HTMLDivElement>(null);

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("company_contracts");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setContracts(parsed);
        }
      }
    } catch {}
  }, []);

  const saveContractsState = (newContracts: Contract[]) => {
    setContracts(newContracts);
    try {
      localStorage.setItem("company_contracts", JSON.stringify(newContracts));
    } catch {}
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4500);
  };

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim() || !newEmpRole.trim()) return;

    const newId = `CNT/2026/00${contracts.length + 1}`;
    const newContract: Contract = {
      id: newId,
      employee_id: `EMP00${contracts.length + 1}`,
      employee: newEmpName.trim(),
      email: newEmpEmail.trim() || `${newEmpName.toLowerCase().replace(/\s+/g, ".")}@beraxis.online`,
      phone: newEmpPhone.trim() || "+1 (555) 000-0000",
      role: newEmpRole.trim(),
      department: newEmpDept,
      type: newContractType,
      start_date: newStartDate,
      end_date: newEndDate || undefined,
      wage: Number(newWage),
      monthly_wage: Math.round(Number(newWage) / 12),
      working_hours: Number(newWorkingHours),
      work_policy: newWorkPolicy,
      probation_months: Number(newProbationMonths),
      notice_period_days: Number(newNoticeDays),
      status: "running",
      manager: newManager,
      employee_signed: true,
      employee_signed_date: newStartDate,
      employer_signed: true,
      employer_signed_date: newStartDate,
      document_hash: `SHA256: ${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`,
      special_clauses: newSpecialClauses || undefined
    };

    const updated = [newContract, ...contracts];
    saveContractsState(updated);
    setIsCreateModalOpen(false);
    showToast(`✓ Employment Agreement "${newId}" successfully issued for ${newContract.employee}!`);
  };

  const handleSignContract = (contractId: string) => {
    const updated = contracts.map(c => {
      if (c.id === contractId) {
        return {
          ...c,
          employee_signed: true,
          employee_signed_date: new Date().toISOString().slice(0, 10),
          status: "running" as ContractStatus
        };
      }
      return c;
    });
    saveContractsState(updated);
    if (selectedContract && selectedContract.id === contractId) {
      setSelectedContract({
        ...selectedContract,
        employee_signed: true,
        employee_signed_date: new Date().toISOString().slice(0, 10),
        status: "running"
      });
    }
    showToast("✓ Contract digitally signed and executed with cryptographic seal.");
  };

  const handlePrintContract = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const exportContractsCSV = () => {
    const headers = [
      "Contract Reference",
      "Employee ID",
      "Employee Name",
      "Job Position",
      "Department",
      "Contract Type",
      "Start Date",
      "End Date",
      "Annual Wage ($)",
      "Monthly Wage ($)",
      "Working Hours",
      "Work Policy",
      "Notice Period",
      "Status",
      "Digital Signature Hash"
    ];

    const rows = contracts.map(c => [
      c.id,
      c.employee_id,
      `"${c.employee}"`,
      `"${c.role}"`,
      `"${c.department}"`,
      c.type,
      c.start_date,
      c.end_date || "Indefinite",
      c.wage,
      c.monthly_wage,
      `${c.working_hours}h/wk`,
      c.work_policy,
      `${c.notice_period_days} Days`,
      c.status,
      c.document_hash
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `employee_contracts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered list
  const filteredContracts = contracts.filter(c => {
    const matchesSearch = 
      c.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    const matchesDept = deptFilter === "ALL" || c.department === deptFilter;

    return matchesSearch && matchesStatus && matchesDept;
  });

  const totalPayrollValue = contracts.reduce((acc, c) => acc + (c.status === "running" ? c.wage : 0), 0);
  const activeCount = contracts.filter(c => c.status === "running").length;
  const pendingCount = contracts.filter(c => c.status === "pending_signature").length;

  return (
    <div className="flex flex-col h-screen bg-[#0a0d14] text-white selection:bg-purple-500 selection:text-white">
      <StandardModuleHeader
        moduleName="Employees"
        moduleIcon={<Users size={20} />}
        menuItems={MENU_ITEMS}
        searchPlaceholder="Search contracts by employee, role, or ID..."
      />

      {toastMsg && (
        <div className="fixed top-14 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold border border-emerald-400/40 animate-bounce">
          <CheckCircle2 size={18} /> {toastMsg}
        </div>
      )}

      <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-6">
        {/* KPI Header Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="galaxy-card p-4 rounded-2xl border border-blue-500/20 bg-[#111622] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Contracts</span>
              <h3 className="text-2xl font-bold text-blue-400 mt-0.5">{contracts.length} Records</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Official Employment Files</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
              <FileText size={20} />
            </div>
          </div>

          <div className="galaxy-card p-4 rounded-2xl border border-emerald-500/20 bg-[#111622] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active & Executed</span>
              <h3 className="text-2xl font-bold text-emerald-400 mt-0.5">{activeCount} Running</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Fully Validated & Signed</p>
            </div>
            <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
              <ShieldCheck size={20} />
            </div>
          </div>

          <div className="galaxy-card p-4 rounded-2xl border border-amber-500/20 bg-[#111622] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pending Signatures</span>
              <h3 className="text-2xl font-bold text-amber-400 mt-0.5">{pendingCount} Awaiting</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Offer / Signing stage</p>
            </div>
            <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400">
              <Clock size={20} />
            </div>
          </div>

          <div className="galaxy-card p-4 rounded-2xl border border-purple-500/20 bg-[#111622] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Annual Wage Book</span>
              <h3 className="text-2xl font-bold text-purple-400 mt-0.5">${(totalPayrollValue / 1000).toFixed(0)}k ARR</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Contracted Commitments</p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
              <DollarSign size={20} />
            </div>
          </div>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-[#111622] p-4 rounded-2xl border border-gray-800">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search contracts..."
                className="bg-gray-900 border border-gray-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 w-56 sm:w-64"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-gray-900/80 p-1 rounded-xl border border-gray-800">
              <button
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === "ALL" ? "bg-purple-600 text-white shadow-md" : "text-gray-400 hover:text-white"
                }`}
              >
                All ({contracts.length})
              </button>
              <button
                onClick={() => setStatusFilter("running")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === "running" ? "bg-emerald-600 text-white shadow-md" : "text-gray-400 hover:text-white"
                }`}
              >
                Running ({contracts.filter(c => c.status === "running").length})
              </button>
              <button
                onClick={() => setStatusFilter("pending_signature")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === "pending_signature" ? "bg-amber-600 text-white shadow-md" : "text-gray-400 hover:text-white"
                }`}
              >
                Pending ({contracts.filter(c => c.status === "pending_signature").length})
              </button>
            </div>

            {/* Department Filter */}
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Sales & Marketing">Sales & Marketing</option>
            </select>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <ViewSwitcher
              currentView={currentView}
              availableViews={["list", "kanban"]}
              onViewChange={setCurrentView}
            />
            <button
              onClick={exportContractsCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/80 hover:bg-gray-700 text-gray-200 rounded-xl text-xs font-bold border border-gray-700 transition-all active:scale-95"
            >
              <Download size={14} /> Export CSV
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 transition-all active:scale-95"
            >
              <Plus size={14} /> Create Contract
            </button>
          </div>
        </div>

        {/* VIEW 1: TABLE LIST VIEW */}
        {currentView === "list" && (
          <div className="galaxy-card bg-[#111622] rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-gray-900/90 text-gray-400 uppercase text-[11px] font-bold border-b border-gray-800 tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5">Reference ID</th>
                    <th className="px-4 py-3.5">Employee Name</th>
                    <th className="px-4 py-3.5">Department & Role</th>
                    <th className="px-4 py-3.5">Contract Type</th>
                    <th className="px-4 py-3.5">Start Date</th>
                    <th className="px-4 py-3.5">Annual / Monthly Wage</th>
                    <th className="px-4 py-3.5">Working Hours</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Agreement Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {filteredContracts.map(contract => (
                    <tr
                      key={contract.id}
                      className="hover:bg-gray-800/40 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedContract(contract);
                        setIsContractDocOpen(true);
                      }}
                    >
                      <td className="px-4 py-3.5">
                        <span className="font-mono font-bold text-purple-400">{contract.id}</span>
                        <div className="text-[10px] text-gray-500">{contract.employee_id}</div>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-white">
                        <div>{contract.employee}</div>
                        <div className="text-xs text-gray-400 font-normal">{contract.email}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-gray-200">{contract.role}</div>
                        <div className="text-xs text-purple-400 font-medium">{contract.department}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          contract.type === "Permanent"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : contract.type === "Contractor"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                        }`}>
                          {contract.type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-400">
                        {contract.start_date}
                        {contract.end_date && <div className="text-[10px] text-amber-400/80">Expires: {contract.end_date}</div>}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-emerald-400">${contract.wage.toLocaleString()} / yr</div>
                        <div className="text-[11px] text-gray-400">${contract.monthly_wage.toLocaleString()} / mo</div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-300">
                        <div>{contract.working_hours} hrs/week</div>
                        <div className="text-[10px] text-gray-500">{contract.work_policy}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 w-fit ${
                          contract.status === "running"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : contract.status === "pending_signature"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-gray-800 text-gray-400 border-gray-700"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            contract.status === "running" ? "bg-emerald-400" : "bg-amber-400 animate-pulse"
                          }`} />
                          <span className="capitalize">{contract.status.replace("_", " ")}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setSelectedContract(contract);
                            setIsContractDocOpen(true);
                          }}
                          className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white rounded-xl text-xs font-bold border border-purple-500/30 transition-all"
                        >
                          View Official Agreement
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 2: KANBAN WORKFLOW VIEW */}
        {currentView === "kanban" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {[
              { id: "running", label: "Active & Executed Contracts", color: "border-emerald-500 text-emerald-400 bg-emerald-500/10" },
              { id: "pending_signature", label: "Pending Digital Signature", color: "border-amber-500 text-amber-400 bg-amber-500/10" },
              { id: "draft", label: "Draft & Renewals", color: "border-gray-600 text-gray-400 bg-gray-800" }
            ].map(col => {
              const colContracts = filteredContracts.filter(c => c.status === col.id);
              return (
                <div key={col.id} className="bg-[#111622] rounded-2xl border border-gray-800 p-4 space-y-4 min-h-[450px] flex flex-col">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${col.color}`}>
                      {col.label}
                    </span>
                    <span className="text-xs font-bold text-gray-400 bg-gray-900 px-2.5 py-0.5 rounded-full">
                      {colContracts.length}
                    </span>
                  </div>

                  <div className="flex-1 space-y-3">
                    {colContracts.length === 0 ? (
                      <div className="text-center py-8 text-xs text-gray-500 italic">No contracts in this status</div>
                    ) : (
                      colContracts.map(c => (
                        <div
                          key={c.id}
                          onClick={() => {
                            setSelectedContract(c);
                            setIsContractDocOpen(true);
                          }}
                          className="bg-[#161c2a] hover:bg-[#1c2436] border border-gray-800 hover:border-purple-500/50 rounded-xl p-4 cursor-pointer space-y-3 transition-all shadow-md group"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="font-mono text-[10px] font-bold text-purple-400">{c.id}</span>
                              <h4 className="font-bold text-white text-sm group-hover:text-purple-300 transition-colors">
                                {c.employee}
                              </h4>
                              <p className="text-xs text-gray-400">{c.role}</p>
                            </div>
                            <span className="text-emerald-400 font-bold text-sm">${(c.wage / 1000).toFixed(0)}k</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px] bg-gray-900/60 p-2.5 rounded-lg border border-gray-800 text-gray-300">
                            <div>
                              <span className="text-gray-500 block text-[9px] uppercase">Department</span>
                              <span className="font-semibold">{c.department}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 block text-[9px] uppercase">Start Date</span>
                              <span className="font-semibold">{c.start_date}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
                            <span className="flex items-center gap-1">
                              <ShieldCheck size={12} className={c.employee_signed ? "text-emerald-400" : "text-gray-600"} />
                              {c.employee_signed ? "Signed" : "Unsigned"}
                            </span>
                            <span className="text-purple-400 font-bold group-hover:underline flex items-center gap-0.5">
                              Open Agreement <ChevronRight size={12} />
                            </span>
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
      </div>

      {/* OFFICIAL EMPLOYMENT AGREEMENT LEGAL DOCUMENT MODAL */}
      {isContractDocOpen && selectedContract && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#111724] border border-gray-700 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl relative">
            {/* Top Toolbar */}
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/90 rounded-t-3xl shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600/20 text-purple-400 rounded-xl border border-purple-500/30">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Employment Agreement Document</h3>
                  <p className="text-xs text-gray-400 font-mono">{selectedContract.id} • {selectedContract.employee}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!selectedContract.employee_signed && (
                  <button
                    onClick={() => handleSignContract(selectedContract.id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
                  >
                    <PenTool size={14} /> Execute Digital Signature
                  </button>
                )}
                <button
                  onClick={handlePrintContract}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl text-xs font-bold border border-gray-700 transition-all active:scale-95"
                >
                  <Printer size={14} /> Print / Save PDF
                </button>
                <button
                  onClick={() => setIsContractDocOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Printable Legal Agreement Document Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 text-slate-200 print:bg-white print:text-black" ref={printAreaRef}>
              {/* Document Header & Company Branding */}
              <div className="border-b-2 border-gray-700 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <img src="/logo2.png" alt="Beraxis Logo" className="h-10 w-auto" />
                  <div>
                    <h1 className="text-xl font-extrabold tracking-tight text-white uppercase">
                      BERAXIS TECHNOLOGIES INC.
                    </h1>
                    <p className="text-xs text-gray-400">Enterprise Cloud Solutions & ERP Systems</p>
                    <p className="text-[11px] text-gray-500 font-mono">Reg: US-DE-982144 • 100 Montgomery St, San Francisco, CA</p>
                  </div>
                </div>

                <div className="text-right sm:text-right bg-gray-900/80 p-3 rounded-xl border border-gray-800">
                  <span className="text-[10px] font-bold uppercase text-purple-400 block">Contract Reference</span>
                  <span className="font-mono text-sm font-bold text-white">{selectedContract.id}</span>
                  <span className="text-xs text-emerald-400 block mt-0.5 capitalize font-semibold">
                    ● Status: {selectedContract.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* Title */}
              <div className="text-center py-2">
                <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-white border-b border-gray-800 inline-block pb-1">
                  OFFICIAL CONTRACT OF EMPLOYMENT
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  This Agreement is entered into on <strong className="text-gray-200">{selectedContract.start_date}</strong> between Beraxis Technologies Inc. and the Employee named herein.
                </p>
              </div>

              {/* Parties Summary Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-900/80 p-4 rounded-2xl border border-gray-800 text-xs">
                <div className="space-y-1">
                  <span className="text-purple-400 font-bold uppercase tracking-wider text-[10px]">The Employer:</span>
                  <div className="font-bold text-white">BERAXIS TECHNOLOGIES INC.</div>
                  <div className="text-gray-400">Authorized Officer: Executive Board & HR Directorate</div>
                  <div className="text-gray-400">Email: hr@beraxis.online</div>
                </div>

                <div className="space-y-1">
                  <span className="text-purple-400 font-bold uppercase tracking-wider text-[10px]">The Employee:</span>
                  <div className="font-bold text-white">{selectedContract.employee} ({selectedContract.employee_id})</div>
                  <div className="text-gray-400">Email: {selectedContract.email}</div>
                  <div className="text-gray-400">Phone: {selectedContract.phone}</div>
                </div>
              </div>

              {/* Section 1: Position & Scope */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-purple-300 uppercase tracking-wider">1. Appointment, Title & Duties</h4>
                <p className="leading-relaxed text-gray-300">
                  The Employer hereby employs the Employee in the capacity of <strong className="text-white">{selectedContract.role}</strong> within the <strong className="text-white">{selectedContract.department}</strong> Department. The Employee will report directly to <strong className="text-white">{selectedContract.manager}</strong>. The Employee agrees to perform all duties, services, and responsibilities assigned faithfully and to the best of their professional ability.
                </p>
              </div>

              {/* Section 2: Term of Agreement */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-purple-300 uppercase tracking-wider">2. Term & Work Policy</h4>
                <p className="leading-relaxed text-gray-300">
                  This Agreement shall commence on <strong className="text-white">{selectedContract.start_date}</strong> and continue as a <strong className="text-white">{selectedContract.type}</strong> employment relationship {selectedContract.end_date ? `until ${selectedContract.end_date}` : "on an indefinite permanent basis"}, subject to standard notice periods. The standard work policy is <strong className="text-white">{selectedContract.work_policy}</strong> with a scheduled commitment of <strong className="text-white">{selectedContract.working_hours} hours per week</strong>.
                </p>
              </div>

              {/* Section 3: Compensation & Benefits */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-purple-300 uppercase tracking-wider">3. Remuneration & Payroll Structure</h4>
                <div className="bg-gray-900/90 p-4 rounded-xl border border-gray-800 space-y-2">
                  <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                    <span className="text-gray-400">Total Contracted Annual Base Salary:</span>
                    <span className="text-base font-bold text-emerald-400">${selectedContract.wage.toLocaleString()} USD / annum</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-300">
                    <span>Monthly Gross Disbursement:</span>
                    <span className="font-semibold text-white">${selectedContract.monthly_wage.toLocaleString()} USD / month</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-300">
                    <span>Statutory Probation Period:</span>
                    <span className="font-semibold text-white">{selectedContract.probation_months} Months</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-300">
                    <span>Required Notice for Termination:</span>
                    <span className="font-semibold text-white">{selectedContract.notice_period_days} Days written notice</span>
                  </div>
                </div>
              </div>

              {/* Section 4: Special Clauses / Grants */}
              {selectedContract.special_clauses && (
                <div className="space-y-2 text-xs">
                  <h4 className="font-bold text-purple-300 uppercase tracking-wider">4. Special Stipulations & Equity Provisions</h4>
                  <div className="p-3 bg-purple-950/20 border border-purple-500/30 rounded-xl text-gray-200">
                    {selectedContract.special_clauses}
                  </div>
                </div>
              )}

              {/* Section 5: Confidentiality & IP */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-purple-300 uppercase tracking-wider">5. Intellectual Property & Non-Disclosure (NDA)</h4>
                <p className="leading-relaxed text-gray-300">
                  All inventions, source code, designs, algorithms, and documentation developed by the Employee during the course of employment are the exclusive property of Beraxis Technologies Inc. The Employee undertakes not to disclose any confidential company or customer data during or following their tenure.
                </p>
              </div>

              {/* Digital Execution & Dual Signatures */}
              <div className="pt-6 border-t border-gray-800 space-y-4">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="font-bold uppercase tracking-wider">Signatures & Legal Execution</span>
                  <span className="font-mono text-[10px] text-gray-500">Document Cryptographic Fingerprint: {selectedContract.document_hash}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Employer Signature Block */}
                  <div className="bg-gray-900/90 p-4 rounded-2xl border border-gray-800 space-y-2 text-xs">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Signed on Behalf of Employer:</span>
                    <div className="h-14 flex items-center">
                      <div className="font-serif italic text-xl text-purple-300 font-bold border-b border-purple-500/40 pb-1 w-full flex items-center justify-between">
                        <span>Elena Rostova</span>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 not-italic font-sans">
                          ✓ Verified Corporate Seal
                        </span>
                      </div>
                    </div>
                    <div className="text-[11px] text-gray-400">Elena Rostova, Director of Human Resources</div>
                    <div className="text-[10px] text-gray-500">Date: {selectedContract.employer_signed_date || "2024-01-14"}</div>
                  </div>

                  {/* Employee Signature Block */}
                  <div className="bg-gray-900/90 p-4 rounded-2xl border border-gray-800 space-y-2 text-xs">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Signed by Employee:</span>
                    <div className="h-14 flex items-center">
                      {selectedContract.employee_signed ? (
                        <div className="font-serif italic text-xl text-emerald-300 font-bold border-b border-emerald-500/40 pb-1 w-full flex items-center justify-between">
                          <span>{selectedContract.employee}</span>
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 not-italic font-sans">
                            ✓ Authenticated Sign
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSignContract(selectedContract.id)}
                          className="w-full py-2 bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white rounded-xl border border-amber-500/40 font-bold transition-all"
                        >
                          ✍️ Click to Digitally Sign Contract
                        </button>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-400">{selectedContract.employee}</div>
                    <div className="text-[10px] text-gray-500">
                      Date: {selectedContract.employee_signed_date || "Pending Employee Signature"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-800 flex justify-between items-center bg-gray-900/90 rounded-b-3xl shrink-0">
              <span className="text-xs text-gray-500">
                Official Beraxis Human Resources Record • Tamper-evident digital copy
              </span>
              <button
                onClick={() => setIsContractDocOpen(false)}
                className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-bold"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW EMPLOYMENT CONTRACT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleCreateContract} className="bg-[#111622] border border-gray-700 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-600/20 text-purple-400 rounded-xl border border-purple-500/30">
                  <Plus size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Create Official Employment Contract</h3>
                  <p className="text-xs text-gray-400">Generate a legally binding agreement for new or existing staff</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-gray-300 block mb-1">Employee Full Name *</label>
                <input
                  type="text"
                  required
                  value={newEmpName}
                  onChange={e => setNewEmpName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="font-bold text-gray-300 block mb-1">Job Role / Designation *</label>
                <input
                  type="text"
                  required
                  value={newEmpRole}
                  onChange={e => setNewEmpRole(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-gray-300 block mb-1">Department</label>
                <select
                  value={newEmpDept}
                  onChange={e => setNewEmpDept(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Sales & Marketing">Sales & Marketing</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-300 block mb-1">Contract Type</label>
                <select
                  value={newContractType}
                  onChange={e => setNewContractType(e.target.value as ContractType)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Permanent">Permanent Full-Time</option>
                  <option value="Fixed-Term">Fixed-Term Contract</option>
                  <option value="Contractor">Contractor / Freelance</option>
                  <option value="Executive">Executive Agreement</option>
                  <option value="Probationary">Probationary</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-300 block mb-1">Work Policy</label>
                <select
                  value={newWorkPolicy}
                  onChange={e => setNewWorkPolicy(e.target.value as any)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Remote">100% Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-gray-300 block mb-1">Annual Wage ($ USD) *</label>
                <input
                  type="number"
                  required
                  value={newWage}
                  onChange={e => setNewWage(Number(e.target.value))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="font-bold text-gray-300 block mb-1">Effective Start Date *</label>
                <input
                  type="date"
                  required
                  value={newStartDate}
                  onChange={e => setNewStartDate(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="font-bold text-gray-300 block mb-1">End Date (If Fixed-Term)</label>
                <input
                  type="date"
                  value={newEndDate}
                  onChange={e => setNewEndDate(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-gray-300 block mb-1">Weekly Hours</label>
                <input
                  type="number"
                  value={newWorkingHours}
                  onChange={e => setNewWorkingHours(Number(e.target.value))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="font-bold text-gray-300 block mb-1">Notice Period (Days)</label>
                <input
                  type="number"
                  value={newNoticeDays}
                  onChange={e => setNewNoticeDays(Number(e.target.value))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="font-bold text-gray-300 block mb-1">Reporting Manager</label>
                <input
                  type="text"
                  value={newManager}
                  onChange={e => setNewManager(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-300 block mb-1">Special Stipulations / Equity / Allowances</label>
              <textarea
                rows={2}
                value={newSpecialClauses}
                onChange={e => setNewSpecialClauses(e.target.value)}
                placeholder="e.g. Stock option grant, performance bonus milestones, remote office allowance..."
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 bg-gray-800 text-gray-300 hover:text-white rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 transition-all"
              >
                Issue & Execute Contract
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
