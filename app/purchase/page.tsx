"use client";

import { useState, useEffect, useCallback } from "react";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { useBranchContext } from "@/lib/branchContext";
import { exportToCSV } from "@/lib/exportUtils";
import {
  ShoppingCart,
  Plus,
  PackageCheck,
  FileText,
  Truck,
  Building2,
  Download,
  X,
  Trash2,
  Sparkles,
} from "lucide-react";

const MENU_ITEMS = [
  { name: "Purchase Hub & RFQs", href: "/purchase" },
  { name: "Inventory Stock", href: "/inventory" },
  { name: "Vendor Bills (Accounting)", href: "/accounting" },
];

export default function PurchasePage() {
  const { activeBranch, currencySymbol } = useBranchContext();
  const [orders, setOrders] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"orders" | "vendors">("orders");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  // Create PO Modal
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [vendorName, setVendorName] = useState("Global Fresh & FMCG Distributors");
  const [warehouse, setWarehouse] = useState("Main Storefront / Warehouse");
  const [poStatus, setPoStatus] = useState<"draft" | "confirmed">("confirmed");
  const [lines, setLines] = useState([
    { sku: "8901001", name: "Organic Whole Milk 1L", quantity: 50, uom: "Units", unitCost: 2.4 },
  ]);

  // Add Vendor Modal
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [newVendor, setNewVendor] = useState({
    name: "",
    vendorEmail: "",
    phone: "",
    category: "Raw Materials & Stock",
    paymentTerms: "Net 30",
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
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

  const loadPurchaseData = useCallback(async () => {
    setLoading(true);
    try {
      const { companyId, email } = getAuthMeta();
      const res = await fetch(
        `/api/purchase?company_id=${encodeURIComponent(companyId)}&email=${encodeURIComponent(email)}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data.orders) ? data.orders : []);
        setVendors(Array.isArray(data.vendors) ? data.vendors : []);
      }
    } finally {
      setLoading(false);
    }
  }, [getAuthMeta]);

  useEffect(() => {
    loadPurchaseData();
  }, [loadPurchaseData]);

  const handleCreatePo = async (e: React.FormEvent) => {
    e.preventDefault();
    const validLines = lines.filter((l) => l.name.trim());
    if (validLines.length === 0) return;
    const { companyId, email } = getAuthMeta();
    const res = await fetch("/api/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create_po",
        company_id: companyId,
        email,
        vendorName,
        warehouse,
        industryId: activeBranch?.industryId || "retail_supermarket",
        status: poStatus,
        lines: validLines,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setOrders(data.orders || []);
      setIsPoModalOpen(false);
      showToast(`Created ${data.order.poNumber} for ${vendorName}!`);
    }
  };

  const handleConfirmPo = async (id: string) => {
    const { companyId, email } = getAuthMeta();
    const res = await fetch("/api/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_status", company_id: companyId, email, id, status: "confirmed" }),
    });
    if (res.ok) {
      const d = await res.json();
      setOrders(d.orders || []);
      showToast("RFQ confirmed into official Purchase Order!");
    }
  };

  const handleReceivePoIntoStock = async (id: string) => {
    const { companyId, email } = getAuthMeta();
    const res = await fetch("/api/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "receive_po", company_id: companyId, email, id }),
    });
    const data = await res.json();
    if (data.success) {
      setOrders(data.orders || []);
      showToast(
        `Received ${data.order.poNumber} into Inventory & posted Vendor Bill ${data.order.billRef} in Accounting!`
      );
    }
  };

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendor.name.trim()) return;
    const { companyId, email } = getAuthMeta();
    const res = await fetch("/api/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add_vendor", company_id: companyId, email, ...newVendor }),
    });
    const data = await res.json();
    if (data.success) {
      setVendors(data.vendors || []);
      setIsVendorModalOpen(false);
      setNewVendor({ name: "", vendorEmail: "", phone: "", category: "Raw Materials & Stock", paymentTerms: "Net 30" });
      showToast(`Added vendor "${data.vendor.name}"!`);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      String(o.poNumber || "").toLowerCase().includes(q) ||
      String(o.vendorName || "").toLowerCase().includes(q)
    );
  });

  const totalCommitted = orders.reduce((s, o) => s + Number(o.totalAmount || 0), 0);
  const receivedCount = orders.filter((o) => o.status === "received").length;

  return (
    <div className="flex flex-col h-screen bg-[#0F172A] text-white">
      {toast && (
        <div className="fixed top-16 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xl flex items-center gap-2">
          <Sparkles size={14} /> {toast}
        </div>
      )}

      <StandardModuleHeader
        moduleName="Procurement & Purchase"
        moduleIcon={<ShoppingCart size={20} />}
        menuItems={MENU_ITEMS}
        searchPlaceholder="Search PO #, RFQ, or vendor..."
        onSearch={setSearch}
        onNewClick={() => setIsPoModalOpen(true)}
        newButtonLabel="New RFQ / PO"
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#1E293B] border border-gray-700 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400 uppercase font-bold">Total RFQs &amp; POs</span>
              <div className="text-2xl font-black text-white mt-1">{orders.length}</div>
            </div>
            <FileText size={22} className="text-purple-400" />
          </div>
          <div className="bg-[#1E293B] border border-gray-700 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400 uppercase font-bold">Stock Shipments Received</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">{receivedCount}</div>
            </div>
            <PackageCheck size={22} className="text-emerald-400" />
          </div>
          <div className="bg-[#1E293B] border border-gray-700 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400 uppercase font-bold">Procurement Spend</span>
              <div className="text-2xl font-black text-cyan-300 mt-1">
                {currencySymbol}{totalCommitted.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            <Truck size={22} className="text-cyan-400" />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex p-1 rounded-xl bg-[#1E293B] border border-gray-700 text-xs font-bold gap-1">
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-4 py-2 rounded-lg cursor-pointer ${
                activeTab === "orders" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              RFQs &amp; Purchase Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab("vendors")}
              className={`px-4 py-2 rounded-lg cursor-pointer ${
                activeTab === "vendors" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Approved Suppliers &amp; Vendors ({vendors.length})
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() =>
                exportToCSV(
                  "Purchase_Orders",
                  ["PO #", "Vendor", "Status", "Total", "Bill Ref", "Date"],
                  filteredOrders.map((o) => [o.poNumber, o.vendorName, o.status, o.totalAmount, o.billRef || "", o.expectedDate])
                )
              }
              className="px-3.5 py-2 rounded-xl bg-[#1E293B] border border-gray-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={14} className="text-cyan-400" /> CSV
            </button>
            <button
              onClick={() => setIsVendorModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Building2 size={14} /> + Add Vendor
            </button>
            <button
              onClick={() => setIsPoModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} /> New RFQ / Purchase Order
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeTab === "orders" ? (
          <div className="bg-[#1E293B] rounded-2xl border border-gray-700 overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#0F172A] border-b border-gray-700 text-gray-300 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">PO / RFQ #</th>
                  <th className="px-4 py-3">Supplier / Vendor</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total Value</th>
                  <th className="px-4 py-3">Status &amp; Bill</th>
                  <th className="px-4 py-3 text-right">Procurement Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 font-bold text-white">{po.poNumber}</td>
                    <td className="px-4 py-3 text-gray-300">{po.vendorName}</td>
                    <td className="px-4 py-3 text-gray-400">
                      {(po.lines || []).map((l: any) => `${l.quantity}x ${l.name}`).join(", ")}
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-400">
                      {currencySymbol}{Number(po.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          po.status === "received"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : po.status === "confirmed"
                            ? "bg-cyan-500/20 text-cyan-300"
                            : "bg-amber-500/20 text-amber-300"
                        }`}
                      >
                        {po.status}
                      </span>
                      {po.billRef && <span className="ml-2 font-mono text-[10px] text-purple-300">{po.billRef}</span>}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {po.status === "draft" && (
                        <button
                          onClick={() => handleConfirmPo(po.id)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
                        >
                          Confirm PO
                        </button>
                      )}
                      {po.status === "confirmed" && (
                        <button
                          onClick={() => handleReceivePoIntoStock(po.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                        >
                          Receive Stock &amp; Post Bill
                        </button>
                      )}
                      {po.status === "received" && (
                        <span className="text-emerald-400 font-bold">✓ Stocked &amp; Billed</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                      No Purchase Orders yet. Click <strong>+ New RFQ / Purchase Order</strong> to replenish Inventory from suppliers.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vendors.map((v) => (
              <div key={v.id} className="bg-[#1E293B] border border-gray-700 rounded-2xl p-5 space-y-2 text-xs">
                <span className="text-[10px] font-mono text-purple-300 font-bold">{v.id} • {v.paymentTerms}</span>
                <h3 className="text-base font-bold text-white">{v.name}</h3>
                <p className="text-gray-400">{v.category}</p>
                <p className="text-cyan-300 font-mono">{v.email || "—"} • {v.phone || "—"}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE PO MODAL */}
      {isPoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreatePo} className="bg-[#1A2236] border border-gray-700 rounded-3xl max-w-2xl w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-white">Create Supplier RFQ / Purchase Order</h3>
              <button type="button" onClick={() => setIsPoModalOpen(false)}><X size={18} /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-gray-300 mb-1">Supplier / Vendor *</label>
                <select value={vendorName} onChange={(e) => setVendorName(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-gray-700 text-white">
                  {vendors.map((v) => (
                    <option key={v.id} value={v.name}>{v.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-300 mb-1">Destination Warehouse</label>
                <input value={warehouse} onChange={(e) => setWarehouse(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-gray-700 text-white" />
              </div>
              <div>
                <label className="block font-bold text-gray-300 mb-1">Initial Stage</label>
                <select value={poStatus} onChange={(e) => setPoStatus(e.target.value as any)} className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-gray-700 text-white">
                  <option value="confirmed">Confirmed Purchase Order</option>
                  <option value="draft">Draft Request for Quotation (RFQ)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Purchase Lines (Auto-Stocks Inventory Upon Receipt)</span>
                <button
                  type="button"
                  onClick={() => setLines([...lines, { sku: "", name: "", quantity: 10, uom: "Units", unitCost: 0 }])}
                  className="text-purple-400 font-bold cursor-pointer"
                >
                  + Add Line
                </button>
              </div>
              {lines.map((ln, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2">
                  <input
                    placeholder="SKU"
                    value={ln.sku}
                    onChange={(e) => {
                      const next = [...lines];
                      next[idx].sku = e.target.value;
                      setLines(next);
                    }}
                    className="col-span-2 px-2.5 py-2 rounded-xl bg-[#0F172A] border border-gray-700 text-white"
                  />
                  <input
                    required
                    placeholder="Product / Raw Material *"
                    value={ln.name}
                    onChange={(e) => {
                      const next = [...lines];
                      next[idx].name = e.target.value;
                      setLines(next);
                    }}
                    className="col-span-5 px-2.5 py-2 rounded-xl bg-[#0F172A] border border-gray-700 text-white"
                  />
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={ln.quantity}
                    onChange={(e) => {
                      const next = [...lines];
                      next[idx].quantity = Number(e.target.value);
                      setLines(next);
                    }}
                    className="col-span-2 px-2 py-2 rounded-xl bg-[#0F172A] border border-gray-700 text-white text-center"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={ln.unitCost}
                    onChange={(e) => {
                      const next = [...lines];
                      next[idx].unitCost = Number(e.target.value);
                      setLines(next);
                    }}
                    className="col-span-2 px-2 py-2 rounded-xl bg-[#0F172A] border border-gray-700 text-white text-right"
                  />
                  <button
                    type="button"
                    onClick={() => lines.length > 1 && setLines(lines.filter((_, i) => i !== idx))}
                    className="col-span-1 flex items-center justify-center text-rose-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
              <button type="button" onClick={() => setIsPoModalOpen(false)} className="px-4 py-2 rounded-xl bg-gray-800">Cancel</button>
              <button type="submit" className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold cursor-pointer">Save Purchase Order</button>
            </div>
          </form>
        </div>
      )}

      {/* ADD VENDOR MODAL */}
      {isVendorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddVendor} className="bg-[#1A2236] border border-gray-700 rounded-3xl max-w-md w-full p-6 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-white">Register Approved Vendor</h3>
              <button type="button" onClick={() => setIsVendorModalOpen(false)}><X size={18} /></button>
            </div>
            <input required placeholder="Vendor / Supplier Name *" value={newVendor.name} onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-gray-700 text-white" />
            <input placeholder="Email" value={newVendor.vendorEmail} onChange={(e) => setNewVendor({ ...newVendor, vendorEmail: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-gray-700 text-white" />
            <input placeholder="Phone" value={newVendor.phone} onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-gray-700 text-white" />
            <input placeholder="Category" value={newVendor.category} onChange={(e) => setNewVendor({ ...newVendor, category: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-gray-700 text-white" />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsVendorModalOpen(false)} className="px-4 py-2 rounded-xl bg-gray-800">Cancel</button>
              <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold cursor-pointer">Save Vendor</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
