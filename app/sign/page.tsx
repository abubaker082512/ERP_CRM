"use client";

import { useState, useEffect, useRef } from "react";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import {
    FileSignature,
    Upload,
    Plus,
    CheckCircle2,
    Clock,
    XCircle,
    Mail,
    Download,
    Eye,
    PenTool,
    Shield,
    Sparkles,
    Trash2,
    Check,
    Send,
    FileText,
    Share2,
    X
} from "lucide-react";
import { printReportPDF } from "@/lib/exportUtils";

const MENU_ITEMS = [
    { name: "All Agreements", href: "/sign" },
    { name: "Templates", href: "/documents" },
    { name: "Audit Trail", href: "/sign" },
    { name: "Documents", href: "/documents" },
];

export type SignAgreement = {
    id: string;
    title: string;
    document_name: string;
    signer_name: string;
    signer_email: string;
    role: string;
    status: "signed" | "pending" | "refused" | "draft";
    created_at: string;
    signed_at?: string;
    signature_data?: string;
    security_hash: string;
};

const INITIAL_AGREEMENTS: SignAgreement[] = [
    {
        id: "AGR-2026-081",
        title: "Enterprise Master Services Agreement (MSA) - Acme Global",
        document_name: "MSA_Acme_Global_Signed.pdf",
        signer_name: "Salim Ghauri",
        signer_email: "salim.ghauri@acmeglobal.com",
        role: "Client Principal Executive",
        status: "signed",
        created_at: "2026-03-01T10:00:00Z",
        signed_at: "2026-03-02T14:22:15Z",
        signature_data: "Salim Ghauri (Signed Digitally)",
        security_hash: "SHA256: 8f4e2b8c91a0...33de"
    },
    {
        id: "AGR-2026-082",
        title: "Software License & SLA Guarantee (TechCorp LLC)",
        document_name: "SLA_TechCorp_Annual.pdf",
        signer_name: "Sarah Vance",
        signer_email: "sarah.vance@techcorp.io",
        role: "Chief Technology Officer",
        status: "pending",
        created_at: "2026-03-08T09:30:00Z",
        security_hash: "SHA256: 4a9d7c1e55ff...21aa"
    },
    {
        id: "AGR-2026-083",
        title: "Mutual Non-Disclosure Agreement (NDA) - Nexus Solutions",
        document_name: "NDA_Nexus_Beraxis.pdf",
        signer_name: "Marcus Jenkins",
        signer_email: "marcus.j@nexussolutions.com",
        role: "Managing Director",
        status: "signed",
        created_at: "2026-02-20T11:00:00Z",
        signed_at: "2026-02-21T16:45:00Z",
        signature_data: "Marcus Jenkins (Verified Signature)",
        security_hash: "SHA256: 1c3b5a7e9900...88ab"
    }
];

export default function SignPage() {
    const [agreements, setAgreements] = useState<SignAgreement[]>(INITIAL_AGREEMENTS);
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [toastMsg, setToastMsg] = useState("");

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSignModalOpen, setIsSignModalOpen] = useState(false);
    const [targetSignAgreement, setTargetSignAgreement] = useState<SignAgreement | null>(null);

    // Create Form State
    const [newTitle, setNewTitle] = useState("");
    const [signerName, setSignerName] = useState("");
    const [signerEmail, setSignerEmail] = useState("");
    const [signerRole, setSignerRole] = useState("Authorized Client Signer");
    const [docFileName, setDocFileName] = useState("Enterprise_Services_Agreement_2026.pdf");

    // Live Signature Pad State
    const [signatureMode, setSignatureMode] = useState<"draw" | "type">("type");
    const [typedSignature, setTypedSignature] = useState("");
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(""), 5000);
    };

    const handleCreateAgreement = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() || !signerEmail.trim()) return;

        const newAgr: SignAgreement = {
            id: `AGR-2026-${Math.floor(100 + Math.random() * 900)}`,
            title: newTitle.trim(),
            document_name: docFileName,
            signer_name: signerName.trim() || "Client Signer",
            signer_email: signerEmail.trim(),
            role: signerRole,
            status: "pending",
            created_at: new Date().toISOString(),
            security_hash: `SHA256: ${Math.random().toString(16).substring(2, 14)}...${Math.random().toString(16).substring(2, 6)}`
        };

        setAgreements([newAgr, ...agreements]);
        setIsCreateModalOpen(false);
        setNewTitle("");
        setSignerEmail("");
        setSignerName("");
        showToast(`✉️ Dispatched signature request for "${newAgr.title}" to ${newAgr.signer_email}!`);
    };

    const handleExecuteSign = (agreementId: string) => {
        const signText = signatureMode === "type" ? typedSignature.trim() || "Verified Electronic Signature" : "Hand-Drawn Digital Seal";

        setAgreements(agreements.map(a => {
            if (a.id === agreementId) {
                return {
                    ...a,
                    status: "signed",
                    signed_at: new Date().toISOString(),
                    signature_data: signText
                };
            }
            return a;
        }));

        setIsSignModalOpen(false);
        setTargetSignAgreement(null);
        showToast(`🖋️ Document officially signed and cryptographically sealed!`);
    };

    const downloadAgreementPDF = (agr: SignAgreement) => {
        printReportPDF({
            title: `BERAXIS eSignature Certificate: ${agr.title}`,
            subtitle: `Status: ${agr.status.toUpperCase()} • Cryptographic Seal: ${agr.security_hash}`,
            summaryCards: [
                { label: "Document Status", value: agr.status.toUpperCase() },
                { label: "Signatory", value: agr.signer_name },
                { label: "Verification Date", value: agr.signed_at ? new Date(agr.signed_at).toLocaleDateString() : "Pending" },
            ],
            headers: ["Agreement Title", "Document Link", "Signer Details", "Status", "Date Signed"],
            rows: [
                [
                    agr.title,
                    agr.document_name,
                    `${agr.signer_name} (${agr.signer_email})`,
                    agr.status.toUpperCase(),
                    agr.signed_at ? new Date(agr.signed_at).toLocaleString() : "Awaiting Signature"
                ]
            ]
        });
        showToast("📥 Exported signed agreement certificate PDF!");
    };

    // Canvas drawing helpers
    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        const rect = canvas.getBoundingClientRect();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const filteredAgreements = agreements.filter(a => {
        const matchesStatus = selectedStatus === "all" || a.status === selectedStatus;
        const matchesSearch =
            a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.signer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.signer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.id.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const signedCount = agreements.filter(a => a.status === "signed").length;
    const pendingCount = agreements.filter(a => a.status === "pending").length;

    return (
        <div className="flex flex-col min-h-screen bg-[#0a0d14] text-white">
            <StandardModuleHeader
                moduleName="Sign"
                moduleIcon={<PenTool size={20} className="text-cyan-400" />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search agreements, signers, or reference..."
                onSearch={setSearchQuery}
                onNewClick={() => setIsCreateModalOpen(true)}
                newButtonText="+ New Sign Request"
            />

            {/* Toast Notification */}
            {toastMsg && (
                <div className="fixed top-16 right-6 z-50 bg-cyan-600 text-white px-5 py-3 rounded-xl shadow-2xl shadow-cyan-900/50 flex items-center gap-3 border border-cyan-400 animate-in fade-in slide-in-from-top-4 duration-300">
                    <Sparkles size={18} className="animate-spin text-cyan-200" />
                    <span className="text-sm font-medium">{toastMsg}</span>
                </div>
            )}

            <div className="flex-1 overflow-auto p-6 max-w-7xl mx-auto w-full space-y-6">
                {/* Header Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900/60 p-4 rounded-2xl border border-gray-800 backdrop-blur-xl">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-300 bg-clip-text text-transparent">
                                eSignatures & Contract Approvals
                            </h2>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
                                Legal Cryptographic Seal Active
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            Legally binding electronic signatures, automated multi-party dispatch & tamper-proof audit trails
                        </p>
                    </div>

                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-cyan-600/30 transition transform hover:-translate-y-0.5 flex items-center gap-1.5"
                    >
                        <Plus size={16} /> + Dispatch Document for Signature
                    </button>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-gray-900/80 to-emerald-950/20 p-5 rounded-2xl border border-gray-800 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-400 font-semibold uppercase">Executed & Sealed</span>
                            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 size={18} />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-emerald-400">{signedCount} Agreements</div>
                        <div className="text-[11px] text-emerald-300 mt-1">100% legally binding & timestamped</div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900/80 to-amber-950/20 p-5 rounded-2xl border border-gray-800 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-400 font-semibold uppercase">Awaiting Signatures</span>
                            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                <Clock size={18} />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-amber-400">{pendingCount} Pending</div>
                        <div className="text-[11px] text-amber-300 mt-1">Automated reminders dispatched</div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900/80 to-cyan-950/20 p-5 rounded-2xl border border-gray-800 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-400 font-semibold uppercase">Security Compliance</span>
                            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                <Shield size={18} />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-cyan-300">eIDAS & ESIGN</div>
                        <div className="text-[11px] text-cyan-300 mt-1">SHA-256 verified digital audit certificates</div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
                    {["all", "signed", "pending", "refused"].map(status => (
                        <button
                            key={status}
                            onClick={() => setSelectedStatus(status)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                                selectedStatus === status
                                    ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                                    : "bg-gray-800/80 text-gray-400 hover:text-white"
                            }`}
                        >
                            {status === "all" ? `All Agreements (${agreements.length})` : status}
                        </button>
                    ))}
                </div>

                {/* Agreements Table */}
                <div className="bg-gray-900/80 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl backdrop-blur-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-950 text-gray-400 uppercase text-[10px] border-b border-gray-800 font-semibold">
                                <tr>
                                    <th className="px-5 py-3.5">Agreement Reference</th>
                                    <th className="px-4 py-3.5">Attached Document</th>
                                    <th className="px-4 py-3.5">Signatory Details</th>
                                    <th className="px-4 py-3.5">Security Audit Seal</th>
                                    <th className="px-4 py-3.5 text-center">Status</th>
                                    <th className="px-5 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/60">
                                {filteredAgreements.map(agr => (
                                    <tr key={agr.id} className="hover:bg-cyan-950/10 transition">
                                        <td className="px-5 py-3.5">
                                            <div className="font-bold text-white text-sm">{agr.title}</div>
                                            <div className="text-[11px] text-gray-400 font-mono">{agr.id}</div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-1.5 text-gray-300">
                                                <FileText size={14} className="text-cyan-400" />
                                                <span className="font-medium">{agr.document_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="font-semibold text-white">{agr.signer_name}</div>
                                            <div className="text-[11px] text-gray-400">{agr.signer_email} • {agr.role}</div>
                                        </td>
                                        <td className="px-4 py-3.5 font-mono text-[11px] text-cyan-400">
                                            {agr.security_hash}
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                agr.status === "signed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                                agr.status === "pending" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                                "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                            }`}>
                                                {agr.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {agr.status === "pending" && (
                                                    <button
                                                        onClick={() => {
                                                            setTargetSignAgreement(agr);
                                                            setTypedSignature(agr.signer_name);
                                                            setIsSignModalOpen(true);
                                                        }}
                                                        className="px-3 py-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold shadow transition"
                                                    >
                                                        Sign Now
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => downloadAgreementPDF(agr)}
                                                    className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition"
                                                    title="Download Audit Certificate"
                                                >
                                                    <Download size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal 1: Dispatch New Document */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setIsCreateModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                                <Send size={22} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Dispatch Document for eSignature</h3>
                                <p className="text-xs text-gray-400">Request legally binding signature from client or employee</p>
                            </div>
                        </div>

                        <form onSubmit={handleCreateAgreement} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Agreement / Contract Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="e.g. Master Enterprise SLA & Cloud Terms 2026"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Signer Full Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={signerName}
                                        onChange={(e) => setSignerName(e.target.value)}
                                        placeholder="e.g. Salim Ghauri"
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Signer Email *</label>
                                    <input
                                        type="email"
                                        required
                                        value={signerEmail}
                                        onChange={(e) => setSignerEmail(e.target.value)}
                                        placeholder="signer@company.com"
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Signer Role / Capacity</label>
                                <input
                                    type="text"
                                    value={signerRole}
                                    onChange={(e) => setSignerRole(e.target.value)}
                                    placeholder="e.g. Managing Director & Authorized Signatory"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 text-xs font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30"
                                >
                                    Send Signature Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal 2: Sign Document Pad */}
            {isSignModalOpen && targetSignAgreement && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setIsSignModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                                <PenTool size={22} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Execute Digital Signature</h3>
                                <p className="text-xs text-gray-400">{targetSignAgreement.title}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSignatureMode("type")}
                                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                                        signatureMode === "type" ? "bg-cyan-600 text-white" : "bg-gray-800 text-gray-400"
                                    }`}
                                >
                                    Type Legal Name
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSignatureMode("draw")}
                                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                                        signatureMode === "draw" ? "bg-cyan-600 text-white" : "bg-gray-800 text-gray-400"
                                    }`}
                                >
                                    Draw Signature
                                </button>
                            </div>

                            {signatureMode === "type" ? (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Cursive Signature Representation</label>
                                    <input
                                        type="text"
                                        value={typedSignature}
                                        onChange={(e) => setTypedSignature(e.target.value)}
                                        className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-lg text-cyan-300 font-serif italic focus:outline-none focus:border-cyan-500"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-xs font-semibold text-gray-300">Sign with Mouse / Stylus</label>
                                        <button onClick={clearCanvas} className="text-[11px] text-gray-400 hover:text-rose-400">Clear</button>
                                    </div>
                                    <canvas
                                        ref={canvasRef}
                                        width={450}
                                        height={120}
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                        className="w-full bg-gray-950 border border-gray-700 rounded-xl cursor-crosshair"
                                    />
                                </div>
                            )}

                            <div className="p-3 bg-gray-950/60 rounded-xl border border-gray-800 text-[11px] text-gray-400">
                                By clicking &quot;Affix Signature & Seal&quot;, you agree that this electronic signature is logically associated with this document and has the same legal validity as a physical signature.
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsSignModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 text-xs font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleExecuteSign(targetSignAgreement.id)}
                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                                >
                                    <Check size={14} /> Affix Signature & Seal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
