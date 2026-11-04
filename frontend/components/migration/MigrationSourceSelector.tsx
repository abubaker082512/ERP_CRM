"use client";

import React, { useState } from "react";
import { 
    PLATFORM_PRESETS, 
    MigrationPlatform, 
    TargetEntity, 
    TARGET_ENTITY_FIELDS 
} from "@/lib/migrationEngine";
import { 
    Check, 
    Download, 
    HelpCircle, 
    ArrowRight, 
    FileSpreadsheet, 
    Users, 
    Receipt, 
    Package, 
    BookOpen,
    Sparkles,
    ShieldCheck
} from "lucide-react";

interface Props {
    selectedPlatform: MigrationPlatform;
    onSelectPlatform: (platform: MigrationPlatform) => void;
    selectedEntity: TargetEntity;
    onSelectEntity: (entity: TargetEntity) => void;
    onContinue: () => void;
}

export default function MigrationSourceSelector({
    selectedPlatform,
    onSelectPlatform,
    selectedEntity,
    onSelectEntity,
    onContinue
}: Props) {
    const [showExportGuide, setShowExportGuide] = useState(false);
    const preset = PLATFORM_PRESETS[selectedPlatform];

    const entities: { id: TargetEntity; label: string; icon: React.ReactNode; desc: string }[] = [
        { 
            id: "customers", 
            label: "Customers & Contacts", 
            icon: <Users size={18} className="text-purple-400" />,
            desc: "Names, emails, phone numbers, billing addresses, and historical AR balances"
        },
        { 
            id: "invoices", 
            label: "Invoices & Revenue", 
            icon: <Receipt size={18} className="text-emerald-400" />,
            desc: "Historical invoice numbers, dates, customer associations, totals, and payment states"
        },
        { 
            id: "products", 
            label: "Products & Stock", 
            icon: <Package size={18} className="text-sky-400" />,
            desc: "Item catalog, SKUs, sales rates, cost prices, and current physical inventory levels"
        },
        { 
            id: "chart_of_accounts", 
            label: "Chart of Accounts (GL)", 
            icon: <BookOpen size={18} className="text-amber-400" />,
            desc: "General Ledger account codes, names, categories, and opening balances"
        }
    ];

    const downloadSampleCSV = () => {
        const headers = preset.sampleHeaders[selectedEntity] || TARGET_ENTITY_FIELDS[selectedEntity].map(f => f.label);
        let sampleRow: string[] = [];

        if (selectedEntity === "customers") {
            sampleRow = ["Acme Industrial Corp", "Acme Corp", "billing@acmeindustrial.com", "+1 (555) 234-5678", "12500.00", "742 Evergreen Terrace", "Springfield", "United States"];
        } else if (selectedEntity === "invoices") {
            sampleRow = [`INV-${Date.now().toString().slice(-4)}`, "Acme Industrial Corp", "2026-10-15", "2026-11-15", "4500.00", "Posted"];
        } else if (selectedEntity === "products") {
            sampleRow = ["Industrial Titanium Bearing", "BEAR-TITAN-90", "285.00", "140.00", "48", "Mechanical Parts"];
        } else {
            sampleRow = ["1100", "Accounts Receivable - Domestic", "Asset", "125000.00"];
        }

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), sampleRow.join(",")].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `beraxis_sample_${selectedPlatform}_${selectedEntity}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header intro */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
                <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 inline-flex items-center gap-1.5">
                    <Sparkles size={12} className="text-purple-400" />
                    Zero Data Loss Guarantee
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                    Where is your current business data stored?
                </h2>
                <p className="text-xs sm:text-sm text-gray-400">
                    Select your existing software. Beraxis automatically detects your column names, normalizes currencies and dates, and maps historical balances directly into your live workspace.
                </p>
            </div>

            {/* Platform Selection Cards */}
            <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                    1. Select Legacy Platform / Software:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(Object.keys(PLATFORM_PRESETS) as MigrationPlatform[]).map((platformKey) => {
                        const p = PLATFORM_PRESETS[platformKey];
                        const isSelected = selectedPlatform === platformKey;

                        return (
                            <button
                                key={platformKey}
                                onClick={() => onSelectPlatform(platformKey)}
                                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-32 cursor-pointer ${
                                    isSelected 
                                        ? "bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-500/20 scale-[1.02]" 
                                        : "bg-[#0F172A]/40 border-white/10 hover:border-white/20 hover:bg-white/[0.03]"
                                }`}
                            >
                                <div className="flex items-start justify-between w-full">
                                    <div 
                                        className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-inner"
                                        style={{ backgroundColor: p.accentColor }}
                                    >
                                        {p.logoIcon}
                                    </div>
                                    {isSelected && (
                                        <span className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center">
                                            <Check size={12} strokeWidth={3} />
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm line-clamp-1">{p.name.split(" ")[0]}</h4>
                                    <p className="text-[11px] text-gray-400 line-clamp-1">{p.name.includes("(") ? p.name.split("(")[1].replace(")", "") : "Standard"}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Target Data Category */}
            <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                    2. Choose What Data To Import:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {entities.map((ent) => {
                        const isSelected = selectedEntity === ent.id;
                        const isSupported = preset.supportedEntities.includes(ent.id);

                        return (
                            <button
                                key={ent.id}
                                disabled={!isSupported}
                                onClick={() => onSelectEntity(ent.id)}
                                className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                                    !isSupported 
                                        ? "opacity-40 cursor-not-allowed bg-slate-900/20 border-white/5" 
                                        : isSelected 
                                            ? "bg-purple-950/40 border-purple-500 shadow-md shadow-purple-500/10" 
                                            : "bg-[#0F172A]/40 border-white/10 hover:border-white/20 hover:bg-white/[0.03]"
                                }`}
                            >
                                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 shrink-0">
                                    {ent.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-white text-sm">{ent.label}</h4>
                                        {isSelected && <span className="text-purple-400 text-xs font-bold">Selected</span>}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">{ent.desc}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Quick Export Guide & Sample Download Banner */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                        <FileSpreadsheet size={18} />
                    </div>
                    <div>
                        <h5 className="text-xs font-bold text-white">Need a quick template or instructions?</h5>
                        <p className="text-[11px] text-gray-400">
                            Download a pre-formatted {preset.name.split(" ")[0]} sample CSV or read the 3-step export walkthrough.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                    <button
                        onClick={() => setShowExportGuide(!showExportGuide)}
                        className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                        <HelpCircle size={14} className="text-gray-400" />
                        <span>How to Export from {preset.name.split(" ")[0]}</span>
                    </button>

                    <button
                        onClick={downloadSampleCSV}
                        className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                        <Download size={14} />
                        <span>Download Sample CSV</span>
                    </button>
                </div>
            </div>

            {/* Expandable Step-by-Step Instructions */}
            {showExportGuide && (
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-purple-500/30 space-y-3 animate-in fade-in duration-200">
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                        <ShieldCheck size={16} />
                        How to Export {entities.find(e => e.id === selectedEntity)?.label} from {preset.name}:
                    </h5>
                    <ol className="space-y-2 text-xs text-gray-300 pl-4 list-decimal">
                        {(preset.exportSteps[selectedEntity] || [
                            `Open ${preset.name} and open the list view.`,
                            "Click the Export or Actions menu and choose CSV / Excel format.",
                            "Save the file locally and upload it in the next step."
                        ]).map((step, idx) => (
                            <li key={idx} className="leading-relaxed">
                                {step}
                            </li>
                        ))}
                    </ol>
                </div>
            )}

            {/* Continue Button */}
            <div className="flex justify-end pt-4">
                <button
                    onClick={onContinue}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold text-sm shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                    <span>Proceed to File Upload</span>
                    <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
}
