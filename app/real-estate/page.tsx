"use client";

import { useState } from "react";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import {
  Building2,
  Plus,
  Home,
  Users,
  DollarSign,
  Calendar,
  CheckCircle2,
  FileText,
  Search,
  Filter,
  Layers,
  ArrowRight,
  X,
  MapPin
} from "lucide-react";
import Link from "next/link";

const MENU_ITEMS = [
  { name: "Property & Units", href: "/real-estate" },
  { name: "Lease Contracts", href: "/real-estate" },
  { name: "Rent Invoicing", href: "/accounting" },
  { name: "Maintenance Tickets", href: "/helpdesk" },
  { name: "Digital Signing", href: "/sign" }
];

type UnitStatus = "occupied" | "vacant" | "maintenance" | "reserved";

type PropertyUnit = {
  id: string;
  propertyName: string;
  unitNumber: string;
  unitType: "Commercial Office" | "Retail Storefront" | "Luxury Apartment" | "Warehouse Bay";
  sqft: number;
  monthlyRent: number;
  status: UnitStatus;
  tenantName?: string;
  tenantPhone?: string;
  leaseStart?: string;
  leaseEnd?: string;
  depositHeld?: number;
};

const INITIAL_UNITS: PropertyUnit[] = [
  {
    id: "UNT-101",
    propertyName: "Montgomery Financial Tower",
    unitNumber: "Suite 1400",
    unitType: "Commercial Office",
    sqft: 4500,
    monthlyRent: 18500,
    status: "occupied",
    tenantName: "Apex Venture Partners LLC",
    tenantPhone: "+1 (415) 555-0810",
    leaseStart: "2024-01-01",
    leaseEnd: "2027-12-31",
    depositHeld: 37000
  },
  {
    id: "UNT-102",
    propertyName: "Montgomery Financial Tower",
    unitNumber: "Suite 1410",
    unitType: "Commercial Office",
    sqft: 2800,
    monthlyRent: 11200,
    status: "vacant",
    depositHeld: 0
  },
  {
    id: "UNT-103",
    propertyName: "SoHo Retail Arcade",
    unitNumber: "Storefront #03",
    unitType: "Retail Storefront",
    sqft: 1850,
    monthlyRent: 14500,
    status: "occupied",
    tenantName: "Maison de SoHo Boutique",
    tenantPhone: "+1 (212) 555-0144",
    leaseStart: "2023-06-01",
    leaseEnd: "2026-05-31",
    depositHeld: 29000
  },
  {
    id: "UNT-104",
    propertyName: "Marina Bay Residences",
    unitNumber: "Penthouse 42B",
    unitType: "Luxury Apartment",
    sqft: 3200,
    monthlyRent: 9800,
    status: "occupied",
    tenantName: "Alexander Vance",
    tenantPhone: "+1 (415) 555-0199",
    leaseStart: "2024-03-15",
    leaseEnd: "2026-03-14",
    depositHeld: 19600
  }
];

export default function RealEstatePropertyPage() {
  const [units, setUnits] = useState<PropertyUnit[]>(INITIAL_UNITS);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<PropertyUnit | null>(units[0]);
  const [isNewUnitModalOpen, setIsNewUnitModalOpen] = useState(false);

  // Form State
  const [propName, setPropName] = useState("Montgomery Financial Tower");
  const [unitNum, setUnitNum] = useState("");
  const [unitType, setUnitType] = useState<any>("Commercial Office");
  const [sqft, setSqft] = useState(2500);
  const [rent, setRent] = useState(8500);

  const filteredUnits = units.filter(u => {
    const matchesSearch =
      u.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.unitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.tenantName && u.tenantName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "ALL" || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const occupiedCount = units.filter(u => u.status === "occupied").length;
  const vacantCount = units.filter(u => u.status === "vacant").length;
  const totalMonthlyRentRoll = units.reduce((acc, u) => acc + (u.status === "occupied" ? u.monthlyRent : 0), 0);

  const handleCreateUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitNum.trim()) return;

    const newUnit: PropertyUnit = {
      id: `UNT-${Date.now().toString().slice(-3)}`,
      propertyName: propName,
      unitNumber: unitNum.trim(),
      unitType,
      sqft: Number(sqft),
      monthlyRent: Number(rent),
      status: "vacant"
    };

    setUnits([newUnit, ...units]);
    setSelectedUnit(newUnit);
    setIsNewUnitModalOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[#07090f] text-white selection:bg-purple-500 selection:text-white">
      <StandardModuleHeader
        moduleName="Real Estate & Property"
        moduleIcon={<Building2 size={20} />}
        menuItems={MENU_ITEMS}
        searchPlaceholder="Search properties, units, or tenants..."
      />

      <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="galaxy-card p-4 rounded-2xl bg-[#101422] border border-blue-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Total Unit Portfolio</span>
              <h3 className="text-2xl font-bold text-blue-400 mt-0.5">{units.length} Units</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Commercial & Residential</p>
            </div>
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
              <Building2 size={20} />
            </div>
          </div>

          <div className="galaxy-card p-4 rounded-2xl bg-[#101422] border border-emerald-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Portfolio Occupancy</span>
              <h3 className="text-2xl font-bold text-emerald-400 mt-0.5">
                {Math.round((occupiedCount / units.length) * 100)}%
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">{occupiedCount} Leased • {vacantCount} Vacant</p>
            </div>
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <CheckCircle2 size={20} />
            </div>
          </div>

          <div className="galaxy-card p-4 rounded-2xl bg-[#101422] border border-purple-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Monthly Contracted Rent Roll</span>
              <h3 className="text-2xl font-bold text-purple-400 mt-0.5">${totalMonthlyRentRoll.toLocaleString()}</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">${(totalMonthlyRentRoll * 12 / 1000).toFixed(0)}k Annual Gross</p>
            </div>
            <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
              <DollarSign size={20} />
            </div>
          </div>

          <div className="galaxy-card p-4 rounded-2xl bg-[#101422] border border-amber-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Security Deposits Held</span>
              <h3 className="text-2xl font-bold text-amber-400 mt-0.5">
                ${units.reduce((acc, u) => acc + (u.depositHeld || 0), 0).toLocaleString()}
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Escrow protected</p>
            </div>
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
              <FileText size={20} />
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
                placeholder="Search units & tenants..."
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
                All Units ({units.length})
              </button>
              <button
                onClick={() => setStatusFilter("occupied")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  statusFilter === "occupied" ? "bg-emerald-600 text-white shadow-md" : "text-gray-400 hover:text-white"
                }`}
              >
                Occupied ({occupiedCount})
              </button>
              <button
                onClick={() => setStatusFilter("vacant")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  statusFilter === "vacant" ? "bg-amber-600 text-white shadow-md" : "text-gray-400 hover:text-white"
                }`}
              >
                Vacant ({vacantCount})
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsNewUnitModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Plus size={14} /> + Add Property Unit / Lease
          </button>
        </div>

        {/* Units Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Unit Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {filteredUnits.map(unit => {
              const isSelected = selectedUnit?.id === unit.id;
              return (
                <div
                  key={unit.id}
                  onClick={() => setSelectedUnit(unit)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-3 ${
                    isSelected
                      ? "bg-[#161b2e] border-indigo-500 shadow-xl shadow-indigo-950/60 ring-1 ring-indigo-500"
                      : "bg-[#101422] border-gray-800 hover:border-gray-700"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 block">{unit.propertyName}</span>
                      <h4 className="font-bold text-white text-sm mt-0.5">{unit.unitNumber}</h4>
                      <p className="text-xs text-purple-300">{unit.unitType} • {unit.sqft} sq ft</p>
                    </div>
                    <span className="text-sm font-bold text-emerald-400">
                      ${unit.monthlyRent.toLocaleString()} / mo
                    </span>
                  </div>

                  {unit.tenantName ? (
                    <div className="text-xs text-gray-300 bg-gray-950/60 p-2.5 rounded-xl border border-gray-800 flex items-center justify-between">
                      <span>Tenant: <strong className="text-white">{unit.tenantName}</strong></span>
                      <span className="text-[10px] text-gray-400">Lease to {unit.leaseEnd}</span>
                    </div>
                  ) : (
                    <div className="text-xs text-amber-400/80 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20 font-semibold">
                      Vacant • Ready for New Lease Listing
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: Lease Agreement & Details (7 cols) */}
          {selectedUnit && (
            <div className="lg:col-span-7 bg-[#101422] rounded-3xl border border-gray-800 p-6 space-y-6 shadow-2xl">
              <div className="border-b border-gray-800 pb-4 flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-400">{selectedUnit.propertyName}</span>
                  <h3 className="text-xl font-extrabold text-white mt-0.5">{selectedUnit.unitNumber}</h3>
                  <p className="text-xs text-gray-400">{selectedUnit.unitType} • {selectedUnit.sqft} Square Feet</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  selectedUnit.status === "occupied" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}>
                  {selectedUnit.status}
                </span>
              </div>

              {/* Lease Commercial Terms */}
              <div className="bg-gray-950/70 p-4 rounded-2xl border border-gray-800 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase">Monthly Rent Rate</span>
                  <span className="font-bold text-emerald-400 text-base">${selectedUnit.monthlyRent.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase">Security Deposit</span>
                  <span className="font-bold text-white text-base">${(selectedUnit.depositHeld || 0).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase">Annual Contract Value</span>
                  <span className="font-bold text-purple-300 text-base">${(selectedUnit.monthlyRent * 12).toLocaleString()}</span>
                </div>
              </div>

              {/* Tenant Profile */}
              {selectedUnit.tenantName ? (
                <div className="space-y-3 bg-gray-900/60 p-4 rounded-2xl border border-gray-800 text-xs">
                  <span className="font-bold uppercase tracking-wider text-purple-400 text-[10px]">Active Tenant & Lease Contract:</span>
                  <div className="grid grid-cols-2 gap-3 text-gray-300">
                    <div>
                      <span className="text-gray-500 block text-[10px] uppercase">Legal Tenant</span>
                      <span className="font-bold text-white text-sm">{selectedUnit.tenantName}</span>
                      <span className="text-gray-400 block mt-0.5">{selectedUnit.tenantPhone}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px] uppercase">Lease Term Period</span>
                      <span className="font-semibold text-white">{selectedUnit.leaseStart} to {selectedUnit.leaseEnd}</span>
                      <span className="text-[10px] text-emerald-400 block mt-0.5">● Auto-invoicing active</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl border border-dashed border-gray-700 text-center space-y-2">
                  <Home size={28} className="mx-auto text-gray-500" />
                  <h4 className="font-bold text-white text-sm">No Active Tenant on File</h4>
                  <p className="text-xs text-gray-400">Unit is ready for marketing or lease contract execution.</p>
                  <Link
                    href="/sign"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    Draft Digital Lease Agreement
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* NEW UNIT MODAL */}
      {isNewUnitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleCreateUnit} className="bg-[#101422] border border-gray-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs text-white">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 size={18} className="text-indigo-400" /> Add Property Unit
              </h3>
              <button type="button" onClick={() => setIsNewUnitModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="font-bold text-gray-300 block mb-1">Property Complex Name *</label>
              <input
                type="text"
                required
                value={propName}
                onChange={e => setPropName(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-gray-300 block mb-1">Unit Number / Suite *</label>
                <input
                  type="text"
                  required
                  value={unitNum}
                  onChange={e => setUnitNum(e.target.value)}
                  placeholder="e.g. Suite 204"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="font-bold text-gray-300 block mb-1">Unit Type</label>
                <select
                  value={unitType}
                  onChange={e => setUnitType(e.target.value as any)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Commercial Office">Commercial Office</option>
                  <option value="Retail Storefront">Retail Storefront</option>
                  <option value="Luxury Apartment">Luxury Apartment</option>
                  <option value="Warehouse Bay">Warehouse Bay</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-gray-300 block mb-1">Area (Sq Ft)</label>
                <input
                  type="number"
                  value={sqft}
                  onChange={e => setSqft(Number(e.target.value))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="font-bold text-gray-300 block mb-1">Monthly Rent ($)</label>
                <input
                  type="number"
                  value={rent}
                  onChange={e => setRent(Number(e.target.value))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setIsNewUnitModalOpen(false)}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30"
              >
                Save Property Unit
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
