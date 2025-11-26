"use client";

import ManufacturingHeader from "@/components/manufacturing/ManufacturingHeader";
import { Plus, Wrench, Package, Clock, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

type ProductionOrder = {
    id: string;
    name: string;
    product_id: string; // In real app, this would be expanded or fetched
    product_qty: number;
    state: string;
    date_planned_start: string;
};

export default function ManufacturingPage() {
    const [orders, setOrders] = useState<ProductionOrder[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // New MO Form State
    const [productName, setProductName] = useState(""); // Simplified for demo
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        fetch("http://localhost:8000/api/v1/mrp/production")
            .then((r) => r.json())
            .then(setOrders)
            .catch(console.error);
    }, []);

    // Simplified create - in real app would need product selection
    const createOrder = async () => {
        // This is a placeholder as we need a real product ID. 
        // For now we will just close the modal or show an alert.
        alert("To create a Manufacturing Order, we need to select a Product ID. This requires a product selection dropdown.");
        setIsModalOpen(false);
    };

    return (
        <div className="flex flex-col h-screen">
            <ManufacturingHeader />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-200">Manufacturing Overview</h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-1.5 rounded flex items-center gap-1"
                    >
                        <Plus size={16} /> New Order
                    </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-[#1E293B] border border-gray-700 rounded-lg p-4 flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">To Process</p>
                            <p className="text-2xl font-bold text-white">{orders.filter(o => o.state === 'draft').length}</p>
                        </div>
                        <div className="bg-blue-500/20 p-2 rounded text-blue-500"><Clock size={24} /></div>
                    </div>
                    <div className="bg-[#1E293B] border border-gray-700 rounded-lg p-4 flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">In Progress</p>
                            <p className="text-2xl font-bold text-white">{orders.filter(o => o.state === 'progress').length}</p>
                        </div>
                        <div className="bg-orange-500/20 p-2 rounded text-orange-500"><Wrench size={24} /></div>
                    </div>
                    <div className="bg-[#1E293B] border border-gray-700 rounded-lg p-4 flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Completed</p>
                            <p className="text-2xl font-bold text-white">{orders.filter(o => o.state === 'done').length}</p>
                        </div>
                        <div className="bg-green-500/20 p-2 rounded text-green-500"><CheckCircle size={24} /></div>
                    </div>
                </div>

                {/* Orders Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-[#1E293B] border border-gray-700 rounded-lg p-4 hover:border-orange-500 transition-colors cursor-pointer group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-gray-200 group-hover:text-orange-400">{order.name}</h3>
                                <span className={`px-2 py-0.5 rounded text-xs ${order.state === 'done' ? 'bg-green-500/20 text-green-400' :
                                        order.state === 'progress' ? 'bg-orange-500/20 text-orange-400' :
                                            'bg-gray-700 text-gray-300'
                                    }`}>
                                    {order.state}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                                <Package size={14} />
                                <span>Product ID: {order.product_id.substring(0, 8)}...</span>
                            </div>

                            <div className="flex justify-between items-end border-t border-gray-700 pt-3">
                                <div>
                                    <p className="text-xs text-gray-500">Quantity</p>
                                    <p className="text-lg font-medium text-white">{order.product_qty}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">Scheduled</p>
                                    <p className="text-sm text-gray-300">{new Date(order.date_planned_start).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {orders.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No manufacturing orders found. Create one to get started.
                        </div>
                    )}
                </div>
            </div>

            {/* Modal would go here */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-[#1E293B] rounded-lg p-6 w-full max-w-md border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">New Manufacturing Order</h3>
                        <p className="text-gray-400 mb-6">Select a product to manufacture (Mockup).</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-300 hover:text-white">Cancel</button>
                            <button onClick={createOrder} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded">Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
