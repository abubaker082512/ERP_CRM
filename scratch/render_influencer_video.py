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

def draw_rounded_card(base, rect, fill, outline=None, width=1, radius=24):
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    d.rounded_rectangle(rect, radius=radius, fill=fill, outline=outline, width=width)
    return Image.alpha_composite(base, overlay)

def render_influencer_video_ad():
    print("Rendering Female Influencer Video Ad ($1 Annual / $5 Monthly)...")
    W, H = 1080, 1920
    fps = 24
    duration = 10 # 10-second fast-paced UGC video ad
    total_frames = fps * duration
    frames = []

    # Load Influencer Frames
    f1_path = os.path.join(OUTPUT_DIR_WEB, "influencer_video_frame_1.jpg")
    f2_path = os.path.join(OUTPUT_DIR_WEB, "influencer_video_frame_2.jpg")
    crm_ss_path = "D:/ERP_CRM/public/deck_assets/crm_accounting_view.jpg"

    img_f1 = Image.open(f1_path).convert("RGBA").resize((W, H), Image.Resampling.LANCZOS)
    img_f2 = Image.open(f2_path).convert("RGBA").resize((W, H), Image.Resampling.LANCZOS)
    
    # UI Inset Card
    crm_img = None
    if os.path.exists(crm_ss_path):
        crm_img = Image.open(crm_ss_path).convert("RGBA").resize((940, 520), Image.Resampling.LANCZOS)
        crm_mask = Image.new("L", (940, 520), 0)
        ImageDraw.Draw(crm_mask).rounded_rectangle([0, 0, 940, 520], radius=24, fill=255)

    logo = None
    if os.path.exists("D:/ERP_CRM/public/logo2.png"):
        logo = Image.open("D:/ERP_CRM/public/logo2.png").convert("RGBA")
        logo.thumbnail((280, 70), Image.Resampling.LANCZOS)

    for i in range(total_frames):
        t = i / fps
        
        # Scene transition:
        # 0s - 3.5s: Influencer Hook (Holding phone)
        # 3.5s - 7.0s: In-App Demo & Pricing Breakdown
        # 7.0s - 10.0s: Excited Reaction + CTA ($1/mo Annual vs $5/mo Monthly)
        if t < 3.5:
            base = img_f1.copy()
            # TikTok UGC Captions (Animated popping subtitle)
            base = draw_rounded_card(base, [80, 180, 1000, 310], fill=(0, 0, 0, 200), outline=(56, 189, 248, 220), radius=20, width=2)
            d = ImageDraw.Draw(base)
            d.text((110, 205), "WAIT... Did you hear about this?! 😱", font=get_font(42, bold=True), fill=(255, 255, 255))
            d.text((110, 260), "A full AI ERP & CRM platform for $1/month?!", font=get_font(28, bold=True), fill=(0, 240, 215))

            # Floating Offer Sticker
            bounce = abs(math.sin(t * 4)) * 10
            base = draw_rounded_card(base, [100, int(1350 - bounce), 980, int(1520 - bounce)], fill=(15, 23, 42, 240), outline=(234, 179, 8, 240), radius=24, width=3)
            d = ImageDraw.Draw(base)
            d.text((140, int(1375 - bounce)), "🔥 EARLY BIRD STANDARD PLAN", font=get_font(26, bold=True), fill=(253, 224, 71))
            d.text((140, int(1420 - bounce)), "$1 / Mo on Annual  •  $5 / Mo Monthly", font=get_font(38, bold=True), fill=(255, 255, 255))
            d.text((140, int(1475 - bounce)), "Standard Plan Only (Code: EARLYBIRD1)", font=get_font(22, bold=False), fill=(52, 211, 153))

        elif t < 7.0:
            # Middle Scene: In-App Demo Showcase
            base = Image.new("RGBA", (W, H), (15, 18, 30))
            d_bg = ImageDraw.Draw(base)
            for y in range(H):
                factor = y / H
                d_bg.line([(0, y), (W, y)], fill=(int(12*(1-factor)+20*factor), int(16*(1-factor)+28*factor), int(32*(1-factor)+50*factor), 255))
            
            # Subtle ambient glow
            g = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            ImageDraw.Draw(g).ellipse([200, 200, 880, 880], fill=(0, 220, 190, 35))
            base = Image.alpha_composite(base, g)

            # Top influencer pip avatar in corner
            pip = img_f1.resize((260, 260), Image.Resampling.LANCZOS)
            pip_mask = Image.new("L", (260, 260), 0)
            ImageDraw.Draw(pip_mask).ellipse([0, 0, 260, 260], fill=255)
            base.paste(pip, (80, 80), pip_mask)
            
            pip_border = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            ImageDraw.Draw(pip_border).ellipse([80, 80, 340, 340], outline=(0, 240, 215, 255), width=4)
            base = Image.alpha_composite(base, pip_border)

            d = ImageDraw.Draw(base)
            d.text((370, 110), "@tech_influencer", font=get_font(28, bold=True), fill=(255, 255, 255))
            d.text((370, 155), "\"Look at this interface! 3-sec invoice scanning,\"", font=get_font(22, bold=False), fill=(203, 213, 225))
            d.text((370, 190), "\"Accounting, CRM, and Stock in 1 workspace!\"", font=get_font(22, bold=True), fill=(0, 240, 215))

            # UI Screenshot Preview
            if crm_img:
                base.paste(crm_img, (70, 420), crm_mask)
                crm_border = Image.new("RGBA", (W, H), (0, 0, 0, 0))
                ImageDraw.Draw(crm_border).rounded_rectangle([70, 420, 1010, 940], radius=24, outline=(0, 240, 215, 220), width=3)
                base = Image.alpha_composite(base, crm_border)

            # Big Highlighted Pricing Box
            base = draw_rounded_card(base, [70, 1000, 1010, 1520], fill=(18, 22, 42, 245), outline=(234, 179, 8, 240), radius=24, width=3)
            d = ImageDraw.Draw(base)
            d.text((110, 1030), "⚡ BERAXIS STANDARD PLAN EARLY BIRD", font=get_font(28, bold=True), fill=(253, 224, 71))
            
            # Annual Option
            base = draw_rounded_card(base, [110, 1080, 970, 1260], fill=(0, 160, 157, 40), outline=(0, 240, 215, 220), radius=16, width=2)
            d = ImageDraw.Draw(base)
            d.text((140, 1105), "🏆 ANNUAL PLAN (BEST VALUE)", font=get_font(22, bold=True), fill=(0, 240, 215))
            d.text((140, 1145), "$1 / MONTH", font=get_font(52, bold=True), fill=(255, 255, 255))
            d.text((440, 1170), "billed annually ($12/year total!)", font=get_font(22, bold=False), fill=(203, 213, 225))
            d.text((140, 1215), "✓ Full Standard Multi-App Access", font=get_font(18, bold=True), fill=(52, 211, 153))

            # Monthly Option
            base = draw_rounded_card(base, [110, 1290, 970, 1470], fill=(192, 132, 252, 35), outline=(192, 132, 252, 220), radius=16, width=2)
            d = ImageDraw.Draw(base)
            d.text((140, 1315), "📅 MONTHLY PLAN (FLEXIBLE)", font=get_font(22, bold=True), fill=(192, 132, 252))
            d.text((140, 1355), "$5 / MONTH", font=get_font(52, bold=True), fill=(255, 255, 255))
            d.text((440, 1380), "month-to-month, cancel anytime", font=get_font(22, bold=False), fill=(203, 213, 225))
            d.text((140, 1425), "✓ Standard Plan Early Bird Rate", font=get_font(18, bold=True), fill=(224, 231, 255))

            # Bottom CTA
            base = draw_rounded_card(base, [70, 1580, 1010, 1710], fill=(0, 220, 190, 255), radius=20)
            d = ImageDraw.Draw(base)
            d.text((180, 1625), "Grab Early Bird at www.beraxis.online ➔", font=get_font(30, bold=True), fill=(15, 20, 30))

        else:
            # End Scene: Influencer Shocked Reaction ($1 Deal!)
            base = img_f2.copy()
            
            # Big Upper Overlay
            base = draw_rounded_card(base, [70, 120, 1010, 340], fill=(0, 0, 0, 210), outline=(234, 179, 8, 240), radius=24, width=3)
            d = ImageDraw.Draw(base)
            d.text((105, 145), "🤯 RUN AN ENTIRE BUSINESS FOR $1/MO?", font=get_font(34, bold=True), fill=(253, 224, 71))
            d.text((105, 200), "• Annual: $1/mo (Save 90%!)", font=get_font(30, bold=True), fill=(255, 255, 255))
            d.text((105, 245), "• Monthly: $5/mo (Standard Plan)", font=get_font(30, bold=True), fill=(0, 240, 215))
            d.text((105, 290), "Use Promo Code:  EARLYBIRD1", font=get_font(24, bold=True), fill=(52, 211, 153))

            # Bottom CTA Callout with Pulsing button
            pulse = abs(math.sin(t * 4))
            glow_col = int(200 + 55 * pulse)
            base = draw_rounded_card(base, [70, 1580, 1010, 1720], fill=(0, glow_col, int(glow_col * 0.85), 255), radius=22)
            d = ImageDraw.Draw(base)
            d.text((180, 1625), "Lock In $1/Mo Rate at Beraxis.online ➔", font=get_font(30, bold=True), fill=(11, 15, 25))

            d.text((360, 1780), "Link in Bio • Early Bird Only", font=get_font(24, bold=False), fill=(255, 255, 255))

        frames.append(np.array(base.convert("RGB")))

    mp4_web = os.path.join(OUTPUT_DIR_WEB, "female_influencer_ad_1dollar.mp4")
    mp4_art = os.path.join(OUTPUT_DIR_ARTIFACT, "female_influencer_ad_1dollar.mp4")
    
    imageio.mimwrite(mp4_web, frames, fps=fps, quality=9, macro_block_size=1)
    shutil.copyfile(mp4_web, mp4_art)
    print(f"Generated {mp4_web}")

    # Generate lightweight animated preview GIF
    print("Generating animated preview GIF...")
    gif_web = os.path.join(OUTPUT_DIR_WEB, "female_influencer_ad_1dollar.gif")
    gif_art = os.path.join(OUTPUT_DIR_ARTIFACT, "female_influencer_ad_1dollar.gif")
    gif_frames = []
    reader = imageio.get_reader(mp4_web)
    for idx, f in enumerate(reader):
        if idx % 5 == 0:
            gif_frames.append(Image.fromarray(f).resize((380, 675), Image.Resampling.LANCZOS))
    reader.close()
    if gif_frames:
        gif_frames[0].save(gif_web, save_all=True, append_images=gif_frames[1:], duration=200, loop=0, optimize=True)
        shutil.copyfile(gif_web, gif_art)
        print(f"Saved: {gif_web}")

if __name__ == "__main__":
    render_influencer_video_ad()
    print("Influencer video ad completed successfully!")
