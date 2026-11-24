import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function toGoogleCsvUrl(rawUrl: string): string | null {
  try {
    const u = new URL(rawUrl.trim());
    if (!u.hostname.includes("docs.google.com")) return null;
    const match = u.pathname.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) return null;
    const sheetId = match[1];
    const gid = u.searchParams.get("gid") || (u.hash.match(/gid=(\d+)/)?.[1]) || "0";
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Google Sheets URL is required." }, { status: 400 });
    }
    const csvUrl = toGoogleCsvUrl(url);
    if (!csvUrl) {
      return NextResponse.json(
        { error: "Invalid Google Sheets link. Paste a standard docs.google.com/spreadsheets/d/... URL." },
        { status: 400 }
      );
    }

    const res = await fetch(csvUrl, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Could not fetch sheet. Make sure the Google Sheet sharing is set to 'Anyone with the link can view'." },
        { status: 400 }
      );
    }
    const csvText = await res.text();
    if (csvText.trim().startsWith("<!DOCTYPE html") || csvText.trim().startsWith("<html")) {
      return NextResponse.json(
        { error: "Google Sheet is private. Set sharing to 'Anyone with the link (Viewer)' to sync." },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, csvText });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to sync Google Sheet" }, { status: 500 });
  }
}
