"use client";

import { fetchAPI } from '@/lib/api';
import { useState, useEffect } from 'react';
import ContactsHeader from '@/components/contacts/ContactsHeader';
import { Plus, MapPin, Phone, Mail, Building2, User, ExternalLink } from 'lucide-react';
import Link from 'next/link';

type Contact = {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    street?: string;
    city?: string;
    company_name?: string;
    is_company?: boolean;
    type?: 'contact' | 'invoice' | 'delivery' | 'private';
    image_url?: string;
};

export default function ContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'individual' | 'company'>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);

    // New contact form state
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newStreet, setNewStreet] = useState('');
    const [newCompanyName, setNewCompanyName] = useState('');
    const [newIsCompany, setNewIsCompany] = useState(false);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const res = await fetchAPI("/contacts");
            if (res.ok) {
                const data = await res.json();
                setContacts(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error("Failed to fetch contacts", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateContact = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newName.trim()) return;

        setCreating(true);
        try {
            const res = await fetchAPI("/contacts", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newName.trim(),
                    email: newEmail.trim() || undefined,
                    phone: newPhone.trim() || undefined,
                    street: newStreet.trim() || undefined,
                    company_name: newCompanyName.trim() || undefined,
                    is_company: newIsCompany,
                    type: 'contact'
                })
            });

            if (res.ok) {
                const newContact = await res.json();
                setContacts([newContact, ...contacts]);
                setNewName('');
                setNewEmail('');
                setNewPhone('');
                setNewStreet('');
                setNewCompanyName('');
                setNewIsCompany(false);
                setIsNewModalOpen(false);
            }
        } catch (error) {
            console.error("Failed to create contact", error);
        } finally {
            setCreating(false);
        }
    };

    // Filter contacts by search query & individual / company type
    const filteredContacts = contacts.filter((c) => {
        // Type filter
        if (filterType === 'individual' && c.is_company) return false;
        if (filterType === 'company' && !c.is_company) return false;

        // Search query
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase().trim();
        return (
            (c.name || '').toLowerCase().includes(q) ||
            (c.email || '').toLowerCase().includes(q) ||
            (c.phone || '').toLowerCase().includes(q) ||
            (c.street || '').toLowerCase().includes(q) ||
            (c.company_name || '').toLowerCase().includes(q)
        );
    });

    return (
        <div className="flex flex-col min-h-screen bg-[#0F172A]">
            <ContactsHeader
                onNewClick={() => setIsNewModalOpen(true)}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filterType={filterType}
                onFilterChange={setFilterType}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />

            <div className="flex-1 overflow-auto p-6 max-w-7xl mx-auto w-full">
                {/* Secondary Status Bar */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-gray-100">Directory</span>
                        <span className="text-xs bg-purple-500/20 text-purple-300 font-mono px-2.5 py-0.5 rounded-full border border-purple-500/30">
                            {filteredContacts.length} {filteredContacts.length === 1 ? 'Contact' : 'Contacts'}
                        </span>
                    </div>

                    <button
                        onClick={() => setIsNewModalOpen(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-900/30 transition-all active:scale-95 cursor-pointer"
                    >
                        <Plus size={16} /> Add Contact
                    </button>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="py-16 text-center text-gray-400 flex flex-col items-center justify-center gap-3">
                        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Loading contacts directory...</span>
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredContacts.length === 0 && (
                    <div className="py-16 text-center galaxy-card rounded-2xl border border-dashed border-gray-700 p-8">
                        <User size={40} className="mx-auto text-gray-600 mb-3" />
                        <h3 className="text-base font-semibold text-gray-300 mb-1">No contacts match your query</h3>
                        <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
                            Try adjusting your search keywords or filter pills, or create a new contact.
                        </p>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterType('all');
                            }}
                            className="text-xs text-purple-400 hover:text-purple-300 underline font-medium"
                        >
                            Reset filters
                        </button>
                    </div>
                )}

                {/* View Mode: Card Grid */}
                {!loading && viewMode === 'grid' && filteredContacts.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {filteredContacts.map((contact) => (
                            <Link
                                key={contact.id}
                                href={`/contacts/${contact.id}`}
                                className="galaxy-card bg-[#1E293B]/80 hover:bg-[#1E293B] border border-white/5 hover:border-purple-500/50 rounded-xl overflow-hidden transition-all group flex flex-col cursor-pointer shadow-md hover:shadow-purple-900/20"
                            >
                                <div className="p-4 flex items-start gap-3.5">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-purple-500/30 rounded-xl flex items-center justify-center shrink-0 text-xl font-bold text-purple-300 group-hover:scale-105 transition-transform">
                                        {contact.is_company ? <Building2 size={22} className="text-cyan-400" /> : <User size={22} className="text-purple-400" />}
                                    </div>

                                    {/* Main info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-1 mb-1">
                                            <h3 className="font-bold text-gray-100 text-sm truncate group-hover:text-purple-400 transition-colors">
                                                {contact.name}
                                            </h3>
                                        </div>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                            contact.is_company 
                                                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' 
                                                : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                                        }`}>
                                            {contact.is_company ? 'Company' : 'Individual'}
                                        </span>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="px-4 pb-4 pt-1 space-y-1.5 text-xs text-gray-400 border-t border-white/5 mt-auto">
                                    {contact.company_name && !contact.is_company && (
                                        <div className="flex items-center gap-1.5 truncate text-gray-300">
                                            <Building2 size={12} className="text-gray-500 shrink-0" />
                                            <span className="truncate">{contact.company_name}</span>
                                        </div>
                                    )}
                                    {contact.email && (
                                        <div className="flex items-center gap-1.5 truncate">
                                            <Mail size={12} className="text-gray-500 shrink-0" />
                                            <span className="truncate">{contact.email}</span>
                                        </div>
                                    )}
                                    {contact.phone && (
                                        <div className="flex items-center gap-1.5 truncate">
                                            <Phone size={12} className="text-gray-500 shrink-0" />
                                            <span className="truncate font-mono">{contact.phone}</span>
                                        </div>
                                    )}
                                    {contact.street && (
                                        <div className="flex items-center gap-1.5 truncate text-[11px] text-gray-500">
                                            <MapPin size={11} className="shrink-0" />
                                            <span className="truncate">{contact.street}</span>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* View Mode: Table List */}
                {!loading && viewMode === 'list' && filteredContacts.length > 0 && (
                    <div className="galaxy-card overflow-hidden rounded-xl border border-white/10 shadow-xl">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#1E293B] text-[10px] uppercase tracking-widest text-gray-400 border-b border-gray-800">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Company</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Phone</th>
                                    <th className="px-6 py-4">Address</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {filteredContacts.map((contact) => (
                                    <tr key={contact.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/contacts/${contact.id}`}
                                                className="font-bold text-gray-100 group-hover:text-purple-400 transition-colors flex items-center gap-2"
                                            >
                                                {contact.name}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                                contact.is_company 
                                                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' 
                                                    : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                                            }`}>
                                                {contact.is_company ? 'Company' : 'Individual'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-300 text-xs">
                                            {contact.company_name || '—'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-300 font-mono text-xs">
                                            {contact.email || '—'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-300 font-mono text-xs">
                                            {contact.phone || '—'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-xs">
                                            {contact.street || '—'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/contacts/${contact.id}`}
                                                className="inline-flex items-center gap-1 text-xs bg-white/5 hover:bg-purple-600 text-gray-300 hover:text-white px-3 py-1 rounded-lg transition-all"
                                            >
                                                View <ExternalLink size={11} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* New Contact Modal */}
                {isNewModalOpen && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4 animate-in fade-in">
                        <div className="bg-[#1E293B] rounded-2xl shadow-2xl w-full max-w-md border border-white/10 p-6">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Plus size={18} className="text-purple-400" /> Create New Contact
                            </h2>

                            <form onSubmit={handleCreateContact} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                                        Name <span className="text-purple-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="w-full bg-[#0F172A] border border-gray-600 focus:border-purple-500 rounded-xl px-3 py-2 text-white outline-none text-sm transition-colors"
                                        placeholder="e.g. Acme Corp or John Doe"
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={newEmail}
                                            onChange={(e) => setNewEmail(e.target.value)}
                                            className="w-full bg-[#0F172A] border border-gray-600 focus:border-purple-500 rounded-xl px-3 py-2 text-white outline-none text-sm transition-colors"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Phone</label>
                                        <input
                                            type="text"
                                            value={newPhone}
                                            onChange={(e) => setNewPhone(e.target.value)}
                                            className="w-full bg-[#0F172A] border border-gray-600 focus:border-purple-500 rounded-xl px-3 py-2 text-white outline-none text-sm transition-colors font-mono"
                                            placeholder="+1 234 567 890"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Company / Organization</label>
                                    <input
                                        type="text"
                                        value={newCompanyName}
                                        onChange={(e) => setNewCompanyName(e.target.value)}
                                        className="w-full bg-[#0F172A] border border-gray-600 focus:border-purple-500 rounded-xl px-3 py-2 text-white outline-none text-sm transition-colors"
                                        placeholder="Company Name (optional)"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Street Address</label>
                                    <input
                                        type="text"
                                        value={newStreet}
                                        onChange={(e) => setNewStreet(e.target.value)}
                                        className="w-full bg-[#0F172A] border border-gray-600 focus:border-purple-500 rounded-xl px-3 py-2 text-white outline-none text-sm transition-colors"
                                        placeholder="123 Innovation Way, Suite 100"
                                    />
                                </div>

                                <div className="flex items-center gap-2 pt-1">
                                    <input
                                        type="checkbox"
                                        id="isCompany"
                                        checked={newIsCompany}
                                        onChange={(e) => setNewIsCompany(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-600 bg-[#0F172A] text-purple-600 focus:ring-purple-500 cursor-pointer"
                                    />
                                    <label htmlFor="isCompany" className="text-xs font-semibold text-gray-300 cursor-pointer">
                                        This contact represents a Company / Business
                                    </label>
                                </div>

                                <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-white/5">
                                    <button
                                        type="button"
                                        onClick={() => setIsNewModalOpen(false)}
                                        className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={creating || !newName.trim()}
                                        className="bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white px-5 py-2 rounded-xl text-sm font-bold uppercase tracking-wider shadow-lg shadow-purple-900/30 transition-all active:scale-95 cursor-pointer"
                                    >
                                        {creating ? 'Saving...' : 'Save Contact'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
