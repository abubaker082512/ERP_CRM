"use client";
import { fetchAPI } from '@/lib/api';

import RecruitmentHeader from "@/components/recruitment/RecruitmentHeader";
import { useEffect, useState } from "react";
import { Plus, Target, Users, MoreVertical } from "lucide-react";

type Job = {
    id: string;
    name: string;
    no_of_recruitment: number;
    state: string;
};

type Applicant = {
    id: string;
    name: string;
    job_id: string;
    email_from: string;
    stage_id: string;
    created_at: string;
};

export default function RecruitmentPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [activeTab, setActiveTab] = useState<'jobs' | 'applicants'>('jobs');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newJobName, setNewJobName] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [jobsRes, appRes] = await Promise.all([
                    fetchAPI("/recruitment/jobs"),
                    fetchAPI("/recruitment/applicants")
                ]);
                if (jobsRes.ok) setJobs(await jobsRes.json());
                if (appRes.ok) setApplicants(await appRes.json());
            } catch (e) {
                console.error(e);
            }
        };
        fetchData();
    }, []);

    const createJob = async () => {
        if (!newJobName.trim()) return;
        const res = await fetchAPI("/recruitment/jobs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newJobName }),
        });
        if (res.ok) {
            const job = await res.json();
            setJobs([...jobs, job]);
            setNewJobName("");
            setIsModalOpen(false);
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <RecruitmentHeader />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex gap-1 mb-6 bg-[#1E293B] rounded-lg p-1 w-fit">
                    <button onClick={() => setActiveTab('jobs')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'jobs' ? 'bg-teal-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                        Job Positions
                    </button>
                    <button onClick={() => setActiveTab('applicants')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'applicants' ? 'bg-teal-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                        Applicants
                    </button>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-200">
                        {activeTab === 'jobs' ? 'Job Positions' : 'All Applicants'}
                    </h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-1.5 rounded flex items-center gap-1 font-bold shadow-lg shadow-teal-900/20 transition-all"
                    >
                        <Plus size={16} /> New {activeTab === 'jobs' ? 'Job Position' : 'Applicant'}
                    </button>
                </div>

                {activeTab === 'jobs' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map((job) => (
                            <div
                                key={job.id}
                                className="galaxy-card p-6 border-l-4 border-teal-500 hover:!bg-white/10"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-teal-500/20 p-3 rounded-lg text-teal-500">
                                            <Target size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-white">{job.name}</h3>
                                            <p className="text-sm text-gray-400">Recruitment in progress</p>
                                        </div>
                                    </div>
                                    <button className="text-gray-400 hover:text-white"><MoreVertical size={18} /></button>
                                </div>

                                <div className="mt-6">
                                    <button onClick={() => setActiveTab('applicants')} className="w-full bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-white/5 transition-all">
                                        <Users size={16} className="text-teal-400" />
                                        <span>{applicants.filter(a => a.job_id === job.id).length} New Applications</span>
                                    </button>
                                </div>

                                <div className="mt-6 pt-4 border-t border-white/5 flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                    <span>To Recruit: <span className="text-teal-400">{job.no_of_recruitment}</span></span>
                                    <span className="text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded bg-emerald-500/10">{job.state}</span>
                                </div>
                            </div>
                        ))}
                        {jobs.length === 0 && (
                            <div className="col-span-full text-center py-12 text-gray-500">
                                No job positions found. Create one to start recruiting.
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="galaxy-card overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#1E293B] text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-800">
                                <tr>
                                    <th className="px-6 py-4">Applicant Name</th>
                                    <th className="px-6 py-4">Job Position</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Stage</th>
                                    <th className="px-6 py-4">Applied On</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {applicants.map(app => (
                                    <tr key={app.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 font-bold text-gray-200">{app.name}</td>
                                        <td className="px-6 py-4 text-teal-400 font-medium">{jobs.find(j => j.id === app.job_id)?.name || '—'}</td>
                                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">{app.email_from || '—'}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[10px] font-bold uppercase">{app.stage_id}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-xs">{new Date(app.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-[#1E293B] rounded-lg p-6 w-full max-w-md border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Create Job Position</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Job Title</label>
                                <input
                                    type="text"
                                    value={newJobName}
                                    onChange={(e) => setNewJobName(e.target.value)}
                                    className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-teal-500"
                                    placeholder="e.g. Senior Developer"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-300 hover:text-white">Cancel</button>
                            <button onClick={createJob} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded">Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
