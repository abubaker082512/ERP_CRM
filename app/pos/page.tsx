"use client";

import { useState, useEffect, useRef } from "react";
import { fetchAPI } from "@/lib/api";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import {
  Calculator,
  ShoppingCart,
  DollarSign,
  X,
  Check,
  Search,
  CreditCard,
  Clock,
  Plus,
  Loader2,
  Printer,
  Tag,
  Sparkles,
  Filter,
  Receipt,
  User,
  CheckCircle2,
  Layers,
  Send,
  MessageCircle,
  Download,
  Share2,
  Percent,
  Coins,
  ShieldCheck,
  Building2,
  QrCode,
  ArrowRight
} from "lucide-react";

export type POSProduct = {
  id: string;
  name: string;
  list_price: number;
  cost_price?: number;
  sku?: string;
  category?: string;
  icon?: string;
};

const SEEDED_PRODUCTS: POSProduct[] = [
  // Bakery & Cafe F&B
  { id: "prod_bak_1", name: "Artisan French Butter Croissant", list_price: 4.50, cost_price: 1.10, sku: "BAK-CRS-01", category: "Bakery & Pastry", icon: "🥐" },
  { id: "prod_bak_2", name: "Pain au Chocolat (Dark Chocolate)", list_price: 5.25, cost_price: 1.35, sku: "BAK-PAC-02", category: "Bakery & Pastry", icon: "🍫" },
  { id: "prod_bak_3", name: "Artisan Truffle Beef Burger", list_price: 16.50, cost_price: 4.80, sku: "FNB-BGR-03", category: "Kitchen & Meals", icon: "🍔" },
  { id: "prod_bak_4", name: "Avocado & Sourdough Toast", list_price: 12.00, cost_price: 3.20, sku: "FNB-AVO-04", category: "Kitchen & Meals", icon: "🥑" },
  { id: "prod_bak_5", name: "Double Shot Oat Milk Flat White", list_price: 5.50, cost_price: 1.20, sku: "BEV-FLT-05", category: "Coffee & Drinks", icon: "☕" },
  { id: "prod_bak_6", name: "Iced Salted Caramel Macchiato", list_price: 6.25, cost_price: 1.45, sku: "BEV-MAC-06", category: "Coffee & Drinks", icon: "🧋" },
  { id: "prod_bak_7", name: "Traditional Tiramisu della Nonna", list_price: 8.50, cost_price: 2.10, sku: "DST-TRM-07", category: "Desserts", icon: "🍰" },
  
  // Tech, Retail & Hardware
  { id: "prod_1", name: "ERP Enterprise License (Annual)", list_price: 499.00, cost_price: 150.00, sku: "LIC-ERP-ENT", category: "Software & Licenses", icon: "💎" },
  { id: "prod_2", name: "Zebra RFID Handheld Scanner", list_price: 380.00, cost_price: 240.00, sku: "HW-ZEB-RFID", category: "Hardware & Devices", icon: "📟" },
  { id: "prod_3", name: "AI Sentiment Copilot Addon", list_price: 99.00, cost_price: 20.00, sku: "AI-SENT-MOD", category: "Software & Licenses", icon: "🧠" },
  { id: "prod_4", name: "Thermal Receipt Printer (80mm)", list_price: 145.00, cost_price: 85.00, sku: "PRN-THM-80", category: "Hardware & Devices", icon: "🖨️" },
  { id: "prod_5", name: "High-Performance Edge AI Gateway", list_price: 1250.00, cost_price: 800.00, sku: "GW-EDGE-01", category: "Hardware & Devices", icon: "⚡" },
  { id: "prod_6", name: "Custom ERP Implementation Service", list_price: 750.00, cost_price: 300.00, sku: "SRV-IMPL-01", category: "Consulting & Services", icon: "🛠️" },
  { id: "prod_7", name: "Barcoded Security NFC Badges (Pack 50)", list_price: 65.00, cost_price: 30.00, sku: "SEC-NFC-50", category: "Office & Retail", icon: "🏷️" },
  { id: "prod_8", name: "Enterprise Cloud Backup Storage (1TB)", list_price: 120.00, cost_price: 40.00, sku: "CLD-BK-1TB", category: "Software & Licenses", icon: "☁️" }
];

const CATEGORIES = [
  "All Items",
  "Bakery & Pastry",
  "Coffee & Drinks",
  "Kitchen & Meals",
  "Desserts",
  "Software & Licenses",
  "Hardware & Devices",
  "Consulting & Services",
  "Office & Retail"
];

const CUSTOMERS = [
  { id: "cust_walkin", name: "Walking / Retail Customer", phone: "", email: "counter@store.local", balance: 0 },
  { id: "cust_1", name: "Tariq Mansoor (Nexus Solutions)", phone: "+92 300 8472910", email: "tariq@nexussolutions.pk", balance: 2400 },
  { id: "cust_2", name: "Dr. Ayesha Malik (Shifa Healthcare)", phone: "+92 321 4458921", email: "ayesha.malik@shifa.org.pk", balance: 18500 },
  { id: "cust_3", name: "Zubair Hashmi (Crest Holdings)", phone: "+92 301 9823411", email: "zubair@crestholding.com", balance: 5200 },
  { id: "cust_4", name: "Sarah Vance (Design Studio)", phone: "+1 415 892 3011", email: "sarah.vance@beraxis.online", balance: 0 }
];

export default function POSPage() {
  const [session, setSession] = useState<any>({ id: "POS/SESS/2026/01", start_cash: 100, orders_count: 14, total_sales: 3420 });
  const [products, setProducts] = useState<POSProduct[]>(SEEDED_PRODUCTS);
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Items");
  const [selectedCustomer, setSelectedCustomer] = useState(CUSTOMERS[0]);
  const [loading, setLoading] = useState(false);

  // Discount & Tax States
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(0);

  // Checkout States
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "qr" | "account">("cash");
  const [amountPaid, setAmountPaid] = useState("");
  const [processing, setProcessing] = useState(false);

  // Receipt Modal State
  const [receiptOrder, setReceiptOrder] = useState<any>(null);
  const [receiptPaperSize, setReceiptPaperSize] = useState("58mm");
  const [receiptHeader, setReceiptHeader] = useState("Welcome to Beraxis Cloud POS");
  const [receiptFooter, setReceiptFooter] = useState("Thank you for choosing Beraxis!");
  const [toastMsg, setToastMsg] = useState("");

  // Register Drawer State
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // New Product Modal States
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("Hardware & Devices");
  const [newProdSku, setNewProdSku] = useState("");

  const searchInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4500);
  };

  const getCurrencySymbol = () => "$";

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await fetchAPI("/inventory/products");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      }
    } catch {
      // Keep seeded products
    }
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName.toLowerCase();
      const isInput = tag === "input" || tag === "textarea";

      if (e.key === "Escape") {
        if (isAddProductOpen) setIsAddProductOpen(false);
        else if (receiptOrder) resetTransaction();
        else if (checkoutMode) setCheckoutMode(false);
        else if (isRegisterOpen) setIsRegisterOpen(false);
        return;
      }

      if (isInput) {
        if (e.key === "Enter" && checkoutMode && amountPaid) {
          e.preventDefault();
          handleCheckout();
        }
        return;
      }

      if (e.key.toLowerCase() === "s" || e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }

      if (e.key.toLowerCase() === "c" && cart.length > 0 && !checkoutMode) {
        e.preventDefault();
        setCheckoutMode(true);
      }

      if (e.key.toLowerCase() === "p" && !isAddProductOpen) {
        e.preventDefault();
        setIsAddProductOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [checkoutMode, isAddProductOpen, cart, amountPaid, receiptOrder, isRegisterOpen]);

  const openSession = () => {
    setSession({ id: `POS/SESS/2026/0${Math.floor(10 + Math.random() * 90)}`, start_cash: 100, orders_count: 0, total_sales: 0 });
    showToast("✅ Cashier register session opened successfully.");
  };

  const closeSession = () => {
    if (!confirm("Close cashier register session and reconcile daily transactions?")) return;
    setSession(null);
    showToast("🔒 Cash register session closed.");
  };

  const addToCart = (product: POSProduct) => {
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
      setCart(cart.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const updateQty = (id: string, delta: number) => {
    setCart(cart.map(i => {
      if (i.id === id) {
        const newQty = i.qty + delta;
        return newQty > 0 ? { ...i, qty: newQty } : i;
      }
      return i;
    }).filter(i => i.qty > 0));
  };

  // Calculations
  const rawSubtotal = cart.reduce((sum, item) => sum + (item.list_price * item.qty), 0);
  const discountAmount = (rawSubtotal * discountPercent) / 100;
  const taxableAmount = rawSubtotal - discountAmount;
  const taxAmount = (taxableAmount * taxPercent) / 100;
  const finalTotal = taxableAmount + taxAmount;

  const handleCheckout = () => {
    const paid = parseFloat(amountPaid) || finalTotal;
    if (paid < finalTotal) {
      alert(`Paid amount ($${paid.toFixed(2)}) must be greater than or equal to total ($${finalTotal.toFixed(2)}).`);
      return;
    }

    setProcessing(true);
    setTimeout(() => {
      const orderNum = `POS/2026/00${Math.floor(100 + Math.random() * 900)}`;
      setReceiptOrder({
        name: orderNum,
        customer: selectedCustomer.name,
        customerPhone: selectedCustomer.phone,
        items: [...cart],
        subtotal: rawSubtotal,
        discountAmount,
        discountPercent,
        taxAmount,
        taxPercent,
        total: finalTotal,
        amountPaid: paid,
        changeDue: Math.max(0, paid - finalTotal),
        paymentMethod,
        date: new Date().toLocaleString()
      });
      setProcessing(false);
    }, 300);
  };

  const handleConfirmAndClose = () => {
    showToast(`✅ Order ${receiptOrder?.name || "POS Transaction"} confirmed and closed!`);
    resetTransaction();
  };

  const resetTransaction = () => {
    setCart([]);
    setCheckoutMode(false);
    setAmountPaid("");
    setDiscountPercent(0);
    setTaxPercent(0);
    setReceiptOrder(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsAppReceipt = () => {
    if (!receiptOrder) return;
    const phone = receiptOrder.customerPhone ? receiptOrder.customerPhone.replace(/[^0-9]/g, "") : "923008472910";
    const msg = encodeURIComponent(`*BERAXIS POS DIGITAL RECEIPT*\nOrder: ${receiptOrder.name}\nCustomer: ${receiptOrder.customer}\nTotal: $${receiptOrder.total.toFixed(2)}\nPaid: $${receiptOrder.amountPaid.toFixed(2)}\nChange: $${receiptOrder.changeDue.toFixed(2)}\n\nThank you for shopping with Beraxis!`);
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
    showToast("📱 WhatsApp digital receipt dispatched!");
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdPrice) return;

    const newProd: POSProduct = {
      id: `custom_${Date.now()}`,
      name: newProdName.trim(),
      list_price: parseFloat(newProdPrice) || 0,
      sku: newProdSku.trim() || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      category: newProdCategory,
      icon: "✨"
    };

    setProducts([newProd, ...products]);
    addToCart(newProd);
    setIsAddProductOpen(false);
    setNewProdName("");
    setNewProdPrice("");
    setNewProdSku("");
    showToast(`📦 Added ${newProd.name} directly to product catalog & cart!`);
  };

  const POS_MENU_ITEMS = [
    { name: "POS Terminal", href: "/pos" },
    { name: "Kitchen (KDS)", href: "/pos/kds" },
    { name: "Recipe BOM", href: "/pos/recipes" },
    { name: "Floor Plan & Tables", href: "/pos/tables" },
    { name: "Orders & Sessions", href: "/pos/orders" },
    { name: "Products & Pricing", href: "/pos/products" },
    { name: "Reporting", href: "/pos/reporting" },
    { name: "Configuration", href: "/pos/configuration" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-[#0B101E]">
        <StandardModuleHeader
          moduleName="Point of Sale"
          moduleIcon={<Calculator size={20} />}
          menuItems={POS_MENU_ITEMS}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col h-screen bg-[#0B101E]">
        <StandardModuleHeader
          moduleName="Point of Sale"
          moduleIcon={<Calculator size={20} />}
          menuItems={POS_MENU_ITEMS}
        />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-[#1E293B] border border-gray-800 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <Calculator size={36} />
            </div>
            <h2 className="text-2xl font-bold text-white">Point of Sale Terminal</h2>
            <p className="text-xs text-gray-400">Open a live cashier register session to start scanning products and processing fast checkouts.</p>
            <button onClick={openSession} className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl text-sm transition-all shadow-xl shadow-emerald-600/30 cursor-pointer active:scale-95">
              Open POS Register Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === "All Items" || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku || "").toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col h-screen bg-[#0B101E] text-white font-sans overflow-hidden select-none">
      {/* Printable Receipt Stylesheet Override */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          .printable-receipt, .printable-receipt * { visibility: visible; }
          .printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: ${receiptPaperSize === "58mm" ? "58mm" : receiptPaperSize === "80mm" ? "80mm" : "210mm"} !important;
            max-width: ${receiptPaperSize === "58mm" ? "58mm" : receiptPaperSize === "80mm" ? "80mm" : "210mm"} !important;
            background: white !important;
            color: black !important;
            padding: ${receiptPaperSize === "58mm" ? "3mm" : receiptPaperSize === "80mm" ? "5mm" : "20mm"} !important;
            font-size: ${receiptPaperSize === "58mm" ? "9px" : receiptPaperSize === "80mm" ? "11px" : "14px"} !important;
            line-height: 1.25 !important;
          }
          .no-print { display: none !important; }
        }
      `}} />

      {/* POS Top Standard Header */}
      <div className="no-print">
        <StandardModuleHeader
          moduleName="Point of Sale"
          moduleIcon={<Calculator size={20} />}
          menuItems={POS_MENU_ITEMS}
          searchPlaceholder="Scan barcode or type SKU..."
          onNewClick={() => setIsAddProductOpen(true)}
          newButtonText="+ Quick Add Item"
        />
      </div>

      {/* Active Session Sub-Header Bar */}
      <div className="h-12 border-b border-gray-800 bg-[#141A28] flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-sm no-print text-xs">
        <div className="flex items-center gap-3 text-white font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold">Register #1</span>
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
              {session.id}
            </span>
          </div>

          <div className="text-[10px] text-gray-500 hidden lg:flex items-center gap-2 pl-3 border-l border-gray-800">
            <span>Shortcuts:</span>
            <kbd className="bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700 font-mono font-bold text-gray-300">s</kbd> search |
            <kbd className="bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700 font-mono font-bold text-gray-300">c</kbd> checkout |
            <kbd className="bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700 font-mono font-bold text-gray-300">p</kbd> add item
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRegisterOpen(true)}
            className="bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
          >
            <Coins size={13} className="text-amber-400" />
            <span>Cash Register Float</span>
          </button>

          <button
            onClick={closeSession}
            className="text-rose-400 hover:bg-rose-500/10 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-rose-500/20"
          >
            Close Session
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-16 right-6 z-50 bg-[#1E293B]/95 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-2xl backdrop-blur-md animate-in fade-in">
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Terminal Viewport */}
      <div className="flex-1 flex overflow-hidden no-print min-h-0">
        {/* LEFT: Product Catalog & Category Tabs */}
        <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden min-h-0">
          {/* Search & Action Bar */}
          <div className="flex gap-3 mb-4 shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search products or scan barcode... (Press '/' or 's')"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-[#1E293B] border border-gray-700 rounded-2xl pl-11 pr-4 py-2.5 text-xs sm:text-sm text-white outline-none focus:border-emerald-500 shadow-sm transition-colors"
              />
            </div>

            <button
              onClick={() => setIsAddProductOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 rounded-2xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Plus size={15} />
              <span>Add Item</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 shrink-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                    : "bg-[#1E293B] text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto pr-1 min-h-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
              {filteredProducts.map(p => (
                <div
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="bg-[#1E293B] border border-gray-800 hover:border-emerald-500/80 rounded-2xl p-3.5 cursor-pointer flex flex-col justify-between transition-all shadow-sm active:scale-95 group hover:shadow-xl hover:shadow-emerald-900/10 min-h-[140px]"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-2xl p-2 rounded-xl bg-black/20 group-hover:scale-110 transition-transform">
                      {p.icon || "📦"}
                    </span>
                    {p.sku && (
                      <span className="text-[9px] font-mono text-gray-400 bg-[#0F172A] px-1.5 py-0.5 rounded border border-gray-800">
                        {p.sku}
                      </span>
                    )}
                  </div>

                  <div className="mt-2">
                    <p className="text-xs font-semibold text-white truncate group-hover:text-emerald-300 transition-colors">
                      {p.name}
                    </p>
                    <p className="text-emerald-400 font-bold font-mono text-sm mt-0.5">
                      ${(p.list_price || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: POS Customer & Order Cart Panel */}
        <div className="w-[380px] md:w-[420px] border-l border-gray-800 bg-[#141A28] flex flex-col shrink-0 z-10 min-h-0 shadow-2xl">
          {/* Customer Selector */}
          <div className="p-3.5 border-b border-gray-800 bg-[#0F172A] flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <User size={16} className="text-emerald-400 shrink-0" />
              <select
                value={selectedCustomer.id}
                onChange={(e) => {
                  const found = CUSTOMERS.find(c => c.id === e.target.value);
                  if (found) setSelectedCustomer(found);
                }}
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer w-full"
              >
                {CUSTOMERS.map(c => (
                  <option key={c.id} value={c.id} className="bg-[#1E293B] text-white">
                    {c.name} {c.balance > 0 ? `(Bal: $${c.balance})` : ""}
                  </option>
                ))}
              </select>
            </div>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold px-2 py-1 rounded hover:bg-rose-500/10 cursor-pointer"
                title="Clear Cart"
              >
                Clear
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 min-h-0">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-2 opacity-60">
                <ShoppingCart size={48} className="text-gray-600" />
                <p className="text-xs font-medium">Cart is empty. Click any product to add.</p>
              </div>
            ) : cart.map((item) => (
              <div key={item.id} className="bg-[#1E293B] border border-gray-700/80 rounded-2xl p-3 flex flex-col gap-2 shadow-sm">
                <div className="flex justify-between items-start">
                  <h4 className="text-white font-medium text-xs w-3/4 leading-tight truncate">{item.name}</h4>
                  <p className="text-emerald-400 font-bold font-mono text-xs">
                    ${(item.list_price * item.qty).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-mono text-[11px]">${item.list_price.toFixed(2)} ea</span>
                  <div className="flex items-center bg-black/40 rounded-xl border border-gray-700 overflow-hidden">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="px-2.5 py-0.5 text-gray-300 hover:bg-white/10 font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-2 py-0.5 text-white font-mono text-xs font-bold min-w-[2rem] text-center">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="px-2.5 py-0.5 text-gray-300 hover:bg-white/10 font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Pricing & Fast Checkout Footer */}
          <div className="p-4 md:p-5 bg-[#0B101E] border-t border-gray-800 shrink-0 space-y-3 shadow-2xl">
            {/* Quick Discount & Tax Toggles */}
            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-1">
                <span className="text-gray-400 text-[10px] font-semibold">Discount:</span>
                {[0, 5, 10, 15].map(d => (
                  <button
                    key={d}
                    onClick={() => setDiscountPercent(d)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer ${
                      discountPercent === d ? "bg-purple-600 text-white" : "bg-[#1E293B] text-gray-400"
                    }`}
                  >
                    {d}%
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1">
                <span className="text-gray-400 text-[10px] font-semibold">Tax:</span>
                {[0, 5, 18].map(t => (
                  <button
                    key={t}
                    onClick={() => setTaxPercent(t)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer ${
                      taxPercent === t ? "bg-cyan-600 text-white" : "bg-[#1E293B] text-gray-400"
                    }`}
                  >
                    {t}%
                  </button>
                ))}
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1 text-xs text-gray-400 pt-1 border-t border-gray-800/80">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono text-gray-300">${rawSubtotal.toFixed(2)}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-purple-400">
                  <span>Discount ({discountPercent}%)</span>
                  <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              {taxPercent > 0 && (
                <div className="flex justify-between text-cyan-400">
                  <span>Sales Tax ({taxPercent}%)</span>
                  <span className="font-mono">+${taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base text-white pt-1 border-t border-gray-800">
                <span>Total Amount</span>
                <span className="text-emerald-400 font-mono text-lg">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Mode Numpad & Payment Method */}
            {checkoutMode ? (
              <div className="space-y-3 pt-2 animate-in slide-in-from-bottom-2">
                {/* Payment Method Tabs */}
                <div className="grid grid-cols-4 gap-1.5 bg-[#1E293B] p-1 rounded-xl border border-gray-800 text-[11px] font-bold text-center">
                  <button
                    onClick={() => setPaymentMethod("cash")}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                      paymentMethod === "cash" ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    💵 Cash
                  </button>
                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                      paymentMethod === "card" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    💳 Card
                  </button>
                  <button
                    onClick={() => setPaymentMethod("qr")}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                      paymentMethod === "qr" ? "bg-cyan-600 text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    📱 QR Pay
                  </button>
                  <button
                    onClick={() => setPaymentMethod("account")}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                      paymentMethod === "account" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    🧾 Credit
                  </button>
                </div>

                {/* Amount Tendered Input */}
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="number"
                    placeholder={`Tendered (Exact: $${finalTotal.toFixed(2)})`}
                    autoFocus
                    value={amountPaid}
                    onChange={e => setAmountPaid(e.target.value)}
                    className="w-full bg-[#1E293B] border border-emerald-500/50 rounded-xl pl-9 pr-3 py-2.5 text-white font-mono font-bold text-base outline-none focus:border-emerald-400 shadow-inner"
                  />
                </div>

                {/* Quick Bills Shortcuts */}
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: "Exact", val: finalTotal.toString() },
                    { label: "$50", val: "50" },
                    { label: "$100", val: "100" },
                    { label: "$500", val: "500" },
                  ].map((btn) => (
                    <button
                      key={btn.label}
                      onClick={() => setAmountPaid(btn.val)}
                      className="py-1 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer border border-white/5"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                {/* Validate / Cancel Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setCheckoutMode(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={processing || cart.length === 0}
                    className="flex-[2] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
                  >
                    {processing ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    <span>Validate & Pay</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAmountPaid(finalTotal.toString());
                  setCheckoutMode(true);
                }}
                disabled={cart.length === 0}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
              >
                <CreditCard size={18} />
                <span>Pay & Checkout ({cart.reduce((s, i) => s + i.qty, 0)} Items)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ORDER RECEIPT MODAL (WITH CONFIRM & CLOSE BUTTONS)                     */}
      {/* ========================================================================= */}
      {receiptOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-[#141C2E] border border-gray-700/80 rounded-3xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4 max-h-[92vh] animate-in zoom-in-95">
            {/* Modal Title & Close X */}
            <div className="flex items-center justify-between no-print border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <Receipt size={18} className="text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Order Receipt ({receiptPaperSize})</h3>
              </div>
              <button
                onClick={handleConfirmAndClose}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                title="Confirm & Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Printable Thermal Receipt Box */}
            <div className={`printable-receipt bg-white text-black rounded-2xl font-mono overflow-y-auto flex-1 shadow-inner ${
              receiptPaperSize === "58mm" ? "text-[10px] leading-tight p-3" : "text-xs p-5"
            }`}>
              <div className="text-center mb-3">
                <h2 className="text-base font-extrabold tracking-tight">BERAXIS CLOUD ERP</h2>
                <p className="text-[10px] text-gray-600 mt-0.5">{receiptHeader}</p>
                <p className="text-[10px] text-gray-600">{receiptOrder.date}</p>
                <p className="font-bold text-[11px] mt-1.5 text-black border-y border-dashed border-gray-400 py-0.5">
                  {receiptOrder.name}
                </p>
                <p className="text-[10px] text-gray-700 mt-1">Customer: {receiptOrder.customer}</p>
              </div>

              <div className="border-b border-dashed border-gray-400 pb-2 mb-2">
                <div className="grid grid-cols-12 font-bold mb-1 text-[10px]">
                  <span className="col-span-6">Item</span>
                  <span className="col-span-2 text-center">Qty</span>
                  <span className="col-span-4 text-right">Total</span>
                </div>
                {receiptOrder.items.map((item: any, i: number) => (
                  <div key={i} className="grid grid-cols-12 py-0.5 text-[10px]">
                    <span className="col-span-6 truncate">{item.name}</span>
                    <span className="col-span-2 text-center">{item.qty}</span>
                    <span className="col-span-4 text-right">${(item.list_price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-right text-[10px]">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span>${receiptOrder.subtotal.toFixed(2)}</span>
                </div>
                {receiptOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-purple-700">
                    <span>Discount ({receiptOrder.discountPercent}%):</span>
                    <span>-${receiptOrder.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {receiptOrder.taxAmount > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Sales Tax ({receiptOrder.taxPercent}%):</span>
                    <span>+${receiptOrder.taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-xs border-t border-dashed border-gray-400 pt-1 mt-1 text-black">
                  <span>TOTAL:</span>
                  <span>${receiptOrder.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700 pt-1">
                  <span>Payment ({receiptOrder.paymentMethod.toUpperCase()}):</span>
                  <span>${receiptOrder.amountPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-700">
                  <span>Change Due:</span>
                  <span>${receiptOrder.changeDue.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center mt-4 pt-3 border-t border-dashed border-gray-400 text-[9px] text-gray-500">
                <p>{receiptFooter}</p>
                <p className="mt-0.5 font-bold">www.beraxis.online</p>
              </div>
            </div>

            {/* DIRECT USER REQUEST: CONFIRM & CLOSE BUTTON + ACTIONS */}
            <div className="space-y-2 no-print pt-2 border-t border-gray-800">
              {/* PRIMARY: CONFIRM & CLOSE BUTTON */}
              <button
                onClick={handleConfirmAndClose}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
              >
                <CheckCircle2 size={16} />
                <span>Confirm & Close Order</span>
              </button>

              {/* Secondary Row: Print, WhatsApp, New Order */}
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Printer size={13} />
                  <span>Print</span>
                </button>

                <button
                  onClick={handleSendWhatsAppReceipt}
                  className="flex-1 py-2.5 bg-[#25D366] hover:bg-[#20BA56] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <MessageCircle size={13} />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={resetTransaction}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Next Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK ADD CUSTOM PRODUCT MODAL */}
      {isAddProductOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-[#141C2E] border border-gray-700 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Quick Add Item</h3>
                <p className="text-xs text-gray-400">Add custom line item or product to register</p>
              </div>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Product / Item Name *</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={e => setNewProdName(e.target.value)}
                  className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. Zebra Wireless Barcode Scanner"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Unit Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProdPrice}
                    onChange={e => setNewProdPrice(e.target.value)}
                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2.5 text-white font-mono placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                    placeholder="120.00"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Category</label>
                  <select
                    value={newProdCategory}
                    onChange={e => setNewProdCategory(e.target.value)}
                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {CATEGORIES.filter(c => c !== "All Items").map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">SKU / Barcode (Optional)</label>
                <input
                  type="text"
                  value={newProdSku}
                  onChange={e => setNewProdSku(e.target.value)}
                  className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2.5 text-white font-mono placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. 2008472910"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  Add to Cart & Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CASH REGISTER SUMMARY MODAL */}
      {isRegisterOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-[#141C2E] border border-gray-700 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Coins size={18} className="text-amber-400" />
                <h3 className="text-sm font-bold text-white">Cash Register Float & Balance</h3>
              </div>
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between p-3 rounded-xl bg-[#1E293B]">
                <span className="text-gray-400">Opening Cash Float</span>
                <span className="font-bold text-white font-mono">${session.start_cash.toFixed(2)}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-[#1E293B]">
                <span className="text-gray-400">Total Cash Sales</span>
                <span className="font-bold text-emerald-400 font-mono">${(session.total_sales * 0.6).toFixed(2)}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-[#1E293B]">
                <span className="text-gray-400">Total Card & QR Sales</span>
                <span className="font-bold text-purple-400 font-mono">${(session.total_sales * 0.4).toFixed(2)}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="font-bold text-emerald-300">Net Expected Cash in Drawer</span>
                <span className="font-bold text-emerald-300 font-mono text-sm">${(session.start_cash + session.total_sales * 0.6).toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close Window
              </button>
              <button
                onClick={() => {
                  setIsRegisterOpen(false);
                  closeSession();
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                Post to Ledger & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
