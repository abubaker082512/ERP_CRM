/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    ...(process.env.DISABLE_WEBPACK_CACHE === '1'
        ? { experimental: { cpus: 1, workerThreads: false } }
        : {}),
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    async redirects() {
        return [
            {
                source: '/voice',
                destination: '/ai',
                permanent: true,
            },
            {
                source: '/voice-pilot',
                destination: '/ai',
                permanent: true,
            },
            {
                source: '/artificial-intelligence',
                destination: '/ai',
                permanent: true,
            },
            {
                source: '/lead-pool',
                destination: '/leads-pool',
                permanent: true,
            },
        ];
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
    webpack(config: any, { isServer, webpack }: { isServer: boolean; webpack: any }) {
        if (process.env.DISABLE_WEBPACK_CACHE === '1') {
            config.cache = false;
        }
        config.plugins.push(
            new webpack.NormalModuleReplacementPlugin(/^node:/, (resource: any) => {
                resource.request = resource.request.replace(/^node:/, '');
            })
        );
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                https: false,
                http: false,
                path: false,
                os: false,
                express: false,
            };
        }
        return config;
    },
};

export default nextConfig;
