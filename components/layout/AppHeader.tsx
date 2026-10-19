"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LayoutGrid, Globe, Mic } from "lucide-react";

export default function AppHeader({ title }: { title: string }) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between gap-3 mb-6 text-sm text-gray-400 px-6 pt-6 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          title="Go back"
          className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-semibold cursor-pointer shrink-0"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>

        <Link
          href="/apps"
          title="Workspace Apps Dashboard"
          className="flex items-center gap-1 text-gray-400 hover:text-purple-300 transition-colors p-1.5 rounded-lg hover:bg-purple-600/20 shrink-0"
        >
          <LayoutGrid size={16} />
        </Link>

        <Link
          href="/"
          title="Public Website"
          className="flex items-center gap-1 text-gray-400 hover:text-cyan-300 transition-colors p-1.5 rounded-lg hover:bg-cyan-600/20 shrink-0"
        >
          <Globe size={16} />
        </Link>

        <span>/</span>
        <span className="text-white font-medium">{title}</span>
      </div>

      <button
        onClick={() => window.dispatchEvent(new CustomEvent("open-voice-pilot"))}
        title="Launch Voice Operations (Alt+V)"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600/25 to-pink-600/25 hover:from-purple-600/40 hover:to-pink-600/40 border border-purple-500/40 text-purple-200 hover:text-white text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0"
      >
        <Mic size={13} className="text-pink-400 animate-pulse" />
        <span>Voice Operations</span>
      </button>
    </div>
  );
}
