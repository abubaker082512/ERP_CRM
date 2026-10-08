"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle2,
  UploadCloud,
  FileText,
  Send,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Globe,
  Share2,
  Check
} from "lucide-react";

export type CustomQuestion = {
  id: string;
  question: string;
  type: "text" | "select" | "yes_no" | "number";
  options?: string[];
  required: boolean;
};

export type JobFormConfig = {
  require_phone: boolean;
  require_resume: boolean;
  require_linkedin: boolean;
  require_portfolio: boolean;
  require_cover_letter: boolean;
  require_notice_period: boolean;
  require_expected_salary: boolean;
  custom_questions: CustomQuestion[];
};

export type Job = {
  id: string;
  name: string;
  department: string;
  no_of_recruitment: number;
  applicants_count: number;
  state: "open" | "closed" | "draft";
  salary_range: string;
  location: string;
  work_policy: "Remote" | "Hybrid" | "On-site";
  employment_type: "Full-time" | "Contract" | "Part-time" | "Internship";
  experience_level: "Entry" | "Mid" | "Senior" | "Lead" | "Executive";
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  closing_date: string;
  form_config: JobFormConfig;
};

const DEFAULT_JOBS: Job[] = [
  {
    id: "JOB-001",
    name: "Senior Full Stack Engineer",
    department: "Engineering",
    no_of_recruitment: 3,
    applicants_count: 8,
    state: "open",
    salary_range: "$110,000 - $140,000",
    location: "Remote / Dubai HQ",
    work_policy: "Remote",
    employment_type: "Full-time",
    experience_level: "Senior",
    description: "We are seeking an experienced Full Stack Engineer to lead the architecture and scaling of our enterprise ERP and CRM cloud ecosystem. You will build high-throughput TypeScript/Next.js services, resilient database schemas, and intuitive real-time UI components.",
    responsibilities: [
      "Architect and ship resilient React/Next.js frontends and Node.js microservices.",
      "Optimize PostgreSQL queries, caching layers, and high-concurrency background jobs.",
      "Collaborate with Product Managers and Designers to deliver mission-critical ERP features.",
      "Mentor mid-level engineers and drive code review excellence."
    ],
    requirements: [
      "5+ years of production experience with TypeScript, React, Next.js, and Node.js.",
      "Deep understanding of relational databases (PostgreSQL/MySQL) and caching (Redis).",
      "Experience building mission-critical B2B or SaaS cloud platforms.",
      "Strong communication skills and ability to work in an asynchronous, remote-first team."
    ],
    benefits: [
      "Competitive base salary + equity options.",
      "100% remote flexibility with home office stipend.",
      "Comprehensive global health insurance coverage.",
      "Annual \$3,000 learning and conference budget.",
      "28 paid vacation days + company-wide recharge weeks."
    ],
    closing_date: "2026-11-30",
    form_config: {
      require_phone: true,
      require_resume: true,
      require_linkedin: true,
      require_portfolio: true,
      require_cover_letter: false,
      require_notice_period: true,
      require_expected_salary: true,
      custom_questions: [
        {
          id: "q1",
          question: "How many years of hands-on Next.js / TypeScript production experience do you have?",
          type: "number",
          required: true
        },
        {
          id: "q2",
          question: "What is your current notice period?",
          type: "select",
          options: ["Immediate (Available now)", "1 to 2 Weeks", "1 Month", "2 Months or more"],
          required: true
        },
        {
          id: "q3",
          question: "Do you require visa sponsorship or have legal authorization to work remotely in your region?",
          type: "yes_no",
          required: true
        }
      ]
    }
  },
  {
    id: "JOB-002",
    name: "Enterprise Account Executive",
    department: "Sales",
    no_of_recruitment: 2,
    applicants_count: 6,
    state: "open",
    salary_range: "$85,000 - $110,000 + OTE ($180k+)",
    location: "New York, USA / Remote",
    work_policy: "Hybrid",
    employment_type: "Full-time",
    experience_level: "Senior",
    description: "Drive high-velocity B2B ERP & CRM enterprise software deals with mid-market and global enterprise clients. You will manage the entire sales lifecycle from discovery and solution demo to contract closing.",
    responsibilities: [
      "Exceed quarterly and annual ARR quotas for new enterprise clients.",
      "Conduct consultative software demonstrations and negotiate commercial terms with C-level executives.",
      "Partner with Solution Architects and Customer Success to ensure high retention."
    ],
    requirements: [
      "4+ years of proven closing experience in B2B SaaS or ERP/CRM solutions.",
      "Demonstrated history of achieving or exceeding \$1M+ ARR annual quotas.",
      "Exceptional executive presence, relationship-building, and negotiation skills."
    ],
    benefits: [
      "Uncapped commission structure with accelerator milestones.",
      "Top-tier medical, dental, and 401(k) matching.",
      "Executive coaching and fast-track leadership opportunities."
    ],
    closing_date: "2026-11-15",
    form_config: {
      require_phone: true,
      require_resume: true,
      require_linkedin: true,
      require_portfolio: false,
      require_cover_letter: true,
      require_notice_period: true,
      require_expected_salary: true,
      custom_questions: [
        {
          id: "q1",
          question: "What was your average deal size and annual quota achievement in your most recent sales role?",
          type: "text",
          required: true
        },
        {
          id: "q2",
          question: "Which CRM and sales engagement tools are you most proficient with?",
          type: "text",
          required: false
        }
      ]
    }
  },
  {
    id: "JOB-003",
    name: "Financial Controller & Auditor",
    department: "Finance",
    no_of_recruitment: 1,
    applicants_count: 4,
    state: "open",
    salary_range: "$95,000 - $120,000",
    location: "London, UK / Hybrid",
    work_policy: "Hybrid",
    employment_type: "Full-time",
    experience_level: "Senior",
    description: "Manage end-to-end accounting operations, statutory financial reporting, audit compliance, and ERP general ledger reconciliation across multi-currency business entities.",
    responsibilities: [
      "Lead month-end and year-end closing processes according to IFRS/GAAP standards.",
      "Oversee automated payroll reconciliation, tax filings, and treasury management.",
      "Collaborate with executive leadership on budget forecasting and cash-flow strategies."
    ],
    requirements: [
      "CPA, ACA, ACCA or equivalent chartered accounting qualification.",
      "6+ years in corporate finance, auditing, or controller positions.",
      "Hands-on mastery of enterprise double-entry accounting software."
    ],
    benefits: [
      "Generous pension scheme with company match.",
      "Private medical insurance & wellness allowance.",
      "Flexible hybrid working schedule."
    ],
    closing_date: "2026-12-01",
    form_config: {
      require_phone: true,
      require_resume: true,
      require_linkedin: true,
      require_portfolio: false,
      require_cover_letter: false,
      require_notice_period: true,
      require_expected_salary: true,
      custom_questions: [
        {
          id: "q1",
          question: "Are you a licensed CPA, ACCA, or ACA charterholder?",
          type: "yes_no",
          required: true
        },
        {
          id: "q2",
          question: "Have you led financial reporting for multi-currency or multinational entities?",
          type: "yes_no",
          required: true
        }
      ]
    }
  }
];

function CareersApplyContent() {
  const searchParams = useSearchParams();
  const initialJobId = searchParams.get("jobId") || "JOB-001";

  const [jobs, setJobs] = useState<Job[]>(DEFAULT_JOBS);
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobId);
  const [isCopied, setIsCopied] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [applicationRef, setApplicationRef] = useState("");

  // Candidate Form Inputs
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidatePhone, setCandidatePhone] = useState("");
  const [candidateCity, setCandidateCity] = useState("");
  const [candidateExpYears, setCandidateExpYears] = useState("4");
  const [candidateSalary, setCandidateSalary] = useState("");
  const [candidateNotice, setCandidateNotice] = useState("1 Month");
  const [candidateLinkedIn, setCandidateLinkedIn] = useState("");
  const [candidatePortfolio, setCandidatePortfolio] = useState("");
  const [candidateCoverLetter, setCandidateCoverLetter] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    try {
      const savedJobs = localStorage.getItem("erp_recruitment_jobs");
      if (savedJobs) {
        const parsed = JSON.parse(savedJobs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setJobs(parsed);
          if (parsed.some(j => j.id === initialJobId)) {
            setSelectedJobId(initialJobId);
          } else {
            setSelectedJobId(parsed[0].id);
          }
        }
      }
    } catch {
      // fallback to DEFAULT_JOBS
    }
  }, [initialJobId]);

  const activeJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/recruitment/apply?jobId=${activeJob.id}`;
      navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handleCustomAnswerChange = (qId: string, val: string) => {
    setCustomAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFileName(file.name);
    }
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const refNumber = `APP-${Math.floor(1000 + Math.random() * 9000)}`;
    setApplicationRef(refNumber);

    const slug = candidateName.toLowerCase().replace(/[^a-z0-9]/g, "-");

    const newApplicant = {
      id: refNumber,
      name: candidateName,
      job_id: activeJob.id,
      job_title: activeJob.name,
      email: candidateEmail,
      phone: candidatePhone || "Not provided",
      stage: "initial",
      rating: 4,
      expected_salary: candidateSalary || activeJob.salary_range,
      applied_at: new Date().toISOString().split("T")[0],
      experience_years: Number(candidateExpYears) || 3,
      location: candidateCity || activeJob.location,
      linkedin: candidateLinkedIn,
      portfolio: candidatePortfolio,
      resume_file: resumeFileName || "Candidate_CV_Auto_Uploaded.pdf",
      notice_period: candidateNotice,
      cover_letter: candidateCoverLetter,
      custom_answers: customAnswers,
      notes: `Applied via Public Job Portal on ${new Date().toLocaleDateString()}. Candidate submitted complete application specifications and portfolio.`,
      meet_link: `/meet?room=interview-${slug}`
    };

    // Save into LocalStorage for sync with recruitment main page
    try {
      const savedApplicantsStr = localStorage.getItem("erp_recruitment_applicants");
      const savedApplicants = savedApplicantsStr ? JSON.parse(savedApplicantsStr) : [];
      const updatedApplicants = [newApplicant, ...savedApplicants];
      localStorage.setItem("erp_recruitment_applicants", JSON.stringify(updatedApplicants));

      // Also update job applicant count
      const updatedJobs = jobs.map(j => j.id === activeJob.id ? { ...j, applicants_count: (j.applicants_count || 0) + 1 } : j);
      setJobs(updatedJobs);
      localStorage.setItem("erp_recruitment_jobs", JSON.stringify(updatedJobs));
    } catch {
      // LocalStorage error fallback
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white">
      {/* Top Careers Brand Navigation */}
      <header className="border-b border-gray-800/80 bg-[#0d121d]/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/apps" className="flex items-center gap-2.5">
            <img src="/logo2.png" alt="Beraxis Logo" className="h-7 w-auto" />
            <span className="font-extrabold text-base tracking-tight text-white">BERAXIS CAREERS</span>
          </Link>
          <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            Global Talent Network
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-700 bg-gray-800/80 hover:bg-gray-700 text-gray-200 transition-all active:scale-95"
          >
            {isCopied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
            {isCopied ? "Link Copied!" : "Share Job Link"}
          </button>
          <Link
            href="/recruitment"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-900/30 transition-all active:scale-95"
          >
            <ArrowLeft size={14} /> Back to HR System
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Open Job Position Selector Pills */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Select Position to Apply ({jobs.filter(j => j.state === 'open').length} Openings)
            </span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Actively Recruiting
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {jobs.map(job => {
              const isSelected = job.id === selectedJobId;
              return (
                <button
                  key={job.id}
                  onClick={() => {
                    setSelectedJobId(job.id);
                    setIsSubmitted(false);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-left shrink-0 transition-all border ${
                    isSelected
                      ? "bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-950/50"
                      : "bg-[#111724] border-gray-800 text-gray-300 hover:border-gray-700 hover:bg-gray-800/50"
                  }`}
                >
                  <div className="font-bold text-sm">{job.name}</div>
                  <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                    <span>{job.department}</span>
                    <span>•</span>
                    <span>{job.work_policy}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {isSubmitted ? (
          /* Application Submitted Success State */
          <div className="bg-[#111724] border border-emerald-500/30 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-6 shadow-2xl">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 size={44} />
            </div>
            
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Application Received
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Thank You, {candidateName}!
              </h2>
              <p className="text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
                Your application for <strong className="text-white">{activeJob.name}</strong> has been successfully submitted to the Beraxis HR team.
              </p>
            </div>

            <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-4 text-left max-w-md mx-auto space-y-2 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Application Reference:</span>
                <span className="font-mono font-bold text-purple-400">{applicationRef}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Position:</span>
                <span className="font-bold text-gray-200">{activeJob.name}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Department:</span>
                <span className="text-gray-200">{activeJob.department}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Email Confirmation Sent To:</span>
                <span className="text-gray-200 font-semibold">{candidateEmail}</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setCandidateName("");
                  setCandidateEmail("");
                  setCandidatePhone("");
                  setCustomAnswers({});
                  setResumeFileName("");
                }}
                className="w-full sm:w-auto px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-bold transition-all"
              >
                Apply for Another Role
              </button>
              <Link
                href="/recruitment"
                className="w-full sm:w-auto px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 transition-all"
              >
                View in HR Dashboard
              </Link>
            </div>
          </div>
        ) : (
          /* Job Specs & Application Form Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Full Job Specifications (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Job Header Hero */}
              <div className="bg-[#111724] border border-gray-800 rounded-2xl p-6 sm:p-7 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {activeJob.department}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {activeJob.employment_type}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {activeJob.work_policy}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {activeJob.experience_level} Level
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {activeJob.name}
                </h1>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-800 text-xs">
                  <div className="flex items-center gap-2 text-gray-300">
                    <DollarSign size={16} className="text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-gray-500 block text-[10px] uppercase">Salary Range</span>
                      <span className="font-bold text-white">{activeJob.salary_range}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <MapPin size={16} className="text-purple-400 shrink-0" />
                    <div>
                      <span className="text-gray-500 block text-[10px] uppercase">Location</span>
                      <span className="font-bold text-white">{activeJob.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Clock size={16} className="text-blue-400 shrink-0" />
                    <div>
                      <span className="text-gray-500 block text-[10px] uppercase">Closing Date</span>
                      <span className="font-bold text-white">{activeJob.closing_date || "Open Until Filled"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* About the Role */}
              <div className="bg-[#111724] border border-gray-800 rounded-2xl p-6 sm:p-7 space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText size={18} className="text-purple-400" /> About the Position
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {activeJob.description}
                </p>
              </div>

              {/* Key Responsibilities */}
              {activeJob.responsibilities && activeJob.responsibilities.length > 0 && (
                <div className="bg-[#111724] border border-gray-800 rounded-2xl p-6 sm:p-7 space-y-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-emerald-400" /> Key Responsibilities
                  </h3>
                  <ul className="space-y-2.5">
                    {activeJob.responsibilities.map((resp, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-300 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements & Qualifications */}
              {activeJob.requirements && activeJob.requirements.length > 0 && (
                <div className="bg-[#111724] border border-gray-800 rounded-2xl p-6 sm:p-7 space-y-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldCheck size={18} className="text-blue-400" /> Qualifications & Requirements
                  </h3>
                  <ul className="space-y-2.5">
                    {activeJob.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-300 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Perks & Benefits */}
              {activeJob.benefits && activeJob.benefits.length > 0 && (
                <div className="bg-[#111724] border border-gray-800 rounded-2xl p-6 sm:p-7 space-y-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles size={18} className="text-amber-400" /> Benefits & Perks
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeJob.benefits.map((ben, idx) => (
                      <div key={idx} className="bg-gray-900/60 p-3 rounded-xl border border-gray-800 flex items-start gap-2 text-xs text-gray-200">
                        <span className="text-amber-400">✦</span>
                        <span>{ben}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Custom Designed Application Form (5 cols) */}
            <div className="lg:col-span-5 sticky top-20">
              <div className="bg-[#111724] border border-gray-800 rounded-2xl p-6 sm:p-7 space-y-5 shadow-2xl">
                <div className="border-b border-gray-800 pb-4">
                  <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                    <Send size={18} className="text-purple-400" /> Apply for this Position
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Fill out the form below to submit your application directly to our hiring team.
                  </p>
                </div>

                <form onSubmit={handleSubmitApplication} className="space-y-4 text-xs">
                  {/* Full Name */}
                  <div>
                    <label className="font-bold text-gray-300 block mb-1">
                      Full Legal Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={candidateName}
                      onChange={e => setCandidateName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="w-full bg-gray-900/90 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-gray-300 block mb-1">
                        Email Address <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={candidateEmail}
                        onChange={e => setCandidateEmail(e.target.value)}
                        placeholder="alex@example.com"
                        className="w-full bg-gray-900/90 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-300 block mb-1">
                        Phone Number {activeJob.form_config?.require_phone && <span className="text-red-400">*</span>}
                      </label>
                      <input
                        type="tel"
                        required={activeJob.form_config?.require_phone}
                        value={candidatePhone}
                        onChange={e => setCandidatePhone(e.target.value)}
                        placeholder="+1 (555) 019-2831"
                        className="w-full bg-gray-900/90 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {/* Location & Experience */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-gray-300 block mb-1">
                        Current City / Country
                      </label>
                      <input
                        type="text"
                        value={candidateCity}
                        onChange={e => setCandidateCity(e.target.value)}
                        placeholder="e.g. London, UK"
                        className="w-full bg-gray-900/90 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-300 block mb-1">
                        Years of Relevant Experience
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={candidateExpYears}
                        onChange={e => setCandidateExpYears(e.target.value)}
                        className="w-full bg-gray-900/90 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {/* Expected Salary & Notice Period */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeJob.form_config?.require_expected_salary && (
                      <div>
                        <label className="font-bold text-gray-300 block mb-1">
                          Expected Annual Salary ($)
                        </label>
                        <input
                          type="text"
                          value={candidateSalary}
                          onChange={e => setCandidateSalary(e.target.value)}
                          placeholder="e.g. $120,000"
                          className="w-full bg-gray-900/90 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    )}
                    {activeJob.form_config?.require_notice_period && (
                      <div>
                        <label className="font-bold text-gray-300 block mb-1">
                          Notice Period
                        </label>
                        <select
                          value={candidateNotice}
                          onChange={e => setCandidateNotice(e.target.value)}
                          className="w-full bg-gray-900/90 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                        >
                          <option value="Immediate">Immediate</option>
                          <option value="2 Weeks">2 Weeks</option>
                          <option value="1 Month">1 Month</option>
                          <option value="2 Months">2 Months</option>
                          <option value="3+ Months">3+ Months</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* LinkedIn & Portfolio */}
                  {activeJob.form_config?.require_linkedin && (
                    <div>
                      <label className="font-bold text-gray-300 block mb-1">
                        LinkedIn Profile URL <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="url"
                        required
                        value={candidateLinkedIn}
                        onChange={e => setCandidateLinkedIn(e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full bg-gray-900/90 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  )}

                  {activeJob.form_config?.require_portfolio && (
                    <div>
                      <label className="font-bold text-gray-300 block mb-1">
                        Portfolio / GitHub / Website URL
                      </label>
                      <input
                        type="url"
                        value={candidatePortfolio}
                        onChange={e => setCandidatePortfolio(e.target.value)}
                        placeholder="https://github.com/username or portfolio link"
                        className="w-full bg-gray-900/90 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  )}

                  {/* Resume Upload Box */}
                  <div>
                    <label className="font-bold text-gray-300 block mb-1">
                      Upload Resume / CV {activeJob.form_config?.require_resume && <span className="text-red-400">*</span>}
                    </label>
                    <div className="relative border-2 border-dashed border-gray-700 hover:border-purple-500/80 rounded-xl p-4 text-center bg-gray-900/40 transition-colors cursor-pointer group">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <UploadCloud size={24} className="mx-auto text-purple-400 group-hover:scale-110 transition-transform mb-1" />
                      {resumeFileName ? (
                        <p className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
                          <CheckCircle2 size={13} /> {resumeFileName}
                        </p>
                      ) : (
                        <div>
                          <p className="text-xs font-semibold text-gray-200">Click to upload or drag & drop</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">PDF, DOCX up to 10MB</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Custom Job Screening Questions configured by HR */}
                  {activeJob.form_config?.custom_questions && activeJob.form_config.custom_questions.length > 0 && (
                    <div className="pt-2 border-t border-gray-800 space-y-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block">
                        Role-Specific Screening Questions
                      </span>
                      {activeJob.form_config.custom_questions.map((q) => (
                        <div key={q.id} className="space-y-1">
                          <label className="font-bold text-gray-300 block text-xs">
                            {q.question} {q.required && <span className="text-red-400">*</span>}
                          </label>

                          {q.type === "text" && (
                            <input
                              type="text"
                              required={q.required}
                              value={customAnswers[q.id] || ""}
                              onChange={e => handleCustomAnswerChange(q.id, e.target.value)}
                              placeholder="Your answer..."
                              className="w-full bg-gray-900/90 border border-gray-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                            />
                          )}

                          {q.type === "number" && (
                            <input
                              type="number"
                              required={q.required}
                              value={customAnswers[q.id] || ""}
                              onChange={e => handleCustomAnswerChange(q.id, e.target.value)}
                              placeholder="e.g. 5"
                              className="w-full bg-gray-900/90 border border-gray-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                            />
                          )}

                          {q.type === "yes_no" && (
                            <div className="flex gap-4">
                              {["Yes", "No"].map(choice => (
                                <label key={choice} className="flex items-center gap-1.5 cursor-pointer text-gray-200">
                                  <input
                                    type="radio"
                                    name={`custom-${q.id}`}
                                    required={q.required}
                                    checked={customAnswers[q.id] === choice}
                                    onChange={() => handleCustomAnswerChange(q.id, choice)}
                                    className="accent-purple-600"
                                  />
                                  <span>{choice}</span>
                                </label>
                              ))}
                            </div>
                          )}

                          {q.type === "select" && (
                            <select
                              required={q.required}
                              value={customAnswers[q.id] || ""}
                              onChange={e => handleCustomAnswerChange(q.id, e.target.value)}
                              className="w-full bg-gray-900/90 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                            >
                              <option value="">-- Please Select --</option>
                              {q.options?.map((opt, oIdx) => (
                                <option key={oIdx} value={opt}>{opt}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Cover Letter / Pitch */}
                  {activeJob.form_config?.require_cover_letter && (
                    <div>
                      <label className="font-bold text-gray-300 block mb-1">
                        Cover Letter / Why You&apos;re a Great Fit
                      </label>
                      <textarea
                        rows={3}
                        value={candidateCoverLetter}
                        onChange={e => setCandidateCoverLetter(e.target.value)}
                        placeholder="Tell us about your background and why you want to join..."
                        className="w-full bg-gray-900/90 border border-gray-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Submitting Application...</span>
                        </>
                      ) : (
                        <>
                          <Send size={16} /> Submit Application
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-gray-500 text-center mt-2">
                      🔒 Your personal data is protected and reviewed only by authorized HR personnel.
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CareersApplyPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-[#07090e] text-white">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CareersApplyContent />
    </Suspense>
  );
}
