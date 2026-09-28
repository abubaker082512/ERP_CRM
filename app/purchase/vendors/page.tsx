"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { useState } from "react";
import { ShoppingCart, Mail, Phone, MapPin, Globe } from "lucide-react";

const MENU_ITEMS = [
    { name: "RFQs", href: "/purchase" },
    { name: "Purchase Orders", href: "/purchase/orders" },
    { name: "Vendors", href: "/purchase/vendors" },
    { name: "Reporting", href: "/purchase/reporting" },
    { name: "Configuration", href: "/purchase/configuration" },
];

type Vendor = {
    id: string;
    name: string;
    email: string;
    phone: string;
    website: string;
    location: string;
    total_purchased: number;
    rating: number;
};

const mockVendors: Vendor[] = [
    { id: "1", name: "Supplier A", email: "contact@suppliera.com", phone: "+1 555 0101", website: "www.suppliera.com", location: "New York, USA", total_purchased: 150000, rating: 4.8 },
    { id: "2", name: "Supplier B", email: "info@supplierb.com", phone: "+1 555 0102", website: "www.supplierb.com", location: "London, UK", total_purchased: 85000, rating: 4.5 },
    { id: "3", name: "Supplier C", email: "sales@supplierc.com", phone: "+1 555 0103", website: "www.supplierc.com", location: "Berlin, Germany", total_purchased: 210000, rating: 4.9 },
];

export default function PurchaseVendorsPage() {
    const [vendors] = useState<Vendor[]>(mockVendors);
    const [currentView, setCurrentView] = useState<ViewType>("list");

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Purchase"
                moduleIcon={<ShoppingCart size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search vendors..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-200">Vendors</h2>
                            <p className="text-sm text-gray-400 mt-1">{vendors.length} active vendors</p>
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
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Vendor</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Contact</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Location</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Total Purchased</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Rating</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vendors.map(vendor => (
                                    <tr key={vendor.id} className="border-b border-gray-700 hover:bg-[#1E293B] transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                                    {vendor.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white">{vendor.name}</div>
                                                    <div className="text-xs text-gray-400 flex items-center gap-1">
                                                        <Globe size={10} /> {vendor.website}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="space-y-1 text-sm">
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <Mail size={14} />
                                                    <span>{vendor.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <Phone size={14} />
                                                    <span>{vendor.phone}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-300">{vendor.location}</td>
                                        <td className="px-4 py-3 text-green-400 font-semibold">${vendor.total_purchased.toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1 text-yellow-400">
                                                <span>★</span>
                                                <span>{vendor.rating}</span>
                                            </div>
                                        </td>
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
                        {vendors.map(vendor => (
                            <div key={vendor.id} className="bg-[#1E293B] border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-all">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        {vendor.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">{vendor.name}</h3>
                                        <div className="flex items-center gap-1 text-xs text-gray-400">
                                            <MapPin size={10} /> {vendor.location}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm mb-4">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Mail size={14} />
                                        <span>{vendor.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Phone size={14} />
                                        <span>{vendor.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Globe size={14} />
                                        <span>{vendor.website}</span>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-gray-700 grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xs text-gray-400">Total Purchased</div>
                                        <div className="text-lg font-semibold text-green-400">${(vendor.total_purchased / 1000).toFixed(0)}K</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400">Rating</div>
                                        <div className="text-lg font-semibold text-yellow-400">★ {vendor.rating}</div>
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
