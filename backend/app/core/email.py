import os
import requests

RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")
FROM_EMAIL = "onboarding@resend.dev" # Default for free Resend testing

def send_team_invite(to_email: str, invite_id: str, inviter_name: str = "A teammate"):
    """
    Sends an invitation email using the Resend API.
    If no API key is present, prints the invite URL to the console for local testing.
    """
    invite_url = f"{FRONTEND_URL}/signup?invite_id={invite_id}"
    
    # 1. Fallback / Dev mode logging
    print("\n" + "="*50)
    print(f"📧 EMAIL TRIGGERED TO: {to_email}")
    print(f"🔗 INVITE LINK: {invite_url}")
    print("="*50 + "\n")

    if not RESEND_API_KEY:
        print("[WARN] No RESEND_API_KEY found. Skipping actual email dispatch.")
        return True

    # 2. Actual API Call
    try:
        html_content = f"""
        <div style="font-family: sans-serif; padding: 20px;">
            <h2>You've been invited to join the ERP-CRM Workspace!</h2>
            <p>{inviter_name} has invited you to collaborate with them.</p>
            <a href="{invite_url}" style="display: inline-block; padding: 10px 20px; background-color: #8B5CF6; color: white; text-decoration: none; border-radius: 5px;">
                Accept Invitation
            </a>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">
                Or copy and paste this link: <br/> {invite_url}
            </p>
        </div>
        """

        response = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "from": FROM_EMAIL,
                "to": to_email,
                "subject": "Join your team on ERP-CRM",
                "html": html_content
            }
        )
        
        response.raise_for_status()
        print(f"[INFO] Email successfully sent to {to_email}")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to send email to {to_email}: {e}")
        # We don't raise an exception here so the overall API request still succeeds,
        # but the admin should see the error in logs.
        return False
