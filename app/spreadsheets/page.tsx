"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import * as XLSX from "xlsx";
import AppHeader from "@/components/layout/AppHeader";
import { useBranchContext } from "@/lib/branchContext";
import {
  COL_LETTERS,
  cellId,
  parseCellRef,
  evaluateCell
} from "@/lib/office/formulaEngine";
import SheetChartPanel from "@/components/office/SheetChartPanel";
import PivotTableModal from "@/components/office/PivotTableModal";
import { generateOfficeSheet } from "@/lib/office/aiOfficeGenerator";
import {
  FileSpreadsheet,
  Plus,
  Download,
  Upload,
  Trash2,
  Sparkles,
  Calculator,
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
  BarChart3,
  ArrowUpDown,
  Search,
  Lock,
  SlidersHorizontal
} from "lucide-react";

type CellFormat = {
  bold?: boolean;
  italic?: boolean;
  align?: "left" | "center" | "right";
  numFormat?: "auto" | "currency" | "percent";
  bg?: "none" | "emerald" | "purple" | "amber" | "blue";
};

type ConditionalRule = "none" | "pos_neg" | "gt_10000" | "lt_0";

type SheetTab = {
  id: string;
  name: string;
  rows: number;
  cols: number;
  cells: Record<string, string>;
  formats: Record<string, CellFormat>;
  colWidths?: Record<number, number>;
  freezeHeader?: boolean;
  condRule?: ConditionalRule;
};

type SheetWorkbook = {
  id: string;
  name: string;
  updatedAt: string;
  activeTabId: string;
  tabs: SheetTab[];
};

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
    tabs: [{ id: "tab-1", name: "Sheet 1", rows: 22, cols: 10, cells: {}, formats: {}, freezeHeader: true }],
  },
  pnl: {
    name: "Monthly P&L Budget",
    tabs: [
      {
        id: "tab-pnl",
        name: "Q1 P&L",
        rows: 18,
        cols: 8,
        freezeHeader: true,
        condRule: "none",
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
        freezeHeader: true,
        cells: {
          A1: "Region",
          B1: "Deal Value",
          C1: "Win Prob",
          D1: "Weighted Forecast",
          A2: "North America",
          B2: "24000",
          C2: "0.75",
          D2: "=B2*C2",
          A3: "Europe",
          B3: "18500",
          C3: "0.60",
          D3: "=B3*C3",
          A4: "North America",
          B4: "12000",
          C4: "0.90",
          D4: "=B4*C4",
          A5: "Middle East",
          B5: "31000",
          C5: "0.45",
          D5: "=B5*C5",
          A7: "Total Pipeline",
          B7: "=SUM(B2:B5)",
          D7: "=SUM(D2:D5)",
          A8: "NA Pipeline (SUMIF)",
          B8: "=SUMIF(A2:A5, North America, B2:B5)",
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
          B8: { bold: true, align: "right", numFormat: "currency" },
        },
      },
    ],
  },
};

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
  const [undoStack, setUndoStack] = useState<SheetWorkbook[][]>([]);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [showChart, setShowChart] = useState<boolean>(false);
  const [isPivotOpen, setIsPivotOpen] = useState<boolean>(false);
  const [showFindBar, setShowFindBar] = useState<boolean>(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
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

  const addSheetTab = (customTitle?: string, customCells?: Record<string, string>) => {
    if (!activeWorkbook) return;
    const newTab: SheetTab = {
      id: `tab-${Date.now()}`,
      name: customTitle || `Sheet ${activeWorkbook.tabs.length + 1}`,
      rows: 20,
      cols: 10,
      cells: customCells || {},
      formats: customCells
        ? { A1: { bold: true, bg: "emerald" }, B1: { bold: true, align: "right", bg: "emerald" } }
        : {},
      freezeHeader: true,
    };
    persistWorkbooks(
      workbooks.map((wb) =>
        wb.id === activeWorkbook.id ? { ...wb, activeTabId: newTab.id, tabs: [...wb.tabs, newTab] } : wb
      )
    );
    handleSelectCell("A1");
    setFormulaInput(newTab.cells["A1"] || "");
  };

  const handleSortActiveColumn = () => {
    if (!activeTab) return;
    const colIdx = parseCellRef(selectedCell)?.col || 0;
    const dataRows: Record<number, string>[] = [];
    for (let r = 1; r < activeTab.rows; r++) {
      const rowObj: Record<number, string> = {};
      let hasVal = false;
      for (let c = 0; c < activeTab.cols; c++) {
        const v = activeTab.cells[cellId(c, r)] || "";
        if (v !== "") hasVal = true;
        rowObj[c] = v;
      }
      if (hasVal) dataRows.push(rowObj);
    }
    dataRows.sort((a, b) => {
      const av = a[colIdx] || "";
      const bv = b[colIdx] || "";
      const an = Number(av);
      const bn = Number(bv);
      if (av !== "" && bv !== "" && Number.isFinite(an) && Number.isFinite(bn)) {
        return sortAsc ? an - bn : bn - an;
      }
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    updateActiveTab((tab) => {
      const nextCells: Record<string, string> = {};
      for (let c = 0; c < tab.cols; c++) {
        const hdr = tab.cells[cellId(c, 0)];
        if (hdr) nextCells[cellId(c, 0)] = hdr;
      }
      dataRows.forEach((rowObj, idx) => {
        for (let c = 0; c < tab.cols; c++) {
          if (rowObj[c]) nextCells[cellId(c, idx + 1)] = rowObj[c];
        }
      });
      return { ...tab, cells: nextCells };
    });
    setSortAsc(!sortAsc);
  };

  const handleFindReplaceAll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!findText) return;
    updateActiveTab((tab) => {
      const nextCells = { ...tab.cells };
      Object.keys(nextCells).forEach((k) => {
        if (nextCells[k].includes(findText)) {
          nextCells[k] = nextCells[k].split(findText).join(replaceText);
        }
      });
      return { ...tab, cells: nextCells };
    });
  };

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
          freezeHeader: true,
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

  const getConditionalBg = (evaluated: string, rule?: ConditionalRule) => {
    if (!rule || rule === "none" || evaluated === "") return "";
    const num = Number(evaluated);
    if (!Number.isFinite(num)) return "";
    if (rule === "pos_neg") {
      return num > 0 ? (isLight ? "bg-emerald-100/80" : "bg-emerald-500/15") : num < 0 ? (isLight ? "bg-rose-100/80" : "bg-rose-500/20") : "";
    }
    if (rule === "gt_10000" && num > 10000) return isLight ? "bg-emerald-100" : "bg-emerald-500/20";
    if (rule === "lt_0" && num < 0) return isLight ? "bg-rose-100" : "bg-rose-500/20";
    return "";
  };

  return (
    <div className={`flex flex-col h-screen ${isLight ? "bg-slate-100 text-slate-900" : "bg-[#0a0d14] text-white"}`}>
      <AppHeader title="BERAXIS Sheets — Full Excel Studio (.XLSX, Pivot & Lookup)" />

      <div className="flex-1 flex overflow-hidden">
        <aside className={`w-64 border-r p-4 flex flex-col justify-between shrink-0 overflow-y-auto ${isLight ? "bg-white border-slate-200" : "bg-[#0e121c] border-gray-800"}`}>
          <div className="space-y-5">
            <div>
              <div className={`flex items-center justify-between pb-2 border-b mb-3 ${isLight ? "border-slate-200" : "border-gray-800"}`}>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Workbooks ({workbooks.length})</span>
                <button onClick={() => createFromTemplate("blank")} className="text-emerald-500 p-1 rounded cursor-pointer"><Plus size={16} /></button>
              </div>
              <div className="space-y-1.5">
                {workbooks.map((wb) => (
                  <div
                    key={wb.id}
                    className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
                      activeWorkbook?.id === wb.id
                        ? isLight ? "bg-emerald-50 text-emerald-700 border border-emerald-300" : "bg-emerald-600/20 text-emerald-300 border border-emerald-500/40"
                        : isLight ? "text-slate-600 hover:bg-slate-100" : "text-gray-400 hover:bg-gray-800/60"
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
                      <button onClick={(e) => { e.stopPropagation(); persistWorkbooks(workbooks.filter((w) => w.id !== wb.id)); }} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-0.5">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-2">Templates</span>
              <div className="space-y-1.5">
                <button onClick={() => createFromTemplate("pnl")} className={`w-full text-left px-3 py-2 rounded-xl border text-xs flex items-center gap-2 cursor-pointer ${isLight ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-white/5 border-white/10 text-gray-300"}`}>
                  <TrendingUp size={13} className="text-emerald-500" /> <span>Monthly P&amp;L Budget</span>
                </button>
                <button onClick={() => createFromTemplate("sales")} className={`w-full text-left px-3 py-2 rounded-xl border text-xs flex items-center gap-2 cursor-pointer ${isLight ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-white/5 border-white/10 text-gray-300"}`}>
                  <Calculator size={13} className="text-cyan-500" /> <span>Sales Pipeline (SUMIF)</span>
                </button>
              </div>
            </div>
          </div>

          <div className={`p-3 rounded-xl border text-[11px] space-y-1 ${isLight ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-200"}`}>
            <div className="font-bold flex items-center gap-1.5"><Sparkles size={13} className="text-emerald-500" /> Full Excel Formulas</div>
            <p className={isLight ? "text-slate-600" : "text-gray-400"}>
              Supports `VLOOKUP`, `XLOOKUP`, `SUMIF`, `COUNTIF`, `IF`, `AND`, `OR`, Pivot Tables &amp; `.XLSX`.
            </p>
          </div>
        </aside>

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
                    persistWorkbooks(workbooks.map((w) => (w.id === activeWorkbook.id ? { ...w, name: e.target.value } : w)), false);
                  }}
                  className={`border rounded-lg px-3 py-1.5 text-sm font-bold w-40 focus:outline-none ${isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-white/5 border-white/10 text-white"}`}
                />
                <span className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs font-mono font-bold">
                  {selectedCell}
                </span>
                <input
                  type="text"
                  value={formulaInput}
                  placeholder="=SUM(B2:B5), =VLOOKUP(...), =SUMIF(...)"
                  onChange={(e) => {
                    setFormulaInput(e.target.value);
                    updateCellValue(selectedCell, e.target.value);
                  }}
                  className={`flex-1 border rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none ${isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-[#070a11] border-gray-700 text-gray-100"}`}
                />
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => {
                    const topic = window.prompt("What sheet should BERAXIS AI build? (e.g. Q2 Marketing Budget, Sales Tracker)");
                    if (!topic) return;
                    const gen = generateOfficeSheet(topic);
                    addSheetTab(gen.title, gen.cells);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles size={13} /> <span>AI Sheet</span>
                </button>
                <button onClick={toggleTheme} className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 cursor-pointer ${isLight ? "bg-slate-100 border-slate-300" : "bg-white/5 border-white/10"}`}>
                  {isLight ? <Moon size={13} /> : <Sun size={13} className="text-amber-400" />}
                  <span>{isLight ? "Dark" : "Light"}</span>
                </button>
                <button onClick={() => setIsPivotOpen(true)} className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer">
                  <Table size={13} /> <span>Pivot Table</span>
                </button>
                <button onClick={() => setShowChart(!showChart)} className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 cursor-pointer ${showChart ? "bg-purple-600 text-white border-purple-500" : isLight ? "bg-slate-100 border-slate-300" : "bg-white/5 border-white/10"}`}>
                  <BarChart3 size={13} /> <span>Chart</span>
                </button>
                <button onClick={handleUndo} disabled={undoStack.length === 0} className={`px-2 py-1.5 rounded-lg border text-xs disabled:opacity-30 cursor-pointer ${isLight ? "border-slate-300" : "border-white/10"}`} title="Undo">
                  <Undo2 size={13} />
                </button>
                <label className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer ${isLight ? "bg-slate-100 border-slate-300" : "bg-white/5 border-white/10"}`}>
                  <Upload size={13} className="text-cyan-500" />
                  <span>Import .XLSX</span>
                  <input type="file" accept=".xlsx,.xls,.csv" onChange={handleImportSpreadsheet} className="hidden" />
                </label>
                <button onClick={exportXlsx} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                  <Download size={13} /> <span>Export .XLSX</span>
                </button>
              </div>
            </div>

            {/* Formatting & Data Tools Bar */}
            <div className={`flex flex-wrap items-center gap-1.5 text-xs pt-1 border-t ${isLight ? "border-slate-200" : "border-white/5"}`}>
              <button onClick={() => toggleFormat({ bold: !activeFormat.bold })} className={`p-1.5 rounded cursor-pointer ${activeFormat.bold ? "bg-emerald-600 text-white" : "hover:bg-emerald-500/20"}`}><Bold size={13} /></button>
              <button onClick={() => toggleFormat({ italic: !activeFormat.italic })} className={`p-1.5 rounded cursor-pointer ${activeFormat.italic ? "bg-emerald-600 text-white" : "hover:bg-emerald-500/20"}`}><Italic size={13} /></button>
              <button onClick={() => toggleFormat({ align: "left" })} className={`p-1.5 rounded cursor-pointer ${activeFormat.align === "left" ? "bg-emerald-600 text-white" : "hover:bg-emerald-500/20"}`}><AlignLeft size={13} /></button>
              <button onClick={() => toggleFormat({ align: "center" })} className={`p-1.5 rounded cursor-pointer ${activeFormat.align === "center" ? "bg-emerald-600 text-white" : "hover:bg-emerald-500/20"}`}><AlignCenter size={13} /></button>
              <button onClick={() => toggleFormat({ align: "right" })} className={`p-1.5 rounded cursor-pointer ${activeFormat.align === "right" ? "bg-emerald-600 text-white" : "hover:bg-emerald-500/20"}`}><AlignRight size={13} /></button>
              <button onClick={() => toggleFormat({ numFormat: activeFormat.numFormat === "currency" ? "auto" : "currency" })} className={`px-2 py-1 rounded font-bold cursor-pointer ${activeFormat.numFormat === "currency" ? "bg-emerald-600 text-white" : "hover:bg-emerald-500/20"}`}><DollarSign size={12} /></button>
              <button onClick={() => toggleFormat({ numFormat: activeFormat.numFormat === "percent" ? "auto" : "percent" })} className={`px-2 py-1 rounded font-bold cursor-pointer ${activeFormat.numFormat === "percent" ? "bg-emerald-600 text-white" : "hover:bg-emerald-500/20"}`}><Percent size={12} /></button>
              <span className="w-px h-4 bg-gray-500/30 mx-1" />
              {(["none", "emerald", "purple", "amber", "blue"] as const).map((color) => (
                <button key={color} onClick={() => toggleFormat({ bg: color })} className={`w-4 h-4 rounded-full border cursor-pointer ${color === "none" ? "bg-transparent border-gray-400" : color === "emerald" ? "bg-emerald-500" : color === "purple" ? "bg-purple-500" : color === "amber" ? "bg-amber-500" : "bg-blue-500"}`} />
              ))}
              <span className="w-px h-4 bg-gray-500/30 mx-1" />
              <button onClick={handleSortActiveColumn} className={`px-2 py-1 rounded border text-[11px] font-semibold flex items-center gap-1 cursor-pointer ${isLight ? "border-slate-300" : "border-white/10"}`} title="Sort Active Column">
                <ArrowUpDown size={12} /> Sort {sortAsc ? "A-Z" : "Z-A"}
              </button>
              <button onClick={() => updateActiveTab((t) => ({ ...t, freezeHeader: !t.freezeHeader }), false)} className={`px-2 py-1 rounded border text-[11px] font-semibold flex items-center gap-1 cursor-pointer ${activeTab?.freezeHeader ? "bg-emerald-600/20 text-emerald-500 border-emerald-500/40" : isLight ? "border-slate-300" : "border-white/10"}`}>
                <Lock size={11} /> Freeze Row 1
              </button>
              <div className="flex items-center gap-1">
                <SlidersHorizontal size={12} className="text-gray-400" />
                <select
                  value={activeTab?.condRule || "none"}
                  onChange={(e) => updateActiveTab((t) => ({ ...t, condRule: e.target.value as ConditionalRule }), false)}
                  className={`px-2 py-1 rounded border text-[11px] ${isLight ? "bg-slate-50 border-slate-300" : "bg-[#111827] border-gray-700"}`}
                >
                  <option value="none">Cond. Format: Off</option>
                  <option value="pos_neg">Pos (Green) / Neg (Red)</option>
                  <option value="gt_10000">Highlight &gt; 10,000</option>
                  <option value="lt_0">Highlight &lt; 0</option>
                </select>
              </div>
              <button onClick={() => setShowFindBar(!showFindBar)} className={`px-2 py-1 rounded border text-[11px] font-semibold flex items-center gap-1 cursor-pointer ${showFindBar ? "bg-cyan-600 text-white" : isLight ? "border-slate-300" : "border-white/10"}`}>
                <Search size={11} /> Find/Replace
              </button>
              <button onClick={() => updateActiveTab((tab) => ({ ...tab, rows: tab.rows + 5 }))} className="ml-auto px-2 py-1 rounded bg-emerald-600/15 text-emerald-500 font-bold flex items-center gap-1 cursor-pointer">
                <Plus size={12} /> +5 Rows
              </button>
            </div>

            {showFindBar && (
              <form onSubmit={handleFindReplaceAll} className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-700/30 text-xs">
                <input type="text" placeholder="Find text..." value={findText} onChange={(e) => setFindText(e.target.value)} className={`px-2.5 py-1 rounded border ${isLight ? "bg-slate-50 border-slate-300" : "bg-[#070a11] border-gray-700"}`} />
                <input type="text" placeholder="Replace with..." value={replaceText} onChange={(e) => setReplaceText(e.target.value)} className={`px-2.5 py-1 rounded border ${isLight ? "bg-slate-50 border-slate-300" : "bg-[#070a11] border-gray-700"}`} />
                <button type="submit" className="px-3 py-1 rounded bg-cyan-600 text-white font-bold cursor-pointer">Replace All</button>
              </form>
            )}
          </div>

          {/* Grid + Chart */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {activeTab && (
              <div className="flex-1 overflow-auto">
                <table className="border-collapse w-full text-xs select-none">
                  <thead className={`sticky top-0 z-20 ${isLight ? "bg-slate-200 text-slate-700" : "bg-[#101624] text-gray-300"}`}>
                    <tr>
                      <th className={`w-12 min-w-[48px] border font-mono py-2 ${isLight ? "border-slate-300 bg-slate-200" : "border-gray-800 bg-[#0c111b] text-gray-500"}`}>#</th>
                      {Array.from({ length: activeTab.cols }).map((_, cIdx) => (
                        <th key={cIdx} className={`min-w-[130px] border font-bold py-2 px-2 text-center ${isLight ? "border-slate-300" : "border-gray-800"}`}>
                          {COL_LETTERS[cIdx]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: activeTab.rows }).map((_, rIdx) => (
                      <tr key={rIdx} className={rIdx === 0 && activeTab.freezeHeader ? `sticky top-[33px] z-10 ${isLight ? "bg-slate-100" : "bg-[#0e1422]"}` : ""}>
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
                          const condBg = getConditionalBg(evaluated, activeTab.condRule);

                          return (
                            <td
                              key={id}
                              onMouseDown={() => { setIsDragging(true); handleSelectCell(id); }}
                              onMouseEnter={() => { if (isDragging) setRangeEnd(id); }}
                              className={`border p-0 ${isLight ? "border-slate-300 bg-white" : "border-gray-800"} ${condBg || BG_MAP[fmt?.bg || "none"]} ${
                                isSelected ? "ring-2 ring-emerald-500 z-10 relative" : inRange ? (isLight ? "bg-emerald-50/80" : "bg-emerald-500/10") : ""
                              }`}
                            >
                              <input
                                ref={(el) => { cellInputRefs.current[id] = el; }}
                                type="text"
                                value={displayVal}
                                onFocus={() => { setEditingCell(id); handleSelectCell(id); }}
                                onBlur={() => setEditingCell(null)}
                                onKeyDown={(e) => handleCellKeyDown(e, rIdx, cIdx)}
                                onChange={(e) => { setFormulaInput(e.target.value); updateCellValue(id, e.target.value); }}
                                className={`w-full h-8 px-2.5 bg-transparent focus:outline-none text-xs ${fmt?.bold ? "font-bold" : ""} ${fmt?.italic ? "italic" : ""} ${
                                  fmt?.align === "right" ? "text-right" : fmt?.align === "center" ? "text-center" : "text-left"
                                } ${isFormula ? (isLight ? "text-emerald-700 font-mono" : "text-emerald-300 font-mono") : isLight ? "text-slate-900" : "text-gray-200"}`}
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

            {showChart && activeTab && (
              <SheetChartPanel rows={activeTab.rows} cols={activeTab.cols} cells={activeTab.cells} isLight={isLight} />
            )}
          </div>

          {activeWorkbook && (
            <div className={`border-t px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs ${isLight ? "bg-white border-slate-200 text-slate-600" : "bg-[#0c111b] border-gray-800 text-gray-400"}`}>
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {activeWorkbook.tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      persistWorkbooks(workbooks.map((w) => (w.id === activeWorkbook.id ? { ...w, activeTabId: tab.id } : w)), false);
                      handleSelectCell("A1");
                      setFormulaInput(tab.cells["A1"] || "");
                    }}
                    className={`px-3 py-1 rounded-lg font-semibold cursor-pointer ${
                      activeTab?.id === tab.id ? "bg-emerald-600 text-white" : isLight ? "bg-slate-100 text-slate-700" : "bg-white/5 text-gray-400"
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
                <button onClick={() => addSheetTab()} className="px-2 py-1 rounded-lg text-emerald-500 font-bold flex items-center gap-1 cursor-pointer">
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

      {activeTab && (
        <PivotTableModal
          isOpen={isPivotOpen}
          onClose={() => setIsPivotOpen(false)}
          rows={activeTab.rows}
          cols={activeTab.cols}
          cells={activeTab.cells}
          onCreatePivotTab={(title, newCells) => addSheetTab(title, newCells)}
        />
      )}
    </div>
  );
}
