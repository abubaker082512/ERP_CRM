"use client";
import { fetchAPI } from "@/lib/api";
import { useState, useEffect } from "react";
import AppHeader from "@/components/layout/AppHeader";
import { Calculator, ShoppingCart, DollarSign, X, Check, Search, CreditCard, Clock } from "lucide-react";

export default function POSPage() {
  const [session, setSession] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [amountPaid, setAmountPaid] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => { loadData(); }, []);

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
    // Check for configs first
    let configs: any[] = [];
    const cfgRes = await fetchAPI("/pos/configs");
    if (cfgRes.ok) configs = await cfgRes.json();
    
    let configId = configs.length > 0 ? configs[0].id : null;
    
    // Create default config if none exists
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
      // Create Order
      const orderRes = await fetchAPI("/pos/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: session.id,
          amount_total: total,
          lines: cart.map(i => ({ product_id: i.id, qty: i.qty, price_unit: i.list_price }))
        })
      });
      const order = await orderRes.json();

      // Create Payment
      await fetchAPI("/pos/payments", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: order.id, amount: paid, payment_method: "cash" })
      });

      alert(`Change due: $${(paid - total).toFixed(2)}`);
      setCart([]);
      setCheckoutMode(false);
      setAmountPaid("");
    } finally { setProcessing(false); }
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
      {/* POS Header */}
      <div className="h-16 border-b border-gray-800 bg-[#141A28] flex items-center justify-between px-6 shrink-0 shadow-md">
        <div className="flex items-center gap-3 text-white font-semibold">
          <Calculator className="text-green-400" />
          <span>POS Session</span>
          <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full border border-green-500/30">OPEN</span>
        </div>
        <button onClick={closeSession} className="text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Close Session
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Products Grid */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          <div className="relative mb-6 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#1E293B] border border-gray-700 rounded-xl pl-11 pr-4 py-3 text-white outline-none focus:border-green-500 shadow-sm" />
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
                    <Check size={20} /> Validate
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setCheckoutMode(true)} disabled={cart.length === 0} 
                className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:bg-gray-700 text-white font-bold py-5 rounded-xl text-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-600/20 active:scale-95">
                <CreditCard size={20} /> Checkout
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
