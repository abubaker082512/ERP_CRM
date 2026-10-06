"use client";

import { useState, useEffect } from "react";
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
  Filter,
  Share2,
  Copy,
  Check,
  Globe,
  Sliders,
  Sparkles,
  Trash2,
  FileText,
  MapPin,
  Clock,
  Eye,
  UserCheck
} from "lucide-react";
import Link from "next/link";
import { 
  Job, 
  CustomQuestion, 
  JobFormConfig, 
  DEFAULT_JOBS 
} from "./apply/page";

type Stage = "initial" | "interview1" | "tech_test" | "offer" | "hired" | "rejected";

export type Applicant = {
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
  location?: string;
  linkedin?: string;
  portfolio?: string;
  resume_file?: string;
  notice_period?: string;
  cover_letter?: string;
  custom_answers?: Record<string, string>;
  notes?: string;
  meet_link?: string;
};

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
    location: "San Francisco, USA (Remote)",
    linkedin: "https://linkedin.com/in/sarah-jenkins-dev",
    portfolio: "https://github.com/sarahjenkins-code",
    resume_file: "Sarah_Jenkins_Staff_Engineer_CV.pdf",
    notice_period: "2 Weeks",
    custom_answers: {
      q1: "6 years of high-scale React/Next.js and GraphQL production systems.",
      q2: "2 Weeks",
      q3: "Yes"
    },
    notes: "Top-tier Next.js and PostgreSQL knowledge. Passed live architecture challenge with flying colors.",
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
    location: "Austin, TX (Remote)",
    linkedin: "https://linkedin.com/in/davidchen-swe",
    portfolio: "https://dchen.io",
    resume_file: "David_Chen_Resume.pdf",
    notice_period: "1 Month",
    custom_answers: {
      q1: "5 years with full-stack TypeScript & PostgreSQL microservices.",
      q2: "1 Month",
      q3: "Yes"
    },
    notes: "Solid system design background. Scheduled for round 1 cultural and tech interview.",
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
    expected_salary: "$95,000 + OTE",
    applied_at: "2026-09-28",
    experience_years: 8,
    location: "New York, USA",
    linkedin: "https://linkedin.com/in/marcus-vance-enterprise",
    resume_file: "Marcus_Vance_Sales_Record.pdf",
    notice_period: "Immediate",
    custom_answers: {
      q1: "Average deal size $120k ARR; closed $1.8M ARR in 2025 (145% of quota).",
      q2: "Salesforce, HubSpot, Outreach, ZoomInfo."
    },
    notes: "Proven track record closing $1M+ ARR contracts in SaaS ERP space. Final contract offer sent.",
    meet_link: "/meet?room=interview-marcus-vance"
  },
  {
    id: "APP-104",
    name: "Elena Rostova",
    job_id: "JOB-003",
    job_title: "Financial Controller & Auditor",
    email: "elena.rostova@cpa-world.org",
    phone: "+44 20 7946 0912",
    stage: "hired",
    rating: 5,
    expected_salary: "$110,000",
    applied_at: "2026-09-20",
    experience_years: 10,
    location: "London, UK",
    linkedin: "https://linkedin.com/in/elena-rostova-cpa",
    resume_file: "Elena_Rostova_Chartered_Accountant.pdf",
    notice_period: "Completed",
    custom_answers: {
      q1: "Yes",
      q2: "Yes"
    },
    notes: "Offer accepted! Starting 1st of next month. Handed over to HR for formal employee onboarding.",
    meet_link: "/meet?room=interview-elena-rostova"
  },
  {
    id: "APP-105",
    name: "Alex Rivera",
    job_id: "JOB-001",
    job_title: "Senior Full Stack Engineer",
    email: "arivera@cloudtech.dev",
    phone: "+65 6789 0123",
    stage: "initial",
    rating: 3,
    expected_salary: "$115,000",
    applied_at: "2026-10-05",
    experience_years: 4,
    location: "Singapore / Remote",
    linkedin: "https://linkedin.com/in/alex-rivera-tech",
    resume_file: "Alex_Rivera_CV.pdf",
    notice_period: "1 Month",
    notes: "Application submitted via online portal. Needs initial phone screen to verify ERP database experience.",
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
  const [jobs, setJobs] = useState<Job[]>(DEFAULT_JOBS);
  const [applicants, setApplicants] = useState<Applicant[]>(INITIAL_APPLICANTS);
  const [activeTab, setActiveTab] = useState<"pipeline" | "jobs" | "table">("pipeline");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>("ALL");
  const [copiedJobId, setCopiedJobId] = useState<string | null>(null);

  // Modals & Drawers
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isApplicantModalOpen, setIsApplicantModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [jobModalTab, setJobModalTab] = useState<"specs" | "form_designer" | "preview">("specs");

  // Job Builder State
  const [jobName, setJobName] = useState("");
  const [jobDept, setJobDept] = useState("Engineering");
  const [jobCount, setJobCount] = useState(1);
  const [jobSalary, setJobSalary] = useState("$90,000 - $120,000");
  const [jobLocation, setJobLocation] = useState("Remote / HQ");
  const [jobPolicy, setJobPolicy] = useState<"Remote" | "Hybrid" | "On-site">("Remote");
  const [jobType, setJobType] = useState<"Full-time" | "Contract" | "Part-time" | "Internship">("Full-time");
  const [jobExpLevel, setJobExpLevel] = useState<"Entry" | "Mid" | "Senior" | "Lead" | "Executive">("Senior");
  const [jobDescription, setJobDescription] = useState("");
  const [jobResponsibilities, setJobResponsibilities] = useState<string>("");
  const [jobRequirements, setJobRequirements] = useState<string>("");
  const [jobBenefits, setJobBenefits] = useState<string>("");
  const [jobClosingDate, setJobClosingDate] = useState("2026-12-31");

  // Form Designer Config for new/edited job
  const [formRequirePhone, setFormRequirePhone] = useState(true);
  const [formRequireResume, setFormRequireResume] = useState(true);
  const [formRequireLinkedIn, setFormRequireLinkedIn] = useState(true);
  const [formRequirePortfolio, setFormRequirePortfolio] = useState(false);
  const [formRequireCoverLetter, setFormRequireCoverLetter] = useState(false);
  const [formRequireNoticePeriod, setFormRequireNoticePeriod] = useState(true);
  const [formRequireSalary, setFormRequireSalary] = useState(true);
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionType, setNewQuestionType] = useState<"text" | "select" | "yes_no" | "number">("text");
  const [newQuestionRequired, setNewQuestionRequired] = useState(true);

  // New In-App Applicant Form
  const [appName, setAppName] = useState("");
  const [appEmail, setAppEmail] = useState("");
  const [appPhone, setAppPhone] = useState("");
  const [appJobId, setAppJobId] = useState(DEFAULT_JOBS[0].id);
  const [appSalary, setAppSalary] = useState("$100,000");
  const [appExp, setAppExp] = useState(4);
  const [appNotes, setAppNotes] = useState("");

  // Load from LocalStorage
  useEffect(() => {
    try {
      const savedJobs = localStorage.getItem("erp_recruitment_jobs");
      if (savedJobs) {
        const parsed = JSON.parse(savedJobs);
        if (Array.isArray(parsed) && parsed.length > 0) setJobs(parsed);
      }
      const savedApps = localStorage.getItem("erp_recruitment_applicants");
      if (savedApps) {
        const parsed = JSON.parse(savedApps);
        if (Array.isArray(parsed) && parsed.length > 0) setApplicants(parsed);
      }
    } catch {
      // ignore parse error
    }
  }, []);

  const saveJobsState = (newJobs: Job[]) => {
    setJobs(newJobs);
    try {
      localStorage.setItem("erp_recruitment_jobs", JSON.stringify(newJobs));
    } catch {}
  };

  const saveApplicantsState = (newApps: Applicant[]) => {
    setApplicants(newApps);
    try {
      localStorage.setItem("erp_recruitment_applicants", JSON.stringify(newApps));
    } catch {}
  };

  const openNewJobModal = () => {
    setEditingJob(null);
    setJobName("");
    setJobDept("Engineering");
    setJobCount(1);
    setJobSalary("$95,000 - $125,000");
    setJobLocation("Remote / HQ");
    setJobPolicy("Remote");
    setJobType("Full-time");
    setJobExpLevel("Senior");
    setJobDescription("We are looking for an exceptional talent to join our high-growth department.");
    setJobResponsibilities("Deliver mission-critical deliverables.\nCollaborate with cross-functional teams.\nMaintain code and architecture standards.");
    setJobRequirements("3+ years of relevant domain experience.\nProven record in modern tech or business operations.\nSelf-motivated team player.");
    setJobBenefits("Competitive compensation + performance incentives.\nFlexible remote setup with learning budget.\nGlobal health insurance.");
    setJobClosingDate("2026-12-31");
    setFormRequirePhone(true);
    setFormRequireResume(true);
    setFormRequireLinkedIn(true);
    setFormRequirePortfolio(false);
    setFormRequireCoverLetter(false);
    setFormRequireNoticePeriod(true);
    setFormRequireSalary(true);
    setCustomQuestions([
      { id: `q-${Date.now()}`, question: "How soon are you available to start?", type: "select", options: ["Immediately", "2 Weeks", "1 Month"], required: true }
    ]);
    setJobModalTab("specs");
    setIsJobModalOpen(true);
  };

  const openEditJobModal = (job: Job) => {
    setEditingJob(job);
    setJobName(job.name);
    setJobDept(job.department);
    setJobCount(job.no_of_recruitment);
    setJobSalary(job.salary_range);
    setJobLocation(job.location);
    setJobPolicy(job.work_policy || "Remote");
    setJobType(job.employment_type || "Full-time");
    setJobExpLevel(job.experience_level || "Senior");
    setJobDescription(job.description || "");
    setJobResponsibilities((job.responsibilities || []).join("\n"));
    setJobRequirements((job.requirements || []).join("\n"));
    setJobBenefits((job.benefits || []).join("\n"));
    setJobClosingDate(job.closing_date || "2026-12-31");
    
    // form config
    const cfg = job.form_config || {
      require_phone: true,
      require_resume: true,
      require_linkedin: true,
      require_portfolio: false,
      require_cover_letter: false,
      require_notice_period: true,
      require_expected_salary: true,
      custom_questions: []
    };
    setFormRequirePhone(cfg.require_phone);
    setFormRequireResume(cfg.require_resume);
    setFormRequireLinkedIn(cfg.require_linkedin);
    setFormRequirePortfolio(cfg.require_portfolio);
    setFormRequireCoverLetter(cfg.require_cover_letter);
    setFormRequireNoticePeriod(cfg.require_notice_period);
    setFormRequireSalary(cfg.require_expected_salary);
    setCustomQuestions(cfg.custom_questions || []);
    
    setJobModalTab("specs");
    setIsJobModalOpen(true);
  };

  const handleAddCustomQuestion = () => {
    if (!newQuestionText.trim()) return;
    const newQ: CustomQuestion = {
      id: `q-${Date.now()}`,
      question: newQuestionText.trim(),
      type: newQuestionType,
      options: newQuestionType === "select" ? ["Option 1", "Option 2", "Option 3"] : undefined,
      required: newQuestionRequired
    };
    setCustomQuestions([...customQuestions, newQ]);
    setNewQuestionText("");
  };

  const handleRemoveCustomQuestion = (qId: string) => {
    setCustomQuestions(customQuestions.filter(q => q.id !== qId));
  };

  const handleSaveJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobName.trim()) return;

    const formConfig: JobFormConfig = {
      require_phone: formRequirePhone,
      require_resume: formRequireResume,
      require_linkedin: formRequireLinkedIn,
      require_portfolio: formRequirePortfolio,
      require_cover_letter: formRequireCoverLetter,
      require_notice_period: formRequireNoticePeriod,
      require_expected_salary: formRequireSalary,
      custom_questions: customQuestions
    };

    const parsedResponsibilities = jobResponsibilities.split("\n").map(s => s.trim()).filter(Boolean);
    const parsedRequirements = jobRequirements.split("\n").map(s => s.trim()).filter(Boolean);
    const parsedBenefits = jobBenefits.split("\n").map(s => s.trim()).filter(Boolean);

    if (editingJob) {
      const updatedJobs = jobs.map(j => {
        if (j.id === editingJob.id) {
          return {
            ...j,
            name: jobName,
            department: jobDept,
            no_of_recruitment: Number(jobCount),
            salary_range: jobSalary,
            location: jobLocation,
            work_policy: jobPolicy,
            employment_type: jobType,
            experience_level: jobExpLevel,
            description: jobDescription,
            responsibilities: parsedResponsibilities,
            requirements: parsedRequirements,
            benefits: parsedBenefits,
            closing_date: jobClosingDate,
            form_config: formConfig
          };
        }
        return j;
      });
      saveJobsState(updatedJobs);
    } else {
      const newJob: Job = {
        id: `JOB-${Date.now().toString().slice(-3)}`,
        name: jobName,
        department: jobDept,
        no_of_recruitment: Number(jobCount),
        applicants_count: 0,
        state: "open",
        salary_range: jobSalary,
        location: jobLocation,
        work_policy: jobPolicy,
        employment_type: jobType,
        experience_level: jobExpLevel,
        description: jobDescription,
        responsibilities: parsedResponsibilities,
        requirements: parsedRequirements,
        benefits: parsedBenefits,
        closing_date: jobClosingDate,
        form_config: formConfig
      };
      saveJobsState([newJob, ...jobs]);
    }

    setIsJobModalOpen(false);
  };

  const handleToggleJobState = (jobId: string) => {
    const updated = jobs.map(j => {
      if (j.id === jobId) {
        const nextState = j.state === "open" ? "closed" : "open";
        return { ...j, state: nextState as "open" | "closed" };
      }
      return j;
    });
    saveJobsState(updated);
  };

  const handleCopyJobLink = (jobId: string) => {
    if (typeof window !== "undefined") {
      const link = `${window.location.origin}/recruitment/apply?jobId=${jobId}`;
      navigator.clipboard.writeText(link);
      setCopiedJobId(jobId);
      setTimeout(() => setCopiedJobId(null), 2500);
    }
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
      phone: appPhone || "N/A",
      stage: "initial",
      rating: 3,
      expected_salary: appSalary,
      applied_at: new Date().toISOString().split("T")[0],
      experience_years: Number(appExp),
      location: "Registered via In-App Recruiter Form",
      notes: appNotes || "Directly entered by recruitment team.",
      meet_link: `/meet?room=interview-${slug}`
    };

    const updatedApps = [newApp, ...applicants];
    saveApplicantsState(updatedApps);

    // increment job count
    const updatedJobs = jobs.map(j => j.id === targetJob.id ? { ...j, applicants_count: j.applicants_count + 1 } : j);
    saveJobsState(updatedJobs);

    setAppName("");
    setAppEmail("");
    setAppPhone("");
    setAppNotes("");
    setIsApplicantModalOpen(false);
  };

  const handleMoveStage = (applicantId: string, nextStage: Stage) => {
    const updated = applicants.map(app => 
      app.id === applicantId ? { ...app, stage: nextStage } : app
    );
    saveApplicantsState(updated);
    if (selectedApplicant && selectedApplicant.id === applicantId) {
      setSelectedApplicant(prev => prev ? { ...prev, stage: nextStage } : null);
    }
  };

  const handleRateApplicant = (applicantId: string, rating: number) => {
    const updated = applicants.map(app => 
      app.id === applicantId ? { ...app, rating } : app
    );
    saveApplicantsState(updated);
    if (selectedApplicant && selectedApplicant.id === applicantId) {
      setSelectedApplicant(prev => prev ? { ...prev, rating } : null);
    }
  };

  const exportApplicantsCSV = () => {
    const headers = ["Applicant ID", "Candidate Name", "Applied Role", "Email", "Phone", "Stage", "Rating (1-5)", "Expected Salary", "Applied Date", "Location", "LinkedIn", "Interview Room"];
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
      `"${a.location || ""}"`,
      `"${a.linkedin || ""}"`,
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
  const totalOpenings = jobs.reduce((acc, j) => acc + (j.no_of_recruitment || 0), 0);
  const activeCandidates = applicants.filter(a => a.stage !== "rejected" && a.stage !== "hired").length;
  const hiredCount = applicants.filter(a => a.stage === "hired").length;
  const inInterviewCount = applicants.filter(a => a.stage === "interview1" || a.stage === "tech_test").length;

  return (
    <div className="flex flex-col h-screen bg-[#0a0d14] text-white selection:bg-purple-500 selection:text-white">
      <RecruitmentHeader 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
        onNewJob={openNewJobModal}
      />

      <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-6">
        {/* KPI Dashboard Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="galaxy-card p-4 border border-blue-500/20 bg-blue-950/10 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Open Positions</p>
              <h3 className="text-2xl font-bold text-blue-400 mt-1">{totalOpenings} Targets</h3>
              <p className="text-xs text-gray-400 mt-1">{jobs.length} Job Specs Active</p>
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
              <p className="text-xs text-gray-400 mt-1">Ready for Employee Dir</p>
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
                Posted Jobs & Links ({jobs.length})
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

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/recruitment/apply"
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded-lg text-xs font-semibold border border-blue-500/30 transition-all active:scale-95"
            >
              <Globe size={14} /> Public Portal
            </Link>
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
              <Plus size={14} /> Add Candidate
            </button>
            <button
              onClick={openNewJobModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
            >
              <Briefcase size={14} /> Post Job & Design Form
            </button>
          </div>
        </div>

        {/* TAB 1: KANBAN PIPELINE */}
        {activeTab === "pipeline" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
            {STAGES.map((stage) => {
              const stageApplicants = filteredApplicants.filter(a => a.stage === stage.id);
              return (
                <div key={stage.id} className="bg-[#111622]/90 border border-gray-800 rounded-2xl p-3 flex flex-col min-h-[500px]">
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${stage.color}`}>
                      {stage.name}
                    </span>
                    <span className="text-xs font-bold text-gray-400 bg-gray-900 px-2 py-0.5 rounded-full">
                      {stageApplicants.length}
                    </span>
                  </div>

                  {/* Applicants List in Column */}
                  <div className="flex-1 space-y-3 mt-3 overflow-y-auto max-h-[calc(100vh-320px)] scrollbar-none pr-1">
                    {stageApplicants.length === 0 ? (
                      <div className="text-center py-8 text-xs text-gray-600 italic">
                        No candidates in this stage
                      </div>
                    ) : (
                      stageApplicants.map(app => (
                        <div
                          key={app.id}
                          onClick={() => setSelectedApplicant(app)}
                          className="galaxy-card bg-[#161c2a] hover:bg-[#1c2436] p-3.5 rounded-xl border border-gray-800 hover:border-purple-500/50 transition-all cursor-pointer space-y-2.5 shadow-md group relative"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors">
                                {app.name}
                              </h4>
                              <p className="text-xs text-gray-400 line-clamp-1">{app.job_title}</p>
                            </div>
                            <div className="flex items-center gap-0.5 text-amber-400">
                              <Star size={12} className="fill-amber-400 text-amber-400" />
                              <span className="text-xs font-bold">{app.rating}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-gray-400">
                            <span className="text-emerald-400 font-semibold">{app.expected_salary}</span>
                            <span>{app.experience_years}y exp</span>
                          </div>

                          {app.location && (
                            <div className="text-[11px] text-gray-500 flex items-center gap-1 line-clamp-1">
                              <MapPin size={10} className="shrink-0 text-purple-400" />
                              <span>{app.location}</span>
                            </div>
                          )}

                          {/* Meet Room Button & Stage Advance Controls */}
                          <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between">
                            {app.meet_link ? (
                              <Link
                                href={app.meet_link}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white transition-all border border-purple-500/30"
                              >
                                <Video size={10} /> Meet
                              </Link>
                            ) : (
                              <span className="text-[10px] text-gray-500">No meet</span>
                            )}

                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              {stage.id !== "hired" && stage.id !== "rejected" && (
                                <button
                                  title="Advance to next stage"
                                  onClick={() => {
                                    const currentIndex = STAGES.findIndex(s => s.id === stage.id);
                                    if (currentIndex < STAGES.length - 2) {
                                      handleMoveStage(app.id, STAGES[currentIndex + 1].id);
                                    }
                                  }}
                                  className="p-1 rounded bg-gray-800 hover:bg-purple-600 text-gray-300 hover:text-white transition-colors"
                                >
                                  <ArrowRight size={12} />
                                </button>
                              )}
                            </div>
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

        {/* TAB 2: POSTED JOBS & SHAREABLE LINKS */}
        {activeTab === "jobs" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Posted Job Positions & Public Application Links</h3>
                <p className="text-xs text-gray-400">
                  Manage job specifications, customize the candidate application form, and copy shareable links.
                </p>
              </div>
              <button
                onClick={openNewJobModal}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
              >
                <Plus size={14} /> Post New Position
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {jobs.map(job => {
                const isCopied = copiedJobId === job.id;
                return (
                  <div
                    key={job.id}
                    className="galaxy-card bg-[#111622] rounded-2xl border border-gray-800 p-5 space-y-4 flex flex-col justify-between hover:border-purple-500/50 transition-all shadow-lg"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            {job.department}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                            job.state === "open" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-gray-800 text-gray-400"
                          }`}>
                            {job.state}
                          </span>
                        </div>
                        <span className="font-mono text-xs text-gray-500">{job.id}</span>
                      </div>

                      <div>
                        <h4 className="font-bold text-base text-white">{job.name}</h4>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                          <span className="flex items-center gap-1"><MapPin size={12} className="text-purple-400" /> {job.location}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-semibold">{job.salary_range}</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                        {job.description || "Comprehensive job posting configured in Beraxis HR."}
                      </p>

                      <div className="grid grid-cols-2 gap-2 bg-gray-900/70 p-3 rounded-xl border border-gray-800 text-xs">
                        <div>
                          <span className="text-gray-500 block text-[10px] uppercase">Headcount Target</span>
                          <span className="font-bold text-white">{job.no_of_recruitment} Openings</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[10px] uppercase">Total Applicants</span>
                          <span className="font-bold text-purple-400">{job.applicants_count || 0} In Process</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-gray-800">
                      {/* Shareable Link Box */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyJobLink(job.id)}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                            isCopied
                              ? "bg-emerald-600/20 border-emerald-500 text-emerald-300"
                              : "bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-200"
                          }`}
                        >
                          {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          {isCopied ? "Link Copied!" : "Copy Public Link"}
                        </button>

                        <Link
                          href={`/recruitment/apply?jobId=${job.id}`}
                          target="_blank"
                          title="Open Candidate Application Portal"
                          className="p-2 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 transition-all"
                        >
                          <ExternalLink size={15} />
                        </Link>
                      </div>

                      {/* Management Controls */}
                      <div className="flex items-center justify-between text-xs pt-1">
                        <button
                          onClick={() => openEditJobModal(job)}
                          className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 hover:underline"
                        >
                          <Sliders size={13} /> Edit Specs & Form
                        </button>
                        <button
                          onClick={() => {
                            setSelectedJobFilter(job.id);
                            setActiveTab("pipeline");
                          }}
                          className="text-gray-400 hover:text-white font-bold flex items-center gap-1"
                        >
                          Pipeline <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
                          <div className="text-xs text-gray-400">{app.experience_years} years exp • {app.location || "Remote"}</div>
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
          <div className="bg-[#111622] border border-gray-700 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
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

            {/* Candidate Submitted Responses / Documents */}
            {(selectedApplicant.resume_file || selectedApplicant.linkedin || selectedApplicant.portfolio || selectedApplicant.custom_answers) && (
              <div className="space-y-3 bg-gray-900/40 p-4 rounded-xl border border-gray-800 text-xs">
                <span className="font-bold uppercase tracking-wider text-purple-400 block">
                  Application Documents & Screening Answers
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-300">
                  {selectedApplicant.resume_file && (
                    <div className="flex items-center gap-1.5 font-medium">
                      <FileText size={14} className="text-blue-400" /> Resume: {selectedApplicant.resume_file}
                    </div>
                  )}
                  {selectedApplicant.linkedin && (
                    <div className="flex items-center gap-1.5 text-blue-400 hover:underline">
                      <ExternalLink size={14} /> <a href={selectedApplicant.linkedin} target="_blank" rel="noreferrer">LinkedIn Profile</a>
                    </div>
                  )}
                  {selectedApplicant.portfolio && (
                    <div className="flex items-center gap-1.5 text-purple-400 hover:underline">
                      <Globe size={14} /> <a href={selectedApplicant.portfolio} target="_blank" rel="noreferrer">Portfolio / GitHub</a>
                    </div>
                  )}
                </div>

                {selectedApplicant.custom_answers && Object.keys(selectedApplicant.custom_answers).length > 0 && (
                  <div className="pt-2 border-t border-gray-800 space-y-1.5">
                    <span className="text-gray-400 font-bold block">Custom Question Responses:</span>
                    {Object.entries(selectedApplicant.custom_answers).map(([key, val]) => (
                      <div key={key} className="bg-gray-900/90 p-2 rounded-lg border border-gray-800 text-xs">
                        <span className="text-gray-400 block font-semibold">{key}:</span>
                        <span className="text-gray-100">{val}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

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
                <div />
              )}
              <div className="flex items-center gap-2">
                <Link
                  href={`/employees?onboard=${encodeURIComponent(selectedApplicant.name)}&role=${encodeURIComponent(selectedApplicant.job_title)}`}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
                >
                  <UserCheck size={14} /> Onboard to Employees
                </Link>
                <button
                  onClick={() => setSelectedApplicant(null)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL JOB SPECIFICATIONS & APPLICATION FORM DESIGNER MODAL */}
      {isJobModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleSaveJob} className="bg-[#111622] border border-gray-700 rounded-3xl max-w-3xl w-full p-6 space-y-5 shadow-2xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Briefcase size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingJob ? "Edit Job Specifications & Form" : "Post New Job Position & Design Form"}
                  </h3>
                  <p className="text-xs text-gray-400">Configure public role specifications and custom applicant questions</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsJobModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
              >
                <XCircle size={22} />
              </button>
            </div>

            {/* Modal Sub-Tabs */}
            <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-800 shrink-0">
              <button
                type="button"
                onClick={() => setJobModalTab("specs")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  jobModalTab === "specs" ? "bg-purple-600 text-white shadow-md" : "text-gray-400 hover:text-white"
                }`}
              >
                1. Job Specifications
              </button>
              <button
                type="button"
                onClick={() => setJobModalTab("form_designer")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  jobModalTab === "form_designer" ? "bg-purple-600 text-white shadow-md" : "text-gray-400 hover:text-white"
                }`}
              >
                2. Application Form Designer
              </button>
              <button
                type="button"
                onClick={() => setJobModalTab("preview")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  jobModalTab === "preview" ? "bg-purple-600 text-white shadow-md" : "text-gray-400 hover:text-white"
                }`}
              >
                3. Live Candidate Preview
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              {/* STEP 1: JOB SPECIFICATIONS */}
              {jobModalTab === "specs" && (
                <div className="space-y-4">
                  <div>
                    <label className="font-bold text-gray-300 block mb-1">Job Title / Designation *</label>
                    <input
                      type="text"
                      required
                      value={jobName}
                      onChange={e => setJobName(e.target.value)}
                      placeholder="e.g. Principal Cloud Infrastructure Engineer"
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-gray-300 block mb-1">Department</label>
                      <select
                        value={jobDept}
                        onChange={e => setJobDept(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="Engineering">Engineering</option>
                        <option value="Sales">Sales</option>
                        <option value="Finance">Finance</option>
                        <option value="Operations">Operations</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Human Resources">Human Resources</option>
                        <option value="Product & Design">Product & Design</option>
                        <option value="Customer Success">Customer Success</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-gray-300 block mb-1">Employment Type</label>
                      <select
                        value={jobType}
                        onChange={e => setJobType(e.target.value as any)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Contract">Contract / Freelance</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-gray-300 block mb-1">Work Policy</label>
                      <select
                        value={jobPolicy}
                        onChange={e => setJobPolicy(e.target.value as any)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="Remote">100% Remote</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="On-site">On-site</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-gray-300 block mb-1">Target Salary Budget</label>
                      <input
                        type="text"
                        value={jobSalary}
                        onChange={e => setJobSalary(e.target.value)}
                        placeholder="$100k - $130k"
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-300 block mb-1">Open Positions (Heads)</label>
                      <input
                        type="number"
                        min="1"
                        value={jobCount}
                        onChange={e => setJobCount(Number(e.target.value))}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-300 block mb-1">Experience Level</label>
                      <select
                        value={jobExpLevel}
                        onChange={e => setJobExpLevel(e.target.value as any)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="Entry">Entry Level</option>
                        <option value="Mid">Mid Level (2-4 yrs)</option>
                        <option value="Senior">Senior Level (5+ yrs)</option>
                        <option value="Lead">Lead / Architect</option>
                        <option value="Executive">Executive / Director</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-gray-300 block mb-1">Role Overview & Mission</label>
                    <textarea
                      rows={2}
                      value={jobDescription}
                      onChange={e => setJobDescription(e.target.value)}
                      placeholder="Brief overview of the role, team dynamics, and core mission..."
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-gray-300 block mb-1">
                        Key Responsibilities <span className="text-gray-500 font-normal">(1 item per line)</span>
                      </label>
                      <textarea
                        rows={3}
                        value={jobResponsibilities}
                        onChange={e => setJobResponsibilities(e.target.value)}
                        placeholder="Architect resilient cloud microservices&#10;Lead sprint planning & code reviews&#10;Partner with product managers"
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-300 block mb-1">
                        Requirements & Qualifications <span className="text-gray-500 font-normal">(1 item per line)</span>
                      </label>
                      <textarea
                        rows={3}
                        value={jobRequirements}
                        onChange={e => setJobRequirements(e.target.value)}
                        placeholder="5+ years production TypeScript / React&#10;PostgreSQL & Redis query optimization&#10;Strong communication skills"
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-gray-300 block mb-1">
                      Benefits & Perks <span className="text-gray-500 font-normal">(1 item per line)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={jobBenefits}
                      onChange={e => setJobBenefits(e.target.value)}
                      placeholder="100% remote with home office stipend&#10;Global health insurance&#10;Annual learning budget"
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: APPLICATION FORM DESIGNER */}
              {jobModalTab === "form_designer" && (
                <div className="space-y-5">
                  <div className="bg-purple-950/20 border border-purple-500/20 p-3.5 rounded-2xl">
                    <h4 className="font-bold text-purple-300 flex items-center gap-1.5 text-xs">
                      <Sparkles size={14} /> Custom Application Form Configuration
                    </h4>
                    <p className="text-[11px] text-gray-300 mt-1">
                      Control which fields the applicant sees and mark them as required or optional for this specific job position.
                    </p>
                  </div>

                  {/* Standard Field Toggles */}
                  <div className="space-y-2">
                    <span className="font-bold text-gray-300 block uppercase tracking-wider text-[10px]">Standard Candidate Fields</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <label className="flex items-center justify-between p-3 bg-gray-900/80 rounded-xl border border-gray-800 cursor-pointer hover:bg-gray-800/40">
                        <span className="font-semibold text-gray-200">Require Phone Number</span>
                        <input
                          type="checkbox"
                          checked={formRequirePhone}
                          onChange={e => setFormRequirePhone(e.target.checked)}
                          className="w-4 h-4 accent-purple-600 rounded"
                        />
                      </label>
                      <label className="flex items-center justify-between p-3 bg-gray-900/80 rounded-xl border border-gray-800 cursor-pointer hover:bg-gray-800/40">
                        <span className="font-semibold text-gray-200">Require Resume / CV Upload</span>
                        <input
                          type="checkbox"
                          checked={formRequireResume}
                          onChange={e => setFormRequireResume(e.target.checked)}
                          className="w-4 h-4 accent-purple-600 rounded"
                        />
                      </label>
                      <label className="flex items-center justify-between p-3 bg-gray-900/80 rounded-xl border border-gray-800 cursor-pointer hover:bg-gray-800/40">
                        <span className="font-semibold text-gray-200">Require LinkedIn Profile</span>
                        <input
                          type="checkbox"
                          checked={formRequireLinkedIn}
                          onChange={e => setFormRequireLinkedIn(e.target.checked)}
                          className="w-4 h-4 accent-purple-600 rounded"
                        />
                      </label>
                      <label className="flex items-center justify-between p-3 bg-gray-900/80 rounded-xl border border-gray-800 cursor-pointer hover:bg-gray-800/40">
                        <span className="font-semibold text-gray-200">Require Portfolio / GitHub</span>
                        <input
                          type="checkbox"
                          checked={formRequirePortfolio}
                          onChange={e => setFormRequirePortfolio(e.target.checked)}
                          className="w-4 h-4 accent-purple-600 rounded"
                        />
                      </label>
                      <label className="flex items-center justify-between p-3 bg-gray-900/80 rounded-xl border border-gray-800 cursor-pointer hover:bg-gray-800/40">
                        <span className="font-semibold text-gray-200">Require Cover Letter</span>
                        <input
                          type="checkbox"
                          checked={formRequireCoverLetter}
                          onChange={e => setFormRequireCoverLetter(e.target.checked)}
                          className="w-4 h-4 accent-purple-600 rounded"
                        />
                      </label>
                      <label className="flex items-center justify-between p-3 bg-gray-900/80 rounded-xl border border-gray-800 cursor-pointer hover:bg-gray-800/40">
                        <span className="font-semibold text-gray-200">Ask Notice Period</span>
                        <input
                          type="checkbox"
                          checked={formRequireNoticePeriod}
                          onChange={e => setFormRequireNoticePeriod(e.target.checked)}
                          className="w-4 h-4 accent-purple-600 rounded"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Custom Screening Questions Builder */}
                  <div className="space-y-3 pt-3 border-t border-gray-800">
                    <span className="font-bold text-gray-300 block uppercase tracking-wider text-[10px]">
                      Custom Screening Questions ({customQuestions.length})
                    </span>

                    {customQuestions.map((q, idx) => (
                      <div key={q.id} className="p-3 bg-gray-900 rounded-xl border border-gray-800 flex items-center justify-between gap-3">
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{idx + 1}. {q.question}</span>
                            {q.required && <span className="text-red-400 text-[10px] uppercase font-bold">(Required)</span>}
                          </div>
                          <span className="text-[10px] text-purple-400 font-semibold uppercase">Type: {q.type}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomQuestion(q.id)}
                          className="text-gray-500 hover:text-red-400 p-1 rounded-lg"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}

                    <div className="p-3.5 bg-gray-900/90 rounded-2xl border border-dashed border-gray-700 space-y-3">
                      <span className="font-bold text-purple-300 block text-xs">+ Add New Custom Question</span>
                      <input
                        type="text"
                        value={newQuestionText}
                        onChange={e => setNewQuestionText(e.target.value)}
                        placeholder="e.g. Do you have experience managing distributed multi-region databases?"
                        className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <select
                            value={newQuestionType}
                            onChange={e => setNewQuestionType(e.target.value as any)}
                            className="bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                          >
                            <option value="text">Freeform Text</option>
                            <option value="yes_no">Yes / No Radio</option>
                            <option value="number">Numeric Value</option>
                            <option value="select">Dropdown Choice</option>
                          </select>
                          <label className="flex items-center gap-1.5 cursor-pointer text-gray-300">
                            <input
                              type="checkbox"
                              checked={newQuestionRequired}
                              onChange={e => setNewQuestionRequired(e.target.checked)}
                              className="accent-purple-600 rounded"
                            />
                            <span>Mandatory / Required</span>
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddCustomQuestion}
                          className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xs shadow-md"
                        >
                          Add Question
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: LIVE PREVIEW */}
              {jobModalTab === "preview" && (
                <div className="bg-gray-900/80 p-5 rounded-2xl border border-gray-800 space-y-4">
                  <div className="border-b border-gray-800 pb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Candidate View Preview</span>
                    <h3 className="text-base font-bold text-white mt-0.5">{jobName || "Job Title Preview"}</h3>
                    <p className="text-xs text-gray-400">{jobDept} • {jobPolicy} • {jobSalary}</p>
                  </div>

                  <div className="space-y-3 opacity-90 pointer-events-none">
                    <div>
                      <label className="font-bold text-gray-400 block mb-1">Full Legal Name *</label>
                      <input disabled type="text" placeholder="Candidate Name..." className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold text-gray-400 block mb-1">Email Address *</label>
                        <input disabled type="text" placeholder="name@domain.com" className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs" />
                      </div>
                      <div>
                        <label className="font-bold text-gray-400 block mb-1">Phone Number {formRequirePhone && "*"}</label>
                        <input disabled type="text" placeholder="+1..." className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs" />
                      </div>
                    </div>
                    {customQuestions.map((q, idx) => (
                      <div key={idx}>
                        <label className="font-bold text-gray-300 block mb-1">{q.question} {q.required && "*"}</label>
                        <input disabled type="text" placeholder="Candidate response..." className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-800 shrink-0">
              <div className="text-xs text-gray-400">
                {editingJob ? "Updating live position specs" : "Will publish immediately with shareable link"}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsJobModalOpen(false)}
                  className="px-4 py-2 bg-gray-800 text-gray-300 hover:text-white rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all"
                >
                  {editingJob ? "Save Changes" : "Publish Job & Generate Link"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ADD APPLICANT DIRECT MODAL */}
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
