"use client";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { useEffect, useState } from "react";
import {
    Plus,
    Package,
    TrendingUp,
    AlertCircle,
    Boxes,
    ArrowRightLeft,
    Download,
    Search,
    Barcode,
    Filter,
    CheckCircle2,
    X,
    Building2,
    Layers,
    DollarSign,
    RefreshCw,
    SlidersHorizontal,
    Sparkles,
    Trash2,
    Eye
} from "lucide-react";
import { fetchAPI } from "@/lib/api";

const MENU_ITEMS = [
    { name: "Products", href: "/inventory" },
    { name: "Operations", href: "/inventory/operations" },
    { name: "Warehouses", href: "/inventory/warehouses" },
    { name: "Reporting", href: "/inventory/reporting" },
    { name: "Configuration", href: "/inventory/configuration" },
];

export type Product = {
    id: string;
    name: string;
    sku: string;
    barcode?: string;
    quantity: number;
    min_quantity: number;
    unit_price: number;
    cost_price: number;
    category: string;
    warehouse: string;
    status: "in_stock" | "low_stock" | "out_of_stock";
    created_at?: string;
};

const INITIAL_PRODUCTS: Product[] = [
    {
        id: "prod_1",
        name: "Enterprise ERP Cloud Server Rack (1U)",
        sku: "SRV-RACK-001",
        barcode: "893450012984",
        quantity: 14,
        min_quantity: 5,
        unit_price: 2499.00,
        cost_price: 1650.00,
        category: "Hardware & Devices",
        warehouse: "Main DC Warehouse - Bay 4",
        status: "in_stock"
    },
    {
        id: "prod_2",
        name: "Dual-Band Wi-Fi 6 Mesh Access Point",
        sku: "NET-WIFI6-AP",
        barcode: "893450029381",
        quantity: 42,
        min_quantity: 10,
        unit_price: 189.99,
        cost_price: 110.00,
        category: "Hardware & Devices",
        warehouse: "Main DC Warehouse - Bay 2",
        status: "in_stock"
    },
    {
        id: "prod_3",
        name: "Omnidirectional 2D Barcode Scanner USB",
        sku: "POS-SCAN-2D",
        barcode: "893450041209",
        quantity: 4,
        min_quantity: 8,
        unit_price: 129.50,
        cost_price: 75.00,
        category: "Office & Retail",
        warehouse: "Retail Hub East",
        status: "low_stock"
    },
    {
        id: "prod_4",
        name: "Enterprise Database Multi-Tenant License (Annual)",
        sku: "LIC-DB-ENT-1Y",
        barcode: "893450077812",
        quantity: 99,
        min_quantity: 20,
        unit_price: 1200.00,
        cost_price: 450.00,
        category: "Software & Licenses",
        warehouse: "Digital Cloud Repository",
        status: "in_stock"
    },
    {
        id: "prod_5",
        name: "Smart POS Cash Drawer 24V RJ11",
        sku: "POS-DRW-24V",
        barcode: "893450099120",
        quantity: 2,
        min_quantity: 6,
        unit_price: 85.00,
        cost_price: 48.00,
        category: "Office & Retail",
        warehouse: "Retail Hub East",
        status: "low_stock"
    },
    {
        id: "prod_6",
        name: "Fiber Optic Patch Cord SC/UPC 10m",
        sku: "CAB-FO-10M",
        barcode: "893450055410",
        quantity: 120,
        min_quantity: 25,
        unit_price: 14.50,
        cost_price: 5.20,
        category: "Hardware & Devices",
        warehouse: "Main DC Warehouse - Bay 1",
        status: "in_stock"
    },
    {
        id: "prod_7",
        name: "Thermal Receipt Paper Rolls (80mm x 80m - Pack of 50)",
        sku: "POS-PPR-80MM",
        barcode: "893450066231",
        quantity: 0,
        min_quantity: 15,
        unit_price: 45.00,
        cost_price: 22.00,
        category: "Office & Retail",
        warehouse: "Retail Hub East",
        status: "out_of_stock"
    }
];

const WAREHOUSES = [
    "Main DC Warehouse - Bay 1",
    "Main DC Warehouse - Bay 2",
    "Main DC Warehouse - Bay 4",
    "Retail Hub East",
    "North Fulfillment Center",
    "Digital Cloud Repository"
];

const CATEGORIES = [
    "All Categories",
    "Hardware & Devices",
    "Software & Licenses",
    "Office & Retail",
    "Consulting & Services"
];

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
    const [currentView, setCurrentView] = useState<ViewType>("list");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
    const [stockFilter, setStockFilter] = useState<"all" | "low_stock" | "in_stock" | "out_of_stock">("all");
    const [loading, setLoading] = useState<boolean>(false);

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [toastMsg, setToastMsg] = useState("");

    // Add Product Form State
    const [newProdName, setNewProdName] = useState("");
    const [newProdSku, setNewProdSku] = useState("");
    const [newProdBarcode, setNewProdBarcode] = useState("");
    const [newProdCategory, setNewProdCategory] = useState("Hardware & Devices");
    const [newProdWarehouse, setNewProdWarehouse] = useState(WAREHOUSES[0]);
    const [newProdQty, setNewProdQty] = useState(10);
    const [newProdMinQty, setNewProdMinQty] = useState(5);
    const [newProdPrice, setNewProdPrice] = useState(199.99);
    const [newProdCost, setNewProdCost] = useState(110.00);

    // Stock Transfer Form State
    const [transferProdId, setTransferProdId] = useState(INITIAL_PRODUCTS[0].id);
    const [transferSourceWh, setTransferSourceWh] = useState(WAREHOUSES[0]);
    const [transferDestWh, setTransferDestWh] = useState(WAREHOUSES[1]);
    const [transferQty, setTransferQty] = useState(5);
    const [transferNotes, setTransferNotes] = useState("Inter-warehouse rebalancing transfer");

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(""), 5000);
    };

    const handleCreateProduct = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProdName.trim()) return;

        const generatedSku = newProdSku.trim() || `SKU-${Date.now().toString().slice(-6)}`;
        const status: "in_stock" | "low_stock" | "out_of_stock" =
            newProdQty <= 0 ? "out_of_stock" : newProdQty <= newProdMinQty ? "low_stock" : "in_stock";

        const newProduct: Product = {
            id: `prod_${Date.now()}`,
            name: newProdName,
            sku: generatedSku,
            barcode: newProdBarcode || `89345${Math.floor(1000000 + Math.random() * 9000000)}`,
            quantity: Number(newProdQty),
            min_quantity: Number(newProdMinQty),
            unit_price: Number(newProdPrice),
            cost_price: Number(newProdCost),
            category: newProdCategory,
            warehouse: newProdWarehouse,
            status: status
        };

        setProducts([newProduct, ...products]);
        setIsAddModalOpen(false);
        showToast(`✅ Product "${newProdName}" (${generatedSku}) successfully registered into inventory!`);

        // Reset form
        setNewProdName("");
        setNewProdSku("");
        setNewProdBarcode("");
    };

    const handleTransferStock = (e: React.FormEvent) => {
        e.preventDefault();
        const targetProd = products.find(p => p.id === transferProdId);
        if (!targetProd) return;

        if (targetProd.quantity < transferQty) {
            showToast(`⚠️ Transfer failed: Insufficient stock (Available: ${targetProd.quantity}, Requested: ${transferQty})`);
            return;
        }

        setProducts(products.map(p => {
            if (p.id === transferProdId) {
                const remainingQty = p.quantity - transferQty;
                return {
                    ...p,
                    quantity: remainingQty,
                    status: remainingQty <= 0 ? "out_of_stock" : remainingQty <= p.min_quantity ? "low_stock" : "in_stock"
                };
            }
            return p;
        }));

        setIsTransferModalOpen(false);
        showToast(`📦 Transferred ${transferQty} units of "${targetProd.name}" from ${transferSourceWh} ➔ ${transferDestWh}!`);
    };

    const handleExportCSV = () => {
        const headers = ["ID", "Name", "SKU", "Barcode", "Category", "Warehouse", "Quantity", "Min Qty", "Unit Price", "Cost Price", "Status"];
        const rows = products.map(p => [
            p.id,
            `"${p.name}"`,
            p.sku,
            p.barcode || "N/A",
            `"${p.category}"`,
            `"${p.warehouse}"`,
            p.quantity,
            p.min_quantity,
            p.unit_price,
            p.cost_price,
            p.status
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `beraxis_inventory_valuation_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("📥 Exported inventory stock valuation CSV report!");
    };

    // Filter Logic
    const filteredProducts = products.filter(p => {
        const matchesSearch =
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.barcode && p.barcode.includes(searchQuery));

        const matchesCat = selectedCategory === "All Categories" || p.category === selectedCategory;

        const matchesStock =
            stockFilter === "all" ||
            (stockFilter === "low_stock" && p.status === "low_stock") ||
            (stockFilter === "in_stock" && p.status === "in_stock") ||
            (stockFilter === "out_of_stock" && p.status === "out_of_stock");

        return matchesSearch && matchesCat && matchesStock;
    });

    const totalStockQty = products.reduce((sum, p) => sum + p.quantity, 0);
    const totalInventoryValue = products.reduce((sum, p) => sum + (p.quantity * p.unit_price), 0);
    const totalCostValue = products.reduce((sum, p) => sum + (p.quantity * p.cost_price), 0);
    const lowStockCount = products.filter(p => p.status === "low_stock" || p.status === "out_of_stock").length;

    return (
        <div className="flex flex-col min-h-screen bg-[#0a0d14] text-white">
            <StandardModuleHeader
                moduleName="Inventory"
                moduleIcon={<Package size={20} className="text-purple-400" />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search product name, SKU, or Barcode..."
                onSearch={setSearchQuery}
            />

            {/* Toast Notification */}
            {toastMsg && (
                <div className="fixed top-16 right-6 z-50 bg-purple-600 text-white px-5 py-3 rounded-xl shadow-2xl shadow-purple-900/50 flex items-center gap-3 border border-purple-400 animate-in fade-in slide-in-from-top-4 duration-300">
                    <Sparkles size={18} className="animate-spin text-purple-200" />
                    <span className="text-sm font-medium">{toastMsg}</span>
                </div>
            )}

            <div className="flex-1 overflow-auto p-6 max-w-7xl mx-auto w-full space-y-6">
                {/* Header Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900/60 p-4 rounded-2xl border border-gray-800 backdrop-blur-xl">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300 bg-clip-text text-transparent">
                                Inventory & Stock Valuation
                            </h2>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-semibold">
                                {products.length} SKUs Managed
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            Real-time multi-warehouse stock management, valuation, and barcode tracking
                        </p>
                    </div>

                    <div className="flex items-center flex-wrap gap-2.5">
                        <ViewSwitcher
                            currentView={currentView}
                            availableViews={["list", "kanban"]}
                            onViewChange={setCurrentView}
                        />

                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-800/90 hover:bg-gray-700 text-gray-200 text-xs font-semibold border border-gray-700 transition shadow-sm"
                        >
                            <Download size={15} className="text-emerald-400" /> Export Valuation CSV
                        </button>

                        <button
                            onClick={() => setIsTransferModalOpen(true)}
                            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-800/90 hover:bg-gray-700 text-gray-200 text-xs font-semibold border border-gray-700 transition shadow-sm"
                        >
                            <ArrowRightLeft size={15} className="text-cyan-400" /> Stock Transfer
                        </button>

                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition transform hover:-translate-y-0.5"
                        >
                            <Plus size={16} /> + New Product SKU
                        </button>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-gray-900/80 to-purple-950/20 p-4 rounded-2xl border border-gray-800 shadow-lg">
                        <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
                            <span>Total Units in Stock</span>
                            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                <Boxes size={18} />
                            </div>
                        </div>
                        <div className="text-2xl font-black text-white">{totalStockQty.toLocaleString()}</div>
                        <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1.5">
                            <span className="text-purple-400 font-medium">{products.length} distinct items</span> across 6 hubs
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900/80 to-emerald-950/20 p-4 rounded-2xl border border-gray-800 shadow-lg">
                        <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
                            <span>Total Inventory Retail Value</span>
                            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <TrendingUp size={18} />
                            </div>
                        </div>
                        <div className="text-2xl font-black text-emerald-400">${totalInventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1.5">
                            Cost Value: <span className="text-gray-300 font-semibold">${totalCostValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900/80 to-amber-950/20 p-4 rounded-2xl border border-gray-800 shadow-lg">
                        <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
                            <span>Stock Reorder Alerts</span>
                            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                <AlertCircle size={18} />
                            </div>
                        </div>
                        <div className="text-2xl font-black text-amber-400">{lowStockCount}</div>
                        <div className="text-[11px] text-amber-400/80 mt-1">
                            {lowStockCount > 0 ? "Items require purchase reordering" : "All SKUs healthy"}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900/80 to-blue-950/20 p-4 rounded-2xl border border-gray-800 shadow-lg">
                        <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
                            <span>Active Storage Warehouses</span>
                            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                <Building2 size={18} />
                            </div>
                        </div>
                        <div className="text-2xl font-black text-white">{WAREHOUSES.length}</div>
                        <div className="text-[11px] text-gray-400 mt-1">
                            Primary: <span className="text-blue-300">Main DC Warehouse</span>
                        </div>
                    </div>
                </div>

                {/* Filters and Category Tabs */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gray-900/40 p-3 rounded-2xl border border-gray-800">
                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                                    selectedCategory === cat
                                        ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                                        : "bg-gray-800/80 text-gray-400 hover:text-white hover:bg-gray-700"
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Filter size={13} /> Status:
                        </span>
                        <select
                            value={stockFilter}
                            onChange={(e: any) => setStockFilter(e.target.value)}
                            className="bg-gray-800 text-gray-200 text-xs font-semibold px-3 py-1.5 rounded-xl border border-gray-700 focus:outline-none focus:border-purple-500"
                        >
                            <option value="all">All Statuses</option>
                            <option value="in_stock">In Stock</option>
                            <option value="low_stock">Low Stock Alerts</option>
                            <option value="out_of_stock">Out of Stock</option>
                        </select>
                    </div>
                </div>

                {/* Main View: List or Kanban */}
                {currentView === "list" ? (
                    <div className="bg-gray-900/80 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl backdrop-blur-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-gray-950/80 text-gray-400 uppercase tracking-wider text-[10px] border-b border-gray-800 font-semibold">
                                    <tr>
                                        <th className="px-5 py-3.5">Product SKU & Name</th>
                                        <th className="px-4 py-3.5">Barcode</th>
                                        <th className="px-4 py-3.5">Category</th>
                                        <th className="px-4 py-3.5">Warehouse Location</th>
                                        <th className="px-4 py-3.5 text-right">Available Qty</th>
                                        <th className="px-4 py-3.5 text-right">Unit Price</th>
                                        <th className="px-4 py-3.5 text-right">Total Valuation</th>
                                        <th className="px-5 py-3.5 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/60">
                                    {filteredProducts.map(product => (
                                        <tr key={product.id} className="hover:bg-purple-950/10 transition-colors group">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-105 transition transform">
                                                        <Package size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white text-sm group-hover:text-purple-300 transition">
                                                            {product.name}
                                                        </div>
                                                        <div className="text-[11px] text-gray-400 font-mono">
                                                            {product.sku}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-1.5 text-gray-300 font-mono text-[11px]">
                                                    <Barcode size={13} className="text-gray-500" />
                                                    {product.barcode || "—"}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 text-gray-300">
                                                <span className="px-2.5 py-1 rounded-lg bg-gray-800/80 border border-gray-700 text-gray-300 text-[11px] font-medium">
                                                    {product.category}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-gray-300 text-[11px]">
                                                {product.warehouse}
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <div className="font-black text-sm text-white">
                                                    {product.quantity.toLocaleString()}
                                                </div>
                                                <div className="text-[10px] text-gray-500">
                                                    Min: {product.min_quantity}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 text-right text-gray-300 font-mono font-semibold">
                                                ${product.unit_price.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3.5 text-right font-black text-emerald-400 font-mono">
                                                ${(product.quantity * product.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                {product.status === "in_stock" && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
                                                        <CheckCircle2 size={12} /> In Stock
                                                    </span>
                                                )}
                                                {product.status === "low_stock" && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-semibold">
                                                        <AlertCircle size={12} /> Low Stock
                                                    </span>
                                                )}
                                                {product.status === "out_of_stock" && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px] font-semibold">
                                                        <X size={12} /> Out of Stock
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredProducts.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-12 text-center text-gray-500 text-sm">
                                                No inventory items match your search or filter.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    /* Kanban Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredProducts.map(product => (
                            <div
                                key={product.id}
                                className="bg-gray-900/80 border border-gray-800 hover:border-purple-500/50 rounded-2xl p-5 shadow-xl transition-all duration-200 hover:-translate-y-1 backdrop-blur-xl flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                                <Package size={18} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-sm">{product.name}</h3>
                                                <p className="text-[11px] text-gray-400 font-mono">{product.sku}</p>
                                            </div>
                                        </div>
                                        {product.status === "in_stock" ? (
                                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                                                In Stock
                                            </span>
                                        ) : product.status === "low_stock" ? (
                                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                                                Low Stock
                                            </span>
                                        ) : (
                                            <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold">
                                                Out of Stock
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-2 text-xs bg-gray-950/60 p-3 rounded-xl border border-gray-800/80 mb-4">
                                        <div className="flex justify-between text-gray-400">
                                            <span>Location:</span>
                                            <span className="text-gray-200 font-medium">{product.warehouse}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-400">
                                            <span>Barcode:</span>
                                            <span className="text-gray-300 font-mono">{product.barcode || "N/A"}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-400">
                                            <span>Unit Retail:</span>
                                            <span className="text-emerald-400 font-semibold">${product.unit_price.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-gray-800 pt-3 text-xs">
                                    <div>
                                        <div className="text-[10px] uppercase text-gray-500 font-semibold">Available Qty</div>
                                        <div className="text-base font-black text-white">{product.quantity} Units</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] uppercase text-gray-500 font-semibold">Valuation</div>
                                        <div className="text-base font-black text-emerald-400">
                                            ${(product.quantity * product.unit_price).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal 1: + New Product SKU */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-xl shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setIsAddModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                                <Plus size={22} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Create Inventory Product SKU</h3>
                                <p className="text-xs text-gray-400">Add a trackable stock item with valuation & barcode</p>
                            </div>
                        </div>

                        <form onSubmit={handleCreateProduct} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Product Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={newProdName}
                                    onChange={(e) => setNewProdName(e.target.value)}
                                    placeholder="e.g. Cisco Catalyst 48-Port PoE Switch"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">SKU Code</label>
                                    <input
                                        type="text"
                                        value={newProdSku}
                                        onChange={(e) => setNewProdSku(e.target.value)}
                                        placeholder="Auto-generated if blank"
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Barcode / EAN</label>
                                    <input
                                        type="text"
                                        value={newProdBarcode}
                                        onChange={(e) => setNewProdBarcode(e.target.value)}
                                        placeholder="e.g. 893450091234"
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Category</label>
                                    <select
                                        value={newProdCategory}
                                        onChange={(e) => setNewProdCategory(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                                    >
                                        <option value="Hardware & Devices">Hardware & Devices</option>
                                        <option value="Software & Licenses">Software & Licenses</option>
                                        <option value="Office & Retail">Office & Retail</option>
                                        <option value="Consulting & Services">Consulting & Services</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Primary Warehouse</label>
                                    <select
                                        value={newProdWarehouse}
                                        onChange={(e) => setNewProdWarehouse(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                                    >
                                        {WAREHOUSES.map(w => (
                                            <option key={w} value={w}>{w}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Initial Qty</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={newProdQty}
                                        onChange={(e) => setNewProdQty(Number(e.target.value))}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Min Reorder Qty</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={newProdMinQty}
                                        onChange={(e) => setNewProdMinQty(Number(e.target.value))}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Cost Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={newProdCost}
                                        onChange={(e) => setNewProdCost(Number(e.target.value))}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Retail Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={newProdPrice}
                                        onChange={(e) => setNewProdPrice(Number(e.target.value))}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 text-xs font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30"
                                >
                                    Save Product SKU
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal 2: Stock Transfer */}
            {isTransferModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setIsTransferModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                                <ArrowRightLeft size={22} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Inter-Warehouse Stock Transfer</h3>
                                <p className="text-xs text-gray-400">Move inventory between locations and hubs</p>
                            </div>
                        </div>

                        <form onSubmit={handleTransferStock} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Select Product Item *</label>
                                <select
                                    value={transferProdId}
                                    onChange={(e) => setTransferProdId(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                                >
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} ({p.sku}) — Available: {p.quantity} Units
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Source Warehouse</label>
                                    <select
                                        value={transferSourceWh}
                                        onChange={(e) => setTransferSourceWh(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                                    >
                                        {WAREHOUSES.map(w => (
                                            <option key={w} value={w}>{w}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Destination Warehouse</label>
                                    <select
                                        value={transferDestWh}
                                        onChange={(e) => setTransferDestWh(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                                    >
                                        {WAREHOUSES.map(w => (
                                            <option key={w} value={w}>{w}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Units to Transfer</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={transferQty}
                                    onChange={(e) => setTransferQty(Number(e.target.value))}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Transfer Memo / Reference</label>
                                <input
                                    type="text"
                                    value={transferNotes}
                                    onChange={(e) => setTransferNotes(e.target.value)}
                                    placeholder="e.g. Replenishing retail front for weekend surge"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setIsTransferModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 text-xs font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30"
                                >
                                    Execute Transfer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
