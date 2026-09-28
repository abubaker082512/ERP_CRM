"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { Target, Phone, Mail, Calendar, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";

const MENU_ITEMS = [
    { name: "My Pipeline", href: "/crm" },
    { name: "My Activities", href: "/crm/activities" },
    { name: "Sales", href: "/crm/sales" },
    { name: "Reporting", href: "/crm/reporting" },
    { name: "Configuration", href: "/crm/configuration" },
];

type Activity = {
    id: string;
    type: "call" | "meeting" | "email" | "task";
    title: string;
    lead: string;
    dueDate: string;
    status: "planned" | "done" | "overdue";
};

const mockActivities: Activity[] = [
    {
        id: "1",
        type: "call",
        title: "Follow-up call with John Doe",
        lead: "Acme Corp - John Doe",
        dueDate: "2025-12-02T10:00:00",
        status: "planned",
    },
    {
        id: "2",
        type: "meeting",
        title: "Product demo",
        lead: "Tech Solutions - Jane Smith",
        dueDate: "2025-12-02T14:00:00",
        status: "planned",
    },
    {
        id: "3",
        type: "email",
        title: "Send quotation",
        lead: "Global Industries - Bob Johnson",
        dueDate: "2025-12-01T16:00:00",
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
    call: "bg-blue-500",
    meeting: "bg-purple-500",
    email: "bg-green-500",
    task: "bg-yellow-500",
};

const statusColors = {
    planned: "text-blue-400",
    done: "text-green-400",
    overdue: "text-red-400",
};

export default function CRMActivitiesPage() {
    const [activities] = useState<Activity[]>(mockActivities);

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="CRM"
                moduleIcon={<Target size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search activities..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-200">My Activities</h2>
                    <p className="text-sm text-gray-400 mt-1">
                        {activities.length} activities scheduled
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Today */}
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Clock size={20} className="text-blue-400" />
                            Today
                        </h3>
                        <div className="space-y-3">
                            {activities
                                .filter(a => new Date(a.dueDate).toDateString() === new Date().toDateString())
                                .map(activity => {
                                    const Icon = activityIcons[activity.type];
                                    return (
                                        <div
                                            key={activity.id}
                                            className="bg-[#0F172A] rounded-lg p-4 border border-gray-700 hover:border-blue-500 transition-colors"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`${activityColors[activity.type]} p-2 rounded`}>
                                                    <Icon size={16} className="text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-white mb-1">{activity.title}</h4>
                                                    <p className="text-sm text-gray-400">{activity.lead}</p>
                                                    <div className="flex items-center gap-2 mt-2 text-xs">
                                                        <Clock size={12} className={statusColors[activity.status]} />
                                                        <span className={statusColors[activity.status]}>
                                                            {new Date(activity.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>

                    {/* Upcoming */}
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Upcoming</h3>
                        <div className="space-y-3">
                            {activities
                                .filter(a => new Date(a.dueDate) > new Date())
                                .map(activity => {
                                    const Icon = activityIcons[activity.type];
                                    return (
                                        <div
                                            key={activity.id}
                                            className="bg-[#0F172A] rounded-lg p-4 border border-gray-700 hover:border-blue-500 transition-colors"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`${activityColors[activity.type]} p-2 rounded`}>
                                                    <Icon size={16} className="text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-white mb-1">{activity.title}</h4>
                                                    <p className="text-sm text-gray-400">{activity.lead}</p>
                                                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                                                        <Calendar size={12} />
                                                        <span>{new Date(activity.dueDate).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>

                    {/* Overdue */}
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="text-red-400">Overdue</span>
                        </h3>
                        <div className="space-y-3">
                            {activities
                                .filter(a => a.status === 'overdue')
                                .map(activity => {
                                    const Icon = activityIcons[activity.type];
                                    return (
                                        <div
                                            key={activity.id}
                                            className="bg-[#0F172A] rounded-lg p-4 border border-red-700 hover:border-red-500 transition-colors"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`${activityColors[activity.type]} p-2 rounded`}>
                                                    <Icon size={16} className="text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-white mb-1">{activity.title}</h4>
                                                    <p className="text-sm text-gray-400">{activity.lead}</p>
                                                    <div className="flex items-center gap-2 mt-2 text-xs text-red-400">
                                                        <Clock size={12} />
                                                        <span>{new Date(activity.dueDate).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
