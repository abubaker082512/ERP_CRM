"use client";

import RecruitmentHeader from "@/components/recruitment/RecruitmentHeader";
import { useEffect, useState } from "react";
import { Plus, Target, Users, MoreVertical } from "lucide-react";

type Job = {
    id: string;
    name: string;
    no_of_recruitment: number;
    state: string;
};

export default function RecruitmentPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newJobName, setNewJobName] = useState("");

    useEffect(() => {
        fetch("http://localhost:8000/api/v1/recruitment/jobs")
            .then((r) => r.json())
            .then(setJobs)
            .catch(console.error);
    }, []);

    const createJob = async () => {
        if (!newJobName.trim()) return;
        const res = await fetch("http://localhost:8000/api/v1/recruitment/jobs", {
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
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-200">Job Positions</h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-1.5 rounded flex items-center gap-1"
                    >
                        <Plus size={16} /> New Job Position
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.map((job) => (
                        <div
                            key={job.id}
                            className="bg-[#1E293B] border border-gray-700 rounded-lg p-6 hover:border-teal-500 transition-colors group relative"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-teal-500/20 p-3 rounded-lg text-teal-500">
                                        <Target size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-white">{job.name}</h3>
                                        <p className="text-sm text-gray-400">Recruitment in progress</p>
                                    </div>
                                </div>
                                <button className="text-gray-400 hover:text-white"><MoreVertical size={18} /></button>
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2 rounded font-medium flex items-center justify-center gap-2">
                                    <Users size={16} />
                                    <span>0 Applications</span>
                                </button>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between text-sm text-gray-400">
                                <span>To Recruit: {job.no_of_recruitment}</span>
                                <span className="text-green-400 uppercase text-xs font-bold border border-green-500/30 px-2 py-0.5 rounded bg-green-500/10">{job.state}</span>
                            </div>
                        </div>
                    ))}

                    {jobs.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No job positions found. Create one to start recruiting.
                        </div>
                    )}
                </div>
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
