"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  CheckSquare,
  ShieldCheck,
  MessageSquare,
  Calendar,
  ClipboardList,
  ArrowRight,
} from "lucide-react";
import { useNotifications } from "@/lib/notificationContext";
import { useTheme } from "@/lib/themeContext";

export default function NotificationBellDropdown() {
  const { badges, totalUnread, feedItems } = useNotifications();
  const { isLight } = useTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const summaryPills = [
    { href: "/tasks", label: "Tasks", count: badges["/tasks"] || 0, icon: CheckSquare },
    { href: "/approvals", label: "Approvals", count: badges["/approvals"] || 0, icon: ShieldCheck },
    { href: "/discuss", label: "Discuss", count: badges["/discuss"] || 0, icon: MessageSquare },
    { href: "/calendar", label: "Events", count: badges["/calendar"] || 0, icon: Calendar },
    { href: "/forms", label: "Forms", count: badges["/forms"] || 0, icon: ClipboardList },
  ];

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Workspace Notifications (Tasks, Approvals, Events & Discuss)"
        className={`relative p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
          isLight
            ? "bg-white hover:bg-slate-100 border-slate-200 text-slate-700"
            : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-200"
        }`}
      >
        <Bell size={16} />
        {totalUnread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-md ring-2 ring-[#0B101E]">
            {totalUnread > 99 ? "99+" : totalUnread}
          </span>
        )}
      </button>

      {open && (
        <div
          className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border shadow-2xl z-[250] overflow-hidden ${
            isLight
              ? "bg-white border-slate-200 text-slate-900"
              : "bg-[#0F172A] border-white/15 text-white"
          }`}
        >
          <div
            className={`px-4 py-3 border-b flex items-center justify-between ${
              isLight ? "border-slate-200 bg-slate-50" : "border-white/10 bg-[#0B101E]"
            }`}
          >
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-purple-500" />
              <span className="text-xs font-extrabold">Notifications &amp; Action Inbox</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                totalUnread > 0
                  ? "bg-rose-500 text-white"
                  : "bg-emerald-500/15 text-emerald-400"
              }`}
            >
              {totalUnread > 0 ? `${totalUnread} Active` : "All Caught Up"}
            </span>
          </div>

          {/* Quick Module Badges Row */}
          <div
            className={`p-2.5 border-b flex flex-wrap gap-1.5 ${
              isLight ? "border-slate-200" : "border-white/10"
            }`}
          >
            {summaryPills.map((p) => {
              const Icon = p.icon;
              return (
                <Link
                  key={p.href}
                  href={p.href}
                  onClick={() => setOpen(false)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-colors ${
                    p.count > 0
                      ? "bg-purple-600/15 border-purple-500/40 text-purple-400"
                      : isLight
                      ? "bg-slate-50 border-slate-200 text-slate-600"
                      : "bg-white/5 border-white/10 text-gray-400"
                  }`}
                >
                  <Icon size={11} />
                  <span>{p.label}</span>
                  {p.count > 0 && (
                    <span className="ml-0.5 px-1.5 rounded-full bg-rose-500 text-white text-[9px] font-black">
                      {p.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Feed Items */}
          <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
            {feedItems.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400">
                No unread tasks, approvals, calendar events, or Discuss messages right now.
              </div>
            ) : (
              feedItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.moduleHref}
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-3 transition-colors ${
                    isLight ? "hover:bg-slate-50" : "hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400">
                      {item.moduleLabel}
                    </span>
                    <ArrowRight size={11} className="text-gray-400" />
                  </div>
                  <div className="text-xs font-bold truncate mt-0.5">{item.title}</div>
                  <div className="text-[11px] text-gray-400 truncate">{item.subtitle}</div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
