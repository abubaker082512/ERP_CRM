"use client";
import { fetchAPI } from "@/lib/api";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppHeader from "@/components/layout/AppHeader";
import { ArrowLeft, Edit3, Trash2, Save, X, BookOpen, Clock, Tag } from "lucide-react";

type Article = {
    id: string;
    title: string;
    body: string;
    category: string;
    is_published: boolean;
    updated_at: string;
};

export default function ArticleDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    
    // Form fields
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [category, setCategory] = useState("General");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!id) return;
        fetchArticle();
    }, [id]);

    const fetchArticle = async () => {
        try {
            const res = await fetchAPI(`/knowledge/articles/${id}`);
            if (res.ok) {
                const data = await res.json();
                setArticle(data);
                setTitle(data.title);
                setBody(data.body || "");
                setCategory(data.category || "General");
            } else {
                router.push("/knowledge");
            }
        } catch (e) {
            console.error("Failed to load article", e);
            router.push("/knowledge");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveUpdates = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setSaving(true);
        try {
            const res = await fetchAPI(`/knowledge/articles/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    body,
                    category
                })
            });

            if (res.ok) {
                const updated = await res.json();
                setArticle(updated);
                setEditing(false);
            }
        } catch (e) {
            console.error("Failed to save article edits", e);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteArticle = async () => {
        if (!confirm("Are you sure you want to delete this article permanently?")) return;
        try {
            const res = await fetchAPI(`/knowledge/articles/${id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                router.push("/knowledge");
            }
        } catch (e) {
            console.error("Failed to delete article", e);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-[#0F172A]">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!article) return null;

    return (
        <div className="flex flex-col h-screen bg-[#0B101E] text-white">
            <AppHeader title="Knowledge Article" />

            <div className="flex-1 overflow-auto p-6 max-w-4xl mx-auto w-full">
                {/* Header Back & Actions */}
                <div className="flex justify-between items-center mb-8 shrink-0">
                    <div className="flex items-center gap-3">
                        <Link href="/knowledge" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/5 shadow-inner">
                            <ArrowLeft size={18} />
                        </Link>
                        <div>
                            <span className="text-[10px] font-bold text-teal-400 bg-teal-500/15 px-2 py-0.5 rounded border border-teal-500/20 uppercase tracking-widest">{article.category}</span>
                            <h2 className="text-sm text-gray-500 font-medium mt-1 flex items-center gap-1.5">
                                <Clock size={12} /> Updated {new Date(article.updated_at).toLocaleDateString()}
                            </h2>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        {!editing ? (
                            <>
                                <button 
                                    onClick={() => setEditing(true)}
                                    className="p-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl border border-white/5 transition-all text-sm font-semibold flex items-center gap-2"
                                >
                                    <Edit3 size={16} /> Edit
                                </button>
                                <button 
                                    onClick={handleDeleteArticle}
                                    className="p-3 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-xl border border-red-500/10 transition-all text-sm font-semibold flex items-center gap-2"
                                >
                                    <Trash2 size={16} /> Delete
                                </button>
                            </>
                        ) : null}
                    </div>
                </div>

                {/* Article Content */}
                <div className="galaxy-card p-8 border border-gray-800">
                    {!editing ? (
                        <div className="space-y-6">
                            <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">{article.title}</h1>
                            <div className="border-t border-white/5 pt-6 text-gray-300 text-base leading-relaxed whitespace-pre-wrap font-medium">
                                {article.body || <span className="text-gray-500 italic">No content description provided for this article. Click Edit to add some!</span>}
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSaveUpdates} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Article Title</label>
                                <input 
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 outline-none transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Category</label>
                                    <select 
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 outline-none transition-colors"
                                    >
                                        <option value="General">General</option>
                                        <option value="Standard Operating Procedures">SOPs</option>
                                        <option value="Engineering & Dev">Engineering</option>
                                        <option value="HR Guides">HR Policies</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Body Content</label>
                                <textarea 
                                    rows={12}
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    placeholder="Write your article content using plain text..."
                                    className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 outline-none transition-colors font-sans leading-relaxed resize-y"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                                <button 
                                    type="button" 
                                    onClick={() => { setEditing(false); setTitle(article.title); setBody(article.body); setCategory(article.category); }}
                                    className="px-5 py-2.5 text-gray-400 hover:text-white font-bold text-sm"
                                >
                                    <X size={16} className="inline mr-1" /> Discard
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={saving}
                                    className="bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-1.5"
                                >
                                    <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
