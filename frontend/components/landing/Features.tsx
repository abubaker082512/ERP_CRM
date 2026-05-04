import { LayoutDashboard, Users, ShoppingCart, Package, ShieldCheck, Zap } from 'lucide-react';

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
        <section id="features" className="py-24 bg-[#020205] relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Everything you need to <span className="text-purple-400">scale</span></h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Replace your patchwork of apps with one unified, deeply integrated system.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <div key={idx} className="galaxy-card p-8 group">
                            <div className={`${feature.bg} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <feature.icon className={`${feature.color}`} size={28} />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                            <p className="text-gray-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
