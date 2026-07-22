// lib/api.ts

/**
 * Global fetch wrapper for the SaaS ERP-CRM.
 * All requests go to /api/v1/* which Next.js proxies to the backend server.
 * This completely eliminates CORS issues since the request is same-origin.
 */
export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
    // Always use the relative path — Next.js rewrites handle the proxy to the backend.
    // This means requests are always same-origin (beraxis.online → beraxis.online/api/v1/*)
    // and Next.js forwards them server-side to Render. No CORS ever.
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const baseUrl = '/api/v1';

    // Setup headers
    const headers: Record<string, string> = {
        ...((options.headers as Record<string, string>) || {}),
    };

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    // Retrieve token from localStorage if in browser environment
    if (typeof window !== 'undefined') {
        const directToken = localStorage.getItem('token');
        if (directToken && directToken !== 'null' && directToken !== 'undefined' && directToken.length > 10) {
            headers['Authorization'] = `Bearer ${directToken}`;
        } else {
            const authData = localStorage.getItem('auth_data');
            if (authData) {
                try {
                    const parsed = JSON.parse(authData);
                    if (parsed.access_token) {
                        headers['Authorization'] = `Bearer ${parsed.access_token}`;
                    }
                } catch (e) {
                    // silent fail
                }
            }
        }
    }

    const config: RequestInit = {
        ...options,
        headers,
    };

    const finalUrl = `${baseUrl}${path}`;
    const response = await fetch(finalUrl, config);
    console.log(`[API] ${options.method || 'GET'} ${path} => ${response.status}`);

    // SaaS Interceptor: If trial is expired or payment is required
    if (response.status === 402) {
        if (typeof window !== 'undefined') {
            window.location.href = '/billing';
        }
    }

    // Auth Interceptor: If token is invalid or expired
    if (response.status === 401) {
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
            console.warn("[API] 401 Unauthorized - Redirecting to login");
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
    }

    return response;
}
