"use client";

import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { BarChart3 } from "lucide-react";
import { COL_LETTERS, cellId, evaluateCell } from "@/lib/office/formulaEngine";

type ChartType = "bar" | "line" | "area" | "pie";

const PIE_COLORS = ["#10b981", "#6366f1", "#f59e0b", "#06b6d4", "#ec4899", "#8b5cf6"];

export default function SheetChartPanel({
  rows,
  cols,
  cells,
  isLight,
}: {
  rows: number;
  cols: number;
  cells: Record<string, string>;
  isLight: boolean;
}) {
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [labelCol, setLabelCol] = useState<number>(0);
  const [valueCol, setValueCol] = useState<number>(1);

  const data = useMemo(() => {
    const out: { name: string; value: number }[] = [];
    for (let r = 1; r < Math.min(rows, 20); r++) {
      const label = evaluateCell(cellId(labelCol, r), cells);
      const valStr = evaluateCell(cellId(valueCol, r), cells);
      const num = Number(valStr);
      if (label && valStr !== "" && Number.isFinite(num)) {
        out.push({ name: label.slice(0, 18), value: num });
      }
    }
    return out;
  }, [rows, cells, labelCol, valueCol]);

  const axisColor = isLight ? "#475569" : "#9ca3af";
  const gridColor = isLight ? "#e2e8f0" : "#1f2937";

  return (
    <div className={`h-64 border-t p-4 flex flex-col ${isLight ? "bg-white border-slate-200" : "bg-[#0c111b] border-gray-800"}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
        <div className="font-bold flex items-center gap-2">
          <BarChart3 size={14} className="text-emerald-500" />
          <span>Interactive Sheet Chart</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={labelCol}
            onChange={(e) => setLabelCol(Number(e.target.value))}
            className={`px-2 py-1 rounded border text-[11px] ${isLight ? "bg-slate-50 border-slate-300" : "bg-[#111827] border-gray-700"}`}
          >
            {Array.from({ length: Math.min(cols, 12) }).map((_, i) => (
              <option key={i} value={i}>
                Labels: Col {COL_LETTERS[i]}
              </option>
            ))}
          </select>

          <select
            value={valueCol}
            onChange={(e) => setValueCol(Number(e.target.value))}
            className={`px-2 py-1 rounded border text-[11px] ${isLight ? "bg-slate-50 border-slate-300" : "bg-[#111827] border-gray-700"}`}
          >
            {Array.from({ length: Math.min(cols, 12) }).map((_, i) => (
              <option key={i} value={i}>
                Values: Col {COL_LETTERS[i]}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1">
            {(["bar", "line", "area", "pie"] as ChartType[]).map((t) => (
              <button
                key={t}
                onClick={() => setChartType(t)}
                className={`px-2 py-1 rounded text-[11px] font-bold uppercase cursor-pointer ${
                  chartType === t
                    ? "bg-emerald-600 text-white"
                    : isLight
                    ? "bg-slate-100 text-slate-700"
                    : "bg-white/5 text-gray-300"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-gray-400">
            No numeric pairs found in Col {COL_LETTERS[labelCol]} / Col {COL_LETTERS[valueCol]} (starting Row 2).
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "bar" ? (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: axisColor }} />
                <YAxis tick={{ fontSize: 11, fill: axisColor }} />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : chartType === "line" ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: axisColor }} />
                <YAxis tick={{ fontSize: 11, fill: axisColor }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2.5} />
              </LineChart>
            ) : chartType === "area" ? (
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: axisColor }} />
                <YAxis tick={{ fontSize: 11, fill: axisColor }} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.25} />
              </AreaChart>
            ) : (
              <PieChart>
                <Tooltip />
                <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label>
                  {data.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
