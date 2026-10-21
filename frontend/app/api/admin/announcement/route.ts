import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

const TMP_ANNOUNCEMENT_FILE = path.join(os.tmpdir(), "beraxis_announcement.json");
const LOCAL_ANNOUNCEMENT_FILE = path.join(process.cwd(), "scratch", "announcement.json");

export interface AnnouncementData {
  message: string;
  banner_type: "info" | "alert" | "warning" | "success";
  is_active: boolean;
  updated_at?: string;
  updated_by?: string;
}

const DEFAULT_ANNOUNCEMENT: AnnouncementData = {
  message: "Welcome to Beraxis Autonomous ERP & CRM — Enterprise Multi-Tenant Workspace Active.",
  banner_type: "info",
  is_active: true,
  updated_at: new Date().toISOString(),
  updated_by: "Super Admin"
};

function loadAnnouncement(): AnnouncementData {
  // 1. Check global memory
  if ((globalThis as any).__beraxis_announcement) {
    return (globalThis as any).__beraxis_announcement;
  }

  // 2. Check /tmp file (writable on Vercel and Linux serverless)
  try {
    if (fs.existsSync(TMP_ANNOUNCEMENT_FILE)) {
      const raw = fs.readFileSync(TMP_ANNOUNCEMENT_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.message === "string") {
        (globalThis as any).__beraxis_announcement = { ...DEFAULT_ANNOUNCEMENT, ...parsed };
        return (globalThis as any).__beraxis_announcement;
      }
    }
  } catch {}

  // 3. Check local scratch file
  try {
    if (fs.existsSync(LOCAL_ANNOUNCEMENT_FILE)) {
      const raw = fs.readFileSync(LOCAL_ANNOUNCEMENT_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.message === "string") {
        (globalThis as any).__beraxis_announcement = { ...DEFAULT_ANNOUNCEMENT, ...parsed };
        return (globalThis as any).__beraxis_announcement;
      }
    }
  } catch {}

  return DEFAULT_ANNOUNCEMENT;
}

function saveAnnouncement(data: AnnouncementData) {
  // Store in global process memory
  (globalThis as any).__beraxis_announcement = data;

  // Store in /tmp (guaranteed writable on Vercel)
  try {
    fs.writeFileSync(TMP_ANNOUNCEMENT_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Announcement API] Error writing tmp announcement:", err);
  }

  // Store in scratch if writable
  try {
    const dir = path.dirname(LOCAL_ANNOUNCEMENT_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOCAL_ANNOUNCEMENT_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch {}
}

export async function GET() {
  const announcement = loadAnnouncement();
  return NextResponse.json(announcement);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const current = loadAnnouncement();
    const updated: AnnouncementData = {
      message: body.message !== undefined ? String(body.message) : current.message,
      banner_type: body.banner_type || current.banner_type || "info",
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : current.is_active,
      updated_at: new Date().toISOString(),
      updated_by: "Super Admin"
    };

    saveAnnouncement(updated);
    return NextResponse.json({ status: "success", announcement: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update announcement" }, { status: 400 });
  }
}
