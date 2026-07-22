"use client";
import { fetchAPI } from '@/lib/api';
import { useState, useEffect } from 'react';
import PurchaseHeader from '@/components/purchase/PurchaseHeader';
import { User, Mail, Phone, Building2 } from 'lucide-react';

type Vendor = {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    company_name?: string;
    is_company: boolean;
};

export default function PurchaseVendorsPage() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            const res = await fetchAPI("/contacts");
            if (res.ok) {
                const data = await res.json();
                // Filter to either companies or vendors (in a basic CRM all contacts can be vendors)
                setVendors(data);
            }
        } catch (error) {
            console.error("Failed to fetch vendors", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#0B101E] text-white">
            <PurchaseHeader />

            <div className="flex-1 overflow-auto p-6">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-200">Suppliers & Vendors</h2>
                    <p className="text-xs text-gray-400 mt-1">Manage vendor contact details, company information, and delivery terms.</p>
                </div>

                {loading ? (
                    <div className="text-center text-gray-500 py-12">Loading suppliers...</div>
                ) : vendors.length === 0 ? (
                    <div className="galaxy-card p-12 text-center text-gray-500">
                        No supplier contacts registered yet. Add a contact in the Contacts module first!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {vendors.map((v) => (
                            <div key={v.id} className="galaxy-card p-5 hover:border-purple-500/40 transition-colors group">
                                <div className="flex items-start gap-4">
                                    <div className="bg-purple-600/10 p-3 rounded-xl border border-purple-500/20 text-purple-400">
                                        {v.is_company ? <Building2 size={24} /> : <User size={24} />}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors leading-snug">{v.name}</h3>
                                        {v.company_name && (
                                            <p className="text-xs text-gray-400 flex items-center gap-1.5">
                                                <Building2 size={12} className="text-gray-500" /> {v.company_name}
                                            </p>
                                        )}
                                        {v.email && (
                                            <p className="text-xs text-gray-400 flex items-center gap-1.5">
                                                <Mail size={12} className="text-gray-500" /> {v.email}
                                            </p>
                                        )}
                                        {v.phone && (
                                            <p className="text-xs text-gray-400 flex items-center gap-1.5">
                                                <Phone size={12} className="text-gray-500" /> {v.phone}
                                            </p>
                                        )}
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
