"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { useState, useEffect } from "react";
import { useBranchContext } from "@/lib/branchContext";
import {
    Users,
    Building2,
    Mail,
    Phone,
    MapPin,
    Plus,
    X,
    CheckCircle2,
    MessageCircle,
    ExternalLink,
    Filter,
    DollarSign,
    Briefcase,
    Globe,
    Star,
    Sparkles,
    Send,
    UserCheck
} from "lucide-react";

const MENU_ITEMS = [
    { name: "Contacts", href: "/contacts" },
    { name: "Leads Pool", href: "/crm/leads-pool" },
    { name: "Companies", href: "/crm" },
    { name: "Configuration", href: "/crm/configuration" },
];

export type Contact = {
    id: string;
    name: string;
    title?: string;
    company: string;
    is_company?: boolean;
    email: string;
    phone: string;
    city: string;
    country: string;
    type: "customer" | "vendor" | "lead" | "partner";
    revenue_spend?: number;
    deals_count?: number;
    tags: string[];
    starred?: boolean;
    avatarBg: string;
};

const INITIAL_CONTACTS: Contact[] = [
    {
        id: "CON/2026/001",
        name: "Mian Mansha",
        title: "Chief Executive Officer",
        company: "Nishat Mills & Banking Group",
        is_company: false,
        email: "mansha.office@nishat.net",
        phone: "+92 42 3574 6541",
        city: "Lahore",
        country: "Pakistan",
        type: "customer",
        revenue_spend: 185000,
        deals_count: 5,
        tags: ["Textile", "Enterprise", "VIP"],
        starred: true,
        avatarBg: "bg-blue-600"
    },
    {
        id: "CON/2026/002",
        name: "Systems Limited (Karachi Hub)",
        title: "IT & Digital Transformation Partner",
        company: "Systems Limited",
        is_company: true,
        email: "contact@systemsltd.com",
        phone: "+92 21 3454 9281",
        city: "Karachi",
        country: "Pakistan",
        type: "partner",
        revenue_spend: 92000,
        deals_count: 8,
        tags: ["Technology", "PSEB Member", "SAP"],
        starred: true,
        avatarBg: "bg-purple-600"
    },
    {
        id: "CON/2026/003",
        name: "Dr. Ayesha Malik",
        title: "Head of Hospital Informatics",
        company: "Shifa International Hospital",
        is_company: false,
        email: "ayesha.malik@shifa.com.pk",
        phone: "+92 51 846 3000",
        city: "Islamabad",
        country: "Pakistan",
        type: "customer",
        revenue_spend: 64000,
        deals_count: 3,
        tags: ["Healthcare", "ERP Redesign"],
        starred: false,
        avatarBg: "bg-emerald-600"
    },
    {
        id: "CON/2026/004",
        name: "Zebra Technologies Asia Supply",
        title: "Hardware & RFID Scanning Partner",
        company: "Zebra Technologies",
        is_company: true,
        email: "orders-apac@zebra.com",
        phone: "+971 4 390 1200",
        city: "Dubai",
        country: "UAE",
        type: "vendor",
        revenue_spend: 48000,
        deals_count: 12,
        tags: ["Hardware", "RFID", "Logistics"],
        starred: false,
        avatarBg: "bg-amber-600"
    },
    {
        id: "CON/2026/005",
        name: "Tariq Mansoor",
        title: "Managing Director",
        company: "Nexus Logistics & Freight",
        is_company: false,
        email: "tariq@nexusfreight.pk",
        phone: "+92 300 847 2910",
        city: "Faisalabad",
        country: "Pakistan",
        type: "lead",
        revenue_spend: 0,
        deals_count: 1,
        tags: ["Chamber Registered", "High Value"],
        starred: true,
        avatarBg: "bg-pink-600"
    },
    {
        id: "CON/2026/006",
        name: "Engro Polymer & Chemicals",
        title: "Petrochemicals Manufacturer",
        company: "Engro Corp",
        is_company: true,
        email: "procurement@engro.com",
        phone: "+92 21 111 211 211",
        city: "Karachi",
        country: "Pakistan",
        type: "customer",
        revenue_spend: 210000,
        deals_count: 4,
        tags: ["Manufacturing", "SupplyChain"],
        starred: false,
        avatarBg: "bg-teal-600"
    }
];

export default function ContactsPage() {
    const { activeBranch, getEntityStorageKey } = useBranchContext();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [currentView, setCurrentView] = useState<ViewType>("kanban");
    const [filterType, setFilterType] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Detail Drawer Modal
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

    // Create Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [newTitle, setNewTitle] = useState("");
    const [newCompany, setNewCompany] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newPhone, setNewPhone] = useState("+1 ");
    const [newCity, setNewCity] = useState(activeBranch?.location || "Main Office");
    const [newCountry, setNewCountry] = useState("USA");
    const [newType, setNewType] = useState<Contact["type"]>("customer");
    const [newIsCompany, setNewIsCompany] = useState(false);
    const [newTags, setNewTags] = useState("Verified");

    // Email Modal
    const [emailContact, setEmailContact] = useState<Contact | null>(null);
    const [emailSubject, setEmailSubject] = useState("");
    const [emailBody, setEmailBody] = useState("");

    const [toastMsg, setToastMsg] = useState("");

    // Entity-scoped data loading
    useEffect(() => {
        if (!activeBranch) return;
        const key = getEntityStorageKey("contacts");
        const saved = localStorage.getItem(key);
        if (saved) {
            try {
                setContacts(JSON.parse(saved));
            } catch {
                setContacts([]);
            }
        } else {
            // Newly created entity starts empty
            setContacts([]);
        }
    }, [activeBranch?.id]);

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(""), 5000);
    };

    const persistContacts = (updated: Contact[]) => {
        setContacts(updated);
        try {
            const key = getEntityStorageKey("contacts");
            localStorage.setItem(key, JSON.stringify(updated));
        } catch {}
    };

    const handleCreateContact = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim() || !newEmail.trim()) return;

        const colors = ["bg-blue-600", "bg-purple-600", "bg-emerald-600", "bg-amber-600", "bg-pink-600", "bg-teal-600", "bg-indigo-600"];
        const randomColor = colors[contacts.length % colors.length];

        const tagList = newTags.split(",").map(t => t.trim()).filter(Boolean);

        const newC: Contact = {
            id: `CON/2026/00${contacts.length + 1}`,
            name: newName.trim(),
            title: newTitle.trim() || "Executive",
            company: newCompany.trim() || newName.trim(),
            is_company: newIsCompany,
            email: newEmail.trim().toLowerCase(),
            phone: newPhone.trim(),
            city: newCity.trim(),
            country: newCountry.trim(),
            type: newType,
            revenue_spend: 0,
            deals_count: 0,
            tags: tagList.length > 0 ? tagList : ["Enterprise"],
            starred: false,
            avatarBg: randomColor
        };

        const updated = [newC, ...contacts];
        persistContacts(updated);
        setIsCreateModalOpen(false);
        setNewName("");
        setNewTitle("");
        setNewCompany("");
        setNewEmail("");
        setNewPhone("+1 ");
        showToast(`🎉 Contact "${newC.name}" added to directory!`);
    };

    const toggleStar = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = contacts.map(c => c.id === id ? { ...c, starred: !c.starred } : c);
        persistContacts(updated);
    };

    const handleSendEmail = (e: React.FormEvent) => {
        e.preventDefault();
        showToast(`🚀 Email dispatched to ${emailContact?.email}!`);
        setEmailContact(null);
        setEmailSubject("");
        setEmailBody("");
    };

    const filteredContacts = contacts.filter(c => {
        if (filterType !== "all" && c.type !== filterType) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return (
                c.name.toLowerCase().includes(q) ||
                c.company.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q) ||
                c.city.toLowerCase().includes(q)
            );
        }
        return true;
    });

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Contacts"
                moduleIcon={<Users size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search contacts by name, company, email, city..."
                onNewClick={() => setIsCreateModalOpen(true)}
                newButtonText="New Contact"
            />

            <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
                {/* Hero Header */}
                <div className="bg-gradient-to-r from-purple-900/40 via-[#1E293B] to-blue-900/30 border border-purple-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                        <div className="space-y-2 max-w-2xl">
                            <div className="flex items-center gap-2">
                                <span className="p-2 bg-purple-500/20 text-purple-400 rounded-xl">
                                    <Users size={22} />
                                </span>
                                <h2 className="text-2xl font-bold text-white tracking-tight">
                                    Enterprise Contacts & Client Directory
                                </h2>
                            </div>
                            <p className="text-xs md:text-sm text-gray-300">
                                Unified corporate directory with verified phone numbers, 1-click WhatsApp messaging, invoice history, and deals pipeline.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-3 rounded-2xl text-xs md:text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-95"
                            >
                                <Plus size={16} />
                                <span>Add New Contact</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Toast Notification */}
                {toastMsg && (
                    <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold flex items-center justify-between shadow-lg backdrop-blur-md animate-in fade-in">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={18} />
                            <span>{toastMsg}</span>
                        </div>
                        <button onClick={() => setToastMsg("")} className="text-gray-400 hover:text-white cursor-pointer">
                            ✕
                        </button>
                    </div>
                )}

                {/* Filters & View Switcher */}
                <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        {["all", "customer", "partner", "vendor", "lead"].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                                    filterType === type
                                        ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                                        : "bg-[#1E293B] text-gray-400 hover:text-white border border-gray-700/60"
                                }`}
                            >
                                {type === "all" ? "All Directory" : `${type}s`}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <ViewSwitcher
                            currentView={currentView}
                            availableViews={["kanban", "list"]}
                            onViewChange={setCurrentView}
                        />
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* CARDS / KANBAN VIEW                                                       */}
                {/* ========================================================================= */}
                {currentView === "kanban" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredContacts.map((contact) => (
                            <div
                                key={contact.id}
                                onClick={() => setSelectedContact(contact)}
                                className="bg-[#1E293B] border border-gray-700 hover:border-purple-500/60 rounded-2xl p-6 transition-all group shadow-xl flex flex-col justify-between space-y-4 cursor-pointer hover:shadow-2xl"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-11 h-11 rounded-2xl ${contact.avatarBg} text-white font-bold text-sm flex items-center justify-center shadow-md`}>
                                                {contact.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-base group-hover:text-purple-300 transition-colors line-clamp-1">
                                                    {contact.name}
                                                </h3>
                                                <span className="text-xs text-gray-400 font-medium line-clamp-1">
                                                    {contact.title}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={(e) => toggleStar(contact.id, e)}
                                            className="text-gray-500 hover:text-amber-400 p-1"
                                        >
                                            <Star size={16} className={contact.starred ? "fill-amber-400 text-amber-400" : ""} />
                                        </button>
                                    </div>

                                    <div className="bg-[#0F172A] p-3 rounded-xl border border-gray-800 space-y-1.5 text-xs">
                                        <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                                            <Building2 size={13} />
                                            <span>{contact.company}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400 text-[11px]">
                                            <MapPin size={13} className="text-purple-400" />
                                            <span>{contact.city}, {contact.country}</span>
                                        </div>
                                    </div>

                                    {/* Direct Phone & Email info */}
                                    <div className="text-xs text-gray-300 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Phone size={12} className="text-emerald-400" />
                                            <span className="font-mono text-[11px]">{contact.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400 text-[11px]">
                                            <Mail size={12} className="text-purple-400" />
                                            <span className="truncate">{contact.email}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Direct Action Toolbar */}
                                <div className="pt-3 border-t border-gray-800 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                                    <a
                                        href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, "")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                                        title="Instant WhatsApp Chat"
                                    >
                                        <MessageCircle size={14} /> WhatsApp
                                    </a>

                                    <button
                                        onClick={() => {
                                            setEmailContact(contact);
                                            setEmailSubject(`Inquiry regarding ${contact.company} and Beraxis ERP`);
                                        }}
                                        className="bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                                    >
                                        <Mail size={14} /> Email
                                    </button>

                                    <a
                                        href={`tel:${contact.phone}`}
                                        className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                                        title="Direct Call"
                                    >
                                        <Phone size={14} />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ========================================================================= */}
                {/* LIST VIEW                                                                 */}
                {/* ========================================================================= */}
                {currentView === "list" && (
                    <div className="bg-[#1E293B] rounded-2xl border border-gray-700 overflow-hidden shadow-xl">
                        <table className="w-full text-xs md:text-sm">
                            <thead className="bg-[#0F172A] border-b border-gray-700 text-left text-gray-400 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3.5">Name & Title</th>
                                    <th className="px-4 py-3.5">Company</th>
                                    <th className="px-4 py-3.5">Phone Number</th>
                                    <th className="px-4 py-3.5">Email</th>
                                    <th className="px-4 py-3.5">Location</th>
                                    <th className="px-4 py-3.5">Type</th>
                                    <th className="px-4 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredContacts.map(contact => (
                                    <tr
                                        key={contact.id}
                                        onClick={() => setSelectedContact(contact)}
                                        className="border-b border-gray-800 hover:bg-white/5 transition-colors cursor-pointer"
                                    >
                                        <td className="px-4 py-3.5">
                                            <div className="font-bold text-white flex items-center gap-2">
                                                <span>{contact.name}</span>
                                                {contact.starred && <Star size={12} className="fill-amber-400 text-amber-400" />}
                                            </div>
                                            <div className="text-[11px] text-gray-400">{contact.title}</div>
                                        </td>
                                        <td className="px-4 py-3.5 text-cyan-400 font-medium">{contact.company}</td>
                                        <td className="px-4 py-3.5 font-mono text-emerald-400">{contact.phone}</td>
                                        <td className="px-4 py-3.5 text-gray-300">{contact.email}</td>
                                        <td className="px-4 py-3.5 text-gray-400">{contact.city}, {contact.country}</td>
                                        <td className="px-4 py-3.5">
                                            <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-purple-500/20 text-purple-300">
                                                {contact.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2">
                                                <a
                                                    href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, "")}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors"
                                                    title="WhatsApp"
                                                >
                                                    <MessageCircle size={15} />
                                                </a>
                                                <button
                                                    onClick={() => setEmailContact(contact)}
                                                    className="p-1.5 text-purple-400 hover:bg-purple-500/20 rounded-lg transition-colors"
                                                    title="Send Email"
                                                >
                                                    <Mail size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Empty State */}
                {filteredContacts.length === 0 && (
                    <div className="bg-[#1E293B]/60 border border-dashed border-gray-700/80 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-xl">
                        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shadow-inner">
                            <Users size={32} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-white">No Contacts in This Entity Yet</h3>
                            <p className="text-xs text-gray-400 max-w-sm">
                                {activeBranch?.name ? `Your directory for "${activeBranch.name}" is currently clean with zero cross-tenant records.` : "Start by adding your first business contact, partner, or customer."}
                            </p>
                        </div>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-purple-600/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                        >
                            <Plus size={16} /> Add First Contact
                        </button>
                    </div>
                )}
            </div>

            {/* ========================================================================= */}
            {/* CONTACT DETAIL DRAWER / MODAL                                             */}
            {/* ========================================================================= */}
            {selectedContact && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0F172A] border border-gray-700 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-start justify-between border-b border-gray-800 pb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-2xl ${selectedContact.avatarBg} text-white font-bold text-base flex items-center justify-center shadow-lg`}>
                                    {selectedContact.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">{selectedContact.name}</h3>
                                    <p className="text-xs text-cyan-400 font-medium">{selectedContact.title} at {selectedContact.company}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedContact(null)}
                                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Revenue & Deals */}
                        <div className="grid grid-cols-2 gap-3 bg-[#1E293B] p-4 rounded-2xl border border-gray-800 text-xs">
                            <div>
                                <span className="text-[10px] text-gray-400 uppercase font-semibold block">Total Revenue / Spend</span>
                                <span className="text-lg font-bold text-emerald-400 font-mono">${(selectedContact.revenue_spend || 0).toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-400 uppercase font-semibold block">CRM Deals & Pipelines</span>
                                <span className="text-lg font-bold text-purple-400 font-mono">{selectedContact.deals_count || 1} Active</span>
                            </div>
                        </div>

                        {/* Contact info list */}
                        <div className="space-y-3 bg-[#1E293B] p-4 rounded-2xl border border-gray-800 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400">Direct Telephone</span>
                                <span className="font-bold text-white font-mono">{selectedContact.phone}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400">Work Email</span>
                                <span className="font-bold text-white">{selectedContact.email}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400">Headquarters</span>
                                <span className="font-bold text-white">{selectedContact.city}, {selectedContact.country}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400">Account Type</span>
                                <span className="font-bold text-purple-300 capitalize">{selectedContact.type}</span>
                            </div>
                        </div>

                        {/* Quick outreach buttons */}
                        <div className="flex gap-3 pt-2">
                            <a
                                href={`https://wa.me/${selectedContact.phone.replace(/[^0-9]/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
                            >
                                <MessageCircle size={15} /> WhatsApp
                            </a>
                            <button
                                onClick={() => {
                                    setEmailContact(selectedContact);
                                    setSelectedContact(null);
                                }}
                                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer"
                            >
                                <Mail size={15} /> Send Email
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* SEND EMAIL MODAL                                                          */}
            {/* ========================================================================= */}
            {emailContact && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0F172A] border border-gray-700 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base">Direct Email Composer</h3>
                                    <p className="text-xs text-gray-400">Send message to {emailContact.name} ({emailContact.email})</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setEmailContact(null)}
                                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSendEmail} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-gray-300 font-semibold mb-1">Subject *</label>
                                <input
                                    type="text"
                                    required
                                    value={emailSubject}
                                    onChange={(e) => setEmailSubject(e.target.value)}
                                    placeholder="e.g. Beraxis ERP Demo & Proposal"
                                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-300 font-semibold mb-1">Email Body *</label>
                                <textarea
                                    rows={5}
                                    required
                                    value={emailBody}
                                    onChange={(e) => setEmailBody(e.target.value)}
                                    placeholder={`Dear ${emailContact.name},\n\nThank you for reaching out regarding our ERP and CRM solutions...`}
                                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEmailContact(null)}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-2.5 rounded-xl font-semibold transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Send size={14} /> Send Email
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* CREATE CONTACT MODAL                                                      */}
            {/* ========================================================================= */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0F172A] border border-gray-700 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl">
                                    <Users size={22} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base">Add New Contact</h3>
                                    <p className="text-xs text-gray-400">Save client, vendor, or prospect executive to directory</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateContact} className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">Full Name / Entity *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        placeholder="e.g. Mian Mansha"
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">Job Title</label>
                                    <input
                                        type="text"
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        placeholder="e.g. Managing Director"
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">Company Name</label>
                                    <input
                                        type="text"
                                        value={newCompany}
                                        onChange={(e) => setNewCompany(e.target.value)}
                                        placeholder="e.g. Nishat Mills"
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">Relationship Type</label>
                                    <select
                                        value={newType}
                                        onChange={(e) => setNewType(e.target.value as any)}
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                                    >
                                        <option value="customer">Customer / Client</option>
                                        <option value="partner">Technology Partner</option>
                                        <option value="vendor">Vendor / Supplier</option>
                                        <option value="lead">Prospect Lead</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">Email Address *</label>
                                    <input
                                        type="email"
                                        required
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        placeholder="e.g. mansha@nishat.net"
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">Direct Phone / WhatsApp *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newPhone}
                                        onChange={(e) => setNewPhone(e.target.value)}
                                        placeholder="e.g. +92 300 1234567"
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">City</label>
                                    <input
                                        type="text"
                                        value={newCity}
                                        onChange={(e) => setNewCity(e.target.value)}
                                        placeholder="e.g. Lahore"
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">Country</label>
                                    <input
                                        type="text"
                                        value={newCountry}
                                        onChange={(e) => setNewCountry(e.target.value)}
                                        placeholder="e.g. Pakistan"
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-2.5 rounded-xl font-semibold transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-95"
                                >
                                    Save Contact
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
