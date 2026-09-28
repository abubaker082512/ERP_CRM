"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { ShoppingBag, CreditCard, User, Calendar } from "lucide-react";

const MENU_ITEMS = [
    { name: "Dashboard", href: "/pos" },
    { name: "Orders", href: "/pos/orders" },
    { name: "Products", href: "/pos/products" },
    { name: "Reporting", href: "/pos/reporting" },
    { name: "Configuration", href: "/pos/configuration" },
];

type Order = {
    id: string;
    session: string;
    date: string;
    customer: string;
    salesperson: string;
    total: number;
    status: string;
};

const mockOrders: Order[] = [
    { id: "ORD/2025/001", session: "POS/2025/001", date: "2025-12-02 10:30", customer: "Walk-in Customer", salesperson: "John Doe", total: 150.00, status: "paid" },
    { id: "ORD/2025/002", session: "POS/2025/001", date: "2025-12-02 11:15", customer: "Alice Smith", salesperson: "John Doe", total: 85.50, status: "paid" },
    { id: "ORD/2025/003", session: "POS/2025/001", date: "2025-12-02 11:45", customer: "Bob Jones", salesperson: "John Doe", total: 210.00, status: "invoiced" },
];

export default function POSOrdersPage() {
    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Point of Sale"
                moduleIcon={<ShoppingBag size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search orders..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-200">Orders</h2>
                            <p className="text-sm text-gray-400 mt-1">{mockOrders.length} orders today</p>
                        </div>
                    </div>
                </div>

                <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-[#0F172A] border-b border-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Order Ref</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Session</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Date</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Customer</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Salesperson</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Total</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockOrders.map(order => (
                                <tr key={order.id} className="border-b border-gray-700 hover:bg-[#1E293B] transition-colors">
                                    <td className="px-4 py-3 font-medium text-white">{order.id}</td>
                                    <td className="px-4 py-3 text-gray-300">{order.session}</td>
                                    <td className="px-4 py-3 text-gray-400">{order.date}</td>
                                    <td className="px-4 py-3 text-gray-300">{order.customer}</td>
                                    <td className="px-4 py-3 text-gray-300">{order.salesperson}</td>
                                    <td className="px-4 py-3 text-green-400 font-semibold">${order.total.toFixed(2)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${order.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                                                'bg-blue-500/20 text-blue-400'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button className="text-blue-400 hover:text-blue-300 text-sm">View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
