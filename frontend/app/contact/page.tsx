"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Mail, MessageSquare, MapPin, Send } from "lucide-react";
import { useState } from "react";
 
export default function ContactPage() {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
 
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Placeholder for actual form submission logic
        setTimeout(() => setSubmitted(true), 500);
    };
 
    return (
        <main className="min-h-screen bg-[#020205] text-white overflow-hidden font-sans">
            <Navbar />
 
            <div className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Touch</span>
                    </h1>
                    <p className="text-xl text-gray-400">
                        Whether you have a question about pricing, features, or need a custom demo, our team is ready to help you launch.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div className="galaxy-card p-8 flex items-start gap-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
                            <div className="bg-purple-500/20 p-4 rounded-xl text-purple-400 shrink-0 shadow-lg shadow-purple-500/10">
                                <MessageSquare size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2 text-white">Chat with Sales</h3>
                                <p className="text-gray-400 mb-4">Speak directly to our experts about how Beraxis can scale your business.</p>
                                <a href="mailto:sales@beraxis.online" className="text-purple-400 font-medium hover:underline">sales@beraxis.online</a>
                            </div>
                        </div>

                        <div className="galaxy-card p-8 flex items-start gap-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
                            <div className="bg-pink-500/20 p-4 rounded-xl text-pink-400 shrink-0 shadow-lg shadow-pink-500/10">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2 text-white">Email Support</h3>
                                <p className="text-gray-400 mb-4">Current customer needing assistance? Our support team is available 24/7.</p>
                                <a href="mailto:support@beraxis.online" className="text-pink-400 font-medium hover:underline">support@beraxis.online</a>
                            </div>
                        </div>

                        <div className="galaxy-card p-8 flex items-start gap-4 animate-in fade-in slide-in-from-bottom-3 duration-700">
                            <div className="bg-emerald-500/20 p-4 rounded-xl text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/10">
                                <MessageSquare size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2 text-white">WhatsApp & Phone Support</h3>
                                <p className="text-gray-400 mb-4">Instant support hotline and WhatsApp chat integration for active clients.</p>
                                <a href="https://wa.me/19707807993" target="_blank" rel="noreferrer" className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors inline-flex items-center gap-1.5 mb-1.5 bg-emerald-500/10 px-3.5 py-1.5 rounded-lg border border-emerald-500/20 text-xs uppercase tracking-wider">
                                    💬 Chat on WhatsApp
                                </a>
                                <div className="block mt-2">
                                    <a href="tel:+19707807993" className="text-gray-300 hover:text-white transition-colors font-medium">
                                        📞 +1 (970) 780-7993
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="galaxy-card p-8 md:p-10">
                        {submitted ? (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Send size={40} />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                                <p className="text-gray-400 mb-8">We've received your transmission and will respond shortly.</p>
                                <button onClick={() => setSubmitted(false)} className="galaxy-btn-primary">Send Another</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <h3 className="text-2xl font-bold mb-6">Send us a message</h3>
                                
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">Your Name</label>
                                    <input 
                                        type="text" 
                                        id="name"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full bg-[#0F172A]/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder-gray-600"
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">Work Email</label>
                                    <input 
                                        type="email" 
                                        id="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full bg-[#0F172A]/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder-gray-600"
                                        placeholder="john@company.com"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-2">How can we help?</label>
                                    <textarea 
                                        id="message"
                                        required
                                        rows={5}
                                        value={formData.message}
                                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                                        className="w-full bg-[#0F172A]/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder-gray-600 resize-none"
                                        placeholder="Tell us about your company and what you're looking for..."
                                    ></textarea>
                                </div>

                                <button type="submit" className="galaxy-btn-primary w-full flex items-center justify-center gap-2 !py-4">
                                    <Send size={18} /> Send Transmission
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mt-32 border-t border-white/5 pt-20">
                    <h2 className="text-3xl font-bold text-center mb-16">Frequently Asked <span className="text-pink-400">Questions</span></h2>
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="galaxy-card p-6">
                            <h4 className="text-lg font-bold mb-2">Can I migrate my data from another ERP?</h4>
                            <p className="text-gray-400">Yes! We provide robust import tools and dedicated migration support during onboarding to ensure all your legacy data transitions smoothly into Beraxis.</p>
                        </div>
                        <div className="galaxy-card p-6">
                            <h4 className="text-lg font-bold mb-2">Do you offer on-premise deployments?</h4>
                            <p className="text-gray-400">Beraxis is primarily a cloud-native SaaS platform designed for high availability. However, we do offer dedicated private cloud solutions for Enterprise tier customers.</p>
                        </div>
                        <div className="galaxy-card p-6">
                            <h4 className="text-lg font-bold mb-2">How does pricing work as my team grows?</h4>
                            <p className="text-gray-400">We offer flexible per-user or per-workspace pricing depending on your needs. You can scale up or down at any time from your billing dashboard.</p>
                        </div>
                        <div className="galaxy-card p-6">
                            <h4 className="text-lg font-bold mb-2">Is there a free trial?</h4>
                            <p className="text-gray-400">Absolutely. Every new workspace gets a fully-featured 14-day free trial. No credit card required to start exploring the universe.</p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
