"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { DollarSign, TrendingUp, TrendingDown, FileText, CreditCard } from "lucide-react";

const MENU_ITEMS = [
    { name: "Dashboard", href: "/accounting" },
    { name: "Customers", href: "/accounting/customers" },
    { name: "Vendors", href: "/accounting/vendors" },
    { name: "Accounting", href: "/accounting/journal" },
    { name: "Reporting", href: "/accounting/reporting" },
    { name: "Configuration", href: "/accounting/configuration" },
];

export default function AccountingPage() {
    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Accounting"
                moduleIcon={<DollarSign size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search accounting..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-200">Accounting Dashboard</h2>
                    <p className="text-sm text-gray-400 mt-1">Overview of your financial health</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-blue-500/20 p-3 rounded-lg">
                                <DollarSign size={24} className="text-blue-400" />
                            </div>
                            <TrendingUp size={20} className="text-green-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">$124,500</div>
                        <div className="text-sm text-gray-400">Cash Balance</div>
                        <div className="text-xs text-green-400 mt-2">+8% from last month</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="bg-green-500/20 p-3 rounded-lg w-fit mb-4">
                            <FileText size={24} className="text-green-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">$45,200</div>
                        <div className="text-sm text-gray-400">Accounts Receivable</div>
                        <div className="text-xs text-gray-500 mt-2">12 invoices pending</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="bg-red-500/20 p-3 rounded-lg w-fit mb-4">
                            <CreditCard size={24} className="text-red-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">$18,400</div>
                        <div className="text-sm text-gray-400">Accounts Payable</div>
                        <div className="text-xs text-gray-500 mt-2">5 bills due soon</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="bg-purple-500/20 p-3 rounded-lg w-fit mb-4">
                            <TrendingUp size={24} className="text-purple-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">$32,100</div>
                        <div className="text-sm text-gray-400">Net Profit (YTD)</div>
                        <div className="text-xs text-green-400 mt-2">+15% vs last year</div>
                    </div>
                </div>

                {/* Journals */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-hidden">
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="font-semibold text-white">Customer Invoices</h3>
                            <button className="text-sm text-blue-400 hover:text-blue-300">View All</button>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-sm text-gray-400">To Validate</div>
                                <div className="text-white font-medium">3 invoices ($4,500)</div>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-sm text-gray-400">Unpaid</div>
                                <div className="text-white font-medium">12 invoices ($45,200)</div>
                            </div>
                            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm">
                                New Invoice
                            </button>
                        </div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-hidden">
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="font-semibold text-white">Vendor Bills</h3>
                            <button className="text-sm text-blue-400 hover:text-blue-300">View All</button>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-sm text-gray-400">To Pay</div>
                                <div className="text-white font-medium">5 bills ($18,400)</div>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-sm text-gray-400">Late</div>
                                <div className="text-red-400 font-medium">1 bill ($2,100)</div>
                            </div>
                            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm">
                                Upload Bill
                            </button>
                        </div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-hidden">
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="font-semibold text-white">Bank</h3>
                            <button className="text-sm text-blue-400 hover:text-blue-300">View All</button>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-sm text-gray-400">Balance in GL</div>
                                <div className="text-white font-medium">$124,500</div>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-sm text-gray-400">Outstanding Payments</div>
                                <div className="text-white font-medium">$5,200</div>
                            </div>
                            <div className="flex gap-2">
                                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm">
                                    Create Payment
                                </button>
                                <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded text-sm">
                                    Reconcile
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-hidden">
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="font-semibold text-white">Cash</h3>
                            <button className="text-sm text-blue-400 hover:text-blue-300">View All</button>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-sm text-gray-400">Balance in GL</div>
                                <div className="text-white font-medium">$2,850</div>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-sm text-gray-400">Outstanding Receipts</div>
                                <div className="text-white font-medium">$0</div>
                            </div>
                            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm">
                                New Transaction
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-gray-400">Loading journals...</div>
                ) : journals.length === 0 ? (
                    <div className="bg-[#1E293B] border border-gray-700 rounded-lg p-10 text-center">
                        <h3 className="text-lg font-medium text-white mb-2">No Accounting Journals Found</h3>
                        <p className="text-gray-400 mb-6">Your workspace needs default accounting journals to function.</p>
                        <button 
                            onClick={initializeJournals}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium shadow-lg"
                        >
                            Setup Default Journals
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {journals.map((journal) => (
                            <div key={journal.id} className="galaxy-card p-4 flex flex-col justify-between">
                                <div className="flex justify-between items-start mb-8">
                                    <Link href={`/accounting/journal/${journal.id}`} className="block w-full">
                                        <h3 className={`font-semibold text-lg hover:underline ${TYPE_COLORS[journal.type] || 'text-gray-300'}`}>{journal.name}</h3>
                                        <p className="text-sm text-gray-400">{journal.code}</p>
                                    </Link>
                                    <button className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreHorizontal size={20} />
                                    </button>
                                </div>

                                <div className="flex justify-between items-end">
                                    <Link href={`/accounting/journal/${journal.id}/new`} className="bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white border border-purple-500/30 px-4 py-1.5 rounded text-sm font-medium flex items-center gap-1 transition-all">
                                        <Plus size={16} /> New Entry
                                    </Link>
                                    <div className="text-right">
                                        {/* Placeholder for real balance calculation */}
                                        <p className="text-xs text-gray-400 mb-1">Items to Process</p>
                                        <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded text-sm font-semibold">0</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
