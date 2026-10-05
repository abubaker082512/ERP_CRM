"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ActivityHistory from "@/components/shared/ActivityHistory";
import { Target, Phone, Mail, Calendar, CheckCircle, Clock, Plus, Activity as ActivityIcon } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const MENU_ITEMS = [
    { name: "My Pipeline", href: "/crm" },
    { name: "Activities & History", href: "/crm/activities" },
    { name: "Sales", href: "/sales" },
    { name: "Reporting", href: "/crm/reporting" },
    { name: "Configuration", href: "/crm/configuration" },
];

type PlannedActivity = {
    id: string;
    type: "call" | "meeting" | "email" | "task";
    title: string;
    lead: string;
    dueDate: string;
    status: "planned" | "done" | "overdue";
};

const defaultPlanned: PlannedActivity[] = [
    {
        id: "1",
        type: "call",
        title: "Follow-up discovery call with Acme Corp",
        lead: "Acme Corp - John Doe",
        dueDate: new Date().toISOString(),
        status: "planned",
    },
    {
        id: "2",
        type: "meeting",
        title: "Enterprise ERP Platform Demo",
        lead: "Tech Solutions - Jane Smith",
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        status: "planned",
    },
    {
        id: "3",
        type: "email",
        title: "Send updated quotation and specs",
        lead: "Global Industries - Bob Johnson",
        dueDate: new Date(Date.now() - 86400000).toISOString(),
        status: "overdue",
    },
];

const activityIcons = {
    call: Phone,
    meeting: Calendar,
    email: Mail,
    task: CheckCircle,
};

const activityColors = {
    call: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    meeting: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
    email: "bg-green-500/20 text-green-400 border border-green-500/30",
    task: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
};

export default function CRMActivitiesPage() {
    const [planned] = useState<PlannedActivity[]>(defaultPlanned);
    const [activeTab, setActiveTab] = useState<"history" | "planned">("history");

    return (
        <div className="flex flex-col min-h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="CRM"
                moduleIcon={<Target size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search activities & history..."
            />

            <div className="flex-1 overflow-auto p-6 max-w-6xl mx-auto w-full space-y-6">
                {/* Page Title & View Switcher */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <ActivityIcon className="text-purple-400" size={24} />
                            CRM Activity & Database History
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">
                            Live audit trail of all actions, stage transitions (Marked Lost / Won), notes, and scheduled tasks.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 bg-[#1E293B] p-1 rounded-xl border border-white/10">
                        <button
                            onClick={() => setActiveTab("history")}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                                activeTab === "history"
                                    ? "bg-purple-600 text-white shadow-lg"
                                    : "text-gray-400 hover:text-white"
                            }`}
                        >
                            Database Audit Trail
                        </button>
                        <button
                            onClick={() => setActiveTab("planned")}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                                activeTab === "planned"
                                    ? "bg-purple-600 text-white shadow-lg"
                                    : "text-gray-400 hover:text-white"
                            }`}
                        >
                            Scheduled Tasks ({planned.length})
                        </button>
                    </div>
                </div>

                {activeTab === "history" ? (
                    <ActivityHistory
                        module="crm"
                        entityType="opportunity"
                        title="Live CRM Database Audit Logs & Interaction History"
                        allowAddNote={true}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Today */}
                        <div className="bg-[#1E293B] rounded-xl p-5 border border-gray-800">
                            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                                <Clock size={18} className="text-blue-400" />
                                Today
                            </h3>
                            <div className="space-y-3">
                                {planned.slice(0, 1).map((item) => {
                                    const Icon = activityIcons[item.type];
                                    return (
                                        <div key={item.id} className="bg-white/5 rounded-xl p-4 border border-white/5">
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded-lg ${activityColors[item.type]}`}>
                                                    <Icon size={16} />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-white text-sm mb-1">{item.title}</h4>
                                                    <p className="text-xs text-gray-400">{item.lead}</p>
                                                    <div className="flex items-center gap-2 mt-2 text-xs text-blue-400">
                                                        <Clock size={12} />
                                                        <span>Due Today</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Upcoming */}
                        <div className="bg-[#1E293B] rounded-xl p-5 border border-gray-800">
                            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                                <Calendar size={18} className="text-purple-400" />
                                Upcoming
                            </h3>
                            <div className="space-y-3">
                                {planned.slice(1, 2).map((item) => {
                                    const Icon = activityIcons[item.type];
                                    return (
                                        <div key={item.id} className="bg-white/5 rounded-xl p-4 border border-white/5">
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded-lg ${activityColors[item.type]}`}>
                                                    <Icon size={16} />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-white text-sm mb-1">{item.title}</h4>
                                                    <p className="text-xs text-gray-400">{item.lead}</p>
                                                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                                                        <Calendar size={12} />
                                                        <span>Tomorrow</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Overdue */}
                        <div className="bg-[#1E293B] rounded-xl p-5 border border-gray-800">
                            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                                <CheckCircle size={18} className="text-rose-400" />
                                Overdue
                            </h3>
                            <div className="space-y-3">
                                {planned.slice(2, 3).map((item) => {
                                    const Icon = activityIcons[item.type];
                                    return (
                                        <div key={item.id} className="bg-white/5 rounded-xl p-4 border border-rose-500/20">
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded-lg ${activityColors[item.type]}`}>
                                                    <Icon size={16} />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-white text-sm mb-1">{item.title}</h4>
                                                    <p className="text-xs text-gray-400">{item.lead}</p>
                                                    <div className="flex items-center gap-2 mt-2 text-xs text-rose-400 font-semibold">
                                                        <Clock size={12} />
                                                        <span>Past Due</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
