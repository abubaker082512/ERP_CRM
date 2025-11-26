"use client";

import DocumentsHeader from "@/components/documents/DocumentsHeader";
import { useEffect, useState } from "react";
import { Folder, File, MoreVertical, Plus } from "lucide-react";

type Document = {
    id: string;
    name: string;
    type: string;
    created_at: string;
};

export default function DocumentsPage() {
    const [docs, setDocs] = useState<Document[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [newType, setNewType] = useState("folder");

    useEffect(() => {
        fetch("http://localhost:8000/api/v1/documents/documents")
            .then((r) => r.json())
            .then(setDocs)
            .catch(console.error);
    }, []);

    const createDoc = async () => {
        if (!newName.trim()) return;
        const res = await fetch("http://localhost:8000/api/v1/documents/documents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newName, type: newType }),
        });
        if (res.ok) {
            const doc = await res.json();
            setDocs([...docs, doc]);
            setNewName("");
            setIsModalOpen(false);
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <DocumentsHeader />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-200">My Documents</h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded flex items-center gap-1"
                    >
                        <Plus size={16} /> New
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {docs.map((doc) => (
                        <div
                            key={doc.id}
                            className="bg-[#1E293B] border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer group flex flex-col items-center text-center"
                        >
                            <div className="mb-3 text-gray-400 group-hover:text-blue-400">
                                {doc.type === 'folder' ? <Folder size={48} fill="currentColor" className="text-gray-600 group-hover:text-blue-900/50" /> : <File size={48} />}
                            </div>
                            <p className="text-sm font-medium text-gray-200 truncate w-full">{doc.name}</p>
                            <p className="text-xs text-gray-500 mt-1">{new Date(doc.created_at).toLocaleDateString()}</p>
                        </div>
                    ))}
                    {docs.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No documents found. Upload or create one.
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-[#1E293B] rounded-lg p-6 w-full max-w-md border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">New Item</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
                                <select
                                    value={newType}
                                    onChange={(e) => setNewType(e.target.value)}
                                    className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-500"
                                >
                                    <option value="folder">Folder</option>
                                    <option value="file">File (Placeholder)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-500"
                                    placeholder="e.g. Project Specs"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-300 hover:text-white">Cancel</button>
                            <button onClick={createDoc} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
