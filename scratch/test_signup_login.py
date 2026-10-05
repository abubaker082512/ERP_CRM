import asyncio
from playwright.async_api import async_playwright

async def test_auth_persistence():
    print("=== TESTING FREE ACCOUNT LOGIN PERSISTENCE ===")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()

        console_logs = []
        page.on("console", lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))

        # Navigate to login
        print("Navigating to https://erp-crm-puce.vercel.app/login ...")
        await page.goto("https://erp-crm-puce.vercel.app/login", wait_until="networkidle", timeout=30000)

        # Login as super admin or user
        print("Submitting login form ...")
        await page.fill("#login-email", "admin@beraxis.online")
        await page.fill("#login-password", "SeedAdmin123!")
        await page.click("#login-submit")

        # Wait 5 seconds to ensure NO auto-logout occurs
        await page.wait_for_timeout(5000)
        current_url = page.url
        print(f"URL after 5 seconds: {current_url}")

        if "/login" not in current_url:
            print("SUCCESS: Session remained active! No automatic logout occurred.")
        else:
            print("FAILURE: User was redirected back to login.")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(test_auth_persistence())
