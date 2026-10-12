import os
import json
from datetime import datetime, timezone, timedelta
from typing import Dict, Any

CREDITS_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "lead_credits.json")

class LeadCreditService:
    def __init__(self):
        os.makedirs(os.path.dirname(CREDITS_FILE), exist_ok=True)
        if not os.path.exists(CREDITS_FILE):
            self._save_default()

    def _save_default(self) -> Dict[str, Any]:
        default_state = {
            "plan": "Standard",
            "credits_per_user": 1500,
            "user_seats": 1,
            "total_quota": 1500,
            "used_credits": 0,
            "bonus_credits": 0,
            "cycle_start": datetime.now(timezone.utc).isoformat(),
            "cycle_renewal": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
            "transactions": []
        }
        with open(CREDITS_FILE, "w", encoding="utf-8") as f:
            json.dump(default_state, f, indent=2)
        return default_state

    def get_credits_status(self) -> Dict[str, Any]:
        try:
            if not os.path.exists(CREDITS_FILE):
                return self._save_default()
            with open(CREDITS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            credits_per_user = data.get("credits_per_user", 1500)
            user_seats = data.get("user_seats", 1)
            bonus = data.get("bonus_credits", 0)
            total = (credits_per_user * user_seats) + bonus
            used = data.get("used_credits", 0)
            remaining = max(0, total - used)

            return {
                "plan": data.get("plan", "Standard"),
                "credits_per_user": credits_per_user,
                "user_seats": user_seats,
                "total_quota": total,
                "used_credits": used,
                "remaining_credits": remaining,
                "bonus_credits": bonus,
                "cycle_renewal": data.get("cycle_renewal"),
                "is_exhausted": remaining <= 0
            }
        except Exception:
            return self._save_default()

    def check_and_deduct_credits(self, count: int, description: str = "CRM Import") -> Dict[str, Any]:
        status = self.get_credits_status()
        if status["remaining_credits"] < count:
            return {
                "success": False,
                "error": "INSUFFICIENT_CREDITS",
                "message": f"Lead credit limit reached! You requested {count} lead(s), but only have {status['remaining_credits']} credit(s) remaining for this month. The Standard plan includes 1,500 lead credits per user seat per month.",
                "remaining_credits": status["remaining_credits"],
                "total_quota": status["total_quota"]
            }

        try:
            with open(CREDITS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            credits_per_user = data.get("credits_per_user", 1500)
            user_seats = data.get("user_seats", 1)
            bonus = data.get("bonus_credits", 0)
            total = (credits_per_user * user_seats) + bonus

            data["used_credits"] = data.get("used_credits", 0) + count
            tx = {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "count": count,
                "description": description,
                "remaining": max(0, total - data["used_credits"])
            }
            txs = data.get("transactions", [])
            txs.append(tx)
            data["transactions"] = txs[-50:]

            with open(CREDITS_FILE, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)

            new_status = self.get_credits_status()
            return {
                "success": True,
                "deducted": count,
                "remaining_credits": new_status["remaining_credits"],
                "total_quota": new_status["total_quota"]
            }
        except Exception as e:
            return {
                "success": True,
                "deducted": count,
                "remaining_credits": max(0, status["remaining_credits"] - count),
                "total_quota": status["total_quota"]
            }

    def adjust_credits(self, bonus_add: int = 0, new_quota_per_user: int = None, user_seats: int = None) -> Dict[str, Any]:
        try:
            with open(CREDITS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            if bonus_add != 0:
                data["bonus_credits"] = max(0, data.get("bonus_credits", 0) + bonus_add)
            if new_quota_per_user is not None:
                data["credits_per_user"] = new_quota_per_user
            if user_seats is not None:
                data["user_seats"] = user_seats
            
            with open(CREDITS_FILE, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            
            return self.get_credits_status()
        except Exception:
            return self.get_credits_status()

lead_credit_service = LeadCreditService()
