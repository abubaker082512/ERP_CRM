import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { BLOG_POSTS } from "@/lib/blog-data";
import {
    ArrowLeft,
    Clock,
    Calendar,
    Tag,
    Share2,
    CheckCircle2,
    ArrowRight,
    Sparkles,
    ChevronRight,
    BookOpen
} from "lucide-react";

interface Props {
    params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const post = BLOG_POSTS.find((p) => p.slug === slug);

    if (!post) {
        notFound();
    }

    const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 2);

    return (
        <main className="min-h-screen bg-[#020205] text-white overflow-hidden selection:bg-purple-500/30 selection:text-purple-200">
            <Navbar />

            {/* ARTICLE HEADER */}
            <article className="pt-36 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back to Blog */}
                <div className="mb-8">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-purple-300 transition-colors bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xl"
                    >
                        <ArrowLeft size={14} /> Back to all articles
                    </Link>
                </div>

                {/* Category & Read Time */}
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
                        {post.category}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={13} /> {post.readTime}
                    </span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar size={13} /> {post.publishedAt}
                    </span>
                </div>

                {/* Main Article Title */}
                <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-8">
                    {post.title}
                </h1>

                {/* Author Card */}
                <div className="flex items-center justify-between py-6 border-y border-white/10 mb-12">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
                            {post.author.avatar}
                        </div>
                        <div>
                            <p className="font-bold text-white text-sm">{post.author.name}</p>
                            <p className="text-xs text-gray-400">{post.author.role}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 hidden sm:inline">Share Analysis:</span>
                        <a
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://beraxis.online/blog/${post.slug}`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                        >
                            <Share2 size={16} />
                        </a>
                    </div>
                </div>

                {/* Article Body Content */}
                <div className="prose prose-invert max-w-none space-y-6 text-gray-300 text-base sm:text-lg leading-relaxed">
                    {post.content.split("\n\n").map((block, idx) => {
                        const trimmed = block.trim();
                        if (!trimmed) return null;

                        // H2
                        if (trimmed.startsWith("## ")) {
                            return (
                                <h2 key={idx} className="text-2xl sm:text-3xl font-extrabold text-white mt-12 mb-4 pt-4 border-t border-white/10">
                                    {trimmed.replace("## ", "")}
                                </h2>
                            );
                        }

                        // H3
                        if (trimmed.startsWith("### ")) {
                            return (
                                <h3 key={idx} className="text-xl sm:text-2xl font-bold text-purple-300 mt-8 mb-3">
                                    {trimmed.replace("### ", "")}
                                </h3>
                            );
                        }

                        // Blockquotes
                        if (trimmed.startsWith("> ")) {
                            return (
                                <blockquote key={idx} className="p-4 rounded-2xl bg-purple-500/10 border-l-4 border-purple-500 text-purple-200 italic my-6 text-base">
                                    {trimmed.replace(/^> \*/, "*").replace(/\*$/, "*").replace(/> /, "")}
                                </blockquote>
                            );
                        }

                        // Bullet list
                        if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
                            const items = trimmed.split("\n").map(l => l.replace(/^[*|-]\s+/, ""));
                            return (
                                <ul key={idx} className="space-y-2 my-4 pl-4 list-disc list-inside text-gray-300 text-base">
                                    {items.map((it, i) => (
                                        <li key={i}>{it}</li>
                                    ))}
                                </ul>
                            );
                        }

                        // Table parser
                        if (trimmed.startsWith("|")) {
                            const rows = trimmed.split("\n").filter(r => r.trim() && !r.includes("---"));
                            const header = rows[0]?.split("|").filter(c => c.trim()).map(c => c.trim());
                            const body = rows.slice(1).map(r => r.split("|").filter(c => c.trim()).map(c => c.trim()));

                            return (
                                <div key={idx} className="overflow-x-auto my-8 bg-[#0A0F20] border border-white/10 rounded-2xl p-4">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-white/10 text-xs uppercase text-purple-300 font-bold">
                                                {header?.map((h, i) => (
                                                    <th key={i} className="py-3 px-4">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {body.map((row, rIdx) => (
                                                <tr key={rIdx} className="hover:bg-white/[0.02]">
                                                    {row.map((col, cIdx) => (
                                                        <td key={cIdx} className="py-3 px-4 text-gray-300 font-medium">{col}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        }

                        // Standard Paragraph with link replacement
                        return (
                            <p key={idx} className="text-gray-300 text-base sm:text-lg leading-relaxed">
                                {trimmed}
                            </p>
                        );
                    })}
                </div>

                {/* Backlinks & Tags Ribbon */}
                <div className="mt-14 pt-8 border-t border-white/10">
                    <p className="text-xs uppercase font-bold text-gray-500 tracking-wider mb-3">Topic Tags</p>
                    <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                            <span key={tag} className="text-xs bg-white/5 border border-white/10 text-gray-300 px-3 py-1 rounded-xl">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Internal Backlinks Box */}
                <div className="my-12 bg-[#0B1124] border border-cyan-500/30 rounded-2xl p-6">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Sparkles size={16} className="text-cyan-400" /> Strategic Resources Mentioned in This Analysis
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
                        <Link
                            href="/leads-pool"
                            className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 hover:border-cyan-400 text-cyan-300 font-semibold flex items-center justify-between"
                        >
                            <span>Explore 25M+ Leads Pool</span>
                            <ArrowRight size={14} />
                        </Link>
                        <Link
                            href="/pricing"
                            className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:border-purple-400 text-purple-300 font-semibold flex items-center justify-between"
                        >
                            <span>Transparent Flat Pricing</span>
                            <ArrowRight size={14} />
                        </Link>
                        <Link
                            href="/signup"
                            className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-400 text-emerald-300 font-semibold flex items-center justify-between"
                        >
                            <span>Launch Free Workspace</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>

                {/* Bottom Conversion Box */}
                <div className="mt-12 bg-gradient-to-r from-purple-900/40 via-[#0C1226] to-pink-900/40 border border-purple-500/30 rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden shadow-2xl">
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
                        Ready to Replace Clunky Legacy Software?
                    </h3>
                    <p className="text-gray-300 text-sm max-w-xl mx-auto mb-6">
                        Experience the unified command center with native voice pilot and built-in lead intelligence. Deploy your free workspace in 60 seconds.
                    </p>
                    <Link
                        href="/signup"
                        className="galaxy-btn-primary !px-8 !py-3.5 text-sm font-bold inline-flex items-center gap-2"
                    >
                        <span>Start Free on Beraxis</span>
                        <ArrowRight size={16} />
                    </Link>
                </div>

                {/* Related Articles */}
                {relatedPosts.length > 0 && (
                    <div className="mt-20 pt-12 border-t border-white/10">
                        <h3 className="text-xl font-bold text-white mb-6">Related Operational Briefings</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {relatedPosts.map((r) => (
                                <Link
                                    key={r.slug}
                                    href={`/blog/${r.slug}`}
                                    className="p-6 rounded-2xl bg-[#090E1E] border border-white/10 hover:border-purple-500/40 transition-all group block"
                                >
                                    <span className="text-[10px] font-bold uppercase text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full inline-block mb-3">
                                        {r.category}
                                    </span>
                                    <h4 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2 mb-2">
                                        {r.title}
                                    </h4>
                                    <p className="text-xs text-gray-400 line-clamp-2">{r.excerpt}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </article>

            <Footer />
        </main>
    );
}

// Generate static params for static site generation / optimal Next.js routing
export async function generateStaticParams() {
    return BLOG_POSTS.map((post) => ({
        slug: post.slug,
    }));
}
