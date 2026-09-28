"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { Wrench, Package, Layers } from "lucide-react";

const MENU_ITEMS = [
    { name: "Manufacturing Orders", href: "/manufacturing" },
    { name: "Work Orders", href: "/manufacturing/work-orders" },
    { name: "Bill of Materials", href: "/manufacturing/bom" },
    { name: "Reporting", href: "/manufacturing/reporting" },
    { name: "Configuration", href: "/manufacturing/configuration" },
];

type BOM = {
    id: string;
    product: string;
    reference: string;
    quantity: number;
    type: string;
    components: number;
};

const mockBOMs: BOM[] = [
    { id: "BOM/001", product: "Office Chair", reference: "Standard Chair", quantity: 1, type: "Manufacture", components: 5 },
    { id: "BOM/002", product: "Wooden Desk", reference: "Executive Desk", quantity: 1, type: "Manufacture", components: 8 },
    { id: "BOM/003", product: "Cabinet", reference: "File Cabinet", quantity: 1, type: "Kit", components: 12 },
];

export default function BOMPage() {
    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Manufacturing"
                moduleIcon={<Wrench size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search BOMs..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-200">Bill of Materials</h2>
                            <p className="text-sm text-gray-400 mt-1">{mockBOMs.length} active BOMs</p>
                        </div>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2">
                        <Layers size={18} /> Create BOM
                    </button>
                </div>

                <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-[#0F172A] border-b border-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Product</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Reference</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Quantity</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">BOM Type</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Components</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockBOMs.map(bom => (
                                <tr key={bom.id} className="border-b border-gray-700 hover:bg-[#1E293B] transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Package size={16} className="text-blue-400" />
                                            <span className="font-medium text-white">{bom.product}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-300">{bom.reference}</td>
                                    <td className="px-4 py-3 text-white">{bom.quantity}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${bom.type === 'Manufacture' ? 'bg-blue-500/20 text-blue-400' :
                                                'bg-purple-500/20 text-purple-400'
                                            }`}>
                                            {bom.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-300">{bom.components} items</td>
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
