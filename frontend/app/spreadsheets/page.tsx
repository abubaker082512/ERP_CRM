"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import * as XLSX from "xlsx";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
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
  Undo2,
  Sun,
  Moon,
  BarChart3
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

const BG_MAP_DARK: Record<NonNullable<CellFormat["bg"]>, string> = {
  none: "",
  emerald: "bg-emerald-500/15",
  purple: "bg-purple-500/15",
  amber: "bg-amber-500/15",
  blue: "bg-blue-500/15",
};

const BG_MAP_LIGHT: Record<NonNullable<CellFormat["bg"]>, string> = {
  none: "",
  emerald: "bg-emerald-100",
  purple: "bg-purple-100",
  amber: "bg-amber-100",
  blue: "bg-blue-100",
};

const TEMPLATES: Record<string, { name: string; tabs: SheetTab[] }> = {
  blank: {
    name: "Untitled Workbook",
    tabs: [{ id: "tab-1", name: "Sheet 1", rows: 22, cols: 10, cells: {}, formats: {} }],
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
          A12: "Margin Status",
          B12: "=IF(E11>50000, Healthy, Review)",
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
          B12: { bold: true, align: "center" },
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
    // IF(cond, trueVal, falseVal)
    const ifMatch = expr.match(/^IF\(([^,]+),([^,]+),([^)]+)\)$/i);
    if (ifMatch) {
      const condRaw = ifMatch[1].trim();
      const tVal = ifMatch[2].trim().replace(/^["']|["']$/g, "");
      const fVal = ifMatch[3].trim().replace(/^["']|["']$/g, "");
      const cmp = condRaw.match(/^([A-Za-z]+\d+|\d+(?:\.\d+)?)\s*(>=|<=|!=|=|>|<)\s*([A-Za-z]+\d+|\d+(?:\.\d+)?)$/);
      if (cmp) {
        const left = /^[A-Za-z]+\d+$/.test(cmp[1]) ? getNum(cmp[1].toUpperCase()) : parseFloat(cmp[1]);
        const right = /^[A-Za-z]+\d+$/.test(cmp[3]) ? getNum(cmp[3].toUpperCase()) : parseFloat(cmp[3]);
        const op = cmp[2];
        const ok =
          op === ">" ? left > right :
          op === "<" ? left < right :
          op === ">=" ? left >= right :
          op === "<=" ? left <= right :
          op === "!=" ? left !== right :
          left === right;
        return ok ? tVal : fVal;
      }
    }

    // CONCAT(a, b, ...)
    const concatMatch = expr.match(/^CONCAT\(([^)]+)\)$/i);
    if (concatMatch) {
      return concatMatch[1]
        .split(",")
        .map((arg) => {
          const t = arg.trim();
          if (/^[A-Za-z]+\d+$/.test(t)) return evaluateCell(t.toUpperCase(), cells, nextVisited);
          return t.replace(/^["']|["']$/g, "");
        })
        .join("");
    }

    // ROUND(val, digits)
    const roundMatch = expr.match(/^ROUND\(([^,]+),([^)]+)\)$/i);
    if (roundMatch) {
      const target = roundMatch[1].trim();
      const val = /^[A-Za-z]+\d+$/.test(target) ? getNum(target.toUpperCase()) : parseFloat(target);
      const digits = parseInt(roundMatch[2].trim(), 10) || 0;
      const factor = Math.pow(10, digits);
      return String(Math.round(val * factor) / factor);
    }

    // Aggregate functions
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

export default function SpreadsheetsPage() {
  const { activeBranch, getEntityStorageKey } = useBranchContext();
  const [workbooks, setWorkbooks] = useState<SheetWorkbook[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [selectedCell, setSelectedCell] = useState<string>("A1");
  const [rangeAnchor, setRangeAnchor] = useState<string>("A1");
  const [rangeEnd, setRangeEnd] = useState<string>("A1");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [formulaInput, setFormulaInput] = useState<string>("");
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [undoStack, setUndoStack] = useState<SheetWorkbook[][]>([]);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [showChart, setShowChart] = useState<boolean>(false);
  const cellInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    const savedTheme = localStorage.getItem("beraxis_office_theme");
    if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("beraxis_office_theme", next);
  };

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

  useEffect(() => {
    const onUp = () => setIsDragging(false);
    window.addEventListener("mouseup", onUp);
    return () => window.removeEventListener("mouseup", onUp);
  }, []);

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

  const selectedRangeCells = useMemo(() => {
    const start = parseCellRef(rangeAnchor);
    const end = parseCellRef(rangeEnd);
    if (!start || !end) return new Set<string>([selectedCell]);
    const set = new Set<string>();
    for (let r = Math.min(start.row, end.row); r <= Math.max(start.row, end.row); r++) {
      for (let c = Math.min(start.col, end.col); c <= Math.max(start.col, end.col); c++) {
        set.add(cellId(c, r));
      }
    }
    return set;
  }, [rangeAnchor, rangeEnd, selectedCell]);

  const handleSelectCell = (id: string, focusInput = false) => {
    setSelectedCell(id);
    setRangeAnchor(id);
    setRangeEnd(id);
    setFormulaInput(activeTab?.cells[id] || "");
    if (focusInput) setTimeout(() => cellInputRefs.current[id]?.focus(), 0);
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
      const nextFormats = { ...tab.formats };
      selectedRangeCells.forEach((cid) => {
        nextFormats[cid] = { ...(nextFormats[cid] || {}), ...patch };
      });
      return { ...tab, formats: nextFormats };
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
    persistWorkbooks([newWb, ...workbooks]);
    setActiveId(newWb.id);
    handleSelectCell("A1");
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
    persistWorkbooks(
      workbooks.map((wb) =>
        wb.id === activeWorkbook.id ? { ...wb, activeTabId: newTab.id, tabs: [...wb.tabs, newTab] } : wb
      )
    );
    handleSelectCell("A1");
    setFormulaInput("");
  };

  // True .xlsx Multi-Sheet Export via SheetJS
  const exportXlsx = () => {
    if (!activeWorkbook) return;
    const wb = XLSX.utils.book_new();
    activeWorkbook.tabs.forEach((tab) => {
      const aoa: (string | number)[][] = [];
      for (let r = 0; r < tab.rows; r++) {
        const rowArr: (string | number)[] = [];
        for (let c = 0; c < tab.cols; c++) {
          const val = evaluateCell(cellId(c, r), tab.cells);
          const num = Number(val);
          rowArr.push(val !== "" && Number.isFinite(num) ? num : val);
        }
        aoa.push(rowArr);
      }
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      XLSX.utils.book_append_sheet(wb, ws, tab.name.slice(0, 31));
    });
    XLSX.writeFile(wb, `${activeWorkbook.name.replace(/\s+/g, "_")}.xlsx`);
  };

  // True .xlsx / .csv Import via SheetJS
  const handleImportSpreadsheet = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (!data) return;
      const wb = XLSX.read(data, { type: "array" });
      const tabs: SheetTab[] = wb.SheetNames.map((sheetName, idx) => {
        const ws = wb.Sheets[sheetName];
        const aoa = XLSX.utils.sheet_to_json<(string | number)[]>(ws, { header: 1 });
        const cells: Record<string, string> = {};
        let maxCols = 8;
        aoa.forEach((rowArr, rIdx) => {
          maxCols = Math.max(maxCols, Math.min(rowArr.length, 22));
          rowArr.slice(0, 22).forEach((val, cIdx) => {
            if (val !== undefined && val !== null && String(val) !== "") {
              cells[cellId(cIdx, rIdx)] = String(val);
            }
          });
        });
        return {
          id: `tab-${Date.now()}-${idx}`,
          name: sheetName,
          rows: Math.max(18, aoa.length + 4),
          cols: maxCols,
          cells,
          formats: {},
        };
      });
      if (tabs.length === 0) return;
      const newWb: SheetWorkbook = {
        id: `wb-${Date.now()}`,
        name: file.name.replace(/\.(xlsx|xls|csv)$/i, ""),
        updatedAt: new Date().toISOString().split("T")[0],
        activeTabId: tabs[0].id,
        tabs,
      };
      persistWorkbooks([newWb, ...workbooks]);
      setActiveId(newWb.id);
      handleSelectCell("A1");
      setFormulaInput(tabs[0].cells["A1"] || "");
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  // Live Status Bar Stats (for selected range or active column)
  const rangeStats = useMemo(() => {
    if (!activeTab) return { count: 0, sum: 0, avg: 0 };
    const targets =
      selectedRangeCells.size > 1
        ? Array.from(selectedRangeCells)
        : Array.from({ length: activeTab.rows }, (_, r) =>
            cellId(parseCellRef(selectedCell)?.col || 0, r)
          );
    const nums: number[] = [];
    for (const id of targets) {
      const v = evaluateCell(id, activeTab.cells);
      if (v !== "" && !Number.isNaN(Number(v))) nums.push(Number(v));
    }
    const sum = nums.reduce((a, b) => a + b, 0);
    return {
      count: nums.length,
      sum: Math.round(sum * 100) / 100,
      avg: nums.length ? Math.round((sum / nums.length) * 100) / 100 : 0,
    };
  }, [activeTab, selectedRangeCells, selectedCell]);

  // Chart data derived from rows 2..12 where col A is label and col B is numeric
  const chartData = useMemo(() => {
    if (!activeTab) return [];
    const data: { name: string; value: number }[] = [];
    for (let r = 1; r < Math.min(activeTab.rows, 14); r++) {
      const label = evaluateCell(cellId(0, r), activeTab.cells);
      const valStr = evaluateCell(cellId(1, r), activeTab.cells);
      const num = Number(valStr);
      if (label && valStr !== "" && Number.isFinite(num)) {
        data.push({ name: label.slice(0, 18), value: num });
      }
    }
    return data;
  }, [activeTab]);

  const handleCellKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, rIdx: number, cIdx: number) => {
    if (!activeTab) return;
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      setEditingCell(null);
      handleSelectCell(cellId(cIdx, Math.min(activeTab.rows - 1, rIdx + 1)), true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setEditingCell(null);
      handleSelectCell(cellId(cIdx, Math.max(0, rIdx - 1)), true);
    } else if (e.key === "Tab") {
      e.preventDefault();
      setEditingCell(null);
      handleSelectCell(cellId(Math.min(activeTab.cols - 1, cIdx + 1), rIdx), true);
    }
  };

  const isLight = theme === "light";
  const BG_MAP = isLight ? BG_MAP_LIGHT : BG_MAP_DARK;

  return (
    <div className={`flex flex-col h-screen ${isLight ? "bg-slate-100 text-slate-900" : "bg-[#0a0d14] text-white"}`}>
      <AppHeader title="BERAXIS Sheets — Full Excel Studio (.XLSX)" />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className={`w-64 border-r p-4 flex flex-col justify-between shrink-0 overflow-y-auto ${isLight ? "bg-white border-slate-200" : "bg-[#0e121c] border-gray-800"}`}>
          <div className="space-y-5">
            <div>
              <div className={`flex items-center justify-between pb-2 border-b mb-3 ${isLight ? "border-slate-200" : "border-gray-800"}`}>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Workbooks ({workbooks.length})
                </span>
                <button onClick={() => createFromTemplate("blank")} className="text-emerald-500 hover:text-emerald-400 p-1 rounded cursor-pointer">
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-1.5">
                {workbooks.map((wb) => (
                  <div
                    key={wb.id}
                    className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
                      activeWorkbook?.id === wb.id
                        ? isLight
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                          : "bg-emerald-600/20 text-emerald-300 border border-emerald-500/40"
                        : isLight
                        ? "text-slate-600 hover:bg-slate-100"
                        : "text-gray-400 hover:bg-gray-800/60 hover:text-white"
                    }`}
                    onClick={() => {
                      setActiveId(wb.id);
                      const tab = wb.tabs.find((t) => t.id === wb.activeTabId) || wb.tabs[0];
                      handleSelectCell("A1");
                      setFormulaInput(tab?.cells["A1"] || "");
                    }}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileSpreadsheet size={14} className="shrink-0 text-emerald-500" />
                      <span className="truncate">{wb.name}</span>
                    </div>
                    {workbooks.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          persistWorkbooks(workbooks.filter((w) => w.id !== wb.id));
                        }}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-0.5"
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
                Templates
              </span>
              <div className="space-y-1.5">
                <button
                  onClick={() => createFromTemplate("pnl")}
                  className={`w-full text-left px-3 py-2 rounded-xl border text-xs flex items-center gap-2 cursor-pointer ${isLight ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700" : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-300"}`}
                >
                  <TrendingUp size={13} className="text-emerald-500" />
                  <span>Monthly P&amp;L Budget</span>
                </button>
                <button
                  onClick={() => createFromTemplate("sales")}
                  className={`w-full text-left px-3 py-2 rounded-xl border text-xs flex items-center gap-2 cursor-pointer ${isLight ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700" : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-300"}`}
                >
                  <Calculator size={13} className="text-cyan-500" />
                  <span>Sales Pipeline Forecast</span>
                </button>
              </div>
            </div>
          </div>

          <div className={`p-3 rounded-xl border text-[11px] space-y-1 ${isLight ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-200"}`}>
            <div className="font-bold flex items-center gap-1.5">
              <Sparkles size={13} className="text-emerald-500" /> Excel .XLSX Compatible
            </div>
            <p className={isLight ? "text-slate-600" : "text-gray-400"}>
              Supports multi-sheet `.xlsx`, drag-select stats, charts, `=SUM()`, `=IF()`, `=ROUND()`, and `=CONCAT()`.
            </p>
          </div>
        </aside>

        {/* Main Grid */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Top Ribbon */}
          <div className={`border-b px-4 py-2.5 space-y-2.5 ${isLight ? "bg-white border-slate-200" : "bg-[#0c111b] border-gray-800"}`}>
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
                  className={`border rounded-lg px-3 py-1.5 text-sm font-bold w-44 focus:outline-none focus:border-emerald-500 ${isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-white/5 border-white/10 text-white"}`}
                />
                <span className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs font-mono font-bold">
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
                  className={`flex-1 border rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-emerald-500 ${isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-[#070a11] border-gray-700 text-gray-100"}`}
                />
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={toggleTheme}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 cursor-pointer ${isLight ? "bg-slate-100 border-slate-300 text-slate-800" : "bg-white/5 border-white/10 text-gray-200"}`}
                  title="Toggle Light / Dark Theme"
                >
                  {isLight ? <Moon size={13} /> : <Sun size={13} className="text-amber-400" />}
                  <span>{isLight ? "Dark" : "Light"}</span>
                </button>
                <button
                  onClick={() => setShowChart(!showChart)}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 cursor-pointer ${showChart ? "bg-purple-600 text-white border-purple-500" : isLight ? "bg-slate-100 border-slate-300 text-slate-800" : "bg-white/5 border-white/10 text-gray-200"}`}
                >
                  <BarChart3 size={13} /> <span>Chart</span>
                </button>
                <button
                  onClick={handleUndo}
                  disabled={undoStack.length === 0}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer disabled:opacity-30 ${isLight ? "bg-slate-100 border-slate-300" : "bg-white/5 border-white/10"}`}
                  title="Undo"
                >
                  <Undo2 size={13} />
                </button>
                <label className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer ${isLight ? "bg-slate-100 border-slate-300 text-slate-800" : "bg-white/5 border-white/10 text-gray-200"}`}>
                  <Upload size={13} className="text-cyan-500" />
                  <span>Import .XLSX/.CSV</span>
                  <input type="file" accept=".xlsx,.xls,.csv" onChange={handleImportSpreadsheet} className="hidden" />
                </label>
                <button
                  onClick={exportXlsx}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Download size={13} /> <span>Export .XLSX</span>
                </button>
              </div>
            </div>

            {/* Formatting Toolbar */}
            <div className={`flex flex-wrap items-center gap-2 text-xs pt-1 border-t ${isLight ? "border-slate-200" : "border-white/5"}`}>
              <button onClick={() => toggleFormat({ bold: !activeFormat.bold })} className={`p-1.5 rounded cursor-pointer ${activeFormat.bold ? "bg-emerald-600 text-white" : "hover:bg-emerald-500/20"}`}><Bold size={13} /></button>
              <button onClick={() => toggleFormat({ italic: !activeFormat.italic })} className={`p-1.5 rounded cursor-pointer ${activeFormat.italic ? "bg-emerald-600 text-white" : "hover:bg-emerald-500/20"}`}><Italic size={13} /></button>
              <span className="w-px h-4 bg-gray-500/30" />
              <button onClick={() => toggleFormat({ align: "left" })} className={`p-1.5 rounded cursor-pointer ${activeFormat.align === "left" ? "bg-emerald-600 text-white" : "hover:bg-emerald-500/20"}`}><AlignLeft size={13} /></button>
              <button onClick={() => toggleFormat({ align: "center" })} className={`p-1.5 rounded cursor-pointer ${activeFormat.align === "center" ? "bg-emerald-600 text-white" : "hover:bg-emerald-500/20"}`}><AlignCenter size={13} /></button>
              <button onClick={() => toggleFormat({ align: "right" })} className={`p-1.5 rounded cursor-pointer ${activeFormat.align === "right" ? "bg-emerald-600 text-white" : "hover:bg-emerald-500/20"}`}><AlignRight size={13} /></button>
              <span className="w-px h-4 bg-gray-500/30" />
              <button onClick={() => toggleFormat({ numFormat: activeFormat.numFormat === "currency" ? "auto" : "currency" })} className={`px-2 py-1 rounded font-bold cursor-pointer ${activeFormat.numFormat === "currency" ? "bg-emerald-600 text-white" : "hover:bg-emerald-500/20"}`}><DollarSign size={12} /></button>
              <button onClick={() => toggleFormat({ numFormat: activeFormat.numFormat === "percent" ? "auto" : "percent" })} className={`px-2 py-1 rounded font-bold cursor-pointer ${activeFormat.numFormat === "percent" ? "bg-emerald-600 text-white" : "hover:bg-emerald-500/20"}`}><Percent size={12} /></button>
              <span className="w-px h-4 bg-gray-500/30" />
              {(["none", "emerald", "purple", "amber", "blue"] as const).map((color) => (
                <button
                  key={color}
                  onClick={() => toggleFormat({ bg: color })}
                  className={`w-4 h-4 rounded-full border cursor-pointer ${
                    color === "none" ? "bg-transparent border-gray-400" :
                    color === "emerald" ? "bg-emerald-500 border-emerald-300" :
                    color === "purple" ? "bg-purple-500 border-purple-300" :
                    color === "amber" ? "bg-amber-500 border-amber-300" : "bg-blue-500 border-blue-300"
                  } ${activeFormat.bg === color ? "ring-2 ring-emerald-400" : ""}`}
                />
              ))}
              <button
                onClick={() => updateActiveTab((tab) => ({ ...tab, rows: tab.rows + 5 }))}
                className="ml-auto px-2.5 py-1 rounded-lg bg-emerald-600/15 text-emerald-500 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus size={12} /> +5 Rows
              </button>
            </div>
          </div>

          {/* Grid + Optional Live Chart */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {activeTab && (
              <div className="flex-1 overflow-auto">
                <table className="border-collapse w-full text-xs select-none">
                  <thead className={`sticky top-0 z-10 ${isLight ? "bg-slate-200 text-slate-700" : "bg-[#101624] text-gray-300"}`}>
                    <tr>
                      <th className={`w-12 min-w-[48px] border font-mono py-2 ${isLight ? "border-slate-300 bg-slate-200" : "border-gray-800 bg-[#0c111b] text-gray-500"}`}>
                        #
                      </th>
                      {Array.from({ length: activeTab.cols }).map((_, cIdx) => (
                        <th key={cIdx} className={`min-w-[130px] border font-bold py-2 px-2 text-center ${isLight ? "border-slate-300" : "border-gray-800"}`}>
                          {COL_LETTERS[cIdx]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: activeTab.rows }).map((_, rIdx) => (
                      <tr key={rIdx}>
                        <td className={`border font-mono text-center py-1.5 ${isLight ? "border-slate-300 bg-slate-100 text-slate-500" : "border-gray-800 bg-[#0c111b] text-gray-500"}`}>
                          {rIdx + 1}
                        </td>
                        {Array.from({ length: activeTab.cols }).map((__, cIdx) => {
                          const id = cellId(cIdx, rIdx);
                          const isSelected = selectedCell === id;
                          const inRange = selectedRangeCells.has(id);
                          const isEditing = editingCell === id;
                          const rawVal = activeTab.cells[id] || "";
                          const evaluated = evaluateCell(id, activeTab.cells);
                          const fmt = activeTab.formats?.[id];
                          const displayVal = isEditing ? rawVal : formatDisplay(evaluated, fmt);
                          const isFormula = rawVal.startsWith("=");

                          return (
                            <td
                              key={id}
                              onMouseDown={() => {
                                setIsDragging(true);
                                handleSelectCell(id);
                              }}
                              onMouseEnter={() => {
                                if (isDragging) setRangeEnd(id);
                              }}
                              className={`border p-0 ${isLight ? "border-slate-300 bg-white" : "border-gray-800"} ${BG_MAP[fmt?.bg || "none"]} ${
                                isSelected
                                  ? "ring-2 ring-emerald-500 z-10 relative"
                                  : inRange
                                  ? isLight
                                    ? "bg-emerald-50/80"
                                    : "bg-emerald-500/10"
                                  : ""
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
                                  fmt?.bold ? "font-bold" : ""
                                } ${fmt?.italic ? "italic" : ""} ${
                                  fmt?.align === "right" ? "text-right" : fmt?.align === "center" ? "text-center" : "text-left"
                                } ${
                                  isFormula
                                    ? isLight
                                      ? "text-emerald-700 font-mono"
                                      : "text-emerald-300 font-mono"
                                    : isLight
                                    ? "text-slate-900"
                                    : "text-gray-200"
                                }`}
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

            {showChart && chartData.length > 0 && (
              <div className={`h-56 border-t p-4 ${isLight ? "bg-white border-slate-200" : "bg-[#0c111b] border-gray-800"}`}>
                <div className="text-xs font-bold mb-2 flex items-center gap-2">
                  <BarChart3 size={14} className="text-emerald-500" />
                  <span>Live Sheet Chart (Column A vs Column B)</span>
                </div>
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "#e2e8f0" : "#1f2937"} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: isLight ? "#475569" : "#9ca3af" }} />
                    <YAxis tick={{ fontSize: 11, fill: isLight ? "#475569" : "#9ca3af" }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Bottom Tabs + Live Range Stats */}
          {activeWorkbook && (
            <div className={`border-t px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs ${isLight ? "bg-white border-slate-200 text-slate-600" : "bg-[#0c111b] border-gray-800 text-gray-400"}`}>
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {activeWorkbook.tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      persistWorkbooks(
                        workbooks.map((w) => (w.id === activeWorkbook.id ? { ...w, activeTabId: tab.id } : w)),
                        false
                      );
                      handleSelectCell("A1");
                      setFormulaInput(tab.cells["A1"] || "");
                    }}
                    className={`px-3 py-1 rounded-lg font-semibold cursor-pointer ${
                      activeTab?.id === tab.id
                        ? "bg-emerald-600 text-white"
                        : isLight
                        ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        : "bg-white/5 text-gray-400 hover:text-white"
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
                <button onClick={addSheetTab} className="px-2 py-1 rounded-lg text-emerald-500 font-bold flex items-center gap-1 cursor-pointer">
                  <Plus size={13} /> Sheet
                </button>
              </div>

              <div className="flex items-center gap-4 text-[11px] font-mono">
                <span>Count: <strong className={isLight ? "text-slate-900" : "text-white"}>{rangeStats.count}</strong></span>
                <span>Avg: <strong className="text-cyan-500">{rangeStats.avg}</strong></span>
                <span>Sum: <strong className="text-emerald-500">{rangeStats.sum}</strong></span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
