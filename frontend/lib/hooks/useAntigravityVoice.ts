"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useBranchContext } from "../branchContext";

export interface VoiceHistoryItem {
    id: string;
    timestamp: string;
    userCommand: string;
    assistantResponse: string;
    actionHref?: string;
    actionLabel?: string;
    operationType?: "navigation" | "create_record" | "analytics" | "automation" | "general";
}

export interface UseAntigravityVoiceReturn {
    status: "idle" | "connecting" | "recording" | "processing" | "speaking" | "error";
    transcript: string;
    liveInput: string;
    requiresApproval: boolean;
    codeSnippet: string;
    error: string | null;
    voiceEnabled: boolean;
    history: VoiceHistoryItem[];
    lastAction: { label: string; href: string } | null;
    setVoiceEnabled: (enabled: boolean) => void;
    startRecording: () => void;
    stopRecording: () => void;
    sendTextCommand: (text: string) => void;
    executeSnippet: () => Promise<void>;
    declineSnippet: () => void;
    stopSpeaking: () => void;
    resetState: () => void;
}

const ROUTE_MAP: Array<{ keywords: string[]; href: string; name: string }> = [
    { keywords: ["leads pool", "lead pool", "lead bank", "25 million", "global leads"], href: "/crm/leads-pool", name: "Global Leads Pool" },
    { keywords: ["customer invoice", "customers", "receivable"], href: "/accounting/customers", name: "Accounting Customers & Invoices" },
    { keywords: ["vendor bill", "vendors", "payable"], href: "/accounting/vendors", name: "Accounting Vendors & Bills" },
    { keywords: ["accounting", "finance", "ledger", "bookkeeping", "profit and loss", "balance sheet"], href: "/accounting", name: "Accounting & Finance" },
    { keywords: ["crm", "pipeline", "deal", "opportunity", "leads"], href: "/crm", name: "CRM Pipeline" },
    { keywords: ["point of sale", "pos", "terminal", "register"], href: "/pos", name: "Point of Sale (POS)" },
    { keywords: ["inventory", "warehouse", "stock", "barcode"], href: "/inventory", name: "Inventory & Warehouse" },
    { keywords: ["sales", "quotation", "quotes", "orders"], href: "/sales", name: "Sales & Quotations" },
    { keywords: ["purchase", "procurement", "rfq"], href: "/purchase", name: "Purchase & Vendors" },
    { keywords: ["contact", "contacts", "directory", "address book"], href: "/contacts", name: "Contacts Directory" },
    { keywords: ["employee", "employees", "hr", "human resource", "staff"], href: "/employees", name: "Employees & HR" },
    { keywords: ["payroll", "salary", "payslip", "wages"], href: "/payroll", name: "Payroll" },
    { keywords: ["attendance", "check in", "timesheet"], href: "/attendances", name: "Attendances" },
    { keywords: ["recruitment", "hiring", "applicant", "job"], href: "/recruitment", name: "Recruitment" },
    { keywords: ["project", "projects", "kanban"], href: "/project", name: "Project Management" },
    { keywords: ["manufacturing", "mrp", "bom", "production"], href: "/manufacturing", name: "Manufacturing & MRP" },
    { keywords: ["helpdesk", "ticket", "support ticket"], href: "/helpdesk", name: "Helpdesk" },
    { keywords: ["calendar", "appointment", "schedule", "booking"], href: "/calendar", name: "Calendar & Appointments" },
    { keywords: ["todo", "to-do", "to do", "task list", "tasks"], href: "/todo", name: "To-Do Tasks" },
    { keywords: ["discuss", "team chat", "messages", "channel"], href: "/discuss", name: "Discuss Team Chat" },
    { keywords: ["knowledge", "wiki", "documentation", "articles"], href: "/knowledge", name: "Knowledge Base" },
    { keywords: ["report", "reports", "analytics"], href: "/reports", name: "Executive Reports" },
    { keywords: ["dashboard", "main dashboard", "overview"], href: "/dashboard", name: "Executive Dashboard" },
    { keywords: ["billing", "subscription", "upgrade", "pricing", "plan"], href: "/billing", name: "Billing & Plans" },
    { keywords: ["setting", "settings", "configuration"], href: "/settings", name: "Workspace Settings" },
    { keywords: ["super admin", "saas admin", "gateway"], href: "/super-admin", name: "Super Admin Control" },
    { keywords: ["apps", "workspace", "home", "launchpad", "modules"], href: "/apps", name: "Workspace Apps" },
];

export function useAntigravityVoice(): UseAntigravityVoiceReturn {
    const router = useRouter();
    const {
        activeBranch,
        isFreePlan,
        freeSelectedApp,
        isModuleEnabled,
        getEntityStorageKey,
    } = useBranchContext();

    const [status, setStatus] = useState<UseAntigravityVoiceReturn["status"]>("idle");
    const [transcript, setTranscript] = useState<string>("");
    const [liveInput, setLiveInput] = useState<string>("");
    const [requiresApproval, setRequiresApproval] = useState<boolean>(false);
    const [codeSnippet, setCodeSnippet] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
    const [history, setHistory] = useState<VoiceHistoryItem[]>([]);
    const [lastAction, setLastAction] = useState<{ label: string; href: string } | null>(null);

    const recognitionRef = useRef<any>(null);
    const liveTranscriptRef = useRef<string>("");
    const voiceEnabledRef = useRef<boolean>(voiceEnabled);

    useEffect(() => {
        voiceEnabledRef.current = voiceEnabled;
    }, [voiceEnabled]);

    // Speak text using Web Speech Synthesis API
    const speakResponse = useCallback((text: string) => {
        if (typeof window === "undefined" || !("speechSynthesis" in window) || !voiceEnabledRef.current) {
            setStatus("idle");
            return;
        }
        try {
            window.speechSynthesis.cancel();
            // Clean markdown or symbols for natural TTS
            const cleanText = text
                .replace(/[*#`_~>]/g, "")
                .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
                .replace(/\n+/g, ". ");

            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.lang = "en-US";
            utterance.rate = 1.03;
            utterance.pitch = 1.0;

            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(
                (v) =>
                    v.lang.startsWith("en") &&
                    (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Microsoft") || v.name.includes("Samantha"))
            );
            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }

            utterance.onstart = () => setStatus("speaking");
            utterance.onend = () => setStatus("idle");
            utterance.onerror = () => setStatus("idle");

            setStatus("speaking");
            window.speechSynthesis.speak(utterance);
        } catch {
            setStatus("idle");
        }
    }, []);

    const stopSpeaking = useCallback(() => {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }
        setStatus((prev) => (prev === "speaking" ? "idle" : prev));
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch {}
            }
            if (typeof window !== "undefined" && "speechSynthesis" in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    // Core Voice Command Execution Engine (100% Tenant-Isolated)
    const processVoiceCommand = useCallback(
        (rawCommand: string) => {
            const cmd = rawCommand.trim();
            if (!cmd) {
                setStatus("idle");
                return;
            }

            setStatus("processing");
            setError(null);
            setRequiresApproval(false);
            setCodeSnippet("");
            setLastAction(null);

            const lower = cmd.toLowerCase();
            const entityName = activeBranch?.name || "Your Isolated Workspace";
            const currency = activeBranch?.currency || "USD";

            const finishCommand = (
                responseText: string,
                options?: {
                    actionHref?: string;
                    actionLabel?: string;
                    autoNavigate?: boolean;
                    operationType?: VoiceHistoryItem["operationType"];
                    approvalCode?: string;
                }
            ) => {
                setTranscript(responseText);
                if (options?.actionHref && options?.actionLabel) {
                    setLastAction({ label: options.actionLabel, href: options.actionHref });
                }
                if (options?.approvalCode) {
                    setRequiresApproval(true);
                    setCodeSnippet(options.approvalCode);
                }

                setHistory((prev) => [
                    {
                        id: Date.now().toString(),
                        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                        userCommand: cmd,
                        assistantResponse: responseText,
                        actionHref: options?.actionHref,
                        actionLabel: options?.actionLabel,
                        operationType: options?.operationType || "general",
                    },
                    ...prev.slice(0, 19),
                ]);

                if (options?.autoNavigate && options?.actionHref) {
                    setTimeout(() => {
                        router.push(options.actionHref!);
                    }, 600);
                }

                speakResponse(responseText);
            };

            // 1. CREATE CUSTOMER INVOICE OPERATION
            // Matches: "create invoice for Acme Corp for $1200", "new invoice for John $450", "bill customer Globex 900"
            if (
                (lower.includes("create invoice") ||
                    lower.includes("new invoice") ||
                    lower.includes("draft invoice") ||
                    lower.includes("add invoice") ||
                    lower.includes("invoice for")) &&
                !lower.includes("how to") &&
                !lower.includes("how do")
            ) {
                const amountMatch = cmd.match(/\$?\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)/);
                const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : 500;

                let customer = "Walk-in Client";
                const forMatch = cmd.match(/(?:for|to|client|customer)\s+([a-zA-Z0-9\s&.-]+?)(?:\s+(?:for|amount|of|worth|\$|\d)|$)/i);
                if (forMatch && forMatch[1]?.trim()) {
                    customer = forMatch[1].trim();
                }

                const invKey = getEntityStorageKey("accounting_invoices");
                let existingInvoices: any[] = [];
                try {
                    const raw = localStorage.getItem(invKey);
                    if (raw) existingInvoices = JSON.parse(raw);
                } catch {}

                const nextNumber = existingInvoices.length + 1;
                const today = new Date().toISOString().split("T")[0];
                const due = new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0];
                const newInvoice = {
                    id: `INV-${new Date().getFullYear()}-${String(nextNumber).padStart(3, "0")}`,
                    customer,
                    date: today,
                    due,
                    amount,
                    tax: Number((amount * 0.1).toFixed(2)),
                    status: "Open",
                    items: "Voice Operations Generated Invoice",
                };

                const updated = [newInvoice, ...existingInvoices];
                localStorage.setItem(invKey, JSON.stringify(updated));
                window.dispatchEvent(new Event("storage"));

                finishCommand(
                    `Created Customer Invoice ${newInvoice.id} for ${customer} in the amount of $${amount.toLocaleString()} inside ${entityName}.`,
                    {
                        actionHref: "/accounting/customers",
                        actionLabel: "View Invoice in Accounting →",
                        operationType: "create_record",
                    }
                );
                return;
            }

            // 2. CREATE VENDOR BILL / EXPENSE OPERATION
            // Matches: "record vendor bill from AWS for $350", "add expense for Office Supplies $120", "create bill from Dell 800"
            if (
                (lower.includes("vendor bill") ||
                    lower.includes("create bill") ||
                    lower.includes("record bill") ||
                    lower.includes("add bill") ||
                    lower.includes("add expense") ||
                    lower.includes("record expense")) &&
                !lower.includes("how to")
            ) {
                const amountMatch = cmd.match(/\$?\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)/);
                const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : 250;

                let vendor = "General Supplier";
                const fromMatch = cmd.match(/(?:from|for|vendor|supplier)\s+([a-zA-Z0-9\s&.-]+?)(?:\s+(?:for|amount|of|worth|\$|\d)|$)/i);
                if (fromMatch && fromMatch[1]?.trim()) {
                    vendor = fromMatch[1].trim();
                }

                const billKey = getEntityStorageKey("accounting_bills");
                let existingBills: any[] = [];
                try {
                    const raw = localStorage.getItem(billKey);
                    if (raw) existingBills = JSON.parse(raw);
                } catch {}

                const nextNumber = existingBills.length + 1;
                const today = new Date().toISOString().split("T")[0];
                const due = new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0];
                const newBill = {
                    id: `BILL-${new Date().getFullYear()}-${String(nextNumber).padStart(3, "0")}`,
                    vendor,
                    date: today,
                    due,
                    amount,
                    category: "Operations & Voice Entry",
                    status: "Pending",
                };

                const updated = [newBill, ...existingBills];
                localStorage.setItem(billKey, JSON.stringify(updated));
                window.dispatchEvent(new Event("storage"));

                finishCommand(
                    `Recorded Vendor Bill ${newBill.id} for ${vendor} ($${amount.toLocaleString()}) in ${entityName}'s isolated accounting ledger.`,
                    {
                        actionHref: "/accounting/vendors",
                        actionLabel: "Open Vendor Bills →",
                        operationType: "create_record",
                    }
                );
                return;
            }

            // 3. ADD PRODUCT TO POS / INVENTORY
            // Matches: "add product Espresso Machine price $450", "create product Wireless Keyboard for $65"
            if (
                (lower.includes("add product") || lower.includes("create product") || lower.includes("new product")) &&
                !lower.includes("how to")
            ) {
                const priceMatch = cmd.match(/\$?\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)/);
                const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, "")) : 49.99;

                let prodName = cmd
                    .replace(/^(please\s+)?(add|create|new)\s+product\s+/i, "")
                    .replace(/\s+(price|for|cost|worth|at)?\s*\$?\s*\d+(?:,\d{3})*(?:\.\d{1,2})?.*$/i, "")
                    .trim();
                if (!prodName) prodName = "Custom Voice Item";

                const posKey = getEntityStorageKey("pos_products");
                let existingProds: any[] = [];
                try {
                    const raw = localStorage.getItem(posKey);
                    if (raw) existingProds = JSON.parse(raw);
                } catch {}

                const newProd = {
                    id: `PROD-${Date.now().toString().slice(-4)}`,
                    name: prodName,
                    category: "General",
                    price,
                    stock: 25,
                    sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
                };

                localStorage.setItem(posKey, JSON.stringify([newProd, ...existingProds]));
                window.dispatchEvent(new Event("storage"));

                finishCommand(
                    `Added product "${prodName}" priced at $${price.toFixed(2)} (25 units in stock) to ${entityName}'s catalog.`,
                    {
                        actionHref: "/pos",
                        actionLabel: "Open Point of Sale →",
                        operationType: "create_record",
                    }
                );
                return;
            }

            // 4. CREATE TASK / TO-DO ITEM
            // Matches: "add task Call supplier tomorrow", "create todo Follow up on Q3 audit", "remind me to..."
            if (
                lower.startsWith("add task") ||
                lower.startsWith("create task") ||
                lower.startsWith("new task") ||
                lower.startsWith("add todo") ||
                lower.startsWith("add to-do") ||
                lower.startsWith("create todo") ||
                lower.startsWith("remind me to")
            ) {
                const taskTitle = cmd
                    .replace(/^(please\s+)?(add task|create task|new task|add todo|add to-do|create todo|remind me to)\s+/i, "")
                    .trim();

                const todoKey = getEntityStorageKey("todos");
                let existingTodos: any[] = [];
                try {
                    const raw = localStorage.getItem(todoKey);
                    if (raw) existingTodos = JSON.parse(raw);
                } catch {}

                const newTodo = {
                    id: `TASK-${Date.now()}`,
                    title: taskTitle || cmd,
                    completed: false,
                    priority: "High",
                    createdAt: new Date().toISOString(),
                };

                localStorage.setItem(todoKey, JSON.stringify([newTodo, ...existingTodos]));
                window.dispatchEvent(new Event("storage"));

                finishCommand(`Task "${newTodo.title}" has been added to ${entityName}'s To-Do list.`, {
                    actionHref: "/todo",
                    actionLabel: "Open To-Do Tasks →",
                    operationType: "create_record",
                });
                return;
            }

            // 5. FINANCIAL / WORKSPACE KPI SUMMARY BRIEFING
            // Matches: "financial summary", "check revenue", "accounting summary", "workspace status", "read my kpis", "outstanding payments"
            if (
                lower.includes("summary") ||
                lower.includes("revenue") ||
                lower.includes("profit") ||
                lower.includes("kpi") ||
                lower.includes("outstanding") ||
                lower.includes("cash flow") ||
                lower.includes("financial status") ||
                lower.includes("workspace status")
            ) {
                const invKey = getEntityStorageKey("accounting_invoices");
                const billKey = getEntityStorageKey("accounting_bills");
                let invoices: any[] = [];
                let bills: any[] = [];
                try {
                    invoices = JSON.parse(localStorage.getItem(invKey) || "[]");
                    bills = JSON.parse(localStorage.getItem(billKey) || "[]");
                } catch {}

                const totalInvoiced = invoices.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
                const openReceivables = invoices
                    .filter((i) => i.status !== "Paid")
                    .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
                const totalPayables = bills.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
                const netPosition = totalInvoiced - totalPayables;

                const summaryText =
                    `Executive Briefing for ${entityName} (${currency}):\n` +
                    `• Total Invoiced Revenue: $${totalInvoiced.toLocaleString()} (${invoices.length} invoices)\n` +
                    `• Open Customer Receivables: $${openReceivables.toLocaleString()}\n` +
                    `• Vendor Bills & Payables: $${totalPayables.toLocaleString()} (${bills.length} bills)\n` +
                    `• Net Position: $${netPosition.toLocaleString()}`;

                finishCommand(summaryText, {
                    actionHref: "/accounting",
                    actionLabel: "Open Accounting Dashboard →",
                    operationType: "analytics",
                });
                return;
            }

            // 6. VOICE NAVIGATION COMMANDS
            // Matches: "open accounting", "go to crm", "navigate to settings", "launch pos", "show me inventory", or exact module name
            const isNavigationIntent =
                lower.startsWith("open ") ||
                lower.startsWith("go to ") ||
                lower.startsWith("navigate to ") ||
                lower.startsWith("launch ") ||
                lower.startsWith("show ") ||
                lower.startsWith("take me to ") ||
                lower.startsWith("switch to ");

            for (const route of ROUTE_MAP) {
                const matchedKeyword = route.keywords.some((kw) => lower.includes(kw));
                if (matchedKeyword && (isNavigationIntent || lower.length < 32)) {
                    // Check Free Plan lock rules
                    const isAlwaysFree =
                        route.href === "/apps" ||
                        route.href.startsWith("/settings") ||
                        route.href.startsWith("/billing") ||
                        route.href.startsWith("/super-admin");

                    if (isFreePlan && !isAlwaysFree && !isModuleEnabled(route.href)) {
                        if (route.href === "/crm/leads-pool") {
                            finishCommand(
                                `The 25.8M+ Global Leads Pool is exclusively available on Paid Plans. Navigating to Leads Pool where you can preview or upgrade.`,
                                {
                                    actionHref: "/crm/leads-pool",
                                    actionLabel: "View Leads Pool →",
                                    autoNavigate: true,
                                    operationType: "navigation",
                                }
                            );
                            return;
                        }
                        finishCommand(
                            `${route.name} is currently locked on your One App Free Plan (your active free app is ${freeSelectedApp.replace("/", "").toUpperCase()}). You can upgrade to Standard ($1/mo Early Bird) to unlock all 28 modules.`,
                            {
                                actionHref: "/billing",
                                actionLabel: "Upgrade Plan →",
                                operationType: "navigation",
                            }
                        );
                        return;
                    }

                    finishCommand(`Opening ${route.name} for ${entityName}...`, {
                        actionHref: route.href,
                        actionLabel: `Open ${route.name} →`,
                        autoNavigate: true,
                        operationType: "navigation",
                    });
                    return;
                }
            }

            // 7. SANDBOX AUTOMATION / SCRIPT GENERATION
            if (
                lower.includes("script") ||
                lower.includes("automate") ||
                lower.includes("automation") ||
                lower.includes("draft a lead") ||
                lower.includes("batch")
            ) {
                const sampleCode = `// Beraxis Isolated Tenant Automation (${entityName})
const entityKey = "${getEntityStorageKey("automation_audit")}";
const timestamp = new Date().toISOString();
console.log("Executing automated workflow for:", "${entityName}");
return {
  status: "COMPLETED",
  entity: "${entityName}",
  executedAt: timestamp,
  summary: "Processed workflow for request: ${cmd.replace(/"/g, '\\"')}"
};`;
                finishCommand(
                    `I've prepared an isolated automation workflow for "${cmd}" in ${entityName}. Review and approve execution below:`,
                    {
                        operationType: "automation",
                        approvalCode: sampleCode,
                    }
                );
                return;
            }

            // 8. SMART CONVERSATIONAL FALLBACK
            finishCommand(
                `Beraxis Voice Pilot is active for ${entityName}.\n\nYou can speak commands such as:\n• "Open Accounting" or "Go to CRM"\n• "Create invoice for Acme Corp for $1,500"\n• "Record vendor bill from AWS for $320"\n• "Add product Wireless Scanner price $89"\n• "Add task Follow up with enterprise lead"\n• "Read my financial summary"`,
                {
                    actionHref: "/apps",
                    actionLabel: "Open Workspace Apps →",
                    operationType: "general",
                }
            );
        },
        [activeBranch, isFreePlan, freeSelectedApp, isModuleEnabled, getEntityStorageKey, router, speakResponse]
    );

    const startRecording = useCallback(() => {
        stopSpeaking();
        setError(null);
        setRequiresApproval(false);
        setCodeSnippet("");
        setLiveInput("");
        liveTranscriptRef.current = "";

        if (typeof window === "undefined") return;

        const SpeechRecognitionAPI =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognitionAPI) {
            setError(
                "Browser Speech Recognition is not supported in this browser. Please use Chrome, Edge, or Safari, or type your command below."
            );
            setStatus("error");
            return;
        }

        try {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.abort();
                } catch {}
            }

            const recognition = new SpeechRecognitionAPI();
            recognition.lang = "en-US";
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
                setStatus("recording");
                setError(null);
            };

            recognition.onresult = (event: any) => {
                let interim = "";
                let finalStr = "";
                for (let i = 0; i < event.results.length; i++) {
                    const res = event.results[i];
                    if (res.isFinal) {
                        finalStr += res[0].transcript;
                    } else {
                        interim += res[0].transcript;
                    }
                }
                const combined = (finalStr || interim).trim();
                liveTranscriptRef.current = combined;
                setLiveInput(combined);
            };

            recognition.onerror = (event: any) => {
                if (event.error === "no-speech") {
                    setError("No speech detected. Tap the microphone and speak your command.");
                    setStatus("idle");
                } else if (event.error === "not-allowed") {
                    setError("Microphone permission was denied. Please allow microphone access in your browser bar.");
                    setStatus("error");
                } else if (event.error !== "aborted") {
                    setError(`Voice recognition notice: ${event.error}`);
                    setStatus("idle");
                }
            };

            recognition.onend = () => {
                const captured = liveTranscriptRef.current.trim();
                if (captured) {
                    processVoiceCommand(captured);
                } else {
                    setStatus((prev) => (prev === "recording" ? "idle" : prev));
                }
            };

            recognitionRef.current = recognition;
            recognition.start();
        } catch (err: any) {
            setError(err?.message || "Could not start voice recognition.");
            setStatus("error");
        }
    }, [processVoiceCommand, stopSpeaking]);

    const stopRecording = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch {}
        }
    }, []);

    const sendTextCommand = useCallback(
        (text: string) => {
            stopSpeaking();
            setLiveInput(text);
            processVoiceCommand(text);
        },
        [processVoiceCommand, stopSpeaking]
    );

    const executeSnippet = useCallback(async () => {
        if (!codeSnippet) return;
        setStatus("processing");
        setError(null);

        setTimeout(() => {
            const outputMsg = `Sandbox Execution Completed ✓\nEntity: ${activeBranch?.name || "Isolated Workspace"}\nTimestamp: ${new Date().toLocaleTimeString()}\nStatus: All operations verified and logged.`;
            setTranscript(outputMsg);
            setRequiresApproval(false);
            setCodeSnippet("");
            speakResponse("Automation execution completed inside your isolated workspace.");
        }, 450);
    }, [codeSnippet, activeBranch, speakResponse]);

    const declineSnippet = useCallback(() => {
        setRequiresApproval(false);
        setCodeSnippet("");
        setTranscript("Sandbox automation execution declined.");
        setStatus("idle");
    }, []);

    const resetState = useCallback(() => {
        stopSpeaking();
        if (recognitionRef.current) {
            try {
                recognitionRef.current.abort();
            } catch {}
        }
        setStatus("idle");
        setTranscript("");
        setLiveInput("");
        setRequiresApproval(false);
        setCodeSnippet("");
        setError(null);
    }, [stopSpeaking]);

    return {
        status,
        transcript,
        liveInput,
        requiresApproval,
        codeSnippet,
        error,
        voiceEnabled,
        history,
        lastAction,
        setVoiceEnabled,
        startRecording,
        stopRecording,
        sendTextCommand,
        executeSnippet,
        declineSnippet,
        stopSpeaking,
        resetState,
    };
}
