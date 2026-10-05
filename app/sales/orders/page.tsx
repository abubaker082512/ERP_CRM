"use client";
import { fetchAPI } from "@/lib/api";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { useEffect, useState } from "react";
import { BarChart3, CheckCircle, Package, DollarSign, ArrowRight, FileText, Download, FileSpreadsheet, Plus } from "lucide-react";
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

type Order = {
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

export default function SalesOrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [currentView, setCurrentView] = useState<ViewType>("list");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetchAPI("/sales");
            if (res.ok) {
                const data = await res.json();
                const all = Array.isArray(data) ? data : [];
                setOrders(all);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const confirmedOrders = orders.filter(o => o.state === 'sale');
    const totalRevenue = confirmedOrders.reduce((sum, o) => sum + (o.amount_total || 0), 0);

    const handleExportCSV = () => {
        const headers = ["Order #", "Customer", "Total Amount", "Status", "Order Date", "Created Date"];
        const rows = orders.map(o => [
            o.name || o.id,
            o.customer_name || "Customer",
            o.amount_total || 0,
            o.state || "draft",
            o.date_order || "",
            o.created_at || ""
        ]);
        exportToCSV(`Sales_Orders_${new Date().toISOString().slice(0, 10)}`, headers, rows);
    };

    const handleExportExcel = () => {
        const headers = ["Order #", "Customer", "Total ($)", "Status", "Order Date", "Created Date"];
        const rows = orders.map(o => [
            o.name || o.id,
            o.customer_name || "Customer",
            o.amount_total || 0,
            o.state || "draft",
            o.date_order ? new Date(o.date_order).toLocaleDateString() : "",
            o.created_at ? new Date(o.created_at).toLocaleDateString() : ""
        ]);
        exportToExcel(`Sales_Orders_${new Date().toISOString().slice(0, 10)}`, headers, rows, "Sales_Orders");
    };

    const handleDownloadOrderPDF = async (e: React.MouseEvent, order: Order) => {
        e.stopPropagation();
        
        let linesData = order.lines || order.sale_order_line || [];
        if (linesData.length === 0) {
            try {
                const res = await fetchAPI(`/sales/${order.id}`);
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
            documentNumber: order.name || `SO-${order.id.slice(0, 8)}`,
            documentType: order.state === "sale" ? "Sales Order" : "Quotation",
            customerName: order.customer_name || "Valued Customer",
            date: new Date(order.date_order || order.created_at).toLocaleDateString(),
            status: order.state === "sale" ? "Confirmed Sale" : (order.state || "Draft").toUpperCase(),
            lines: formattedLines,
            amountTotal: order.amount_total || 0,
            notes: "Thank you for doing business with ABT IT Innovation PVT LTD."
        });
    };

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Sales"
                moduleIcon={<BarChart3 size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search orders..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-200">Sales Orders</h2>
                            <p className="text-sm text-gray-400 mt-1">
                                {confirmedOrders.length} confirmed orders • ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} total revenue
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
                            <Plus size={18} /> New Order
                        </Link>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-[#1E293B] rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Total Quotations & Orders</span>
                            <Package size={16} className="text-purple-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">{orders.length}</div>
                    </div>
                    <div className="bg-[#1E293B] rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Confirmed Revenue</span>
                            <DollarSign size={16} className="text-green-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">
                            ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                    <div className="bg-[#1E293B] rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Confirmed Sales</span>
                            <CheckCircle size={16} className="text-green-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">
                            {confirmedOrders.length}
                        </div>
                    </div>
                    <div className="bg-[#1E293B] rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Draft / Pending</span>
                            <FileText size={16} className="text-blue-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">
                            {orders.filter(o => o.state !== 'sale').length}
                        </div>
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
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Order #</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Customer</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Total</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Order Date</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr
                                        key={order.id}
                                        onClick={() => router.push(`/sales/${order.id}`)}
                                        className="border-b border-gray-700/60 hover:bg-white/5 transition-colors cursor-pointer"
                                    >
                                        <td className="px-4 py-3 font-semibold text-white">{order.name || order.id}</td>
                                        <td className="px-4 py-3 text-gray-300 font-medium">{order.customer_name || "Customer"}</td>
                                        <td className="px-4 py-3 text-green-400 font-semibold">${(order.amount_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${
                                                order.state === 'sale' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                                order.state === 'sent' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                                'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                                            }`}>
                                                {order.state === 'sale' ? 'Confirmed (Sale)' : order.state}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400">{new Date(order.date_order || order.created_at).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={(e) => handleDownloadOrderPDF(e, order)}
                                                    title="Download Order PDF"
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
                                {orders.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                                            No sales orders found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {['draft', 'sent', 'sale'].map(status => {
                            const filtered = orders.filter(o => o.state === status || (status === 'draft' && !['sent', 'sale'].includes(o.state)));
                            const statusLabel = status === 'sale' ? 'Confirmed Sale' : status.toUpperCase();

                            return (
                                <div key={status} className="bg-[#1E293B]/70 rounded-lg p-4 border border-gray-700 flex flex-col">
                                    <h3 className="font-semibold text-white mb-3 pb-2 border-b border-gray-700 capitalize">{statusLabel}</h3>
                                    <div className="space-y-3 flex-1">
                                        {filtered.map(order => (
                                            <div
                                                key={order.id}
                                                onClick={() => router.push(`/sales/${order.id}`)}
                                                className="bg-[#1E293B] border border-gray-700 rounded-lg p-4 hover:border-purple-500 transition-all cursor-pointer shadow group"
                                            >
                                                <div className="font-semibold text-white mb-1">{order.name || order.id}</div>
                                                <div className="text-sm text-gray-400 mb-2">{order.customer_name || "Customer"}</div>
                                                <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                                                    <span className="text-green-400 font-bold">${(order.amount_total || 0).toLocaleString()}</span>
                                                    <button
                                                        onClick={(e) => handleDownloadOrderPDF(e, order)}
                                                        title="Download PDF"
                                                        className="p-1 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 rounded text-xs flex items-center gap-1 border border-purple-500/30 opacity-80 group-hover:opacity-100 transition"
                                                    >
                                                        <Download size={12} /> PDF
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
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
