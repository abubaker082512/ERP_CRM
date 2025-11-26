"use client";

import SettingsHeader from "@/components/settings/SettingsHeader";
import { Users, Shield, Database, Globe } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="flex flex-col h-screen">
            <SettingsHeader />

            <div className="flex-1 overflow-auto p-6">
                <h2 className="text-xl font-semibold text-gray-200 mb-6">General Settings</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Users & Companies */}
                    <div className="bg-[#1E293B] border border-gray-700 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-blue-500/20 p-2 rounded text-blue-500"><Users size={24} /></div>
                            <h3 className="text-lg font-medium text-white">Users & Companies</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-300">Manage Users</p>
                                    <p className="text-xs text-gray-500">Invite new users and assign roles.</p>
                                </div>
                                <button className="text-blue-400 text-sm hover:underline">Manage</button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-300">Companies</p>
                                    <p className="text-xs text-gray-500">Configure multi-company structure.</p>
                                </div>
                                <button className="text-blue-400 text-sm hover:underline">Configure</button>
                            </div>
                        </div>
                    </div>

                    {/* Permissions */}
                    <div className="bg-[#1E293B] border border-gray-700 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-green-500/20 p-2 rounded text-green-500"><Shield size={24} /></div>
                            <h3 className="text-lg font-medium text-white">Permissions</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-300">Access Rights</p>
                                    <p className="text-xs text-gray-500">Define what users can see and do.</p>
                                </div>
                                <button className="text-blue-400 text-sm hover:underline">Review</button>
                            </div>
                        </div>
                    </div>

                    {/* Integrations */}
                    <div className="bg-[#1E293B] border border-gray-700 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-purple-500/20 p-2 rounded text-purple-500"><Globe size={24} /></div>
                            <h3 className="text-lg font-medium text-white">Integrations</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-300">API Keys</p>
                                    <p className="text-xs text-gray-500">Manage developer access keys.</p>
                                </div>
                                <button className="text-blue-400 text-sm hover:underline">Manage Keys</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
