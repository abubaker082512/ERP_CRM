"use client";

import AccountingHeader from '@/components/accounting/AccountingHeader';
import { MoreHorizontal, Plus } from 'lucide-react';

export default function AccountingPage() {
    // Mock data for journals
    const journals = [
        { id: 1, name: 'Customer Invoices', code: 'INV', type: 'sale', color: 'text-blue-500', count: 0, amount: 0.00 },
        { id: 2, name: 'Vendor Bills', code: 'BILL', type: 'purchase', color: 'text-red-500', count: 0, amount: 0.00 },
        { id: 3, name: 'Bank', code: 'BNK1', type: 'bank', color: 'text-green-500', count: 0, amount: 15000.00 },
        { id: 4, name: 'Cash', code: 'CSH1', type: 'cash', color: 'text-yellow-500', count: 0, amount: 500.00 },
        { id: 5, name: 'Miscellaneous Operations', code: 'MISC', type: 'general', color: 'text-purple-500', count: 0, amount: 0.00 },
    ];

    return (
        <div className="flex flex-col h-screen">
            <AccountingHeader />

            <div className="flex-1 overflow-auto p-6">
                <h2 className="text-xl font-semibold text-gray-200 mb-6">Accounting Dashboard</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {journals.map((journal) => (
                        <div key={journal.id} className="bg-[#1E293B] border border-gray-700 rounded-lg p-4 hover:border-gray-500 transition-colors cursor-pointer group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className={`font-semibold text-lg ${journal.color}`}>{journal.name}</h3>
                                    <p className="text-sm text-gray-400">{journal.code}</p>
                                </div>
                                <button className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>

                            <div className="flex justify-between items-end mt-8">
                                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded text-sm font-medium flex items-center gap-1">
                                    <Plus size={16} /> New Entry
                                </button>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400">Balance</p>
                                    <p className="font-semibold text-white text-lg">${journal.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
