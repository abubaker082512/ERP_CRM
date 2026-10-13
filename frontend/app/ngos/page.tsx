"use client";

import { useState, useEffect } from "react";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { useBranchContext } from "@/lib/branchContext";
import {
  HeartHandshake,
  Plus,
  Users,
  Globe,
  DollarSign,
  CheckCircle2,
  Search,
  ShieldCheck,
  X,
  Building2,
  FileText
} from "lucide-react";

const MENU_ITEMS = [
  { name: "Grants & Donors", href: "/ngos" },
  { name: "Field Programs", href: "/project" },
  { name: "Fund Accounting", href: "/accounting" },
  { name: "Beneficiary Surveys", href: "/surveys" }
];

type NGOProgram = {
  id: string;
  programTitle: string;
  donorName: string;
  donorEmail: string;
  category: string;
  fundType: "restricted" | "unrestricted";
  grantAmount: number;
  disbursedAmount: number;
  beneficiariesReached: number;
  status: "active" | "completed" | "under_review";
  region: string;
  startDate: string;
};

export default function NGOsHubPage() {
  const { activeBranch, getEntityStorageKey } = useBranchContext();
  const [programs, setPrograms] = useState<NGOProgram[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [fundFilter, setFundFilter] = useState<string>("ALL");
  const [selectedProgram, setSelectedProgram] = useState<NGOProgram | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [programTitle, setProgramTitle] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [category, setCategory] = useState("Humanitarian & Disaster Relief");
  const [fundType, setFundType] = useState<"restricted" | "unrestricted">("restricted");
  const [grantAmount, setGrantAmount] = useState(50000);
  const [beneficiariesReached, setBeneficiariesReached] = useState(1200);
  const [region, setRegion] = useState("Global / Multi-Region");

  useEffect(() => {
    if (!activeBranch) return;

    const key = getEntityStorageKey("ngo_programs");
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPrograms(parsed);
        if (parsed.length > 0) setSelectedProgram(parsed[0]);
        else setSelectedProgram(null);
      } catch {
        setPrograms([]);
        setSelectedProgram(null);
      }
    } else {
      setPrograms([]);
      setSelectedProgram(null);
    }
  }, [activeBranch?.id]);

  const persistPrograms = (updated: NGOProgram[]) => {
    setPrograms(updated);
    try {
      const key = getEntityStorageKey("ngo_programs");
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}
  };

  const filteredPrograms = programs.filter(p => {
    const matchesSearch =
      p.programTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.region.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFund = fundFilter === "ALL" || p.fundType === fundFilter;
    return matchesSearch && matchesFund;
  });

  const totalGrantFunding = programs.reduce((acc, p) => acc + p.grantAmount, 0);
  const totalBeneficiaries = programs.reduce((acc, p) => acc + p.beneficiariesReached, 0);

  const handleCreateProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!programTitle.trim() || !donorName.trim()) return;

    const newProgram: NGOProgram = {
      id: `NGO-2026-${Math.floor(100 + Math.random() * 900)}`,
      programTitle: programTitle.trim(),
      donorName: donorName.trim(),
      donorEmail: donorEmail.trim() || "grants@donor-foundation.org",
      category,
      fundType,
      grantAmount: Number(grantAmount),
      disbursedAmount: Math.round(Number(grantAmount) * 0.35),
      beneficiariesReached: Number(beneficiariesReached),
      status: "active",
      region: region.trim() || "Global Operations",
      startDate: new Date().toISOString().slice(0, 10)
    };

    const updated = [newProgram, ...programs];
    persistPrograms(updated);
    setSelectedProgram(newProgram);
    setIsModalOpen(false);
    setProgramTitle("");
    setDonorName("");
    setDonorEmail("");
  };

  return (
    <div className="flex flex-col h-screen bg-[#07090f] text-white selection:bg-rose-500 selection:text-white">
      <StandardModuleHeader
        moduleName="NGOs, Grants & Humanitarian Hub"
        moduleIcon={<HeartHandshake size={20} />}
        menuItems={MENU_ITEMS}
        searchPlaceholder="Search grants, donors, or relief programs..."
      />

      <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="galaxy-card p-4 rounded-2xl bg-[#101422] border border-rose-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Active NGO Programs</span>
              <h3 className="text-2xl font-bold text-rose-400 mt-0.5">{programs.length} Programs</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Field & Grant Initiatives</p>
            </div>
            <div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl">
              <HeartHandshake size={20} />
            </div>
          </div>

          <div className="galaxy-card p-4 rounded-2xl bg-[#101422] border border-emerald-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Total Grant & Donor Pool</span>
              <h3 className="text-2xl font-bold text-emerald-400 mt-0.5">${totalGrantFunding.toLocaleString()}</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Restricted & Unrestricted</p>
            </div>
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <DollarSign size={20} />
            </div>
          </div>

          <div className="galaxy-card p-4 rounded-2xl bg-[#101422] border border-cyan-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Beneficiaries Reached</span>
              <h3 className="text-2xl font-bold text-cyan-400 mt-0.5">{totalBeneficiaries.toLocaleString()}</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Verified Direct Impact</p>
            </div>
            <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-xl">
              <Users size={20} />
            </div>
          </div>

          <div className="galaxy-card p-4 rounded-2xl bg-[#101422] border border-purple-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Audit & Fund Compliance</span>
              <h3 className="text-2xl font-bold text-purple-400 mt-0.5">100%</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Donor Reporting Ready</p>
            </div>
            <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
              <ShieldCheck size={20} />
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
                placeholder="Search grants or donors..."
                className="bg-gray-900 border border-gray-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 w-48 sm:w-60"
              />
            </div>

            <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-800 text-xs font-bold">
              <button
                onClick={() => setFundFilter("ALL")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  fundFilter === "ALL" ? "bg-rose-600 text-white shadow-md" : "text-gray-400 hover:text-white"
                }`}
              >
                All Funds ({programs.length})
              </button>
              <button
                onClick={() => setFundFilter("restricted")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  fundFilter === "restricted" ? "bg-purple-600 text-white shadow-md" : "text-gray-400 hover:text-white"
                }`}
              >
                Restricted Grants ({programs.filter(p => p.fundType === "restricted").length})
              </button>
              <button
                onClick={() => setFundFilter("unrestricted")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  fundFilter === "unrestricted" ? "bg-emerald-600 text-white shadow-md" : "text-gray-400 hover:text-white"
                }`}
              >
                Unrestricted ({programs.filter(p => p.fundType === "unrestricted").length})
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={14} /> + New Grant / Aid Program
          </button>
        </div>

        {/* Programs Directory & Details Grid */}
        {filteredPrograms.length === 0 ? (
          <div className="bg-[#101422]/70 border border-dashed border-gray-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shadow-inner">
              <HeartHandshake size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">No NGO Grants or Aid Programs Registered Yet</h3>
              <p className="text-xs text-gray-400 max-w-sm">
                {activeBranch?.name
                  ? `Grant and donor ledger for "${activeBranch.name}" is isolated and ready for your organization.`
                  : "Register your first institutional grant, donor campaign, or field relief program."}
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-rose-600/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <Plus size={16} /> + Register First Grant / Program
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Program List (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              {filteredPrograms.map(prog => {
                const isSelected = selectedProgram?.id === prog.id;
                return (
                  <div
                    key={prog.id}
                    onClick={() => setSelectedProgram(prog)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-3 ${
                      isSelected
                        ? "bg-[#161c28] border-rose-500 shadow-xl shadow-rose-950/60 ring-1 ring-rose-500"
                        : "bg-[#101422] border-gray-800 hover:border-gray-700"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-[10px] font-bold text-rose-400 block">{prog.id}</span>
                        <h4 className="font-bold text-white text-sm mt-0.5">{prog.programTitle}</h4>
                        <p className="text-xs text-gray-400">{prog.donorName}</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-400">${prog.grantAmount.toLocaleString()}</span>
                    </div>

                    <p className="text-xs text-purple-300 line-clamp-1 font-medium">
                      {prog.category} • {prog.region}
                    </p>

                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-gray-800 text-gray-400">
                      <span>Beneficiaries: <strong className="text-white">{prog.beneficiariesReached.toLocaleString()}</strong></span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        prog.fundType === "restricted" ? "bg-purple-500/20 text-purple-300" : "bg-emerald-500/20 text-emerald-300"
                      }`}>
                        {prog.fundType} Fund
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Detailed Program Profile (7 cols) */}
            {selectedProgram && (
              <div className="lg:col-span-7 bg-[#101422] rounded-3xl border border-gray-800 p-6 space-y-6 shadow-2xl">
                <div className="border-b border-gray-800 pb-4 flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-rose-400">{selectedProgram.id}</span>
                    <h3 className="text-xl font-extrabold text-white mt-0.5">{selectedProgram.programTitle}</h3>
                    <div className="text-xs text-gray-400 mt-1 flex items-center gap-3">
                      <span className="flex items-center gap-1"><Building2 size={12} /> {selectedProgram.donorName}</span>
                      <span>•</span>
                      <span>{selectedProgram.donorEmail}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Started: {selectedProgram.startDate}
                  </span>
                </div>

                {/* Sector & Region Card */}
                <div className="bg-gray-950/70 p-4 rounded-2xl border border-gray-800 space-y-2 text-xs">
                  <span className="text-[10px] uppercase font-bold text-rose-400">Humanitarian Sub-Sector & Deployment Region</span>
                  <h4 className="font-bold text-white text-sm">{selectedProgram.category}</h4>
                  <p className="text-gray-400 flex items-center gap-1.5">
                    <Globe size={13} className="text-cyan-400" /> {selectedProgram.region}
                  </p>
                </div>

                {/* Financial & Impact Metrics */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-4 rounded-2xl bg-gray-950/70 border border-gray-800">
                    <span className="text-gray-500 block text-[10px] uppercase">Total Committed Grant</span>
                    <span className="font-bold text-emerald-400 text-lg">${selectedProgram.grantAmount.toLocaleString()} USD</span>
                    <span className="text-[10px] text-purple-300 block mt-1 uppercase font-semibold">
                      ● {selectedProgram.fundType} Fund Allocation
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-950/70 border border-gray-800">
                    <span className="text-gray-500 block text-[10px] uppercase">Verified Beneficiaries Reached</span>
                    <span className="font-bold text-white text-lg">{selectedProgram.beneficiariesReached.toLocaleString()} People</span>
                    <span className="text-[10px] text-cyan-300 block mt-1">
                      Disbursed: ${selectedProgram.disbursedAmount.toLocaleString()} USD
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* NEW NGO GRANT / PROGRAM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleCreateProgram} className="bg-[#101422] border border-gray-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs text-white">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HeartHandshake size={18} className="text-rose-400" /> Register Grant / Relief Program
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="font-bold text-gray-300 block mb-1">Program / Campaign Title *</label>
              <input
                type="text"
                required
                value={programTitle}
                onChange={e => setProgramTitle(e.target.value)}
                placeholder="e.g. Clean Water & Solar Microgrid Initiative"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-gray-300 block mb-1">Donor / Foundation Name *</label>
                <input
                  type="text"
                  required
                  value={donorName}
                  onChange={e => setDonorName(e.target.value)}
                  placeholder="e.g. Global Relief Trust"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="font-bold text-gray-300 block mb-1">Donor Contact Email</label>
                <input
                  type="email"
                  value={donorEmail}
                  onChange={e => setDonorEmail(e.target.value)}
                  placeholder="grants@foundation.org"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-gray-300 block mb-1">NGO Sub-Sector</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Humanitarian & Disaster Relief">Humanitarian & Disaster Relief</option>
                  <option value="Charitable Foundation & Endowment">Charitable Foundation & Endowment</option>
                  <option value="International Development">International Development</option>
                  <option value="Environmental & Climate Action">Environmental & Climate Action</option>
                  <option value="Education, Health & Social Welfare">Education, Health & Social Welfare</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-gray-300 block mb-1">Fund Restriction</label>
                <select
                  value={fundType}
                  onChange={e => setFundType(e.target.value as "restricted" | "unrestricted")}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="restricted">Restricted Grant</option>
                  <option value="unrestricted">Unrestricted Donation</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-gray-300 block mb-1">Grant Amount ($)</label>
                <input
                  type="number"
                  value={grantAmount}
                  onChange={e => setGrantAmount(Number(e.target.value))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="font-bold text-gray-300 block mb-1">Beneficiaries</label>
                <input
                  type="number"
                  value={beneficiariesReached}
                  onChange={e => setBeneficiariesReached(Number(e.target.value))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="font-bold text-gray-300 block mb-1">Target Region</label>
                <input
                  type="text"
                  value={region}
                  onChange={e => setRegion(e.target.value)}
                  placeholder="MENA / South Asia"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/30 cursor-pointer"
              >
                Save Grant Program
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
