"use client";

import React from "react";
import { 
    FieldMapping, 
    TargetEntity, 
    TARGET_ENTITY_FIELDS,
    PLATFORM_PRESETS,
    MigrationPlatform
} from "@/lib/migrationEngine";
import { 
    ArrowRight, 
    Check, 
    AlertCircle, 
    RotateCcw, 
    Sparkles, 
    Columns,
    Eye
} from "lucide-react";

interface Props {
    platform: MigrationPlatform;
    targetEntity: TargetEntity;
    sourceHeaders: string[];
    mappings: FieldMapping[];
    onUpdateMapping: (sourceCol: string, targetField: string) => void;
    onResetAutoMap: () => void;
    onProceedToPreview: () => void;
    onBack: () => void;
    rowCount: number;
}

export default function ColumnMapperDrawer({
    platform,
    targetEntity,
    sourceHeaders,
    mappings,
    onUpdateMapping,
    onResetAutoMap,
    onProceedToPreview,
    onBack,
    rowCount
}: Props) {
    const fieldsDef = TARGET_ENTITY_FIELDS[targetEntity];
    const platformPreset = PLATFORM_PRESETS[platform];

    // Check which required fields are mapped
    const mappedTargetKeys = new Set(mappings.map(m => m.targetField).filter(f => f && f !== "ignore"));
    const requiredFields = fieldsDef.filter(f => f.required);
    const missingRequired = requiredFields.filter(f => !mappedTargetKeys.has(f.key));
    const canProceed = missingRequired.length === 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0F172A]/80 border border-white/10 backdrop-blur-xl">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 inline-flex items-center gap-1">
                            <Sparkles size={11} className="text-purple-400" />
                            AI Heuristic Column Matching
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-300 font-semibold">{rowCount} records detected</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">Review & Confirm Field Mappings</h3>
                    <p className="text-xs text-gray-400">
                        Match each column from your <strong>{platformPreset.name}</strong> export to the corresponding Beraxis ERP field.
                    </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                        onClick={onResetAutoMap}
                        className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                        <RotateCcw size={13} />
                        <span>Auto-Match Again</span>
                    </button>
                </div>
            </div>

            {/* Required Fields Checklist */}
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                missingRequired.length > 0 
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-200" 
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
            }`}>
                <div className="flex items-center gap-2.5 text-xs font-bold">
                    {missingRequired.length > 0 ? (
                        <AlertCircle size={16} className="text-amber-400 shrink-0" />
                    ) : (
                        <Check size={16} className="text-emerald-400 shrink-0" />
                    )}
                    <span>
                        {missingRequired.length > 0 
                            ? `Required fields missing mapping: ${missingRequired.map(f => f.label).join(", ")}` 
                            : "All mandatory Beraxis fields are successfully mapped and verified."}
                    </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-gray-400 shrink-0">
                    <span>{mappedTargetKeys.size} of {fieldsDef.length} fields configured</span>
                </div>
            </div>

            {/* Column Mapping Table */}
            <div className="rounded-2xl border border-white/10 bg-[#0F172A]/50 overflow-hidden shadow-xl">
                <div className="grid grid-cols-12 gap-3 px-5 py-3.5 bg-white/[0.03] border-b border-white/10 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                    <div className="col-span-4 flex items-center gap-1.5">
                        <Columns size={13} />
                        <span>Source File Column</span>
                    </div>
                    <div className="col-span-3 hidden sm:flex items-center gap-1.5">
                        <Eye size={13} />
                        <span>Sample Value (Row 1)</span>
                    </div>
                    <div className="col-span-12 sm:col-span-5 flex items-center gap-1.5">
                        <span>Maps To Beraxis Field</span>
                    </div>
                </div>

                <div className="divide-y divide-white/5">
                    {mappings.map((mapping, idx) => {
                        const targetDef = fieldsDef.find(f => f.key === mapping.targetField);
                        const isIgnored = mapping.targetField === "ignore";

                        return (
                            <div 
                                key={idx}
                                className={`grid grid-cols-12 gap-3 px-5 py-4 items-center transition-colors ${
                                    isIgnored ? "bg-white/[0.01] opacity-70" : "hover:bg-white/[0.02]"
                                }`}
                            >
                                {/* Source Column */}
                                <div className="col-span-4">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-white text-xs sm:text-sm font-mono truncate">
                                            {mapping.sourceColumn}
                                        </span>
                                        {mapping.confidence === "high" && (
                                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0 hidden md:inline-block">
                                                High Match
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Sample Value */}
                                <div className="col-span-3 hidden sm:block">
                                    <span className="text-xs text-gray-400 font-mono truncate block max-w-[200px]" title={mapping.sampleValue}>
                                        {mapping.sampleValue || <em className="text-gray-600">empty</em>}
                                    </span>
                                </div>

                                {/* Target Selector */}
                                <div className="col-span-12 sm:col-span-5 flex items-center gap-3">
                                    <div className="relative flex-1">
                                        <select
                                            value={mapping.targetField}
                                            onChange={(e) => onUpdateMapping(mapping.sourceColumn, e.target.value)}
                                            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                                                isIgnored
                                                    ? "bg-slate-900/60 border-white/10 text-gray-500"
                                                    : "bg-purple-950/40 border-purple-500/60 text-white shadow-inner"
                                            }`}
                                        >
                                            <option value="ignore">❌ Do Not Import (Skip Column)</option>
                                            <optgroup label="Beraxis Target Fields:">
                                                {fieldsDef.map(f => (
                                                    <option key={f.key} value={f.key}>
                                                        {f.label} {f.required ? "(Required *)" : ""}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        </select>
                                    </div>

                                    {targetDef?.required && (
                                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest shrink-0" title="Required field">
                                            *REQ
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4">
                <button
                    onClick={onBack}
                    className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 transition-colors cursor-pointer"
                >
                    Back to File Upload
                </button>

                <button
                    disabled={!canProceed}
                    onClick={onProceedToPreview}
                    className={`px-8 py-3.5 rounded-xl font-extrabold text-sm flex items-center gap-2 transition-all active:scale-95 cursor-pointer ${
                        canProceed
                            ? "bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/25"
                            : "bg-slate-800 text-gray-500 cursor-not-allowed opacity-60"
                    }`}
                >
                    <span>Simulate &amp; Preview Import</span>
                    <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
}
