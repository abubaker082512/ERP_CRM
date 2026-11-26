import { NextRequest, NextResponse } from "next/server";
import {
  resolveSafeClusterId,
  verifyClusterAccess,
  readClusterCollection,
} from "@/lib/tenantClusterDb";
import type { HierarchyTask } from "@/app/api/tasks/route";
import type { ApprovalRequest } from "@/app/api/approvals/route";
import { TeamMember } from "@/lib/teamTypes";
import { getSubordinateIds, getSuperiorChain } from "@/lib/hierarchyUtils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawCompanyId = searchParams.get("company_id") || searchParams.get("cluster_id");
    const email = (searchParams.get("email") || "").trim().toLowerCase();
    const memberId = (searchParams.get("member_id") || "").trim();

    if (!rawCompanyId && !email) {
      return NextResponse.json({
        success: true,
        tasks: { actionableCount: 0, items: [] },
        approvals: { pendingCount: 0, items: [] },
        calendar: { events: [] },
        discuss: { channels: [] },
        forms: { submissions: [] },
      });
    }

    const clusterId = resolveSafeClusterId(rawCompanyId, email || undefined);
    const access = await verifyClusterAccess(clusterId, email || undefined);
    if (!access.allowed) {
      return NextResponse.json({ success: false, error: access.reason }, { status: 403 });
    }

    const [tasks, approvals, calendarEvents, discussStore, formSubmissions, members] =
      await Promise.all([
        readClusterCollection<HierarchyTask[]>(clusterId, "tasks", []),
        readClusterCollection<ApprovalRequest[]>(clusterId, "approvals", []),
        readClusterCollection<any[]>(clusterId, "calendar_events", []),
        readClusterCollection<{ channels: any[]; messages: Record<string, any[]> }>(
          clusterId,
          "discuss",
          { channels: [], messages: {} }
        ),
        readClusterCollection<any[]>(clusterId, "form_submissions", []),
        readClusterCollection<TeamMember[]>(clusterId, "team_members", []),
      ]);

    const viewer = members.find(
      (m) =>
        (memberId && m.id === memberId) ||
        (email && m.email.toLowerCase() === email)
    );
    const isTopExec =
      !viewer ||
      viewer.role?.toLowerCase() === "owner" ||
      viewer.role?.toLowerCase() === "admin" ||
      !viewer.reportsToId;
    const subIds = viewer ? getSubordinateIds(viewer.id, members) : new Set<string>();

    // 1. Actionable Tasks for this user (assigned to me [single or group] and open, OR pending my hierarchy approval)
    const actionableTasks = tasks.filter((t) => {
      const assignedToMe = t.assignees.some(
        (a) =>
          (memberId && a.id === memberId) ||
          (email && a.email.toLowerCase() === email)
      );
      const isOpenForAssignee =
        assignedToMe &&
        (t.status === "todo" ||
          t.status === "in_progress" ||
          t.status === "changes_requested");

      const canApprove =
        t.status === "pending_approval" &&
        (isTopExec ||
          (memberId && t.approverId === memberId) ||
          (email && (t.approverEmail || "").toLowerCase() === email) ||
          (viewer &&
            t.assignees.some((a) =>
              getSuperiorChain(a.id, members).some((sup) => sup.id === viewer.id)
            )));

      return isOpenForAssignee || canApprove;
    });

    // 2. Pending Approvals for this user's hierarchy inbox
    const pendingApprovals = approvals.filter((a) => {
      if (a.status !== "pending") return false;
      if (isTopExec) return true;
      return (
        (memberId && a.approverId === memberId) ||
        (email && (a.approverEmail || "").toLowerCase() === email) ||
        subIds.has(a.requesterId)
      );
    });

    // 3. Calendar Events summary
    const calItems = (calendarEvents || []).slice(0, 50).map((e: any) => ({
      id: e.id,
      title: e.title,
      start_time: e.start_time,
      end_time: e.end_time,
      created_at: e.created_at || e.start_time,
    }));

    // 4. Discuss Channels + per-channel message metadata for unread badge calculation
    const allMsgs = discussStore?.messages || {};
    const discussChannels = (discussStore?.channels || [])
      .filter((ch: any) => {
        if (ch.channel_type === "channel") return true;
        if (!email) return true;
        if (!Array.isArray(ch.members) || ch.members.length === 0) return true;
        return isTopExec || ch.members.some((m: string) => m.toLowerCase() === email);
      })
      .map((ch: any) => {
        const list = Array.isArray(allMsgs[ch.id]) ? allMsgs[ch.id] : [];
        const recent = list.slice(-25).map((m: any) => ({
          id: m.id,
          author_email: (m.author_email || "").toLowerCase(),
          author_name: m.author_name || "",
          body: (m.body || "").slice(0, 90),
          created_at: m.created_at,
        }));
        return {
          id: ch.id,
          name: ch.name,
          taskId: ch.taskId || null,
          channel_type: ch.channel_type,
          totalMessages: list.length,
          recentMessages: recent,
        };
      });

    // 5. Recent Public Form Submissions
    const recentSubmissions = (formSubmissions || []).slice(0, 30).map((s: any) => ({
      id: s.id,
      formTitle: s.formTitle || "Form Submission",
      leadName: s.name || s.fullName || s.email || "New Lead",
      createdAt: s.submittedAt || s.createdAt || s.created_at || null,
    }));

    return NextResponse.json(
      {
        success: true,
        clusterId,
        tasks: {
          actionableCount: actionableTasks.length,
          items: actionableTasks.slice(0, 12).map((t) => ({
            id: t.id,
            title: t.title,
            priority: t.priority,
            status: t.status,
            assignmentType: t.assignmentType,
            dueDate: t.dueDate,
            dueTime: t.dueTime,
            updatedAt: t.updatedAt,
          })),
        },
        approvals: {
          pendingCount: pendingApprovals.length,
          items: pendingApprovals.slice(0, 12).map((a) => ({
            id: a.id,
            title: a.title,
            module: a.module,
            requesterName: a.requesterName,
            createdAt: a.createdAt,
          })),
        },
        calendar: {
          events: calItems,
        },
        discuss: {
          channels: discussChannels,
        },
        forms: {
          submissions: recentSubmissions,
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Notification fetch error" },
      { status: 500 }
    );
  }
}
