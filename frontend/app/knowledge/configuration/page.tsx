"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { BookOpen, Settings, Tag, Folder, Shield, Globe } from "lucide-react";

const MENU_ITEMS = [
    { name: "Dashboard", href: "/knowledge" },
    { name: "Articles", href: "/knowledge/articles" },
    { name: "Favorites", href: "/knowledge/favorites" },
    { name: "Configuration", href: "/knowledge/configuration" },
];

export default function KnowledgeConfigurationPage() {
    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Knowledge"
                moduleIcon={<BookOpen size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search settings..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-200">Knowledge Configuration</h2>
                    <p className="text-sm text-gray-400 mt-1">Manage knowledge base settings</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-blue-500/20 p-3 rounded-lg w-fit mb-4">
                            <Folder size={24} className="text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Categories</h3>
                        <p className="text-sm text-gray-400 mb-4">Manage article categories and hierarchy</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">Configure →</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-purple-500/20 p-3 rounded-lg w-fit mb-4">
                            <Tag size={24} className="text-purple-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Tags</h3>
                        <p className="text-sm text-gray-400 mb-4">Manage article tags for searching</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">Configure →</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-yellow-500/20 p-3 rounded-lg w-fit mb-4">
                            <Shield size={24} className="text-yellow-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Permissions</h3>
                        <p className="text-sm text-gray-400 mb-4">Configure read/write access rights</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">Configure →</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-green-500/20 p-3 rounded-lg w-fit mb-4">
                            <Globe size={24} className="text-green-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Public Access</h3>
                        <p className="text-sm text-gray-400 mb-4">Configure external knowledge base settings</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">Configure →</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="bg-red-500/20 p-3 rounded-lg w-fit mb-4">
                            <Settings size={24} className="text-red-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Templates</h3>
                        <p className="text-sm text-gray-400 mb-4">Manage article templates</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">Configure →</div>
                    </div>
                </div>

                <div className="mt-8 bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Current Settings</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-700">
                            <div>
                                <div className="font-medium text-white">Public Portal</div>
                                <div className="text-sm text-gray-400">Disabled</div>
                            </div>
                            <button className="text-sm text-blue-400 hover:text-blue-300">Edit</button>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-700">
                            <div>
                                <div className="font-medium text-white">Comments</div>
                                <div className="text-sm text-gray-400">Enabled for employees</div>
                            </div>
                            <button className="text-sm text-blue-400 hover:text-blue-300">Edit</button>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <div>
                                <div className="font-medium text-white">Article Versioning</div>
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
