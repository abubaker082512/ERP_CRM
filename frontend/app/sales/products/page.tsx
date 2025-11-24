"use client";

import { useState, useEffect } from 'react';
import SalesHeader from '@/components/sales/SalesHeader';
import { Plus, Search, Filter, LayoutGrid, List } from 'lucide-react';

type Product = {
    id: string;
    name: string;
    list_price: number;
    cost_price: number;
    quantity_on_hand: number;
    image_url?: string;
};

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [newProductName, setNewProductName] = useState('');
    const [newProductPrice, setNewProductPrice] = useState('');
    const [newProductCost, setNewProductCost] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/v1/products');
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
        }
    };

    const handleCreateProduct = async () => {
        if (!newProductName.trim()) return;

        try {
            const res = await fetch('http://localhost:8000/api/v1/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newProductName,
                    list_price: parseFloat(newProductPrice) || 0,
                    cost_price: parseFloat(newProductCost) || 0,
                    quantity_on_hand: 0
                })
            });

            if (res.ok) {
                const newProduct = await res.json();
                setProducts([...products, newProduct]);
                setNewProductName('');
                setNewProductPrice('');
                setNewProductCost('');
                setIsNewModalOpen(false);
            }
        } catch (error) {
            console.error("Failed to create product", error);
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <SalesHeader />

            <div className="flex-1 overflow-auto p-4">
                {/* Toolbar */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsNewModalOpen(true)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded text-sm font-medium"
                        >
                            New
                        </button>
                        <span className="text-xl font-semibold text-gray-200">Products</span>
                    </div>

                    <div className="flex items-center gap-2 bg-[#1E293B] rounded border border-gray-700 p-1">
                        <button className="p-1.5 bg-gray-700 rounded text-white"><LayoutGrid size={18} /></button>
                        <button className="p-1.5 hover:bg-gray-700 rounded text-gray-400"><List size={18} /></button>
                    </div>
                </div>

                {/* New Product Modal */}
                {isNewModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                        <div className="bg-[#1E293B] rounded-lg shadow-xl w-full max-w-md border border-gray-700 p-6">
                            <h2 className="text-lg font-semibold text-white mb-4">Create Product</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Product Name</label>
                                    <input
                                        type="text"
                                        value={newProductName}
                                        onChange={(e) => setNewProductName(e.target.value)}
                                        className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-purple-500 outline-none"
                                        placeholder="e.g. Office Chair"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Sales Price</label>
                                        <input
                                            type="number"
                                            value={newProductPrice}
                                            onChange={(e) => setNewProductPrice(e.target.value)}
                                            className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-purple-500 outline-none"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Cost</label>
                                        <input
                                            type="number"
                                            value={newProductCost}
                                            onChange={(e) => setNewProductCost(e.target.value)}
                                            className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-purple-500 outline-none"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setIsNewModalOpen(false)}
                                    className="px-4 py-2 text-gray-300 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateProduct}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-medium"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <div key={product.id} className="bg-[#1E293B] border border-gray-700 rounded-lg overflow-hidden hover:border-purple-500 transition-colors group cursor-pointer">
                            <div className="h-32 bg-gray-800 flex items-center justify-center relative">
                                {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-4xl">📦</span>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-200 mb-1 group-hover:text-purple-400">{product.name}</h3>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-xs text-gray-500">Price</p>
                                        <p className="font-medium text-white">${product.list_price.toFixed(2)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">On Hand</p>
                                        <p className="font-medium text-purple-400">{product.quantity_on_hand} Units</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
