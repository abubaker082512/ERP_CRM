"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { DollarSign, Settings, Tag, Workflow, FileText, Globe } from "lucide-react";

const MENU_ITEMS = [
    { name: "Dashboard", href: "/accounting" },
    { name: "Customers", href: "/accounting/customers" },
    { name: "Vendors", href: "/accounting/vendors" },
    { name: "Accounting", href: "/accounting/journal" },
    { name: "Reporting", href: "/accounting/reporting" },
    { name: "Configuration", href: "/accounting/configuration" },
];

export default function AccountingConfigurationPage() {
    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Accounting"
                moduleIcon={<DollarSign size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search settings..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-200">Accounting Configuration</h2>
                    <p className="text-sm text-gray-400 mt-1">Setup your accounting system</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-blue-500/20 p-3 rounded-lg w-fit mb-4">
                            <FileText size={24} className="text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Chart of Accounts</h3>
                        <p className="text-sm text-gray-400 mb-4">Manage your accounts hierarchy</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">Configure →</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-purple-500/20 p-3 rounded-lg w-fit mb-4">
                            <Tag size={24} className="text-purple-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Taxes</h3>
                        <p className="text-sm text-gray-400 mb-4">Configure tax rates and rules</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">Configure →</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-yellow-500/20 p-3 rounded-lg w-fit mb-4">
                            <Globe size={24} className="text-yellow-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Currencies</h3>
                        <p className="text-sm text-gray-400 mb-4">Manage multi-currency settings</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">Configure →</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-green-500/20 p-3 rounded-lg w-fit mb-4">
                            <Settings size={24} className="text-green-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Fiscal Years</h3>
                        <p className="text-sm text-gray-400 mb-4">Define fiscal year periods</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">Configure →</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-red-500/20 p-3 rounded-lg w-fit mb-4">
                            <Workflow size={24} className="text-red-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Payment Terms</h3>
                        <p className="text-sm text-gray-400 mb-4">Configure payment terms for invoices</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">Configure →</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-cyan-500/20 p-3 rounded-lg w-fit mb-4">
                            <Settings size={24} className="text-cyan-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Journals</h3>
                        <p className="text-sm text-gray-400 mb-4">Configure accounting journals</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">Configure →</div>
                    </div>
                </div>

                <div className="mt-8 bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Current Settings</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-700">
                            <div>
                                <div className="font-medium text-white">Fiscal Year End</div>
                                <div className="text-sm text-gray-400">December 31st</div>
                            </div>
                            <button className="text-sm text-blue-400 hover:text-blue-300">Edit</button>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-700">
                            <div>
                                <div className="font-medium text-white">Default Currency</div>
                                <div className="text-sm text-gray-400">USD ($)</div>
                            </div>
                            <button className="text-sm text-blue-400 hover:text-blue-300">Edit</button>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <div>
                                <div className="font-medium text-white">Tax Calculation</div>
                                <div className="text-sm text-gray-400">Based on shipping address</div>
                            </div>
                            <button className="text-sm text-blue-400 hover:text-blue-300">Edit</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
