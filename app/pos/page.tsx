"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import AppHeader from "@/components/layout/AppHeader";
import {
  Calculator,
  ShoppingCart,
  X,
  Check,
  Search,
  CreditCard,
  Plus,
  Printer,
  Flame,
  LayoutGrid,
  BookOpen,
  Barcode,
  Sparkles,
  PauseCircle,
  PlayCircle,
  RotateCcw,
  Scale,
  UserCheck,
  History,
  Users,
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
  {
    name: string;
    list_price: number;
    cost_price: number;
    sku: string;
    category: string;
    icon: string;
    weighed?: boolean;
    uom?: string;
  }[]
> = {
  food_beverage: [
    { name: "Artisan Smash Burger", list_price: 14.5, cost_price: 4.8, sku: "FB-101", category: "Mains", icon: "🍔" },
    { name: "Truffle Margherita Pizza", list_price: 18.0, cost_price: 5.5, sku: "FB-102", category: "Mains", icon: "🍕" },
    { name: "Crispy Calamari Starter", list_price: 11.0, cost_price: 3.6, sku: "FB-106", category: "Starters", icon: "🦑" },
    { name: "Spanish Iced Latte", list_price: 5.5, cost_price: 1.4, sku: "FB-103", category: "Beverages", icon: "☕" },
    { name: "Crispy Fries & Aioli", list_price: 6.0, cost_price: 1.5, sku: "FB-104", category: "Sides", icon: "🍟" },
    { name: "Pistachio San Sebastian", list_price: 9.5, cost_price: 2.9, sku: "FB-105", category: "Desserts", icon: "🍰" },
  ],
  retail_supermarket: [
    { name: "Organic Whole Milk 1L", list_price: 3.99, cost_price: 2.4, sku: "8901001", category: "Dairy", icon: "🥛", uom: "Units" },
    { name: "Artisan Sourdough Loaf", list_price: 4.5, cost_price: 1.8, sku: "8901002", category: "Bakery", icon: "🍞", uom: "Units" },
    { name: "Extra Virgin Olive Oil 1L", list_price: 14.99, cost_price: 9.2, sku: "8901003", category: "Pantry", icon: "🫒", uom: "Units" },
    { name: "Arabica Coffee Beans 500g", list_price: 16.5, cost_price: 10.0, sku: "8901004", category: "Beverages", icon: "🫘", uom: "Units" },
    { name: "Organic Honeycrisp Apples (per kg)", list_price: 4.8, cost_price: 2.6, sku: "8901006", category: "Produce (Weighed)", icon: "🍎", weighed: true, uom: "Kg" },
    { name: "Prime Grass-Fed Ribeye (per kg)", list_price: 28.5, cost_price: 17.0, sku: "8901007", category: "Butchery (Weighed)", icon: "🥩", weighed: true, uom: "Kg" },
    { name: "Aged Deli Cheddar (per kg)", list_price: 19.0, cost_price: 11.2, sku: "8901008", category: "Deli (Weighed)", icon: "🧀", weighed: true, uom: "Kg" },
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

const QUICK_MODIFIERS = ["No Onions", "Extra Spicy", "Gluten-Free", "No Ice", "Well Done", "Sauce on Side"];

export default function POSPage() {
  const { activeBranch, getEntityStorageKey } = useBranchContext();
  const [products, setProducts] = useState<any[]>([]);
  const [posTransactions, setPosTransactions] = useState<any[]>([]);
  const [heldCarts, setHeldCarts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [isRefundMode, setIsRefundMode] = useState(false);
  const [amountPaid, setAmountPaid] = useState("");
  const [splitCash, setSplitCash] = useState("");
  const [splitCard, setSplitCard] = useState("");
  const [splitBillWays, setSplitBillWays] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Card / Terminal" | "QR / Wallet" | "Split">("Card / Terminal");
  const [discountPct, setDiscountPct] = useState(0);
  const [serviceChargePct, setServiceChargePct] = useState(0);
  const [taxPct, setTaxPct] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Customer Loyalty / Lookup
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Industry-Adaptive Mode
  const [posMode, setPosMode] = useState<PosIndustryMode>("retail_supermarket");
  // Restaurant F&B Controls
  const [orderType, setOrderType] = useState<"Dine-In" | "Takeaway" | "Delivery">("Dine-In");
  const [tableNumber, setTableNumber] = useState("Table 1");
  const [kitchenNotes, setKitchenNotes] = useState("");
  const [editingCartItemId, setEditingCartItemId] = useState<string | null>(null);

  // Modals
  const [receiptOrder, setReceiptOrder] = useState<any>(null);
  const [isHeldDrawerOpen, setIsHeldDrawerOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdCost, setNewProdCost] = useState("");
  const [newProdSku, setNewProdSku] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("General");
  const [newProdWeighed, setNewProdWeighed] = useState(false);
  const [addLoading, setAddLoading] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const getAuthMeta = useCallback(() => {
    if (typeof window === "undefined") return { companyId: "CMP-001", email: "" };
    const companyId = activeBranch?.id || localStorage.getItem("beraxis_active_branch_id") || "CMP-001";
    let email = "";
    try {
      email = JSON.parse(localStorage.getItem("user") || "{}").email || "";
    } catch {}
    return { companyId, email };
  }, [activeBranch?.id]);

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

  const loadData = useCallback(async () => {
    try {
      const { companyId, email } = getAuthMeta();
      const prodKey = getEntityStorageKey("pos_products");
      const txKey = getEntityStorageKey("pos_transactions");
      const savedProds = localStorage.getItem(prodKey);
      const savedTxs = localStorage.getItem(txKey);
      let localProds = savedProds ? JSON.parse(savedProds) : [];
      let localTxs = savedTxs ? JSON.parse(savedTxs) : [];

      try {
        const res = await fetch(
          `/api/pos?company_id=${encodeURIComponent(companyId)}&email=${encodeURIComponent(email)}`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.products) && data.products.length > 0) {
            localProds = data.products;
            localStorage.setItem(prodKey, JSON.stringify(localProds));
          }
          if (Array.isArray(data.orders) && data.orders.length > 0) {
            localTxs = data.orders;
          }
          if (Array.isArray(data.heldCarts)) {
            setHeldCarts(data.heldCarts);
          }
        }
      } catch {}

      setProducts(localProds);
      setPosTransactions(localTxs);
    } finally {
      setLoading(false);
    }
  }, [getAuthMeta, getEntityStorageKey]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const qTable = sp.get("table");
      const qMode = sp.get("mode") as PosIndustryMode | null;
      if (qMode) setPosMode(qMode);
      if (qTable) {
        setPosMode("food_beverage");
        setOrderType("Dine-In");
        setTableNumber(qTable);
      } else if (activeBranch?.industryId) {
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
    }
    loadData();
  }, [activeBranch?.id, activeBranch?.industryId, loadData]);

  const handleLoadStarterCatalog = async (modeOverride?: PosIndustryMode) => {
    const targetMode = modeOverride || posMode;
    const starter = (INDUSTRY_STARTER_CATALOGS[targetMode] || INDUSTRY_STARTER_CATALOGS.retail_supermarket).map(
      (item, i) => ({
        ...item,
        id: `prod_${targetMode}_${i + 1}`,
        stockQty: item.weighed ? 50 : 120,
      })
    );
    const merged = [...starter, ...products.filter((p) => !starter.some((s) => s.sku === p.sku))];
    setProducts(merged);
    try {
      localStorage.setItem(getEntityStorageKey("pos_products"), JSON.stringify(merged));
      const { companyId, email } = getAuthMeta();
      await fetch("/api/pos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_products",
          company_id: companyId,
          email,
          products: merged,
          syncToInventory: true,
        }),
      });
    } catch {}
    showToast(`Loaded ${starter.length} ${targetMode === "food_beverage" ? "Restaurant Menu" : "Supermarket & POS"} items + synced Inventory!`);
  };

  const addToCart = (product: any) => {
    const defaultCourse =
      product.category === "Starters"
        ? "Starter"
        : product.category === "Desserts"
        ? "Dessert"
        : product.category === "Beverages"
        ? "Beverage"
        : "Main";
    const existing = cart.find((i) => i.id === product.id);
    if (existing) {
      const step = product.weighed ? 0.5 : 1;
      setCart(
        cart.map((i) =>
          i.id === product.id ? { ...i, qty: Number((i.qty + step).toFixed(3)) } : i
        )
      );
    } else {
      setCart([
        ...cart,
        {
          ...product,
          qty: product.weighed ? 0.5 : 1,
          course: defaultCourse,
          modifiers: [],
        },
      ]);
    }
  };

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
        showToast(`Scanned SKU ${match.sku}: ${match.name}`);
      }
    }
  };

  const updateQty = (id: string, delta: number) => {
    setCart(
      cart
        .map((i) => (i.id === id ? { ...i, qty: Number((i.qty + delta).toFixed(3)) } : i))
        .filter((i) => i.qty > 0.001)
    );
  };

  const setExactQty = (id: string, val: number) => {
    if (isNaN(val) || val <= 0) return;
    setCart(cart.map((i) => (i.id === id ? { ...i, qty: Number(val.toFixed(3)) } : i)));
  };

  const toggleItemModifier = (id: string, mod: string) => {
    setCart(
      cart.map((i) => {
        if (i.id !== id) return i;
        const mods: string[] = Array.isArray(i.modifiers) ? i.modifiers : [];
        return {
          ...i,
          modifiers: mods.includes(mod) ? mods.filter((m) => m !== mod) : [...mods, mod],
        };
      })
    );
  };

  const setItemCourse = (id: string, course: string) => {
    setCart(cart.map((i) => (i.id === id ? { ...i, course } : i)));
  };

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.list_price) || 0) * item.qty, 0);
  const discountAmount = subtotal * (Math.min(100, Math.max(0, discountPct)) / 100);
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const serviceChargeAmount =
    posMode === "food_beverage" ? afterDiscount * (Math.max(0, serviceChargePct) / 100) : 0;
  const taxable = afterDiscount + serviceChargeAmount;
  const taxAmount = taxable * (Math.max(0, taxPct) / 100);
  const total = Number((taxable + taxAmount).toFixed(2));

  // Park / Hold Cart
  const handleHoldCart = async () => {
    if (cart.length === 0) return;
    const { companyId, email } = getAuthMeta();
    const label =
      posMode === "food_beverage"
        ? `${orderType} · ${tableNumber}`
        : customerName.trim() || `Shopper #${heldCarts.length + 1}`;
    try {
      const res = await fetch("/api/pos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "hold_cart",
          company_id: companyId,
          email,
          label,
          customerName,
          posMode,
          tableNumber,
          items: cart,
          total,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setHeldCarts(data.heldCarts || []);
      }
    } catch {}
    setCart([]);
    showToast(`Parked cart "${label}" — ready for next customer!`);
  };

  const handleRecallHeldCart = async (held: any) => {
    setCart(held.items || []);
    if (held.customerName) setCustomerName(held.customerName);
    if (held.tableNumber) setTableNumber(held.tableNumber);
    setIsHeldDrawerOpen(false);
    try {
      const { companyId, email } = getAuthMeta();
      const res = await fetch("/api/pos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove_held_cart", company_id: companyId, email, holdId: held.id }),
      });
      if (res.ok) {
        const d = await res.json();
        setHeldCarts(d.heldCarts || []);
      }
    } catch {}
    showToast(`Recalled "${held.label}"!`);
  };

  // Send Order to Restaurant Kitchen Display (KDS) — Fixed unified schema!
  const handleSendToKDS = async () => {
    if (cart.length === 0) return;
    const now = new Date();
    const placedAt = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const orderNumber = `#${Math.floor(100 + Math.random() * 900)}`;
    const targetTable = orderType === "Dine-In" ? tableNumber : orderType;

    const ticket = {
      id: `KDS-${Date.now().toString().slice(-5)}`,
      orderNumber,
      tableNumber: targetTable,
      orderType,
      server: "POS Cashier",
      placedAt,
      createdAt: now.toISOString(),
      elapsedMinutes: 0,
      status: "queued" as const,
      notes: kitchenNotes,
      items: cart.map((c, idx) => ({
        id: `ki_${idx + 1}`,
        name: c.name,
        qty: c.qty,
        course: c.course || "Main",
        modifiers: [
          ...(Array.isArray(c.modifiers) ? c.modifiers : []),
          ...(kitchenNotes ? [kitchenNotes] : []),
        ],
      })),
    };

    // 1. Save to unified localStorage key read by /pos/kds
    try {
      const kdsKey = getEntityStorageKey("kds_tickets");
      const existing = JSON.parse(localStorage.getItem(kdsKey) || "[]");
      localStorage.setItem(kdsKey, JSON.stringify([ticket, ...(Array.isArray(existing) ? existing : [])]));

      // Update local Floor Plan table status if Dine-In
      if (orderType === "Dine-In") {
        const tblKey = getEntityStorageKey("pos_tables");
        const existingTables = JSON.parse(localStorage.getItem(tblKey) || "[]");
        if (Array.isArray(existingTables) && existingTables.length > 0) {
          const updatedTables = existingTables.map((t: any) =>
            String(t.number).toLowerCase() === tableNumber.toLowerCase()
              ? { ...t, status: "occupied", activeOrderTotal: total, currentGuests: t.capacity || 2 }
              : t
          );
          localStorage.setItem(tblKey, JSON.stringify(updatedTables));
        }
      }
    } catch {}

    // 2. Sync to isolated cluster API (/api/pos)
    try {
      const { companyId, email } = getAuthMeta();
      await fetch("/api/pos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_kds",
          company_id: companyId,
          email,
          ...ticket,
          currentTotal: total,
          guestName: customerName || "Dine-In Guest",
        }),
      });
    } catch {}

    showToast(`Fired ${ticket.orderNumber} (${targetTable}) to Kitchen Display (KDS)!`);
  };

  const handleCheckout = async () => {
    const cashPart = parseFloat(splitCash || "0") || 0;
    const cardPart = parseFloat(splitCard || "0") || 0;
    const paid =
      paymentMethod === "Split"
        ? Number((cashPart + cardPart).toFixed(2))
        : parseFloat(amountPaid || String(total));

    if (!isRefundMode && (isNaN(paid) || paid + 0.01 < total)) {
      alert("Tendered amount must cover the Total Due.");
      return;
    }

    setProcessing(true);
    try {
      if (posMode === "food_beverage" && !isRefundMode) {
        await handleSendToKDS();
      }

      const { companyId, email } = getAuthMeta();
      const res = await fetch("/api/pos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: isRefundMode ? "refund" : "checkout",
          isRefund: isRefundMode,
          company_id: companyId,
          email,
          posMode,
          customerName: customerName.trim() || "Walk-In Customer",
          customerPhone: customerPhone.trim(),
          items: cart,
          subtotal,
          discountAmount,
          serviceChargeAmount,
          taxAmount,
          total,
          amountPaid: paid,
          splitCash: paymentMethod === "Split" ? cashPart : paymentMethod === "Cash" ? paid : 0,
          splitCard: paymentMethod === "Split" ? cardPart : paymentMethod === "Card / Terminal" ? total : 0,
          changeDue: !isRefundMode ? Math.max(0, Number((paid - total).toFixed(2))) : 0,
          paymentMethod,
          orderType: posMode === "food_beverage" ? `${orderType} (${tableNumber})` : paymentMethod,
          tableNumber: posMode === "food_beverage" && orderType === "Dine-In" ? tableNumber : "",
        }),
      });

      const data = await res.json();
      const txRecord = data.transaction || {
        id: `tx_${Date.now()}`,
        name: `${isRefundMode ? "POS-RET" : "POS"}/${Date.now().toString().slice(-6)}`,
        isRefund: isRefundMode,
        customerName: customerName.trim() || "Walk-In Customer",
        items: [...cart],
        total: isRefundMode ? -total : total,
        amountPaid: paid,
        changeDue: Math.max(0, paid - total),
        paymentMethod,
        orderType: posMode === "food_beverage" ? `${orderType} (${tableNumber})` : paymentMethod,
        date: new Date().toLocaleString(),
      };

      const txKey = getEntityStorageKey("pos_transactions");
      const updatedTxs = [txRecord, ...posTransactions];
      setPosTransactions(updatedTxs);
      try {
        localStorage.setItem(txKey, JSON.stringify(updatedTxs));
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
    setIsRefundMode(false);
    setAmountPaid("");
    setSplitCash("");
    setSplitCard("");
    setSplitBillWays(1);
    setKitchenNotes("");
    setCustomerName("");
    setCustomerPhone("");
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
        weighed: newProdWeighed,
        uom: newProdWeighed ? "Kg" : "Units",
        icon: newProdWeighed ? "⚖️" : posMode === "food_beverage" ? "🍽️" : "📦",
      };
      const prodKey = getEntityStorageKey("pos_products");
      const updated = [newProd, ...products];
      setProducts(updated);
      localStorage.setItem(prodKey, JSON.stringify(updated));

      const { companyId, email } = getAuthMeta();
      await fetch("/api/pos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_products",
          company_id: companyId,
          email,
          products: updated,
          syncToInventory: true,
        }),
      });

      setIsAddProductOpen(false);
      setNewProdName("");
      setNewProdPrice("");
      setNewProdCost("");
      setNewProdSku("");
      setNewProdWeighed(false);
      showToast(`Added "${newProd.name}" & synced to Inventory!`);
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

      {/* POS Top Bar */}
      <div className="border-b border-gray-800 bg-[#141A28] px-5 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 no-print">
        <div className="flex flex-wrap items-center gap-2.5">
          <Calculator className="text-emerald-400" size={20} />
          <span className="font-bold text-sm sm:text-base">{activeBranch?.name || "Workspace"} — Smart POS</span>
          <select
            value={posMode}
            onChange={(e) => {
              const nextMode = e.target.value as PosIndustryMode;
              setPosMode(nextMode);
              setSelectedCategory("All");
            }}
            className="px-3 py-1.5 rounded-xl bg-[#0B101E] border border-emerald-500/40 text-xs font-bold text-emerald-300 outline-none"
          >
            <option value="retail_supermarket">🛒 Supermarket, Grocery &amp; Barcode POS</option>
            <option value="food_beverage">🍽️ Restaurant, Cafe, Tables &amp; KDS POS</option>
            <option value="healthcare_wellness">🩺 Clinic, Pharmacy &amp; Salon POS</option>
            <option value="automotive_workshop">🔧 Auto Workshop &amp; Parts POS</option>
            <option value="fitness_sports_club">🎾 Gym, Padel &amp; Club POS</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {posMode === "food_beverage" && (
            <>
              <Link href="/pos/tables" className="px-3 py-1.5 rounded-xl bg-amber-600/20 border border-amber-500/30 text-amber-300 font-bold flex items-center gap-1">
                <LayoutGrid size={13} /> Floor &amp; Tables
              </Link>
              <Link href="/pos/kds" className="px-3 py-1.5 rounded-xl bg-rose-600/20 border border-rose-500/30 text-rose-300 font-bold flex items-center gap-1">
                <Flame size={13} /> Kitchen (KDS)
              </Link>
              <Link href="/pos/recipes" className="px-3 py-1.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 font-bold flex items-center gap-1">
                <BookOpen size={13} /> Recipe BOM
              </Link>
            </>
          )}
          {posMode === "retail_supermarket" && (
            <Link href="/barcode" className="px-3 py-1.5 rounded-xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 font-bold flex items-center gap-1">
              <Barcode size={13} /> Barcode Labels
            </Link>
          )}
          <button
            onClick={() => setIsHeldDrawerOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
          >
            <PlayCircle size={13} /> Parked ({heldCarts.length})
          </button>
          <button
            onClick={() => setIsHistoryDrawerOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-bold flex items-center gap-1 cursor-pointer"
          >
            <History size={13} /> Receipts ({posTransactions.length})
          </button>
          <button
            onClick={() => handleLoadStarterCatalog()}
            className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold cursor-pointer"
          >
            + Load {posMode === "food_beverage" ? "Restaurant Menu" : "Supermarket Catalog"}
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
            placeholder="Ticket kitchen note (e.g. VIP table, nut allergy, fire mains together)..."
            className="flex-1 min-w-[200px] px-3 py-1.5 rounded-xl bg-[#0B101E] border border-gray-800 text-white"
          />
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={handleSendToKDS}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Flame size={13} /> Fire to Kitchen (KDS)
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
                    ? "Scan Barcode / SKU (e.g. 8901001) & press Enter, or search grocery / weighed item..."
                    : "Search dishes, beverages, or SKU..."
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
                  Load a ready-made starter catalog for {posMode === "food_beverage" ? "Restaurants & Cafes" : "Supermarkets & Retail"} in one click, or add custom items.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => handleLoadStarterCatalog()}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                  >
                    + Load {posMode === "food_beverage" ? "Restaurant Menu" : "Supermarket & Weighed Items"}
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
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase text-gray-400 font-bold">{p.category || "General"}</span>
                        {p.weighed && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold flex items-center gap-0.5">
                            <Scale size={9} /> /kg
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-white truncate mt-0.5">{p.name}</p>
                      <p className="text-emerald-400 font-black text-base mt-1">
                        {getCurrencySymbol()}{(Number(p.list_price) || 0).toFixed(2)}
                        {p.weighed ? <span className="text-[10px] text-gray-400 font-normal"> / kg</span> : null}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Cart, Scale/Modifiers, Loyalty & Checkout */}
        <div className="w-full lg:w-[430px] border-t lg:border-t-0 lg:border-l border-gray-800 bg-[#141A28] flex flex-col shrink-0">
          {/* Register Mode Header + Sale vs Refund Switch */}
          <div className="p-3.5 border-b border-gray-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShoppingCart size={16} className={isRefundMode ? "text-amber-400" : "text-emerald-400"} />
              <span className="font-bold text-xs sm:text-sm">
                {isRefundMode
                  ? "Counter Return / Refund"
                  : posMode === "food_beverage"
                  ? `${orderType} · ${orderType === "Dine-In" ? tableNumber : "Counter"}`
                  : "Register Cart"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsRefundMode(!isRefundMode)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer border ${
                  isRefundMode
                    ? "bg-amber-500/20 border-amber-500 text-amber-300"
                    : "bg-[#0B101E] border-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                <RotateCcw size={11} /> {isRefundMode ? "Refund Active" : "Return"}
              </button>
              {cart.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={handleHoldCart}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    <PauseCircle size={11} /> Hold
                  </button>
                  <button onClick={() => setCart([])} className="text-[11px] text-rose-400 hover:underline cursor-pointer px-1">
                    Clear
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Customer / Loyalty Bar */}
          <div className="px-3.5 py-2 bg-[#0F1523] border-b border-gray-800 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-[#141A28] border border-gray-800 rounded-lg px-2.5 py-1">
              <UserCheck size={12} className="text-emerald-400 shrink-0" />
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer / Member"
                className="w-full bg-transparent text-white text-[11px] outline-none"
              />
            </div>
            <input
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Phone / Loyalty #"
              className="bg-[#141A28] border border-gray-800 rounded-lg px-2.5 py-1 text-white text-[11px] outline-none"
            />
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-2 max-h-64 lg:max-h-none">
            {cart.length === 0 ? (
              <div className="h-36 flex flex-col items-center justify-center text-gray-500 text-xs">
                <ShoppingCart size={32} className="mb-2 opacity-40" />
                <p>Scan barcode or tap items to ring up</p>
              </div>
            ) : (
              cart.map((item) => {
                const isExpanded = editingCartItemId === item.id;
                return (
                  <div key={item.id} className="bg-[#1E293B] border border-gray-700 rounded-xl p-2.5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div
                        className="min-w-0 flex-1 cursor-pointer"
                        onClick={() => setEditingCartItemId(isExpanded ? null : item.id)}
                      >
                        <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                          <span>{item.name}</span>
                          {posMode === "food_beverage" && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">
                              {item.course || "Main"}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {getCurrencySymbol()}{Number(item.list_price).toFixed(2)} × {item.qty}{" "}
                          {item.weighed ? "kg" : ""}
                          {Array.isArray(item.modifiers) && item.modifiers.length > 0 && (
                            <span className="text-amber-300 ml-1">({item.modifiers.join(", ")})</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQty(item.id, item.weighed ? -0.25 : -1)}
                          className="w-6 h-6 rounded-lg bg-black/30 hover:bg-white/10 font-bold text-xs cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          step={item.weighed ? "0.05" : "1"}
                          value={item.qty}
                          onChange={(e) => setExactQty(item.id, parseFloat(e.target.value))}
                          className="w-12 text-center bg-black/20 border border-gray-700 rounded text-xs font-bold text-white py-0.5"
                        />
                        <button
                          onClick={() => updateQty(item.id, item.weighed ? 0.25 : 1)}
                          className="w-6 h-6 rounded-lg bg-black/30 hover:bg-white/10 font-bold text-xs cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-xs font-black text-emerald-400 w-16 text-right">
                        {isRefundMode ? "-" : ""}
                        {getCurrencySymbol()}{(item.list_price * item.qty).toFixed(2)}
                      </div>
                    </div>

                    {/* Supermarket Quick Scale Weight Presets */}
                    {item.weighed && (
                      <div className="flex items-center gap-1 pt-1 border-t border-gray-800 text-[10px]">
                        <span className="text-amber-300 font-bold flex items-center gap-0.5 mr-1">
                          <Scale size={10} /> Scale:
                        </span>
                        {[0.25, 0.5, 0.75, 1.0, 1.5, 2.0].map((w) => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => setExactQty(item.id, w)}
                            className={`px-1.5 py-0.5 rounded font-bold cursor-pointer ${
                              item.qty === w ? "bg-amber-600 text-white" : "bg-black/30 text-gray-300"
                            }`}
                          >
                            {w}kg
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Restaurant Course & Modifier Drawer */}
                    {posMode === "food_beverage" && isExpanded && (
                      <div className="pt-2 border-t border-gray-800 space-y-1.5 text-[10px]">
                        <div className="flex gap-1">
                          {["Starter", "Main", "Dessert", "Beverage"].map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setItemCourse(item.id, c)}
                              className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                                item.course === c ? "bg-purple-600 text-white" : "bg-black/30 text-gray-400"
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {QUICK_MODIFIERS.map((mod) => {
                            const active = Array.isArray(item.modifiers) && item.modifiers.includes(mod);
                            return (
                              <button
                                key={mod}
                                type="button"
                                onClick={() => toggleItemModifier(item.id, mod)}
                                className={`px-2 py-0.5 rounded font-semibold cursor-pointer ${
                                  active ? "bg-amber-600 text-white" : "bg-black/30 text-gray-400"
                                }`}
                              >
                                {mod}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Discount, Service Charge, Tax & Payment Controls */}
          <div className="p-3.5 bg-[#0B101E] border-t border-gray-800 space-y-2.5 text-xs">
            <div className={`grid ${posMode === "food_beverage" ? "grid-cols-3" : "grid-cols-2"} gap-2`}>
              <div className="flex items-center justify-between bg-[#141A28] border border-gray-800 rounded-xl px-2.5 py-1.5">
                <span className="text-gray-400 text-[11px]">Disc %</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={discountPct}
                  onChange={(e) => setDiscountPct(Number(e.target.value))}
                  className="w-10 text-right bg-transparent text-white font-bold outline-none"
                />
              </div>
              {posMode === "food_beverage" && (
                <div className="flex items-center justify-between bg-[#141A28] border border-gray-800 rounded-xl px-2.5 py-1.5">
                  <span className="text-gray-400 text-[11px]">Tip/Svc %</span>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={serviceChargePct}
                    onChange={(e) => setServiceChargePct(Number(e.target.value))}
                    className="w-10 text-right bg-transparent text-amber-300 font-bold outline-none"
                  />
                </div>
              )}
              <div className="flex items-center justify-between bg-[#141A28] border border-gray-800 rounded-xl px-2.5 py-1.5">
                <span className="text-gray-400 text-[11px]">Tax %</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={taxPct}
                  onChange={(e) => setTaxPct(Number(e.target.value))}
                  className="w-10 text-right bg-transparent text-white font-bold outline-none"
                />
              </div>
            </div>

            <div className="space-y-1 text-gray-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{getCurrencySymbol()}{subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-amber-400">
                  <span>Discount</span>
                  <span>-{getCurrencySymbol()}{discountAmount.toFixed(2)}</span>
                </div>
              )}
              {serviceChargeAmount > 0 && (
                <div className="flex justify-between text-purple-300">
                  <span>Service Charge ({serviceChargePct}%)</span>
                  <span>+{getCurrencySymbol()}{serviceChargeAmount.toFixed(2)}</span>
                </div>
              )}
              {taxAmount > 0 && (
                <div className="flex justify-between">
                  <span>Tax ({taxPct}%)</span>
                  <span>+{getCurrencySymbol()}{taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-white pt-1 border-t border-gray-800">
                <span>{isRefundMode ? "Total Refund" : "Total Due"}</span>
                <span className={isRefundMode ? "text-amber-400" : "text-emerald-400"}>
                  {isRefundMode ? "-" : ""}{getCurrencySymbol()}{total.toFixed(2)}
                </span>
              </div>
              {posMode === "food_beverage" && total > 0 && (
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="flex items-center gap-1 text-gray-400">
                    <Users size={11} /> Split Guest Check:
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4].map((way) => (
                      <button
                        key={way}
                        type="button"
                        onClick={() => setSplitBillWays(way)}
                        className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                          splitBillWays === way ? "bg-purple-600 text-white" : "bg-[#141A28] text-gray-400"
                        }`}
                      >
                        {way}x
                      </button>
                    ))}
                    {splitBillWays > 1 && (
                      <span className="text-purple-300 font-bold ml-1">
                        ({getCurrencySymbol()}{(total / splitBillWays).toFixed(2)}/ea)
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {checkoutMode ? (
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-1">
                  {(["Cash", "Card / Terminal", "QR / Wallet", "Split"] as const).map((pm) => (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => {
                        setPaymentMethod(pm);
                        if (pm === "Split") {
                          const half = (total / 2).toFixed(2);
                          setSplitCash(half);
                          setSplitCard((total - Number(half)).toFixed(2));
                        }
                      }}
                      className={`py-1.5 rounded-lg text-[10px] font-bold border cursor-pointer ${
                        paymentMethod === pm
                          ? "bg-emerald-600 text-white border-emerald-500"
                          : "bg-[#141A28] text-gray-400 border-gray-800"
                      }`}
                    >
                      {pm}
                    </button>
                  ))}
                </div>

                {paymentMethod === "Split" ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-0.5">Cash Portion</label>
                      <input
                        type="number"
                        step="0.01"
                        value={splitCash}
                        onChange={(e) => {
                          setSplitCash(e.target.value);
                          const c = parseFloat(e.target.value) || 0;
                          setSplitCard(Math.max(0, Number((total - c).toFixed(2))).toString());
                        }}
                        className="w-full bg-[#1E293B] border border-emerald-500/40 rounded-xl px-2.5 py-2 text-white font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-0.5">Card Portion</label>
                      <input
                        type="number"
                        step="0.01"
                        value={splitCard}
                        onChange={(e) => setSplitCard(e.target.value)}
                        className="w-full bg-[#1E293B] border border-purple-500/40 rounded-xl px-2.5 py-2 text-white font-bold text-xs"
                      />
                    </div>
                  </div>
                ) : (
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Amount Tendered"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    className="w-full bg-[#1E293B] border border-emerald-500/50 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none"
                  />
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setCheckoutMode(false)}
                    className="flex-1 bg-gray-800 py-2.5 rounded-xl font-bold cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={processing}
                    className={`flex-[2] ${
                      isRefundMode ? "bg-amber-600 hover:bg-amber-500" : "bg-emerald-600 hover:bg-emerald-500"
                    } text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer`}
                  >
                    <Check size={15} /> {isRefundMode ? "Issue Refund & Restock" : "Complete Sale & Receipt"}
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
                className={`w-full ${
                  isRefundMode ? "bg-amber-600 hover:bg-amber-500" : "bg-emerald-600 hover:bg-emerald-500"
                } disabled:opacity-40 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer`}
              >
                <CreditCard size={17} />{" "}
                {isRefundMode
                  ? `Refund ${getCurrencySymbol()}${total.toFixed(2)}`
                  : `Charge ${getCurrencySymbol()}${total.toFixed(2)}`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Parked / Held Carts Modal */}
      {isHeldDrawerOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A2236] rounded-2xl p-6 w-full max-w-md border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="font-bold text-sm">Parked / Held Carts ({heldCarts.length})</h3>
              <button onClick={() => setIsHeldDrawerOpen(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>
            {heldCarts.length === 0 ? (
              <p className="text-xs text-gray-400 py-8 text-center">No parked carts right now.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {heldCarts.map((h) => (
                  <div key={h.id} className="bg-[#0F172A] border border-gray-800 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">{h.label}</div>
                      <div className="text-[11px] text-gray-400">
                        {(h.items || []).length} items • {getCurrencySymbol()}{Number(h.total || 0).toFixed(2)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRecallHeldCart(h)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                    >
                      Recall
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent POS Receipts Modal */}
      {isHistoryDrawerOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A2236] rounded-2xl p-6 w-full max-w-lg border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="font-bold text-sm">Recent POS Receipts &amp; Synced Orders ({posTransactions.length})</h3>
              <button onClick={() => setIsHistoryDrawerOpen(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>
            {posTransactions.length === 0 ? (
              <p className="text-xs text-gray-400 py-8 text-center">No transactions rung up in this shift yet.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {posTransactions.slice(0, 20).map((tx) => (
                  <div key={tx.id} className="bg-[#0F172A] border border-gray-800 rounded-xl p-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{tx.name} • {tx.customerName || "Walk-In"}</div>
                      <div className="text-[11px] text-gray-400">{tx.paymentMethod} • {tx.date}</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-black ${tx.isRefund ? "text-amber-400" : "text-emerald-400"}`}>
                        {getCurrencySymbol()}{Number(tx.total || 0).toFixed(2)}
                      </div>
                      <button
                        onClick={() => {
                          setIsHistoryDrawerOpen(false);
                          setReceiptOrder(tx);
                        }}
                        className="text-[10px] text-purple-400 hover:underline cursor-pointer"
                      >
                        View Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {receiptOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A2236] rounded-2xl p-6 w-full max-w-sm border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="font-bold text-sm">Receipt · {receiptOrder.name}</h3>
              <button onClick={resetTransaction} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <div className="bg-white text-black rounded-xl p-4 font-mono text-xs space-y-2">
              <div className="text-center border-b border-dashed border-gray-400 pb-2">
                <div className="font-bold text-sm">{activeBranch?.name || "BERAXIS POS"}</div>
                <div className="text-[10px] text-gray-500">{receiptOrder.orderType} · {receiptOrder.date}</div>
                {receiptOrder.customerName && (
                  <div className="text-[10px] text-gray-700 font-semibold">
                    Customer: {receiptOrder.customerName}
                    {receiptOrder.loyaltyPointsEarned ? ` (+${receiptOrder.loyaltyPointsEarned} pts)` : ""}
                  </div>
                )}
              </div>
              {(receiptOrder.items || []).map((it: any, idx: number) => (
                <div key={idx} className="flex justify-between">
                  <span>
                    {it.qty}{it.weighed ? "kg" : "x"} {it.name}
                  </span>
                  <span>{getCurrencySymbol()}{(it.list_price * it.qty).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-dashed border-gray-400 pt-2 font-bold flex justify-between">
                <span>TOTAL ({receiptOrder.paymentMethod})</span>
                <span>{getCurrencySymbol()}{Number(receiptOrder.total || 0).toFixed(2)}</span>
              </div>
              {receiptOrder.changeDue > 0 && (
                <div className="flex justify-between text-[11px]">
                  <span>CHANGE DUE</span>
                  <span>{getCurrencySymbol()}{Number(receiptOrder.changeDue).toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-purple-600 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer size={14} /> Print
              </button>
              <button
                onClick={resetTransaction}
                className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
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
              <h3 className="text-base font-bold text-white">Add POS Item / Weighed Produce / Dish</h3>
              <button onClick={() => setIsAddProductOpen(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
              <input
                required
                value={newProdName}
                onChange={(e) => setNewProdName(e.target.value)}
                placeholder="Item Name *"
                className="w-full bg-[#0F172A] border border-white/15 rounded-xl px-3.5 py-2.5 text-white"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  required
                  type="number"
                  step="0.01"
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(e.target.value)}
                  placeholder="Sale Price *"
                  className="w-full bg-[#0F172A] border border-white/15 rounded-xl px-3.5 py-2.5 text-white"
                />
                <input
                  type="number"
                  step="0.01"
                  value={newProdCost}
                  onChange={(e) => setNewProdCost(e.target.value)}
                  placeholder="Cost Price"
                  className="w-full bg-[#0F172A] border border-white/15 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value)}
                  placeholder="Category (e.g. Mains, Dairy)"
                  className="w-full bg-[#0F172A] border border-white/15 rounded-xl px-3.5 py-2.5 text-white"
                />
                <input
                  value={newProdSku}
                  onChange={(e) => setNewProdSku(e.target.value)}
                  placeholder="Barcode / SKU"
                  className="w-full bg-[#0F172A] border border-white/15 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>
              <label className="flex items-center gap-2 text-gray-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={newProdWeighed}
                  onChange={(e) => setNewProdWeighed(e.target.checked)}
                />
                <span>Weighed by Scale (priced per kg — Produce / Meat / Deli)</span>
              </label>
              <button
                type="submit"
                disabled={addLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold cursor-pointer"
              >
                Save Item &amp; Sync to Inventory
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
