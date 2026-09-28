"use client";
import { fetchAPI } from "@/lib/api";
import { useState, useEffect } from "react";
import AppHeader from "@/components/layout/AppHeader";
import { FileSignature, Upload, Plus, CheckCircle, Clock, XCircle, Mail } from "lucide-react";

export default function SignPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await fetchAPI("/sign/requests");
      if (res.ok) setRequests(await res.json());
    } finally { setLoading(false); }
  };

  const createRequest = async () => {
    if (!newTitle.trim() || !file) return;
    setUploading(true);
    try {
      // Quick file upload to documents first
      const formData = new FormData();
      formData.append("file", file);
      const docRes = await fetchAPI("/documents/upload", { method: "POST", body: formData });
      
      let fileUrl = "";
      if (docRes.ok) {
        const docData = await docRes.json();
        fileUrl = docData.file_url || docData.url;
      }

      // Then create the sign request
      const res = await fetchAPI("/sign/requests", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, document_url: fileUrl, signers: [{ name: "Signer 1", role: "Client" }] })
      });
      if (res.ok) {
        setNewTitle("");
        setFile(null);
        setIsModalOpen(false);
        loadData();
      }
    } finally { setUploading(false); }
  };

  const actionReq = async (id: string, action: "sign" | "refuse") => {
    await fetchAPI(`/sign/requests/${id}/${action}`, { method: "POST" });
    loadData();
  };

  return (
    <div className="flex flex-col h-screen">
      <AppHeader title="eSignatures" />

      <div className="flex-1 overflow-auto p-6 max-w-6xl mx-auto w-full">
        {/* Toolbar */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileSignature className="text-blue-500" /> Signature Requests
            </h1>
          </div>
          <button onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-600/20 active:scale-95">
            <Plus size={16} /> New Request
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map(req => (
              <div key={req.id} className="galaxy-card p-6 flex flex-col h-full shadow-sm hover:border-blue-500/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">{req.title}</h3>
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${
                    req.state === "signed" ? "bg-green-500/20 text-green-400 border-green-500/30" : 
                    req.state === "refused" ? "bg-red-500/20 text-red-400 border-red-500/30" : 
                    "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                  }`}>
                    {req.state}
                  </span>
                </div>
                
                <div className="flex-1">
                  {req.document_url ? (
                    <a href={req.document_url} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline flex items-center gap-1 mb-4">
                      <FileSignature size={12} /> View Document
                    </a>
                  ) : (
                    <p className="text-xs text-gray-500 mb-4">No document attached.</p>
                  )}

                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider font-semibold">Signers</p>
                    {(req.signers || []).map((s: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                        <Mail size={12} className="text-gray-500" /> {s.name} ({s.role})
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between">
                  {req.state === "sent" || req.state === "draft" ? (
                    <>
                      <button onClick={() => actionReq(req.id, "refuse")} className="flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-300">
                        <XCircle size={14} /> Refuse
                      </button>
                      <button onClick={() => actionReq(req.id, "sign")} className="flex items-center gap-1 text-xs font-semibold text-green-400 hover:text-green-300 bg-green-500/10 px-3 py-1.5 rounded-md">
                        <CheckCircle size={14} /> Sign Now
                      </button>
                    </>
                  ) : (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={12} /> {req.signed_at ? new Date(req.signed_at).toLocaleString() : "Completed"}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {requests.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500">
                <FileSignature size={48} className="mx-auto mb-4 opacity-30" />
                <p>No signature requests found.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] rounded-2xl p-6 w-full max-w-md border border-gray-700 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-6">New Signature Request</h3>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Document Title</label>
                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#0F172A] border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" 
                  placeholder="e.g. NDA Agreement" />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">PDF Document</label>
                <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-xl p-6 cursor-pointer transition-colors bg-[#0F172A]">
                  <Upload size={20} className="text-gray-400" />
                  <span className="text-sm text-gray-300 font-medium">
                    {file ? file.name : "Click to upload file"}
                  </span>
                  <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white font-medium">Cancel</button>
              <button onClick={createRequest} disabled={uploading || !newTitle || !file} 
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-gray-700 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2">
                {uploading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
