"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import {
  Flame,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Filter,
  Volume2,
  RefreshCw,
  Eye,
  UtensilsCrossed,
  Layers,
  ChefHat
} from "lucide-react";

const MENU_ITEMS = [
  { name: "Point of Sale", href: "/pos" },
  { name: "Kitchen Display (KDS)", href: "/pos/kds" },
  { name: "Recipe BOM", href: "/pos/recipes" },
  { name: "Floor Plan & Tables", href: "/pos/tables" },
  { name: "Orders", href: "/pos/orders" },
  { name: "Products", href: "/pos/products" }
];

type KitchenItem = {
  name: string;
  qty: number;
  course: "Starter" | "Main" | "Dessert" | "Beverage";
  modifiers?: string[];
  done?: boolean;
};

type KitchenTicket = {
  id: string;
  orderNumber: string;
  tableNumber: string;
  orderType: "Dine-In" | "Takeaway" | "Delivery";
  server: string;
  placedAt: string;
  elapsedMinutes: number;
  status: "queued" | "preparing" | "ready" | "served";
  items: KitchenItem[];
  urgent?: boolean;
};

const INITIAL_TICKETS: KitchenTicket[] = [
  {
    id: "KOT-101",
    orderNumber: "#1042",
    tableNumber: "Table 04",
    orderType: "Dine-In",
    server: "Michael B.",
    placedAt: "11:42 AM",
    elapsedMinutes: 4,
    status: "preparing",
    items: [
      { name: "Artisan Truffle Beef Burger", qty: 2, course: "Main", modifiers: ["Medium-Rare", "Extra Aged Cheddar", "No Pickles"] },
      { name: "Rustic Rosemary Fries", qty: 2, course: "Main", modifiers: ["Garlic Aioli on side"] },
      { name: "Iced Caramel Macchiato", qty: 2, course: "Beverage", modifiers: ["Oat Milk", "Half Sweet"] }
    ]
  },
  {
    id: "KOT-102",
    orderNumber: "#1043",
    tableNumber: "Counter (Buzzer 07)",
    orderType: "Takeaway",
    server: "Sarah L.",
    placedAt: "11:36 AM",
    elapsedMinutes: 10,
    status: "preparing",
    urgent: true,
    items: [
      { name: "Avocado & Sourdough Toast", qty: 1, course: "Main", modifiers: ["Poached Egg", "Chili Flakes"] },
      { name: "Butter Croissant", qty: 2, course: "Starter", modifiers: ["Warm / Toasted"] },
      { name: "Double Shot Flat White", qty: 1, course: "Beverage", modifiers: ["Almond Milk"] }
    ]
  },
  {
    id: "KOT-103",
    orderNumber: "#1044",
    tableNumber: "Table 09 (VIP Patio)",
    orderType: "Dine-In",
    server: "Alex D.",
    placedAt: "11:45 AM",
    elapsedMinutes: 1,
    status: "queued",
    items: [
      { name: "Wild Mushroom Risotto", qty: 1, course: "Main", modifiers: ["Parmigiano Reggiano"] },
      { name: "Grilled Salmon Fillet", qty: 1, course: "Main", modifiers: ["Lemon Caper Butter"] },
      { name: "Tiramisu della Nonna", qty: 2, course: "Dessert", modifiers: ["Serve after mains"] }
    ]
  },
  {
    id: "KOT-104",
    orderNumber: "#1040",
    tableNumber: "Delivery (UberEats)",
    orderType: "Delivery",
    server: "Online Dispatch",
    placedAt: "11:30 AM",
    elapsedMinutes: 16,
    status: "ready",
    items: [
      { name: "Crispy Fried Chicken Sandwich", qty: 3, course: "Main", modifiers: ["Spicy Mayo"] },
      { name: "Sweet Potato Fries", qty: 3, course: "Main" },
      { name: "Cold Brew Coffee", qty: 3, course: "Beverage" }
    ]
  }
];

export default function KitchenDisplaySystemPage() {
  const [tickets, setTickets] = useState<KitchenTicket[]>(INITIAL_TICKETS);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [soundAlert, setSoundAlert] = useState(true);

  // Live Timer increment simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setTickets(prev =>
        prev.map(t => (t.status !== "served" ? { ...t, elapsedMinutes: t.elapsedMinutes + 1 } : t))
      );
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleBumpStatus = (ticketId: string) => {
    setTickets(prev =>
      prev.map(t => {
        if (t.id === ticketId) {
          if (t.status === "queued") return { ...t, status: "preparing" };
          if (t.status === "preparing") return { ...t, status: "ready" };
          if (t.status === "ready") return { ...t, status: "served" };
        }
        return t;
      })
    );
  };

  const handleToggleItemDone = (ticketId: string, itemIdx: number) => {
    setTickets(prev =>
      prev.map(t => {
        if (t.id === ticketId) {
          const updatedItems = t.items.map((item, idx) =>
            idx === itemIdx ? { ...item, done: !item.done } : item
          );
          return { ...t, items: updatedItems };
        }
        return t;
      })
    );
  };

  const filteredTickets = tickets.filter(t => {
    if (filterType === "ALL") return t.status !== "served";
    return t.status === filterType;
  });

  const activeCount = tickets.filter(t => t.status !== "served").length;
  const preparingCount = tickets.filter(t => t.status === "preparing").length;
  const readyCount = tickets.filter(t => t.status === "ready").length;

  return (
    <div className="flex flex-col h-screen bg-[#07090f] text-white selection:bg-purple-500 selection:text-white">
      <StandardModuleHeader
        moduleName="Kitchen Display (KDS)"
        moduleIcon={<Flame size={20} />}
        menuItems={MENU_ITEMS}
        searchPlaceholder="Search order tickets..."
      />

      {/* KDS Operations Header Bar */}
      <div className="bg-[#101422] border-b border-gray-800 p-3.5 px-6 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="font-extrabold text-sm text-white">Live Kitchen Orders Queue</h2>
          </div>
          <span className="text-xs bg-purple-600/20 text-purple-300 font-bold px-2.5 py-0.5 rounded-full border border-purple-500/30">
            {activeCount} Active Tickets
          </span>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-800 text-xs font-bold">
            <button
              onClick={() => setFilterType("ALL")}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterType === "ALL" ? "bg-purple-600 text-white shadow-md" : "text-gray-400 hover:text-white"
              }`}
            >
              All Active ({activeCount})
            </button>
            <button
              onClick={() => setFilterType("preparing")}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterType === "preparing" ? "bg-amber-600 text-white shadow-md" : "text-gray-400 hover:text-white"
              }`}
            >
              Cooking ({preparingCount})
            </button>
            <button
              onClick={() => setFilterType("ready")}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterType === "ready" ? "bg-emerald-600 text-white shadow-md" : "text-gray-400 hover:text-white"
              }`}
            >
              Ready to Expedite ({readyCount})
            </button>
          </div>

          <button
            onClick={() => setSoundAlert(!soundAlert)}
            className={`p-2 rounded-xl border text-xs font-bold transition-all ${
              soundAlert ? "bg-purple-600/20 border-purple-500 text-purple-300" : "bg-gray-900 border-gray-800 text-gray-500"
            }`}
            title="Toggle Kitchen Chime / Sound Alert"
          >
            <Volume2 size={16} />
          </button>
        </div>
      </div>

      {/* KDS Order Cards Grid */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
          {filteredTickets.map(ticket => {
            const isLate = ticket.elapsedMinutes >= 12;
            return (
              <div
                key={ticket.id}
                className={`rounded-2xl border flex flex-col justify-between overflow-hidden shadow-2xl transition-all duration-200 ${
                  isLate
                    ? "bg-[#181115] border-red-500/80 ring-1 ring-red-500/50"
                    : ticket.status === "ready"
                    ? "bg-[#0f1a18] border-emerald-500/80"
                    : "bg-[#111624] border-gray-800 hover:border-purple-500/60"
                }`}
              >
                {/* Ticket Top Header */}
                <div className={`p-3.5 flex items-center justify-between border-b ${
                  isLate
                    ? "bg-red-950/40 border-red-500/30 text-red-200"
                    : ticket.status === "ready"
                    ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-200"
                    : "bg-gray-900/80 border-gray-800 text-gray-200"
                }`}>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-base text-white">{ticket.orderNumber}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-black/40 border border-white/10">
                        {ticket.orderType}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-purple-300 mt-0.5">{ticket.tableNumber}</div>
                  </div>

                  <div className="text-right">
                    <div className={`flex items-center gap-1 font-mono font-bold text-xs ${
                      isLate ? "text-red-400 animate-pulse" : "text-gray-300"
                    }`}>
                      <Clock size={13} />
                      <span>{ticket.elapsedMinutes} min</span>
                    </div>
                    <span className="text-[10px] text-gray-400">by {ticket.server}</span>
                  </div>
                </div>

                {/* Items Checklist */}
                <div className="p-3.5 space-y-3 flex-1 min-h-[160px]">
                  {ticket.items.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleToggleItemDone(ticket.id, idx)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        item.done
                          ? "bg-gray-900/30 border-gray-800 text-gray-500 line-through"
                          : "bg-gray-900/70 border-gray-800 text-white hover:border-gray-700"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="font-bold flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-purple-600 text-white flex items-center justify-center text-xs">
                            {item.qty}x
                          </span>
                          <span>{item.name}</span>
                        </div>
                        <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-gray-950 text-gray-400">
                          {item.course}
                        </span>
                      </div>

                      {item.modifiers && item.modifiers.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5 pl-7">
                          {item.modifiers.map((mod, mIdx) => (
                            <span key={mIdx} className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/20 font-medium">
                              ● {mod}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Bump Action Bar */}
                <div className="p-3 bg-gray-900/90 border-t border-gray-800 flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    ticket.status === "queued"
                      ? "bg-blue-500/20 text-blue-300"
                      : ticket.status === "preparing"
                      ? "bg-amber-500/20 text-amber-300"
                      : "bg-emerald-500/20 text-emerald-300"
                  }`}>
                    {ticket.status.toUpperCase()}
                  </span>

                  <button
                    onClick={() => handleBumpStatus(ticket.id)}
                    className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${
                      ticket.status === "queued"
                        ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30"
                        : ticket.status === "preparing"
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
                        : "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30"
                    }`}
                  >
                    {ticket.status === "queued" && <><span>Start Cooking</span> <ArrowRight size={13} /></>}
                    {ticket.status === "preparing" && <><CheckCircle2 size={14} /> <span>Mark Ready</span></>}
                    {ticket.status === "ready" && <><UtensilsCrossed size={14} /> <span>Expedite / Served</span></>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
