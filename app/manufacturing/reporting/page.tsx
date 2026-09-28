"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { Wrench, TrendingUp, Clock, AlertTriangle } from "lucide-react";

const MENU_ITEMS = [
    { name: "Manufacturing Orders", href: "/manufacturing" },
    { name: "Work Orders", href: "/manufacturing/work-orders" },
    { name: "Bill of Materials", href: "/manufacturing/bom" },
    { name: "Reporting", href: "/manufacturing/reporting" },
    { name: "Configuration", href: "/manufacturing/configuration" },
];

export default function ManufacturingReportingPage() {
    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Manufacturing"
                moduleIcon={<Wrench size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search reports..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-200">Manufacturing Reporting</h2>
                    <p className="text-sm text-gray-400 mt-1">Production analytics and efficiency metrics</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-blue-500/20 p-3 rounded-lg">
                                <Wrench size={24} className="text-blue-400" />
                            </div>
                            <TrendingUp size={20} className="text-green-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">85%</div>
                        <div className="text-sm text-gray-400">OEE</div>
                        <div className="text-xs text-green-400 mt-2">+2% vs last month</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="bg-purple-500/20 p-3 rounded-lg w-fit mb-4">
                            <Clock size={24} className="text-purple-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">45m</div>
                        <div className="text-sm text-gray-400">Avg Cycle Time</div>
                        <div className="text-xs text-green-400 mt-2">-5m improvement</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="bg-green-500/20 p-3 rounded-lg w-fit mb-4">
                            <TrendingUp size={24} className="text-green-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">1,250</div>
                        <div className="text-sm text-gray-400">Units Produced</div>
                        <div className="text-xs text-green-400 mt-2">+150 vs target</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="bg-yellow-500/20 p-3 rounded-lg w-fit mb-4">
                            <AlertTriangle size={24} className="text-yellow-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">2.5%</div>
                        <div className="text-sm text-gray-400">Scrap Rate</div>
                        <div className="text-xs text-red-400 mt-2">+0.5% increase</div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Production by Work Center</h3>
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <Wrench size={48} className="mx-auto mb-2 opacity-50" />
                                <p>Chart visualization coming soon</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Work Order Duration</h3>
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <Clock size={48} className="mx-auto mb-2 opacity-50" />
                                <p>Chart visualization coming soon</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Top Products Produced</h3>
                        <div className="space-y-3">
                            {[
                                { name: "Office Chair", units: 450, efficiency: "92%" },
                                { name: "Wooden Desk", units: 320, efficiency: "88%" },
                                { name: "File Cabinet", units: 280, efficiency: "85%" },
                            ].map((product, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-[#0F172A] rounded">
                                    <div>
                                        <div className="font-medium text-white">{product.name}</div>
                                        <div className="text-sm text-gray-400">{product.units} units</div>
                                    </div>
                                    <div className="text-green-400 font-semibold">{product.efficiency}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Recent Issues</h3>
                        <div className="space-y-3">
                            {[
                                { issue: "Machine Breakdown", center: "Assembly Line 1", time: "2 hours ago" },
                                { issue: "Material Shortage", center: "Paint Shop", time: "5 hours ago" },
                                { issue: "Quality Check Failed", center: "Cutting Station", time: "1 day ago" },
                            ].map((issue, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-[#0F172A] rounded">
                                    <div>
                                        <div className="font-medium text-white">{issue.issue}</div>
                                        <div className="text-sm text-gray-400">{issue.center}</div>
                                    </div>
                                    <div className="text-xs text-gray-500">{issue.time}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
