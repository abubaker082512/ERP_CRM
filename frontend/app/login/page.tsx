"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { fetchAPI } from "@/lib/api";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [inactivityMsg, setInactivityMsg] = useState(false);
    const [concurrentMsg, setConcurrentMsg] = useState(false);

    useEffect(() => {
        const reason = searchParams.get("reason");
        if (reason === "inactivity") {
            setInactivityMsg(true);
        } else if (reason === "concurrent_login") {
            setConcurrentMsg(true);
        }
    }, [searchParams]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const resp = await fetchAPI('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            let data;
            try {
                data = await resp.json();
            } catch (jsonErr) {
                data = { detail: resp.status === 404 ? 'API endpoint not found or backend starting up.' : `Server returned error (${resp.status})` };
            }

            if (resp.ok && data.access_token) {
                const sid = data.session_id || data.user?.session_id || `sid_${Date.now()}`;
                localStorage.setItem('token', data.access_token);
                if (data.refresh_token) {
                    localStorage.setItem('refresh_token', data.refresh_token);
                }
                localStorage.setItem('beraxis_session_id', sid);
                try {
                    sessionStorage.setItem('beraxis_tab_session_id', sid);
                } catch {}
                localStorage.setItem('user', JSON.stringify({ ...data.user, session_id: sid }));
                window.dispatchEvent(new Event("beraxis_auth_changed"));

                // Redirect super admins directly to the admin dashboard, and all users directly to /apps (Workspace & Industry Onboarding)
                const SUPER_ADMIN_EMAILS = ['admin@beraxis.online', 'admin2@erp-crm.com'];
                if (SUPER_ADMIN_EMAILS.includes(data.user?.email)) {
                    router.push("/super-admin");
                } else {
                    router.push("/apps");
                }
            } else {
                setError(data.detail || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("Network error. Please ensure the server is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center mb-4">
                        <img src="/logo-full.png" alt="Beraxis Logo" className="h-12 w-auto object-contain" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Welcome back</h1>
                    <p className="text-gray-400 mt-2">Sign in to your ERP workspace</p>
                </div>

                <div className="bg-[#1E293B] rounded-2xl border border-gray-700/50 p-8 shadow-2xl">
                    {inactivityMsg && (
                        <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl mb-6">
                            <Clock size={18} className="text-amber-400 shrink-0" />
                            <p className="text-amber-300 text-xs font-semibold">
                                You were automatically logged out due to 1 minute of inactivity. Your work time was saved to Timesheets.
                            </p>
                        </div>
                    )}

                    {concurrentMsg && (
                        <div className="flex items-center gap-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl mb-6">
                            <AlertCircle size={18} className="text-rose-400 shrink-0" />
                            <p className="text-rose-300 text-xs font-semibold">
                                Session ended: Your account was logged in from another device or location. Only one active login session is permitted at a time worldwide.
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-6">
                            <AlertCircle size={18} className="text-red-400 shrink-0" />
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                            <input
                                type="email"
                                id="login-email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@company.com"
                                className="w-full px-4 py-3 bg-[#0F172A] border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white placeholder-gray-500 transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="login-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 bg-[#0F172A] border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white placeholder-gray-500 transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            id="login-submit"
                            type="submit"
                            disabled={loading}
                            className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? (
                                <><Loader2 size={18} className="animate-spin" /> Signing in...</>
                            ) : (
                                "Sign In"
                            )}
                        </button>

                        <p className="text-center text-sm text-gray-500">
                            Don&apos;t have an account?{' '}
                            <button type="button" onClick={() => router.push('/signup')} className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                                Create one free
                            </button>
                        </p>
                    </form>
                </div>

                <p className="text-center text-xs text-gray-600 mt-6">Next-Gen AI ERP · 7-Day Free Trial</p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-gray-400">Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}
