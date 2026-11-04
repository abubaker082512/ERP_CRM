"use client";

import React, { useState } from "react";
import { 
    ParsedRow, 
    MigrationSummary, 
    TargetEntity,
    TARGET_ENTITY_FIELDS,
    PLATFORM_PRESETS,
    MigrationPlatform
} from "@/lib/migrationEngine";
import { 
    CheckCircle2, 
    AlertTriangle, 
    XCircle, 
    Copy, 
    DollarSign, 
    Database, 
    ArrowRight, 
    Filter,
    ShieldCheck,
    Loader2
} from "lucide-react";

interface Props {
    platform: MigrationPlatform;
    targetEntity: TargetEntity;
    summary: MigrationSummary;
    rows: ParsedRow[];
    isIngesting: boolean;
    onExecuteIngest: (skipDuplicates: boolean) => void;
    onBack: () => void;
}

export default function MigrationPreviewTable({
    platform,
    targetEntity,
    summary,
    rows,
    isIngesting,
    onExecuteIngest,
    onBack
}: Props) {
    const [filterStatus, setFilterStatus] = useState<"all" | "valid" | "warning" | "duplicate" | "error">("all");
    const [skipDuplicates, setSkipDuplicates] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fieldsDef = TARGET_ENTITY_FIELDS[targetEntity];
    const platformPreset = PLATFORM_PRESETS[platform];

    const filteredRows = rows.filter(r => {
        if (filterStatus !== "all" && r._status !== filterStatus) return false;
        if (searchTerm.trim().length > 0) {
            const query = searchTerm.toLowerCase();
            const values = Object.values(r).map(v => String(v).toLowerCase());
            return values.some(v => v.includes(query));
        }
        return true;
    });

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* KPI Executive Summary Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="p-4 rounded-2xl bg-[#0F172A]/80 border border-white/10 flex flex-col justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Scanned</span>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-2xl font-black text-white">{summary.totalRows}</span>
                        <span className="text-xs text-gray-400">rows</span>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">100% Valid</span>
                        <CheckCircle2 size={14} className="text-emerald-400" />
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-2xl font-black text-emerald-400">{summary.validRows}</span>
                        <span className="text-xs text-emerald-300/70">ready</span>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">Coerced / Warn</span>
                        <AlertTriangle size={14} className="text-amber-400" />
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-2xl font-black text-amber-400">{summary.warningRows}</span>
                        <span className="text-xs text-amber-300/70">coerced</span>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">Duplicates</span>
                        <Copy size={14} className="text-blue-400" />
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-2xl font-black text-blue-400">{summary.duplicateRows}</span>
                        <span className="text-xs text-blue-300/70">detected</span>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex flex-col justify-between col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">Historical Volume</span>
                        <DollarSign size={14} className="text-purple-400" />
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-xl font-black text-purple-300 truncate">
                            {formatCurrency(summary.financialTotal || 0)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-[#0F172A]/50 border border-white/10">
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                    <button
                        onClick={() => setFilterStatus("all")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                            filterStatus === "all" ? "bg-white/15 text-white" : "text-gray-400 hover:text-white"
                        }`}
                    >
                        All ({rows.length})
                    </button>
                    <button
                        onClick={() => setFilterStatus("valid")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                            filterStatus === "valid" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-gray-400 hover:text-white"
                        }`}
                    >
                        Valid ({summary.validRows})
                    </button>
                    <button
                        onClick={() => setFilterStatus("warning")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                            filterStatus === "warning" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-gray-400 hover:text-white"
                        }`}
                    >
                        Warnings ({summary.warningRows})
                    </button>
                    <button
                        onClick={() => setFilterStatus("duplicate")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                            filterStatus === "duplicate" ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" : "text-gray-400 hover:text-white"
                        }`}
                    >
                        Duplicates ({summary.duplicateRows})
                    </button>
                </div>

                <div className="w-full sm:w-64">
                    <input
                        type="text"
                        placeholder="Filter rows by name, email, SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                </div>
            </div>

            {/* Simulated Data Preview Grid */}
            <div className="rounded-2xl border border-white/10 bg-[#0F172A]/70 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto max-h-[420px] custom-scrollbar">
                    <table className="w-full text-left text-xs text-gray-300">
                        <thead className="bg-[#1E293B]/90 sticky top-0 z-10 border-b border-white/10 backdrop-blur-md">
                            <tr>
                                <th className="px-4 py-3 font-extrabold uppercase text-[10px] tracking-wider text-gray-400">#</th>
                                <th className="px-4 py-3 font-extrabold uppercase text-[10px] tracking-wider text-gray-400">Status</th>
                                {fieldsDef.map(f => (
                                    <th key={f.key} className="px-4 py-3 font-extrabold uppercase text-[10px] tracking-wider text-gray-400 whitespace-nowrap">
                                        {f.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-mono">
                            {filteredRows.slice(0, 100).map((row, idx) => {
                                return (
                                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-4 py-3 text-gray-500">{row._rawIndex + 1}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {row._status === "valid" && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                                    <CheckCircle2 size={10} /> Valid
                                                </span>
                                            )}
                                            {row._status === "warning" && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30" title={row._issues.join(", ")}>
                                                    <AlertTriangle size={10} /> Warning
                                                </span>
                                            )}
                                            {row._status === "duplicate" && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30" title={row._issues.join(", ")}>
                                                    <Copy size={10} /> Duplicate
                                                </span>
                                            )}
                                            {row._status === "error" && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30" title={row._issues.join(", ")}>
                                                    <XCircle size={10} /> Error
                                                </span>
                                            )}
                                        </td>
                                        {fieldsDef.map(f => {
                                            const val = row[f.key];
                                            let display = val !== undefined && val !== null ? String(val) : "";
                                            if (f.type === "currency" && val !== undefined) {
                                                display = formatCurrency(Number(val) || 0);
                                            }

                                            return (
                                                <td key={f.key} className="px-4 py-3 whitespace-nowrap text-white font-sans text-xs">
                                                    {display || <span className="text-gray-600">—</span>}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredRows.length > 100 && (
                    <div className="p-3 text-center text-xs text-gray-500 border-t border-white/5 bg-slate-950/40">
                        Showing first 100 preview rows of {filteredRows.length} matching records. All {rows.length} records will be processed upon commit.
                    </div>
                )}
            </div>

            {/* Ingestion Settings & Commit Panel */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
                        <input
                            type="checkbox"
                            checked={skipDuplicates}
                            onChange={(e) => setSkipDuplicates(e.target.checked)}
                            className="rounded text-purple-600 focus:ring-purple-500 bg-slate-900 border-white/20 w-4 h-4 cursor-pointer"
                        />
                        <span>Safely skip existing duplicate records (Prevent double counting)</span>
                    </label>
                    <p className="text-[11px] text-gray-400 pl-6">
                        Beraxis uses atomic write guarantees. Your existing data remains 100% intact.
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                    <button
                        onClick={onBack}
                        disabled={isIngesting}
                        className="flex-1 sm:flex-none px-5 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 transition-colors cursor-pointer"
                    >
                        Back
                    </button>

                    <button
                        disabled={isIngesting || (summary.validRows === 0 && summary.warningRows === 0)}
                        onClick={() => onExecuteIngest(skipDuplicates)}
                        className="flex-1 sm:flex-none px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold text-sm shadow-xl shadow-purple-500/30 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                        {isIngesting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Ingesting Data into Beraxis...</span>
                            </>
                        ) : (
                            <>
                                <Database size={16} />
                                <span>Ingest {summary.validRows + summary.warningRows} Records Now</span>
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
