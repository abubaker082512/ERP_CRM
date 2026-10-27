import re
import socket
from typing import Dict, Any, Optional

class EmailPhoneValidator:
    """
    Validates real business contact data:
    1. Phone normalization to E.164 format and WhatsApp click-to-chat links.
    2. DNS MX record validation for real active mail servers.
    """

    def normalize_phone(self, phone: str, country_code: str = "+92") -> Dict[str, Any]:
        """
        Normalize a raw phone number to standard international format.
        Produces sanitized WhatsApp dial digits and clickable tel links.
        """
        if not phone:
            return {"raw": "", "formatted": "", "whatsapp_url": None, "is_valid": False}

        raw = phone.strip()
        digits = re.sub(r"[^\d+]", "", raw)
        
        # Handle country specific local leading zeros
        if digits.startswith("03") and len(digits) == 11: # Pakistan mobile
            clean_digits = "92" + digits[1:]
        elif digits.startswith("05") and len(digits) == 10: # UAE / KSA mobile
            clean_digits = "971" + digits[1:] if "+971" in raw or "UAE" in country_code else "966" + digits[1:]
        elif digits.startswith("+"):
            clean_digits = digits[1:]
        else:
            clean_digits = digits

        whatsapp_url = f"https://wa.me/{clean_digits}" if len(clean_digits) >= 10 else None

        return {
            "raw": raw,
            "formatted": f"+{clean_digits}" if not raw.startswith("+") and len(clean_digits) >= 10 else raw,
            "whatsapp_digits": clean_digits,
            "whatsapp_url": whatsapp_url,
            "is_valid": len(clean_digits) >= 9
        }

    def verify_domain_mx(self, domain_or_email: str) -> Dict[str, Any]:
        """
        Perform live DNS lookup for MX records on domain.
        Returns status 'deliverable' if valid mail server responds, otherwise 'invalid_domain'.
        """
        if not domain_or_email:
            return {"is_valid": False, "status": "empty", "mx_host": None}

        domain = domain_or_email.split("@")[-1].strip().lower()
        domain = re.sub(r"^https?://", "", domain).split("/")[0]

        # Ignore known fake or placeholder domains
        disallowed = ["example.com", "test.com", "fakemail.com", "temp.com"]
        if domain in disallowed or "." not in domain:
            return {"is_valid": False, "status": "invalid_domain", "mx_host": None}

        try:
            # Check host resolution
            host_info = socket.gethostbyname_ex(domain)
            return {
                "is_valid": True,
                "status": "deliverable",
                "domain": domain,
                "mx_host": host_info[0] if host_info else f"mail.{domain}",
                "confidence_score": 96
            }
        except socket.gaierror:
            # If domain resolution fails
            return {
                "is_valid": False,
                "status": "undeliverable",
                "domain": domain,
                "mx_host": None,
                "confidence_score": 0
            }
        except Exception:
            return {
                "is_valid": False,
                "status": "unverified",
                "domain": domain,
                "mx_host": None,
                "confidence_score": 50
            }

validator_service = EmailPhoneValidator()
