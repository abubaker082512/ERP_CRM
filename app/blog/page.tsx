"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { BLOG_POSTS, BlogPost } from "@/lib/blog-data";
import {
    Search,
    Clock,
    Calendar,
    ArrowRight,
    Tag,
    Sparkles,
    Flame,
    BookOpen,
    Send,
    CheckCircle2,
    Layers,
    ChevronRight
} from "lucide-react";

export default function BlogIndexPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [subscribed, setSubscribed] = useState(false);
    const [newsletterEmail, setNewsletterEmail] = useState("");

    const categories = ["All", "Beraxis vs Zudo", "B2B Lead Generation", "AI & Voice ERP", "Cost & Architecture"];

    const filteredPosts = useMemo(() => {
        return BLOG_POSTS.filter((post) => {
            const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
            const matchesSearch =
                !searchQuery ||
                post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

            return matchesCategory && matchesSearch;
        });
    }, [searchQuery, selectedCategory]);

    const featuredPost = BLOG_POSTS[0];
    const gridPosts = filteredPosts.filter((p) => p.slug !== (selectedCategory === "All" && !searchQuery ? featuredPost.slug : ""));

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (newsletterEmail.trim()) {
            setSubscribed(true);
            setNewsletterEmail("");
        }
    };

    return (
        <main className="min-h-screen bg-[#020205] text-white overflow-hidden selection:bg-purple-500/30 selection:text-purple-200">
            <Navbar />

            {/* HERO SECTION */}
            <section className="relative pt-36 pb-20 overflow-hidden">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-purple-600/15 via-pink-600/10 to-cyan-600/10 rounded-full blur-[130px] pointer-events-none" />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/20 px-4 py-1.5 rounded-full inline-block mb-4">
                        Engineering & Strategic Insights
                    </span>
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight mb-6">
                        The Autonomous Enterprise <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-amber-400">Dispatch</span>
                    </h1>
                    <p className="text-gray-400 text-lg sm:text-xl max-w-3xl mx-auto mb-12 font-light leading-relaxed">
                        In-depth articles, comparative analyses, and architectural breakdowns on how modern founders are abandoning legacy software suites like Zudo for unified voice AI and built-in lead intelligence.
                    </p>

                    {/* Search & Filter Controls */}
                    <div className="max-w-3xl mx-auto space-y-6">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search articles, comparisons (e.g. 'Zudo', 'Leads Pool', 'Voice Pilot')..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#0D1322] border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors shadow-xl"
                            />
                        </div>

                        {/* Category Filter Pills */}
                        <div className="flex flex-wrap gap-2 justify-center">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                        selectedCategory === cat
                                            ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30 border border-purple-500"
                                            : "bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10"
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURED POST (Only if viewing All and no search) */}
            {selectedCategory === "All" && !searchQuery && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
                    <div className="bg-gradient-to-r from-[#0C1124] to-[#121933] border border-purple-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden group hover:border-purple-500/60 transition-all">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                                <Flame size={12} className="text-orange-400" /> Featured Analysis
                            </span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock size={12} /> {featuredPost.readTime}
                            </span>
                        </div>

                        <Link href={`/blog/${featuredPost.slug}`}>
                            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4 group-hover:text-purple-300 transition-colors">
                                {featuredPost.title}
                            </h2>
                        </Link>

                        <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-4xl mb-8">
                            {featuredPost.excerpt}
                        </p>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold text-white text-xs">
                                    {featuredPost.author.avatar}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white">{featuredPost.author.name}</p>
                                    <p className="text-[11px] text-gray-400">{featuredPost.author.role} • {featuredPost.publishedAt}</p>
                                </div>
                            </div>

                            <Link
                                href={`/blog/${featuredPost.slug}`}
                                className="galaxy-btn-primary !px-6 !py-2.5 text-xs font-bold flex items-center gap-2"
                            >
                                <span>Read Full Article</span>
                                <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* ARTICLES GRID */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {gridPosts.map((post) => (
                        <article
                            key={post.slug}
                            className="bg-[#090E1E] border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-purple-500/40 hover:bg-[#0E152D] transition-all group shadow-lg"
                        >
                            <div>
                                <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full">
                                        {post.category}
                                    </span>
                                    <span className="flex items-center gap-1 text-[11px]">
                                        <Clock size={12} /> {post.readTime}
                                    </span>
                                </div>

                                <Link href={`/blog/${post.slug}`}>
                                    <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2 mb-3">
                                        {post.title}
                                    </h3>
                                </Link>

                                <p className="text-gray-400 text-xs sm:text-sm line-clamp-3 leading-relaxed mb-6">
                                    {post.excerpt}
                                </p>
                            </div>

                            <div>
                                <div className="flex flex-wrap gap-1.5 mb-6">
                                    {post.tags.slice(0, 3).map((tag) => (
                                        <span key={tag} className="text-[10px] bg-white/5 text-gray-300 px-2 py-0.5 rounded">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center font-bold text-[10px] text-white">
                                            {post.author.avatar}
                                        </div>
                                        <span className="text-gray-300 font-medium text-[11px]">{post.author.name}</span>
                                    </div>
                                    <Link
                                        href={`/blog/${post.slug}`}
                                        className="text-purple-400 group-hover:text-purple-300 font-semibold flex items-center gap-1"
                                    >
                                        <span>Read</span>
                                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                {filteredPosts.length === 0 && (
                    <div className="text-center py-20 bg-[#090E1E] border border-white/10 rounded-2xl">
                        <BookOpen size={40} className="mx-auto text-gray-500 mb-4" />
                        <h3 className="text-lg font-bold text-white">No articles found</h3>
                        <p className="text-gray-400 text-sm mt-1">Try adjusting your search query or category filter.</p>
                    </div>
                )}
            </section>

            {/* DAILY CONTENT STRATEGY & NEWSLETTER BOX */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
                <div className="bg-gradient-to-r from-purple-950/60 via-[#0A0F22] to-cyan-950/60 border border-purple-500/30 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
                    <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-4 py-1.5 rounded-full inline-block mb-4">
                        Daily Operational Strategy
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4">
                        Get Daily Strategic Insights on <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">ERP & Lead Velocity</span>
                    </h2>
                    <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
                        We publish daily breakdowns of modern SaaS architecture, comparison guides against legacy suites like Zudo, and actionable tactics to scale your revenue pipeline.
                    </p>

                    {subscribed ? (
                        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-6 py-3 rounded-xl font-bold text-sm">
                            <CheckCircle2 size={18} /> You're subscribed to our daily executive briefing!
                        </div>
                    ) : (
                        <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
                            <input
                                type="email"
                                required
                                placeholder="Enter your work email..."
                                value={newsletterEmail}
                                onChange={(e) => setNewsletterEmail(e.target.value)}
                                className="flex-1 bg-[#121933] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                            />
                            <button
                                type="submit"
                                className="galaxy-btn-primary !px-6 !py-3 text-sm font-bold flex items-center justify-center gap-2"
                            >
                                <span>Subscribe</span>
                                <Send size={14} />
                            </button>
                        </form>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
}
