"use client";

import { useState, useEffect } from 'react';
import ContactsHeader from '@/components/contacts/ContactsHeader';
import { Plus, MapPin, Phone, Mail } from 'lucide-react';

type Contact = {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    type: 'customer' | 'supplier';
    image_url?: string;
};

export default function ContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newAddress, setNewAddress] = useState('');

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/v1/contacts');
            if (res.ok) setContacts(await res.json());
        } catch (error) {
            console.error("Failed to fetch contacts", error);
        }
    };

    const handleCreateContact = async () => {
        if (!newName.trim()) return;

        try {
            const res = await fetch('http://localhost:8000/api/v1/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newName,
                    email: newEmail,
                    phone: newPhone,
                    address: newAddress,
                    type: 'customer'
                })
            });

            if (res.ok) {
                const newContact = await res.json();
                setContacts([...contacts, newContact]);
                setNewName('');
                setNewEmail('');
                setNewPhone('');
                setNewAddress('');
                setIsNewModalOpen(false);
            }
        } catch (error) {
            console.error("Failed to create contact", error);
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <ContactsHeader />

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
                        <span className="text-xl font-semibold text-gray-200">Contacts</span>
                    </div>
                </div>

                {/* New Contact Modal */}
                {isNewModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                        <div className="bg-[#1E293B] rounded-lg shadow-xl w-full max-w-md border border-gray-700 p-6">
                            <h2 className="text-lg font-semibold text-white mb-4">Create Contact</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-purple-500 outline-none"
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-purple-500 outline-none"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                                    <input
                                        type="text"
                                        value={newPhone}
                                        onChange={(e) => setNewPhone(e.target.value)}
                                        className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-purple-500 outline-none"
                                        placeholder="+1 234 567 890"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Address</label>
                                    <input
                                        type="text"
                                        value={newAddress}
                                        onChange={(e) => setNewAddress(e.target.value)}
                                        className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-purple-500 outline-none"
                                        placeholder="123 Main St, City"
                                    />
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
                                    onClick={handleCreateContact}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-medium"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contacts Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {contacts.map((contact) => (
                        <div key={contact.id} className="bg-[#1E293B] border border-gray-700 rounded-lg overflow-hidden hover:border-purple-500 transition-colors group cursor-pointer flex">
                            <div className="w-24 bg-gray-800 flex items-center justify-center shrink-0">
                                {contact.image_url ? (
                                    <img src={contact.image_url} alt={contact.name} className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-3xl">👤</span>
                                )}
                            </div>
                            <div className="p-3 flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-200 mb-1 truncate group-hover:text-purple-400">{contact.name}</h3>
                                <div className="space-y-1">
                                    {contact.address && (
                                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                            <MapPin size={12} className="shrink-0" />
                                            <span className="truncate">{contact.address}</span>
                                        </div>
                                    )}
                                    {contact.email && (
                                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                            <Mail size={12} className="shrink-0" />
                                            <span className="truncate">{contact.email}</span>
                                        </div>
                                    )}
                                    {contact.phone && (
                                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                            <Phone size={12} className="shrink-0" />
                                            <span className="truncate">{contact.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
