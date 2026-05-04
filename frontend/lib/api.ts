// lib/api.ts

/**
 * Global fetch wrapper for the SaaS ERP-CRM.
 * Automatically handles the injection of the Authorization Bearer token 
 * from the local storage (auth payload) to support multi-tenant isolation.
 */
export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';
    
    // Ensure the endpoint starts with a slash
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // Setup headers
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...((options.headers as Record<string, string>) || {})
    };

    // Retrieve token from localStorage if in browser environment
    if (typeof window !== 'undefined') {
        const directToken = localStorage.getItem('token');
        // Robust check for valid token strings
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
