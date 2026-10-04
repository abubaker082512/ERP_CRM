// lib/api.ts

/**
 * Global fetch wrapper for the SaaS ERP-CRM.
 * All requests go to /api/v1/* which Next.js proxies to the backend server.
 * This completely eliminates CORS issues since the request is same-origin.
 */
export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
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

    // Auth Interceptor: Only clear session if explicit auth endpoint returns 401
    if (response.status === 401 && (path.includes('/auth/me') || path.includes('/auth/login'))) {
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
            console.warn("[API] 401 Unauthorized on Auth Check - Redirecting to login");
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
    }

    return response;
}
