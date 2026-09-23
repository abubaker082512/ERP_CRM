"use client";
import { fetchAPI } from "@/lib/api";
import { useState, useEffect, useRef } from "react";
import AppHeader from "@/components/layout/AppHeader";
import { Calculator, ShoppingCart, DollarSign, X, Check, Search, CreditCard, Clock, Plus, Loader2, Printer } from "lucide-react";

import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import ViewSwitcher, { ViewType } from "@/components/shared/ViewSwitcher";
import { useState } from "react";
import { ShoppingBag, CreditCard, Monitor, User, Play } from "lucide-react";

const MENU_ITEMS = [
    { name: "Dashboard", href: "/pos" },
    { name: "Orders", href: "/pos/orders" },
    { name: "Products", href: "/pos/products" },
    { name: "Reporting", href: "/pos/reporting" },
    { name: "Configuration", href: "/pos/configuration" },
];

type POSSession = {
    id: string;
    name: string;
    point_of_sale: string;
    status: string;
    opened_by: string;
    opening_date: string;
    closing_date: string;
};

const mockSessions: POSSession[] = [
    { id: "POS/2025/001", name: "Shop 1 - Session 1", point_of_sale: "Main Shop", status: "in_progress", opened_by: "John Doe", opening_date: "2025-12-02 09:00", closing_date: "" },
    { id: "POS/2025/002", name: "Shop 2 - Session 1", point_of_sale: "Branch Shop", status: "closed", opened_by: "Jane Smith", opening_date: "2025-12-01 09:00", closing_date: "2025-12-01 18:00" },
];

export default function POSPage() {
    const [sessions] = useState<POSSession[]>(mockSessions);
    const [currentView, setCurrentView] = useState<ViewType>("kanban");

    return (
        <div className="flex flex-col h-screen bg-[#0F172A]">
            <StandardModuleHeader
                moduleName="Point of Sale"
                moduleIcon={<ShoppingBag size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search sessions..."
            />

            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-200">Point of Sale</h2>
                            <p className="text-sm text-gray-400 mt-1">{sessions.length} sessions</p>
                        </div>
                        <ViewSwitcher
                            currentView={currentView}
                            availableViews={["list", "kanban"]}
                            onViewChange={setCurrentView}
                        />
                    </div>
                </div>

                {currentView === "list" && (
                    <div className="bg-[#1E293B] rounded-lg border border-gray-700 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-[#0F172A] border-b border-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Session ID</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Point of Sale</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Opened By</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Opening Date</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Closing Date</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.map(session => (
                                    <tr key={session.id} className="border-b border-gray-700 hover:bg-[#1E293B] transition-colors">
                                        <td className="px-4 py-3 font-medium text-white">{session.id}</td>
                                        <td className="px-4 py-3 text-gray-300">{session.point_of_sale}</td>
                                        <td className="px-4 py-3 text-gray-300">{session.opened_by}</td>
                                        <td className="px-4 py-3 text-gray-400">{session.opening_date}</td>
                                        <td className="px-4 py-3 text-gray-400">{session.closing_date || "-"}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${session.status === 'in_progress' ? 'bg-green-500/20 text-green-400' :
                                                    'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {session.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button className="text-blue-400 hover:text-blue-300 text-sm">View</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {currentView === "kanban" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sessions.map(session => (
                            <div key={session.id} className="bg-[#1E293B] border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-semibold text-white text-lg mb-1">{session.point_of_sale}</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <User size={14} />
                                            <span>{session.opened_by}</span>
                                        </div>
                                    </div>
                                    <div className={`px-2 py-1 rounded text-xs font-medium ${session.status === 'in_progress' ? 'bg-green-500/20 text-green-400' :
                                            'bg-gray-500/20 text-gray-400'
                                        }`}>
                                        {session.status.replace('_', ' ')}
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Opening Date</span>
                                        <span className="text-white">{session.opening_date}</span>
                                    </div>
                                    {session.closing_date && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Closing Date</span>
                                            <span className="text-white">{session.closing_date}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-gray-700">
                                    {session.status === 'in_progress' ? (
                                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded flex items-center justify-center gap-2">
                                            <Monitor size={18} /> Continue Selling
                                        </button>
                                    ) : (
                                        <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded flex items-center justify-center gap-2">
                                            <Play size={18} /> New Session
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
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
