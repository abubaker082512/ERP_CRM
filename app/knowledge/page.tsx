"use client";
import { fetchAPI } from '@/lib/api';

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { BookOpen, Search, Star, Folder, FileText, ChevronRight } from "lucide-react";

const MENU_ITEMS = [
    { name: "Dashboard", href: "/knowledge" },
    { name: "Articles", href: "/knowledge/articles" },
    { name: "Favorites", href: "/knowledge/favorites" },
    { name: "Configuration", href: "/knowledge/configuration" },
];

type Category = {
    id: string;
    name: string;
    articles: number;
    icon: any;
    color: string;
};

const categories: Category[] = [
    { id: "CAT/001", name: "Internal Procedures", articles: 12, icon: FileText, color: "text-blue-400" },
    { id: "CAT/002", name: "Sales Playbook", articles: 8, icon: Folder, color: "text-green-400" },
    { id: "CAT/003", name: "HR Policies", articles: 15, icon: BookOpen, color: "text-purple-400" },
    { id: "CAT/004", name: "IT Support", articles: 24, icon: FileText, color: "text-red-400" },
];

export default function KnowledgePage() {
    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Knowledge"
                moduleIcon={<BookOpen size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search knowledge base..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl font-bold text-white mb-4">How can we help you?</h1>
                        <div className="relative max-w-xl mx-auto">
                            <input
                                type="text"
                                placeholder="Search for articles, guides, and docs..."
                                className="w-full bg-[#1E293B] border border-gray-700 text-white rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-200 mb-4">Browse by Category</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {categories.map(cat => (
                                <div key={cat.id} className="bg-[#1E293B] border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-all cursor-pointer group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-lg bg-gray-800 ${cat.color}`}>
                                                <cat.icon size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white text-lg group-hover:text-blue-400 transition-colors">{cat.name}</h3>
                                                <p className="text-sm text-gray-400">{cat.articles} articles</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="text-gray-500 group-hover:text-white transition-colors" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-gray-200 mb-4">Popular Articles</h2>
                        <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-hidden">
                            {[
                                { title: "How to create a new Sales Order", views: 1245, category: "Sales Playbook" },
                                { title: "Employee Onboarding Checklist", views: 980, category: "HR Policies" },
                                { title: "Setting up VPN Access", views: 850, category: "IT Support" },
                                { title: "Expense Reimbursement Policy", views: 720, category: "Internal Procedures" },
                            ].map((article, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 border-b border-gray-700 last:border-0 hover:bg-[#2D3748] transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <FileText size={18} className="text-gray-400" />
                                        <span className="text-gray-200 hover:text-blue-400 font-medium">{article.title}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span>{article.category}</span>
                                        <span>{article.views} views</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
