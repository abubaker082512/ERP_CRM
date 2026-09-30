export default function Stats() {
    return (
        <section className="py-20 bg-gradient-to-b from-[#020205] to-[#0F172A] relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="galaxy-card p-12 bg-[#1E293B]/30 border-purple-500/20 shadow-[0_0_50px_rgba(139,92,246,0.1)]">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/5">
                        <div className="px-4">
                            <p className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">10k+</p>
                            <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold">Active Workspaces</p>
                        </div>
                        <div className="px-4">
                            <p className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">99.9%</p>
                            <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold">Uptime SLA</p>
                        </div>
                        <div className="px-4">
                            <p className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">50M+</p>
                            <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold">API Requests / Day</p>
                        </div>
                        <div className="px-4">
                            <p className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">24/7</p>
                            <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold">Expert Support</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
