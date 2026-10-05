"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ChevronRight, Layers, FileText, Users, ShoppingCart, Package, DollarSign, CheckSquare, HelpCircle, Bot } from "lucide-react";

interface SearchSuggestion {
  title: string;
  category: string;
  href: string;
  icon?: React.ReactNode;
}

const GLOBAL_SEARCH_ROUTES: SearchSuggestion[] = [
  { title: "CRM Pipeline & Leads", category: "Module", href: "/crm", icon: <Layers size={14} className="text-cyan-400" /> },
  { title: "CRM Activities & History", category: "CRM", href: "/crm/activities", icon: <Layers size={14} className="text-cyan-400" /> },
  { title: "Contacts & Directory", category: "Module", href: "/contacts", icon: <Users size={14} className="text-blue-400" /> },
  { title: "Sales Quotations", category: "Sales", href: "/sales", icon: <ShoppingCart size={14} className="text-orange-400" /> },
  { title: "Sales Orders", category: "Sales", href: "/sales/orders", icon: <ShoppingCart size={14} className="text-orange-400" /> },
  { title: "Sales Customers", category: "Sales", href: "/sales/customers", icon: <Users size={14} className="text-orange-400" /> },
  { title: "Products Catalog", category: "Sales", href: "/sales/products", icon: <Package size={14} className="text-orange-400" /> },
  { title: "Inventory Products & Stock", category: "Module", href: "/inventory", icon: <Package size={14} className="text-emerald-400" /> },
  { title: "Accounting Invoices & Moves", category: "Module", href: "/accounting", icon: <DollarSign size={14} className="text-emerald-400" /> },
  { title: "Purchase Orders", category: "Module", href: "/purchase", icon: <ShoppingCart size={14} className="text-indigo-400" /> },
  { title: "Helpdesk Tickets", category: "Module", href: "/helpdesk", icon: <HelpCircle size={14} className="text-rose-400" /> },
  { title: "To-Do & Tasks", category: "Module", href: "/todo", icon: <CheckSquare size={14} className="text-teal-400" /> },
  { title: "Discuss & Team Chat", category: "Module", href: "/discuss", icon: <FileText size={14} className="text-purple-400" /> },
  { title: "AI Search & Assistant", category: "AI", href: "/ai", icon: <Bot size={14} className="text-purple-400" /> },
  { title: "Company & User Settings", category: "Settings", href: "/settings", icon: <FileText size={14} className="text-gray-400" /> },
];

interface UniversalModuleSearchProps {
  placeholder?: string;
  value?: string;
  onChange?: (val: string) => void;
  onSearch?: (val: string) => void;
  className?: string;
  customFilterBadge?: {
    label: string;
    onRemove?: () => void;
  };
}

export default function UniversalModuleSearch({
  placeholder = "Search records, modules, shortcuts (Enter to jump)...",
  value: controlledValue,
  onChange,
  onSearch,
  className = "",
  customFilterBadge,
}: UniversalModuleSearchProps) {
  const router = useRouter();
  const [internalValue, setInternalValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const query = controlledValue !== undefined ? controlledValue : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    if (controlledValue === undefined) {
      setInternalValue(newVal);
    }
    onChange?.(newVal);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearch?.(query);

      // If matches a route exactly or partially, navigate
      if (query.trim()) {
        const qClean = query.toLowerCase().trim();
        const match = GLOBAL_SEARCH_ROUTES.find(
          (r) =>
            r.title.toLowerCase().includes(qClean) ||
            r.category.toLowerCase().includes(qClean) ||
            r.href.toLowerCase().includes(qClean)
        );
        if (match) {
          router.push(match.href);
          setIsOpen(false);
        } else {
          // General search redirect to AI assistant with query
          router.push(`/ai?q=${encodeURIComponent(query.trim())}`);
          setIsOpen(false);
        }
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    if (controlledValue === undefined) {
      setInternalValue("");
    }
    onChange?.("");
    onSearch?.("");
  };

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const matchingRoutes = query.trim()
    ? GLOBAL_SEARCH_ROUTES.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.category.toLowerCase().includes(query.toLowerCase()) ||
          r.href.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : [];

  return (
    <div ref={containerRef} className={`relative flex-1 max-w-xl ${className}`}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 text-gray-400 pointer-events-none" size={16} />

        {customFilterBadge && (
          <div className="absolute left-9 bg-purple-600/20 text-purple-300 px-2 py-0.5 rounded text-xs flex items-center gap-1 border border-purple-600/30 z-10 select-none">
            <span>{customFilterBadge.label}</span>
            {customFilterBadge.onRemove && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  customFilterBadge.onRemove?.();
                }}
                className="hover:text-white ml-0.5"
              >
                ×
              </button>
            )}
          </div>
        )}

        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full bg-[#0F172A] border border-gray-600 focus:border-purple-500 rounded-lg py-1.5 text-sm text-gray-100 placeholder-gray-500 outline-none transition-all ${
            customFilterBadge ? "pl-32 pr-8" : "pl-9 pr-8"
          }`}
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 text-gray-400 hover:text-white p-1"
            title="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Auto-suggest / Quick Jump Dropdown */}
      {isOpen && query.trim().length > 0 && matchingRoutes.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-[#1E293B] border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-gray-800">
          <div className="px-3 py-2 bg-gray-900/60 text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
            <span>Jump to Module / View</span>
            <span className="text-[10px] text-gray-500 font-mono">Press Enter ↵</span>
          </div>
          <div className="py-1">
            {matchingRoutes.map((route) => (
              <button
                key={route.href}
                type="button"
                onClick={() => {
                  router.push(route.href);
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-white/5 flex items-center justify-between group transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  {route.icon}
                  <div>
                    <span className="text-sm font-medium text-gray-200 group-hover:text-purple-400 transition-colors">
                      {route.title}
                    </span>
                    <span className="text-xs text-gray-500 ml-2 font-mono">
                      ({route.category})
                    </span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-gray-500 group-hover:text-white transition-colors" />
              </button>
            ))}
          </div>
          <div className="p-2 bg-gray-900/40">
            <button
              type="button"
              onClick={() => {
                router.push(`/ai?q=${encodeURIComponent(query.trim())}`);
                setIsOpen(false);
              }}
              className="w-full px-3 py-1.5 text-xs text-purple-300 hover:text-purple-200 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg flex items-center justify-center gap-1.5 transition-all font-medium"
            >
              <Bot size={13} /> Deep AI search across all database records for &quot;{query}&quot; →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
