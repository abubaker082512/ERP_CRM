"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { DollarSign, FileText, ArrowRightLeft } from "lucide-react";

const MENU_ITEMS = [
    { name: "Dashboard", href: "/accounting" },
    { name: "Customers", href: "/accounting/customers" },
    { name: "Vendors", href: "/accounting/vendors" },
    { name: "Accounting", href: "/accounting/journal" },
    { name: "Reporting", href: "/accounting/reporting" },
    { name: "Configuration", href: "/accounting/configuration" },
];

type JournalEntry = {
    id: string;
    date: string;
    ref: string;
    journal: string;
    partner: string;
    amount: number;
    status: string;
};

const mockEntries: JournalEntry[] = [
    { id: "MISC/2025/001", date: "2025-12-01", ref: "Opening Balance", journal: "Miscellaneous", partner: "", amount: 100000, status: "posted" },
    { id: "BNK1/2025/001", date: "2025-12-02", ref: "Payment INV/2025/001", journal: "Bank", partner: "Acme Corp", amount: 15000, status: "posted" },
    { id: "CSH1/2025/001", date: "2025-12-03", ref: "Petty Cash", journal: "Cash", partner: "", amount: 500, status: "draft" },
];

export default function AccountingJournalPage() {
    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Accounting"
                moduleIcon={<DollarSign size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search journal entries..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-200">Journal Entries</h2>
                    <p className="text-sm text-gray-400 mt-1">Manage general ledger entries</p>
                </div>

                <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-[#0F172A] border-b border-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Date</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Number</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Reference</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Journal</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Partner</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Total</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockEntries.map(entry => (
                                <tr key={entry.id} className="border-b border-gray-700 hover:bg-[#1E293B] transition-colors">
                                    <td className="px-4 py-3 text-gray-400">{new Date(entry.date).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 font-medium text-white">{entry.id}</td>
                                    <td className="px-4 py-3 text-gray-300">{entry.ref}</td>
                                    <td className="px-4 py-3 text-gray-300">{entry.journal}</td>
                                    <td className="px-4 py-3 text-gray-300">{entry.partner || "-"}</td>
                                    <td className="px-4 py-3 text-white font-medium">${entry.amount.toLocaleString()}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${entry.status === 'posted' ? 'bg-blue-500/20 text-blue-400' :
                                                'bg-gray-500/20 text-gray-400'
                                            }`}>
                                            {entry.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button className="text-blue-400 hover:text-blue-300 text-sm">View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
