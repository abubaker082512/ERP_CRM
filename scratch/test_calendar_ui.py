import asyncio
from playwright.async_api import async_playwright

async def test_appointment_creation():
    print("=== TESTING APPOINTMENT CREATION IN BROWSER ===")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()

        console_logs = []
        page.on("console", lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))

        # Login
        print("Logging in...")
        await page.goto("https://erp-crm-puce.vercel.app/login", wait_until="networkidle", timeout=30000)
        await page.fill("#login-email", "admin@beraxis.online")
        await page.fill("#login-password", "SeedAdmin123!")
        await page.click("#login-submit")
        await page.wait_for_timeout(4000)

        # Navigate to calendar
        print("Navigating to /calendar...")
        await page.goto("https://erp-crm-puce.vercel.app/calendar", wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(2000)

        # Look for New Event / New Appointment button
        print("Opening New Appointment modal...")
        buttons = await page.query_selector_all("button")
        for b in buttons:
            txt = await b.inner_text()
            if "New Event" in txt or "New Appointment" in txt or "Event" in txt:
                await b.click()
                break

        await page.wait_for_timeout(1000)

        # Check if modal opened
        modal = await page.query_selector("input[placeholder*='title']")
        if modal:
            print("Modal successfully opened!")
            await modal.fill("Playwright Automated Test Appointment")
            
            # Click submit button
            submit_btn = await page.query_selector("button:has-text('Create')")
            if submit_btn:
                print("Clicking Create Appointment button...")
                await submit_btn.click()
                await page.wait_for_timeout(3000)

        print("\nConsole logs recorded during test:")
        for l in console_logs:
            if "/calendar" in l:
                print(l)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(test_appointment_creation())
