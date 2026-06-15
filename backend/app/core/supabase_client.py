from contextvars import ContextVar
from supabase import create_client, Client
from app.core.config import settings

# A ContextVar holds state local to the current async execution context/thread.
token_ctx_var: ContextVar[str] = ContextVar("supabase_token", default="")


class ProxiedSupabaseClient:
    """
    A proxy for the user-scoped Supabase client.
    This client applies the current request's JWT, so RLS is enforced per user/tenant.
    Used for all regular tenant operations.
    """
    def __getattr__(self, name):
        # Always create a fresh client instance because PostgREST auth state is internal
        client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        
        # Enforce RLS by mounting the current request's JWT
        token = token_ctx_var.get()
        if token:
            client.postgrest.auth(token)
            
        return getattr(client, name)


class ServiceRoleClient:
    """
    A TRUE service-role Supabase client that bypasses ALL Row Level Security.
    Uses the service_role key — NEVER applies any user JWT.
    Only used for Super Admin operations that must see ALL data across ALL tenants.
    """
    def __getattr__(self, name):
        # Use the service_role key to create a privileged client
        # This key bypasses RLS entirely — handle with care
        service_key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
        client = create_client(settings.SUPABASE_URL, service_key)
        # Explicitly DO NOT set any user auth token — service role key is enough
        return getattr(client, name)


# User-scoped client (respects RLS) — used for all regular operations
supabase = ProxiedSupabaseClient()

# Service-role client (bypasses RLS) — ONLY for super admin use
service_client = ServiceRoleClient()


def get_service_role_client() -> "ServiceRoleClient":
    """Return a service-role Supabase client instance that bypasses RLS."""
    return ServiceRoleClient()
