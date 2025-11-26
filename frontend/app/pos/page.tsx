"use client";

import PosHeader from "@/components/pos/PosHeader";
import { useEffect, useState } from "react";
import { Plus, ShoppingCart, Monitor, MoreVertical } from "lucide-react";

type PosConfig = {
    id: string;
    name: string;
    active: boolean;
};

export default function PosPage() {
    const [configs, setConfigs] = useState<PosConfig[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newName, setNewName] = useState("");

    useEffect(() => {
        fetch("http://localhost:8000/api/v1/pos/configs")
            .then((r) => r.json())
            .then(setConfigs)
            .catch(console.error);
    }, []);

    const createConfig = async () => {
        if (!newName.trim()) return;
        const res = await fetch("http://localhost:8000/api/v1/pos/configs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newName }),
        });
        if (res.ok) {
            const config = await res.json();
            setConfigs([...configs, config]);
            setNewName("");
            setIsModalOpen(false);
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <PosHeader />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-200">Point of Sale</h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-1.5 rounded flex items-center gap-1"
                    >
                        <Plus size={16} /> New Shop
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {configs.map((config) => (
                        <div
                            key={config.id}
                            className="bg-[#1E293B] border border-gray-700 rounded-lg p-6 hover:border-amber-500 transition-colors group relative"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-amber-500/20 p-3 rounded-lg text-amber-500">
                                        <Monitor size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-white">{config.name}</h3>
                                        <p className="text-sm text-gray-400">Shop / Restaurant</p>
                                    </div>
                                </div>
                                <button className="text-gray-400 hover:text-white"><MoreVertical size={18} /></button>
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 rounded font-medium">
                                    New Session
                                </button>
                                <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded">
                                    Settings
                                </button>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between text-sm text-gray-400">
                                <span>Last Closing: Never</span>
                                <span className="text-green-400">Active</span>
                            </div>
                        </div>
                    ))}

                    {configs.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No shops configured. Create one to get started.
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-[#1E293B] rounded-lg p-6 w-full max-w-md border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Create New Shop</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Shop Name</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500"
                                    placeholder="e.g. Main Store"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-300 hover:text-white">Cancel</button>
                            <button onClick={createConfig} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded">Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
