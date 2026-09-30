"use client";
import { fetchAPI } from "@/lib/api";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppHeader from "@/components/layout/AppHeader";
import { ArrowLeft, Calendar, Clock, User, Check, AlertCircle } from "lucide-react";

export default function PublicBookingPage() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [date, setDate] = useState("");
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConfirmBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim() || !date) return;

        setLoading(true);
        setError(null);

        const start = new Date(date);
        const end = new Date(start.getTime() + 60 * 60 * 1000); // Default 1 hour appointment

        try {
            const res = await fetchAPI("/appointments/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: `${name} (${email})`,
                    start_time: start.toISOString(),
                    end_time: end.toISOString()
                })
            });

            if (res.ok) {
                setSuccess(true);
            } else {
                setError("Failed to schedule booking. Please verify timeslot availability.");
            }
        } catch (err) {
            setError("Connection failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#0B101E] text-white">
            <div className="h-16 border-b border-gray-800 bg-[#141A28] flex items-center justify-between px-6 shrink-0 shadow-md">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => router.push("/appointments")}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <span className="font-bold text-lg text-white">Schedule Meeting Slot</span>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-[#1E293B] border border-gray-700 rounded-2xl p-8 shadow-2xl relative overflow-hidden animate-in fade-in">
                    {success ? (
                        <div className="text-center py-6 space-y-6">
                            <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full mx-auto flex items-center justify-center animate-bounce">
                                <Check size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Booking Confirmed!</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Your slot on <span className="text-white font-semibold">{new Date(date).toLocaleString()}</span> has been successfully logged inside the system. An email invite has been dispatched.
                            </p>
                            <button 
                                onClick={() => router.push("/appointments")}
                                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-all"
                            >
                                Back to Appointments
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleConfirmBooking} className="space-y-6">
                            <div className="text-center mb-4">
                                <div className="w-14 h-14 bg-purple-500/20 text-purple-400 rounded-full mx-auto flex items-center justify-center mb-3">
                                    <Calendar size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-white">Book an Appointment</h3>
                                <p className="text-xs text-gray-400 mt-1">Fill in the fields to reserve your meeting window.</p>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-semibold">
                                    <AlertCircle size={16} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Your Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3.5 text-gray-500" size={16} />
                                    <input 
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. John Doe"
                                        className="w-full bg-[#0F172A] border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-purple-500 outline-none text-sm transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                                <input 
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="johndoe@email.com"
                                    className="w-full bg-[#0F172A] border border-gray-700 rounded-xl py-3 px-4 text-white focus:border-purple-500 outline-none text-sm transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Select Date & Time</label>
                                <div className="relative">
                                    <input 
                                        type="datetime-local"
                                        required
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full bg-[#0F172A] border border-gray-700 rounded-xl py-3 px-4 text-white focus:border-purple-500 outline-none text-sm transition-colors"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={loading || !name || !email || !date}
                                className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl font-bold text-base transition-all shadow-lg shadow-purple-900/20 active:scale-95"
                            >
                                {loading ? "Reserving..." : "Confirm Reservation"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
