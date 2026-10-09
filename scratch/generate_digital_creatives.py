import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUTPUT_DIR = "public/social_media_assets"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def get_font(size, bold=False):
    # Try Windows system fonts
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

def draw_gradient_bg(width, height, color1=(11, 15, 25), color2=(17, 24, 39), color3=(14, 30, 60)):
    im = Image.new("RGBA", (width, height), color1)
    draw = ImageDraw.Draw(im)
    for y in range(height):
        factor = y / height
        # Diagonal/vertical blend
        r = int(color1[0] * (1 - factor) + color2[0] * factor)
        g = int(color1[1] * (1 - factor) + color2[1] * factor)
        b = int(color1[2] * (1 - factor) + color2[2] * factor)
        draw.line([(0, y), (width, y)], fill=(r, g, b, 255))
    
    # Add a glowing radial gradient overlay in top-right or center
    glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    center_x = int(width * 0.8)
    center_y = int(height * 0.2)
    max_radius = int(min(width, height) * 0.7)
    
    for r in range(max_radius, 0, -10):
        alpha = int(40 * (1 - (r / max_radius)))
        glow_draw.ellipse(
            [center_x - r, center_y - r, center_x + r, center_y + r],
            fill=(56, 189, 248, alpha)
        )
    
    # Second glow (purple) bottom-left
    c2_x = int(width * 0.15)
    c2_y = int(height * 0.85)
    for r in range(max_radius, 0, -10):
        alpha = int(35 * (1 - (r / max_radius)))
        glow_draw.ellipse(
            [c2_x - r, c2_y - r, c2_x + r, c2_y + r],
            fill=(192, 132, 252, alpha)
        )
        
    return Image.alpha_composite(im, glow)

def draw_rounded_card(base_img, rect, fill, outline=None, outline_width=1, radius=24):
    card = Image.new("RGBA", base_img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(card)
    draw.rounded_rectangle(rect, radius=radius, fill=fill, outline=outline, width=outline_width)
    return Image.alpha_composite(base_img, card)

def paste_screenshot_with_shadow(base_img, screenshot_path, dest_rect, radius=16):
    x1, y1, x2, y2 = dest_rect
    w = x2 - x1
    h = y2 - y1
    
    if not os.path.exists(screenshot_path):
        return base_img
        
    ss = Image.open(screenshot_path).convert("RGBA")
    ss = ss.resize((w, h), Image.Resampling.LANCZOS)
    
    # Create mask for rounded corners
    mask = Image.new("L", (w, h), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([0, 0, w, h], radius=radius, fill=255)
    
    # Outer shadow
    shadow = Image.new("RGBA", base_img.size, (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow)
    s_draw.rounded_rectangle([x1-4, y1+6, x2+4, y2+14], radius=radius+4, fill=(0, 0, 0, 160))
    shadow = shadow.filter(ImageFilter.GaussianBlur(12))
    base_img = Image.alpha_composite(base_img, shadow)
    
    # Paste image with mask
    base_img.paste(ss, (x1, y1), mask)
    
    # Outline border
    border = Image.new("RGBA", base_img.size, (0, 0, 0, 0))
    b_draw = ImageDraw.Draw(border)
    b_draw.rounded_rectangle([x1, y1, x2, y2], radius=radius, outline=(56, 189, 248, 180), width=2)
    return Image.alpha_composite(base_img, border)

# ==========================================
# 1. Square Feed Ad (1080x1080): $9.99 Standard Launch Promo
# ==========================================
def create_ad_1080x1080_promo9():
    W, H = 1080, 1080
    im = draw_gradient_bg(W, H, (11, 15, 25), (15, 23, 42))
    
    # Logo & Top Tag
    if os.path.exists("public/logo2.png"):
        logo = Image.open("public/logo2.png").convert("RGBA")
        logo.thumbnail((260, 70), Image.Resampling.LANCZOS)
        im.paste(logo, (60, 55), logo)
        
    f_badge = get_font(20, bold=True)
    f_badge_sm = get_font(18, bold=True)
    
    # Badge: LAUNCH PROMOTION
    im = draw_rounded_card(im, [720, 55, 1020, 105], fill=(234, 179, 8, 30), outline=(234, 179, 8, 220), radius=12)
    draw = ImageDraw.Draw(im)
    draw.text((750, 68), "🔥 LAUNCH EXCLUSIVE", font=f_badge_sm, fill=(253, 224, 71))
    
    # Headline
    f_hero = get_font(52, bold=True)
    f_hero_sub = get_font(32, bold=False)
    draw.text((60, 150), "All-In-One AI ERP & CRM", font=f_hero, fill=(255, 255, 255))
    draw.text((60, 218), "Accounting • CRM • Invoicing • Inventory • AI Agent", font=f_hero_sub, fill=(148, 163, 184))
    
    # Screenshot Card
    ss_path = "public/deck_assets/dashboard_hero.jpg" if os.path.exists("public/deck_assets/dashboard_hero.jpg") else "scratch/post_login_screenshot.png"
    im = paste_screenshot_with_shadow(im, ss_path, [60, 280, 1020, 770], radius=18)
    
    # Bottom Offer Cards (2 side-by-side)
    # Left Card: 1 App Free Forever
    im = draw_rounded_card(im, [60, 800, 520, 1010], fill=(30, 41, 59, 230), outline=(71, 85, 105, 200), radius=16)
    draw = ImageDraw.Draw(im)
    f_p_title = get_font(24, bold=True)
    f_p_price = get_font(40, bold=True)
    f_p_sub = get_font(18, bold=False)
    
    draw.text((85, 820), "STARTER TIER", font=f_p_title, fill=(56, 189, 248))
    draw.text((85, 855), "$0 / Free Forever", font=f_p_price, fill=(255, 255, 255))
    draw.text((85, 910), "✓ 1 Module / 1 App (Full Features)", font=f_p_sub, fill=(203, 213, 225))
    draw.text((85, 940), "✓ No Credit Card Required", font=f_p_sub, fill=(203, 213, 225))
    draw.text((85, 970), "✓ Instant Cloud Access", font=f_p_sub, fill=(52, 211, 153))

    # Right Card: Standard Launch $9.99
    im = draw_rounded_card(im, [560, 800, 1020, 1010], fill=(24, 24, 60, 240), outline=(192, 132, 252, 255), radius=16)
    draw = ImageDraw.Draw(im)
    draw.text((585, 820), "STANDARD LAUNCH DEAL", font=f_p_title, fill=(234, 179, 8))
    draw.text((585, 855), "$9.99 for 1 Month", font=f_p_price, fill=(255, 255, 255))
    draw.text((585, 910), "✓ Full Multi-App Workspace", font=f_p_sub, fill=(203, 213, 225))
    
    # Promo Tag pill
    im = draw_rounded_card(im, [585, 948, 990, 992], fill=(234, 179, 8, 40), outline=(234, 179, 8, 200), radius=8)
    draw = ImageDraw.Draw(im)
    f_code = get_font(20, bold=True)
    draw.text((605, 958), "Use Code:  LAUNCH9  at Checkout", font=f_code, fill=(253, 224, 71))
    
    # Footer URL
    f_url = get_font(22, bold=True)
    draw.text((60, 1030), "🚀 Get Started: www.beraxis.online", font=f_url, fill=(56, 189, 248))
    
    out_path = os.path.join(OUTPUT_DIR, "ad1_instagram_feed_launch9.png")
    im.save(out_path, "PNG")
    print(f"Generated {out_path}")

# ==========================================
# 2. Vertical Reel / Story Ad (1080x1920): 3-Sec AI + Pricing
# ==========================================
def create_ad_1080x1920_story():
    W, H = 1080, 1920
    im = draw_gradient_bg(W, H, (10, 15, 30), (15, 23, 42))
    
    # Logo & Top Bar
    if os.path.exists("public/logo2.png"):
        logo = Image.open("public/logo2.png").convert("RGBA")
        logo.thumbnail((320, 90), Image.Resampling.LANCZOS)
        im.paste(logo, (80, 100), logo)
        
    im = draw_rounded_card(im, [720, 105, 1000, 165], fill=(56, 189, 248, 30), outline=(56, 189, 248, 200), radius=12)
    draw = ImageDraw.Draw(im)
    f_top = get_font(22, bold=True)
    draw.text((750, 122), "🤖 AI POWERED", font=f_top, fill=(56, 189, 248))
    
    # Bold Hook Headline
    f_hook = get_font(56, bold=True)
    f_hook_sub = get_font(34, bold=False)
    draw.text((80, 220), "Stop Wasting Hours on", font=f_hook, fill=(255, 255, 255))
    draw.text((80, 290), "Manual Accounting & CRM", font=f_hook, fill=(244, 63, 94))
    draw.text((80, 365), "Automate your entire business with Beraxis AI", font=f_hook_sub, fill=(148, 163, 184))
    
    # 3 Pill Badges
    pills = ["⚡ 3-Sec OCR Invoicing", "📊 Unified CRM & Pipeline", "🧠 Autonomous Assistant"]
    f_pill = get_font(22, bold=True)
    px = 80
    for p in pills:
        pw = len(p) * 14 + 30
        im = draw_rounded_card(im, [px, 430, px + pw, 485], fill=(30, 41, 59, 240), outline=(56, 189, 248, 150), radius=10)
        draw = ImageDraw.Draw(im)
        draw.text((px + 15, 445), p, font=f_pill, fill=(224, 242, 254))
        px += pw + 20
        
    # Main Screenshot 1
    ss_path = "public/deck_assets/crm_accounting_view.jpg" if os.path.exists("public/deck_assets/crm_accounting_view.jpg") else "scratch/post_login_screenshot.png"
    im = paste_screenshot_with_shadow(im, ss_path, [80, 520, 1000, 1080], radius=20)
    
    # Feature Bullet Overlay Box
    im = draw_rounded_card(im, [80, 1120, 1000, 1400], fill=(17, 24, 39, 240), outline=(192, 132, 252, 180), radius=20)
    draw = ImageDraw.Draw(im)
    f_box_t = get_font(30, bold=True)
    f_box_b = get_font(26, bold=False)
    
    draw.text((115, 1150), "🚀 Why Modern Businesses Switch to Beraxis:", font=f_box_t, fill=(192, 132, 252))
    draw.text((115, 1205), "✓ Snap or upload invoices -> Auto-booked in 3.1s", font=f_box_b, fill=(255, 255, 255))
    draw.text((115, 1255), "✓ Real-time Cash Flow, P&L, and Inventory alerts", font=f_box_b, fill=(255, 255, 255))
    draw.text((115, 1305), "✓ Built-in AI Copilot handles repetitive workflows", font=f_box_b, fill=(52, 211, 153))
    draw.text((115, 1355), "✓ Replaces 5 separate apps into 1 lightning dashboard", font=f_box_b, fill=(203, 213, 225))

    # Pricing & Offer Box
    im = draw_rounded_card(im, [80, 1430, 1000, 1750], fill=(15, 23, 42, 250), outline=(234, 179, 8, 220), radius=20)
    draw = ImageDraw.Draw(im)
    f_pr_t = get_font(34, bold=True)
    f_pr_l = get_font(28, bold=True)
    f_pr_sub = get_font(22, bold=False)
    
    draw.text((115, 1460), "🎉 SPECIAL LAUNCH PRICING", font=f_pr_t, fill=(253, 224, 71))
    
    # Tier 1: Free
    draw.text((115, 1515), "• 1 Module Package:", font=f_pr_l, fill=(56, 189, 248))
    draw.text((450, 1515), "100% FREE FOREVER (1 App)", font=f_pr_l, fill=(255, 255, 255))
    
    # Tier 2: Standard Promo
    draw.text((115, 1565), "• Standard Package:", font=f_pr_l, fill=(234, 179, 8))
    draw.text((450, 1565), "$9.99 for 1 Month (Code: LAUNCH9)", font=f_pr_l, fill=(253, 224, 71))
    
    # Tier 3: Early Bird Custom
    draw.text((115, 1615), "• Early Bird Pro:", font=f_pr_l, fill=(192, 132, 252))
    draw.text((450, 1615), "$15.99 / Month (Code: EARLYBIRD15)", font=f_pr_l, fill=(192, 132, 252))

    # Button CTA
    im = draw_rounded_card(im, [115, 1675, 965, 1730], fill=(56, 189, 248, 255), radius=14)
    draw = ImageDraw.Draw(im)
    f_cta = get_font(28, bold=True)
    draw.text((270, 1685), "Claim Your Launch Promo Today ➔", font=f_cta, fill=(11, 15, 25))

    # Bottom Swipe-up / Link text
    f_ft = get_font(26, bold=True)
    draw.text((320, 1800), "🔗 www.beraxis.online", font=f_ft, fill=(255, 255, 255))
    draw.text((360, 1845), "Tap the link in bio to start", font=get_font(20, bold=False), fill=(148, 163, 184))

    out_path = os.path.join(OUTPUT_DIR, "ad2_tiktok_reels_story.png")
    im.save(out_path, "PNG")
    print(f"Generated {out_path}")

# ==========================================
# 3. Landscape Feed / LinkedIn Ad (1200x628): Early Bird $15.99
# ==========================================
def create_ad_1200x628_earlybird():
    W, H = 1200, 628
    im = draw_gradient_bg(W, H, (11, 15, 25), (17, 24, 39))
    
    # Logo
    if os.path.exists("public/logo2.png"):
        logo = Image.open("public/logo2.png").convert("RGBA")
        logo.thumbnail((240, 60), Image.Resampling.LANCZOS)
        im.paste(logo, (50, 40), logo)
        
    im = draw_rounded_card(im, [300, 42, 540, 88], fill=(192, 132, 252, 30), outline=(192, 132, 252, 200), radius=10)
    draw = ImageDraw.Draw(im)
    draw.text((320, 52), "⭐ EARLY BIRD PASS", font=get_font(18, bold=True), fill=(192, 132, 252))
    
    # Left Content
    f_t1 = get_font(42, bold=True)
    f_t2 = get_font(22, bold=False)
    draw.text((50, 115), "Replace 5 Subscriptions", font=f_t1, fill=(255, 255, 255))
    draw.text((50, 165), "With 1 Intelligent ERP & CRM", font=f_t1, fill=(56, 189, 248))
    
    draw.text((50, 230), "• Full AI OCR Invoicing & Accounting Engine", font=f_t2, fill=(203, 213, 225))
    draw.text((50, 265), "• Customer CRM, Sales Pipeline & Lead Tracking", font=f_t2, fill=(203, 213, 225))
    draw.text((50, 300), "• Real-Time Inventory & Automated Stock Alerts", font=f_t2, fill=(203, 213, 225))
    draw.text((50, 335), "• 1 Free Module forever or Unlock All for Early Bird", font=f_t2, fill=(52, 211, 153))

    # Pricing Highlight Box
    im = draw_rounded_card(im, [50, 385, 540, 560], fill=(24, 24, 55, 240), outline=(192, 132, 252, 220), radius=16)
    draw = ImageDraw.Draw(im)
    f_pr = get_font(34, bold=True)
    f_code = get_font(20, bold=True)
    
    draw.text((75, 405), "EARLY BIRD LIFETIME OFFER", font=get_font(18, bold=True), fill=(192, 132, 252))
    draw.text((75, 435), "$15.99 / Month", font=f_pr, fill=(255, 255, 255))
    
    im = draw_rounded_card(im, [75, 490, 515, 540], fill=(192, 132, 252, 40), outline=(192, 132, 252, 200), radius=8)
    draw = ImageDraw.Draw(im)
    draw.text((95, 502), "Code: EARLYBIRD15  (Save 70%)", font=f_code, fill=(224, 231, 255))
    
    # CTA footer
    draw.text((50, 580), "👉 Start Free (No CC) at www.beraxis.online", font=get_font(20, bold=True), fill=(56, 189, 248))
    
    # Right Image Showcase
    ss_path = "public/deck_assets/inventory_ops_view.jpg" if os.path.exists("public/deck_assets/inventory_ops_view.jpg") else "scratch/post_login_screenshot.png"
    im = paste_screenshot_with_shadow(im, ss_path, [580, 115, 1150, 560], radius=16)
    
    out_path = os.path.join(OUTPUT_DIR, "ad3_linkedin_landscape_earlybird15.png")
    im.save(out_path, "PNG")
    print(f"Generated {out_path}")

# ==========================================
# 4. Square Feed Comparison Ad (1080x1080): Beraxis vs Legacy
# ==========================================
def create_ad_1080x1080_comparison():
    W, H = 1080, 1080
    im = draw_gradient_bg(W, H, (11, 15, 25), (18, 24, 40))
    
    if os.path.exists("public/logo2.png"):
        logo = Image.open("public/logo2.png").convert("RGBA")
        logo.thumbnail((260, 70), Image.Resampling.LANCZOS)
        im.paste(logo, (60, 50), logo)
        
    draw = ImageDraw.Draw(im)
    draw.text((60, 135), "Why Pay $350+/Month For Clunky ERPs?", font=get_font(44, bold=True), fill=(255, 255, 255))
    draw.text((60, 195), "Beraxis AI delivers enterprise capability at startup speed & pricing.", font=get_font(26, bold=False), fill=(148, 163, 184))
    
    # Left Comparison Card (Old Way)
    im = draw_rounded_card(im, [60, 260, 520, 750], fill=(30, 15, 20, 220), outline=(244, 63, 94, 150), radius=16)
    draw = ImageDraw.Draw(im)
    draw.text((90, 290), "❌ The Old Way", font=get_font(30, bold=True), fill=(244, 63, 94))
    
    old_items = [
        "• 5 separate fragmented tools",
        "• Manual invoice entry (15 min/ea)",
        "• High learning curve & slow UI",
        "• Hidden per-user surcharges",
        "• Starts at $300 - $800 / month",
        "• Zero AI assistance"
    ]
    oy = 350
    for item in old_items:
        draw.text((90, oy), item, font=get_font(21, bold=False), fill=(226, 232, 240))
        oy += 60
        
    # Right Comparison Card (Beraxis Way)
    im = draw_rounded_card(im, [560, 260, 1020, 750], fill=(15, 30, 45, 240), outline=(56, 189, 248, 240), radius=16)
    draw = ImageDraw.Draw(im)
    draw.text((590, 290), "✨ The Beraxis Way", font=get_font(30, bold=True), fill=(56, 189, 248))
    
    new_items = [
        "✓ Unified CRM, Accounting & Inventory",
        "✓ 3-Sec AI OCR Invoice processing",
        "✓ Modern, instant reactive dashboard",
        "✓ 1 Module Free Forever (1 App)",
        "✓ Standard: $9.99 / mo promo",
        "✓ Early Bird Custom: $15.99 / mo"
    ]
    ny = 350
    for item in new_items:
        draw.text((590, ny), item, font=get_font(21, bold=False), fill=(255, 255, 255))
        ny += 60
        
    # Bottom Bar Offer
    im = draw_rounded_card(im, [60, 780, 1020, 990], fill=(20, 26, 45, 250), outline=(234, 179, 8, 200), radius=16)
    draw = ImageDraw.Draw(im)
    draw.text((90, 810), "⚡ SPECIAL LAUNCH PROMO CODES:", font=get_font(28, bold=True), fill=(253, 224, 71))
    
    draw.text((90, 865), "Code  LAUNCH9        -> Standard Package for $9.99 (1 Month)", font=get_font(22, bold=True), fill=(255, 255, 255))
    draw.text((90, 910), "Code  EARLYBIRD15  -> Custom / Pro for $15.99 / Month Lifetime", font=get_font(22, bold=True), fill=(192, 132, 252))
    draw.text((90, 955), "Starter Tier: 1 App Included 100% Free Forever (No Code Needed)", font=get_font(20, bold=False), fill=(52, 211, 153))

    draw.text((60, 1025), "🌐 Launching Now at: https://www.beraxis.online", font=get_font(22, bold=True), fill=(56, 189, 248))

    out_path = os.path.join(OUTPUT_DIR, "ad4_carousel_comparison_square.png")
    im.save(out_path, "PNG")
    print(f"Generated {out_path}")

# ==========================================
# 5. Free Forever Tier Banner (1200x628)
# ==========================================
def create_ad_1200x628_free_tier():
    W, H = 1200, 628
    im = draw_gradient_bg(W, H, (10, 20, 30), (15, 23, 42))
    
    if os.path.exists("public/logo2.png"):
        logo = Image.open("public/logo2.png").convert("RGBA")
        logo.thumbnail((240, 60), Image.Resampling.LANCZOS)
        im.paste(logo, (50, 40), logo)
        
    im = draw_rounded_card(im, [300, 42, 530, 88], fill=(52, 211, 153, 30), outline=(52, 211, 153, 200), radius=10)
    draw = ImageDraw.Draw(im)
    draw.text((320, 52), "🎁 100% FREE TIER", font=get_font(18, bold=True), fill=(52, 211, 153))
    
    draw.text((50, 115), "1 Full App. 0 Dollars.", font=get_font(44, bold=True), fill=(255, 255, 255))
    draw.text((50, 168), "Free Forever. No Credit Card Required.", font=get_font(32, bold=True), fill=(52, 211, 153))
    
    draw.text((50, 230), "Choose any 1 module to power your business completely free:", font=get_font(22, bold=False), fill=(203, 213, 225))
    draw.text((50, 270), "• Full Accounting & Invoicing   OR", font=get_font(22, bold=True), fill=(255, 255, 255))
    draw.text((50, 305), "• Customer CRM & Lead Pipeline   OR", font=get_font(22, bold=True), fill=(255, 255, 255))
    draw.text((50, 340), "• Stock & Inventory Management", font=get_font(22, bold=True), fill=(255, 255, 255))
    
    # Bottom Launch Offer
    im = draw_rounded_card(im, [50, 400, 540, 550], fill=(20, 30, 45, 240), outline=(56, 189, 248, 200), radius=14)
    draw = ImageDraw.Draw(im)
    draw.text((75, 420), "Need more than 1 module?", font=get_font(20, bold=True), fill=(56, 189, 248))
    draw.text((75, 455), "Standard: $9.99 for 1 mo (Code: LAUNCH9)", font=get_font(18, bold=True), fill=(253, 224, 71))
    draw.text((75, 490), "Early Bird Pro: $15.99 / mo (Code: EARLYBIRD15)", font=get_font(18, bold=True), fill=(192, 132, 252))

    draw.text((50, 580), "🚀 Claim Your Free Account: www.beraxis.online", font=get_font(20, bold=True), fill=(52, 211, 153))

    ss_path = "public/deck_assets/analytics_growth_view.jpg" if os.path.exists("public/deck_assets/analytics_growth_view.jpg") else "scratch/post_login_screenshot.png"
    im = paste_screenshot_with_shadow(im, ss_path, [580, 115, 1150, 560], radius=16)

    out_path = os.path.join(OUTPUT_DIR, "ad5_free_tier_banner.png")
    im.save(out_path, "PNG")
    print(f"Generated {out_path}")

if __name__ == "__main__":
    create_ad_1080x1080_promo9()
    create_ad_1080x1920_story()
    create_ad_1200x628_earlybird()
    create_ad_1080x1080_comparison()
    create_ad_1200x628_free_tier()
    print("All 5 digital ad graphics generated successfully!")
