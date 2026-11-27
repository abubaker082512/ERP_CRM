"use client";

import { useState, useEffect, useCallback } from "react";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { useBranchContext } from "@/lib/branchContext";
import {
  BookOpen,
  Plus,
  Layers,
  PieChart,
  AlertTriangle,
  Scale,
  Sparkles,
  X,
} from "lucide-react";

const MENU_ITEMS = [
  { name: "Point of Sale", href: "/pos" },
  { name: "Kitchen Display (KDS)", href: "/pos/kds" },
  { name: "Recipe BOM", href: "/pos/recipes" },
  { name: "Floor Plan & Tables", href: "/pos/tables" },
  { name: "Orders", href: "/pos/orders" },
  { name: "Products", href: "/pos/products" },
];

type Ingredient = {
  id: string;
  name: string;
  unit: "g" | "kg" | "ml" | "L" | "pcs" | "slices";
  quantity: number;
  costPerUnit: number;
};

type Recipe = {
  id: string;
  name: string;
  category: "Bakery" | "Coffee & Drinks" | "Mains" | "Desserts";
  sellingPrice: number;
  ingredients: Ingredient[];
  yieldCount: number;
  prepTimeMinutes: number;
  notes?: string;
};

type WasteRecord = {
  id: string;
  date: string;
  item: string;
  qty: string;
  reason: "Burnt / Overcooked" | "Expired" | "Dropped / Damaged" | "Trim Waste";
  estimatedLoss: number;
  loggedBy: string;
};

const STARTER_RESTAURANT_RECIPES: Recipe[] = [
  {
    id: "REC-101",
    name: "Artisan Smash Burger",
    category: "Mains",
    sellingPrice: 14.5,
    yieldCount: 1,
    prepTimeMinutes: 8,
    notes: "Double 90g wagyu chuck patties, brioche bun, aged cheddar, house burger sauce.",
    ingredients: [
      { id: "ing-1", name: "Prime Grass-Fed Ribeye (per kg)", unit: "kg", quantity: 0.18, costPerUnit: 17.0 },
      { id: "ing-2", name: "Aged Deli Cheddar (per kg)", unit: "kg", quantity: 0.04, costPerUnit: 11.2 },
      { id: "ing-3", name: "Artisan Brioche Bun", unit: "pcs", quantity: 1, costPerUnit: 0.85 },
    ],
  },
  {
    id: "REC-102",
    name: "Truffle Margherita Pizza",
    category: "Mains",
    sellingPrice: 18.0,
    yieldCount: 1,
    prepTimeMinutes: 11,
    notes: "72-hour fermented sourdough dough, San Marzano tomato, fior di latte, black truffle oil.",
    ingredients: [
      { id: "ing-4", name: "Sourdough Pizza Dough Ball", unit: "pcs", quantity: 1, costPerUnit: 1.4 },
      { id: "ing-5", name: "Fior di Latte Mozzarella", unit: "g", quantity: 140, costPerUnit: 0.016 },
      { id: "ing-6", name: "Extra Virgin Olive Oil 1L", unit: "L", quantity: 0.02, costPerUnit: 9.2 },
    ],
  },
  {
    id: "REC-103",
    name: "Spanish Iced Latte",
    category: "Coffee & Drinks",
    sellingPrice: 5.5,
    yieldCount: 1,
    prepTimeMinutes: 3,
    notes: "Double shot Arabica espresso, condensed milk, cold organic whole milk over ice.",
    ingredients: [
      { id: "ing-7", name: "Arabica Coffee Beans 500g", unit: "pcs", quantity: 0.04, costPerUnit: 10.0 },
      { id: "ing-8", name: "Organic Whole Milk 1L", unit: "L", quantity: 0.22, costPerUnit: 2.4 },
    ],
  },
];

export default function RecipeBOMPage() {
  const { activeBranch, getEntityStorageKey } = useBranchContext();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [wasteLogs, setWasteLogs] = useState<WasteRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"recipes" | "waste">("recipes");
  const [isNewRecipeModalOpen, setIsNewRecipeModalOpen] = useState(false);
  const [isWasteModalOpen, setIsWasteModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const [newRecName, setNewRecName] = useState("");
  const [newRecCat, setNewRecCat] = useState<Recipe["category"]>("Mains");
  const [newRecPrice, setNewRecPrice] = useState(14.5);
  const [newRecYield, setNewRecYield] = useState(1);
  const [newRecTime, setNewRecTime] = useState(10);
  const [newRecNotes, setNewRecNotes] = useState("");

  const [wasteItem, setWasteItem] = useState("");
  const [wasteQty, setWasteQty] = useState("2 portions");
  const [wasteReason, setWasteReason] = useState<WasteRecord["reason"]>("Expired");
  const [wasteLoss, setWasteLoss] = useState(12.5);

  const getAuthMeta = useCallback(() => {
    if (typeof window === "undefined") return { companyId: "CMP-001", email: "" };
    const companyId = activeBranch?.id || localStorage.getItem("beraxis_active_branch_id") || "CMP-001";
    let email = "";
    try {
      email = JSON.parse(localStorage.getItem("user") || "{}").email || "";
    } catch {}
    return { companyId, email };
  }, [activeBranch?.id]);

  const loadRecipes = useCallback(async () => {
    const recKey = getEntityStorageKey("pos_recipes");
    const wasteKey = getEntityStorageKey("pos_waste_logs");
    let localRecs: Recipe[] = [];
    let localWaste: WasteRecord[] = [];
    try {
      const r = localStorage.getItem(recKey);
      if (r) localRecs = JSON.parse(r);
      const w = localStorage.getItem(wasteKey);
      if (w) localWaste = JSON.parse(w);
    } catch {}

    try {
      const { companyId, email } = getAuthMeta();
      const res = await fetch(
        `/api/pos?company_id=${encodeURIComponent(companyId)}&email=${encodeURIComponent(email)}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.recipes) && data.recipes.length > 0) {
          localRecs = data.recipes;
          localStorage.setItem(recKey, JSON.stringify(localRecs));
        }
        if (Array.isArray(data.wasteLogs) && data.wasteLogs.length > 0) {
          localWaste = data.wasteLogs;
          localStorage.setItem(wasteKey, JSON.stringify(localWaste));
        }
      }
    } catch {}

    setRecipes(localRecs);
    setWasteLogs(localWaste);
    if (localRecs.length > 0) setSelectedRecipe(localRecs[0]);
  }, [getAuthMeta, getEntityStorageKey]);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  const syncClusterRecipes = async (nextRecipes: Recipe[], nextWaste: WasteRecord[]) => {
    setRecipes(nextRecipes);
    setWasteLogs(nextWaste);
    try {
      localStorage.setItem(getEntityStorageKey("pos_recipes"), JSON.stringify(nextRecipes));
      localStorage.setItem(getEntityStorageKey("pos_waste_logs"), JSON.stringify(nextWaste));
      const { companyId, email } = getAuthMeta();
      await fetch("/api/pos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_recipes",
          company_id: companyId,
          email,
          recipes: nextRecipes,
          wasteLogs: nextWaste,
        }),
      });
    } catch {}
  };

  const handleSeedStarterRecipes = () => {
    syncClusterRecipes(STARTER_RESTAURANT_RECIPES, wasteLogs);
    setSelectedRecipe(STARTER_RESTAURANT_RECIPES[0]);
  };

  const calculateTotalCost = (recipe: Recipe) =>
    recipe.ingredients.reduce((acc, ing) => acc + ing.quantity * ing.costPerUnit, 0);

  const calculateCostPerPiece = (recipe: Recipe) =>
    calculateTotalCost(recipe) / Math.max(1, recipe.yieldCount || 1);

  const handleCreateRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecName.trim()) return;
    const newRec: Recipe = {
      id: `REC-${Date.now().toString().slice(-3)}`,
      name: newRecName.trim(),
      category: newRecCat,
      sellingPrice: Number(newRecPrice),
      yieldCount: Number(newRecYield),
      prepTimeMinutes: Number(newRecTime),
      notes: newRecNotes,
      ingredients: [
        { id: `ing-${Date.now()}-1`, name: "Primary Raw Ingredient", unit: "g", quantity: 200, costPerUnit: 0.015 },
        { id: `ing-${Date.now()}-2`, name: "House Sauce / Seasoning", unit: "ml", quantity: 40, costPerUnit: 0.012 },
      ],
    };
    const next = [newRec, ...recipes];
    syncClusterRecipes(next, wasteLogs);
    setSelectedRecipe(newRec);
    setIsNewRecipeModalOpen(false);
    setNewRecName("");
  };

  const handleLogWaste = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wasteItem.trim()) return;
    const entry: WasteRecord = {
      id: `WST-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().slice(0, 10),
      item: wasteItem.trim(),
      qty: wasteQty,
      reason: wasteReason,
      estimatedLoss: Number(wasteLoss) || 0,
      loggedBy: "Kitchen Lead",
    };
    syncClusterRecipes(recipes, [entry, ...wasteLogs]);
    setIsWasteModalOpen(false);
    setWasteItem("");
  };

  const totalWasteLoss = wasteLogs.reduce((s, w) => s + (w.estimatedLoss || 0), 0);

  return (
    <div className="flex flex-col h-screen bg-[#07090f] text-white">
      <StandardModuleHeader
        moduleName="Recipe BOM & Food Costing"
        moduleIcon={<BookOpen size={20} />}
        menuItems={MENU_ITEMS}
        searchPlaceholder="Search recipes & ingredients..."
      />

      <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="galaxy-card p-4 rounded-2xl bg-[#101422] border border-blue-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Formulated Recipes</span>
              <h3 className="text-2xl font-bold text-blue-400 mt-0.5">{recipes.length} BOMs</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Auto Stock Deduction Ready</p>
            </div>
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl"><BookOpen size={20} /></div>
          </div>

          <div className="galaxy-card p-4 rounded-2xl bg-[#101422] border border-emerald-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Avg Food Cost %</span>
              <h3 className="text-2xl font-bold text-emerald-400 mt-0.5">26.4%</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Target: &lt; 30% Healthy Margin</p>
            </div>
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl"><PieChart size={20} /></div>
          </div>

          <div className="galaxy-card p-4 rounded-2xl bg-[#101422] border border-purple-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Yield Accuracy</span>
              <h3 className="text-2xl font-bold text-purple-400 mt-0.5">98.1%</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Synced with POS Checkout</p>
            </div>
            <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl"><Scale size={20} /></div>
          </div>

          <div className="galaxy-card p-4 rounded-2xl bg-[#101422] border border-red-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Logged Spoilage</span>
              <h3 className="text-2xl font-bold text-red-400 mt-0.5">${totalWasteLoss.toFixed(2)}</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">{wasteLogs.length} incidents</p>
            </div>
            <div className="p-3 bg-red-500/20 text-red-400 rounded-xl"><AlertTriangle size={20} /></div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#101422] p-3.5 rounded-2xl border border-gray-800">
          <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab("recipes")}
              className={`px-3.5 py-1.5 rounded-lg cursor-pointer ${
                activeTab === "recipes" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Recipe Bill of Materials ({recipes.length})
            </button>
            <button
              onClick={() => setActiveTab("waste")}
              className={`px-3.5 py-1.5 rounded-lg cursor-pointer ${
                activeTab === "waste" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Kitchen Waste &amp; Spoilage ({wasteLogs.length})
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleSeedStarterRecipes}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              <Sparkles size={13} /> Load Restaurant BOMs
            </button>
            <button
              onClick={() => setIsWasteModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-600/20 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-bold cursor-pointer"
            >
              + Log Spoilage
            </button>
            <button
              onClick={() => setIsNewRecipeModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              <Plus size={14} /> + Formulate Recipe
            </button>
          </div>
        </div>

        {activeTab === "recipes" ? (
          recipes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-gray-800 rounded-3xl bg-[#0e121d]/40 max-w-xl mx-auto">
              <h3 className="text-lg font-bold text-white mb-2">No Recipes Formulated Yet</h3>
              <p className="text-sm text-gray-400 max-w-sm mb-6">
                Load starter Restaurant BOMs (Smash Burger, Margherita Pizza, Iced Latte) so POS sales automatically deduct raw ingredients from Inventory!
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleSeedStarterRecipes}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Load Restaurant Starter BOMs
                </button>
                <button
                  onClick={() => setIsNewRecipeModalOpen(true)}
                  className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  + Custom Recipe
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-5 space-y-3">
                {recipes.map((rec) => {
                  const costPerPiece = calculateCostPerPiece(rec);
                  const foodCostPct = ((costPerPiece / rec.sellingPrice) * 100).toFixed(1);
                  const isSelected = selectedRecipe?.id === rec.id;
                  return (
                    <div
                      key={rec.id}
                      onClick={() => setSelectedRecipe(rec)}
                      className={`p-4 rounded-2xl border cursor-pointer space-y-3 ${
                        isSelected ? "bg-[#151b2c] border-purple-500 ring-1 ring-purple-500" : "bg-[#101422] border-gray-800"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-purple-400 block">{rec.category}</span>
                          <h4 className="font-bold text-white text-sm mt-0.5">{rec.name}</h4>
                        </div>
                        <span className="font-bold text-emerald-400 text-sm">${rec.sellingPrice.toFixed(2)}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 bg-gray-900/70 p-2.5 rounded-xl border border-gray-800 text-[11px]">
                        <div>
                          <span className="text-gray-500 block text-[9px] uppercase">Yield</span>
                          <span className="font-semibold text-white">{rec.yieldCount} portion</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[9px] uppercase">COGS</span>
                          <span className="font-bold text-amber-400">${costPerPiece.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[9px] uppercase">Food Cost %</span>
                          <span className={`font-bold ${Number(foodCostPct) <= 30 ? "text-emerald-400" : "text-red-400"}`}>
                            {foodCostPct}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedRecipe && (
                <div className="lg:col-span-7 bg-[#101422] rounded-3xl border border-gray-800 p-6 space-y-6">
                  <div className="border-b border-gray-800 pb-4 flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-purple-400">{selectedRecipe.id}</span>
                      <h3 className="text-xl font-extrabold text-white mt-0.5">{selectedRecipe.name}</h3>
                      <p className="text-xs text-gray-400 mt-1">{selectedRecipe.notes}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Prep: {selectedRecipe.prepTimeMinutes}m
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-white text-xs uppercase flex items-center gap-1.5">
                      <Layers size={14} className="text-purple-400" /> Raw Material Ingredients ({selectedRecipe.ingredients.length})
                    </h4>
                    <div className="bg-gray-950/70 rounded-2xl border border-gray-800 overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-900 text-gray-400 font-bold border-b border-gray-800 text-[10px] uppercase">
                          <tr>
                            <th className="px-3.5 py-2.5">Inventory Raw Material</th>
                            <th className="px-3.5 py-2.5">Portion Qty</th>
                            <th className="px-3.5 py-2.5">Unit Cost</th>
                            <th className="px-3.5 py-2.5 text-right">Extended</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/60">
                          {selectedRecipe.ingredients.map((ing) => (
                            <tr key={ing.id}>
                              <td className="px-3.5 py-2.5 font-semibold text-white">{ing.name}</td>
                              <td className="px-3.5 py-2.5 font-mono text-purple-300">{ing.quantity} {ing.unit}</td>
                              <td className="px-3.5 py-2.5 text-gray-400">${ing.costPerUnit.toFixed(2)}</td>
                              <td className="px-3.5 py-2.5 text-right font-bold text-emerald-400">
                                ${(ing.quantity * ing.costPerUnit).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        ) : (
          <div className="bg-[#101422] rounded-3xl border border-gray-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Kitchen Waste, Burnt &amp; Spoilage Log</h3>
            {wasteLogs.length === 0 ? (
              <p className="text-xs text-gray-400 py-10 text-center">No spoilage incidents logged yet.</p>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-900 text-gray-400 uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">ID</th>
                    <th className="px-4 py-2.5">Date</th>
                    <th className="px-4 py-2.5">Item &amp; Qty</th>
                    <th className="px-4 py-2.5">Reason</th>
                    <th className="px-4 py-2.5 text-right">Loss</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {wasteLogs.map((w) => (
                    <tr key={w.id}>
                      <td className="px-4 py-2.5 font-mono text-purple-400">{w.id}</td>
                      <td className="px-4 py-2.5 text-gray-400">{w.date}</td>
                      <td className="px-4 py-2.5 font-bold text-white">{w.item} ({w.qty})</td>
                      <td className="px-4 py-2.5 text-amber-300">{w.reason}</td>
                      <td className="px-4 py-2.5 text-right font-bold text-red-400">${w.estimatedLoss.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {isNewRecipeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form onSubmit={handleCreateRecipe} className="bg-[#101422] border border-gray-700 rounded-3xl max-w-lg w-full p-6 space-y-4 text-xs text-white">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold">Formulate New Menu Recipe (BOM)</h3>
              <button type="button" onClick={() => setIsNewRecipeModalOpen(false)}><X size={18} /></button>
            </div>
            <input required value={newRecName} onChange={(e) => setNewRecName(e.target.value)} placeholder="Menu Dish Name *" className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2" />
            <div className="grid grid-cols-3 gap-3">
              <select value={newRecCat} onChange={(e) => setNewRecCat(e.target.value as any)} className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2">
                <option value="Mains">Mains</option>
                <option value="Bakery">Bakery</option>
                <option value="Coffee & Drinks">Drinks</option>
                <option value="Desserts">Desserts</option>
              </select>
              <input type="number" step="0.1" value={newRecPrice} onChange={(e) => setNewRecPrice(Number(e.target.value))} placeholder="Price" className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2" />
              <input type="number" min="1" value={newRecTime} onChange={(e) => setNewRecTime(Number(e.target.value))} placeholder="Prep Mins" className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2" />
            </div>
            <textarea rows={2} value={newRecNotes} onChange={(e) => setNewRecNotes(e.target.value)} placeholder="Chef plating & prep notes..." className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2" />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsNewRecipeModalOpen(false)} className="px-4 py-2 bg-gray-800 rounded-xl">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-purple-600 rounded-xl font-bold">Save Recipe</button>
            </div>
          </form>
        </div>
      )}

      {isWasteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form onSubmit={handleLogWaste} className="bg-[#101422] border border-gray-700 rounded-3xl max-w-md w-full p-6 space-y-4 text-xs text-white">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold">Log Kitchen Spoilage / Waste</h3>
              <button type="button" onClick={() => setIsWasteModalOpen(false)}><X size={18} /></button>
            </div>
            <input required value={wasteItem} onChange={(e) => setWasteItem(e.target.value)} placeholder="Item / Ingredient Wasted *" className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2" />
            <div className="grid grid-cols-2 gap-3">
              <input value={wasteQty} onChange={(e) => setWasteQty(e.target.value)} placeholder="Quantity (e.g. 1.5 kg)" className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2" />
              <input type="number" step="0.1" value={wasteLoss} onChange={(e) => setWasteLoss(Number(e.target.value))} placeholder="Est. Loss ($)" className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2" />
            </div>
            <select value={wasteReason} onChange={(e) => setWasteReason(e.target.value as any)} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2">
              <option value="Expired">Expired</option>
              <option value="Burnt / Overcooked">Burnt / Overcooked</option>
              <option value="Dropped / Damaged">Dropped / Damaged</option>
              <option value="Trim Waste">Trim Waste</option>
            </select>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsWasteModalOpen(false)} className="px-4 py-2 bg-gray-800 rounded-xl">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-rose-600 rounded-xl font-bold">Save Log</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
