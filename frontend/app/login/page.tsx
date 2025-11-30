"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const resp = await fetch('http://localhost:8000/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (resp.ok) {
                const data = await resp.json();
                localStorage.setItem('token', data.access_token);
                router.push("/");
            } else {
                const errorData = await resp.json();
                alert(`Login failed: ${errorData.detail || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("An error occurred during login.");
        }
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
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full mt-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-800"
                            required
                        />
                    </div>
                    {/* Password */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">Password</label>
                        <div className="relative mt-1">
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
                        Don't have an account?{' '}
                        <button type="button" onClick={() => router.push('/signup')} className="text-primary hover:underline font-medium">
                            Sign up
                        </button>
                    </p>
                </form>
                {/* Footer */}
                <p className="text-center text-xs text-gray-500 mt-8">Powered by Odoo</p>
            </div>
        </div>
    );
}
