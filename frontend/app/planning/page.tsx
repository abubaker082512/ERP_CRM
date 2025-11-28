"use client";

import PlanningHeader from "@/components/planning/PlanningHeader";
import { useEffect, useState } from "react";
import { Plus, CalendarRange, User, Clock } from "lucide-react";

type Slot = {
    id: string;
    start_datetime: string;
    end_datetime: string;
    is_published: boolean;
};

export default function PlanningPage() {
    const [slots, setSlots] = useState<Slot[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");

    useEffect(() => {
        fetch("http://localhost:8000/api/v1/planning/slots")
            .then((r) => r.json())
            .then(setSlots)
            .catch(console.error);
    }, []);

    const createSlot = async () => {
        if (!start || !end) return;

        const res = await fetch("http://localhost:8000/api/v1/planning/slots", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                start_datetime: new Date(start).toISOString(),
                end_datetime: new Date(end).toISOString()
            }),
        });
        if (res.ok) {
            const slot = await res.json();
            setSlots([...slots, slot]);
            setStart("");
            setEnd("");
            setIsModalOpen(false);
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <PlanningHeader />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-200">Shift Schedule</h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-1.5 rounded flex items-center gap-1"
                    >
                        <Plus size={16} /> New Shift
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {slots.map((slot) => (
                        <div
                            key={slot.id}
                            className="bg-[#1E293B] border border-gray-700 rounded-lg p-6 hover:border-cyan-500 transition-colors"
                        >
                            <div className="flex items-start gap-3 mb-4">
                                <div className="bg-cyan-500/20 p-2 rounded text-cyan-500">
                                    <User size={20} />
                                </div>
                                <div>
                                    <h3 className="font-medium text-white">Unassigned Shift</h3>
                                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                        <Clock size={12} />
                                        <span>{new Date(slot.start_datetime).toLocaleString()} - {new Date(slot.end_datetime).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
                                <span className={`text-xs font-bold uppercase ${slot.is_published ? "text-green-500" : "text-yellow-500"}`}>
                                    {slot.is_published ? "Published" : "Draft"}
                                </span>
                                <button className="text-sm text-cyan-400 hover:text-cyan-300">Edit</button>
                            </div>
                        </div>
                    ))}

                    {slots.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No shifts scheduled.
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-[#1E293B] rounded-lg p-6 w-full max-w-md border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Create Shift</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Start Time</label>
                                <input
                                    type="datetime-local"
                                    value={start}
                                    onChange={(e) => setStart(e.target.value)}
                                    className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-cyan-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">End Time</label>
                                <input
                                    type="datetime-local"
                                    value={end}
                                    onChange={(e) => setEnd(e.target.value)}
                                    className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-cyan-500"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-300 hover:text-white">Cancel</button>
                            <button onClick={createSlot} className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded">Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
