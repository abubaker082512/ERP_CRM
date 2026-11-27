"use client";

import { useState, useEffect } from "react";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { Plus, Trash2, BarChart3, CheckCircle2, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useBranchContext } from "@/lib/branchContext";
import { GLOBAL_INDUSTRIES } from "@/lib/industryTaxonomy";

const MENU_ITEMS = [
  { name: "Order-to-Cash Hub", href: "/sales" },
  { name: "Confirmed Orders", href: "/sales/orders" },
  { name: "New Quotation / Order", href: "/sales/quotations/new" },
];

type OrderLine = {
  sku: string;
  name: string;
  description: string;
  quantity: number;
  uom: string;
  unitPrice: number;
  discountPct: number;
  subtotal: number;
};

export default function NewQuotationPage() {
  const router = useRouter();
  const { activeBranch, getEntityStorageKey } = useBranchContext();
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [industryId, setIndustryId] = useState<string>(activeBranch?.industryId || "retail_supermarket");
  const [channel, setChannel] = useState<
    "Direct Sales" | "Wholesale B2B" | "Catering & Events" | "Call Center Closer" | "eCommerce"
  >("Direct Sales");
  const [pricelistName, setPricelistName] = useState("Standard Retail Tariff");
  const [paymentTerms, setPaymentTerms] = useState("Immediate");
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState("");
  const [catalogItems, setCatalogItems] = useState<{ name: string; sku: string; price: number; uom: string }[]>([]);
  const [lines, setLines] = useState<OrderLine[]>([
    { sku: "", name: "", description: "", quantity: 1, uom: "Units", unitPrice: 0, discountPct: 0, subtotal: 0 },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (activeBranch?.industryId) setIndustryId(activeBranch.industryId);
    // Load local POS / Inventory items for quick selection
    try {
      const posRaw = localStorage.getItem(getEntityStorageKey("pos_products"));
      const invRaw = localStorage.getItem(getEntityStorageKey("inventory"));
      const posItems = posRaw ? JSON.parse(posRaw) : [];
      const invItems = invRaw ? JSON.parse(invRaw) : [];
      const combined: { name: string; sku: string; price: number; uom: string }[] = [];
      for (const p of [...posItems, ...invItems]) {
        if (p?.name && !combined.some((c) => c.name === p.name)) {
          combined.push({
            name: p.name,
            sku: p.sku || "",
            price: Number(p.list_price ?? p.unit_price ?? 0),
            uom: p.uom || "Units",
          });
        }
      }
      setCatalogItems(combined);
    } catch {}
  }, [activeBranch?.id, activeBranch?.industryId, getEntityStorageKey]);

  const addLine = () => {
    setLines([
      ...lines,
      { sku: "", name: "", description: "", quantity: 1, uom: "Units", unitPrice: 0, discountPct: 0, subtotal: 0 },
    ]);
  };

  const updateLine = (idx: number, field: keyof OrderLine, value: any) => {
    const next = [...lines];
    const line = { ...next[idx], [field]: value };
    if (field === "name") {
      const match = catalogItems.find((c) => c.name === value);
      if (match) {
        line.sku = match.sku;
        line.unitPrice = match.price;
        line.uom = match.uom;
      }
    }
    const qty = Number(line.quantity) || 0;
    const price = Number(line.unitPrice) || 0;
    const disc = Math.max(0, Math.min(100, Number(line.discountPct) || 0));
    line.subtotal = Number((qty * price * (1 - disc / 100)).toFixed(2));
    next[idx] = line;
    setLines(next);
  };

  const removeLine = (idx: number) => {
    if (lines.length <= 1) return;
    setLines(lines.filter((_, i) => i !== idx));
  };

  const subtotal = lines.reduce((s, l) => s + (l.subtotal || 0), 0);
  const taxAmount = Number(((subtotal * (Number(taxRate) || 0)) / 100).toFixed(2));
  const grandTotal = Number((subtotal + taxAmount).toFixed(2));

  const submitOrder = async (initialState: "draft" | "sale") => {
    if (!customerName.trim()) {
      alert("Please enter a customer or company name.");
      return;
    }
    const validLines = lines.filter((l) => l.name.trim());
    if (validLines.length === 0) {
      alert("Please enter at least one line item.");
      return;
    }

    setSaving(true);
    try {
      const companyId = activeBranch?.id || localStorage.getItem("beraxis_active_branch_id") || "CMP-001";
      let email = "";
      try {
        email = JSON.parse(localStorage.getItem("user") || "{}").email || "";
      } catch {}

      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: companyId,
          email,
          industryId,
          channel,
          customer_name: customerName.trim(),
          customer_email: customerEmail.trim(),
          customer_phone: customerPhone.trim(),
          pricelistName,
          paymentTerms,
          taxRate: Number(taxRate) || 0,
          notes,
          state: initialState,
          lines: validLines,
        }),
      });
      const data = await res.json();
      if (data.success && data.order?.id) {
        router.push(`/sales/${data.order.id}`);
      } else {
        router.push("/sales");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0F172A] text-white">
      <StandardModuleHeader
        moduleName="New Quotation / Sales Order"
        moduleIcon={<BarChart3 size={20} />}
        menuItems={MENU_ITEMS}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto bg-[#1E293B] rounded-2xl border border-gray-700 p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-700 pb-4">
            <div>
              <h1 className="text-xl font-bold text-white">Create Multi-Industry Quotation or Sales Order</h1>
              <p className="text-xs text-gray-400">
                Saved directly to your isolated company cluster ({activeBranch?.name || "Workspace"})
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => submitOrder("draft")}
                className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <FileText size={14} /> Save Draft Quotation
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => submitOrder("sale")}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 size={14} /> Confirm Sales Order
              </button>
              <button
                type="button"
                onClick={() => router.push("/sales")}
                className="border border-gray-600 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gray-300 mb-1">Customer / Account Name *</label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. FreshMart Wholesale, Banquet Client..."
                className="w-full bg-[#0F172A] border border-gray-600 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-300 mb-1">Customer Email</label>
              <input
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="billing@client.com"
                className="w-full bg-[#0F172A] border border-gray-600 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-300 mb-1">Customer Phone</label>
              <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+1 (555) 234-5678"
                className="w-full bg-[#0F172A] border border-gray-600 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gray-300 mb-1">Industry Workflow</label>
              <select
                value={industryId}
                onChange={(e) => setIndustryId(e.target.value)}
                className="w-full bg-[#0F172A] border border-gray-600 rounded-xl px-3 py-2 text-white"
              >
                {GLOBAL_INDUSTRIES.map((ind) => (
                  <option key={ind.id} value={ind.id}>
                    {ind.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-gray-300 mb-1">Sales Channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as any)}
                className="w-full bg-[#0F172A] border border-gray-600 rounded-xl px-3 py-2 text-white"
              >
                <option value="Direct Sales">Direct Sales</option>
                <option value="Wholesale B2B">Wholesale B2B / Supermarket</option>
                <option value="Catering & Events">Restaurant Catering &amp; Banquet</option>
                <option value="Call Center Closer">Call Center Closer Deal</option>
                <option value="eCommerce">Online / eCommerce</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-gray-300 mb-1">Pricelist Tier</label>
              <select
                value={pricelistName}
                onChange={(e) => setPricelistName(e.target.value)}
                className="w-full bg-[#0F172A] border border-gray-600 rounded-xl px-3 py-2 text-white"
              >
                <option value="Standard Retail Tariff">Standard Retail Tariff</option>
                <option value="Supermarket / B2B Case Wholesale">Supermarket / B2B Case Wholesale</option>
                <option value="Corporate & VIP Contract Tier">Corporate &amp; VIP Contract Tier</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-gray-300 mb-1">Payment Terms</label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full bg-[#0F172A] border border-gray-600 rounded-xl px-3 py-2 text-white"
              >
                <option value="Immediate">Immediate / Due on Receipt</option>
                <option value="50% Deposit / Balance on Event">50% Deposit / Balance on Delivery</option>
                <option value="Net 15 Days">Net 15 Days</option>
                <option value="Net 30 Days">Net 30 Days</option>
              </select>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Order Lines (Products, Cases, Menu Packages, or Services)</h3>
              <button
                type="button"
                onClick={addLine}
                className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} /> Add Line
              </button>
            </div>

            {catalogItems.length > 0 && (
              <datalist id="workspace-catalog-items">
                {catalogItems.map((ci) => (
                  <option key={ci.name} value={ci.name}>
                    {ci.sku} (${ci.price})
                  </option>
                ))}
              </datalist>
            )}

            <div className="overflow-x-auto border border-gray-700 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#0F172A] text-gray-300 uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2.5">Item / Dish / Service *</th>
                    <th className="px-3 py-2.5 w-24">SKU</th>
                    <th className="px-3 py-2.5 w-20">Qty</th>
                    <th className="px-3 py-2.5 w-24">UoM</th>
                    <th className="px-3 py-2.5 w-28">Unit Price</th>
                    <th className="px-3 py-2.5 w-20">Disc %</th>
                    <th className="px-3 py-2.5 w-28 text-right">Subtotal</th>
                    <th className="px-2 py-2.5 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/70">
                  {lines.map((line, i) => (
                    <tr key={i} className="bg-[#1E293B]">
                      <td className="p-2">
                        <input
                          list="workspace-catalog-items"
                          value={line.name}
                          onChange={(e) => updateLine(i, "name", e.target.value)}
                          placeholder="Type item or pick from catalog..."
                          className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-2.5 py-1.5 text-white"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          value={line.sku}
                          onChange={(e) => updateLine(i, "sku", e.target.value)}
                          placeholder="SKU"
                          className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-2 py-1.5 text-white"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={line.quantity}
                          onChange={(e) => updateLine(i, "quantity", e.target.value)}
                          className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-2 py-1.5 text-white text-center"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={line.uom}
                          onChange={(e) => updateLine(i, "uom", e.target.value)}
                          className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-2 py-1.5 text-white"
                        >
                          <option value="Units">Units</option>
                          <option value="Cases">Cases</option>
                          <option value="Kg">Kg</option>
                          <option value="Guests">Guests</option>
                          <option value="Hours">Hours</option>
                          <option value="Months">Months</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.01"
                          value={line.unitPrice}
                          onChange={(e) => updateLine(i, "unitPrice", e.target.value)}
                          className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-2 py-1.5 text-white text-right"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={line.discountPct}
                          onChange={(e) => updateLine(i, "discountPct", e.target.value)}
                          className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-2 py-1.5 text-white text-center"
                        />
                      </td>
                      <td className="p-2 text-right font-bold text-emerald-400">
                        ${line.subtotal.toFixed(2)}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeLine(i)}
                          className="text-gray-400 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end pt-2">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                Terms, Delivery Instructions, Banquet Headcount, or Policy Notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special delivery dock hours, menu allergies, warranty/policy details..."
                className="w-full bg-[#0F172A] border border-gray-700 rounded-xl p-3 text-xs text-white outline-none"
              />
            </div>

            <div className="bg-[#0F172A] border border-gray-700 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span className="text-white font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span>Tax / VAT (%)</span>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-20 bg-[#1E293B] border border-gray-700 rounded-lg px-2 py-1 text-right text-white"
                />
              </div>
              <div className="flex justify-between text-base font-black text-white pt-2 border-t border-gray-800">
                <span>Total Order Value</span>
                <span className="text-emerald-400">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
