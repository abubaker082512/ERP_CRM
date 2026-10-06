"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { useState } from "react";
import {
    BookOpen,
    Search,
    Star,
    Folder,
    FileText,
    ChevronRight,
    Plus,
    X,
    CheckCircle2,
    Eye,
    Clock,
    User,
    Tag,
    Share2,
    Bookmark,
    Sparkles,
    Shield,
    Layers,
    Copy,
    ArrowRight
} from "lucide-react";

const MENU_ITEMS = [
    { name: "Knowledge Hub", href: "/knowledge" },
    { name: "Articles", href: "/knowledge/articles" },
    { name: "Favorites", href: "/knowledge/favorites" },
    { name: "Configuration", href: "/knowledge/configuration" },
];

export type Article = {
    id: string;
    title: string;
    category: "Engineering & Arch" | "ERP & Accounting" | "Sales & Leads" | "HR & Policies" | "IT & Security";
    author: string;
    authorRole: string;
    readTime: string;
    views: number;
    updatedAt: string;
    summary: string;
    content: string;
    tags: string[];
    isStarred?: boolean;
};

const INITIAL_ARTICLES: Article[] = [
    {
        id: "KB/001",
        title: "Multi-Tenant PostgreSQL Row-Level Security (RLS) Architecture Guide",
        category: "Engineering & Arch",
        author: "Salim Ghauri",
        authorRole: "Principal Architect",
        readTime: "6 min read",
        views: 1420,
        updatedAt: "2026-03-05",
        summary: "Step-by-step breakdown of how Beraxis isolates company tenant data using PostgreSQL RLS and FastAPI session claims.",
        content: `### Overview
Beraxis utilizes PostgreSQL Row-Level Security (RLS) to enforce multi-tenant data boundaries at the database kernel level.

### Key Policies
1. **Tenant ID Injection**: Every authenticated JWT bearer token contains the 'workspace_id' claim.
2. **PostgreSQL Session Context**:
\`\`\`sql
SET LOCAL app.current_tenant = 'tenant_123';
SELECT * FROM sales_orders WHERE tenant_id = current_setting('app.current_tenant');
\`\`\`

3. **Zero Data Leakage**: Even in complex multi-table joins or bulk reporting aggregations, records from external organizations are strictly pruned.`,
        tags: ["PostgreSQL", "RLS", "Security", "Backend"]
    },
    {
        id: "KB/002",
        title: "How to Reconcile Bank Statements & FBR Tax Settlements in Beraxis Accounting",
        category: "ERP & Accounting",
        author: "Bilal Mahmood",
        authorRole: "ERP Specialist & Controller",
        readTime: "8 min read",
        views: 2150,
        updatedAt: "2026-03-02",
        summary: "Standard operating procedure for automatic bank statement reconciliation, vendor 3-way matching, and GST audit logs.",
        content: `### Accounting SOP
Follow these steps to complete weekly journal closing and tax settlement in Beraxis:

1. Navigate to **Accounting > Operations > Bank Reconciliation**.
2. Upload your standard MT940 / CSV banking ledger.
3. Beraxis will auto-match invoice references against customer payments.
4. Verify remaining unmatched variances and post to General Operations journal.
5. Export FBR Tax Breakdown directly to Excel or PDF for audit compliance.`,
        tags: ["Accounting", "Tax", "Reconciliation", "Finance"]
    },
    {
        id: "KB/003",
        title: "Live Lead Scraping & Multi-Channel Phone Verification Playbook",
        category: "Sales & Leads",
        author: "Sarah Vance",
        authorRole: "Lead UI/UX Designer",
        readTime: "5 min read",
        views: 1890,
        updatedAt: "2026-02-28",
        summary: "Best practices for utilizing the Beraxis live scraper, chamber registries, and direct 1-click WhatsApp outreach.",
        content: `### Lead Conversion Best Practices
1. **Filter by Sector**: Use the Leads Pool dropdown to filter by target industry (e.g. Textile, IT Exporters, Pharmaceutical).
2. **Real Phone Verification**: Numbers extracted from Chamber of Commerce & PSEB registries include standard country code (+92).
3. **1-Click WhatsApp Pitch**: Use the green WhatsApp button to launch an instant tailored discovery message without manual saving.`,
        tags: ["CRM", "Leads", "Sales", "Playbook"]
    },
    {
        id: "KB/004",
        title: "Zebra RFID Handheld Scanner Setup for Multi-Warehouse Automation",
        category: "IT & Security",
        author: "Bob Wilson",
        authorRole: "Supply Chain Engineer",
        readTime: "7 min read",
        views: 940,
        updatedAt: "2026-02-25",
        summary: "Hardware configuration, WebSocket listeners, and batch inventory stock ledger synchronization.",
        content: `### Hardware Deployment
Connect Zebra Android / TC52 handheld scanners to Beraxis Inventory:
1. Configure scanner DataWedge profile to emit JSON payload over TCP Port 8088.
2. The Beraxis background daemon receives barcode and RFID tag epc events in real-time (<50ms latency).
3. Stock pickings automatically advance from 'Waiting' to 'Delivered'.`,
        tags: ["Inventory", "RFID", "Warehouse", "Zebra"]
    }
];

export default function KnowledgePage() {
    const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Read Article Drawer Modal
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

    // Create Article Modal
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newCategory, setNewCategory] = useState<Article["category"]>("Engineering & Arch");
    const [newAuthor, setNewAuthor] = useState("Salim Ghauri");
    const [newSummary, setNewSummary] = useState("");
    const [newContent, setNewContent] = useState("");
    const [newTags, setNewTags] = useState("Guide, SOP");

    const [toastMsg, setToastMsg] = useState("");

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(""), 5000);
    };

    const handleCreateArticle = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() || !newContent.trim()) return;

        const tagList = newTags.split(",").map(t => t.trim()).filter(Boolean);

        const newArt: Article = {
            id: `KB/00${articles.length + 1}`,
            title: newTitle.trim(),
            category: newCategory,
            author: newAuthor,
            authorRole: newAuthor.includes("Salim") ? "Principal Architect" : "ERP Specialist",
            readTime: "4 min read",
            views: 1,
            updatedAt: new Date().toISOString().slice(0, 10),
            summary: newSummary.trim() || newTitle.trim(),
            content: newContent.trim(),
            tags: tagList.length > 0 ? tagList : ["Documentation"]
        };

        setArticles([newArt, ...articles]);
        setIsCreateModalOpen(false);
        setNewTitle("");
        setNewSummary("");
        setNewContent("");
        showToast(`🎉 Knowledge Base Article "${newArt.title}" published!`);
    };

    const toggleBookmark = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setArticles(articles.map(a => a.id === id ? { ...a, isStarred: !a.isStarred } : a));
    };

    const filteredArticles = articles.filter(a => {
        if (selectedCategory !== "all" && a.category !== selectedCategory) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return (
                a.title.toLowerCase().includes(q) ||
                a.summary.toLowerCase().includes(q) ||
                a.tags.some(t => t.toLowerCase().includes(q))
            );
        }
        return true;
    });

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Knowledge"
                moduleIcon={<BookOpen size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search knowledge base articles, guides, policies..."
                onNewClick={() => setIsCreateModalOpen(true)}
                newButtonText="New Article"
            />

            <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
                {/* Hero Search Banner */}
                <div className="bg-gradient-to-r from-emerald-900/40 via-[#1E293B] to-cyan-900/30 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                        <div className="space-y-3 max-w-2xl">
                            <div className="flex items-center gap-2">
                                <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                                    <BookOpen size={22} />
                                </span>
                                <h2 className="text-2xl font-bold text-white tracking-tight">
                                    Enterprise Knowledge Base & SOP Wiki
                                </h2>
                            </div>
                            <p className="text-xs md:text-sm text-gray-300">
                                Centralized engineering guides, ERP accounting workflows, sales scripts, and organizational policies for your team.
                            </p>

                            {/* Search bar inside banner */}
                            <div className="relative max-w-xl">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by topic, keyword (e.g. 'RLS', 'Tax', 'RFID')..."
                                    className="w-full bg-[#0F172A]/90 border border-white/10 text-white rounded-2xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:border-emerald-500 shadow-inner"
                                />
                                <Search className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
                            </div>
                        </div>

                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-2xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
                        >
                            <Plus size={16} />
                            <span>Create New Article</span>
                        </button>
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

                {/* Category Filter Tabs */}
                <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        {["all", "Engineering & Arch", "ERP & Accounting", "Sales & Leads", "IT & Security"].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    selectedCategory === cat
                                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                                        : "bg-[#1E293B] text-gray-400 hover:text-white border border-gray-700/60"
                                }`}
                            >
                                {cat === "all" ? "All Categories" : cat}
                            </button>
                        ))}
                    </div>

                    <span className="text-xs text-gray-400 font-semibold">
                        {filteredArticles.length} Documentation Articles
                    </span>
                </div>

                {/* Article Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredArticles.map((article) => (
                        <div
                            key={article.id}
                            onClick={() => setSelectedArticle(article)}
                            className="bg-[#1E293B] border border-gray-700 hover:border-emerald-500/60 rounded-2xl p-6 transition-all group shadow-xl flex flex-col justify-between space-y-4 cursor-pointer hover:shadow-2xl"
                        >
                            <div className="space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                        {article.category}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                                            <Clock size={12} /> {article.readTime}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={(e) => toggleBookmark(article.id, e)}
                                            className="text-gray-500 hover:text-amber-400 p-1 rounded hover:bg-white/5 transition-colors"
                                        >
                                            <Bookmark size={15} className={article.isStarred ? "fill-amber-400 text-amber-400" : ""} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                                    {article.title}
                                </h3>

                                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                                    {article.summary}
                                </p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {article.tags.map((t, idx) => (
                                        <span key={idx} className="text-[10px] bg-white/5 text-gray-300 px-2 py-0.5 rounded-md font-medium">
                                            #{t}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Author & Read button */}
                            <div className="pt-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                                        {article.author.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-200 text-[11px]">{article.author}</div>
                                        <div className="text-[9px] text-gray-500">{article.authorRole}</div>
                                    </div>
                                </div>

                                <span className="text-emerald-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                    Read Article <ArrowRight size={13} />
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ========================================================================= */}
            {/* ARTICLE READER DRAWER / MODAL                                             */}
            {/* ========================================================================= */}
            {selectedArticle && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0F172A] border border-gray-700 rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-start justify-between border-b border-gray-800 pb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                        {selectedArticle.category}
                                    </span>
                                    <span className="text-xs text-gray-500">•</span>
                                    <span className="text-xs text-gray-400 font-mono">{selectedArticle.id}</span>
                                </div>
                                <h2 className="text-xl md:text-2xl font-bold text-white">{selectedArticle.title}</h2>
                            </div>
                            <button
                                onClick={() => setSelectedArticle(null)}
                                className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Author info */}
                        <div className="flex items-center justify-between bg-[#1E293B] p-3.5 rounded-2xl border border-gray-800 text-xs">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center">
                                    {selectedArticle.author.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-white">{selectedArticle.author}</div>
                                    <div className="text-[11px] text-gray-400">{selectedArticle.authorRole}</div>
                                </div>
                            </div>
                            <div className="text-right text-gray-400 text-[11px]">
                                <div>Updated: {selectedArticle.updatedAt}</div>
                                <div className="text-emerald-400 font-semibold">{selectedArticle.views} Views</div>
                            </div>
                        </div>

                        {/* Markdown / Body content */}
                        <div className="prose prose-invert max-w-none text-xs md:text-sm text-gray-300 leading-relaxed space-y-4 whitespace-pre-wrap bg-[#1E293B]/60 p-5 rounded-2xl border border-gray-800 font-sans">
                            {selectedArticle.content}
                        </div>

                        {/* Tags & Actions */}
                        <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
                            <div className="flex flex-wrap gap-1.5">
                                {selectedArticle.tags.map((t, idx) => (
                                    <span key={idx} className="text-xs bg-white/5 text-gray-400 px-2 py-1 rounded-lg">
                                        #{t}
                                    </span>
                                ))}
                            </div>
                            <button
                                onClick={() => setSelectedArticle(null)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-xl text-xs transition-all cursor-pointer"
                            >
                                Close Article
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* CREATE ARTICLE MODAL                                                      */}
            {/* ========================================================================= */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0F172A] border border-gray-700 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
                                    <BookOpen size={22} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base">Create Documentation Article</h3>
                                    <p className="text-xs text-gray-400">Publish guides, architecture SOPs, and policies to team wiki</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateArticle} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-gray-300 font-semibold mb-1">Article Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="e.g. Setting Up Redis Cache for Leads Pool"
                                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">Category</label>
                                    <select
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value as any)}
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                                    >
                                        <option value="Engineering & Arch">Engineering & Arch</option>
                                        <option value="ERP & Accounting">ERP & Accounting</option>
                                        <option value="Sales & Leads">Sales & Leads</option>
                                        <option value="HR & Policies">HR & Policies</option>
                                        <option value="IT & Security">IT & Security</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">Author</label>
                                    <select
                                        value={newAuthor}
                                        onChange={(e) => setNewAuthor(e.target.value)}
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                                    >
                                        <option value="Salim Ghauri">Salim Ghauri (Principal Architect)</option>
                                        <option value="Sarah Vance">Sarah Vance (Lead UI/UX)</option>
                                        <option value="Bilal Mahmood">Bilal Mahmood (ERP Specialist)</option>
                                        <option value="Jane Smith">Jane Smith (Mobile Lead)</option>
                                        <option value="Bob Wilson">Bob Wilson (Supply Chain Engineer)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-300 font-semibold mb-1">Executive Summary</label>
                                <textarea
                                    rows={2}
                                    value={newSummary}
                                    onChange={(e) => setNewSummary(e.target.value)}
                                    placeholder="Brief overview explaining what this SOP or guide covers..."
                                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-300 font-semibold mb-1">Article Body / Markdown Content *</label>
                                <textarea
                                    rows={6}
                                    required
                                    value={newContent}
                                    onChange={(e) => setNewContent(e.target.value)}
                                    placeholder="Write step-by-step instructions, code snippets, or policies..."
                                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 font-mono text-xs focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-300 font-semibold mb-1">Tags (Comma Separated)</label>
                                <input
                                    type="text"
                                    value={newTags}
                                    onChange={(e) => setNewTags(e.target.value)}
                                    placeholder="e.g. Architecture, Cache, Backend"
                                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                                />
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
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
                                >
                                    Publish Article
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
