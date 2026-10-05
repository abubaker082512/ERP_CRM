"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Sparkles,
    X,
    Send,
    Bot,
    ArrowRight,
    HelpCircle,
    FileText,
    Users,
    Package,
    CreditCard,
    Settings,
    Calendar,
    MessageCircle,
    ChevronRight,
    ExternalLink,
    Zap,
    RotateCcw
} from "lucide-react";

interface Message {
    id: string;
    sender: "bot" | "user";
    text: string;
    action?: {
        label: string;
        href: string;
    };
    suggestedTopics?: string[];
}

// 100% Client-Side Knowledge Base & Intent Matching Engine (Zero Backend AI needed)
function resolveSupportQuery(query: string): { text: string; action?: { label: string; href: string }; suggestedTopics?: string[] } {
    const q = query.toLowerCase().trim();

    // CRM / Leads / Opportunities
    if (q.includes("crm") || q.includes("lead") || q.includes("opportunity") || q.includes("deal") || q.includes("pipeline") || q.includes("customer")) {
        return {
            text: "In Beraxis CRM, you can track leads across Kanban stages, score win probabilities with AI, and convert qualified leads into Sales Quotations in one click.",
            action: { label: "Open CRM Pipeline →", href: "/crm" },
            suggestedTopics: ["How to create an invoice?", "How to add products & stock?", "Contact WhatsApp Support"]
        };
    }

    // Invoice / Accounting / OCR / Bills / Payment
    if (q.includes("invoice") || q.includes("bill") || q.includes("receipt") || q.includes("accounting") || q.includes("ocr") || q.includes("tax") || q.includes("bank") || q.includes("finance")) {
        return {
            text: "Beraxis Accounting features double-entry bookkeeping, automated bank reconciliation, and instant 3-Second AI OCR receipt parsing (drop any PDF supplier bill to auto-populate the ledger).",
            action: { label: "Go to Accounting & Invoices →", href: "/accounting" },
            suggestedTopics: ["How to manage inventory?", "How to run payroll?", "Open Sales Orders"]
        };
    }

    // Sales / Quotations / Orders
    if (q.includes("sale") || q.includes("quote") || q.includes("quotation") || q.includes("order") || q.includes("pos") || q.includes("point of sale")) {
        return {
            text: "You can create quotations, send email proposals with digital signatures, and confirm Sales Orders. Confirming an order automatically reserves inventory and drafts an invoice.",
            action: { label: "Open Sales & Orders →", href: "/sales" },
            suggestedTopics: ["How to create an invoice?", "View Point of Sale", "Check Inventory stock"]
        };
    }

    // Inventory / Warehouse / Stock / Products / MRP
    if (q.includes("inventory") || q.includes("stock") || q.includes("product") || q.includes("warehouse") || q.includes("mrp") || q.includes("manufacturing") || q.includes("barcode")) {
        return {
            text: "The Inventory module allows multi-warehouse stock tracking, predictive AI demand forecasting, barcode scanning, and Bill of Materials (BOM) manufacturing orders.",
            action: { label: "Open Inventory & Stock →", href: "/inventory" },
            suggestedTopics: ["Open Barcode Scanner", "Check Accounting bills", "How to create quotes?"]
        };
    }

    // HR / Payroll / Employees / Attendance / Leave
    if (q.includes("payroll") || q.includes("employee") || q.includes("salary") || q.includes("staff") || q.includes("attendance") || q.includes("leave") || q.includes("recruit")) {
        return {
            text: "Manage employee records, self-service leave requests, daily attendance check-ins, and generate monthly payroll salary slips with automated deductions.",
            action: { label: "Open HRMS & Payroll →", href: "/payroll" },
            suggestedTopics: ["View Employee Directory", "Check Attendances", "Manage Company Team"]
        };
    }

    // Team / Users / Roles / Settings / Organization
    if (q.includes("team") || q.includes("user") || q.includes("invite") || q.includes("role") || q.includes("permission") || q.includes("setting") || q.includes("company") || q.includes("currency")) {
        return {
            text: "In Settings & Team Management, you can configure your company details, currency, tax rates, invite team members, and assign role-based module permissions.",
            action: { label: "Open Settings & Team →", href: "/settings" },
            suggestedTopics: ["How to upgrade subscription?", "View Knowledge Base", "Contact Live Support"]
        };
    }

    // Calendar / Appointments / Schedule
    if (q.includes("calendar") || q.includes("appointment") || q.includes("meeting") || q.includes("schedule") || q.includes("booking") || q.includes("todo") || q.includes("task")) {
        return {
            text: "You can manage meetings, share public online appointment booking pages with clients, sync Google Calendar, and track personal To-Do tasks.",
            action: { label: "Open Calendar & Bookings →", href: "/calendar" },
            suggestedTopics: ["Open To-Do List", "View CRM Leads", "Discuss / Team Chat"]
        };
    }

    // Reports / Dashboard / Analytics
    if (q.includes("report") || q.includes("dashboard") || q.includes("analytic") || q.includes("kpi") || q.includes("profit") || q.includes("revenue") || q.includes("metric")) {
        return {
            text: "The Dashboards and Reports modules give real-time visibility into revenue, top-selling products, sales conversion rates, and cash flow forecasts.",
            action: { label: "Open Real-Time Dashboards →", href: "/dashboard" },
            suggestedTopics: ["Open Sales Reports", "Check Accounting P&L", "CRM Pipeline"]
        };
    }

    // Billing / Upgrade / Plan / Pricing / Subscription
    if (q.includes("upgrade") || q.includes("plan") || q.includes("pricing") || q.includes("billing") || q.includes("subscription") || q.includes("price") || q.includes("trial")) {
        return {
            text: "Beraxis offers a Free Starter Tier (1 Module Free Forever) or the All-in-One Pro Plan ($199/mo) which unlocks all 25+ enterprise modules and AI features.",
            action: { label: "View Plans & Upgrade →", href: "/billing" },
            suggestedTopics: ["Contact WhatsApp Support", "How to add team users?", "Open CRM"]
        };
    }

    // Human Support / Contact / Help / WhatsApp
    if (q.includes("human") || q.includes("support") || q.includes("contact") || q.includes("help") || q.includes("whatsapp") || q.includes("email") || q.includes("call")) {
        return {
            text: "Our dedicated support team is available via WhatsApp (+1 970 780 7993) and direct email at admin@beraxis.online. We are happy to assist you with free data migration and live walkthroughs!",
            action: { label: "Chat on WhatsApp Now →", href: "https://wa.me/19707807993?text=Hi%20Beraxis%20Support%2C%20I%20need%20assistance%20with%20my%20workspace" },
            suggestedTopics: ["How to import Excel data?", "How to invite staff?", "Accounting setup"]
        };
    }

    // Default Fallback
    return {
        text: `I'm your instant Beraxis Navigator. I can help guide you to any module, explain accounting OCR, CRM pipelines, stock management, or connect you with our live team!`,
        action: { label: "Browse All Apps & Modules →", href: "/apps" },
        suggestedTopics: [
            "How do I create an invoice?",
            "How does AI Lead Scoring work?",
            "How to manage inventory & stock?",
            "How to invite team members?",
            "Chat with WhatsApp Support"
        ]
    };
}

export default function BeraxisSupportWidgets() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            sender: "bot",
            text: "👋 Hi there! I'm your instant Beraxis Smart Assistant. How can I help you streamline your operations today?",
            suggestedTopics: [
                "How do I create an invoice?",
                "How does AI Lead Scoring work?",
                "How to manage inventory?",
                "Where do I run payroll?",
                "How to invite team members?"
            ]
        }
    ]);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    const handleSend = (textToSend?: string) => {
        const queryText = (textToSend || input).trim();
        if (!queryText) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            sender: "user",
            text: queryText
        };

        setMessages((prev) => [...prev, userMsg]);
        if (!textToSend) setInput("");

        // Instant Rule-Based Intent Resolution
        setTimeout(() => {
            const resolution = resolveSupportQuery(queryText);
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                sender: "bot",
                text: resolution.text,
                action: resolution.action,
                suggestedTopics: resolution.suggestedTopics
            };
            setMessages((prev) => [...prev, botMsg]);
        }, 120);
    };

    const handleActionClick = (href: string) => {
        if (href.startsWith("http")) {
            window.open(href, "_blank");
        } else {
            setIsOpen(false);
            router.push(href);
        }
    };

    return (
        <>
            {/* ========================================================= */}
            {/* 1. WHATSAPP SUPPORT BUTTON (ON THE BOTTOM-LEFT)           */}
            {/* ========================================================= */}
            <div className="fixed bottom-6 left-6 z-50 flex items-center group">
                <a
                    href="https://wa.me/19707807993?text=Hi%20Beraxis%20Support%2C%20I%20need%20assistance%20with%20my%20workspace"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20BA56] text-white pl-3.5 pr-4 py-3 rounded-full shadow-[0_4px_25px_rgba(37,211,102,0.45)] hover:shadow-[0_6px_30px_rgba(37,211,102,0.6)] transition-all duration-300 hover:scale-105 active:scale-95 border border-white/20"
                    title="Chat with WhatsApp Support"
                >
                    {/* Official WhatsApp SVG Logo */}
                    <svg className="w-6 h-6 fill-current shrink-0" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                    <span className="font-bold text-xs tracking-wide whitespace-nowrap">
                        WhatsApp Support
                    </span>
                </a>
            </div>

            {/* ========================================================= */}
            {/* 2. AI SUPPORT BUTTON (ON THE BOTTOM-RIGHT)               */}
            {/* ========================================================= */}
            <div className="fixed bottom-6 right-6 z-50 flex items-center">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white pl-4 pr-5 py-3 rounded-full shadow-[0_4px_25px_rgba(99,102,241,0.45)] hover:shadow-[0_6px_30px_rgba(139,92,246,0.6)] transition-all duration-300 hover:scale-105 active:scale-95 border border-white/20 group"
                    title="Open Beraxis AI Support"
                >
                    <div className="relative">
                        <Bot className="w-5 h-5 animate-pulse" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-slate-900" />
                    </div>
                    <span className="font-bold text-xs tracking-wide">
                        AI Support
                    </span>
                </button>
            </div>

            {/* ========================================================= */}
            {/* 3. INTERACTIVE SMART AI SUPPORT MODAL / DRAWER            */}
            {/* ========================================================= */}
            {isOpen && (
                <div className="fixed bottom-22 right-6 z-50 w-[92vw] max-w-md h-[560px] bg-slate-950/95 backdrop-blur-2xl rounded-2xl border border-purple-500/30 shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-fadeIn">
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                <Sparkles size={16} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                                    Beraxis Smart Navigator
                                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-mono font-medium">Instant</span>
                                </h3>
                                <p className="text-[11px] text-slate-400">Ask any internal question or click to redirect</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Chat Messages Body */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3.5 custom-scrollbar text-xs">
                        {messages.map((m) => (
                            <div
                                key={m.id}
                                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                            >
                                <div
                                    className={`max-w-[85%] p-3 rounded-2xl ${
                                        m.sender === "user"
                                            ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-br-none"
                                            : "bg-slate-900/90 text-slate-200 border border-slate-800 rounded-bl-none shadow-md"
                                    }`}
                                >
                                    <p className="leading-relaxed">{m.text}</p>
                                </div>

                                {/* Direct Action Redirect Button */}
                                {m.action && (
                                    <button
                                        onClick={() => handleActionClick(m.action!.href)}
                                        className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-[11px] transition shadow-md shadow-purple-500/20"
                                    >
                                        <span>{m.action.label}</span>
                                    </button>
                                )}

                                {/* Suggested Chips */}
                                {m.suggestedTopics && m.suggestedTopics.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-[95%]">
                                        {m.suggestedTopics.map((topic, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleSend(topic)}
                                                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-purple-950/60 text-slate-300 hover:text-purple-300 border border-slate-800 hover:border-purple-500/40 text-[10.5px] transition flex items-center gap-1 text-left"
                                            >
                                                <span>{topic}</span>
                                                <ChevronRight size={10} className="opacity-60" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Shortcuts Bar */}
                    <div className="px-3 py-2 bg-slate-900/90 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[11px] whitespace-nowrap">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Quick:</span>
                        <button
                            onClick={() => handleSend("How to create an invoice?")}
                            className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300"
                        >
                            🧾 Invoicing
                        </button>
                        <button
                            onClick={() => handleSend("How does CRM work?")}
                            className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300"
                        >
                            💼 CRM
                        </button>
                        <button
                            onClick={() => handleSend("How to manage stock?")}
                            className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300"
                        >
                            📦 Stock
                        </button>
                        <button
                            onClick={() => handleSend("How to run payroll?")}
                            className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300"
                        >
                            👥 Payroll
                        </button>
                    </div>

                    {/* Input Footer */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSend();
                        }}
                        className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about CRM, invoices, stock, payroll..."
                            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white transition flex items-center justify-center shrink-0 shadow-lg shadow-purple-600/25"
                        >
                            <Send size={14} />
                        </button>
                    </form>
                </div>
            )}
        </>
    );
}
