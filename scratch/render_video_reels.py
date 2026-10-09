import os
import shutil
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import imageio

OUTPUT_DIR_WEB = "D:/ERP_CRM/public/social_media_assets"
OUTPUT_DIR_ARTIFACT = "C:/Users/abuba/.gemini/antigravity/brain/febec71c-e080-4e9d-8c20-15a11a352971/social_posts"
os.makedirs(OUTPUT_DIR_WEB, exist_ok=True)
os.makedirs(OUTPUT_DIR_ARTIFACT, exist_ok=True)

def get_font(size, bold=False):
    font_paths = [
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/calibrib.ttf" if bold else "C:/Windows/Fonts/calibri.ttf"
    ]
    for p in font_paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()

def draw_rounded_box(base, rect, fill, outline=None, width=1, radius=24):
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    d.rounded_rectangle(rect, radius=radius, fill=fill, outline=outline, width=width)
    return Image.alpha_composite(base, overlay)

# =========================================================================
# VIDEO REEL 1: 3-SECOND AI OCR SCANNER (1080x1920 Vertical MP4)
# =========================================================================
def render_reel_1():
    print("Rendering Reel 1: 3-Second AI Invoice Scanner...")
    W, H = 1080, 1920
    fps = 24
    total_frames = fps * 8 # 8-second looping high-impact reel
    frames = []

    # Base background
    bg_base = Image.new("RGBA", (W, H), (15, 20, 32))
    d_bg = ImageDraw.Draw(bg_base)
    for y in range(H):
        f = y / H
        r = int(10 * (1 - f) + 20 * f)
        g = int(15 * (1 - f) + 28 * f)
        b = int(28 * (1 - f) + 48 * f)
        d_bg.line([(0, y), (W, y)], fill=(r, g, b, 255))
        
    # Ambient glows
    g = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(g)
    for r in range(600, 0, -20):
        alpha = int(45 * (1 - (r / 600)))
        gd.ellipse([800 - r, 300 - r, 800 + r, 300 + r], fill=(0, 220, 190, alpha))
        gd.ellipse([200 - r, 1600 - r, 200 + r, 1600 + r], fill=(56, 189, 248, alpha))
    bg_base = Image.alpha_composite(bg_base, g)

    # Load UI screenshots
    ss_path = "D:/ERP_CRM/public/deck_assets/crm_accounting_view.jpg"
    ss_img = Image.open(ss_path).convert("RGBA").resize((920, 520), Image.Resampling.LANCZOS)
    
    ss_mask = Image.new("L", (920, 520), 0)
    ImageDraw.Draw(ss_mask).rounded_rectangle([0, 0, 920, 520], radius=20, fill=255)

    logo = None
    if os.path.exists("D:/ERP_CRM/public/logo2.png"):
        logo = Image.open("D:/ERP_CRM/public/logo2.png").convert("RGBA")
        logo.thumbnail((300, 75), Image.Resampling.LANCZOS)

    for i in range(total_frames):
        t = i / fps
        frame = bg_base.copy()
        
        # Draw Logo
        if logo:
            frame.paste(logo, (80, 80), logo)
            
        # Top Badge
        frame = draw_rounded_box(frame, [720, 80, 1000, 140], fill=(0, 220, 190, 40), outline=(0, 220, 190, 220), radius=14, width=2)
        d = ImageDraw.Draw(frame)
        d.text((750, 95), "⚡ 3-SEC AI OCR", font=get_font(22, bold=True), fill=(0, 240, 215))

        # Main Punchlines
        d.text((80, 200), "SCAN ANY INVOICE.", font=get_font(68, bold=True), fill=(255, 255, 255))
        d.text((80, 280), "AUTO-BOOKED IN 3.1s.", font=get_font(68, bold=True), fill=(0, 220, 190))
        d.text((80, 375), "AI extracts vendor, items, tax & posts directly to ledger.", font=get_font(26, bold=False), fill=(203, 213, 225))

        # UI Screenshot Box
        ui_y = 460
        frame.paste(ss_img, (80, ui_y), ss_mask)
        
        # Border
        b = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(b).rounded_rectangle([80, ui_y, 1000, ui_y + 520], radius=20, outline=(0, 220, 190, 200), width=3)
        frame = Image.alpha_composite(frame, b)

        # ANIMATED SCANNING LASER BEAM
        scan_progress = (t % 2.5) / 2.5
        laser_y = int(ui_y + scan_progress * 520)
        laser = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ld = ImageDraw.Draw(laser)
        ld.line([(85, laser_y), (995, laser_y)], fill=(0, 240, 220, 255), width=5)
        # Laser Glow
        for gw in range(1, 15):
            ld.line([(85, laser_y), (995, laser_y)], fill=(0, 240, 220, int(40 / gw)), width=5 + gw * 3)
        frame = Image.alpha_composite(frame, laser)

        # Scanning status HUD pill
        scan_text = "⚡ AI PROCESSING: EXTRACTING TAX & TOTALS..." if scan_progress < 0.7 else "✓ RECONCILED TO LEDGER (0.00 ERROR)"
        scan_pill_color = (0, 220, 190, 240) if scan_progress >= 0.7 else (234, 179, 8, 240)
        frame = draw_rounded_box(frame, [120, ui_y + 440, 960, ui_y + 495], fill=(15, 23, 42, 230), outline=scan_pill_color, radius=12, width=2)
        d = ImageDraw.Draw(frame)
        d.text((150, ui_y + 455), scan_text, font=get_font(20, bold=True), fill=(255, 255, 255))

        # 3 Key Features Floating Badges
        pills = ["📊 Profit & Loss Synced", "🤝 CRM Lead Updated", "📦 Stock Deducted"]
        px = 80
        for p in pills:
            frame = draw_rounded_box(frame, [px, 1020, px + 280, 1080], fill=(24, 32, 55, 230), outline=(56, 189, 248, 180), radius=14)
            d = ImageDraw.Draw(frame)
            d.text((px + 20, 1035), p, font=get_font(19, bold=True), fill=(224, 242, 254))
            px += 310

        # Launch Pricing Big Card
        frame = draw_rounded_box(frame, [80, 1130, 1000, 1540], fill=(20, 16, 40, 245), outline=(234, 179, 8, 240), radius=24, width=3)
        d = ImageDraw.Draw(frame)
        d.text((120, 1160), "🎉 SPECIAL PUBLIC LAUNCH PRICING", font=get_font(30, bold=True), fill=(253, 224, 71))
        
        # Tier 1
        d.text((120, 1220), "• Starter Tier:", font=get_font(26, bold=True), fill=(52, 211, 153))
        d.text((450, 1220), "100% FREE FOREVER (1 App)", font=get_font(26, bold=True), fill=(255, 255, 255))
        d.text((120, 1255), "  No credit card required. Pick any 1 full app.", font=get_font(20, bold=False), fill=(148, 163, 184))

        # Tier 2
        d.text((120, 1310), "• Standard Suite:", font=get_font(26, bold=True), fill=(234, 179, 8))
        d.text((450, 1310), "$9.99 for 1 Month", font=get_font(26, bold=True), fill=(253, 224, 71))
        
        # Promo code badge
        frame = draw_rounded_box(frame, [120, 1350, 520, 1400], fill=(234, 179, 8, 40), outline=(234, 179, 8, 220), radius=10)
        d = ImageDraw.Draw(frame)
        d.text((140, 1362), "CODE:  LAUNCH9", font=get_font(20, bold=True), fill=(253, 224, 71))

        # Tier 3
        d.text((120, 1435), "• Early Bird Pro:", font=get_font(26, bold=True), fill=(192, 132, 252))
        d.text((450, 1435), "$15.99 / Month Lifetime Lock", font=get_font(26, bold=True), fill=(255, 255, 255))
        
        frame = draw_rounded_box(frame, [120, 1475, 540, 1520], fill=(192, 132, 252, 40), outline=(192, 132, 252, 220), radius=10)
        d = ImageDraw.Draw(frame)
        d.text((140, 1487), "CODE:  EARLYBIRD15", font=get_font(19, bold=True), fill=(224, 231, 255))

        # Pulsating CTA Button at Bottom
        pulse_val = abs(math.sin(t * 3))
        btn_glow = int(180 + 75 * pulse_val)
        frame = draw_rounded_box(frame, [80, 1600, 1000, 1720], fill=(0, btn_glow, int(btn_glow * 0.85), 255), radius=20)
        d = ImageDraw.Draw(frame)
        d.text((220, 1640), "Get Started Free at www.beraxis.online ➔", font=get_font(30, bold=True), fill=(11, 15, 25))

        # Bottom Swipe Up Hint
        d.text((380, 1770), "Tap Link in Bio to Claim Deal", font=get_font(22, bold=False), fill=(148, 163, 184))

        frames.append(np.array(frame.convert("RGB")))

    # Save as MP4
    mp4_path_web = os.path.join(OUTPUT_DIR_WEB, "reel_1_3sec_ocr_demo.mp4")
    mp4_path_art = os.path.join(OUTPUT_DIR_ARTIFACT, "reel_1_3sec_ocr_demo.mp4")
    
    imageio.mimwrite(mp4_path_web, frames, fps=fps, quality=9, macro_block_size=1)
    shutil.copyfile(mp4_path_web, mp4_path_art)
    print(f"Generated {mp4_path_web}")

# =========================================================================
# VIDEO REEL 2: "DITCH 5 APPS FOR $9.99" (1080x1920 Vertical MP4)
# =========================================================================
def render_reel_2():
    print("Rendering Reel 2: Ditch 5 Apps for $9.99...")
    W, H = 1080, 1920
    fps = 24
    total_frames = fps * 8
    frames = []

    bg_base = Image.new("RGBA", (W, H), (28, 16, 44))
    d_bg = ImageDraw.Draw(bg_base)
    for y in range(H):
        f = y / H
        r = int(28 * (1 - f) + 15 * f)
        g = int(16 * (1 - f) + 20 * f)
        b = int(44 * (1 - f) + 38 * f)
        d_bg.line([(0, y), (W, y)], fill=(r, g, b, 255))
        
    g = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(g)
    for r in range(600, 0, -20):
        alpha = int(45 * (1 - (r / 600)))
        gd.ellipse([800 - r, 300 - r, 800 + r, 300 + r], fill=(244, 63, 94, alpha))
        gd.ellipse([200 - r, 1600 - r, 200 + r, 1600 + r], fill=(192, 132, 252, alpha))
    bg_base = Image.alpha_composite(bg_base, g)

    logo = None
    if os.path.exists("D:/ERP_CRM/public/logo2.png"):
        logo = Image.open("D:/ERP_CRM/public/logo2.png").convert("RGBA")
        logo.thumbnail((300, 75), Image.Resampling.LANCZOS)

    apps = [
        ("QuickBooks", "$60 / mo"),
        ("HubSpot CRM", "$120 / mo"),
        ("Inventory Tracker", "$100 / mo"),
        ("Third-Party OCR", "$40 / mo"),
        ("Zapier Connectors", "$50 / mo")
    ]

    for i in range(total_frames):
        t = i / fps
        frame = bg_base.copy()
        
        if logo:
            frame.paste(logo, (80, 80), logo)
            
        frame = draw_rounded_box(frame, [720, 80, 1000, 140], fill=(244, 63, 94, 40), outline=(244, 63, 94, 220), radius=14, width=2)
        d = ImageDraw.Draw(frame)
        d.text((750, 95), "✂️ STOP SAAS BLOAT", font=get_font(20, bold=True), fill=(255, 100, 120))

        # Main Headline
        d.text((80, 200), "DITCH 5 SUBSCRIPTIONS.", font=get_font(64, bold=True), fill=(255, 255, 255))
        d.text((80, 275), "GET ALL-IN-ONE FOR $9.99", font=get_font(64, bold=True), fill=(253, 224, 71))
        d.text((80, 365), "Replace your fragmented tools with one intelligent cloud platform.", font=get_font(25, bold=False), fill=(203, 213, 225))

        # Crossed-out apps animation
        sy = 440
        for idx, (app_name, price) in enumerate(apps):
            # Reveal one by one or all crossed out
            frame = draw_rounded_box(frame, [80, sy, 1000, sy + 75], fill=(20, 10, 20, 230), outline=(244, 63, 94, 160), radius=14)
            d = ImageDraw.Draw(frame)
            d.text((120, sy + 20), f"❌  {app_name}", font=get_font(24, bold=True), fill=(255, 255, 255))
            d.text((780, sy + 20), price, font=get_font(24, bold=True), fill=(244, 63, 94))
            
            # Dynamic Red Strikethrough
            d.line([(100, sy + 38), (960, sy + 38)], fill=(244, 63, 94, 230), width=4)
            sy += 95

        # Massive Unified Card
        frame = draw_rounded_box(frame, [80, 950, 1000, 1540], fill=(16, 24, 48, 250), outline=(0, 220, 190, 240), radius=24, width=3)
        d = ImageDraw.Draw(frame)
        d.text((120, 985), "✨ THE BERAXIS AI SOLUTION", font=get_font(30, bold=True), fill=(0, 220, 190))
        d.text((120, 1035), "Accounting • CRM • Invoicing • Inventory • AI Agent", font=get_font(22, bold=False), fill=(148, 163, 184))

        # 3 Plan Badges Inside Card
        # Tier 1
        d.text((120, 1100), "🎁 1 MODULE PACKAGE:", font=get_font(24, bold=True), fill=(52, 211, 153))
        d.text((540, 1100), "100% FREE FOREVER (1 App)", font=get_font(24, bold=True), fill=(255, 255, 255))
        d.text((120, 1135), "    No Credit Card Required", font=get_font(18, bold=False), fill=(148, 163, 184))

        # Tier 2
        d.text((120, 1200), "🔥 STANDARD SUITE:", font=get_font(24, bold=True), fill=(234, 179, 8))
        d.text((540, 1200), "$9.99 for 1 Month", font=get_font(24, bold=True), fill=(253, 224, 71))
        
        frame = draw_rounded_box(frame, [120, 1240, 520, 1290], fill=(234, 179, 8, 40), outline=(234, 179, 8, 220), radius=10)
        d = ImageDraw.Draw(frame)
        d.text((140, 1252), "CODE:  LAUNCH9", font=get_font(20, bold=True), fill=(253, 224, 71))

        # Tier 3
        d.text((120, 1335), "⭐ EARLY BIRD PRO:", font=get_font(24, bold=True), fill=(192, 132, 252))
        d.text((540, 1335), "$15.99 / Month Lifetime", font=get_font(24, bold=True), fill=(255, 255, 255))
        
        frame = draw_rounded_box(frame, [120, 1375, 540, 1425], fill=(192, 132, 252, 40), outline=(192, 132, 252, 220), radius=10)
        d = ImageDraw.Draw(frame)
        d.text((140, 1387), "CODE:  EARLYBIRD15", font=get_font(19, bold=True), fill=(224, 231, 255))

        d.text((120, 1475), "✓ Save $3,500+ every year on software", font=get_font(22, bold=True), fill=(52, 211, 153))

        # Bottom Button
        pulse_val = abs(math.sin(t * 3))
        btn_glow = int(180 + 75 * pulse_val)
        frame = draw_rounded_box(frame, [80, 1600, 1000, 1720], fill=(0, btn_glow, int(btn_glow * 0.85), 255), radius=20)
        d = ImageDraw.Draw(frame)
        d.text((220, 1640), "Claim Launch Deal at www.beraxis.online ➔", font=get_font(28, bold=True), fill=(11, 15, 25))

        d.text((380, 1770), "Tap Link in Bio to Start Free", font=get_font(22, bold=False), fill=(148, 163, 184))

        frames.append(np.array(frame.convert("RGB")))

    mp4_path_web = os.path.join(OUTPUT_DIR_WEB, "reel_2_kill_saas_bloat.mp4")
    mp4_path_art = os.path.join(OUTPUT_DIR_ARTIFACT, "reel_2_kill_saas_bloat.mp4")
    
    imageio.mimwrite(mp4_path_web, frames, fps=fps, quality=9, macro_block_size=1)
    shutil.copyfile(mp4_path_web, mp4_path_art)
    print(f"Generated {mp4_path_web}")

# =========================================================================
# VIDEO REEL 3: ODOO STYLE "1 APP FREE FOREVER" (1080x1920 Vertical MP4)
# =========================================================================
def render_reel_3():
    print("Rendering Reel 3: 1 App Free Forever Launch...")
    W, H = 1080, 1920
    fps = 24
    total_frames = fps * 8
    frames = []

    bg_base = Image.new("RGBA", (W, H), (24, 14, 40))
    d_bg = ImageDraw.Draw(bg_base)
    for y in range(H):
        f = y / H
        r = int(24 * (1 - f) + 12 * f)
        g = int(14 * (1 - f) + 24 * f)
        b = int(40 * (1 - f) + 38 * f)
        d_bg.line([(0, y), (W, y)], fill=(r, g, b, 255))
        
    g = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(g)
    for r in range(600, 0, -20):
        alpha = int(45 * (1 - (r / 600)))
        gd.ellipse([800 - r, 300 - r, 800 + r, 300 + r], fill=(0, 160, 157, alpha))
        gd.ellipse([200 - r, 1600 - r, 200 + r, 1600 + r], fill=(125, 60, 152, alpha))
    bg_base = Image.alpha_composite(bg_base, g)

    logo = None
    if os.path.exists("D:/ERP_CRM/public/logo2.png"):
        logo = Image.open("D:/ERP_CRM/public/logo2.png").convert("RGBA")
        logo.thumbnail((300, 75), Image.Resampling.LANCZOS)

    for i in range(total_frames):
        t = i / fps
        frame = bg_base.copy()
        
        if logo:
            frame.paste(logo, (80, 80), logo)
            
        frame = draw_rounded_box(frame, [720, 80, 1000, 140], fill=(0, 160, 157, 40), outline=(0, 200, 180, 220), radius=14, width=2)
        d = ImageDraw.Draw(frame)
        d.text((750, 95), "✨ OFFICIAL LAUNCH", font=get_font(20, bold=True), fill=(0, 240, 215))

        # Giant Hero Typography
        d.text((80, 200), "1 APP.", font=get_font(88, bold=True), fill=(255, 255, 255))
        d.text((80, 295), "FREE FOREVER.", font=get_font(88, bold=True), fill=(0, 220, 190))
        d.text((80, 410), "No credit card. No 14-day trial tricks.", font=get_font(28, bold=False), fill=(220, 210, 235))

        # 4 Big Floating App Cards (2x2 Grid)
        # Animate soft floating bobbing
        bob = math.sin(t * 2.5) * 8
        
        tile_w = 420
        tile_h = 160
        
        # Tile 1: Accounting
        frame = draw_rounded_box(frame, [80, int(490 + bob), 500, int(490 + bob + tile_h)], fill=(0, 160, 157, 240), outline=(255, 255, 255, 60), radius=20)
        d = ImageDraw.Draw(frame)
        d.text((110, int(515 + bob)), "📊 Accounting & Tax", font=get_font(26, bold=True), fill=(255, 255, 255))
        d.text((110, int(560 + bob)), "• P&L, Ledger, Balance Sheet", font=get_font(19, bold=False), fill=(220, 245, 245))
        d.text((110, int(595 + bob)), "✓ 100% Free Forever Tier", font=get_font(18, bold=True), fill=(253, 224, 71))

        # Tile 2: CRM
        frame = draw_rounded_box(frame, [540, int(490 - bob), 960, int(490 - bob + tile_h)], fill=(240, 96, 80, 240), outline=(255, 255, 255, 60), radius=20)
        d = ImageDraw.Draw(frame)
        d.text((570, int(515 - bob)), "🤝 CRM & Pipeline", font=get_font(26, bold=True), fill=(255, 255, 255))
        d.text((570, int(560 - bob)), "• Kanban, Deals, Auto-Followup", font=get_font(19, bold=False), fill=(255, 235, 235))
        d.text((570, int(595 - bob)), "✓ 100% Free Forever Tier", font=get_font(18, bold=True), fill=(253, 224, 71))

        # Tile 3: Invoicing
        frame = draw_rounded_box(frame, [80, int(690 - bob), 500, int(690 - bob + tile_h)], fill=(142, 68, 173, 240), outline=(255, 255, 255, 60), radius=20)
        d = ImageDraw.Draw(frame)
        d.text((110, int(715 - bob)), "⚡ 3-Sec AI Invoicing", font=get_font(26, bold=True), fill=(255, 255, 255))
        d.text((110, int(760 - bob)), "• Instant OCR & PDF Parsing", font=get_font(19, bold=False), fill=(245, 225, 255))
        d.text((110, int(795 - bob)), "✓ 100% Free Forever Tier", font=get_font(18, bold=True), fill=(253, 224, 71))

        # Tile 4: Inventory
        frame = draw_rounded_box(frame, [540, int(690 + bob), 960, int(690 + bob + tile_h)], fill=(39, 174, 96, 240), outline=(255, 255, 255, 60), radius=20)
        d = ImageDraw.Draw(frame)
        d.text((570, int(715 + bob)), "📦 Stock & Inventory", font=get_font(26, bold=True), fill=(255, 255, 255))
        d.text((570, int(760 + bob)), "• Multi-Warehouse & Reorder", font=get_font(19, bold=False), fill=(225, 255, 235))
        d.text((570, int(795 + bob)), "✓ 100% Free Forever Tier", font=get_font(18, bold=True), fill=(253, 224, 71))

        # Bottom Launch Upgrade Box
        frame = draw_rounded_box(frame, [80, 910, 1000, 1530], fill=(18, 12, 32, 245), outline=(234, 179, 8, 240), radius=24, width=3)
        d = ImageDraw.Draw(frame)
        d.text((120, 945), "⚡ NEED ALL APPS UNLOCKED?", font=get_font(28, bold=True), fill=(253, 224, 71))
        
        # Upgrade Option 1
        d.text((120, 1010), "• Standard Launch Package:", font=get_font(24, bold=True), fill=(234, 179, 8))
        d.text((540, 1010), "$9.99 for 1 Month", font=get_font(24, bold=True), fill=(253, 224, 71))
        
        frame = draw_rounded_box(frame, [120, 1050, 520, 1100], fill=(234, 179, 8, 40), outline=(234, 179, 8, 220), radius=10)
        d = ImageDraw.Draw(frame)
        d.text((140, 1062), "CODE:  LAUNCH9", font=get_font(20, bold=True), fill=(253, 224, 71))

        # Upgrade Option 2
        d.text((120, 1145), "• Early Bird Custom / Pro:", font=get_font(24, bold=True), fill=(192, 132, 252))
        d.text((540, 1145), "$15.99 / Month Lifetime Lock", font=get_font(24, bold=True), fill=(255, 255, 255))
        
        frame = draw_rounded_box(frame, [120, 1185, 540, 1235], fill=(192, 132, 252, 40), outline=(192, 132, 252, 220), radius=10)
        d = ImageDraw.Draw(frame)
        d.text((140, 1197), "CODE:  EARLYBIRD15", font=get_font(19, bold=True), fill=(224, 231, 255))

        d.text((120, 1285), "✓ Choose any 1 app free, or unlock everything.", font=get_font(22, bold=False), fill=(203, 213, 225))
        d.text((120, 1325), "✓ Autonomous AI Copilot & WhatsApp Support included.", font=get_font(22, bold=False), fill=(52, 211, 153))

        # Bottom Button
        pulse_val = abs(math.sin(t * 3))
        btn_glow = int(180 + 75 * pulse_val)
        frame = draw_rounded_box(frame, [80, 1600, 1000, 1720], fill=(0, btn_glow, int(btn_glow * 0.85), 255), radius=20)
        d = ImageDraw.Draw(frame)
        d.text((220, 1640), "Start Free Today at www.beraxis.online ➔", font=get_font(28, bold=True), fill=(11, 15, 25))

        d.text((380, 1770), "Tap Link in Bio to Claim 1 App Free", font=get_font(22, bold=False), fill=(148, 163, 184))

        frames.append(np.array(frame.convert("RGB")))

    mp4_path_web = os.path.join(OUTPUT_DIR_WEB, "reel_3_one_app_free_launch.mp4")
    mp4_path_art = os.path.join(OUTPUT_DIR_ARTIFACT, "reel_3_one_app_free_launch.mp4")
    
    imageio.mimwrite(mp4_path_web, frames, fps=fps, quality=9, macro_block_size=1)
    shutil.copyfile(mp4_path_web, mp4_path_art)
    print(f"Generated {mp4_path_web}")

if __name__ == "__main__":
    render_reel_1()
    render_reel_2()
    render_reel_3()
    print("All 3 MP4 video reels generated successfully!")
