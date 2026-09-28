import { Star } from "lucide-react";

const testimonials = [
    {
        name: "Sarah Jenkins",
        role: "COO at TechNova",
        content: "Galaxy ERP completely transformed how we operate. We replaced five different fragmented systems with one beautiful interface. Our sales cycle is 30% faster.",
        avatar: "S"
    },
    {
        name: "Marcus Rodriguez",
        role: "Founder, ScaleUp Inc",
        content: "The level of polish on this platform is insane. It doesn't feel like enterprise software, it feels like a modern SaaS app that my team actually enjoys using.",
        avatar: "M"
    },
    {
        name: "Elena Rossi",
        role: "VP of Operations",
        content: "The real-time inventory sync combined with the intelligent CRM has saved us countless hours of manual data entry. Best investment we've made this year.",
        avatar: "E"
    }
];

export default function Testimonials() {
    return (
        <section className="py-24 bg-[#0F172A] relative z-10 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Loved by <span className="text-pink-400">visionaries</span></h2>
                    <p className="text-gray-400 text-lg">Don't just take our word for it. Here's what our users have to say.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, idx) => (
                        <div key={idx} className="galaxy-card p-8 hover:-translate-y-2 transition-transform duration-300">
                            <div className="flex gap-1 text-yellow-400 mb-6">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} size={16} fill="currentColor" />
                                ))}
                            </div>
                            <p className="text-gray-300 mb-8 italic">"{testimonial.content}"</p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg border border-white/20 shadow-lg">
                                    {testimonial.avatar}
                                </div>
                                <div>
                                    <h4 className="text-white font-bold">{testimonial.name}</h4>
                                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
