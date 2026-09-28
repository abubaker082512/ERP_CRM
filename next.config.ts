/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    // Proxy all /api/v1/* requests through Next.js to avoid browser CORS issues.
    // On Vercel, set BACKEND_INTERNAL_URL=https://galaxy-erp-backend.onrender.com
    async rewrites() {
        const backendUrl =
            process.env.BACKEND_INTERNAL_URL ||
            process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ||
            'https://galaxy-erp-backend.onrender.com';
        return [
            {
                source: '/api/v1/:path*',
                destination: `${backendUrl}/api/v1/:path*`,
            },
        ];
    },
};

export default nextConfig;
