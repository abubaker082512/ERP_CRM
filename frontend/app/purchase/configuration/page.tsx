"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PurchaseConfigurationPage() {
    const router = useRouter();
    useEffect(() => {
        // Redirect to system-wide settings page
        router.replace('/settings');
    }, [router]);

    return (
        <div className="flex h-screen items-center justify-center bg-[#0B101E] text-gray-400">
            <p className="text-sm font-medium animate-pulse">Redirecting to System Settings...</p>
        </div>
    );
}
