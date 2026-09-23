"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { Target, TrendingUp, DollarSign, Users, Award } from "lucide-react";

const MENU_ITEMS = [
    { name: "My Pipeline", href: "/crm" },
    { name: "My Activities", href: "/crm/activities" },
    { name: "Sales", href: "/crm/sales" },
    { name: "Reporting", href: "/crm/reporting" },
    { name: "Configuration", href: "/crm/configuration" },
];

export default function CRMReportingPage() {
    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="CRM"
                moduleIcon={<Target size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search reports..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-200">CRM Reporting</h2>
                    <p className="text-sm text-gray-400 mt-1">
                        Analytics and insights for your sales pipeline
                    </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-blue-500/20 p-3 rounded-lg">
                                <Users size={24} className="text-blue-400" />
                            </div>
                            <TrendingUp size={20} className="text-green-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">247</div>
                        <div className="text-sm text-gray-400">Total Leads</div>
                        <div className="text-xs text-green-400 mt-2">+12% from last month</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-green-500/20 p-3 rounded-lg">
                                <DollarSign size={24} className="text-green-400" />
                            </div>
                            <TrendingUp size={20} className="text-green-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">$2.4M</div>
                        <div className="text-sm text-gray-400">Expected Revenue</div>
                        <div className="text-xs text-green-400 mt-2">+18% from last month</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-purple-500/20 p-3 rounded-lg">
                                <Award size={24} className="text-purple-400" />
                            </div>
                            <TrendingUp size={20} className="text-green-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">68%</div>
                        <div className="text-sm text-gray-400">Win Rate</div>
                        <div className="text-xs text-green-400 mt-2">+5% from last month</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-yellow-500/20 p-3 rounded-lg">
                                <Target size={24} className="text-yellow-400" />
                            </div>
                            <TrendingUp size={20} className="text-green-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">42</div>
                        <div className="text-sm text-gray-400">Opportunities</div>
                        <div className="text-xs text-green-400 mt-2">+8% from last month</div>
                    </div>
                </div>

                {/* Charts Placeholder */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Pipeline by Stage</h3>
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <TrendingUp size={48} className="mx-auto mb-2 opacity-50" />
                                <p>Chart visualization coming soon</p>
                                <p className="text-sm mt-1">Install chart library for visual analytics</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Revenue Forecast</h3>
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <DollarSign size={48} className="mx-auto mb-2 opacity-50" />
                                <p>Chart visualization coming soon</p>
                                <p className="text-sm mt-1">Install chart library for visual analytics</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Conversion Rate</h3>
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <Award size={48} className="mx-auto mb-2 opacity-50" />
                                <p>Chart visualization coming soon</p>
                                <p className="text-sm mt-1">Install chart library for visual analytics</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Top Performers</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-[#0F172A] rounded">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                        JS
                                    </div>
                                    <div>
                                        <div className="font-medium text-white">John Smith</div>
                                        <div className="text-sm text-gray-400">Sales Manager</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold text-green-400">$850K</div>
                                    <div className="text-xs text-gray-400">32 deals</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-[#0F172A] rounded">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                        SD
                                    </div>
                                    <div>
                                        <div className="font-medium text-white">Sarah Davis</div>
                                        <div className="text-sm text-gray-400">Account Executive</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold text-green-400">$720K</div>
                                    <div className="text-xs text-gray-400">28 deals</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-[#0F172A] rounded">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                                        MJ
                                    </div>
                                    <div>
                                        <div className="font-medium text-white">Mike Johnson</div>
                                        <div className="text-sm text-gray-400">Sales Representative</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold text-green-400">$680K</div>
                                    <div className="text-xs text-gray-400">25 deals</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
