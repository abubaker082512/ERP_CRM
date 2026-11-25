"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { fetchAPI } from "@/lib/api";
import { trackReferralVisit, getActiveReferralCode } from "@/lib/referral-service";
import { useEffect } from "react";

function SignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const invite_id = searchParams.get('invite_id');
    const invite_email = searchParams.get('email') || "";
    const invite_company = searchParams.get('company_name') || "";
    const invite_role = searchParams.get('role') || "";
    const [referralCode, setReferralCode] = useState<string | null>(null);

    useEffect(() => {
        if (invite_email) setEmail(invite_email);
    }, [invite_email]);

    useEffect(() => {
        const tracked = trackReferralVisit();
        const active = tracked || getActiveReferralCode();
        if (active) setReferralCode(active);
    }, []);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [accountType, setAccountType] = useState<"individual" | "company">("individual");
    const [companyName, setCompanyName] = useState("");
    const [phone, setPhone] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);
        try {
            const signupPayload = {
                name,
                email,
                password,
                invite_id,
                account_type: accountType,
                company_name: accountType === 'company' ? companyName : undefined,
                phone: phone.trim() || undefined,
                referral_code: referralCode || undefined
            };

            let resp = await fetchAPI('/auth/signup', {
                method: 'POST',
                body: JSON.stringify(signupPayload)
            }).catch(() => null);

            // Instant Next.js + Isolated Cluster Provisioning fallback if Render backend is cold-starting
            if (!resp || resp.status >= 500) {
                resp = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(signupPayload)
                });
            }

            const data = await resp.json().catch(() => ({}));
            if (resp.ok) {
                // Guarantee dedicated isolated micro-database cluster is provisioned even if Render handled signup
                fetch('/api/workspace/cluster', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: email.trim().toLowerCase(),
                        ownerUid: data?.user?.id || '',
                        companyName: accountType === 'company' ? companyName : `${name || 'Personal'} Isolated Workspace`,
                        entityType: accountType
                    })
                }).catch(() => {});
                try {
                    fetch('/api/notifications/signup', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name,
                            email,
                            plan: 'One App Free',
                            isPaid: false,
                            accountType,
                            companyName: accountType === 'company' ? companyName : undefined,
                            source: invite_id ? 'team_invite_signup' : 'signup_page',
                        })
                    }).catch(e => console.warn('[Signup Email Notify Warning]', e));
                } catch {}
                try {
                    fetch('/api/webhooks/pumpgtm', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name,
                            email,
                            company: accountType === 'company' ? companyName : undefined,
                            dryRun: false
                        })
                    }).catch(e => console.warn('[PumpGTM Dispatch Warning]', e));
                } catch {}
                if (phone.trim()) {
                    try { localStorage.setItem("beraxis_user_phone", phone.trim()); } catch {}
                }
                setSuccess("Account created! Check your email to confirm, then log in.");
                setTimeout(() => router.push("/login"), 3000);
            } else {
                setError(data.detail || 'Signup failed. Please try again.');
            }
        } catch (err) {
            console.error("Signup error:", err);
            setError("Network error. Please ensure the server is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md relative z-10 my-8">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-green-600/20 rounded-2xl mb-4 border border-green-500/30">
                    <span className="text-3xl">{invite_id ? '🤝' : '🚀'}</span>
                </div>
                <h1 className="text-3xl font-bold text-white text-cosmic-glow">
                    {invite_id ? 'Join Your Team' : 'Start Free Forever'}
                </h1>
                <p className="text-gray-400 mt-2">
                    {invite_id
                        ? invite_company
                            ? `Joining ${invite_company}${invite_role ? ` as ${invite_role}` : ""} · Seat Covered by Company Owner`
                            : 'Create your account to access the workspace (Seat Covered)'
                        : '1 App Free Forever · No Credit Card Required · Setup in 30s'}
                </p>
            </div>

            {referralCode && (
                <div className="mb-4 p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center gap-2 text-xs text-purple-300">
                    <span className="text-base">🎁</span>
                    <span>Referred by partner code <strong className="text-white font-mono">{referralCode}</strong>. 1 Month Free benefit attached to your account!</span>
                </div>
            )}
                        {/* 100+ Businesses Trust Strip */}
            <div className="mb-6 p-3 rounded-2xl bg-gradient-to-r from-purple-950/40 via-[#0e1628] to-cyan-950/40 border border-purple-500/30 flex items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-2.5">
                    <div className="flex -space-x-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 border border-[#020205] flex items-center justify-center text-[9px] font-black text-white shadow-sm">MV</div>
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 border border-[#020205] flex items-center justify-center text-[9px] font-black text-white shadow-sm">SM</div>
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 border border-[#020205] flex items-center justify-center text-[8px] font-black text-white shadow-sm">+100</div>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>100+ Active Workspaces</span>
                            <span className="text-[10px] text-amber-400 font-bold">★ 4.9/5</span>
                        </div>
                        <div className="text-[10px] text-gray-400">Join growing founders &mdash; You can be next</div>
                    </div>
                </div>
                <div className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
                    Live Setup
                </div>
            </div>

            <div className="beraxis-glass-hero p-6 sm:p-7">
                <div className="flex items-center justify-between mb-4">
                    <a href="/" className="text-xs text-gray-400 hover:text-white transition-colors">← Back to Home</a>
                    <span className="text-[11px] text-purple-300 font-semibold">Free Forever Tier</span>
                </div>
                {error && (
                    <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-5">
                        <AlertCircle size={18} className="text-red-400 shrink-0" />
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}
                {success && (
                    <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg mb-5">
                        <CheckCircle size={18} className="text-green-400 shrink-0" />
                        <p className="text-green-400 text-sm">{success}</p>
                    </div>
                )}

                <form onSubmit={handleSignup} className="space-y-4">
                    {!invite_id && (
                        <div className="flex p-1 bg-[#0B0F19] border border-white/10 rounded-xl mb-4">
                            <button
                                type="button"
                                onClick={() => setAccountType("individual")}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                                    accountType === "individual" 
                                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/25" 
                                    : "text-gray-400 hover:text-white"
                                }`}
                            >
                                Individual
                            </button>
                            <button
                                type="button"
                                onClick={() => setAccountType("company")}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                                    accountType === "company" 
                                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/25" 
                                    : "text-gray-400 hover:text-white"
                                }`}
                            >
                                Company
                            </button>
                        </div>
                    )}

                    {accountType === "company" && !invite_id && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Company Name</label>
                            <input
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder="Acme Corp"
                                className="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white placeholder-gray-500 transition-all"
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
                        <input
                            type="text"
                            id="signup-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your full name"
                            className="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white placeholder-gray-500 transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Work Email</label>
                        <input
                            type="email"
                            id="signup-email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@email.com"
                            className="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white placeholder-gray-500 transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Billing / Mobile Phone (Optional)</label>
                        <input
                            type="tel"
                            id="signup-phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="e.g. +1 555-0199 or 03001234567"
                            className="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white placeholder-gray-500 transition-all font-mono text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="signup-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Min. 6 characters"
                                className="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white placeholder-gray-500 transition-all"
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

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="signup-confirm-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repeat password"
                            className="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white placeholder-gray-500 transition-all"
                            required
                        />
                    </div>

                    <button
                        id="signup-submit"
                        type="submit"
                        disabled={loading}
                        className="galaxy-btn-primary !w-full !py-3.5 !rounded-xl text-sm font-bold shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <><Loader2 size={18} className="animate-spin" /> Creating account...</>
                        ) : (
                            accountType === 'company' ? "Create Workspace" : "Create Account"
                        )}
                    </button>

                    <p className="text-center text-sm text-gray-500">
                        Already have an account?{' '}
                        <button type="button" onClick={() => router.push('/login')} className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                            Sign in
                        </button>
                    </p>
                </form>
            </div>

            
            {/* Verified Quote Snippet */}
            <div className="mt-4 p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-center text-xs text-gray-400 italic">
                &ldquo;Migrated our entire customer database from QuickBooks in under 15 minutes. Best decision this year.&rdquo;
                <div className="not-italic text-[10px] font-bold text-purple-300 mt-1">
                    &mdash; Jason R., Verified Workspace Owner
                </div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-5 relative z-10">
                By signing up you agree to our{" "}
                <a href="/terms" className="text-purple-400 hover:text-purple-300 underline">Terms of Service</a>{" "}
                and{" "}
                <a href="/privacy" className="text-purple-400 hover:text-purple-300 underline">Privacy Policy</a>.
            </p>
        </div>
    );
}

export default function SignupPage() {
    return (
        <div className="min-h-screen bg-transparent relative flex items-center justify-center p-4 overflow-hidden">
            <Suspense fallback={<div className="min-h-screen bg-transparent flex items-center justify-center text-gray-400">Loading...</div>}>
                <SignupForm />
            </Suspense>
        </div>
    );
}
