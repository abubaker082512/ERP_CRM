"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import AppHeader from "@/components/layout/AppHeader";
import {
  Calculator,
  ShoppingCart,
  DollarSign,
  X,
  Check,
  Search,
  CreditCard,
  Plus,
  Loader2,
  Printer,
  CheckCircle2,
  XCircle,
  UtensilsCrossed,
  ShoppingBag,
  Flame,
  LayoutGrid,
  BookOpen,
  Barcode,
  Sparkles,
} from "lucide-react";
import { useBranchContext } from "@/lib/branchContext";

type PosIndustryMode =
  | "food_beverage"
  | "retail_supermarket"
  | "healthcare_wellness"
  | "automotive_workshop"
  | "fitness_sports_club";

const INDUSTRY_STARTER_CATALOGS: Record<
  PosIndustryMode,
  { name: string; list_price: number; cost_price: number; sku: string; category: string; icon: string }[]
> = {
  food_beverage: [
    { name: "Artisan Smash Burger", list_price: 14.5, cost_price: 4.8, sku: "FB-101", category: "Mains", icon: "🍔" },
    { name: "Truffle Margherita Pizza", list_price: 18.0, cost_price: 5.5, sku: "FB-102", category: "Mains", icon: "🍕" },
    { name: "Spanish Iced Latte", list_price: 5.5, cost_price: 1.4, sku: "FB-103", category: "Beverages", icon: "☕" },
    { name: "Crispy Fries & Aioli", list_price: 6.0, cost_price: 1.5, sku: "FB-104", category: "Sides", icon: "🍟" },
    { name: "Pistachio San Sebastian", list_price: 9.5, cost_price: 2.9, sku: "FB-105", category: "Desserts", icon: "🍰" },
  ],
  retail_supermarket: [
    { name: "Organic Whole Milk 1L", list_price: 3.99, cost_price: 2.4, sku: "8901001", category: "Dairy", icon: "🥛" },
    { name: "Artisan Sourdough Loaf", list_price: 4.5, cost_price: 1.8, sku: "8901002", category: "Bakery", icon: "🍞" },
    { name: "Extra Virgin Olive Oil 1L", list_price: 14.99, cost_price: 9.2, sku: "8901003", category: "Pantry", icon: "🫒" },
    { name: "Arabica Coffee Beans 500g", list_price: 16.5, cost_price: 10.0, sku: "8901004", category: "Beverages", icon: "🫘" },
    { name: "Fresh Avocados (Pack 4)", list_price: 5.99, cost_price: 3.5, sku: "8901005", category: "Produce", icon: "🥑" },
  ],
  healthcare_wellness: [
    { name: "General Consultation", list_price: 75.0, cost_price: 20.0, sku: "HC-201", category: "Consultation", icon: "🩺" },
    { name: "Ultrasonic Dental Scaling", list_price: 120.0, cost_price: 35.0, sku: "HC-202", category: "Dental", icon: "🦷" },
    { name: "Deep Tissue Therapy 60m", list_price: 95.0, cost_price: 30.0, sku: "HC-203", category: "Therapy", icon: "💆" },
    { name: "Vitamin IV Hydration Drip", list_price: 150.0, cost_price: 45.0, sku: "HC-204", category: "Wellness", icon: "💧" },
  ],
  automotive_workshop: [
    { name: "Full Synthetic Oil Change", list_price: 89.0, cost_price: 38.0, sku: "AW-301", category: "Service", icon: "🛢️" },
    { name: "Ceramic Brake Pads Set", list_price: 145.0, cost_price: 72.0, sku: "AW-302", category: "Parts", icon: "🛞" },
    { name: "3D Laser Wheel Alignment", list_price: 65.0, cost_price: 15.0, sku: "AW-303", category: "Service", icon: "🔧" },
    { name: "OBD-II Engine Diagnostics", list_price: 45.0, cost_price: 10.0, sku: "AW-304", category: "Diagnostics", icon: "💻" },
  ],
  fitness_sports_club: [
    { name: "Padel Court Booking (90m)", list_price: 48.0, cost_price: 10.0, sku: "SP-401", category: "Court", icon: "🎾" },
    { name: "Carbon Padel Racket Rental", list_price: 8.0, cost_price: 1.0, sku: "SP-402", category: "Rental", icon: "🏓" },
    { name: "Pro Padel Balls Tube (3x)", list_price: 9.5, cost_price: 4.5, sku: "SP-403", category: "Pro Shop", icon: "🟡" },
    { name: "Whey Protein Shake", list_price: 6.5, cost_price: 2.2, sku: "SP-404", category: "Cafe", icon: "🥤" },
  ],
};

export default function POSPage() {
  const { activeBranch, getEntityStorageKey } = useBranchContext();
  const [session, setSession] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [posTransactions, setPosTransactions] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [amountPaid, setAmountPaid] = useState("");
  const [terminalApproved, setTerminalApproved] = useState<"APPROVED" | "NOT APPROVED">("APPROVED");
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Card / Terminal" | "QR / Wallet" | "Split">("Card / Terminal");
  const [discountPct, setDiscountPct] = useState(0);
  const [taxPct, setTaxPct] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Industry-Adaptive Mode (Restaurant vs Supermarket vs Clinic vs Auto vs Club)
  const [posMode, setPosMode] = useState<PosIndustryMode>("retail_supermarket");
  // Restaurant F&B Controls
  const [orderType, setOrderType] = useState<"Dine-In" | "Takeaway" | "Delivery">("Dine-In");
  const [tableNumber, setTableNumber] = useState("Table 1");
  const [kitchenNotes, setKitchenNotes] = useState("");

  // Receipt Modal State
  const [receiptOrder, setReceiptOrder] = useState<any>(null);
  const [receiptHeader, setReceiptHeader] = useState("Welcome to Our Store");
  const [receiptFooter, setReceiptFooter] = useState("Thank you for your business!");
  const [receiptPaperSize, setReceiptPaperSize] = useState("80mm");

  // New Product Modal States
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdCost, setNewProdCost] = useState("");
  const [newProdSku, setNewProdSku] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("General");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  const searchInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const getCurrencySymbol = () => {
    if (typeof window !== "undefined") {
      const keyPrefix = getEntityStorageKey("settings");
      const cur = localStorage.getItem(`${keyPrefix}_currency`) || activeBranch?.currency || "USD";
      const symbols: Record<string, string> = {
        USD: "$", EUR: "€", GBP: "£", AUD: "$", CAD: "$", JPY: "¥", PKR: "₨", INR: "₹", AED: "AED ",
      };
      return symbols[cur] || "$";
    }
    return "$";
  };

  useEffect(() => {
    if (activeBranch?.industryId) {
      const ind = activeBranch.industryId;
      if (
        ind === "food_beverage" ||
        ind === "retail_supermarket" ||
        ind === "healthcare_wellness" ||
        ind === "automotive_workshop" ||
        ind === "fitness_sports_club"
      ) {
        setPosMode(ind);
      }
    }
    loadData();
  }, [activeBranch?.id, activeBranch?.industryId, getEntityStorageKey]);

  useEffect(() => {
    const keyPrefix = getEntityStorageKey("settings");
    const savedHeader = localStorage.getItem(`${keyPrefix}_receipt_header`);
    const savedFooter = localStorage.getItem(`${keyPrefix}_receipt_footer`);
    const savedSize = localStorage.getItem(`${keyPrefix}_receipt_size`);
    if (savedHeader) setReceiptHeader(savedHeader);
    else if (activeBranch?.name) setReceiptHeader(`Welcome to ${activeBranch.name}`);
    if (savedFooter) setReceiptFooter(savedFooter);
    if (savedSize) setReceiptPaperSize(savedSize);
  }, [receiptOrder, activeBranch, getEntityStorageKey]);

  const loadData = async () => {
    try {
      const sessKey = getEntityStorageKey("pos_session");
      const prodKey = getEntityStorageKey("pos_products");
      const txKey = getEntityStorageKey("pos_transactions");
      const savedSess = localStorage.getItem(sessKey);
      const savedProds = localStorage.getItem(prodKey);
      const savedTxs = localStorage.getItem(txKey);
      setSession(savedSess ? JSON.parse(savedSess) : { id: "pos_auto", state: "open", start_at: new Date().toISOString() });
      setProducts(savedProds ? JSON.parse(savedProds) : []);
      setPosTransactions(savedTxs ? JSON.parse(savedTxs) : []);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadStarterCatalog = (modeOverride?: PosIndustryMode) => {
    const targetMode = modeOverride || posMode;
    const starter = (INDUSTRY_STARTER_CATALOGS[targetMode] || INDUSTRY_STARTER_CATALOGS.retail_supermarket).map((item, i) => ({
      ...item,
      id: `prod_${targetMode}_${i + 1}`,
    }));
    const merged = [...starter, ...products.filter((p) => !starter.some((s) => s.sku === p.sku))];
    setProducts(merged);
    try {
      localStorage.setItem(getEntityStorageKey("pos_products"), JSON.stringify(merged));
    } catch {}
    showToast(`Loaded ${starter.length} starter items for ${targetMode.replace(/_/g, " ")}!`);
  };

  const addToCart = (product: any) => {
    const existing = cart.find((i) => i.id === product.id);
    if (existing) setCart(cart.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i)));
    else setCart([...cart, { ...product, qty: 1 }]);
  };

  // Barcode / SKU Instant Scan on Enter
  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim()) {
      e.preventDefault();
      const q = search.trim().toLowerCase();
      const match =
        products.find((p) => (p.sku || "").toLowerCase() === q) ||
        products.find((p) => p.name.toLowerCase().includes(q));
      if (match) {
        addToCart(match);
        setSearch("");
        showToast(`Scanned: ${match.name} (+1)`);
      }
    }
  };

  const updateQty = (id: string, delta: number) => {
    setCart(
      cart
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.list_price) || 0) * item.qty, 0);
  const discountAmount = subtotal * (Math.min(100, Math.max(0, discountPct)) / 100);
  const taxable = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxable * (Math.max(0, taxPct) / 100);
  const total = taxable + taxAmount;

  // Send Order to Restaurant Kitchen Display (KDS)
  const handleSendToKDS = () => {
    if (cart.length === 0) return;
    const kdsKey = getEntityStorageKey("kds_orders");
    let existingKds: any[] = [];
    try {
      const raw = localStorage.getItem(kdsKey);
      if (raw) existingKds = JSON.parse(raw);
    } catch {}
    const ticket = {
      id: `KDS-${Date.now().toString().slice(-4)}`,
      orderNumber: `#${Math.floor(100 + Math.random() * 900)}`,
      table: orderType === "Dine-In" ? tableNumber : orderType,
      type: orderType,
      status: "preparing",
      notes: kitchenNotes,
      items: cart.map((c) => ({ name: c.name, qty: c.qty, notes: kitchenNotes })),
      createdAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(kdsKey, JSON.stringify([ticket, ...existingKds]));
    } catch {}
    showToast(`Sent ${ticket.orderNumber} (${ticket.table}) to Kitchen Display (KDS)!`);
  };

  const handleCheckout = async () => {
    const paid = parseFloat(amountPaid || String(total));
    if (terminalApproved === "APPROVED" && (isNaN(paid) || paid + 0.001 < total)) {
      return alert("Paid amount must be >= total for an Approved POS terminal transaction.");
    }
    setProcessing(true);
    try {
      if (posMode === "food_beverage") handleSendToKDS();

      const orderName = `POS/${new Date().getTime().toString().slice(-6)}`;
      const txRecord = {
        id: `tx_${Date.now()}`,
        name: orderName,
        items: [...cart],
        subtotal,
        discountAmount,
        taxAmount,
        total,
        amount_total: total,
        amountPaid: terminalApproved === "APPROVED" ? paid : 0,
        changeDue: terminalApproved === "APPROVED" ? Math.max(0, paid - total) : 0,
        status: terminalApproved,
        state: terminalApproved === "APPROVED" ? "sale" : "cancel",
        paymentMethod,
        orderType: posMode === "food_beverage" ? `${orderType} (${tableNumber})` : paymentMethod,
        date: new Date().toLocaleString(),
        created_at: new Date().toISOString(),
      };

      const txKey = getEntityStorageKey("pos_transactions");
      const updatedTxs = [txRecord, ...posTransactions];
      setPosTransactions(updatedTxs);
      localStorage.setItem(txKey, JSON.stringify(updatedTxs));

      // Also sync to pos_orders for Enterprise Reports (/reports)
      try {
        const ordersKey = getEntityStorageKey("pos_orders");
        const existingOrders = JSON.parse(localStorage.getItem(ordersKey) || "[]");
        localStorage.setItem(ordersKey, JSON.stringify([txRecord, ...(Array.isArray(existingOrders) ? existingOrders : [])]));
      } catch {}

      setReceiptOrder(txRecord);
    } finally {
      setProcessing(false);
    }
  };

  const resetTransaction = () => {
    setCart([]);
    setCheckoutMode(false);
    setAmountPaid("");
    setKitchenNotes("");
    setTerminalApproved("APPROVED");
    setReceiptOrder(null);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdPrice) return;
    setAddLoading(true);
    try {
      const newProd = {
        id: `prod_${Date.now()}`,
        name: newProdName.trim(),
        list_price: parseFloat(newProdPrice),
        cost_price: newProdCost ? parseFloat(newProdCost) : 0.0,
        sku: newProdSku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
        category: newProdCategory.trim() || "General",
        icon: posMode === "food_beverage" ? "🍽️" : "📦",
      };
      const prodKey = getEntityStorageKey("pos_products");
      const updated = [newProd, ...products];
      setProducts(updated);
      localStorage.setItem(prodKey, JSON.stringify(updated));
      setIsAddProductOpen(false);
      setNewProdName("");
      setNewProdPrice("");
      setNewProdCost("");
      setNewProdSku("");
      showToast(`Added "${newProd.name}" to POS catalog!`);
    } finally {
      setAddLoading(false);
    }
  };

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category || "General")))];
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== "All" && (p.category || "General") !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || (p.sku || "").toLowerCase().includes(q);
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-[#0B101E]">
        <AppHeader title="Point of Sale" />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0B101E] text-white">
      {toastMsg && (
        <div className="fixed top-16 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xl flex items-center gap-2">
          <Sparkles size={14} /> {toastMsg}
        </div>
      )}

      {/* POS Header with Industry Mode Switcher & Restaurant / Supermarket Shortcuts */}
      <div className="border-b border-gray-800 bg-[#141A28] px-5 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 no-print">
        <div className="flex flex-wrap items-center gap-2.5">
          <Calculator className="text-emerald-400" size={20} />
          <span className="font-bold text-sm sm:text-base">{activeBranch?.name || "Workspace"} — Smart POS</span>
          <select
            value={posMode}
            onChange={(e) => setPosMode(e.target.value as PosIndustryMode)}
            className="px-3 py-1.5 rounded-xl bg-[#0B101E] border border-emerald-500/40 text-xs font-bold text-emerald-300 outline-none"
          >
            <option value="food_beverage">🍽️ Restaurant, Cafe &amp; Bakery Mode</option>
            <option value="retail_supermarket">🛒 Supermarket &amp; Retail Barcode Mode</option>
            <option value="healthcare_wellness">🩺 Clinic, Dental &amp; Salon Mode</option>
            <option value="automotive_workshop">🔧 Auto Workshop &amp; Parts Mode</option>
            <option value="fitness_sports_club">🎾 Gym, Padel &amp; Sports Club Mode</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {posMode === "food_beverage" && (
            <>
              <Link href="/pos/tables" className="px-3 py-1.5 rounded-xl bg-amber-600/20 border border-amber-500/30 text-amber-300 font-bold flex items-center gap-1">
                <LayoutGrid size={13} /> Tables
              </Link>
              <Link href="/pos/kds" className="px-3 py-1.5 rounded-xl bg-rose-600/20 border border-rose-500/30 text-rose-300 font-bold flex items-center gap-1">
                <Flame size={13} /> Kitchen (KDS)
              </Link>
              <Link href="/pos/recipes" className="px-3 py-1.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 font-bold flex items-center gap-1">
                <BookOpen size={13} /> Recipes
              </Link>
            </>
          )}
          {posMode === "retail_supermarket" && (
            <Link href="/barcode" className="px-3 py-1.5 rounded-xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 font-bold flex items-center gap-1">
              <Barcode size={13} /> Barcode Labels
            </Link>
          )}
          <button
            onClick={() => handleLoadStarterCatalog()}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-gray-200 font-semibold cursor-pointer"
          >
            + Load {posMode === "food_beverage" ? "Menu" : "Starter Items"}
          </button>
        </div>
      </div>

      {/* Restaurant Dine-In / Takeaway / Table Bar */}
      {posMode === "food_beverage" && (
        <div className="px-5 py-2.5 bg-[#111622] border-b border-gray-800 flex flex-wrap items-center gap-3 text-xs no-print">
          <div className="inline-flex p-1 rounded-xl bg-[#0B101E] border border-gray-800 gap-1">
            {(["Dine-In", "Takeaway", "Delivery"] as const).map((ot) => (
              <button
                key={ot}
                type="button"
                onClick={() => setOrderType(ot)}
                className={`px-3 py-1 rounded-lg font-bold cursor-pointer ${
                  orderType === ot ? "bg-amber-600 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                {ot}
              </button>
            ))}
          </div>
          {orderType === "Dine-In" && (
            <select
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#0B101E] border border-amber-500/30 text-amber-300 font-bold"
            >
              {Array.from({ length: 12 }, (_, i) => `Table ${i + 1}`).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}
          <input
            value={kitchenNotes}
            onChange={(e) => setKitchenNotes(e.target.value)}
            placeholder="Kitchen / Chef notes (e.g. extra spicy, no onions, allergy)..."
            className="flex-1 min-w-[200px] px-3 py-1.5 rounded-xl bg-[#0B101E] border border-gray-800 text-white"
          />
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={handleSendToKDS}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Flame size={13} /> Send to Kitchen (KDS)
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden no-print">
        {/* Left: Search/Barcode + Categories + Product Grid */}
        <div className="flex-1 flex flex-col p-5 overflow-hidden gap-4">
          <div className="flex flex-wrap gap-3 shrink-0">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={
                  posMode === "retail_supermarket"
                    ? "Scan Barcode / SKU and press Enter, or search item..."
                    : "Search menu items, services, or SKU..."
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleBarcodeKeyDown}
                className="w-full bg-[#1E293B] border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
              />
            </div>
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={15} /> Add Item
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 shrink-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                  selectedCategory === cat ? "bg-emerald-600 text-white" : "bg-[#1E293B] text-gray-300 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto pr-1">
            {filteredProducts.length === 0 ? (
              <div className="h-56 border border-dashed border-gray-800 rounded-2xl flex flex-col items-center justify-center text-center p-6 space-y-3">
                <p className="text-sm font-bold text-gray-200">
                  No items in {activeBranch?.name || "your workspace"} POS catalog yet
                </p>
                <p className="text-xs text-gray-400 max-w-md">
                  Load a ready-made starter catalog for your industry in one click, or add your own custom products/dishes.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => handleLoadStarterCatalog()}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                  >
                    + Load {posMode.replace(/_/g, " ").toUpperCase()} Starter Catalog
                  </button>
                  <button
                    onClick={() => setIsAddProductOpen(true)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold cursor-pointer"
                  >
                    + Add Custom Item
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="bg-[#1E293B] border border-gray-700 hover:border-emerald-500 rounded-2xl p-4 cursor-pointer flex flex-col justify-between transition-all active:scale-95"
                  >
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="text-2xl">{p.icon || (posMode === "food_beverage" ? "🍽️" : "📦")}</span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-black/30">{p.sku || "SKU"}</span>
                    </div>
                    <div className="mt-3">
                      <div className="text-[10px] uppercase text-gray-400 font-bold">{p.category || "General"}</div>
                      <p className="text-sm font-bold text-white truncate">{p.name}</p>
                      <p className="text-emerald-400 font-black text-base mt-1">
                        {getCurrencySymbol()}{(Number(p.list_price) || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Cart & Payment Panel */}
        <div className="w-full lg:w-[400px] border-t lg:border-t-0 lg:border-l border-gray-800 bg-[#141A28] flex flex-col shrink-0">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <span className="font-bold text-sm flex items-center gap-2">
              <ShoppingCart size={16} className="text-emerald-400" />
              {posMode === "food_beverage" ? `${orderType} · ${orderType === "Dine-In" ? tableNumber : "Counter"}` : "Checkout Cart"}
            </span>
            {cart.length > 0 && (
              <button onClick={() => setCart([])} className="text-xs text-rose-400 hover:underline cursor-pointer">
                Clear
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-64 lg:max-h-none">
            {cart.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-gray-500 text-xs">
                <ShoppingCart size={36} className="mb-2 opacity-40" />
                <p>Click or scan items to add to order</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="bg-[#1E293B] border border-gray-700 rounded-xl p-3 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white truncate">{item.name}</div>
                    <div className="text-[11px] text-gray-400">
                      {getCurrencySymbol()}{Number(item.list_price).toFixed(2)} × {item.qty}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-lg bg-black/30 hover:bg-white/10 font-bold cursor-pointer">-</button>
                    <span className="w-6 text-center text-xs font-bold">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-lg bg-black/30 hover:bg-white/10 font-bold cursor-pointer">+</button>
                  </div>
                  <div className="text-xs font-black text-emerald-400 w-16 text-right">
                    {getCurrencySymbol()}{(item.list_price * item.qty).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Discount, Tax & Payment Controls */}
          <div className="p-4 bg-[#0B101E] border-t border-gray-800 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between bg-[#141A28] border border-gray-800 rounded-xl px-3 py-1.5">
                <span className="text-gray-400">Discount %</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={discountPct}
                  onChange={(e) => setDiscountPct(Number(e.target.value))}
                  className="w-12 text-right bg-transparent text-white font-bold outline-none"
                />
              </div>
              <div className="flex items-center justify-between bg-[#141A28] border border-gray-800 rounded-xl px-3 py-1.5">
                <span className="text-gray-400">Tax / VAT %</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={taxPct}
                  onChange={(e) => setTaxPct(Number(e.target.value))}
                  className="w-12 text-right bg-transparent text-white font-bold outline-none"
                />
              </div>
            </div>

            <div className="space-y-1 text-gray-400">
              <div className="flex justify-between"><span>Subtotal</span><span>{getCurrencySymbol()}{subtotal.toFixed(2)}</span></div>
              {discountAmount > 0 && <div className="flex justify-between text-amber-400"><span>Discount</span><span>-{getCurrencySymbol()}{discountAmount.toFixed(2)}</span></div>}
              {taxAmount > 0 && <div className="flex justify-between"><span>Tax ({taxPct}%)</span><span>+{getCurrencySymbol()}{taxAmount.toFixed(2)}</span></div>}
              <div className="flex justify-between text-base font-black text-white pt-1 border-t border-gray-800">
                <span>Total Due</span>
                <span className="text-emerald-400">{getCurrencySymbol()}{total.toFixed(2)}</span>
              </div>
            </div>

            {checkoutMode ? (
              <div className="space-y-2.5">
                <div className="grid grid-cols-4 gap-1">
                  {(["Cash", "Card / Terminal", "QR / Wallet", "Split"] as const).map((pm) => (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => setPaymentMethod(pm)}
                      className={`py-1.5 rounded-lg text-[10px] font-bold border cursor-pointer ${
                        paymentMethod === pm ? "bg-emerald-600 text-white border-emerald-500" : "bg-[#141A28] text-gray-400 border-gray-800"
                      }`}
                    >
                      {pm}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  placeholder="Amount Tendered"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="w-full bg-[#1E293B] border border-emerald-500/50 rounded-xl px-3 py-2.5 text-white font-bold text-sm outline-none"
                />
                <div className="flex gap-2">
                  <button onClick={() => setCheckoutMode(false)} className="flex-1 bg-gray-800 py-2.5 rounded-xl font-bold cursor-pointer">
                    Back
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={processing}
                    className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check size={15} /> Complete Sale &amp; Receipt
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAmountPaid(total.toFixed(2));
                  setCheckoutMode(true);
                }}
                disabled={cart.length === 0}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <CreditCard size={17} /> Charge {getCurrencySymbol()}{total.toFixed(2)}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {receiptOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A2236] rounded-2xl p-6 w-full max-w-sm border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="font-bold text-sm">Receipt · {receiptOrder.name}</h3>
              <button onClick={resetTransaction} className="text-gray-400 hover:text-white cursor-pointer"><X size={16} /></button>
            </div>
            <div className="bg-white text-black rounded-xl p-4 font-mono text-xs space-y-2">
              <div className="text-center border-b border-dashed border-gray-400 pb-2">
                <div className="font-bold text-sm">{activeBranch?.name || "BERAXIS POS"}</div>
                <div className="text-[10px] text-gray-500">{receiptOrder.orderType} · {receiptOrder.date}</div>
              </div>
              {receiptOrder.items.map((it: any, idx: number) => (
                <div key={idx} className="flex justify-between">
                  <span>{it.qty}x {it.name}</span>
                  <span>{getCurrencySymbol()}{(it.list_price * it.qty).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-dashed border-gray-400 pt-2 font-bold flex justify-between">
                <span>TOTAL ({receiptOrder.paymentMethod})</span>
                <span>{getCurrencySymbol()}{receiptOrder.total.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => window.print()} className="flex-1 bg-purple-600 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                <Printer size={14} /> Print
              </button>
              <button onClick={resetTransaction} className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer">
                Next Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A2236] rounded-2xl p-6 w-full max-w-md border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Add POS Item / Dish / Service</h3>
              <button onClick={() => setIsAddProductOpen(false)} className="text-gray-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
              <input required value={newProdName} onChange={(e) => setNewProdName(e.target.value)} placeholder="Item Name *" className="w-full bg-[#0F172A] border border-white/15 rounded-xl px-3.5 py-2.5 text-white" />
              <div className="grid grid-cols-2 gap-3">
                <input required type="number" step="0.01" value={newProdPrice} onChange={(e) => setNewProdPrice(e.target.value)} placeholder="Sale Price *" className="w-full bg-[#0F172A] border border-white/15 rounded-xl px-3.5 py-2.5 text-white" />
                <input type="number" step="0.01" value={newProdCost} onChange={(e) => setNewProdCost(e.target.value)} placeholder="Cost Price" className="w-full bg-[#0F172A] border border-white/15 rounded-xl px-3.5 py-2.5 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input value={newProdCategory} onChange={(e) => setNewProdCategory(e.target.value)} placeholder="Category (e.g. Mains, Dairy)" className="w-full bg-[#0F172A] border border-white/15 rounded-xl px-3.5 py-2.5 text-white" />
                <input value={newProdSku} onChange={(e) => setNewProdSku(e.target.value)} placeholder="Barcode / SKU" className="w-full bg-[#0F172A] border border-white/15 rounded-xl px-3.5 py-2.5 text-white" />
              </div>
              <button type="submit" disabled={addLoading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold cursor-pointer">
                Save Item to POS Catalog
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
