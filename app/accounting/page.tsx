"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { DollarSign, TrendingUp, TrendingDown, FileText, CreditCard, Plus, MoreHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchAPI } from "@/lib/api";

const MENU_ITEMS = [
    { name: "Dashboard", href: "/accounting" },
    { name: "Customers", href: "/accounting/customers" },
    { name: "Vendors", href: "/accounting/vendors" },
    { name: "Accounting", href: "/accounting/journal" },
    { name: "Reporting", href: "/accounting/reporting" },
    { name: "Configuration", href: "/accounting/configuration" },
];

const TYPE_COLORS: Record<string, string> = {
    sale: "text-blue-400",
    purchase: "text-red-400",
    cash: "text-green-400",
    bank: "text-purple-400",
    general: "text-amber-400"
};

export default function AccountingPage() {
    const [journals, setJournals] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetchJournals();
    }, []);

    const fetchJournals = async () => {
        setLoading(true);
        try {
            const res = await fetchAPI("/accounting/journals");
            if (res.ok) {
                const data = await res.json();
                setJournals(data || []);
            }
        } catch (error) {
            console.error("Error fetching journals:", error);
        } finally {
            setLoading(false);
        }
    };

    const initializeJournals = async () => {
        try {
            const defaultJournals = [
                { name: "Customer Invoices", code: "INV", type: "sale" },
                { name: "Vendor Bills", code: "BILL", type: "purchase" },
                { name: "Bank", code: "BNK", type: "bank" },
                { name: "Cash", code: "CSH", type: "cash" }
            ];
            for (const j of defaultJournals) {
                await fetchAPI("/accounting/journals", {
                    method: "POST",
                    body: JSON.stringify(j)
                });
            }
            fetchJournals();
        } catch (error) {
            console.error("Error initializing journals:", error);
        }
    };

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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-hidden">
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="font-semibold text-white">Customer Invoices</h3>
                            <Link href="/accounting/customers" className="text-sm text-blue-400 hover:text-blue-300">View All</Link>
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
                            <Link href="/accounting/journal" className="block text-center w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm">
                                View Invoices
                            </Link>
                        </div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-hidden">
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="font-semibold text-white">Vendor Bills</h3>
                            <Link href="/accounting/vendors" className="text-sm text-blue-400 hover:text-blue-300">View All</Link>
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
                            <Link href="/accounting/vendors" className="block text-center w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm">
                                View Bills
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <h3 className="text-xl font-semibold text-white">Accounting Journals</h3>
                </div>

                {loading ? (
                    <div className="text-gray-400 py-6">Loading journals...</div>
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
                                        <p className="text-xs text-gray-400 mb-1">Type</p>
                                        <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded text-sm font-semibold uppercase">{journal.type || 'general'}</span>
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
