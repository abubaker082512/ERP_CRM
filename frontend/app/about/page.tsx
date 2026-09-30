"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Rocket, Target, Globe2 } from "lucide-react";
 
export default function AboutPage() {
    return (
        <main className="min-h-screen bg-[#020205] text-white overflow-hidden font-sans">
            <Navbar />
 
            <div className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        Scaling businesses beyond <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">boundaries</span>
                    </h1>
                    <p className="text-xl text-gray-400 leading-relaxed">
                        Beraxis was born out of a simple frustration: why does enterprise software have to be so complicated, fragmented, and ugly? We decided to build a platform that is as beautiful as it is powerful.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-20">
                    <div className="galaxy-card p-8 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-6">
                            <Rocket className="text-purple-400" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                        <p className="text-gray-400 leading-relaxed">
                            To empower companies of all sizes with a unified command center that streamlines operations, boosts sales, and drives intelligent growth.
                        </p>
                    </div>

                    <div className="galaxy-card p-8 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mb-6">
                            <Target className="text-pink-400" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                        <p className="text-gray-400 leading-relaxed">
                            We envision a universe where businesses don't fight their software, but rather use it as a launchpad to achieve their highest potential.
                        </p>
                    </div>

                    <div className="galaxy-card p-8 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-6">
                            <Globe2 className="text-blue-400" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Our Impact</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Powering thousands of workspaces across the globe, bringing clarity to chaos and turning scattered data into actionable intelligence.
                        </p>
                    </div>
                </div>

                {/* Core Values Section */}
                <div className="mt-32">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Our Core <span className="text-purple-400">Values</span></h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="p-6 border-l-4 border-purple-500 bg-white/5 rounded-r-lg">
                            <h4 className="text-xl font-bold mb-2 text-white">1. Uncompromising Quality</h4>
                            <p className="text-gray-400">We believe business software shouldn't feel like a chore. Every pixel and interaction is designed to delight.</p>
                        </div>
                        <div className="p-6 border-l-4 border-pink-500 bg-white/5 rounded-r-lg">
                            <h4 className="text-xl font-bold mb-2 text-white">2. Relentless Innovation</h4>
                            <p className="text-gray-400">We constantly push the boundaries of what's possible, integrating the latest AI and cloud technologies.</p>
                        </div>
                        <div className="p-6 border-l-4 border-blue-500 bg-white/5 rounded-r-lg">
                            <h4 className="text-xl font-bold mb-2 text-white">3. Customer Obsession</h4>
                            <p className="text-gray-400">Your success is our success. We build features based on real feedback, not boardroom assumptions.</p>
                        </div>
                        <div className="p-6 border-l-4 border-teal-500 bg-white/5 rounded-r-lg">
                            <h4 className="text-xl font-bold mb-2 text-white">4. Absolute Security</h4>
                            <p className="text-gray-400">Trust is our foundation. We employ bank-grade security protocols to ensure your data is always protected.</p>
                        </div>
                    </div>
                </div>

                <div className="mt-32 galaxy-card p-12 text-center bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border-purple-500/30">
                    <h2 className="text-3xl font-bold mb-6">Ready to join our universe?</h2>
                    <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                        Experience the future of enterprise resource planning today. Set up your workspace in seconds.
                    </p>
                    <a href="/signup" className="galaxy-btn-primary !px-8 !py-4 text-lg inline-block">
                        Start your free trial
                    </a>
                </div>
            </div>

            <Footer />
        </main>
    );
}
