"use client";

import { useState, useEffect, useMemo } from "react";
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
  TrendingUp
} from "lucide-react";

type SheetCellMap = Record<string, string>;

type SheetWorkbook = {
  id: string;
  name: string;
  updatedAt: string;
  rows: number;
  cols: number;
  cells: SheetCellMap;
};

const COL_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const TEMPLATES: Record<string, { name: string; rows: number; cols: number; cells: SheetCellMap }> = {
  blank: {
    name: "Untitled Spreadsheet",
    rows: 20,
    cols: 10,
    cells: {},
  },
  pnl: {
    name: "Monthly P&L Budget",
    rows: 16,
    cols: 8,
    cells: {
      A1: "Category",
      B1: "Jan ($)",
      C1: "Feb ($)",
      D1: "Mar ($)",
      E1: "Q1 Total ($)",
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
  },
  sales: {
    name: "Sales Pipeline Forecast",
    rows: 16,
    cols: 8,
    cells: {
      A1: "Account",
      B1: "Deal Value ($)",
      C1: "Win Prob (%)",
      D1: "Weighted ($)",
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
  },
  inventory: {
    name: "Inventory Valuation Sheet",
    rows: 16,
    cols: 8,
    cells: {
      A1: "SKU",
      B1: "Item Name",
      C1: "Qty On Hand",
      D1: "Unit Cost ($)",
      E1: "Total Value ($)",
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
  const rMin = Math.min(start.row, end.row);
  const rMax = Math.max(start.row, end.row);
  const cMin = Math.min(start.col, end.col);
  const cMax = Math.max(start.col, end.col);
  for (let r = rMin; r <= rMax; r++) {
    for (let c = cMin; c <= cMax; c++) {
      refs.push(cellId(c, r));
    }
  }
  return refs;
}

function evaluateCell(
  id: string,
  cells: SheetCellMap,
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

    // Arithmetic evaluation with cell references (e.g. =B4-B9 or =B2*C2)
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

export default function SpreadsheetsPage() {
  const { activeBranch, getEntityStorageKey } = useBranchContext();
  const [workbooks, setWorkbooks] = useState<SheetWorkbook[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [selectedCell, setSelectedCell] = useState<string>("A1");
  const [formulaInput, setFormulaInput] = useState<string>("");
  const [copiedNotice, setCopiedNotice] = useState(false);

  useEffect(() => {
    if (!activeBranch) return;
    const key = getEntityStorageKey("beraxis_spreadsheets");
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed: SheetWorkbook[] = JSON.parse(saved);
        if (parsed.length > 0) {
          setWorkbooks(parsed);
          setActiveId(parsed[0].id);
          setFormulaInput(parsed[0].cells["A1"] || "");
          return;
        }
      } catch {}
    }
    const defaultWb: SheetWorkbook = {
      id: "wb-pnl-default",
      name: TEMPLATES.pnl.name,
      updatedAt: new Date().toISOString().split("T")[0],
      rows: TEMPLATES.pnl.rows,
      cols: TEMPLATES.pnl.cols,
      cells: { ...TEMPLATES.pnl.cells },
    };
    setWorkbooks([defaultWb]);
    setActiveId(defaultWb.id);
    setFormulaInput(defaultWb.cells["A1"] || "");
  }, [activeBranch?.id]);

  const persistWorkbooks = (updated: SheetWorkbook[]) => {
    setWorkbooks(updated);
    try {
      const key = getEntityStorageKey("beraxis_spreadsheets");
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}
  };

  const activeWorkbook = useMemo(
    () => workbooks.find((w) => w.id === activeId) || workbooks[0] || null,
    [workbooks, activeId]
  );

  const handleSelectCell = (id: string) => {
    setSelectedCell(id);
    setFormulaInput(activeWorkbook?.cells[id] || "");
  };

  const updateCellValue = (id: string, value: string) => {
    if (!activeWorkbook) return;
    const updatedCells = { ...activeWorkbook.cells };
    if (value === "") {
      delete updatedCells[id];
    } else {
      updatedCells[id] = value;
    }
    const updated = workbooks.map((wb) =>
      wb.id === activeWorkbook.id
        ? { ...wb, cells: updatedCells, updatedAt: new Date().toISOString().split("T")[0] }
        : wb
    );
    persistWorkbooks(updated);
  };

  const createFromTemplate = (tplKey: keyof typeof TEMPLATES) => {
    const tpl = TEMPLATES[tplKey];
    const newWb: SheetWorkbook = {
      id: `wb-${Date.now()}`,
      name: tpl.name,
      updatedAt: new Date().toISOString().split("T")[0],
      rows: tpl.rows,
      cols: tpl.cols,
      cells: { ...tpl.cells },
    };
    const updated = [newWb, ...workbooks];
    persistWorkbooks(updated);
    setActiveId(newWb.id);
    setSelectedCell("A1");
    setFormulaInput(newWb.cells["A1"] || "");
  };

  const deleteWorkbook = (id: string) => {
    if (workbooks.length <= 1) return;
    const updated = workbooks.filter((w) => w.id !== id);
    persistWorkbooks(updated);
    if (activeId === id) {
      setActiveId(updated[0].id);
      setSelectedCell("A1");
      setFormulaInput(updated[0].cells["A1"] || "");
    }
  };

  const addRows = () => {
    if (!activeWorkbook) return;
    const updated = workbooks.map((wb) =>
      wb.id === activeWorkbook.id ? { ...wb, rows: wb.rows + 5 } : wb
    );
    persistWorkbooks(updated);
  };

  const exportCsv = () => {
    if (!activeWorkbook) return;
    const lines: string[] = [];
    for (let r = 0; r < activeWorkbook.rows; r++) {
      const rowVals: string[] = [];
      for (let c = 0; c < activeWorkbook.cols; c++) {
        const val = evaluateCell(cellId(c, r), activeWorkbook.cells);
        const escaped = val.includes(",") || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
        rowVals.push(escaped);
      }
      lines.push(rowVals.join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeWorkbook.name.replace(/\s+/g, "_").toLowerCase()}.csv`;
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
      const newCells: SheetCellMap = {};
      let maxCols = 8;
      rows.forEach((line, rIdx) => {
        const cols = line.split(",").map((c) => c.replace(/^"|"$/g, "").trim());
        maxCols = Math.max(maxCols, Math.min(cols.length, 20));
        cols.slice(0, 20).forEach((val, cIdx) => {
          if (val !== "") newCells[cellId(cIdx, rIdx)] = val;
        });
      });
      const newWb: SheetWorkbook = {
        id: `wb-${Date.now()}`,
        name: file.name.replace(/\.(csv|xlsx)$/i, ""),
        updatedAt: new Date().toISOString().split("T")[0],
        rows: Math.max(16, rows.length + 4),
        cols: maxCols,
        cells: newCells,
      };
      const updated = [newWb, ...workbooks];
      persistWorkbooks(updated);
      setActiveId(newWb.id);
      setSelectedCell("A1");
      setFormulaInput(newWb.cells["A1"] || "");
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const copySummary = () => {
    if (!activeWorkbook) return;
    navigator.clipboard.writeText(`${selectedCell}: ${evaluateCell(selectedCell, activeWorkbook.cells)}`);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 1800);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0d14] text-white">
      <AppHeader title="BERAXIS Sheets — Built-In Excel Alternative" />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Workbooks & Templates */}
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
                  title="New Blank Sheet"
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
                      setSelectedCell("A1");
                      setFormulaInput(wb.cells["A1"] || "");
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
                        title="Delete sheet"
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
              Supports <code className="text-emerald-300">=SUM()</code>,{" "}
              <code className="text-emerald-300">=AVERAGE()</code>,{" "}
              <code className="text-emerald-300">=MIN()</code>,{" "}
              <code className="text-emerald-300">=MAX()</code>, and CSV import/export.
            </p>
          </div>
        </aside>

        {/* Main Grid Workspace */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#070a11]">
          {/* Toolbar & Formula Bar */}
          <div className="border-b border-gray-800 bg-[#0c111b] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[260px]">
              <input
                type="text"
                value={activeWorkbook?.name || ""}
                onChange={(e) => {
                  if (!activeWorkbook) return;
                  const updated = workbooks.map((w) =>
                    w.id === activeWorkbook.id ? { ...w, name: e.target.value } : w
                  );
                  persistWorkbooks(updated);
                }}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-emerald-500 w-52"
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

            <div className="flex items-center gap-2">
              <button
                onClick={copySummary}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                {copiedNotice ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{copiedNotice ? "Copied" : "Copy Cell"}</span>
              </button>
              <button
                onClick={addRows}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={13} /> <span>+5 Rows</span>
              </button>
              <label className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                <Upload size={13} className="text-cyan-400" />
                <span>Import CSV</span>
                <input type="file" accept=".csv" onChange={handleImportCsv} className="hidden" />
              </label>
              <button
                onClick={exportCsv}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 cursor-pointer"
              >
                <Download size={13} /> <span>Export Excel / CSV</span>
              </button>
            </div>
          </div>

          {/* Spreadsheet Table */}
          {activeWorkbook && (
            <div className="flex-1 overflow-auto">
              <table className="border-collapse w-full text-xs">
                <thead className="sticky top-0 z-10 bg-[#101624]">
                  <tr>
                    <th className="w-12 min-w-[48px] border border-gray-800 bg-[#0c111b] text-gray-500 font-mono py-2">
                      #
                    </th>
                    {Array.from({ length: activeWorkbook.cols }).map((_, cIdx) => (
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
                  {Array.from({ length: activeWorkbook.rows }).map((_, rIdx) => (
                    <tr key={rIdx} className="hover:bg-white/[0.02]">
                      <td className="border border-gray-800 bg-[#0c111b] text-gray-500 font-mono text-center py-1.5 select-none">
                        {rIdx + 1}
                      </td>
                      {Array.from({ length: activeWorkbook.cols }).map((__, cIdx) => {
                        const id = cellId(cIdx, rIdx);
                        const isSelected = selectedCell === id;
                        const rawVal = activeWorkbook.cells[id] || "";
                        const displayVal = isSelected
                          ? rawVal
                          : evaluateCell(id, activeWorkbook.cells);
                        const isFormula = rawVal.startsWith("=");
                        const isHeaderRow = rIdx === 0 && rawVal !== "";

                        return (
                          <td
                            key={id}
                            className={`border border-gray-800 p-0 ${
                              isSelected ? "ring-2 ring-emerald-400 z-10 relative" : ""
                            } ${isHeaderRow ? "bg-white/[0.04]" : ""}`}
                          >
                            <input
                              type="text"
                              value={displayVal}
                              onFocus={() => handleSelectCell(id)}
                              onChange={(e) => {
                                setFormulaInput(e.target.value);
                                updateCellValue(id, e.target.value);
                              }}
                              className={`w-full h-8 px-2.5 bg-transparent focus:outline-none text-xs ${
                                isHeaderRow
                                  ? "font-bold text-white"
                                  : isFormula
                                  ? "text-emerald-300 font-mono font-semibold"
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
        </main>
      </div>
    </div>
  );
}
