"use client";

import AppointmentsHeader from "@/components/appointments/AppointmentsHeader";
import { useEffect, useState } from "react";
import { Plus, Calendar, Clock, User } from "lucide-react";

type Appointment = {
    id: string;
    name: string;
    start_time: string;
    end_time: string;
    state: string;
};

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDate, setNewDate] = useState("");

    useEffect(() => {
        fetch("http://localhost:8000/api/v1/appointments/appointments")
            .then((r) => r.json())
            .then(setAppointments)
            .catch(console.error);
    }, []);

    const createAppointment = async () => {
        if (!newName.trim() || !newDate) return;

        // Simple mock duration of 1 hour
        const start = new Date(newDate);
        const end = new Date(start.getTime() + 60 * 60 * 1000);

        const res = await fetch("http://localhost:8000/api/v1/appointments/appointments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: newName,
                start_time: start.toISOString(),
                end_time: end.toISOString()
            }),
        });
        if (res.ok) {
            const appt = await res.json();
            setAppointments([...appointments, appt]);
            setNewName("");
            setNewDate("");
            setIsModalOpen(false);
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <AppointmentsHeader />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-200">Upcoming Appointments</h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded flex items-center gap-1"
                    >
                        <Plus size={16} /> New Appointment
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {appointments.map((appt) => (
                        <div
                            key={appt.id}
                            className="bg-[#1E293B] border border-gray-700 rounded-lg p-6 hover:border-purple-500 transition-colors"
                        >
                            <div className="flex items-start gap-3 mb-4">
                                <div className="bg-purple-500/20 p-2 rounded text-purple-500">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <h3 className="font-medium text-white">{appt.name}</h3>
                                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                        <Clock size={12} />
                                        <span>{new Date(appt.start_time).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
                                <span className="text-xs text-gray-500 uppercase font-bold">{appt.state}</span>
                                <button className="text-sm text-purple-400 hover:text-purple-300">View Details</button>
                            </div>
                        </div>
                    ))}

                    {appointments.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No appointments scheduled.
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-[#1E293B] rounded-lg p-6 w-full max-w-md border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Schedule Appointment</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Customer Name</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-purple-500"
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={newDate}
                                    onChange={(e) => setNewDate(e.target.value)}
                                    className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-purple-500"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-300 hover:text-white">Cancel</button>
                            <button onClick={createAppointment} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">Schedule</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
