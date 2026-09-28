import type { Config } from "tailwindcss";

export default {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0F172A",
                surface: "#1E293B",
                primary: "#0EA5E9",
                success: "#10B981",
                warning: "#F59E0B",
                danger: "#EF4444",
            },
        },
    },
    plugins: [],
} satisfies Config;
