"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { useBranchContext } from "@/lib/branchContext";
import { useTheme } from "@/lib/themeContext";
import { useNotifications, triggerNotificationRefresh } from "@/lib/notificationContext";
import { INITIAL_TEAM_MEMBERS } from "@/lib/teamStorage";
import { TeamMember } from "@/lib/teamTypes";
import { getSubordinateIds, getSuperiorChain } from "@/lib/hierarchyUtils";
import type {
  HierarchyTask,
  TaskPriority,
  TaskAssignmentType,
} from "@/app/api/tasks/route";
import {
  CheckSquare,
  Plus,
  Users,
  User,
  Clock,
  AlertTriangle,
  Flame,
  Flag,
  MessageSquare,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Send,
  Play,
  ExternalLink,
  X,
  Calendar,
  Trash2,
} from "lucide-react";

interface ChatMessage {
  id: string;
  channel_id: string;
  body: string;
  author_name: string;
  author_email?: string;
  created_at: string;
}

const PRIORITY_META: Record<
  TaskPriority,
  { label: string; badgeClass: string; rank: number }
> = {
  urgent: {
    label: "Urgent",
    badgeClass: "bg-rose-500/15 text-rose-400 border-rose-500/35",
    rank: 4,
  },
  high: {
    label: "High",
    badgeClass: "bg-orange-500/15 text-orange-400 border-orange-500/35",
    rank: 3,
  },
  medium: {
    label: "Medium",
    badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/35",
    rank: 2,
  },
  low: {
    label: "Low",
    badgeClass: "bg-sky-500/15 text-sky-400 border-sky-500/35",
    rank: 1,
  },
};

function formatDeadlineCountdown(deadlineAt: string, dueDate: string, dueTime: string, completed: boolean) {
  if (completed) {
    return { text: `Completed • Due ${dueDate} ${dueTime}`, overdue: false, urgentSoon: false };
  }
  const target = new Date(deadlineAt || `${dueDate}T${dueTime || "17:00"}:00`).getTime();
  if (isNaN(target)) {
    return { text: `Due ${dueDate} at ${dueTime}`, overdue: false, urgentSoon: false };
  }
  const diffMs = target - Date.now();
  if (diffMs < 0) {
    const absHrs = Math.floor(Math.abs(diffMs) / 3600000);
    const absMins = Math.floor((Math.abs(diffMs) % 3600000) / 60000);
    return {
      text: absHrs >= 24 ? `Overdue by ${Math.floor(absHrs / 24)}d ${absHrs % 24}h` : `Overdue by ${absHrs}h ${absMins}m`,
      overdue: true,
      urgentSoon: false,
    };
  }
  const hrs = Math.floor(diffMs / 3600000);
  const mins = Math.floor((diffMs % 3600000) / 60000);
  if (hrs < 24) {
    return {
      text: `Due in ${hrs}h ${mins}m (${dueDate} ${dueTime})`,
      overdue: false,
      urgentSoon: hrs <= 6,
    };
  }
  return {
    text: `${Math.floor(hrs / 24)}d ${hrs % 24}h left • ${dueDate} ${dueTime}`,
    overdue: false,
    urgentSoon: false,
  };
}

export default function HierarchyTasksPage() {
  const { activeBranch, getEntityStorageKey } = useBranchContext();
  const { isLight } = useTheme();
  const { taskChatUnreads, markChannelSeen } = useNotifications();
  const companyId = activeBranch?.id || "CLS-DEFAULT";

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [activeMemberId, setActiveMemberId] = useState<string>("USR-001");
  const [tasks, setTasks] = useState<HierarchyTask[]>([]);
  const [msgCounts, setMsgCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<
    "my_tasks" | "group_tasks" | "delegated" | "approvals" | "all"
  >("my_tasks");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"all" | TaskPriority>("all");

  // Create Task Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [assignmentType, setAssignmentType] = useState<TaskAssignmentType>("single");
  const [groupName, setGroupName] = useState("");
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("high");
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date(Date.now() + 86400000);
    return d.toISOString().split("T")[0];
  });
  const [dueTime, setDueTime] = useState("17:00");
  const [submitting, setSubmitting] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState<{ ok: boolean; msg: string } | null>(null);

  // Inline Task Discuss Drawer State
  const [chatTask, setChatTask] = useState<HierarchyTask | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);

  // Load current user + company org hierarchy + tasks
  useEffect(() => {
    let meEmail = "";
    let meName = "";
    try {
      const rawUser =
        localStorage.getItem("user") ||
        localStorage.getItem("auth_data") ||
        localStorage.getItem("user_data");
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        meEmail = (parsed.email || parsed.user?.email || "").trim().toLowerCase();
        meName = parsed.name || parsed.user?.name || "";
      }
      const cachedMembers = localStorage.getItem(getEntityStorageKey("team_members"));
      if (cachedMembers) {
        const parsedM = JSON.parse(cachedMembers);
        if (Array.isArray(parsedM) && parsedM.length > 0) {
          setMembers(parsedM);
          const matchMe = meEmail
            ? parsedM.find((m: TeamMember) => m.email.toLowerCase() === meEmail)
            : null;
          setActiveMemberId((matchMe || parsedM[0]).id);
        }
      }
    } catch {}

    const fallbackSelf: TeamMember = {
      id: "USR-001",
      name: meName || (meEmail ? meEmail.split("@")[0] : "Workspace Owner"),
      email: meEmail || "owner@workspace.local",
      role: "Owner",
      department: "Executive",
      companyIds: [companyId],
      reportsToId: null,
      allowedModules: ["*"],
      type: "full_time",
      status: "active",
      twoFactorEnabled: false,
      avatarBg: "from-purple-600 to-indigo-600",
      lastActive: "Online now",
      joinedAt: new Date().toISOString().slice(0, 10),
    };

    const ownerParams = new URLSearchParams({ company_id: companyId, limit: "200" });
    if (meEmail) ownerParams.set("owner_email", meEmail);
    if (meName) ownerParams.set("owner_name", meName);

    fetch(`/api/team/members?${ownerParams.toString()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d?.allMembers) && d.allMembers.length > 0) {
          setMembers(d.allMembers);
          const matchMe = meEmail
            ? d.allMembers.find((m: TeamMember) => m.email.toLowerCase() === meEmail)
            : null;
          setActiveMemberId((prev) => {
            if (d.allMembers.some((m: TeamMember) => m.id === prev)) return prev;
            return (matchMe || d.allMembers[0]).id;
          });
        } else {
          setMembers((prev) => (prev.length > 0 ? prev : [fallbackSelf]));
          setActiveMemberId(fallbackSelf.id);
        }
      })
      .catch(() => {
        setMembers((prev) => (prev.length > 0 ? prev : [fallbackSelf]));
      });
  }, [companyId, getEntityStorageKey]);

  const activeMember = useMemo(
    () => members.find((m) => m.id === activeMemberId) || members[0],
    [members, activeMemberId]
  );

  const loadTasks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ company_id: companyId });
      if (activeMember?.email) params.set("email", activeMember.email);
      if (activeMember?.id) params.set("member_id", activeMember.id);
      const res = await fetch(`/api/tasks?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();
      if (data?.success && Array.isArray(data.tasks)) {
        setTasks(data.tasks);
        setMsgCounts(data.messageCounts || {});
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    loadTasks();
  }, [companyId, activeMember?.id]);

  // Hierarchy calculations for Active Member
  const subordinateIdSet = useMemo(() => {
    if (!activeMember) return new Set<string>();
    const roleLower = (activeMember.role || "").toLowerCase();
    if (roleLower === "owner" || roleLower === "admin") {
      return new Set(members.filter((m) => m.id !== activeMember.id && m.status !== "deactivated").map((m) => m.id));
    }
    return getSubordinateIds(activeMember.id, members);
  }, [activeMember, members]);

  const assignableMembers = useMemo(() => {
    if (!activeMember) return members;
    return members.filter(
      (m) =>
        m.status !== "deactivated" &&
        (m.id === activeMember.id || subordinateIdSet.has(m.id))
    );
  }, [activeMember, members, subordinateIdSet]);

  const superiorChain = useMemo(
    () => (activeMember ? getSuperiorChain(activeMember.id, members) : []),
    [activeMember, members]
  );
  const directSuperior = superiorChain[0] || null;

  // Keep default selected assignee synced when opening modal
  useEffect(() => {
    if (isCreateOpen && selectedAssigneeIds.length === 0 && assignableMembers.length > 0) {
      const firstSub = assignableMembers.find((m) => m.id !== activeMember?.id) || assignableMembers[0];
      setSelectedAssigneeIds([firstSub.id]);
    }
  }, [isCreateOpen, assignableMembers, activeMember?.id, selectedAssigneeIds.length]);

  const isAssignedToMe = (t: HierarchyTask) =>
    Boolean(
      activeMember &&
        t.assignees.some(
          (a) =>
            a.id === activeMember.id ||
            a.email.toLowerCase() === activeMember.email.toLowerCase()
        )
    );

  const canIApproveTask = (t: HierarchyTask) => {
    if (!activeMember) return false;
    const roleLower = (activeMember.role || "").toLowerCase();
    const isTopExec = roleLower === "owner" || roleLower === "admin" || !activeMember.reportsToId;
    const iAmAssignee = isAssignedToMe(t);
    if (iAmAssignee && !isTopExec) {
      if (t.approverId && t.approverId !== activeMember.id) return false;
    }
    if (isTopExec) return true;
    if (
      t.approverId === activeMember.id ||
      (t.approverEmail || "").toLowerCase() === activeMember.email.toLowerCase()
    ) {
      return true;
    }
    return t.assignees.some((a) =>
      getSuperiorChain(a.id, members).some((sup) => sup.id === activeMember.id)
    );
  };

  const myTasksList = tasks.filter(isAssignedToMe);
  const groupTasksList = tasks.filter(
    (t) => t.assignmentType === "group" || t.assignees.length > 1
  );
  const delegatedList = tasks.filter(
    (t) =>
      activeMember &&
      t.assignerId === activeMember.id &&
      !t.assignees.every((a) => a.id === activeMember.id)
  );
  const pendingApprovalForMeList = tasks.filter(
    (t) => t.status === "pending_approval" && canIApproveTask(t)
  );

  const baseDisplayed =
    activeTab === "my_tasks"
      ? myTasksList
      : activeTab === "group_tasks"
      ? groupTasksList
      : activeTab === "delegated"
      ? delegatedList
      : activeTab === "approvals"
      ? pendingApprovalForMeList
      : tasks;

  const filteredTasks = baseDisplayed
    .filter((t) => {
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          (t.description || "").toLowerCase().includes(q) ||
          (t.groupName || "").toLowerCase().includes(q) ||
          t.assignees.some((a) => a.name.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (a.status === "completed" && b.status !== "completed") return 1;
      if (a.status !== "completed" && b.status === "completed") return -1;
      const pDiff = PRIORITY_META[b.priority].rank - PRIORITY_META[a.priority].rank;
      if (pDiff !== 0) return pDiff;
      return new Date(a.deadlineAt).getTime() - new Date(b.deadlineAt).getTime();
    });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate || !activeMember) return;
    const chosen = members.filter((m) => selectedAssigneeIds.includes(m.id));
    if (chosen.length === 0) {
      setFeedbackBanner({ ok: false, msg: "Please select at least one assignee within your hierarchy." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: companyId,
          title: title.trim(),
          description: description.trim(),
          assignmentType: assignmentType === "group" || chosen.length > 1 ? "group" : "single",
          groupName:
            assignmentType === "group" || chosen.length > 1
              ? groupName.trim() || `${activeMember.department || "Team"} Task Group`
              : undefined,
          assignees: chosen.map((m) => ({
            id: m.id,
            name: m.name,
            email: m.email,
            role: m.role,
          })),
          assignerId: activeMember.id,
          assignerName: activeMember.name,
          assignerEmail: activeMember.email,
          assignerRole: activeMember.role,
          priority,
          dueDate,
          dueTime,
          membersSnapshot: members,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        setFeedbackBanner({ ok: false, msg: data?.error || "Failed to create task" });
        return;
      }

      setTasks((prev) => [data.task, ...prev]);
      setMsgCounts((prev) => ({ ...prev, [data.task.id]: 1 }));
      setTitle("");
      setDescription("");
      setGroupName("");
      setIsCreateOpen(false);
      setFeedbackBanner({
        ok: true,
        msg: `Task "${data.task.title}" assigned & linked to Discuss (#${data.discussChannel?.name})!`,
      });
      triggerNotificationRefresh();
      setTimeout(() => setFeedbackBanner(null), 4500);
    } finally {
      setSubmitting(false);
    }
  };

  const handleWorkflowAction = async (
    task: HierarchyTask,
    action: "start" | "submit_for_approval" | "approve" | "reject"
  ) => {
    if (!activeMember) return;
    const res = await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_id: companyId,
        id: task.id,
        action,
        actorId: activeMember.id,
        actorEmail: activeMember.email,
        membersSnapshot: members,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data?.success) {
      setFeedbackBanner({ ok: false, msg: data?.error || "Action denied by hierarchy policy" });
      setTimeout(() => setFeedbackBanner(null), 4500);
      return;
    }
    setTasks((prev) => prev.map((t) => (t.id === task.id ? data.task : t)));
    triggerNotificationRefresh();
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    await fetch(
      `/api/tasks?id=${encodeURIComponent(taskId)}&company_id=${encodeURIComponent(companyId)}&email=${encodeURIComponent(activeMember?.email || "")}`,
      { method: "DELETE" }
    ).catch(() => {});
    triggerNotificationRefresh();
  };

  // Open Inline Task Chat Drawer (backed directly by /api/discuss!)
  const openTaskChatDrawer = async (task: HierarchyTask) => {
    setChatTask(task);
    try {
      const res = await fetch(
        `/api/discuss?company_id=${encodeURIComponent(companyId)}&channel_id=${encodeURIComponent(task.discussChannelId)}&email=${encodeURIComponent(activeMember?.email || "")}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      const list = Array.isArray(data?.messages) ? data.messages : [];
      setChatMessages(list);
      markChannelSeen(task.discussChannelId, list.length);
    } catch {
      setChatMessages([]);
    }
  };

  const sendTaskChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatTask || !chatInput.trim() || !activeMember) return;
    setSendingChat(true);
    try {
      const bodyText = chatInput.trim();
      setChatInput("");
      const res = await fetch("/api/discuss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_message",
          company_id: companyId,
          channel_id: chatTask.discussChannelId,
          body: bodyText,
          author_name: activeMember.name,
          author_email: activeMember.email,
        }),
      });
      const data = await res.json();
      if (data?.message) {
        const nextList = [...chatMessages, data.message];
        setChatMessages(nextList);
        setMsgCounts((prev) => ({ ...prev, [chatTask.id]: nextList.length }));
        markChannelSeen(chatTask.discussChannelId, nextList.length);
        triggerNotificationRefresh();
      }
    } finally {
      setSendingChat(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col ${
        isLight ? "bg-[#F6F7FB] text-slate-900" : "bg-[#060913] text-white"
      }`}
    >
      <StandardModuleHeader
        moduleName="Tasks"
        moduleIcon={<CheckSquare size={20} />}
        menuItems={[
          { name: "My Tasks", href: "/tasks" },
          { name: "Approvals", href: "/approvals" },
          { name: "Discuss", href: "/discuss" },
          { name: "Team Hierarchy", href: "/team" },
        ]}
        searchPlaceholder="Search tasks, groups, assignees..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onNewClick={() => setIsCreateOpen(true)}
        newButtonLabel="Assign Task"
      />

      <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-5">
        {/* Org Hierarchy Perspective & Assignment Governance Card */}
        <div className="beraxis-bento-card p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h1
              className={`text-xl font-black flex items-center gap-2 ${
                isLight ? "text-slate-900" : "text-white"
              }`}
            >
              <GitBranch className="text-purple-500" size={20} />
              Hierarchical Single &amp; Group Tasks
            </h1>
            <p className={`text-xs ${isLight ? "text-slate-600" : "text-gray-400"}`}>
              Tasks can only be assigned downward within your org reporting tree, include strict{" "}
              <strong>Date &amp; Time Deadlines + Priority</strong>, sync live with{" "}
              <strong>Discuss</strong>, and require <strong>Superior Hierarchy Approval</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">
                Viewing Hierarchy As
              </label>
              <select
                value={activeMember?.id || ""}
                onChange={(e) => {
                  setActiveMemberId(e.target.value);
                  setSelectedAssigneeIds([]);
                }}
                className={`rounded-xl px-3 py-2 text-xs font-bold border outline-none cursor-pointer ${
                  isLight
                    ? "bg-white border-slate-300 text-slate-900"
                    : "bg-[#0F172A] border-white/15 text-white"
                }`}
              >
                {members
                  .filter((m) => m.status !== "deactivated")
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role} — {m.department})
                    </option>
                  ))}
              </select>
            </div>

            <div
              className={`px-3.5 py-2 rounded-xl border text-xs ${
                isLight
                  ? "bg-purple-50 border-purple-200 text-purple-900"
                  : "bg-purple-950/30 border-purple-500/30 text-purple-200"
              }`}
            >
              <div className="text-[10px] uppercase font-bold opacity-75">Hierarchy Scope</div>
              <div className="font-bold">
                {subordinateIdSet.size} Subordinate(s) •{" "}
                {directSuperior ? `Approver: ${directSuperior.name}` : "Top Executive"}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={15} /> Assign New Task
            </button>
          </div>
        </div>

        {feedbackBanner && (
          <div
            className={`px-4 py-3 rounded-xl border text-xs font-bold flex items-center justify-between ${
              feedbackBanner.ok
                ? "bg-emerald-500/15 border-emerald-500/35 text-emerald-400"
                : "bg-rose-500/15 border-rose-500/35 text-rose-400"
            }`}
          >
            <span>{feedbackBanner.msg}</span>
            <button onClick={() => setFeedbackBanner(null)} className="cursor-pointer">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Filter Tabs + Priority Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              {
                id: "my_tasks",
                label: "Assigned to Me",
                count: myTasksList.filter((t) => t.status !== "completed").length,
              },
              {
                id: "group_tasks",
                label: "Group Tasks",
                count: groupTasksList.filter((t) => t.status !== "completed").length,
              },
              {
                id: "delegated",
                label: "Assigned to Subordinates",
                count: delegatedList.filter((t) => t.status !== "completed").length,
              },
              {
                id: "approvals",
                label: "Pending My Approval",
                count: pendingApprovalForMeList.length,
              },
              { id: "all", label: "All Hierarchy Tasks", count: tasks.length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/25"
                    : isLight
                    ? "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                    : "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      activeTab === tab.id
                        ? "bg-white text-purple-700"
                        : tab.id === "approvals"
                        ? "bg-rose-500 text-white"
                        : "bg-purple-500/20 text-purple-300"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            {(["all", "urgent", "high", "medium", "low"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriorityFilter(p)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold capitalize border cursor-pointer transition-all ${
                  priorityFilter === p
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                    : isLight
                    ? "bg-white border-slate-200 text-slate-600"
                    : "bg-white/5 border-white/10 text-gray-400"
                }`}
              >
                {p === "all" ? "All Priorities" : p}
              </button>
            ))}
          </div>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="beraxis-bento-card p-12 text-center text-sm text-gray-400">
            Loading isolated hierarchy tasks...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="beraxis-bento-card p-12 text-center space-y-3">
            <CheckSquare size={36} className="mx-auto text-purple-400 opacity-75" />
            <h3 className={`text-base font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
              No Tasks in This View Yet
            </h3>
            <p className={`text-xs max-w-md mx-auto ${isLight ? "text-slate-600" : "text-gray-400"}`}>
              Assign a single-user or group task with Date &amp; Time deadline and Priority to yourself or your subordinates, and collaborate directly inside Discuss.
            </p>
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer"
            >
              + Assign First Task
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTasks.map((task) => {
              const pMeta = PRIORITY_META[task.priority] || PRIORITY_META.medium;
              const dl = formatDeadlineCountdown(
                task.deadlineAt,
                task.dueDate,
                task.dueTime,
                task.status === "completed"
              );
              const unreadChat = taskChatUnreads[task.id] || 0;
              const totalChat = msgCounts[task.id] || 0;
              const canApprove = canIApproveTask(task);
              const mine = isAssignedToMe(task);

              return (
                <div
                  key={task.id}
                  className={`beraxis-bento-card p-5 border transition-all ${
                    dl.overdue
                      ? "border-rose-500/45"
                      : task.status === "pending_approval"
                      ? "border-amber-500/40"
                      : isLight
                      ? "border-slate-200"
                      : "border-white/10"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border inline-flex items-center gap-1 ${pMeta.badgeClass}`}
                        >
                          {task.priority === "urgent" ? <Flame size={11} /> : <Flag size={11} />}
                          {pMeta.label} Priority
                        </span>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${
                            task.assignmentType === "group"
                              ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
                              : "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                          }`}
                        >
                          {task.assignmentType === "group" ? (
                            <>
                              <Users size={11} /> Group: {task.groupName || "Team Group"} (
                              {task.assignees.length})
                            </>
                          ) : (
                            <>
                              <User size={11} /> Single Assignee
                            </>
                          )}
                        </span>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${
                            dl.overdue
                              ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                              : dl.urgentSoon
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                              : "bg-emerald-500/10 text-emerald-300 border-emerald-500/25"
                          }`}
                        >
                          {dl.overdue ? <AlertTriangle size={11} /> : <Clock size={11} />}
                          {dl.text}
                        </span>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            task.status === "completed"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : task.status === "pending_approval"
                              ? "bg-amber-500/20 text-amber-400"
                              : task.status === "changes_requested"
                              ? "bg-rose-500/20 text-rose-400"
                              : task.status === "in_progress"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-slate-500/20 text-slate-300"
                          }`}
                        >
                          {task.status.replace(/_/g, " ")}
                        </span>
                      </div>

                      <h3
                        className={`text-base font-extrabold ${
                          task.status === "completed"
                            ? "line-through opacity-70"
                            : isLight
                            ? "text-slate-900"
                            : "text-white"
                        }`}
                      >
                        {task.title}
                      </h3>

                      {task.description && (
                        <p className={`text-xs ${isLight ? "text-slate-600" : "text-gray-400"}`}>
                          {task.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-gray-400 font-semibold">Assigned to:</span>
                          {task.assignees.map((a) => (
                            <span
                              key={a.id + a.email}
                              className={`px-2 py-0.5 rounded-md font-semibold border ${
                                isLight
                                  ? "bg-slate-100 border-slate-200 text-slate-800"
                                  : "bg-white/5 border-white/10 text-gray-200"
                              }`}
                            >
                              {a.name} <span className="opacity-65">({a.role})</span>
                            </span>
                          ))}
                        </div>

                        <span className="text-gray-500">•</span>
                        <span className="text-gray-400">
                          Assigned by <strong className="text-purple-400">{task.assignerName}</strong>
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-400 flex items-center gap-1">
                          <ShieldCheck size={12} className="text-emerald-400" />
                          Hierarchy Approver:{" "}
                          <strong className="text-emerald-400">{task.approverName}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Right Action Controls: Chat in Discuss + Hierarchy Workflow */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => openTaskChatDrawer(task)}
                        className={`relative px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isLight
                            ? "bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-800"
                            : "bg-orange-500/15 hover:bg-orange-500/25 border-orange-500/35 text-orange-300"
                        }`}
                      >
                        <MessageSquare size={14} />
                        <span>Discuss Chat ({totalChat})</span>
                        {unreadChat > 0 && (
                          <span className="ml-0.5 px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-black rounded-full">
                            {unreadChat}
                          </span>
                        )}
                      </button>

                      {(mine || task.assignerId === activeMember?.id) &&
                        (task.status === "todo" || task.status === "changes_requested") && (
                          <button
                            type="button"
                            onClick={() => handleWorkflowAction(task, "start")}
                            className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Play size={13} /> Start
                          </button>
                        )}

                      {(mine || task.assignerId === activeMember?.id) &&
                        (task.status === "todo" ||
                          task.status === "in_progress" ||
                          task.status === "changes_requested") && (
                          <button
                            type="button"
                            onClick={() => handleWorkflowAction(task, "submit_for_approval")}
                            className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Send size={13} /> Submit for Approval
                          </button>
                        )}

                      {task.status === "pending_approval" && canApprove && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleWorkflowAction(task, "approve")}
                            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 size={14} /> Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleWorkflowAction(task, "reject")}
                            className="px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/35 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <XCircle size={14} /> Request Changes
                          </button>
                        </>
                      )}

                      {task.status === "pending_approval" && !canApprove && (
                        <span className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
                          Awaiting {task.approverName}
                        </span>
                      )}

                      {(task.assignerId === activeMember?.id ||
                        activeMember?.role === "Owner") && (
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task.id)}
                          title="Delete task"
                          className="p-2 rounded-xl text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Hierarchical Task Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-xl rounded-3xl border p-6 shadow-2xl max-h-[92vh] overflow-y-auto ${
              isLight
                ? "bg-white border-slate-200 text-slate-900"
                : "bg-[#0F172A] border-white/15 text-white"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-black flex items-center gap-2">
                  <CheckSquare className="text-purple-500" size={20} />
                  Assign Hierarchical Task
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Assigning as <strong>{activeMember?.name}</strong> ({activeMember?.role}) — only yourself and subordinates in your reporting chain can be assigned.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              {/* Single User vs Group Task Toggle */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAssignmentType("single");
                    if (selectedAssigneeIds.length > 1) {
                      setSelectedAssigneeIds([selectedAssigneeIds[0]]);
                    }
                  }}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer ${
                    assignmentType === "single"
                      ? "bg-purple-600/20 border-purple-500 text-purple-300"
                      : "border-white/10 text-gray-400"
                  }`}
                >
                  <User size={14} /> Single User Task
                </button>
                <button
                  type="button"
                  onClick={() => setAssignmentType("group")}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer ${
                    assignmentType === "group"
                      ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                      : "border-white/10 text-gray-400"
                  }`}
                >
                  <Users size={14} /> Grouped Task (Team Chat)
                </button>
              </div>

              {assignmentType === "group" && (
                <div>
                  <label className="block text-xs font-bold mb-1">Group / Squad Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Evening Floor Squad, Audit Taskforce..."
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none ${
                      isLight
                        ? "bg-slate-50 border-slate-300 text-slate-900"
                        : "bg-[#070B16] border-white/15 text-white"
                    }`}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete Q4 Inventory Reconciliation & Stock Audit"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none ${
                    isLight
                      ? "bg-slate-50 border-slate-300 text-slate-900"
                      : "bg-[#070B16] border-white/15 text-white"
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Instructions / Deliverables</label>
                <textarea
                  rows={2}
                  placeholder="Specify acceptance criteria for hierarchy sign-off..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-2 text-xs outline-none ${
                    isLight
                      ? "bg-slate-50 border-slate-300 text-slate-900"
                      : "bg-[#070B16] border-white/15 text-white"
                  }`}
                />
              </div>

              {/* Date & Time Deadlines + Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1 flex items-center gap-1">
                    <Calendar size={12} className="text-purple-400" /> Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className={`w-full rounded-xl border px-3 py-2 text-xs font-semibold outline-none ${
                      isLight
                        ? "bg-slate-50 border-slate-300 text-slate-900"
                        : "bg-[#070B16] border-white/15 text-white"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 flex items-center gap-1">
                    <Clock size={12} className="text-cyan-400" /> Due Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className={`w-full rounded-xl border px-3 py-2 text-xs font-semibold outline-none ${
                      isLight
                        ? "bg-slate-50 border-slate-300 text-slate-900"
                        : "bg-[#070B16] border-white/15 text-white"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 flex items-center gap-1">
                    <Flag size={12} className="text-amber-400" /> Priority *
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className={`w-full rounded-xl border px-3 py-2 text-xs font-bold outline-none cursor-pointer ${
                      isLight
                        ? "bg-slate-50 border-slate-300 text-slate-900"
                        : "bg-[#070B16] border-white/15 text-white"
                    }`}
                  >
                    <option value="urgent">🔥 Urgent</option>
                    <option value="high">⚡ High</option>
                    <option value="medium">📌 Medium</option>
                    <option value="low">🟦 Low</option>
                  </select>
                </div>
              </div>

              {/* Hierarchy-Filtered Assignee Picker */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold">
                    {assignmentType === "group"
                      ? "Select Group Members (Your Hierarchy Tree)"
                      : "Select Assignee (Yourself or Subordinate)"}
                  </label>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    {assignableMembers.length} eligible in hierarchy
                  </span>
                </div>
                <div className="max-h-44 overflow-y-auto rounded-xl border border-white/10 divide-y divide-white/5 bg-[#070B16]/60">
                  {assignableMembers.map((m) => {
                    const checked = selectedAssigneeIds.includes(m.id);
                    const isSelf = m.id === activeMember?.id;
                    return (
                      <label
                        key={m.id}
                        className="flex items-center justify-between px-3.5 py-2.5 text-xs hover:bg-white/5 cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type={assignmentType === "group" ? "checkbox" : "radio"}
                            name="task_assignee"
                            checked={checked}
                            onChange={() => {
                              if (assignmentType === "single") {
                                setSelectedAssigneeIds([m.id]);
                              } else {
                                setSelectedAssigneeIds((prev) =>
                                  prev.includes(m.id)
                                    ? prev.filter((x) => x !== m.id)
                                    : [...prev, m.id]
                                );
                              }
                            }}
                          />
                          <div>
                            <div className="font-bold text-white">
                              {m.name}{" "}
                              <span className="text-[10px] text-purple-300 font-normal">
                                ({m.role})
                              </span>
                            </div>
                            <div className="text-[10px] text-gray-400">{m.email}</div>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isSelf
                              ? "bg-cyan-500/15 text-cyan-300"
                              : "bg-purple-500/15 text-purple-300"
                          }`}
                        >
                          {isSelf ? "Self" : "Subordinate"}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-[11px] text-emerald-300 flex items-center justify-between">
                <span>
                  <ShieldCheck size={13} className="inline mr-1" />
                  <strong>Hierarchy Approver:</strong>{" "}
                  {selectedAssigneeIds.length === 1 && selectedAssigneeIds[0] === activeMember?.id
                    ? directSuperior?.name || activeMember?.name
                    : activeMember?.name}{" "}
                  • Dedicated Discuss channel auto-created!
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/15 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Assigning..." : "Create & Open Task Thread"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Task Discuss Chat Slide-Over Drawer */}
      {chatTask && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex justify-end">
          <div
            className={`w-full max-w-md h-full flex flex-col border-l shadow-2xl ${
              isLight
                ? "bg-white border-slate-200 text-slate-900"
                : "bg-[#0B101E] border-white/15 text-white"
            }`}
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-extrabold text-orange-400 tracking-wider">
                  Live Task Discuss Thread
                </div>
                <h3 className="text-sm font-bold truncate">{chatTask.title}</h3>
                <p className="text-[11px] text-gray-400 truncate">
                  {chatTask.assignees.map((a) => a.name).join(", ")} • Due {chatTask.dueDate}{" "}
                  {chatTask.dueTime}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Link
                  href={`/discuss?channel=${encodeURIComponent(chatTask.discussChannelId)}`}
                  className="px-2.5 py-1.5 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-300 text-[11px] font-bold flex items-center gap-1"
                >
                  Discuss App <ExternalLink size={11} />
                </Link>
                <button
                  type="button"
                  onClick={() => setChatTask(null)}
                  className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 ? (
                <div className="text-center text-xs text-gray-400 py-10">
                  Start chatting with assignees &amp; managers on this task. All messages sync with the Discuss tab!
                </div>
              ) : (
                chatMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3 rounded-2xl border text-xs ${
                      isLight
                        ? "bg-slate-50 border-slate-200"
                        : "bg-white/5 border-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-purple-400">{m.author_name}</strong>
                      <span className="text-[10px] text-gray-500">
                        {new Date(m.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">{m.body}</p>
                  </div>
                ))
              )}
            </div>

            <form
              onSubmit={sendTaskChatMessage}
              className="p-3 pb-16 border-t border-white/10 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Write a message in this task thread..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className={`flex-1 rounded-xl border px-3.5 py-2.5 text-xs outline-none ${
                  isLight
                    ? "bg-slate-50 border-slate-300 text-slate-900"
                    : "bg-[#070B16] border-white/15 text-white"
                }`}
              />
              <button
                type="submit"
                disabled={sendingChat}
                className="px-3.5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Send size={13} /> Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
