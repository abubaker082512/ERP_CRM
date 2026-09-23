"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { BookOpen, Star, FileText, Eye, Clock } from "lucide-react";

const MENU_ITEMS = [
    { name: "Dashboard", href: "/knowledge" },
    { name: "Articles", href: "/knowledge/articles" },
    { name: "Favorites", href: "/knowledge/favorites" },
    { name: "Configuration", href: "/knowledge/configuration" },
];

type Article = {
    id: string;
    title: string;
    category: string;
    author: string;
    updated: string;
    views: number;
};

const mockFavorites: Article[] = [
    { id: "KB/001", title: "How to create a new Sales Order", category: "Sales Playbook", author: "John Doe", updated: "2025-12-01", views: 1245 },
    { id: "KB/004", title: "Company Holiday Calendar 2025", category: "HR Policies", author: "Jane Smith", updated: "2025-11-15", views: 2500 },
];

export default function KnowledgeFavoritesPage() {
    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Knowledge"
                moduleIcon={<BookOpen size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search favorites..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-200">Favorite Articles</h2>
                            <p className="text-sm text-gray-400 mt-1">{mockFavorites.length} saved articles</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockFavorites.map(article => (
                        <div key={article.id} className="bg-[#1E293B] border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-all group cursor-pointer">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <FileText size={20} className="text-blue-400" />
                                </div>
                                <Star size={20} className="text-yellow-400 fill-yellow-400" />
                            </div>

                            <h3 className="font-semibold text-white text-lg mb-2 group-hover:text-blue-400 transition-colors">{article.title}</h3>
                            <p className="text-sm text-gray-400 mb-4">{article.category}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-700 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Clock size={12} />
                                    {new Date(article.updated).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Eye size={12} />
                                    {article.views}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
