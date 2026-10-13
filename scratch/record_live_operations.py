import os
import time
import math
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
        cursor.style.width = '32px';
        cursor.style.height = '32px';
        cursor.style.borderRadius = '50%';
        cursor.style.border = '3px solid #00f0d7';
        cursor.style.backgroundColor = 'rgba(0, 240, 215, 0.45)';
        cursor.style.pointerEvents = 'none';
        cursor.style.zIndex = '99999999';
        cursor.style.transform = 'translate(-50%, -50%)';
        cursor.style.boxShadow = '0 0 22px rgba(0, 240, 215, 0.95)';
        cursor.style.transition = 'transform 0.08s ease';
        document.body.appendChild(cursor);
        
        window.addEventListener('mousemove', e => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
        window.addEventListener('mousedown', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(0.65)';
            cursor.style.backgroundColor = 'rgba(253, 224, 71, 0.9)';
            cursor.style.borderColor = '#fde047';
        });
        window.addEventListener('mouseup', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            cursor.style.backgroundColor = 'rgba(0, 240, 215, 0.45)';
            cursor.style.borderColor = '#00f0d7';
        });
    }
});
"""

def smooth_mouse_glide(page, start_x, start_y, end_x, end_y, steps=25, delay=0.015):
    """Interpolates mouse movement smoothly so the viewer clearly tracks the cursor."""
    for i in range(steps + 1):
        t = i / steps
        # Smooth easeInOut curve
        ease = 0.5 - 0.5 * math.cos(math.pi * t)
        curr_x = start_x + (end_x - start_x) * ease
        curr_y = start_y + (end_y - start_y) * ease
        page.mouse.move(curr_x, curr_y)
        time.sleep(delay)

def execute_live_demo():
    print("Starting Playwright Live Browser Operations Recording...")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            record_video_dir=RECORD_DIR,
            record_video_size={'width': 1920, 'height': 1080}
        )
        context.add_init_script(cursor_script)
        page = context.new_page()

        # ==========================================
        # SCENE 1: Home & Hero (0.0s - 7.5s)
        # ==========================================
        print("Scene 1: Loading Homepage...")
        page.goto("https://www.beraxis.online", wait_until="domcontentloaded")
        page.wait_for_timeout(1000)
        smooth_mouse_glide(page, 400, 300, 960, 480, steps=25)
        page.wait_for_timeout(800)
        # Smooth scroll
        page.evaluate("window.scrollBy({ top: 400, behavior: 'smooth' })")
        page.wait_for_timeout(1200)
        smooth_mouse_glide(page, 960, 480, 1100, 380, steps=20)
        page.wait_for_timeout(1000)
        page.evaluate("window.scrollBy({ top: -400, behavior: 'smooth' })")
        page.wait_for_timeout(1200)

        # ==========================================
        # SCENE 2: Dashboard & 30-Sec Setup (7.5s - 15.0s)
        # ==========================================
        print("Scene 2: Loading Dashboard...")
        page.goto("https://www.beraxis.online/dashboard", wait_until="domcontentloaded")
        page.wait_for_timeout(1200)
        smooth_mouse_glide(page, 300, 200, 600, 320, steps=25)
        page.wait_for_timeout(800)
        smooth_mouse_glide(page, 600, 320, 1200, 320, steps=30)
        page.wait_for_timeout(800)
        page.evaluate("window.scrollBy({ top: 350, behavior: 'smooth' })")
        page.wait_for_timeout(1200)
        smooth_mouse_glide(page, 1200, 320, 800, 500, steps=25)
        page.wait_for_timeout(1200)

        # ==========================================
        # SCENE 3: Inbound AI Lead Pool (15.0s - 23.5s)
        # ==========================================
        print("Scene 3: Loading AI Lead Pool...")
        page.goto("https://www.beraxis.online/crm/leads-pool", wait_until="domcontentloaded")
        page.wait_for_timeout(1500)
        smooth_mouse_glide(page, 800, 500, 450, 280, steps=25)
        page.wait_for_timeout(800)
        # Hover over lead rows
        smooth_mouse_glide(page, 450, 280, 950, 380, steps=25)
        page.wait_for_timeout(1000)
        smooth_mouse_glide(page, 950, 380, 1350, 420, steps=25)
        page.wait_for_timeout(800)
        page.evaluate("window.scrollBy({ top: 300, behavior: 'smooth' })")
        page.wait_for_timeout(1200)
        smooth_mouse_glide(page, 1350, 420, 600, 520, steps=25)
        page.wait_for_timeout(1000)

        # ==========================================
        # SCENE 4: Visual CRM Pipeline (23.5s - 32.5s)
        # ==========================================
        print("Scene 4: Loading Visual CRM Pipeline...")
        page.goto("https://www.beraxis.online/crm", wait_until="domcontentloaded")
        page.wait_for_timeout(1500)
        smooth_mouse_glide(page, 600, 520, 400, 340, steps=25)
        page.wait_for_timeout(800)
        # Hover across Kanban columns
        smooth_mouse_glide(page, 400, 340, 800, 380, steps=25)
        page.wait_for_timeout(800)
        smooth_mouse_glide(page, 800, 380, 1250, 420, steps=25)
        page.wait_for_timeout(1000)
        page.mouse.down()
        page.wait_for_timeout(300)
        page.mouse.up()
        page.wait_for_timeout(1200)
        smooth_mouse_glide(page, 1250, 420, 900, 550, steps=25)
        page.wait_for_timeout(1200)

        # ==========================================
        # SCENE 5: Cloud ERP Accounting & Inventory (32.5s - 41.5s)
        # ==========================================
        print("Scene 5: Loading Accounting & Inventory...")
        page.goto("https://www.beraxis.online/accounting", wait_until="domcontentloaded")
        page.wait_for_timeout(1500)
        smooth_mouse_glide(page, 900, 550, 500, 350, steps=25)
        page.wait_for_timeout(800)
        smooth_mouse_glide(page, 500, 350, 1100, 400, steps=25)
        page.wait_for_timeout(1000)
        # Transition to Inventory
        page.goto("https://www.beraxis.online/inventory", wait_until="domcontentloaded")
        page.wait_for_timeout(1500)
        smooth_mouse_glide(page, 1100, 400, 600, 380, steps=25)
        page.wait_for_timeout(800)
        smooth_mouse_glide(page, 600, 380, 1200, 450, steps=25)
        page.wait_for_timeout(1200)

        # ==========================================
        # SCENE 6: Early-Bird Checkout Offer (41.5s - 50.5s)
        # ==========================================
        print("Scene 6: Loading Billing & Early-Bird Pricing...")
        page.goto("https://www.beraxis.online/billing?promo=EARLYBIRD1", wait_until="domcontentloaded")
        page.wait_for_timeout(1500)
        # Glide to Standard Plan card
        smooth_mouse_glide(page, 1200, 450, 750, 420, steps=25)
        page.wait_for_timeout(1000)
        smooth_mouse_glide(page, 750, 420, 1150, 420, steps=25)
        page.wait_for_timeout(1000)
        # Click or hover over promo code input
        smooth_mouse_glide(page, 1150, 420, 960, 600, steps=25)
        page.wait_for_timeout(1200)
        page.mouse.down()
        page.wait_for_timeout(250)
        page.mouse.up()
        page.wait_for_timeout(1500)

        # ==========================================
        # SCENE 7: Final Brand Resolution (50.5s - 55.0s)
        # ==========================================
        print("Scene 7: Finishing recording...")
        page.goto("https://www.beraxis.online", wait_until="domcontentloaded")
        page.wait_for_timeout(2000)
        smooth_mouse_glide(page, 960, 600, 960, 450, steps=20)
        page.wait_for_timeout(2500)

        context.close()
        browser.close()

    print("Playwright recording complete!")
    v_files = [f for f in os.listdir(RECORD_DIR) if f.endswith('.webm')]
    if v_files:
        print(f"Recorded video file: {v_files[-1]}")
        return os.path.join(RECORD_DIR, v_files[-1])
    return None

if __name__ == "__main__":
    execute_live_demo()
