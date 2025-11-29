"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function BarcodeLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem("token");
        if (!token) router.push("/login");
    }, [router]);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#0F172A] text-white flex flex-col">
            {children}
        </div>
    );
}
