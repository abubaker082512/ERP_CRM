"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { ShoppingBag, Settings, CreditCard, Printer, Monitor, Tag } from "lucide-react";

const MENU_ITEMS = [
    { name: "Dashboard", href: "/pos" },
    { name: "Orders", href: "/pos/orders" },
    { name: "Products", href: "/pos/products" },
    { name: "Reporting", href: "/pos/reporting" },
    { name: "Configuration", href: "/pos/configuration" },
];

export default function POSConfigurationPage() {
    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Point of Sale"
                moduleIcon={<ShoppingBag size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search settings..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-200">POS Configuration</h2>
                    <p className="text-sm text-gray-400 mt-1">Manage point of sale settings</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-blue-500/20 p-3 rounded-lg w-fit mb-4">
                            <Monitor size={24} className="text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Point of Sale</h3>
                        <p className="text-sm text-gray-400 mb-4">Manage POS terminals and shops</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">Configure →</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-purple-500/20 p-3 rounded-lg w-fit mb-4">
                            <CreditCard size={24} className="text-purple-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Payment Methods</h3>
                        <p className="text-sm text-gray-400 mb-4">Configure payment types (Cash, Card)</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">Configure →</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-yellow-500/20 p-3 rounded-lg w-fit mb-4">
                            <Tag size={24} className="text-yellow-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Product Categories</h3>
                        <p className="text-sm text-gray-400 mb-4">Manage POS product categories</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">Configure →</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-green-500/20 p-3 rounded-lg w-fit mb-4">
                            <Printer size={24} className="text-green-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Hardware</h3>
                        <p className="text-sm text-gray-400 mb-4">Configure printers and scanners</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">Configure →</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-red-500/20 p-3 rounded-lg w-fit mb-4">
                            <Settings size={24} className="text-red-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Receipts</h3>
                        <p className="text-sm text-gray-400 mb-4">Customize receipt layout and content</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">Configure →</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-cyan-500/20 p-3 rounded-lg w-fit mb-4">
                            <Settings size={24} className="text-cyan-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Inventory</h3>
                        <p className="text-sm text-gray-400 mb-4">Configure stock update settings</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">Configure →</div>
                    </div>
                </div>

                <div className="mt-8 bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Current Settings</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-700">
                            <div>
                                <div className="font-medium text-white">Inventory Management</div>
                                <div className="text-sm text-gray-400">Real-time updates</div>
                            </div>
                            <button className="text-sm text-blue-400 hover:text-blue-300">Edit</button>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-700">
                            <div>
                                <div className="font-medium text-white">Invoicing</div>
                                <div className="text-sm text-gray-400">Allowed</div>
                            </div>
                            <button className="text-sm text-blue-400 hover:text-blue-300">Edit</button>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <div>
                                <div className="font-medium text-white">Pricelists</div>
                                <div className="text-sm text-gray-400">Enabled (USD)</div>
                            </div>
                            <button className="text-sm text-blue-400 hover:text-blue-300">Edit</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
