import { NextResponse } from "next/server";
import {
  INITIAL_TEAM_MEMBERS,
  INITIAL_INVITATIONS,
  INITIAL_CONTRACTORS,
  DEFAULT_ROLE_PERMISSIONS,
} from "@/lib/teamStorage";
import {
  TeamMember,
  TeamInvitation,
  FreelancerContractor,
} from "@/lib/teamTypes";
import {
  getDefaultDataScopeForRole,
  wouldCreateCycle,
} from "@/lib/hierarchyUtils";
import { BERAXIS_SENDER_EMAIL, isGmailConfigured, sendBeraxisEmail } from "@/lib/gmailMailer";

export const dynamic = "force-dynamic";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hgmdredpqwuooxbbsejw.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbWRyZWRwcXd1b294YmJzZWp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDA4MDIxNywiZXhwIjoyMTA1NjU2MjE3fQ.jZCH75eRrhrQ2A_8Avu-MGwQwctohyF-ocioBAh3oXU";

const sbHeaders = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
};

// Scoped fallback store if Supabase SQL migration v10 hasn't been applied yet
const fallbackCompanyMembers = new Map<string, TeamMember[]>();
let invitationsStore: TeamInvitation[] = [...INITIAL_INVITATIONS];
let contractorsStore: FreelancerContractor[] = [...INITIAL_CONTRACTORS];

function mapDbRowToMember(row: any): TeamMember {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role || "Specialist",
    department: row.department || "Operations",
    companyIds: Array.isArray(row.company_ids) && row.company_ids.length > 0 ? row.company_ids : [row.company_id],
    reportsToId: row.reports_to_id || null,
    dataScope: row.data_scope || getDefaultDataScopeForRole(row.role),
    allowedModules: Array.isArray(row.allowed_modules) ? row.allowed_modules : ["pos"],
    type: row.type === "freelance" ? "freelance" : "full_time",
    status: row.status || "active",
    twoFactorEnabled: Boolean(row.two_factor_enabled),
    avatarBg: row.avatar_bg || "bg-indigo-600",
    lastActive: "Active",
    joinedAt: (row.joined_at || new Date().toISOString()).split("T")[0],
    title: row.title || "",
  };
}

async function fetchMembersFromDb(companyId: string): Promise<TeamMember[] | null> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/company_members?company_id=eq.${encodeURIComponent(companyId)}&order=joined_at.asc`,
      { headers: sbHeaders, cache: "no-store" }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    if (!Array.isArray(rows)) return null;
    return rows.map(mapDbRowToMember);
  } catch {
    return null;
  }
}

async function upsertMembersToDb(companyId: string, list: TeamMember[]): Promise<boolean> {
  try {
    const payload = list.map((m) => ({
      id: m.id,
      company_id: companyId,
      name: m.name,
      email: m.email.toLowerCase().trim(),
      role: m.role,
      department: m.department,
      title: m.title || "",
      reports_to_id: m.reportsToId || null,
      data_scope: m.dataScope || getDefaultDataScopeForRole(m.role),
      allowed_modules: m.allowedModules || ["pos"],
      company_ids: m.companyIds || [companyId],
      type: m.type || "full_time",
      status: m.status || "active",
      two_factor_enabled: Boolean(m.twoFactorEnabled),
      avatar_bg: m.avatarBg || "bg-indigo-600",
    }));

    const res = await fetch(`${SUPABASE_URL}/rest/v1/company_members`, {
      method: "POST",
      headers: { ...sbHeaders, Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function loadCompanyMembers(companyId: string): Promise<TeamMember[]> {
  const dbMembers = await fetchMembersFromDb(companyId);
  if (dbMembers !== null) {
    fallbackCompanyMembers.set(companyId, dbMembers);
    return dbMembers;
  }
  if (!fallbackCompanyMembers.has(companyId)) {
    fallbackCompanyMembers.set(companyId, [...INITIAL_TEAM_MEMBERS]);
  }
  return fallbackCompanyMembers.get(companyId)!;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("company_id") || "CMP-001";
  const search = (searchParams.get("search") || "").trim().toLowerCase();
  const department = (searchParams.get("department") || "").trim().toLowerCase();
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.min(200, Math.max(1, Number(searchParams.get("limit") || 50)));

  const all = await loadCompanyMembers(companyId);
  const filtered = all.filter((m) => {
    if (department && department !== "all" && m.department.toLowerCase() !== department) {
      return false;
    }
    if (search) {
      return (
        m.name.toLowerCase().includes(search) ||
        m.email.toLowerCase().includes(search) ||
        m.role.toLowerCase().includes(search) ||
        m.department.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);
  const activeMembers = all.filter((m) => m.status !== "deactivated");

  return NextResponse.json({
    success: true,
    companyId,
    members: paginated,
    allMembers: all,
    totalCount: filtered.length,
    activeCount: activeMembers.length,
    page,
    limit,
    invitations: invitationsStore,
    contractors: contractorsStore,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const companyId: string = body.companyId || body.company_id || "CMP-001";
    const currentList = await loadCompanyMembers(companyId);

    // Bulk import mode (50+ users at once)
    if (Array.isArray(body.bulk)) {
      const incoming: any[] = body.bulk;
      const working = [...currentList];
      const byEmail = new Map(working.map((m) => [m.email.toLowerCase().trim(), m]));

      // Pass 1: Create or update members so everyone has an ID
      const createdOrUpdated: TeamMember[] = [];
      let nextNum = working.length + 1;

      for (const row of incoming) {
        const email = String(row.email || "").trim().toLowerCase();
        if (!email || !email.includes("@")) continue;
        const existing = byEmail.get(email);
        const role = String(row.role || "Specialist").trim();
        const perms =
          Array.isArray(row.allowedModules) && row.allowedModules.length > 0
            ? row.allowedModules
            : DEFAULT_ROLE_PERMISSIONS[role] || ["pos", "sales"];

        const member: TeamMember = existing
          ? {
              ...existing,
              name: row.name || existing.name,
              role,
              department: row.department || existing.department,
              dataScope: row.dataScope || getDefaultDataScopeForRole(role),
              allowedModules: perms,
              managerEmail: row.managerEmail?.toLowerCase()?.trim(),
              status: "active",
            }
          : {
              id: row.id || `USR-${String(nextNum++).padStart(3, "0")}`,
              name: row.name || email.split("@")[0].replace(/[._]/g, " "),
              email,
              role,
              department: row.department || "Operations",
              companyIds: [companyId],
              reportsToId: row.reportsToId || null,
              managerEmail: row.managerEmail?.toLowerCase()?.trim(),
              dataScope: row.dataScope || getDefaultDataScopeForRole(role),
              allowedModules: perms,
              type: "full_time",
              status: "active",
              twoFactorEnabled: false,
              avatarBg: "bg-indigo-600",
              lastActive: "Just now",
              joinedAt: new Date().toISOString().split("T")[0],
            };

        byEmail.set(email, member);
        createdOrUpdated.push(member);
      }

      // Pass 2: Resolve managerEmail -> reportsToId
      for (const m of byEmail.values()) {
        if (m.managerEmail) {
          const mgr = byEmail.get(m.managerEmail.toLowerCase().trim());
          if (mgr && mgr.id !== m.id) {
            m.reportsToId = mgr.id;
          }
        }
      }

      const merged = Array.from(byEmail.values());
      fallbackCompanyMembers.set(companyId, merged);
      await upsertMembersToDb(companyId, merged);

      return NextResponse.json({
        success: true,
        importedCount: createdOrUpdated.length,
        activeMembersCount: merged.filter((m) => m.status !== "deactivated").length,
        members: merged,
      });
    }

    // Single member add/invite
    const { email, name, role, department, companyIds, reportsToId, allowedModules, dataScope } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ success: false, error: "Valid email address is required" }, { status: 400 });
    }

    const existing = currentList.find((m) => m.email.toLowerCase() === email.toLowerCase());
    if (existing && existing.status !== "deactivated") {
      return NextResponse.json(
        { success: false, error: "A member with this email is already active in the organization" },
        { status: 400 }
      );
    }

    const assignedRole = role || "Specialist";
    const perms =
      allowedModules && allowedModules.length > 0
        ? allowedModules
        : DEFAULT_ROLE_PERMISSIONS[assignedRole] || ["pos"];

    const newMember: TeamMember = {
      id: `USR-${(currentList.length + 1).toString().padStart(3, "0")}`,
      name: name || email.split("@")[0].replace(/[._]/g, " "),
      email: email.trim().toLowerCase(),
      role: assignedRole,
      department: department || "Operations & Field",
      companyIds: companyIds && companyIds.length > 0 ? companyIds : [companyId],
      reportsToId: reportsToId || null,
      dataScope: dataScope || getDefaultDataScopeForRole(assignedRole),
      allowedModules: perms,
      type: "full_time",
      status: "active",
      twoFactorEnabled: false,
      avatarBg: "bg-indigo-600",
      lastActive: "Just now",
      joinedAt: new Date().toISOString().split("T")[0],
    };

    const nextList =
      existing && existing.status === "deactivated"
        ? currentList.map((m) => (m.email.toLowerCase() === email.toLowerCase() ? newMember : m))
        : [newMember, ...currentList];

    fallbackCompanyMembers.set(companyId, nextList);
    await upsertMembersToDb(companyId, [newMember]);

    // 1-Click Invite Email: Owner is paying, team member joins free under company seat
    let inviteEmailSent = false;
    if (body.sendInviteEmail !== false && isGmailConfigured()) {
      const companyName = String(body.companyName || body.company_name || "your company workspace").trim();
      const joinUrl = `https://www.beraxis.online/signup?invite_id=${encodeURIComponent(newMember.id)}&company_id=${encodeURIComponent(companyId)}&email=${encodeURIComponent(newMember.email)}&role=${encodeURIComponent(newMember.role)}&company_name=${encodeURIComponent(companyName)}`;
      const mailRes = await sendBeraxisEmail({
        to: newMember.email,
        subject: `You're invited to join ${companyName} on BERAXIS (${newMember.role})`,
        html: `
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#070B19;color:#F8FAFC;padding:28px;border-radius:16px;max-width:580px;margin:0 auto;border:1px solid #1E293B;">
            <div style="font-size:17px;font-weight:800;color:#A855F7;margin-bottom:12px;">BERAXIS WORKSPACE INVITE</div>
            <h2 style="margin:0 0 10px;color:#FFFFFF;">Join ${companyName}</h2>
            <p style="font-size:14px;color:#CBD5E1;line-height:1.6;">
              Hi ${newMember.name}, you have been assigned a <strong>${newMember.role}</strong> seat in <strong>${companyName}</strong> (${newMember.department}).
              Your license is already covered by your company owner — no payment required.
            </p>
            <div style="margin:20px 0;">
              <a href="${joinUrl}" style="display:inline-block;padding:12px 24px;background:#8B5CF6;color:#FFFFFF;font-weight:800;border-radius:12px;text-decoration:none;font-size:14px;">Accept Invite &amp; Join Team →</a>
            </div>
            <p style="font-size:11px;color:#64748B;">Sent via ${BERAXIS_SENDER_EMAIL} • If you already have an account with ${newMember.email}, simply log in at beraxis.online/login.</p>
          </div>
        `,
        text: `Hi ${newMember.name}, you've been invited to join ${companyName} on BERAXIS as ${newMember.role} (seat covered by owner). Join here: ${joinUrl}`,
      });
      inviteEmailSent = mailRes.sent;
    }

    return NextResponse.json({
      success: true,
      inviteEmailSent,
      message: `Member ${newMember.name} (${newMember.email}) added & assigned${inviteEmailSent ? " — invite email sent!" : "!"}`,
      member: newMember,
      activeMembersCount: nextList.filter((m) => m.status !== "deactivated").length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const companyId: string = body.companyId || body.company_id || "CMP-001";
    const { id, role, department, companyIds, reportsToId, allowedModules, dataScope, status, memberSnapshot } = body;

    let currentList = await loadCompanyMembers(companyId);
    let index = currentList.findIndex((m) => m.id === id);
    if (index === -1) {
      if (memberSnapshot && memberSnapshot.email) {
        const upserted: TeamMember = {
          ...memberSnapshot,
          id: memberSnapshot.id || id,
          companyIds: memberSnapshot.companyIds || [companyId],
          reportsToId: reportsToId !== undefined ? reportsToId : memberSnapshot.reportsToId ?? null,
        };
        currentList = [upserted, ...currentList];
        index = 0;
      } else {
        return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });
      }
    }

    if (reportsToId !== undefined && wouldCreateCycle(id, reportsToId, currentList)) {
      return NextResponse.json(
        { success: false, error: "Invalid manager assignment: would create a circular reporting loop." },
        { status: 400 }
      );
    }

    const current = currentList[index];
    const updated: TeamMember = {
      ...current,
      role: role !== undefined ? role : current.role,
      department: department !== undefined ? department : current.department,
      companyIds: companyIds !== undefined ? companyIds : current.companyIds,
      reportsToId: reportsToId !== undefined ? reportsToId : current.reportsToId,
      dataScope: dataScope !== undefined ? dataScope : current.dataScope,
      allowedModules: allowedModules !== undefined ? allowedModules : current.allowedModules,
      status: status !== undefined ? status : current.status,
    };

    const nextList = [...currentList];
    nextList[index] = updated;
    fallbackCompanyMembers.set(companyId, nextList);
    await upsertMembersToDb(companyId, [updated]);

    return NextResponse.json({
      success: true,
      message: "Member reporting hierarchy & permissions updated",
      member: updated,
      activeMembersCount: nextList.filter((m) => m.status !== "deactivated").length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
