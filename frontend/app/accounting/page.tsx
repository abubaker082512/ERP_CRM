"use client";

import { fetchAPI } from '@/lib/api';
import { useState, useEffect } from 'react';
import AccountingHeader from '@/components/accounting/AccountingHeader';
import { MoreHorizontal, Plus, Settings } from 'lucide-react';
import Link from 'next/link';

type Journal = {
    id: string;
    name: string;
    code: string;
    type: string;
};

const TYPE_COLORS: Record<string, string> = {
    sale: 'text-blue-500',
    purchase: 'text-red-500',
    bank: 'text-green-500',
    cash: 'text-yellow-500',
    general: 'text-purple-500'
};

export default function AccountingPage() {
    const [journals, setJournals] = useState<Journal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJournals();
    }, []);

    const fetchJournals = async () => {
        try {
            const res = await fetchAPI("/accounting/journals");
            if (res.ok) {
                const data = await res.json();
                setJournals(Array.isArray(data) ? data : []);
            } else {
                setJournals([]);
            }
        } catch (error) {
            console.error("Failed to fetch journals", error);
            setJournals([]);
        } finally {
            setLoading(false);
        }
    };

    const initializeJournals = async () => {
        setLoading(true);
        const defaults = [
            { name: 'Customer Invoices', code: 'INV', type: 'sale' },
            { name: 'Vendor Bills', code: 'BILL', type: 'purchase' },
            { name: 'Bank', code: 'BNK1', type: 'bank' },
            { name: 'Cash', code: 'CSH1', type: 'cash' },
            { name: 'Miscellaneous Operations', code: 'MISC', type: 'general' },
        ];

        for (const j of defaults) {
            await fetchAPI("/accounting/journals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(j)
            });
        }
        await fetchJournals();
    };

    return (
        <div className="space-y-6">
            <div className="flex-1 overflow-auto p-0">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-200">Accounting Dashboard</h2>
                    <button className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 transition-colors">
                        <Settings size={16} /> Configuration
                    </button>
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
