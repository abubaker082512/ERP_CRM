import os
import json
from typing import Dict, Any, List
from langchain_core.messages import BaseMessage, AIMessage, HumanMessage
from langgraph.graph import StateGraph, END

from app.core.config import settings
from app.core.supabase_client import service_client, supabase
from app.services.embeddings import embedding_service
from app.antigravity.state import AntigravityState

# ==========================================
# MOCK LLM FOR LOCAL/KEYLESS RESILIENCE
# ==========================================

class MockChatLLM:
    """
    Mock LLM that matches the LangChain model interface.
    Generates intelligent responses and scripts based on Beraxis schemas.
    """
    def invoke(self, messages: List[BaseMessage], **kwargs) -> AIMessage:
        # Find the last user prompt
        user_prompt = ""
        for m in reversed(messages):
            if isinstance(m, HumanMessage) or m.type == "human":
                user_prompt = m.content
                break
                
        user_prompt_lower = user_prompt.lower()
        
        # Scenario A: CRM / Leads query
        if "lead" in user_prompt_lower or "crm" in user_prompt_lower:
            content = (
                "Based on the Beraxis database schemas, I recommend updating the crm_lead status. "
                "I will write a script to evaluate lead activity."
            )
            script = (
                "import requests\n"
                "import os\n"
                "api_url = os.getenv('BERAXIS_API_URL', 'http://localhost:8000/api/v1')\n"
                "token = os.getenv('USER_BEARER_TOKEN')\n"
                "headers = {'Authorization': f'Bearer {token}'} if token else {}\n"
                "resp = requests.get(f'{api_url}/leads', headers=headers)\n"
                "print(f'Fetched {len(resp.json()) if resp.status_code == 200 else 0} leads.')\n"
            )
            return AIMessage(content=content, additional_kwargs={"script": script})
            
        # Scenario B: Billing / Finance query
        elif "billing" in user_prompt_lower or "payment" in user_prompt_lower or "invoice" in user_prompt_lower:
            content = (
                "I detected outstanding billing metrics in the tenant's Micro-Brain context. "
                "I will execute a query to aggregate unpaid invoices and report the outstanding balances."
            )
            script = (
                "import requests\n"
                "import os\n"
                "api_url = os.getenv('BERAXIS_API_URL', 'http://localhost:8000/api/v1')\n"
                "token = os.getenv('USER_BEARER_TOKEN')\n"
                "headers = {'Authorization': f'Bearer {token}'} if token else {}\n"
                "resp = requests.get(f'{api_url}/accounting/moves', headers=headers)\n"
                "moves = resp.json() if resp.status_code == 200 else []\n"
                "unpaid = [m for m in moves if m.get('payment_state') != 'paid']\n"
                "total_due = sum(float(m.get('amount_total') or 0) for m in unpaid)\n"
                "print(f'Aggregate Alert: {len(unpaid)} unpaid invoices totaling ${total_due:.2f} due.')\n"
            )
            return AIMessage(content=content, additional_kwargs={"script": script})
            
        # Scenario C: Default fallback
        else:
            content = (
                "I will execute a general database checklist connection test on this workspace."
            )
            script = (
                "print('Checking connection... Connection OK.')\n"
            )
            return AIMessage(content=content, additional_kwargs={"script": script})

def get_llm():
    """
    Returns an active Chat model if keys are set, otherwise returns the Mock LLM.
    """
    openai_key = os.getenv("OPENAI_API_KEY") or getattr(settings, "OPENAI_API_KEY", "")
    anthropic_key = os.getenv("ANTHROPIC_API_KEY") or getattr(settings, "ANTHROPIC_API_KEY", "")
    
    if openai_key:
        try:
            from langchain_openai import ChatOpenAI
            return ChatOpenAI(api_key=openai_key, model="gpt-4o", temperature=0.2)
        except ImportError:
            pass
            
    if anthropic_key:
        try:
            from langchain_anthropic import ChatAnthropic
            return ChatAnthropic(api_key=anthropic_key, model="claude-3-5-sonnet-latest", temperature=0.2)
        except ImportError:
            pass
            
    return MockChatLLM()

# ==========================================
# LANGGRAPH NODE FUNCTIONS
# ==========================================

async def collect_context_node(state: AntigravityState) -> Dict[str, Any]:
    """
    Queries tenant micro-brain memories.
    First tries pgvector cosine similarity via Supabase RPC,
    with a fallback to standard recent records retrieval.
    """
    tenant_id = state.get("tenant_id")
    messages = state.get("messages") or []
    
    if not tenant_id:
        return {"micro_brain_context": ["No active tenant context provided."]}
        
    last_user_message = ""
    for m in reversed(messages):
        if isinstance(m, HumanMessage) or getattr(m, "type", "") == "human":
            last_user_message = m.content
            break
            
    context_items = []
    
    try:
        # Generate query embedding
        query_emb = embedding_service.get_embedding(last_user_message)
        
        # Try RPC matching first (requires RPC function applied on database)
        try:
            # We match memories for this tenant specifically
            rpc_res = service_client.rpc("match_tenant_memories", {
                "query_embedding": query_emb,
                "p_tenant_id": tenant_id,
                "match_threshold": 0.1,
                "match_count": 5
            }).execute()
            if rpc_res.data:
                for row in rpc_res.data:
                    context_items.append(f"[{row.get('category')}]: {row.get('summary')}")
        except Exception:
            # If RPC function is not created/fails, fallback to raw fetch filtered by tenant
            fetch_res = service_client.table("tenant_micro_brain_memories") \
                .select("category, summary") \
                .eq("tenant_id", tenant_id) \
                .order("created_at", desc=True) \
                .limit(5).execute()
            if fetch_res.data:
                for row in fetch_res.data:
                    context_items.append(f"[{row.get('category')}]: {row.get('summary')}")
                    
    except Exception as e:
        print(f"[WARN] Error collecting micro-brain context: {e}")
        
    if not context_items:
        context_items.append("No historical micro-brain memories recorded for this tenant yet.")
        
    return {"micro_brain_context": context_items}

async def macro_brain_analyst_node(state: AntigravityState) -> Dict[str, Any]:
    """
    Analyst evaluates the user request and the micro-brain context.
    Determines if code generation is required.
    """
    llm = get_llm()
    tenant_id = state.get("tenant_id")
    context_str = "\n".join(state.get("micro_brain_context") or [])
    
    system_prompt = (
        "You are the Antigravity Macro-Brain Analyst for Beraxis.\n"
        "You have knowledge of the Beraxis ERP/CRM system architecture.\n"
        f"Active Tenant Workspace: {tenant_id}\n\n"
        "Tenant Micro-Brain Context:\n"
        f"{context_str}\n\n"
        "Analyze the user's intent. If they want to perform calculations, reports, "
        "or create/update records, you must route to the coder node to write a Python script. "
        "Otherwise, respond politely."
    )
    
    messages = [
        HumanMessage(content=system_prompt),
        *state.get("messages")
    ]
    
    response = llm.invoke(messages)
    
    # Check if LLM response or mock has a script or decides to code
    script = response.additional_kwargs.get("script", "")
    next_step = "coder" if (script or "script" in response.content.lower()) else "end"
    
    new_messages = list(state.get("messages")) + [response]
    
    return {
        "messages": new_messages,
        "next_step": next_step
    }

async def coder_node(state: AntigravityState) -> Dict[str, Any]:
    """
    Writes the structured Python code script for execution inside E2B sandbox.
    """
    llm = get_llm()
    
    # If the analyst already generated a script (like in mock), retrieve it
    last_msg = state.get("messages")[-1]
    pre_generated_script = last_msg.additional_kwargs.get("script", "")
    
    if pre_generated_script:
        return {
            "generated_code": pre_generated_script,
            "next_step": "execute"
        }
        
    system_prompt = (
        "You are the Antigravity Coder node.\n"
        "Generate a clean python script to perform the requested actions via the Beraxis REST API.\n"
        "The script runs inside a sandbox environment where BERAXIS_API_URL and USER_BEARER_TOKEN "
        "are available as environment variables. Use 'requests' to execute actions.\n"
        "Return ONLY the raw python code. No markdown formatting, no code blocks."
    )
    
    messages = [
        HumanMessage(content=system_prompt),
        *state.get("messages")
    ]
    
    response = llm.invoke(messages)
    code = response.content.strip().replace("```python", "").replace("```", "")
    
    new_messages = list(state.get("messages")) + [response]
    
    return {
        "messages": new_messages,
        "generated_code": code,
        "next_step": "execute"
    }

async def execute_node(state: AntigravityState) -> Dict[str, Any]:
    """
    Placeholder/routing flag indicating that execution is needed.
    The execution itself is called by the sandbox runner.
    """
    return {"next_step": "end"}

# ==========================================
# GRAPH ROUTING CONTROLLER
# ==========================================

def route_next_node(state: AntigravityState) -> str:
    """
    Dynamic routing rule deciding the next node in the graph.
    """
    return state.get("next_step", "end")

# ==========================================
# GRAPH WORKFLOW SETUP
# ==========================================

workflow = StateGraph(AntigravityState)

# Define nodes
workflow.add_node("collect_context", collect_context_node)
workflow.add_node("analyst", macro_brain_analyst_node)
workflow.add_node("coder", coder_node)
workflow.add_node("execute_placeholder", execute_node)

# Set entry point
workflow.set_entry_point("collect_context")

# Connect flows
workflow.add_edge("collect_context", "analyst")

workflow.add_conditional_edges(
    "analyst",
    route_next_node,
    {
        "coder": "coder",
        "end": END
    }
)

workflow.add_conditional_edges(
    "coder",
    route_next_node,
    {
        "execute": "execute_placeholder",
        "end": END
    }
)

workflow.add_edge("execute_placeholder", END)

# Compile graph
compiled_graph = workflow.compile()

async def run_antigravity_graph(prompt: str, tenant_id: str, existing_messages: List[BaseMessage] = None) -> Dict[str, Any]:
    """
    Facade runner to execute the graph asynchronously.
    """
    messages = existing_messages or []
    messages.append(HumanMessage(content=prompt))
    
    initial_state = {
        "messages": messages,
        "tenant_id": tenant_id,
        "micro_brain_context": [],
        "generated_code": "",
        "execution_results": {},
        "next_step": "collect_context"
    }
    
    final_state = await compiled_graph.ainvoke(initial_state)
    return final_state
