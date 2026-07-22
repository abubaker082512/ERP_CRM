"use client";
import { fetchAPI } from "@/lib/api";
import { useState, useEffect, useRef } from "react";
import AppHeader from "@/components/layout/AppHeader";
import { Calculator, ShoppingCart, DollarSign, X, Check, Search, CreditCard, Clock, Plus, Loader2, Printer } from "lucide-react";

export default function POSPage() {
  const [session, setSession] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [amountPaid, setAmountPaid] = useState("");
  const [processing, setProcessing] = useState(false);

  // Receipt Modal State
  const [receiptOrder, setReceiptOrder] = useState<any>(null);

  // New Product Modal States
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdCost, setNewProdCost] = useState("");
  const [newProdSku, setNewProdSku] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadData(); }, []);

  // ─── Shortcut Keys Keyboard Listener ──────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts if the user is typing in a form input/textarea
      const tag = document.activeElement?.tagName.toLowerCase();
      const isInput = tag === "input" || tag === "textarea";

      // Escape -> close any modal or exit checkout mode
      if (e.key === "Escape") {
        if (isAddProductOpen) { setIsAddProductOpen(false); setAddError(""); }
        else if (receiptOrder) { resetTransaction(); }
        else if (checkoutMode) { setCheckoutMode(false); }
        return;
      }

      // If user is typing in input, only let them press Enter to validate
      if (isInput) {
        if (e.key === "Enter" && checkoutMode && amountPaid) {
          e.preventDefault();
          handleCheckout();
        }
        return;
      }

      // Focus Search: 's' or '/'
      if (e.key.toLowerCase() === "s" || e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }

      // Checkout Mode: 'c'
      if (e.key.toLowerCase() === "c" && cart.length > 0 && !checkoutMode) {
        e.preventDefault();
        setCheckoutMode(true);
      }

      // Add Product Modal: 'p'
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
      const [sessRes, prodRes] = await Promise.all([
        fetchAPI("/pos/sessions/open"),
        fetchAPI("/inventory/products")
      ]);
      if (sessRes.ok) setSession(await sessRes.json());
      if (prodRes.ok) setProducts(await prodRes.json());
    } finally { setLoading(false); }
  };

  const openSession = async () => {
    let configs: any[] = [];
    const cfgRes = await fetchAPI("/pos/configs");
    if (cfgRes.ok) configs = await cfgRes.json();
    
    let configId = configs.length > 0 ? configs[0].id : null;
    
    if (!configId) {
      const newCfg = await fetchAPI("/pos/configs", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Main POS Config" })
      }).then(r => r.json());
      configId = newCfg.id;
    }

    const res = await fetchAPI("/pos/sessions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config_id: configId, start_cash: 100 })
    });
    if (res.ok) setSession(await res.json());
  };

  const closeSession = async () => {
    if (!confirm("Close POS session?")) return;
    await fetchAPI(`/pos/sessions/${session.id}/close`, { method: "PUT" });
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
    const paid = parseFloat(amountPaid);
    if (isNaN(paid) || paid < total) return alert("Paid amount must be >= total.");
    setProcessing(true);
    try {
      const orderRes = await fetchAPI("/pos/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: session.id,
          amount_total: total,
          lines: cart.map(i => ({ product_id: i.id, qty: i.qty, price_unit: i.list_price }))
        })
      });
      const order = await orderRes.json();

      await fetchAPI("/pos/payments", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: order.id, amount: paid, payment_method: "cash" })
      });

      // Instead of browser alert, save order to show print bill modal
      setReceiptOrder({
        name: order.name || `POS/${new Date().getTime()}`,
        items: [...cart],
        total,
        amountPaid: paid,
        changeDue: paid - total,
        date: new Date().toLocaleString()
      });
    } catch (err: any) {
      alert(`Checkout failed: ${err.message || 'Error occurred'}`);
    } finally { setProcessing(false); }
  };

  const resetTransaction = () => {
    setCart([]);
    setCheckoutMode(false);
    setAmountPaid("");
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
      const res = await fetchAPI("/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProdName.trim(),
          list_price: parseFloat(newProdPrice),
          cost_price: newProdCost ? parseFloat(newProdCost) : 0.0,
          sku: newProdSku.trim() || undefined
        })
      });

      if (res.ok) {
        const newProd = await res.json();
        setProducts(prev => [newProd, ...prev]);
        setIsAddProductOpen(false);
        setNewProdName("");
        setNewProdPrice("");
        setNewProdCost("");
        setNewProdSku("");
      } else {
        const err = await res.json().catch(() => ({ detail: "Failed to create product" }));
        setAddError(err.detail || "Failed to create product");
      }
    } catch (err: any) {
      setAddError(err.message || "Network error");
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
            width: 100% !important;
            max-width: 100% !important;
            background: white !important;
            color: black !important;
            padding: 20px !important;
          }
          .no-print { display: none !important; }
        }
      `}} />

      {/* POS Header */}
      <div className="h-16 border-b border-gray-800 bg-[#141A28] flex items-center justify-between px-6 shrink-0 shadow-md no-print">
        <div className="flex items-center gap-3 text-white font-semibold">
          <Calculator className="text-green-400" />
          <span>POS Session</span>
          <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full border border-green-500/30">OPEN</span>
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
        {/* Left: Products Grid */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          <div className="flex gap-4 mb-6 shrink-0">
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
            <div className="grid grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {filteredProducts.map(p => (
                <div key={p.id} onClick={() => addToCart(p)}
                  className="bg-[#1E293B] border border-gray-700 hover:border-green-500 rounded-xl p-4 cursor-pointer flex flex-col justify-between aspect-square transition-all shadow-sm active:scale-95">
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-4xl">📦</span>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-sm font-medium text-white truncate px-1">{p.name}</p>
                    <p className="text-green-400 font-bold mt-1">${(p.list_price || 0).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
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
                  <p className="text-green-400 font-bold text-sm">${(item.list_price * item.qty).toFixed(2)}</p>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-400">${item.list_price.toFixed(2)} / unit</p>
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
            <div className="flex justify-between mb-2 text-gray-400 text-sm"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
            <div className="flex justify-between mb-4 text-gray-400 text-sm"><span>Taxes</span><span>$0.00</span></div>
            <div className="flex justify-between mb-6 text-xl font-bold text-white"><span>Total</span><span className="text-green-400">${total.toFixed(2)}</span></div>
            
            {checkoutMode ? (
              <div className="space-y-4 animate-in slide-in-from-bottom-4">
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="number" placeholder="Amount tendered" autoFocus value={amountPaid} onChange={e => setAmountPaid(e.target.value)}
                    className="w-full bg-[#1E293B] border border-green-500/50 rounded-xl pl-11 pr-4 py-4 text-white font-bold text-lg outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 shadow-[0_0_15px_rgba(34,197,94,0.1)]" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setCheckoutMode(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-4 rounded-xl font-medium transition-colors">Cancel</button>
                  <button onClick={handleCheckout} disabled={processing || !amountPaid} className="flex-[2] bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-600/20">
                    {processing ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />} Validate <span className="opacity-50 text-xs bg-black/25 px-1.5 py-0.5 rounded font-mono font-bold">Enter</span>
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setCheckoutMode(true)} disabled={cart.length === 0} 
                className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:bg-gray-700 text-white font-bold py-5 rounded-xl text-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-600/20 active:scale-95">
                <CreditCard size={20} /> Checkout <span className="opacity-50 text-xs bg-black/25 px-1.5 py-0.5 rounded font-mono font-bold">C</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bill Printing / Receipt Modal */}
      {receiptOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A2236] rounded-2xl p-6 w-full max-w-sm border border-white/8 shadow-2xl flex flex-col gap-5 max-h-[90vh]">
            
            {/* Modal Actions */}
            <div className="flex items-center justify-between no-print border-b border-white/5 pb-3">
              <h3 className="text-md font-bold text-white">Order Receipt</h3>
              <button onClick={resetTransaction} className="text-gray-500 hover:text-white p-1 rounded hover:bg-white/5">
                <X size={18} />
              </button>
            </div>

            {/* Printable Receipt Block */}
            <div className="printable-receipt bg-white text-black p-4 rounded-xl font-mono text-xs overflow-y-auto flex-1 shadow-inner">
              <div className="text-center mb-4">
                <h2 className="text-md font-bold uppercase tracking-wider">BERAXIS</h2>
                <p className="text-[10px] text-gray-500">Retail Point of Sale</p>
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
                    <span className="col-span-4 text-right">${(item.list_price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-right mt-2">
                <div className="flex justify-between"><span>Subtotal:</span><span>${receiptOrder.total.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-sm border-t border-dashed border-gray-300 pt-1 mt-1">
                  <span>TOTAL:</span><span>${receiptOrder.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mt-2"><span>Amount Paid:</span><span>${receiptOrder.amountPaid.toFixed(2)}</span></div>
                <div className="flex justify-between font-semibold text-green-600"><span>Change Due:</span><span>${receiptOrder.changeDue.toFixed(2)}</span></div>
              </div>

              <div className="text-center mt-6 pt-4 border-t border-dashed border-gray-400 text-[10px] text-gray-400">
                <p>Thank you for shopping with us!</p>
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
