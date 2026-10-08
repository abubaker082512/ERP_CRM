"use client";

import { useState, useEffect } from "react";
import AppHeader from "@/components/layout/AppHeader";
import { useBranchContext } from "@/lib/branchContext";
import { 
  Folder, 
  FileText, 
  Upload, 
  Plus, 
  Download, 
  Trash2, 
  Search, 
  Tag, 
  FileSpreadsheet, 
  FileImage, 
  FileCode, 
  Share2, 
  Lock, 
  ExternalLink, 
  Eye, 
  Clock, 
  Check, 
  HardDrive,
  Filter,
  Layers
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

export default function DocumentsPage() {
  const { activeBranch, getEntityStorageKey } = useBranchContext();
  const [folders, setFolders] = useState<FolderItem[]>(DEFAULT_FOLDERS);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>("f-all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Modals & Drawers
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [shareLinkDoc, setShareLinkDoc] = useState<DocumentItem | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // New File Upload Form
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadFolder, setUploadFolder] = useState("f-finance");
  const [uploadTags, setUploadTags] = useState("Confidential, Internal");
  const [uploadEncrypted, setUploadEncrypted] = useState(true);

  // New Folder Form
  const [newFolderName, setNewFolderName] = useState("");

  // Entity-scoped data loading
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

  const persistDocuments = (updated: DocumentItem[]) => {
    setDocuments(updated);
    try {
      const key = getEntityStorageKey("documents_items");
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFileName.trim()) return;

    const ext = uploadFileName.split(".").pop() || "pdf";
    const targetFolder = folders.find(f => f.id === uploadFolder) || folders[1];

    const newDoc: DocumentItem = {
      id: `DOC-${(1000 + documents.length + 1).toString()}`,
      name: uploadFileName,
      folderId: targetFolder.id,
      category: targetFolder.category,
      extension: ext.toLowerCase(),
      sizeMB: parseFloat((Math.random() * 4 + 0.5).toFixed(1)),
      uploadedBy: "Current User",
      uploadedAt: new Date().toISOString().split("T")[0],
      version: "v1.0",
      isEncrypted: uploadEncrypted,
      tags: uploadTags.split(",").map(t => t.trim()),
      sha256: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
    };

    const updated = [newDoc, ...documents];
    persistDocuments(updated);
    setFolders(folders.map(f => f.id === targetFolder.id ? { ...f, filesCount: f.filesCount + 1 } : f));
    setIsUploadModalOpen(false);
    setUploadFileName("");
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const newFold: FolderItem = {
      id: `f-${newFolderName.toLowerCase().replace(/\s+/g, "-")}`,
      name: newFolderName,
      category: "all",
      filesCount: 0,
      color: "text-purple-400 bg-purple-500/10"
    };

    setFolders([...folders, newFold]);
    setIsNewFolderModalOpen(false);
    setNewFolderName("");
  };

  const handleDeleteDoc = (docId: string) => {
    setDocuments(documents.filter(d => d.id !== docId));
    if (selectedDoc && selectedDoc.id === docId) setSelectedDoc(null);
  };

  const handleCopyShareLink = (docId: string) => {
    const link = `https://access.beraxis.online/doc/share/${docId}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const exportDocsCSV = () => {
    const headers = ["Document ID", "File Name", "Extension", "Folder", "Size (MB)", "Uploaded By", "Uploaded Date", "Version", "Encrypted", "SHA-256 Hash"];
    const rows = documents.map(d => [
      d.id,
      `"${d.name}"`,
      d.extension,
      d.folderId,
      d.sizeMB,
      `"${d.uploadedBy}"`,
      d.uploadedAt,
      d.version,
      d.isEncrypted ? "Yes" : "No",
      d.sha256
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `enterprise_documents_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileIcon = (ext: string) => {
    if (ext.includes("pdf")) return <FileText className="text-red-400" size={24} />;
    if (ext.includes("xls") || ext.includes("csv")) return <FileSpreadsheet className="text-emerald-400" size={24} />;
    if (ext.includes("png") || ext.includes("jpg") || ext.includes("svg")) return <FileImage className="text-blue-400" size={24} />;
    return <FileCode className="text-purple-400" size={24} />;
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) ||
                          doc.tags.some(t => t.toLowerCase().includes(search.toLowerCase())) ||
                          doc.uploadedBy.toLowerCase().includes(search.toLowerCase());
    const matchesFolder = selectedFolder === "f-all" || doc.folderId === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const totalStorageUsed = documents.reduce((acc, d) => acc + d.sizeMB, 0).toFixed(1);

  return (
    <div className="flex flex-col h-screen bg-[#0a0d14] text-white">
      <AppHeader title="Documents & Vault" />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Folders & Storage meter */}
        <div className="w-64 border-r border-gray-800 bg-[#0e121c] p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-800">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Vault Folders</span>
              <button
                onClick={() => setIsNewFolderModalOpen(true)}
                className="text-purple-400 hover:text-purple-300 p-1 hover:bg-purple-600/10 rounded"
                title="Create Folder"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Folders List */}
            <div className="space-y-1">
              {folders.map(fold => (
                <button
                  key={fold.id}
                  onClick={() => setSelectedFolder(fold.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedFolder === fold.id
                      ? "bg-purple-600 text-white shadow-md shadow-purple-900/40"
                      : "text-gray-400 hover:bg-gray-800/60 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Folder size={15} className={selectedFolder === fold.id ? "text-white" : "text-purple-400"} />
                    <span className="truncate">{fold.name}</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    selectedFolder === fold.id ? "bg-purple-800 text-white" : "bg-gray-800 text-gray-400"
                  }`}>
                    {documents.filter(d => fold.id === "f-all" || d.folderId === fold.id).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Storage Quota Usage */}
          <div className="bg-gray-900/90 border border-gray-800 p-3.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-gray-300">
                <HardDrive size={14} className="text-purple-400" />
                <span className="font-bold">Encrypted Vault</span>
              </div>
              <span className="font-bold text-purple-400">{totalStorageUsed} MB</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-purple-500 h-1.5 rounded-full transition-all"
                style={{ width: `${Math.min(100, (parseFloat(totalStorageUsed) / 500) * 100)}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-gray-500">{totalStorageUsed} MB of 500.0 MB utilized (AES-256)</p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0d14] p-5 space-y-4">
          {/* Top Search & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111622] p-3 rounded-xl border border-gray-800">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search files by name, tags, or author..."
                className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-800">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-2.5 py-1 rounded text-xs font-semibold ${viewMode === "grid" ? "bg-gray-800 text-white" : "text-gray-400"}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-2.5 py-1 rounded text-xs font-semibold ${viewMode === "list" ? "bg-gray-800 text-white" : "text-gray-400"}`}
                >
                  List
                </button>
              </div>

              <button
                onClick={exportDocsCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/80 hover:bg-gray-700 text-gray-200 rounded-lg text-xs font-semibold border border-gray-700 transition-all active:scale-95"
              >
                <Download size={13} /> Export CSV
              </button>

              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-lg shadow-purple-600/30 transition-all active:scale-95"
              >
                <Upload size={13} /> Upload Document
              </button>
            </div>
          </div>

          {/* Documents Content View */}
          <div className="flex-1 overflow-y-auto">
            {filteredDocs.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-800 rounded-2xl">
                <FileText size={40} className="mb-2 opacity-40 text-purple-400" />
                <p className="text-sm font-semibold">No documents found</p>
                <p className="text-xs text-gray-600 mt-1">Upload a file or select a different folder.</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredDocs.map(doc => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className="galaxy-card p-4 border border-gray-800 hover:border-purple-500/50 bg-[#111622] hover:bg-[#161c2d] rounded-xl transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="p-3 bg-gray-900 rounded-xl border border-gray-800">
                        {getFileIcon(doc.extension)}
                      </div>
                      <div className="flex items-center gap-1">
                        {doc.isEncrypted && (
                          <span title="AES-256 Encrypted" className="p-1 bg-emerald-500/10 text-emerald-400 rounded">
                            <Lock size={12} />
                          </span>
                        )}
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">
                          {doc.version}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                        {doc.name}
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-1">
                        {doc.sizeMB} MB • Uploaded {doc.uploadedAt}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {doc.tags.map((t, idx) => (
                        <span key={idx} className="text-[9px] font-semibold bg-gray-900 text-gray-400 px-2 py-0.5 rounded border border-gray-800">
                          #{t}
                        </span>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setShareLinkDoc(doc)}
                        className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-[11px] font-semibold"
                      >
                        <Share2 size={12} /> Share
                      </button>
                      <button
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="text-gray-500 hover:text-red-400 p-1"
                        title="Delete Document"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="galaxy-card bg-[#111622] rounded-xl border border-gray-800 overflow-hidden">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-gray-900/90 text-gray-400 uppercase text-[11px] font-bold border-b border-gray-800 tracking-wider">
                    <tr>
                      <th className="px-4 py-3">File Name</th>
                      <th className="px-4 py-3">Size</th>
                      <th className="px-4 py-3">Version</th>
                      <th className="px-4 py-3">Uploaded By</th>
                      <th className="px-4 py-3">Upload Date</th>
                      <th className="px-4 py-3">Security</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {filteredDocs.map(doc => (
                      <tr
                        key={doc.id}
                        onClick={() => setSelectedDoc(doc)}
                        className="hover:bg-gray-800/40 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3 flex items-center gap-2.5 font-semibold text-white">
                          {getFileIcon(doc.extension)}
                          <span>{doc.name}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">{doc.sizeMB} MB</td>
                        <td className="px-4 py-3 text-xs font-mono text-purple-400">{doc.version}</td>
                        <td className="px-4 py-3 text-xs text-gray-300">{doc.uploadedBy}</td>
                        <td className="px-4 py-3 text-xs text-gray-400">{doc.uploadedAt}</td>
                        <td className="px-4 py-3">
                          {doc.isEncrypted ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              AES-256
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-500">Standard</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setShareLinkDoc(doc)}
                              className="p-1 text-purple-400 hover:text-white"
                              title="Share"
                            >
                              <Share2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteDoc(doc.id)}
                              className="p-1 text-gray-500 hover:text-red-400"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DOCUMENT PREVIEW DRAWER MODAL */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-gray-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-start border-b border-gray-800 pb-3">
              <div className="flex items-center gap-3">
                {getFileIcon(selectedDoc.extension)}
                <div>
                  <h3 className="text-base font-bold text-white">{selectedDoc.name}</h3>
                  <p className="text-xs text-gray-400">{selectedDoc.sizeMB} MB • {selectedDoc.version}</p>
                </div>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-800 space-y-2 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Document ID:</span>
                <span className="font-mono text-white">{selectedDoc.id}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Uploaded By:</span>
                <span className="text-white">{selectedDoc.uploadedBy}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Upload Timestamp:</span>
                <span className="text-white">{selectedDoc.uploadedAt}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Cryptographic SHA-256:</span>
                <span className="font-mono text-[10px] text-purple-400 truncate max-w-[200px]">{selectedDoc.sha256}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                onClick={() => setShareLinkDoc(selectedDoc)}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-purple-300 rounded-lg text-xs font-bold"
              >
                <Share2 size={14} /> Create Public Share Link
              </button>
              <button
                onClick={() => alert(`Downloading simulated ${selectedDoc.name}`)}
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-lg shadow-purple-600/30"
              >
                <Download size={14} /> Download File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHARE LINK MODAL */}
      {shareLinkDoc && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-gray-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Share2 size={18} className="text-purple-400" /> Shareable Secure Link
            </h3>
            <p className="text-xs text-gray-400">
              Anyone with this link can view <strong className="text-white">{shareLinkDoc.name}</strong> until expiration.
            </p>

            <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-lg p-2">
              <input
                readOnly
                value={`https://access.beraxis.online/doc/share/${shareLinkDoc.id}`}
                className="bg-transparent text-xs text-gray-200 flex-1 focus:outline-none font-mono"
              />
              <button
                onClick={() => handleCopyShareLink(shareLinkDoc.id)}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-bold flex items-center gap-1"
              >
                {copiedLink ? <Check size={12} /> : "Copy"}
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShareLinkDoc(null)}
                className="px-4 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD FILE MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleUploadSubmit} className="bg-[#111622] border border-gray-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Upload size={20} className="text-purple-400" /> Upload Document to Vault
            </h3>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">File Name with Extension *</label>
              <input
                type="text"
                required
                value={uploadFileName}
                onChange={e => setUploadFileName(e.target.value)}
                placeholder="e.g. Q4_Executive_Summary.pdf"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Destination Folder</label>
                <select
                  value={uploadFolder}
                  onChange={e => setUploadFolder(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  {folders.filter(f => f.id !== "f-all").map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={uploadTags}
                  onChange={e => setUploadTags(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="enc-chk"
                checked={uploadEncrypted}
                onChange={e => setUploadEncrypted(e.target.checked)}
                className="rounded bg-gray-900 border-gray-700 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="enc-chk" className="text-xs text-gray-300 font-semibold cursor-pointer">
                Apply AES-256 Vault Encryption & Generate Checksum
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 bg-gray-800 text-gray-300 hover:text-white rounded-lg text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-lg shadow-purple-600/30"
              >
                Upload File
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE FOLDER MODAL */}
      {isNewFolderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateFolder} className="bg-[#111622] border border-gray-700 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Folder size={18} className="text-purple-400" /> Create New Vault Folder
            </h3>
            <input
              type="text"
              required
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              placeholder="e.g. Tax Filings 2026"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNewFolderModalOpen(false)}
                className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
