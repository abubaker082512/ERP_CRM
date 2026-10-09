import os
import shutil
from PIL import Image, ImageDraw, ImageFont, ImageFilter

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

def draw_canvas(width, height, c1=(10, 15, 26), c2=(15, 23, 42)):
    base = Image.new("RGBA", (width, height), c1)
    draw = ImageDraw.Draw(base)
    for y in range(height):
        factor = y / height
        r = int(c1[0] * (1 - factor) + c2[0] * factor)
        g = int(c1[1] * (1 - factor) + c2[1] * factor)
        b = int(c1[2] * (1 - factor) + c2[2] * factor)
        draw.line([(0, y), (width, y)], fill=(r, g, b, 255))
        
    # Ambient glowing lights
    glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    g_draw = ImageDraw.Draw(glow)
    
    # Cyan glow top right
    cx1, cy1, r1 = int(width * 0.85), int(height * 0.15), int(width * 0.6)
    for r in range(r1, 0, -12):
        alpha = int(45 * (1 - (r / r1)))
        g_draw.ellipse([cx1 - r, cy1 - r, cx1 + r, cy1 + r], fill=(56, 189, 248, alpha))
        
    # Purple glow bottom left
    cx2, cy2, r2 = int(width * 0.15), int(height * 0.85), int(width * 0.6)
    for r in range(r2, 0, -12):
        alpha = int(40 * (1 - (r / r2)))
        g_draw.ellipse([cx2 - r, cy2 - r, cx2 + r, cy2 + r], fill=(192, 132, 252, alpha))
        
    return Image.alpha_composite(base, glow)

def draw_glass_card(img, rect, fill=(17, 24, 39, 230), outline=(56, 189, 248, 120), radius=20, width=1):
    card = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(card)
    d.rounded_rectangle(rect, radius=radius, fill=fill, outline=outline, width=width)
    return Image.alpha_composite(img, card)

def paste_image_with_glow(base_img, src_path, dest_rect, radius=18, glow_color=(56, 189, 248)):
    x1, y1, x2, y2 = dest_rect
    w = x2 - x1
    h = y2 - y1
    if not os.path.exists(src_path):
        return base_img
    
    src = Image.open(src_path).convert("RGBA")
    src = src.resize((w, h), Image.Resampling.LANCZOS)
    
    # Mask with rounded corners
    mask = Image.new("L", (w, h), 0)
    m_draw = ImageDraw.Draw(mask)
    m_draw.rounded_rectangle([0, 0, w, h], radius=radius, fill=255)
    
    # Shadow / glow
    shadow = Image.new("RGBA", base_img.size, (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow)
    s_draw.rounded_rectangle([x1-6, y1-2, x2+6, y2+14], radius=radius+6, fill=(0, 0, 0, 200))
    shadow = shadow.filter(ImageFilter.GaussianBlur(16))
    base_img = Image.alpha_composite(base_img, shadow)
    
    # Paste
    base_img.paste(src, (x1, y1), mask)
    
    # Outer border
    border = Image.new("RGBA", base_img.size, (0, 0, 0, 0))
    b_draw = ImageDraw.Draw(border)
    b_draw.rounded_rectangle([x1, y1, x2, y2], radius=radius, outline=glow_color + (220,), width=2)
    return Image.alpha_composite(base_img, border)

def save_dual(img, filename_base):
    png_web = os.path.join(OUTPUT_DIR_WEB, f"{filename_base}.png")
    jpg_web = os.path.join(OUTPUT_DIR_WEB, f"{filename_base}.jpg")
    png_art = os.path.join(OUTPUT_DIR_ARTIFACT, f"{filename_base}.png")
    jpg_art = os.path.join(OUTPUT_DIR_ARTIFACT, f"{filename_base}.jpg")
    
    img.save(png_web, "PNG")
    img.convert("RGB").save(jpg_web, "JPEG", quality=95)
    
    shutil.copyfile(png_web, png_art)
    shutil.copyfile(jpg_web, jpg_art)
    print(f"Saved: {filename_base}.png & .jpg")

# =========================================================================
# POST 1: OFFICIAL LAUNCH & 3-TIER PRICING (1080x1080)
# =========================================================================
def generate_post_1():
    W, H = 1080, 1080
    img = draw_canvas(W, H)
    
    # Logo
    if os.path.exists("D:/ERP_CRM/public/logo2.png"):
        logo = Image.open("D:/ERP_CRM/public/logo2.png").convert("RGBA")
        logo.thumbnail((260, 65), Image.Resampling.LANCZOS)
        img.paste(logo, (55, 45), logo)
        
    # Top Launch Tag
    img = draw_glass_card(img, [740, 48, 1025, 96], fill=(234, 179, 8, 35), outline=(234, 179, 8, 220), radius=12)
    d = ImageDraw.Draw(img)
    d.text((765, 60), "🚀 WE ARE LIVE NOW", font=get_font(20, bold=True), fill=(253, 224, 71))
    
    # Headlines
    d.text((55, 130), "The AI-First ERP & CRM Platform", font=get_font(46, bold=True), fill=(255, 255, 255))
    d.text((55, 188), "Automate Accounting, Invoicing, Sales Pipeline & Inventory with Next-Gen AI.", font=get_font(22, bold=False), fill=(148, 163, 184))
    
    # 3 Distinct Pricing Cards (Horizontal Trio)
    card_w = 300
    card_h = 440
    top_y = 250
    
    # Card 1: FREE TIER
    c1_x = 55
    img = draw_glass_card(img, [c1_x, top_y, c1_x + card_w, top_y + card_h], fill=(15, 23, 42, 240), outline=(52, 211, 153, 200), radius=18, width=2)
    d = ImageDraw.Draw(img)
    d.text((c1_x + 20, top_y + 25), "STARTER", font=get_font(18, bold=True), fill=(52, 211, 153))
    d.text((c1_x + 20, top_y + 55), "$0", font=get_font(52, bold=True), fill=(255, 255, 255))
    d.text((c1_x + 95, top_y + 80), "/ Free Forever", font=get_font(18, bold=False), fill=(148, 163, 184))
    
    d.text((c1_x + 20, top_y + 130), "• 1 Module Package", font=get_font(19, bold=True), fill=(255, 255, 255))
    d.text((c1_x + 20, top_y + 165), "• 1 Full App Included", font=get_font(19, bold=True), fill=(255, 255, 255))
    d.text((c1_x + 20, top_y + 200), "• No Credit Card", font=get_font(18, bold=False), fill=(203, 213, 225))
    d.text((c1_x + 20, top_y + 235), "• Cloud Sync & Reports", font=get_font(18, bold=False), fill=(203, 213, 225))
    d.text((c1_x + 20, top_y + 270), "• Instant Access", font=get_font(18, bold=False), fill=(52, 211, 153))
    
    # Pill
    img = draw_glass_card(img, [c1_x + 20, top_y + 360, c1_x + card_w - 20, top_y + 415], fill=(52, 211, 153, 30), outline=(52, 211, 153, 180), radius=10)
    d = ImageDraw.Draw(img)
    d.text((c1_x + 50, top_y + 375), "100% Free Forever", font=get_font(18, bold=True), fill=(52, 211, 153))

    # Card 2: STANDARD LAUNCH DEAL (Featured Highlight)
    c2_x = c1_x + card_w + 35
    img = draw_glass_card(img, [c2_x, top_y - 12, c2_x + card_w, top_y + card_h + 12], fill=(24, 24, 55, 250), outline=(234, 179, 8, 240), radius=20, width=3)
    d = ImageDraw.Draw(img)
    d.text((c2_x + 20, top_y + 15), "STANDARD LAUNCH", font=get_font(18, bold=True), fill=(234, 179, 8))
    d.text((c2_x + 20, top_y + 45), "$9.99", font=get_font(52, bold=True), fill=(255, 255, 255))
    d.text((c2_x + 160, top_y + 70), "/ 1st Month", font=get_font(18, bold=False), fill=(234, 179, 8))
    
    d.text((c2_x + 20, top_y + 120), "• Full Multi-App Suite", font=get_font(19, bold=True), fill=(255, 255, 255))
    d.text((c2_x + 20, top_y + 155), "• 3-Sec AI OCR Scanner", font=get_font(19, bold=True), fill=(255, 255, 255))
    d.text((c2_x + 20, top_y + 190), "• CRM, Invoices & P&L", font=get_font(18, bold=False), fill=(203, 213, 225))
    d.text((c2_x + 20, top_y + 225), "• Priority Cloud Server", font=get_font(18, bold=False), fill=(203, 213, 225))
    d.text((c2_x + 20, top_y + 260), "• WhatsApp Support", font=get_font(18, bold=False), fill=(56, 189, 248))
    
    # Promo Tag
    img = draw_glass_card(img, [c2_x + 15, top_y + 350, c2_x + card_w - 15, top_y + 420], fill=(234, 179, 8, 40), outline=(234, 179, 8, 220), radius=10)
    d = ImageDraw.Draw(img)
    d.text((c2_x + 35, top_y + 365), "CODE:  LAUNCH9", font=get_font(21, bold=True), fill=(253, 224, 71))
    d.text((c2_x + 45, top_y + 393), "Apply code at checkout", font=get_font(14, bold=False), fill=(203, 213, 225))

    # Card 3: EARLY BIRD PRO
    c3_x = c2_x + card_w + 35
    img = draw_glass_card(img, [c3_x, top_y, c3_x + card_w, top_y + card_h], fill=(20, 20, 45, 240), outline=(192, 132, 252, 200), radius=18, width=2)
    d = ImageDraw.Draw(img)
    d.text((c3_x + 20, top_y + 25), "CUSTOM / PRO", font=get_font(18, bold=True), fill=(192, 132, 252))
    d.text((c3_x + 20, top_y + 55), "$15.99", font=get_font(52, bold=True), fill=(255, 255, 255))
    d.text((c3_x + 185, top_y + 80), "/ Mo", font=get_font(18, bold=False), fill=(148, 163, 184))
    
    d.text((c3_x + 20, top_y + 130), "• Lifetime Price Lock", font=get_font(19, bold=True), fill=(192, 132, 252))
    d.text((c3_x + 20, top_y + 165), "• All Modules Unlocked", font=get_font(19, bold=True), fill=(255, 255, 255))
    d.text((c3_x + 20, top_y + 200), "• Autonomous AI Copilot", font=get_font(18, bold=False), fill=(203, 213, 225))
    d.text((c3_x + 20, top_y + 235), "• Custom Integrations", font=get_font(18, bold=False), fill=(203, 213, 225))
    d.text((c3_x + 20, top_y + 270), "• Dedicated Manager", font=get_font(18, bold=False), fill=(192, 132, 252))
    
    img = draw_glass_card(img, [c3_x + 15, top_y + 350, c3_x + card_w - 15, top_y + 420], fill=(192, 132, 252, 35), outline=(192, 132, 252, 220), radius=10)
    d = ImageDraw.Draw(img)
    d.text((c3_x + 25, top_y + 365), "CODE:  EARLYBIRD15", font=get_font(19, bold=True), fill=(224, 231, 255))
    d.text((c3_x + 45, top_y + 393), "Early bird lifetime deal", font=get_font(14, bold=False), fill=(203, 213, 225))

    # Bottom Banner Bar
    img = draw_glass_card(img, [55, 740, 1025, 1020], fill=(15, 23, 42, 240), outline=(56, 189, 248, 160), radius=18)
    
    # Left mini screenshot
    ss_path = "D:/ERP_CRM/public/deck_assets/dashboard_hero.jpg"
    img = paste_image_with_glow(img, ss_path, [80, 765, 450, 995], radius=14, glow_color=(56, 189, 248))
    
    d = ImageDraw.Draw(img)
    d.text((480, 775), "⚡ Start In Under 60 Seconds", font=get_font(28, bold=True), fill=(255, 255, 255))
    d.text((480, 815), "No setup fees • Instant cloud workspace • Cancel anytime", font=get_font(18, bold=False), fill=(148, 163, 184))
    
    # CTA Button
    img = draw_glass_card(img, [480, 865, 995, 930], fill=(56, 189, 248, 255), radius=12)
    d = ImageDraw.Draw(img)
    d.text((540, 882), "Claim Your Launch Offer Today ➔", font=get_font(24, bold=True), fill=(11, 15, 25))
    
    d.text((480, 960), "🌐 Official Website: www.beraxis.online", font=get_font(22, bold=True), fill=(56, 189, 248))

    save_dual(img, "post_1_launch_pricing_square")

# =========================================================================
# POST 2: 3-SECOND AI OCR INVOICING (1080x1080)
# =========================================================================
def generate_post_2():
    W, H = 1080, 1080
    img = draw_canvas(W, H, (10, 20, 35), (15, 23, 42))
    
    if os.path.exists("D:/ERP_CRM/public/logo2.png"):
        logo = Image.open("D:/ERP_CRM/public/logo2.png").convert("RGBA")
        logo.thumbnail((260, 65), Image.Resampling.LANCZOS)
        img.paste(logo, (55, 45), logo)
        
    img = draw_glass_card(img, [720, 48, 1025, 96], fill=(56, 189, 248, 30), outline=(56, 189, 248, 200), radius=12)
    d = ImageDraw.Draw(img)
    d.text((745, 60), "⚡ AI OCR ENGINE", font=get_font(20, bold=True), fill=(56, 189, 248))

    d.text((55, 130), "Scan Any Invoice in 3.1 Seconds", font=get_font(48, bold=True), fill=(255, 255, 255))
    d.text((55, 190), "Auto-extracts vendor, line items, taxes & updates your General Ledger with zero math errors.", font=get_font(21, bold=False), fill=(148, 163, 184))

    # Large UI Screenshot
    ss_path = "D:/ERP_CRM/public/deck_assets/crm_accounting_view.jpg"
    img = paste_image_with_glow(img, ss_path, [55, 250, 1025, 750], radius=18, glow_color=(56, 189, 248))

    # Bottom Offer Cards
    img = draw_glass_card(img, [55, 780, 1025, 1020], fill=(17, 24, 39, 245), outline=(234, 179, 8, 220), radius=18)
    d = ImageDraw.Draw(img)
    d.text((85, 805), "🎉 PUBLIC LAUNCH SPECIAL", font=get_font(24, bold=True), fill=(253, 224, 71))
    d.text((85, 845), "• 1 App 100% Free Forever  (No CC Required)", font=get_font(20, bold=True), fill=(52, 211, 153))
    d.text((85, 880), "• Standard Suite: $9.99 for 1 Month  (Code: LAUNCH9)", font=get_font(20, bold=True), fill=(255, 255, 255))
    d.text((85, 915), "• Early Bird Pro: $15.99 / Month  (Code: EARLYBIRD15)", font=get_font(20, bold=True), fill=(192, 132, 252))

    # CTA Button Right
    img = draw_glass_card(img, [680, 830, 995, 910], fill=(56, 189, 248, 255), radius=14)
    d = ImageDraw.Draw(img)
    d.text((715, 855), "Try It Live Free ➔", font=get_font(24, bold=True), fill=(11, 15, 25))

    d.text((85, 965), "🌐 www.beraxis.online", font=get_font(22, bold=True), fill=(56, 189, 248))

    save_dual(img, "post_2_ocr_speed_square")

# =========================================================================
# POST 3: SAAS KILLER / COST COMPARISON (1080x1080)
# =========================================================================
def generate_post_3():
    W, H = 1080, 1080
    img = draw_canvas(W, H, (15, 15, 28), (20, 24, 45))
    
    if os.path.exists("D:/ERP_CRM/public/logo2.png"):
        logo = Image.open("D:/ERP_CRM/public/logo2.png").convert("RGBA")
        logo.thumbnail((260, 65), Image.Resampling.LANCZOS)
        img.paste(logo, (55, 45), logo)
        
    d = ImageDraw.Draw(img)
    d.text((55, 125), "Stop Paying $400/Month For 5 Apps", font=get_font(46, bold=True), fill=(255, 255, 255))
    d.text((55, 185), "Replace QuickBooks + HubSpot + Inventory plugins with 1 lightning AI platform.", font=get_font(22, bold=False), fill=(148, 163, 184))

    # Comparison Columns
    col_w = 460
    col_h = 510
    cy = 240
    
    # Left: Old Way
    img = draw_glass_card(img, [55, cy, 55 + col_w, cy + col_h], fill=(30, 15, 20, 230), outline=(244, 63, 94, 180), radius=18, width=2)
    d = ImageDraw.Draw(img)
    d.text((85, cy + 25), "❌ THE OLD WAY", font=get_font(26, bold=True), fill=(244, 63, 94))
    
    bad_items = [
        ("QuickBooks / Xero", "$60 / mo"),
        ("HubSpot / CRM", "$120 / mo"),
        ("Inventory Tracker", "$100 / mo"),
        ("Third-Party OCR Plugins", "$40 / mo"),
        ("Zapier Connectors", "$50 / mo"),
    ]
    iy = cy + 85
    for name, cost in bad_items:
        d.text((85, iy), f"• {name}", font=get_font(20, bold=False), fill=(226, 232, 240))
        d.text((410, iy), cost, font=get_font(20, bold=True), fill=(244, 63, 94))
        iy += 45
        
    d.line([(85, cy + 335), (480, cy + 335)], fill=(244, 63, 94, 100), width=1)
    d.text((85, cy + 355), "Total SaaS Cost:", font=get_font(20, bold=False), fill=(148, 163, 184))
    d.text((85, cy + 385), "$370 - $800 / Mo", font=get_font(38, bold=True), fill=(244, 63, 94))
    d.text((85, cy + 445), "⚠️ Constant manual sync & double entry", font=get_font(16, bold=False), fill=(252, 165, 165))

    # Right: Beraxis AI
    c2x = 55 + col_w + 50
    img = draw_glass_card(img, [c2x, cy, c2x + col_w, cy + col_h], fill=(15, 30, 45, 240), outline=(56, 189, 248, 220), radius=18, width=2)
    d = ImageDraw.Draw(img)
    d.text((c2x + 30, cy + 25), "✨ THE BERAXIS WAY", font=get_font(26, bold=True), fill=(56, 189, 248))

    good_items = [
        "✓ Full Accounting & General Ledger",
        "✓ 3.1-Sec AI Invoice OCR Engine",
        "✓ Customer CRM & Sales Pipeline",
        "✓ Real-Time Stock & Warehouse Ops",
        "✓ Autonomous AI Copilot Assistant",
    ]
    iy = cy + 85
    for item in good_items:
        d.text((c2x + 30, iy), item, font=get_font(20, bold=False), fill=(255, 255, 255))
        iy += 45
        
    d.line([(c2x + 30, cy + 335), (c2x + col_w - 30, cy + 335)], fill=(56, 189, 248, 100), width=1)
    d.text((c2x + 30, cy + 355), "Starter: $0 Free | Launch Deal:", font=get_font(18, bold=False), fill=(148, 163, 184))
    d.text((c2x + 30, cy + 385), "$9.99 (Code: LAUNCH9)", font=get_font(30, bold=True), fill=(253, 224, 71))
    d.text((c2x + 30, cy + 440), "Early Bird Lifetime: $15.99/mo (EARLYBIRD15)", font=get_font(16, bold=True), fill=(192, 132, 252))

    # Bottom CTA Bar
    img = draw_glass_card(img, [55, 780, 1025, 1020], fill=(17, 24, 39, 250), outline=(52, 211, 153, 180), radius=18)
    d = ImageDraw.Draw(img)
    d.text((85, 810), "🎁 1 App Included 100% Free Forever (No Credit Card Required)", font=get_font(24, bold=True), fill=(52, 211, 153))
    d.text((85, 860), "Sign up in 30 seconds and start running your business on AI.", font=get_font(20, bold=False), fill=(203, 213, 225))
    
    img = draw_glass_card(img, [85, 910, 520, 975], fill=(56, 189, 248, 255), radius=12)
    d = ImageDraw.Draw(img)
    d.text((120, 928), "Start Free at www.beraxis.online ➔", font=get_font(20, bold=True), fill=(11, 15, 25))

    save_dual(img, "post_3_saas_killer_comparison")

# =========================================================================
# POST 4: UNIFIED ALL-IN-ONE ECOSYSTEM (1080x1080)
# =========================================================================
def generate_post_4():
    W, H = 1080, 1080
    img = draw_canvas(W, H)
    
    if os.path.exists("D:/ERP_CRM/public/logo2.png"):
        logo = Image.open("D:/ERP_CRM/public/logo2.png").convert("RGBA")
        logo.thumbnail((260, 65), Image.Resampling.LANCZOS)
        img.paste(logo, (55, 45), logo)
        
    img = draw_glass_card(img, [720, 48, 1025, 96], fill=(192, 132, 252, 30), outline=(192, 132, 252, 200), radius=12)
    d = ImageDraw.Draw(img)
    d.text((750, 60), "⭐ ALL-IN-ONE SUITE", font=get_font(20, bold=True), fill=(192, 132, 252))

    d.text((55, 130), "One Platform. Complete Control.", font=get_font(48, bold=True), fill=(255, 255, 255))
    d.text((55, 190), "Everything your business needs to scale, seamlessly integrated under one login.", font=get_font(22, bold=False), fill=(148, 163, 184))

    # 4 Feature Mini-Cards (2x2 Grid)
    grid_w = 460
    grid_h = 240
    
    # Grid 1: Accounting
    img = draw_glass_card(img, [55, 250, 55 + grid_w, 250 + grid_h], fill=(17, 24, 39, 230), outline=(56, 189, 248, 180), radius=16)
    d = ImageDraw.Draw(img)
    d.text((85, 275), "📊 Smart Accounting & P&L", font=get_font(24, bold=True), fill=(56, 189, 248))
    d.text((85, 320), "• Automated General Ledger & Journal\n• Instant Cash Flow & Balance Sheet\n• 3-Second AI Invoice Scanning", font=get_font(18, bold=False), fill=(203, 213, 225))

    # Grid 2: CRM
    img = draw_glass_card(img, [565, 250, 565 + grid_w, 250 + grid_h], fill=(17, 24, 39, 230), outline=(234, 179, 8, 180), radius=16)
    d = ImageDraw.Draw(img)
    d.text((595, 275), "🤝 CRM & Sales Pipeline", font=get_font(24, bold=True), fill=(234, 179, 8))
    d.text((595, 320), "• Visual Kanban Deal Stages\n• Auto-convert Leads to Quotations\n• Direct WhatsApp & Email Sync", font=get_font(18, bold=False), fill=(203, 213, 225))

    # Grid 3: Inventory
    img = draw_glass_card(img, [55, 520, 55 + grid_w, 520 + grid_h], fill=(17, 24, 39, 230), outline=(52, 211, 153, 180), radius=16)
    d = ImageDraw.Draw(img)
    d.text((85, 545), "📦 Stock & Warehouse Ops", font=get_font(24, bold=True), fill=(52, 211, 153))
    d.text((85, 590), "• Multi-Warehouse Tracking\n• Automated Reordering & Low Stock Alerts\n• Integrated Purchase Orders", font=get_font(18, bold=False), fill=(203, 213, 225))

    # Grid 4: AI Copilot
    img = draw_glass_card(img, [565, 520, 565 + grid_w, 520 + grid_h], fill=(17, 24, 39, 230), outline=(192, 132, 252, 180), radius=16)
    d = ImageDraw.Draw(img)
    d.text((595, 545), "🤖 Autonomous AI Copilot", font=get_font(24, bold=True), fill=(192, 132, 252))
    d.text((595, 590), "• Natural language revenue insights\n• Automated financial reconciliation\n• Instant interior query assistant", font=get_font(18, bold=False), fill=(203, 213, 225))

    # Bottom Offer Bar
    img = draw_glass_card(img, [55, 790, 1025, 1020], fill=(15, 23, 42, 250), outline=(234, 179, 8, 220), radius=18)
    d = ImageDraw.Draw(img)
    d.text((85, 815), "🔥 Special Launch Promo Codes:", font=get_font(26, bold=True), fill=(253, 224, 71))
    d.text((85, 860), "Use Code  LAUNCH9         ➔  Standard Package for $9.99 (1 Month)", font=get_font(20, bold=True), fill=(255, 255, 255))
    d.text((85, 900), "Use Code  EARLYBIRD15   ➔  Early Bird Lifetime for $15.99 / Month", font=get_font(20, bold=True), fill=(192, 132, 252))
    d.text((85, 940), "Starter Tier: 1 App Included 100% Free Forever (No CC Needed)", font=get_font(18, bold=False), fill=(52, 211, 153))

    d.text((85, 980), "🌐 www.beraxis.online", font=get_font(20, bold=True), fill=(56, 189, 248))

    save_dual(img, "post_4_unified_ecosystem_square")

# =========================================================================
# POST 5: PORTRAIT FEED EDITION (1080x1350 for Instagram & LinkedIn)
# =========================================================================
def generate_post_5():
    W, H = 1080, 1350
    img = draw_canvas(W, H)
    
    if os.path.exists("D:/ERP_CRM/public/logo2.png"):
        logo = Image.open("D:/ERP_CRM/public/logo2.png").convert("RGBA")
        logo.thumbnail((280, 70), Image.Resampling.LANCZOS)
        img.paste(logo, (60, 50), logo)
        
    img = draw_glass_card(img, [720, 52, 1020, 102], fill=(234, 179, 8, 30), outline=(234, 179, 8, 220), radius=12)
    d = ImageDraw.Draw(img)
    d.text((750, 66), "🔥 PUBLIC LAUNCH", font=get_font(20, bold=True), fill=(253, 224, 71))

    d.text((60, 140), "Run Your Entire Business on AI", font=get_font(48, bold=True), fill=(255, 255, 255))
    d.text((60, 200), "Accounting • CRM • Invoicing • Inventory • Autonomous AI", font=get_font(24, bold=False), fill=(148, 163, 184))

    # Main UI Showcase
    ss_path = "D:/ERP_CRM/public/deck_assets/dashboard_hero.jpg"
    img = paste_image_with_glow(img, ss_path, [60, 260, 1020, 750], radius=18, glow_color=(56, 189, 248))

    # 3 Offer Cards
    # Card 1: Free
    img = draw_glass_card(img, [60, 780, 520, 970], fill=(17, 24, 39, 240), outline=(52, 211, 153, 200), radius=16)
    d = ImageDraw.Draw(img)
    d.text((85, 800), "STARTER TIER", font=get_font(18, bold=True), fill=(52, 211, 153))
    d.text((85, 825), "$0 / Free Forever", font=get_font(34, bold=True), fill=(255, 255, 255))
    d.text((85, 875), "✓ 1 Module / 1 Full App", font=get_font(17, bold=False), fill=(203, 213, 225))
    d.text((85, 905), "✓ No Credit Card Required", font=get_font(17, bold=False), fill=(203, 213, 225))
    d.text((85, 935), "✓ Full Cloud Access", font=get_font(17, bold=False), fill=(52, 211, 153))

    # Card 2: Standard
    img = draw_glass_card(img, [560, 780, 1020, 970], fill=(24, 24, 55, 240), outline=(234, 179, 8, 220), radius=16)
    d = ImageDraw.Draw(img)
    d.text((585, 800), "STANDARD LAUNCH", font=get_font(18, bold=True), fill=(234, 179, 8))
    d.text((585, 825), "$9.99 / 1 Month", font=get_font(34, bold=True), fill=(255, 255, 255))
    d.text((585, 875), "✓ Full Multi-App Suite", font=get_font(17, bold=False), fill=(203, 213, 225))
    d.text((585, 905), "✓ 3-Sec AI OCR Engine", font=get_font(17, bold=False), fill=(203, 213, 225))
    d.text((585, 935), "Code: LAUNCH9", font=get_font(18, bold=True), fill=(253, 224, 71))

    # Card 3: Early Bird Long Box
    img = draw_glass_card(img, [60, 1000, 1020, 1170], fill=(20, 20, 45, 240), outline=(192, 132, 252, 220), radius=16)
    d = ImageDraw.Draw(img)
    d.text((90, 1025), "⭐ EARLY BIRD CUSTOM / PRO: $15.99 / MONTH LIFETIME LOCK", font=get_font(22, bold=True), fill=(192, 132, 252))
    d.text((90, 1065), "• All Modules Unlocked • Autonomous AI Copilot • Dedicated Support", font=get_font(18, bold=False), fill=(203, 213, 225))
    d.text((90, 1105), "Use Promo Code:  EARLYBIRD15  at checkout", font=get_font(20, bold=True), fill=(255, 255, 255))

    # Bottom Call to action
    img = draw_glass_card(img, [60, 1200, 1020, 1290], fill=(56, 189, 248, 255), radius=14)
    d = ImageDraw.Draw(img)
    d.text((280, 1230), "Get Started Now at www.beraxis.online ➔", font=get_font(26, bold=True), fill=(11, 15, 25))

    save_dual(img, "post_5_portrait_feed_master")

if __name__ == "__main__":
    generate_post_1()
    generate_post_2()
    generate_post_3()
    generate_post_4()
    generate_post_5()
    print("All professional social media posts rendered successfully!")
