"use client";
import { fetchAPI } from '@/lib/api';
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { useEffect, useState } from "react";
import { BarChart3, Package, Tag, ArrowRight } from "lucide-react";
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

type Product = {
    id: string;
    name: string;
    default_code?: string;
    sku?: string;
    categ_id?: string;
    list_price?: number;
    standard_price?: number;
    type?: string;
};

export default function SalesProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [currentView, setCurrentView] = useState<ViewType>("list");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetchAPI("/products");
            if (res.ok) {
                const data = await res.json();
                setProducts(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
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
                searchPlaceholder="Search products..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-200">Products</h2>
                            <p className="text-sm text-gray-400 mt-1">{products.length} products available</p>
                        </div>
                        <ViewSwitcher
                            currentView={currentView}
                            availableViews={["list", "kanban"]}
                            onViewChange={setCurrentView}
                        />
                    </div>
                    <Link
                        href="/inventory"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md shadow-purple-900/30 transition-all cursor-pointer"
                    >
                        Manage in Inventory
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
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Product</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Internal Code</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Type</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Sales Price</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Cost Price</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => (
                                    <tr key={product.id} className="border-b border-gray-700/60 hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="p-1.5 bg-purple-600/20 text-purple-400 rounded">
                                                    <Package size={16} />
                                                </div>
                                                <span className="font-semibold text-white">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-300">{product.default_code || product.sku || "—"}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded text-xs capitalize">
                                                {product.type || "consu"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-green-400 font-semibold">${(product.list_price || 0).toFixed(2)}</td>
                                        <td className="px-4 py-3 text-gray-300">${(product.standard_price || 0).toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right">
                                            <Link href="/inventory" className="text-purple-400 hover:text-purple-300 text-sm font-medium inline-flex items-center gap-1">
                                                Inventory <ArrowRight size={13} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                                            No products found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map(product => (
                            <div key={product.id} className="bg-[#1E293B] border border-gray-700 rounded-lg p-5 hover:border-purple-500 transition-all shadow">
                                <div className="flex items-center gap-2.5 mb-3">
                                    <div className="p-2 bg-purple-600/20 text-purple-400 rounded">
                                        <Package size={20} />
                                    </div>
                                    <h3 className="font-semibold text-white truncate">{product.name}</h3>
                                </div>
                                <div className="space-y-2 text-xs mb-4">
                                    <div className="flex justify-between text-gray-400">
                                        <span>Code:</span>
                                        <span className="text-gray-200">{product.default_code || product.sku || "—"}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400">
                                        <span>Sales Price:</span>
                                        <span className="text-green-400 font-bold">${(product.list_price || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400">
                                        <span>Cost:</span>
                                        <span className="text-gray-300">${(product.standard_price || 0).toFixed(2)}</span>
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
