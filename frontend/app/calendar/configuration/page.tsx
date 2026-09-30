"use client";

import { Search } from 'lucide-react';

export default function ConfigurationPage() {
    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-[#1E293B]">
                <div className="flex items-center gap-4">
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded text-sm font-medium">
                        Save
                    </button>
                    <button className="px-3 py-1.5 bg-[#0F172A] border border-gray-600 rounded text-sm hover:bg-gray-700 text-gray-300">
                        Discard
                    </button>
                    <span className="text-lg font-semibold text-gray-200">Settings</span>
                </div>

                <div className="flex-1 max-w-xl mx-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full bg-[#0F172A] border border-gray-600 rounded px-10 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-purple-500"
                        />
                    </div>
                </div>
            </div>

            {/* Settings Form */}
            <div className="flex-1 overflow-y-auto bg-[#1E293B] p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Outlook Calendar */}
                        <div className="bg-[#0F172A] p-6 rounded border border-gray-700">
                            <div className="flex items-start gap-3 mb-4">
                                <input type="checkbox" className="mt-1 rounded bg-gray-700 border-gray-600 text-purple-600" />
                                <div>
                                    <h3 className="font-semibold text-gray-200">Outlook Calendar</h3>
                                    <p className="text-sm text-gray-400">Synchronize your calendar with Outlook</p>
                                </div>
                            </div>
                        </div>

                        {/* Google Calendar */}
                        <div className="bg-[#0F172A] p-6 rounded border border-gray-700">
                            <div className="flex items-start gap-3 mb-4">
                                <input type="checkbox" checked readOnly className="mt-1 rounded bg-gray-700 border-gray-600 text-purple-600" />
                                <div>
                                    <h3 className="font-semibold text-gray-200">Google Calendar</h3>
                                    <p className="text-sm text-gray-400">Synchronize your calendar with Google Calendar</p>
                                </div>
                            </div>

                            <div className="pl-7 space-y-4">
                                <p className="text-xs text-gray-500 italic">
                                    On the Online version, you can leave these fields empty to use our "Odoo Calendar Sync" app.
                                </p>

                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Client ID</label>
                                    <input type="text" className="w-full bg-transparent border-b border-gray-600 focus:border-purple-500 outline-none text-sm py-1" />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Client Secret</label>
                                    <input type="password" className="w-full bg-transparent border-b border-gray-600 focus:border-purple-500 outline-none text-sm py-1" />
                                </div>

                                <div className="flex items-center gap-2">
                                    <label className="text-xs font-medium text-gray-400">Pause Synchronization</label>
                                    <input type="checkbox" className="rounded bg-gray-700 border-gray-600 text-purple-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
