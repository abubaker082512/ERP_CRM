"use client";

import { useEffect, useState } from "react";
import PayrollHeader from "@/components/payroll/PayrollHeader";
import { Plus, Play, CheckCircle, Clock, Calendar, AlertCircle } from "lucide-react";
import { fetchAPI } from "@/lib/api";

type PayrollRun = {
    id: string;
    name: string;
    date_start: string;
    date_end: string;
    state: string;
    created_at: string;
};

export default function PayrollRunsPage() {
    const [runs, setRuns] = useState<PayrollRun[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        fetchRuns();
    }, []);

    const fetchRuns = async () => {
        setLoading(true);
        try {
            const res = await fetchAPI("/payroll/runs");
            if (res.ok) {
                const data = await res.json();
                setRuns(data || []);
            } else {
                setRuns([]);
            }
        } catch (err) {
            console.error(err);
            setRuns([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#0F172A] text-white">
            <PayrollHeader />

            <div className="flex-1 p-8 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Payroll Batches & Runs</h1>
                        <p className="text-sm text-gray-400">Manage monthly and bi-weekly salary batches</p>
                    </div>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium">
                        <Plus size={18} /> New Payroll Run
                    </button>
                </div>

                {loading ? (
                    <div className="text-gray-400 py-12 text-center">Loading payroll runs...</div>
                ) : runs.length === 0 ? (
                    <div className="bg-[#1E293B] border border-gray-700 rounded-xl p-12 text-center max-w-xl mx-auto mt-8">
                        <Calendar size={48} className="text-purple-400 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">No Payroll Batches Yet</h3>
                        <p className="text-gray-400 text-sm mb-6">
                            Create batch payroll runs to process salaries for all department employees simultaneously.
                        </p>
                        <button className="galaxy-btn-primary !py-2.5 !px-6 text-sm inline-flex items-center gap-2">
                            <Plus size={16} /> Create First Batch
                        </button>
                    </div>
                ) : (
                    <div className="bg-[#1E293B] border border-gray-700 rounded-xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-[#0F172A] border-b border-gray-700 text-xs text-gray-400 uppercase">
                                <tr>
                                    <th className="p-4">Batch Name</th>
                                    <th className="p-4">Period Start</th>
                                    <th className="p-4">Period End</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700 text-sm">
                                {runs.map((r) => (
                                    <tr key={r.id} className="hover:bg-white/5">
                                        <td className="p-4 font-semibold text-white">{r.name}</td>
                                        <td className="p-4 text-gray-300">{r.date_start}</td>
                                        <td className="p-4 text-gray-300">{r.date_end}</td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">
                                                {r.state || "draft"}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">View</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
