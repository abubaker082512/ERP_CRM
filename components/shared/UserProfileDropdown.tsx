"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    User,
    Settings,
    CreditCard,
    ShieldCheck,
    LogOut,
    ChevronDown,
    Building2,
    BookOpen,
    Sparkles
} from "lucide-react";

export default function UserProfileDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [fullName, setFullName] = useState<string>("Administrator");
    const [email, setEmail] = useState<string>("admin@beraxis.online");
    const [companyName, setCompanyName] = useState<string>("Barexis Technologies");
    const [planLabel, setPlanLabel] = useState<string>("FREE PLAN");
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [userInitial, setUserInitial] = useState<string>("A");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        try {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                const user = JSON.parse(userStr);
                
                // Determine user full name
                const name = user.name || user.full_name || user.user_metadata?.full_name || user.user_metadata?.name || (user.email ? user.email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) : "Administrator");
                setFullName(name);
                setUserInitial(name.charAt(0).toUpperCase() || "A");

                if (user.email) setEmail(user.email);

                // Determine company / tenant name
                if (user.tenant?.name) {
                    setCompanyName(user.tenant.name);
                } else if (user.company_name) {
                    setCompanyName(user.company_name);
                }

                // Check Super Admin
                const SUPER_ADMIN_EMAILS = ["admin@beraxis.online", "admin2@erp-crm.com", "abubaker@beraxis.online"];
                const isSuper = SUPER_ADMIN_EMAILS.includes(user.email?.toLowerCase()) || user.role === "super_admin" || user.is_super_admin;
                setIsAdmin(Boolean(isSuper));

                // Determine Plan Badge
                if (isSuper) {
                    setPlanLabel("ENTERPRISE");
                } else if (user.tenant?.subscription_status === "active" || user.plan === "pro") {
                    setPlanLabel("PRO PLAN");
                } else if (user.tenant?.trial_ends_at) {
                    setPlanLabel("TRIAL");
                } else {
                    setPlanLabel("FREE PLAN");
                }
            }
        } catch (e) {
            console.error("Error parsing user profile for header dropdown:", e);
        }

        // Click outside listener
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    return (
        <div className={`relative ${isOpen ? "z-[9999]" : "z-20"}`} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2.5 p-1 sm:px-2 sm:py-1 rounded-xl hover:bg-white/10 transition-all border border-transparent hover:border-white/10 cursor-pointer group"
                title="Account & Workspace Settings"
            >
                {/* Text: Full Name & Plan Badge */}
                <div className="text-right hidden sm:flex flex-col items-end leading-tight">
                    <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate max-w-[140px]">
                        {fullName}
                    </span>
                    <span className="text-[10px] font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent uppercase">
                        {planLabel}
                    </span>
                </div>

                {/* Avatar Icon */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 p-[1.5px] shadow-md shadow-cyan-500/20 shrink-0">
                    <div className="w-full h-full rounded-full bg-[#0F172A] flex items-center justify-center font-bold text-xs text-white">
                        {userInitial}
                    </div>
                </div>

                <ChevronDown
                    size={13}
                    className={`text-gray-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-cyan-300" : "group-hover:text-gray-200"
                    }`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-[#0F172A] border border-cyan-500/40 rounded-2xl shadow-2xl p-2 z-[9999] animate-in fade-in slide-in-from-top-2 backdrop-blur-2xl shadow-cyan-950/80">
                    {/* Header Info */}
                    <div className="px-3 py-2.5 bg-white/5 rounded-xl border border-white/5 mb-1.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white truncate max-w-[150px]">{fullName}</span>
                            <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                                {planLabel}
                            </span>
                        </div>
                        <div className="text-[11px] text-gray-400 truncate mt-0.5">{email}</div>
                        {companyName && (
                            <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-1 font-medium">
                                <Building2 size={11} className="text-cyan-400" />
                                <span className="truncate">{companyName}</span>
                            </div>
                        )}
                    </div>

                    {/* Nav Items */}
                    <div className="space-y-0.5 text-xs">
                        <Link
                            href="/settings"
                            onClick={() => setIsOpen(false)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <User size={15} className="text-cyan-400" />
                            <span>Profile & Account</span>
                        </Link>

                        <Link
                            href="/billing"
                            onClick={() => setIsOpen(false)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <CreditCard size={15} className="text-purple-400" />
                            <span>Subscription & Plans</span>
                        </Link>

                        <Link
                            href="/knowledge"
                            onClick={() => setIsOpen(false)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <BookOpen size={15} className="text-blue-400" />
                            <span>Knowledge & Guides</span>
                        </Link>

                        {isAdmin && (
                            <Link
                                href="/super-admin"
                                onClick={() => setIsOpen(false)}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 transition-colors font-semibold"
                            >
                                <ShieldCheck size={15} className="text-amber-400" />
                                <span>Super Admin Console</span>
                            </Link>
                        )}
                    </div>

                    <div className="h-px bg-white/10 my-1.5"></div>

                    {/* Sign Out */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                        <LogOut size={15} />
                        <span>Sign Out</span>
                    </button>
                </div>
            )}
        </div>
    );
}
