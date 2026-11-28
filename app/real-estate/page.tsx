"use client";

import { useState, useEffect } from "react";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { useBranchContext } from "@/lib/branchContext";
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
  unitType:
    | "Commercial Office"
    | "Retail Storefront"
    | "Luxury Apartment"
    | "Warehouse Bay"
    | "Executive Hotel Suite"
    | "Resort Pool Villa"
    | "Banquet & Conference Hall";
  sqft: number;
  monthlyRent: number;
  status: UnitStatus;
  housekeeping?: "Clean" | "Dirty" | "Inspecting";
  tenantName?: string;
  tenantPhone?: string;
  leaseStart?: string;
  leaseEnd?: string;
  depositHeld?: number;
};

const INITIAL_UNITS: PropertyUnit[] = [];

export default function RealEstatePropertyPage() {
  const { activeBranch, userEmail, currencySymbol, getEntityStorageKey } = useBranchContext();
  const [operatingMode, setOperatingMode] = useState<"property" | "hospitality">("property");
  const [units, setUnits] = useState<PropertyUnit[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<PropertyUnit | null>(null);
  const [isNewUnitModalOpen, setIsNewUnitModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [guestInput, setGuestInput] = useState("");

  // Form State
  const [propName, setPropName] = useState("Corporate Tower");
  const [unitNum, setUnitNum] = useState("");
  const [unitType, setUnitType] = useState<any>("Commercial Office");
  const [sqft, setSqft] = useState(2500);
  const [rent, setRent] = useState(8500);
  const [tenantInput, setTenantInput] = useState("");

  // Entity-scoped data loading
  useEffect(() => {
    if (!activeBranch) return;

    const key = getEntityStorageKey("real_estate_units");
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUnits(parsed);
        if (parsed.length > 0) setSelectedUnit(parsed[0]);
        else setSelectedUnit(null);
      } catch {
        setUnits([]);
        setSelectedUnit(null);
      }
    } else {
      setUnits([]);
      setSelectedUnit(null);
    }
    let email = "";
    try { email = JSON.parse(localStorage.getItem("user") || "{}").email || ""; } catch {}
    fetch(`/api/industry-ops?company_id=${encodeURIComponent(activeBranch.id)}&email=${encodeURIComponent(email)}&domain=real_estate`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && Array.isArray(d.items) && d.items.length > 0) {
          setUnits(d.items);
          setSelectedUnit(d.items[0]);
          try { localStorage.setItem(key, JSON.stringify(d.items)); } catch {}
        }
      })
      .catch(() => {});
  }, [activeBranch?.id, getEntityStorageKey]);

  const persistUnits = (updated: PropertyUnit[]) => {
    setUnits(updated);
    try {
      const key = getEntityStorageKey("real_estate_units");
      localStorage.setItem(key, JSON.stringify(updated));
      if (activeBranch?.id) {
        let email = "";
        try { email = JSON.parse(localStorage.getItem("user") || "{}").email || ""; } catch {}
        fetch("/api/industry-ops", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "save_collection", company_id: activeBranch.id, email, domain: "real_estate", items: updated }),
        }).catch(() => {});
      }
    } catch {}
  };

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

    const hasGuest = Boolean(tenantInput.trim());
    const newUnit: PropertyUnit = {
      id: `UNT-${Date.now().toString().slice(-3)}`,
      propertyName: propName,
      unitNumber: unitNum.trim(),
      unitType,
      sqft: Number(sqft),
      monthlyRent: Number(rent),
      housekeeping: "Clean",
      status: hasGuest ? "occupied" : "vacant",
      tenantName: hasGuest ? tenantInput.trim() : undefined,
      leaseStart: hasGuest ? new Date().toISOString().slice(0, 10) : undefined,
      leaseEnd: hasGuest ? new Date(Date.now() + (operatingMode === "hospitality" ? 3 : 365) * 86400000).toISOString().slice(0, 10) : undefined,
    };

    const updated = [newUnit, ...units];
    persistUnits(updated);
    setSelectedUnit(newUnit);
    setIsNewUnitModalOpen(false);
    setUnitNum("");
    setTenantInput("");
  };

  const handleSetHousekeeping = (unitId: string, hk: "Clean" | "Dirty" | "Inspecting") => {
    const next = units.map((u) => (u.id === unitId ? { ...u, housekeeping: hk } : u));
    persistUnits(next);
    const updatedSel = next.find((u) => u.id === unitId) || null;
    setSelectedUnit(updatedSel);
  };

  const handleCheckInOrAssign = (unit: PropertyUnit) => {
    const who = guestInput.trim() || (operatingMode === "hospitality" ? "Walk-In VIP Guest" : "Corporate Leaseholder");
    const next = units.map((u) =>
      u.id === unit.id
        ? {
            ...u,
            status: "occupied" as UnitStatus,
            tenantName: who,
            housekeeping: "Clean" as const,
            leaseStart: new Date().toISOString().slice(0, 10),
            leaseEnd: new Date(Date.now() + (operatingMode === "hospitality" ? 3 : 365) * 86400000).toISOString().slice(0, 10),
          }
        : u
    );
    persistUnits(next);
    setSelectedUnit(next.find((u) => u.id === unit.id) || null);
    setGuestInput("");
    setToastMsg(`${operatingMode === "hospitality" ? "Checked in guest" : "Assigned tenant"} "${who}" to ${unit.unitNumber}`);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const handleCheckOutUnit = (unit: PropertyUnit) => {
    const next = units.map((u) =>
      u.id === unit.id
        ? { ...u, status: "vacant" as UnitStatus, tenantName: undefined, housekeeping: "Dirty" as const }
        : u
    );
    persistUnits(next);
    setSelectedUnit(next.find((u) => u.id === unit.id) || null);
    setToastMsg(`${unit.unitNumber} marked Vacant & routed to Housekeeping (Dirty).`);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const handleBillUnitOrFolio = async (unit: PropertyUnit) => {
    try {
      const res = await fetch("/api/industry-ops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bill_property_or_folio",
          company_id: activeBranch?.id,
          email: userEmail,
          industryId: operatingMode === "hospitality" ? "hospitality_travel" : "real_estate",
          id: unit.id,
          propertyName: unit.propertyName,
          unitNumber: unit.unitNumber,
          unitType: unit.unitType,
          sqft: unit.sqft,
          amount: unit.monthlyRent,
          housekeeping: unit.housekeeping || "Clean",
          tenantName: unit.tenantName || guestInput.trim() || (operatingMode === "hospitality" ? "Hotel Folio Guest" : "Commercial Tenant"),
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.unit) {
          const next = [data.unit, ...units.filter((u) => u.id !== data.unit.id)];
          setUnits(next);
          setSelectedUnit(data.unit);
        }
        setToastMsg(`Posted ${operatingMode === "hospitality" ? "Guest Stay Folio" : "Rent Invoice"} (${currencySymbol}${unit.monthlyRent.toLocaleString()}) → Sales & Accounting Ledger!`);
        setTimeout(() => setToastMsg(""), 5000);
      }
    } catch {}
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
        {toastMsg && (
          <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between">
            <span>{toastMsg}</span>
            <button onClick={() => setToastMsg("")} className="text-gray-400 hover:text-white cursor-pointer">✕</button>
          </div>
        )}

        {/* Dual Industry Mode Switcher: Property Leasing vs. Hotel & Resort Front-Desk */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#101422] p-3.5 rounded-2xl border border-indigo-500/25">
          <div>
            <h2 className="text-sm font-bold text-white">
              {operatingMode === "hospitality" ? "Hotel, Resort & Hospitality Front-Desk PMS" : "Commercial & Residential Property Leasing Hub"}
            </h2>
            <p className="text-[11px] text-gray-400">
              {operatingMode === "hospitality"
                ? "Manage suites, villas, guest check-in/out, housekeeping status, and 1-click stay folio settlement"
                : "Manage commercial towers, retail storefronts, tenant leases, escrow deposits, and monthly rent billing"}
            </p>
          </div>
          <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setOperatingMode("property");
                setPropName("Corporate Tower");
                setUnitType("Commercial Office");
                setRent(4500);
              }}
              className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                operatingMode === "property" ? "bg-indigo-600 text-white shadow" : "text-gray-400 hover:text-white"
              }`}
            >
              Property & Lease Roll
            </button>
            <button
              type="button"
              onClick={() => {
                setOperatingMode("hospitality");
                setPropName("Grand Beraxis Resort & Spa");
                setUnitType("Executive Hotel Suite");
                setRent(320);
              }}
              className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                operatingMode === "hospitality" ? "bg-emerald-600 text-white shadow" : "text-gray-400 hover:text-white"
              }`}
            >
              Hotel & Resort Front-Desk
            </button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="galaxy-card p-4 rounded-2xl bg-[#101422] border border-blue-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400">{operatingMode === "hospitality" ? "Rooms & Suites" : "Total Unit Portfolio"}</span>
              <h3 className="text-2xl font-bold text-blue-400 mt-0.5">{units.length} Units</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">{operatingMode === "hospitality" ? "Suites, Villas & Halls" : "Commercial & Residential"}</p>
            </div>
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
              <Building2 size={20} />
            </div>
          </div>

          <div className="galaxy-card p-4 rounded-2xl bg-[#101422] border border-emerald-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Portfolio Occupancy</span>
              <h3 className="text-2xl font-bold text-emerald-400 mt-0.5">
                {units.length > 0 ? Math.round((occupiedCount / units.length) * 100) : 0}%
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">{occupiedCount} Occupied • {vacantCount} Vacant</p>
            </div>
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <CheckCircle2 size={20} />
            </div>
          </div>

          <div className="galaxy-card p-4 rounded-2xl bg-[#101422] border border-purple-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Monthly Contracted Rent Roll</span>
              <h3 className="text-2xl font-bold text-purple-400 mt-0.5">{currencySymbol}{totalMonthlyRentRoll.toLocaleString()}</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">{currencySymbol}{(totalMonthlyRentRoll * 12 / 1000).toFixed(0)}k Annual Gross</p>
            </div>
            <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
              <DollarSign size={20} />
            </div>
          </div>

          <div className="galaxy-card p-4 rounded-2xl bg-[#101422] border border-amber-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Security Deposits Held</span>
              <h3 className="text-2xl font-bold text-amber-400 mt-0.5">
                {currencySymbol}{units.reduce((acc, u) => acc + (u.depositHeld || 0), 0).toLocaleString()}
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
            <Plus size={14} /> {operatingMode === "hospitality" ? "Add Suite / Room" : "Add Property Unit / Lease"}
          </button>
        </div>

        {/* Units Grid */}
        {filteredUnits.length === 0 ? (
          <div className="bg-[#101422]/70 border border-dashed border-gray-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-inner">
              <Building2 size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">No Property Units Registered</h3>
              <p className="text-xs text-gray-400 max-w-sm">
                {activeBranch?.name ? `No properties or lease units recorded for "${activeBranch.name}".` : "Add commercial suites, apartments, or retail stores to manage rent collection & leases."}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                onClick={() => setIsNewUnitModalOpen(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
              >
                <Plus size={16} /> {operatingMode === "hospitality" ? "Add First Hotel Suite" : "Add First Property Unit"}
              </button>
              <button
                type="button"
                onClick={() => {
                  const samples: PropertyUnit[] = operatingMode === "hospitality"
                    ? [
                        { id: "STE-101", propertyName: "Grand Beraxis Resort", unitNumber: "Suite 101 (Ocean View)", unitType: "Executive Hotel Suite", sqft: 850, monthlyRent: 450, status: "occupied", housekeeping: "Clean", tenantName: "Nadia Al-Farsi", leaseStart: new Date().toISOString().slice(0, 10), leaseEnd: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10), depositHeld: 200 },
                        { id: "VIL-202", propertyName: "Grand Beraxis Resort", unitNumber: "Villa 202 (Private Pool)", unitType: "Resort Pool Villa", sqft: 1800, monthlyRent: 980, status: "vacant", housekeeping: "Clean", depositHeld: 0 },
                      ]
                    : [
                        { id: "UNT-401", propertyName: "Apex Corporate Tower", unitNumber: "Suite 401 — Floor 4", unitType: "Commercial Office", sqft: 3200, monthlyRent: 8500, status: "occupied", housekeeping: "Clean", tenantName: "Horizon Tech Partners", leaseStart: "2026-01-01", leaseEnd: "2026-12-31", depositHeld: 17000 },
                        { id: "UNT-102", propertyName: "Apex Corporate Tower", unitNumber: "Retail Bay G-02", unitType: "Retail Storefront", sqft: 1450, monthlyRent: 5200, status: "vacant", housekeeping: "Clean", depositHeld: 0 },
                      ];
                  persistUnits(samples);
                  setSelectedUnit(samples[0]);
                  setToastMsg(`Loaded ${samples.length} sample ${operatingMode === "hospitality" ? "hotel suites" : "property units"}!`);
                  setTimeout(() => setToastMsg(""), 4000);
                }}
                className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-emerald-500/30 flex items-center gap-1.5 cursor-pointer transition"
              >
                + Load Sample {operatingMode === "hospitality" ? "Suites" : "Portfolio"}
              </button>
            </div>
          </div>
        ) : (
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
                      {currencySymbol}{unit.monthlyRent.toLocaleString()} / {operatingMode === "hospitality" ? "night" : "mo"}
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
                  <span className="text-gray-500 block text-[10px] uppercase">{operatingMode === "hospitality" ? "Nightly Rate" : "Monthly Rent Rate"}</span>
                  <span className="font-bold text-emerald-400 text-base">{currencySymbol}{selectedUnit.monthlyRent.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase">Security Deposit</span>
                  <span className="font-bold text-white text-base">{currencySymbol}{(selectedUnit.depositHeld || 0).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase">{operatingMode === "hospitality" ? "Est. Annual RevPAR" : "Annual Contract Value"}</span>
                  <span className="font-bold text-purple-300 text-base">{currencySymbol}{(selectedUnit.monthlyRent * 12).toLocaleString()}</span>
                </div>
              </div>

              {/* Housekeeping & Front-Desk / Lease Billing Actions */}
              <div className="bg-gray-950/60 p-4 rounded-2xl border border-gray-800 space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase text-gray-400">
                    Housekeeping &amp; Readiness: <strong className="text-emerald-400">{selectedUnit.housekeeping || "Clean"}</strong>
                  </span>
                  <div className="flex items-center gap-1.5">
                    {(["Clean", "Inspecting", "Dirty"] as const).map((hk) => (
                      <button
                        key={hk}
                        type="button"
                        onClick={() => handleSetHousekeeping(selectedUnit.id, hk)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                          (selectedUnit.housekeeping || "Clean") === hk
                            ? "bg-indigo-600 text-white border-indigo-400"
                            : "bg-gray-900 text-gray-400 border-gray-700 hover:text-white"
                        }`}
                      >
                        {hk}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-800">
                  <input
                    type="text"
                    value={guestInput}
                    onChange={(e) => setGuestInput(e.target.value)}
                    placeholder={operatingMode === "hospitality" ? "Guest name for Check-In..." : "Tenant name to assign..."}
                    className="flex-1 min-w-[160px] bg-gray-900 border border-gray-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleCheckInOrAssign(selectedUnit)}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
                  >
                    {operatingMode === "hospitality" ? "Check-In Guest" : "Assign Tenant"}
                  </button>
                  {selectedUnit.status === "occupied" && (
                    <button
                      type="button"
                      onClick={() => handleCheckOutUnit(selectedUnit)}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold cursor-pointer"
                    >
                      {operatingMode === "hospitality" ? "Check-Out" : "Vacate"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleBillUnitOrFolio(selectedUnit)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md cursor-pointer"
                  >
                    {operatingMode === "hospitality"
                      ? `Settle Stay Folio (${currencySymbol}${selectedUnit.monthlyRent.toLocaleString()}) → Accounting`
                      : `Bill Monthly Rent (${currencySymbol}${selectedUnit.monthlyRent.toLocaleString()}) → Accounting`}
                  </button>
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
        )}
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
                  <option value="Executive Hotel Suite">Executive Hotel Suite</option>
                  <option value="Resort Pool Villa">Resort Pool Villa</option>
                  <option value="Banquet & Conference Hall">Banquet &amp; Conference Hall</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-300 block mb-1">
                {operatingMode === "hospitality" ? "Current Guest Name (Optional — auto Check-In)" : "Current Tenant Name (Optional)"}
              </label>
              <input
                type="text"
                value={tenantInput}
                onChange={e => setTenantInput(e.target.value)}
                placeholder={operatingMode === "hospitality" ? "e.g. Dr. Nadia Al-Farsi" : "e.g. Horizon Capital Partners"}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
              />
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
                <label className="font-bold text-gray-300 block mb-1">{operatingMode === "hospitality" ? "Nightly Rate" : "Monthly Rent"} ({currencySymbol.trim()})</label>
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
