"use client";
import { fetchAPI } from '@/lib/api';
import { useState, useEffect } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import { Plus, LayoutGrid, List as ListIcon, Palette, Users, Clock } from 'lucide-react';
import Link from 'next/link';

type Project = {
    id: string;
    name: string;
    user_id?: string;
    created_at: string;
};

export default function ProjectPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAPI("/projects/projects")
            .then(r => r.ok ? r.json() : [])
            .then(setProjects)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="flex flex-col h-screen">
            <AppHeader title="Projects" />
            <div className="flex-1 overflow-auto p-6">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Palette className="text-blue-500" /> My Projects
                    </h1>
                    <button className="galaxy-btn-primary !py-2 flex items-center gap-2">
                        <Plus size={16} /> New Project
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {projects.map(p => (
                            <Link href={`/project/${p.id}`} key={p.id} className="galaxy-card p-6 group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
                                        <Palette size={24} />
                                    </div>
                                    <button className="text-gray-500 hover:text-white"><ListIcon size={18} /></button>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{p.name}</h3>
                                <div className="flex items-center justify-between text-xs text-gray-500 mt-4 pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-1">
                                        <Users size={12} /> Team Members
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock size={12} /> {new Date(p.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
