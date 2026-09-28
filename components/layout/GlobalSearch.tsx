"use client";
import { useState, useEffect, useRef } from "react";
import { Search, Loader2, Package, User, ShoppingCart, Ticket, FileText, X } from "lucide-react";
import { fetchAPI } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetchAPI("/ai/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query })
        });
        if (res.ok) setResults(await res.json());
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const getIcon = (type: string) => {
    switch (type) {
      case "contact": return <User size={16} className="text-blue-400" />;
      case "sale": return <ShoppingCart size={16} className="text-green-400" />;
      case "product": return <Package size={16} className="text-orange-400" />;
      case "opportunity": case "lead": return <FileText size={16} className="text-pink-400" />;
      case "ticket": return <Ticket size={16} className="text-purple-400" />;
      case "employee": return <User size={16} className="text-teal-400" />;
      default: return <FileText size={16} className="text-gray-400" />;
    }
  };

  return (
    <div className="relative z-50 w-64 md:w-96" ref={wrapperRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search anything (Ctrl+K)..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { if (query.length >= 2) setOpen(true); }}
          className="w-full bg-[#1E293B] border border-gray-700 rounded-lg pl-9 pr-8 py-2 text-sm text-white outline-none focus:border-purple-500 transition-colors shadow-inner placeholder-gray-500"
        />
        {query && (
          <button onClick={() => { setQuery(""); setResults([]); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
            <X size={14} />
          </button>
        )}
      </div>

      {open && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1E293B] border border-gray-700 rounded-lg shadow-2xl overflow-hidden max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center gap-2 p-4 text-sm text-gray-400">
              <Loader2 size={16} className="animate-spin" /> Searching Galaxy...
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-sm text-gray-400 text-center">No results found for "{query}"</div>
          ) : (
            <div className="py-2">
              {results.map((r, i) => (
                <div key={i} onClick={() => { setOpen(false); router.push(r.url); }}
                  className="px-4 py-2 hover:bg-white/5 cursor-pointer flex items-center justify-between group transition-colors">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="bg-white/5 p-1.5 rounded-md group-hover:bg-white/10 transition-colors shrink-0">
                      {getIcon(r.type)}
                    </div>
                    <div className="truncate">
                      <p className="text-sm text-gray-200 font-medium truncate">{r.name}</p>
                      <p className="text-xs text-gray-500 capitalize truncate flex gap-2">
                        <span>{r.type}</span> {r.subtitle && <span className="text-gray-600">• {r.subtitle}</span>}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
