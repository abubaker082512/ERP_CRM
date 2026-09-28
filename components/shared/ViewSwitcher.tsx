"use client";

import { LayoutGrid, List, Calendar, BarChart3 } from "lucide-react";

export type ViewType = "kanban" | "list" | "calendar" | "graph";

type ViewSwitcherProps = {
    currentView: ViewType;
    availableViews: ViewType[];
    onViewChange: (view: ViewType) => void;
};

const viewConfig = {
    kanban: { icon: LayoutGrid, label: "Kanban" },
    list: { icon: List, label: "List" },
    calendar: { icon: Calendar, label: "Calendar" },
    graph: { icon: BarChart3, label: "Graph" },
};

export default function ViewSwitcher({
    currentView,
    availableViews,
    onViewChange,
}: ViewSwitcherProps) {
    return (
        <div className="flex items-center bg-[#0F172A] rounded border border-gray-600 p-0.5">
            {availableViews.map((view) => {
                const ViewIcon = viewConfig[view].icon;
                const isActive = currentView === view;

                return (
                    <button
                        key={view}
                        onClick={() => onViewChange(view)}
                        className={`p-1.5 rounded transition-colors ${isActive
                                ? "bg-gray-700 text-white"
                                : "text-gray-400 hover:bg-gray-700/50 hover:text-gray-200"
                            }`}
                        title={viewConfig[view].label}
                    >
                        <ViewIcon size={16} />
                    </button>
                );
            })}
        </div>
    );
}
