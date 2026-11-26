import { NextRequest, NextResponse } from "next/server";
import {
  resolveSafeClusterId,
  verifyClusterAccess,
  readClusterCollection,
  writeClusterCollection,
} from "@/lib/tenantClusterDb";
import { TeamMember } from "@/lib/teamTypes";
import { getSubordinateIds, getSuperiorChain } from "@/lib/hierarchyUtils";
import type { ApprovalRequest } from "@/app/api/approvals/route";

export const dynamic = "force-dynamic";

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskAssignmentType = "single" | "group";
export type TaskWorkflowStatus =
  | "todo"
  | "in_progress"
  | "pending_approval"
  | "completed"
  | "changes_requested";

export interface TaskAssignee {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface HierarchyTask {
  id: string;
  clusterId: string;
  title: string;
  description: string;
  assignmentType: TaskAssignmentType;
  groupName?: string;
  assignees: TaskAssignee[];
  assignerId: string;
  assignerName: string;
  assignerEmail: string;
  assignerRole: string;
  approverId: string | null;
  approverName: string;
  approverEmail: string;
  priority: TaskPriority;
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:mm
  deadlineAt: string; // ISO string
  status: TaskWorkflowStatus;
  approvalStatus: "not_submitted" | "pending" | "approved" | "changes_requested";
  approvalNotes?: string;
  linkedApprovalId?: string;
  discussChannelId: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string | null;
  completedAt?: string | null;
}

interface DiscussStoreShape {
  channels: any[];
  messages: Record<string, any[]>;
}

function findMember(
  members: TeamMember[],
  idOrEmail?: string | null
): TeamMember | undefined {
  if (!idOrEmail) return undefined;
  const norm = idOrEmail.trim().toLowerCase();
  return members.find(
    (m) => m.id.toLowerCase() === norm || m.email.toLowerCase() === norm
  );
}

function canActorAssignToTarget(
  actor: TeamMember | undefined,
  target: TeamMember | undefined,
  members: TeamMember[]
): boolean {
  if (!actor || !target) return true;
  if (actor.id === target.id || actor.email.toLowerCase() === target.email.toLowerCase()) {
    return true; // Anyone can create a personal task for themselves
  }
  const roleLower = (actor.role || "").toLowerCase();
  if (roleLower === "owner" || roleLower === "admin") {
    return true;
  }
  const subIds = getSubordinateIds(actor.id, members);
  return subIds.has(target.id);
}

function canActorApproveTask(
  actor: TeamMember | undefined,
  actorEmail: string,
  task: HierarchyTask,
  members: TeamMember[]
): boolean {
  const emailLower = (actorEmail || actor?.email || "").trim().toLowerCase();

  // Check if task assignees have an upward superior — if so, an assignee who is NOT a superior/owner cannot self-approve
  const isAssignee = task.assignees.some(
    (a) =>
      (actor && a.id === actor.id) ||
      (emailLower && a.email.toLowerCase() === emailLower)
  );

  const roleLower = (actor?.role || "").toLowerCase();
  const isTopExecutive =
    roleLower === "owner" ||
    roleLower === "admin" ||
    (actor && !actor.reportsToId);

  if (isAssignee && !isTopExecutive) {
    // Check if actor is strictly subordinate to task.approverId or task.assignerId
    if (
      task.approverId &&
      actor &&
      task.approverId !== actor.id &&
      (task.approverEmail || "").toLowerCase() !== emailLower
    ) {
      return false;
    }
  }

  if (isTopExecutive) return true;

  if (
    (actor && task.approverId === actor.id) ||
    (emailLower && (task.approverEmail || "").toLowerCase() === emailLower)
  ) {
    return true;
  }

  // Also allow any higher manager in the upward reporting chain of any assignee
  if (actor) {
    for (const a of task.assignees) {
      const chain = getSuperiorChain(a.id, members);
      if (chain.some((sup) => sup.id === actor.id)) {
        return true;
      }
    }
  }

  return false;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawCompanyId = searchParams.get("company_id") || searchParams.get("cluster_id");
  const email = (searchParams.get("email") || searchParams.get("owner_email") || "").trim().toLowerCase() || undefined;
  const viewerId = searchParams.get("member_id") || undefined;

  if (!rawCompanyId && !email) {
    return NextResponse.json({ success: true, tasks: [], messageCounts: {} });
  }

  const clusterId = resolveSafeClusterId(rawCompanyId, email);
  const access = await verifyClusterAccess(clusterId, email);
  if (!access.allowed) {
    return NextResponse.json({ success: false, error: access.reason || "Access denied" }, { status: 403 });
  }

  const tasks = await readClusterCollection<HierarchyTask[]>(clusterId, "tasks", []);
  const members = await readClusterCollection<TeamMember[]>(clusterId, "team_members", []);
  const discuss = await readClusterCollection<DiscussStoreShape>(clusterId, "discuss", {
    channels: [],
    messages: {},
  });

  const messageCounts: Record<string, number> = {};
  for (const t of tasks) {
    const chMsgs = discuss.messages?.[t.discussChannelId];
    messageCounts[t.id] = Array.isArray(chMsgs) ? chMsgs.length : 0;
  }

  // Filter visibility by org hierarchy if viewer is known in team_members
  const viewer = findMember(members, viewerId || email);
  let visibleTasks = tasks;
  if (viewer) {
    const r = (viewer.role || "").toLowerCase();
    if (r !== "owner" && r !== "admin") {
      const subIds = getSubordinateIds(viewer.id, members);
      visibleTasks = tasks.filter((t) => {
        const isAssigner = t.assignerId === viewer.id || t.assignerEmail.toLowerCase() === viewer.email.toLowerCase();
        const isApprover = t.approverId === viewer.id || (t.approverEmail || "").toLowerCase() === viewer.email.toLowerCase();
        const isInAssignees = t.assignees.some(
          (a) => a.id === viewer.id || a.email.toLowerCase() === viewer.email.toLowerCase()
        );
        const isSubordinateTask =
          subIds.has(t.assignerId) || t.assignees.some((a) => subIds.has(a.id));
        return isAssigner || isApprover || isInAssignees || isSubordinateTask;
      });
    }
  }

  return NextResponse.json(
    {
      success: true,
      clusterId,
      tasks: visibleTasks,
      messageCounts,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const assignerEmail = String(body.assignerEmail || body.owner_email || body.email || "").trim().toLowerCase();
    const clusterId = resolveSafeClusterId(
      body.clusterId || body.cluster_id || body.companyId || body.company_id,
      assignerEmail
    );

    const access = await verifyClusterAccess(clusterId, assignerEmail || undefined);
    if (!access.allowed) {
      return NextResponse.json({ success: false, error: access.reason || "Access denied" }, { status: 403 });
    }

    const title = String(body.title || "").trim();
    if (!title) {
      return NextResponse.json({ success: false, error: "Task title is required" }, { status: 400 });
    }

    const dueDate = String(body.dueDate || "").trim();
    const dueTime = String(body.dueTime || "17:00").trim();
    if (!dueDate) {
      return NextResponse.json(
        { success: false, error: "Task due date and time deadline are required" },
        { status: 400 }
      );
    }

    let members = await readClusterCollection<TeamMember[]>(clusterId, "team_members", []);
    if (members.length === 0 && Array.isArray(body.membersSnapshot) && body.membersSnapshot.length > 0) {
      members = body.membersSnapshot;
    }

    const actor = findMember(members, body.assignerId || assignerEmail);
    const rawAssignees: TaskAssignee[] = Array.isArray(body.assignees) ? body.assignees : [];
    if (rawAssignees.length === 0) {
      return NextResponse.json(
        { success: false, error: "Select at least one assignee (single user or group)" },
        { status: 400 }
      );
    }

    // Strictly enforce downward org-hierarchy assignment!
    if (actor && members.length > 0) {
      for (const targetInput of rawAssignees) {
        const targetMember = findMember(members, targetInput.id || targetInput.email);
        if (targetMember && !canActorAssignToTarget(actor, targetMember, members)) {
          return NextResponse.json(
            {
              success: false,
              error: `HIERARCHY_ASSIGNMENT_DENIED: ${actor.name} (${actor.role}) cannot assign tasks upward or outside their reporting chain to ${targetMember.name} (${targetMember.role}). Tasks can only be assigned to yourself or your subordinates.`,
            },
            { status: 403 }
          );
        }
      }
    }

    const assignmentType: TaskAssignmentType =
      body.assignmentType === "group" || rawAssignees.length > 1 ? "group" : "single";

    // Determine Hierarchy Approver automatically from reporting chain
    const primaryTarget = findMember(members, rawAssignees[0]?.id || rawAssignees[0]?.email);
    const targetSuperiors = primaryTarget ? getSuperiorChain(primaryTarget.id, members) : [];
    const directSuperior = targetSuperiors[0] || actor || null;

    // If a manager assigns a task to a subordinate, either the direct manager or the assigning superior approves it
    const resolvedApprover =
      actor && primaryTarget && actor.id !== primaryTarget.id
        ? actor
        : directSuperior;

    const taskId = `TSK-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const discussChannelId = `TASK-${taskId}`;
    const priority: TaskPriority = ["low", "medium", "high", "urgent"].includes(body.priority)
      ? body.priority
      : "medium";

    let deadlineAt = new Date().toISOString();
    try {
      const parsed = new Date(`${dueDate}T${dueTime.length === 5 ? `${dueTime}:00` : dueTime}`);
      if (!isNaN(parsed.getTime())) {
        deadlineAt = parsed.toISOString();
      }
    } catch {}

    const now = new Date().toISOString();
    const newTask: HierarchyTask = {
      id: taskId,
      clusterId,
      title,
      description: String(body.description || "").trim(),
      assignmentType,
      groupName: assignmentType === "group" ? String(body.groupName || "Task Group").trim() : undefined,
      assignees: rawAssignees.map((a) => ({
        id: String(a.id || "USR-001"),
        name: String(a.name || a.email || "Member"),
        email: String(a.email || "").trim().toLowerCase(),
        role: String(a.role || "Specialist"),
      })),
      assignerId: actor?.id || String(body.assignerId || "USR-001"),
      assignerName: actor?.name || String(body.assignerName || "Manager"),
      assignerEmail: (actor?.email || assignerEmail || "owner@company.com").toLowerCase(),
      assignerRole: actor?.role || String(body.assignerRole || "Owner"),
      approverId: resolvedApprover?.id || null,
      approverName: resolvedApprover?.name || String(body.approverName || "Direct Superior"),
      approverEmail: (resolvedApprover?.email || String(body.approverEmail || assignerEmail || "")).toLowerCase(),
      priority,
      dueDate,
      dueTime,
      deadlineAt,
      status: "todo",
      approvalStatus: "not_submitted",
      discussChannelId,
      createdAt: now,
      updatedAt: now,
      submittedAt: null,
      completedAt: null,
    };

    const existingTasks = await readClusterCollection<HierarchyTask[]>(clusterId, "tasks", []);
    await writeClusterCollection(clusterId, "tasks", [newTask, ...existingTasks], {
      ownerEmail: assignerEmail || undefined,
    });

    // Auto-create dedicated Task Discuss Channel + kickoff message so assignees & superiors can chat in Discuss!
    const discussStore = await readClusterCollection<DiscussStoreShape>(clusterId, "discuss", {
      channels: [],
      messages: {},
    });
    const participantEmails = Array.from(
      new Set(
        [
          newTask.assignerEmail,
          newTask.approverEmail,
          ...newTask.assignees.map((a) => a.email),
        ].filter(Boolean)
      )
    );

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 32);

    const taskChannel = {
      id: discussChannelId,
      name: `task-${slug || taskId.toLowerCase()}`,
      taskTitle: title,
      taskId,
      priority,
      deadlineAt,
      assignmentType,
      description: `${assignmentType === "group" ? `[Group: ${newTask.groupName}] ` : ""}${title} • Due ${dueDate} ${dueTime}`,
      channel_type: "task",
      members: participantEmails,
      created_at: now,
    };

    const kickoffMsg = {
      id: `MSG-${Date.now()}`,
      channel_id: discussChannelId,
      body: `📋 Task assigned by ${newTask.assignerName} (${newTask.assignerRole}) to ${
        assignmentType === "group"
          ? `${newTask.groupName} (${newTask.assignees.map((a) => a.name).join(", ")})`
          : newTask.assignees[0]?.name
      } • Priority: ${priority.toUpperCase()} • Deadline: ${dueDate} at ${dueTime} • Hierarchy Approver: ${newTask.approverName}`,
      author_name: newTask.assignerName,
      author_email: newTask.assignerEmail,
      created_at: now,
    };

    const nextChannels = [
      ...(discussStore.channels || []).filter((c: any) => c.id !== discussChannelId),
      taskChannel,
    ];
    const nextMessages = {
      ...(discussStore.messages || {}),
      [discussChannelId]: [kickoffMsg],
    };

    await writeClusterCollection(
      clusterId,
      "discuss",
      { channels: nextChannels, messages: nextMessages },
      { ownerEmail: assignerEmail || undefined }
    );

    return NextResponse.json({
      success: true,
      clusterId,
      task: newTask,
      discussChannel: taskChannel,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to create task" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const actorEmail = String(body.actorEmail || body.email || body.owner_email || "").trim().toLowerCase();
    const clusterId = resolveSafeClusterId(
      body.clusterId || body.cluster_id || body.companyId || body.company_id,
      actorEmail
    );

    const access = await verifyClusterAccess(clusterId, actorEmail || undefined);
    if (!access.allowed) {
      return NextResponse.json({ success: false, error: access.reason || "Access denied" }, { status: 403 });
    }

    const { id, action, reviewerNotes } = body;
    const tasks = await readClusterCollection<HierarchyTask[]>(clusterId, "tasks", []);
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }

    let members = await readClusterCollection<TeamMember[]>(clusterId, "team_members", []);
    if (members.length === 0 && Array.isArray(body.membersSnapshot)) {
      members = body.membersSnapshot;
    }

    const current = tasks[idx];
    const actor = findMember(members, body.actorId || actorEmail);
    const now = new Date().toISOString();
    let updated: HierarchyTask = { ...current, updatedAt: now };

    if (action === "start") {
      updated.status = "in_progress";
    } else if (action === "submit_for_approval") {
      updated.status = "pending_approval";
      updated.approvalStatus = "pending";
      updated.submittedAt = now;

      // Also create/sync an approval record in the company's isolated approvals collection!
      const approvals = await readClusterCollection<ApprovalRequest[]>(clusterId, "approvals", []);
      const aprId = current.linkedApprovalId || `APR-TSK-${current.id}`;
      updated.linkedApprovalId = aprId;

      const aprItem: ApprovalRequest = {
        id: aprId,
        companyId: clusterId,
        requesterId: actor?.id || current.assignees[0]?.id || "USR-001",
        requesterName: actor?.name || current.assignees[0]?.name || "Assignee",
        requesterEmail: actor?.email || actorEmail || current.assignees[0]?.email || "",
        approverId: current.approverId,
        approverName: current.approverName,
        approverEmail: current.approverEmail,
        module: "task",
        referenceId: current.id,
        title: `Task Sign-Off: ${current.title}`,
        description: `Priority: ${current.priority.toUpperCase()} • Deadline: ${current.dueDate} ${current.dueTime}`,
        amount: 0,
        status: "pending",
        createdAt: now,
        decidedAt: null,
      };
      await writeClusterCollection(clusterId, "approvals", [
        aprItem,
        ...approvals.filter((a) => a.id !== aprId),
      ]);
    } else if (action === "approve" || action === "reject") {
      // Strictly enforce Hierarchy Approval!
      if (!canActorApproveTask(actor, actorEmail, current, members)) {
        return NextResponse.json(
          {
            success: false,
            error: `HIERARCHY_APPROVAL_DENIED: Only ${current.approverName} or an upward superior in the org hierarchy can approve or request changes on this task.`,
          },
          { status: 403 }
        );
      }

      if (action === "approve") {
        updated.status = "completed";
        updated.approvalStatus = "approved";
        updated.completedAt = now;
      } else {
        updated.status = "changes_requested";
        updated.approvalStatus = "changes_requested";
      }
      if (reviewerNotes !== undefined) {
        updated.approvalNotes = String(reviewerNotes);
      }

      // Sync linked approval record if present
      if (current.linkedApprovalId) {
        const approvals = await readClusterCollection<ApprovalRequest[]>(clusterId, "approvals", []);
        const nextApprovals = approvals.map((a) =>
          a.id === current.linkedApprovalId
            ? {
                ...a,
                status: (action === "approve" ? "approved" : "rejected") as "approved" | "rejected",
                reviewerNotes: updated.approvalNotes || "",
                decidedAt: now,
              }
            : a
        );
        await writeClusterCollection(clusterId, "approvals", nextApprovals);
      }

      // Post status update into Task Discuss channel
      const discussStore = await readClusterCollection<DiscussStoreShape>(clusterId, "discuss", {
        channels: [],
        messages: {},
      });
      const existingMsgs = discussStore.messages?.[current.discussChannelId] || [];
      const decisionMsg = {
        id: `MSG-${Date.now()}`,
        channel_id: current.discussChannelId,
        body:
          action === "approve"
            ? `✅ Task APPROVED by ${actor?.name || current.approverName}${updated.approvalNotes ? ` — "${updated.approvalNotes}"` : ""}`
            : `🔄 Changes requested by ${actor?.name || current.approverName}${updated.approvalNotes ? ` — "${updated.approvalNotes}"` : ""}`,
        author_name: actor?.name || current.approverName,
        author_email: actor?.email || actorEmail || current.approverEmail,
        created_at: now,
      };
      await writeClusterCollection(clusterId, "discuss", {
        channels: discussStore.channels || [],
        messages: {
          ...(discussStore.messages || {}),
          [current.discussChannelId]: [...existingMsgs, decisionMsg],
        },
      });
    } else {
      // General field update (priority, deadline, status)
      if (body.priority) updated.priority = body.priority;
      if (body.dueDate) updated.dueDate = body.dueDate;
      if (body.dueTime) updated.dueTime = body.dueTime;
      if (body.dueDate || body.dueTime) {
        const d = new Date(`${updated.dueDate}T${updated.dueTime}:00`);
        if (!isNaN(d.getTime())) updated.deadlineAt = d.toISOString();
      }
      if (body.status && body.status !== "completed") {
        updated.status = body.status;
      }
    }

    const nextTasks = [...tasks];
    nextTasks[idx] = updated;
    await writeClusterCollection(clusterId, "tasks", nextTasks);

    return NextResponse.json({ success: true, clusterId, task: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawCompanyId = searchParams.get("company_id") || searchParams.get("cluster_id");
  const email = (searchParams.get("email") || "").trim().toLowerCase() || undefined;
  const id = searchParams.get("id") || "";

  const clusterId = resolveSafeClusterId(rawCompanyId, email);
  const access = await verifyClusterAccess(clusterId, email);
  if (!access.allowed) {
    return NextResponse.json({ success: false, error: access.reason || "Access denied" }, { status: 403 });
  }

  const tasks = await readClusterCollection<HierarchyTask[]>(clusterId, "tasks", []);
  await writeClusterCollection(
    clusterId,
    "tasks",
    tasks.filter((t) => t.id !== id)
  );
  return NextResponse.json({ success: true, id });
}
