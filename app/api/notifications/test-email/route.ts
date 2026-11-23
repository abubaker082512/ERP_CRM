import { NextRequest, NextResponse } from "next/server";
import {
  BERAXIS_OWNER_NOTIFY_EMAIL,
  BERAXIS_SENDER_EMAIL,
  isGmailConfigured,
  sendBeraxisEmail,
} from "@/lib/gmailMailer";

export async function GET() {
  return NextResponse.json({
    sender: BERAXIS_SENDER_EMAIL,
    notifyEmail: BERAXIS_OWNER_NOTIFY_EMAIL,
    configured: isGmailConfigured(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const to = (body?.to || BERAXIS_OWNER_NOTIFY_EMAIL).trim();
    const smtpPasswordOverride = body?.smtpPassword || undefined;

    const result = await sendBeraxisEmail({
      to,
      smtpPasswordOverride,
      subject: "[BERAXIS] Gmail SMTP Test Notification",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#070B19; color:#F8FAFC; padding:24px; border-radius:16px; max-width:520px; margin:0 auto; border:1px solid #1E293B;">
          <h2 style="margin:0 0 10px; color:#34D399;">BERAXIS Gmail Connected ✓</h2>
          <p style="font-size:14px; color:#CBD5E1; line-height:1.6;">
            This test email confirms that <strong>${BERAXIS_SENDER_EMAIL}</strong> is configured and delivering notifications to <strong>${to}</strong>.
          </p>
          <p style="font-size:12px; color:#64748B; margin-top:16px;">Timestamp: ${new Date().toISOString()}</p>
        </div>
      `,
      text: `BERAXIS Gmail Connected! Sender: ${BERAXIS_SENDER_EMAIL} -> Recipient: ${to}`,
    });

    return NextResponse.json(
      {
        ok: result.sent,
        sender: BERAXIS_SENDER_EMAIL,
        to,
        ...result,
      },
      { status: result.sent ? 200 : result.configured ? 500 : 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Test email failed" },
      { status: 500 }
    );
  }
}
