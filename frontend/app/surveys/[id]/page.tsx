"use client";
import { fetchAPI } from "@/lib/api";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppHeader from "@/components/layout/AppHeader";
import { ArrowLeft, Plus, Trash2, Eye, Link2, Copy, CheckCircle, ListChecks, HelpCircle } from "lucide-react";

type Question = {
    id: string;
    title: string;
    question_type: string;
    sequence: number;
};

type Survey = {
    id: string;
    title: string;
    description?: string;
    state: string;
    access_token: string;
    questions?: Question[];
};

export default function SurveyDesignerPage() {
    const { id } = useParams();
    const router = useRouter();
    const [survey, setSurvey] = useState<Survey | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Question Modal Form state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [qTitle, setQTitle] = useState("");
    const [qType, setQType] = useState("text");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!id) return;
        fetchSurveyDetails();
    }, [id]);

    const fetchSurveyDetails = async () => {
        try {
            const res = await fetchAPI(`/surveys/surveys/${id}`);
            if (res.ok) {
                setSurvey(await res.json());
            } else {
                router.push("/surveys");
            }
        } catch (e) {
            console.error("Failed to load survey details", e);
            router.push("/surveys");
        } finally {
            setLoading(false);
        }
    };

    const handleAddQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!qTitle.trim() || !survey) return;

        setSaving(true);
        try {
            const res = await fetchAPI(`/surveys/surveys/${survey.id}/questions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: qTitle,
                    question_type: qType,
                    sequence: (survey.questions?.length || 0) + 1
                })
            });

            if (res.ok) {
                setQTitle("");
                setQType("text");
                setIsModalOpen(false);
                fetchSurveyDetails();
            }
        } catch (e) {
            console.error("Failed to add question", e);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteQuestion = async (qId: string) => {
        if (!survey || !confirm("Delete this question?")) return;
        try {
            const res = await fetchAPI(`/surveys/surveys/${survey.id}/questions/${qId}`, {
                method: "DELETE"
            });
            if (res.ok) {
                fetchSurveyDetails();
            }
        } catch (e) {
            console.error("Failed to delete question", e);
        }
    };

    const handlePublishSurvey = async () => {
        if (!survey) return;
        try {
            const res = await fetchAPI(`/surveys/surveys/${survey.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ state: "published" })
            });
            if (res.ok) {
                fetchSurveyDetails();
            }
        } catch (e) {
            console.error("Failed to publish survey", e);
        }
    };

    const copyLink = () => {
        if (!survey) return;
        const url = `${window.location.origin}/surveys/fill/${survey.access_token}`;
        navigator.clipboard.writeText(url);
        alert("Public survey link copied to clipboard!");
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-[#0F172A]">
            <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!survey) return null;

    const questions = survey.questions || [];

    return (
        <div className="flex flex-col h-screen bg-[#0B101E] text-white">
            <AppHeader title={`Survey: ${survey.title}`} />

            <div className="flex-1 overflow-auto p-6 max-w-4xl mx-auto w-full">
                {/* Back & Actions */}
                <div className="flex justify-between items-center mb-8 shrink-0">
                    <div className="flex items-center gap-3">
                        <Link href="/surveys" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/5 shadow-inner">
                            <ArrowLeft size={18} />
                        </Link>
                        <div>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border uppercase tracking-wider ${
                                survey.state === "published" 
                                    ? "bg-green-500/15 text-green-400 border-green-500/25" 
                                    : "bg-yellow-500/15 text-yellow-400 border-yellow-500/25"
                            }`}>
                                {survey.state}
                            </span>
                            <h1 className="text-xl font-bold mt-1 text-white">{survey.title}</h1>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {survey.state !== "published" ? (
                            <button 
                                onClick={handlePublishSurvey}
                                className="bg-green-600 hover:bg-green-500 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all"
                            >
                                Publish Survey
                            </button>
                        ) : (
                            <button 
                                onClick={copyLink}
                                className="bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all"
                            >
                                <Copy size={14} /> Copy Link
                            </button>
                        )}
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="bg-pink-600 hover:bg-pink-500 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-1.5"
                        >
                            <Plus size={16} /> Add Question
                        </button>
                    </div>
                </div>

                {/* Questions Designer */}
                <div className="galaxy-card p-6 border border-gray-800">
                    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <ListChecks className="text-pink-500" size={20} /> Design Questionnaire
                    </h2>

                    <div className="space-y-4">
                        {questions.map((q, idx) => (
                            <div key={q.id} className="bg-[#1E293B] border border-gray-700 rounded-xl p-5 flex justify-between items-center hover:border-pink-500/30 transition-all">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center font-bold text-pink-400 border border-pink-500/20 text-sm">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-base leading-tight">{q.title}</h4>
                                        <div className="flex items-center gap-2 mt-2">
                                            <HelpCircle size={12} className="text-gray-500" />
                                            <span className="text-[10px] font-bold text-gray-400 uppercase bg-black/20 px-2 py-0.5 rounded tracking-widest">{q.question_type}</span>
                                        </div>
                                    </div>
                                </div>

                                <button onClick={() => handleDeleteQuestion(q.id)} className="p-2 text-gray-500 hover:text-red-400 bg-white/3 hover:bg-red-500/10 border border-white/5 rounded-lg transition-all" title="Remove question">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}

                        {questions.length === 0 && (
                            <div className="text-center py-20 border-2 border-dashed border-gray-800 rounded-xl text-gray-500 italic">
                                <ListChecks size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="text-sm">No questions added yet. Click &quot;Add Question&quot; to build your survey!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Question Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1E293B] rounded-2xl p-6 w-full max-w-md border border-gray-700 shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-6">Add Survey Question</h3>
                        <form onSubmit={handleAddQuestion} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Question Text</label>
                                <input 
                                    type="text"
                                    required
                                    value={qTitle}
                                    onChange={(e) => setQTitle(e.target.value)}
                                    placeholder="e.g. Rate your overall experience with the platform."
                                    className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-pink-500 outline-none transition-colors"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Answer Type</label>
                                <select
                                    value={qType}
                                    onChange={(e) => setQType(e.target.value)}
                                    className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-pink-500 outline-none transition-colors"
                                >
                                    <option value="text">Single Line Text</option>
                                    <option value="textbox">Long Paragraph Text</option>
                                    <option value="multiple_choice">Multiple Choice (Radio Buttons)</option>
                                    <option value="checkbox">Checkboxes (Select Multiple)</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-400 hover:text-white font-bold text-sm">Cancel</button>
                                <button type="submit" disabled={saving} className="bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all">
                                    {saving ? "Adding..." : "Add Question"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
