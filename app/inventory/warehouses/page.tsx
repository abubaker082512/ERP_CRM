"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { Package, MapPin, Users, TrendingUp } from "lucide-react";

const MENU_ITEMS = [
    { name: "Products", href: "/inventory" },
    { name: "Operations", href: "/inventory/operations" },
    { name: "Warehouses", href: "/inventory/warehouses" },
    { name: "Reporting", href: "/inventory/reporting" },
    { name: "Configuration", href: "/inventory/configuration" },
];

const mockWarehouses = [
    { id: "1", name: "Main Warehouse", location: "New York, NY", capacity: 10000, current: 7500, manager: "John Smith" },
    { id: "2", name: "West Coast Hub", location: "Los Angeles, CA", capacity: 8000, current: 5200, manager: "Sarah Davis" },
    { id: "3", name: "Distribution Center", location: "Chicago, IL", capacity: 12000, current: 9800, manager: "Mike Johnson" },
];

export default function InventoryWarehousesPage() {
    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Inventory"
                moduleIcon={<Package size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search warehouses..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-200">Warehouses</h2>
                    <p className="text-sm text-gray-400 mt-1">{mockWarehouses.length} active warehouses</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {mockWarehouses.map(warehouse => {
                        const utilization = (warehouse.current / warehouse.capacity * 100).toFixed(1);
                        return (
                            <div key={warehouse.id} className="bg-[#1E293B] border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-1">{warehouse.name}</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <MapPin size={14} />
                                            <span>{warehouse.location}</span>
                                        </div>
                                    </div>
                                    <div className="bg-blue-500/20 p-2 rounded">
                                        <Package size={20} className="text-blue-400" />
                                    </div>
                                </div>

                                <div className="space-y-3 mb-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-400">Capacity Utilization</span>
                                            <span className="text-white font-semibold">{utilization}%</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${parseFloat(utilization) > 80 ? 'bg-red-500' :
                                                        parseFloat(utilization) > 60 ? 'bg-yellow-500' :
                                                            'bg-green-500'
                                                    }`}
                                                style={{ width: `${utilization}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-700">
                                        <div>
                                            <div className="text-xs text-gray-400">Current Stock</div>
                                            <div className="text-lg font-semibold text-white">{warehouse.current.toLocaleString()}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400">Capacity</div>
                                            <div className="text-lg font-semibold text-white">{warehouse.capacity.toLocaleString()}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-gray-700 flex items-center gap-2">
                                    <Users size={14} className="text-gray-400" />
                                    <span className="text-sm text-gray-400">Manager:</span>
                                    <span className="text-sm text-white">{warehouse.manager}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
