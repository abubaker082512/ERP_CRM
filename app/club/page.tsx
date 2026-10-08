"use client";

import { useState, useEffect } from "react";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { useBranchContext } from "@/lib/branchContext";
import {
  Dumbbell,
  Plus,
  Users,
  Calendar,
  Clock,
  Search,
  Filter,
  Layers,
  CheckCircle2,
  X,
  CreditCard,
  QrCode,
  Sparkles,
  Trophy,
  Activity,
  UserCheck,
  ChevronRight,
  ShieldCheck,
  Zap
} from "lucide-react";

const MENU_ITEMS = [
  { name: "Courts & Facilities", href: "/club" },
  { name: "Memberships & RFID", href: "/club" },
  { name: "Match Schedule", href: "/club" },
  { name: "Group Classes & PT", href: "/club" },
  { name: "Pro-Shop & Cafe POS", href: "/pos" }
];

type FacilityCourt = {
  id: string;
  name: string;
  type: "Padel" | "Tennis" | "Squash" | "Badminton" | "Gym Bay" | "CrossFit Arena";
  surface: "Panoramic Glass" | "Standard Glass" | "Synthetic Turf" | "Hard Court" | "Rubber Mat";
  location: "Indoor" | "Outdoor Covered" | "Outdoor";
  hourlyRatePeak: number;
  hourlyRateOffPeak: number;
  status: "available" | "booked" | "maintenance";
  currentBooking?: {
    playerName: string;
    timeSlot: string;
    durationMins: number;
    racketsRented: number;
    totalAmount: number;
  };
};

type ClubMember = {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipTier: "Unlimited Padel VIP" | "Gold Full Access" | "Silver Gym & Fitness" | "10-Session Punch Card" | "Pay & Play";
  rfidCardNumber: string;
  status: "active" | "expired" | "frozen";
  joinedDate: string;
  expiryDate: string;
  totalVisits: number;
  lastCheckIn?: string;
};

type GroupClass = {
  id: string;
  title: string;
  instructor: string;
  category: "Padel Masterclass" | "CrossFit WOD" | "HIIT & Cardio" | "Yoga & Mobility" | "Spinning";
  dayTime: string;
  durationMins: number;
  courtOrRoom: string;
  capacity: number;
  enrolled: number;
  feePerSession: number;
};

export default function ClubAndFitnessPage() {
  const { activeBranch, getEntityStorageKey } = useBranchContext();
  const [activeTab, setActiveTab] = useState<"courts" | "members" | "schedule" | "classes">("courts");

  // State
  const [courts, setCourts] = useState<FacilityCourt[]>([]);
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [classes, setClasses] = useState<GroupClass[]>([]);

  // Modals
  const [isCourtModalOpen, setIsCourtModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [selectedCourtForBooking, setSelectedCourtForBooking] = useState<FacilityCourt | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [rfidScanMessage, setRfidScanMessage] = useState<string | null>(null);

  // Form States - Court
  const [courtName, setCourtName] = useState("");
  const [courtType, setCourtType] = useState<FacilityCourt["type"]>("Padel");
  const [courtSurface, setCourtSurface] = useState<FacilityCourt["surface"]>("Panoramic Glass");
  const [courtLocation, setCourtLocation] = useState<FacilityCourt["location"]>("Indoor");
  const [ratePeak, setRatePeak] = useState(70);
  const [rateOffPeak, setRateOffPeak] = useState(45);

  // Form States - Member
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [memberTier, setMemberTier] = useState<ClubMember["membershipTier"]>("Unlimited Padel VIP");

  // Form States - Booking
  const [bookPlayerName, setBookPlayerName] = useState("");
  const [bookTimeSlot, setBookTimeSlot] = useState("18:00 - 19:30");
  const [bookDuration, setBookDuration] = useState(90);
  const [bookRackets, setBookRackets] = useState(2);

  // Form States - Class
  const [classTitle, setClassTitle] = useState("");
  const [classInstructor, setClassInstructor] = useState("");
  const [classCategory, setClassCategory] = useState<GroupClass["category"]>("Padel Masterclass");
  const [classDayTime, setClassDayTime] = useState("Mon & Wed 19:00");
  const [classCourt, setClassCourt] = useState("Court 1 (Panoramic)");
  const [classCapacity, setClassCapacity] = useState(8);
  const [classFee, setClassFee] = useState(25);

  // Multi-tenant Persistence
  useEffect(() => {
    if (!activeBranch) return;

    const courtsKey = getEntityStorageKey("club_courts");
    const membersKey = getEntityStorageKey("club_members");
    const classesKey = getEntityStorageKey("club_classes");

    const savedCourts = localStorage.getItem(courtsKey);
    const savedMembers = localStorage.getItem(membersKey);
    const savedClasses = localStorage.getItem(classesKey);

    if (savedCourts) {
      try {
        setCourts(JSON.parse(savedCourts));
      } catch {
        setCourts([]);
      }
    } else {
      // Clean default starting setup
      const defaultCourts: FacilityCourt[] = [
        {
          id: "crt-1",
          name: "Center Court 1",
          type: "Padel",
          surface: "Panoramic Glass",
          location: "Indoor",
          hourlyRatePeak: 80,
          hourlyRateOffPeak: 55,
          status: "booked",
          currentBooking: {
            playerName: "Alex Rodriguez (Match #402)",
            timeSlot: "17:30 - 19:00",
            durationMins: 90,
            racketsRented: 2,
            totalAmount: 130
          }
        },
        {
          id: "crt-2",
          name: "Court 2 Pro",
          type: "Padel",
          surface: "Panoramic Glass",
          location: "Indoor",
          hourlyRatePeak: 75,
          hourlyRateOffPeak: 50,
          status: "available"
        },
        {
          id: "crt-3",
          name: "Court 3 Club",
          type: "Padel",
          surface: "Standard Glass",
          location: "Outdoor Covered",
          hourlyRatePeak: 65,
          hourlyRateOffPeak: 45,
          status: "available"
        },
        {
          id: "crt-4",
          name: "CrossFit & Conditioning Bay",
          type: "CrossFit Arena",
          surface: "Rubber Mat",
          location: "Indoor",
          hourlyRatePeak: 50,
          hourlyRateOffPeak: 35,
          status: "available"
        }
      ];
      setCourts(defaultCourts);
      localStorage.setItem(courtsKey, JSON.stringify(defaultCourts));
    }

    if (savedMembers) {
      try {
        setMembers(JSON.parse(savedMembers));
      } catch {
        setMembers([]);
      }
    } else {
      const defaultMembers: ClubMember[] = [
        {
          id: "mem-001",
          name: "Marcus Sterling",
          email: "marcus@sterling.club",
          phone: "+1 (555) 234-8901",
          membershipTier: "Unlimited Padel VIP",
          rfidCardNumber: "RFID-8849-VIP",
          status: "active",
          joinedDate: "2026-01-15",
          expiryDate: "2027-01-15",
          totalVisits: 48,
          lastCheckIn: "Today 16:45"
        },
        {
          id: "mem-002",
          name: "Sophia Martinez",
          email: "sophia.m@padeltour.com",
          phone: "+1 (555) 342-9902",
          membershipTier: "Gold Full Access",
          rfidCardNumber: "RFID-2940-GLD",
          status: "active",
          joinedDate: "2026-02-01",
          expiryDate: "2027-02-01",
          totalVisits: 29,
          lastCheckIn: "Yesterday 18:20"
        }
      ];
      setMembers(defaultMembers);
      localStorage.setItem(membersKey, JSON.stringify(defaultMembers));
    }

    if (savedClasses) {
      try {
        setClasses(JSON.parse(savedClasses));
      } catch {
        setClasses([]);
      }
    } else {
      const defaultClasses: GroupClass[] = [
        {
          id: "cls-1",
          title: "Advanced Bandeja & Vibora Masterclass",
          instructor: "Coach Javier Mendez (WPT Certified)",
          category: "Padel Masterclass",
          dayTime: "Tue & Thu 18:30",
          durationMins: 90,
          courtOrRoom: "Center Court 1",
          capacity: 6,
          enrolled: 5,
          feePerSession: 35
        },
        {
          id: "cls-2",
          title: "Cardio Match Play & Conditioning",
          instructor: "Elena Rostova",
          category: "HIIT & Cardio",
          dayTime: "Daily 07:30",
          durationMins: 60,
          courtOrRoom: "CrossFit Arena",
          capacity: 14,
          enrolled: 11,
          feePerSession: 20
        }
      ];
      setClasses(defaultClasses);
      localStorage.setItem(classesKey, JSON.stringify(defaultClasses));
    }
  }, [activeBranch?.id]);

  // Save helpers
  const saveCourts = (data: FacilityCourt[]) => {
    setCourts(data);
    if (activeBranch) {
      localStorage.setItem(getEntityStorageKey("club_courts"), JSON.stringify(data));
    }
  };

  const saveMembers = (data: ClubMember[]) => {
    setMembers(data);
    if (activeBranch) {
      localStorage.setItem(getEntityStorageKey("club_members"), JSON.stringify(data));
    }
  };

  const saveClasses = (data: GroupClass[]) => {
    setClasses(data);
    if (activeBranch) {
      localStorage.setItem(getEntityStorageKey("club_classes"), JSON.stringify(data));
    }
  };

  // Add Court
  const handleAddCourt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courtName) return;

    const newCourt: FacilityCourt = {
      id: `crt-${Date.now()}`,
      name: courtName,
      type: courtType,
      surface: courtSurface,
      location: courtLocation,
      hourlyRatePeak: Number(ratePeak) || 60,
      hourlyRateOffPeak: Number(rateOffPeak) || 40,
      status: "available"
    };

    saveCourts([...courts, newCourt]);
    setCourtName("");
    setIsCourtModalOpen(false);
  };

  // Add Member
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName) return;

    const newMember: ClubMember = {
      id: `mem-${Date.now()}`,
      name: memberName,
      email: memberEmail || "client@member.com",
      phone: memberPhone || "+1 (555) 000-0000",
      membershipTier: memberTier,
      rfidCardNumber: `RFID-${Math.floor(1000 + Math.random() * 9000)}-${memberTier.slice(0, 3).toUpperCase()}`,
      status: "active",
      joinedDate: new Date().toISOString().split("T")[0],
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      totalVisits: 0
    };

    saveMembers([newMember, ...members]);
    setMemberName("");
    setMemberEmail("");
    setMemberPhone("");
    setIsMemberModalOpen(false);
  };

  // Book Court
  const handleBookCourt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourtForBooking || !bookPlayerName) return;

    const rentalTotal = bookRackets * 5;
    const courtCost = (selectedCourtForBooking.hourlyRatePeak * (bookDuration / 60));
    const total = courtCost + rentalTotal;

    const updated = courts.map((c) => {
      if (c.id === selectedCourtForBooking.id) {
        return {
          ...c,
          status: "booked" as const,
          currentBooking: {
            playerName: bookPlayerName,
            timeSlot: bookTimeSlot,
            durationMins: bookDuration,
            racketsRented: bookRackets,
            totalAmount: total
          }
        };
      }
      return c;
    });

    saveCourts(updated);
    setBookPlayerName("");
    setIsBookingModalOpen(false);
    setSelectedCourtForBooking(null);
  };

  // Release / Check-out Court
  const handleReleaseCourt = (courtId: string) => {
    const updated = courts.map((c) => {
      if (c.id === courtId) {
        return {
          ...c,
          status: "available" as const,
          currentBooking: undefined
        };
      }
      return c;
    });
    saveCourts(updated);
  };

  // RFID Check-in Simulation
  const handleRfidCheckIn = (member: ClubMember) => {
    const updated = members.map((m) => {
      if (m.id === member.id) {
        return {
          ...m,
          totalVisits: m.totalVisits + 1,
          lastCheckIn: "Just now (" + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + ")"
        };
      }
      return m;
    });
    saveMembers(updated);
    setRfidScanMessage(`Access Granted: ${member.name} (${member.membershipTier}) - Turnstile Unlocked.`);
    setTimeout(() => setRfidScanMessage(null), 4000);
  };

  // Filtered views
  const filteredCourts = courts.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "ALL" || c.status === filterType.toLowerCase() || c.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const filteredMembers = members.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.email.toLowerCase().includes(searchQuery.toLowerCase()) || m.rfidCardNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // KPI calculations
  const totalCourts = courts.length;
  const bookedCourts = courts.filter((c) => c.status === "booked").length;
  const occupancyRate = totalCourts > 0 ? Math.round((bookedCourts / totalCourts) * 100) : 0;
  const activeMembersCount = members.filter((m) => m.status === "active").length;
  const totalRevenueToday = courts.reduce((sum, c) => sum + (c.currentBooking?.totalAmount || 0), 0);

  return (
    <div className="min-h-screen bg-[#0d0f12] text-slate-100 flex flex-col font-sans">
      <StandardModuleHeader
        title="Club & Fitness Hub"
        subtitle={`${activeBranch?.name || "Global"} • Facility Management, Courts & Memberships`}
        icon={Dumbbell}
        menuItems={MENU_ITEMS}
      />

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Top Notification / Turnstile Banner */}
        {rfidScanMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-medium">{rfidScanMessage}</span>
            </div>
            <button onClick={() => setRfidScanMessage(null)} className="text-emerald-400/60 hover:text-emerald-400">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* KPI Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#14171d] border border-white/5 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Members</p>
              <h3 className="text-2xl font-bold text-white mt-1">{activeMembersCount}</h3>
              <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                <Zap className="w-3 h-3" /> 100% active RFID passes
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-[#14171d] border border-white/5 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Court Occupancy</p>
              <h3 className="text-2xl font-bold text-white mt-1">{occupancyRate}%</h3>
              <p className="text-xs text-slate-400 mt-1">
                {bookedCourts} of {totalCourts} courts occupied
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Activity className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-[#14171d] border border-white/5 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Bookings Today</p>
              <h3 className="text-2xl font-bold text-white mt-1">{bookedCourts} Matches</h3>
              <p className="text-xs text-slate-400 mt-1">Peak prime-time slots</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Trophy className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-[#14171d] border border-white/5 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Live Session Revenue</p>
              <h3 className="text-2xl font-bold text-white mt-1">${totalRevenueToday.toLocaleString()}</h3>
              <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                + Gear Rentals & Court Fees
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs & Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 bg-[#14171d] p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab("courts")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "courts" ? "bg-emerald-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
              }`}
            >
              Courts & Facilities ({courts.length})
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "members" ? "bg-emerald-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
              }`}
            >
              Memberships & RFID ({members.length})
            </button>
            <button
              onClick={() => setActiveTab("classes")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "classes" ? "bg-emerald-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
              }`}
            >
              Classes & Coaching ({classes.length})
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courts, members, RFID..."
                className="w-full bg-[#14171d] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {activeTab === "courts" && (
              <button
                onClick={() => setIsCourtModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-900/20 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" /> Add Court / Bay
              </button>
            )}

            {activeTab === "members" && (
              <button
                onClick={() => setIsMemberModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-900/20 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" /> New Member Pass
              </button>
            )}

            {activeTab === "classes" && (
              <button
                onClick={() => setIsClassModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-900/20 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" /> Schedule Class
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: COURTS & FACILITIES */}
        {activeTab === "courts" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourts.map((court) => (
              <div
                key={court.id}
                className="bg-[#14171d] border border-white/5 rounded-2xl p-5 hover:border-emerald-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white/5 text-slate-300">
                        {court.type}
                      </span>
                      <h4 className="text-lg font-bold text-white mt-2">{court.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {court.surface} • {court.location}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                        court.status === "available"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : court.status === "booked"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {court.status === "available" ? "Ready to Play" : court.status === "booked" ? "Live Match" : "Maintenance"}
                    </span>
                  </div>

                  {/* Rates */}
                  <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-[#1a1e27] p-2.5 rounded-xl">
                      <span className="text-slate-400 block">Peak Slot (60m)</span>
                      <span className="text-white font-bold text-sm">${court.hourlyRatePeak}</span>
                    </div>
                    <div className="bg-[#1a1e27] p-2.5 rounded-xl">
                      <span className="text-slate-400 block">Off-Peak (60m)</span>
                      <span className="text-white font-bold text-sm">${court.hourlyRateOffPeak}</span>
                    </div>
                  </div>

                  {/* Live Booking Details */}
                  {court.status === "booked" && court.currentBooking && (
                    <div className="mt-4 bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 text-xs space-y-1.5">
                      <div className="flex items-center justify-between font-medium text-amber-300">
                        <span>{court.currentBooking.playerName}</span>
                        <span>{court.currentBooking.timeSlot}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span>Rackets Rented: {court.currentBooking.racketsRented}</span>
                        <span className="font-semibold text-white">${court.currentBooking.totalAmount} Total</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between gap-2">
                  {court.status === "available" ? (
                    <button
                      onClick={() => {
                        setSelectedCourtForBooking(court);
                        setIsBookingModalOpen(true);
                      }}
                      className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Book Slot & Rentals
                    </button>
                  ) : court.status === "booked" ? (
                    <button
                      onClick={() => handleReleaseCourt(court.id)}
                      className="w-full py-2 bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/30 rounded-xl text-xs font-semibold transition-all"
                    >
                      Complete Match & Free Court
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReleaseCourt(court.id)}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                    >
                      Set Available
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: MEMBERSHIPS & RFID */}
        {activeTab === "members" && (
          <div className="bg-[#14171d] border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h4 className="font-bold text-white text-sm">Active Member Registry & Turnstile Passes</h4>
              <span className="text-xs text-slate-400">Click &quot;Scan Check-In&quot; to test RFID Turnstile Gate</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 bg-[#101217]">
                    <th className="py-3 px-4 font-semibold">Member</th>
                    <th className="py-3 px-4 font-semibold">Plan & Tier</th>
                    <th className="py-3 px-4 font-semibold">RFID Tag</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Total Visits</th>
                    <th className="py-3 px-4 font-semibold">Last Checked-In</th>
                    <th className="py-3 px-4 font-semibold text-right">Access Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-medium text-white">
                        <div className="font-semibold">{m.name}</div>
                        <div className="text-[11px] text-slate-400">{m.email} • {m.phone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-[11px]">
                          {m.membershipTier}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <QrCode className="w-3.5 h-3.5 text-slate-400" />
                          {m.rfidCardNumber}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-white font-bold">{m.totalVisits} sessions</td>
                      <td className="py-3.5 px-4 text-slate-400">{m.lastCheckIn || "Never"}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleRfidCheckIn(m)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs transition-all shadow-md flex items-center gap-1.5 ml-auto"
                        >
                          <UserCheck className="w-3.5 h-3.5" /> Scan Check-In
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CLASSES & COACHING */}
        {activeTab === "classes" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {classes.map((cls) => (
              <div key={cls.id} className="bg-[#14171d] border border-white/5 rounded-2xl p-5 hover:border-emerald-500/30 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {cls.category}
                    </span>
                    <h4 className="text-lg font-bold text-white mt-2">{cls.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{cls.instructor}</p>
                  </div>
                  <span className="text-lg font-bold text-emerald-400">${cls.feePerSession}<span className="text-xs text-slate-400">/sess</span></span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-[#1a1e27] p-2.5 rounded-xl">
                    <span className="text-slate-400 block">Schedule</span>
                    <span className="text-white font-semibold">{cls.dayTime}</span>
                  </div>
                  <div className="bg-[#1a1e27] p-2.5 rounded-xl">
                    <span className="text-slate-400 block">Facility / Court</span>
                    <span className="text-white font-semibold">{cls.courtOrRoom}</span>
                  </div>
                  <div className="bg-[#1a1e27] p-2.5 rounded-xl">
                    <span className="text-slate-400 block">Enrolled</span>
                    <span className="text-emerald-400 font-bold">{cls.enrolled} / {cls.capacity} Max</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="w-full bg-slate-800 rounded-full h-2 mr-3">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: `${(cls.enrolled / cls.capacity) * 100}%` }}
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (cls.enrolled < cls.capacity) {
                        const updated = classes.map((c) => c.id === cls.id ? { ...c, enrolled: c.enrolled + 1 } : c);
                        saveClasses(updated);
                      }
                    }}
                    disabled={cls.enrolled >= cls.capacity}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold disabled:opacity-50 whitespace-nowrap"
                  >
                    {cls.enrolled >= cls.capacity ? "Sold Out" : "+ Enroll Player"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL: ADD COURT / FACILITY */}
      {isCourtModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14171d] border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-emerald-400" /> Add Court or Sports Bay
              </h3>
              <button onClick={() => setIsCourtModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCourt} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Court / Bay Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Center Court 1 (Panoramic Glass)"
                  value={courtName}
                  onChange={(e) => setCourtName(e.target.value)}
                  className="w-full bg-[#1a1e27] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Discipline / Sport</label>
                  <select
                    value={courtType}
                    onChange={(e: any) => setCourtType(e.target.value)}
                    className="w-full bg-[#1a1e27] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  >
                    <option value="Padel">Padel Court</option>
                    <option value="Tennis">Tennis Court</option>
                    <option value="Squash">Squash Court</option>
                    <option value="Badminton">Badminton Bay</option>
                    <option value="CrossFit Arena">CrossFit & Gym Arena</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Surface Type</label>
                  <select
                    value={courtSurface}
                    onChange={(e: any) => setCourtSurface(e.target.value)}
                    className="w-full bg-[#1a1e27] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  >
                    <option value="Panoramic Glass">Panoramic Glass (WPT Standard)</option>
                    <option value="Standard Glass">Standard Tempered Glass</option>
                    <option value="Synthetic Turf">Textured Synthetic Turf</option>
                    <option value="Hard Court">Hard Court Acrylic</option>
                    <option value="Rubber Mat">Shock-Absorbing Rubber Mat</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Peak Hourly Rate ($)</label>
                  <input
                    type="number"
                    value={ratePeak}
                    onChange={(e) => setRatePeak(Number(e.target.value))}
                    className="w-full bg-[#1a1e27] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Off-Peak Rate ($)</label>
                  <input
                    type="number"
                    value={rateOffPeak}
                    onChange={(e) => setRateOffPeak(Number(e.target.value))}
                    className="w-full bg-[#1a1e27] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCourtModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg"
                >
                  Create Court
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NEW MEMBER PASS */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14171d] border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" /> New Member & RFID Pass
              </h3>
              <button onClick={() => setIsMemberModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Carlos Alcaraz"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="w-full bg-[#1a1e27] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="carlos@member.com"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    className="w-full bg-[#1a1e27] border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={memberPhone}
                    onChange={(e) => setMemberPhone(e.target.value)}
                    className="w-full bg-[#1a1e27] border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Membership Plan</label>
                <select
                  value={memberTier}
                  onChange={(e: any) => setMemberTier(e.target.value)}
                  className="w-full bg-[#1a1e27] border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                >
                  <option value="Unlimited Padel VIP">Unlimited Padel VIP ($190/mo)</option>
                  <option value="Gold Full Access">Gold Full Access (Gym + Court Access - $140/mo)</option>
                  <option value="Silver Gym & Fitness">Silver Gym & Fitness ($85/mo)</option>
                  <option value="10-Session Punch Card">10-Session Match Punch Card ($250)</option>
                  <option value="Pay & Play">Pay & Play (Guest Pass)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg"
                >
                  Issue Pass & RFID
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BOOK COURT & RENTALS */}
      {isBookingModalOpen && selectedCourtForBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14171d] border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-emerald-400" /> Book {selectedCourtForBooking.name}
              </h3>
              <button onClick={() => setIsBookingModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookCourt} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Lead Player Name / Match Reference</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Liam Henderson (4-Player Match)"
                  value={bookPlayerName}
                  onChange={(e) => setBookPlayerName(e.target.value)}
                  className="w-full bg-[#1a1e27] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Timeslot</label>
                  <input
                    type="text"
                    value={bookTimeSlot}
                    onChange={(e) => setBookTimeSlot(e.target.value)}
                    className="w-full bg-[#1a1e27] border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Duration</label>
                  <select
                    value={bookDuration}
                    onChange={(e) => setBookDuration(Number(e.target.value))}
                    className="w-full bg-[#1a1e27] border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                  >
                    <option value={60}>60 Minutes</option>
                    <option value={90}>90 Minutes (Standard Match)</option>
                    <option value={120}>120 Minutes (Tournament Slot)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Racket Rentals ($5/each)</label>
                <input
                  type="number"
                  min={0}
                  max={4}
                  value={bookRackets}
                  onChange={(e) => setBookRackets(Number(e.target.value))}
                  className="w-full bg-[#1a1e27] border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="bg-[#1a1e27] p-3 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Booking Estimate:</span>
                <span className="text-emerald-400 font-bold text-sm">
                  ${(selectedCourtForBooking.hourlyRatePeak * (bookDuration / 60) + bookRackets * 5).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
