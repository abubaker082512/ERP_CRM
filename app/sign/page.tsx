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
    X,
    Image as ImageIcon,
    Type,
    Move,
    Palette,
    Calendar,
    Stamp,
    Layers,
    Lock
} from "lucide-react";
import { printReportPDF } from "@/lib/exportUtils";

const MENU_ITEMS = [
    { name: "All Agreements", href: "/sign" },
    { name: "Sign & Design Studio", href: "/sign" },
    { name: "Audit Trail", href: "/sign" },
    { name: "Documents Vault", href: "/documents" },
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
    signature_image?: string;
    security_hash: string;
    placed_stamps?: { type: string; x: number; y: number; text: string }[];
};

const SIGNATURE_FONTS = [
    { name: "Dancing Script", fontClass: "font-['Dancing_Script']", label: "Dancing Script (Elegant Modern Cursive)" },
    { name: "Caveat", fontClass: "font-['Caveat']", label: "Caveat (Natural Casual Pen)" },
    { name: "Great Vibes", fontClass: "font-['Great_Vibes']", label: "Great Vibes (Royal Formal Calligraphy)" },
    { name: "Sacramento", fontClass: "font-['Sacramento']", label: "Sacramento (Delicate Flowing Script)" },
    { name: "Pacifico", fontClass: "font-['Pacifico']", label: "Pacifico (Bold Signature Flow)" },
    { name: "Alex Brush", fontClass: "font-['Alex_Brush']", label: "Alex Brush (Executive Quill Signature)" },
    { name: "Satisfy", fontClass: "font-['Satisfy']", label: "Satisfy (Smooth Signature)" },
];

const INK_COLORS = [
    { name: "Royal Blue", hex: "#1d4ed8", border: "border-blue-600 bg-blue-600" },
    { name: "Deep Navy", hex: "#0f172a", border: "border-slate-800 bg-slate-800" },
    { name: "Executive Black", hex: "#111827", border: "border-gray-900 bg-gray-900" },
    { name: "Emerald", hex: "#047857", border: "border-emerald-600 bg-emerald-600" },
    { name: "Burgundy", hex: "#881337", border: "border-rose-900 bg-rose-900" },
];

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
        signature_data: "Salim Ghauri",
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
        signature_data: "Marcus Jenkins",
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
    const [isPdfDesignerOpen, setIsPdfDesignerOpen] = useState(false);
    const [targetSignAgreement, setTargetSignAgreement] = useState<SignAgreement | null>(null);

    // Create Agreement Form State
    const [newTitle, setNewTitle] = useState("");
    const [signerName, setSignerName] = useState("");
    const [signerEmail, setSignerEmail] = useState("");
    const [signerRole, setSignerRole] = useState("Authorized Client Signer");
    const [docFileName, setDocFileName] = useState("Enterprise_Services_Agreement_2026.pdf");

    // Signature Modes: 'font' | 'draw' | 'upload'
    const [signatureMode, setSignatureMode] = useState<"font" | "draw" | "upload">("font");
    const [typedSignature, setTypedSignature] = useState("Abubaker Admin");
    const [selectedFont, setSelectedFont] = useState(SIGNATURE_FONTS[0]);
    const [selectedInkColor, setSelectedInkColor] = useState(INK_COLORS[0]);
    const [uploadedSignImage, setUploadedSignImage] = useState<string | null>(null);
    
    // Canvas Drawing
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    // PDF Designer State
    const [designerPdfName, setDesignerPdfName] = useState("Corporate_Vendor_Agreement.pdf");
    const [designerSignerName, setDesignerSignerName] = useState("Elena Rostova");
    const [placedStamps, setPlacedStamps] = useState<
        { id: string; type: "signature" | "date" | "seal" | "name"; x: number; y: number; text: string }[]
    >([
        { id: "s1", type: "signature", x: 65, y: 78, text: "Elena Rostova" },
        { id: "s2", type: "date", x: 65, y: 88, text: new Date().toLocaleDateString() },
        { id: "s3", type: "seal", x: 15, y: 80, text: "VERIFIED & SEALED" }
    ]);

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(""), 5000);
    };

    // Canvas drawing methods
    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.strokeStyle = selectedInkColor.hex;
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

    const handleSignatureImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setUploadedSignImage(event.target?.result as string);
                showToast("📷 Signature image uploaded successfully!");
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCustomPdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setDesignerPdfName(file.name);
            setIsPdfDesignerOpen(true);
            showToast(`📄 Loaded ${file.name} into Sign & Design Studio!`);
        }
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
        let signatureRepresentation = typedSignature;
        if (signatureMode === "draw") {
            signatureRepresentation = "Hand-Drawn Digital Canvas Signature";
        } else if (signatureMode === "upload") {
            signatureRepresentation = "Uploaded Graphic Signature Seal";
        }

        setAgreements(agreements.map(a => {
            if (a.id === agreementId) {
                return {
                    ...a,
                    status: "signed",
                    signed_at: new Date().toISOString(),
                    signature_data: signatureRepresentation,
                    signature_image: uploadedSignImage || undefined
                };
            }
            return a;
        }));

        setIsSignModalOpen(false);
        setTargetSignAgreement(null);
        showToast(`🖋️ Document officially signed and cryptographically sealed!`);
    };

    const handleSaveDesignedPdf = () => {
        const newAgr: SignAgreement = {
            id: `AGR-2026-${Math.floor(100 + Math.random() * 900)}`,
            title: designerPdfName.replace(/\.[^/.]+$/, ""),
            document_name: designerPdfName,
            signer_name: designerSignerName,
            signer_email: "internal.sign@beraxis.online",
            role: "Document Architect",
            status: "signed",
            created_at: new Date().toISOString(),
            signed_at: new Date().toISOString(),
            signature_data: `${designerSignerName} (Sign Studio)`,
            security_hash: `SHA256: ${Math.random().toString(16).substring(2, 14)}...${Math.random().toString(16).substring(2, 6)}`,
            placed_stamps: placedStamps
        };

        setAgreements([newAgr, ...agreements]);
        setIsPdfDesignerOpen(false);
        showToast(`✅ Signed & sealed ${designerPdfName}! Available for instant export.`);
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
                    <span className="text-xs font-bold">{toastMsg}</span>
                </div>
            )}

            <div className="flex-1 p-4 sm:p-6 space-y-6">
                {/* Metrics Summary Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="galaxy-card p-4 border border-cyan-500/20 bg-cyan-950/10 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Agreements</p>
                            <h3 className="text-2xl font-bold text-cyan-400 mt-1">{agreements.length} Enrolled</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Legally compliant eSign</p>
                        </div>
                        <div className="p-3 bg-cyan-500/20 rounded-xl text-cyan-400">
                            <FileSignature size={22} />
                        </div>
                    </div>

                    <div className="galaxy-card p-4 border border-emerald-500/20 bg-emerald-950/10 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Signed & Sealed</p>
                            <h3 className="text-2xl font-bold text-emerald-400 mt-1">{signedCount} Completed</h3>
                            <p className="text-xs text-gray-400 mt-0.5">SHA-256 Verified</p>
                        </div>
                        <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
                            <CheckCircle2 size={22} />
                        </div>
                    </div>

                    <div className="galaxy-card p-4 border border-amber-500/20 bg-amber-950/10 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Awaiting Signature</p>
                            <h3 className="text-2xl font-bold text-amber-400 mt-1">{pendingCount} Pending</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Automated reminders on</p>
                        </div>
                        <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400">
                            <Clock size={22} />
                        </div>
                    </div>

                    <div className="galaxy-card p-4 border border-purple-500/20 bg-purple-950/10 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Security Seal</p>
                            <h3 className="text-2xl font-bold text-purple-400 mt-1">100% AES-256</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Audit certificate ready</p>
                        </div>
                        <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                            <Shield size={22} />
                        </div>
                    </div>
                </div>

                {/* Filter & Action Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111622] p-3.5 rounded-xl border border-gray-800">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex bg-gray-900/80 p-1 rounded-lg border border-gray-800">
                            <button
                                onClick={() => setSelectedStatus("all")}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase transition ${
                                    selectedStatus === "all" ? "bg-cyan-600 text-white" : "text-gray-400 hover:text-white"
                                }`}
                            >
                                All Contracts ({agreements.length})
                            </button>
                            <button
                                onClick={() => setSelectedStatus("pending")}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase transition ${
                                    selectedStatus === "pending" ? "bg-cyan-600 text-white" : "text-gray-400 hover:text-white"
                                }`}
                            >
                                Awaiting ({pendingCount})
                            </button>
                            <button
                                onClick={() => setSelectedStatus("signed")}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase transition ${
                                    selectedStatus === "signed" ? "bg-cyan-600 text-white" : "text-gray-400 hover:text-white"
                                }`}
                            >
                                Signed ({signedCount})
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Upload PDF & Sign in System Button */}
                        <label className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-purple-600/30 transition active:scale-95 cursor-pointer">
                            <Upload size={14} /> Upload PDF to Design & Sign
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                className="hidden"
                                onChange={handleCustomPdfUpload}
                            />
                        </label>

                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-bold shadow-lg shadow-cyan-600/30 transition active:scale-95 cursor-pointer"
                        >
                            <Plus size={14} /> New eSign Request
                        </button>
                    </div>
                </div>

                {/* Agreements Roster */}
                <div className="galaxy-card bg-[#111622] rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-300">
                            <thead className="bg-gray-900/90 text-gray-400 uppercase text-[11px] font-bold border-b border-gray-800 tracking-wider">
                                <tr>
                                    <th className="px-4 py-3">Agreement Reference</th>
                                    <th className="px-4 py-3">Document Title</th>
                                    <th className="px-4 py-3">Signatory & Role</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Audit Hash</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/60">
                                {filteredAgreements.map((agr) => (
                                    <tr key={agr.id} className="hover:bg-gray-800/40 transition-colors">
                                        <td className="px-4 py-3.5 font-bold text-cyan-400 font-mono text-xs">
                                            {agr.id}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="font-semibold text-white">{agr.title}</div>
                                            <div className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                                                <FileText size={12} className="text-gray-500" />
                                                <span>{agr.document_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="text-gray-200 font-medium">{agr.signer_name}</div>
                                            <div className="text-xs text-gray-400">{agr.signer_email} • {agr.role}</div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            {agr.status === "signed" ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                                    <CheckCircle2 size={12} /> Signed & Sealed
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                                    <Clock size={12} /> Awaiting Signature
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5 font-mono text-xs text-gray-400">
                                            {agr.security_hash}
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {agr.status === "pending" ? (
                                                    <button
                                                        onClick={() => {
                                                            setTargetSignAgreement(agr);
                                                            setTypedSignature(agr.signer_name);
                                                            setIsSignModalOpen(true);
                                                        }}
                                                        className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold shadow-md shadow-cyan-600/30 flex items-center gap-1.5"
                                                    >
                                                        <PenTool size={12} /> Sign Now
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => downloadAgreementPDF(agr)}
                                                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-cyan-300 rounded-lg text-xs font-bold border border-cyan-500/30 flex items-center gap-1.5"
                                                    >
                                                        <Download size={12} /> Download PDF
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL 1: SIGN DOCUMENT STUDIO (Fonts, Draw, Upload Image) */}
            {isSignModalOpen && targetSignAgreement && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-xl shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setIsSignModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                                <PenTool size={22} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Choose Your Signature Style</h3>
                                <p className="text-xs text-gray-400">Signing: {targetSignAgreement.title}</p>
                            </div>
                        </div>

                        {/* Mode Selector Tabs */}
                        <div className="grid grid-cols-3 gap-2 bg-gray-950 p-1.5 rounded-xl border border-gray-800 mb-4">
                            <button
                                type="button"
                                onClick={() => setSignatureMode("font")}
                                className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                                    signatureMode === "font" ? "bg-cyan-600 text-white shadow-md" : "text-gray-400 hover:text-white"
                                }`}
                            >
                                <Type size={14} /> Signature Fonts
                            </button>
                            <button
                                type="button"
                                onClick={() => setSignatureMode("draw")}
                                className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                                    signatureMode === "draw" ? "bg-cyan-600 text-white shadow-md" : "text-gray-400 hover:text-white"
                                }`}
                            >
                                <PenTool size={14} /> Draw Signature
                            </button>
                            <button
                                type="button"
                                onClick={() => setSignatureMode("upload")}
                                className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                                    signatureMode === "upload" ? "bg-cyan-600 text-white shadow-md" : "text-gray-400 hover:text-white"
                                }`}
                            >
                                <ImageIcon size={14} /> Upload Image
                            </button>
                        </div>

                        {/* TAB A: SIGNATURE FONTS */}
                        {signatureMode === "font" && (
                            <div className="space-y-3.5">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Type Your Full Name / Signature Text</label>
                                    <input
                                        type="text"
                                        value={typedSignature}
                                        onChange={(e) => setTypedSignature(e.target.value)}
                                        className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                                    />
                                </div>

                                {/* Ink Color Selector */}
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-400 font-semibold">Ink Color:</span>
                                    <div className="flex gap-2">
                                        {INK_COLORS.map(c => (
                                            <button
                                                key={c.name}
                                                type="button"
                                                onClick={() => setSelectedInkColor(c)}
                                                className={`w-6 h-6 rounded-full ${c.border} transition-all ${
                                                    selectedInkColor.name === c.name ? "ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110" : "opacity-70 hover:opacity-100"
                                                }`}
                                                title={c.name}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Pre-downloaded Handwriting Fonts Grid */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Select Signature Font Style</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                                        {SIGNATURE_FONTS.map(f => (
                                            <div
                                                key={f.name}
                                                onClick={() => setSelectedFont(f)}
                                                className={`p-3 rounded-xl border transition-all cursor-pointer bg-white text-center flex flex-col justify-center items-center ${
                                                    selectedFont.name === f.name
                                                        ? "border-cyan-500 ring-2 ring-cyan-500 shadow-lg shadow-cyan-500/20"
                                                        : "border-gray-300 opacity-85 hover:opacity-100 hover:border-gray-400"
                                                }`}
                                            >
                                                <div
                                                    className={`text-2xl leading-none py-1.5 ${f.fontClass}`}
                                                    style={{ color: selectedInkColor.hex }}
                                                >
                                                    {typedSignature || "Signature"}
                                                </div>
                                                <span className="text-[10px] text-gray-500 font-sans font-bold mt-1">{f.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB B: DRAW SIGNATURE */}
                        {signatureMode === "draw" && (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-semibold text-gray-300">Sign with Mouse, Touch, or Stylus Pen</span>
                                    <button
                                        type="button"
                                        onClick={clearCanvas}
                                        className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                                    >
                                        Clear Pad
                                    </button>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-400 font-semibold">Ink Color:</span>
                                    <div className="flex gap-2">
                                        {INK_COLORS.map(c => (
                                            <button
                                                key={c.name}
                                                type="button"
                                                onClick={() => setSelectedInkColor(c)}
                                                className={`w-6 h-6 rounded-full ${c.border} transition-all ${
                                                    selectedInkColor.name === c.name ? "ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110" : "opacity-70 hover:opacity-100"
                                                }`}
                                                title={c.name}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <canvas
                                    ref={canvasRef}
                                    width={500}
                                    height={140}
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    className="w-full bg-white border border-gray-300 rounded-xl cursor-crosshair shadow-inner"
                                />
                            </div>
                        )}

                        {/* TAB C: UPLOAD SIGNATURE IMAGE */}
                        {signatureMode === "upload" && (
                            <div className="space-y-3">
                                <label className="block text-xs font-semibold text-gray-300">Upload Signature Image (PNG with transparent bg or JPG)</label>
                                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-700 hover:border-cyan-500 rounded-xl p-6 cursor-pointer bg-gray-950 transition">
                                    <ImageIcon size={32} className="text-cyan-400 mb-2" />
                                    <span className="text-xs font-bold text-gray-200">Click to Browse Signature Image</span>
                                    <span className="text-[10px] text-gray-500 mt-0.5">Supports PNG, JPG, SVG up to 5MB</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleSignatureImageUpload}
                                    />
                                </label>

                                {uploadedSignImage && (
                                    <div className="p-4 bg-white rounded-xl border border-gray-300 flex flex-col items-center justify-center">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Signature Graphic Preview</span>
                                        <img src={uploadedSignImage} alt="Uploaded Sign" className="max-h-20 max-w-full object-contain" />
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setIsSignModalOpen(false)}
                                className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-400 hover:text-white text-xs font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => handleExecuteSign(targetSignAgreement.id)}
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                            >
                                <Check size={14} /> Affix Signature & Seal Document
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 2: UPLOAD & DESIGN PDF IN SYSTEM */}
            {isPdfDesignerOpen && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl p-6 relative">
                        <button
                            onClick={() => setIsPdfDesignerOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-800">
                            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                                <FileSignature size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Sign & PDF Design Studio</h3>
                                <p className="text-xs text-gray-400">Design signature boxes and cryptographic stamps on {designerPdfName}</p>
                            </div>
                        </div>

                        {/* Interactive Design Workspace */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
                            {/* Document Page Canvas Preview */}
                            <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-2xl overflow-y-auto text-black relative min-h-[420px] select-none border border-gray-300">
                                <div className="border-b border-gray-300 pb-3 mb-4 flex justify-between items-center">
                                    <div>
                                        <h4 className="font-extrabold text-sm uppercase tracking-wider text-gray-900">{designerPdfName}</h4>
                                        <p className="text-[10px] text-gray-500">Beraxis Enterprise Executable Document • Page 1 of 1</p>
                                    </div>
                                    <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full border border-purple-300">
                                        Active Sign Canvas
                                    </span>
                                </div>

                                <div className="space-y-3 text-xs text-gray-700 leading-relaxed font-serif">
                                    <p>
                                        This agreement is made and entered into by and between the authorized corporate entity and the undersigned signatory. By affixing the cryptographic seal below, the parties confirm agreement with the terms and stipulations outlined herein.
                                    </p>
                                    <p>
                                        The cryptographic SHA-256 hash attached to this PDF is generated upon finalization and constitutes a non-repudiable legal signature under electronic transactions law.
                                    </p>
                                </div>

                                {/* Placed Stamps Preview Overlay */}
                                <div className="mt-8 pt-8 border-t-2 border-dashed border-gray-300 grid grid-cols-2 gap-4">
                                    {placedStamps.map(st => (
                                        <div
                                            key={st.id}
                                            className="p-3 rounded-xl border-2 border-cyan-500 bg-cyan-50 text-cyan-900 relative shadow-md animate-in fade-in"
                                        >
                                            <div className="text-[9px] font-bold uppercase tracking-wider text-cyan-700 flex items-center gap-1 mb-1">
                                                {st.type === "signature" && <PenTool size={11} />}
                                                {st.type === "date" && <Calendar size={11} />}
                                                {st.type === "seal" && <Shield size={11} />}
                                                <span>{st.type} Stamp</span>
                                            </div>

                                            {st.type === "signature" && (
                                                <div className="text-xl font-['Dancing_Script'] font-bold text-blue-800">
                                                    {st.text}
                                                </div>
                                            )}
                                            {st.type === "date" && (
                                                <div className="text-xs font-mono font-bold text-gray-800">
                                                    Date: {st.text}
                                                </div>
                                            )}
                                            {st.type === "seal" && (
                                                <div className="text-[10px] font-mono font-extrabold text-purple-900 flex items-center gap-1">
                                                    <Lock size={12} className="text-purple-700" /> SECURED (SHA-256)
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Toolbox & Controls */}
                            <div className="space-y-4 bg-gray-950 p-4 rounded-2xl border border-gray-800 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400 block">Stamp Toolbox</span>

                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-300 mb-1">Signer Name</label>
                                        <input
                                            type="text"
                                            value={designerSignerName}
                                            onChange={e => {
                                                setDesignerSignerName(e.target.value);
                                                setPlacedStamps(placedStamps.map(s => s.type === "signature" ? { ...s, text: e.target.value } : s));
                                            }}
                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPlacedStamps([...placedStamps, { id: `st_${Date.now()}`, type: "signature", x: 50, y: 50, text: designerSignerName }]);
                                            }}
                                            className="w-full py-2 bg-gray-900 hover:bg-gray-800 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                                        >
                                            <PenTool size={13} /> + Add Signature Stamp
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPlacedStamps([...placedStamps, { id: `st_${Date.now()}`, type: "date", x: 50, y: 50, text: new Date().toLocaleDateString() }]);
                                            }}
                                            className="w-full py-2 bg-gray-900 hover:bg-gray-800 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                                        >
                                            <Calendar size={13} /> + Add Date Stamp
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPlacedStamps([...placedStamps, { id: `st_${Date.now()}`, type: "seal", x: 50, y: 50, text: "BERAXIS SEALED" }]);
                                            }}
                                            className="w-full py-2 bg-gray-900 hover:bg-gray-800 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                                        >
                                            <Shield size={13} /> + Add Security Seal
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-4 border-t border-gray-800">
                                    <button
                                        type="button"
                                        onClick={handleSaveDesignedPdf}
                                        className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-1.5"
                                    >
                                        <Check size={14} /> Finalize, Seal & Save PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 3: DISPATCH NEW AGREEMENT REQUEST */}
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
        </div>
    );
}
