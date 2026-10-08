"use client";

import { useState } from "react";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import {
  Wrench,
  Plus,
  Car,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  User,
  Search,
  Filter,
  Layers,
  ArrowRight,
  X
} from "lucide-react";

const MENU_ITEMS = [
  { name: "Job Cards", href: "/automotive" },
  { name: "Spare Parts", href: "/inventory" },
  { name: "Invoicing", href: "/accounting" },
  { name: "Mechanic Timesheets", href: "/timesheets" }
];

type JobCardStatus = "diagnosing" | "waiting_parts" | "in_repair" | "qc_test" | "ready_pickup" | "invoiced";

type JobCard = {
  id: string;
  vehicle: string; // e.g. "2023 BMW M340i xDrive"
  licensePlate: string;
  vin: string;
  customer: string;
  customerPhone: string;
  mechanic: string;
  bay: string;
  serviceRequested: string;
  estimatedLaborHours: number;
  actualLaborHours: number;
  partsTotal: number;
  laborTotal: number;
  status: JobCardStatus;
  openedDate: string;
};

const INITIAL_JOB_CARDS: JobCard[] = [
  {
    id: "JOB-2026-081",
    vehicle: "2023 Porsche 911 Carrera 4S",
    licensePlate: "CA-9XTR88",
    vin: "WP0AB2A99PS248102",
    customer: "David Richardson",
    customerPhone: "+1 (415) 555-0199",
    mechanic: "Alex Mercer (Master Tech)",
    bay: "Bay 01 (Performance Lift)",
    serviceRequested: "Annual Major Service, Spark Plugs, PDK Transmission Flush & Ceramic Brake Inspection",
    estimatedLaborHours: 5.5,
    actualLaborHours: 4.0,
    partsTotal: 840.00,
    laborTotal: 720.00,
    status: "in_repair",
    openedDate: "2026-10-07"
  },
  {
    id: "JOB-2026-082",
    vehicle: "2021 Toyota Land Cruiser V8",
    licensePlate: "TX-44B910",
    vin: "JTMCY7AJ4M4091244",
    customer: "Elena Rostova",
    customerPhone: "+1 (512) 555-0144",
    mechanic: "Marcus Chen",
    bay: "Bay 03 (Heavy Duty)",
    serviceRequested: "Suspension Bushings Replacement, Front Wheel Alignment & AC Evaporator Service",
    estimatedLaborHours: 4.0,
    actualLaborHours: 3.5,
    partsTotal: 395.00,
    laborTotal: 480.00,
    status: "ready_pickup",
    openedDate: "2026-10-06"
  },
  {
    id: "JOB-2026-083",
    vehicle: "2024 Mercedes-Benz E350",
    licensePlate: "NY-789XYZ",
    vin: "W1KZF8DB8PA109822",
    customer: "Marcus Vance",
    customerPhone: "+1 (212) 555-0811",
    mechanic: "Sam K.",
    bay: "Bay 02 (Diagnostics)",
    serviceRequested: "Check Engine Light Diagnosis: O2 Sensor bank 1 error code P0135",
    estimatedLaborHours: 2.0,
    actualLaborHours: 1.0,
    partsTotal: 185.00,
    laborTotal: 220.00,
    status: "waiting_parts",
    openedDate: "2026-10-08"
  }
];

export default function AutomotiveWorkshopPage() {
  const [jobCards, setJobCards] = useState<JobCard[]>(INITIAL_JOB_CARDS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedJob, setSelectedJob] = useState<JobCard | null>(jobCards[0]);
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);

  // New Job Form State
  const [vehicle, setVehicle] = useState("");
  const [plate, setPlate] = useState("");
  const [vin, setVin] = useState("");
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("");
  const [mechanic, setMechanic] = useState("Alex Mercer (Master Tech)");
  const [bay, setBay] = useState("Bay 01");
  const [laborEst, setLaborEst] = useState(3.0);
  const [partsEst, setPartsEst] = useState(250.0);

  const filteredJobs = jobCards.filter(j => {
    const matchesSearch =
      j.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeRepairsCount = jobCards.filter(j => j.status !== "invoiced").length;
  const readyCount = jobCards.filter(j => j.status === "ready_pickup").length;
  const totalWipValue = jobCards.reduce((acc, j) => acc + (j.partsTotal + j.laborTotal), 0);

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle.trim() || !customer.trim()) return;

    const newJob: JobCard = {
      id: `JOB-2026-${Math.floor(100 + Math.random() * 900)}`,
      vehicle: vehicle.trim(),
      licensePlate: plate.trim() || "PENDING",
      vin: vin.trim() || `VIN-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      customer: customer.trim(),
      customerPhone: phone.trim() || "+1 (555) 000-0000",
      mechanic,
      bay,
      serviceRequested: service.trim() || "General Inspection",
      estimatedLaborHours: Number(laborEst),
      actualLaborHours: 0,
      partsTotal: Number(partsEst),
      laborTotal: Number(laborEst) * 120, // $120/hr labor rate
      status: "diagnosing",
      openedDate: new Date().toISOString().slice(0, 10)
    };

    setJobCards([newJob, ...jobCards]);
    setSelectedJob(newJob);
    setIsNewJobModalOpen(false);
  };

  const handleAdvanceStatus = (jobId: string, nextStatus: JobCardStatus) => {
    setJobCards(prev =>
      prev.map(j => (j.id === jobId ? { ...j, status: nextStatus } : j))
    );
    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob({ ...selectedJob, status: nextStatus });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#07090f] text-white selection:bg-purple-500 selection:text-white">
      <StandardModuleHeader
        moduleName="Automotive & Workshop"
        moduleIcon={<Wrench size={20} />}
        menuItems={MENU_ITEMS}
        searchPlaceholder="Search vehicles, VINs, or job cards..."
      />

      <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="galaxy-card p-4 rounded-2xl bg-[#101422] border border-blue-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Active Repair Jobs</span>
              <h3 className="text-2xl font-bold text-blue-400 mt-0.5">{activeRepairsCount} In Progress</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">3 Work Bays Active</p>
            </div>
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
              <Car size={20} />
            </div>
          </div>

          <div className="galaxy-card p-4 rounded-2xl bg-[#101422] border border-emerald-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Ready for Customer Pickup</span>
              <h3 className="text-2xl font-bold text-emerald-400 mt-0.5">{readyCount} Vehicles</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">QC passed & cleaned</p>
            </div>
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <CheckCircle2 size={20} />
            </div>
          </div>

          <div className="galaxy-card p-4 rounded-2xl bg-[#101422] border border-purple-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Total WIP Service Value</span>
              <h3 className="text-2xl font-bold text-purple-400 mt-0.5">${totalWipValue.toLocaleString()}</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Labor & Parts billables</p>
            </div>
            <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
              <DollarSign size={20} />
            </div>
          </div>

          <div className="galaxy-card p-4 rounded-2xl bg-[#101422] border border-amber-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Labor Efficiency</span>
              <h3 className="text-2xl font-bold text-amber-400 mt-0.5">94.8%</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Master Tech Target: &gt; 90%</p>
            </div>
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
              <Clock size={20} />
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
                placeholder="Search job cards..."
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
                All Jobs ({jobCards.length})
              </button>
              <button
                onClick={() => setStatusFilter("in_repair")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  statusFilter === "in_repair" ? "bg-purple-600 text-white shadow-md" : "text-gray-400 hover:text-white"
                }`}
              >
                In Service ({jobCards.filter(j => j.status === "in_repair").length})
              </button>
              <button
                onClick={() => setStatusFilter("ready_pickup")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  statusFilter === "ready_pickup" ? "bg-emerald-600 text-white shadow-md" : "text-gray-400 hover:text-white"
                }`}
              >
                Ready ({readyCount})
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsNewJobModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-600/30 transition-all active:scale-95"
          >
            <Plus size={14} /> + Open Vehicle Job Card
          </button>
        </div>

        {/* Job Cards & Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Job Cards List (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {filteredJobs.map(job => {
              const isSelected = selectedJob?.id === job.id;
              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-3 ${
                    isSelected
                      ? "bg-[#181a28] border-red-500 shadow-xl shadow-red-950/60 ring-1 ring-red-500"
                      : "bg-[#101422] border-gray-800 hover:border-gray-700"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-red-400 block">{job.id}</span>
                      <h4 className="font-bold text-white text-sm mt-0.5">{job.vehicle}</h4>
                      <p className="text-xs text-gray-400">{job.licensePlate} • {job.customer}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-400">
                      ${(job.partsTotal + job.laborTotal).toFixed(2)}
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 line-clamp-1">
                    {job.serviceRequested}
                  </p>

                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-gray-800 text-gray-400">
                    <span>{job.bay}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      job.status === "ready_pickup" ? "bg-emerald-500/20 text-emerald-300" : "bg-purple-500/20 text-purple-300"
                    }`}>
                      {job.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Detailed Job Card Viewer (7 cols) */}
          {selectedJob && (
            <div className="lg:col-span-7 bg-[#101422] rounded-3xl border border-gray-800 p-6 space-y-6 shadow-2xl">
              <div className="border-b border-gray-800 pb-4 flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-red-400">{selectedJob.id}</span>
                  <h3 className="text-xl font-extrabold text-white mt-0.5">{selectedJob.vehicle}</h3>
                  <div className="text-xs text-gray-400 mt-1 flex items-center gap-3">
                    <span>Plate: <strong className="text-white">{selectedJob.licensePlate}</strong></span>
                    <span>•</span>
                    <span className="font-mono">VIN: {selectedJob.vin}</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-red-500/20 text-red-300 border border-red-500/30">
                  {selectedJob.bay}
                </span>
              </div>

              {/* Customer & Mechanic Info */}
              <div className="grid grid-cols-2 gap-3 bg-gray-950/70 p-4 rounded-2xl border border-gray-800 text-xs">
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase">Vehicle Owner</span>
                  <span className="font-bold text-white text-sm">{selectedJob.customer}</span>
                  <span className="text-gray-400 block mt-0.5">{selectedJob.customerPhone}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase">Assigned Technician</span>
                  <span className="font-bold text-white text-sm">{selectedJob.mechanic}</span>
                  <span className="text-gray-400 block mt-0.5">Estimated Time: {selectedJob.estimatedLaborHours} hrs</span>
                </div>
              </div>

              {/* Service Description */}
              <div className="space-y-1.5 text-xs">
                <span className="font-bold uppercase tracking-wider text-purple-400 text-[10px]">Diagnostics & Requested Services:</span>
                <p className="bg-gray-900/90 p-3.5 rounded-xl border border-gray-800 text-gray-200 leading-relaxed">
                  {selectedJob.serviceRequested}
                </p>
              </div>

              {/* Financials & Labor Quote */}
              <div className="bg-gradient-to-r from-red-950/30 via-orange-950/30 to-red-950/30 p-4 rounded-2xl border border-red-500/20 grid grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Spare Parts Total</span>
                  <span className="font-bold text-white text-base">${selectedJob.partsTotal.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Labor Charge</span>
                  <span className="font-bold text-amber-400 text-base">${selectedJob.laborTotal.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Grand Total Quote</span>
                  <span className="font-bold text-emerald-400 text-base">
                    ${(selectedJob.partsTotal + selectedJob.laborTotal).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Status Progression Workflow */}
              <div className="space-y-2 pt-2 border-t border-gray-800">
                <span className="font-bold uppercase tracking-wider text-gray-400 text-[10px]">Advance Job Card Workflow:</span>
                <div className="flex flex-wrap gap-2">
                  {(["diagnosing", "waiting_parts", "in_repair", "qc_test", "ready_pickup", "invoiced"] as JobCardStatus[]).map(st => (
                    <button
                      key={st}
                      onClick={() => handleAdvanceStatus(selectedJob.id, st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedJob.status === st
                          ? "bg-red-600 text-white shadow-md shadow-red-900/40"
                          : "bg-gray-900 text-gray-400 hover:text-white border border-gray-800"
                      }`}
                    >
                      {st.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* NEW JOB MODAL */}
      {isNewJobModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleCreateJob} className="bg-[#101422] border border-gray-700 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs text-white">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wrench size={18} className="text-red-400" /> Open Vehicle Job Card
              </h3>
              <button type="button" onClick={() => setIsNewJobModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="font-bold text-gray-300 block mb-1">Vehicle Make & Model *</label>
              <input
                type="text"
                required
                value={vehicle}
                onChange={e => setVehicle(e.target.value)}
                placeholder="e.g. 2024 Mercedes-Benz C300"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-gray-300 block mb-1">License Plate</label>
                <input
                  type="text"
                  value={plate}
                  onChange={e => setPlate(e.target.value)}
                  placeholder="CA-88219"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="font-bold text-gray-300 block mb-1">VIN (17-digit)</label>
                <input
                  type="text"
                  value={vin}
                  onChange={e => setVin(e.target.value)}
                  placeholder="WP0AB2A99..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-gray-300 block mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={customer}
                  onChange={e => setCustomer(e.target.value)}
                  placeholder="John Smith"
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-gray-300 block mb-1">Assigned Mechanic</label>
                <select
                  value={mechanic}
                  onChange={e => setMechanic(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Alex Mercer (Master Tech)">Alex Mercer (Master Tech)</option>
                  <option value="Marcus Chen (Diagnostics)">Marcus Chen (Diagnostics)</option>
                  <option value="Sam K. (Brakes & Suspension)">Sam K. (Brakes & Suspension)</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-gray-300 block mb-1">Work Bay</label>
                <select
                  value={bay}
                  onChange={e => setBay(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Bay 01 (Performance Lift)">Bay 01 (Performance Lift)</option>
                  <option value="Bay 02 (Diagnostics)">Bay 02 (Diagnostics)</option>
                  <option value="Bay 03 (Heavy Duty)">Bay 03 (Heavy Duty)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-300 block mb-1">Reported Issue / Work Scope</label>
              <textarea
                rows={2}
                value={service}
                onChange={e => setService(e.target.value)}
                placeholder="Oil change, brake squeal, engine sputtering on acceleration..."
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setIsNewJobModalOpen(false)}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/30"
              >
                Open Job Card
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
