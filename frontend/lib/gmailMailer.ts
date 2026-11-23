import nodemailer from "nodemailer";

export const BERAXIS_SENDER_EMAIL = process.env.GMAIL_USER || "beraxisai@gmail.com";
export const BERAXIS_OWNER_NOTIFY_EMAIL =
  process.env.OWNER_NOTIFY_EMAIL || "abubaker0825@gmail.com";

export function getGmailAppPassword(overridePass?: string): string {
  return (
    overridePass?.trim() ||
    process.env.GMAIL_APP_PASSWORD?.trim() ||
    process.env.SMTP_PASSWORD?.trim() ||
    ""
  );
}

export function isGmailConfigured(overridePass?: string): boolean {
  return Boolean(BERAXIS_SENDER_EMAIL && getGmailAppPassword(overridePass));
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  smtpPasswordOverride?: string;
}

export async function sendBeraxisEmail(opts: SendEmailOptions): Promise<{
  sent: boolean;
  configured: boolean;
  messageId?: string;
  error?: string;
}> {
  const pass = getGmailAppPassword(opts.smtpPasswordOverride);
  if (!pass) {
    return {
      sent: false,
      configured: false,
      error:
        "GMAIL_APP_PASSWORD is not configured on the server yet. Add GMAIL_USER=beraxisai@gmail.com and GMAIL_APP_PASSWORD in Vercel Environment Variables (or enter it in Settings -> Email Setup).",
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: BERAXIS_SENDER_EMAIL,
        pass,
      },
    });

    const info = await transporter.sendMail({
      from: `"BERAXIS AI" <${BERAXIS_SENDER_EMAIL}>`,
      to: opts.to,
      replyTo: opts.replyTo || BERAXIS_SENDER_EMAIL,
      subject: opts.subject,
      text: opts.text || opts.subject,
      html: opts.html,
    });

    return {
      sent: true,
      configured: true,
      messageId: info.messageId,
    };
  } catch (err: any) {
    console.error("[GmailMailer] Failed to send email:", err?.message || err);
    return {
      sent: false,
      configured: true,
      error: err?.message || "Failed to send email via Gmail SMTP",
    };
  }
}

export interface SignupNotificationPayload {
  name?: string;
  email: string;
  plan?: string;
  isPaid?: boolean;
  accountType?: string;
  companyName?: string;
  amountUsd?: string | number;
  source?: string;
}

export async function notifyOwnerSignup(payload: SignupNotificationPayload) {
  const tierLabel = payload.isPaid ? "PAID" : "FREE";
  const planName = payload.plan || (payload.isPaid ? "Paid Plan" : "One App Free");
  const displayName = payload.name || payload.email.split("@")[0];
  const timestamp = new Date().toISOString();

  const subject = `[BERAXIS] New ${tierLabel} Signup: ${displayName} (${planName})`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#070B19; color:#F8FAFC; padding:28px; border-radius:16px; max-width:600px; margin:0 auto; border:1px solid #1E293B;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;">
        <span style="font-size:18px; font-weight:800; letter-spacing:0.06em; color:#A855F7;">BERAXIS</span>
        <span style="padding:4px 12px; border-radius:999px; font-size:12px; font-weight:800; background:${
          payload.isPaid ? "#10B981" : "#3B82F6"
        }; color:#FFFFFF;">${tierLabel} SIGNUP</span>
      </div>
      <h2 style="margin:0 0 12px; font-size:20px; color:#FFFFFF;">New User Registered on BERAXIS</h2>
      <p style="margin:0 0 20px; font-size:14px; color:#94A3B8;">
        A new ${payload.isPaid ? "paid" : "free"} user just signed up${
          payload.source ? ` via ${payload.source}` : ""
        }.
      </p>
      <table style="width:100%; border-collapse:collapse; font-size:13px; background:#0F172A; border-radius:12px; overflow:hidden;">
        <tr><td style="padding:10px 14px; color:#94A3B8; border-bottom:1px solid #1E293B;">Name</td><td style="padding:10px 14px; color:#FFFFFF; font-weight:600; border-bottom:1px solid #1E293B;">${displayName}</td></tr>
        <tr><td style="padding:10px 14px; color:#94A3B8; border-bottom:1px solid #1E293B;">Email</td><td style="padding:10px 14px; color:#38BDF8; font-weight:600; border-bottom:1px solid #1E293B;">${payload.email}</td></tr>
        <tr><td style="padding:10px 14px; color:#94A3B8; border-bottom:1px solid #1E293B;">Plan / Tier</td><td style="padding:10px 14px; color:#FFFFFF; font-weight:700; border-bottom:1px solid #1E293B;">${planName}${
          payload.amountUsd ? ` ($${payload.amountUsd})` : ""
        }</td></tr>
        <tr><td style="padding:10px 14px; color:#94A3B8; border-bottom:1px solid #1E293B;">Account Type</td><td style="padding:10px 14px; color:#FFFFFF; border-bottom:1px solid #1E293B;">${
          payload.accountType || "individual"
        }</td></tr>
        <tr><td style="padding:10px 14px; color:#94A3B8; border-bottom:1px solid #1E293B;">Company</td><td style="padding:10px 14px; color:#FFFFFF; border-bottom:1px solid #1E293B;">${
          payload.companyName || "—"
        }</td></tr>
        <tr><td style="padding:10px 14px; color:#94A3B8;">Timestamp (UTC)</td><td style="padding:10px 14px; color:#94A3B8; font-family:monospace;">${timestamp}</td></tr>
      </table>
      <p style="margin:20px 0 0; font-size:12px; color:#64748B;">
        Sent automatically by BERAXIS Mailer (${BERAXIS_SENDER_EMAIL}).
      </p>
    </div>
  `;

  return sendBeraxisEmail({
    to: BERAXIS_OWNER_NOTIFY_EMAIL,
    subject,
    html,
    text: `New ${tierLabel} BERAXIS Signup\nName: ${displayName}\nEmail: ${payload.email}\nPlan: ${planName}\nAccount Type: ${payload.accountType || "individual"}\nCompany: ${payload.companyName || "-"}\nTime: ${timestamp}`,
  });
}
