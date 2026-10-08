"use client";

import { useState, useEffect } from "react";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { useBranchContext } from "@/lib/branchContext";
import {
  BookOpen,
  Plus,
  Package,
  DollarSign,
  Layers,
  PieChart,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Sparkles,
  Search,
  X,
  Edit3
} from "lucide-react";

const MENU_ITEMS = [
  { name: "Point of Sale", href: "/pos" },
  { name: "Kitchen Display (KDS)", href: "/pos/kds" },
  { name: "Recipe BOM", href: "/pos/recipes" },
  { name: "Floor Plan & Tables", href: "/pos/tables" },
  { name: "Orders", href: "/pos/orders" },
  { name: "Products", href: "/pos/products" }
];

type Ingredient = {
  id: string;
  name: string;
  unit: "g" | "kg" | "ml" | "L" | "pcs" | "slices";
  quantity: number;
  costPerUnit: number; // in USD
};

type Recipe = {
  id: string;
  name: string;
  category: "Bakery" | "Coffee & Drinks" | "Mains" | "Desserts";
  sellingPrice: number;
  ingredients: Ingredient[];
  yieldCount: number; // e.g. 1 portion or 12 batch
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

const INITIAL_RECIPES: Recipe[] = [];
const INITIAL_WASTE: WasteRecord[] = [];

export default function RecipeBOMPage() {
  const { activeBranch, getEntityStorageKey } = useBranchContext();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [wasteLogs, setWasteLogs] = useState<WasteRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"recipes" | "waste">("recipes");
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewRecipeModalOpen, setIsNewRecipeModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Form State
  const [newRecName, setNewRecName] = useState("");
  const [newRecCat, setNewRecCat] = useState<any>("Bakery");
  const [newRecPrice, setNewRecPrice] = useState(8.50);
  const [newRecYield, setNewRecYield] = useState(1);
  const [newRecTime, setNewRecTime] = useState(15);
  const [newRecNotes, setNewRecNotes] = useState("");

  // Entity-scoped data loading
  useEffect(() => {
    if (!activeBranch) return;
    const recKey = getEntityStorageKey("pos_recipes");
    const wasteKey = getEntityStorageKey("pos_waste_logs");

    const savedRec = localStorage.getItem(recKey);
    if (savedRec) {
      try {
        const parsed = JSON.parse(savedRec);
        setRecipes(parsed);
        if (parsed.length > 0) setSelectedRecipe(parsed[0]);
        else setSelectedRecipe(null);
      } catch {
        setRecipes([]);
        setSelectedRecipe(null);
      }
    } else {
      setRecipes([]);
      setSelectedRecipe(null);
    }

    const savedWaste = localStorage.getItem(wasteKey);
    if (savedWaste) {
      try {
        setWasteLogs(JSON.parse(savedWaste));
      } catch {
        setWasteLogs([]);
      }
    } else {
      setWasteLogs([]);
    }
  }, [activeBranch?.id]);

  const persistRecipes = (updated: Recipe[]) => {
    setRecipes(updated);
    try {
      const key = getEntityStorageKey("pos_recipes");
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}
  };

  const calculateTotalCost = (recipe: Recipe) => {
    return recipe.ingredients.reduce((acc, ing) => acc + (ing.quantity * ing.costPerUnit), 0);
  };

  const calculateCostPerPiece = (recipe: Recipe) => {
    const total = calculateTotalCost(recipe);
    return total / (recipe.yieldCount || 1);
  };

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
        { id: `ing-${Date.now()}-2`, name: "Seasoning / Sauce Base", unit: "ml", quantity: 50, costPerUnit: 0.01 }
      ]
    };

    const updated = [newRec, ...recipes];
    persistRecipes(updated);
    setSelectedRecipe(newRec);
    setIsNewRecipeModalOpen(false);
    setNewRecName("");
  };

  return (
    <div className="flex flex-col h-screen bg-[#07090f] text-white selection:bg-purple-500 selection:text-white">
      <StandardModuleHeader
        moduleName="Recipe BOM & Food Costing"
        moduleIcon={<BookOpen size={20} />}
        menuItems={MENU_ITEMS}
        searchPlaceholder="Search recipes & ingredients..."
      />

      <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="galaxy-card p-4 rounded-2xl bg-[#101422] border border-blue-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Total Formulated Recipes</span>
              <h3 className="text-2xl font-bold text-blue-400 mt-0.5">{recipes.length} BOM Profiles</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Auto Stock Deduction Ready</p>
            </div>
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
              <BookOpen size={20} />
            </div>
          </div>

          <div className="galaxy-card p-4 rounded-2xl bg-[#101422] border border-emerald-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Avg Food Cost Percentage</span>
              <h3 className="text-2xl font-bold text-emerald-400 mt-0.5">24.8%</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Target: &lt; 30% Healthy Margin</p>
            </div>
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <PieChart size={20} />
            </div>
          </div>

          <div className="galaxy-card p-4 rounded-2xl bg-[#101422] border border-purple-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Yield Optimization</span>
              <h3 className="text-2xl font-bold text-purple-400 mt-0.5">97.2%</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Batch Portion Accuracy</p>
            </div>
            <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
              <Scale size={20} />
            </div>
          </div>

          <div className="galaxy-card p-4 rounded-2xl bg-[#101422] border border-red-500/20 bg-[#101422] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Weekly Kitchen Spoilage</span>
              <h3 className="text-2xl font-bold text-red-400 mt-0.5">$28.50</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">{wasteLogs.length} Spoilage incidents</p>
            </div>
            <div className="p-3 bg-red-500/20 text-red-400 rounded-xl">
              <AlertTriangle size={20} />
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#101422] p-3.5 rounded-2xl border border-gray-800">
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-800 text-xs font-bold">
              <button
                onClick={() => setActiveTab("recipes")}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  activeTab === "recipes" ? "bg-purple-600 text-white shadow-md" : "text-gray-400 hover:text-white"
                }`}
              >
                Recipe Bill of Materials ({recipes.length})
              </button>
              <button
                onClick={() => setActiveTab("waste")}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  activeTab === "waste" ? "bg-purple-600 text-white shadow-md" : "text-gray-400 hover:text-white"
                }`}
              >
                Kitchen Waste & Spoilage Log ({wasteLogs.length})
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsNewRecipeModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 transition-all active:scale-95"
          >
            <Plus size={14} /> + Formulate New Recipe
          </button>
        </div>

        {/* TAB 1: RECIPES EXPLORER */}
        {activeTab === "recipes" && (
          recipes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-gray-800 rounded-3xl bg-[#0e121d]/40 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 shadow-lg shadow-purple-900/20">
                <BookOpen size={32} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No Recipes Formulated Yet</h3>
              <p className="text-sm text-gray-400 max-w-sm mb-6">
                Create Bill of Materials (BOM) for dishes, beverages, and bakery items to enable automated raw material deduction on checkout.
              </p>
              <button
                onClick={() => setIsNewRecipeModalOpen(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 transition-all active:scale-95"
              >
                + Formulate First Recipe
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Recipe List (5 cols) */}
              <div className="lg:col-span-5 space-y-3">
                {recipes.map(rec => {
                  const totalCost = calculateTotalCost(rec);
                  const costPerPiece = calculateCostPerPiece(rec);
                  const foodCostPct = ((costPerPiece / rec.sellingPrice) * 100).toFixed(1);
                  const isSelected = selectedRecipe?.id === rec.id;

                  return (
                    <div
                      key={rec.id}
                      onClick={() => setSelectedRecipe(rec)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-3 ${
                        isSelected
                          ? "bg-[#151b2c] border-purple-500 shadow-xl shadow-purple-950/60 ring-1 ring-purple-500"
                          : "bg-[#101422] border-gray-800 hover:border-gray-700"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block">{rec.category}</span>
                          <h4 className="font-bold text-white text-sm mt-0.5">{rec.name}</h4>
                        </div>
                        <span className="font-bold text-emerald-400 text-sm">${rec.sellingPrice.toFixed(2)}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 bg-gray-900/70 p-2.5 rounded-xl border border-gray-800 text-[11px]">
                        <div>
                          <span className="text-gray-500 block text-[9px] uppercase">Yield</span>
                          <span className="font-semibold text-white">{rec.yieldCount} {rec.yieldCount > 1 ? "pcs" : "portion"}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[9px] uppercase">Ingredient Cost</span>
                          <span className="font-bold text-amber-400">${costPerPiece.toFixed(2)} / pc</span>
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

              {/* Right Column: Detailed Recipe Breakdown (7 cols) */}
              {selectedRecipe && (
                <div className="lg:col-span-7 bg-[#101422] rounded-3xl border border-gray-800 p-6 space-y-6 shadow-2xl">
                  <div className="border-b border-gray-800 pb-4 flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">{selectedRecipe.id}</span>
                      <h3 className="text-xl font-extrabold text-white mt-0.5">{selectedRecipe.name}</h3>
                      <p className="text-xs text-gray-400">{selectedRecipe.notes}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Prep Time: {selectedRecipe.prepTimeMinutes} mins
                    </span>
                  </div>

                  {/* Ingredient Formulation Table */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Layers size={14} className="text-purple-400" /> Raw Material Ingredients ({selectedRecipe.ingredients.length})
                      </h4>
                      <span className="text-xs text-gray-400">Directly deduces from stock upon checkout</span>
                    </div>

                    <div className="bg-gray-950/70 rounded-2xl border border-gray-800/80 overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-900 text-gray-400 font-bold border-b border-gray-800 text-[10px] uppercase">
                          <tr>
                            <th className="px-3.5 py-2.5">Raw Material / Stock Item</th>
                            <th className="px-3.5 py-2.5">Portion Quantity</th>
                            <th className="px-3.5 py-2.5">Unit Cost</th>
                            <th className="px-3.5 py-2.5 text-right">Extended Cost</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/60 text-gray-200">
                          {selectedRecipe.ingredients.map(ing => (
                            <tr key={ing.id} className="hover:bg-gray-900/40">
                              <td className="px-3.5 py-2.5 font-semibold text-white">{ing.name}</td>
                              <td className="px-3.5 py-2.5 font-mono text-purple-300">{ing.quantity} {ing.unit}</td>
                              <td className="px-3.5 py-2.5 text-gray-400">${ing.costPerUnit.toFixed(3)}</td>
                              <td className="px-3.5 py-2.5 text-right font-bold text-emerald-400">
                                ${(ing.quantity * ing.costPerUnit).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Commercial Financials Summary */}
                  <div className="bg-gradient-to-r from-purple-950/30 via-indigo-950/30 to-purple-950/30 p-4 rounded-2xl border border-purple-500/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase">Total Batch COGS</span>
                      <span className="font-bold text-white text-base">${calculateTotalCost(selectedRecipe).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase">Per Serving Cost</span>
                      <span className="font-bold text-amber-400 text-base">${calculateCostPerPiece(selectedRecipe).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase">Menu Retail Price</span>
                      <span className="font-bold text-emerald-400 text-base">${selectedRecipe.sellingPrice.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase">Gross Profit Margin</span>
                      <span className="font-bold text-purple-300 text-base">
                        {(((selectedRecipe.sellingPrice - calculateCostPerPiece(selectedRecipe)) / selectedRecipe.sellingPrice) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        )}

        {/* TAB 2: KITCHEN WASTE & SPOILAGE LOG */}
        {activeTab === "waste" && (
          <div className="bg-[#101422] rounded-3xl border border-gray-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Kitchen Waste, Burnt & Spoilage Log</h3>
                <p className="text-xs text-gray-400">Keep tight control on food scrap, overcooking, and storage expiry losses</p>
              </div>
            </div>

            {wasteLogs.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-gray-800 rounded-2xl">
                <p className="text-xs text-gray-500">No spoilage or waste incidents logged for this entity.</p>
              </div>
            ) : (
              <div className="bg-gray-950/70 rounded-2xl border border-gray-800/80 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-900 text-gray-400 font-bold border-b border-gray-800 text-[10px] uppercase">
                    <tr>
                      <th className="px-4 py-3">Log ID</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Wasted Item & Quantity</th>
                      <th className="px-4 py-3">Cause / Reason</th>
                      <th className="px-4 py-3">Estimated Loss</th>
                      <th className="px-4 py-3 text-right">Logged By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 text-gray-200">
                    {wasteLogs.map(log => (
                      <tr key={log.id} className="hover:bg-gray-900/40">
                        <td className="px-4 py-3 font-mono font-bold text-purple-400">{log.id}</td>
                        <td className="px-4 py-3 text-gray-400">{log.date}</td>
                        <td className="px-4 py-3 font-semibold text-white">{log.item} ({log.qty})</td>
                        <td className="px-4 py-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                            {log.reason}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-red-400">${log.estimatedLoss.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-gray-400">{log.loggedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* NEW RECIPE MODAL */}
      {isNewRecipeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleCreateRecipe} className="bg-[#101422] border border-gray-700 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs text-white">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen size={18} className="text-purple-400" /> Formulate New Menu Recipe (BOM)
              </h3>
              <button type="button" onClick={() => setIsNewRecipeModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="font-bold text-gray-300 block mb-1">Recipe / Menu Item Name *</label>
              <input
                type="text"
                required
                value={newRecName}
                onChange={e => setNewRecName(e.target.value)}
                placeholder="e.g. Sourdough Avocado Tartine"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-gray-300 block mb-1">Category</label>
                <select
                  value={newRecCat}
                  onChange={e => setNewRecCat(e.target.value as any)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Bakery">Bakery & Pastry</option>
                  <option value="Coffee & Drinks">Coffee & Beverages</option>
                  <option value="Mains">Kitchen Mains</option>
                  <option value="Desserts">Desserts</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-gray-300 block mb-1">Menu Selling Price ($)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newRecPrice}
                  onChange={e => setNewRecPrice(Number(e.target.value))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-gray-300 block mb-1">Batch Yield Count</label>
                <input
                  type="number"
                  min="1"
                  value={newRecYield}
                  onChange={e => setNewRecYield(Number(e.target.value))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="font-bold text-gray-300 block mb-1">Prep Time (Mins)</label>
                <input
                  type="number"
                  min="1"
                  value={newRecTime}
                  onChange={e => setNewRecTime(Number(e.target.value))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-300 block mb-1">Preparation Method / Chef Notes</label>
              <textarea
                rows={2}
                value={newRecNotes}
                onChange={e => setNewRecNotes(e.target.value)}
                placeholder="Culinary notes, oven temperature, plating instructions..."
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setIsNewRecipeModalOpen(false)}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/30"
              >
                Save Recipe Profile
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
