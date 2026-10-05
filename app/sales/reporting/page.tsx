"use client";
import { fetchAPI } from '@/lib/api';
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, DollarSign, Users, Award, ShoppingBag } from "lucide-react";

const MENU_ITEMS = [
    { name: "Quotations", href: "/sales" },
    { name: "Orders", href: "/sales/orders" },
    { name: "Customers", href: "/sales/customers" },
    { name: "Products", href: "/sales/products" },
    { name: "Reporting", href: "/sales/reporting" },
    { name: "Configuration", href: "/sales/configuration" },
];

export default function SalesReportingPage() {
    const [sales, setSales] = useState<any[]>([]);
    const [contacts, setContacts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMetrics();
    }, []);

    const loadMetrics = async () => {
        try {
            const [sRes, cRes] = await Promise.all([
                fetchAPI("/sales"),
                fetchAPI("/contacts")
            ]);
            if (sRes.ok) setSales(await sRes.json());
            if (cRes.ok) setContacts(await cRes.json());
        } catch (e) {
            console.error("Failed to load metrics", e);
        } finally {
            setLoading(false);
        }
    };

    const confirmed = sales.filter(s => s.state === 'sale');
    const totalRevenue = confirmed.reduce((sum, s) => sum + (s.amount_total || 0), 0);
    const avgOrderValue = confirmed.length > 0 ? (totalRevenue / confirmed.length) : 0;

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Sales"
                moduleIcon={<BarChart3 size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search reports..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-200">Sales Reporting & Analytics</h2>
                    <p className="text-sm text-gray-400 mt-1">Live synchronized performance across orders, revenue, and customer accounts</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-green-500/20 p-3 rounded-lg">
                                <DollarSign size={24} className="text-green-400" />
                            </div>
                            <TrendingUp size={20} className="text-green-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">
                            ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-sm text-gray-400">Total Confirmed Revenue</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="bg-blue-500/20 p-3 rounded-lg w-fit mb-4">
                            <ShoppingBag size={24} className="text-blue-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">{sales.length}</div>
                        <div className="text-sm text-gray-400">Total Quotations & Orders ({confirmed.length} confirmed)</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="bg-purple-500/20 p-3 rounded-lg w-fit mb-4">
                            <Users size={24} className="text-purple-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">{contacts.length}</div>
                        <div className="text-sm text-gray-400">Total Active Customers</div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <div className="bg-yellow-500/20 p-3 rounded-lg w-fit mb-4">
                            <Award size={24} className="text-yellow-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">
                            ${avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-sm text-gray-400">Average Order Value</div>
                    </div>
                </div>

                {/* Orders Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Recent Sales Pipeline</h3>
                        <div className="space-y-3">
                            {sales.slice(0, 5).map((order) => (
                                <div key={order.id} className="flex items-center justify-between p-3 bg-[#0F172A] rounded border border-gray-800">
                                    <div>
                                        <div className="font-semibold text-white">{order.name}</div>
                                        <div className="text-xs text-gray-400">{order.customer_name || "Customer"}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-green-400 font-bold">${(order.amount_total || 0).toLocaleString()}</div>
                                        <div className="text-[10px] uppercase font-semibold text-gray-400">{order.state}</div>
                                    </div>
                                </div>
                            ))}
                            {sales.length === 0 && (
                                <p className="text-sm text-gray-500 text-center py-4">No sales records available</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Top Customers Overview</h3>
                        <div className="space-y-3">
                            {contacts.slice(0, 5).map((contact) => (
                                <div key={contact.id} className="flex items-center justify-between p-3 bg-[#0F172A] rounded border border-gray-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-purple-600/30 rounded-full flex items-center justify-center text-xs font-bold text-purple-300">
                                            {contact.name.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-white">{contact.name}</div>
                                            <div className="text-xs text-gray-400">{contact.email || contact.phone || "No contact info"}</div>
                                        </div>
                                    </div>
                                    <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-medium">
                                        {contact.is_company ? "Company" : "Individual"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
