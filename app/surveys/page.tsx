"use client";

import { fetchAPI } from "@/lib/api";
import { useState, useEffect } from "react";
import AppHeader from "@/components/layout/AppHeader";
import {
    PenTool,
    Link2,
    Eye,
    Plus,
    ListChecks,
    CheckCircle2,
    Copy,
    HelpCircle,
    Star,
    Smile,
    MessageSquare,
    Users,
    Target,
    BarChart3,
    X,
    Send,
    Trash2,
    Check,
    ArrowRight,
    Sparkles,
    Sliders
} from "lucide-react";

export type QuestionType = "rating" | "multiple_choice" | "nps" | "text" | "boolean";

export type SurveyQuestion = {
    id: string;
    title: string;
    type: QuestionType;
    required: boolean;
    options?: string[];
};

export type Survey = {
    id: string;
    title: string;
    category: "Customer CSAT" | "Employee 360" | "Lead Qualification" | "Project Handover";
    description: string;
    state: "published" | "draft";
    access_token: string;
    responses_count: number;
    avg_score: number;
    questions: SurveyQuestion[];
    created_at: string;
};

const TEMPLATES: Omit<Survey, "id" | "access_token" | "responses_count" | "avg_score" | "created_at">[] = [
    {
        title: "Customer Satisfaction (CSAT) & Quality Review",
        category: "Customer CSAT",
        description: "Measure client satisfaction on recent ERP deliverables, UI redesigns, and engineering support.",
        state: "published",
        questions: [
            { id: "q1", title: "Overall, how satisfied are you with our delivered ERP solution?", type: "rating", required: true },
            { id: "q2", title: "How likely are you to recommend Beraxis to another organization?", type: "nps", required: true },
            { id: "q3", title: "Which module provided the highest value to your team?", type: "multiple_choice", options: ["CRM & Leads Pool", "Accounting & Journals", "Project Sprint Hub", "Warehouse RFID"], required: true },
            { id: "q4", title: "What additional features or improvements would you like to see?", type: "text", required: false }
        ]
    },
    {
        title: "Lead Qualification & Pre-Sales Intake",
        category: "Lead Qualification",
        description: "Pre-screen prospective enterprise leads, identify tech stack requirements, timeline, and budget.",
        state: "published",
        questions: [
            { id: "q1", title: "What is your target timeline for ERP/CRM deployment?", type: "multiple_choice", options: ["Immediate (< 1 month)", "1 - 3 months", "3 - 6 months", "Exploring for next year"], required: true },
            { id: "q2", title: "Estimated number of active system users?", type: "multiple_choice", options: ["1 - 10 Users", "10 - 50 Users", "50 - 250 Users", "250+ Enterprise"], required: true },
            { id: "q3", title: "Do you require on-premise deployment or secure private cloud hosting?", type: "multiple_choice", options: ["Private Cloud (AWS/Azure)", "On-Premises Bare Metal", "Beraxis Managed SaaS"], required: true },
            { id: "q4", title: "Briefly describe your existing software bottlenecks:", type: "text", required: false }
        ]
    },
    {
        title: "Employee 360 & Sprint Retrospective",
        category: "Employee 360",
        description: "Collect confidential feedback from engineering and operations teams on sprint velocity and culture.",
        state: "published",
        questions: [
            { id: "q1", title: "How manageable was your sprint workload over the last 2 weeks?", type: "rating", required: true },
            { id: "q2", title: "Did you receive adequate architectural clarity from project leads?", type: "boolean", required: true },
            { id: "q3", title: "What single operational process could we improve in the next sprint?", type: "text", required: true }
        ]
    },
    {
        title: "Project Milestone Delivery Sign-off",
        category: "Project Handover",
        description: "Official stakeholder sign-off on delivered milestone criteria, user testing, and warranty period.",
        state: "published",
        questions: [
            { id: "q1", title: "Have all acceptance criteria in the milestone statement of work been met?", type: "boolean", required: true },
            { id: "q2", title: "Rate the performance and response time of the deployed system:", type: "rating", required: true },
            { id: "q3", title: "Any remaining punch-list items or blockers prior to production release?", type: "text", required: false }
        ]
    }
];

const INITIAL_SURVEYS: Survey[] = [
    {
        id: "surv_01",
        title: "Customer Satisfaction (CSAT) & Quality Review",
        category: "Customer CSAT",
        description: "Measure client satisfaction on recent ERP deliverables, UI redesigns, and engineering support.",
        state: "published",
        access_token: "csat-q1-2026-beraxis",
        responses_count: 42,
        avg_score: 4.8,
        questions: TEMPLATES[0].questions,
        created_at: "2026-03-01"
    },
    {
        id: "surv_02",
        title: "Lead Qualification & Pre-Sales Intake",
        category: "Lead Qualification",
        description: "Pre-screen prospective enterprise leads, identify tech stack requirements, timeline, and budget.",
        state: "published",
        access_token: "lead-intake-screening-99",
        responses_count: 128,
        avg_score: 4.5,
        questions: TEMPLATES[1].questions,
        created_at: "2026-02-15"
    },
    {
        id: "surv_03",
        title: "Employee 360 & Sprint Retrospective",
        category: "Employee 360",
        description: "Collect confidential feedback from engineering and operations teams on sprint velocity and culture.",
        state: "published",
        access_token: "emp-retro-sprint-14",
        responses_count: 19,
        avg_score: 4.6,
        questions: TEMPLATES[2].questions,
        created_at: "2026-02-28"
    }
];

export default function SurveysPage() {
    const [surveys, setSurveys] = useState<Survey[]>(INITIAL_SURVEYS);
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    // Create / Builder Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [builderTitle, setBuilderTitle] = useState("");
    const [builderCategory, setBuilderCategory] = useState<"Customer CSAT" | "Employee 360" | "Lead Qualification" | "Project Handover">("Customer CSAT");
    const [builderDesc, setBuilderDesc] = useState("");
    const [builderQuestions, setBuilderQuestions] = useState<SurveyQuestion[]>([
        { id: "bq_1", title: "How would you rate your overall experience?", type: "rating", required: true },
        { id: "bq_2", title: "Any specific suggestions or feedback for our team?", type: "text", required: false }
    ]);
    const [newQTitle, setNewQTitle] = useState("");
    const [newQType, setNewQType] = useState<QuestionType>("rating");
    const [newQOptions, setNewQOptions] = useState("Option A, Option B, Option C");

    // Preview / Live Test Modal
    const [previewSurvey, setPreviewSurvey] = useState<Survey | null>(null);
    const [previewAnswers, setPreviewAnswers] = useState<Record<string, any>>({});
    const [previewSubmitted, setPreviewSubmitted] = useState(false);

    // Analytics Modal
    const [analyticsSurvey, setAnalyticsSurvey] = useState<Survey | null>(null);

    // Toast Notification
    const [toastMsg, setToastMsg] = useState("");

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(""), 5000);
    };

    const handleApplyTemplate = (template: typeof TEMPLATES[0]) => {
        setBuilderTitle(template.title);
        setBuilderCategory(template.category);
        setBuilderDesc(template.description);
        setBuilderQuestions(template.questions);
        setIsCreateModalOpen(true);
    };

    const handleAddQuestionToBuilder = () => {
        if (!newQTitle.trim()) return;
        const newQ: SurveyQuestion = {
            id: `q_${Date.now()}`,
            title: newQTitle.trim(),
            type: newQType,
            required: true,
            options: newQType === "multiple_choice" ? newQOptions.split(",").map(s => s.trim()).filter(Boolean) : undefined
        };
        setBuilderQuestions([...builderQuestions, newQ]);
        setNewQTitle("");
    };

    const handleRemoveQuestionFromBuilder = (qId: string) => {
        setBuilderQuestions(builderQuestions.filter(q => q.id !== qId));
    };

    const handleSaveNewSurvey = (e: React.FormEvent) => {
        e.preventDefault();
        if (!builderTitle.trim() || builderQuestions.length === 0) return;

        const newSurvey: Survey = {
            id: `surv_${Date.now()}`,
            title: builderTitle.trim(),
            category: builderCategory,
            description: builderDesc.trim() || "Survey questionnaire created in Beraxis.",
            state: "published",
            access_token: `${builderTitle.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 20)}-${Math.floor(1000 + Math.random() * 9000)}`,
            responses_count: 0,
            avg_score: 5.0,
            questions: builderQuestions,
            created_at: new Date().toISOString().slice(0, 10)
        };

        setSurveys([newSurvey, ...surveys]);
        setIsCreateModalOpen(false);
        setBuilderTitle("");
        setBuilderDesc("");
        showToast(`🎉 Survey "${newSurvey.title}" created & published successfully!`);
    };

    const copyLink = (token: string) => {
        const url = `${typeof window !== "undefined" ? window.location.origin : "https://www.beraxis.online"}/surveys/fill/${token}`;
        navigator.clipboard.writeText(url);
        showToast("📋 Shareable survey link copied to clipboard!");
    };

    const filteredSurveys = selectedCategory === "all"
        ? surveys
        : surveys.filter(s => s.category === selectedCategory);

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <AppHeader title="Surveys & Feedback Hub" />

            <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
                {/* Purpose Explanation & Hero Banner */}
                <div className="bg-gradient-to-r from-pink-900/40 via-[#1E293B] to-purple-900/30 border border-pink-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                        <div className="space-y-3 max-w-2xl">
                            <div className="flex items-center gap-2">
                                <span className="p-2 bg-pink-500/20 text-pink-400 rounded-xl">
                                    <ListChecks size={22} />
                                </span>
                                <h2 className="text-2xl font-bold text-white tracking-tight">
                                    Enterprise Surveys & Feedback Engine
                                </h2>
                            </div>
                            <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
                                <strong>What are Surveys for in Beraxis?</strong> Surveys empower your organization to collect critical actionable data:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-300">
                                <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg border border-white/5">
                                    <Smile size={14} className="text-pink-400 shrink-0" />
                                    <span><strong>Customer CSAT:</strong> Measure client project satisfaction & NPS.</span>
                                </div>
                                <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg border border-white/5">
                                    <Target size={14} className="text-cyan-400 shrink-0" />
                                    <span><strong>Lead Intake:</strong> Pre-qualify budget & requirements for CRM leads.</span>
                                </div>
                                <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg border border-white/5">
                                    <Users size={14} className="text-amber-400 shrink-0" />
                                    <span><strong>Employee 360:</strong> Gather sprint velocity & team culture feedback.</span>
                                </div>
                                <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg border border-white/5">
                                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                                    <span><strong>Milestone Handover:</strong> Secure official stakeholder sign-off.</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2.5">
                            <button
                                onClick={() => {
                                    setBuilderTitle("");
                                    setBuilderDesc("");
                                    setBuilderQuestions([
                                        { id: "bq_1", title: "How would you rate your experience?", type: "rating", required: true },
                                        { id: "bq_2", title: "What feedback or improvements do you recommend?", type: "text", required: false }
                                    ]);
                                    setIsCreateModalOpen(true);
                                }}
                                className="bg-pink-600 hover:bg-pink-500 text-white px-5 py-3 rounded-2xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-pink-600/30 transition-all cursor-pointer active:scale-95"
                            >
                                <Plus size={16} />
                                <span>Create Survey from Scratch</span>
                            </button>
                            <span className="text-[11px] text-gray-400 text-center">or pick a 1-click template below ↓</span>
                        </div>
                    </div>
                </div>

                {/* 1-Click Premade Templates Bar */}
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                        <Sparkles size={16} className="text-pink-400" /> 1-Click Recommended Templates
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {TEMPLATES.map((tmpl, idx) => (
                            <div
                                key={idx}
                                onClick={() => handleApplyTemplate(tmpl)}
                                className="bg-[#1E293B] border border-gray-700/80 hover:border-pink-500/60 p-4 rounded-2xl transition-all cursor-pointer group hover:shadow-xl space-y-2 flex flex-col justify-between"
                            >
                                <div>
                                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
                                        {tmpl.category}
                                    </span>
                                    <h4 className="text-xs font-bold text-white mt-2 group-hover:text-pink-300 transition-colors">
                                        {tmpl.title}
                                    </h4>
                                    <p className="text-[11px] text-gray-400 line-clamp-2 mt-1">
                                        {tmpl.description}
                                    </p>
                                </div>
                                <div className="pt-2 border-t border-gray-800 flex items-center justify-between text-[11px] text-pink-400 font-bold">
                                    <span>{tmpl.questions.length} Pre-built Questions</span>
                                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Toast Notification */}
                {toastMsg && (
                    <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold flex items-center justify-between shadow-lg backdrop-blur-md animate-in fade-in">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={18} />
                            <span>{toastMsg}</span>
                        </div>
                        <button onClick={() => setToastMsg("")} className="text-gray-400 hover:text-white cursor-pointer">
                            ✕
                        </button>
                    </div>
                )}

                {/* Filter Tabs & Active Surveys */}
                <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        {["all", "Customer CSAT", "Lead Qualification", "Employee 360", "Project Handover"].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    selectedCategory === cat
                                        ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30"
                                        : "bg-[#1E293B] text-gray-400 hover:text-white border border-gray-700/60"
                                }`}
                            >
                                {cat === "all" ? "All Surveys" : cat}
                            </button>
                        ))}
                    </div>

                    <span className="text-xs text-gray-400 font-semibold">
                        {filteredSurveys.length} Active Surveys
                    </span>
                </div>

                {/* Survey Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSurveys.map((survey) => (
                        <div
                            key={survey.id}
                            className="bg-[#1E293B] border border-gray-700 hover:border-pink-500/50 rounded-2xl p-6 transition-all group shadow-xl flex flex-col justify-between space-y-4"
                        >
                            <div className="space-y-3">
                                <div className="flex justify-between items-start gap-2">
                                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
                                        {survey.category}
                                    </span>
                                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                        {survey.state}
                                    </span>
                                </div>

                                <h3 className="text-base font-bold text-white group-hover:text-pink-400 transition-colors line-clamp-2">
                                    {survey.title}
                                </h3>

                                <p className="text-xs text-gray-400 line-clamp-2">
                                    {survey.description}
                                </p>

                                {/* Survey Metrics */}
                                <div className="grid grid-cols-2 gap-2 bg-[#0F172A] p-3 rounded-xl border border-gray-800 text-xs">
                                    <div>
                                        <span className="text-[10px] text-gray-400 block uppercase">Responses</span>
                                        <span className="font-bold text-white text-sm">{survey.responses_count} submitted</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-gray-400 block uppercase">Avg Satisfaction</span>
                                        <div className="flex items-center gap-1 font-bold text-amber-400 text-sm">
                                            <Star size={14} className="fill-amber-400 text-amber-400" />
                                            <span>{survey.avg_score.toFixed(1)} / 5.0</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-3 border-t border-gray-800 flex items-center justify-between gap-2">
                                <button
                                    onClick={() => {
                                        setPreviewSurvey(survey);
                                        setPreviewAnswers({});
                                        setPreviewSubmitted(false);
                                    }}
                                    className="flex items-center gap-1.5 text-xs font-bold text-pink-400 hover:text-pink-300 bg-pink-500/10 hover:bg-pink-500/20 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                                    title="Preview & Test Fill Survey"
                                >
                                    <Eye size={14} /> Preview
                                </button>

                                <button
                                    onClick={() => setAnalyticsSurvey(survey)}
                                    className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                                    title="View Response Analytics"
                                >
                                    <BarChart3 size={14} /> Analytics
                                </button>

                                <button
                                    onClick={() => copyLink(survey.access_token)}
                                    className="p-1.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                                    title="Copy Public Share Link"
                                >
                                    <Copy size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ========================================================================= */}
            {/* SURVEY BUILDER MODAL                                                      */}
            {/* ========================================================================= */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0F172A] border border-gray-700 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-pink-500/20 text-pink-400 rounded-xl">
                                    <PenTool size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base">Survey Creator & Question Builder</h3>
                                    <p className="text-xs text-gray-400">Design custom questionnaires, rating scales, and intake workflows</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveNewSurvey} className="space-y-4 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="sm:col-span-2">
                                    <label className="block text-gray-300 font-semibold mb-1">Survey Title *</label>
                                    <input
                                        type="text"
                                        required
                                        value={builderTitle}
                                        onChange={(e) => setBuilderTitle(e.target.value)}
                                        placeholder="e.g. Q1 Client Experience & Satisfaction Survey"
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-1">Purpose Category</label>
                                    <select
                                        value={builderCategory}
                                        onChange={(e) => setBuilderCategory(e.target.value as any)}
                                        className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-pink-500 cursor-pointer"
                                    >
                                        <option value="Customer CSAT">Customer CSAT</option>
                                        <option value="Lead Qualification">Lead Qualification</option>
                                        <option value="Employee 360">Employee 360</option>
                                        <option value="Project Handover">Project Handover</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-300 font-semibold mb-1">Purpose Description</label>
                                <textarea
                                    rows={2}
                                    value={builderDesc}
                                    onChange={(e) => setBuilderDesc(e.target.value)}
                                    placeholder="Explain the purpose of this survey to respondents..."
                                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                                />
                            </div>

                            {/* Current Question List */}
                            <div className="space-y-3 bg-[#1E293B] p-4 rounded-2xl border border-gray-700/80">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                                        <ListChecks size={14} className="text-pink-400" /> Survey Questions ({builderQuestions.length})
                                    </h4>
                                    <span className="text-[11px] text-gray-400">Drag or delete to reorganize</span>
                                </div>

                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                    {builderQuestions.map((q, idx) => (
                                        <div key={q.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#0F172A] border border-gray-700">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-[10px] text-pink-400 font-bold">Q{idx + 1}</span>
                                                    <span className="text-white font-medium text-xs">{q.title}</span>
                                                </div>
                                                <div className="text-[10px] text-gray-400 uppercase font-semibold">
                                                    Type: {q.type.replace("_", " ")}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveQuestionFromBuilder(q.id)}
                                                className="text-gray-500 hover:text-rose-400 p-1 rounded cursor-pointer"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Add Question Section */}
                                <div className="pt-3 border-t border-gray-700 space-y-2">
                                    <span className="font-bold text-gray-300 text-[11px] block">+ Add Another Question</span>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <input
                                            type="text"
                                            value={newQTitle}
                                            onChange={(e) => setNewQTitle(e.target.value)}
                                            placeholder="Question text (e.g. Rate our API latency)..."
                                            className="sm:col-span-2 bg-[#0F172A] border border-gray-700 rounded-xl px-3 py-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                                        />
                                        <select
                                            value={newQType}
                                            onChange={(e) => setNewQType(e.target.value as any)}
                                            className="bg-[#0F172A] border border-gray-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-pink-500 cursor-pointer"
                                        >
                                            <option value="rating">Rating (1-5 Stars)</option>
                                            <option value="nps">NPS Scale (0-10)</option>
                                            <option value="multiple_choice">Multiple Choice</option>
                                            <option value="text">Open Text</option>
                                            <option value="boolean">Yes / No</option>
                                        </select>
                                    </div>

                                    {newQType === "multiple_choice" && (
                                        <input
                                            type="text"
                                            value={newQOptions}
                                            onChange={(e) => setNewQOptions(e.target.value)}
                                            placeholder="Comma separated options (e.g. Bronze, Silver, Gold)..."
                                            className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-3 py-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                                        />
                                    )}

                                    <button
                                        type="button"
                                        onClick={handleAddQuestionToBuilder}
                                        className="bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer"
                                    >
                                        + Insert Question
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-2.5 rounded-xl font-semibold transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-pink-600 hover:bg-pink-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-pink-600/30 transition-all cursor-pointer active:scale-95"
                                >
                                    Publish Survey
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* LIVE PREVIEW & INTERACTIVE SURVEY FILL MODAL                              */}
            {/* ========================================================================= */}
            {previewSurvey && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0F172A] border border-gray-700 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                            <div className="flex items-center gap-2">
                                <span className="p-2 bg-pink-500/20 text-pink-400 rounded-xl">
                                    <Eye size={18} />
                                </span>
                                <div>
                                    <span className="text-[10px] font-bold uppercase text-pink-400">Live Respondent Preview</span>
                                    <h3 className="font-bold text-white text-base">{previewSurvey.title}</h3>
                                </div>
                            </div>
                            <button
                                onClick={() => setPreviewSurvey(null)}
                                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {previewSubmitted ? (
                            <div className="py-12 text-center space-y-3">
                                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h4 className="text-lg font-bold text-white">Thank You for Your Feedback!</h4>
                                <p className="text-xs text-gray-400">Your test response has been simulated and verified successfully.</p>
                                <button
                                    onClick={() => {
                                        setPreviewSubmitted(false);
                                        setPreviewAnswers({});
                                    }}
                                    className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl mt-4 cursor-pointer"
                                >
                                    Fill Again
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6 text-xs">
                                <p className="text-gray-300 bg-[#1E293B] p-3.5 rounded-xl border border-gray-800">
                                    {previewSurvey.description}
                                </p>

                                {previewSurvey.questions.map((q, idx) => (
                                    <div key={q.id} className="space-y-2 bg-[#1E293B]/70 p-4 rounded-2xl border border-gray-800">
                                        <label className="font-bold text-white block">
                                            {idx + 1}. {q.title} {q.required && <span className="text-pink-400">*</span>}
                                        </label>

                                        {q.type === "rating" && (
                                            <div className="flex gap-2 pt-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setPreviewAnswers({ ...previewAnswers, [q.id]: star })}
                                                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                                                            (previewAnswers[q.id] || 0) >= star
                                                                ? "bg-amber-500/20 border-amber-500 text-amber-400"
                                                                : "bg-[#0F172A] border-gray-700 text-gray-500"
                                                        }`}
                                                    >
                                                        <Star size={18} className={(previewAnswers[q.id] || 0) >= star ? "fill-amber-400" : ""} />
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {q.type === "nps" && (
                                            <div className="grid grid-cols-11 gap-1 pt-1">
                                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                                                    <button
                                                        key={score}
                                                        type="button"
                                                        onClick={() => setPreviewAnswers({ ...previewAnswers, [q.id]: score })}
                                                        className={`py-2 rounded-lg border font-bold text-center transition-all cursor-pointer ${
                                                            previewAnswers[q.id] === score
                                                                ? "bg-pink-600 border-pink-500 text-white"
                                                                : "bg-[#0F172A] border-gray-700 text-gray-400 hover:border-gray-500"
                                                        }`}
                                                    >
                                                        {score}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {q.type === "multiple_choice" && (
                                            <div className="space-y-1.5 pt-1">
                                                {q.options?.map((opt, oIdx) => (
                                                    <label
                                                        key={oIdx}
                                                        onClick={() => setPreviewAnswers({ ...previewAnswers, [q.id]: opt })}
                                                        className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer ${
                                                            previewAnswers[q.id] === opt
                                                                ? "bg-pink-500/15 border-pink-500 text-pink-300"
                                                                : "bg-[#0F172A] border-gray-700 text-gray-300 hover:border-gray-600"
                                                        }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={q.id}
                                                            checked={previewAnswers[q.id] === opt}
                                                            onChange={() => {}}
                                                            className="accent-pink-500"
                                                        />
                                                        <span>{opt}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}

                                        {q.type === "boolean" && (
                                            <div className="flex gap-3 pt-1">
                                                {["Yes", "No"].map((bVal) => (
                                                    <button
                                                        key={bVal}
                                                        type="button"
                                                        onClick={() => setPreviewAnswers({ ...previewAnswers, [q.id]: bVal })}
                                                        className={`flex-1 py-2 rounded-xl border font-bold text-center transition-all cursor-pointer ${
                                                            previewAnswers[q.id] === bVal
                                                                ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                                                                : "bg-[#0F172A] border-gray-700 text-gray-400"
                                                        }`}
                                                    >
                                                        {bVal}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {q.type === "text" && (
                                            <textarea
                                                rows={3}
                                                value={previewAnswers[q.id] || ""}
                                                onChange={(e) => setPreviewAnswers({ ...previewAnswers, [q.id]: e.target.value })}
                                                placeholder="Type your response here..."
                                                className="w-full bg-[#0F172A] border border-gray-700 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                                            />
                                        )}
                                    </div>
                                ))}

                                <div className="flex gap-3 pt-3 border-t border-gray-800">
                                    <button
                                        type="button"
                                        onClick={() => setPreviewSurvey(null)}
                                        className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-2.5 rounded-xl font-semibold transition-all cursor-pointer"
                                    >
                                        Close Preview
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPreviewSubmitted(true);
                                            showToast("✅ Test response submitted successfully!");
                                        }}
                                        className="flex-1 bg-pink-600 hover:bg-pink-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-pink-600/30 transition-all cursor-pointer"
                                    >
                                        Submit Test Response
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* SURVEY RESPONSE ANALYTICS MODAL                                           */}
            {/* ========================================================================= */}
            {analyticsSurvey && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0F172A] border border-gray-700 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl">
                                    <BarChart3 size={20} />
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase text-cyan-400">Response Insights & Analytics</span>
                                    <h3 className="font-bold text-white text-base">{analyticsSurvey.title}</h3>
                                </div>
                            </div>
                            <button
                                onClick={() => setAnalyticsSurvey(null)}
                                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Summary Metric Badges */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-[#1E293B] p-4 rounded-2xl border border-gray-800 text-center">
                                <span className="text-[10px] text-gray-400 uppercase font-semibold">Total Responses</span>
                                <div className="text-2xl font-bold text-white mt-1">{analyticsSurvey.responses_count}</div>
                                <span className="text-[10px] text-emerald-400 font-bold">+12% this week</span>
                            </div>
                            <div className="bg-[#1E293B] p-4 rounded-2xl border border-gray-800 text-center">
                                <span className="text-[10px] text-gray-400 uppercase font-semibold">Satisfaction Score</span>
                                <div className="text-2xl font-bold text-amber-400 mt-1">{analyticsSurvey.avg_score.toFixed(1)} / 5.0</div>
                                <span className="text-[10px] text-amber-300 font-bold">96% Positive</span>
                            </div>
                            <div className="bg-[#1E293B] p-4 rounded-2xl border border-gray-800 text-center">
                                <span className="text-[10px] text-gray-400 uppercase font-semibold">Net Promoter Score</span>
                                <div className="text-2xl font-bold text-cyan-400 mt-1">+78</div>
                                <span className="text-[10px] text-cyan-300 font-bold">World Class</span>
                            </div>
                        </div>

                        {/* Recent Submitted Feedback Log */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-gray-300 flex items-center gap-2">
                                <MessageSquare size={14} className="text-cyan-400" /> Recent Stakeholder Feedback Entries
                            </h4>

                            <div className="space-y-2.5">
                                {[
                                    { name: "Acme Logistics Director", date: "Yesterday", rating: 5, comment: "The warehouse RFID scanner integration saved our shipping floor 4 hours daily." },
                                    { name: "Apex Financial Controller", date: "3 days ago", rating: 5, comment: "Trial balance generation and tax breakdown export works effortlessly." },
                                    { name: "Global Retail Operations", date: "5 days ago", rating: 4, comment: "Loving the new unified headers and fast lead pool scraper." }
                                ].map((fb, idx) => (
                                    <div key={idx} className="bg-[#1E293B] p-4 rounded-2xl border border-gray-800 space-y-1.5 text-xs">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-white">{fb.name}</span>
                                            <span className="text-[11px] text-gray-500">{fb.date}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-amber-400">
                                            {Array.from({ length: fb.rating }).map((_, i) => (
                                                <Star key={i} size={12} className="fill-amber-400" />
                                            ))}
                                        </div>
                                        <p className="text-gray-300 text-[11px] italic">"{fb.comment}"</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-3 border-t border-gray-800 flex justify-end">
                            <button
                                onClick={() => setAnalyticsSurvey(null)}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-5 py-2 rounded-xl text-xs transition-all cursor-pointer"
                            >
                                Close Analytics
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
