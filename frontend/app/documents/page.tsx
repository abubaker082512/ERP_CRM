"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { useState } from "react";
import { FileText, Folder, Share2, Settings, Image, FileSpreadsheet } from "lucide-react";

const MENU_ITEMS = [
    { name: "Documents", href: "/documents" },
    { name: "Shares", href: "/documents/shares" },
    { name: "Reporting", href: "/documents/reporting" },
    { name: "Configuration", href: "/documents/configuration" },
];

type Document = {
    id: string;
    name: string;
    type: string;
    size: string;
    owner: string;
    modified: string;
    tags: string[];
};

const mockDocuments: Document[] = [
    { id: "DOC/001", name: "Project Proposal.pdf", type: "pdf", size: "2.5 MB", owner: "John Doe", modified: "2025-12-01", tags: ["Sales", "Proposal"] },
    { id: "DOC/002", name: "Financial Report Q4.xlsx", type: "xlsx", size: "1.2 MB", owner: "Jane Smith", modified: "2025-12-02", tags: ["Finance", "Q4"] },
    { id: "DOC/003", name: "Office Layout.png", type: "image", size: "4.8 MB", owner: "Bob Wilson", modified: "2025-11-28", tags: ["Admin", "Office"] },
];

export default function DocumentsPage() {
    const [documents] = useState<Document[]>(mockDocuments);
    const [currentView, setCurrentView] = useState<ViewType>("kanban");

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Documents"
                moduleIcon={<FileText size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search documents..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-200">Documents</h2>
                            <p className="text-sm text-gray-400 mt-1">{documents.length} files • 8.5 MB used</p>
                        </div>
                        <ViewSwitcher
                            currentView={currentView}
                            availableViews={["list", "kanban"]}
                            onViewChange={setCurrentView}
                        />
                    </div>
                </div>

                {currentView === "list" && (
                    <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-[#0F172A] border-b border-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Name</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Owner</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Type</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Size</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Modified</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Tags</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documents.map(doc => (
                                    <tr key={doc.id} className="border-b border-gray-700 hover:bg-[#1E293B] transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {doc.type === 'pdf' ? <FileText size={16} className="text-red-400" /> :
                                                    doc.type === 'xlsx' ? <FileSpreadsheet size={16} className="text-green-400" /> :
                                                        <Image size={16} className="text-blue-400" />}
                                                <span className="font-medium text-white">{doc.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-300">{doc.owner}</td>
                                        <td className="px-4 py-3 text-gray-400 uppercase text-xs">{doc.type}</td>
                                        <td className="px-4 py-3 text-gray-400">{doc.size}</td>
                                        <td className="px-4 py-3 text-gray-400">{new Date(doc.modified).toLocaleDateString()}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">
                                                {doc.tags.map(tag => (
                                                    <span key={tag} className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button className="text-blue-400 hover:text-blue-300 text-sm">Download</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {currentView === "kanban" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {documents.map(doc => (
                            <div key={doc.id} className="bg-[#1E293B] border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-all group cursor-pointer">
                                <div className="aspect-[4/3] bg-gray-800 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                                    {doc.type === 'pdf' ? <FileText size={48} className="text-gray-600 group-hover:text-red-400 transition-colors" /> :
                                        doc.type === 'xlsx' ? <FileSpreadsheet size={48} className="text-gray-600 group-hover:text-green-400 transition-colors" /> :
                                            <Image size={48} className="text-gray-600 group-hover:text-blue-400 transition-colors" />}
                                </div>

                                <h3 className="font-medium text-white truncate mb-1" title={doc.name}>{doc.name}</h3>
                                <div className="flex justify-between text-xs text-gray-400 mb-2">
                                    <span>{doc.size}</span>
                                    <span>{new Date(doc.modified).toLocaleDateString()}</span>
                                </div>

                                <div className="flex flex-wrap gap-1">
                                    {doc.tags.map(tag => (
                                        <span key={tag} className="px-1.5 py-0.5 bg-gray-700 rounded text-[10px] text-gray-300">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
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
