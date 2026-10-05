"use client";
import { fetchAPI } from '@/lib/api';
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { useEffect, useState } from "react";
import { Plus, FileText, DollarSign, Calendar, User, BarChart3, ArrowRight, Download, FileSpreadsheet } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { exportToCSV, exportToExcel, printQuotationPDF } from "@/lib/exportUtils";

const MENU_ITEMS = [
    { name: "Quotations", href: "/sales" },
    { name: "Orders", href: "/sales/orders" },
    { name: "Customers", href: "/sales/customers" },
    { name: "Products", href: "/sales/products" },
    { name: "Reporting", href: "/sales/reporting" },
    { name: "Configuration", href: "/sales/configuration" },
];

type Quotation = {
    id: string;
    name: string;
    customer_name?: string;
    amount_total: number;
    state: string;
    date_order?: string;
    created_at: string;
    lines?: any[];
    sale_order_line?: any[];
};

export default function SalesPage() {
    const router = useRouter();
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [currentView, setCurrentView] = useState<ViewType>("list");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuotations();
    }, []);

    const fetchQuotations = async () => {
        setLoading(true);
        try {
            const res = await fetchAPI("/sales");
            if (res.ok) {
                const data = await res.json();
                setQuotations(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error("Error fetching quotations:", error);
        } finally {
            setLoading(false);
        }
    };

    const totalValue = quotations.reduce((sum, q) => sum + (q.amount_total || 0), 0);

    const handleExportCSV = () => {
        const headers = ["Quotation #", "Customer", "Total Value", "Status", "Order Date", "Created Date"];
        const rows = quotations.map(q => [
            q.name || q.id,
            q.customer_name || "Customer",
            q.amount_total || 0,
            q.state || "draft",
            q.date_order || "",
            q.created_at || ""
        ]);
        exportToCSV(`Sales_Quotations_${new Date().toISOString().slice(0, 10)}`, headers, rows);
    };

    const handleExportExcel = () => {
        const headers = ["Quotation #", "Customer", "Total ($)", "Status", "Order Date", "Created Date"];
        const rows = quotations.map(q => [
            q.name || q.id,
            q.customer_name || "Customer",
            q.amount_total || 0,
            q.state || "draft",
            q.date_order ? new Date(q.date_order).toLocaleDateString() : "",
            q.created_at ? new Date(q.created_at).toLocaleDateString() : ""
        ]);
        exportToExcel(`Sales_Quotations_${new Date().toISOString().slice(0, 10)}`, headers, rows, "Quotations");
    };

    const handleDownloadQuotationPDF = async (e: React.MouseEvent, q: Quotation) => {
        e.stopPropagation();
        
        let linesData = q.lines || q.sale_order_line || [];
        if (linesData.length === 0) {
            try {
                const res = await fetchAPI(`/sales/${q.id}`);
                if (res.ok) {
                    const fullData = await res.json();
                    linesData = fullData.lines || fullData.sale_order_line || [];
                }
            } catch (err) {
                console.error("Failed to load line items for PDF", err);
            }
        }

        const formattedLines = linesData.map((line: any) => ({
            name: line.name || line.product_name || "Product Item",
            description: line.description || "",
            quantity: line.product_uom_qty || line.product_qty || line.quantity || 1,
            unitPrice: line.price_unit || line.unit_price || 0,
            subtotal: line.price_subtotal || (line.product_uom_qty || 1) * (line.price_unit || 0)
        }));

        printQuotationPDF({
            documentNumber: q.name || `SO-${q.id.slice(0, 8)}`,
            documentType: q.state === "sale" ? "Sales Order" : "Quotation",
            customerName: q.customer_name || "Valued Customer",
            date: new Date(q.date_order || q.created_at).toLocaleDateString(),
            status: q.state === "sale" ? "Confirmed Sale" : (q.state || "Draft").toUpperCase(),
            lines: formattedLines,
            amountTotal: q.amount_total || 0,
            notes: "Thank you for partnering with ABT IT Innovation PVT LTD. Please contact sales@abt.com for any inquiries."
        });
    };

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Sales"
                moduleIcon={<BarChart3 size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search quotations, orders..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-200">Quotations</h2>
                            <p className="text-sm text-gray-400 mt-1">
                                {quotations.length} quotations • ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} total value
                            </p>
                        </div>
                        <ViewSwitcher
                            currentView={currentView}
                            availableViews={["list", "kanban"]}
                            onViewChange={setCurrentView}
                        />
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExportExcel}
                            title="Export all to Excel (.xls)"
                            className="bg-[#1E293B] hover:bg-[#334155] border border-gray-700 text-gray-300 hover:text-white px-3 py-2 rounded-lg flex items-center gap-1.5 text-sm font-medium transition cursor-pointer"
                        >
                            <FileSpreadsheet size={16} className="text-emerald-400" />
                            <span className="hidden sm:inline">Export Excel</span>
                        </button>
                        <button
                            onClick={handleExportCSV}
                            title="Export all to CSV"
                            className="bg-[#1E293B] hover:bg-[#334155] border border-gray-700 text-gray-300 hover:text-white px-3 py-2 rounded-lg flex items-center gap-1.5 text-sm font-medium transition cursor-pointer"
                        >
                            <Download size={16} className="text-cyan-400" />
                            <span className="hidden sm:inline">CSV</span>
                        </button>
                        <Link
                            href="/sales/quotations/new"
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-md shadow-purple-900/30 transition-all cursor-pointer"
                        >
                            <Plus size={18} /> New Quotation
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center p-12">
                        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : currentView === "list" ? (
                    <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-hidden shadow-xl">
                        <table className="w-full">
                            <thead className="bg-[#0F172A] border-b border-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                                        Quotation #
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Customer</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Total</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Date</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quotations.map(q => (
                                    <tr
                                        key={q.id}
                                        onClick={() => router.push(`/sales/${q.id}`)}
                                        className="border-b border-gray-700/60 hover:bg-white/5 transition-colors cursor-pointer"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <FileText size={16} className="text-purple-400" />
                                                <span className="font-semibold text-white">{q.name || q.id}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-300 font-medium">{q.customer_name || "Customer"}</td>
                                        <td className="px-4 py-3 text-green-400 font-semibold">${(q.amount_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${
                                                q.state === 'sale' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                                q.state === 'sent' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                                'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                                            }`}>
                                                {q.state === 'sale' ? 'Confirmed (Sale)' : q.state}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 text-sm">
                                            {new Date(q.date_order || q.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={(e) => handleDownloadQuotationPDF(e, q)}
                                                    title="Download / Print Quotation PDF"
                                                    className="p-1.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 rounded border border-purple-500/30 flex items-center gap-1 text-xs font-medium transition cursor-pointer"
                                                >
                                                    <Download size={13} />
                                                    <span>PDF</span>
                                                </button>
                                                <span className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1 ml-1">
                                                    View <ArrowRight size={14} />
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {quotations.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                                            No quotations found. Click <strong className="text-purple-400">"+ New Quotation"</strong> to create your first quotation.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {['draft', 'sent', 'sale'].map(status => {
                            const filtered = quotations.filter(q => q.state === status || (status === 'draft' && !['sent', 'sale'].includes(q.state)));
                            const colTotal = filtered.reduce((s, q) => s + (q.amount_total || 0), 0);
                            const statusLabel = status === 'sale' ? 'Confirmed Sale' : status.toUpperCase();

                            return (
                                <div key={status} className="bg-[#1E293B]/70 rounded-lg p-4 border border-gray-700/80 flex flex-col">
                                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-700">
                                        <h3 className="font-semibold text-white capitalize">{statusLabel}</h3>
                                        <span className="text-xs text-gray-400">${colTotal.toLocaleString()}</span>
                                    </div>
                                    <div className="space-y-3 flex-1">
                                        {filtered.map(q => (
                                            <div
                                                key={q.id}
                                                onClick={() => router.push(`/sales/${q.id}`)}
                                                className="bg-[#1E293B] border border-gray-700 rounded-lg p-4 hover:border-purple-500 transition-all cursor-pointer shadow group"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-semibold text-white">{q.name}</span>
                                                    <span className="text-xs text-gray-500">{new Date(q.date_order || q.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <div className="text-sm text-gray-300 mb-2">{q.customer_name || "Customer"}</div>
                                                <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                                                    <span className="text-green-400 font-bold">${(q.amount_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                    <button
                                                        onClick={(e) => handleDownloadQuotationPDF(e, q)}
                                                        title="Download PDF"
                                                        className="p-1 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 rounded text-xs flex items-center gap-1 border border-purple-500/30 opacity-80 group-hover:opacity-100 transition"
                                                    >
                                                        <Download size={12} /> PDF
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {filtered.length === 0 && (
                                            <div className="text-center py-6 text-xs text-gray-500">No quotations in this stage</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
