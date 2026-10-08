"use client";

import { useState } from "react";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import {
  GraduationCap,
  Plus,
  Users,
  BookOpen,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Layers,
  ArrowRight,
  X
} from "lucide-react";

const MENU_ITEMS = [
  { name: "Courses & Batches", href: "/education" },
  { name: "Student Registry", href: "/education" },
  { name: "Tuition Invoicing", href: "/accounting" },
  { name: "Knowledge Base", href: "/knowledge" }
];

type Student = {
  id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  batch: string;
  tuitionFee: number;
  paymentStatus: "paid" | "partial" | "pending";
  attendanceRate: number; // percentage
  enrolledDate: string;
};

const INITIAL_STUDENTS: Student[] = [
  {
    id: "STU-2026-01",
    name: "Alexander Kim",
    email: "a.kim@example.com",
    phone: "+1 (415) 555-0199",
    course: "Full Stack Next.js & Cloud Engineering Bootcamp",
    batch: "Cohort 2026-Fall (12 Weeks)",
    tuitionFee: 4800,
    paymentStatus: "paid",
    attendanceRate: 98,
    enrolledDate: "2026-09-01"
  },
  {
    id: "STU-2026-02",
    name: "Jessica Martinez",
    email: "jessica.m@example.com",
    phone: "+1 (512) 555-0144",
    course: "Specialty Coffee Roasting & Barista Masterclass",
    batch: "Weekend Intensive Batch 4",
    tuitionFee: 1250,
    paymentStatus: "paid",
    attendanceRate: 100,
    enrolledDate: "2026-09-15"
  },
  {
    id: "STU-2026-03",
    name: "David O'Connor",
    email: "doconnor@example.com",
    phone: "+44 20 7946 0912",
    course: "Enterprise ERP Architecture & Data Engineering",
    batch: "Executive Weekend Program",
    tuitionFee: 6200,
    paymentStatus: "partial",
    attendanceRate: 92,
    enrolledDate: "2026-09-20"
  }
];

export default function EducationAcademyPage() {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(students[0]);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [course, setCourse] = useState("Full Stack Next.js & Cloud Engineering Bootcamp");
  const [batch, setBatch] = useState("Cohort 2026-Fall (12 Weeks)");
  const [tuition, setTuition] = useState(4800);

  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || s.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalTuition = students.reduce((acc, s) => acc + s.tuitionFee, 0);
  const avgAttendance = Math.round(
    students.reduce((acc, s) => acc + s.attendanceRate, 0) / (students.length || 1)
  );

  const handleEnrollStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const newStudent: Student = {
      id: `STU-2026-${Math.floor(10 + Math.random() * 90)}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || "+1 (555) 000-0000",
      course,
      batch,
      tuitionFee: Number(tuition),
      paymentStatus: "paid",
      attendanceRate: 100,
      enrolledDate: new Date().toISOString().slice(0, 10)
    };

    setStudents([newStudent, ...students]);
    setSelectedStudent(newStudent);
    setIsEnrollModalOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[#07090f] text-white selection:bg-purple-500 selection:text-white">
      <StandardModuleHeader
        moduleName="Education & Academies"
        moduleIcon={<GraduationCap size={20} />}
        menuItems={MENU_ITEMS}
        searchPlaceholder="Search students, courses, or batches..."
      />

      <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="galaxy-card p-4 rounded-2xl bg-[#101422] border border-blue-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Total Enrolled Students</span>
              <h3 className="text-2xl font-bold text-blue-400 mt-0.5">{students.length} Students</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Across 3 Active Programs</p>
            </div>
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
              <Users size={20} />
            </div>
          </div>

          <div className="galaxy-card p-4 rounded-2xl bg-[#101422] border border-emerald-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Average Attendance Rate</span>
              <h3 className="text-2xl font-bold text-emerald-400 mt-0.5">{avgAttendance}%</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">High Academic Engagement</p>
            </div>
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <CheckCircle2 size={20} />
            </div>
          </div>

          <div className="galaxy-card p-4 rounded-2xl bg-[#101422] border border-purple-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Term Tuition Gross</span>
              <h3 className="text-2xl font-bold text-purple-400 mt-0.5">${totalTuition.toLocaleString()}</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Enrolled Term Revenue</p>
            </div>
            <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
              <DollarSign size={20} />
            </div>
          </div>

          <div className="galaxy-card p-4 rounded-2xl bg-[#101422] border border-teal-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Course Completion Rate</span>
              <h3 className="text-2xl font-bold text-teal-400 mt-0.5">96.4%</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Certificates Issued</p>
            </div>
            <div className="p-3 bg-teal-500/20 text-teal-400 rounded-xl">
              <GraduationCap size={20} />
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#101422] p-3.5 rounded-2xl border border-gray-800">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search students..."
                className="bg-gray-900 border border-gray-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 w-48 sm:w-60"
              />
            </div>

            <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-800 text-xs font-bold">
              <button
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  statusFilter === "ALL" ? "bg-purple-600 text-white shadow-md" : "text-gray-400 hover:text-white"
                }`}
              >
                All Students ({students.length})
              </button>
              <button
                onClick={() => setStatusFilter("paid")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  statusFilter === "paid" ? "bg-emerald-600 text-white shadow-md" : "text-gray-400 hover:text-white"
                }`}
              >
                Tuition Paid ({students.filter(s => s.paymentStatus === "paid").length})
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsEnrollModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-teal-600/30 transition-all active:scale-95"
          >
            <Plus size={14} /> + Enroll New Student
          </button>
        </div>

        {/* Student Directory & Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Student List (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {filteredStudents.map(student => {
              const isSelected = selectedStudent?.id === student.id;
              return (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-3 ${
                    isSelected
                      ? "bg-[#161c28] border-teal-500 shadow-xl shadow-teal-950/60 ring-1 ring-teal-500"
                      : "bg-[#101422] border-gray-800 hover:border-gray-700"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-teal-400 block">{student.id}</span>
                      <h4 className="font-bold text-white text-sm mt-0.5">{student.name}</h4>
                      <p className="text-xs text-gray-400">{student.email}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-400">${student.tuitionFee.toLocaleString()}</span>
                  </div>

                  <p className="text-xs text-purple-300 line-clamp-1 font-medium">
                    {student.course}
                  </p>

                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-gray-800 text-gray-400">
                    <span>Attendance: <strong className="text-white">{student.attendanceRate}%</strong></span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      student.paymentStatus === "paid" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                    }`}>
                      {student.paymentStatus}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Detailed Student Profile (7 cols) */}
          {selectedStudent && (
            <div className="lg:col-span-7 bg-[#101422] rounded-3xl border border-gray-800 p-6 space-y-6 shadow-2xl">
              <div className="border-b border-gray-800 pb-4 flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-teal-400">{selectedStudent.id}</span>
                  <h3 className="text-xl font-extrabold text-white mt-0.5">{selectedStudent.name}</h3>
                  <div className="text-xs text-gray-400 mt-1 flex items-center gap-3">
                    <span>{selectedStudent.email}</span>
                    <span>•</span>
                    <span>{selectedStudent.phone}</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Enrolled: {selectedStudent.enrolledDate}
                </span>
              </div>

              {/* Course & Batch Card */}
              <div className="bg-gray-950/70 p-4 rounded-2xl border border-gray-800 space-y-2 text-xs">
                <span className="text-[10px] uppercase font-bold text-purple-400">Academic Program & Batch</span>
                <h4 className="font-bold text-white text-sm">{selectedStudent.course}</h4>
                <p className="text-gray-400">{selectedStudent.batch}</p>
              </div>

              {/* Financial & Attendance Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-gray-950/70 border border-gray-800">
                  <span className="text-gray-500 block text-[10px] uppercase">Tuition Fee</span>
                  <span className="font-bold text-emerald-400 text-lg">${selectedStudent.tuitionFee.toLocaleString()} USD</span>
                  <span className="text-[10px] text-emerald-300 block mt-1 capitalize">● Payment: {selectedStudent.paymentStatus}</span>
                </div>
                <div className="p-4 rounded-2xl bg-gray-950/70 border border-gray-800">
                  <span className="text-gray-500 block text-[10px] uppercase">Class Roll-Call Attendance</span>
                  <span className="font-bold text-white text-lg">{selectedStudent.attendanceRate}% Present</span>
                  <span className="text-[10px] text-gray-400 block mt-1">Eligible for Graduation Diploma</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ENROLL STUDENT MODAL */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleEnrollStudent} className="bg-[#101422] border border-gray-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs text-white">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <GraduationCap size={18} className="text-teal-400" /> Enroll New Student
              </h3>
              <button type="button" onClick={() => setIsEnrollModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="font-bold text-gray-300 block mb-1">Student Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Maya Lin"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-gray-300 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="maya@example.com"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="font-bold text-gray-300 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (555) 0192"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-300 block mb-1">Academic Program</label>
              <select
                value={course}
                onChange={e => setCourse(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="Full Stack Next.js & Cloud Engineering Bootcamp">Full Stack Next.js & Cloud Engineering Bootcamp</option>
                <option value="Specialty Coffee Roasting & Barista Masterclass">Specialty Coffee Roasting & Barista Masterclass</option>
                <option value="Enterprise ERP Architecture & Data Engineering">Enterprise ERP Architecture & Data Engineering</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-gray-300 block mb-1">Batch / Cohort</label>
                <input
                  type="text"
                  value={batch}
                  onChange={e => setBatch(e.target.value)}
                  placeholder="Fall 2026 Batch"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="font-bold text-gray-300 block mb-1">Tuition Fee ($)</label>
                <input
                  type="number"
                  value={tuition}
                  onChange={e => setTuition(Number(e.target.value))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setIsEnrollModalOpen(false)}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/30"
              >
                Enroll Student
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
