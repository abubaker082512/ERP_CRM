"use client";

import { useState, useEffect } from 'react';
import SalesHeader from '@/components/sales/SalesHeader';
import { Plus, Search, Filter, LayoutGrid, List, X, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Product = {
    id: string;
    name: string;
    list_price: number;
};

type Contact = {
    id: string;
    name: string;
};

type OrderLine = {
    product_id: string;
    name: string;
    product_uom_qty: number;
    price_unit: number;
    price_subtotal: number;
};

export default function NewQuotationPage() {
    const router = useRouter();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedContact, setSelectedContact] = useState('');
    const [lines, setLines] = useState<OrderLine[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchContacts();
        fetchProducts();
    }, []);

    const fetchContacts = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/v1/contacts');
            if (res.ok) setContacts(await res.json());
        } catch (error) {
            console.error("Failed to fetch contacts", error);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/v1/products');
            if (res.ok) setProducts(await res.json());
        } catch (error) {
            console.error("Failed to fetch products", error);
        }
    };

    const addLine = () => {
        setLines([...lines, { product_id: '', name: '', product_uom_qty: 1, price_unit: 0, price_subtotal: 0 }]);
    };

    const updateLine = (index: number, field: keyof OrderLine, value: any) => {
        const newLines = [...lines];
        const line = newLines[index];

        if (field === 'product_id') {
            const product = products.find(p => p.id === value);
            if (product) {
                line.product_id = product.id;
                line.name = product.name;
                line.price_unit = product.list_price;
                line.price_subtotal = line.product_uom_qty * product.list_price;
            }
        } else if (field === 'product_uom_qty' || field === 'price_unit') {
            // @ts-ignore
            line[field] = parseFloat(value) || 0;
            line.price_subtotal = line.product_uom_qty * line.price_unit;
        } else {
            // @ts-ignore
            line[field] = value;
        }

        setLines(newLines);
    };

    const removeLine = (index: number) => {
        setLines(lines.filter((_, i) => i !== index));
    };

    const calculateTotal = () => {
        return lines.reduce((sum, line) => sum + line.price_subtotal, 0);
    };

    const handleSave = async () => {
        if (!selectedContact) {
            alert("Please select a customer");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/api/v1/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: "New", // Backend or DB should generate sequence ideally, or we generate here
                    customer_name: contacts.find(c => c.id === selectedContact)?.name,
                    contact_id: selectedContact,
                    amount_total: calculateTotal(),
                    lines: lines
                })
            });

            if (res.ok) {
                router.push('/sales');
            } else {
                alert("Failed to create quotation");
            }
        } catch (error) {
            console.error("Error creating quotation", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <SalesHeader />

            <div className="flex-1 overflow-auto p-4 bg-[#0F172A]">
                <div className="max-w-5xl mx-auto bg-[#1E293B] rounded border border-gray-700 p-6">
                    {/* Header Actions */}
                    <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-4">
                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded text-sm font-medium disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Confirm'}
                            </button>
                            <button
                                onClick={() => router.back()}
                                className="bg-transparent border border-gray-600 hover:bg-gray-700 text-gray-300 px-4 py-1.5 rounded text-sm font-medium"
                            >
                                Discard
                            </button>
                        </div>
                        <div className="text-xl font-bold text-gray-200">New Quotation</div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <label className="block text-sm font-medium text-purple-400 mb-1">Customer</label>
                            <select
                                value={selectedContact}
                                onChange={(e) => setSelectedContact(e.target.value)}
                                className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-purple-500 outline-none"
                            >
                                <option value="">Select Customer...</option>
                                {contacts.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Expiration</label>
                            <input
                                type="date"
                                className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-purple-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Order Lines */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-200">Order Lines</h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-400">
                                <thead className="text-xs text-gray-200 uppercase bg-[#0F172A] border-b border-gray-700">
                                    <tr>
                                        <th className="px-4 py-2 w-1/3">Product</th>
                                        <th className="px-4 py-2">Description</th>
                                        <th className="px-4 py-2 w-24">Quantity</th>
                                        <th className="px-4 py-2 w-32">Unit Price</th>
                                        <th className="px-4 py-2 w-32 text-right">Subtotal</th>
                                        <th className="px-4 py-2 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lines.map((line, index) => (
                                        <tr key={index} className="border-b border-gray-700 bg-[#1E293B]">
                                            <td className="px-4 py-2">
                                                <select
                                                    value={line.product_id}
                                                    onChange={(e) => updateLine(index, 'product_id', e.target.value)}
                                                    className="w-full bg-transparent border-none focus:ring-0 text-white p-0"
                                                >
                                                    <option value="">Select Product...</option>
                                                    {products.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    value={line.name}
                                                    onChange={(e) => updateLine(index, 'name', e.target.value)}
                                                    className="w-full bg-transparent border-none focus:ring-0 text-white p-0"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    value={line.product_uom_qty}
                                                    onChange={(e) => updateLine(index, 'product_uom_qty', e.target.value)}
                                                    className="w-full bg-transparent border-none focus:ring-0 text-white p-0"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    value={line.price_unit}
                                                    onChange={(e) => updateLine(index, 'price_unit', e.target.value)}
                                                    className="w-full bg-transparent border-none focus:ring-0 text-white p-0"
                                                />
                                            </td>
                                            <td className="px-4 py-2 text-right text-white">
                                                ${line.price_subtotal.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <button onClick={() => removeLine(index)} className="text-gray-500 hover:text-red-400">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <button
                            onClick={addLine}
                            className="mt-2 text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1"
                        >
                            <Plus size={16} /> Add a product
                        </button>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end">
                        <div className="w-64">
                            <div className="flex justify-between py-2 border-t border-gray-700">
                                <span className="font-bold text-gray-200">Total</span>
                                <span className="font-bold text-xl text-white">${calculateTotal().toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
