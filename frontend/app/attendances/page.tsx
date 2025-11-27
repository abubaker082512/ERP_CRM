"use client";

import AttendanceHeader from "@/components/attendances/AttendanceHeader";
import { useEffect, useState } from "react";
import { UserCheck, LogIn, LogOut, Clock } from "lucide-react";

type Attendance = {
    id: string;
    check_in: string;
    check_out: string | null;
    worked_hours: number;
};

export default function AttendancePage() {
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [currentAttendance, setCurrentAttendance] = useState<Attendance | null>(null);
    const [employeeId, setEmployeeId] = useState("123e4567-e89b-12d3-a456-426614174000"); // Mock ID for now

    useEffect(() => {
        // Check if user has an active attendance
        // In real app, we'd fetch the latest attendance for the logged-in user
    }, []);

    const handleCheckIn = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/v1/attendance/attendances", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    employee_id: employeeId,
                    check_in: new Date().toISOString()
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setCurrentAttendance(data);
                setIsCheckedIn(true);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleCheckOut = async () => {
        if (!currentAttendance) return;
        try {
            const res = await fetch(`http://localhost:8000/api/v1/attendance/attendances/${currentAttendance.id}/checkout`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
            });
            if (res.ok) {
                setIsCheckedIn(false);
                setCurrentAttendance(null);
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <AttendanceHeader />

            <div className="flex-1 flex items-center justify-center p-6 bg-[#0F172A]">
                <div className="max-w-md w-full bg-[#1E293B] rounded-xl shadow-2xl border border-gray-700 p-8 text-center">
                    <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto mb-6 flex items-center justify-center overflow-hidden border-4 border-gray-600">
                        <UserCheck size={48} className="text-gray-400" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">Welcome, Administrator</h2>
                    <p className="text-gray-400 mb-8">Click the button below to check in or out.</p>

                    {!isCheckedIn ? (
                        <button
                            onClick={handleCheckIn}
                            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 shadow-lg shadow-green-900/20"
                        >
                            <LogIn size={28} />
                            Check In
                        </button>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-4">
                                <div className="flex items-center justify-center gap-2 text-blue-400 mb-1">
                                    <Clock size={16} />
                                    <span className="text-sm font-medium">Checked in at</span>
                                </div>
                                <div className="text-2xl font-mono text-white">
                                    {currentAttendance ? new Date(currentAttendance.check_in).toLocaleTimeString() : "--:--"}
                                </div>
                            </div>

                            <button
                                onClick={handleCheckOut}
                                className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold text-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 shadow-lg shadow-orange-900/20"
                            >
                                <LogOut size={28} />
                                Check Out
                            </button>
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-gray-700 text-sm text-gray-500">
                        <p>Want to check in for Kiosk Mode?</p>
                        <a href="/attendances/kiosk" className="text-blue-400 hover:underline">Switch to Kiosk</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
