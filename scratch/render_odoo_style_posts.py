import os
import shutil
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUTPUT_DIR_WEB = "D:/ERP_CRM/public/social_media_assets"
OUTPUT_DIR_ARTIFACT = "C:/Users/abuba/.gemini/antigravity/brain/febec71c-e080-4e9d-8c20-15a11a352971/social_posts"
os.makedirs(OUTPUT_DIR_WEB, exist_ok=True)
os.makedirs(OUTPUT_DIR_ARTIFACT, exist_ok=True)

def get_font(size, bold=False):
    # Try high quality modern sans-serif fonts
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

def draw_solid_with_glow(width, height, bg_color=(25, 16, 44), glow_color=(113, 75, 103), glow_center=(0.8, 0.2)):
    im = Image.new("RGBA", (width, height), bg_color)
    glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    g_draw = ImageDraw.Draw(glow)
    
    cx = int(width * glow_center[0])
    cy = int(height * glow_center[1])
    max_r = int(width * 0.75)
    
    for r in range(max_r, 0, -15):
        alpha = int(70 * (1 - (r / max_r)))
        g_draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=glow_color + (alpha,))
        
    return Image.alpha_composite(im, glow)

def draw_rounded_box(base, rect, fill, outline=None, width=1, radius=24):
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    d.rounded_rectangle(rect, radius=radius, fill=fill, outline=outline, width=width)
    return Image.alpha_composite(base, overlay)

def draw_app_tile(base, x, y, size, icon_text, label, bg_color, text_color=(255, 255, 255)):
    # Drop shadow
    shadow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle([x, y + 8, x + size, y + size + 8], radius=24, fill=(0, 0, 0, 120))
    shadow = shadow.filter(ImageFilter.GaussianBlur(10))
    base = Image.alpha_composite(base, shadow)
    
    # Tile background
    base = draw_rounded_box(base, [x, y, x + size, y + size], fill=bg_color, outline=(255, 255, 255, 40), width=2, radius=24)
    d = ImageDraw.Draw(base)
    
    # Icon emoji / symbol
    f_icon = get_font(int(size * 0.38), bold=True)
    d.text((x + size * 0.22, y + size * 0.16), icon_text, font=f_icon, fill=(255, 255, 255))
    
    # Label
    f_lbl = get_font(int(size * 0.12), bold=True)
    d.text((x + size * 0.15, y + size * 0.68), label, font=f_lbl, fill=text_color)
    return base

def save_dual(img, base_name):
    png_w = os.path.join(OUTPUT_DIR_WEB, f"{base_name}.png")
    jpg_w = os.path.join(OUTPUT_DIR_WEB, f"{base_name}.jpg")
    png_a = os.path.join(OUTPUT_DIR_ARTIFACT, f"{base_name}.png")
    jpg_a = os.path.join(OUTPUT_DIR_ARTIFACT, f"{base_name}.jpg")
    
    img.save(png_w, "PNG")
    img.convert("RGB").save(jpg_w, "JPEG", quality=96)
    
    shutil.copyfile(png_w, png_a)
    shutil.copyfile(jpg_w, jpg_a)
    print(f"Saved: {base_name}.png and .jpg")

# =========================================================================
# POST 1: ODOO-STYLE "1 APP. FREE FOREVER." (Signature Purple / Teal)
# =========================================================================
def create_odoo_post_1():
    W, H = 1080, 1080
    # Odoo Signature Deep Plum / Royal Violet
    img = draw_solid_with_glow(W, H, bg_color=(28, 16, 48), glow_color=(125, 60, 152), glow_center=(0.85, 0.15))
    
    # Second Teal Glow
    g2 = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd2 = ImageDraw.Draw(g2)
    for r in range(500, 0, -15):
        alpha = int(45 * (1 - (r / 500)))
        gd2.ellipse([50 - r, 950 - r, 50 + r, 950 + r], fill=(0, 160, 157, alpha))
    img = Image.alpha_composite(img, g2)
    
    # Top Brand Bar
    d = ImageDraw.Draw(img)
    if os.path.exists("D:/ERP_CRM/public/logo2.png"):
        logo = Image.open("D:/ERP_CRM/public/logo2.png").convert("RGBA")
        logo.thumbnail((260, 65), Image.Resampling.LANCZOS)
        img.paste(logo, (70, 60), logo)
        
    # Top Badge: PUBLIC LAUNCH
    img = draw_rounded_box(img, [740, 60, 1010, 115], fill=(0, 160, 157, 40), outline=(0, 200, 180, 220), radius=14, width=2)
    d = ImageDraw.Draw(img)
    d.text((765, 75), "✨ OFFICIAL LAUNCH", font=get_font(20, bold=True), fill=(0, 240, 215))

    # Giant Punchy Typography (Odoo Style)
    d.text((70, 165), "1 APP.", font=get_font(84, bold=True), fill=(255, 255, 255))
    d.text((70, 255), "FREE FOREVER.", font=get_font(84, bold=True), fill=(0, 220, 190))
    d.text((70, 360), "No credit card required. No 14-day trial tricks.", font=get_font(26, bold=False), fill=(220, 210, 235))

    # 4 Vibrant Floating App Tiles (2x2 Grid)
    tile_size = 200
    gap = 35
    start_x = 70
    start_y = 430
    
    # Tile 1: Accounting (Teal)
    img = draw_app_tile(img, start_x, start_y, tile_size, "📊", "Accounting", (0, 160, 157, 240))
    # Tile 2: CRM (Coral/Orange)
    img = draw_app_tile(img, start_x + tile_size + gap, start_y, tile_size, "🤝", "CRM & Pipeline", (240, 96, 80, 240))
    # Tile 3: Invoicing (Purple)
    img = draw_app_tile(img, start_x + (tile_size + gap) * 2, start_y, tile_size, "⚡", "3-Sec Invoices", (142, 68, 173, 240))
    # Tile 4: Inventory (Emerald)
    img = draw_app_tile(img, start_x + (tile_size + gap) * 3, start_y, tile_size, "📦", "Inventory Ops", (39, 174, 96, 240))

    # Bottom Callout Card: Launch Promo Upgrade
    img = draw_rounded_box(img, [70, 710, 1010, 970], fill=(20, 12, 38, 240), outline=(234, 179, 8, 220), radius=22, width=2)
    d = ImageDraw.Draw(img)
    
    d.text((105, 735), "⚡ NEED ALL APPS UNLOCKED?", font=get_font(24, bold=True), fill=(253, 224, 71))
    
    # Left: Standard Launch Pill
    img = draw_rounded_box(img, [105, 785, 520, 875], fill=(234, 179, 8, 30), outline=(234, 179, 8, 200), radius=14)
    d = ImageDraw.Draw(img)
    d.text((125, 800), "Standard Package: $9.99 / 1st Mo", font=get_font(20, bold=True), fill=(255, 255, 255))
    d.text((125, 835), "Use Code:  LAUNCH9", font=get_font(20, bold=True), fill=(253, 224, 71))

    # Right: Early Bird Pill
    img = draw_rounded_box(img, [545, 785, 975, 875], fill=(192, 132, 252, 30), outline=(192, 132, 252, 200), radius=14)
    d = ImageDraw.Draw(img)
    d.text((565, 800), "Early Bird Pro: $15.99 / Mo Lifetime", font=get_font(20, bold=True), fill=(255, 255, 255))
    d.text((565, 835), "Use Code:  EARLYBIRD15", font=get_font(20, bold=True), fill=(224, 231, 255))

    d.text((105, 915), "👉 Start Free in 30 Seconds at  www.beraxis.online", font=get_font(24, bold=True), fill=(0, 220, 190))

    save_dual(img, "odoo_style_post_1_one_app_free")

# =========================================================================
# POST 2: "EXPECTATION VS REALITY" (Meme / Viral Engagement Style)
# =========================================================================
def create_odoo_post_2():
    W, H = 1080, 1080
    # Clean Dark Charcoal / Midnight Blue
    img = draw_solid_with_glow(W, H, bg_color=(15, 20, 32), glow_color=(56, 189, 248), glow_center=(0.8, 0.8))
    
    d = ImageDraw.Draw(img)
    if os.path.exists("D:/ERP_CRM/public/logo2.png"):
        logo = Image.open("D:/ERP_CRM/public/logo2.png").convert("RGBA")
        logo.thumbnail((260, 65), Image.Resampling.LANCZOS)
        img.paste(logo, (70, 50), logo)
        
    d.text((70, 135), "Running a Business in 2026:", font=get_font(44, bold=True), fill=(255, 255, 255))

    # Top Card: What you thought you'd do (Frustration)
    card_h = 240
    img = draw_rounded_box(img, [70, 210, 1010, 210 + card_h], fill=(36, 16, 24, 240), outline=(244, 63, 94, 200), radius=20, width=2)
    d = ImageDraw.Draw(img)
    d.text((105, 235), "❌ WHAT YOU EXPECTED", font=get_font(22, bold=True), fill=(244, 63, 94))
    d.text((105, 275), "Paying $450/month across 5 disconnected apps,", font=get_font(28, bold=True), fill=(255, 255, 255))
    d.text((105, 320), "spending entire weekends manually typing receipts & fixing sync errors.", font=get_font(22, bold=False), fill=(226, 232, 240))
    d.text((105, 385), "💸 QuickBooks ($60) + HubSpot ($120) + Inventory ($150) + Zapier ($50)", font=get_font(18, bold=False), fill=(252, 165, 165))

    # Bottom Card: The Beraxis Reality (Joy & AI Speed)
    img = draw_rounded_box(img, [70, 480, 1010, 480 + card_h + 50], fill=(16, 32, 48, 240), outline=(0, 220, 190, 220), radius=20, width=3)
    d = ImageDraw.Draw(img)
    d.text((105, 505), "✨ THE BERAXIS AI REALITY", font=get_font(22, bold=True), fill=(0, 220, 190))
    d.text((105, 545), "One unified workspace. 3-second OCR invoice scanning.", font=get_font(30, bold=True), fill=(255, 255, 255))
    d.text((105, 595), "Live CRM pipelines, real-time balance sheets, and autonomous AI copilot.", font=get_font(22, bold=False), fill=(203, 213, 225))
    d.text((105, 655), "🚀 1 App 100% Free Forever  •  All Apps for $9.99 (Code: LAUNCH9)", font=get_font(22, bold=True), fill=(253, 224, 71))

    # Launch Bottom Bar
    img = draw_rounded_box(img, [70, 810, 1010, 990], fill=(22, 28, 48, 250), outline=(192, 132, 252, 180), radius=20)
    d = ImageDraw.Draw(img)
    d.text((105, 835), "⭐ EARLY BIRD PASS: $15.99 / MONTH LIFETIME PRICE LOCK", font=get_font(22, bold=True), fill=(192, 132, 252))
    d.text((105, 875), "Use Promo Code: EARLYBIRD15 at checkout", font=get_font(20, bold=False), fill=(255, 255, 255))
    d.text((105, 930), "🌐 Claim Your Free Workspace: www.beraxis.online", font=get_font(24, bold=True), fill=(56, 189, 248))

    save_dual(img, "odoo_style_post_2_expectation_vs_reality")

# =========================================================================
# POST 3: "DITCH 10 SUBSCRIPTIONS" (Bold Typography & App Stacks)
# =========================================================================
def create_odoo_post_3():
    W, H = 1080, 1080
    # Vibrant Warm Terracotta / Odoo Burgundy Background
    img = draw_solid_with_glow(W, H, bg_color=(36, 14, 28), glow_color=(235, 87, 87), glow_center=(0.85, 0.2))
    
    d = ImageDraw.Draw(img)
    if os.path.exists("D:/ERP_CRM/public/logo2.png"):
        logo = Image.open("D:/ERP_CRM/public/logo2.png").convert("RGBA")
        logo.thumbnail((260, 65), Image.Resampling.LANCZOS)
        img.paste(logo, (70, 50), logo)

    # Giant Headline
    d.text((70, 140), "DITCH YOUR", font=get_font(72, bold=True), fill=(255, 255, 255))
    d.text((70, 220), "5 SUBSCRIPTIONS.", font=get_font(72, bold=True), fill=(244, 63, 94))
    d.text((70, 315), "Why pay for 5 different software licenses when you only need one?", font=get_font(24, bold=False), fill=(230, 210, 220))

    # Cross-out App Pills Grid
    apps = [
        ("QuickBooks", "$60/mo"),
        ("HubSpot CRM", "$120/mo"),
        ("Inventory App", "$100/mo"),
        ("OCR Scanner", "$40/mo"),
        ("Zapier", "$50/mo"),
        ("DocuSign", "$30/mo")
    ]
    px = 70
    py = 380
    for idx, (app_name, price) in enumerate(apps):
        col = idx % 2
        row = idx // 2
        bx = px + col * 450
        by = py + row * 90
        
        img = draw_rounded_box(img, [bx, by, bx + 420, by + 72], fill=(20, 8, 16, 230), outline=(244, 63, 94, 150), radius=14)
        d = ImageDraw.Draw(img)
        d.text((bx + 20, by + 20), f"❌ {app_name}", font=get_font(22, bold=True), fill=(255, 255, 255))
        d.text((bx + 280, by + 20), price, font=get_font(22, bold=True), fill=(244, 63, 94))
        # Strikethrough line
        d.line([(bx + 15, by + 36), (bx + 400, by + 36)], fill=(244, 63, 94, 220), width=3)

    # Big Golden Solution Banner
    img = draw_rounded_box(img, [70, 680, 1010, 990], fill=(24, 12, 32, 255), outline=(0, 220, 190, 240), radius=22, width=3)
    d = ImageDraw.Draw(img)
    d.text((105, 710), "⚡ ALL REPLACED BY BERAXIS AI", font=get_font(26, bold=True), fill=(0, 220, 190))
    d.text((105, 755), "Starter Tier: 1 App 100% Free Forever  (No Credit Card)", font=get_font(22, bold=True), fill=(255, 255, 255))
    d.text((105, 795), "Standard Launch: $9.99 for 1 Month  (Code: LAUNCH9)", font=get_font(22, bold=True), fill=(253, 224, 71))
    d.text((105, 835), "Early Bird Pro: $15.99 / Month Lifetime Lock  (Code: EARLYBIRD15)", font=get_font(22, bold=True), fill=(192, 132, 252))

    # CTA Button
    img = draw_rounded_box(img, [105, 895, 975, 960], fill=(0, 220, 190, 255), radius=14)
    d = ImageDraw.Draw(img)
    d.text((270, 912), "Start Free Today at www.beraxis.online ➔", font=get_font(24, bold=True), fill=(15, 20, 30))

    save_dual(img, "odoo_style_post_3_ditch_subscriptions")

# =========================================================================
# POST 4: "SCAN. RECONCILE. DONE." (Speed & AI Feature Punch)
# =========================================================================
def create_odoo_post_4():
    W, H = 1080, 1080
    # Clean Deep Cyan / Emerald Midnight Theme
    img = draw_solid_with_glow(W, H, bg_color=(12, 26, 38), glow_color=(0, 220, 190), glow_center=(0.8, 0.3))
    
    d = ImageDraw.Draw(img)
    if os.path.exists("D:/ERP_CRM/public/logo2.png"):
        logo = Image.open("D:/ERP_CRM/public/logo2.png").convert("RGBA")
        logo.thumbnail((260, 65), Image.Resampling.LANCZOS)
        img.paste(logo, (70, 50), logo)

    img = draw_rounded_box(img, [720, 50, 1010, 105], fill=(0, 220, 190, 40), outline=(0, 220, 190, 200), radius=12)
    d = ImageDraw.Draw(img)
    d.text((745, 65), "⚡ 3.1 SEC OCR", font=get_font(20, bold=True), fill=(0, 240, 215))

    # Huge Punchy Headline
    d.text((70, 145), "SCAN.", font=get_font(76, bold=True), fill=(255, 255, 255))
    d.text((340, 145), "RECONCILE.", font=get_font(76, bold=True), fill=(56, 189, 248))
    d.text((820, 145), "DONE.", font=get_font(76, bold=True), fill=(0, 220, 190))
    d.text((70, 240), "Turn receipts & PDF invoices into balanced ledger entries in 3.1 seconds flat.", font=get_font(24, bold=False), fill=(203, 213, 225))

    # Center Visual: High Quality Screen Snapshot
    ss_path = "D:/ERP_CRM/public/deck_assets/crm_accounting_view.jpg"
    if os.path.exists(ss_path):
        src = Image.open(ss_path).convert("RGBA")
        src = src.resize((940, 420), Image.Resampling.LANCZOS)
        
        mask = Image.new("L", (940, 420), 0)
        md = ImageDraw.Draw(mask)
        md.rounded_rectangle([0, 0, 940, 420], radius=18, fill=255)
        
        img.paste(src, (70, 300), mask)
        
        # Border
        b = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        bd = ImageDraw.Draw(b)
        bd.rounded_rectangle([70, 300, 1010, 720], radius=18, outline=(0, 220, 190, 200), width=2)
        img = Image.alpha_composite(img, b)

    # Bottom Launch Offer Card
    img = draw_rounded_box(img, [70, 750, 1010, 990], fill=(16, 24, 40, 250), outline=(234, 179, 8, 220), radius=20, width=2)
    d = ImageDraw.Draw(img)
    d.text((105, 775), "🎉 PUBLIC LAUNCH PRICING IS LIVE", font=get_font(24, bold=True), fill=(253, 224, 71))
    d.text((105, 820), "• 1 Module Package: 100% FREE FOREVER (1 App, No CC Required)", font=get_font(20, bold=True), fill=(52, 211, 153))
    d.text((105, 860), "• Standard Suite: $9.99 for 1 Month (Code: LAUNCH9)", font=get_font(20, bold=True), fill=(255, 255, 255))
    d.text((105, 900), "• Early Bird Pro: $15.99 / Month Lifetime Lock (Code: EARLYBIRD15)", font=get_font(20, bold=True), fill=(192, 132, 252))
    d.text((105, 945), "🌐 Try it live at:  www.beraxis.online", font=get_font(22, bold=True), fill=(0, 220, 190))

    save_dual(img, "odoo_style_post_4_scan_reconcile_done")

if __name__ == "__main__":
    create_odoo_post_1()
    create_odoo_post_2()
    create_odoo_post_3()
    create_odoo_post_4()
    print("All Odoo-style Instagram posts rendered successfully!")
