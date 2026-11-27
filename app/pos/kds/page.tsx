"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { useBranchContext } from "@/lib/branchContext";
import {
  Flame,
  Clock,
  CheckCircle2,
  ArrowRight,
  Volume2,
  RefreshCw,
  UtensilsCrossed,
  ChefHat,
  Plus,
} from "lucide-react";

const MENU_ITEMS = [
  { name: "Point of Sale", href: "/pos" },
  { name: "Kitchen Display (KDS)", href: "/pos/kds" },
  { name: "Recipe BOM", href: "/pos/recipes" },
  { name: "Floor Plan & Tables", href: "/pos/tables" },
  { name: "Orders", href: "/pos/orders" },
  { name: "Products", href: "/pos/products" },
];

type KitchenItem = {
  id?: string;
  name: string;
  qty: number;
  course?: string;
  modifiers?: string[];
  done?: boolean;
};

type KitchenTicket = {
  id: string;
  orderNumber: string;
  tableNumber: string;
  orderType: "Dine-In" | "Takeaway" | "Delivery";
  server?: string;
  placedAt: string;
  createdAt?: string;
  elapsedMinutes: number;
  status: "queued" | "preparing" | "ready" | "served";
  items: KitchenItem[];
};

export default function KitchenDisplaySystemPage() {
  const { activeBranch, getEntityStorageKey } = useBranchContext();
  const [tickets, setTickets] = useState<KitchenTicket[]>([]);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [soundAlert, setSoundAlert] = useState(true);

  const getAuthMeta = useCallback(() => {
    if (typeof window === "undefined") return { companyId: "CMP-001", email: "" };
    const companyId = activeBranch?.id || localStorage.getItem("beraxis_active_branch_id") || "CMP-001";
    let email = "";
    try {
      email = JSON.parse(localStorage.getItem("user") || "{}").email || "";
    } catch {}
    return { companyId, email };
  }, [activeBranch?.id]);

  const fetchTickets = useCallback(async () => {
    const key = getEntityStorageKey("kds_tickets");
    let local: KitchenTicket[] = [];
    try {
      const saved = localStorage.getItem(key);
      if (saved) local = JSON.parse(saved);
    } catch {}

    try {
      const { companyId, email } = getAuthMeta();
      const res = await fetch(
        `/api/pos?company_id=${encodeURIComponent(companyId)}&email=${encodeURIComponent(email)}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.kdsTickets) && data.kdsTickets.length > 0) {
          local = data.kdsTickets;
          localStorage.setItem(key, JSON.stringify(local));
        }
      }
    } catch {}

    setTickets(Array.isArray(local) ? local : []);
  }, [getAuthMeta, getEntityStorageKey]);

  useEffect(() => {
    fetchTickets();
    const poll = setInterval(fetchTickets, 4000);
    return () => clearInterval(poll);
  }, [fetchTickets]);

  const persistTickets = async (updated: KitchenTicket[]) => {
    setTickets(updated);
    try {
      localStorage.setItem(getEntityStorageKey("kds_tickets"), JSON.stringify(updated));
      const { companyId, email } = getAuthMeta();
      await fetch("/api/pos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_kds", company_id: companyId, email, tickets: updated }),
      });
    } catch {}
  };

  const handleSeedSampleTickets = () => {
    const now = new Date();
    const placedAt = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const samples: KitchenTicket[] = [
      {
        id: `KDS-${Date.now().toString().slice(-4)}-1`,
        orderNumber: "#408",
        tableNumber: "Table 2",
        orderType: "Dine-In",
        server: "Alex",
        placedAt,
        createdAt: now.toISOString(),
        elapsedMinutes: 2,
        status: "queued",
        items: [
          { name: "Crispy Calamari Starter", qty: 1, course: "Starter", modifiers: ["Sauce on Side"] },
          { name: "Artisan Smash Burger", qty: 2, course: "Main", modifiers: ["No Onions", "Extra Spicy"] },
        ],
      },
      {
        id: `KDS-${Date.now().toString().slice(-4)}-2`,
        orderNumber: "#409",
        tableNumber: "Takeaway",
        orderType: "Takeaway",
        server: "POS Register",
        placedAt,
        createdAt: now.toISOString(),
        elapsedMinutes: 5,
        status: "preparing",
        items: [
          { name: "Truffle Margherita Pizza", qty: 1, course: "Main", modifiers: ["Well Done"] },
          { name: "Spanish Iced Latte", qty: 2, course: "Beverage" },
        ],
      },
    ];
    persistTickets([...samples, ...tickets]);
  };

  const handleBumpStatus = (ticketId: string) => {
    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        if (t.status === "queued") return { ...t, status: "preparing" as const };
        if (t.status === "preparing") return { ...t, status: "ready" as const };
        if (t.status === "ready") return { ...t, status: "served" as const };
      }
      return t;
    });
    persistTickets(updated);
  };

  const handleToggleItemDone = (ticketId: string, itemIdx: number) => {
    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        const updatedItems = t.items.map((item, idx) =>
          idx === itemIdx ? { ...item, done: !item.done } : item
        );
        return { ...t, items: updatedItems };
      }
      return t;
    });
    persistTickets(updated);
  };

  const filteredTickets = tickets.filter((t) => {
    if (filterType === "ALL") return t.status !== "served";
    return t.status === filterType;
  });

  const activeCount = tickets.filter((t) => t.status !== "served").length;
  const queuedCount = tickets.filter((t) => t.status === "queued").length;
  const preparingCount = tickets.filter((t) => t.status === "preparing").length;
  const readyCount = tickets.filter((t) => t.status === "ready").length;

  return (
    <div className="flex flex-col h-screen bg-[#07090f] text-white">
      <StandardModuleHeader
        moduleName="Kitchen Display (KDS)"
        moduleIcon={<Flame size={20} />}
        menuItems={MENU_ITEMS}
        searchPlaceholder="Search order tickets..."
      />

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

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-800 text-xs font-bold">
            <button
              onClick={() => setFilterType("ALL")}
              className={`px-3 py-1 rounded-lg cursor-pointer ${
                filterType === "ALL" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              All Active ({activeCount})
            </button>
            <button
              onClick={() => setFilterType("queued")}
              className={`px-3 py-1 rounded-lg cursor-pointer ${
                filterType === "queued" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Queued ({queuedCount})
            </button>
            <button
              onClick={() => setFilterType("preparing")}
              className={`px-3 py-1 rounded-lg cursor-pointer ${
                filterType === "preparing" ? "bg-amber-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Cooking ({preparingCount})
            </button>
            <button
              onClick={() => setFilterType("ready")}
              className={`px-3 py-1 rounded-lg cursor-pointer ${
                filterType === "ready" ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Ready ({readyCount})
            </button>
          </div>

          <button
            onClick={fetchTickets}
            className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white cursor-pointer"
            title="Refresh Kitchen Queue"
          >
            <RefreshCw size={15} />
          </button>

          <button
            onClick={() => setSoundAlert(!soundAlert)}
            className={`p-2 rounded-xl border text-xs font-bold cursor-pointer ${
              soundAlert ? "bg-purple-600/20 border-purple-500 text-purple-300" : "bg-gray-900 border-gray-800 text-gray-500"
            }`}
          >
            <Volume2 size={15} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-gray-800 rounded-2xl bg-[#0e121d]/40 max-w-xl mx-auto mt-10">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
              <ChefHat size={32} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Kitchen Queue is Clear</h3>
            <p className="text-sm text-gray-400 max-w-sm mb-6">
              Orders fired from the Restaurant POS terminal appear here live in real time.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link
                href="/pos?mode=food_beverage"
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold"
              >
                Open Restaurant POS
              </Link>
              <button
                onClick={handleSeedSampleTickets}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/15 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} /> Load Sample Kitchen Tickets
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
            {filteredTickets.map((ticket) => {
              const isLate = (ticket.elapsedMinutes || 0) >= 12;
              return (
                <div
                  key={ticket.id}
                  className={`rounded-2xl border flex flex-col justify-between overflow-hidden shadow-2xl ${
                    isLate
                      ? "bg-[#181115] border-red-500/80"
                      : ticket.status === "ready"
                      ? "bg-[#0f1a18] border-emerald-500/80"
                      : "bg-[#111624] border-gray-800"
                  }`}
                >
                  <div className="p-3.5 flex items-center justify-between border-b border-gray-800 bg-gray-900/80">
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
                      <div className={`flex items-center gap-1 font-mono font-bold text-xs ${isLate ? "text-red-400" : "text-gray-300"}`}>
                        <Clock size={13} />
                        <span>{ticket.elapsedMinutes || 0} min</span>
                      </div>
                      <span className="text-[10px] text-gray-400">{ticket.placedAt}</span>
                    </div>
                  </div>

                  <div className="p-3.5 space-y-2.5 flex-1 min-h-[150px]">
                    {(ticket.items || []).map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleToggleItemDone(ticket.id, idx)}
                        className={`p-2.5 rounded-xl border cursor-pointer ${
                          item.done
                            ? "bg-gray-900/30 border-gray-800 text-gray-500 line-through"
                            : "bg-gray-900/70 border-gray-800 text-white"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="font-bold flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-purple-600 text-white flex items-center justify-center text-xs">
                              {item.qty}x
                            </span>
                            <span>{item.name}</span>
                          </div>
                          <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-gray-950 text-gray-400">
                            {item.course || "Main"}
                          </span>
                        </div>

                        {item.modifiers && item.modifiers.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5 pl-7">
                            {item.modifiers.map((mod, mIdx) => (
                              <span
                                key={mIdx}
                                className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/20 font-medium"
                              >
                                ● {mod}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-gray-900/90 border-t border-gray-800 flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        ticket.status === "queued"
                          ? "bg-blue-500/20 text-blue-300"
                          : ticket.status === "preparing"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-emerald-500/20 text-emerald-300"
                      }`}
                    >
                      {ticket.status.toUpperCase()}
                    </span>

                    <button
                      onClick={() => handleBumpStatus(ticket.id)}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                        ticket.status === "queued"
                          ? "bg-amber-600 hover:bg-amber-500 text-white"
                          : ticket.status === "preparing"
                          ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                          : "bg-purple-600 hover:bg-purple-500 text-white"
                      }`}
                    >
                      {ticket.status === "queued" && (
                        <>
                          <span>Start Cooking</span> <ArrowRight size={13} />
                        </>
                      )}
                      {ticket.status === "preparing" && (
                        <>
                          <CheckCircle2 size={14} /> <span>Mark Ready</span>
                        </>
                      )}
                      {ticket.status === "ready" && (
                        <>
                          <UtensilsCrossed size={14} /> <span>Expedite / Served</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
