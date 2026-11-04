"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  Circle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  X,
  Building2,
  UploadCloud,
  Users2,
  Mic,
  Award,
  ExternalLink
} from "lucide-react";

interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  href: string;
  ctaText: string;
  icon: any;
  isAutoDetected?: () => boolean;
}

interface OnboardingChecklistProps {
  onOpenIndustryPicker?: () => void;
  hasSelectedIndustry?: boolean;
}

export default function OnboardingChecklist({
  onOpenIndustryPicker,
  hasSelectedIndustry = false
}: OnboardingChecklistProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem("beraxis_onboarding_tasks");
      const initialCompleted = saved ? JSON.parse(saved) : {};

      // Auto-detect completions based on local storage & props
      if (hasSelectedIndustry) {
        initialCompleted["industry"] = true;
      }
      const hasInvoices = Boolean(localStorage.getItem("accounting_invoices") || localStorage.getItem("crm_leads"));
      if (hasInvoices) {
        initialCompleted["migrate"] = true;
      }
      const hasVisitedLeads = Boolean(localStorage.getItem("beraxis_leads_pool_viewed"));
      if (hasVisitedLeads) {
        initialCompleted["leads"] = true;
      }
      const hasTestedAI = Boolean(localStorage.getItem("beraxis_ai_tested"));
      if (hasTestedAI) {
        initialCompleted["ai"] = true;
      }

      setCompletedTasks(initialCompleted);
    } catch {}
  }, [hasSelectedIndustry]);

  const toggleTask = (taskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCompletedTasks(prev => {
      const updated = { ...prev, [taskId]: !prev[taskId] };
      try {
        localStorage.setItem("beraxis_onboarding_tasks", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const tasks: OnboardingTask[] = [
    {
      id: "industry",
      title: "1. Configure Your Industry Blueprint",
      description: "Tailor modules, POS menus, and workflows for your business archetype.",
      href: "#",
      ctaText: "Configure",
      icon: Building2
    },
    {
      id: "migrate",
      title: "2. Ingest Historical Data or Create Invoices",
      description: "Import past customers from QuickBooks, Odoo, or Excel with zero data loss.",
      href: "/migration",
      ctaText: "Open Migration Hub",
      icon: UploadCloud
    },
    {
      id: "leads",
      title: "3. Explore 45,000+ Verified B2B Leads",
      description: "Search international decision-makers with direct mobile dials and emails.",
      href: "/leads-pool",
      ctaText: "Search Leads",
      icon: Users2
    },
    {
      id: "ai",
      title: "4. Test the AI Voice Copilot",
      description: "Speak natural voice commands to draft orders and query your warehouse.",
      href: "/ai",
      ctaText: "Launch Voice Pilot",
      icon: Mic
    }
  ];

  const totalTasks = tasks.length;
  const completedCount = tasks.filter(t => completedTasks[t.id]).length;
  const progressPercent = Math.round((completedCount / totalTasks) * 100);
  const isAllDone = completedCount === totalTasks;

  if (isDismissed) return null;

  return (
    <div className="mb-6 rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#0B0F19] to-purple-950/30 border border-purple-500/30 shadow-2xl overflow-hidden transition-all text-white">
      {/* Top Banner Header */}
      <div 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-purple-600/30">
            {isAllDone ? <Award size={20} className="text-amber-300" /> : <Sparkles size={20} />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-black text-white text-sm sm:text-base tracking-tight">
                {isAllDone ? "🎉 Enterprise Setup Complete!" : "Quickstart Launchpad: 4 Steps to Production"}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {completedCount} of {totalTasks} Complete ({progressPercent}%)
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 truncate hidden sm:block">
              {isAllDone
                ? "Your workspace is fully tuned and operational. You can dismiss this launchpad anytime."
                : "Follow these 4 essential milestones to get your operations running at full velocity."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title={isCollapsed ? "Expand Checklist" : "Collapse Checklist"}
          >
            {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsDismissed(true);
            }}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="Dismiss"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Progress Bar Strip */}
      <div className="w-full bg-slate-900 h-1.5 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Expanded Checklist Items */}
      {!isCollapsed && (
        <div className="p-4 sm:p-5 pt-3 grid grid-cols-1 md:grid-cols-2 gap-3 bg-black/20 border-t border-white/5">
          {tasks.map((task) => {
            const isDone = Boolean(completedTasks[task.id]);
            const Icon = task.icon;

            return (
              <div
                key={task.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 justify-between ${
                  isDone 
                    ? "bg-emerald-950/20 border-emerald-500/30 text-gray-300"
                    : "bg-[#141B2D]/80 border-white/10 hover:border-purple-500/40"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={(e) => toggleTask(task.id, e)}
                    className="mt-0.5 shrink-0 text-gray-400 hover:text-white transition-colors cursor-pointer"
                    title={isDone ? "Mark Incomplete" : "Mark Complete"}
                  >
                    {isDone ? (
                      <CheckCircle2 size={18} className="text-emerald-400" />
                    ) : (
                      <Circle size={18} className="text-gray-500" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <h4 className={`text-xs font-bold ${isDone ? "line-through text-gray-400" : "text-white"}`}>
                      {task.title}
                    </h4>
                    <p className="text-[11px] text-gray-400 leading-relaxed mt-0.5">
                      {task.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 self-center">
                  {task.id === "industry" && onOpenIndustryPicker ? (
                    <button
                      type="button"
                      onClick={() => onOpenIndustryPicker()}
                      className="px-2.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold transition-all shadow-sm"
                    >
                      {isDone ? "Reconfigure" : "Start"}
                    </button>
                  ) : (
                    <Link
                      href={task.href}
                      onClick={() => {
                        if (task.id === "leads") localStorage.setItem("beraxis_leads_pool_viewed", "true");
                        if (task.id === "ai") localStorage.setItem("beraxis_ai_tested", "true");
                        setCompletedTasks(prev => ({ ...prev, [task.id]: true }));
                      }}
                      className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 text-purple-300 hover:text-white text-[11px] font-bold transition-all flex items-center gap-1"
                    >
                      <span>{task.ctaText}</span>
                      <ArrowRight size={11} />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
