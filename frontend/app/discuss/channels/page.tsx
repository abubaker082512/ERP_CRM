"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { MessageSquare, Hash, Users, Lock, Globe } from "lucide-react";

const MENU_ITEMS = [
    { name: "Inbox", href: "/discuss" },
    { name: "Channels", href: "/discuss/channels" },
    { name: "Configuration", href: "/discuss/configuration" },
];

type Channel = {
    id: string;
    name: string;
    description: string;
    members: number;
    type: string;
    last_activity: string;
};

const mockChannels: Channel[] = [
    { id: "CH/001", name: "general", description: "General company announcements and discussion", members: 45, type: "public", last_activity: "10 mins ago" },
    { id: "CH/002", name: "sales", description: "Sales team coordination and updates", members: 12, type: "private", last_activity: "1 hour ago" },
    { id: "CH/003", name: "development", description: "Tech team discussions", members: 8, type: "public", last_activity: "2 hours ago" },
    { id: "CH/004", name: "marketing", description: "Marketing campaigns and ideas", members: 6, type: "public", last_activity: "Yesterday" },
];

export default function DiscussChannelsPage() {
    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Discuss"
                moduleIcon={<MessageSquare size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search channels..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-200">Channels</h2>
                            <p className="text-sm text-gray-400 mt-1">{mockChannels.length} active channels</p>
                        </div>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2">
                        <Hash size={18} /> Create Channel
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockChannels.map(channel => (
                        <div key={channel.id} className="bg-[#1E293B] border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-all group cursor-pointer">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                                        <Hash size={20} className="text-gray-400 group-hover:text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white text-lg">#{channel.name}</h3>
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            {channel.type === 'public' ? <Globe size={12} /> : <Lock size={12} />}
                                            <span className="capitalize">{channel.type}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-gray-400 mb-6 line-clamp-2">{channel.description}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                                <div className="flex items-center gap-2 text-gray-400 text-sm">
                                    <Users size={14} />
                                    <span>{channel.members} members</span>
                                </div>
                                <span className="text-xs text-gray-500">{channel.last_activity}</span>
                            </div>

                            <div className="mt-4">
                                <button className="w-full py-2 bg-[#0F172A] hover:bg-gray-800 text-blue-400 text-sm font-medium rounded transition-colors">
                                    Join Channel
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
