"use client";

import InventoryHeader from '@/components/inventory/InventoryHeader';
import { MoreHorizontal } from 'lucide-react';

export default function InventoryPage() {
    // Mock data for dashboard cards
    const operations = [
        { id: 1, name: 'Receipts', warehouse: 'San Francisco', count: 0, color: 'text-blue-500', button: '0 To Process' },
        { id: 2, name: 'Internal Transfers', warehouse: 'San Francisco', count: 0, color: 'text-orange-500', button: '0 To Process' },
        { id: 3, name: 'Delivery Orders', warehouse: 'San Francisco', count: 2, color: 'text-green-500', button: '2 To Process' },
        { id: 4, name: 'Returns', warehouse: 'San Francisco', count: 0, color: 'text-red-500', button: '0 To Process' },
        { id: 5, name: 'Manufacturing', warehouse: 'San Francisco', count: 0, color: 'text-purple-500', button: '0 To Process' },
    ];

    return (
        <div className="flex flex-col h-screen">
            <InventoryHeader />

            <div className="flex-1 overflow-auto p-6">
                <h2 className="text-xl font-semibold text-gray-200 mb-6">Inventory Overview</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {operations.map((op) => (
                        <div key={op.id} className="bg-[#1E293B] border border-gray-700 rounded-lg p-4 hover:border-gray-500 transition-colors cursor-pointer group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className={`font-semibold text-lg ${op.color}`}>{op.name}</h3>
                                    <p className="text-sm text-gray-400">{op.warehouse}</p>
                                </div>
                                <button className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>

                            <div className="flex justify-center py-4">
                                <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full font-medium shadow-lg shadow-purple-900/20">
                                    {op.button}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
