import { NextRequest, NextResponse } from "next/server";
import {
  BERAXIS_SENDER_EMAIL,
  isGmailConfigured,
  sendBeraxisEmail,
} from "@/lib/gmailMailer";

export const maxDuration = 300;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hgmdredpqwuooxbbsejw.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbWRyZWRwcXd1b294YmJzZWp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDA4MDIxNywiZXhwIjoyMTA1NjU2MjE3fQ.jZCH75eRrhrQ2A_8Avu-MGwQwctohyF-ocioBAh3oXU";

async function fetchAllSupabaseUsers(): Promise<
  Array<{ email: string; name: string; plan: string; company: string }>
> {
  const collected: Array<{ email: string; name: string; plan: string; company: string }> = [];
  for (let page = 1; page <= 10; page++) {
    const res = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=100`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        cache: "no-store",
      }
    );
    if (!res.ok) break;
    const data = await res.json();
    const users = Array.isArray(data?.users) ? data.users : [];
    for (const u of users) {
      if (u?.email) {
        collected.push({
          email: String(u.email).trim().toLowerCase(),
          name:
            u.user_metadata?.full_name ||
            u.user_metadata?.name ||
            String(u.email).split("@")[0],
          plan: String(u.user_metadata?.plan || "One App Free"),
          company: String(
            u.user_metadata?.company_name || u.user_metadata?.company || ""
          ),
        });
      }
    }
    if (users.length < 100) break;
  }
  return collected;
}

function formatFallbackName(email: string): string {
  const prefix = (email.split("@")[0] || "there").replace(/[._-]+/g, " ").trim();
  return prefix.replace(/\b\w/g, (c) => c.toUpperCase()) || "there";
}

function applyPersonalization(
  template: string,
  user: { email: string; name?: string; plan?: string; company?: string }
): string {
  const fullName = (user.name || "").trim() || formatFallbackName(user.email);
  const firstName = fullName.split(/\s+/)[0] || fullName;
  const plan = (user.plan || "One App Free").trim();
  const company = (user.company || "your workspace").trim();

  return template
    .replace(/\{\{\s*name\s*\}\}/gi, fullName)
    .replace(/\{\{\s*first_name\s*\}\}/gi, firstName)
    .replace(/\{\{\s*email\s*\}\}/gi, user.email)
    .replace(/\{\{\s*plan\s*\}\}/gi, plan)
    .replace(/\{\{\s*company\s*\}\}/gi, company);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const mode: "specific" | "bulk_all" | "bulk_free" | "bulk_paid" =
      body?.mode || "specific";
    const subject = String(body?.subject || "").trim();
    const message = String(body?.message || "").trim();
    const rawHtmlBody = String(body?.htmlBody || "").trim();

    if (!subject || (!message && !rawHtmlBody)) {
      return NextResponse.json(
        { ok: false, error: "Subject and message are required." },
        { status: 400 }
      );
    }

    // Extract inline base64 images into CID attachments so Gmail/Outlook render uploaded pictures reliably
    const inlineAttachments: Array<{
      filename: string;
      content: Buffer;
      cid: string;
      contentType: string;
    }> = [];

    let processedHtmlBody = rawHtmlBody || message.replace(/\n/g, "<br/>");
    let imgIndex = 0;
    processedHtmlBody = processedHtmlBody.replace(
      /src=["']data:(image\/[a-zA-Z0-9.+-]+);base64,([^"']+)["']/gi,
      (_match, mime: string, b64: string) => {
        const ext = (mime.split("/")[1] || "png").replace(/[^a-z0-9]/gi, "");
        const cid = `beraxis_img_${imgIndex++}@beraxis.online`;
        inlineAttachments.push({
          filename: `image_${imgIndex}.${ext}`,
          content: Buffer.from(b64, "base64"),
          cid,
          contentType: mime,
        });
        return `src="cid:${cid}"`;
      }
    );

    if (!isGmailConfigured()) {
      return NextResponse.json(
        {
          ok: false,
          error: "GMAIL_APP_PASSWORD is not configured on the server.",
        },
        { status: 400 }
      );
    }

    let targets: Array<{ email: string; name?: string; plan?: string; company?: string }> = [];
    const passedDetails: Array<{ email: string; name?: string; plan?: string; company?: string }> =
      Array.isArray(body?.recipientDetails) ? body.recipientDetails : [];
    const detailsByEmail = new Map(
      passedDetails
        .filter((d) => d?.email)
        .map((d) => [String(d.email).trim().toLowerCase(), d])
    );

    const needsSupabaseLookup =
      mode === "bulk_free" ||
      mode === "bulk_paid" ||
      mode === "bulk_all" ||
      /\{\{\s*(name|first_name|plan|company)\s*\}\}/i.test(`${subject} ${processedHtmlBody}`);

    const allUsers = needsSupabaseLookup ? await fetchAllSupabaseUsers() : [];
    const supaByEmail = new Map(allUsers.map((u) => [u.email, u]));

    const enrichTarget = (email: string) => {
      const clean = email.trim().toLowerCase();
      const supa = supaByEmail.get(clean);
      const passed = detailsByEmail.get(clean);
      return {
        email: clean,
        name: passed?.name || supa?.name || formatFallbackName(clean),
        plan: passed?.plan || supa?.plan || "One App Free",
        company: passed?.company || supa?.company || "your workspace",
      };
    };

    if (mode === "specific") {
      const rawList: string[] = Array.isArray(body?.recipients)
        ? body.recipients
        : String(body?.recipients || "")
            .split(/[\s,;]+/)
            .filter(Boolean);
      const unique = Array.from(
        new Set(
          rawList
            .map((e) => e.trim().toLowerCase())
            .filter((e) => e.includes("@"))
        )
      );
      targets = unique.map(enrichTarget);
    } else {
      const passedRecipients: string[] = Array.isArray(body?.recipients)
        ? body.recipients
            .map((e: any) => String(e).trim().toLowerCase())
            .filter((e: string) => e.includes("@"))
        : [];

      if (passedRecipients.length > 0 && mode === "bulk_all") {
        targets = Array.from(new Set(passedRecipients))
          .filter((e) => e !== BERAXIS_SENDER_EMAIL.toLowerCase())
          .map(enrichTarget);
      } else {
        const filtered = allUsers.filter((u) => {
          if (u.email === BERAXIS_SENDER_EMAIL.toLowerCase()) return false;
          const p = u.plan.toLowerCase();
          const isPaid =
            p.includes("standard") ||
            p.includes("custom") ||
            p.includes("enterprise") ||
            p.includes("pro") ||
            p.includes("paid");
          if (mode === "bulk_free") return !isPaid;
          if (mode === "bulk_paid") return isPaid;
          return true;
        });
        targets = filtered;
      }
    }

    if (targets.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No valid recipient email addresses found." },
        { status: 400 }
      );
    }

    // Allow frontend to resolve filtered target list first for 1-by-1 paced UI sending
    if (body?.resolveOnly) {
      return NextResponse.json({ ok: true, targets });
    }

    const delayMs =
      typeof body?.delayMs === "number"
        ? Math.max(0, Math.min(body.delayMs, 15000))
        : 3000;

    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < targets.length; i++) {
      const t = targets[i];
      if (i > 0 && delayMs > 0) {
        await sleep(delayMs);
      }
      const personalizedSubject = applyPersonalization(subject, t);
      const personalizedHtmlBody = applyPersonalization(processedHtmlBody, t);
      const personalizedText = applyPersonalization(message || subject, t);

      const html = `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#070B19;color:#F8FAFC;padding:28px;border-radius:16px;max-width:640px;margin:0 auto;border:1px solid #1E293B;">
          <div style="font-size:17px;font-weight:800;letter-spacing:0.06em;color:#A855F7;margin-bottom:14px;">BERAXIS</div>
          <h2 style="margin:0 0 14px;font-size:19px;color:#FFFFFF;">${personalizedSubject}</h2>
          <div style="font-size:14px;line-height:1.7;color:#E2E8F0;">${personalizedHtmlBody}</div>
          <hr style="border:none;border-top:1px solid #1E293B;margin:24px 0 14px;" />
          <p style="margin:0;font-size:11px;color:#64748B;">
            Sent from BERAXIS (${BERAXIS_SENDER_EMAIL}) • <a href="https://www.beraxis.online" style="color:#38BDF8;">beraxis.online</a>
          </p>
        </div>
      `;

      const res = await sendBeraxisEmail({
        to: t.email,
        subject: personalizedSubject,
        html,
        text: personalizedText,
        attachments: inlineAttachments.length > 0 ? inlineAttachments : undefined,
      });

      if (res.sent) {
        sentCount++;
      } else {
        failedCount++;
        if (res.error) errors.push(`${t.email}: ${res.error}`);
      }
    }

    return NextResponse.json({
      ok: sentCount > 0,
      sender: BERAXIS_SENDER_EMAIL,
      total: targets.length,
      sentCount,
      failedCount,
      errors: errors.slice(0, 5),
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to send emails" },
      { status: 500 }
    );
  }
}
