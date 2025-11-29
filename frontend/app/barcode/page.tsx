"use client";

import BarcodeHeader from "@/components/barcode/BarcodeHeader";
import { useEffect, useState } from "react";
import { Scan, Box, ArrowRight } from "lucide-react";

type Log = {
    id: string;
    barcode: string;
    scanned_at: string;
};

export default function BarcodePage() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [barcodeInput, setBarcodeInput] = useState("");

    useEffect(() => {
        fetch("http://localhost:8000/api/v1/barcode/logs")
            .then((r) => r.json())
            .then(setLogs)
            .catch(console.error);
    }, []);

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!barcodeInput.trim()) return;

        const res = await fetch("http://localhost:8000/api/v1/barcode/scan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ barcode: barcodeInput }),
        });

        if (res.ok) {
            const log = await res.json();
            setLogs([log, ...logs]);
            setBarcodeInput("");
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <BarcodeHeader />

            <div className="flex-1 overflow-auto p-6 flex flex-col items-center">
                <div className="w-full max-w-2xl">
                    <div className="bg-[#1E293B] rounded-xl p-8 mb-8 border border-gray-700 text-center">
                        <div className="w-20 h-20 bg-gray-700 rounded-full mx-auto mb-6 flex items-center justify-center">
                            <Scan size={40} className="text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Scan Your Barcode</h2>
                        <p className="text-gray-400 mb-8">Use a scanner or enter the code manually below.</p>

                        <form onSubmit={handleScan} className="relative max-w-md mx-auto">
                            <input
                                type="text"
                                value={barcodeInput}
                                onChange={(e) => setBarcodeInput(e.target.value)}
                                placeholder="Enter barcode..."
                                className="w-full bg-[#0F172A] border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none text-center text-lg tracking-widest font-mono"
                                autoFocus
                            />
                            <button type="submit" className="absolute right-2 top-2 bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded">
                                <ArrowRight size={20} />
                            </button>
                        </form>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-300 mb-4">Recent Scans</h3>
                    <div className="space-y-3">
                        {logs.map((log) => (
                            <div
                                key={log.id}
                                className="flex items-center gap-4 p-4 bg-[#1E293B] rounded-lg border border-gray-700"
                            >
                                <div className="bg-blue-500/20 p-2 rounded text-blue-400">
                                    <Box size={20} />
                                </div>
                                <div className="flex-1">
                                    <div className="font-mono text-lg text-white">{log.barcode}</div>
                                    <div className="text-xs text-gray-500">{new Date(log.scanned_at).toLocaleString()}</div>
                                </div>
                                <div className="text-sm text-green-400 font-medium">Logged</div>
                            </div>
                        ))}

                        {logs.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No scans yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
