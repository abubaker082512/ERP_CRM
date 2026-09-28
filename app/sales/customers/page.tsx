"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { useState } from "react";
import { BarChart3, Users, Mail, Phone, MapPin } from "lucide-react";

const MENU_ITEMS = [
    { name: "Quotations", href: "/sales" },
    { name: "Orders", href: "/sales/orders" },
    { name: "Customers", href: "/sales/customers" },
    { name: "Products", href: "/sales/products" },
    { name: "Reporting", href: "/sales/reporting" },
    { name: "Configuration", href: "/sales/configuration" },
];

type Customer = {
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    total_orders: number;
    total_revenue: number;
};

const mockCustomers: Customer[] = [
    { id: "1", name: "John Doe", email: "john@acme.com", phone: "+1 234 567 8900", company: "Acme Corp", total_orders: 45, total_revenue: 125000 },
    { id: "2", name: "Jane Smith", email: "jane@tech.com", phone: "+1 234 567 8901", company: "Tech Solutions", total_orders: 38, total_revenue: 98000 },
    { id: "3", name: "Bob Johnson", email: "bob@global.com", phone: "+1 234 567 8902", company: "Global Industries", total_orders: 32, total_revenue: 87000 },
];

export default function SalesCustomersPage() {
    const [customers] = useState<Customer[]>(mockCustomers);
    const [currentView, setCurrentView] = useState<ViewType>("list");

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Sales"
                moduleIcon={<BarChart3 size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search customers..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-200">Customers</h2>
                            <p className="text-sm text-gray-400 mt-1">{customers.length} active customers</p>
                        </div>
                        <ViewSwitcher
                            currentView={currentView}
                            availableViews={["list", "kanban"]}
                            onViewChange={setCurrentView}
                        />
                    </div>
                </div>

                {currentView === "list" && (
                    <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-[#0F172A] border-b border-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Customer</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Company</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Contact</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Total Orders</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Total Revenue</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map(customer => (
                                    <tr key={customer.id} className="border-b border-gray-700 hover:bg-[#1E293B] transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                                    {customer.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <span className="font-medium text-white">{customer.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-300">{customer.company}</td>
                                        <td className="px-4 py-3">
                                            <div className="space-y-1 text-sm">
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <Mail size={14} />
                                                    <span>{customer.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <Phone size={14} />
                                                    <span>{customer.phone}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-300">{customer.total_orders}</td>
                                        <td className="px-4 py-3 text-green-400 font-semibold">${customer.total_revenue.toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <button className="text-blue-400 hover:text-blue-300 text-sm">View</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {currentView === "kanban" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {customers.map(customer => (
                            <div key={customer.id} className="bg-[#1E293B] border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-all">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        {customer.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">{customer.name}</h3>
                                        <p className="text-sm text-gray-400">{customer.company}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm mb-4">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Mail size={14} />
                                        <span>{customer.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Phone size={14} />
                                        <span>{customer.phone}</span>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-gray-700 grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xs text-gray-400">Orders</div>
                                        <div className="text-lg font-semibold text-white">{customer.total_orders}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400">Revenue</div>
                                        <div className="text-lg font-semibold text-green-400">${(customer.total_revenue / 1000).toFixed(0)}K</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
