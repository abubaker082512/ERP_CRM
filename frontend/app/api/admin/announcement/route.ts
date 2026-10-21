import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ANNOUNCEMENT_FILE = path.join(process.cwd(), "scratch", "announcement.json");

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
  try {
    if (fs.existsSync(ANNOUNCEMENT_FILE)) {
      const raw = fs.readFileSync(ANNOUNCEMENT_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_ANNOUNCEMENT, ...parsed };
    }
  } catch {}
  return DEFAULT_ANNOUNCEMENT;
}

function saveAnnouncement(data: AnnouncementData) {
  try {
    const dir = path.dirname(ANNOUNCEMENT_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ANNOUNCEMENT_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("[Announcement API] Error writing announcement.json:", err);
  }
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
