"use client";

import { useEffect, useState, useRef } from "react";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import {
    UserCheck,
    LogIn,
    LogOut,
    Clock,
    Calendar,
    Users,
    CheckCircle2,
    AlertCircle,
    Plus,
    Download,
    Sparkles,
    Trash2,
    X,
    Building2,
    Filter
} from "lucide-react";

const MENU_ITEMS = [
    { name: "Attendance Register", href: "/attendances" },
    { name: "Kiosk Mode", href: "/attendances/kiosk" },
    { name: "Employees", href: "/employees" },
    { name: "Timesheets", href: "/timesheets" },
];

export type AttendanceRecord = {
    id: string;
    employee_name: string;
    department: string;
    check_in: string;
    check_out: string | null;
    worked_hours: number;
    status: "present" | "late" | "on_leave";
    avatarBg: string;
};

const INITIAL_ATTENDANCE: AttendanceRecord[] = [
    { id: "ATT-001", employee_name: "Salim Ghauri", department: "Engineering", check_in: "2026-03-09T08:55:00Z", check_out: null, worked_hours: 6.5, status: "present", avatarBg: "bg-blue-600" },
    { id: "ATT-002", employee_name: "Sarah Vance", department: "Design", check_in: "2026-03-09T09:15:00Z", check_out: null, worked_hours: 6.2, status: "late", avatarBg: "bg-pink-600" },
    { id: "ATT-003", employee_name: "Bilal Mahmood", department: "Finance", check_in: "2026-03-09T08:45:00Z", check_out: "2026-03-09T17:00:00Z", worked_hours: 8.25, status: "present", avatarBg: "bg-emerald-600" },
    { id: "ATT-004", employee_name: "Jane Smith", department: "Engineering", check_in: "2026-03-09T09:00:00Z", check_out: null, worked_hours: 6.4, status: "present", avatarBg: "bg-purple-600" },
    { id: "ATT-005", employee_name: "Marcus Jenkins", department: "Operations", check_in: "2026-03-09T08:30:00Z", check_out: null, worked_hours: 6.9, status: "present", avatarBg: "bg-cyan-600" },
    { id: "ATT-006", employee_name: "Bob Wilson", department: "Operations", check_in: "2026-03-08T09:00:00Z", check_out: "2026-03-08T17:00:00Z", worked_hours: 8.0, status: "on_leave", avatarBg: "bg-amber-600" }
];

export default function AttendancePage() {
    const [attendances, setAttendances] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
    const [isCheckedIn, setIsCheckedIn] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [toastMsg, setToastMsg] = useState("");

    // Modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [manualEmpName, setManualEmpName] = useState("Tariq Mansoor");
    const [manualDept, setManualDept] = useState("Engineering");
    const [manualCheckIn, setManualCheckIn] = useState("09:00");
    const [manualCheckOut, setManualCheckOut] = useState("17:30");

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(""), 5000);
    };

    const handleKioskToggle = () => {
        if (!isCheckedIn) {
            setIsCheckedIn(true);
            const newAtt: AttendanceRecord = {
                id: `ATT-${Date.now()}`,
                employee_name: "Current Administrator",
                department: "Management",
                check_in: new Date().toISOString(),
                check_out: null,
                worked_hours: 0.1,
                status: "present",
                avatarBg: "bg-indigo-600"
            };
            setAttendances([newAtt, ...attendances]);
            showToast("🟢 Successfully Clocked IN for today!");
        } else {
            setIsCheckedIn(false);
            setAttendances(attendances.map((a, idx) => idx === 0 ? { ...a, check_out: new Date().toISOString(), worked_hours: 7.8 } : a));
            showToast("🔴 Successfully Clocked OUT for today!");
        }
    };

    const handleManualLog = (e: React.FormEvent) => {
        e.preventDefault();
        const newAtt: AttendanceRecord = {
            id: `ATT-${Date.now()}`,
            employee_name: manualEmpName,
            department: manualDept,
            check_in: `2026-03-09T${manualCheckIn}:00Z`,
            check_out: `2026-03-09T${manualCheckOut}:00Z`,
            worked_hours: 8.5,
            status: "present",
            avatarBg: "bg-purple-600"
        };
        setAttendances([newAtt, ...attendances]);
        setIsAddModalOpen(false);
        showToast(`✅ Logged attendance entry for ${manualEmpName}!`);
    };

    const handleExportCSV = () => {
        const headers = ["Record ID", "Employee", "Department", "Check In", "Check Out", "Worked Hours", "Status"];
        const rows = attendances.map(a => [
            a.id,
            `"${a.employee_name}"`,
            `"${a.department}"`,
            `"${a.check_in}"`,
            `"${a.check_out || 'Active'}"`,
            a.worked_hours,
            a.status
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `beraxis_attendance_register_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("📥 Exported Attendance Register CSV!");
    };

    const activePresentCount = attendances.filter(a => a.status === "present" && !a.check_out).length;
    const lateCount = attendances.filter(a => a.status === "late").length;
    const onLeaveCount = attendances.filter(a => a.status === "on_leave").length;

    const filteredAttendances = attendances.filter(a => {
        const matchesStatus = selectedStatus === "all" || a.status === selectedStatus;
        const matchesSearch =
            a.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.department.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="flex flex-col min-h-screen bg-[#0a0d14] text-white">
            <StandardModuleHeader
                moduleName="Attendances"
                moduleIcon={<UserCheck size={20} className="text-orange-400" />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search employee, department..."
                onSearch={setSearchQuery}
                onNewClick={() => setIsAddModalOpen(true)}
                newButtonText="+ Manual Log"
            />

            {/* Toast Notification */}
            {toastMsg && (
                <div className="fixed top-16 right-6 z-50 bg-orange-600 text-white px-5 py-3 rounded-xl shadow-2xl shadow-orange-900/50 flex items-center gap-3 border border-orange-400 animate-in fade-in slide-in-from-top-4 duration-300">
                    <Sparkles size={18} className="animate-spin text-orange-200" />
                    <span className="text-sm font-medium">{toastMsg}</span>
                </div>
            )}

            <div className="flex-1 overflow-auto p-6 max-w-7xl mx-auto w-full space-y-6">
                {/* Header Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900/60 p-4 rounded-2xl border border-gray-800 backdrop-blur-xl">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-300 bg-clip-text text-transparent">
                                Attendance & Punctuality Register
                            </h2>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-semibold">
                                Live Kiosk & Biometrics Active
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            Real-time employee check-in/out kiosk, overtime calculations & monthly punctuality tracking
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                        <button
                            onClick={handleExportCSV}
                            className="bg-gray-800/90 hover:bg-gray-700 text-gray-200 border border-gray-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                        >
                            <Download size={15} className="text-emerald-400" /> Export Register CSV
                        </button>

                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-orange-600/30 transition transform hover:-translate-y-0.5 flex items-center gap-1.5"
                        >
                            <Plus size={16} /> + Log Overtime / Correction
                        </button>
                    </div>
                </div>

                {/* Live Kiosk Quick Punch Card */}
                <div className="bg-gradient-to-r from-orange-950/40 via-gray-900/90 to-amber-950/40 border border-orange-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-2xl flex items-center justify-center">
                                <UserCheck size={30} />
                            </div>
                            <div>
                                <div className="text-xs text-orange-400 font-bold uppercase tracking-wider">Self-Service Punch Clock</div>
                                <h3 className="text-xl font-bold text-white mt-0.5">Welcome, Administrator</h3>
                                <p className="text-xs text-gray-400">
                                    Current Status: <span className={isCheckedIn ? "text-emerald-400 font-bold" : "text-gray-400"}>{isCheckedIn ? "🟢 Clocked In (Working)" : "⚪ Clocked Out"}</span>
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleKioskToggle}
                            className={`px-8 py-3.5 rounded-2xl text-sm font-black flex items-center gap-2 shadow-xl transition transform active:scale-95 ${
                                !isCheckedIn
                                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30"
                                    : "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-600/30"
                            }`}
                        >
                            {!isCheckedIn ? <LogIn size={18} /> : <LogOut size={18} />}
                            <span>{!isCheckedIn ? "Check In Now" : "Check Out"}</span>
                        </button>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-gray-900/80 to-emerald-950/20 p-5 rounded-2xl border border-gray-800 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-400 font-semibold uppercase">Currently Present On Duty</span>
                            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 size={18} />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-emerald-400">{activePresentCount} Active</div>
                        <div className="text-[11px] text-emerald-300 mt-1">Live working sessions recorded</div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900/80 to-amber-950/20 p-5 rounded-2xl border border-gray-800 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-400 font-semibold uppercase">Late Check-Ins Today</span>
                            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                <AlertCircle size={18} />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-amber-400">{lateCount} Late</div>
                        <div className="text-[11px] text-amber-300 mt-1">Grace period: 15 minutes</div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900/80 to-blue-950/20 p-5 rounded-2xl border border-gray-800 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-400 font-semibold uppercase">On Approved Leave</span>
                            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                <Calendar size={18} />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-white">{onLeaveCount} Staff</div>
                        <div className="text-[11px] text-gray-400 mt-1">Synced with HR leave policy</div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
                    {["all", "present", "late", "on_leave"].map(status => (
                        <button
                            key={status}
                            onClick={() => setSelectedStatus(status)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                                selectedStatus === status
                                    ? "bg-orange-600 text-white shadow-md shadow-orange-600/30"
                                    : "bg-gray-800/80 text-gray-400 hover:text-white"
                            }`}
                        >
                            {status === "all" ? `All Staff (${attendances.length})` : status.replace("_", " ")}
                        </button>
                    ))}
                </div>

                {/* Attendance Table */}
                <div className="bg-gray-900/80 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl backdrop-blur-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-950 text-gray-400 uppercase text-[10px] border-b border-gray-800 font-semibold">
                                <tr>
                                    <th className="px-5 py-3.5">Employee & Dept</th>
                                    <th className="px-4 py-3.5">Check-In Time</th>
                                    <th className="px-4 py-3.5">Check-Out Time</th>
                                    <th className="px-4 py-3.5 text-right">Effective Hours</th>
                                    <th className="px-5 py-3.5 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/60">
                                {filteredAttendances.map(att => (
                                    <tr key={att.id} className="hover:bg-orange-950/10 transition">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center shadow ${att.avatarBg}`}>
                                                    {att.employee_name.split(" ").map(n => n[0]).join("")}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-sm">{att.employee_name}</div>
                                                    <div className="text-[11px] text-gray-400">{att.department} • {att.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 font-mono text-gray-300">
                                            {new Date(att.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-4 py-3.5 font-mono text-gray-400">
                                            {att.check_out ? new Date(att.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (
                                                <span className="text-emerald-400 font-bold animate-pulse">● Active Shift</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5 text-right font-mono font-black text-sm text-orange-300">
                                            {att.worked_hours.toFixed(2)} hrs
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                att.status === "present" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                                att.status === "late" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                                "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                            }`}>
                                                {att.status.replace("_", " ")}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal: Manual Attendance Correction */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setIsAddModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl border border-orange-500/20">
                                <Clock size={22} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Manual Attendance Log / Correction</h3>
                                <p className="text-xs text-gray-400">Record off-site hours, travel or biometric corrections</p>
                            </div>
                        </div>

                        <form onSubmit={handleManualLog} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Employee Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={manualEmpName}
                                    onChange={(e) => setManualEmpName(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Department</label>
                                <select
                                    value={manualDept}
                                    onChange={(e) => setManualDept(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                                >
                                    <option value="Engineering">Engineering</option>
                                    <option value="Design">Design</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Operations">Operations</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Check-In Time</label>
                                    <input
                                        type="time"
                                        value={manualCheckIn}
                                        onChange={(e) => setManualCheckIn(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Check-Out Time</label>
                                    <input
                                        type="time"
                                        value={manualCheckOut}
                                        onChange={(e) => setManualCheckOut(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 text-xs font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg shadow-orange-600/30"
                                >
                                    Commit Entry
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
