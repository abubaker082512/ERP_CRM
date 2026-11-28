import { NextRequest, NextResponse } from "next/server";
import {
  resolveSafeClusterId,
  verifyClusterAccess,
  readClusterCollection,
  writeClusterCollection,
  savePublicBookingRoutePointer,
  resolvePublicBookingCluster,
} from "@/lib/tenantClusterDb";

export const dynamic = "force-dynamic";

export interface BookingLinkProfile {
  slug: string;
  clusterId: string;
  companyName: string;
  hostName: string;
  hostRole: string;
  hostEmail: string;
  serviceTitle: string;
  bio: string;
  durationMin: number;
  workStartHour: number; // e.g. 9 for 09:00
  workEndHour: number;   // e.g. 18 for 18:00
  utcOffsetMinutes?: number; // e.g. 300 for UTC+5
  timezone: string;
  active: boolean;
  bookingsCount: number;
  createdAt: string;
  updatedAt: string;
}

const LEGACY_DEMO_PROFILES: Record<string, Omit<BookingLinkProfile, "clusterId" | "bookingsCount" | "createdAt" | "updatedAt">> = {
  "erp-demo": {
    slug: "erp-demo",
    companyName: "Beraxis Solutions Studio",
    hostName: "Solutions Engineering Team",
    hostRole: "Enterprise Architecture & Consulting",
    hostEmail: "demo@beraxis.online",
    serviceTitle: "Discovery & Architecture Consultation",
    bio: "Schedule a live walkthrough or sprint scoping session with automatic video conferencing.",
    durationMin: 30,
    workStartHour: 9,
    workEndHour: 18,
    timezone: "UTC+5 (PKT) / Auto-Sync",
    active: true,
  },
};

function cleanSlug(raw: string): string {
  return String(raw || "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function formatHourMinuteTo12h(hour: number, minute: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${String(h12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;
}

export function parseDateAndSlotToRange(
  dateStr: string,
  slotLabel: string,
  durationMin: number,
  utcOffsetMinutes = 0
): { startIso: string; endIso: string; startMs: number; endMs: number } {
  // Parse slotLabel like "10:30 AM", "02:00 PM", or "14:30"
  const trimmed = String(slotLabel || "10:00 AM").trim();
  let hours = 10;
  let minutes = 0;

  const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampmMatch) {
    hours = parseInt(ampmMatch[1], 10);
    minutes = parseInt(ampmMatch[2], 10);
    const mer = ampmMatch[3].toUpperCase();
    if (mer === "PM" && hours < 12) hours += 12;
    if (mer === "AM" && hours === 12) hours = 0;
  } else {
    const h24 = trimmed.match(/^(\d{1,2}):(\d{2})/);
    if (h24) {
      hours = parseInt(h24[1], 10);
      minutes = parseInt(h24[2], 10);
    }
  }

  // Convert host-local wall-clock time to exact UTC timestamp using host's utcOffsetMinutes
  const [y, m, d] = String(dateStr).split("-").map((n) => parseInt(n, 10));
  const wallUtcMs = Date.UTC(y || 2026, (m || 1) - 1, d || 1, hours, minutes, 0, 0);
  const startMs = wallUtcMs - (Number(utcOffsetMinutes) || 0) * 60 * 1000;
  const endMs = startMs + Math.max(15, durationMin) * 60 * 1000;
  return {
    startIso: new Date(startMs).toISOString(),
    endIso: new Date(endMs).toISOString(),
    startMs,
    endMs,
  };
}

function generateAvailableSlots(workStartHour: number, workEndHour: number, durationMin: number): string[] {
  const startH = Math.max(0, Math.min(22, Number(workStartHour) || 9));
  const endH = Math.max(startH + 1, Math.min(23, Number(workEndHour) || 18));
  const step = durationMin >= 60 ? 60 : durationMin === 45 ? 45 : durationMin === 15 ? 30 : 30;
  const slots: string[] = [];
  let totalMins = startH * 60;
  const maxMins = endH * 60;
  while (totalMins + durationMin <= maxMins) {
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    slots.push(formatHourMinuteTo12h(h, m));
    totalMins += step;
  }
  return slots;
}

function computeBlockedSlotsByDate(
  calendarEvents: any[],
  appointments: any[],
  slots: string[],
  durationMin: number,
  utcOffsetMinutes = 0
): { busyIntervals: { start: string; end: string }[]; blockedSlotsByDate: Record<string, string[]> } {
  const busyIntervals: { start: string; end: string; startMs: number; endMs: number }[] = [];

  for (const ev of Array.isArray(calendarEvents) ? calendarEvents : []) {
    if (ev.state === "cancelled") continue;
    const s = ev.start_time ? new Date(ev.start_time).getTime() : NaN;
    const e = ev.end_time ? new Date(ev.end_time).getTime() : s + 3600000;
    if (!isNaN(s) && !isNaN(e)) {
      busyIntervals.push({ start: new Date(s).toISOString(), end: new Date(e).toISOString(), startMs: s, endMs: e });
    }
  }

  for (const ap of Array.isArray(appointments) ? appointments : []) {
    if (ap.status === "cancelled") continue;
    if (ap.date && ap.start_time) {
      const r = parseDateAndSlotToRange(ap.date, ap.start_time, Number(ap.duration_min) || 30, utcOffsetMinutes);
      busyIntervals.push({ start: r.startIso, end: r.endIso, startMs: r.startMs, endMs: r.endMs });
    }
  }

  const blockedSlotsByDate: Record<string, string[]> = {};
  const relevantDates = new Set<string>();
  for (const b of busyIntervals) {
    // Include adjacent UTC dates in case host offset crosses midnight
    const localShifted = new Date(b.startMs + (Number(utcOffsetMinutes) || 0) * 60 * 1000);
    relevantDates.add(localShifted.toISOString().slice(0, 10));
    relevantDates.add(b.start.slice(0, 10));
  }

  for (const dateStr of relevantDates) {
    const blocked: string[] = [];
    for (const slot of slots) {
      const candidate = parseDateAndSlotToRange(dateStr, slot, durationMin, utcOffsetMinutes);
      const overlaps = busyIntervals.some((b) => candidate.startMs < b.endMs && candidate.endMs > b.startMs);
      if (overlaps) blocked.push(slot);
    }
    if (blocked.length > 0) blockedSlotsByDate[dateStr] = blocked;
  }

  return {
    busyIntervals: busyIntervals.map(({ start, end }) => ({ start, end })),
    blockedSlotsByDate,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slugParam = cleanSlug(searchParams.get("slug") || "");

  // 1. Public Visitor Loading /appointments/book/[slug]
  if (slugParam) {
    const clusterId = await resolvePublicBookingCluster(slugParam);
    if (clusterId) {
      const [links, calEvents, appts] = await Promise.all([
        readClusterCollection<BookingLinkProfile[]>(clusterId, "booking_links", []),
        readClusterCollection<any[]>(clusterId, "calendar_events", []),
        readClusterCollection<any[]>(clusterId, "appointments", []),
      ]);
      const profile = links.find((l) => l.slug === slugParam) || links[0];
      if (profile && profile.active !== false) {
        const slots = generateAvailableSlots(profile.workStartHour, profile.workEndHour, profile.durationMin);
        const { busyIntervals, blockedSlotsByDate } = computeBlockedSlotsByDate(
          calEvents,
          appts,
          slots,
          profile.durationMin,
          profile.utcOffsetMinutes ?? 0
        );
        return NextResponse.json(
          {
            success: true,
            profile,
            availableSlots: slots,
            busyIntervals,
            blockedSlotsByDate,
          },
          { headers: { "Cache-Control": "no-store" } }
        );
      }
    }

    // Fallback for legacy built-in demo slugs
    const fallbackBase = LEGACY_DEMO_PROFILES[slugParam] || {
      ...LEGACY_DEMO_PROFILES["erp-demo"],
      slug: slugParam,
    };
    const slots = generateAvailableSlots(fallbackBase.workStartHour, fallbackBase.workEndHour, fallbackBase.durationMin);
    return NextResponse.json(
      {
        success: true,
        profile: {
          ...fallbackBase,
          clusterId: "DEMO",
          bookingsCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        availableSlots: slots,
        busyIntervals: [],
        blockedSlotsByDate: {},
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  // 2. Authenticated Workspace Owner / Member Listing or Auto-Initializing Their Shareable Calendar Link
  const rawCompanyId = searchParams.get("company_id") || searchParams.get("cluster_id");
  const email = (searchParams.get("email") || "").trim().toLowerCase() || undefined;
  if (!rawCompanyId && !email) {
    return NextResponse.json({ success: true, links: [] });
  }

  const clusterId = resolveSafeClusterId(rawCompanyId, email);
  const access = await verifyClusterAccess(clusterId, email);
  if (!access.allowed) {
    return NextResponse.json({ success: false, error: access.reason || "Access denied" }, { status: 403 });
  }

  let links = await readClusterCollection<BookingLinkProfile[]>(clusterId, "booking_links", []);

  if (links.length === 0 && searchParams.get("auto_init") === "1") {
    const companyName = searchParams.get("company_name") || "Software & Consulting Studio";
    const hostName = searchParams.get("host_name") || (email ? email.split("@")[0].replace(/[._-]/g, " ") : "Project Lead");
    const utcOffsetMinutes = Number(searchParams.get("utc_offset") || 0);
    const tzName = searchParams.get("tz") || "Local Time";
    const baseSlug = cleanSlug(`${companyName}-${clusterId.slice(-4)}`) || `studio-${Date.now().toString().slice(-5)}`;
    const now = new Date().toISOString();
    const defaultLink: BookingLinkProfile = {
      slug: baseSlug,
      clusterId,
      companyName,
      hostName,
      hostRole: "Solutions Lead & Project Manager",
      hostEmail: email || "",
      serviceTitle: "Project Discovery & Calendar Consultation",
      bio: `Schedule a meeting directly on ${companyName}'s live calendar. Busy hours are automatically blocked and an encrypted video room is created instantly.`,
      durationMin: 30,
      workStartHour: 9,
      workEndHour: 18,
      utcOffsetMinutes,
      timezone: tzName,
      active: true,
      bookingsCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    links = [defaultLink];
    await writeClusterCollection(clusterId, "booking_links", links, { ownerEmail: email, companyName });
    await savePublicBookingRoutePointer(defaultLink.slug, clusterId);
  }

  return NextResponse.json({ success: true, clusterId, links }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || "book_slot";

    // 1. Authenticated Workspace Owner / Member Saving or Customizing Shareable Calendar Link
    if (action === "save_link") {
      const email = String(body.owner_email || body.email || "").trim().toLowerCase() || undefined;
      const clusterId = resolveSafeClusterId(body.company_id || body.companyId || body.cluster_id, email);
      const access = await verifyClusterAccess(clusterId, email);
      if (!access.allowed) {
        return NextResponse.json({ success: false, error: access.reason || "Access denied" }, { status: 403 });
      }

      const existing = await readClusterCollection<BookingLinkProfile[]>(clusterId, "booking_links", []);
      const companyName = String(body.companyName || "Software & Consulting Studio").trim();
      const requestedSlug = cleanSlug(body.slug || `${companyName}-${clusterId.slice(-4)}`);
      const slug = requestedSlug || `cal-${Date.now().toString().slice(-6)}`;

      // Ensure another tenant doesn't already own this exact slug
      const existingOwnerCluster = await resolvePublicBookingCluster(slug);
      const finalSlug =
        existingOwnerCluster && existingOwnerCluster !== clusterId
          ? `${slug}-${clusterId.slice(-4).toLowerCase()}`
          : slug;

      const now = new Date().toISOString();
      const prev = existing.find((l) => l.slug === finalSlug) || existing[0];

      const updatedLink: BookingLinkProfile = {
        slug: finalSlug,
        clusterId,
        companyName,
        hostName: String(body.hostName || prev?.hostName || "Solutions Lead").trim(),
        hostRole: String(body.hostRole || prev?.hostRole || "Principal Consultant").trim(),
        hostEmail: email || prev?.hostEmail || "",
        serviceTitle: String(body.serviceTitle || prev?.serviceTitle || "Discovery & Scoping Meeting").trim(),
        bio: String(
          body.bio ||
            prev?.bio ||
            `Book an available slot directly on ${companyName}'s calendar.`
        ).trim(),
        durationMin: [15, 30, 45, 60].includes(Number(body.durationMin)) ? Number(body.durationMin) : 30,
        workStartHour: Math.max(0, Math.min(22, Number(body.workStartHour ?? prev?.workStartHour ?? 9))),
        workEndHour: Math.max(1, Math.min(23, Number(body.workEndHour ?? prev?.workEndHour ?? 18))),
        utcOffsetMinutes: Number(body.utcOffsetMinutes ?? prev?.utcOffsetMinutes ?? 0),
        timezone: String(body.timezone || prev?.timezone || "Local Time").trim(),
        active: body.active !== false,
        bookingsCount: prev?.bookingsCount || 0,
        createdAt: prev?.createdAt || now,
        updatedAt: now,
      };

      const nextLinks = [updatedLink, ...existing.filter((l) => l.slug !== finalSlug)];
      await writeClusterCollection(clusterId, "booking_links", nextLinks, { ownerEmail: email, companyName });
      await savePublicBookingRoutePointer(finalSlug, clusterId);

      return NextResponse.json({ success: true, clusterId, link: updatedLink, links: nextLinks });
    }

    // 2. External Customer Booking a Slot on /appointments/book/[slug]
    if (action === "book_slot") {
      const slug = cleanSlug(body.slug || "");
      const clientName = String(body.clientName || "").trim();
      const clientEmail = String(body.clientEmail || "").trim();
      const clientPhone = String(body.clientPhone || "").trim();
      const clientCompany = String(body.clientCompany || "").trim();
      const meetingTopic = String(body.meetingTopic || "").trim();
      const dateStr = String(body.date || "").trim();
      const slotTime = String(body.time || "").trim();

      if (!slug || !clientName || !clientEmail || !dateStr || !slotTime) {
        return NextResponse.json(
          { success: false, error: "Client name, email, date, and time slot are required." },
          { status: 400 }
        );
      }

      const clusterId = await resolvePublicBookingCluster(slug);
      const origin = String(body.origin || "https://www.beraxis.online").replace(/\/+$/, "");
      const meetingCode = `meet-${cleanSlug(clientName).slice(0, 12) || "guest"}-${Math.floor(1000 + Math.random() * 9000)}`;
      const meetUrl = `${origin}/meet/${meetingCode}`;

      // If this is a real company/solo booking slug, check busy conflicts & persist into isolated Calendar + Appointments!
      if (clusterId) {
        const [links, calEvents, appts] = await Promise.all([
          readClusterCollection<BookingLinkProfile[]>(clusterId, "booking_links", []),
          readClusterCollection<any[]>(clusterId, "calendar_events", []),
          readClusterCollection<any[]>(clusterId, "appointments", []),
        ]);
        const link = links.find((l) => l.slug === slug) || links[0];
        const durationMin = link?.durationMin || 30;
        const utcOffset = link?.utcOffsetMinutes ?? 0;
        const range = parseDateAndSlotToRange(dateStr, slotTime, durationMin, utcOffset);

        // Atomic double-booking conflict check!
        const hasCalConflict = (Array.isArray(calEvents) ? calEvents : []).some((ev) => {
          if (ev.state === "cancelled") return false;
          const s = ev.start_time ? new Date(ev.start_time).getTime() : NaN;
          const e = ev.end_time ? new Date(ev.end_time).getTime() : s + 3600000;
          return !isNaN(s) && !isNaN(e) && range.startMs < e && range.endMs > s;
        });

        const hasApptConflict = (Array.isArray(appts) ? appts : []).some((ap) => {
          if (ap.status === "cancelled" || !ap.date || !ap.start_time) return false;
          const r = parseDateAndSlotToRange(ap.date, ap.start_time, Number(ap.duration_min) || 30, utcOffset);
          return range.startMs < r.endMs && range.endMs > r.startMs;
        });

        if (hasCalConflict || hasApptConflict) {
          return NextResponse.json(
            {
              success: false,
              conflict: true,
              error: "This timeslot is already booked on the host's calendar. Please pick another slot.",
            },
            { status: 409 }
          );
        }

        const now = new Date().toISOString();
        const serviceTitle = link?.serviceTitle || "Client Discovery Meeting";

        // 1. Write directly to isolated `calendar_events` so it appears on /calendar AND triggers Notification Bell!
        const newCalEvent = {
          id: `EVT-BK-${Date.now()}`,
          cluster_id: clusterId,
          title: `${clientName}${clientCompany ? ` (${clientCompany})` : ""} — ${serviceTitle}`,
          event_type: "appointment",
          start_time: range.startIso,
          end_time: range.endIso,
          description: meetingTopic || `Booked via public calendar link (/appointments/book/${slug})`,
          customer_name: clientName,
          customer_email: clientEmail,
          assignee: link?.hostName || "",
          meet_link: meetUrl,
          notes: clientPhone ? `Phone: ${clientPhone}` : "",
          state: "confirmed",
          created_at: now,
        };

        // 2. Write directly to isolated `appointments` so it appears in /appointments too!
        const newAppt = {
          id: `APT/${new Date().getFullYear()}/${String((appts?.length || 0) + 1).padStart(3, "0")}`,
          meeting_code: meetingCode,
          title: serviceTitle,
          client_name: clientName,
          client_email: clientEmail,
          client_phone: clientPhone || undefined,
          company: clientCompany || "External Customer",
          host_name: link?.hostName || "Workspace Host",
          host_slug: slug,
          host_role: link?.hostRole || "Lead Consultant",
          date: dateStr,
          start_time: slotTime,
          end_time: formatHourMinuteTo12h(
            new Date(range.endMs).getUTCHours(),
            new Date(range.endMs).getUTCMinutes()
          ),
          duration_min: durationMin,
          type: "erp_demo",
          status: "confirmed",
          session_fee: 0,
          room_or_chair: "Beraxis Video Meet",
          notes: meetingTopic || "Scheduled by customer via public calendar booking link",
        };

        const updatedLinks = links.map((l) =>
          l.slug === (link?.slug || slug) ? { ...l, bookingsCount: (l.bookingsCount || 0) + 1, updatedAt: now } : l
        );

        await Promise.all([
          writeClusterCollection(clusterId, "calendar_events", [newCalEvent, ...calEvents], {
            ownerEmail: link?.hostEmail || undefined,
          }),
          writeClusterCollection(clusterId, "appointments", [newAppt, ...appts], {
            ownerEmail: link?.hostEmail || undefined,
          }),
          writeClusterCollection(clusterId, "booking_links", updatedLinks, {
            ownerEmail: link?.hostEmail || undefined,
          }),
        ]);

        return NextResponse.json({
          success: true,
          booked: {
            meetingId: meetingCode,
            meetUrl,
            calendarEventId: newCalEvent.id,
            appointmentId: newAppt.id,
            date: dateStr,
            time: slotTime,
            durationMin,
            hostName: link?.hostName || "Host",
            companyName: link?.companyName || "Workspace",
            serviceTitle,
          },
        });
      }

      // Demo slug fallback
      return NextResponse.json({
        success: true,
        booked: {
          meetingId: meetingCode,
          meetUrl,
          date: dateStr,
          time: slotTime,
          durationMin: 30,
        },
      });
    }

    return NextResponse.json({ success: false, error: "Unsupported booking action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Public booking API error" },
      { status: 400 }
    );
  }
}
