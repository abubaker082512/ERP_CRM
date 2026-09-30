"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { LifeBuoy, TrendingUp, Clock, ThumbsUp } from "lucide-react";

const MENU_ITEMS = [
    { name: "Tickets", href: "/helpdesk" },
    { name: "Teams", href: "/helpdesk/teams" },
    { name: "SLA Policies", href: "/helpdesk/sla" },
    { name: "Reporting", href: "/helpdesk/reporting" },
    { name: "Configuration", href: "/helpdesk/configuration" },
];

export default function HelpdeskReportingPage() {
    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Helpdesk"
                moduleIcon={<LifeBuoy size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search reports..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-200">Helpdesk Reporting</h2>
                    <p className="text-sm text-gray-400 mt-1">Support performance and satisfaction metrics</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-blue-500/20 p-3 rounded-lg">
                                <LifeBuoy size={24} className="text-blue-400" />
                            </div>
                            <TrendingUp size={20} className="text-green-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">128</div>
                        <div className="text-sm text-gray-400">Tickets Solved</div>
                        <div className="text-xs text-green-400 mt-2">+12% vs last week</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="bg-purple-500/20 p-3 rounded-lg w-fit mb-4">
                            <Clock size={24} className="text-purple-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">2.5h</div>
                        <div className="text-sm text-gray-400">Avg Resolution Time</div>
                        <div className="text-xs text-green-400 mt-2">-30m improvement</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="bg-green-500/20 p-3 rounded-lg w-fit mb-4">
                            <ThumbsUp size={24} className="text-green-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">4.8/5</div>
                        <div className="text-sm text-gray-400">Customer Satisfaction</div>
                        <div className="text-xs text-green-400 mt-2">Based on 45 ratings</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="bg-yellow-500/20 p-3 rounded-lg w-fit mb-4">
                            <Clock size={24} className="text-yellow-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">98%</div>
                        <div className="text-sm text-gray-400">SLA Compliance</div>
                        <div className="text-xs text-green-400 mt-2">+1% vs target</div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Tickets by Team</h3>
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <LifeBuoy size={48} className="mx-auto mb-2 opacity-50" />
                                <p>Chart visualization coming soon</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Tickets by Priority</h3>
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <TrendingUp size={48} className="mx-auto mb-2 opacity-50" />
                                <p>Chart visualization coming soon</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Top Agents</h3>
                        <div className="space-y-3">
                            {[
                                { name: "Alice Smith", solved: 45, rating: 4.9 },
                                { name: "Bob Jones", solved: 38, rating: 4.8 },
                                { name: "Charlie Brown", solved: 32, rating: 4.7 },
                            ].map((agent, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-[#0F172A] rounded">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                            {agent.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{agent.name}</div>
                                            <div className="text-sm text-gray-400">{agent.solved} tickets</div>
                                        </div>
                                    </div>
                                    <div className="text-yellow-400 font-medium">★ {agent.rating}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Recent Feedback</h3>
                        <div className="space-y-3">
                            {[
                                { customer: "John Doe", comment: "Great support, very fast!", rating: 5 },
                                { customer: "Jane Smith", comment: "Solved my issue, thanks.", rating: 4 },
                                { customer: "Mike Ross", comment: "Excellent service.", rating: 5 },
                            ].map((feedback, idx) => (
                                <div key={idx} className="p-3 bg-[#0F172A] rounded">
                                    <div className="flex justify-between mb-1">
                                        <span className="font-medium text-white">{feedback.customer}</span>
                                        <span className="text-yellow-400 text-sm">★ {feedback.rating}</span>
                                    </div>
                                    <p className="text-sm text-gray-400">{feedback.comment}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
