"use client";

import { useState, useEffect, useMemo } from "react";
import PptxGenJS from "pptxgenjs";
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
  Copy,
  Download,
  ArrowUp,
  ArrowDown,
  Sun,
  Moon
} from "lucide-react";

type SlideTheme = "purple" | "cyan" | "emerald" | "amber" | "corporate";
type SlideLayout = "cover" | "bullets" | "split" | "kpi";

type SlideItem = {
  id: string;
  layout?: SlideLayout;
  title: string;
  subtitle: string;
  bullets: string[];
  kpiValue?: string;
  kpiLabel?: string;
  imageUrl?: string;
  notes: string;
};

type DeckItem = {
  id: string;
  name: string;
  theme: SlideTheme;
  updatedAt: string;
  slides: SlideItem[];
};

const THEME_STYLES: Record<
  SlideTheme,
  { label: string; bg: string; hexBg: string; hexText: string; hexAccent: string; accent: string; badge: string; isLightSlide?: boolean }
> = {
  purple: {
    label: "Galaxy Purple",
    bg: "from-[#1a1033] via-[#0b0f1e] to-[#080b14]",
    hexBg: "0B0F1E",
    hexText: "FFFFFF",
    hexAccent: "C084FC",
    accent: "text-purple-400",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  },
  cyan: {
    label: "Ocean Cyan",
    bg: "from-[#0a2334] via-[#091220] to-[#060912]",
    hexBg: "091220",
    hexText: "FFFFFF",
    hexAccent: "22D3EE",
    accent: "text-cyan-400",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  },
  emerald: {
    label: "Executive Emerald",
    bg: "from-[#092920] via-[#091418] to-[#060910]",
    hexBg: "091418",
    hexText: "FFFFFF",
    hexAccent: "34D399",
    accent: "text-emerald-400",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  amber: {
    label: "Amber Gold",
    bg: "from-[#2d1c08] via-[#131018] to-[#080910]",
    hexBg: "131018",
    hexText: "FFFFFF",
    hexAccent: "FBBF24",
    accent: "text-amber-400",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  corporate: {
    label: "Clean White",
    bg: "from-white via-slate-50 to-slate-100",
    hexBg: "FFFFFF",
    hexText: "0F172A",
    hexAccent: "4F46E5",
    accent: "text-indigo-600",
    badge: "bg-indigo-100 text-indigo-700 border-indigo-200",
    isLightSlide: true,
  },
};

const DECK_TEMPLATES: Record<string, Omit<DeckItem, "id" | "updatedAt">> = {
  qbr: {
    name: "Quarterly Business Review",
    theme: "purple",
    slides: [
      {
        id: "s1",
        layout: "cover",
        title: "Q4 Executive Business Review",
        subtitle: "Operational Velocity, Revenue Growth & Forecast",
        bullets: [
          "Unified CRM, Accounting, Inventory & Office Automation",
          "Zero external software licensing overhead",
        ],
        notes: "Open with key wins.",
      },
      {
        id: "s2",
        layout: "kpi",
        title: "Revenue & Margin Expansion",
        subtitle: "Live metrics synced from BERAXIS Accounting",
        kpiValue: "+42%",
        kpiLabel: "Quarter-over-Quarter ARR Growth",
        bullets: [
          "Gross margin improved +6.4% via automated reordering",
          "Receivables cycle reduced from 28 days to 9 days",
          "Saved $18,400/yr by replacing Office 365 & legacy CRM",
        ],
        notes: "Walk through cost consolidation.",
      },
      {
        id: "s3",
        layout: "bullets",
        title: "Next Quarter Strategic Priorities",
        subtitle: "Scaling outbound pipeline & multi-branch execution",
        bullets: [
          "Launch 1,500 monthly B2B lead outreach sequences",
          "Enable Voice Pilot hands-free order creation for field reps",
          "Expand automated warehouse fulfillment workflows",
        ],
        notes: "Confirm department owners.",
      },
    ],
  },
  proposal: {
    name: "Client Sales Proposal",
    theme: "corporate",
    slides: [
      {
        id: "s1",
        layout: "cover",
        title: "Strategic Partnership Proposal",
        subtitle: "Prepared Exclusively for Your Executive Team",
        bullets: [
          "Turnkey implementation completed in under 14 days",
          "Predictable flat-rate pricing with zero hidden fees",
        ],
        notes: "Customize client name.",
      },
      {
        id: "s2",
        layout: "split",
        title: "Scope & Deliverables",
        subtitle: "End-to-end execution milestones",
        bullets: [
          "Phase 1: Data migration from Excel & legacy ERP",
          "Phase 2: Team onboarding & workflow automation",
          "Phase 3: Live KPI dashboards & executive reporting",
        ],
        kpiValue: "14 Days",
        kpiLabel: "Full Go-Live Timeline",
        notes: "Emphasize zero downtime.",
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
  const [studioTheme, setStudioTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("beraxis_office_theme");
    if (saved === "light" || saved === "dark") setStudioTheme(saved);
  }, []);

  const toggleStudioTheme = () => {
    const next = studioTheme === "dark" ? "light" : "dark";
    setStudioTheme(next);
    localStorage.setItem("beraxis_office_theme", next);
  };

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
            theme: studioTheme === "light" ? "corporate" : "purple",
            updatedAt: new Date().toISOString().split("T")[0],
            slides: [
              {
                id: `s-${Date.now()}`,
                layout: "cover",
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
    persistDecks([newDeck, ...decks]);
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
      layout: "bullets",
      title: `Slide ${activeDeck.slides.length + 1}`,
      subtitle: "Section Overview",
      bullets: ["First insight or metric", "Second action item"],
      notes: "",
    };
    persistDecks(
      decks.map((d) => (d.id === activeDeck.id ? { ...d, slides: [...d.slides, newSlide] } : d))
    );
    setActiveSlideIdx(activeDeck.slides.length);
  };

  const moveSlide = (dir: -1 | 1) => {
    if (!activeDeck) return;
    const target = activeSlideIdx + dir;
    if (target < 0 || target >= activeDeck.slides.length) return;
    const slides = [...activeDeck.slides];
    const [moved] = slides.splice(activeSlideIdx, 1);
    slides.splice(target, 0, moved);
    persistDecks(decks.map((d) => (d.id === activeDeck.id ? { ...d, slides } : d)));
    setActiveSlideIdx(target);
  };

  const duplicateSlide = () => {
    if (!activeDeck || !activeSlide) return;
    const copy: SlideItem = { ...activeSlide, id: `s-${Date.now()}`, title: `${activeSlide.title} (Copy)` };
    const slides = [...activeDeck.slides];
    slides.splice(activeSlideIdx + 1, 0, copy);
    persistDecks(decks.map((d) => (d.id === activeDeck.id ? { ...d, slides } : d)));
    setActiveSlideIdx(activeSlideIdx + 1);
  };

  const deleteSlide = (idx: number) => {
    if (!activeDeck || activeDeck.slides.length <= 1) return;
    const slides = activeDeck.slides.filter((_, i) => i !== idx);
    persistDecks(decks.map((d) => (d.id === activeDeck.id ? { ...d, slides } : d)));
    setActiveSlideIdx((prev) => Math.max(0, Math.min(prev, slides.length - 1)));
  };

  // True .pptx Export via PptxGenJS
  const exportPptx = () => {
    if (!activeDeck) return;
    const pptx = new PptxGenJS();
    pptx.title = activeDeck.name;
    const t = THEME_STYLES[activeDeck.theme];

    activeDeck.slides.forEach((s) => {
      const slide = pptx.addSlide();
      slide.background = { color: t.hexBg };

      if (s.layout === "cover") {
        slide.addText(s.title, {
          x: 0.8, y: 1.8, w: 8.4, h: 1.4,
          fontSize: 36, bold: true, color: t.hexText, align: "center",
        });
        slide.addText(s.subtitle, {
          x: 1.0, y: 3.3, w: 8.0, h: 0.7,
          fontSize: 18, color: t.hexAccent, align: "center",
        });
      } else {
        slide.addText(s.title, {
          x: 0.7, y: 0.5, w: 8.6, h: 0.8,
          fontSize: 28, bold: true, color: t.hexText,
        });
        slide.addText(s.subtitle, {
          x: 0.7, y: 1.25, w: 8.6, h: 0.5,
          fontSize: 15, color: t.hexAccent,
        });
        const bulletItems = s.bullets.filter(Boolean).map((b) => ({
          text: b,
          options: { bullet: true, color: t.hexText, fontSize: 16, breakLine: true },
        }));
        if (s.layout === "kpi" && s.kpiValue) {
          slide.addText(s.kpiValue, {
            x: 0.7, y: 2.0, w: 3.0, h: 1.2,
            fontSize: 44, bold: true, color: t.hexAccent,
          });
          slide.addText(s.kpiLabel || "", {
            x: 0.7, y: 3.2, w: 3.0, h: 0.6,
            fontSize: 13, color: t.hexText,
          });
          if (bulletItems.length) {
            slide.addText(bulletItems, { x: 4.0, y: 2.0, w: 5.3, h: 3.2, valign: "top" });
          }
        } else if (bulletItems.length) {
          slide.addText(bulletItems, { x: 0.7, y: 2.0, w: 8.6, h: 3.2, valign: "top" });
        }
      }
      if (s.notes) slide.addNotes(s.notes);
    });

    pptx.writeFile({ fileName: `${activeDeck.name.replace(/\s+/g, "_")}.pptx` });
  };

  const isLight = studioTheme === "light";
  const layout = activeSlide?.layout || "bullets";

  const renderSlideInner = (slide: SlideItem, fullscreen = false) => {
    const textMain = themeStyle.isLightSlide ? "text-slate-900" : "text-white";
    const textBody = themeStyle.isLightSlide ? "text-slate-700" : "text-gray-200";
    const l = slide.layout || "bullets";

    if (l === "cover") {
      return (
        <div className="my-auto text-center space-y-4 px-4">
          <h2 className={`${fullscreen ? "text-5xl sm:text-6xl" : "text-3xl sm:text-4xl"} font-black leading-tight ${textMain}`}>
            {slide.title || "Untitled Slide"}
          </h2>
          <p className={`${fullscreen ? "text-xl sm:text-2xl" : "text-base sm:text-lg"} font-semibold ${themeStyle.accent}`}>
            {slide.subtitle}
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-3">
            {slide.bullets.filter(Boolean).map((b, i) => (
              <span key={i} className={`px-3 py-1 rounded-full text-xs border ${themeStyle.badge}`}>
                {b}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (l === "kpi" || l === "split") {
      return (
        <div className="my-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-5 space-y-2 p-5 rounded-2xl bg-black/15 border border-white/10">
            <div className={`${fullscreen ? "text-6xl" : "text-4xl"} font-black ${themeStyle.accent}`}>
              {slide.kpiValue || "+42%"}
            </div>
            <div className={`text-xs font-semibold uppercase tracking-wider ${textBody}`}>
              {slide.kpiLabel || "Key Metric"}
            </div>
            {slide.imageUrl && (
              <img src={slide.imageUrl} alt="Slide visual" className="mt-3 rounded-xl max-h-32 w-full object-cover" />
            )}
          </div>
          <div className="md:col-span-7 space-y-3">
            <h2 className={`${fullscreen ? "text-4xl" : "text-2xl sm:text-3xl"} font-black leading-tight ${textMain}`}>
              {slide.title}
            </h2>
            <p className={`text-sm font-medium ${themeStyle.accent}`}>{slide.subtitle}</p>
            <ul className="space-y-2 pt-2">
              {slide.bullets.filter(Boolean).map((b, i) => (
                <li key={i} className={`flex items-start gap-2.5 ${fullscreen ? "text-lg" : "text-sm"} ${textBody}`}>
                  <span className={`mt-2 w-2 h-2 rounded-full shrink-0 bg-current ${themeStyle.accent}`} />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4 my-auto">
        <h2 className={`${fullscreen ? "text-4xl sm:text-5xl" : "text-2xl sm:text-4xl"} font-black leading-tight ${textMain}`}>
          {slide.title || "Untitled Slide"}
        </h2>
        <p className={`${fullscreen ? "text-xl" : "text-sm sm:text-lg"} font-medium ${themeStyle.accent}`}>
          {slide.subtitle}
        </p>
        <ul className="space-y-2.5 pt-2">
          {slide.bullets.filter(Boolean).map((bullet, idx) => (
            <li key={idx} className={`flex items-start gap-3 ${fullscreen ? "text-xl" : "text-sm sm:text-base"} ${textBody}`}>
              <span className={`mt-2 w-2 h-2 rounded-full shrink-0 bg-current ${themeStyle.accent}`} />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-screen ${isLight ? "bg-slate-100 text-slate-900" : "bg-[#0a0d14] text-white"}`}>
      <AppHeader title="BERAXIS Slides — Full PowerPoint Studio (.PPTX)" />

      {/* Fullscreen Presenter Mode */}
      {isPresenting && activeDeck && activeSlide && (
        <div className={`fixed inset-0 z-50 bg-gradient-to-br ${themeStyle.bg} flex flex-col justify-between p-10 sm:p-16`}>
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${themeStyle.badge}`}>
              {activeDeck.name} · Slide {activeSlideIdx + 1} / {activeDeck.slides.length}
            </span>
            <button onClick={() => setIsPresenting(false)} className="px-3 py-2 rounded-xl bg-black/30 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer">
              <X size={15} /> Exit (ESC)
            </button>
          </div>
          <div className="max-w-5xl mx-auto w-full">{renderSlideInner(activeSlide, true)}</div>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Arrow keys to navigate</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setActiveSlideIdx((i) => Math.max(0, i - 1))} disabled={activeSlideIdx === 0} className="px-4 py-2 rounded-xl bg-black/30 disabled:opacity-30 text-white font-bold flex items-center gap-1 cursor-pointer">
                <ChevronLeft size={15} /> Prev
              </button>
              <button onClick={() => setActiveSlideIdx((i) => Math.min(activeDeck.slides.length - 1, i + 1))} disabled={activeSlideIdx === activeDeck.slides.length - 1} className="px-4 py-2 rounded-xl bg-purple-600 disabled:opacity-30 text-white font-bold flex items-center gap-1 cursor-pointer">
                Next <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className={`w-72 border-r p-4 flex flex-col justify-between shrink-0 overflow-y-auto print:hidden ${isLight ? "bg-white border-slate-200" : "bg-[#0e121c] border-gray-800"}`}>
          <div className="space-y-5">
            <div>
              <div className={`flex items-center justify-between pb-2 border-b mb-3 ${isLight ? "border-slate-200" : "border-gray-800"}`}>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Decks ({decks.length})</span>
                <button onClick={() => createDeck("blank")} className="text-purple-500 p-1 rounded cursor-pointer">
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-1.5">
                {decks.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => { setActiveDeckId(d.id); setActiveSlideIdx(0); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer ${
                      activeDeck?.id === d.id
                        ? isLight
                          ? "bg-purple-50 text-purple-700 border border-purple-300"
                          : "bg-purple-600/20 text-purple-300 border border-purple-500/40"
                        : isLight
                        ? "text-slate-600 hover:bg-slate-100"
                        : "text-gray-400 hover:bg-gray-800/60"
                    }`}
                  >
                    <Presentation size={14} className="shrink-0 text-purple-500" />
                    <span className="truncate">{d.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {activeDeck && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Slides ({activeDeck.slides.length})</span>
                  <button onClick={addSlide} className="text-xs text-cyan-500 font-bold flex items-center gap-1 cursor-pointer">
                    <Plus size={13} /> Add
                  </button>
                </div>
                <div className="space-y-2">
                  {activeDeck.slides.map((s, idx) => (
                    <div
                      key={s.id}
                      onClick={() => setActiveSlideIdx(idx)}
                      className={`group p-2.5 rounded-xl border cursor-pointer ${
                        idx === activeSlideIdx
                          ? "bg-purple-500/15 border-purple-500/50"
                          : isLight
                          ? "bg-slate-50 border-slate-200"
                          : "bg-white/[0.03] border-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 mb-1">
                        <span>Slide {idx + 1} • {s.layout || "bullets"}</span>
                        {activeDeck.slides.length > 1 && (
                          <button onClick={(e) => { e.stopPropagation(); deleteSlide(idx); }} className="opacity-0 group-hover:opacity-100 hover:text-red-500">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                      <div className="text-xs font-semibold truncate">{s.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-2">Templates</span>
              <div className="space-y-1.5">
                <button onClick={() => createDeck("qbr")} className={`w-full text-left px-3 py-2 rounded-xl border text-xs flex items-center gap-2 cursor-pointer ${isLight ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-white/5 border-white/10 text-gray-300"}`}>
                  <Layout size={13} className="text-purple-500" /> <span>Quarterly Business Review</span>
                </button>
                <button onClick={() => createDeck("proposal")} className={`w-full text-left px-3 py-2 rounded-xl border text-xs flex items-center gap-2 cursor-pointer ${isLight ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-white/5 border-white/10 text-gray-300"}`}>
                  <Sparkles size={13} className="text-cyan-500" /> <span>Client Sales Proposal</span>
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Studio */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {activeDeck && (
            <div className={`border-b px-5 py-3 flex flex-wrap items-center justify-between gap-3 print:hidden ${isLight ? "bg-white border-slate-200" : "bg-[#0c111b] border-gray-800"}`}>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={activeDeck.name}
                  onChange={(e) => persistDecks(decks.map((d) => (d.id === activeDeck.id ? { ...d, name: e.target.value } : d)))}
                  className={`border rounded-lg px-3 py-1.5 text-sm font-bold w-44 focus:outline-none ${isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-white/5 border-white/10 text-white"}`}
                />
                <div className={`flex items-center gap-1 border rounded-lg px-2 py-1 ${isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10"}`}>
                  <Palette size={13} className="text-gray-400" />
                  {(Object.keys(THEME_STYLES) as SlideTheme[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => persistDecks(decks.map((d) => (d.id === activeDeck.id ? { ...d, theme: t } : d)))}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize cursor-pointer ${
                        activeDeck.theme === t ? "bg-purple-600 text-white" : "text-gray-400"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button onClick={toggleStudioTheme} className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 cursor-pointer ${isLight ? "bg-slate-100 border-slate-300 text-slate-800" : "bg-white/5 border-white/10 text-gray-200"}`}>
                  {isLight ? <Moon size={13} /> : <Sun size={13} className="text-amber-400" />}
                  <span>{isLight ? "Dark" : "Light"}</span>
                </button>
                <button onClick={() => moveSlide(-1)} disabled={activeSlideIdx === 0} className={`p-1.5 rounded-lg border disabled:opacity-30 cursor-pointer ${isLight ? "border-slate-300" : "border-white/10"}`} title="Move Slide Up"><ArrowUp size={13} /></button>
                <button onClick={() => moveSlide(1)} disabled={activeSlideIdx === activeDeck.slides.length - 1} className={`p-1.5 rounded-lg border disabled:opacity-30 cursor-pointer ${isLight ? "border-slate-300" : "border-white/10"}`} title="Move Slide Down"><ArrowDown size={13} /></button>
                <button onClick={duplicateSlide} className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer ${isLight ? "border-slate-300" : "border-white/10"}`}>
                  <Copy size={13} />
                </button>
                <button onClick={() => window.print()} className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer ${isLight ? "border-slate-300" : "border-white/10"}`}>
                  <Printer size={13} /> PDF
                </button>
                <button onClick={exportPptx} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                  <Download size={13} /> Export .PPTX
                </button>
                <button onClick={() => setIsPresenting(true)} className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                  <Play size={13} /> Present
                </button>
              </div>
            </div>
          )}

          {activeDeck && activeSlide && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className={`max-w-4xl mx-auto aspect-video rounded-3xl bg-gradient-to-br ${themeStyle.bg} border border-white/15 p-8 sm:p-12 shadow-2xl flex flex-col justify-between`}>
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${themeStyle.badge}`}>{activeDeck.name}</span>
                  <span className="text-xs text-gray-400 font-mono">{activeSlideIdx + 1} / {activeDeck.slides.length}</span>
                </div>
                {renderSlideInner(activeSlide)}
                <div className="text-[11px] text-gray-500 flex items-center justify-between">
                  <span>BERAXIS Slides (.PPTX Ready)</span>
                  <span>{activeDeck.updatedAt}</span>
                </div>
              </div>

              <div className={`max-w-4xl mx-auto border rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden ${isLight ? "bg-white border-slate-200" : "bg-[#0e121c] border-gray-800"}`}>
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Slide Layout</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(["cover", "bullets", "split", "kpi"] as SlideLayout[]).map((l) => (
                        <button
                          key={l}
                          onClick={() => updateCurrentSlide({ layout: l })}
                          className={`py-1.5 rounded-lg text-[11px] font-bold capitalize cursor-pointer ${
                            layout === l ? "bg-purple-600 text-white" : isLight ? "bg-slate-100 text-slate-700" : "bg-white/5 text-gray-300"
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Slide Headline</label>
                    <input type="text" value={activeSlide.title} onChange={(e) => updateCurrentSlide({ title: e.target.value })} className={`w-full border rounded-xl px-3 py-2 text-sm ${isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-[#070a11] border-gray-700 text-white"}`} />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Subtitle</label>
                    <input type="text" value={activeSlide.subtitle} onChange={(e) => updateCurrentSlide({ subtitle: e.target.value })} className={`w-full border rounded-xl px-3 py-2 text-sm ${isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-[#070a11] border-gray-700 text-white"}`} />
                  </div>
                  {(layout === "kpi" || layout === "split") && (
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="Metric (e.g. +42%)" value={activeSlide.kpiValue || ""} onChange={(e) => updateCurrentSlide({ kpiValue: e.target.value })} className={`border rounded-xl px-3 py-1.5 text-xs ${isLight ? "bg-slate-50 border-slate-300" : "bg-[#070a11] border-gray-700"}`} />
                      <input type="text" placeholder="Metric Label" value={activeSlide.kpiLabel || ""} onChange={(e) => updateCurrentSlide({ kpiLabel: e.target.value })} className={`border rounded-xl px-3 py-1.5 text-xs ${isLight ? "bg-slate-50 border-slate-300" : "bg-[#070a11] border-gray-700"}`} />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Bullet Points (one per line)</label>
                    <textarea rows={5} value={activeSlide.bullets.join("\n")} onChange={(e) => updateCurrentSlide({ bullets: e.target.value.split("\n") })} className={`w-full border rounded-xl px-3 py-2 text-sm leading-relaxed ${isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-[#070a11] border-gray-700 text-gray-200"}`} />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Speaker Notes</label>
                    <textarea rows={2} value={activeSlide.notes} onChange={(e) => updateCurrentSlide({ notes: e.target.value })} placeholder="Private presenter notes..." className={`w-full border rounded-xl px-3 py-2 text-xs ${isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-[#070a11] border-gray-700 text-gray-200"}`} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
