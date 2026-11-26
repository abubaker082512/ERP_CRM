"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useBranchContext } from "./branchContext";

export interface NotificationFeedItem {
  id: string;
  moduleHref: string;
  moduleLabel: string;
  title: string;
  subtitle: string;
  timestamp?: string;
}

export interface ModuleBadgeMap {
  "/tasks": number;
  "/approvals": number;
  "/calendar": number;
  "/discuss": number;
  "/forms": number;
  [href: string]: number;
}

interface NotificationContextValue {
  badges: ModuleBadgeMap;
  totalUnread: number;
  channelUnreads: Record<string, number>;
  taskChatUnreads: Record<string, number>;
  feedItems: NotificationFeedItem[];
  refreshNotifications: () => Promise<void>;
  markModuleSeen: (moduleHref: string) => void;
  markChannelSeen: (channelId: string, latestCount?: number) => void;
  getBadgeForHref: (href: string) => number;
}

const DEFAULT_BADGES: ModuleBadgeMap = {
  "/tasks": 0,
  "/approvals": 0,
  "/calendar": 0,
  "/discuss": 0,
  "/forms": 0,
};

const NotificationContext = createContext<NotificationContextValue>({
  badges: DEFAULT_BADGES,
  totalUnread: 0,
  channelUnreads: {},
  taskChatUnreads: {},
  feedItems: [],
  refreshNotifications: async () => {},
  markModuleSeen: () => {},
  markChannelSeen: () => {},
  getBadgeForHref: () => 0,
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { activeBranch, getEntityStorageKey } = useBranchContext();
  const pathname = usePathname();
  const companyId = activeBranch?.id || "";

  const [badges, setBadges] = useState<ModuleBadgeMap>(DEFAULT_BADGES);
  const [channelUnreads, setChannelUnreads] = useState<Record<string, number>>({});
  const [taskChatUnreads, setTaskChatUnreads] = useState<Record<string, number>>({});
  const [feedItems, setFeedItems] = useState<NotificationFeedItem[]>([]);

  const getUserIdentity = useCallback(() => {
    try {
      const raw =
        localStorage.getItem("user") ||
        localStorage.getItem("auth_data") ||
        localStorage.getItem("user_data");
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          email: (parsed.email || parsed.user?.email || "").trim().toLowerCase(),
          memberId: parsed.memberId || parsed.id || parsed.user?.id || "",
        };
      }
    } catch {}
    return { email: "", memberId: "" };
  }, []);

  const readSeenState = useCallback(() => {
    try {
      const key = getEntityStorageKey("notif_seen_v1");
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      modules: {} as Record<string, string>,
      channelCounts: {} as Record<string, number>,
      knownEventIds: [] as string[],
      knownSubmissionIds: [] as string[],
    };
  }, [getEntityStorageKey]);

  const writeSeenState = useCallback(
    (next: any) => {
      try {
        const key = getEntityStorageKey("notif_seen_v1");
        localStorage.setItem(key, JSON.stringify(next));
      } catch {}
    },
    [getEntityStorageKey]
  );

  const refreshNotifications = useCallback(async () => {
    if (typeof window === "undefined") return;
    const { email, memberId } = getUserIdentity();
    if (!companyId && !email) return;

    try {
      const params = new URLSearchParams();
      if (companyId) params.set("company_id", companyId);
      if (email) params.set("email", email);
      if (memberId) params.set("member_id", memberId);

      const res = await fetch(`/api/notifications/counts?${params.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      if (!data?.success) return;

      const seen = readSeenState();
      const seenChannelCounts: Record<string, number> = seen.channelCounts || {};
      const seenModules: Record<string, string> = seen.modules || {};

      // 1. Tasks count: always show actionable tasks (assigned to me or awaiting my hierarchy approval)
      const tasksCount = Number(data.tasks?.actionableCount || 0);

      // 2. Approvals count: always show pending approvals in my hierarchy inbox
      const approvalsCount = Number(data.approvals?.pendingCount || 0);

      // 3. Calendar count: events created after lastSeen["/calendar"] OR upcoming within next 24h not yet acknowledged
      const calLastSeen = seenModules["/calendar"] ? new Date(seenModules["/calendar"]).getTime() : 0;
      const nowMs = Date.now();
      const calEvents: any[] = Array.isArray(data.calendar?.events) ? data.calendar.events : [];
      const unseenCalEvents = calEvents.filter((ev) => {
        const createdMs = ev.created_at ? new Date(ev.created_at).getTime() : 0;
        const startMs = ev.start_time ? new Date(ev.start_time).getTime() : 0;
        if (createdMs > calLastSeen) return true;
        // Upcoming today/next 24h if user hasn't opened /calendar in the last hour
        if (startMs >= nowMs - 3600000 && startMs <= nowMs + 86400000 && nowMs - calLastSeen > 3600000) {
          return true;
        }
        return false;
      });
      const calendarCount = unseenCalEvents.length;

      // 4. Discuss count: per-channel unread messages (totalMessages - seenChannelCounts[ch.id])
      const nextChUnreads: Record<string, number> = {};
      const nextTaskUnreads: Record<string, number> = {};
      let discussTotal = 0;

      const discussChannels: any[] = Array.isArray(data.discuss?.channels) ? data.discuss.channels : [];
      for (const ch of discussChannels) {
        const total = Number(ch.totalMessages || 0);
        const prevSeenCount =
          typeof seenChannelCounts[ch.id] === "number" ? seenChannelCounts[ch.id] : 0;
        const delta = Math.max(0, total - prevSeenCount);
        nextChUnreads[ch.id] = delta;
        if (ch.taskId) {
          nextTaskUnreads[ch.taskId] = delta;
        }
        discussTotal += delta;
      }

      // 5. Forms count: submissions after lastSeen["/forms"]
      const formsLastSeen = seenModules["/forms"] ? new Date(seenModules["/forms"]).getTime() : 0;
      const submissions: any[] = Array.isArray(data.forms?.submissions) ? data.forms.submissions : [];
      const unseenForms = submissions.filter((s) => {
        const t = s.createdAt ? new Date(s.createdAt).getTime() : 0;
        return t > formsLastSeen;
      });
      const formsCount = unseenForms.length;

      setChannelUnreads(nextChUnreads);
      setTaskChatUnreads(nextTaskUnreads);
      setBadges({
        "/tasks": tasksCount,
        "/approvals": approvalsCount,
        "/calendar": calendarCount,
        "/discuss": discussTotal,
        "/forms": formsCount,
      });

      // Build unified notification dropdown feed
      const feed: NotificationFeedItem[] = [];
      for (const t of data.tasks?.items || []) {
        feed.push({
          id: `tsk-${t.id}`,
          moduleHref: "/tasks",
          moduleLabel: "Tasks",
          title: t.title,
          subtitle:
            t.status === "pending_approval"
              ? `Awaiting Hierarchy Approval • ${t.priority.toUpperCase()}`
              : `${t.assignmentType === "group" ? "Group Task" : "Assigned Task"} • Due ${t.dueDate} ${t.dueTime}`,
          timestamp: t.updatedAt,
        });
      }
      for (const a of data.approvals?.items || []) {
        feed.push({
          id: `apr-${a.id}`,
          moduleHref: "/approvals",
          moduleLabel: "Approvals",
          title: a.title,
          subtitle: `From ${a.requesterName} • ${a.module.toUpperCase()}`,
          timestamp: a.createdAt,
        });
      }
      for (const ch of discussChannels) {
        const u = nextChUnreads[ch.id] || 0;
        if (u > 0) {
          const lastMsg =
            Array.isArray(ch.recentMessages) && ch.recentMessages.length > 0
              ? ch.recentMessages[ch.recentMessages.length - 1]
              : null;
          feed.push({
            id: `msg-${ch.id}`,
            moduleHref: `/discuss?channel=${encodeURIComponent(ch.id)}`,
            moduleLabel: "Discuss",
            title: `#${ch.name} (${u} new)`,
            subtitle: lastMsg
              ? `${lastMsg.author_name}: ${lastMsg.body}`
              : `${u} unread message(s)`,
            timestamp: lastMsg?.created_at,
          });
        }
      }
      for (const ev of unseenCalEvents.slice(0, 5)) {
        feed.push({
          id: `cal-${ev.id}`,
          moduleHref: "/calendar",
          moduleLabel: "Calendar",
          title: ev.title,
          subtitle: ev.start_time
            ? `Scheduled: ${new Date(ev.start_time).toLocaleString()}`
            : "New Calendar Event",
          timestamp: ev.created_at,
        });
      }
      for (const sub of unseenForms.slice(0, 5)) {
        feed.push({
          id: `frm-${sub.id}`,
          moduleHref: "/forms",
          moduleLabel: "Forms",
          title: `New Submission: ${sub.formTitle}`,
          subtitle: `Lead: ${sub.leadName}`,
          timestamp: sub.createdAt,
        });
      }

      setFeedItems(feed.slice(0, 20));
    } catch {}
  }, [companyId, getUserIdentity, readSeenState]);

  const markModuleSeen = useCallback(
    (moduleHref: string) => {
      const seen = readSeenState();
      seen.modules = {
        ...(seen.modules || {}),
        [moduleHref]: new Date().toISOString(),
      };
      writeSeenState(seen);
      if (moduleHref === "/calendar" || moduleHref === "/forms") {
        setBadges((prev) => ({ ...prev, [moduleHref]: 0 }));
      }
    },
    [readSeenState, writeSeenState]
  );

  const markChannelSeen = useCallback(
    (channelId: string, latestCount?: number) => {
      const seen = readSeenState();
      const prevCount = seen.channelCounts?.[channelId] || 0;
      const currentUnread = channelUnreads[channelId] || 0;
      const newCount =
        typeof latestCount === "number" ? latestCount : prevCount + currentUnread;

      seen.channelCounts = {
        ...(seen.channelCounts || {}),
        [channelId]: newCount,
      };
      writeSeenState(seen);

      setChannelUnreads((prev) => {
        const next = { ...prev, [channelId]: 0 };
        const sum = Object.values(next).reduce((a, b) => a + b, 0);
        setBadges((b) => ({ ...b, "/discuss": sum }));
        return next;
      });
      if (channelId.startsWith("TASK-")) {
        const taskId = channelId.replace(/^TASK-/, "");
        setTaskChatUnreads((prev) => ({ ...prev, [taskId]: 0 }));
      }
    },
    [channelUnreads, readSeenState, writeSeenState]
  );

  // Auto-mark date-based modules when user navigates directly into them
  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith("/calendar")) markModuleSeen("/calendar");
    if (pathname.startsWith("/forms")) markModuleSeen("/forms");
  }, [pathname, markModuleSeen]);

  // Poll live counts every 12s & on custom 'beraxis-notify-refresh' event for instant badge updates!
  useEffect(() => {
    refreshNotifications();
    const timer = setInterval(refreshNotifications, 12000);
    const onManualRefresh = () => {
      refreshNotifications();
    };
    window.addEventListener("beraxis-notify-refresh", onManualRefresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener("beraxis-notify-refresh", onManualRefresh);
    };
  }, [refreshNotifications]);

  const getBadgeForHref = useCallback(
    (href: string): number => {
      if (!href) return 0;
      if (typeof badges[href] === "number") return badges[href];
      const match = Object.keys(badges).find((k) => href === k || href.startsWith(`${k}/`));
      return match ? badges[match] || 0 : 0;
    },
    [badges]
  );

  const totalUnread =
    (badges["/tasks"] || 0) +
    (badges["/approvals"] || 0) +
    (badges["/calendar"] || 0) +
    (badges["/discuss"] || 0) +
    (badges["/forms"] || 0);

  return (
    <NotificationContext.Provider
      value={{
        badges,
        totalUnread,
        channelUnreads,
        taskChatUnreads,
        feedItems,
        refreshNotifications,
        markModuleSeen,
        markChannelSeen,
        getBadgeForHref,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}

export function triggerNotificationRefresh() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("beraxis-notify-refresh"));
  }
}
