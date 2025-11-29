"use client";

import SignHeader from "@/components/sign/SignHeader";
import { useEffect, useState } from "react";
import { Plus, FileText, Send } from "lucide-react";

type Request = {
    id: string;
    title: string;
    state: string;
};

export default function SignPage() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTitle, setNewTitle] = useState("");

    useEffect(() => {
        fetch("http://localhost:8000/api/v1/sign/requests")
            .then((r) => r.json())
            .then(setRequests)
            .catch(console.error);
    }, []);

    const createRequest = async () => {
        if (!newTitle.trim()) return;

        const res = await fetch("http://localhost:8000/api/v1/sign/requests", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newTitle }),
        });
        if (res.ok) {
            const req = await res.json();
            setRequests([...requests, req]);
            setNewTitle("");
            setIsModalOpen(false);
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <SignHeader />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-200">Signature Requests</h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded flex items-center gap-1"
                    >
                        <Plus size={16} /> New Request
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {requests.map((req) => (
                        <div
                            key={req.id}
                            className="bg-[#1E293B] border border-gray-700 rounded-lg p-6 hover:border-green-500 transition-colors"
                        >
                            <div className="flex items-start gap-3 mb-4">
                                <div className="bg-green-500/20 p-2 rounded text-green-500">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h3 className="font-medium text-white">{req.title}</h3>
                                    <p className="text-xs text-gray-400 mt-1">Waiting for signature</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
                                <span className="text-xs font-bold uppercase text-blue-400">{req.state}</span>
                                <button className="text-sm text-green-400 hover:text-green-300 flex items-center gap-1">
                                    <Send size={14} /> Resend
                                </button>
                            </div>
                        </div>
                    ))}

                    {requests.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No signature requests found. Upload a document to get started.
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-[#1E293B] rounded-lg p-6 w-full max-w-md border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">New Signature Request</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Document Title</label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-green-500"
                                    placeholder="e.g. NDA Agreement"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-300 hover:text-white">Cancel</button>
                            <button onClick={createRequest} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
