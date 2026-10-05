import asyncio
from playwright.async_api import async_playwright

async def inspect_ui():
    print("=== STARTING PLAYWRIGHT BROWSER UI AUDIT ===")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()

        console_logs = []
        page.on("console", lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))

        # 1. Inspect Homepage
        print("\n--- 1. Inspecting Homepage (https://erp-crm-puce.vercel.app/) ---")
        response = await page.goto("https://erp-crm-puce.vercel.app/", wait_until="domcontentloaded", timeout=45000)
        print(f"Homepage HTTP Status: {response.status if response else 'No response'}")
        await page.screenshot(path="scratch/homepage_screenshot.png")
        print("Saved homepage screenshot to scratch/homepage_screenshot.png")

        # 2. Inspect Login Page
        print("\n--- 2. Inspecting Login Page (https://erp-crm-puce.vercel.app/login) ---")
        response_login = await page.goto("https://erp-crm-puce.vercel.app/login", wait_until="domcontentloaded", timeout=45000)
        print(f"Login Page HTTP Status: {response_login.status if response_login else 'No response'}")
        await page.screenshot(path="scratch/login_screenshot.png")
        print("Saved login screenshot to scratch/login_screenshot.png")

        # 3. Test Admin Login Execution
        print("\n--- 3. Testing Admin Login in Browser ---")
        await page.fill("#login-email", "admin@beraxis.online")
        await page.fill("#login-password", "SeedAdmin123!")
        await page.click("#login-submit")
        await page.wait_for_timeout(4000)
        print(f"Post-login URL: {page.url}")
        await page.screenshot(path="scratch/post_login_screenshot.png")
        print("Saved post-login screenshot to scratch/post_login_screenshot.png")

        print("\n--- Console Logs Recorded ---")
        for log in console_logs:
            print(log)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(inspect_ui())
