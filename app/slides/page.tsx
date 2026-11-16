"use client";

import { useState, useEffect, useMemo } from "react";
import AppHeader from "@/components/layout/AppHeader";
import { useBranchContext } from "@/lib/branchContext";
import {
  Presentation,
  Plus,
  Play,
  Trash2,
  Printer,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Palette,
  Layout,
  Copy
} from "lucide-react";

type SlideTheme = "purple" | "cyan" | "emerald" | "amber";

type SlideItem = {
  id: string;
  title: string;
  subtitle: string;
  bullets: string[];
  notes: string;
};

type DeckItem = {
  id: string;
  name: string;
  theme: SlideTheme;
  updatedAt: string;
  slides: SlideItem[];
};

const THEME_STYLES: Record<SlideTheme, { label: string; bg: string; accent: string; badge: string }> = {
  purple: {
    label: "Galaxy Purple",
    bg: "from-[#1a1033] via-[#0b0f1e] to-[#080b14]",
    accent: "text-purple-400",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  },
  cyan: {
    label: "Ocean Cyan",
    bg: "from-[#0a2334] via-[#091220] to-[#060912]",
    accent: "text-cyan-400",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  },
  emerald: {
    label: "Executive Emerald",
    bg: "from-[#092920] via-[#091418] to-[#060910]",
    accent: "text-emerald-400",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  amber: {
    label: "Amber Gold",
    bg: "from-[#2d1c08] via-[#131018] to-[#080910]",
    accent: "text-amber-400",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
};

const DECK_TEMPLATES: Record<string, Omit<DeckItem, "id" | "updatedAt">> = {
  qbr: {
    name: "Quarterly Business Review",
    theme: "purple",
    slides: [
      {
        id: "s1",
        title: "Q4 Executive Business Review",
        subtitle: "Operational Velocity, Revenue Growth & Forecast",
        bullets: [
          "42% Quarter-over-Quarter recurring revenue expansion",
          "Unified CRM, Accounting & Inventory in one cockpit",
          "Zero external office software licensing overhead",
        ],
        notes: "Open with key wins and highlight operational efficiency gains.",
      },
      {
        id: "s2",
        title: "Financial & Margin Summary",
        subtitle: "Live metrics synced directly from BERAXIS Accounting",
        bullets: [
          "Gross margin improved by +6.4% via automated reordering",
          "Receivables cycle reduced from 28 days to 9 days",
          "Annual software savings of $18,400 across 25 seats",
        ],
        notes: "Walk through cost consolidation and cashflow velocity.",
      },
      {
        id: "s3",
        title: "Next Quarter Strategic Priorities",
        subtitle: "Scaling outbound pipeline & multi-branch execution",
        bullets: [
          "Launch 1,500 monthly B2B lead outreach sequences",
          "Enable Voice Pilot hands-free order creation for field reps",
          "Expand automated warehouse fulfillment workflows",
        ],
        notes: "Confirm department owners and Q1 KPI targets.",
      },
    ],
  },
  proposal: {
    name: "Client Sales Proposal",
    theme: "cyan",
    slides: [
      {
        id: "s1",
        title: "Strategic Partnership Proposal",
        subtitle: "Prepared Exclusively for Your Executive Team",
        bullets: [
          "Turnkey implementation completed in under 14 days",
          "Dedicated onboarding specialist & 1-click data migration",
          "Predictable flat-rate pricing with zero hidden fees",
        ],
        notes: "Customize client name and highlight rapid ROI timeline.",
      },
      {
        id: "s2",
        title: "Scope & Deliverables",
        subtitle: "End-to-end execution milestones",
        bullets: [
          "Phase 1: Data migration from legacy spreadsheets & ERP",
          "Phase 2: Role-based team onboarding & workflow automation",
          "Phase 3: Live KPI dashboards & executive reporting",
        ],
        notes: "Emphasize zero downtime during transition.",
      },
    ],
  },
};

export default function SlidesPage() {
  const { activeBranch, getEntityStorageKey } = useBranchContext();
  const [decks, setDecks] = useState<DeckItem[]>([]);
  const [activeDeckId, setActiveDeckId] = useState<string>("");
  const [activeSlideIdx, setActiveSlideIdx] = useState<number>(0);
  const [isPresenting, setIsPresenting] = useState<boolean>(false);

  useEffect(() => {
    if (!activeBranch) return;
    const key = getEntityStorageKey("beraxis_slides_decks");
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed: DeckItem[] = JSON.parse(saved);
        if (parsed.length > 0) {
          setDecks(parsed);
          setActiveDeckId(parsed[0].id);
          setActiveSlideIdx(0);
          return;
        }
      } catch {}
    }
    const starter: DeckItem = {
      id: "deck-qbr-default",
      updatedAt: new Date().toISOString().split("T")[0],
      ...DECK_TEMPLATES.qbr,
    };
    setDecks([starter]);
    setActiveDeckId(starter.id);
    setActiveSlideIdx(0);
  }, [activeBranch?.id]);

  const persistDecks = (updated: DeckItem[]) => {
    setDecks(updated);
    try {
      const key = getEntityStorageKey("beraxis_slides_decks");
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}
  };

  const activeDeck = useMemo(
    () => decks.find((d) => d.id === activeDeckId) || decks[0] || null,
    [decks, activeDeckId]
  );

  const activeSlide = activeDeck?.slides[activeSlideIdx] || activeDeck?.slides[0] || null;
  const themeStyle = THEME_STYLES[activeDeck?.theme || "purple"];

  useEffect(() => {
    if (!isPresenting || !activeDeck) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsPresenting(false);
      if (e.key === "ArrowRight" || e.key === " ") {
        setActiveSlideIdx((i) => Math.min(activeDeck.slides.length - 1, i + 1));
      }
      if (e.key === "ArrowLeft") {
        setActiveSlideIdx((i) => Math.max(0, i - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPresenting, activeDeck]);

  const createDeck = (templateKey: keyof typeof DECK_TEMPLATES | "blank") => {
    const newDeck: DeckItem =
      templateKey === "blank"
        ? {
            id: `deck-${Date.now()}`,
            name: "Untitled Presentation",
            theme: "purple",
            updatedAt: new Date().toISOString().split("T")[0],
            slides: [
              {
                id: `s-${Date.now()}`,
                title: "Presentation Title",
                subtitle: "Add a compelling subtitle here",
                bullets: ["Key point 1", "Key point 2", "Key point 3"],
                notes: "",
              },
            ],
          }
        : {
            id: `deck-${Date.now()}`,
            updatedAt: new Date().toISOString().split("T")[0],
            ...DECK_TEMPLATES[templateKey],
            slides: DECK_TEMPLATES[templateKey].slides.map((s, idx) => ({
              ...s,
              id: `s-${Date.now()}-${idx}`,
            })),
          };
    const updated = [newDeck, ...decks];
    persistDecks(updated);
    setActiveDeckId(newDeck.id);
    setActiveSlideIdx(0);
  };

  const updateCurrentSlide = (patch: Partial<SlideItem>) => {
    if (!activeDeck || !activeSlide) return;
    const updated = decks.map((d) =>
      d.id === activeDeck.id
        ? {
            ...d,
            updatedAt: new Date().toISOString().split("T")[0],
            slides: d.slides.map((s, idx) => (idx === activeSlideIdx ? { ...s, ...patch } : s)),
          }
        : d
    );
    persistDecks(updated);
  };

  const addSlide = () => {
    if (!activeDeck) return;
    const newSlide: SlideItem = {
      id: `s-${Date.now()}`,
      title: `Slide ${activeDeck.slides.length + 1}`,
      subtitle: "Section Overview",
      bullets: ["First insight or metric", "Second action item"],
      notes: "",
    };
    const updated = decks.map((d) =>
      d.id === activeDeck.id ? { ...d, slides: [...d.slides, newSlide] } : d
    );
    persistDecks(updated);
    setActiveSlideIdx(activeDeck.slides.length);
  };

  const duplicateSlide = () => {
    if (!activeDeck || !activeSlide) return;
    const copy: SlideItem = {
      ...activeSlide,
      id: `s-${Date.now()}`,
      title: `${activeSlide.title} (Copy)`,
    };
    const slides = [...activeDeck.slides];
    slides.splice(activeSlideIdx + 1, 0, copy);
    const updated = decks.map((d) => (d.id === activeDeck.id ? { ...d, slides } : d));
    persistDecks(updated);
    setActiveSlideIdx(activeSlideIdx + 1);
  };

  const deleteSlide = (idx: number) => {
    if (!activeDeck || activeDeck.slides.length <= 1) return;
    const slides = activeDeck.slides.filter((_, i) => i !== idx);
    const updated = decks.map((d) => (d.id === activeDeck.id ? { ...d, slides } : d));
    persistDecks(updated);
    setActiveSlideIdx((prev) => Math.max(0, Math.min(prev, slides.length - 1)));
  };

  const handlePrintDeck = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0d14] text-white">
      <AppHeader title="BERAXIS Slides — Built-In PowerPoint Alternative" />

      {/* Fullscreen Presenter Mode */}
      {isPresenting && activeDeck && activeSlide && (
        <div
          className={`fixed inset-0 z-50 bg-gradient-to-br ${themeStyle.bg} flex flex-col justify-between p-10 sm:p-16`}
        >
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${themeStyle.badge}`}>
              {activeDeck.name} · Slide {activeSlideIdx + 1} / {activeDeck.slides.length}
            </span>
            <button
              onClick={() => setIsPresenting(false)}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <X size={15} /> Exit (ESC)
            </button>
          </div>

          <div className="max-w-5xl mx-auto w-full space-y-8">
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight">
                {activeSlide.title}
              </h1>
              <p className={`text-xl sm:text-2xl font-medium ${themeStyle.accent}`}>
                {activeSlide.subtitle}
              </p>
            </div>
            <ul className="space-y-4 pt-4">
              {activeSlide.bullets.filter(Boolean).map((b, i) => (
                <li key={i} className="flex items-start gap-4 text-xl sm:text-2xl text-gray-200">
                  <span className={`mt-2 w-3 h-3 rounded-full shrink-0 bg-current ${themeStyle.accent}`} />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Use Left / Right arrow keys to navigate</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSlideIdx((i) => Math.max(0, i - 1))}
                disabled={activeSlideIdx === 0}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white font-bold flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft size={15} /> Prev
              </button>
              <button
                onClick={() => setActiveSlideIdx((i) => Math.min(activeDeck.slides.length - 1, i + 1))}
                disabled={activeSlideIdx === activeDeck.slides.length - 1}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-30 text-white font-bold flex items-center gap-1 cursor-pointer"
              >
                Next <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Decks & Slide Thumbnails */}
        <aside className="w-72 border-r border-gray-800 bg-[#0e121c] p-4 flex flex-col justify-between shrink-0 overflow-y-auto print:hidden">
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-800 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Your Decks ({decks.length})
                </span>
                <button
                  onClick={() => createDeck("blank")}
                  className="text-purple-400 hover:text-purple-300 p-1 hover:bg-purple-500/10 rounded cursor-pointer"
                  title="New Blank Deck"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-1.5">
                {decks.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      setActiveDeckId(d.id);
                      setActiveSlideIdx(0);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                      activeDeck?.id === d.id
                        ? "bg-purple-600/20 text-purple-300 border border-purple-500/40"
                        : "text-gray-400 hover:bg-gray-800/60 hover:text-white border border-transparent"
                    }`}
                  >
                    <Presentation size={14} className="shrink-0 text-purple-400" />
                    <span className="truncate">{d.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {activeDeck && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Slides ({activeDeck.slides.length})
                  </span>
                  <button
                    onClick={addSlide}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={13} /> Add Slide
                  </button>
                </div>
                <div className="space-y-2">
                  {activeDeck.slides.map((s, idx) => (
                    <div
                      key={s.id}
                      onClick={() => setActiveSlideIdx(idx)}
                      className={`group p-2.5 rounded-xl border transition-all cursor-pointer ${
                        idx === activeSlideIdx
                          ? "bg-purple-500/15 border-purple-500/50"
                          : "bg-white/[0.03] border-white/10 hover:border-white/25"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 mb-1">
                        <span>Slide {idx + 1}</span>
                        {activeDeck.slides.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSlide(idx);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-white truncate">{s.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                1-Click Deck Templates
              </span>
              <div className="space-y-1.5">
                <button
                  onClick={() => createDeck("qbr")}
                  className="w-full text-left px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 flex items-center gap-2 cursor-pointer"
                >
                  <Layout size={13} className="text-purple-400" />
                  <span>Quarterly Business Review</span>
                </button>
                <button
                  onClick={() => createDeck("proposal")}
                  className="w-full text-left px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles size={13} className="text-cyan-400" />
                  <span>Client Sales Proposal</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-200">
            <div className="font-bold text-purple-300 mb-1">No PowerPoint Needed</div>
            <p className="text-gray-400">
              Build client decks, QBRs, and team briefings directly inside BERAXIS and present fullscreen or export to PDF.
            </p>
          </div>
        </aside>

        {/* Main Slide Canvas & Editor */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#070a11]">
          {/* Top Toolbar */}
          {activeDeck && (
            <div className="border-b border-gray-800 bg-[#0c111b] px-5 py-3 flex flex-wrap items-center justify-between gap-3 print:hidden">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={activeDeck.name}
                  onChange={(e) => {
                    const updated = decks.map((d) =>
                      d.id === activeDeck.id ? { ...d, name: e.target.value } : d
                    );
                    persistDecks(updated);
                  }}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-purple-500"
                />

                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2 py-1">
                  <Palette size={13} className="text-gray-400" />
                  {(Object.keys(THEME_STYLES) as SlideTheme[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        const updated = decks.map((d) =>
                          d.id === activeDeck.id ? { ...d, theme: t } : d
                        );
                        persistDecks(updated);
                      }}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize cursor-pointer ${
                        activeDeck.theme === t
                          ? "bg-purple-600 text-white"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={duplicateSlide}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy size={13} /> Duplicate Slide
                </button>
                <button
                  onClick={handlePrintDeck}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer size={13} /> Export PDF
                </button>
                <button
                  onClick={() => setIsPresenting(true)}
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/25 cursor-pointer"
                >
                  <Play size={13} /> Present Fullscreen
                </button>
              </div>
            </div>
          )}

          {/* Live Slide Canvas + Controls */}
          {activeDeck && activeSlide && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Visual 16:9 Slide Preview */}
              <div
                className={`max-w-4xl mx-auto aspect-video rounded-3xl bg-gradient-to-br ${themeStyle.bg} border border-white/15 p-8 sm:p-12 shadow-2xl flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${themeStyle.badge}`}>
                    {activeDeck.name}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    {activeSlideIdx + 1} / {activeDeck.slides.length}
                  </span>
                </div>

                <div className="space-y-4 my-auto">
                  <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                    {activeSlide.title || "Untitled Slide"}
                  </h2>
                  <p className={`text-sm sm:text-lg font-medium ${themeStyle.accent}`}>
                    {activeSlide.subtitle}
                  </p>
                  <ul className="space-y-2.5 pt-2">
                    {activeSlide.bullets.filter(Boolean).map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm sm:text-base text-gray-200">
                        <span className={`mt-2 w-2 h-2 rounded-full shrink-0 bg-current ${themeStyle.accent}`} />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="text-[11px] text-gray-500 flex items-center justify-between">
                  <span>Powered by BERAXIS Slides</span>
                  <span>{activeDeck.updatedAt}</span>
                </div>
              </div>

              {/* Slide Content Editor */}
              <div className="max-w-4xl mx-auto bg-[#0e121c] border border-gray-800 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                      Slide Headline
                    </label>
                    <input
                      type="text"
                      value={activeSlide.title}
                      onChange={(e) => updateCurrentSlide({ title: e.target.value })}
                      className="w-full bg-[#070a11] border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={activeSlide.subtitle}
                      onChange={(e) => updateCurrentSlide({ subtitle: e.target.value })}
                      className="w-full bg-[#070a11] border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                      Speaker Notes
                    </label>
                    <textarea
                      rows={2}
                      value={activeSlide.notes}
                      onChange={(e) => updateCurrentSlide({ notes: e.target.value })}
                      placeholder="Private notes for the presenter..."
                      className="w-full bg-[#070a11] border border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Bullet Points (one per line)
                  </label>
                  <textarea
                    rows={7}
                    value={activeSlide.bullets.join("\n")}
                    onChange={(e) =>
                      updateCurrentSlide({ bullets: e.target.value.split("\n") })
                    }
                    className="w-full bg-[#070a11] border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-purple-500 leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
