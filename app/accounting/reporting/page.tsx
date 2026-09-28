"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { DollarSign, TrendingUp, FileText, PieChart } from "lucide-react";

const MENU_ITEMS = [
    { name: "Dashboard", href: "/accounting" },
    { name: "Customers", href: "/accounting/customers" },
    { name: "Vendors", href: "/accounting/vendors" },
    { name: "Accounting", href: "/accounting/journal" },
    { name: "Reporting", href: "/accounting/reporting" },
    { name: "Configuration", href: "/accounting/configuration" },
];

export default function AccountingReportingPage() {
    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Accounting"
                moduleIcon={<DollarSign size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search reports..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-200">Financial Reports</h2>
                    <p className="text-sm text-gray-400 mt-1">Analyze your financial performance</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Balance Sheet */}
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-blue-500/20 p-3 rounded-lg w-fit mb-4">
                            <FileText size={24} className="text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Balance Sheet</h3>
                        <p className="text-sm text-gray-400 mb-4">Assets, Liabilities, and Equity snapshot</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">View Report →</div>
                    </div>

                    {/* Profit & Loss */}
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-green-500/20 p-3 rounded-lg w-fit mb-4">
                            <TrendingUp size={24} className="text-green-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Profit & Loss</h3>
                        <p className="text-sm text-gray-400 mb-4">Income, Expenses, and Net Profit</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">View Report →</div>
                    </div>

                    {/* Cash Flow */}
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-purple-500/20 p-3 rounded-lg w-fit mb-4">
                            <DollarSign size={24} className="text-purple-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Cash Flow Statement</h3>
                        <p className="text-sm text-gray-400 mb-4">Inflows and outflows of cash</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">View Report →</div>
                    </div>

                    {/* Aged Receivable */}
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-yellow-500/20 p-3 rounded-lg w-fit mb-4">
                            <PieChart size={24} className="text-yellow-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Aged Receivable</h3>
                        <p className="text-sm text-gray-400 mb-4">Outstanding customer invoices by age</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">View Report →</div>
                    </div>

                    {/* Aged Payable */}
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-red-500/20 p-3 rounded-lg w-fit mb-4">
                            <PieChart size={24} className="text-red-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Aged Payable</h3>
                        <p className="text-sm text-gray-400 mb-4">Outstanding vendor bills by age</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">View Report →</div>
                    </div>

                    {/* General Ledger */}
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-cyan-500/20 p-3 rounded-lg w-fit mb-4">
                            <FileText size={24} className="text-cyan-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">General Ledger</h3>
                        <p className="text-sm text-gray-400 mb-4">Complete record of all financial transactions</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">View Report →</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
