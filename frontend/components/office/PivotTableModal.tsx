"use client";

import { useState } from "react";
import { X, Table } from "lucide-react";
import { COL_LETTERS, cellId, evaluateCell } from "@/lib/office/formulaEngine";

type AggType = "SUM" | "AVERAGE" | "COUNT" | "MIN" | "MAX";

export default function PivotTableModal({
  isOpen,
  onClose,
  rows,
  cols,
  cells,
  onCreatePivotTab,
}: {
  isOpen: boolean;
  onClose: () => void;
  rows: number;
  cols: number;
  cells: Record<string, string>;
  onCreatePivotTab: (title: string, newCells: Record<string, string>) => void;
}) {
  const [groupCol, setGroupCol] = useState(0);
  const [valCol, setValCol] = useState(1);
  const [agg, setAgg] = useState<AggType>("SUM");

  if (!isOpen) return null;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const groups = new Map<string, number[]>();

    for (let r = 1; r < rows; r++) {
      const key = evaluateCell(cellId(groupCol, r), cells).trim();
      const rawVal = evaluateCell(cellId(valCol, r), cells).trim();
      const num = Number(rawVal);
      if (!key) continue;
      if (!groups.has(key)) groups.set(key, []);
      if (rawVal !== "" && Number.isFinite(num)) {
        groups.get(key)!.push(num);
      } else if (agg === "COUNT") {
        groups.get(key)!.push(1);
      }
    }

    const groupHeader = evaluateCell(cellId(groupCol, 0), cells) || `Col ${COL_LETTERS[groupCol]}`;
    const valHeader = evaluateCell(cellId(valCol, 0), cells) || `Col ${COL_LETTERS[valCol]}`;

    const outCells: Record<string, string> = {
      A1: groupHeader,
      B1: `${agg} of ${valHeader}`,
    };

    let rowIdx = 1;
    groups.forEach((nums, key) => {
      let res = 0;
      if (agg === "COUNT") res = nums.length;
      else if (nums.length > 0) {
        if (agg === "SUM") res = nums.reduce((a, b) => a + b, 0);
        if (agg === "AVERAGE") res = nums.reduce((a, b) => a + b, 0) / nums.length;
        if (agg === "MIN") res = Math.min(...nums);
        if (agg === "MAX") res = Math.max(...nums);
      }
      outCells[cellId(0, rowIdx)] = key;
      outCells[cellId(1, rowIdx)] = String(Math.round(res * 100) / 100);
      rowIdx++;
    });

    if (rowIdx > 1) {
      outCells[cellId(0, rowIdx + 1)] = "Grand Total";
      outCells[cellId(1, rowIdx + 1)] = `=SUM(B2:B${rowIdx})`;
    }

    onCreatePivotTab(`Pivot (${groupHeader})`, outCells);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <form
        onSubmit={handleGenerate}
        className="bg-[#111622] border border-gray-700 text-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <h3 className="text-base font-bold flex items-center gap-2">
            <Table size={18} className="text-emerald-400" /> Create Pivot Table
          </h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-gray-300 block mb-1">Group Rows By</label>
            <select
              value={groupCol}
              onChange={(e) => setGroupCol(Number(e.target.value))}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white"
            >
              {Array.from({ length: Math.min(cols, 12) }).map((_, i) => (
                <option key={i} value={i}>
                  Col {COL_LETTERS[i]} ({evaluateCell(cellId(i, 0), cells) || "Empty"})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-gray-300 block mb-1">Summarize Value Column</label>
            <select
              value={valCol}
              onChange={(e) => setValCol(Number(e.target.value))}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white"
            >
              {Array.from({ length: Math.min(cols, 12) }).map((_, i) => (
                <option key={i} value={i}>
                  Col {COL_LETTERS[i]} ({evaluateCell(cellId(i, 0), cells) || "Empty"})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-gray-300 block mb-1">Aggregation</label>
            <select
              value={agg}
              onChange={(e) => setAgg(e.target.value as AggType)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white"
            >
              <option value="SUM">SUM</option>
              <option value="AVERAGE">AVERAGE</option>
              <option value="COUNT">COUNT</option>
              <option value="MIN">MIN</option>
              <option value="MAX">MAX</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-800 rounded-lg text-xs font-bold">
            Cancel
          </button>
          <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-bold cursor-pointer">
            Generate Pivot Tab
          </button>
        </div>
      </form>
    </div>
  );
}
