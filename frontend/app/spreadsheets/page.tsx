"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import AppHeader from "@/components/layout/AppHeader";
import { useBranchContext } from "@/lib/branchContext";
import {
  FileSpreadsheet,
  Plus,
  Download,
  Upload,
  Trash2,
  Sparkles,
  Calculator,
  Copy,
  Check,
  Table,
  TrendingUp,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  DollarSign,
  Percent,
  Undo2
} from "lucide-react";

type CellFormat = {
  bold?: boolean;
  italic?: boolean;
  align?: "left" | "center" | "right";
  numFormat?: "auto" | "currency" | "percent";
  bg?: "none" | "emerald" | "purple" | "amber" | "blue";
};

type SheetTab = {
  id: string;
  name: string;
  rows: number;
  cols: number;
  cells: Record<string, string>;
  formats: Record<string, CellFormat>;
};

type SheetWorkbook = {
  id: string;
  name: string;
  updatedAt: string;
  activeTabId: string;
  tabs: SheetTab[];
};

const COL_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const BG_MAP: Record<NonNullable<CellFormat["bg"]>, string> = {
  none: "",
  emerald: "bg-emerald-500/15",
  purple: "bg-purple-500/15",
  amber: "bg-amber-500/15",
  blue: "bg-blue-500/15",
};

const TEMPLATES: Record<string, { name: string; tabs: SheetTab[] }> = {
  blank: {
    name: "Untitled Workbook",
    tabs: [
      { id: "tab-1", name: "Sheet 1", rows: 22, cols: 10, cells: {}, formats: {} },
    ],
  },
  pnl: {
    name: "Monthly P&L Budget",
    tabs: [
      {
        id: "tab-pnl",
        name: "Q1 P&L",
        rows: 18,
        cols: 8,
        cells: {
          A1: "Line Item",
          B1: "Jan",
          C1: "Feb",
          D1: "Mar",
          E1: "Q1 Total",
          A2: "Product Revenue",
          B2: "42000",
          C2: "48500",
          D2: "53200",
          E2: "=SUM(B2:D2)",
          A3: "Service Retainers",
          B3: "15000",
          C3: "16500",
          D3: "19000",
          E3: "=SUM(B3:D3)",
          A4: "Total Revenue",
          B4: "=SUM(B2:B3)",
          C4: "=SUM(C2:C3)",
          D4: "=SUM(D2:D3)",
          E4: "=SUM(E2:E3)",
          A6: "Cloud & Infrastructure",
          B6: "1200",
          C6: "1250",
          D6: "1300",
          E6: "=SUM(B6:D6)",
          A7: "Payroll & Contractors",
          B7: "18500",
          C7: "18500",
          D7: "19200",
          E7: "=SUM(B7:D7)",
          A8: "Marketing & Growth",
          B8: "4200",
          C8: "5100",
          D8: "4800",
          E8: "=SUM(B8:D8)",
          A9: "Total Expenses",
          B9: "=SUM(B6:B8)",
          C9: "=SUM(C6:C8)",
          D9: "=SUM(D6:D8)",
          E9: "=SUM(E6:E8)",
          A11: "Net Profit",
          B11: "=B4-B9",
          C11: "=C4-C9",
          D11: "=D4-D9",
          E11: "=E4-E9",
          A12: "Avg Monthly Profit",
          B12: "=AVERAGE(B11:D11)",
        },
        formats: {
          A1: { bold: true, bg: "purple" },
          B1: { bold: true, align: "right", bg: "purple" },
          C1: { bold: true, align: "right", bg: "purple" },
          D1: { bold: true, align: "right", bg: "purple" },
          E1: { bold: true, align: "right", bg: "purple" },
          A4: { bold: true, bg: "emerald" },
          B4: { bold: true, align: "right", numFormat: "currency", bg: "emerald" },
          C4: { bold: true, align: "right", numFormat: "currency", bg: "emerald" },
          D4: { bold: true, align: "right", numFormat: "currency", bg: "emerald" },
          E4: { bold: true, align: "right", numFormat: "currency", bg: "emerald" },
          A9: { bold: true, bg: "amber" },
          B9: { bold: true, align: "right", numFormat: "currency", bg: "amber" },
          C9: { bold: true, align: "right", numFormat: "currency", bg: "amber" },
          D9: { bold: true, align: "right", numFormat: "currency", bg: "amber" },
          E9: { bold: true, align: "right", numFormat: "currency", bg: "amber" },
          A11: { bold: true, bg: "blue" },
          B11: { bold: true, align: "right", numFormat: "currency", bg: "blue" },
          C11: { bold: true, align: "right", numFormat: "currency", bg: "blue" },
          D11: { bold: true, align: "right", numFormat: "currency", bg: "blue" },
          E11: { bold: true, align: "right", numFormat: "currency", bg: "blue" },
          B2: { align: "right", numFormat: "currency" },
          C2: { align: "right", numFormat: "currency" },
          D2: { align: "right", numFormat: "currency" },
          E2: { align: "right", numFormat: "currency" },
          B3: { align: "right", numFormat: "currency" },
          C3: { align: "right", numFormat: "currency" },
          D3: { align: "right", numFormat: "currency" },
          E3: { align: "right", numFormat: "currency" },
          B12: { bold: true, align: "right", numFormat: "currency" },
        },
      },
      {
        id: "tab-notes",
        name: "Assumptions",
        rows: 14,
        cols: 6,
        cells: {
          A1: "Parameter",
          B1: "Value",
          A2: "Target Gross Margin",
          B2: "0.78",
          A3: "Annual SaaS Growth",
          B3: "0.42",
        },
        formats: {
          A1: { bold: true, bg: "purple" },
          B1: { bold: true, bg: "purple" },
          B2: { numFormat: "percent", align: "right" },
          B3: { numFormat: "percent", align: "right" },
        },
      },
    ],
  },
  sales: {
    name: "Sales Pipeline Forecast",
    tabs: [
      {
        id: "tab-sales",
        name: "Pipeline",
        rows: 16,
        cols: 8,
        cells: {
          A1: "Account",
          B1: "Deal Value",
          C1: "Win Prob",
          D1: "Weighted Forecast",
          A2: "Apex Manufacturing",
          B2: "24000",
          C2: "0.75",
          D2: "=B2*C2",
          A3: "Northstar Logistics",
          B3: "18500",
          C3: "0.60",
          D3: "=B3*C3",
          A4: "Vanguard Dental Group",
          B4: "12000",
          C4: "0.90",
          D4: "=B4*C4",
          A5: "Horizon Retail LLC",
          B5: "31000",
          C5: "0.45",
          D5: "=B5*C5",
          A7: "Total Pipeline",
          B7: "=SUM(B2:B5)",
          D7: "=SUM(D2:D5)",
          A8: "Average Deal Size",
          B8: "=AVERAGE(B2:B5)",
          A9: "Largest Deal",
          B9: "=MAX(B2:B5)",
        },
        formats: {
          A1: { bold: true, bg: "blue" },
          B1: { bold: true, align: "right", bg: "blue" },
          C1: { bold: true, align: "right", bg: "blue" },
          D1: { bold: true, align: "right", bg: "blue" },
          B2: { align: "right", numFormat: "currency" },
          B3: { align: "right", numFormat: "currency" },
          B4: { align: "right", numFormat: "currency" },
          B5: { align: "right", numFormat: "currency" },
          C2: { align: "right", numFormat: "percent" },
          C3: { align: "right", numFormat: "percent" },
          C4: { align: "right", numFormat: "percent" },
          C5: { align: "right", numFormat: "percent" },
          D2: { align: "right", numFormat: "currency" },
          D3: { align: "right", numFormat: "currency" },
          D4: { align: "right", numFormat: "currency" },
          D5: { align: "right", numFormat: "currency" },
          A7: { bold: true, bg: "emerald" },
          B7: { bold: true, align: "right", numFormat: "currency", bg: "emerald" },
          D7: { bold: true, align: "right", numFormat: "currency", bg: "emerald" },
          B8: { align: "right", numFormat: "currency" },
          B9: { align: "right", numFormat: "currency" },
        },
      },
    ],
  },
  inventory: {
    name: "Inventory Valuation Sheet",
    tabs: [
      {
        id: "tab-inv",
        name: "Stock Valuation",
        rows: 16,
        cols: 8,
        cells: {
          A1: "SKU",
          B1: "Item Name",
          C1: "Qty On Hand",
          D1: "Unit Cost",
          E1: "Total Value",
          A2: "SKU-101",
          B2: "Enterprise POS Terminal",
          C2: "28",
          D2: "320",
          E2: "=C2*D2",
          A3: "SKU-102",
          B3: "Thermal Receipt Printer",
          C3: "64",
          D3: "85",
          E3: "=C3*D3",
          A4: "SKU-103",
          B4: "Wireless Barcode Scanner",
          C4: "110",
          D4: "45",
          E4: "=C4*D4",
          A6: "Total Stock Units",
          C6: "=SUM(C2:C4)",
          A7: "Total Inventory Asset",
          E7: "=SUM(E2:E4)",
        },
        formats: {
          A1: { bold: true, bg: "purple" },
          B1: { bold: true, bg: "purple" },
          C1: { bold: true, align: "right", bg: "purple" },
          D1: { bold: true, align: "right", bg: "purple" },
          E1: { bold: true, align: "right", bg: "purple" },
          D2: { align: "right", numFormat: "currency" },
          D3: { align: "right", numFormat: "currency" },
          D4: { align: "right", numFormat: "currency" },
          E2: { align: "right", numFormat: "currency" },
          E3: { align: "right", numFormat: "currency" },
          E4: { align: "right", numFormat: "currency" },
          A7: { bold: true, bg: "emerald" },
          E7: { bold: true, align: "right", numFormat: "currency", bg: "emerald" },
        },
      },
    ],
  },
};

function cellId(colIdx: number, rowIdx: number): string {
  return `${COL_LETTERS[colIdx]}${rowIdx + 1}`;
}

function parseCellRef(ref: string): { col: number; row: number } | null {
  const match = ref.trim().toUpperCase().match(/^([A-Z]+)(\d+)$/);
  if (!match) return null;
  const col = COL_LETTERS.indexOf(match[1]);
  const row = parseInt(match[2], 10) - 1;
  if (col < 0 || row < 0) return null;
  return { col, row };
}

function expandRange(rangeStr: string): string[] {
  const parts = rangeStr.split(":");
  if (parts.length !== 2) return [];
  const start = parseCellRef(parts[0]);
  const end = parseCellRef(parts[1]);
  if (!start || !end) return [];
  const refs: string[] = [];
  for (let r = Math.min(start.row, end.row); r <= Math.max(start.row, end.row); r++) {
    for (let c = Math.min(start.col, end.col); c <= Math.max(start.col, end.col); c++) {
      refs.push(cellId(c, r));
    }
  }
  return refs;
}

function evaluateCell(
  id: string,
  cells: Record<string, string>,
  visited: Set<string> = new Set()
): string {
  const raw = cells[id];
  if (raw === undefined || raw === "") return "";
  if (!raw.startsWith("=")) return raw;
  if (visited.has(id)) return "#REF!";
  const nextVisited = new Set(visited);
  nextVisited.add(id);

  const expr = raw.slice(1).trim();

  const getNum = (ref: string): number => {
    const val = evaluateCell(ref, cells, nextVisited);
    const num = parseFloat(val);
    return Number.isFinite(num) ? num : 0;
  };

  const getRangeNums = (argStr: string): number[] => {
    const tokens = argStr.split(",").map((t) => t.trim()).filter(Boolean);
    const nums: number[] = [];
    for (const tok of tokens) {
      if (tok.includes(":")) {
        for (const ref of expandRange(tok)) {
          const v = evaluateCell(ref, cells, nextVisited);
          if (v !== "" && !Number.isNaN(Number(v))) nums.push(Number(v));
        }
      } else if (/^[A-Za-z]+\d+$/.test(tok)) {
        const v = evaluateCell(tok.toUpperCase(), cells, nextVisited);
        if (v !== "" && !Number.isNaN(Number(v))) nums.push(Number(v));
      } else if (!Number.isNaN(Number(tok))) {
        nums.push(Number(tok));
      }
    }
    return nums;
  };

  try {
    const fnMatch = expr.match(/^(SUM|AVERAGE|AVG|MIN|MAX|COUNT)\(([^)]+)\)$/i);
    if (fnMatch) {
      const fn = fnMatch[1].toUpperCase();
      const nums = getRangeNums(fnMatch[2]);
      if (fn === "COUNT") return String(nums.length);
      if (nums.length === 0) return "0";
      if (fn === "SUM") return String(Math.round(nums.reduce((a, b) => a + b, 0) * 100) / 100);
      if (fn === "AVERAGE" || fn === "AVG") {
        return String(Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100) / 100);
      }
      if (fn === "MIN") return String(Math.min(...nums));
      if (fn === "MAX") return String(Math.max(...nums));
    }

    const replaced = expr.replace(/\b([A-Za-z]+\d+)\b/g, (m) => String(getNum(m.toUpperCase())));
    if (/^[\d+\-*/().\s]+$/.test(replaced)) {
      const result = Function(`"use strict"; return (${replaced})`)();
      if (typeof result === "number" && Number.isFinite(result)) {
        return String(Math.round(result * 100) / 100);
      }
    }
    return "#ERR";
  } catch {
    return "#ERR";
  }
}

function formatDisplay(rawEvaluated: string, fmt?: CellFormat): string {
  if (!rawEvaluated || !fmt?.numFormat || fmt.numFormat === "auto") return rawEvaluated;
  const num = Number(rawEvaluated);
  if (!Number.isFinite(num)) return rawEvaluated;
  if (fmt.numFormat === "currency") {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);
  }
  if (fmt.numFormat === "percent") {
    return `${(num * 100).toFixed(1)}%`;
  }
  return rawEvaluated;
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      out.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur.trim());
  return out;
}

export default function SpreadsheetsPage() {
  const { activeBranch, getEntityStorageKey } = useBranchContext();
  const [workbooks, setWorkbooks] = useState<SheetWorkbook[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [selectedCell, setSelectedCell] = useState<string>("A1");
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [formulaInput, setFormulaInput] = useState<string>("");
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [undoStack, setUndoStack] = useState<SheetWorkbook[][]>([]);
  const cellInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (!activeBranch) return;
    const key = getEntityStorageKey("beraxis_spreadsheets_v2");
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed: SheetWorkbook[] = JSON.parse(saved);
        if (parsed.length > 0) {
          setWorkbooks(parsed);
          setActiveId(parsed[0].id);
          const firstTab = parsed[0].tabs.find((t) => t.id === parsed[0].activeTabId) || parsed[0].tabs[0];
          setFormulaInput(firstTab?.cells["A1"] || "");
          return;
        }
      } catch {}
    }
    const defaultWb: SheetWorkbook = {
      id: "wb-pnl-default",
      name: TEMPLATES.pnl.name,
      updatedAt: new Date().toISOString().split("T")[0],
      activeTabId: TEMPLATES.pnl.tabs[0].id,
      tabs: JSON.parse(JSON.stringify(TEMPLATES.pnl.tabs)),
    };
    setWorkbooks([defaultWb]);
    setActiveId(defaultWb.id);
    setFormulaInput(defaultWb.tabs[0].cells["A1"] || "");
  }, [activeBranch?.id]);

  const persistWorkbooks = (updated: SheetWorkbook[], pushUndo = true) => {
    if (pushUndo && workbooks.length > 0) {
      setUndoStack((prev) => [...prev.slice(-15), JSON.parse(JSON.stringify(workbooks))]);
    }
    setWorkbooks(updated);
    try {
      const key = getEntityStorageKey("beraxis_spreadsheets_v2");
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((s) => s.slice(0, -1));
    setWorkbooks(prev);
    try {
      const key = getEntityStorageKey("beraxis_spreadsheets_v2");
      localStorage.setItem(key, JSON.stringify(prev));
    } catch {}
  };

  const activeWorkbook = useMemo(
    () => workbooks.find((w) => w.id === activeId) || workbooks[0] || null,
    [workbooks, activeId]
  );

  const activeTab = useMemo(
    () =>
      activeWorkbook?.tabs.find((t) => t.id === activeWorkbook.activeTabId) ||
      activeWorkbook?.tabs[0] ||
      null,
    [activeWorkbook]
  );

  const activeFormat = activeTab?.formats?.[selectedCell] || {};

  // Keyboard Ctrl+Z Undo
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && editingCell === null) {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const handleSelectCell = (id: string, focusInput = false) => {
    setSelectedCell(id);
    setFormulaInput(activeTab?.cells[id] || "");
    if (focusInput) {
      setTimeout(() => cellInputRefs.current[id]?.focus(), 0);
    }
  };

  const updateActiveTab = (updater: (tab: SheetTab) => SheetTab, pushUndo = true) => {
    if (!activeWorkbook || !activeTab) return;
    const updated = workbooks.map((wb) =>
      wb.id === activeWorkbook.id
        ? {
            ...wb,
            updatedAt: new Date().toISOString().split("T")[0],
            tabs: wb.tabs.map((t) => (t.id === activeTab.id ? updater(t) : t)),
          }
        : wb
    );
    persistWorkbooks(updated, pushUndo);
  };

  const updateCellValue = (id: string, value: string) => {
    updateActiveTab((tab) => {
      const cells = { ...tab.cells };
      if (value === "") delete cells[id];
      else cells[id] = value;
      return { ...tab, cells };
    }, false);
  };

  const toggleFormat = (patch: Partial<CellFormat>) => {
    updateActiveTab((tab) => {
      const prev = tab.formats?.[selectedCell] || {};
      return {
        ...tab,
        formats: {
          ...tab.formats,
          [selectedCell]: { ...prev, ...patch },
        },
      };
    });
  };

  const createFromTemplate = (tplKey: keyof typeof TEMPLATES) => {
    const tpl = TEMPLATES[tplKey];
    const clonedTabs: SheetTab[] = JSON.parse(JSON.stringify(tpl.tabs));
    const newWb: SheetWorkbook = {
      id: `wb-${Date.now()}`,
      name: tpl.name,
      updatedAt: new Date().toISOString().split("T")[0],
      activeTabId: clonedTabs[0].id,
      tabs: clonedTabs,
    };
    const updated = [newWb, ...workbooks];
    persistWorkbooks(updated);
    setActiveId(newWb.id);
    setSelectedCell("A1");
    setFormulaInput(clonedTabs[0].cells["A1"] || "");
  };

  const addSheetTab = () => {
    if (!activeWorkbook) return;
    const newTab: SheetTab = {
      id: `tab-${Date.now()}`,
      name: `Sheet ${activeWorkbook.tabs.length + 1}`,
      rows: 20,
      cols: 10,
      cells: {},
      formats: {},
    };
    const updated = workbooks.map((wb) =>
      wb.id === activeWorkbook.id
        ? { ...wb, activeTabId: newTab.id, tabs: [...wb.tabs, newTab] }
        : wb
    );
    persistWorkbooks(updated);
    setSelectedCell("A1");
    setFormulaInput("");
  };

  const deleteWorkbook = (id: string) => {
    if (workbooks.length <= 1) return;
    const updated = workbooks.filter((w) => w.id !== id);
    persistWorkbooks(updated);
    if (activeId === id) {
      setActiveId(updated[0].id);
      setSelectedCell("A1");
      setFormulaInput(updated[0].tabs[0]?.cells["A1"] || "");
    }
  };

  const exportCsv = () => {
    if (!activeWorkbook || !activeTab) return;
    const lines: string[] = [];
    for (let r = 0; r < activeTab.rows; r++) {
      const rowVals: string[] = [];
      for (let c = 0; c < activeTab.cols; c++) {
        const val = evaluateCell(cellId(c, r), activeTab.cells);
        const escaped = val.includes(",") || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
        rowVals.push(escaped);
      }
      lines.push(rowVals.join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeWorkbook.name}_${activeTab.name}`.replace(/\s+/g, "_").toLowerCase() + ".csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const rows = text.split(/\r?\n/).filter((line) => line.length > 0);
      const newCells: Record<string, string> = {};
      let maxCols = 8;
      rows.forEach((line, rIdx) => {
        const cols = parseCsvLine(line);
        maxCols = Math.max(maxCols, Math.min(cols.length, 22));
        cols.slice(0, 22).forEach((val, cIdx) => {
          if (val !== "") newCells[cellId(cIdx, rIdx)] = val;
        });
      });
      const tabId = `tab-${Date.now()}`;
      const newWb: SheetWorkbook = {
        id: `wb-${Date.now()}`,
        name: file.name.replace(/\.(csv|xlsx)$/i, ""),
        updatedAt: new Date().toISOString().split("T")[0],
        activeTabId: tabId,
        tabs: [
          {
            id: tabId,
            name: "Imported Sheet",
            rows: Math.max(18, rows.length + 4),
            cols: maxCols,
            cells: newCells,
            formats: {},
          },
        ],
      };
      persistWorkbooks([newWb, ...workbooks]);
      setActiveId(newWb.id);
      setSelectedCell("A1");
      setFormulaInput(newCells["A1"] || "");
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Live Excel-style Status Bar metrics for active column
  const columnStats = useMemo(() => {
    if (!activeTab) return { count: 0, sum: 0, avg: 0 };
    const parsed = parseCellRef(selectedCell);
    if (!parsed) return { count: 0, sum: 0, avg: 0 };
    const nums: number[] = [];
    for (let r = 0; r < activeTab.rows; r++) {
      const v = evaluateCell(cellId(parsed.col, r), activeTab.cells);
      if (v !== "" && !Number.isNaN(Number(v))) nums.push(Number(v));
    }
    const sum = nums.reduce((a, b) => a + b, 0);
    return {
      count: nums.length,
      sum: Math.round(sum * 100) / 100,
      avg: nums.length ? Math.round((sum / nums.length) * 100) / 100 : 0,
    };
  }, [activeTab, selectedCell]);

  const handleCellKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, rIdx: number, cIdx: number) => {
    if (!activeTab) return;
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      setEditingCell(null);
      const nextR = Math.min(activeTab.rows - 1, rIdx + 1);
      handleSelectCell(cellId(cIdx, nextR), true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setEditingCell(null);
      const prevR = Math.max(0, rIdx - 1);
      handleSelectCell(cellId(cIdx, prevR), true);
    } else if (e.key === "Tab") {
      e.preventDefault();
      setEditingCell(null);
      const nextC = Math.min(activeTab.cols - 1, cIdx + 1);
      handleSelectCell(cellId(nextC, rIdx), true);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0d14] text-white">
      <AppHeader title="BERAXIS Sheets — Built-In Excel Alternative" />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 border-r border-gray-800 bg-[#0e121c] p-4 flex flex-col justify-between shrink-0 overflow-y-auto">
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-800 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Workbooks ({workbooks.length})
                </span>
                <button
                  onClick={() => createFromTemplate("blank")}
                  className="text-emerald-400 hover:text-emerald-300 p-1 hover:bg-emerald-500/10 rounded cursor-pointer"
                  title="New Blank Workbook"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-1.5">
                {workbooks.map((wb) => (
                  <div
                    key={wb.id}
                    className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeWorkbook?.id === wb.id
                        ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/40"
                        : "text-gray-400 hover:bg-gray-800/60 hover:text-white border border-transparent"
                    }`}
                    onClick={() => {
                      setActiveId(wb.id);
                      const tab = wb.tabs.find((t) => t.id === wb.activeTabId) || wb.tabs[0];
                      setSelectedCell("A1");
                      setFormulaInput(tab?.cells["A1"] || "");
                    }}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileSpreadsheet size={14} className="shrink-0 text-emerald-400" />
                      <span className="truncate">{wb.name}</span>
                    </div>
                    {workbooks.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteWorkbook(wb.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 p-0.5"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                1-Click Business Templates
              </span>
              <div className="space-y-1.5">
                <button
                  onClick={() => createFromTemplate("pnl")}
                  className="w-full text-left px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 flex items-center gap-2 cursor-pointer"
                >
                  <TrendingUp size={13} className="text-emerald-400" />
                  <span>Monthly P&amp;L Budget</span>
                </button>
                <button
                  onClick={() => createFromTemplate("sales")}
                  className="w-full text-left px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 flex items-center gap-2 cursor-pointer"
                >
                  <Calculator size={13} className="text-cyan-400" />
                  <span>Sales Pipeline Forecast</span>
                </button>
                <button
                  onClick={() => createFromTemplate("inventory")}
                  className="w-full text-left px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 flex items-center gap-2 cursor-pointer"
                >
                  <Table size={13} className="text-purple-400" />
                  <span>Inventory Valuation</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-200 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-emerald-300">
              <Sparkles size={13} /> No Excel License Needed
            </div>
            <p className="text-gray-400 leading-relaxed">
              Multi-tab workbooks, cell formatting,{" "}
              <code className="text-emerald-300">=SUM()</code>,{" "}
              <code className="text-emerald-300">=AVERAGE()</code>,{" "}
              <code className="text-emerald-300">=MIN()</code>,{" "}
              <code className="text-emerald-300">=MAX()</code>, and CSV export.
            </p>
          </div>
        </aside>

        {/* Main Grid Workspace */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#070a11]">
          {/* Top Actions & Formatting Ribbon */}
          <div className="border-b border-gray-800 bg-[#0c111b] px-4 py-2.5 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-[260px]">
                <input
                  type="text"
                  value={activeWorkbook?.name || ""}
                  onChange={(e) => {
                    if (!activeWorkbook) return;
                    persistWorkbooks(
                      workbooks.map((w) => (w.id === activeWorkbook.id ? { ...w, name: e.target.value } : w)),
                      false
                    );
                  }}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-emerald-500 w-48"
                />
                <span className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                  {selectedCell}
                </span>
                <input
                  type="text"
                  value={formulaInput}
                  placeholder="Enter value or formula (e.g. =SUM(B2:B5))"
                  onChange={(e) => {
                    setFormulaInput(e.target.value);
                    updateCellValue(selectedCell, e.target.value);
                  }}
                  className="flex-1 bg-[#070a11] border border-gray-700 rounded-lg px-3 py-1.5 text-xs font-mono text-gray-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleUndo}
                  disabled={undoStack.length === 0}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 border border-white/10 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 size={13} />
                </button>
                <button
                  onClick={() => {
                    if (!activeTab) return;
                    navigator.clipboard.writeText(evaluateCell(selectedCell, activeTab.cells));
                    setCopiedNotice(true);
                    setTimeout(() => setCopiedNotice(false), 1500);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copiedNotice ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copiedNotice ? "Copied" : "Copy"}</span>
                </button>
                <label className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold flex items-center gap-1 cursor-pointer">
                  <Upload size={13} className="text-cyan-400" />
                  <span>Import CSV</span>
                  <input type="file" accept=".csv" onChange={handleImportCsv} className="hidden" />
                </label>
                <button
                  onClick={exportCsv}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                  <Download size={13} /> <span>Export Excel / CSV</span>
                </button>
              </div>
            </div>

            {/* Formatting Toolbar */}
            <div className="flex flex-wrap items-center gap-2 text-xs pt-1 border-t border-white/5">
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
                <button
                  onClick={() => toggleFormat({ bold: !activeFormat.bold })}
                  className={`p-1.5 rounded cursor-pointer ${activeFormat.bold ? "bg-emerald-600 text-white" : "text-gray-300 hover:bg-white/10"}`}
                  title="Bold"
                >
                  <Bold size={13} />
                </button>
                <button
                  onClick={() => toggleFormat({ italic: !activeFormat.italic })}
                  className={`p-1.5 rounded cursor-pointer ${activeFormat.italic ? "bg-emerald-600 text-white" : "text-gray-300 hover:bg-white/10"}`}
                  title="Italic"
                >
                  <Italic size={13} />
                </button>
              </div>

              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
                <button
                  onClick={() => toggleFormat({ align: "left" })}
                  className={`p-1.5 rounded cursor-pointer ${(!activeFormat.align || activeFormat.align === "left") ? "bg-emerald-600 text-white" : "text-gray-300 hover:bg-white/10"}`}
                >
                  <AlignLeft size={13} />
                </button>
                <button
                  onClick={() => toggleFormat({ align: "center" })}
                  className={`p-1.5 rounded cursor-pointer ${activeFormat.align === "center" ? "bg-emerald-600 text-white" : "text-gray-300 hover:bg-white/10"}`}
                >
                  <AlignCenter size={13} />
                </button>
                <button
                  onClick={() => toggleFormat({ align: "right" })}
                  className={`p-1.5 rounded cursor-pointer ${activeFormat.align === "right" ? "bg-emerald-600 text-white" : "text-gray-300 hover:bg-white/10"}`}
                >
                  <AlignRight size={13} />
                </button>
              </div>

              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
                <button
                  onClick={() =>
                    toggleFormat({
                      numFormat: activeFormat.numFormat === "currency" ? "auto" : "currency",
                    })
                  }
                  className={`px-2 py-1 rounded font-bold flex items-center gap-0.5 cursor-pointer ${
                    activeFormat.numFormat === "currency" ? "bg-emerald-600 text-white" : "text-gray-300 hover:bg-white/10"
                  }`}
                  title="Format as Currency ($)"
                >
                  <DollarSign size={12} />
                </button>
                <button
                  onClick={() =>
                    toggleFormat({
                      numFormat: activeFormat.numFormat === "percent" ? "auto" : "percent",
                    })
                  }
                  className={`px-2 py-1 rounded font-bold flex items-center gap-0.5 cursor-pointer ${
                    activeFormat.numFormat === "percent" ? "bg-emerald-600 text-white" : "text-gray-300 hover:bg-white/10"
                  }`}
                  title="Format as Percentage (%)"
                >
                  <Percent size={12} />
                </button>
              </div>

              <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg border border-white/10">
                <span className="text-[10px] text-gray-400 uppercase font-bold">Fill:</span>
                {(["none", "emerald", "purple", "amber", "blue"] as const).map((color) => (
                  <button
                    key={color}
                    onClick={() => toggleFormat({ bg: color })}
                    className={`w-4 h-4 rounded-full border cursor-pointer ${
                      color === "none"
                        ? "bg-transparent border-gray-500"
                        : color === "emerald"
                        ? "bg-emerald-500 border-emerald-300"
                        : color === "purple"
                        ? "bg-purple-500 border-purple-300"
                        : color === "amber"
                        ? "bg-amber-500 border-amber-300"
                        : "bg-blue-500 border-blue-300"
                    } ${activeFormat.bg === color ? "ring-2 ring-white" : ""}`}
                    title={`Fill: ${color}`}
                  />
                ))}
              </div>

              <button
                onClick={() => updateActiveTab((tab) => ({ ...tab, rows: tab.rows + 5 }))}
                className="ml-auto px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus size={12} /> +5 Rows
              </button>
            </div>
          </div>

          {/* Spreadsheet Grid */}
          {activeTab && (
            <div className="flex-1 overflow-auto">
              <table className="border-collapse w-full text-xs">
                <thead className="sticky top-0 z-10 bg-[#101624]">
                  <tr>
                    <th className="w-12 min-w-[48px] border border-gray-800 bg-[#0c111b] text-gray-500 font-mono py-2">
                      #
                    </th>
                    {Array.from({ length: activeTab.cols }).map((_, cIdx) => (
                      <th
                        key={cIdx}
                        className="min-w-[130px] border border-gray-800 text-gray-300 font-bold py-2 px-2 text-center"
                      >
                        {COL_LETTERS[cIdx]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: activeTab.rows }).map((_, rIdx) => (
                    <tr key={rIdx} className="hover:bg-white/[0.02]">
                      <td className="border border-gray-800 bg-[#0c111b] text-gray-500 font-mono text-center py-1.5 select-none">
                        {rIdx + 1}
                      </td>
                      {Array.from({ length: activeTab.cols }).map((__, cIdx) => {
                        const id = cellId(cIdx, rIdx);
                        const isSelected = selectedCell === id;
                        const isEditing = editingCell === id;
                        const rawVal = activeTab.cells[id] || "";
                        const evaluated = evaluateCell(id, activeTab.cells);
                        const fmt = activeTab.formats?.[id];
                        const displayVal = isEditing ? rawVal : formatDisplay(evaluated, fmt);
                        const isFormula = rawVal.startsWith("=");

                        return (
                          <td
                            key={id}
                            className={`border border-gray-800 p-0 ${BG_MAP[fmt?.bg || "none"]} ${
                              isSelected ? "ring-2 ring-emerald-400 z-10 relative" : ""
                            }`}
                          >
                            <input
                              ref={(el) => {
                                cellInputRefs.current[id] = el;
                              }}
                              type="text"
                              value={displayVal}
                              onFocus={() => {
                                setEditingCell(id);
                                handleSelectCell(id);
                              }}
                              onBlur={() => setEditingCell(null)}
                              onKeyDown={(e) => handleCellKeyDown(e, rIdx, cIdx)}
                              onChange={(e) => {
                                setFormulaInput(e.target.value);
                                updateCellValue(id, e.target.value);
                              }}
                              className={`w-full h-8 px-2.5 bg-transparent focus:outline-none text-xs ${
                                fmt?.bold ? "font-bold text-white" : ""
                              } ${fmt?.italic ? "italic" : ""} ${
                                fmt?.align === "right"
                                  ? "text-right"
                                  : fmt?.align === "center"
                                  ? "text-center"
                                  : "text-left"
                              } ${isFormula ? "text-emerald-300 font-mono" : "text-gray-200"}`}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Bottom Sheet Tabs + Excel Status Bar */}
          {activeWorkbook && (
            <div className="border-t border-gray-800 bg-[#0c111b] px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {activeWorkbook.tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      persistWorkbooks(
                        workbooks.map((w) =>
                          w.id === activeWorkbook.id ? { ...w, activeTabId: tab.id } : w
                        ),
                        false
                      );
                      setSelectedCell("A1");
                      setFormulaInput(tab.cells["A1"] || "");
                    }}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      activeTab?.id === tab.id
                        ? "bg-emerald-600/25 text-emerald-300 border border-emerald-500/40"
                        : "bg-white/5 text-gray-400 hover:text-white border border-transparent"
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
                <button
                  onClick={addSheetTab}
                  className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-emerald-400 font-bold flex items-center gap-1 cursor-pointer"
                  title="Add Sheet Tab"
                >
                  <Plus size={13} /> Sheet
                </button>
              </div>

              <div className="flex items-center gap-4 text-[11px] text-gray-400 font-mono">
                <span>
                  Col Count: <strong className="text-white">{columnStats.count}</strong>
                </span>
                <span>
                  Col Avg: <strong className="text-cyan-300">{columnStats.avg}</strong>
                </span>
                <span>
                  Col Sum: <strong className="text-emerald-300">{columnStats.sum}</strong>
                </span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
