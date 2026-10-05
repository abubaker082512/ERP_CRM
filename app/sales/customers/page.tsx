"use client";
import { fetchAPI } from '@/lib/api';
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { useEffect, useState } from "react";
import { BarChart3, Users, Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
    email?: string;
    phone?: string;
    company_name?: string;
    is_company?: boolean;
    total_orders?: number;
    total_revenue?: number;
};

export default function SalesCustomersPage() {
    const router = useRouter();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [currentView, setCurrentView] = useState<ViewType>("list");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [cRes, sRes] = await Promise.all([
                fetchAPI("/contacts"),
                fetchAPI("/sales")
            ]);

            let contactList: Customer[] = [];
            if (cRes.ok) {
                contactList = await cRes.json();
            }

            let salesList: any[] = [];
            if (sRes.ok) {
                salesList = await sRes.json();
            }

            // Sync total orders & revenue per contact
            const mapped = contactList.map(c => {
                const customerSales = salesList.filter(s => s.contact_id === c.id || s.partner_id === c.id);
                const totalOrders = customerSales.length;
                const totalRevenue = customerSales.reduce((sum, s) => sum + (s.amount_total || 0), 0);
                return {
                    ...c,
                    total_orders: totalOrders,
                    total_revenue: totalRevenue
                };
            });

            setCustomers(mapped);
        } catch (error) {
            console.error("Failed to load customers", error);
        } finally {
            setLoading(false);
        }
    };

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
                    <Link
                        href="/contacts"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md shadow-purple-900/30 transition-all cursor-pointer"
                    >
                        + New Customer
                    </Link>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center p-12">
                        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : currentView === "list" ? (
                    <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-hidden shadow-xl">
                        <table className="w-full">
                            <thead className="bg-[#0F172A] border-b border-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Customer</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Company</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Contact</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Total Orders</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Total Revenue</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map(customer => (
                                    <tr
                                        key={customer.id}
                                        onClick={() => router.push(`/contacts/${customer.id}`)}
                                        className="border-b border-gray-700/60 hover:bg-white/5 transition-colors cursor-pointer"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-purple-600/30 border border-purple-500/40 rounded-full flex items-center justify-center text-purple-300 font-bold text-xs">
                                                    {customer.name.slice(0, 2).toUpperCase()}
                                                </div>
                                                <span className="font-semibold text-white">{customer.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-300">{customer.company_name || (customer.is_company ? "Company" : "Individual")}</td>
                                        <td className="px-4 py-3">
                                            <div className="space-y-1 text-xs">
                                                {customer.email && (
                                                    <div className="flex items-center gap-1.5 text-gray-400">
                                                        <Mail size={12} />
                                                        <span>{customer.email}</span>
                                                    </div>
                                                )}
                                                {customer.phone && (
                                                    <div className="flex items-center gap-1.5 text-gray-400">
                                                        <Phone size={12} />
                                                        <span>{customer.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-300 font-medium">{customer.total_orders || 0}</td>
                                        <td className="px-4 py-3 text-green-400 font-semibold">${(customer.total_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center justify-end gap-1">
                                                View <ArrowRight size={14} />
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {customers.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                                            No customers found. Click "+ New Customer" to add one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {customers.map(customer => (
                            <div
                                key={customer.id}
                                onClick={() => router.push(`/contacts/${customer.id}`)}
                                className="bg-[#1E293B] border border-gray-700 rounded-lg p-5 hover:border-purple-500 transition-all cursor-pointer shadow"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-purple-600/30 border border-purple-500/40 rounded-full flex items-center justify-center text-purple-300 font-bold">
                                        {customer.name.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">{customer.name}</h3>
                                        <p className="text-xs text-gray-400">{customer.company_name || (customer.is_company ? "Company" : "Individual")}</p>
                                    </div>
                                </div>
                                <div className="space-y-1.5 text-xs mb-4">
                                    {customer.email && (
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Mail size={13} />
                                            <span>{customer.email}</span>
                                        </div>
                                    )}
                                    {customer.phone && (
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Phone size={13} />
                                            <span>{customer.phone}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="pt-3 border-t border-gray-700/80 grid grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <div className="text-gray-400">Total Orders</div>
                                        <div className="text-base font-bold text-white">{customer.total_orders || 0}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400">Total Revenue</div>
                                        <div className="text-base font-bold text-green-400">${(customer.total_revenue || 0).toLocaleString()}</div>
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
