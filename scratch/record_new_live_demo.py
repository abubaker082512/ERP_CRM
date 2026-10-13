import os
import time
import math
import json
from playwright.sync_api import sync_playwright

RECORD_DIR = "D:/ERP_CRM/scratch/live_demo_production/raw_recordings"
os.makedirs(RECORD_DIR, exist_ok=True)

cursor_script = """
window.addEventListener('DOMContentLoaded', () => {
    let cursor = document.getElementById('pw-cursor');
    if (!cursor) {
        cursor = document.createElement('div');
        cursor.id = 'pw-cursor';
        cursor.style.position = 'fixed';
        cursor.style.width = '30px';
        cursor.style.height = '30px';
        cursor.style.borderRadius = '50%';
        cursor.style.border = '3px solid #38bdf8';
        cursor.style.backgroundColor = 'rgba(56, 189, 248, 0.4)';
        cursor.style.pointerEvents = 'none';
        cursor.style.zIndex = '99999999';
        cursor.style.transform = 'translate(-50%, -50%)';
        cursor.style.boxShadow = '0 0 22px rgba(56, 189, 248, 0.95)';
        cursor.style.transition = 'transform 0.08s ease';
        document.body.appendChild(cursor);
        
        window.addEventListener('mousemove', e => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
        
        window.addEventListener('mousedown', e => {
            cursor.style.transform = 'translate(-50%, -50%) scale(0.65)';
            cursor.style.backgroundColor = 'rgba(250, 204, 21, 0.9)';
            cursor.style.borderColor = '#facc15';

            let ripple = document.createElement('div');
            ripple.style.position = 'fixed';
            ripple.style.left = e.clientX + 'px';
            ripple.style.top = e.clientY + 'px';
            ripple.style.width = '12px';
            ripple.style.height = '12px';
            ripple.style.borderRadius = '50%';
            ripple.style.border = '3px solid #facc15';
            ripple.style.transform = 'translate(-50%, -50%) scale(1)';
            ripple.style.opacity = '1';
            ripple.style.pointerEvents = 'none';
            ripple.style.zIndex = '99999998';
            ripple.style.transition = 'all 0.5s ease-out';
            document.body.appendChild(ripple);
            setTimeout(() => {
                ripple.style.transform = 'translate(-50%, -50%) scale(4.5)';
                ripple.style.opacity = '0';
            }, 10);
            setTimeout(() => ripple.remove(), 600);
        });
        
        window.addEventListener('mouseup', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            cursor.style.backgroundColor = 'rgba(56, 189, 248, 0.4)';
            cursor.style.borderColor = '#38bdf8';
        });
    }
});
"""

def smooth_glide(page, start_x, start_y, end_x, end_y, steps=25, delay=0.015):
    for i in range(steps + 1):
        t = i / steps
        ease = 0.5 - 0.5 * math.cos(math.pi * t)
        curr_x = start_x + (end_x - start_x) * ease
        curr_y = start_y + (end_y - start_y) * ease
        page.mouse.move(curr_x, curr_y)
        time.sleep(delay)

def run_recording():
    print("Launching Chromium for Live High-Converting Product Demo...", flush=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            record_video_dir=RECORD_DIR,
            record_video_size={'width': 1920, 'height': 1080}
        )
        context.add_init_script(cursor_script)
        page = context.new_page()

        # ========================================================
        # SCENE 1: Login & The Hook (Target ~12.92s)
        # ========================================================
        print("Scene 1: Login & Hook...", flush=True)
        t_scene1_start = time.time()
        page.goto("https://www.beraxis.online/login", wait_until="domcontentloaded")
        page.wait_for_timeout(1000)
        
        # Smooth mouse glide to email field
        smooth_glide(page, 960, 200, 960, 410, steps=25)
        page.click("#login-email")
        page.type("#login-email", "abubaker0825@gmail.com", delay=55)
        page.wait_for_timeout(400)
        
        # Smooth mouse glide to password field
        smooth_glide(page, 960, 410, 960, 495, steps=20)
        page.click("#login-password")
        page.type("#login-password", "Bera@0817", delay=65)
        page.wait_for_timeout(400)
        
        # Glide to submit button & click
        smooth_glide(page, 960, 495, 960, 565, steps=20)
        page.click("#login-submit")
        page.wait_for_timeout(3200)
        
        # Hover on landing navigation
        smooth_glide(page, 960, 565, 1200, 100, steps=25)
        page.wait_for_timeout(1000)
        
        elapsed1 = time.time() - t_scene1_start
        if elapsed1 < 12.92:
            page.wait_for_timeout(int((12.92 - elapsed1) * 1000))
        print(f"Scene 1 completed in {time.time() - t_scene1_start:.2f}s", flush=True)

        # ========================================================
        # SCENE 2: Executive Dashboard & Workspace (Target ~12.66s)
        # ========================================================
        print("Scene 2: Executive Dashboard & Workspace...", flush=True)
        t_scene2_start = time.time()
        page.goto("https://www.beraxis.online/dashboard", wait_until="domcontentloaded")
        page.wait_for_timeout(1200)
        
        # Glide across executive KPIs
        smooth_glide(page, 1200, 100, 500, 280, steps=25)
        page.wait_for_timeout(800)
        smooth_glide(page, 500, 280, 980, 280, steps=25)
        page.wait_for_timeout(800)
        smooth_glide(page, 980, 280, 1450, 280, steps=25)
        page.wait_for_timeout(800)
        
        # Smooth scroll
        page.evaluate("window.scrollBy({ top: 380, behavior: 'smooth' })")
        page.wait_for_timeout(1200)
        smooth_glide(page, 1450, 280, 850, 520, steps=25)
        page.wait_for_timeout(1000)
        
        # Navigate to /apps
        page.goto("https://www.beraxis.online/apps", wait_until="domcontentloaded")
        page.wait_for_timeout(1000)
        smooth_glide(page, 850, 520, 600, 350, steps=20)
        page.wait_for_timeout(800)
        smooth_glide(page, 600, 350, 1100, 350, steps=20)
        page.wait_for_timeout(800)
        
        elapsed2 = time.time() - t_scene2_start
        if elapsed2 < 12.66:
            page.wait_for_timeout(int((12.66 - elapsed2) * 1000))
        print(f"Scene 2 completed in {time.time() - t_scene2_start:.2f}s", flush=True)

        # ========================================================
        # SCENE 3: Inbound AI Lead Pool (Target ~13.62s)
        # ========================================================
        print("Scene 3: Inbound AI Lead Pool...", flush=True)
        t_scene3_start = time.time()
        page.goto("https://www.beraxis.online/crm/leads-pool", wait_until="domcontentloaded")
        page.wait_for_timeout(1500)
        
        smooth_glide(page, 1100, 350, 420, 260, steps=25)
        page.wait_for_timeout(1000)
        # Glide down lead rows showing hot lead scores
        smooth_glide(page, 420, 260, 920, 380, steps=25)
        page.wait_for_timeout(1200)
        smooth_glide(page, 920, 380, 1450, 380, steps=25)
        page.wait_for_timeout(1000)
        
        page.evaluate("window.scrollBy({ top: 320, behavior: 'smooth' })")
        page.wait_for_timeout(1200)
        smooth_glide(page, 1450, 380, 750, 500, steps=25)
        page.wait_for_timeout(1200)
        
        elapsed3 = time.time() - t_scene3_start
        if elapsed3 < 13.62:
            page.wait_for_timeout(int((13.62 - elapsed3) * 1000))
        print(f"Scene 3 completed in {time.time() - t_scene3_start:.2f}s", flush=True)

        # ========================================================
        # SCENE 4: Visual Sales CRM (Target ~10.69s)
        # ========================================================
        print("Scene 4: Visual Sales CRM...", flush=True)
        t_scene4_start = time.time()
        page.goto("https://www.beraxis.online/crm", wait_until="domcontentloaded")
        page.wait_for_timeout(1500)
        
        smooth_glide(page, 750, 500, 380, 320, steps=25)
        page.wait_for_timeout(1000)
        smooth_glide(page, 380, 320, 780, 320, steps=25)
        page.wait_for_timeout(1000)
        smooth_glide(page, 780, 320, 1200, 320, steps=25)
        page.wait_for_timeout(1000)
        
        page.evaluate("window.scrollBy({ top: 250, behavior: 'smooth' })")
        page.wait_for_timeout(1200)
        smooth_glide(page, 1200, 320, 650, 480, steps=20)
        page.wait_for_timeout(800)
        
        elapsed4 = time.time() - t_scene4_start
        if elapsed4 < 10.69:
            page.wait_for_timeout(int((10.69 - elapsed4) * 1000))
        print(f"Scene 4 completed in {time.time() - t_scene4_start:.2f}s", flush=True)

        # ========================================================
        # SCENE 5: Cloud Accounting & Inventory (Target ~10.78s)
        # ========================================================
        print("Scene 5: Accounting & Multi-Warehouse...", flush=True)
        t_scene5_start = time.time()
        page.goto("https://www.beraxis.online/accounting", wait_until="domcontentloaded")
        page.wait_for_timeout(1200)
        smooth_glide(page, 650, 480, 480, 260, steps=20)
        page.wait_for_timeout(800)
        smooth_glide(page, 480, 260, 1100, 350, steps=25)
        page.wait_for_timeout(1000)
        
        page.goto("https://www.beraxis.online/inventory", wait_until="domcontentloaded")
        page.wait_for_timeout(1200)
        smooth_glide(page, 1100, 350, 550, 320, steps=20)
        page.wait_for_timeout(1000)
        smooth_glide(page, 550, 320, 1300, 400, steps=25)
        page.wait_for_timeout(1000)
        
        elapsed5 = time.time() - t_scene5_start
        if elapsed5 < 10.78:
            page.wait_for_timeout(int((10.78 - elapsed5) * 1000))
        print(f"Scene 5 completed in {time.time() - t_scene5_start:.2f}s", flush=True)

        # ========================================================
        # SCENE 6: Early-Bird Pricing & Irresistible CTA (Target ~21.56s)
        # ========================================================
        print("Scene 6: Early-Bird Pricing & Irresistible CTA...", flush=True)
        t_scene6_start = time.time()
        page.goto("https://www.beraxis.online/billing?promo=EARLYBIRD1", wait_until="domcontentloaded")
        page.wait_for_timeout(1500)
        
        # Hover over Standard Plan $1/mo Annual
        smooth_glide(page, 1300, 400, 650, 450, steps=25)
        page.wait_for_timeout(1500)
        smooth_glide(page, 650, 450, 1050, 450, steps=25)
        page.wait_for_timeout(1500)
        
        # Smooth scroll
        page.evaluate("window.scrollBy({ top: 300, behavior: 'smooth' })")
        page.wait_for_timeout(1500)
        smooth_glide(page, 1050, 450, 800, 520, steps=25)
        page.wait_for_timeout(1500)
        
        # Return to brand hero homepage for confident CTA
        page.goto("https://www.beraxis.online", wait_until="domcontentloaded")
        page.wait_for_timeout(1500)
        smooth_glide(page, 800, 520, 960, 450, steps=25)
        page.wait_for_timeout(2000)
        smooth_glide(page, 960, 450, 1120, 380, steps=25)
        page.wait_for_timeout(2500)
        
        elapsed6 = time.time() - t_scene6_start
        if elapsed6 < 21.56:
            page.wait_for_timeout(int((21.56 - elapsed6) * 1000))
        print(f"Scene 6 completed in {time.time() - t_scene6_start:.2f}s", flush=True)

        # Close page & context to ensure video file is completely written to disk
        page.close()
        context.close()
        browser.close()
        print("Playwright Live Recording completed and saved!", flush=True)

if __name__ == "__main__":
    run_recording()
