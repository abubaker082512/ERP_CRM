import os
import json
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any

AUDIT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
AUDIT_FILE = os.path.join(AUDIT_DIR, "audit_history.json")

# In-memory fast cache
_audit_logs_cache: List[Dict[str, Any]] = []

def _ensure_storage():
    os.makedirs(AUDIT_DIR, exist_ok=True)
    if not os.path.exists(AUDIT_FILE):
        try:
            with open(AUDIT_FILE, "w", encoding="utf-8") as f:
                json.dump([], f)
        except Exception as e:
            print(f"[AuditService] Storage init error: {e}")

def _load_logs():
    global _audit_logs_cache
    _ensure_storage()
    if not _audit_logs_cache:
        try:
            if os.path.exists(AUDIT_FILE):
                with open(AUDIT_FILE, "r", encoding="utf-8") as f:
                    _audit_logs_cache = json.load(f)
        except Exception as e:
            print(f"[AuditService] Load logs error: {e}")
            _audit_logs_cache = []

def _save_logs():
    _ensure_storage()
    try:
        with open(AUDIT_FILE, "w", encoding="utf-8") as f:
            json.dump(_audit_logs_cache[-2000:], f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"[AuditService] Save logs error: {e}")

class AuditService:
    def __init__(self):
        _load_logs()

    def log_activity(
        self,
        module: str,
        entity_type: str,
        entity_id: str,
        entity_name: str,
        action: str,
        description: str,
        user_email: str = "admin@galaxy.erp",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Record an audit trail activity entry."""
        _load_logs()
        
        entry = {
            "id": str(uuid.uuid4()),
            "module": module.lower().strip(),
            "entity_type": entity_type.lower().strip(),
            "entity_id": str(entity_id),
            "entity_name": entity_name or f"{entity_type.capitalize()} #{str(entity_id)[:8]}",
            "action": action.lower().strip(),
            "description": description,
            "user_email": user_email,
            "metadata": metadata or {},
            "created_at": datetime.now(timezone.utc).isoformat()
        }

        # Add to in-memory front
        _audit_logs_cache.insert(0, entry)
        _save_logs()
        return entry

    def get_activities(
        self,
        module: Optional[str] = None,
        entity_type: Optional[str] = None,
        entity_id: Optional[str] = None,
        action: Optional[str] = None,
        limit: int = 100,
        skip: int = 0
    ) -> List[Dict[str, Any]]:
        """Retrieve audit entries with filtering."""
        _load_logs()
        filtered = _audit_logs_cache

        if module:
            mod_clean = module.lower().strip()
            filtered = [e for e in filtered if e.get("module") == mod_clean]

        if entity_type:
            ent_clean = entity_type.lower().strip()
            filtered = [e for e in filtered if e.get("entity_type") == ent_clean]

        if entity_id:
            eid_str = str(entity_id)
            filtered = [e for e in filtered if e.get("entity_id") == eid_str]

        if action:
            act_clean = action.lower().strip()
            filtered = [e for e in filtered if e.get("action") == act_clean]

        return filtered[skip : skip + limit]

    def get_module_stats(self) -> Dict[str, int]:
        _load_logs()
        counts: Dict[str, int] = {}
        for e in _audit_logs_cache:
            mod = e.get("module", "other")
            counts[mod] = counts.get(mod, 0) + 1
        return counts

audit_service = AuditService()
