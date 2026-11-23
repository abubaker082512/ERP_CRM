import { NextRequest, NextResponse } from "next/server";
import {
  BERAXIS_OWNER_NOTIFY_EMAIL,
  BERAXIS_SENDER_EMAIL,
  sendBeraxisEmail,
} from "@/lib/gmailMailer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const companyName = String(body?.companyName || "").trim();
    const contactName = String(body?.contactName || "").trim() || "Corporate Lead";
    const email = String(body?.email || "").trim().toLowerCase();
    const phone = String(body?.phone || "").trim();
    const userCount = Math.max(1, Number(body?.userCount || 25));
    const notes = String(body?.notes || "").trim();

    if (!companyName || !email || !email.includes("@")) {
      return NextResponse.json(
        { ok: false, error: "Company Name and a valid Email are required." },
        { status: 400 }
      );
    }

    const ownerMail = await sendBeraxisEmail({
      to: BERAXIS_OWNER_NOTIFY_EMAIL,
      replyTo: email,
      subject: `[BERAXIS Corporate Quote] ${companyName} (${userCount} Users)`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#070B19;color:#F8FAFC;padding:26px;border-radius:16px;max-width:600px;margin:0 auto;border:1px solid #1E293B;">
          <div style="font-size:17px;font-weight:800;color:#A855F7;margin-bottom:10px;">BERAXIS CORPORATE QUOTE</div>
          <h2 style="margin:0 0 12px;color:#FFFFFF;">New ${userCount}-User Corporate Inquiry</h2>
          <table style="width:100%;border-collapse:collapse;font-size:13px;background:#0F172A;border-radius:12px;overflow:hidden;">
            <tr><td style="padding:10px 14px;color:#94A3B8;border-bottom:1px solid #1E293B;">Company</td><td style="padding:10px 14px;color:#FFFFFF;font-weight:700;border-bottom:1px solid #1E293B;">${companyName}</td></tr>
            <tr><td style="padding:10px 14px;color:#94A3B8;border-bottom:1px solid #1E293B;">Users / Seats Needed</td><td style="padding:10px 14px;color:#38BDF8;font-weight:800;border-bottom:1px solid #1E293B;">${userCount} Users</td></tr>
            <tr><td style="padding:10px 14px;color:#94A3B8;border-bottom:1px solid #1E293B;">Contact Name</td><td style="padding:10px 14px;color:#FFFFFF;border-bottom:1px solid #1E293B;">${contactName}</td></tr>
            <tr><td style="padding:10px 14px;color:#94A3B8;border-bottom:1px solid #1E293B;">Email</td><td style="padding:10px 14px;color:#38BDF8;border-bottom:1px solid #1E293B;">${email}</td></tr>
            <tr><td style="padding:10px 14px;color:#94A3B8;border-bottom:1px solid #1E293B;">WhatsApp / Phone</td><td style="padding:10px 14px;color:#FFFFFF;border-bottom:1px solid #1E293B;">${phone || "Not provided"}</td></tr>
            <tr><td style="padding:10px 14px;color:#94A3B8;">Notes</td><td style="padding:10px 14px;color:#E2E8F0;">${notes || "—"}</td></tr>
          </table>
          <p style="margin:16px 0 0;font-size:11px;color:#64748B;">Sent via ${BERAXIS_SENDER_EMAIL}</p>
        </div>
      `,
      text: `Corporate Quote Request\nCompany: ${companyName}\nUsers: ${userCount}\nContact: ${contactName}\nEmail: ${email}\nPhone/WhatsApp: ${phone}\nNotes: ${notes}`,
    });

    await sendBeraxisEmail({
      to: email,
      subject: `We received your BERAXIS Corporate Quote request (${companyName})`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#070B19;color:#F8FAFC;padding:24px;border-radius:16px;max-width:560px;margin:0 auto;border:1px solid #1E293B;">
          <h2 style="margin:0 0 10px;color:#FFFFFF;">Corporate Quote Received 🚀</h2>
          <p style="font-size:14px;color:#CBD5E1;line-height:1.6;">
            Hi ${contactName}, thank you for requesting a custom BERAXIS Corporate quote for <strong>${companyName}</strong> (${userCount} users).
            Our team will reply shortly, or you can message us directly on WhatsApp at <strong>+1 970 780 7993</strong>.
          </p>
        </div>
      `,
      text: `Hi ${contactName}, we received your BERAXIS Corporate quote request for ${companyName} (${userCount} users). WhatsApp Support: +1 970 780 7993.`,
    });

    return NextResponse.json({
      ok: true,
      sent: ownerMail.sent,
      message: `Corporate quote request for ${companyName} (${userCount} users) submitted!`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to submit corporate quote" },
      { status: 500 }
    );
  }
}
