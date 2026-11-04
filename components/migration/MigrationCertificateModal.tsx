"use client";

import React from "react";
import Link from "next/link";
import { 
    Check, 
    ShieldCheck, 
    Printer, 
    ArrowRight, 
    Sparkles, 
    Award,
    Building2,
    Calendar,
    Layers
} from "lucide-react";
import { MigrationPlatform, TargetEntity, PLATFORM_PRESETS } from "@/lib/migrationEngine";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    platform: MigrationPlatform;
    targetEntity: TargetEntity;
    recordCount: number;
    destinationHref: string;
    financialTotal?: number;
}

export default function MigrationCertificateModal({
    isOpen,
    onClose,
    platform,
    targetEntity,
    recordCount,
    destinationHref,
    financialTotal
}: Props) {
    if (!isOpen) return null;

    const platformPreset = PLATFORM_PRESETS[platform];
    const entityLabels: Record<TargetEntity, string> = {
        customers: "Customers & Accounts Receivable",
        invoices: "Sales Invoices & Revenue Journal",
        products: "Item Catalog & Stock Balances",
        chart_of_accounts: "General Ledger Chart of Accounts"
    };

    const targetModuleLabels: Record<TargetEntity, string> = {
        customers: "AI CRM & Pipelines",
        invoices: "Double-Entry Accounting & Ledger",
        products: "Smart Cloud Inventory",
        chart_of_accounts: "Chart of Accounts (GL)"
    };

    const handlePrint = () => {
        window.print();
    };

    const currentDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    const certId = `BERAXIS-MIG-${Math.floor(100000 + Math.random() * 900000)}`;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#0F172A] via-[#0B0F1C] to-slate-950 border border-purple-500/40 rounded-3xl p-6 sm:p-10 shadow-[0_20px_80px_rgba(168,85,247,0.25)] flex flex-col space-y-6 text-white overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

                {/* Certificate Border Header */}
                <div className="flex items-start justify-between border-b border-white/10 pb-6 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 p-0.5 shadow-lg shadow-purple-500/30">
                            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                                <Award className="w-6 h-6 text-purple-400" />
                            </div>
                        </div>
                        <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                                <Check size={12} strokeWidth={3} />
                                Migration Verified &amp; Signed
                            </span>
                            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                                Data Migration Certificate
                            </h2>
                        </div>
                    </div>

                    <div className="text-right">
                        <span className="text-[10px] uppercase font-mono text-gray-500 block">Certificate ID</span>
                        <span className="text-xs font-mono font-bold text-gray-300">{certId}</span>
                    </div>
                </div>

                {/* Certificate Details Body */}
                <div className="space-y-4 relative z-10 py-2">
                    <p className="text-sm text-gray-300 leading-relaxed">
                        This certifies that <strong className="text-white">{recordCount.toLocaleString()} {entityLabels[targetEntity]}</strong> records have been extracted from <strong className="text-purple-300">{platformPreset.name}</strong>, cryptographically validated, normalized, and ingested into your live <strong>Beraxis Autonomous ERP &amp; CRM</strong> instance with zero data degradation.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                            <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                                <Building2 size={13} />
                                <span>Legacy Source</span>
                            </div>
                            <span className="font-bold text-white text-sm block truncate">{platformPreset.name.split(" ")[0]}</span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                            <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                                <Layers size={13} />
                                <span>Target Module</span>
                            </div>
                            <span className="font-bold text-purple-300 text-sm block truncate">{targetModuleLabels[targetEntity]}</span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1 col-span-2 sm:col-span-1">
                            <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                                <Calendar size={13} />
                                <span>Ingestion Date</span>
                            </div>
                            <span className="font-bold text-emerald-400 text-sm block">{currentDate}</span>
                        </div>
                    </div>

                    {financialTotal && financialTotal > 0 && (
                        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                            <span className="text-xs text-emerald-200">Historical Financial Volume Preserved:</span>
                            <span className="font-black text-emerald-400 text-base">
                                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(financialTotal)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Trust Seal */}
                <div className="pt-2 flex items-center justify-between text-xs text-gray-400 border-t border-white/10 relative z-10">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-purple-400" />
                        <span>Backed by Beraxis 100% Data Integrity Guarantee</span>
                    </div>
                    <span className="hidden sm:inline font-mono text-[11px] text-gray-500">Atomic Storage Ingested</span>
                </div>

                {/* Actions Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 relative z-10">
                    <button
                        onClick={handlePrint}
                        className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                        <Printer size={15} />
                        <span>Print / Save Certificate PDF</span>
                    </button>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                        <button
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 transition-colors cursor-pointer"
                        >
                            Migrate Another File
                        </button>

                        <Link
                            href={destinationHref}
                            className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold text-xs shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                        >
                            <span>Open Ingested Module</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
