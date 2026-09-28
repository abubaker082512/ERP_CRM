"use client";
import { fetchAPI } from "@/lib/api";
import { useState, useEffect } from "react";
import AppHeader from "@/components/layout/AppHeader";
import { PenTool, Link2, Eye, Plus, ListChecks, CheckCircle2, Copy } from "lucide-react";
import Link from "next/link";

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSurveyName, setNewSurveyName] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await fetchAPI("/surveys/surveys");
      if (res.ok) setSurveys(await res.json());
    } finally { setLoading(false); }
  };

  const createSurvey = async () => {
    if (!newSurveyName.trim()) return;
    const res = await fetchAPI("/surveys/surveys", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newSurveyName })
    });
    if (res.ok) {
      setNewSurveyName("");
      setIsModalOpen(false);
      loadData();
    }
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/surveys/fill/${token}`;
    navigator.clipboard.writeText(url);
    alert("Survey link copied!");
  };

  return (
    <div className="flex flex-col h-screen">
      <AppHeader title="Surveys" />

      <div className="flex-1 overflow-auto p-6 max-w-6xl mx-auto w-full">
        {/* Toolbar */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <ListChecks className="text-pink-500" /> My Surveys
            </h1>
          </div>
          <button onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-pink-600/20 active:scale-95">
            <Plus size={16} /> Create Survey
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {surveys.map(survey => (
              <div key={survey.id} className="bg-[#1E293B] border border-gray-700 hover:border-pink-500/50 rounded-xl p-6 transition-all group shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-pink-400 transition-colors line-clamp-2">{survey.title}</h3>
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${survey.state === "published" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-400 border-gray-500/30"}`}>
                    {survey.state}
                  </span>
                </div>
                
                <p className="text-sm text-gray-400 mb-6 line-clamp-2">{survey.description || "No description provided."}</p>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  {/* For now, just a placeholder route for the detail page. If it doesn't exist, it'll 404, but we can add later if needed. */}
                  <Link href={`#`} className="flex items-center gap-1.5 text-xs font-semibold text-pink-400 hover:text-pink-300 transition-colors bg-pink-500/10 px-3 py-1.5 rounded-md">
                    <PenTool size={14} /> Design
                  </Link>
                  <div className="flex gap-2">
                    <button onClick={() => copyLink(survey.access_token)} className="p-1.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-md transition-colors" title="Copy public link">
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-[#1E293B] rounded-2xl p-6 w-full max-w-sm border border-gray-700 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">New Survey</h3>
            <input type="text" value={newSurveyName} onChange={(e) => setNewSurveyName(e.target.value)}
              className="w-full bg-[#0F172A] border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-pink-500 outline-none mb-6" 
              placeholder="e.g. Employee Satisfaction" autoFocus />
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white font-medium">Cancel</button>
              <button onClick={createSurvey} className="bg-pink-600 hover:bg-pink-500 text-white px-5 py-2 rounded-xl font-bold">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
