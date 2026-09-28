"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { Target, Settings, Users, Tag, Workflow } from "lucide-react";

const MENU_ITEMS = [
    { name: "My Pipeline", href: "/crm" },
    { name: "My Activities", href: "/crm/activities" },
    { name: "Sales", href: "/crm/sales" },
    { name: "Reporting", href: "/crm/reporting" },
    { name: "Configuration", href: "/crm/configuration" },
];

export default function CRMConfigurationPage() {
    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="CRM"
                moduleIcon={<Target size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search settings..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-200">CRM Configuration</h2>
                    <p className="text-sm text-gray-400 mt-1">
                        Customize your CRM settings and workflows
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Pipeline Stages */}
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-blue-500/20 p-3 rounded-lg w-fit mb-4">
                            <Workflow size={24} className="text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Pipeline Stages</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Configure your sales pipeline stages and workflow
                        </p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">
                            Configure →
                        </div>
                    </div>

                    {/* Sales Teams */}
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-purple-500/20 p-3 rounded-lg w-fit mb-4">
                            <Users size={24} className="text-purple-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Sales Teams</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Manage sales teams and assign territories
                        </p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">
                            Configure →
                        </div>
                    </div>

                    {/* Lead Tags */}
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-green-500/20 p-3 rounded-lg w-fit mb-4">
                            <Tag size={24} className="text-green-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Lead Tags</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Create and manage tags for lead categorization
                        </p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">
                            Configure →
                        </div>
                    </div>

                    {/* Activity Types */}
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-yellow-500/20 p-3 rounded-lg w-fit mb-4">
                            <Settings size={24} className="text-yellow-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Activity Types</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Define activity types for tracking interactions
                        </p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">
                            Configure →
                        </div>
                    </div>

                    {/* Lead Scoring */}
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-red-500/20 p-3 rounded-lg w-fit mb-4">
                            <Target size={24} className="text-red-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Lead Scoring</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Configure AI-powered lead scoring rules
                        </p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">
                            Configure →
                        </div>
                    </div>

                    {/* Email Templates */}
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-cyan-500/20 p-3 rounded-lg w-fit mb-4">
                            <Settings size={24} className="text-cyan-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Email Templates</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Create and manage email templates for outreach
                        </p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">
                            Configure →
                        </div>
                    </div>
                </div>

                {/* Current Settings */}
                <div className="mt-8 bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Current Settings</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-700">
                            <div>
                                <div className="font-medium text-white">Default Pipeline</div>
                                <div className="text-sm text-gray-400">New → Qualified → Proposition → Won/Lost</div>
                            </div>
                            <button className="text-sm text-blue-400 hover:text-blue-300">Edit</button>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-gray-700">
                            <div>
                                <div className="font-medium text-white">Lead Assignment</div>
                                <div className="text-sm text-gray-400">Round-robin distribution</div>
                            </div>
                            <button className="text-sm text-blue-400 hover:text-blue-300">Edit</button>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-gray-700">
                            <div>
                                <div className="font-medium text-white">Activity Reminders</div>
                                <div className="text-sm text-gray-400">Email notifications enabled</div>
                            </div>
                            <button className="text-sm text-blue-400 hover:text-blue-300">Edit</button>
                        </div>

                        <div className="flex items-center justify-between py-3">
                            <div>
                                <div className="font-medium text-white">AI Lead Scoring</div>
                                <div className="text-sm text-gray-400">Enabled with default model</div>
                            </div>
                            <button className="text-sm text-blue-400 hover:text-blue-300">Edit</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
