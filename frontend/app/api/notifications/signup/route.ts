import { NextRequest, NextResponse } from "next/server";
import {
  BERAXIS_SENDER_EMAIL,
  notifyOwnerSignup,
  sendBeraxisEmail,
} from "@/lib/gmailMailer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = (body?.email || "").trim();
    if (!email) {
      return NextResponse.json(
        { ok: false, error: "email is required" },
        { status: 400 }
      );
    }

    const name = (body?.name || email.split("@")[0]).trim();
    const plan = body?.plan || "One App Free";
    const isPaid = Boolean(body?.isPaid);
    const accountType = body?.accountType || "individual";
    const companyName = body?.companyName || "";
    const amountUsd = body?.amountUsd;
    const source = body?.source || "signup_page";

    const ownerResult = await notifyOwnerSignup({
      name,
      email,
      plan,
      isPaid,
      accountType,
      companyName,
      amountUsd,
      source,
    });

    if (body?.sendWelcome !== false && ownerResult.configured) {
      await sendBeraxisEmail({
        to: email,
        subject: `Welcome to BERAXIS, ${name}!`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#070B19; color:#F8FAFC; padding:28px; border-radius:16px; max-width:560px; margin:0 auto; border:1px solid #1E293B;">
            <h2 style="margin:0 0 12px; color:#FFFFFF;">Welcome to BERAXIS 🚀</h2>
            <p style="font-size:14px; color:#CBD5E1; line-height:1.6;">
              Hi ${name}, your BERAXIS workspace (${plan}) is ready. You can log in anytime at
              <a href="https://www.beraxis.online/login" style="color:#38BDF8;">https://www.beraxis.online/login</a>.
            </p>
            <p style="margin-top:20px; font-size:12px; color:#64748B;">
              Delivered from ${BERAXIS_SENDER_EMAIL}
            </p>
          </div>
        `,
        text: `Welcome to BERAXIS, ${name}! Your ${plan} workspace is ready at https://www.beraxis.online/login.`,
      });
    }

    return NextResponse.json({
      ok: true,
      ...ownerResult,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to process signup notification" },
      { status: 500 }
    );
  }
}
