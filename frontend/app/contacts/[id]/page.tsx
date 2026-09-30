"use client";
import { fetchAPI } from '@/lib/api';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ContactsHeader from '@/components/contacts/ContactsHeader';
import { ArrowLeft, Save, Trash2, Mail, Phone, MapPin, Building2 } from 'lucide-react';
import Link from 'next/link';

type Contact = {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    type: string;
};

export default function ContactDetail() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [contact, setContact] = useState<Contact | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchContact = async () => {
            try {
                const res = await fetchAPI(`/contacts/${id}`);
                if (!res.ok) throw new Error(`Server error: ${res.status}`);
                setContact(await res.json());
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchContact();
    }, [id]);

    const handleSave = async () => {
        if (!contact) return;
        setSaving(true);
        setError(null);
        try {
            const res = await fetchAPI(`/contacts/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: contact.name,
                    email: contact.email ?? null,
                    phone: contact.phone ?? null,
                    address: contact.address ?? null,
                    type: contact.type,
                })
            });
            if (!res.ok) {
                const detail = await res.json();
                throw new Error(detail.detail || `HTTP ${res.status}`);
            }
            setContact(await res.json());
            alert("✅ Contact saved successfully!");
        } catch (err: any) {
            setError(`Save failed: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Delete this contact permanently?")) return;
        try {
            const res = await fetchAPI(`/contacts/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Delete failed");
        } catch (err: any) {
            alert(`Error: ${err.message}`);
            return;
        }
        router.push('/contacts');
    };

    if (loading) return <div className="h-screen bg-[#0F172A] flex items-center justify-center text-white">Loading...</div>;

    if (error && !contact) return (
        <div className="h-screen bg-[#0F172A] flex flex-col items-center justify-center gap-4">
            <p className="text-red-400 text-lg">⚠️ {error}</p>
            <Link href="/contacts" className="text-purple-400 hover:underline">← Back to Contacts</Link>
        </div>
    );

    if (!contact) return <div className="p-8 text-white">Contact not found.</div>;

    return (
        <div className="flex flex-col min-h-screen bg-[#0F172A] text-white">
            <ContactsHeader />
            <div className="p-6 max-w-4xl mx-auto w-full">
                {error && (
                    <div className="mb-4 bg-red-500/10 border border-red-500/40 text-red-400 rounded-lg px-4 py-3 text-sm">
                        ⚠️ {error}
                    </div>
                )}

                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/contacts" className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                                {contact.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">{contact.name}</h1>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${contact.type === 'customer' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                    {contact.type?.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-4 py-2 border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-lg text-sm font-medium transition"
                        >
                            <Trash2 size={16} /> Delete
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-60 rounded-lg text-sm font-medium transition"
                        >
                            <Save size={16} /> {saving ? 'Saving...' : 'Save Contact'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2 bg-[#1E293B] border border-gray-800 rounded-xl p-6">
                        <h2 className="text-lg font-semibold border-b border-gray-800 pb-4 mb-4">Contact Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                                <input type="text" value={contact.name} onChange={e => setContact({...contact, name: e.target.value})}
                                    className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 text-gray-500" size={16} />
                                        <input type="email" value={contact.email || ''} onChange={e => setContact({...contact, email: e.target.value})}
                                            className="w-full bg-[#0F172A] border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Phone</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-2.5 text-gray-500" size={16} />
                                        <input type="text" value={contact.phone || ''} onChange={e => setContact({...contact, phone: e.target.value})}
                                            className="w-full bg-[#0F172A] border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-2.5 text-gray-500" size={16} />
                                    <input type="text" value={contact.address || ''} onChange={e => setContact({...contact, address: e.target.value})}
                                        className="w-full bg-[#0F172A] border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-[#1E293B] border border-gray-800 rounded-xl p-6">
                            <h2 className="text-lg font-semibold border-b border-gray-800 pb-4 mb-4">Classification</h2>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Contact Type</label>
                                <select value={contact.type} onChange={e => setContact({...contact, type: e.target.value})}
                                    className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none">
                                    <option value="customer">Customer</option>
                                    <option value="supplier">Supplier / Vendor</option>
                                    <option value="partner">Partner</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
