"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [recoveryToken, setRecoveryToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Detect Supabase recovery hash (#access_token=...&type=recovery)
    const hash = window.location.hash.replace(/^#/, "");
    if (hash) {
      const params = new URLSearchParams(hash);
      const token = params.get("access_token");
      if (token) setRecoveryToken(token);
    }
  }, []);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          origin: typeof window !== "undefined" ? window.location.origin : "https://www.beraxis.online",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessage(
          data.message || "Password reset instructions have been sent to your email inbox."
        );
      } else {
        setError(data.detail || "Could not send reset email. Please try again.");
      }
    } catch {
      setError("Network error while requesting password reset.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: recoveryToken, password: newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessage("Your password has been updated! Redirecting to Sign In...");
        setTimeout(() => router.push("/login"), 1800);
      } else {
        setError(data.detail || "Recovery link expired. Please request a new reset email.");
      }
    } catch {
      setError("Network error while updating password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent relative flex items-center justify-center p-4 overflow-hidden text-white">
      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center justify-center mb-4 hover:opacity-90">
            <img src="/logo-full.png" alt="Beraxis Logo" className="h-11 w-auto object-contain" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {recoveryToken ? "Set a New Password" : "Reset Your Password"}
          </h1>
          <p className="text-gray-400 mt-1.5 text-sm">
            {recoveryToken
              ? "Enter and confirm your new workspace password below."
              : "Enter your account email and we will send an instant self-service reset link."}
          </p>
        </div>

        <div className="beraxis-glass-hero p-7 space-y-5">
          {error && (
            <div className="flex items-center gap-2.5 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-semibold">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="flex items-center gap-2.5 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-semibold">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {recoveryToken ? (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">New Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-10 pr-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-sm text-white focus:border-purple-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full pl-10 pr-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-sm text-white focus:border-purple-500 outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="galaxy-btn-primary !w-full !py-3 !rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                <span>{loading ? "Updating Password..." : "Save New Password"}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Account Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full pl-10 pr-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-sm text-white focus:border-purple-500 outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="galaxy-btn-primary !w-full !py-3 !rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                <span>{loading ? "Sending Recovery Link..." : "Send Password Reset Link"}</span>
              </button>
            </form>
          )}

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
            <Link href="/login" className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 font-semibold">
              <ArrowLeft size={13} /> Back to Sign In
            </Link>
            <Link href="/contact?subject=Account%20Support" className="hover:text-white">
              Need manual help?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
