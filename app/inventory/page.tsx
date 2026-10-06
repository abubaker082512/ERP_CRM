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
    Upload,
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
    Eye,
    PlusCircle,
    MinusCircle,
    AlertTriangle,
    FileSpreadsheet,
    Check,
    Edit3,
    Hash,
    Scale
} from "lucide-react";

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
    uom: string; // Unit of Measure e.g. "Pcs", "Boxes", "Rolls", "Sets", "Kg"
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
        uom: "Units",
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
        uom: "Pcs",
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
        uom: "Pcs",
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
        uom: "Licenses",
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
        uom: "Units",
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
        uom: "Pcs",
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
        uom: "Boxes",
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

const UOM_OPTIONS = [
    "Pcs (Pieces)",
    "Boxes",
    "Cartons",
    "Units",
    "Sets",
    "Rolls",
    "Packs",
    "Kg (Kilograms)",
    "Meters",
    "Licenses"
];

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
    const [currentView, setCurrentView] = useState<ViewType>("list");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
    const [stockFilter, setStockFilter] = useState<"all" | "low_stock" | "in_stock" | "out_of_stock">("all");

    // Inline manual editing state
    const [editingQtyId, setEditingQtyId] = useState<string | null>(null);
    const [editingQtyVal, setEditingQtyVal] = useState<number>(0);

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [isBulkCsvModalOpen, setIsBulkCsvModalOpen] = useState(false);
    const [toastMsg, setToastMsg] = useState("");

    // Add Product Form State
    const [newProdName, setNewProdName] = useState("");
    const [newProdSku, setNewProdSku] = useState("");
    const [newProdBarcode, setNewProdBarcode] = useState("");
    const [newProdUom, setNewProdUom] = useState("Pcs");
    const [newProdCategory, setNewProdCategory] = useState("Hardware & Devices");
    const [newProdWarehouse, setNewProdWarehouse] = useState(WAREHOUSES[0]);
    const [newProdQty, setNewProdQty] = useState(10);
    const [newProdMinQty, setNewProdMinQty] = useState(5);
    const [newProdPrice, setNewProdPrice] = useState(199.99);
    const [newProdCost, setNewProdCost] = useState(110.00);

    // Fast Track Stock Adjuster State
    const [adjustProdId, setAdjustProdId] = useState(INITIAL_PRODUCTS[0].id);
    const [adjustType, setAdjustType] = useState<"add" | "subtract" | "damaged" | "set_exact">("add");
    const [adjustQty, setAdjustQty] = useState(1);
    const [adjustReason, setAdjustReason] = useState("Routine Stock Adjustment");

    // Bulk CSV Import State
    const [rawCsvText, setRawCsvText] = useState("");
    const [parsedCsvProducts, setParsedCsvProducts] = useState<Partial<Product>[]>([]);

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(""), 5000);
    };

    const handleCreateProduct = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProdName.trim()) return;

        const generatedSku = newProdSku.trim() || `SKU-${Date.now().toString().slice(-6)}`;
        const cleanUom = newProdUom.split(" ")[0]; // "Pcs", "Boxes", etc.
        const status: "in_stock" | "low_stock" | "out_of_stock" =
            newProdQty <= 0 ? "out_of_stock" : newProdQty <= newProdMinQty ? "low_stock" : "in_stock";

        const newProduct: Product = {
            id: `prod_${Date.now()}`,
            name: newProdName,
            sku: generatedSku,
            barcode: newProdBarcode || `89345${Math.floor(1000000 + Math.random() * 9000000)}`,
            quantity: Number(newProdQty),
            uom: cleanUom,
            min_quantity: Number(newProdMinQty),
            unit_price: Number(newProdPrice),
            cost_price: Number(newProdCost),
            category: newProdCategory,
            warehouse: newProdWarehouse,
            status: status
        };

        setProducts([newProduct, ...products]);
        setIsAddModalOpen(false);
        showToast(`✅ Registered SKU "${newProdName}" (${newProdQty} ${cleanUom}) into inventory!`);

        // Reset form
        setNewProdName("");
        setNewProdSku("");
        setNewProdBarcode("");
    };

    // Fast Track Single Action (Inline + / - / Damaged)
    const handleQuickStockStep = (product: Product, delta: number, type: "add" | "subtract" | "damaged") => {
        setProducts(products.map(p => {
            if (p.id === product.id) {
                const newQty = Math.max(0, p.quantity + delta);
                const status: "in_stock" | "low_stock" | "out_of_stock" =
                    newQty <= 0 ? "out_of_stock" : newQty <= p.min_quantity ? "low_stock" : "in_stock";
                return {
                    ...p,
                    quantity: newQty,
                    status
                };
            }
            return p;
        }));

        if (type === "add") {
            showToast(`📈 Added +${Math.abs(delta)} ${product.uom} to "${product.name}" (Now: ${Math.max(0, product.quantity + delta)} ${product.uom})`);
        } else if (type === "subtract") {
            showToast(`📉 Subtracted ${Math.abs(delta)} ${product.uom} from "${product.name}" (Now: ${Math.max(0, product.quantity + delta)} ${product.uom})`);
        } else {
            showToast(`💥 Logged ${Math.abs(delta)} damaged ${product.uom} for "${product.name}"!`);
        }
    };

    // Save inline manually typed exact quantity
    const handleSaveManualQuantity = (productId: string) => {
        const target = products.find(p => p.id === productId);
        if (!target) return;

        const manualQty = Math.max(0, Number(editingQtyVal) || 0);
        setProducts(products.map(p => {
            if (p.id === productId) {
                const status: "in_stock" | "low_stock" | "out_of_stock" =
                    manualQty <= 0 ? "out_of_stock" : manualQty <= p.min_quantity ? "low_stock" : "in_stock";
                return {
                    ...p,
                    quantity: manualQty,
                    status
                };
            }
            return p;
        }));

        setEditingQtyId(null);
        showToast(`✏️ Updated "${target.name}" stock manually to ${manualQty} ${target.uom}!`);
    };

    const handleExecuteAdjustment = (e: React.FormEvent) => {
        e.preventDefault();
        const targetProd = products.find(p => p.id === adjustProdId);
        if (!targetProd) return;

        let newQty = 0;
        if (adjustType === "set_exact") {
            newQty = Math.max(0, adjustQty);
        } else if (adjustType === "add") {
            newQty = targetProd.quantity + adjustQty;
        } else {
            newQty = Math.max(0, targetProd.quantity - adjustQty);
        }

        setProducts(products.map(p => {
            if (p.id === adjustProdId) {
                const status: "in_stock" | "low_stock" | "out_of_stock" =
                    newQty <= 0 ? "out_of_stock" : newQty <= p.min_quantity ? "low_stock" : "in_stock";
                return {
                    ...p,
                    quantity: newQty,
                    status
                };
            }
            return p;
        }));

        setIsAdjustModalOpen(false);
        showToast(`⚡ Stock Adjusted for "${targetProd.name}": Set to ${newQty} ${targetProd.uom} (${adjustReason})`);
    };

    // Bulk CSV Parser
    const handleParseCsv = (text: string) => {
        setRawCsvText(text);
        if (!text.trim()) {
            setParsedCsvProducts([]);
            return;
        }

        const lines = text.trim().split("\n");
        if (lines.length <= 1) {
            setParsedCsvProducts([]);
            return;
        }

        const parsed: Partial<Product>[] = [];
        const startIdx = lines[0].toLowerCase().includes("name") || lines[0].toLowerCase().includes("sku") ? 1 : 0;

        for (let i = startIdx; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const cols = line.split(",").map(c => c.trim().replace(/^["']|["']$/g, ""));
            if (cols.length >= 2) {
                parsed.push({
                    name: cols[0] || `Product Item ${i}`,
                    sku: cols[1] || `SKU-BULK-${Date.now().toString().slice(-4)}${i}`,
                    uom: cols[2] || "Pcs",
                    category: cols[3] || "Hardware & Devices",
                    warehouse: cols[4] || WAREHOUSES[0],
                    quantity: Number(cols[5]) || 10,
                    cost_price: Number(cols[6]) || 50,
                    unit_price: Number(cols[7]) || 99,
                    barcode: cols[8] || `89345${Math.floor(1000000 + Math.random() * 9000000)}`
                });
            }
        }
        setParsedCsvProducts(parsed);
    };

    const handleImportParsedCsv = () => {
        if (parsedCsvProducts.length === 0) return;

        const newItems: Product[] = parsedCsvProducts.map((p, idx) => {
            const qty = p.quantity ?? 10;
            const minQty = 5;
            const status: "in_stock" | "low_stock" | "out_of_stock" =
                qty <= 0 ? "out_of_stock" : qty <= minQty ? "low_stock" : "in_stock";

            return {
                id: `prod_bulk_${Date.now()}_${idx}`,
                name: p.name || "Bulk Product",
                sku: p.sku || `SKU-${Date.now().toString().slice(-4)}${idx}`,
                barcode: p.barcode || `89345${Math.floor(1000000 + Math.random() * 9000000)}`,
                quantity: qty,
                uom: p.uom || "Pcs",
                min_quantity: minQty,
                unit_price: p.unit_price ?? 99,
                cost_price: p.cost_price ?? 50,
                category: p.category || "Hardware & Devices",
                warehouse: p.warehouse || WAREHOUSES[0],
                status
            };
        });

        setProducts([...newItems, ...products]);
        setIsBulkCsvModalOpen(false);
        setRawCsvText("");
        setParsedCsvProducts([]);
        showToast(`🎉 Imported ${newItems.length} products with piece counts from CSV into Inventory!`);
    };

    const handleLoadSampleCsv = () => {
        const sample = `Name,SKU,UoM,Category,Warehouse,Quantity,Cost Price,Retail Price,Barcode\n"Logitech MX Master 3S Mouse",MOU-MX-3S,Pcs,"Hardware & Devices","Main DC Warehouse - Bay 2",25,65.00,99.99,893450033102\n"Dell UltraSharp 27 4K USB-C Monitor",MON-U27-4K,Units,"Hardware & Devices","Main DC Warehouse - Bay 4",12,380.00,599.00,893450044211\n"Zebra ZD421 Thermal Barcode Printer",PRN-ZB-ZD421,Pcs,"Office & Retail","Retail Hub East",8,220.00,349.50,893450055322\n"Thermal Paper 80mm Roll",PPR-80MM-ROLL,Boxes,"Office & Retail","Retail Hub East",50,22.00,45.00,893450066433`;
        handleParseCsv(sample);
    };

    const handleDownloadTemplate = () => {
        const template = `Name,SKU,UoM,Category,Warehouse,Quantity,Cost Price,Retail Price,Barcode\n"Example Item Name",SKU-EX-001,Pcs,"Hardware & Devices","Main DC Warehouse - Bay 1",100,50.00,100.00,893450011223`;
        const encodedUri = encodeURI("data:text/csv;charset=utf-8," + template);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "beraxis_product_bulk_upload_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("📥 Downloaded Product Bulk Upload CSV Template!");
    };

    const handleExportCSV = () => {
        const headers = ["ID", "Name", "SKU", "UoM", "Barcode", "Category", "Warehouse", "Quantity", "Min Qty", "Unit Price", "Cost Price", "Status"];
        const rows = products.map(p => [
            p.id,
            `"${p.name}"`,
            p.sku,
            p.uom,
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
                                Inventory & Stock Control
                            </h2>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-semibold">
                                {products.length} SKUs Managed
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            Manual piece count adjustments, Unit of Measure (UoM), bulk CSV uploads & multi-warehouse tracking
                        </p>
                    </div>

                    <div className="flex items-center flex-wrap gap-2.5">
                        <ViewSwitcher
                            currentView={currentView}
                            availableViews={["list", "kanban"]}
                            onViewChange={setCurrentView}
                        />

                        <button
                            onClick={() => setIsBulkCsvModalOpen(true)}
                            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white text-xs font-bold border border-purple-500/30 transition shadow-sm"
                        >
                            <Upload size={15} className="text-purple-300" /> Bulk CSV Upload
                        </button>

                        <button
                            onClick={() => setIsAdjustModalOpen(true)}
                            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-800/90 hover:bg-gray-700 text-gray-200 text-xs font-semibold border border-gray-700 transition shadow-sm"
                        >
                            <SlidersHorizontal size={15} className="text-amber-400" /> Fast Stock Adjust
                        </button>

                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-800/90 hover:bg-gray-700 text-gray-200 text-xs font-semibold border border-gray-700 transition shadow-sm"
                        >
                            <Download size={15} className="text-emerald-400" /> Export CSV
                        </button>

                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition transform hover:-translate-y-0.5"
                        >
                            <Plus size={16} /> + New SKU / Pieces
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
                        <div className="text-2xl font-black text-white">{totalStockQty.toLocaleString()} Pieces</div>
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
                                        <th className="px-4 py-3.5">Category & Location</th>
                                        <th className="px-4 py-3.5 text-right">Available Quantity (Manual Edit)</th>
                                        <th className="px-4 py-3.5 text-center">Fast Adjust (+/- / 💥)</th>
                                        <th className="px-4 py-3.5 text-right">Unit Retail</th>
                                        <th className="px-4 py-3.5 text-right">Valuation</th>
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
                                                        <div className="text-[11px] text-gray-400 font-mono flex items-center gap-1.5">
                                                            <span>{product.sku}</span>
                                                            <span className="text-[10px] bg-gray-800 px-1.5 py-0.2 rounded text-purple-300 border border-gray-700">
                                                                {product.uom}
                                                            </span>
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
                                                <div className="font-medium text-white">{product.category}</div>
                                                <div className="text-[10px] text-gray-500">{product.warehouse}</div>
                                            </td>

                                            {/* Manual Quantity Cell with Inline Editor */}
                                            <td className="px-4 py-3.5 text-right">
                                                {editingQtyId === product.id ? (
                                                    <div className="flex items-center justify-end gap-1">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={editingQtyVal}
                                                            onChange={(e) => setEditingQtyVal(Number(e.target.value))}
                                                            className="w-20 bg-gray-950 border border-purple-500 rounded-lg px-2 py-1 text-xs text-white font-mono font-bold text-right focus:outline-none"
                                                            autoFocus
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") handleSaveManualQuantity(product.id);
                                                                if (e.key === "Escape") setEditingQtyId(null);
                                                            }}
                                                        />
                                                        <button
                                                            onClick={() => handleSaveManualQuantity(product.id)}
                                                            className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"
                                                            title="Save quantity"
                                                        >
                                                            <Check size={13} />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingQtyId(null)}
                                                            className="p-1 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg"
                                                            title="Cancel"
                                                        >
                                                            <X size={13} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        onClick={() => {
                                                            setEditingQtyId(product.id);
                                                            setEditingQtyVal(product.quantity);
                                                        }}
                                                        className="cursor-pointer group/qty inline-flex flex-col items-end"
                                                        title="Click to manually edit exact piece count"
                                                    >
                                                        <div className="font-black text-sm text-white flex items-center gap-1 group-hover/qty:text-purple-300">
                                                            <span>{product.quantity.toLocaleString()}</span>
                                                            <span className="text-[11px] text-purple-300 font-normal">{product.uom}</span>
                                                            <Edit3 size={11} className="opacity-0 group-hover/qty:opacity-100 text-gray-400" />
                                                        </div>
                                                        <div className="text-[10px] text-gray-500">
                                                            Min Alert: {product.min_quantity}
                                                        </div>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Fast Track Maintain Buttons */}
                                            <td className="px-4 py-3.5 text-center">
                                                <div className="inline-flex items-center gap-1 bg-gray-950/80 p-1 rounded-xl border border-gray-800">
                                                    <button
                                                        onClick={() => handleQuickStockStep(product, 1, "add")}
                                                        title={`Add +1 ${product.uom}`}
                                                        className="p-1 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition"
                                                    >
                                                        <PlusCircle size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleQuickStockStep(product, -1, "subtract")}
                                                        title={`Subtract -1 ${product.uom}`}
                                                        className="p-1 hover:bg-amber-500/20 text-amber-400 rounded-lg transition"
                                                    >
                                                        <MinusCircle size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setAdjustProdId(product.id);
                                                            setAdjustType("damaged");
                                                            setAdjustReason("Damaged / Defective Stock Write-off");
                                                            setIsAdjustModalOpen(true);
                                                        }}
                                                        title="Log Damaged / Broken Units"
                                                        className="p-1 hover:bg-rose-500/20 text-rose-400 rounded-lg transition"
                                                    >
                                                        <AlertTriangle size={15} />
                                                    </button>
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
                                                <p className="text-[11px] text-gray-400 font-mono flex items-center gap-1.5">
                                                    <span>{product.sku}</span>
                                                    <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-semibold">
                                                        {product.uom}
                                                    </span>
                                                </p>
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

                                <div className="border-t border-gray-800 pt-3 space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <div>
                                            <div className="text-[10px] uppercase text-gray-500 font-semibold">Quantity On Hand</div>
                                            <div className="text-base font-black text-white">
                                                {product.quantity} <span className="text-xs font-normal text-purple-300">{product.uom}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] uppercase text-gray-500 font-semibold">Valuation</div>
                                            <div className="text-base font-black text-emerald-400">
                                                ${(product.quantity * product.unit_price).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick action bar */}
                                    <div className="flex items-center gap-1.5 pt-1">
                                        <button
                                            onClick={() => handleQuickStockStep(product, 1, "add")}
                                            className="flex-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white py-1 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                                        >
                                            <PlusCircle size={13} /> +1
                                        </button>
                                        <button
                                            onClick={() => handleQuickStockStep(product, -1, "subtract")}
                                            className="flex-1 bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white py-1 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                                        >
                                            <MinusCircle size={13} /> -1
                                        </button>
                                        <button
                                            onClick={() => {
                                                setAdjustProdId(product.id);
                                                setAdjustType("set_exact");
                                                setAdjustQty(product.quantity);
                                                setIsAdjustModalOpen(true);
                                            }}
                                            className="px-2.5 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white py-1 rounded-lg text-xs font-bold transition"
                                            title="Set Exact Manual Pieces"
                                        >
                                            <Edit3 size={13} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setAdjustProdId(product.id);
                                                setAdjustType("damaged");
                                                setIsAdjustModalOpen(true);
                                            }}
                                            className="px-2.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white py-1 rounded-lg text-xs font-bold transition"
                                            title="Log Damaged"
                                        >
                                            <AlertTriangle size={13} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal 1: + New Product SKU with UoM & Manual Pieces */}
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
                                <h3 className="text-lg font-bold text-white">Register Product SKU & Quantities</h3>
                                <p className="text-xs text-gray-400">Add trackable stock with piece counts, UoM & barcodes</p>
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

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Unit of Measure (UoM)</label>
                                    <select
                                        value={newProdUom}
                                        onChange={(e) => setNewProdUom(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                                    >
                                        {UOM_OPTIONS.map(u => (
                                            <option key={u} value={u}>{u}</option>
                                        ))}
                                    </select>
                                </div>
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
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Storage Warehouse</label>
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
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Initial Quantity ({newProdUom.split(" ")[0]})</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={newProdQty}
                                        onChange={(e) => setNewProdQty(Number(e.target.value))}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Min Reorder Level</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={newProdMinQty}
                                        onChange={(e) => setNewProdMinQty(Number(e.target.value))}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-purple-500"
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
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-purple-500"
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
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-purple-500"
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
                                    Save Product & Pieces
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal 2: Fast-Track Stock Adjuster (Add, Subtract, Set Exact, Damaged) */}
            {isAdjustModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setIsAdjustModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                                <SlidersHorizontal size={22} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Fast-Track Stock Maintainer</h3>
                                <p className="text-xs text-gray-400">Set exact piece counts, restock, or record damaged items</p>
                            </div>
                        </div>

                        <form onSubmit={handleExecuteAdjustment} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Target Product Item *</label>
                                <select
                                    value={adjustProdId}
                                    onChange={(e) => setAdjustProdId(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                                >
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} ({p.sku}) — Available: {p.quantity} {p.uom}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Adjustment Type Selector */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Action Mode</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setAdjustType("add")}
                                        className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                                            adjustType === "add"
                                                ? "bg-emerald-600/30 border-emerald-500 text-emerald-300"
                                                : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                                        }`}
                                    >
                                        <PlusCircle size={16} />
                                        <span>+ Add</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setAdjustType("subtract")}
                                        className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                                            adjustType === "subtract"
                                                ? "bg-amber-600/30 border-amber-500 text-amber-300"
                                                : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                                        }`}
                                    >
                                        <MinusCircle size={16} />
                                        <span>- Subtract</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setAdjustType("set_exact")}
                                        className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                                            adjustType === "set_exact"
                                                ? "bg-purple-600/30 border-purple-500 text-purple-300"
                                                : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                                        }`}
                                    >
                                        <Hash size={16} />
                                        <span>Set Exact</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setAdjustType("damaged")}
                                        className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                                            adjustType === "damaged"
                                                ? "bg-rose-600/30 border-rose-500 text-rose-300"
                                                : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                                        }`}
                                    >
                                        <AlertTriangle size={16} />
                                        <span>💥 Damaged</span>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">
                                    {adjustType === "set_exact" ? "New Exact Quantity (No. of Pieces/Units) *" : "Quantity of Units to Adjust *"}
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    required
                                    value={adjustQty}
                                    onChange={(e) => setAdjustQty(Number(e.target.value))}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Reason / Audit Memo</label>
                                <input
                                    type="text"
                                    value={adjustReason}
                                    onChange={(e) => setAdjustReason(e.target.value)}
                                    placeholder="e.g. Physical inventory count verified, damaged in transport"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setIsAdjustModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 text-xs font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30"
                                >
                                    Confirm Adjustment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal 3: Bulk CSV Upload & Import */}
            {isBulkCsvModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-3xl shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setIsBulkCsvModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                                <FileSpreadsheet size={22} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Bulk Product Import (CSV)</h3>
                                <p className="text-xs text-gray-400">Upload or paste spreadsheet rows with piece counts & UoM</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Action Bar for Template */}
                            <div className="flex items-center justify-between bg-gray-950/70 p-3 rounded-xl border border-gray-800">
                                <div className="text-xs text-gray-300">
                                    Need the standard CSV format? Download our pre-configured template.
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={handleLoadSampleCsv}
                                        className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold border border-gray-700 transition"
                                    >
                                        Load Sample Data
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDownloadTemplate}
                                        className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white text-xs font-bold border border-purple-500/30 transition flex items-center gap-1.5"
                                    >
                                        <Download size={13} /> Download Template
                                    </button>
                                </div>
                            </div>

                            {/* CSV Input Area */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">
                                    Paste CSV Content or Upload File
                                </label>
                                <textarea
                                    rows={5}
                                    value={rawCsvText}
                                    onChange={(e) => handleParseCsv(e.target.value)}
                                    placeholder="Name,SKU,UoM,Category,Warehouse,Quantity,Cost Price,Retail Price,Barcode&#10;&quot;Logitech MX Master 3S&quot;,MOU-MX-3S,Pcs,&quot;Hardware & Devices&quot;,&quot;Main DC Warehouse&quot;,25,65.00,99.99,893450033102"
                                    className="w-full bg-gray-950 border border-gray-700 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            {/* Live Parsed Preview Table */}
                            {parsedCsvProducts.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs font-semibold text-purple-400">
                                        <span>Preview Validated Products ({parsedCsvProducts.length} items ready to import)</span>
                                        <span className="text-emerald-400 flex items-center gap-1">
                                            <Check size={14} /> Ready to commit
                                        </span>
                                    </div>
                                    <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-800 bg-gray-950/60">
                                        <table className="w-full text-left text-[11px]">
                                            <thead className="bg-gray-900 text-gray-400 uppercase text-[9px] border-b border-gray-800 sticky top-0">
                                                <tr>
                                                    <th className="px-3 py-2">Name</th>
                                                    <th className="px-2 py-2">SKU</th>
                                                    <th className="px-2 py-2">UoM</th>
                                                    <th className="px-2 py-2">Category</th>
                                                    <th className="px-2 py-2 text-right">Quantity</th>
                                                    <th className="px-2 py-2 text-right">Cost</th>
                                                    <th className="px-2 py-2 text-right">Price</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-800">
                                                {parsedCsvProducts.map((p, idx) => (
                                                    <tr key={idx} className="hover:bg-purple-950/20">
                                                        <td className="px-3 py-2 font-medium text-white">{p.name}</td>
                                                        <td className="px-2 py-2 font-mono text-gray-300">{p.sku}</td>
                                                        <td className="px-2 py-2 text-purple-300">{p.uom || "Pcs"}</td>
                                                        <td className="px-2 py-2 text-gray-400">{p.category}</td>
                                                        <td className="px-2 py-2 text-right font-bold text-white">{p.quantity}</td>
                                                        <td className="px-2 py-2 text-right text-gray-400">${p.cost_price}</td>
                                                        <td className="px-2 py-2 text-right font-bold text-emerald-400">${p.unit_price}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setIsBulkCsvModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 text-xs font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={parsedCsvProducts.length === 0}
                                    onClick={handleImportParsedCsv}
                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition flex items-center gap-1.5"
                                >
                                    <Upload size={14} /> Import {parsedCsvProducts.length} Products
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
