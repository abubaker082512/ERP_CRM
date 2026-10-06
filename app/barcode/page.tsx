"use client";

import { useEffect, useState, useRef } from "react";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import {
    Scan,
    Box,
    Barcode as BarcodeIcon,
    QrCode,
    Printer,
    Download,
    CheckCircle2,
    Sparkles,
    Trash2,
    RefreshCw,
    Plus,
    X,
    Layers,
    Camera,
    Volume2,
    VolumeX,
    Copy,
    Search,
    Package
} from "lucide-react";
import { fetchAPI } from "@/lib/api";
import BarcodeAndQRCanvas from "@/components/shared/BarcodeAndQRCanvas";
import { Link as LinkIcon, Globe, FileText, Calendar } from "lucide-react";

const MENU_ITEMS = [
    { name: "Barcode Scanner", href: "/barcode" },
    { name: "Inventory Products", href: "/inventory" },
    { name: "Stock Operations", href: "/inventory/operations" },
    { name: "Point of Sale", href: "/pos" },
    { name: "Configuration", href: "/inventory/configuration" },
];

export type ScannedLog = {
    id: string;
    barcode: string;
    product_name?: string;
    sku?: string;
    category?: string;
    price?: number;
    qty_scanned: number;
    scanned_at: string;
    type: "inventory_check" | "pos_scan" | "receiving";
};

const PRODUCT_LOOKUP_DB: Record<string, { name: string; sku: string; price: number; category: string }> = {
    "893450012984": { name: "Enterprise ERP Cloud Server Rack (1U)", sku: "SRV-RACK-001", price: 2499.00, category: "Hardware" },
    "893450029381": { name: "Dual-Band Wi-Fi 6 Mesh Access Point", sku: "NET-WIFI6-AP", price: 189.99, category: "Hardware" },
    "893450041209": { name: "Omnidirectional 2D Barcode Scanner USB", sku: "POS-SCAN-2D", price: 129.50, category: "Retail POS" },
    "893450077812": { name: "Enterprise Database Multi-Tenant License (Annual)", sku: "LIC-DB-ENT-1Y", price: 1200.00, category: "Software" },
    "893450099120": { name: "Smart POS Cash Drawer 24V RJ11", sku: "POS-DRW-24V", price: 85.00, category: "Retail POS" },
    "893450055410": { name: "Fiber Optic Patch Cord SC/UPC 10m", sku: "CAB-FO-10M", price: 14.50, category: "Hardware" },
    "893450066231": { name: "Thermal Receipt Paper Rolls (80mm x 80m)", sku: "POS-PPR-80MM", price: 45.00, category: "Retail Supplies" },
};

export default function BarcodePage() {
    const [logs, setLogs] = useState<ScannedLog[]>([]);
    const [barcodeInput, setBarcodeInput] = useState("");
    const [isScanningMode, setIsScanningMode] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [toastMsg, setToastMsg] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    // Generator Modal
    const [isGenModalOpen, setIsGenModalOpen] = useState(false);
    const [genSku, setGenSku] = useState("BER-PROD-2026");
    const [genType, setGenType] = useState<"code128" | "qr" | "ean13">("code128");

    const inputRef = useRef<HTMLInputElement | null>(null);

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(""), 5000);
    };

    useEffect(() => {
        // Load default initial logs
        setLogs([
            {
                id: "scan_1",
                barcode: "893450012984",
                product_name: "Enterprise ERP Cloud Server Rack (1U)",
                sku: "SRV-RACK-001",
                category: "Hardware",
                price: 2499.00,
                qty_scanned: 1,
                scanned_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
                type: "inventory_check"
            },
            {
                id: "scan_2",
                barcode: "893450029381",
                product_name: "Dual-Band Wi-Fi 6 Mesh Access Point",
                sku: "NET-WIFI6-AP",
                category: "Hardware",
                price: 189.99,
                qty_scanned: 4,
                scanned_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
                type: "receiving"
            }
        ]);
    }, []);

    const playBeep = () => {
        if (!soundEnabled || typeof window === "undefined") return;
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(1800, ctx.currentTime);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.12);
        } catch {}
    };

    const handleScan = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const code = barcodeInput.trim();
        if (!code) return;

        playBeep();

        const match = PRODUCT_LOOKUP_DB[code];
        const newLog: ScannedLog = {
            id: `scan_${Date.now()}`,
            barcode: code,
            product_name: match ? match.name : "Custom / External Barcode SKU",
            sku: match ? match.sku : `SKU-${code.slice(-6)}`,
            category: match ? match.category : "General Stock",
            price: match ? match.price : 49.99,
            qty_scanned: 1,
            scanned_at: new Date().toISOString(),
            type: "inventory_check"
        };

        setLogs([newLog, ...logs]);
        setBarcodeInput("");
        showToast(`⚡ Scanned ${match ? `"${match.name}"` : code}!`);

        if (inputRef.current) inputRef.current.focus();
    };

    const handleQuickSampleScan = (code: string) => {
        setBarcodeInput(code);
        setTimeout(() => {
            const match = PRODUCT_LOOKUP_DB[code];
            playBeep();
            const newLog: ScannedLog = {
                id: `scan_${Date.now()}`,
                barcode: code,
                product_name: match ? match.name : "Sample Item",
                sku: match ? match.sku : `SKU-${code}`,
                category: match ? match.category : "General",
                price: match ? match.price : 99.00,
                qty_scanned: 1,
                scanned_at: new Date().toISOString(),
                type: "inventory_check"
            };
            setLogs(prev => [newLog, ...prev]);
            setBarcodeInput("");
            showToast(`📦 Scanned: ${match.name}`);
        }, 100);
    };

    const handleExportCSV = () => {
        const headers = ["Scan ID", "Barcode", "Product Name", "SKU", "Category", "Unit Price", "Qty Scanned", "Timestamp"];
        const rows = logs.map(l => [
            l.id,
            `"${l.barcode}"`,
            `"${l.product_name || 'N/A'}"`,
            `"${l.sku || 'N/A'}"`,
            `"${l.category || 'General'}"`,
            l.price || 0,
            l.qty_scanned,
            `"${new Date(l.scanned_at).toLocaleString()}"`
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `beraxis_scanned_barcode_session_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("📥 Exported Scanned Barcode Session CSV!");
    };

    const filteredLogs = logs.filter(l =>
        l.barcode.includes(searchQuery) ||
        (l.product_name && l.product_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (l.sku && l.sku.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const totalScannedUnits = logs.reduce((acc, curr) => acc + curr.qty_scanned, 0);
    const totalScannedValue = logs.reduce((acc, curr) => acc + (curr.qty_scanned * (curr.price || 0)), 0);

    return (
        <div className="flex flex-col min-h-screen bg-[#0a0d14] text-white">
            <StandardModuleHeader
                moduleName="Barcode"
                moduleIcon={<BarcodeIcon size={20} className="text-pink-400" />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search barcode, SKU, or product..."
                onSearch={setSearchQuery}
                onNewClick={() => setIsGenModalOpen(true)}
                newButtonText="+ Generate Label"
            />

            {/* Toast Notification */}
            {toastMsg && (
                <div className="fixed top-16 right-6 z-50 bg-pink-600 text-white px-5 py-3 rounded-xl shadow-2xl shadow-pink-900/50 flex items-center gap-3 border border-pink-400 animate-in fade-in slide-in-from-top-4 duration-300">
                    <Sparkles size={18} className="animate-spin text-pink-200" />
                    <span className="text-sm font-medium">{toastMsg}</span>
                </div>
            )}

            <div className="flex-1 overflow-auto p-6 max-w-7xl mx-auto w-full space-y-6">
                {/* Header Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900/60 p-4 rounded-2xl border border-gray-800 backdrop-blur-xl">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-pink-400 via-rose-300 to-purple-300 bg-clip-text text-transparent">
                                Barcode & Hardware Scanner Hub
                            </h2>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 font-semibold">
                                Live Scanner Ready
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            High-speed USB scanner input, live product lookup, label printing & inventory reconciliation
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                        <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className="p-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl border border-gray-700 transition"
                            title={soundEnabled ? "Mute beep sound" : "Enable beep sound"}
                        >
                            {soundEnabled ? <Volume2 size={16} className="text-emerald-400" /> : <VolumeX size={16} className="text-gray-500" />}
                        </button>

                        <button
                            onClick={handleExportCSV}
                            className="bg-gray-800/90 hover:bg-gray-700 text-gray-200 border border-gray-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                        >
                            <Download size={15} className="text-emerald-400" /> Export CSV
                        </button>

                        <button
                            onClick={() => setIsGenModalOpen(true)}
                            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-pink-600/30 transition transform hover:-translate-y-0.5"
                        >
                            <QrCode size={16} /> + Generate Barcode / Label
                        </button>
                    </div>
                </div>

                {/* Primary Scanner Terminal */}
                <div className="bg-gradient-to-r from-pink-950/40 via-gray-900/90 to-purple-950/40 border-2 border-pink-500/40 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                    <div className="max-w-2xl mx-auto text-center space-y-5">
                        <div className="w-16 h-16 bg-pink-500/10 border-2 border-pink-500/30 rounded-2xl mx-auto flex items-center justify-center text-pink-400 shadow-inner">
                            <Scan size={32} className="animate-pulse" />
                        </div>

                        <div>
                            <h3 className="text-2xl font-black text-white">Scan Barcode / Enter SKU</h3>
                            <p className="text-xs text-gray-400 mt-1">
                                Point your physical USB / Bluetooth scanner or type below. Press Enter to commit.
                            </p>
                        </div>

                        <form onSubmit={handleScan} className="relative max-w-lg mx-auto">
                            <input
                                ref={inputRef}
                                type="text"
                                value={barcodeInput}
                                onChange={(e) => setBarcodeInput(e.target.value)}
                                placeholder="Scan or type barcode (e.g. 893450012984)..."
                                className="w-full bg-gray-950/90 border-2 border-pink-500/60 rounded-2xl px-5 py-3.5 text-white focus:border-pink-400 focus:outline-none text-center text-lg tracking-widest font-mono shadow-inner font-bold"
                                autoFocus
                            />
                            <button
                                type="submit"
                                className="absolute right-2.5 top-2.5 bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-pink-600/30 transition"
                            >
                                Enter
                            </button>
                        </form>

                        {/* Quick Sample Click Triggers */}
                        <div className="pt-2">
                            <span className="text-[11px] uppercase font-bold text-gray-400 block mb-2">Quick Test Barcode Presets:</span>
                            <div className="flex items-center justify-center gap-2 flex-wrap">
                                {Object.entries(PRODUCT_LOOKUP_DB).slice(0, 4).map(([code, item]) => (
                                    <button
                                        key={code}
                                        type="button"
                                        onClick={() => handleQuickSampleScan(code)}
                                        className="px-2.5 py-1 bg-gray-950 hover:bg-gray-800 border border-gray-700/80 rounded-lg text-[11px] text-gray-300 font-mono transition flex items-center gap-1.5"
                                    >
                                        <BarcodeIcon size={12} className="text-pink-400" />
                                        <span>{item.sku}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-gray-900/80 to-pink-950/20 p-5 rounded-2xl border border-gray-800 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-400 font-semibold uppercase">Total Scans in Session</span>
                            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
                                <Scan size={18} />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-white">{logs.length} Scans</div>
                        <div className="text-[11px] text-gray-400 mt-1">{totalScannedUnits} total physical units scanned</div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900/80 to-emerald-950/20 p-5 rounded-2xl border border-gray-800 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-400 font-semibold uppercase">Scanned Inventory Value</span>
                            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <Package size={18} />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-emerald-400">${totalScannedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <div className="text-[11px] text-emerald-300 mt-1">Cross-referenced with live catalogue</div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900/80 to-purple-950/20 p-5 rounded-2xl border border-gray-800 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-400 font-semibold uppercase">Scanner Device State</span>
                            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                <BarcodeIcon size={18} />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-purple-300">Ready (USB)</div>
                        <div className="text-[11px] text-purple-300 mt-1">Listening on keyboard wedge port</div>
                    </div>
                </div>

                {/* Scanned Items History Table */}
                <div className="bg-gray-900/80 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl backdrop-blur-xl">
                    <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950/40">
                        <div className="flex items-center gap-2">
                            <Layers size={18} className="text-pink-400" />
                            <h3 className="font-bold text-white text-sm">Real-Time Scan Log History</h3>
                            <span className="text-xs text-gray-400">({filteredLogs.length} items logged)</span>
                        </div>

                        {logs.length > 0 && (
                            <button
                                onClick={() => setLogs([])}
                                className="text-xs text-gray-400 hover:text-rose-400 flex items-center gap-1 transition"
                            >
                                <Trash2 size={13} /> Clear Session Log
                            </button>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-950 text-gray-400 uppercase text-[10px] border-b border-gray-800 font-semibold">
                                <tr>
                                    <th className="px-5 py-3.5">Scanned Barcode</th>
                                    <th className="px-4 py-3.5">Product Title</th>
                                    <th className="px-4 py-3.5">SKU Code</th>
                                    <th className="px-4 py-3.5">Category</th>
                                    <th className="px-4 py-3.5 text-right">Unit Value</th>
                                    <th className="px-4 py-3.5 text-right">Qty Scanned</th>
                                    <th className="px-4 py-3.5">Time of Scan</th>
                                    <th className="px-5 py-3.5 text-center">Audit Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/60">
                                {filteredLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-pink-950/10 transition">
                                        <td className="px-5 py-3.5 font-mono font-bold text-white text-sm">
                                            <div className="flex items-center gap-1.5">
                                                <BarcodeIcon size={16} className="text-pink-400" />
                                                <span>{log.barcode}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 font-semibold text-white">
                                            {log.product_name}
                                        </td>
                                        <td className="px-4 py-3.5 font-mono text-gray-300">
                                            {log.sku}
                                        </td>
                                        <td className="px-4 py-3.5 text-gray-400">
                                            <span className="px-2 py-0.5 rounded-md bg-gray-800 border border-gray-700 text-gray-300 text-[11px]">
                                                {log.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-400">
                                            ${(log.price || 0).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3.5 text-right font-black text-white">
                                            {log.qty_scanned}
                                        </td>
                                        <td className="px-4 py-3.5 text-gray-400 font-mono text-[11px]">
                                            {new Date(log.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                                                <CheckCircle2 size={11} /> Verified
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {filteredLogs.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500 text-sm">
                                            No barcode scans recorded yet. Scan your first SKU barcode above!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal: Generate Printable Barcode & QR Code Label */}
            {isGenModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setIsGenModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-pink-500/10 text-pink-400 rounded-xl border border-pink-500/20">
                                <QrCode size={22} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Generate Barcode or QR Code</h3>
                                <p className="text-xs text-gray-400">Generate for any Website URL, Appointment Link, or Product SKU</p>
                            </div>
                        </div>

                        {/* Quick Presets */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            <span className="text-[10px] text-gray-400 font-bold uppercase self-center mr-1">Quick Presets:</span>
                            <button
                                type="button"
                                onClick={() => {
                                    setGenSku("https://access.beraxis.online/appointments/book/demo");
                                    setGenType("qr");
                                }}
                                className="text-[10px] bg-gray-800 hover:bg-gray-700 text-cyan-300 px-2.5 py-1 rounded-lg border border-gray-700 flex items-center gap-1"
                            >
                                <Calendar size={11} /> Appointment Link
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setGenSku("https://access.beraxis.online");
                                    setGenType("qr");
                                }}
                                className="text-[10px] bg-gray-800 hover:bg-gray-700 text-purple-300 px-2.5 py-1 rounded-lg border border-gray-700 flex items-center gap-1"
                            >
                                <Globe size={11} /> Main Website
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setGenSku("BER-PROD-2026");
                                    setGenType("code128");
                                }}
                                className="text-[10px] bg-gray-800 hover:bg-gray-700 text-pink-300 px-2.5 py-1 rounded-lg border border-gray-700 flex items-center gap-1"
                            >
                                <Box size={11} /> Product SKU
                            </button>
                        </div>

                        <div className="space-y-3.5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Target Link / URL / SKU Digits *</label>
                                <input
                                    type="text"
                                    value={genSku}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setGenSku(val);
                                        if (val.startsWith("http://") || val.startsWith("https://")) {
                                            setGenType("qr");
                                        }
                                    }}
                                    placeholder="e.g. https://access.beraxis.online/... or 893450091234"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-pink-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Encoding Format</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setGenType("qr")}
                                        className={`p-2 rounded-xl text-xs font-bold uppercase transition flex items-center justify-center gap-1.5 ${
                                            genType === "qr"
                                                ? "bg-pink-600 text-white shadow-md shadow-pink-600/30"
                                                : "bg-gray-800 text-gray-400 hover:text-white border border-gray-700"
                                        }`}
                                    >
                                        <QrCode size={14} /> QR Code
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setGenType("code128")}
                                        className={`p-2 rounded-xl text-xs font-bold uppercase transition flex items-center justify-center gap-1.5 ${
                                            genType === "code128"
                                                ? "bg-pink-600 text-white shadow-md shadow-pink-600/30"
                                                : "bg-gray-800 text-gray-400 hover:text-white border border-gray-700"
                                        }`}
                                    >
                                        <BarcodeIcon size={14} /> Code 128
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setGenType("ean13")}
                                        className={`p-2 rounded-xl text-xs font-bold uppercase transition flex items-center justify-center gap-1.5 ${
                                            genType === "ean13"
                                                ? "bg-pink-600 text-white shadow-md shadow-pink-600/30"
                                                : "bg-gray-800 text-gray-400 hover:text-white border border-gray-700"
                                        }`}
                                    >
                                        <BarcodeIcon size={14} /> EAN-13
                                    </button>
                                </div>
                            </div>

                            {/* Live Real-time Canvas Rendering */}
                            <div className="py-2">
                                <BarcodeAndQRCanvas
                                    value={genSku}
                                    type={genType}
                                    title="BERAXIS ENTERPRISE ASSET"
                                    subtitle="Standard 80mm x 50mm Thermal Sticker • Scannable"
                                    width={320}
                                    height={genType === "qr" ? 170 : 130}
                                    showText={true}
                                />
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => {
                                        navigator.clipboard.writeText(genSku);
                                        showToast("📋 Copied barcode content to clipboard!");
                                    }}
                                    className="px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold flex items-center gap-1.5"
                                >
                                    <Copy size={13} /> Copy Value
                                </button>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsGenModalOpen(false)}
                                        className="px-4 py-2 rounded-xl bg-gray-800 text-gray-400 hover:text-white text-xs font-semibold"
                                    >
                                        Close
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            window.print();
                                            setIsGenModalOpen(false);
                                            showToast("🖨️ Label sent to 80mm thermal printer!");
                                        }}
                                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-pink-600/30 flex items-center gap-1.5"
                                    >
                                        <Printer size={14} /> Print Thermal Label
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
