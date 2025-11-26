"use client";

import PayrollHeader from "@/components/payroll/PayrollHeader";
import { useEffect, useState } from "react";
import { Plus, FileText, User } from "lucide-react";

type Payslip = {
    id: string;
    employee_id: string;
    period_start: string;
    period_end: string;
    net_amount: number;
    state: string;
};

export default function PayslipsPage() {
    const [payslips, setPayslips] = useState<Payslip[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetch("http://localhost:8000/api/v1/payroll/payslips")
            .then((r) => r.json())
            .then(setPayslips)
            .catch(console.error);
    }, []);

    const createPayslip = () => {
        alert("Payslip creation requires selecting an employee and period.");
        setIsModalOpen(false);
    }

    return (
        <div className="flex flex-col h-screen">
            <PayrollHeader />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-200">Payslips</h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded flex items-center gap-1"
                    >
                        <Plus size={16} /> Generate Payslip
                    </button>
                </div>

                <div className="bg-[#1E293B] border border-gray-700 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-gray-800 text-gray-200 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-3">Employee</th>
                                <th className="px-6 py-3">Period</th>
                                <th className="px-6 py-3">Net Amount</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {payslips.map((slip) => (
                                <tr key={slip.id} className="hover:bg-gray-700/50 transition-colors cursor-pointer">
                                    <td className="px-6 py-4 flex items-center gap-2">
                                        <User size={16} /> {slip.employee_id}
                                    </td>
                                    <td className="px-6 py-4">
                                        {slip.period_start} - {slip.period_end}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-white">
                                        ${slip.net_amount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">Done</span>
                                    </td>
                                </tr>
                            ))}
                            {payslips.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        No payslips found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal would go here */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-[#1E293B] rounded-lg p-6 w-full max-w-md border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Generate Payslip</h3>
                        <p className="text-gray-400 mb-6">Select employee and period (Mockup).</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-300 hover:text-white">Cancel</button>
                            <button onClick={createPayslip} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Generate</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
