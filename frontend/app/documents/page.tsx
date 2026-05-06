"use client";
import { fetchAPI } from "@/lib/api";
import { useState, useEffect } from "react";
import AppHeader from "@/components/layout/AppHeader";
import { Folder, FileText, Upload, Plus, Download, Trash2, Search, Tag } from "lucide-react";

export default function DocumentsPage() {
  const [folders, setFolders] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  useEffect(() => { loadData(); }, [currentFolder, search]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (!search && !currentFolder) {
        const foldRes = await fetchAPI("/documents/folders");
        if (foldRes.ok) setFolders(await foldRes.json());
      }

      let url = "/documents/documents?";
      if (currentFolder) url += `folder_id=${currentFolder}&`;
      if (search) url += `search=${search}&`;

      const docRes = await fetchAPI(url);
      if (docRes.ok) setDocuments(await docRes.json());
    } finally { setLoading(false); }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    await fetchAPI("/documents/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newFolderName, folder_id: currentFolder })
    });
    setNewFolderName("");
    setIsFolderModalOpen(false);
    loadData();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (currentFolder) formData.append("folder_id", currentFolder);

      const res = await fetchAPI("/documents/upload", { method: "POST", body: formData }, true);
      if (res.ok) loadData();
    } finally { setUploading(false); }
  };

  const deleteDoc = async (id: string, isFolder = false) => {
    if (!confirm(`Delete this ${isFolder ? "folder and all its contents" : "document"}?`)) return;
    await fetchAPI(`/documents/documents/${id}`, { method: "DELETE" });
    loadData();
  };

  return (
    <div className="flex flex-col h-screen">
      <AppHeader title="Documents" />

      <div className="flex-1 overflow-auto p-6 max-w-7xl mx-auto w-full">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            {currentFolder && (
              <button onClick={() => setCurrentFolder(null)} className="text-gray-400 hover:text-white px-2 py-1 rounded bg-white/5 text-sm transition-colors">
                Back to root
              </button>
            )}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="text" placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-[#1E293B] border border-gray-700 rounded-lg text-sm text-white focus:border-indigo-500 outline-none w-64" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsFolderModalOpen(true)}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Folder size={16} /> New Folder
            </button>
            <label className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
              <Upload size={16} /> {uploading ? "Uploading..." : "Upload File"}
              <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
            </label>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {/* Folders (only in root or if not searching) */}
            {!search && !currentFolder && folders.map(f => (
              <div key={f.id} onClick={() => setCurrentFolder(f.id)}
                className="bg-[#1E293B] border border-gray-700 hover:border-indigo-500 rounded-xl p-4 cursor-pointer transition-all group relative flex flex-col items-center justify-center aspect-square shadow-sm">
                <Folder size={48} className="text-indigo-400 mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-white text-center truncate w-full px-2">{f.name}</p>
                <button onClick={(e) => { e.stopPropagation(); deleteDoc(f.id, true); }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-400 hover:bg-red-500/20 p-1.5 rounded transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            {/* Documents */}
            {documents.map(d => (
              <div key={d.id}
                className="bg-[#1E293B] border border-gray-700 hover:border-gray-500 rounded-xl p-4 transition-all group relative flex flex-col items-center justify-center aspect-square shadow-sm">
                {d.mimetype?.includes("image") ? (
                  <div className="w-16 h-16 rounded mb-3 overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
                    <img src={d.file_url} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <FileText size={48} className="text-gray-400 mb-3 group-hover:text-white transition-colors" />
                )}
                <p className="text-xs font-medium text-white text-center truncate w-full px-1">{d.name}</p>
                <p className="text-[10px] text-gray-500 mt-1">{(d.file_size / 1024).toFixed(1)} KB</p>
                
                {/* Actions overlay */}
                <div className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity backdrop-blur-[1px]">
                  <a href={d.file_url} target="_blank" rel="noreferrer"
                    className="bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors" title="Download">
                    <Download size={16} />
                  </a>
                  <button onClick={() => deleteDoc(d.id)}
                    className="bg-red-500/20 hover:bg-red-500/50 text-red-400 p-2 rounded-full transition-colors" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            {folders.length === 0 && documents.length === 0 && (
              <div className="col-span-full py-20 text-center text-gray-500">
                <Folder size={48} className="mx-auto text-gray-600 mb-4 opacity-50" />
                <p>This folder is empty. Upload files or create folders.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Folder Modal */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1E293B] rounded-xl p-6 w-full max-w-sm border border-gray-700 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Create Folder</h3>
            <input type="text" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full bg-[#0F172A] border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none mb-6" placeholder="Folder Name" />
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsFolderModalOpen(false)} className="px-4 py-2 text-gray-300 hover:text-white text-sm font-medium">Cancel</button>
              <button onClick={createFolder} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
