"use client";
import { fetchAPI } from "@/lib/api";
import { useState, useEffect, useRef } from "react";
import AppHeader from "@/components/layout/AppHeader";
import { Calculator, ShoppingCart, DollarSign, X, Check, Search, CreditCard, Clock, Plus, Loader2, Printer, CheckCircle2, XCircle } from "lucide-react";
import { useBranchContext } from "@/lib/branchContext";

export default function POSPage() {
  const { activeBranch, getEntityStorageKey } = useBranchContext();
  const [session, setSession] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [posTransactions, setPosTransactions] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [amountPaid, setAmountPaid] = useState("");
  const [terminalApproved, setTerminalApproved] = useState<"APPROVED" | "NOT APPROVED">("APPROVED");
  const [processing, setProcessing] = useState(false);

  // Receipt Modal State
  const [receiptOrder, setReceiptOrder] = useState<any>(null);

  const getCurrencySymbol = () => {
    if (typeof window !== "undefined") {
      const keyPrefix = getEntityStorageKey("settings");
      const cur = localStorage.getItem(`${keyPrefix}_currency`) || activeBranch?.currency || "USD";
      const symbols: Record<string, string> = {
        USD: "$", EUR: "€", GBP: "£", AUD: "$", CAD: "$", JPY: "¥", PKR: "₨", INR: "₹"
      };
      return symbols[cur] || "$";
    }
    return "$";
  };

  // Dynamic Receipt Configuration States
  const [receiptHeader, setReceiptHeader] = useState("Welcome to Our Store");
  const [receiptFooter, setReceiptFooter] = useState("Thank you for shopping with us!");
  const [receiptPaperSize, setReceiptPaperSize] = useState("58mm");

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

  // New Product Modal States
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdCost, setNewProdCost] = useState("");
  const [newProdSku, setNewProdSku] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadData(); }, [activeBranch, getEntityStorageKey]);

  // ─── Shortcut Keys Keyboard Listener ──────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName.toLowerCase();
      const isInput = tag === "input" || tag === "textarea";

      if (e.key === "Escape") {
        if (isAddProductOpen) { setIsAddProductOpen(false); setAddError(""); }
        else if (receiptOrder) { resetTransaction(); }
        else if (checkoutMode) { setCheckoutMode(false); }
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
  }, [checkoutMode, isAddProductOpen, cart, amountPaid, receiptOrder]);

  const loadData = async () => {
    try {
      const sessKey = getEntityStorageKey("pos_session");
      const prodKey = getEntityStorageKey("pos_products");
      const txKey = getEntityStorageKey("pos_transactions");
      const savedSess = localStorage.getItem(sessKey);
      const savedProds = localStorage.getItem(prodKey);
      const savedTxs = localStorage.getItem(txKey);
      setSession(savedSess ? JSON.parse(savedSess) : null);
      setProducts(savedProds ? JSON.parse(savedProds) : []);
      setPosTransactions(savedTxs ? JSON.parse(savedTxs) : []);
    } finally { setLoading(false); }
  };

  const openSession = async () => {
    const newSess = {
      id: `pos_sess_${Date.now()}`,
      state: "open",
      start_at: new Date().toISOString(),
      entity_name: activeBranch?.name || "My Entity",
    };
    localStorage.setItem(getEntityStorageKey("pos_session"), JSON.stringify(newSess));
    setSession(newSess);
  };

  const closeSession = async () => {
    if (!confirm("Close POS session?")) return;
    localStorage.removeItem(getEntityStorageKey("pos_session"));
    setSession(null);
  };

  const addToCart = (product: any) => {
    const existing = cart.find(i => i.id === product.id);
    if (existing) setCart(cart.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
    else setCart([...cart, { ...product, qty: 1 }]);
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

  const total = cart.reduce((sum, item) => sum + item.list_price * item.qty, 0);

  const handleCheckout = async () => {
    const paid = parseFloat(amountPaid || String(total));
    if (terminalApproved === "APPROVED" && (isNaN(paid) || paid < total)) {
      return alert("Paid amount must be >= total for an Approved POS terminal transaction.");
    }
    setProcessing(true);
    try {
      const orderName = `POS/${new Date().getTime().toString().slice(-6)}`;
      const txRecord = {
        id: `tx_${Date.now()}`,
        name: orderName,
        items: [...cart],
        total,
        amountPaid: terminalApproved === "APPROVED" ? paid : 0,
        changeDue: terminalApproved === "APPROVED" ? Math.max(0, paid - total) : 0,
        status: terminalApproved,
        date: new Date().toLocaleString()
      };

      const txKey = getEntityStorageKey("pos_transactions");
      const updatedTxs = [txRecord, ...posTransactions];
      setPosTransactions(updatedTxs);
      localStorage.setItem(txKey, JSON.stringify(updatedTxs));

      setReceiptOrder(txRecord);
    } catch (err: any) {
      alert(`Checkout failed: ${err.message || 'Error occurred'}`);
    } finally { setProcessing(false); }
  };

  const resetTransaction = () => {
    setCart([]);
    setCheckoutMode(false);
    setAmountPaid("");
    setTerminalApproved("APPROVED");
    setReceiptOrder(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    if (!newProdName.trim() || !newProdPrice) return;

    setAddLoading(true);
    try {
      const newProd = {
        id: `prod_${Date.now()}`,
        name: newProdName.trim(),
        list_price: parseFloat(newProdPrice),
        cost_price: newProdCost ? parseFloat(newProdCost) : 0.0,
        sku: newProdSku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
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
    } catch (err: any) {
      setAddError(err.message || "Error creating product");
    } finally {
      setAddLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col h-screen">
      <AppHeader title="Point of Sale" />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  if (!session) return (
    <div className="flex flex-col h-screen">
      <AppHeader title="Point of Sale" />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="galaxy-card p-10 max-w-md w-full text-center">
          <Calculator size={48} className="text-green-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Point of Sale</h2>
          <p className="text-gray-400 mb-8">Start a new POS session to process sales.</p>
          <button onClick={openSession} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl text-lg transition-colors shadow-lg shadow-green-600/20">
            Open Session
          </button>
        </div>
      </div>
    </div>
  );

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col h-screen bg-[#0B101E]">
      {/* Printable receipt stylesheet override */}
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

      {/* POS Header */}
      <div className="h-16 border-b border-gray-800 bg-[#141A28] flex items-center justify-between px-6 shrink-0 shadow-md no-print">
        <div className="flex items-center gap-3 text-white font-semibold">
          <Calculator className="text-green-400" />
          <span>{activeBranch?.name || "My Entity"} — POS Machine Terminal</span>
          <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full border border-green-500/30">MACHINE CONNECTED · FIGURES & APPROVAL ONLY</span>
          <div className="text-[10px] text-gray-500 hidden md:flex items-center gap-2 pl-4 border-l border-gray-800">
            <span>Shortcuts:</span>
            <kbd className="bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700 font-mono font-bold text-gray-300">s</kbd> search |
            <kbd className="bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700 font-mono font-bold text-gray-300">c</kbd> checkout |
            <kbd className="bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700 font-mono font-bold text-gray-300">p</kbd> add product
          </div>
        </div>
        <button onClick={closeSession} className="text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Close Session
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden no-print">
        {/* Left: Products Grid + POS Machine Figures & Approval Status */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden gap-6">
          <div className="flex gap-4 shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Search products... (Press '/' or 's' to focus)" 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-[#1E293B] border border-gray-700 rounded-xl pl-11 pr-4 py-3 text-white outline-none focus:border-green-500 shadow-sm" 
              />
            </div>
            <button onClick={() => setIsAddProductOpen(true)} className="bg-green-600 hover:bg-green-700 text-white px-5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-green-600/20 active:scale-95 flex items-center gap-1.5 whitespace-nowrap">
              <Plus size={16} /> Add Product <span className="opacity-50 text-[10px] bg-black/25 px-1.5 py-0.5 rounded font-mono font-bold">P</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            {filteredProducts.length === 0 ? (
              <div className="h-48 border border-dashed border-gray-800 rounded-2xl flex flex-col items-center justify-center text-gray-500 p-6 text-center">
                <p className="text-sm font-semibold text-gray-300 mb-1">No POS products added for {activeBranch?.name || "your entity"} yet</p>
                <p className="text-xs text-gray-500 mb-4">Your entity starts with a clean, isolated product catalog ($0.00). Click &ldquo;Add Product&rdquo; to add items.</p>
                <button onClick={() => setIsAddProductOpen(true)} className="px-4 py-2 rounded-xl bg-green-600/20 border border-green-500/30 text-green-400 text-xs font-bold hover:bg-green-600/30">
                  + Add First Product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {filteredProducts.map(p => (
                  <div key={p.id} onClick={() => addToCart(p)}
                    className="bg-[#1E293B] border border-gray-700 hover:border-green-500 rounded-xl p-4 cursor-pointer flex flex-col justify-between aspect-square transition-all shadow-sm active:scale-95">
                    <div className="flex-1 flex items-center justify-center">
                      <span className="text-4xl">📦</span>
                    </div>
                    <div className="mt-2 text-center">
                      <p className="text-sm font-medium text-white truncate px-1">{p.name}</p>
                      <p className="text-green-400 font-bold mt-1">{getCurrencySymbol()}{(p.list_price || 0).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* POS Machine Figures & Approval Status Log (Read-Only Figures + Approved / Not Approved) */}
          <div className="bg-[#141A28] border border-gray-800 rounded-2xl p-4 shrink-0 max-h-48 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                POS Machine Terminal Figures & Approval Status
              </h4>
              <span className="text-[11px] text-gray-500 font-mono">
                Approved Total: {getCurrencySymbol()}
                {posTransactions.filter(t => t.status === "APPROVED").reduce((s, t) => s + Number(t.total || 0), 0).toFixed(2)}
              </span>
            </div>
            {posTransactions.length === 0 ? (
              <p className="text-xs text-gray-500 py-2">No POS machine transactions recorded in this entity yet.</p>
            ) : (
              <div className="space-y-1.5">
                {posTransactions.slice(0, 10).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between text-xs bg-[#0B101E] px-3 py-2 rounded-lg border border-gray-800/80">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-gray-200">{tx.name}</span>
                      <span className="text-gray-500">{tx.date}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-white">{getCurrencySymbol()}{Number(tx.total || 0).toFixed(2)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${
                        tx.status === "APPROVED"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                      }`}>
                        {tx.status === "APPROVED" ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Cart Panel */}
        <div className="w-[400px] border-l border-gray-800 bg-[#141A28] flex flex-col shrink-0 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.1)] z-10">
          <div className="p-4 border-b border-gray-800 bg-black/20 flex items-center gap-2 text-white font-semibold">
            <ShoppingCart size={18} /> Order Cart
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                <ShoppingCart size={64} className="mb-4" />
                <p>Cart is empty</p>
              </div>
            ) : cart.map((item, i) => (
              <div key={i} className="bg-[#1E293B] border border-gray-700 rounded-lg p-3 flex flex-col gap-2 shadow-sm">
                <div className="flex justify-between items-start">
                  <h4 className="text-white font-medium text-sm w-3/4 leading-tight">{item.name}</h4>
                  <p className="text-green-400 font-bold text-sm">{getCurrencySymbol()}{(item.list_price * item.qty).toFixed(2)}</p>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-400">{getCurrencySymbol()}{item.list_price.toFixed(2)} / unit</p>
                  <div className="flex items-center bg-black/30 rounded-lg border border-gray-700 overflow-hidden">
                    <button onClick={() => updateQty(item.id, -1)} className="px-3 py-1 text-gray-300 hover:bg-white/10 hover:text-white transition-colors">-</button>
                    <span className="px-3 py-1 text-white text-sm font-medium min-w-[2.5rem] text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="px-3 py-1 text-gray-300 hover:bg-white/10 hover:text-white transition-colors">+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-[#0B101E] border-t border-gray-800 shrink-0 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.2)]">
            <div className="flex justify-between mb-2 text-gray-400 text-sm"><span>Subtotal</span><span>{getCurrencySymbol()}{total.toFixed(2)}</span></div>
            <div className="flex justify-between mb-4 text-gray-400 text-sm"><span>Taxes</span><span>{getCurrencySymbol()}0.00</span></div>
            <div className="flex justify-between mb-6 text-xl font-bold text-white"><span>Total Figure</span><span className="text-green-400">{getCurrencySymbol()}{total.toFixed(2)}</span></div>
            
            {checkoutMode ? (
              <div className="space-y-4 animate-in slide-in-from-bottom-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    POS Machine Terminal Status
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTerminalApproved("APPROVED")}
                      className={`py-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                        terminalApproved === "APPROVED"
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                          : "bg-[#1E293B] border-gray-700 text-gray-400"
                      }`}
                    >
                      <CheckCircle2 size={14} /> APPROVED
                    </button>
                    <button
                      type="button"
                      onClick={() => setTerminalApproved("NOT APPROVED")}
                      className={`py-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                        terminalApproved === "NOT APPROVED"
                          ? "bg-rose-500/20 border-rose-500 text-rose-300"
                          : "bg-[#1E293B] border-gray-700 text-gray-400"
                      }`}
                    >
                      <XCircle size={14} /> NOT APPROVED
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="number" placeholder="Amount figure tendered" autoFocus value={amountPaid} onChange={e => setAmountPaid(e.target.value)}
                    className="w-full bg-[#1E293B] border border-green-500/50 rounded-xl pl-11 pr-4 py-3.5 text-white font-bold text-lg outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 shadow-[0_0_15px_rgba(34,197,94,0.1)]" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setCheckoutMode(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3.5 rounded-xl font-medium transition-colors">Cancel</button>
                  <button onClick={handleCheckout} disabled={processing || (terminalApproved === "APPROVED" && !amountPaid)} className="flex-[2] bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-600/20">
                    {processing ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />} Record POS Status
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => { setAmountPaid(total.toFixed(2)); setCheckoutMode(true); }} disabled={cart.length === 0} 
                className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:bg-gray-700 text-white font-bold py-5 rounded-xl text-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-600/20 active:scale-95">
                <CreditCard size={20} /> POS Terminal Checkout <span className="opacity-50 text-xs bg-black/25 px-1.5 py-0.5 rounded font-mono font-bold">C</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bill Printing / Receipt Modal */}
      {receiptOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`bg-[#1A2236] rounded-2xl p-6 w-full border border-white/8 shadow-2xl flex flex-col gap-5 max-h-[90vh] transition-all duration-300 ${
            receiptPaperSize === "58mm" ? "max-w-[280px]" : receiptPaperSize === "80mm" ? "max-w-[360px]" : "max-w-[650px]"
          }`}>
            
            {/* Modal Actions */}
            <div className="flex items-center justify-between no-print border-b border-white/5 pb-3">
              <h3 className="text-md font-bold text-white">Order Receipt ({receiptPaperSize})</h3>
              <button onClick={resetTransaction} className="text-gray-500 hover:text-white p-1 rounded hover:bg-white/5">
                <X size={18} />
              </button>
            </div>

            {/* Printable Receipt Block */}
            <div className={`printable-receipt bg-white text-black rounded-xl font-mono overflow-y-auto flex-1 shadow-inner ${
              receiptPaperSize === "58mm" ? "text-[9px] leading-tight p-2.5" : receiptPaperSize === "80mm" ? "text-xs p-4" : "text-sm p-8"
            }`}>
              <div className="text-center mb-4">
                <h2 className="text-md font-bold uppercase tracking-wider">BERAXIS</h2>
                <p className="text-[10px] text-gray-500 mt-1">{receiptHeader}</p>
                <p className="text-[10px] text-gray-500 mt-1">{receiptOrder.date}</p>
                <p className="font-bold mt-2 text-[10px]">{receiptOrder.name}</p>
              </div>

              <div className="border-t border-b border-dashed border-gray-400 py-2 my-2">
                <div className="grid grid-cols-12 font-bold mb-1">
                  <span className="col-span-6">Item</span>
                  <span className="col-span-2 text-center">Qty</span>
                  <span className="col-span-4 text-right">Subtotal</span>
                </div>
                {receiptOrder.items.map((item: any, i: number) => (
                  <div key={i} className="grid grid-cols-12 py-0.5">
                    <span className="col-span-6 truncate">{item.name}</span>
                    <span className="col-span-2 text-center">{item.qty}</span>
                    <span className="col-span-4 text-right">{getCurrencySymbol()}{(item.list_price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-right mt-2">
                <div className="flex justify-between"><span>Subtotal:</span><span>{getCurrencySymbol()}{receiptOrder.total.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-sm border-t border-dashed border-gray-300 pt-1 mt-1">
                  <span>TOTAL:</span><span>{getCurrencySymbol()}{receiptOrder.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mt-2"><span>Amount Paid:</span><span>{getCurrencySymbol()}{receiptOrder.amountPaid.toFixed(2)}</span></div>
                <div className="flex justify-between font-semibold text-green-600"><span>Change Due:</span><span>{getCurrencySymbol()}{receiptOrder.changeDue.toFixed(2)}</span></div>
              </div>

              <div className="text-center mt-6 pt-4 border-t border-dashed border-gray-400 text-[10px] text-gray-400">
                <p>{receiptFooter}</p>
                <p className="mt-1">Beraxis Cloud ERP</p>
              </div>
            </div>

            {/* Modal Controls */}
            <div className="flex gap-3 no-print border-t border-white/5 pt-4">
              <button 
                onClick={handlePrint}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg"
              >
                <Printer size={16} /> Print Receipt
              </button>
              <button 
                onClick={resetTransaction}
                className="flex-1 bg-[#1E293B] hover:bg-white/10 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all active:scale-95"
              >
                New Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A2236] rounded-2xl p-6 w-full max-w-md border border-white/8 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-white">Quick Add Product</h3>
                <p className="text-gray-500 text-xs mt-0.5">Create a product and make it available instantly</p>
              </div>
              <button onClick={() => { setIsAddProductOpen(false); setAddError(""); }} className="text-gray-500 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Product Name *</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={e => setNewProdName(e.target.value)}
                  className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-green-500 outline-none transition-all"
                  placeholder="e.g. Premium Coffee beans"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Sale Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProdPrice}
                    onChange={e => setNewProdPrice(e.target.value)}
                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-green-500 outline-none transition-all"
                    placeholder="12.99"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Cost Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProdCost}
                    onChange={e => setNewProdCost(e.target.value)}
                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-green-500 outline-none transition-all"
                    placeholder="4.50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Barcode / SKU</label>
                <input
                  type="text"
                  value={newProdSku}
                  onChange={e => setNewProdSku(e.target.value)}
                  className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-green-500 outline-none transition-all"
                  placeholder="e.g. 200847294872"
                />
              </div>

              {addError && (
                <div className="px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-start gap-2">
                  <span className="shrink-0 mt-0.5">⚠</span>
                  <span>{addError}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/5">
                <button type="button" onClick={() => { setIsAddProductOpen(false); setAddError(""); }} disabled={addLoading}
                  className="px-4 py-2.5 text-sm text-gray-400 hover:text-white font-medium transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading || !newProdName.trim() || !newProdPrice}
                  className="bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center gap-2"
                >
                  {addLoading ? <><Loader2 size={15} className="animate-spin" /> Creating...</> : <><Plus size={15} /> Create Product</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
