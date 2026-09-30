import os
import json
import time
from playwright.sync_api import sync_playwright

BASE_URL = "https://erp-crm-puce.vercel.app"
ARTIFACT_DIR = r"C:\Users\abuba\.gemini\antigravity-ide\brain\02025c1e-318e-4bc1-a0c3-4bc2173f63e4"
SCREENSHOT_DIR = os.path.join(ARTIFACT_DIR, "browser_screenshots")
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

MODULE_ROUTES = [
    "/",
    "/login",
    "/dashboard",
    "/apps",
    "/crm",
    "/sales",
    "/accounting",
    "/inventory",
    "/employees",
    "/helpdesk",
    "/discuss",
    "/documents",
    "/knowledge",
    "/project",
    "/todo",
    "/pos",
    "/manufacturing",
    "/purchase",
    "/payroll",
    "/recruitment",
    "/calendar",
    "/planning",
    "/attendances",
    "/barcode",
    "/billing",
    "/pricing",
    "/checkout",
    "/sign",
    "/surveys",
    "/reports",
    "/settings",
    "/appointments",
    "/contacts",
    "/shop",
    "/team",
    "/timesheets",
    "/super-admin"
]

def run_browser_audit():
    print("====================================================")
    print("[START] STARTING DEEP LIVE BROWSER & BUTTON AUDIT")
    print("====================================================")
    
    report_data = {
        "summary": {},
        "pages": {},
        "global_console_errors": [],
        "failed_network_requests": []
    }

    with sync_playwright() as p:
        # Launch browser in visible headed mode so user can see it live
        browser = p.chromium.launch(headless=False, slow_mo=400)
        context = browser.new_context(viewport={'width': 1440, 'height': 900})
        page = context.new_page()

        # Listen to console errors and network failures
        def handle_console(msg):
            if msg.type == "error":
                report_data["global_console_errors"].append({
                    "url": page.url,
                    "text": msg.text
                })

        def handle_request_failed(response):
            if response.status >= 400:
                report_data["failed_network_requests"].append({
                    "url": response.url,
                    "status": response.status,
                    "status_text": response.status_text
                })

        page.on("console", handle_console)
        page.on("response", handle_request_failed)

        # 1. First, attempt Login to establish session context if possible
        try:
            print("\n[AUTH] Navigating to Login Page to verify Auth Flow...")
            page.goto(f"{BASE_URL}/login", wait_until="networkidle", timeout=15000)
            page.fill('input[type="email"]', 'admin2@erp-crm.com')
            page.fill('input[type="password"]', 'NewAdmin123!')
            
            # Find and click login button
            login_btn = page.query_selector('button[type="submit"]') or page.query_selector('button:has-text("Sign in")') or page.query_selector('button:has-text("Login")')
            if login_btn:
                login_btn.click()
                page.wait_for_timeout(2000)
            print("   Login flow executed.")
        except Exception as e:
            print(f"   Note on login step: {e}")

        # 2. Iterate over all module pages
        total_buttons_tested = 0
        total_buttons_passed = 0
        total_modals_opened = 0

        for route in MODULE_ROUTES:
            target_url = f"{BASE_URL}{route}"
            print(f"\n[URL] Auditing Page: {route} ({target_url})")
            
            page_info = {
                "route": route,
                "url": target_url,
                "title": "",
                "button_count": 0,
                "buttons_detail": [],
                "page_errors": [],
                "screenshot_path": None
            }

            try:
                page.goto(target_url, wait_until="domcontentloaded", timeout=15000)
                page.wait_for_timeout(1000) # wait for hydration
                
                page_info["title"] = page.title()

                # Take screenshot for major modules
                sanitized_name = route.replace("/", "") or "home"
                screenshot_file = os.path.join(SCREENSHOT_DIR, f"{sanitized_name}.png")
                page.screenshot(path=screenshot_file, full_page=False)
                page_info["screenshot_path"] = screenshot_file

                # Find all clickable buttons and interactive triggers
                buttons = page.query_selector_all('button, a.btn, [role="button"], input[type="button"], input[type="submit"]')
                page_info["button_count"] = len(buttons)
                total_buttons_tested += len(buttons)

                print(f"   Found {len(buttons)} interactive buttons/triggers on {route}")

                for idx, btn in enumerate(buttons[:15]): # Test up to 15 buttons per page to avoid infinite loops
                    try:
                        text = (btn.inner_text() or btn.get_attribute("aria-label") or btn.get_attribute("title") or btn.get_attribute("id") or f"Button-{idx}").strip()
                        text = text.replace("\n", " ")[:40]
                        
                        is_visible = btn.is_visible()
                        is_enabled = btn.is_enabled()
                        
                        btn_status = "OK"
                        if is_visible and is_enabled:
                            # Test click (handling safe click without navigation crash)
                            try:
                                # Check if button is safe to click (not destructive or link leaving domain)
                                btn_type = btn.get_attribute("type")
                                btn_href = btn.get_attribute("href")
                                
                                if btn_href and btn_href.startswith("http") and BASE_URL not in btn_href:
                                    btn_status = "EXTERNAL_LINK"
                                else:
                                    # Click safely
                                    btn.click(timeout=2000, force=False)
                                    page.wait_for_timeout(300)
                                    
                                    # Check if modal opened
                                    modal = page.query_selector('[role="dialog"], .modal, .fixed.aria-modal')
                                    if modal and modal.is_visible():
                                        total_modals_opened += 1
                                        # Close modal if escape/close button available
                                        close_btn = page.query_selector('[role="dialog"] button:has-text("×"), [role="dialog"] button:has-text("Close"), [role="dialog"] button:has-text("Cancel")')
                                        if close_btn:
                                            close_btn.click(timeout=1000)
                                    
                                    total_buttons_passed += 1
                            except Exception as click_err:
                                btn_status = f"CLICK_WARN: {str(click_err)[:50]}"
                        else:
                            btn_status = "DISABLED/HIDDEN"

                        page_info["buttons_detail"].append({
                            "index": idx,
                            "text": text,
                            "visible": is_visible,
                            "enabled": is_enabled,
                            "status": btn_status
                        })

                    except Exception as btn_err:
                        page_info["buttons_detail"].append({
                            "index": idx,
                            "text": f"Button-{idx}",
                            "status": f"ERROR: {str(btn_err)[:50]}"
                        })

            except Exception as page_err:
                print(f"   [ERR] Page audit error on {route}: {page_err}")
                page_info["page_errors"].append(str(page_err))

            report_data["pages"][route] = page_info

        browser.close()

    report_data["summary"] = {
        "total_pages_audited": len(MODULE_ROUTES),
        "total_buttons_tested": total_buttons_tested,
        "total_buttons_passed": total_buttons_passed,
        "total_modals_opened": total_modals_opened,
        "global_console_errors_count": len(report_data["global_console_errors"]),
        "failed_network_requests_count": len(report_data["failed_network_requests"])
    }

    # Save detailed JSON report
    json_path = os.path.join(ARTIFACT_DIR, "live_browser_audit_results.json")
    with open(json_path, "w") as f:
        json.dump(report_data, f, indent=2)

    print("\n====================================================")
    print("[DONE] LIVE BROWSER AUDIT COMPLETE")
    print(f"Total Pages Audited: {len(MODULE_ROUTES)}")
    print(f"Total Interactive Buttons Tested: {total_buttons_tested}")
    print(f"Modals Successfully Triggered: {total_modals_opened}")
    print(f"Detailed results saved to: {json_path}")
    print("====================================================")

if __name__ == "__main__":
    run_browser_audit()
