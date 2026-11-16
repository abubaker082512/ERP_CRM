import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import {
  FileSpreadsheet,
  FileText,
  Presentation,
  Video,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Sun,
  Layers,
  ShieldCheck
} from "lucide-react";

export const metadata: Metadata = {
  title: "Built-In Office Automation Suite (Excel, Word, PowerPoint & Meet Alternative) | BERAXIS AI",
  description:
    "Stop paying for Microsoft 365 or Google Workspace. BERAXIS AI includes native .XLSX Spreadsheets (VLOOKUP, Pivot Tables, Charts), .DOCX Word Studio (A4/Letter/Legal), .PPTX Slides, and WebRTC Video Meet for $1/month.",
  keywords: [
    "Microsoft Excel alternative",
    "Microsoft Word alternative",
    "Microsoft PowerPoint alternative",
    "Microsoft 365 free alternative",
    "Google Workspace alternative with ERP",
    "Office automation software",
    "Built-in spreadsheets and presentations",
    "Free business office suite",
    "BERAXIS Office Suite"
  ],
  alternates: {
    canonical: "https://www.beraxis.online/features/office-suite",
  },
  openGraph: {
    title: "Built-In Office Suite: Sheets, Docs, Slides & Meet | BERAXIS AI",
    description:
      "No need to buy Excel, PowerPoint, or Word. Create .XLSX spreadsheets, .DOCX documents, .PPTX decks, and host WebRTC video meetings directly inside BERAXIS.",
    url: "https://www.beraxis.online/features/office-suite",
    siteName: "BERAXIS AI",
    images: [{ url: "https://www.beraxis.online/og-image.png", width: 1200, height: 630, alt: "BERAXIS Office Suite" }],
  },
};

export default function OfficeSuiteFeaturePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Do I still need to buy Microsoft Excel, Word, or PowerPoint?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. BERAXIS AI includes built-in Spreadsheets (.xlsx import/export, VLOOKUP, SUMIF, Pivot Tables, Charts), Word Studio (.docx import/export with A4/Letter/Legal page sizes), Slides (.pptx import/export with transitions), and WebRTC Meet—all included at no extra cost.",
        },
      },
      {
        "@type": "Question",
        name: "Can I open and export Microsoft Office files?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can import and export native .xlsx, .docx, and .pptx files directly in your browser and switch between Light paper mode and Dark studio mode in 1 click.",
        },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#020205] text-white overflow-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Navbar />

      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-6">
          <Sparkles size={14} /> Complete Office Automation Built Into Your ERP
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-6 leading-tight">
          No Need to Buy{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400">
            Excel, Word, or PowerPoint
          </span>
        </h1>

        <p className="text-base sm:text-lg text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
          BERAXIS AI covers your entire business—from ERP, Accounting, and CRM to everyday office productivity. Create `.XLSX` spreadsheets with Pivot Tables, `.DOCX` documents with custom page sizes, `.PPTX` slide decks, and host HD WebRTC video meetings in one place.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link href="/signup" className="galaxy-btn-primary px-7 py-3.5 text-sm font-bold flex items-center gap-2">
            <span>Start Free Forever — No Card</span>
            <ArrowRight size={16} />
          </Link>
          <Link href="/compare/microsoft-365-alternative" className="px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-sm font-bold transition-all">
            Compare vs Microsoft 365
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="p-7 rounded-3xl bg-[#0B1120] border border-emerald-500/30 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet size={24} />
            </div>
            <h2 className="text-xl font-bold">BERAXIS Sheets (Excel Alternative)</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Multi-tab workbooks with `VLOOKUP`, `XLOOKUP`, `SUMIF`, `COUNTIF`, Pivot Tables, Conditional Formatting, Bar/Line/Area/Pie Charts, and native `.XLSX` import/export.
            </p>
            <Link href="/spreadsheets" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:underline">
              Launch BERAXIS Sheets <ArrowRight size={13} />
            </Link>
          </div>

          <div className="p-7 rounded-3xl bg-[#0B1120] border border-blue-500/30 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileText size={24} />
            </div>
            <h2 className="text-xl font-bold">BERAXIS Docs (Word Alternative)</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Full WYSIWYG word processor with adjustable Page Size (`A4`, `US Letter`, `Legal`, `A5`), Portrait/Landscape orientation, custom margins, tables, images, and `.DOCX` import/export.
            </p>
            <Link href="/documents" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:underline">
              Launch BERAXIS Docs <ArrowRight size={13} />
            </Link>
          </div>

          <div className="p-7 rounded-3xl bg-[#0B1120] border border-purple-500/30 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Presentation size={24} />
            </div>
            <h2 className="text-xl font-bold">BERAXIS Slides (PowerPoint Alternative)</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Executive deck studio with Cover, Split, Bullets, and KPI layouts, freeform Text/Shape/Table elements, transitions, Slide Sorter, and native `.PPTX` import/export.
            </p>
            <Link href="/slides" className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:underline">
              Launch BERAXIS Slides <ArrowRight size={13} />
            </Link>
          </div>

          <div className="p-7 rounded-3xl bg-[#0B1120] border border-cyan-500/30 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Video size={24} />
            </div>
            <h2 className="text-xl font-bold">BERAXIS Meet (Zoom / Teams Alternative)</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Encrypted peer-to-peer WebRTC HD video rooms with instant invite links, live screen sharing, in-room chat, and local `.webm` meeting recording.
            </p>
            <Link href="/meet" className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:underline">
              Launch BERAXIS Meet <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        <div className="mt-12 p-6 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-300">
          <span className="flex items-center gap-2"><Sun size={15} className="text-amber-400" /> 1-Click Light &amp; Dark Studio Themes</span>
          <span className="flex items-center gap-2"><Layers size={15} className="text-purple-400" /> AI Content, Formula &amp; Deck Generators</span>
          <span className="flex items-center gap-2"><ShieldCheck size={15} className="text-emerald-400" /> 100% Included in $1/mo Plan</span>
          <span className="flex items-center gap-2"><CheckCircle2 size={15} className="text-cyan-400" /> Zero Extra Office Licenses</span>
        </div>
      </section>

      <Footer />
    </main>
  );
}
