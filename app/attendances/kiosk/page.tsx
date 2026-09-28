"use client";
import { fetchAPI } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/layout/AppHeader";
import { ArrowLeft, UserCheck, Clock, LogIn, LogOut, Search, User } from "lucide-react";

type Employee = {
    id: string;
    name: string;
    job_title?: string;
    image_url?: string;
};

type Attendance = {
    id: string;
    check_in: string;
    check_out: string | null;
};

export default function AttendanceKioskPage() {
    const router = useRouter();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [employeeAttendance, setEmployeeAttendance] = useState<Attendance | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await fetchAPI("/hr/employees");
            if (res.ok) setEmployees(await res.json());
        } catch (e) {
            console.error("Failed to fetch employees", e);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectEmployee = async (emp: Employee) => {
        setSelectedEmployee(emp);
        setProcessing(true);
        try {
            // Check if they are currently checked in
            const res = await fetchAPI(`/attendance/attendances?employee_id=${emp.id}`);
            if (res.ok) {
                const logs = await res.json();
                if (Array.isArray(logs) && logs.length > 0 && !logs[0].check_out) {
                    setEmployeeAttendance(logs[0]);
                } else {
                    setEmployeeAttendance(null);
                }
            }
        } catch (e) {
            console.error("Error loading employee attendance state", e);
        } finally {
            setProcessing(false);
        }
    };

    const handleToggleCheck = async () => {
        if (!selectedEmployee) return;
        setProcessing(true);
        try {
            if (!employeeAttendance) {
                // Perform Check In
                const res = await fetchAPI("/attendance/attendances", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        employee_id: selectedEmployee.id,
                        check_in: new Date().toISOString()
                    })
                });
                if (res.ok) {
                    setFeedback(`✅ Checked in successfully! Welcome, ${selectedEmployee.name}.`);
                    setTimeout(() => {
                        setSelectedEmployee(null);
                        setEmployeeAttendance(null);
                        setFeedback(null);
                    }, 3000);
                }
            } else {
                // Perform Check Out
                const res = await fetchAPI(`/attendance/attendances/${employeeAttendance.id}/checkout`, {
                    method: "PUT"
                });
                if (res.ok) {
                    setFeedback(`👋 Checked out successfully! Goodbye, ${selectedEmployee.name}.`);
                    setTimeout(() => {
                        setSelectedEmployee(null);
                        setEmployeeAttendance(null);
                        setFeedback(null);
                    }, 3000);
                }
            }
        } catch (e) {
            console.error("Attendance check toggle failed", e);
        } finally {
            setProcessing(false);
        }
    };

    const filteredEmployees = employees.filter(emp => 
        emp.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-screen bg-[#0B101E] text-white">
            <div className="h-16 border-b border-gray-800 bg-[#141A28] flex items-center justify-between px-6 shrink-0 shadow-md">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => router.push("/attendances")}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <span className="font-bold text-lg text-white tracking-wide">Kiosk Mode Attendance Launcher</span>
                </div>
                <div className="text-sm font-semibold text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded">
                    Galaxy Workspace
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
                {!selectedEmployee ? (
                    // GRID SELECTION VIEW
                    <div className="w-full max-w-4xl h-full flex flex-col overflow-hidden">
                        <div className="mb-6 max-w-md w-full relative shrink-0">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search your name..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#1E293B] border border-gray-700 rounded-xl pl-11 pr-4 py-3 text-white outline-none focus:border-green-500 shadow-sm"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2">
                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : filteredEmployees.length === 0 ? (
                                <div className="text-center py-20 text-gray-500">No employees found.</div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {filteredEmployees.map(emp => (
                                        <button 
                                            key={emp.id} 
                                            onClick={() => handleSelectEmployee(emp)}
                                            className="bg-[#1E293B] border border-gray-700 hover:border-green-500 rounded-2xl p-6 flex flex-col items-center text-center gap-4 transition-all hover:scale-105 active:scale-95 shadow"
                                        >
                                            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center border border-gray-600 font-bold text-white text-xl">
                                                {emp.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white truncate w-36">{emp.name}</h4>
                                                <p className="text-xs text-gray-400 truncate w-36 mt-0.5">{emp.job_title || 'Employee'}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    // CHECK-IN/OUT CONFIRMATION VIEW
                    <div className="max-w-md w-full bg-[#1E293B] border border-gray-700 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden animate-in fade-in">
                        {feedback ? (
                            <div className="py-8 space-y-6">
                                <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full mx-auto flex items-center justify-center animate-bounce">
                                    <UserCheck size={40} />
                                </div>
                                <p className="text-lg font-bold text-white leading-relaxed">{feedback}</p>
                                <p className="text-xs text-gray-500 italic pt-6 border-t border-white/5">Returning to Kiosk grid in 3 seconds...</p>
                            </div>
                        ) : (
                            <div>
                                <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto mb-6 flex items-center justify-center font-bold text-white text-3xl border-4 border-gray-600">
                                    {selectedEmployee.name.charAt(0)}
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-1">{selectedEmployee.name}</h3>
                                <p className="text-sm text-gray-400 mb-8">{selectedEmployee.job_title || 'Employee'}</p>

                                {employeeAttendance ? (
                                    <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-4 mb-8 text-center">
                                        <p className="text-xs text-blue-400 font-semibold uppercase flex items-center justify-center gap-1.5 mb-1">
                                            <Clock size={14} /> Checked in at
                                        </p>
                                        <p className="text-2xl font-mono text-white font-bold">
                                            {new Date(employeeAttendance.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-sm mb-8">Click check-in to log your active presence.</p>
                                )}

                                <div className="flex flex-col gap-3">
                                    <button 
                                        onClick={handleToggleCheck}
                                        disabled={processing}
                                        className={`w-full py-4 rounded-xl font-bold text-xl flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-lg ${
                                            employeeAttendance 
                                                ? "bg-orange-600 hover:bg-orange-700 shadow-orange-900/20" 
                                                : "bg-green-600 hover:bg-green-700 shadow-green-900/20"
                                        }`}
                                    >
                                        {employeeAttendance ? <LogOut size={22} /> : <LogIn size={22} />}
                                        {employeeAttendance ? "Check Out" : "Check In"}
                                    </button>

                                    <button 
                                        onClick={() => setSelectedEmployee(null)}
                                        className="w-full py-3 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white rounded-xl text-sm font-semibold transition-colors mt-2"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
