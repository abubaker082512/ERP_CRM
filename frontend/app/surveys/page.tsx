"use client";

import SurveysHeader from "@/components/surveys/SurveysHeader";
import { useEffect, useState } from "react";
import { Plus, MessageSquare, Share2 } from "lucide-react";

type Survey = {
    id: string;
    title: string;
    state: string;
};

export default function SurveysPage() {
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTitle, setNewTitle] = useState("");

    useEffect(() => {
        fetch("http://localhost:8000/api/v1/surveys/surveys")
            .then((r) => r.json())
            .then(setSurveys)
            .catch(console.error);
    }, []);

    const createSurvey = async () => {
        if (!newTitle.trim()) return;

        const res = await fetch("http://localhost:8000/api/v1/surveys/surveys", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newTitle }),
        });
        if (res.ok) {
            const survey = await res.json();
            setSurveys([...surveys, survey]);
            setNewTitle("");
            setIsModalOpen(false);
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <SurveysHeader />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-200">Surveys</h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded flex items-center gap-1"
                    >
                        <Plus size={16} /> New Survey
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {surveys.map((survey) => (
                        <div
                            key={survey.id}
                            className="bg-[#1E293B] border border-gray-700 rounded-lg p-6 hover:border-indigo-500 transition-colors"
                        >
                            <div className="flex items-start gap-3 mb-4">
                                <div className="bg-indigo-500/20 p-2 rounded text-indigo-500">
                                    <MessageSquare size={20} />
                                </div>
                                <div>
                                    <h3 className="font-medium text-white">{survey.title}</h3>
                                    <p className="text-xs text-gray-400 mt-1">0 Responses</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
                                <span className="text-xs font-bold uppercase text-yellow-500">{survey.state}</span>
                                <button className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                                    <Share2 size={14} /> Share
                                </button>
                            </div>
                        </div>
                    ))}

                    {surveys.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No surveys found. Create one to gather feedback.
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-[#1E293B] rounded-lg p-6 w-full max-w-md border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Create Survey</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-indigo-500"
                                    placeholder="e.g. Employee Satisfaction"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-300 hover:text-white">Cancel</button>
                            <button onClick={createSurvey} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
