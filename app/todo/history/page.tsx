"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ActivityHistory from "@/components/shared/ActivityHistory";
import { CheckSquare, Clock, CheckCircle } from "lucide-react";

const MENU_ITEMS = [
    { name: "My Tasks", href: "/todo" },
    { name: "History", href: "/todo/history" },
    { name: "Settings", href: "/settings" },
];

export default function TodoHistoryPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="To Do"
                moduleIcon={<CheckSquare size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search task history..."
            />

            <div className="flex-1 overflow-auto p-6 max-w-5xl mx-auto w-full space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-200">To Do & Task History</h2>
                    <p className="text-sm text-gray-400 mt-1">
                        Audit trail of created, updated, and completed tasks.
                    </p>
                </div>

                <ActivityHistory
                    module="todo"
                    entityType="task"
                    title="Task Execution & Completion Log"
                    allowAddNote={true}
                />
            </div>
        </div>
    );
}
