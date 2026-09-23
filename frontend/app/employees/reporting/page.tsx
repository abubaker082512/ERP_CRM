"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { Users, TrendingUp, Briefcase, MapPin } from "lucide-react";

const MENU_ITEMS = [
    { name: "Employees", href: "/employees" },
    { name: "Departments", href: "/employees/departments" },
    { name: "Contracts", href: "/employees/contracts" },
    { name: "Reporting", href: "/employees/reporting" },
    { name: "Configuration", href: "/employees/configuration" },
];

export default function EmployeesReportingPage() {
    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Employees"
                moduleIcon={<Users size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search reports..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-200">HR Reporting</h2>
                    <p className="text-sm text-gray-400 mt-1">Workforce analytics and insights</p>
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
                        <div className="text-3xl font-bold text-white mb-1">142</div>
                        <div className="text-sm text-gray-400">Total Employees</div>
                        <div className="text-xs text-green-400 mt-2">+5 new this month</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="bg-purple-500/20 p-3 rounded-lg w-fit mb-4">
                            <Briefcase size={24} className="text-purple-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">12</div>
                        <div className="text-sm text-gray-400">Open Positions</div>
                        <div className="text-xs text-gray-500 mt-2">Across 4 departments</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="bg-green-500/20 p-3 rounded-lg w-fit mb-4">
                            <TrendingUp size={24} className="text-green-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">96%</div>
                        <div className="text-sm text-gray-400">Retention Rate</div>
                        <div className="text-xs text-green-400 mt-2">+2% vs last year</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="bg-yellow-500/20 p-3 rounded-lg w-fit mb-4">
                            <MapPin size={24} className="text-yellow-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">3</div>
                        <div className="text-sm text-gray-400">Office Locations</div>
                        <div className="text-xs text-gray-500 mt-2">NY, SF, London</div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Headcount by Department</h3>
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <Users size={48} className="mx-auto mb-2 opacity-50" />
                                <p>Chart visualization coming soon</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Turnover Rate</h3>
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <TrendingUp size={48} className="mx-auto mb-2 opacity-50" />
                                <p>Chart visualization coming soon</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Upcoming Contract Expirations</h3>
                        <div className="space-y-3">
                            {[
                                { name: "Alice Smith", role: "Contractor", date: "In 15 days" },
                                { name: "Bob Jones", role: "Intern", date: "In 25 days" },
                                { name: "Charlie Brown", role: "Consultant", date: "In 1 month" },
                            ].map((contract, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-[#0F172A] rounded">
                                    <div>
                                        <div className="font-medium text-white">{contract.name}</div>
                                        <div className="text-sm text-gray-400">{contract.role}</div>
                                    </div>
                                    <div className="text-yellow-400 text-sm font-medium">{contract.date}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">New Hires</h3>
                        <div className="space-y-3">
                            {[
                                { name: "David Miller", role: "Developer", dept: "IT" },
                                { name: "Eva Green", role: "Sales Rep", dept: "Sales" },
                                { name: "Frank White", role: "Designer", dept: "Marketing" },
                            ].map((hire, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-[#0F172A] rounded">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                            {hire.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{hire.name}</div>
                                            <div className="text-sm text-gray-400">{hire.role}</div>
                                        </div>
                                    </div>
                                    <div className="text-gray-400 text-sm">{hire.dept}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
