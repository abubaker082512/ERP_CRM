"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement actual authentication
        router.push("/");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                        <span className="text-2xl">📊</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Your logo</h1>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {/* Email */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <button type="button" className="text-xs text-primary hover:underline">
                                Choose a user
                            </button>
                        </div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-800"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-gray-700">Password</label>
                            <button type="button" className="text-xs text-primary hover:underline">
                                Reset Password
                            </button>
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-800"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg"
                    >
                        Log in
                    </button>

                    {/* Signup Link */}
                    <p className="text-center text-sm text-gray-600">
                        Don't have an account?{" "}
                        <button type="button" className="text-primary hover:underline font-medium">
                            Sign up
                        </button>
                    </p>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">- or -</span>
                        </div>
                    </div>

                    {/* Passkey */}
                    <button
                        type="button"
                        className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                    >
                        <span>🔑</span>
                        Use a Passkey
                    </button>
                </form>

                {/* Footer */}
                <p className="text-center text-xs text-gray-500 mt-8">
                    Powered by Odoo
                </p>
            </div>
        </div>
    );
}
