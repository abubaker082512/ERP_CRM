"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AppHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 mb-6 text-sm text-gray-400 px-6 pt-6 shrink-0">
      <Link href="/apps" className="flex items-center gap-1 hover:text-purple-400 transition-colors">
        <ArrowLeft size={16} /> Apps
      </Link>
      <span>/</span>
      <span className="text-white font-medium">{title}</span>
    </div>
  );
}
