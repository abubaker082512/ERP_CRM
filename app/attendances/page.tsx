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
    Filter,
    Fingerprint,
    ScanFace,
    Wifi,
    MapPin,
    Cpu,
    RefreshCw,
    Check,
    Radio
} from "lucide-react";

const MENU_ITEMS = [
    { name: "Attendance Register", href: "/attendances" },
    { name: "Biometric & Machine Sync", href: "/attendances" },
    { name: "Kiosk Mode", href: "/attendances/kiosk" },
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
    source: "biometric_thumb" | "face_terminal" | "office_ip" | "manual" | "kiosk";
    avatarBg: string;
};

export type BiometricDevice = {
    id: string;
    name: string;
    location: string;
    type: "fingerprint" | "face_ai" | "rfid" | "ip_network";
    ipAddress: string;
    port: number;
    status: "online" | "syncing" | "offline";
    lastSync: string;
    punchCountToday: number;
};

const INITIAL_DEVICES: BiometricDevice[] = [
    {
        id: "DEV-001",
        name: "HQ Main Reception (ZKTeco FacePass 7)",
        location: "Head Office - Level 1",
        type: "face_ai",
        ipAddress: "192.168.1.201",
        port: 4370,
        status: "online",
        lastSync: "Just now",
        punchCountToday: 42
    },
    {
        id: "DEV-002",
        name: "Engineering Lab (Biometric Thumb Impression)",
        location: "R&D Wing - Gate B",
        type: "fingerprint",
        ipAddress: "192.168.1.202",
        port: 4370,
        status: "online",
        lastSync: "3 mins ago",
        punchCountToday: 28
    },
    {
        id: "DEV-003",
        name: "Warehouse & Logistics Gate Terminal",
        location: "Central Depot Entrance",
        type: "fingerprint",
        ipAddress: "192.168.2.15",
        port: 5005,
        status: "online",
        lastSync: "8 mins ago",
        punchCountToday: 19
    },
    {
        id: "DEV-004",
        name: "Office Wi-Fi Gateway Auto-Punch",
        location: "Subnet 192.168.1.0/24",
        type: "ip_network",
        ipAddress: "203.0.113.50",
        port: 443,
        status: "online",
        lastSync: "Continuous",
        punchCountToday: 35
    }
];

const INITIAL_ATTENDANCE: AttendanceRecord[] = [
    { id: "ATT-001", employee_name: "Salim Ghauri", department: "Engineering", check_in: "2026-03-09T08:55:00Z", check_out: null, worked_hours: 6.5, status: "present", source: "face_terminal", avatarBg: "bg-blue-600" },
    { id: "ATT-002", employee_name: "Sarah Vance", department: "Design", check_in: "2026-03-09T09:15:00Z", check_out: null, worked_hours: 6.2, status: "late", source: "biometric_thumb", avatarBg: "bg-pink-600" },
    { id: "ATT-003", employee_name: "Bilal Mahmood", department: "Finance", check_in: "2026-03-09T08:45:00Z", check_out: "2026-03-09T17:00:00Z", worked_hours: 8.25, status: "present", source: "office_ip", avatarBg: "bg-emerald-600" },
    { id: "ATT-004", employee_name: "Jane Smith", department: "Engineering", check_in: "2026-03-09T09:00:00Z", check_out: null, worked_hours: 6.4, status: "present", source: "face_terminal", avatarBg: "bg-purple-600" },
    { id: "ATT-005", employee_name: "Marcus Jenkins", department: "Operations", check_in: "2026-03-09T08:30:00Z", check_out: null, worked_hours: 6.9, status: "present", source: "biometric_thumb", avatarBg: "bg-cyan-600" },
    { id: "ATT-006", employee_name: "Bob Wilson", department: "Operations", check_in: "2026-03-08T09:00:00Z", check_out: "2026-03-08T17:00:00Z", worked_hours: 8.0, status: "on_leave", source: "manual", avatarBg: "bg-amber-600" }
];

export default function AttendancePage() {
    const [attendances, setAttendances] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
    const [devices, setDevices] = useState<BiometricDevice[]>(INITIAL_DEVICES);
    const [activeTab, setActiveTab] = useState<"register" | "hardware">("register");
    const [isCheckedIn, setIsCheckedIn] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [toastMsg, setToastMsg] = useState("");
    const [isSyncing, setIsSyncing] = useState(false);

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);

    // Manual Log State
    const [manualEmpName, setManualEmpName] = useState("Tariq Mansoor");
    const [manualDept, setManualDept] = useState("Engineering");
    const [manualCheckIn, setManualCheckIn] = useState("09:00");
    const [manualCheckOut, setManualCheckOut] = useState("17:30");
    const [manualSource, setManualSource] = useState<AttendanceRecord["source"]>("biometric_thumb");

    // Add Machine Form State
    const [devName, setDevName] = useState("");
    const [devLoc, setDevLoc] = useState("Headquarters Main Gate");
    const [devType, setDevType] = useState<BiometricDevice["type"]>("fingerprint");
    const [devIp, setDevIp] = useState("192.168.1.205");
    const [devPort, setDevPort] = useState(4370);

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
                department: "Executive Management",
                check_in: new Date().toISOString(),
                check_out: null,
                worked_hours: 0.1,
                status: "present",
                source: "office_ip",
                avatarBg: "bg-indigo-600"
            };
            setAttendances([newAtt, ...attendances]);
            showToast("🟢 Successfully Clocked IN via Office IP Network!");
        } else {
            setIsCheckedIn(false);
            setAttendances(attendances.map((a, idx) => idx === 0 ? { ...a, check_out: new Date().toISOString(), worked_hours: 7.8 } : a));
            showToast("🔴 Successfully Clocked OUT for today!");
        }
    };

    const handleSyncAllDevices = () => {
        setIsSyncing(true);
        setTimeout(() => {
            setIsSyncing(false);
            setDevices(devices.map(d => ({ ...d, lastSync: "Just now", status: "online" })));
            showToast("⚡ Biometric & Face Machine Logs synchronized successfully! 8 new punches ingested.");
        }, 1200);
    };

    const handleCreateDevice = (e: React.FormEvent) => {
        e.preventDefault();
        if (!devName.trim() || !devIp.trim()) return;

        const newDev: BiometricDevice = {
            id: `DEV-00${devices.length + 1}`,
            name: devName.trim(),
            location: devLoc,
            type: devType,
            ipAddress: devIp.trim(),
            port: Number(devPort) || 4370,
            status: "online",
            lastSync: "Just now",
            punchCountToday: 0
        };

        setDevices([...devices, newDev]);
        setIsAddDeviceOpen(false);
        setDevName("");
        showToast(`🔌 Connected new terminal: "${newDev.name}" (${newDev.ipAddress}:${newDev.port})`);
    };

    const handleDeleteDevice = (id: string, name: string) => {
        if (confirm(`Disconnect machine "${name}"?`)) {
            setDevices(devices.filter(d => d.id !== id));
            showToast(`🗑️ Disconnected machine "${name}"`);
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
            source: manualSource,
            avatarBg: "bg-purple-600"
        };
        setAttendances([newAtt, ...attendances]);
        setIsAddModalOpen(false);
        showToast(`✅ Logged attendance entry for ${manualEmpName}!`);
    };

    const handleExportCSV = () => {
        const headers = ["Record ID", "Employee", "Department", "Check In", "Check Out", "Worked Hours", "Source / Device", "Status"];
        const rows = attendances.map(a => [
            a.id,
            `"${a.employee_name}"`,
            `"${a.department}"`,
            `"${a.check_in}"`,
            `"${a.check_out || 'Active'}"`,
            a.worked_hours,
            a.source,
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
                searchPlaceholder="Search attendance logs, employee, department..."
                onSearch={setSearchQuery}
                onNewClick={() => setIsAddModalOpen(true)}
                newButtonText="+ Manual Check-In"
            />

            {/* Toast Notification */}
            {toastMsg && (
                <div className="fixed top-16 right-6 z-50 bg-orange-600 text-white px-5 py-3 rounded-xl shadow-2xl shadow-orange-900/50 flex items-center gap-3 border border-orange-400 animate-in fade-in slide-in-from-top-4 duration-300">
                    <Sparkles size={18} className="animate-spin text-orange-200" />
                    <span className="text-xs font-bold">{toastMsg}</span>
                </div>
            )}

            <div className="flex-1 p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
                {/* Punch Clock & Automated Hardware Banner */}
                <div className="galaxy-card p-5 bg-[#111622] rounded-3xl border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-md">
                            <Clock size={28} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-white">Automated Attendance & Hardware Sync</h2>
                                <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Radio size={10} className="animate-pulse" /> 4 Devices Online
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                Syncing Thumb Impression biometric scanners, Face AI cameras, and Office IP auto-checkin.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        <button
                            onClick={handleSyncAllDevices}
                            disabled={isSyncing}
                            className="bg-gray-800 hover:bg-gray-700 text-cyan-300 border border-cyan-500/30 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm active:scale-95 disabled:opacity-50"
                        >
                            <RefreshCw size={14} className={isSyncing ? "animate-spin text-cyan-400" : "text-cyan-400"} />
                            {isSyncing ? "Syncing Logs..." : "Sync Biometric Hardware"}
                        </button>

                        <button
                            onClick={handleKioskToggle}
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition flex items-center gap-2 active:scale-95 ${
                                isCheckedIn
                                    ? "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-600/30"
                                    : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30"
                            }`}
                        >
                            {isCheckedIn ? <LogOut size={15} /> : <LogIn size={15} />}
                            {isCheckedIn ? "Punch Clock OUT" : "Punch Clock IN"}
                        </button>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="galaxy-card p-4 border border-emerald-500/20 bg-emerald-950/10 rounded-2xl flex items-center justify-between shadow-xl">
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Actively Present</p>
                            <h3 className="text-2xl font-bold text-emerald-400 mt-1">{activePresentCount} Staff</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Checked in on-shift</p>
                        </div>
                        <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
                            <CheckCircle2 size={22} />
                        </div>
                    </div>

                    <div className="galaxy-card p-4 border border-amber-500/20 bg-amber-950/10 rounded-2xl flex items-center justify-between shadow-xl">
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Late Arrivals</p>
                            <h3 className="text-2xl font-bold text-amber-400 mt-1">{lateCount} Staff</h3>
                            <p className="text-xs text-gray-400 mt-0.5">After 09:00 AM window</p>
                        </div>
                        <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400">
                            <Clock size={22} />
                        </div>
                    </div>

                    <div className="galaxy-card p-4 border border-blue-500/20 bg-blue-950/10 rounded-2xl flex items-center justify-between shadow-xl">
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">On Approved Leave</p>
                            <h3 className="text-2xl font-bold text-blue-400 mt-1">{onLeaveCount} Staff</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Vacation / Sick leave</p>
                        </div>
                        <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                            <Calendar size={22} />
                        </div>
                    </div>

                    <div className="galaxy-card p-4 border border-cyan-500/20 bg-cyan-950/10 rounded-2xl flex items-center justify-between shadow-xl">
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Connected Machines</p>
                            <h3 className="text-2xl font-bold text-cyan-400 mt-1">{devices.length} Terminals</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Biometric & IP Sync</p>
                        </div>
                        <div className="p-3 bg-cyan-500/20 rounded-xl text-cyan-400">
                            <Cpu size={22} />
                        </div>
                    </div>
                </div>

                {/* View Switcher & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111622] p-4 rounded-2xl border border-gray-800">
                    <div className="flex bg-gray-900/80 p-1 rounded-xl border border-gray-800">
                        <button
                            onClick={() => setActiveTab("register")}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition ${
                                activeTab === "register" ? "bg-orange-600 text-white shadow-md" : "text-gray-400 hover:text-white"
                            }`}
                        >
                            Attendance Logs ({attendances.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("hardware")}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition flex items-center gap-1.5 ${
                                activeTab === "hardware" ? "bg-orange-600 text-white shadow-md" : "text-gray-400 hover:text-white"
                            }`}
                        >
                            <Cpu size={14} /> Biometric & Machine Terminals ({devices.length})
                        </button>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={handleExportCSV}
                            className="bg-gray-800/90 hover:bg-gray-700 text-gray-200 border border-gray-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                            <Download size={14} className="text-emerald-400" /> Export CSV
                        </button>

                        {activeTab === "hardware" ? (
                            <button
                                onClick={() => setIsAddDeviceOpen(true)}
                                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-cyan-600/30 transition flex items-center gap-1.5"
                            >
                                <Plus size={15} /> + Add Biometric Device
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-orange-600/30 transition flex items-center gap-1.5"
                            >
                                <Plus size={15} /> + Manual Attendance Record
                            </button>
                        )}
                    </div>
                </div>

                {/* TAB 1: ATTENDANCE REGISTER */}
                {activeTab === "register" && (
                    <div className="galaxy-card bg-[#111622] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
                        <table className="w-full text-left text-sm text-gray-300">
                            <thead className="bg-gray-900/90 text-gray-400 uppercase text-[11px] font-bold border-b border-gray-800 tracking-wider">
                                <tr>
                                    <th className="px-4 py-3">Employee</th>
                                    <th className="px-4 py-3">Department</th>
                                    <th className="px-4 py-3">Clock In</th>
                                    <th className="px-4 py-3">Clock Out</th>
                                    <th className="px-4 py-3">Worked Hours</th>
                                    <th className="px-4 py-3">Ingestion Channel</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/60">
                                {filteredAttendances.map(att => (
                                    <tr key={att.id} className="hover:bg-gray-800/40">
                                        <td className="px-4 py-3.5 font-bold text-white flex items-center gap-2.5">
                                            <div className={`w-8 h-8 rounded-xl ${att.avatarBg} text-white font-bold flex items-center justify-center text-xs`}>
                                                {att.employee_name.split(" ").map(n => n[0]).join("")}
                                            </div>
                                            <span>{att.employee_name}</span>
                                        </td>
                                        <td className="px-4 py-3.5 text-xs text-gray-300">{att.department}</td>
                                        <td className="px-4 py-3.5 text-xs font-mono text-emerald-400">
                                            {att.check_in.includes("T") ? att.check_in.split("T")[1].slice(0, 5) : att.check_in}
                                        </td>
                                        <td className="px-4 py-3.5 text-xs font-mono text-gray-400">
                                            {att.check_out ? (att.check_out.includes("T") ? att.check_out.split("T")[1].slice(0, 5) : att.check_out) : <span className="text-amber-400 font-bold">Active Shift</span>}
                                        </td>
                                        <td className="px-4 py-3.5 text-xs font-mono font-bold text-gray-200">
                                            {att.worked_hours.toFixed(1)} hrs
                                        </td>
                                        <td className="px-4 py-3.5 text-xs">
                                            {att.source === "face_terminal" && (
                                                <span className="inline-flex items-center gap-1 text-cyan-400 font-semibold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                                                    <ScanFace size={12} /> Face AI Camera
                                                </span>
                                            )}
                                            {att.source === "biometric_thumb" && (
                                                <span className="inline-flex items-center gap-1 text-purple-400 font-semibold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                                                    <Fingerprint size={12} /> Thumb Machine
                                                </span>
                                            )}
                                            {att.source === "office_ip" && (
                                                <span className="inline-flex items-center gap-1 text-blue-400 font-semibold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                                                    <Wifi size={12} /> Office IP Subnet
                                                </span>
                                            )}
                                            {att.source === "manual" && (
                                                <span className="text-gray-400 text-xs">Manual HR Entry</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                                att.status === "present" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                                                att.status === "late" ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                            }`}>
                                                {att.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* TAB 2: BIOMETRIC & HARDWARE DEVICES */}
                {activeTab === "hardware" && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            {devices.map(dev => (
                                <div key={dev.id} className="galaxy-card p-5 bg-[#111622] rounded-2xl border border-gray-800 hover:border-cyan-500/40 transition space-y-4 shadow-xl">
                                    <div className="flex items-start justify-between">
                                        <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                                            {dev.type === "face_ai" && <ScanFace size={22} />}
                                            {dev.type === "fingerprint" && <Fingerprint size={22} />}
                                            {dev.type === "ip_network" && <Wifi size={22} />}
                                        </div>
                                        <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-bold uppercase flex items-center gap-1">
                                            <Radio size={10} className="animate-pulse" /> {dev.status}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-base font-bold text-white">{dev.name}</h3>
                                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                            <MapPin size={11} className="text-gray-500" /> {dev.location}
                                        </p>
                                    </div>

                                    <div className="bg-gray-900/70 p-3 rounded-xl border border-gray-800 space-y-1.5 text-xs text-gray-300 font-mono">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 font-sans">TCP/IP Address:</span>
                                            <span className="text-cyan-300 font-bold">{dev.ipAddress}:{dev.port}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 font-sans">Today's Punches:</span>
                                            <span className="text-emerald-400 font-bold">{dev.punchCountToday} punches</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 font-sans">Last Hardware Sync:</span>
                                            <span className="text-gray-400">{dev.lastSync}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-1 text-xs">
                                        <span className="text-[10px] text-gray-500 font-mono">{dev.id}</span>
                                        <button
                                            onClick={() => handleDeleteDevice(dev.id, dev.name)}
                                            className="p-1 text-gray-500 hover:text-red-400 transition"
                                            title="Disconnect Device"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL 1: ADD BIOMETRIC DEVICE */}
            {isAddDeviceOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={handleCreateDevice} className="bg-[#111622] border border-gray-700 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Cpu size={20} className="text-cyan-400" /> Connect Biometric / Face Hardware Terminal
                        </h3>

                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">Device Label / Description *</label>
                            <input
                                type="text"
                                required
                                value={devName}
                                onChange={e => setDevName(e.target.value)}
                                placeholder="e.g. R&D Lab Fingerprint Terminal #2"
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Hardware Technology</label>
                                <select
                                    value={devType}
                                    onChange={e => setDevType(e.target.value as any)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                                >
                                    <option value="fingerprint">Thumb / Fingerprint Scanner</option>
                                    <option value="face_ai">AI Face Recognition Terminal</option>
                                    <option value="ip_network">Office Wi-Fi / IP Subnet Auto-Punch</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Physical Location</label>
                                <input
                                    type="text"
                                    value={devLoc}
                                    onChange={e => setDevLoc(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Device TCP/IP Address *</label>
                                <input
                                    type="text"
                                    required
                                    value={devIp}
                                    onChange={e => setDevIp(e.target.value)}
                                    placeholder="192.168.1.200"
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Communication Port</label>
                                <input
                                    type="number"
                                    value={devPort}
                                    onChange={e => setDevPort(Number(e.target.value))}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
                            <button
                                type="button"
                                onClick={() => setIsAddDeviceOpen(false)}
                                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-xl text-xs font-bold"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-600/30"
                            >
                                Test & Save Machine
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* MODAL 2: MANUAL LOG ENTRY */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={handleManualLog} className="bg-[#111622] border border-gray-700 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Clock size={20} className="text-orange-400" /> Manual Attendance Punch Override
                        </h3>

                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">Employee Name</label>
                            <input
                                type="text"
                                required
                                value={manualEmpName}
                                onChange={e => setManualEmpName(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Department</label>
                                <input
                                    type="text"
                                    value={manualDept}
                                    onChange={e => setManualDept(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Verification Source</label>
                                <select
                                    value={manualSource}
                                    onChange={e => setManualSource(e.target.value as any)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                                >
                                    <option value="biometric_thumb">Thumb Impression Machine</option>
                                    <option value="face_terminal">Face Recognition AI</option>
                                    <option value="office_ip">Office IP Check-in</option>
                                    <option value="manual">Manual Admin Override</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Punch In Time</label>
                                <input
                                    type="text"
                                    value={manualCheckIn}
                                    onChange={e => setManualCheckIn(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Punch Out Time</label>
                                <input
                                    type="text"
                                    value={manualCheckOut}
                                    onChange={e => setManualCheckOut(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-orange-500"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
                            <button
                                type="button"
                                onClick={() => setIsAddModalOpen(false)}
                                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-xl text-xs font-bold"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-orange-600/30"
                            >
                                Record Attendance
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
