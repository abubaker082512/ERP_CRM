"use client";

import { useState } from "react";
import AppHeader from "@/components/layout/AppHeader";
import { 
  UserPlus, 
  Mail, 
  Shield, 
  User, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Plus, 
  Download, 
  Copy, 
  Check, 
  Lock, 
  KeyRound, 
  ShieldCheck, 
  AlertTriangle,
  Send,
  Users,
  Search,
  Building2,
  Briefcase,
  DollarSign,
  Calendar,
  ExternalLink,
  Laptop
} from "lucide-react";
import Link from "next/link";

type Role = "Owner" | "Admin" | "Manager" | "Specialist" | "Viewer" | "Contractor";

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  type: "full_time" | "freelance";
  status: "active" | "away" | "offline";
  lastActive: string;
  twoFactorEnabled: boolean;
  avatarBg: string;
  rate?: string;
  projectAssigned?: string;
};

type FreelancerContractor = {
  id: string;
  name: string;
  email: string;
  specialty: string;
  rate: string; // e.g. "$75 / hr"
  contractType: "Hourly Freelance" | "Monthly Retainer" | "Fixed Milestone";
  projectAssigned: string;
  status: "active" | "completed" | "onboarding";
  ndaStatus: "Signed" | "Pending";
  startDate: string;
  endDate: string;
};

type Invitation = {
  id: string;
  email: string;
  role: Role;
  department: string;
  invitedBy: string;
  sentAt: string;
  expiresIn: string;
};

const INITIAL_MEMBERS: TeamMember[] = [
  {
    id: "USR-001",
    name: "Abubaker Admin",
    email: "abubaker@galaxy.com",
    role: "Owner",
    department: "Executive & Systems",
    type: "full_time",
    status: "active",
    lastActive: "Just now",
    twoFactorEnabled: true,
    avatarBg: "bg-purple-600"
  },
  {
    id: "USR-002",
    name: "Elena Rostova",
    email: "elena.rostova@galaxy.com",
    role: "Admin",
    department: "Finance & Accounting",
    type: "full_time",
    status: "active",
    lastActive: "5 mins ago",
    twoFactorEnabled: true,
    avatarBg: "bg-emerald-600"
  },
  {
    id: "USR-003",
    name: "Alex Vance",
    email: "alex.vance@galaxy.com",
    role: "Manager",
    department: "Manufacturing & Plant",
    type: "full_time",
    status: "active",
    lastActive: "18 mins ago",
    twoFactorEnabled: true,
    avatarBg: "bg-amber-600"
  },
  {
    id: "USR-004",
    name: "Sarah Jenkins",
    email: "sarah.j@galaxy.com",
    role: "Specialist",
    department: "Engineering & Cloud",
    type: "full_time",
    status: "away",
    lastActive: "1 hour ago",
    twoFactorEnabled: true,
    avatarBg: "bg-blue-600"
  }
];

const INITIAL_CONTRACTORS: FreelancerContractor[] = [
  {
    id: "CON-101",
    name: "Liam O'Connor",
    email: "liam.dev@remote-contractor.io",
    specialty: "iOS & React Native Specialist",
    rate: "$85 / hr",
    contractType: "Hourly Freelance",
    projectAssigned: "POS Mobile Barcode Companion App",
    status: "active",
    ndaStatus: "Signed",
    startDate: "2026-02-01",
    endDate: "2026-06-30"
  },
  {
    id: "CON-102",
    name: "Amina Al-Mansoor",
    email: "amina.design@uxstudio.co",
    specialty: "Senior 3D UI & Motion Designer",
    rate: "$4,800 / mo",
    contractType: "Monthly Retainer",
    projectAssigned: "Sign PDF Studio & Visual Identity",
    status: "active",
    ndaStatus: "Signed",
    startDate: "2026-01-15",
    endDate: "2026-12-31"
  },
  {
    id: "CON-103",
    name: "Viktor Petrov",
    email: "viktor.sec@auditconsulting.eu",
    specialty: "Cybersecurity & Penetration Testing",
    rate: "$6,500 / project",
    contractType: "Fixed Milestone",
    projectAssigned: "SOC2 & SHA-256 Signature Audit",
    status: "active",
    ndaStatus: "Signed",
    startDate: "2026-03-01",
    endDate: "2026-04-15"
  }
];

const INITIAL_INVITATIONS: Invitation[] = [
  {
    id: "INV-901",
    email: "marcus.v@salesleaders.io",
    role: "Manager",
    department: "Enterprise Sales",
    invitedBy: "Abubaker Admin",
    sentAt: "2026-10-05 16:30",
    expiresIn: "6 days remaining"
  },
  {
    id: "INV-902",
    email: "claire.qa@beraxis.online",
    role: "Contractor",
    department: "Quality Assurance",
    invitedBy: "Alex Vance",
    sentAt: "2026-10-06 11:00",
    expiresIn: "7 days remaining"
  }
];

const MODULE_PERMISSIONS: { name: string; key: string }[] = [
  { name: "POS & Checkout Register", key: "pos" },
  { name: "Sales & CRM Pipeline", key: "sales" },
  { name: "Accounting & Financial Statements", key: "accounting" },
  { name: "Inventory & Barcode Stocking", key: "inventory" },
  { name: "Manufacturing & Work Orders", key: "manufacturing" },
  { name: "Payroll & Salary Disbursement", key: "payroll" },
  { name: "Recruitment & Employee Onboarding", key: "recruitment" },
  { name: "Global Enterprise Settings", key: "settings" },
];

const ROLE_PERMISSIONS_MATRIX: Record<Role, Record<string, boolean>> = {
  Owner: { pos: true, sales: true, accounting: true, inventory: true, manufacturing: true, payroll: true, recruitment: true, settings: true },
  Admin: { pos: true, sales: true, accounting: true, inventory: true, manufacturing: true, payroll: true, recruitment: true, settings: true },
  Manager: { pos: true, sales: true, accounting: false, inventory: true, manufacturing: true, payroll: false, recruitment: true, settings: false },
  Specialist: { pos: true, sales: true, accounting: false, inventory: true, manufacturing: true, payroll: false, recruitment: false, settings: false },
  Contractor: { pos: false, sales: false, accounting: false, inventory: true, manufacturing: true, payroll: false, recruitment: false, settings: false },
  Viewer: { pos: false, sales: false, accounting: false, inventory: false, manufacturing: false, payroll: false, recruitment: false, settings: false },
};

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>(INITIAL_MEMBERS);
  const [contractors, setContractors] = useState<FreelancerContractor[]>(INITIAL_CONTRACTORS);
  const [invitations, setInvitations] = useState<Invitation[]>(INITIAL_INVITATIONS);
  const [activeTab, setActiveTab] = useState<"members" | "contractors" | "matrix" | "invites">("members");
  const [search, setSearch] = useState("");

  // Modals & Link state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isAddContractorOpen, setIsAddContractorOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("Specialist");
  const [inviteDept, setInviteDept] = useState("Engineering & Cloud");
  const [inviteNote, setInviteNote] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // New Contractor Form
  const [conName, setConName] = useState("");
  const [conEmail, setConEmail] = useState("");
  const [conSpec, setConSpec] = useState("");
  const [conRate, setConRate] = useState("$75 / hr");
  const [conType, setConType] = useState<FreelancerContractor["contractType"]>("Hourly Freelance");
  const [conProject, setConProject] = useState("");

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const newInv: Invitation = {
      id: `INV-${(900 + invitations.length + 1).toString()}`,
      email: inviteEmail.trim(),
      role: inviteRole,
      department: inviteDept,
      invitedBy: "Current Administrator",
      sentAt: new Date().toISOString().replace("T", " ").slice(0, 16),
      expiresIn: "7 days remaining"
    };

    setInvitations([newInv, ...invitations]);
    setIsInviteModalOpen(false);
    setInviteEmail("");
    setInviteNote("");
    alert(`Invitation sent to ${newInv.email}!`);
  };

  const handleCreateContractor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conName.trim() || !conEmail.trim()) return;

    const newCon: FreelancerContractor = {
      id: `CON-${(100 + contractors.length + 1).toString()}`,
      name: conName.trim(),
      email: conEmail.trim(),
      specialty: conSpec.trim() || "Consultant",
      rate: conRate,
      contractType: conType,
      projectAssigned: conProject.trim() || "General Engineering Milestone",
      status: "active",
      ndaStatus: "Signed",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "2026-12-31"
    };

    setContractors([newCon, ...contractors]);
    setIsAddContractorOpen(false);
    setConName("");
    setConEmail("");
    setConSpec("");
    setConProject("");
  };

  const handleRoleChange = (memberId: string, newRole: Role) => {
    setMembers(members.map(m => m.id === memberId ? { ...m, role: newRole } : m));
  };

  const handleRevokeMember = (memberId: string) => {
    if (confirm("Are you sure you want to remove this member from the organization?")) {
      setMembers(members.filter(m => m.id !== memberId));
    }
  };

  const handleRevokeContractor = (conId: string) => {
    if (confirm("Terminate contractor engagement?")) {
      setContractors(contractors.filter(c => c.id !== conId));
    }
  };

  const handleCopyMagicLink = () => {
    const magicLink = `https://access.beraxis.online/team/join?token=sec_${Math.random().toString(36).substring(2, 12)}`;
    navigator.clipboard.writeText(magicLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const exportTeamCSV = () => {
    const headers = ["ID", "Full Name", "Email", "Type", "Role / Specialty", "Department / Project", "Rate / Status"];
    const rows = [
      ...members.map(m => [m.id, `"${m.name}"`, m.email, "Full-Time Staff", m.role, `"${m.department}"`, m.status]),
      ...contractors.map(c => [c.id, `"${c.name}"`, c.email, `Freelancer (${c.contractType})`, `"${c.specialty}"`, `"${c.projectAssigned}"`, c.rate])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `beraxis_workspace_team_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.department.toLowerCase().includes(search.toLowerCase())
  );

  const filteredContractors = contractors.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.specialty.toLowerCase().includes(search.toLowerCase()) ||
    c.projectAssigned.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-[#0a0d14] text-white">
      <AppHeader title="Team & Workforce Access" />

      <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-6">
        {/* KPI Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="galaxy-card p-4 border border-purple-500/20 bg-purple-950/10 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full-Time Staff</p>
              <h3 className="text-2xl font-bold text-purple-400 mt-1">{members.length} Core</h3>
              <p className="text-xs text-gray-400 mt-1">Full internal access</p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
              <Users size={22} />
            </div>
          </div>

          <div className="galaxy-card p-4 border border-cyan-500/20 bg-cyan-950/10 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Freelance Talent</p>
              <h3 className="text-2xl font-bold text-cyan-400 mt-1">{contractors.length} External</h3>
              <p className="text-xs text-gray-400 mt-1">Contractors & consultants</p>
            </div>
            <div className="p-3 bg-cyan-500/20 rounded-xl text-cyan-400">
              <Laptop size={22} />
            </div>
          </div>

          <div className="galaxy-card p-4 border border-amber-500/20 bg-amber-950/10 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pending Invites</p>
              <h3 className="text-2xl font-bold text-amber-400 mt-1">{invitations.length} Invites</h3>
              <p className="text-xs text-gray-400 mt-1">Awaiting magic token</p>
            </div>
            <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400">
              <Clock size={22} />
            </div>
          </div>

          <div className="galaxy-card p-4 border border-emerald-500/20 bg-emerald-950/10 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">NDA & RBAC</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">100% Sealed</h3>
              <p className="text-xs text-gray-400 mt-1">Audit-compliant security</p>
            </div>
            <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
              <ShieldCheck size={22} />
            </div>
          </div>
        </div>

        {/* Action Bar & Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111622] p-3.5 rounded-xl border border-gray-800">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-gray-900/80 p-1 rounded-lg border border-gray-800">
              <button
                onClick={() => setActiveTab("members")}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                  activeTab === "members" ? "bg-purple-600 text-white shadow-md shadow-purple-900/40" : "text-gray-400 hover:text-white"
                }`}
              >
                Core Staff ({members.length})
              </button>
              <button
                onClick={() => setActiveTab("contractors")}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                  activeTab === "contractors" ? "bg-purple-600 text-white shadow-md shadow-purple-900/40" : "text-gray-400 hover:text-white"
                }`}
              >
                Freelance & Contractors ({contractors.length})
              </button>
              <button
                onClick={() => setActiveTab("matrix")}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                  activeTab === "matrix" ? "bg-purple-600 text-white shadow-md shadow-purple-900/40" : "text-gray-400 hover:text-white"
                }`}
              >
                RBAC Permissions
              </button>
              <button
                onClick={() => setActiveTab("invites")}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                  activeTab === "invites" ? "bg-purple-600 text-white shadow-md shadow-purple-900/40" : "text-gray-400 hover:text-white"
                }`}
              >
                Invitations ({invitations.length})
              </button>
            </div>

            <div className="relative max-w-xs ml-2">
              <Search className="absolute left-3 top-2 text-gray-500" size={14} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search people, roles, projects..."
                className="bg-gray-900 border border-gray-700 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/employees/departments"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-purple-300 rounded-lg text-xs font-semibold border border-purple-500/30 transition"
            >
              <Building2 size={13} /> Departments
            </Link>

            <button
              onClick={exportTeamCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/80 hover:bg-gray-700 text-gray-200 rounded-lg text-xs font-semibold border border-gray-700 transition"
            >
              <Download size={13} /> Export Roster
            </button>

            <button
              onClick={handleCopyMagicLink}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/80 hover:bg-gray-700 text-cyan-300 rounded-lg text-xs font-semibold border border-cyan-500/30 transition"
            >
              {copiedLink ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              {copiedLink ? "Link Copied!" : "Magic Join Link"}
            </button>

            {activeTab === "contractors" ? (
              <button
                onClick={() => setIsAddContractorOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-bold shadow-lg shadow-cyan-600/30 transition"
              >
                <Plus size={13} /> Add Freelancer
              </button>
            ) : (
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-lg shadow-purple-600/30 transition"
              >
                <UserPlus size={13} /> Invite Member
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: CORE STAFF DIRECTORY */}
        {activeTab === "members" && (
          <div className="galaxy-card bg-[#111622] rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-gray-900/90 text-gray-400 uppercase text-[11px] font-bold border-b border-gray-800 tracking-wider">
                <tr>
                  <th className="px-4 py-3">Member Name</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Security Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last Active</th>
                  <th className="px-4 py-3">2FA Security</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredMembers.map(member => (
                  <tr key={member.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-4 py-3.5 flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${member.avatarBg} text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-md`}>
                        {member.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          {member.name}
                          {member.role === "Owner" && (
                            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/40">
                              Workspace Owner
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">{member.email}</div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-xs text-gray-300 font-medium">
                      {member.department}
                    </td>

                    <td className="px-4 py-3.5">
                      <select
                        value={member.role}
                        disabled={member.role === "Owner"}
                        onChange={e => handleRoleChange(member.id, e.target.value as Role)}
                        className="bg-gray-900 text-xs text-gray-200 border border-gray-700 rounded-lg px-2.5 py-1 focus:outline-none focus:border-purple-500 disabled:opacity-60"
                      >
                        <option value="Owner">Owner</option>
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="Specialist">Specialist</option>
                        <option value="Viewer">Viewer</option>
                      </select>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          member.status === "active" ? "bg-emerald-400 shadow-sm shadow-emerald-400" :
                          member.status === "away" ? "bg-amber-400" : "bg-gray-500"
                        }`}></span>
                        <span className="text-xs capitalize text-gray-300">{member.status}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-xs text-gray-400">{member.lastActive}</td>

                    <td className="px-4 py-3.5">
                      {member.twoFactorEnabled ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Active (FIDO2)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          Disabled
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      {member.role !== "Owner" && (
                        <button
                          onClick={() => handleRevokeMember(member.id)}
                          className="p-1 text-gray-500 hover:text-red-400 transition"
                          title="Revoke Member Access"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: FREELANCERS & CONTRACTORS */}
        {activeTab === "contractors" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredContractors.map(con => (
                <div key={con.id} className="galaxy-card p-5 bg-[#111622] rounded-2xl border border-gray-800 hover:border-cyan-500/40 transition space-y-4 shadow-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">{con.id} • {con.contractType}</span>
                      <h3 className="text-base font-bold text-white mt-1">{con.name}</h3>
                      <p className="text-xs text-cyan-300 font-medium">{con.specialty}</p>
                    </div>
                    <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-bold uppercase">
                      {con.status}
                    </span>
                  </div>

                  <div className="bg-gray-900/70 p-3 rounded-xl border border-gray-800 space-y-1.5 text-xs text-gray-300">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Hourly / Retainer Rate:</span>
                      <span className="font-bold text-emerald-400 font-mono">{con.rate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Assigned Project:</span>
                      <span className="font-semibold text-white truncate max-w-[150px]">{con.projectAssigned}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">NDA Status:</span>
                      <span className="font-bold text-cyan-400">{con.ndaStatus} (Verified)</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-400 pt-1 border-t border-gray-800/80">
                      <span>Period: {con.startDate}</span>
                      <span>To: {con.endDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-gray-400 truncate max-w-[170px]">{con.email}</span>
                    <button
                      onClick={() => handleRevokeContractor(con.id)}
                      className="p-1 text-gray-500 hover:text-red-400 transition"
                      title="Terminate Contractor"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ACCESS CONTROL MATRIX */}
        {activeTab === "matrix" && (
          <div className="galaxy-card bg-[#111622] rounded-xl border border-gray-800 p-5 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield size={18} className="text-purple-400" /> Role-Based Access Control (RBAC) Matrix
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Configure module read, write, and disbursement authorizations across organizational roles.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-gray-900/90 text-gray-400 uppercase text-[10px] font-bold border-b border-gray-800">
                  <tr>
                    <th className="px-4 py-3">Platform Module</th>
                    <th className="px-4 py-3 text-center">Owner</th>
                    <th className="px-4 py-3 text-center">Admin</th>
                    <th className="px-4 py-3 text-center">Manager</th>
                    <th className="px-4 py-3 text-center">Specialist</th>
                    <th className="px-4 py-3 text-center">Contractor</th>
                    <th className="px-4 py-3 text-center">Viewer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {MODULE_PERMISSIONS.map(mod => (
                    <tr key={mod.key} className="hover:bg-gray-800/40">
                      <td className="px-4 py-3 font-semibold text-white">{mod.name}</td>
                      {(["Owner", "Admin", "Manager", "Specialist", "Contractor", "Viewer"] as Role[]).map(r => {
                        const hasAccess = ROLE_PERMISSIONS_MATRIX[r]?.[mod.key];
                        return (
                          <td key={r} className="px-4 py-3 text-center">
                            {hasAccess ? (
                              <span className="inline-flex p-1 bg-emerald-500/10 text-emerald-400 rounded">
                                <Check size={14} />
                              </span>
                            ) : (
                              <span className="inline-flex p-1 bg-gray-800 text-gray-600 rounded">
                                ✕
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: PENDING INVITATIONS */}
        {activeTab === "invites" && (
          <div className="galaxy-card bg-[#111622] rounded-xl border border-gray-800 overflow-hidden">
            {invitations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No pending invitations.</div>
            ) : (
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-gray-900/90 text-gray-400 uppercase text-[11px] font-bold border-b border-gray-800">
                  <tr>
                    <th className="px-4 py-3">Invited Email</th>
                    <th className="px-4 py-3">Target Role</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Sent By</th>
                    <th className="px-4 py-3">Expiration</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {invitations.map(inv => (
                    <tr key={inv.id} className="hover:bg-gray-800/40">
                      <td className="px-4 py-3.5 font-bold text-white flex items-center gap-2">
                        <Mail size={14} className="text-purple-400" />
                        <span>{inv.email}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {inv.role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-300">{inv.department}</td>
                      <td className="px-4 py-3.5 text-xs text-gray-400">{inv.invitedBy} ({inv.sentAt.split(" ")[0]})</td>
                      <td className="px-4 py-3.5 text-xs text-amber-400 font-semibold">{inv.expiresIn}</td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setInvitations(invitations.filter(i => i.id !== inv.id))}
                          className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white rounded text-xs font-semibold transition-all"
                        >
                          Revoke Invite
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: INVITE CORE MEMBER */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSendInvite} className="bg-[#111622] border border-gray-700 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <UserPlus size={20} className="text-purple-400" /> Send Team Workspace Invitation
            </h3>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">Colleague Email Address *</label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="teammate@company.com"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Assigned Role</label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as Role)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Specialist">Specialist</option>
                  <option value="Contractor">Contractor</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Department Unit</label>
                <input
                  type="text"
                  value={inviteDept}
                  onChange={e => setInviteDept(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">Custom Welcome Note (Optional)</label>
              <textarea
                rows={2}
                value={inviteNote}
                onChange={e => setInviteNote(e.target.value)}
                placeholder="Welcome to Beraxis ERP team! Here are your credentials..."
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="px-4 py-2 bg-gray-800 text-gray-300 hover:text-white rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-1.5"
              >
                <Send size={13} /> Send Invite
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: ADD FREELANCE CONTRACTOR */}
      {isAddContractorOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateContractor} className="bg-[#111622] border border-gray-700 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Laptop size={20} className="text-cyan-400" /> Register Freelancer / Contractor
            </h3>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">Contractor Full Name *</label>
              <input
                type="text"
                required
                value={conName}
                onChange={e => setConName(e.target.value)}
                placeholder="e.g. Liam O'Connor"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Contractor Email *</label>
                <input
                  type="email"
                  required
                  value={conEmail}
                  onChange={e => setConEmail(e.target.value)}
                  placeholder="contractor@domain.com"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Specialty / Role</label>
                <input
                  type="text"
                  value={conSpec}
                  onChange={e => setConSpec(e.target.value)}
                  placeholder="e.g. React Native Expert"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Contract Type</label>
                <select
                  value={conType}
                  onChange={e => setConType(e.target.value as any)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Hourly Freelance">Hourly Freelance</option>
                  <option value="Monthly Retainer">Monthly Retainer</option>
                  <option value="Fixed Milestone">Fixed Milestone</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Billing Rate</label>
                <input
                  type="text"
                  value={conRate}
                  onChange={e => setConRate(e.target.value)}
                  placeholder="$75 / hr or $4,500 / mo"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">Assigned Project / Deliverable</label>
              <input
                type="text"
                value={conProject}
                onChange={e => setConProject(e.target.value)}
                placeholder="e.g. iOS Scanner App Implementation"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setIsAddContractorOpen(false)}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-600/30"
              >
                Register Contractor
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
