"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { FileText, TrendingUp, HardDrive, Users } from "lucide-react";

const MENU_ITEMS = [
    { name: "Documents", href: "/documents" },
    { name: "Shares", href: "/documents/shares" },
    { name: "Reporting", href: "/documents/reporting" },
    { name: "Configuration", href: "/documents/configuration" },
];

export default function DocumentsReportingPage() {
    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Documents"
                moduleIcon={<FileText size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search reports..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-200">Storage Reporting</h2>
                    <p className="text-sm text-gray-400 mt-1">Usage analytics and storage metrics</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-blue-500/20 p-3 rounded-lg">
                                <HardDrive size={24} className="text-blue-400" />
                            </div>
                            <TrendingUp size={20} className="text-green-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">8.5 GB</div>
                        <div className="text-sm text-gray-400">Used Storage</div>
                        <div className="text-xs text-green-400 mt-2">15% of 50 GB quota</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="bg-purple-500/20 p-3 rounded-lg w-fit mb-4">
                            <FileText size={24} className="text-purple-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">1,245</div>
                        <div className="text-sm text-gray-400">Total Files</div>
                        <div className="text-xs text-green-400 mt-2">+45 this week</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="bg-green-500/20 p-3 rounded-lg w-fit mb-4">
                            <Users size={24} className="text-green-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">156</div>
                        <div className="text-sm text-gray-400">Active Shares</div>
                        <div className="text-xs text-green-400 mt-2">+12 new links</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="bg-yellow-500/20 p-3 rounded-lg w-fit mb-4">
                            <TrendingUp size={24} className="text-yellow-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">450</div>
                        <div className="text-sm text-gray-400">Downloads</div>
                        <div className="text-xs text-green-400 mt-2">Last 30 days</div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Storage by File Type</h3>
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <HardDrive size={48} className="mx-auto mb-2 opacity-50" />
                                <p>Chart visualization coming soon</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Storage Growth</h3>
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <TrendingUp size={48} className="mx-auto mb-2 opacity-50" />
                                <p>Chart visualization coming soon</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Top Users by Storage</h3>
                        <div className="space-y-3">
                            {[
                                { name: "John Doe", files: 450, size: "2.5 GB" },
                                { name: "Jane Smith", files: 320, size: "1.8 GB" },
                                { name: "Bob Wilson", files: 150, size: "0.9 GB" },
                            ].map((user, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-[#0F172A] rounded">
                                    <div>
                                        <div className="font-medium text-white">{user.name}</div>
                                        <div className="text-sm text-gray-400">{user.files} files</div>
                                    </div>
                                    <div className="text-blue-400 font-semibold">{user.size}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Most Downloaded Files</h3>
                        <div className="space-y-3">
                            {[
                                { name: "Company Handbook.pdf", downloads: 120, type: "PDF" },
                                { name: "Logo Pack.zip", downloads: 85, type: "ZIP" },
                                { name: "Price List 2025.xlsx", downloads: 65, type: "Excel" },
                            ].map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-[#0F172A] rounded">
                                    <div>
                                        <div className="font-medium text-white">{file.name}</div>
                                        <div className="text-sm text-gray-400">{file.type}</div>
                                    </div>
                                    <div className="text-green-400 font-medium">{file.downloads} downloads</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
