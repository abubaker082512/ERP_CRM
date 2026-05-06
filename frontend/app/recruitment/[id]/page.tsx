"use client";
import { fetchAPI } from "@/lib/api";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Plus, Mail, Phone, Calendar, UserPlus, FileText, Settings, User
} from "lucide-react";

const STAGES = [
  { id: "new", name: "New" },
  { id: "initial", name: "Initial Qualification" },
  { id: "interview", name: "First Interview" },
  { id: "second_interview", name: "Second Interview" },
  { id: "contract", name: "Contract Proposal" },
];

export default function JobApplicantsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newApplicant, setNewApplicant] = useState({ name: "", email_from: "", phone: "" });
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [hiring, setHiring] = useState<string | null>(null); // applicant id

  useEffect(() => { loadData(); }, [params.id]);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    try {
      const [jobRes, appRes] = await Promise.all([
        fetchAPI(`/recruitment/jobs/${params.id}`),
        fetchAPI(`/recruitment/applicants?job_id=${params.id}`),
      ]);
      if (jobRes.ok) setJob(await jobRes.json());
      else router.push("/recruitment");
      if (appRes.ok) setApplicants(await appRes.json());
    } catch { router.push("/recruitment"); }
    finally { setLoading(false); }
  };

  const createApplicant = async () => {
    if (!newApplicant.name.trim()) return;
    const res = await fetchAPI("/recruitment/applicants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newApplicant, job_id: params.id, stage_id: "new" }),
    });
    if (res.ok) {
      const data = await res.json();
      setApplicants([...applicants, data]);
      setNewApplicant({ name: "", email_from: "", phone: "" });
      setIsModalOpen(false);
      showToast("Applicant added");
    }
  };

  const updateStage = async (applicantId: string, newStage: string) => {
    const res = await fetchAPI(`/recruitment/applicants/${applicantId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage_id: newStage }),
    });
    if (res.ok) {
      setApplicants(applicants.map(a => a.id === applicantId ? { ...a, stage_id: newStage } : a));
    }
  };

  const handleHire = async (applicantId: string) => {
    setHiring(applicantId);
    try {
      const res = await fetchAPI(`/recruitment/applicants/${applicantId}/hire`, { method: "POST" });
      if (res.ok) {
        showToast("Applicant hired & employee record created!");
        setApplicants(applicants.map(a => a.id === applicantId ? { ...a, stage_id: "hired" } : a));
      } else showToast("Failed to hire", "error");
    } finally { setHiring(null); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!job) return null;

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto flex flex-col">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg border ${toast.type === "success" ? "bg-green-500/20 border-green-500/30 text-green-400" : "bg-red-500/20 border-red-500/30 text-red-400"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-400">
        <Link href="/recruitment" className="flex items-center gap-1 hover:text-teal-400 transition-colors">
          <ArrowLeft size={16} /> Recruitment
        </Link>
        <span>/</span>
        <span className="text-white">{job.name}</span>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">{job.name} Applicants</h1>
          <p className="text-sm text-gray-400">Target: {job.no_of_recruitment} new employees</p>
        </div>
        <button onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Add Applicant
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-6 overflow-x-auto pb-6 flex-1 items-start">
        {STAGES.map((stage) => {
          const stageApps = applicants.filter(a => a.stage_id === stage.id);
          return (
            <div key={stage.id} className="flex-shrink-0 w-80 bg-white/5 rounded-xl border border-white/10 p-4 flex flex-col max-h-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-white">{stage.name}</h3>
                <span className="bg-teal-500/20 text-teal-400 text-xs px-2 py-0.5 rounded-full font-medium">
                  {stageApps.length}
                </span>
              </div>
              <div className="space-y-3 overflow-y-auto pr-1">
                {stageApps.map((app) => (
                  <div key={app.id} className="bg-[#1E293B] border border-gray-700 rounded-lg p-4 cursor-grab hover:border-teal-500 transition-all relative group shadow-sm">
                    <h4 className="text-white font-medium text-sm mb-1">{app.name}</h4>
                    {app.email_from && <p className="text-xs text-gray-400 flex items-center gap-1 mb-1"><Mail size={10} /> {app.email_from}</p>}
                    {app.phone && <p className="text-xs text-gray-400 flex items-center gap-1"><Phone size={10} /> {app.phone}</p>}

                    {/* Stage Controls */}
                    <div className="mt-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <select
                        value={app.stage_id}
                        onChange={(e) => updateStage(app.id, e.target.value)}
                        className="bg-gray-800 text-gray-300 text-xs border border-gray-700 rounded px-1 py-1 w-full outline-none"
                      >
                        {STAGES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>

                    {/* Hire Button for Contract stage */}
                    {stage.id === "contract" && (
                      <button onClick={() => handleHire(app.id)} disabled={hiring === app.id}
                        className="mt-3 w-full flex justify-center items-center gap-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 py-1.5 rounded text-xs font-medium transition-colors">
                        <UserPlus size={12} /> {hiring === app.id ? "Hiring..." : "Hire Employee"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Hired Column */}
        <div className="flex-shrink-0 w-80 bg-green-900/10 rounded-xl border border-green-500/20 p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-green-400 flex items-center gap-1"><User size={16} /> Hired</h3>
            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full font-medium">
              {applicants.filter(a => a.stage_id === "hired").length}
            </span>
          </div>
          <div className="space-y-3 overflow-y-auto pr-1">
            {applicants.filter(a => a.stage_id === "hired").map((app) => (
              <div key={app.id} className="bg-green-500/5 border border-green-500/20 rounded-lg p-4 relative shadow-sm">
                <h4 className="text-white font-medium text-sm mb-1">{app.name}</h4>
                <p className="text-xs text-gray-400 flex items-center gap-1"><UserPlus size={10} /> Employee Created</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1E293B] rounded-xl p-6 w-full max-w-md border border-gray-700 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Add Applicant</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Name</label>
                <input type="text" value={newApplicant.name} onChange={(e) => setNewApplicant({ ...newApplicant, name: e.target.value })}
                  className="w-full bg-[#0F172A] border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-teal-500 outline-none" placeholder="Jane Doe" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
                <input type="email" value={newApplicant.email_from} onChange={(e) => setNewApplicant({ ...newApplicant, email_from: e.target.value })}
                  className="w-full bg-[#0F172A] border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-teal-500 outline-none" placeholder="jane@example.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Phone</label>
                <input type="tel" value={newApplicant.phone} onChange={(e) => setNewApplicant({ ...newApplicant, phone: e.target.value })}
                  className="w-full bg-[#0F172A] border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-teal-500 outline-none" placeholder="+1 234 567 890" />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-300 hover:text-white text-sm font-medium">Cancel</button>
              <button onClick={createApplicant} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
