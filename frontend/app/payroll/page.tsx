"use client";

import PayrollHeader from "@/components/payroll/PayrollHeader";
import { DollarSign, FileText, Users, TrendingUp } from "lucide-react";

export default function PayrollDashboard() {
    return (
        <div className="flex flex-col h-screen">
            <PayrollHeader />

            <div className="flex-1 overflow-auto p-6">
                <h2 className="text-xl font-semibold text-gray-200 mb-6">Payroll Dashboard</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-[#1E293B] border border-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-gray-400 text-sm">Total Payroll Cost</p>
                                <h3 className="text-2xl font-bold text-white">$0.00</h3>
                            </div>
                            <div className="bg-green-500/20 p-2 rounded text-green-500"><DollarSign size={20} /></div>
                        </div>
                        <p className="text-xs text-green-400 flex items-center gap-1"><TrendingUp size={12} /> +0% from last month</p>
                    </div>

                    <div className="bg-[#1E293B] border border-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-gray-400 text-sm">Payslips Generated</p>
                                <h3 className="text-2xl font-bold text-white">0</h3>
                            </div>
                            <div className="bg-blue-500/20 p-2 rounded text-blue-500"><FileText size={20} /></div>
                        </div>
                    </div>

                    <div className="bg-[#1E293B] border border-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-gray-400 text-sm">Active Employees</p>
                                <h3 className="text-2xl font-bold text-white">0</h3>
                            </div>
                            <div className="bg-purple-500/20 p-2 rounded text-purple-500"><Users size={20} /></div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#1E293B] border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Payslips</h3>
                    <div className="text-center py-8 text-gray-500">
                        No payslips generated yet.
                    </div>
                </div>
            </div>
        </div>
    );
}
