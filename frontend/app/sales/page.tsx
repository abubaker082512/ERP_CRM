"use client";

import { useState } from 'react';
import SalesHeader from '@/components/sales/SalesHeader';
import { Plus, Settings, Clock, MoreHorizontal, User } from 'lucide-react';

const initialQuotations = [
    { id: 'S00012', customer: 'Azure Interior', date: '08/28/2023', total: 4069.80, status: 'Quotation' },
    { id: 'S00011', customer: 'Deco Addict', date: '08/28/2023', total: 603.75, status: 'Quotation Sent' },
    { id: 'S00010', customer: 'Gemini Furniture', date: '08/28/2023', total: 12500.00, status: 'Sales Order' },
];

export default function SalesPage() {
    return (
        <div className="flex flex-col h-screen">
            <SalesHeader />

            <div className="flex-1 overflow-auto p-4">
                {/* Toolbar */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded text-sm font-medium">
                            New
                        </button>
                    </div>
                </div>

                {/* List View (Placeholder for now, can be Kanban too) */}
                <div className="bg-[#1E293B] rounded border border-gray-700 overflow-hidden">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-200 uppercase bg-[#0F172A] border-b border-gray-700">
                            <tr>
                                <th className="px-6 py-3">Number</th>
                                <th className="px-6 py-3">Creation Date</th>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Salesperson</th>
                                <th className="px-6 py-3">Activities</th>
                                <th className="px-6 py-3 text-right">Total</th>
                                <th className="px-6 py-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {initialQuotations.map((q) => (
                                <tr key={q.id} className="border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer">
                                    <td className="px-6 py-4 font-medium text-white">{q.id}</td>
                                    <td className="px-6 py-4">{q.date}</td>
                                    <td className="px-6 py-4">{q.customer}</td>
                                    <td className="px-6 py-4 flex items-center gap-2">
                                        <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">A</div>
                                        <span>Mitchell Admin</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Clock size={16} className="text-gray-500" />
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-white">${q.total.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${q.status === 'Sales Order' ? 'bg-green-500/20 text-green-400' :
                                                q.status === 'Quotation Sent' ? 'bg-purple-500/20 text-purple-400' :
                                                    'bg-gray-500/20 text-gray-400'
                                            }`}>
                                            {q.status}
                                        </span>
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
