"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { BarChart3, Settings, Users, Tag, Workflow, Mail } from "lucide-react";

const MENU_ITEMS = [
    { name: "Quotations", href: "/sales" },
    { name: "Orders", href: "/sales/orders" },
    { name: "Customers", href: "/sales/customers" },
    { name: "Products", href: "/sales/products" },
    { name: "Reporting", href: "/sales/reporting" },
    { name: "Configuration", href: "/sales/configuration" },
];

export default function SalesConfigurationPage() {
    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Sales"
                moduleIcon={<BarChart3 size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search settings..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-200">Sales Configuration</h2>
                    <p className="text-sm text-gray-400 mt-1">Customize your sales settings and workflows</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-blue-500/20 p-3 rounded-lg w-fit mb-4">
                            <Workflow size={24} className="text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Sales Process</h3>
                        <p className="text-sm text-gray-400 mb-4">Configure quotation and order workflow</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">Configure →</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-purple-500/20 p-3 rounded-lg w-fit mb-4">
                            <Users size={24} className="text-purple-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Sales Teams</h3>
                        <p className="text-sm text-gray-400 mb-4">Manage sales teams and territories</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">Configure →</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-green-500/20 p-3 rounded-lg w-fit mb-4">
                            <Tag size={24} className="text-green-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Product Tags</h3>
                        <p className="text-sm text-gray-400 mb-4">Create and manage product categories</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">Configure →</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-yellow-500/20 p-3 rounded-lg w-fit mb-4">
                            <Settings size={24} className="text-yellow-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Payment Terms</h3>
                        <p className="text-sm text-gray-400 mb-4">Define payment terms and conditions</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">Configure →</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-red-500/20 p-3 rounded-lg w-fit mb-4">
                            <Mail size={24} className="text-red-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Email Templates</h3>
                        <p className="text-sm text-gray-400 mb-4">Create templates for quotations and orders</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">Configure →</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-cyan-500/20 p-3 rounded-lg w-fit mb-4">
                            <Settings size={24} className="text-cyan-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Pricing Rules</h3>
                        <p className="text-sm text-gray-400 mb-4">Configure discounts and pricing strategies</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">Configure →</div>
                    </div>
                </div>

                {/* Current Settings */}
                <div className="mt-8 bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Current Settings</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-700">
                            <div>
                                <div className="font-medium text-white">Default Payment Term</div>
                                <div className="text-sm text-gray-400">Net 30 days</div>
                            </div>
                            <button className="text-sm text-blue-400 hover:text-blue-300">Edit</button>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-gray-700">
                            <div>
                                <div className="font-medium text-white">Quotation Validity</div>
                                <div className="text-sm text-gray-400">30 days</div>
                            </div>
                            <button className="text-sm text-blue-400 hover:text-blue-300">Edit</button>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-gray-700">
                            <div>
                                <div className="font-medium text-white">Auto-confirm Orders</div>
                                <div className="text-sm text-gray-400">Enabled</div>
                            </div>
                            <button className="text-sm text-blue-400 hover:text-blue-300">Edit</button>
                        </div>

                        <div className="flex items-center justify-between py-3">
                            <div>
                                <div className="font-medium text-white">Email Notifications</div>
                                <div className="text-sm text-gray-400">Enabled for all events</div>
                            </div>
                            <button className="text-sm text-blue-400 hover:text-blue-300">Edit</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
