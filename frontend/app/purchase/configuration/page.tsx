"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { ShoppingCart, Settings, Tag, Workflow, AlertTriangle, FileText } from "lucide-react";

const MENU_ITEMS = [
    { name: "RFQs", href: "/purchase" },
    { name: "Purchase Orders", href: "/purchase/orders" },
    { name: "Vendors", href: "/purchase/vendors" },
    { name: "Reporting", href: "/purchase/reporting" },
    { name: "Configuration", href: "/purchase/configuration" },
];

export default function PurchaseConfigurationPage() {
    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Purchase"
                moduleIcon={<ShoppingCart size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search settings..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-200">Purchase Configuration</h2>
                    <p className="text-sm text-gray-400 mt-1">Customize procurement settings and workflows</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-blue-500/20 p-3 rounded-lg w-fit mb-4">
                            <Workflow size={24} className="text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Approval Rules</h3>
                        <p className="text-sm text-gray-400 mb-4">Configure purchase order approval workflows</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">Configure →</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-purple-500/20 p-3 rounded-lg w-fit mb-4">
                            <Tag size={24} className="text-purple-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Vendor Categories</h3>
                        <p className="text-sm text-gray-400 mb-4">Manage vendor tags and classifications</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">Configure →</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-yellow-500/20 p-3 rounded-lg w-fit mb-4">
                            <AlertTriangle size={24} className="text-yellow-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Vendor Warnings</h3>
                        <p className="text-sm text-gray-400 mb-4">Set up warnings for specific vendors</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">Configure →</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-green-500/20 p-3 rounded-lg w-fit mb-4">
                            <Settings size={24} className="text-green-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Purchase Agreements</h3>
                        <p className="text-sm text-gray-400 mb-4">Configure blanket orders and agreements</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">Configure →</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-red-500/20 p-3 rounded-lg w-fit mb-4">
                            <FileText size={24} className="text-red-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">RFQ Templates</h3>
                        <p className="text-sm text-gray-400 mb-4">Create and manage RFQ email templates</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">Configure →</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-cyan-500/20 p-3 rounded-lg w-fit mb-4">
                            <Settings size={24} className="text-cyan-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Incoterms</h3>
                        <p className="text-sm text-gray-400 mb-4">Manage international commercial terms</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">Configure →</div>
                    </div>
                </div>

                <div className="mt-8 bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Current Settings</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-700">
                            <div>
                                <div className="font-medium text-white">Purchase Order Approval</div>
                                <div className="text-sm text-gray-400">Required for orders > $5,000</div>
                            </div>
                            <button className="text-sm text-blue-400 hover:text-blue-300">Edit</button>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-700">
                            <div>
                                <div className="font-medium text-white">3-Way Matching</div>
                                <div className="text-sm text-gray-400">Enabled (PO, Receipt, Bill)</div>
                            </div>
                            <button className="text-sm text-blue-400 hover:text-blue-300">Edit</button>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <div>
                                <div className="font-medium text-white">Dropshipping</div>
                                <div className="text-sm text-gray-400">Enabled</div>
                            </div>
                            <button className="text-sm text-blue-400 hover:text-blue-300">Edit</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
