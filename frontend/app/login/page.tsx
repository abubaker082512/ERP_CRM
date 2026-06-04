"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { fetchAPI } from "@/lib/api";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const resp = await fetchAPI('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            const data = await resp.json();

            if (resp.ok && data.access_token) {
                localStorage.setItem('token', data.access_token);
                if (data.refresh_token) {
                    localStorage.setItem('refresh_token', data.refresh_token);
                }
                localStorage.setItem('user', JSON.stringify(data.user));
                // Redirect super admins directly to the admin dashboard
                const SUPER_ADMIN_EMAILS = ['admin@erp-crm.com', 'admin2@erp-crm.com'];
                if (SUPER_ADMIN_EMAILS.includes(data.user?.email)) {
                    router.push("/super-admin");
                } else {
                    router.push("/");
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
                        <img src="/logo2.png" alt="Beraxis Logo" className="h-16 w-auto" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Welcome back</h1>
                    <p className="text-gray-400 mt-2">Sign in to your ERP workspace</p>
                </div>

                <div className="bg-[#1E293B] rounded-2xl border border-gray-700/50 p-8 shadow-2xl">
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
