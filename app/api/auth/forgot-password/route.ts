import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const SUPABASE_ANON_KEY = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  ""
).trim();

// Step 1: Request password recovery email
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const origin = String(body.origin || "https://www.beraxis.online").replace(/\/+$/, "");

    if (!email || !email.includes("@")) {
      return NextResponse.json({ detail: "Please enter a valid email address." }, { status: 400 });
    }

    const res = await fetch(
      `${SUPABASE_URL}/auth/v1/recover?redirect_to=${encodeURIComponent(`${origin}/forgot-password`)}`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { detail: err?.msg || err?.error_description || "Unable to dispatch recovery link right now." },
        { status: res.status || 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists for this email, a password reset link has been sent.",
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Password reset error" }, { status: 500 });
  }
}

// Step 2: Set new password using recovery access_token from email link
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const accessToken = String(body.access_token || "").trim();
    const newPassword = String(body.password || "");

    if (!accessToken) {
      return NextResponse.json({ detail: "Invalid or expired recovery token." }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ detail: "New password must be at least 6 characters." }, { status: 400 });
    }

    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: "PUT",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password: newPassword }),
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { detail: data?.msg || data?.error_description || "Failed to update password." },
        { status: res.status || 400 }
      );
    }

    return NextResponse.json({ success: true, message: "Password updated successfully!" });
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Password update error" }, { status: 500 });
  }
}
