"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Clock, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";

const INACTIVITY_TIMEOUT_SECONDS = 60; // 1 minute
const WARNING_THRESHOLD_SECONDS = 15; // Warning appears 15s before timeout (at 45s idle)

export default function InactivitySessionTracker() {
    const router = useRouter();
    const pathname = usePathname();
    const [idleSeconds, setIdleSeconds] = useState(0);
    const [showWarning, setShowWarning] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Skip inactivity timer on public, landing, and auth pages
    const isPublicPage = pathname === "/" || 
        pathname === "/login" || 
        pathname === "/signup" || 
        pathname === "/pricing" || 
        pathname.startsWith("/compare") || 
        pathname.startsWith("/industries") || 
        pathname.startsWith("/features") || 
        pathname.startsWith("/blog") || 
        pathname.startsWith("/about") || 
        pathname.startsWith("/contact") || 
        pathname.startsWith("/leads-pool") || 
        pathname.startsWith("/lead-pool") || 
        pathname.startsWith("/appointments/book");

    const resetIdleTimer = () => {
        setIdleSeconds(0);
        setShowWarning(false);
    };

    // Auto-save accumulated active working time to timesheet store on logout
    const saveActiveSession = () => {
        try {
            const startStr = localStorage.getItem("beraxis_user_session_start");
            if (startStr) {
                const startTime = parseInt(startStr, 10);
                const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
                const elapsedHours = parseFloat((elapsedSeconds / 3600).toFixed(2));

                if (elapsedHours > 0.01) {
                    const existingTsStr = localStorage.getItem("beraxis_user_timesheets") || "[]";
                    const existingTs = JSON.parse(existingTsStr);
                    const autoLog = {
                        id: `ts_auto_${Date.now()}`,
                        date: new Date().toISOString(),
                        project_id: "auto",
                        project_name: "Active Workspace Session",
                        name: `[Auto-Logged Session before Inactivity Timeout]`,
                        unit_amount: elapsedHours,
                        is_automated: true,
                        status: "submitted"
                    };
                    localStorage.setItem("beraxis_user_timesheets", JSON.stringify([autoLog, ...existingTs]));
                }
            }
        } catch (e) {
            console.error("Error saving inactive session timesheet:", e);
        }
    };

    const handleAutoLogout = () => {
        saveActiveSession();
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("beraxis_user_session_start");
        setShowWarning(false);
        router.push("/login?reason=inactivity");
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);

        if (!token || isPublicPage) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }

        // Initialize session start time if not present
        if (!localStorage.getItem("beraxis_user_session_start")) {
            localStorage.setItem("beraxis_user_session_start", Date.now().toString());
        }

        // Interaction event listeners
        const activityEvents = ["mousemove", "keydown", "mousedown", "touchstart", "scroll", "click"];
        const handleUserActivity = () => {
            resetIdleTimer();
        };

        activityEvents.forEach(evt => {
            window.addEventListener(evt, handleUserActivity, { passive: true });
        });

        // 1-second interval ticker for inactivity & 12-second single-session heartbeat
        let tickCount = 0;
        intervalRef.current = setInterval(() => {
            tickCount += 1;
            if (tickCount % 12 === 0) {
                const currentToken = localStorage.getItem("token");
                const currentSid = localStorage.getItem("beraxis_session_id");
                if (currentToken && currentSid) {
                    fetch("/api/v1/auth/me", {
                        headers: {
                            "Authorization": `Bearer ${currentToken}`,
                            "X-Session-Id": currentSid
                        }
                    }).then(async (res) => {
                        if (res.status === 401) {
                            const data = await res.json().catch(() => ({}));
                            if (String(data?.detail || "").includes("SESSION_SUPERSEDED")) {
                                localStorage.removeItem("token");
                                localStorage.removeItem("refresh_token");
                                localStorage.removeItem("beraxis_session_id");
                                router.push("/login?reason=concurrent_login");
                            }
                        }
                    }).catch(() => {});
                }
            }

            setIdleSeconds(prev => {
                const nextVal = prev + 1;
                if (nextVal >= INACTIVITY_TIMEOUT_SECONDS - WARNING_THRESHOLD_SECONDS && nextVal < INACTIVITY_TIMEOUT_SECONDS) {
                    setShowWarning(true);
                } else if (nextVal >= INACTIVITY_TIMEOUT_SECONDS) {
                    handleAutoLogout();
                }
                return nextVal;
            });
        }, 1000);

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "beraxis_session_id" && e.newValue) {
                const tabSid = sessionStorage.getItem("beraxis_tab_session_id");
                if (tabSid && e.newValue !== tabSid) {
                    router.push("/login?reason=concurrent_login");
                }
            }
        };
        window.addEventListener("storage", handleStorageChange);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            window.removeEventListener("storage", handleStorageChange);
            activityEvents.forEach(evt => {
                window.removeEventListener(evt, handleUserActivity);
            });
        };
    }, [pathname, isAuthPage]);

    if (!isLoggedIn || isAuthPage || !showWarning) {
        return null;
    }

    const remainingSeconds = Math.max(0, INACTIVITY_TIMEOUT_SECONDS - idleSeconds);

    return (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-[99999] max-w-md w-full px-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-gradient-to-r from-amber-950/90 via-red-950/90 to-gray-900/95 border-2 border-amber-500/80 rounded-2xl p-4 shadow-2xl backdrop-blur-2xl text-white flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30 animate-pulse">
                        <AlertTriangle size={22} />
                    </div>
                    <div>
                        <div className="font-bold text-sm text-amber-300 flex items-center gap-1.5">
                            <span>Inactivity Warning</span>
                            <span className="font-mono bg-red-600/40 text-red-200 text-xs px-2 py-0.5 rounded-full border border-red-500/30">
                                {remainingSeconds}s
                            </span>
                        </div>
                        <p className="text-[11px] text-gray-300 mt-0.5">
                            Auto-saving timesheet & logging out due to 1 minute idle.
                        </p>
                    </div>
                </div>

                <button
                    onClick={resetIdleTimer}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs px-3.5 py-2 rounded-xl shadow-lg shadow-amber-500/30 transition transform active:scale-95 whitespace-nowrap"
                >
                    I&apos;m Active
                </button>
            </div>
        </div>
    );
}
