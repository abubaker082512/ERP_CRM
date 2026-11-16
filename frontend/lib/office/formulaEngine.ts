export const COL_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function cellId(colIdx: number, rowIdx: number): string {
  return `${COL_LETTERS[colIdx]}${rowIdx + 1}`;
}

export function parseCellRef(ref: string): { col: number; row: number } | null {
  const match = ref.trim().toUpperCase().match(/^([A-Z]+)(\d+)$/);
  if (!match) return null;
  const col = COL_LETTERS.indexOf(match[1]);
  const row = parseInt(match[2], 10) - 1;
  if (col < 0 || row < 0) return null;
  return { col, row };
}

export function getRangeBounds(rangeStr: string): {
  rMin: number;
  rMax: number;
  cMin: number;
  cMax: number;
} | null {
  const parts = rangeStr.split(":");
  if (parts.length !== 2) return null;
  const start = parseCellRef(parts[0]);
  const end = parseCellRef(parts[1]);
  if (!start || !end) return null;
  return {
    rMin: Math.min(start.row, end.row),
    rMax: Math.max(start.row, end.row),
    cMin: Math.min(start.col, end.col),
    cMax: Math.max(start.col, end.col),
  };
}

export function expandRange(rangeStr: string): string[] {
  const b = getRangeBounds(rangeStr);
  if (!b) return [];
  const refs: string[] = [];
  for (let r = b.rMin; r <= b.rMax; r++) {
    for (let c = b.cMin; c <= b.cMax; c++) {
      refs.push(cellId(c, r));
    }
  }
  return refs;
}

function stripQuotes(val: string): string {
  return val.trim().replace(/^["']|["']$/g, "");
}

function splitTopLevelArgs(argStr: string): string[] {
  const args: string[] = [];
  let current = "";
  let depth = 0;
  let inQuotes = false;
  for (let i = 0; i < argStr.length; i++) {
    const ch = argStr[i];
    if (ch === '"' || ch === "'") inQuotes = !inQuotes;
    if (!inQuotes) {
      if (ch === "(") depth++;
      if (ch === ")") depth--;
      if (ch === "," && depth === 0) {
        args.push(current.trim());
        current = "";
        continue;
      }
    }
    current += ch;
  }
  if (current.trim() !== "") args.push(current.trim());
  return args;
}

function matchesCriteria(cellVal: string, criteriaRaw: string): boolean {
  const crit = stripQuotes(criteriaRaw);
  const opMatch = crit.match(/^(>=|<=|!=|<>|>|<|=)(.+)$/);
  if (opMatch) {
    const op = opMatch[1];
    const targetStr = opMatch[2].trim();
    const numCell = Number(cellVal);
    const numTarget = Number(targetStr);
    if (Number.isFinite(numCell) && Number.isFinite(numTarget) && cellVal !== "") {
      if (op === ">") return numCell > numTarget;
      if (op === "<") return numCell < numTarget;
      if (op === ">=") return numCell >= numTarget;
      if (op === "<=") return numCell <= numTarget;
      if (op === "!=" || op === "<>") return numCell !== numTarget;
      if (op === "=") return numCell === numTarget;
    }
    if (op === "!=" || op === "<>") return cellVal.toLowerCase() !== targetStr.toLowerCase();
    return cellVal.toLowerCase() === targetStr.toLowerCase();
  }
  return cellVal.toLowerCase() === crit.toLowerCase();
}

export function evaluateCell(
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

  const resolveArg = (token: string): string => {
    const t = token.trim();
    if (/^[A-Za-z]+\d+$/.test(t)) return evaluateCell(t.toUpperCase(), cells, nextVisited);
    if (/^[A-Z]+\(.*\)$/i.test(t)) return evaluateFormulaExpr(t, cells, nextVisited);
    return stripQuotes(t);
  };

  const getNum = (ref: string): number => {
    const val = evaluateCell(ref, cells, nextVisited);
    const num = parseFloat(val);
    return Number.isFinite(num) ? num : 0;
  };

  const evaluateCondition = (condRaw: string): boolean => {
    const andMatch = condRaw.match(/^AND\((.+)\)$/i);
    if (andMatch) return splitTopLevelArgs(andMatch[1]).every(evaluateCondition);
    const orMatch = condRaw.match(/^OR\((.+)\)$/i);
    if (orMatch) return splitTopLevelArgs(orMatch[1]).some(evaluateCondition);

    const cmp = condRaw.match(/^(.+?)\s*(>=|<=|!=|<>|=|>|<)\s*(.+)$/);
    if (!cmp) return false;
    const leftRaw = resolveArg(cmp[1]);
    const rightRaw = resolveArg(cmp[3]);
    const leftNum = Number(leftRaw);
    const rightNum = Number(rightRaw);
    const op = cmp[2];
    if (leftRaw !== "" && rightRaw !== "" && Number.isFinite(leftNum) && Number.isFinite(rightNum)) {
      if (op === ">") return leftNum > rightNum;
      if (op === "<") return leftNum < rightNum;
      if (op === ">=") return leftNum >= rightNum;
      if (op === "<=") return leftNum <= rightNum;
      if (op === "!=" || op === "<>") return leftNum !== rightNum;
      return leftNum === rightNum;
    }
    if (op === "!=" || op === "<>") return leftRaw.toLowerCase() !== rightRaw.toLowerCase();
    return leftRaw.toLowerCase() === rightRaw.toLowerCase();
  };

  function evaluateFormulaExpr(
    fnExpr: string,
    cellMap: Record<string, string>,
    vis: Set<string>
  ): string {
    const outer = fnExpr.match(/^([A-Za-z]+)\(([\s\S]*)\)$/);
    if (!outer) return fnExpr;
    const fn = outer[1].toUpperCase();
    const args = splitTopLevelArgs(outer[2]);

    if (fn === "IF" && args.length >= 2) {
      const ok = evaluateCondition(args[0]);
      return ok ? resolveArg(args[1]) : args[2] !== undefined ? resolveArg(args[2]) : "";
    }

    if (fn === "AND") return args.every(evaluateCondition) ? "TRUE" : "FALSE";
    if (fn === "OR") return args.some(evaluateCondition) ? "TRUE" : "FALSE";

    if (fn === "CONCAT") {
      return args.map(resolveArg).join("");
    }

    if (fn === "ROUND" && args.length >= 1) {
      const val = Number(resolveArg(args[0])) || 0;
      const digits = parseInt(args[1] || "0", 10) || 0;
      const factor = Math.pow(10, digits);
      return String(Math.round(val * factor) / factor);
    }

    if (fn === "COUNTIF" && args.length >= 2) {
      const refs = expandRange(args[0]);
      let count = 0;
      for (const r of refs) {
        const v = evaluateCell(r, cellMap, vis);
        if (matchesCriteria(v, args[1])) count++;
      }
      return String(count);
    }

    if (fn === "SUMIF" && args.length >= 2) {
      const critRefs = expandRange(args[0]);
      const sumRefs = args[2] ? expandRange(args[2]) : critRefs;
      let total = 0;
      critRefs.forEach((r, idx) => {
        const v = evaluateCell(r, cellMap, vis);
        if (matchesCriteria(v, args[1])) {
          const targetRef = sumRefs[idx] || r;
          const n = Number(evaluateCell(targetRef, cellMap, vis));
          if (Number.isFinite(n)) total += n;
        }
      });
      return String(Math.round(total * 100) / 100);
    }

    if (fn === "VLOOKUP" && args.length >= 3) {
      const lookupVal = resolveArg(args[0]).toLowerCase();
      const bounds = getRangeBounds(args[1]);
      const colOffset = (parseInt(args[2], 10) || 1) - 1;
      if (!bounds || colOffset < 0) return "#N/A";
      const targetCol = bounds.cMin + colOffset;
      if (targetCol > bounds.cMax) return "#REF!";
      for (let r = bounds.rMin; r <= bounds.rMax; r++) {
        const keyVal = evaluateCell(cellId(bounds.cMin, r), cellMap, vis).toLowerCase();
        if (keyVal === lookupVal) {
          return evaluateCell(cellId(targetCol, r), cellMap, vis);
        }
      }
      return "#N/A";
    }

    if (fn === "XLOOKUP" && args.length >= 3) {
      const lookupVal = resolveArg(args[0]).toLowerCase();
      const lookupRefs = expandRange(args[1]);
      const returnRefs = expandRange(args[2]);
      const notFound = args[3] ? resolveArg(args[3]) : "#N/A";
      const idx = lookupRefs.findIndex(
        (r) => evaluateCell(r, cellMap, vis).toLowerCase() === lookupVal
      );
      if (idx >= 0 && returnRefs[idx]) {
        return evaluateCell(returnRefs[idx], cellMap, vis);
      }
      return notFound;
    }

    if (["SUM", "AVERAGE", "AVG", "MIN", "MAX", "COUNT"].includes(fn)) {
      const nums: number[] = [];
      for (const tok of args) {
        if (tok.includes(":")) {
          for (const ref of expandRange(tok)) {
            const v = evaluateCell(ref, cellMap, vis);
            if (v !== "" && !Number.isNaN(Number(v))) nums.push(Number(v));
          }
        } else if (/^[A-Za-z]+\d+$/.test(tok)) {
          const v = evaluateCell(tok.toUpperCase(), cellMap, vis);
          if (v !== "" && !Number.isNaN(Number(v))) nums.push(Number(v));
        } else if (!Number.isNaN(Number(tok))) {
          nums.push(Number(tok));
        }
      }
      if (fn === "COUNT") return String(nums.length);
      if (nums.length === 0) return "0";
      if (fn === "SUM") return String(Math.round(nums.reduce((a, b) => a + b, 0) * 100) / 100);
      if (fn === "AVERAGE" || fn === "AVG") {
        return String(Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100) / 100);
      }
      if (fn === "MIN") return String(Math.min(...nums));
      if (fn === "MAX") return String(Math.max(...nums));
    }

    return "#NAME?";
  }

  try {
    if (/^[A-Za-z]+\([\s\S]*\)$/.test(expr)) {
      return evaluateFormulaExpr(expr, cells, nextVisited);
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
