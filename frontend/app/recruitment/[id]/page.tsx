"use client";
import { fetchAPI } from '@/lib/api';
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import RecruitmentHeader from "@/components/recruitment/RecruitmentHeader";
import { ArrowLeft, Target, Users, Mail, Phone, Calendar, Star } from "lucide-react";

type Job = {
    id: string;
    name: string;
    no_of_recruitment: number;
    state: string;
    description?: string;
};

type Application = {
    id: string;
    partner_name: string;
    email_from: string;
    partner_phone: string;
    stage_id: string;
    probability: number;
};

export default function JobDetail() {
    const { id } = useParams();
    const router = useRouter();
    const [job, setJob] = useState<Job | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        
        const fetchData = async () => {
            try {
                const jobRes = await fetchAPI(`/recruitment/jobs/${id}`);
                if (jobRes.ok) setJob(await jobRes.json());
                
                const appRes = await fetchAPI(`/recruitment/applications?job_id=${id}`);
                if (appRes.ok) setApplications(await appRes.json());
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [id]);

    if (loading) return <div className="p-8 text-white bg-[#0F172A] h-screen">Loading...</div>;
    if (!job) return <div className="p-8 text-white bg-[#0F172A] h-screen">Job Position not found.</div>;

    return (
        <div className="flex flex-col h-screen bg-[#0F172A] text-gray-200">
            <RecruitmentHeader />
            
            <div className="flex-1 overflow-auto p-6 max-w-6xl mx-auto w-full">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft size={18} /> Back to Recruitment
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Job Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-[#1E293B] border border-gray-700 rounded-xl p-6 shadow-xl">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="bg-teal-500/20 p-3 rounded-lg text-teal-500">
                                    <Target size={32} />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-white">{job.name}</h1>
                                    <span className="text-xs text-green-400 font-bold uppercase border border-green-500/30 px-2 py-0.5 rounded bg-green-500/10 mt-1 inline-block">
                                        {job.state}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold tracking-widest block mb-1">Target Recruitments</label>
                                    <p className="text-lg font-bold text-white">{job.no_of_recruitment}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold tracking-widest block mb-1">Applications</label>
                                    <p className="text-lg font-bold text-white">{applications.length}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold tracking-widest block mb-1">Description</label>
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        {job.description || "No description provided for this job position."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Applications */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-[#1E293B] border border-gray-700 rounded-xl overflow-hidden shadow-xl">
                            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Users size={20} className="text-teal-500" /> Applications
                                </h2>
                                <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-1.5 rounded text-sm font-bold transition-all">
                                    Create Application
                                </button>
                            </div>

                            <div className="divide-y divide-gray-800">
                                {applications.length === 0 ? (
                                    <div className="p-12 text-center text-gray-500">
                                        No applications received for this position yet.
                                    </div>
                                ) : (
                                    applications.map(app => (
                                        <div key={app.id} className="p-6 hover:bg-gray-800/50 transition-colors group">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-white group-hover:text-teal-400 transition-colors">{app.partner_name}</h3>
                                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                                                        <span className="flex items-center gap-1"><Mail size={14} /> {app.email_from}</span>
                                                        <span className="flex items-center gap-1"><Phone size={14} /> {app.partner_phone || "N/A"}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                                                        {app.stage_id || "Initial"}
                                                    </span>
                                                    <div className="flex gap-0.5">
                                                        {[1, 2, 3].map(i => (
                                                            <Star key={i} size={12} className={i <= (app.probability / 33) ? "text-yellow-500 fill-yellow-500" : "text-gray-700"} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
