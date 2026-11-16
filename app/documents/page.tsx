"use client";

import { useState, useEffect, useRef } from "react";
import AppHeader from "@/components/layout/AppHeader";
import { useBranchContext } from "@/lib/branchContext";
import {
  PageSizeKey,
  PageOrientationKey,
  PageMarginKey,
  PAGE_SIZE_SPECS,
  MARGIN_SPECS,
  importDocxFile,
  exportDocxFile
} from "@/lib/office/docxUtils";
import { generateOfficeDoc } from "@/lib/office/aiOfficeGenerator";
import {
  Folder,
  FileText,
  Upload,
  Plus,
  Download,
  Trash2,
  Search,
  FileSpreadsheet,
  FileImage,
  FileCode,
  Lock,
  HardDrive,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Table as TableIcon,
  Image as ImageIcon,
  Minus,
  Printer,
  Sun,
  Moon,
  Save,
  Sparkles,
  Check
} from "lucide-react";

type DocCategory = "all" | "finance" | "hr" | "legal" | "product" | "marketing";

type DocumentItem = {
  id: string;
  name: string;
  folderId: string;
  category: DocCategory;
  extension: string;
  sizeMB: number;
  uploadedBy: string;
  uploadedAt: string;
  version: string;
  isEncrypted: boolean;
  tags: string[];
  sha256: string;
  htmlContent?: string;
};

type FolderItem = {
  id: string;
  name: string;
  category: DocCategory;
  filesCount: number;
  color: string;
};

const DEFAULT_FOLDERS: FolderItem[] = [
  { id: "f-all", name: "All Enterprise Files", category: "all", filesCount: 0, color: "text-purple-400 bg-purple-500/10" },
  { id: "f-finance", name: "Financial & Invoices", category: "finance", filesCount: 0, color: "text-emerald-400 bg-emerald-500/10" },
  { id: "f-hr", name: "HR & Signed Contracts", category: "hr", filesCount: 0, color: "text-blue-400 bg-blue-500/10" },
  { id: "f-product", name: "Product Specs & BOM", category: "product", filesCount: 0, color: "text-amber-400 bg-amber-500/10" },
  { id: "f-legal", name: "Corporate Legal & NDA", category: "legal", filesCount: 0, color: "text-red-400 bg-red-500/10" },
  { id: "f-marketing", name: "Brand & Pitch Decks", category: "marketing", filesCount: 0, color: "text-cyan-400 bg-cyan-500/10" },
];

const DOC_TEMPLATES: Record<string, { title: string; html: string }> = {
  proposal: {
    title: "Enterprise Partnership Proposal",
    html: `<h1>Enterprise Partnership Proposal</h1><p><strong>Prepared by:</strong> BERAXIS Operations Team &nbsp;|&nbsp; <strong>Date:</strong> ${new Date().toLocaleDateString()}</p><hr/><h2>1. Executive Summary</h2><p>This proposal outlines a unified deployment plan to consolidate CRM, Accounting, Inventory, and Office Automation into a single cloud workspace.</p><h2>2. Scope &amp; Deliverables</h2><ul><li>Full data migration from legacy spreadsheets and ERP</li><li>Role-based team onboarding &amp; permission hierarchy</li><li>Automated invoicing, POS, and live KPI reporting</li></ul>`,
  },
  sop: {
    title: "Standard Operating Procedure (SOP)",
    html: `<h1>Standard Operating Procedure: Monthly Close</h1><p><strong>Department:</strong> Finance &amp; Operations &nbsp;|&nbsp; <strong>Version:</strong> 2.0</p><hr/><h2>Purpose</h2><p>Ensure accurate reconciliation of invoices, payroll, and inventory balances by the 3rd business day of each month.</p><h2>Checklist</h2><ol><li>Verify POS and card settlements match ledger entries.</li><li>Run inventory valuation check in BERAXIS Sheets.</li><li>Export monthly P&amp;L and share executive summary in BERAXIS Slides.</li></ol>`,
  },
  minutes: {
    title: "Executive Meeting Minutes",
    html: `<h1>Weekly Leadership Sync — Minutes</h1><p><strong>Attendees:</strong> Operations, Sales, Finance</p><hr/><h2>Key Decisions</h2><ul><li>Approved Q1 outbound campaign using 1,500 monthly B2B lead credits.</li><li>Migrated legacy Excel trackers into BERAXIS Sheets.</li></ul>`,
  },
};

export default function DocumentsPage() {
  const { activeBranch, getEntityStorageKey } = useBranchContext();
  const [folders, setFolders] = useState<FolderItem[]>(DEFAULT_FOLDERS);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>("f-all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [studioMode, setStudioMode] = useState<"editor" | "vault">("editor");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Word Editor & Page Setup State
  const [docTitle, setDocTitle] = useState("Untitled Business Document");
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<PageSizeKey>("a4");
  const [orientation, setOrientation] = useState<PageOrientationKey>("portrait");
  const [pageMargin, setPageMargin] = useState<PageMarginKey>("normal");
  const [lineHeight, setLineHeight] = useState<string>("1.6");
  const [fontFamily, setFontFamily] = useState<string>("Inter, sans-serif");
  const [headerText, setHeaderText] = useState<string>("");
  const [footerText, setFooterText] = useState<string>("Confidential — Prepared with BERAXIS Docs");
  const [showFindBar, setShowFindBar] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [wordStats, setWordStats] = useState({ words: 0, chars: 0 });
  const [savedNotice, setSavedNotice] = useState(false);
  const editorRef = useRef<HTMLDivElement | null>(null);

  // Vault Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [uploadFileName, setUploadFileName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");

  useEffect(() => {
    const savedTheme = localStorage.getItem("beraxis_office_theme");
    if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("beraxis_office_theme", next);
  };

  useEffect(() => {
    if (!activeBranch) return;
    const key = getEntityStorageKey("documents_items");
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setDocuments(JSON.parse(saved));
      } catch {
        setDocuments([]);
      }
    } else {
      setDocuments([]);
    }
  }, [activeBranch?.id]);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML === "") {
      editorRef.current.innerHTML = DOC_TEMPLATES.proposal.html;
      setDocTitle(DOC_TEMPLATES.proposal.title);
      recomputeWordStats();
    }
  }, [studioMode]);

  const recomputeWordStats = () => {
    const text = editorRef.current?.innerText || "";
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    setWordStats({ words, chars: trimmed.length });
  };

  const exec = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    recomputeWordStats();
  };

  const insertTable = () => {
    const html = `<table border="1" style="width:100%;border-collapse:collapse;margin:12px 0;"><tr><th style="padding:8px;">Column A</th><th style="padding:8px;">Column B</th><th style="padding:8px;">Column C</th></tr><tr><td style="padding:8px;">Data 1</td><td style="padding:8px;">Data 2</td><td style="padding:8px;">Data 3</td></tr></table><p><br/></p>`;
    exec("insertHTML", html);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        exec("insertHTML", `<img src="${reader.result}" alt="Inserted" style="max-width:100%;border-radius:8px;margin:10px 0;" />`);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleImportDocx = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importDocxFile(file);
      setDocTitle(imported.title);
      setActiveDocId(null);
      if (editorRef.current) {
        editorRef.current.innerHTML = imported.html;
        recomputeWordStats();
      }
    } catch {
      alert("Could not parse .docx file.");
    }
    e.target.value = "";
  };

  const handleExportDocx = async () => {
    await exportDocxFile({
      title: docTitle,
      html: editorRef.current?.innerHTML || "",
      pageSize,
      orientation,
      margin: pageMargin,
      headerText,
      footerText,
    });
  };

  const handleAiDraft = async () => {
    const topic = window.prompt("What document should BERAXIS AI draft? (e.g. Client Partnership Proposal, NDA, Q4 Marketing Plan)");
    if (!topic) return;
    const res = await generateOfficeDoc(topic);
    setDocTitle(res.title);
    setActiveDocId(null);
    if (editorRef.current) {
      editorRef.current.innerHTML = res.html;
      recomputeWordStats();
    }
  };

  const handleFindReplaceAll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!findText || !editorRef.current) return;
    editorRef.current.innerHTML = editorRef.current.innerHTML.split(findText).join(replaceText);
    recomputeWordStats();
  };

  const loadTemplate = (key: keyof typeof DOC_TEMPLATES) => {
    const tpl = DOC_TEMPLATES[key];
    setDocTitle(tpl.title);
    setActiveDocId(null);
    if (editorRef.current) {
      editorRef.current.innerHTML = tpl.html;
      recomputeWordStats();
    }
  };

  const handleSaveToVault = () => {
    const html = editorRef.current?.innerHTML || "";
    const cleanName = docTitle.trim().endsWith(".docx") ? docTitle.trim() : `${docTitle.trim() || "Document"}.docx`;
    let updated: DocumentItem[];
    if (activeDocId) {
      updated = documents.map((d) =>
        d.id === activeDocId ? { ...d, name: cleanName, htmlContent: html, uploadedAt: new Date().toISOString().split("T")[0] } : d
      );
    } else {
      const newId = `doc-${Date.now()}`;
      setActiveDocId(newId);
      updated = [
        {
          id: newId,
          name: cleanName,
          folderId: selectedFolder === "f-all" ? "f-product" : selectedFolder,
          category: "product",
          extension: "docx",
          sizeMB: Number(Math.max(0.1, html.length / 1024 / 1024).toFixed(2)),
          uploadedBy: "BERAXIS Word Studio",
          uploadedAt: new Date().toISOString().split("T")[0],
          version: "v1.0",
          isEncrypted: true,
          tags: ["Word Doc", pageSize.toUpperCase()],
          sha256: `sha256-${Math.random().toString(36).slice(2, 10)}`,
          htmlContent: html,
        },
        ...documents,
      ];
    }
    setDocuments(updated);
    try {
      const key = getEntityStorageKey("documents_items");
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFileName.trim()) return;
    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      name: uploadFileName.trim(),
      folderId: "f-finance",
      category: "finance",
      extension: uploadFileName.split(".").pop() || "pdf",
      sizeMB: 0.4,
      uploadedBy: "Workspace User",
      uploadedAt: new Date().toISOString().split("T")[0],
      version: "v1.0",
      isEncrypted: true,
      tags: ["Uploaded"],
      sha256: `sha256-${Math.random().toString(36).slice(2, 10)}`,
    };
    const updated = [newDoc, ...documents];
    setDocuments(updated);
    try {
      const key = getEntityStorageKey("documents_items");
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}
    setUploadFileName("");
    setIsUploadModalOpen(false);
  };

  const handleDeleteDoc = (id: string) => {
    const updated = documents.filter((d) => d.id !== id);
    setDocuments(updated);
    try {
      const key = getEntityStorageKey("documents_items");
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setFolders((prev) => [
      ...prev,
      { id: `f-${Date.now()}`, name: newFolderName.trim(), category: "product", filesCount: 0, color: "text-cyan-400 bg-cyan-500/10" },
    ]);
    setNewFolderName("");
    setIsNewFolderModalOpen(false);
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase());
    const matchesFolder = selectedFolder === "f-all" || doc.folderId === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const totalStorageUsed = documents.reduce((acc, d) => acc + d.sizeMB, 0).toFixed(1);
  const isLight = theme === "light";

  const sizeSpec = PAGE_SIZE_SPECS[pageSize];
  const marginSpec = MARGIN_SPECS[pageMargin];
  const pageWidthPx = orientation === "landscape" ? sizeSpec.heightPx : sizeSpec.widthPx;
  const pageMinHeightPx = orientation === "landscape" ? sizeSpec.widthPx : sizeSpec.heightPx;

  return (
    <div className={`flex flex-col h-screen ${isLight ? "bg-slate-100 text-slate-900" : "bg-[#0a0d14] text-white"}`}>
      <AppHeader title="BERAXIS Docs — Full Word Studio (.DOCX Import/Export & Page Setup)" />

      {/* Top Mode & Theme Bar */}
      <div className={`px-5 py-2 border-b flex flex-wrap items-center justify-between gap-3 print:hidden ${isLight ? "bg-white border-slate-200" : "bg-[#0e121c] border-gray-800"}`}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStudioMode("editor")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
              studioMode === "editor" ? "bg-blue-600 text-white" : isLight ? "bg-slate-100 text-slate-700" : "bg-white/5 text-gray-300"
            }`}
          >
            <FileText size={14} /> Word Processor ({pageSize.toUpperCase()} · {orientation})
          </button>
          <button
            onClick={() => setStudioMode("vault")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
              studioMode === "vault" ? "bg-purple-600 text-white" : isLight ? "bg-slate-100 text-slate-700" : "bg-white/5 text-gray-300"
            }`}
          >
            <Lock size={14} /> Encrypted Vault ({documents.length})
          </button>
        </div>

        <button
          onClick={toggleTheme}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer ${
            isLight ? "bg-slate-100 border-slate-300 text-slate-800" : "bg-white/5 border-white/15 text-gray-200"
          }`}
        >
          {isLight ? <Moon size={14} className="text-indigo-600" /> : <Sun size={14} className="text-amber-400" />}
          <span>{isLight ? "Dark Mode" : "Light Mode"}</span>
        </button>
      </div>

      {studioMode === "editor" ? (
        <div className="flex-1 flex overflow-hidden">
          <aside className={`w-64 border-r p-4 flex flex-col justify-between shrink-0 overflow-y-auto print:hidden ${isLight ? "bg-white border-slate-200" : "bg-[#0e121c] border-gray-800"}`}>
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Templates</span>
                  <button
                    onClick={() => {
                      setDocTitle("Untitled Document");
                      setActiveDocId(null);
                      if (editorRef.current) {
                        editorRef.current.innerHTML = "<h1>Untitled Document</h1><p>Start typing here...</p>";
                        recomputeWordStats();
                      }
                    }}
                    className="text-blue-500 text-xs font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus size={14} /> Blank
                  </button>
                </div>
                <div className="space-y-1.5">
                  <button onClick={() => loadTemplate("proposal")} className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold border cursor-pointer ${isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10"}`}>Enterprise Proposal</button>
                  <button onClick={() => loadTemplate("sop")} className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold border cursor-pointer ${isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10"}`}>SOP Checklist</button>
                  <button onClick={() => loadTemplate("minutes")} className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold border cursor-pointer ${isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10"}`}>Meeting Minutes</button>
                </div>
              </div>

              {/* Page Setup Quick Panel */}
              <div className="space-y-2.5 pt-3 border-t border-gray-700/30 text-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">Page Size &amp; Layout</span>
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Paper Size</label>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value as PageSizeKey)}
                    className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${isLight ? "bg-slate-50 border-slate-300" : "bg-[#111827] border-gray-700"}`}
                  >
                    {(Object.keys(PAGE_SIZE_SPECS) as PageSizeKey[]).map((k) => (
                      <option key={k} value={k}>{PAGE_SIZE_SPECS[k].label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button onClick={() => setOrientation("portrait")} className={`py-1.5 rounded-lg text-[11px] font-bold cursor-pointer ${orientation === "portrait" ? "bg-blue-600 text-white" : isLight ? "bg-slate-100" : "bg-white/5"}`}>Portrait</button>
                  <button onClick={() => setOrientation("landscape")} className={`py-1.5 rounded-lg text-[11px] font-bold cursor-pointer ${orientation === "landscape" ? "bg-blue-600 text-white" : isLight ? "bg-slate-100" : "bg-white/5"}`}>Landscape</button>
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Margins</label>
                  <select
                    value={pageMargin}
                    onChange={(e) => setPageMargin(e.target.value as PageMarginKey)}
                    className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${isLight ? "bg-slate-50 border-slate-300" : "bg-[#111827] border-gray-700"}`}
                  >
                    {(Object.keys(MARGIN_SPECS) as PageMarginKey[]).map((k) => (
                      <option key={k} value={k}>{MARGIN_SPECS[k].label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Line Spacing</label>
                  <select
                    value={lineHeight}
                    onChange={(e) => setLineHeight(e.target.value)}
                    className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${isLight ? "bg-slate-50 border-slate-300" : "bg-[#111827] border-gray-700"}`}
                  >
                    <option value="1.15">Compact (1.15)</option>
                    <option value="1.6">Standard (1.6)</option>
                    <option value="2.0">Double (2.0)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={`p-3 rounded-xl border text-[11px] mt-4 ${isLight ? "bg-blue-50 border-blue-200 text-blue-900" : "bg-blue-500/10 border-blue-500/20 text-blue-200"}`}>
              <div className="font-bold flex items-center gap-1.5 mb-1"><Sparkles size={13} className="text-blue-500" /> True .DOCX Support</div>
              <p className={isLight ? "text-slate-600" : "text-gray-400"}>
                Import &amp; export native `.docx` Word files with custom page sizes ({pageSize.toUpperCase()}) and margins.
              </p>
            </div>
          </aside>

          {/* Word Editor Main */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {/* Formatting Ribbon */}
            <div className={`border-b px-4 py-2.5 space-y-2 print:hidden ${isLight ? "bg-white border-slate-200" : "bg-[#0c111b] border-gray-800"}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border w-44 focus:outline-none ${isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-white/5 border-white/10 text-white"}`}
                  />
                  <select onChange={(e) => exec("formatBlock", e.target.value)} defaultValue="p" className={`px-2 py-1.5 rounded-lg text-xs border ${isLight ? "bg-slate-50 border-slate-300" : "bg-[#111827] border-gray-700"}`}>
                    <option value="p">Normal</option>
                    <option value="h1">Heading 1</option>
                    <option value="h2">Heading 2</option>
                    <option value="h3">Heading 3</option>
                  </select>
                  <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className={`px-2 py-1.5 rounded-lg text-xs border ${isLight ? "bg-slate-50 border-slate-300" : "bg-[#111827] border-gray-700"}`}>
                    <option value="Inter, sans-serif">Inter</option>
                    <option value="Georgia, serif">Georgia</option>
                    <option value="'Times New Roman', serif">Times New Roman</option>
                    <option value="Arial, sans-serif">Arial</option>
                    <option value="'Courier New', monospace">Courier New</option>
                  </select>
                  <button onClick={() => exec("bold")} className="p-1.5 rounded hover:bg-blue-500/20 cursor-pointer"><Bold size={14} /></button>
                  <button onClick={() => exec("italic")} className="p-1.5 rounded hover:bg-blue-500/20 cursor-pointer"><Italic size={14} /></button>
                  <button onClick={() => exec("underline")} className="p-1.5 rounded hover:bg-blue-500/20 cursor-pointer"><Underline size={14} /></button>
                  <button onClick={() => exec("strikeThrough")} className="p-1.5 rounded hover:bg-blue-500/20 cursor-pointer"><Strikethrough size={14} /></button>
                  <input type="color" onChange={(e) => exec("foreColor", e.target.value)} title="Text Color" className="w-6 h-6 rounded cursor-pointer bg-transparent border-0" />
                  <button onClick={() => exec("justifyLeft")} className="p-1.5 rounded hover:bg-blue-500/20 cursor-pointer"><AlignLeft size={14} /></button>
                  <button onClick={() => exec("justifyCenter")} className="p-1.5 rounded hover:bg-blue-500/20 cursor-pointer"><AlignCenter size={14} /></button>
                  <button onClick={() => exec("justifyRight")} className="p-1.5 rounded hover:bg-blue-500/20 cursor-pointer"><AlignRight size={14} /></button>
                  <button onClick={() => exec("insertUnorderedList")} className="p-1.5 rounded hover:bg-blue-500/20 cursor-pointer"><List size={14} /></button>
                  <button onClick={() => exec("insertOrderedList")} className="p-1.5 rounded hover:bg-blue-500/20 cursor-pointer"><ListOrdered size={14} /></button>
                  <button onClick={insertTable} className="p-1.5 rounded hover:bg-blue-500/20 cursor-pointer" title="Insert Table"><TableIcon size={14} /></button>
                  <label className="p-1.5 rounded hover:bg-blue-500/20 cursor-pointer" title="Upload Local Image">
                    <ImageIcon size={14} />
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  <button onClick={() => exec("insertHorizontalRule")} className="p-1.5 rounded hover:bg-blue-500/20 cursor-pointer" title="Divider"><Minus size={14} /></button>
                  <button onClick={() => setShowFindBar(!showFindBar)} className="p-1.5 rounded hover:bg-blue-500/20 cursor-pointer" title="Find & Replace"><Search size={14} /></button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button onClick={handleAiDraft} className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow">
                    <Sparkles size={13} /> <span>AI Draft</span>
                  </button>
                  <label className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer ${isLight ? "bg-slate-100 border-slate-300" : "bg-white/5 border-white/10"}`}>
                    <Upload size={13} className="text-cyan-500" /> <span>Import .DOCX</span>
                    <input type="file" accept=".docx" onChange={handleImportDocx} className="hidden" />
                  </label>
                  <button onClick={handleSaveToVault} className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer">
                    {savedNotice ? <Check size={13} /> : <Save size={13} />} <span>{savedNotice ? "Saved" : "Save"}</span>
                  </button>
                  <button onClick={handleExportDocx} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer">
                    <Download size={13} /> <span>Export .DOCX</span>
                  </button>
                  <button onClick={() => window.print()} className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 cursor-pointer ${isLight ? "border-slate-300" : "border-white/10"}`}>
                    <Printer size={13} /> <span>PDF</span>
                  </button>
                </div>
              </div>

              {showFindBar && (
                <form onSubmit={handleFindReplaceAll} className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-700/30 text-xs">
                  <input type="text" placeholder="Find text..." value={findText} onChange={(e) => setFindText(e.target.value)} className={`px-2.5 py-1 rounded border ${isLight ? "bg-slate-50 border-slate-300" : "bg-[#070a11] border-gray-700"}`} />
                  <input type="text" placeholder="Replace with..." value={replaceText} onChange={(e) => setReplaceText(e.target.value)} className={`px-2.5 py-1 rounded border ${isLight ? "bg-slate-50 border-slate-300" : "bg-[#070a11] border-gray-700"}`} />
                  <button type="submit" className="px-3 py-1 rounded bg-blue-600 text-white font-bold cursor-pointer">Replace All</button>
                </form>
              )}
            </div>

            {/* Resizable Page Canvas */}
            <div className={`flex-1 overflow-auto p-6 sm:p-10 ${isLight ? "bg-slate-200/70" : "bg-[#06080e]"}`}>
              <div
                style={{
                  width: `${pageWidthPx}px`,
                  minHeight: `${pageMinHeightPx}px`,
                  padding: `${marginSpec.px}px`,
                  fontFamily,
                  lineHeight,
                }}
                className={`mx-auto rounded-xl shadow-2xl flex flex-col justify-between transition-all ${
                  isLight ? "bg-white text-slate-900 border border-slate-300" : "bg-[#111726] text-gray-100 border border-gray-800"
                }`}
              >
                <input
                  type="text"
                  value={headerText}
                  onChange={(e) => setHeaderText(e.target.value)}
                  placeholder="Optional Page Header..."
                  className="w-full text-[11px] text-gray-400 bg-transparent border-b border-dashed border-gray-500/20 pb-2 mb-4 focus:outline-none"
                />

                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={recomputeWordStats}
                  className={`flex-1 focus:outline-none prose max-w-none ${isLight ? "" : "prose-invert"}`}
                />

                <input
                  type="text"
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  placeholder="Optional Page Footer..."
                  className="w-full text-[11px] text-gray-400 bg-transparent border-t border-dashed border-gray-500/20 pt-2 mt-6 focus:outline-none"
                />
              </div>
            </div>

            {/* Footer Metrics */}
            <div className={`border-t px-5 py-1.5 flex items-center justify-between text-[11px] font-mono print:hidden ${isLight ? "bg-white border-slate-200 text-slate-600" : "bg-[#0c111b] border-gray-800 text-gray-400"}`}>
              <span>{sizeSpec.label} • {orientation} • {marginSpec.label}</span>
              <div className="flex items-center gap-4">
                <span>Words: <strong>{wordStats.words}</strong></span>
                <span>Characters: <strong>{wordStats.chars}</strong></span>
              </div>
            </div>
          </main>
        </div>
      ) : (
        /* VAULT MODE */
        <div className="flex-1 flex overflow-hidden">
          <div className={`w-64 border-r p-4 flex flex-col justify-between shrink-0 ${isLight ? "bg-white border-slate-200" : "bg-[#0e121c] border-gray-800"}`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-700/30">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Vault Folders</span>
                <button onClick={() => setIsNewFolderModalOpen(true)} className="text-purple-400 p-1 rounded cursor-pointer"><Plus size={16} /></button>
              </div>
              <div className="space-y-1">
                {folders.map((fold) => (
                  <button
                    key={fold.id}
                    onClick={() => setSelectedFolder(fold.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
                      selectedFolder === fold.id ? "bg-purple-600 text-white" : isLight ? "text-slate-600 hover:bg-slate-100" : "text-gray-400 hover:bg-gray-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate"><Folder size={15} /><span className="truncate">{fold.name}</span></div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/20">
                      {documents.filter((d) => fold.id === "f-all" || d.folderId === fold.id).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className={`border p-3.5 rounded-xl space-y-2 ${isLight ? "bg-slate-50 border-slate-200" : "bg-gray-900/90 border-gray-800"}`}>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5"><HardDrive size={14} className="text-purple-400" /><span className="font-bold">Encrypted Vault</span></div>
                <span className="font-bold text-purple-400">{totalStorageUsed} MB</span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden p-5 space-y-4">
            <div className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${isLight ? "bg-white border-slate-200" : "bg-[#111622] border-gray-800"}`}>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search vault files..." className={`flex-1 max-w-md border rounded-lg px-3 py-1.5 text-xs ${isLight ? "bg-slate-50 border-slate-300" : "bg-gray-900 border-gray-700"}`} />
              <div className="flex items-center gap-2">
                <button onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")} className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-600/40 cursor-pointer">{viewMode === "grid" ? "List" : "Grid"}</button>
                <button onClick={() => setIsUploadModalOpen(true)} className="px-3.5 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"><Upload size={13} /> Upload</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2"}>
                {filteredDocs.map((doc) => (
                  <div key={doc.id} className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${isLight ? "bg-white border-slate-200" : "bg-[#111622] border-gray-800"}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      {doc.extension.includes("xls") ? <FileSpreadsheet className="text-emerald-400 shrink-0" size={22} /> : doc.extension.includes("png") ? <FileImage className="text-blue-400 shrink-0" size={22} /> : <FileCode className="text-purple-400 shrink-0" size={22} />}
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">{doc.name}</div>
                        <div className="text-[10px] text-gray-400">{doc.uploadedAt} • {doc.sizeMB} MB</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {doc.htmlContent && (
                        <button onClick={() => { setActiveDocId(doc.id); setDocTitle(doc.name.replace(/\.docx$/i, "")); setStudioMode("editor"); setTimeout(() => { if (editorRef.current && doc.htmlContent) { editorRef.current.innerHTML = doc.htmlContent; recomputeWordStats(); } }, 0); }} className="px-2 py-1 rounded bg-blue-600 text-white text-[10px] font-bold cursor-pointer">Edit</button>
                      )}
                      <button onClick={() => handleDeleteDoc(doc.id)} className="p-1.5 text-gray-400 hover:text-red-400 cursor-pointer"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleUploadSubmit} className="bg-[#111622] border border-gray-700 text-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold">Upload Document to Vault</h3>
            <input type="text" required value={uploadFileName} onChange={(e) => setUploadFileName(e.target.value)} placeholder="e.g. Q4_Audit.pdf" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsUploadModalOpen(false)} className="px-4 py-2 bg-gray-800 rounded-lg text-xs font-bold">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-purple-600 rounded-lg text-xs font-bold">Upload</button>
            </div>
          </form>
        </div>
      )}

      {isNewFolderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateFolder} className="bg-[#111622] border border-gray-700 text-white rounded-2xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-base font-bold">Create Vault Folder</h3>
            <input type="text" required value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="e.g. Tax Filings 2026" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsNewFolderModalOpen(false)} className="px-3 py-1.5 bg-gray-800 rounded-lg text-xs font-bold">Cancel</button>
              <button type="submit" className="px-4 py-1.5 bg-purple-600 rounded-lg text-xs font-bold">Create</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
