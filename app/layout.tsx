import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

import CosmicBackground from "@/components/CosmicBackground";
import GalaxyAppShell from "@/components/layout/GalaxyAppShell";

export const metadata: Metadata = {
    title: "Beraxis AI ERP",
    description: "Next-Gen AI-Enhanced ERP System",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} relative min-h-screen text-white bg-transparent`}>
                <div className="aurora-bg" />
                <CosmicBackground />
                <GalaxyAppShell>{children}</GalaxyAppShell>
            </body>
        </html>
    );
}
