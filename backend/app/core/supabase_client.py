from contextvars import ContextVar
from supabase import create_client, Client
from app.core.config import settings

# A ContextVar holds state local to the current async execution context/thread.
token_ctx_var: ContextVar[str] = ContextVar("supabase_token", default="")

class ProxiedSupabaseClient:
    def __getattr__(self, name):
        # Always create a fresh client instance because PostgREST auth state is internal
        client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        
        # Enforce RLS by mounting the current request's JWT
        token = token_ctx_var.get()
        if token:
            client.postgrest.auth(token)
            
        return getattr(client, name)

supabase = ProxiedSupabaseClient()
