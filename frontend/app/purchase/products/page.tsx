"use client";
import { fetchAPI } from '@/lib/api';
import { useState, useEffect } from 'react';
import PurchaseHeader from '@/components/purchase/PurchaseHeader';
import { Package, Plus } from 'lucide-react';
import Link from 'next/link';

type Product = {
    id: string;
    name: string;
    sku?: string;
    list_price: number;
    cost_price: number;
};

export default function PurchaseProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetchAPI("/inventory/products");
            if (res.ok) setProducts(await res.json());
        } catch (error) {
            console.error("Failed to fetch purchase products", error);
        } finally {
            setLoading(false);
        }
    };

    const getCurrencySymbol = () => {
        if (typeof window !== "undefined") {
            const cur = localStorage.getItem("settings_currency") || "USD";
            const symbols: Record<string, string> = {
                USD: "$", EUR: "€", GBP: "£", AUD: "$", CAD: "$", JPY: "¥", PKR: "₨", INR: "₹"
            };
            return symbols[cur] || "$";
        }
        return "$";
    };

    const currencySymbol = getCurrencySymbol();

    return (
        <div className="flex flex-col h-screen bg-[#0B101E] text-white">
            <PurchaseHeader />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-200">Purchasable Products</h2>
                        <p className="text-xs text-gray-400 mt-1">Products catalog configured for inventory tracking, procurement, and supplier ordering.</p>
                    </div>
                    <Link
                        href="/inventory"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                    >
                        <Plus size={14} /> Add Product
                    </Link>
                </div>

                <div className="galaxy-card overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-400 uppercase bg-[#0F172A] border-b border-gray-800">
                            <tr>
                                <th className="px-6 py-4">Product Name</th>
                                <th className="px-6 py-4">SKU / Barcode</th>
                                <th className="px-6 py-4 text-right">Standard Cost</th>
                                <th className="px-6 py-4 text-right">Sales Price</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading catalog...</td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        No products cataloged. Create a product inside Inventory!
                                    </td>
                                </tr>
                            ) : (
                                products.map((p) => (
                                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-gray-200">{p.name}</td>
                                        <td className="px-6 py-4 font-mono text-xs text-gray-400">{p.sku || '—'}</td>
                                        <td className="px-6 py-4 text-right font-medium text-purple-400">{currencySymbol}{(p.cost_price || 0.00).toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right text-green-400">{currencySymbol}{(p.list_price || 0.00).toFixed(2)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
