"use client";

import { useState } from "react";
import RecruitmentHeader from "@/components/recruitment/RecruitmentHeader";
import { 
  Plus, 
  Target, 
  Users, 
  Video, 
  Mail, 
  Phone, 
  Download, 
  Star, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Briefcase, 
  Calendar,
  DollarSign,
  Building2,
  ExternalLink,
  ChevronRight,
  Filter
} from "lucide-react";
import Link from "next/link";

type Job = {
  id: string;
  name: string;
  department: string;
  no_of_recruitment: number;
  applicants_count: number;
  state: "open" | "closed" | "draft";
  salary_range: string;
  location: string;
};

type Stage = "initial" | "interview1" | "tech_test" | "offer" | "hired" | "rejected";

type Applicant = {
  id: string;
  name: string;
  job_id: string;
  job_title: string;
  email: string;
  phone: string;
  stage: Stage;
  rating: number; // 1 to 5
  expected_salary: string;
  applied_at: string;
  experience_years: number;
  notes?: string;
  meet_link?: string;
};

const INITIAL_JOBS: Job[] = [
  {
    id: "JOB-001",
    name: "Senior Full Stack Engineer",
    department: "Engineering",
    no_of_recruitment: 3,
    applicants_count: 8,
    state: "open",
    salary_range: "$110,000 - $140,000",
    location: "Remote / Dubai"
  },
  {
    id: "JOB-002",
    name: "Enterprise Account Executive",
    department: "Sales",
    no_of_recruitment: 2,
    applicants_count: 6,
    state: "open",
    salary_range: "$80,000 - $100,000 + OTE",
    location: "New York, USA"
  },
  {
    id: "JOB-003",
    name: "Financial Controller",
    department: "Finance",
    no_of_recruitment: 1,
    applicants_count: 4,
    state: "open",
    salary_range: "$95,000 - $115,000",
    location: "London, UK"
  },
  {
    id: "JOB-004",
    name: "Supply Chain & Operations Manager",
    department: "Operations",
    no_of_recruitment: 1,
    applicants_count: 3,
    state: "open",
    salary_range: "$85,000 - $105,000",
    location: "Singapore"
  }
];

const INITIAL_APPLICANTS: Applicant[] = [
  {
    id: "APP-101",
    name: "Sarah Jenkins",
    job_id: "JOB-001",
    job_title: "Senior Full Stack Engineer",
    email: "sarah.j@example.com",
    phone: "+1 415-555-0192",
    stage: "tech_test",
    rating: 5,
    expected_salary: "$130,000",
    applied_at: "2026-10-02",
    experience_years: 7,
    notes: "Top-tier Next.js and PostgreSQL knowledge. Passed live coding with flying colors.",
    meet_link: "/meet?room=interview-sarah-jenkins"
  },
  {
    id: "APP-102",
    name: "David Chen",
    job_id: "JOB-001",
    job_title: "Senior Full Stack Engineer",
    email: "dchen.dev@example.com",
    phone: "+1 650-555-0144",
    stage: "interview1",
    rating: 4,
    expected_salary: "$125,000",
    applied_at: "2026-10-04",
    experience_years: 5,
    notes: "Solid system design background. Scheduled for round 1 cultural interview.",
    meet_link: "/meet?room=interview-david-chen"
  },
  {
    id: "APP-103",
    name: "Marcus Vance",
    job_id: "JOB-002",
    job_title: "Enterprise Account Executive",
    email: "marcus.v@salesleaders.io",
    phone: "+1 212-555-0811",
    stage: "offer",
    rating: 5,
    expected_salary: "$95,000",
    applied_at: "2026-09-28",
    experience_years: 8,
    notes: "Proven track record closing \$1M+ ARR contracts in SaaS ERP space.",
    meet_link: "/meet?room=interview-marcus-vance"
  },
  {
    id: "APP-104",
    name: "Elena Rostova",
    job_id: "JOB-003",
    job_title: "Financial Controller",
    email: "elena.rostova@cpa-world.org",
    phone: "+44 20 7946 0912",
    stage: "hired",
    rating: 5,
    expected_salary: "$110,000",
    applied_at: "2026-09-20",
    experience_years: 10,
    notes: "Offer accepted! Starting 1st of next month. Handed over to HR for onboarding.",
    meet_link: "/meet?room=interview-elena-rostova"
  },
  {
    id: "APP-105",
    name: "Alex Rivera",
    job_id: "JOB-004",
    job_title: "Supply Chain & Operations Manager",
    email: "arivera@logistics-pro.com",
    phone: "+65 6789 0123",
    stage: "initial",
    rating: 3,
    expected_salary: "$90,000",
    applied_at: "2026-10-05",
    experience_years: 4,
    notes: "Resume reviewed. Needs initial phone screen to verify ERP MRP experience.",
    meet_link: "/meet?room=interview-alex-rivera"
  }
];

const STAGES: { id: Stage; name: string; color: string }[] = [
  { id: "initial", name: "Initial Screening", color: "border-blue-500 bg-blue-500/10 text-blue-400" },
  { id: "interview1", name: "1st Interview", color: "border-purple-500 bg-purple-500/10 text-purple-400" },
  { id: "tech_test", name: "Technical / Practical", color: "border-amber-500 bg-amber-500/10 text-amber-400" },
  { id: "offer", name: "Contract Offer", color: "border-emerald-500 bg-emerald-500/10 text-emerald-400" },
  { id: "hired", name: "Hired & Onboarded", color: "border-teal-500 bg-teal-500/10 text-teal-400" },
  { id: "rejected", name: "Archived / Rejected", color: "border-red-500 bg-red-500/10 text-red-400" },
];

export default function RecruitmentPage() {
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [applicants, setApplicants] = useState<Applicant[]>(INITIAL_APPLICANTS);
  const [activeTab, setActiveTab] = useState<"pipeline" | "jobs" | "table">("pipeline");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>("ALL");

  // Modals
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isApplicantModalOpen, setIsApplicantModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

  // New Job Form
  const [jobName, setJobName] = useState("");
  const [jobDept, setJobDept] = useState("Engineering");
  const [jobCount, setJobCount] = useState(1);
  const [jobSalary, setJobSalary] = useState("$90,000 - $120,000");
  const [jobLocation, setJobLocation] = useState("Remote");

  // New Applicant Form
  const [appName, setAppName] = useState("");
  const [appEmail, setAppEmail] = useState("");
  const [appPhone, setAppPhone] = useState("");
  const [appJobId, setAppJobId] = useState(INITIAL_JOBS[0].id);
  const [appSalary, setAppSalary] = useState("$100,000");
  const [appExp, setAppExp] = useState(4);
  const [appNotes, setAppNotes] = useState("");

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobName.trim()) return;

    const newJob: Job = {
      id: `JOB-${Date.now().toString().slice(-3)}`,
      name: jobName,
      department: jobDept,
      no_of_recruitment: Number(jobCount),
      applicants_count: 0,
      state: "open",
      salary_range: jobSalary,
      location: jobLocation
    };

    setJobs([newJob, ...jobs]);
    setJobName("");
    setIsJobModalOpen(false);
  };

  const handleCreateApplicant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName.trim() || !appEmail.trim()) return;

    const targetJob = jobs.find(j => j.id === appJobId) || jobs[0];

    const slug = appName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const newApp: Applicant = {
      id: `APP-${Date.now().toString().slice(-3)}`,
      name: appName,
      job_id: targetJob.id,
      job_title: targetJob.name,
      email: appEmail,
      phone: appPhone,
      stage: "initial",
      rating: 3,
      expected_salary: appSalary,
      applied_at: new Date().toISOString().split("T")[0],
      experience_years: Number(appExp),
      notes: appNotes,
      meet_link: `/meet?room=interview-${slug}`
    };

    setApplicants([newApp, ...applicants]);
    // update job count
    setJobs(jobs.map(j => j.id === targetJob.id ? { ...j, applicants_count: j.applicants_count + 1 } : j));

    setAppName("");
    setAppEmail("");
    setAppPhone("");
    setAppNotes("");
    setIsApplicantModalOpen(false);
  };

  const handleMoveStage = (applicantId: string, nextStage: Stage) => {
    setApplicants(applicants.map(app => 
      app.id === applicantId ? { ...app, stage: nextStage } : app
    ));
    if (selectedApplicant && selectedApplicant.id === applicantId) {
      setSelectedApplicant(prev => prev ? { ...prev, stage: nextStage } : null);
    }
  };

  const handleRateApplicant = (applicantId: string, rating: number) => {
    setApplicants(applicants.map(app => 
      app.id === applicantId ? { ...app, rating } : app
    ));
    if (selectedApplicant && selectedApplicant.id === applicantId) {
      setSelectedApplicant(prev => prev ? { ...prev, rating } : null);
    }
  };

  const exportApplicantsCSV = () => {
    const headers = ["Applicant ID", "Candidate Name", "Applied Role", "Email", "Phone", "Stage", "Rating (1-5)", "Expected Salary", "Applied Date", "Interview Room"];
    const rows = applicants.map(a => [
      a.id,
      `"${a.name}"`,
      `"${a.job_title}"`,
      a.email,
      a.phone,
      a.stage,
      a.rating,
      `"${a.expected_salary}"`,
      a.applied_at,
      a.meet_link || ""
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `recruitment_applicants_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered applicants
  const filteredApplicants = applicants.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJob = selectedJobFilter === "ALL" || a.job_id === selectedJobFilter;
    return matchesSearch && matchesJob;
  });

  // KPI Calculations
  const totalOpenings = jobs.reduce((acc, j) => acc + j.no_of_recruitment, 0);
  const activeCandidates = applicants.filter(a => a.stage !== "rejected" && a.stage !== "hired").length;
  const hiredCount = applicants.filter(a => a.stage === "hired").length;
  const inInterviewCount = applicants.filter(a => a.stage === "interview1" || a.stage === "tech_test").length;

  return (
    <div className="flex flex-col h-screen bg-[#0a0d14] text-white">
      <RecruitmentHeader 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
        onNewJob={() => setIsJobModalOpen(true)}
      />

      <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-6">
        {/* KPI Dashboard Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="galaxy-card p-4 border border-blue-500/20 bg-blue-950/10 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Open Positions</p>
              <h3 className="text-2xl font-bold text-blue-400 mt-1">{totalOpenings} Targets</h3>
              <p className="text-xs text-gray-400 mt-1">{jobs.length} Active Job Listings</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
              <Briefcase size={22} />
            </div>
          </div>

          <div className="galaxy-card p-4 border border-purple-500/20 bg-purple-950/10 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Pipeline</p>
              <h3 className="text-2xl font-bold text-purple-400 mt-1">{activeCandidates} Candidates</h3>
              <p className="text-xs text-gray-400 mt-1">In review & evaluations</p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
              <Users size={22} />
            </div>
          </div>

          <div className="galaxy-card p-4 border border-amber-500/20 bg-amber-950/10 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">In Interviews</p>
              <h3 className="text-2xl font-bold text-amber-400 mt-1">{inInterviewCount} In Progress</h3>
              <p className="text-xs text-gray-400 mt-1">Video Meet scheduled</p>
            </div>
            <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400">
              <Video size={22} />
            </div>
          </div>

          <div className="galaxy-card p-4 border border-teal-500/20 bg-teal-950/10 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Hired & Closed</p>
              <h3 className="text-2xl font-bold text-teal-400 mt-1">{hiredCount} Onboarded</h3>
              <p className="text-xs text-gray-400 mt-1">Transferred to HR Directory</p>
            </div>
            <div className="p-3 bg-teal-500/20 rounded-xl text-teal-400">
              <CheckCircle2 size={22} />
            </div>
          </div>
        </div>

        {/* Action Bar & Filter Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111622] p-3.5 rounded-xl border border-gray-800">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-gray-900/80 p-1 rounded-lg border border-gray-800">
              <button
                onClick={() => setActiveTab("pipeline")}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                  activeTab === "pipeline" ? "bg-purple-600 text-white shadow-md shadow-purple-900/40" : "text-gray-400 hover:text-white"
                }`}
              >
                Kanban Pipeline
              </button>
              <button
                onClick={() => setActiveTab("jobs")}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                  activeTab === "jobs" ? "bg-purple-600 text-white shadow-md shadow-purple-900/40" : "text-gray-400 hover:text-white"
                }`}
              >
                Job Positions ({jobs.length})
              </button>
              <button
                onClick={() => setActiveTab("table")}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                  activeTab === "table" ? "bg-purple-600 text-white shadow-md shadow-purple-900/40" : "text-gray-400 hover:text-white"
                }`}
              >
                All Candidates ({applicants.length})
              </button>
            </div>

            {/* Job Filter Selector */}
            <div className="flex items-center gap-2 ml-2">
              <Filter size={14} className="text-gray-400" />
              <select
                value={selectedJobFilter}
                onChange={(e) => setSelectedJobFilter(e.target.value)}
                className="bg-gray-900 text-xs text-gray-200 border border-gray-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-purple-500"
              >
                <option value="ALL">All Job Roles ({applicants.length})</option>
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>{j.name} ({j.department})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportApplicantsCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/80 hover:bg-gray-700 text-gray-200 rounded-lg text-xs font-semibold border border-gray-700 transition-all active:scale-95"
            >
              <Download size={14} /> Export CSV
            </button>
            <button
              onClick={() => setIsApplicantModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-lg shadow-purple-600/30 transition-all active:scale-95"
            >
              <Plus size={14} /> Add Applicant
            </button>
            <button
              onClick={() => setIsJobModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
            >
              <Briefcase size={14} /> Post Job Position
            </button>
          </div>
        </div>

        {/* TAB 1: KANBAN PIPELINE */}
        {activeTab === "pipeline" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start min-h-[500px]">
            {STAGES.map(stage => {
              const stageApps = filteredApplicants.filter(a => a.stage === stage.id);
              return (
                <div key={stage.id} className="bg-[#111622] rounded-xl border border-gray-800 flex flex-col max-h-[750px]">
                  {/* Column Header */}
                  <div className={`p-3 border-b border-gray-800 flex items-center justify-between rounded-t-xl bg-gray-900/40`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${stage.color.split(" ")[0].replace("border-", "bg-")}`}></span>
                      <span className="text-xs font-bold text-gray-200">{stage.name}</span>
                    </div>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-gray-800 text-gray-300">
                      {stageApps.length}
                    </span>
                  </div>

                  {/* Cards List */}
                  <div className="p-2 space-y-2.5 overflow-y-auto flex-1">
                    {stageApps.length === 0 ? (
                      <div className="py-8 text-center border-2 border-dashed border-gray-800/60 rounded-lg">
                        <p className="text-xs text-gray-500">No candidates</p>
                      </div>
                    ) : (
                      stageApps.map(app => (
                        <div
                          key={app.id}
                          className="galaxy-card p-3.5 border border-gray-800 hover:border-purple-500/50 bg-[#161c2d] hover:bg-[#1c243a] transition-all rounded-xl cursor-pointer group"
                          onClick={() => setSelectedApplicant(app)}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                                {app.name}
                              </h4>
                              <p className="text-[11px] text-gray-400 font-medium truncate max-w-[170px]">
                                {app.job_title}
                              </p>
                            </div>
                            <div className="flex items-center text-amber-400">
                              <Star size={12} className="fill-amber-400" />
                              <span className="text-[10px] font-bold ml-0.5">{app.rating}</span>
                            </div>
                          </div>

                          <div className="mt-2 text-[11px] text-gray-400 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <DollarSign size={11} className="text-emerald-400 shrink-0" />
                              <span>{app.expected_salary}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Calendar size={11} className="text-blue-400 shrink-0" />
                              <span>{app.experience_years} yrs exp • Applied {app.applied_at}</span>
                            </div>
                          </div>

                          {/* Action footer */}
                          <div className="mt-3 pt-2 border-t border-gray-800 flex items-center justify-between text-xs" onClick={(e) => e.stopPropagation()}>
                            {app.meet_link ? (
                              <Link
                                href={app.meet_link}
                                className="flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 font-semibold bg-purple-600/10 hover:bg-purple-600/20 px-2 py-1 rounded"
                              >
                                <Video size={11} /> Meet Room
                              </Link>
                            ) : (
                              <span className="text-[10px] text-gray-500">No meet set</span>
                            )}

                            {/* Quick Next Stage Switcher */}
                            {stage.id === "initial" && (
                              <button
                                onClick={() => handleMoveStage(app.id, "interview1")}
                                title="Move to 1st Interview"
                                className="text-gray-400 hover:text-purple-400 p-1"
                              >
                                <ArrowRight size={14} />
                              </button>
                            )}
                            {stage.id === "interview1" && (
                              <button
                                onClick={() => handleMoveStage(app.id, "tech_test")}
                                title="Move to Tech Test"
                                className="text-gray-400 hover:text-purple-400 p-1"
                              >
                                <ArrowRight size={14} />
                              </button>
                            )}
                            {stage.id === "tech_test" && (
                              <button
                                onClick={() => handleMoveStage(app.id, "offer")}
                                title="Make Offer"
                                className="text-gray-400 hover:text-emerald-400 p-1"
                              >
                                <ArrowRight size={14} />
                              </button>
                            )}
                            {stage.id === "offer" && (
                              <button
                                onClick={() => handleMoveStage(app.id, "hired")}
                                title="Mark as Hired"
                                className="text-gray-400 hover:text-teal-400 p-1"
                              >
                                <CheckCircle2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: JOB POSITIONS */}
        {activeTab === "jobs" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map(job => (
              <div
                key={job.id}
                className="galaxy-card p-5 border border-gray-800 hover:border-purple-500/40 bg-[#111622] rounded-xl transition-all space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
                      <Target size={22} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{job.name}</h3>
                      <p className="text-xs text-gray-400 font-medium">{job.department} • {job.location}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    job.state === "open" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-gray-800 text-gray-400"
                  }`}>
                    {job.state}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-gray-900/60 p-3 rounded-lg border border-gray-800/80 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase">Target Hires</span>
                    <span className="font-bold text-white text-sm">{job.no_of_recruitment} Openings</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase">Candidates</span>
                    <span className="font-bold text-purple-400 text-sm">{job.applicants_count} In Process</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-800">
                  <div className="flex items-center gap-1">
                    <DollarSign size={13} className="text-emerald-400" />
                    <span className="font-semibold text-gray-200">{job.salary_range}</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedJobFilter(job.id);
                      setActiveTab("pipeline");
                    }}
                    className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 hover:underline text-xs"
                  >
                    View Pipeline <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: ALL CANDIDATES TABLE */}
        {activeTab === "table" && (
          <div className="galaxy-card bg-[#111622] rounded-xl border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-gray-900/90 text-gray-400 uppercase text-[11px] font-bold border-b border-gray-800 tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Applicant Name</th>
                    <th className="px-4 py-3">Target Role</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Stage</th>
                    <th className="px-4 py-3">Rating</th>
                    <th className="px-4 py-3">Expected Salary</th>
                    <th className="px-4 py-3">Meet Interview</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {filteredApplicants.map(app => {
                    const stageConfig = STAGES.find(s => s.id === app.stage);
                    return (
                      <tr
                        key={app.id}
                        className="hover:bg-gray-800/40 transition-colors cursor-pointer"
                        onClick={() => setSelectedApplicant(app)}
                      >
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-white">{app.name}</div>
                          <div className="text-xs text-gray-400">{app.experience_years} years experience</div>
                        </td>
                        <td className="px-4 py-3.5 font-medium text-gray-200">
                          {app.job_title}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-400">
                          <div className="flex items-center gap-1"><Mail size={12} /> {app.email}</div>
                          <div className="flex items-center gap-1 mt-0.5"><Phone size={12} /> {app.phone}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${stageConfig?.color}`}>
                            {stageConfig?.name}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-0.5 text-amber-400">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star
                                key={star}
                                size={13}
                                className={star <= app.rating ? "fill-amber-400 text-amber-400" : "text-gray-600"}
                              />
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-emerald-400 text-xs">
                          {app.expected_salary}
                        </td>
                        <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                          {app.meet_link ? (
                            <Link
                              href={app.meet_link}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white rounded-lg text-xs font-bold border border-purple-500/30 transition-all"
                            >
                              <Video size={13} /> Launch Meet
                            </Link>
                          ) : (
                            <span className="text-gray-500 text-xs">None</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right text-xs" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedApplicant(app)}
                            className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded font-semibold transition-all"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* APPLICANT DETAIL DRAWER MODAL */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-gray-700 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex justify-between items-start border-b border-gray-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">{selectedApplicant.id}</span>
                <h3 className="text-xl font-bold text-white mt-1">{selectedApplicant.name}</h3>
                <p className="text-sm text-gray-400">{selectedApplicant.job_title}</p>
              </div>
              <button
                onClick={() => setSelectedApplicant(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Candidate Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-gray-900/60 p-4 rounded-xl border border-gray-800">
              <div>
                <span className="text-gray-500 block">Email</span>
                <span className="font-semibold text-gray-200 break-all">{selectedApplicant.email}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Phone</span>
                <span className="font-semibold text-gray-200">{selectedApplicant.phone}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Expected Comp</span>
                <span className="font-bold text-emerald-400">{selectedApplicant.expected_salary}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Experience</span>
                <span className="font-semibold text-gray-200">{selectedApplicant.experience_years} Years</span>
              </div>
              <div>
                <span className="text-gray-500 block">Applied Date</span>
                <span className="font-semibold text-gray-200">{selectedApplicant.applied_at}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Interviewer Rating</span>
                <div className="flex gap-1 text-amber-400 mt-1 cursor-pointer">
                  {[1, 2, 3, 4, 5].map(st => (
                    <Star
                      key={st}
                      size={14}
                      className={st <= selectedApplicant.rating ? "fill-amber-400" : "text-gray-600"}
                      onClick={() => handleRateApplicant(selectedApplicant.id, st)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div>
              <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Interview Assessment Notes</label>
              <p className="text-xs text-gray-300 bg-gray-900/90 p-3 rounded-lg border border-gray-800 leading-relaxed">
                {selectedApplicant.notes || "No interview notes added yet."}
              </p>
            </div>

            {/* Stage Selector */}
            <div>
              <label className="text-xs font-bold uppercase text-gray-400 block mb-2">Advance Stage Workflow</label>
              <div className="flex flex-wrap gap-2">
                {STAGES.map(st => (
                  <button
                    key={st.id}
                    onClick={() => handleMoveStage(selectedApplicant.id, st.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      selectedApplicant.stage === st.id
                        ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-900/40"
                        : "bg-gray-900 text-gray-400 border-gray-800 hover:text-white"
                    }`}
                  >
                    {st.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Meet Link & Action footer */}
            <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
              {selectedApplicant.meet_link ? (
                <Link
                  href={selectedApplicant.meet_link}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 transition-all active:scale-95"
                >
                  <Video size={16} /> Enter Video Interview Room
                </Link>
              ) : (
                <div></div>
              )}
              <button
                onClick={() => setSelectedApplicant(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-bold"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POST NEW JOB MODAL */}
      {isJobModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateJob} className="bg-[#111622] border border-gray-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Briefcase size={20} className="text-emerald-400" /> Post New Job Position
            </h3>
            
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">Job Title *</label>
              <input
                type="text"
                required
                value={jobName}
                onChange={e => setJobName(e.target.value)}
                placeholder="e.g. Lead Cloud Architect"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Department</label>
                <select
                  value={jobDept}
                  onChange={e => setJobDept(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Sales">Sales</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Human Resources">Human Resources</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Hiring Target (Heads)</label>
                <input
                  type="number"
                  min="1"
                  value={jobCount}
                  onChange={e => setJobCount(Number(e.target.value))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Target Salary Budget</label>
                <input
                  type="text"
                  value={jobSalary}
                  onChange={e => setJobSalary(e.target.value)}
                  placeholder="$90k - $120k"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Job Location</label>
                <input
                  type="text"
                  value={jobLocation}
                  onChange={e => setJobLocation(e.target.value)}
                  placeholder="Remote / On-site"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setIsJobModalOpen(false)}
                className="px-4 py-2 bg-gray-800 text-gray-300 hover:text-white rounded-lg text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-lg shadow-emerald-600/30"
              >
                Publish Job Position
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD APPLICANT MODAL */}
      {isApplicantModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateApplicant} className="bg-[#111622] border border-gray-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users size={20} className="text-purple-400" /> Register Candidate Application
            </h3>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">Target Job Position *</label>
              <select
                value={appJobId}
                onChange={e => setAppJobId(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              >
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>{j.name} ({j.department})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">Candidate Full Name *</label>
              <input
                type="text"
                required
                value={appName}
                onChange={e => setAppName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={appEmail}
                  onChange={e => setAppEmail(e.target.value)}
                  placeholder="candidate@example.com"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={appPhone}
                  onChange={e => setAppPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Expected Salary</label>
                <input
                  type="text"
                  value={appSalary}
                  onChange={e => setAppSalary(e.target.value)}
                  placeholder="$110,000"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  value={appExp}
                  onChange={e => setAppExp(Number(e.target.value))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">Screening Summary / Initial Notes</label>
              <textarea
                rows={2}
                value={appNotes}
                onChange={e => setAppNotes(e.target.value)}
                placeholder="Key strengths, portfolio links, initial impression..."
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setIsApplicantModalOpen(false)}
                className="px-4 py-2 bg-gray-800 text-gray-300 hover:text-white rounded-lg text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-lg shadow-purple-600/30"
              >
                Register Candidate
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
