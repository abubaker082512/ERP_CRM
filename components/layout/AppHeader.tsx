"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LayoutGrid, Globe, Mic, Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/themeContext";
import NotificationBellDropdown from "@/components/shared/NotificationBellDropdown";

export default function AppHeader({ title }: { title?: string }) {
  const router = useRouter();
  const { isLight, toggleTheme } = useTheme();

  return (
    <div className="flex items-center justify-between gap-3 mb-6 text-sm text-gray-400 px-6 pt-6 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          title="Go back"
          className={`flex items-center gap-1 transition-colors px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer shrink-0 ${
            isLight
              ? "bg-white hover:bg-slate-100 border-slate-200 text-slate-700"
              : "text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border-white/5"
          }`}
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>

        <Link
          href="/apps"
          title="Workspace Apps Dashboard"
          className={`flex items-center gap-1 transition-colors p-1.5 rounded-lg shrink-0 ${
            isLight
              ? "text-slate-600 hover:text-purple-700 hover:bg-purple-50"
              : "text-gray-400 hover:text-purple-300 hover:bg-purple-600/20"
          }`}
        >
          <LayoutGrid size={16} />
        </Link>

        <Link
          href="/"
          title="Public Website"
          className={`flex items-center gap-1 transition-colors p-1.5 rounded-lg shrink-0 ${
            isLight
              ? "text-slate-600 hover:text-cyan-700 hover:bg-cyan-50"
              : "text-gray-400 hover:text-cyan-300 hover:bg-cyan-600/20"
          }`}
        >
          <Globe size={16} />
        </Link>

        {title && (
          <>
            <span>/</span>
            <span className={`font-medium ${isLight ? "text-slate-900" : "text-white"}`}>{title}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <NotificationBellDropdown />
        <button
          type="button"
          onClick={toggleTheme}
          title={isLight ? "Switch to Dark Cosmic Theme" : "Switch to Frosted Light Theme"}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
            isLight
              ? "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800"
              : "bg-white/5 hover:bg-white/10 border-white/15 text-amber-300"
          }`}
        >
          {isLight ? <Moon size={13} /> : <Sun size={13} />}
          <span className="hidden sm:inline">{isLight ? "Dark" : "Light"}</span>
        </button>

        <button
          onClick={() => window.dispatchEvent(new CustomEvent("open-voice-pilot"))}
          title="Launch Voice Operations (Alt+V)"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0 ${
            isLight
              ? "bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-800"
              : "bg-gradient-to-r from-purple-600/25 to-pink-600/25 hover:from-purple-600/40 hover:to-pink-600/40 border border-purple-500/40 text-purple-200 hover:text-white"
          }`}
        >
          <Mic size={13} className="text-pink-500 animate-pulse" />
          <span>Voice Operations</span>
        </button>
      </div>
    </div>
  );
}
