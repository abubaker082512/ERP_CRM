"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { useState } from "react";
import { BookOpen, FileText, Star, Eye, Clock } from "lucide-react";

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
    status: string;
};

const mockArticles: Article[] = [
    { id: "KB/001", title: "How to create a new Sales Order", category: "Sales Playbook", author: "John Doe", updated: "2025-12-01", views: 1245, status: "published" },
    { id: "KB/002", title: "Employee Onboarding Checklist", category: "HR Policies", author: "Jane Smith", updated: "2025-11-28", views: 980, status: "published" },
    { id: "KB/003", title: "Setting up VPN Access", category: "IT Support", author: "Bob Wilson", updated: "2025-12-02", views: 850, status: "draft" },
];

export default function KnowledgeArticlesPage() {
    const [articles] = useState<Article[]>(mockArticles);
    const [currentView, setCurrentView] = useState<ViewType>("list");

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Knowledge"
                moduleIcon={<BookOpen size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search articles..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-200">Articles</h2>
                            <p className="text-sm text-gray-400 mt-1">{articles.length} articles found</p>
                        </div>
                        <ViewSwitcher
                            currentView={currentView}
                            availableViews={["list", "kanban"]}
                            onViewChange={setCurrentView}
                        />
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2">
                        <FileText size={18} /> New Article
                    </button>
                </div>

                {currentView === "list" && (
                    <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-[#0F172A] border-b border-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Title</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Category</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Author</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Last Updated</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Views</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {articles.map(article => (
                                    <tr key={article.id} className="border-b border-gray-700 hover:bg-[#1E293B] transition-colors">
                                        <td className="px-4 py-3 font-medium text-white">{article.title}</td>
                                        <td className="px-4 py-3 text-gray-300">{article.category}</td>
                                        <td className="px-4 py-3 text-gray-300">{article.author}</td>
                                        <td className="px-4 py-3 text-gray-400">{new Date(article.updated).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-gray-400">{article.views}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${article.status === 'published' ? 'bg-green-500/20 text-green-400' :
                                                    'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                {article.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button className="text-blue-400 hover:text-blue-300 text-sm">Edit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {currentView === "kanban" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {articles.map(article => (
                            <div key={article.id} className="bg-[#1E293B] border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-all group cursor-pointer">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`px-2 py-1 rounded text-xs font-medium ${article.status === 'published' ? 'bg-green-500/20 text-green-400' :
                                            'bg-yellow-500/20 text-yellow-400'
                                        }`}>
                                        {article.status}
                                    </div>
                                    <Star size={16} className="text-gray-500 hover:text-yellow-400" />
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
                )}
            </div>
        </div>
    );
}
