"use client";

import KnowledgeHeader from "@/components/knowledge/KnowledgeHeader";
import { useEffect, useState } from "react";
import { Plus, BookOpen, FileText } from "lucide-react";

type Article = {
    id: string;
    title: string;
    category: string;
    created_at: string;
};

export default function KnowledgePage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newCategory, setNewCategory] = useState("General");

    useEffect(() => {
        fetch("http://localhost:8000/api/v1/knowledge/articles")
            .then((r) => r.json())
            .then(setArticles)
            .catch(console.error);
    }, []);

    const createArticle = async () => {
        if (!newTitle.trim()) return;
        const res = await fetch("http://localhost:8000/api/v1/knowledge/articles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newTitle, category: newCategory }),
        });
        if (res.ok) {
            const article = await res.json();
            setArticles([...articles, article]);
            setNewTitle("");
            setIsModalOpen(false);
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <KnowledgeHeader />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-200">Knowledge Base</h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-1.5 rounded flex items-center gap-1"
                    >
                        <Plus size={16} /> New Article
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {articles.map((article) => (
                        <div
                            key={article.id}
                            className="bg-[#1E293B] border border-gray-700 rounded-lg p-6 hover:border-teal-500 transition-colors group cursor-pointer"
                        >
                            <div className="flex items-start gap-3 mb-4">
                                <div className="bg-teal-500/20 p-2 rounded text-teal-500">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h3 className="font-medium text-white line-clamp-2">{article.title}</h3>
                                    <p className="text-xs text-gray-400 mt-1">{article.category}</p>
                                </div>
                            </div>
                            <div className="text-xs text-gray-500">
                                Created: {new Date(article.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    ))}

                    {articles.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No articles found. Create one to share knowledge.
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-[#1E293B] rounded-lg p-6 w-full max-w-md border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Create Article</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-teal-500"
                                    placeholder="e.g. How to configure VPN"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                                <select
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-teal-500"
                                >
                                    <option value="General">General</option>
                                    <option value="Technical">Technical</option>
                                    <option value="HR">HR</option>
                                    <option value="Sales">Sales</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-300 hover:text-white">Cancel</button>
                            <button onClick={createArticle} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded">Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
