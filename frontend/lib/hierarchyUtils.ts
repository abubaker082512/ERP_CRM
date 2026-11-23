import { DataScope, TeamMember } from "./teamTypes";

export interface OrgTreeNode {
  member: TeamMember;
  children: OrgTreeNode[];
  directCount: number;
  totalSubordinates: number;
  depth: number;
}

/**
 * Returns default data visibility scope for a role name.
 */
export function getDefaultDataScopeForRole(role: string): DataScope {
  const r = (role || "").toLowerCase();
  if (r === "owner" || r === "admin" || r === "accountant") return "company";
  if (r.includes("manager") || r.includes("lead") || r.includes("director") || r.includes("vp") || r.includes("head") || r.includes("supervisor")) {
    return "team";
  }
  return "own";
}

/**
 * Returns all direct reports for a given memberId.
 */
export function getDirectReports(memberId: string, members: TeamMember[]): TeamMember[] {
  return members.filter((m) => m.reportsToId === memberId && m.status !== "deactivated");
}

/**
 * Cycle-safe BFS returning all direct + indirect subordinate member IDs under a superior.
 */
export function getSubordinateIds(memberId: string, members: TeamMember[]): Set<string> {
  const visited = new Set<string>();
  const queue: string[] = [memberId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const m of members) {
      if (m.reportsToId === current && m.id !== memberId && !visited.has(m.id)) {
        visited.add(m.id);
        queue.push(m.id);
      }
    }
  }
  return visited;
}

/**
 * Returns the upward reporting chain [directManager, vp, ..., ceo] with cycle protection.
 * By default skips deactivated superiors so approvals auto-escalate up the chain.
 */
export function getSuperiorChain(
  memberId: string,
  members: TeamMember[],
  options: { includeDeactivated?: boolean } = {}
): TeamMember[] {
  const chain: TeamMember[] = [];
  const seen = new Set<string>([memberId]);
  const byId = new Map(members.map((m) => [m.id, m]));

  let current = byId.get(memberId);
  while (current && current.reportsToId && !seen.has(current.reportsToId)) {
    const sup = byId.get(current.reportsToId);
    if (!sup) break;
    seen.add(sup.id);
    if (options.includeDeactivated || sup.status !== "deactivated") {
      chain.push(sup);
    }
    current = sup;
  }
  return chain;
}

/**
 * Checks whether assigning `newSuperiorId` to `memberId` would create a reporting cycle.
 */
export function wouldCreateCycle(memberId: string, newSuperiorId: string | null | undefined, members: TeamMember[]): boolean {
  if (!newSuperiorId) return false;
  if (newSuperiorId === memberId) return true;
  const subs = getSubordinateIds(memberId, members);
  return subs.has(newSuperiorId);
}

/**
 * Enforces hierarchical row visibility ('own' | 'team' | 'company').
 */
export function canViewRecord(
  viewer: TeamMember | undefined,
  recordOwnerEmail: string,
  members: TeamMember[]
): boolean {
  if (!viewer) return true;
  const scope = viewer.dataScope || getDefaultDataScopeForRole(viewer.role);
  if (scope === "company") return true;

  const targetEmail = (recordOwnerEmail || "").toLowerCase().trim();
  if (viewer.email.toLowerCase().trim() === targetEmail) return true;

  if (scope === "team") {
    const subIds = getSubordinateIds(viewer.id, members);
    return members.some(
      (m) => subIds.has(m.id) && m.email.toLowerCase().trim() === targetEmail
    );
  }
  return false;
}

/**
 * Builds a multi-level recursive org tree from a flat TeamMember[] list.
 * Orphaned or cyclic nodes are safely promoted to root so no user is ever lost.
 */
export function buildOrgTree(members: TeamMember[]): OrgTreeNode[] {
  const active = members.filter((m) => m.status !== "deactivated");
  const byId = new Map(active.map((m) => [m.id, m]));
  const childrenMap = new Map<string, TeamMember[]>();

  const roots: TeamMember[] = [];
  for (const m of active) {
    if (m.reportsToId && m.reportsToId !== m.id && byId.has(m.reportsToId)) {
      const list = childrenMap.get(m.reportsToId) || [];
      list.push(m);
      childrenMap.set(m.reportsToId, list);
    } else {
      roots.push(m);
    }
  }

  const visited = new Set<string>();
  const buildNode = (member: TeamMember, depth: number): OrgTreeNode => {
    visited.add(member.id);
    const direct = (childrenMap.get(member.id) || []).filter((c) => !visited.has(c.id));
    const childNodes = direct.map((c) => buildNode(c, depth + 1));
    const totalSubordinates = childNodes.reduce(
      (sum, c) => sum + 1 + c.totalSubordinates,
      0
    );
    return {
      member,
      children: childNodes,
      directCount: childNodes.length,
      totalSubordinates,
      depth,
    };
  };

  const treeRoots = roots.map((r) => buildNode(r, 0));

  // Safety net: promote any unvisited nodes (from disconnected cycles) to root
  for (const m of active) {
    if (!visited.has(m.id)) {
      treeRoots.push(buildNode(m, 0));
    }
  }

  return treeRoots;
}

export interface ParsedBulkUserRow {
  name: string;
  email: string;
  role: string;
  department: string;
  managerEmail?: string;
}

/**
 * RFC-4180 CSV line splitter supporting quoted fields containing commas.
 */
function splitCsvLine(line: string): string[] {
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

/**
 * Parses CSV text (Name,Email,Role,Department,ReportsToEmail) into structured rows.
 */
export function parseBulkUsersCsv(csvText: string): ParsedBulkUserRow[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const rows: ParsedBulkUserRow[] = [];
  for (let i = 0; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    if (cols.length < 2) continue;
    // Skip header row
    if (i === 0 && cols[1].toLowerCase().includes("email")) continue;
    const email = cols[1]?.toLowerCase();
    if (!email || !email.includes("@")) continue;
    rows.push({
      name: cols[0] || email.split("@")[0],
      email,
      role: cols[2] || "Specialist",
      department: cols[3] || "Operations",
      managerEmail: cols[4]?.toLowerCase() || undefined,
    });
  }
  return rows;
}

/**
 * Generates a realistic 50-user 4-level hierarchical company dataset for testing/seeding.
 */
export function generate50UserHierarchySample(companyId: string, ownerName: string, ownerEmail: string): TeamMember[] {
  const now = new Date().toISOString().split("T")[0];
  const members: TeamMember[] = [
    {
      id: "USR-001",
      name: ownerName || "Chief Executive Officer",
      email: ownerEmail || "ceo@company.com",
      role: "Owner",
      department: "Executive",
      companyIds: [companyId],
      reportsToId: null,
      dataScope: "company",
      allowedModules: ["*"],
      type: "full_time",
      status: "active",
      twoFactorEnabled: true,
      avatarBg: "bg-purple-600",
      lastActive: "Just now",
      joinedAt: now,
      title: "Chief Executive Officer",
    },
  ];

  const depts = [
    { name: "Sales & CRM", vp: "VP of Sales", mgrs: ["North Sales Manager", "Enterprise Sales Manager"], modules: ["sales", "crm", "pos"] },
    { name: "Finance & Accounting", vp: "VP of Finance", mgrs: ["Controller", "Payroll Lead"], modules: ["accounting", "payroll"] },
    { name: "Operations & Warehouse", vp: "VP of Operations", mgrs: ["Warehouse Lead", "Fleet Supervisor", "Plant Manager"], modules: ["inventory", "manufacturing", "pos"] },
  ];

  let idx = 2;
  const vpIds: string[] = [];
  const mgrIds: { id: string; dept: string; modules: string[] }[] = [];

  // 3 VPs reporting to CEO (USR-001)
  for (const d of depts) {
    const id = `USR-${String(idx).padStart(3, "0")}`;
    vpIds.push(id);
    members.push({
      id,
      name: `${d.vp}`,
      email: `vp.${d.name.split(" ")[0].toLowerCase()}@company.com`,
      role: "Admin",
      department: d.name,
      companyIds: [companyId],
      reportsToId: "USR-001",
      dataScope: "company",
      allowedModules: ["*"],
      type: "full_time",
      status: "active",
      twoFactorEnabled: true,
      avatarBg: "bg-indigo-600",
      lastActive: "2 mins ago",
      joinedAt: now,
    });
    idx++;

    // Managers reporting to their VP
    for (const mTitle of d.mgrs) {
      const mId = `USR-${String(idx).padStart(3, "0")}`;
      mgrIds.push({ id: mId, dept: d.name, modules: d.modules });
      members.push({
        id: mId,
        name: mTitle,
        email: `${mTitle.toLowerCase().replace(/\s+/g, ".")}@company.com`,
        role: "Manager",
        department: d.name,
        companyIds: [companyId],
        reportsToId: id,
        dataScope: "team",
        allowedModules: d.modules,
        type: "full_time",
        status: "active",
        twoFactorEnabled: true,
        avatarBg: "bg-cyan-600",
        lastActive: "10 mins ago",
        joinedAt: now,
      });
      idx++;
    }
  }

  // Fill remaining up to 50 users reporting to the Managers
  let staffNum = 1;
  while (members.length < 50) {
    const mgr = mgrIds[(staffNum - 1) % mgrIds.length];
    const sId = `USR-${String(idx).padStart(3, "0")}`;
    members.push({
      id: sId,
      name: `Team Member ${staffNum}`,
      email: `staff${staffNum}@company.com`,
      role: mgr.dept.includes("Finance") ? "Accountant" : "Specialist",
      department: mgr.dept,
      companyIds: [companyId],
      reportsToId: mgr.id,
      dataScope: "own",
      allowedModules: mgr.modules,
      type: "full_time",
      status: "active",
      twoFactorEnabled: false,
      avatarBg: "bg-emerald-600",
      lastActive: "Online",
      joinedAt: now,
    });
    idx++;
    staffNum++;
  }

  return members;
}
