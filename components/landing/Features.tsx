import { LayoutDashboard, Users, ShoppingCart, Package, ShieldCheck, Zap, Sparkles, Mic } from 'lucide-react';

const features = [
    {
        title: "Intelligent CRM",
        description: "Track leads, close deals, and build lasting relationships with a visual Kanban pipeline.",
        icon: Users,
        color: "text-blue-400",
        bg: "bg-blue-500/10"
    },
    {
        title: "Omnichannel Sales",
        description: "Generate quotes, convert to orders, and manage billing effortlessly from anywhere.",
        icon: ShoppingCart,
        color: "text-pink-400",
        bg: "bg-pink-500/10"
    },
    {
        title: "Smart Inventory",
        description: "Real-time stock tracking, multi-warehouse management, and automated replenishments.",
        icon: Package,
        color: "text-purple-400",
        bg: "bg-purple-500/10"
    },
    {
        title: "AI Dual-Brain Engine",
        description: "A hybrid framework combining global system rules (Macro-Brain) with secure, per-tenant vector memory logs (Micro-Brain) for hyper-personalized business insights.",
        icon: Sparkles,
        color: "text-purple-400",
        bg: "bg-purple-500/10"
    },
    {
        title: "Voice Assist Pilot",
        description: "Control your entire ERP suite with low-latency streaming voice commands. Speak to run queries, draft transactions, and trigger sandboxed routines.",
        icon: Mic,
        color: "text-sky-400",
        bg: "bg-sky-500/10"
    },
    {
        title: "Executive Dashboards",
        description: "Get a bird's-eye view of your entire operation with real-time analytics and KPIs.",
        icon: LayoutDashboard,
        color: "text-orange-400",
        bg: "bg-orange-500/10"
    },
    {
        title: "Enterprise Security",
        description: "Bank-grade encryption, row-level security (RLS), and granular role-based access control.",
        icon: ShieldCheck,
        color: "text-green-400",
        bg: "bg-green-500/10"
    },
    {
        title: "Lightning Fast",
        description: "Built on a modern React/Next.js stack with a Python FastAPI backend for instant responses.",
        icon: Zap,
        color: "text-yellow-400",
        bg: "bg-yellow-500/10"
    }
];

export default function Features() {
    return (
        <section id="features" className="py-32 bg-[#020205] relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-24">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Everything you need to <span className="text-purple-400">scale</span></h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
                        Replace your patchwork of apps with one unified, deeply integrated system.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {features.map((feature, idx) => (
                        <div 
                            key={idx} 
                            className="relative bg-[#090b10]/60 backdrop-blur-xl border border-white/10 hover:border-purple-500/40 rounded-2xl p-8 flex flex-col justify-between transition-all duration-500 hover:-translate-y-1.5 shadow-[0_15px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_rgba(139,92,246,0.12)] group overflow-hidden"
                        >
                            {/* Subtle ambient hover background gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                            
                            <div>
                                {/* Glowing Icon background */}
                                <div className={`relative ${feature.bg} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-all duration-500 shadow-md group-hover:shadow-[0_0_20px_rgba(139,92,246,0.25)]`}>
                                    <feature.icon className={`${feature.color} w-7 h-7`} />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white tracking-wide group-hover:text-purple-300 transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed font-light">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
