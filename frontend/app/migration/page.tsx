"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import CosmicBackground from "@/components/CosmicBackground";
import MigrationSourceSelector from "@/components/migration/MigrationSourceSelector";
import ColumnMapperDrawer from "@/components/migration/ColumnMapperDrawer";
import MigrationPreviewTable from "@/components/migration/MigrationPreviewTable";
import MigrationCertificateModal from "@/components/migration/MigrationCertificateModal";
import { 
    MigrationPlatform, 
    TargetEntity, 
    PLATFORM_PRESETS,
    FieldMapping,
    ParsedRow,
    MigrationSummary,
    parseDelimitedText,
    autoMapColumns,
    validateAndSimulateMigration,
    commitMigrationToStorage
} from "@/lib/migrationEngine";
import { 
    Upload, 
    FileText, 
    Check, 
    ArrowRight, 
    Sparkles, 
    AlertCircle, 
    FileSpreadsheet, 
    ShieldCheck, 
    Database, 
    Layers,
    Lock,
    HelpCircle
} from "lucide-react";

function MigrationContent() {
    const searchParams = useSearchParams();

    // Query param presets
    const paramPlatform = searchParams.get("from") as MigrationPlatform;
    const paramEntity = searchParams.get("entity") as TargetEntity;

    const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
    const [platform, setPlatform] = useState<MigrationPlatform>(paramPlatform && PLATFORM_PRESETS[paramPlatform] ? paramPlatform : "quickbooks");
    const [targetEntity, setTargetEntity] = useState<TargetEntity>(paramEntity || "customers");

    // File upload state
    const [file, setFile] = useState<File | null>(null);
    const [rawText, setRawText] = useState<string>("");
    const [pasteMode, setPasteMode] = useState<boolean>(false);
    const [pastedCSV, setPastedCSV] = useState<string>("");
    const [parseError, setParseError] = useState<string>("");

    // Parsed Data & Mappings
    const [sourceHeaders, setSourceHeaders] = useState<string[]>([]);
    const [rawRows, setRawRows] = useState<string[][]>([]);
    const [mappings, setMappings] = useState<FieldMapping[]>([]);

    // Preview & Ingest Simulation
    const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
    const [summary, setSummary] = useState<MigrationSummary | null>(null);
    const [isIngesting, setIsIngesting] = useState<boolean>(false);

    // Certificate Celebration Modal
    const [showCertificate, setShowCertificate] = useState<boolean>(false);
    const [committedCount, setCommittedCount] = useState<number>(0);
    const [destinationHref, setDestinationHref] = useState<string>("/crm");

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Process file reading
    const handleFileChosen = (chosenFile: File) => {
        setFile(chosenFile);
        setParseError("");
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            if (content) {
                setRawText(content);
                processRawCSV(content);
            }
        };
        reader.onerror = () => {
            setParseError("Unable to read selected file. Please ensure it is a valid CSV or UTF-8 text file.");
        };
        reader.readAsText(chosenFile);
    };

    const processRawCSV = (content: string) => {
        try {
            const { headers, rows } = parseDelimitedText(content);
            if (headers.length === 0 || rows.length === 0) {
                setParseError("Uploaded file contains no rows or readable headers. Please check your export.");
                return;
            }

            setSourceHeaders(headers);
            setRawRows(rows);

            // Auto-map columns
            const autoMappings = autoMapColumns(headers, targetEntity, rows.slice(0, 5));
            setMappings(autoMappings);
            setCurrentStep(3); // Jump to column mapping step
        } catch (err: any) {
            setParseError(err.message || "Failed to parse data format.");
        }
    };

    const handleApplyPastedText = () => {
        if (!pastedCSV.trim()) {
            setParseError("Please paste your raw CSV or tab-delimited text first.");
            return;
        }
        setRawText(pastedCSV);
        processRawCSV(pastedCSV);
    };

    const handleUpdateMapping = (sourceCol: string, targetField: string) => {
        setMappings(prev => prev.map(m => {
            if (m.sourceColumn === sourceCol) {
                return { ...m, targetField, confidence: "manual" };
            }
            return m;
        }));
    };

    const handleResetAutoMap = () => {
        const autoMappings = autoMapColumns(sourceHeaders, targetEntity, rawRows.slice(0, 5));
        setMappings(autoMappings);
    };

    const handleProceedToPreview = () => {
        let existingItems: any[] = [];
        try {
            if (typeof window !== "undefined") {
                if (targetEntity === "customers") existingItems = JSON.parse(localStorage.getItem("crm_leads") || "[]");
                else if (targetEntity === "invoices") existingItems = JSON.parse(localStorage.getItem("accounting_invoices") || "[]");
                else if (targetEntity === "products") existingItems = JSON.parse(localStorage.getItem("inventory_products") || "[]");
                else if (targetEntity === "chart_of_accounts") existingItems = JSON.parse(localStorage.getItem("chart_of_accounts") || "[]");
            }
        } catch {}

        const { parsedRows: rows, summary: sum } = validateAndSimulateMigration(
            sourceHeaders,
            rawRows,
            mappings,
            targetEntity,
            existingItems
        );

        setParsedRows(rows);
        setSummary(sum);
        setCurrentStep(4);
    };

    const handleExecuteIngest = (skipDuplicates: boolean) => {
        setIsIngesting(true);
        setTimeout(() => {
            const rowsToCommit = skipDuplicates 
                ? parsedRows.filter(r => r._status !== "duplicate") 
                : parsedRows;

            const { committedCount: count, targetStorageKey } = commitMigrationToStorage(targetEntity, rowsToCommit);

            setIsIngesting(false);
            setCommittedCount(count);
            setDestinationHref(targetStorageKey);
            setShowCertificate(true);
        }, 800);
    };

    const steps = [
        { num: 1, title: "Source Platform" },
        { num: 2, title: "Upload Data" },
        { num: 3, title: "Map Columns" },
        { num: 4, title: "Verify & Ingest" }
    ];

    return (
        <main className="min-h-screen bg-[#030712] text-white selection:bg-purple-500 selection:text-white relative overflow-hidden flex flex-col justify-between">
            <CosmicBackground />
            <Navbar />

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-24 w-full">
                {/* 4-Stage Stepper Navigation */}
                <div className="mb-10 p-4 rounded-3xl bg-[#0F172A]/70 border border-white/10 backdrop-blur-xl shadow-2xl">
                    <div className="grid grid-cols-4 gap-2">
                        {steps.map((s) => {
                            const isCurrent = currentStep === s.num;
                            const isCompleted = currentStep > s.num;

                            return (
                                <button
                                    key={s.num}
                                    onClick={() => {
                                        if (isCompleted) setCurrentStep(s.num as any);
                                    }}
                                    disabled={!isCompleted && !isCurrent}
                                    className={`flex items-center gap-2.5 p-2 sm:p-3 rounded-2xl transition-all text-left ${
                                        isCurrent 
                                            ? "bg-purple-600/20 border border-purple-500/40 text-white" 
                                            : isCompleted 
                                                ? "text-gray-300 hover:bg-white/5 cursor-pointer" 
                                                : "text-gray-600 cursor-not-allowed opacity-50"
                                    }`}
                                >
                                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                                        isCurrent 
                                            ? "bg-purple-500 text-white shadow-lg shadow-purple-500/50" 
                                            : isCompleted 
                                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                                                : "bg-slate-800 text-gray-500"
                                    }`}>
                                        {isCompleted ? <Check size={14} strokeWidth={3} /> : s.num}
                                    </span>
                                    <div className="hidden sm:block min-w-0">
                                        <span className="text-[10px] uppercase font-bold text-gray-400 block truncate">Step {s.num}</span>
                                        <span className="text-xs font-bold text-white block truncate">{s.title}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* STEP 1: Platform & Category Selection */}
                {currentStep === 1 && (
                    <MigrationSourceSelector
                        selectedPlatform={platform}
                        onSelectPlatform={setPlatform}
                        selectedEntity={targetEntity}
                        onSelectEntity={setTargetEntity}
                        onContinue={() => setCurrentStep(2)}
                    />
                )}

                {/* STEP 2: File Upload / Drag & Drop */}
                {currentStep === 2 && (
                    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-300">
                        <div className="text-center space-y-2">
                            <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 inline-flex items-center gap-1.5">
                                <Sparkles size={12} className="text-purple-400" />
                                {PLATFORM_PRESETS[platform].name} Ingest
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-black text-white">
                                Upload your {targetEntity.replace("_", " ")} export file
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto">
                                Drop your `.csv`, `.tsv`, or Excel export. Beraxis processes your file entirely on your machine using private client-side parsing before staging.
                            </p>
                        </div>

                        {/* Error Alert */}
                        {parseError && (
                            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs font-medium">
                                <AlertCircle size={18} className="shrink-0 text-rose-400" />
                                <span>{parseError}</span>
                            </div>
                        )}

                        {/* Toggle upload vs paste mode */}
                        <div className="flex justify-center gap-2">
                            <button
                                onClick={() => setPasteMode(false)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                                    !pasteMode ? "bg-purple-600 text-white" : "bg-white/5 text-gray-400 hover:text-white"
                                }`}
                            >
                                Upload CSV File
                            </button>
                            <button
                                onClick={() => setPasteMode(true)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                                    pasteMode ? "bg-purple-600 text-white" : "bg-white/5 text-gray-400 hover:text-white"
                                }`}
                            >
                                Paste Raw CSV / Tab Text
                            </button>
                        </div>

                        {!pasteMode ? (
                            /* Drag & Drop Card */
                            <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                        handleFileChosen(e.dataTransfer.files[0]);
                                    }
                                }}
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-purple-500/40 hover:border-purple-400 bg-purple-950/20 hover:bg-purple-950/30 rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-4 group shadow-2xl"
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv,.tsv,.txt"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            handleFileChosen(e.target.files[0]);
                                        }
                                    }}
                                    className="hidden"
                                />

                                <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/20">
                                    <Upload size={28} />
                                </div>

                                <div className="space-y-1">
                                    <h3 className="text-base sm:text-lg font-bold text-white">
                                        Click to browse or drag &amp; drop file here
                                    </h3>
                                    <p className="text-xs text-gray-400">
                                        Supports CSV, TSV, or plain text exports (up to 50,000 rows per file)
                                    </p>
                                </div>

                                <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-white/5 text-gray-400 border border-white/10">
                                    Targeting: {PLATFORM_PRESETS[platform].name} • {targetEntity.toUpperCase()}
                                </span>
                            </div>
                        ) : (
                            /* Raw Text Paste Box */
                            <div className="space-y-3">
                                <textarea
                                    rows={8}
                                    value={pastedCSV}
                                    onChange={(e) => setPastedCSV(e.target.value)}
                                    placeholder={`Paste CSV content with headers, e.g.:\nName,Email,Phone,Balance\nAcme Corp,billing@acme.com,555-0199,12000.00`}
                                    className="w-full p-4 rounded-2xl bg-[#0F172A] border border-white/10 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent custom-scrollbar"
                                />

                                <button
                                    onClick={handleApplyPastedText}
                                    className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
                                >
                                    Parse Pasted Text &amp; Map Columns
                                </button>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-4">
                            <button
                                onClick={() => setCurrentStep(1)}
                                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 transition-colors cursor-pointer"
                            >
                                Back
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: Review & Edit Column Mappings */}
                {currentStep === 3 && (
                    <ColumnMapperDrawer
                        platform={platform}
                        targetEntity={targetEntity}
                        sourceHeaders={sourceHeaders}
                        mappings={mappings}
                        onUpdateMapping={handleUpdateMapping}
                        onResetAutoMap={handleResetAutoMap}
                        onProceedToPreview={handleProceedToPreview}
                        onBack={() => setCurrentStep(2)}
                        rowCount={rawRows.length}
                    />
                )}

                {/* STEP 4: Simulation Preview & Ingestion */}
                {currentStep === 4 && summary && (
                    <MigrationPreviewTable
                        platform={platform}
                        targetEntity={targetEntity}
                        summary={summary}
                        rows={parsedRows}
                        isIngesting={isIngesting}
                        onExecuteIngest={handleExecuteIngest}
                        onBack={() => setCurrentStep(3)}
                    />
                )}
            </div>

            {/* Verification Certificate Celebration Modal */}
            <MigrationCertificateModal
                isOpen={showCertificate}
                onClose={() => {
                    setShowCertificate(false);
                    setCurrentStep(1);
                    setFile(null);
                    setRawText("");
                    setPastedCSV("");
                }}
                platform={platform}
                targetEntity={targetEntity}
                recordCount={committedCount}
                destinationHref={destinationHref}
                financialTotal={summary?.financialTotal}
            />

            <Footer />
        </main>
    );
}

export default function UniversalMigrationPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#030712] flex items-center justify-center text-white">Loading Beraxis Migration Hub...</div>}>
            <MigrationContent />
        </Suspense>
    );
}
