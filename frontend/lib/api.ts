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

    // Retrieve token & active branch from localStorage if in browser environment
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

        const activeBranchId = localStorage.getItem('beraxis_active_branch_id');
        if (activeBranchId) {
            headers['X-Company-Id'] = activeBranchId;
            headers['X-Branch-Id'] = activeBranchId;
        }

        const sessionId = localStorage.getItem('beraxis_session_id');
        if (sessionId) {
            headers['X-Session-Id'] = sessionId;
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

    // Auth & Single Concurrent Session Interceptor
    if (response.status === 401 && typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        try {
            const cloned = response.clone();
            const errBody = await cloned.json();
            if (errBody?.detail && String(errBody.detail).includes('SESSION_SUPERSEDED')) {
                console.warn("[API] Session superseded by another login worldwide - logging out");
                localStorage.removeItem('token');
                localStorage.removeItem('beraxis_session_id');
                window.location.href = '/login?reason=concurrent_login';
                return response;
            }
        } catch {}

        if (path.includes('/auth/me') || path.includes('/auth/login')) {
            console.warn("[API] 401 Unauthorized on Auth Check - Redirecting to login");
            localStorage.removeItem('token');
            localStorage.removeItem('beraxis_session_id');
            window.location.href = '/login';
        }
    }

    return response;
}
