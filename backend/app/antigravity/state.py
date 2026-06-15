from typing import Annotated, TypedDict, List, Dict, Any
from langchain_core.messages import BaseMessage

class AntigravityState(TypedDict):
    messages: List[BaseMessage]
    tenant_id: str                 # Extracted from JWT token
    micro_brain_context: List[str] # Relevant tenant trends extracted via pgvector
    generated_code: str            # Script output from Coder Agent
    execution_results: Dict[str, Any]
    next_step: str                 # Control router flag: 'analyst', 'coder', 'execute', 'end'
