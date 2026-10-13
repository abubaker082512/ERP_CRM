import os
import shutil
import subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import imageio
import imageio_ffmpeg

OUTPUT_DIR_WEB = "D:/ERP_CRM/public/social_media_assets"
OUTPUT_DIR_ARTIFACT = "C:/Users/abuba/.gemini/antigravity/brain/febec71c-e080-4e9d-8c20-15a11a352971/social_posts"
SCRATCH_DIR = "D:/ERP_CRM/scratch/live_demo_production"

os.makedirs(OUTPUT_DIR_WEB, exist_ok=True)
os.makedirs(OUTPUT_DIR_ARTIFACT, exist_ok=True)

FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()

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

def draw_rounded_card(base, rect, fill, outline=None, width=1, radius=20):
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    d.rounded_rectangle(rect, radius=radius, fill=fill, outline=outline, width=width)
    return Image.alpha_composite(base, overlay)

# Subtitle & HUD Cue Schedule across 55 seconds
CUES = [
    # 0.0s - 7.5s: Hook
    (0.0, 7.5, "⚡ BERAXIS AI • PLATFORM DEMO", "STILL RUNNING ON 5 DISCONNECTED TOOLS?", "One intelligent platform for all business operations."),
    # 7.5s - 15.0s: Setup
    (7.5, 15.0, "🚀 30-SECOND WORKSPACE PROVISIONING", "SET UP YOUR COMPANY IN 30 SECONDS", "Chart of Accounts, General Ledger & Executive Dashboard live."),
    # 15.0s - 23.5s: Leads Pool
    (15.0, 23.5, "🎯 MODULE: AI LEAD POOL", "INBOUND LEAD POOL & SCORING", "Automated lead prioritization and instant sales rep assignment."),
    # 23.5s - 32.5s: CRM
    (23.5, 32.5, "🤝 MODULE: VISUAL CRM PIPELINE", "FROM QUALIFIED LEAD TO SIGNED QUOTATION", "Interactive Kanban stages with instant e-signatures."),
    # 32.5s - 41.5s: Accounting & Inventory
    (32.5, 41.5, "📊 MODULE: CLOUD ERP & INVENTORY", "ACCOUNTING, INVOICES & WAREHOUSES", "Automated journal entries and multi-warehouse stock tracking."),
    # 41.5s - 50.5s: Pricing
    (41.5, 50.5, "🔥 EARLY-BIRD STANDARD PLAN DEALS", "STANDARD PLAN: $1/MO ANNUAL • $5/MO MONTHLY", "$1/mo on Annual ($12/yr total) | 1 App 100% Free Forever."),
    # 50.5s - 55.0s: CTA
    (50.5, 55.0, "🌐 VISIT WWW.BERAXIS.ONLINE", "STOP JUGGLING TOOLS. RUN SMARTER.", "Lock in your Early-Bird rate today at www.beraxis.online")
]

def get_cue_for_time(t):
    for start, end, hud_title, sub_title, sub_desc in CUES:
        if start <= t < end:
            return hud_title, sub_title, sub_desc
    return CUES[-1][2], CUES[-1][3], CUES[-1][4]

def assemble_demos():
    raw_recordings = [f for f in os.listdir(os.path.join(SCRATCH_DIR, "raw_recordings")) if f.endswith(".webm")]
    if not raw_recordings:
        print("No raw recordings found!")
        return
    
    raw_video_path = os.path.join(SCRATCH_DIR, "raw_recordings", raw_recordings[-1])
    soundtrack_path = os.path.join(SCRATCH_DIR, "live_demo_soundtrack_55s.wav")
    
    print(f"Reading raw browser recording: {raw_video_path}")
    reader = imageio.get_reader(raw_video_path)
    fps = 25
    total_frames = 55 * fps # Exactly 55 seconds (1375 frames)

    # Temporary intermediate video files
    temp_16x9_video = os.path.join(SCRATCH_DIR, "temp_16x9.mp4")
    temp_9x16_video = os.path.join(SCRATCH_DIR, "temp_9x16.mp4")

    final_16x9_path = os.path.join(OUTPUT_DIR_WEB, "beraxis_live_product_demo_16x9.mp4")
    final_9x16_path = os.path.join(OUTPUT_DIR_WEB, "beraxis_live_product_demo_9x16.mp4")
    
    art_16x9_path = os.path.join(OUTPUT_DIR_ARTIFACT, "beraxis_live_product_demo_16x9.mp4")
    art_9x16_path = os.path.join(OUTPUT_DIR_ARTIFACT, "beraxis_live_product_demo_9x16.mp4")

    writer_16x9 = imageio.get_writer(temp_16x9_video, fps=fps, codec='libx264', quality=9, pixelformat='yuv420p', macro_block_size=1)
    writer_9x16 = imageio.get_writer(temp_9x16_video, fps=fps, codec='libx264', quality=9, pixelformat='yuv420p', macro_block_size=1)

    # Logo
    logo = None
    if os.path.exists("D:/ERP_CRM/public/logo2.png"):
        logo = Image.open("D:/ERP_CRM/public/logo2.png").convert("RGBA")
        logo.thumbnail((260, 65), Image.Resampling.LANCZOS)

    # Preload video frames from reader
    print("Preloading and conforming recorded frames...")
    source_frames = []
    for f in reader:
        source_frames.append(f)
    reader.close()

    total_source = len(source_frames)
    print(f"Total source frames captured: {total_source}. Conforming to {total_frames} target frames...")

    for i in range(total_frames):
        t = i / fps
        # Map target frame to source frame smoothly
        src_idx = min(int((i / total_frames) * total_source), total_source - 1)
        raw_frame = Image.fromarray(source_frames[src_idx]).convert("RGBA")

        hud_title, sub_title, sub_desc = get_cue_for_time(t)

        # ----------------------------------------------------
        # 1. PROCESS 16:9 LANDSCAPE (1920 x 1080)
        # ----------------------------------------------------
        f_16x9 = raw_frame.resize((1920, 1080), Image.Resampling.LANCZOS)
        
        # Top HUD Banner (16:9)
        f_16x9 = draw_rounded_card(f_16x9, [40, 30, 680, 85], fill=(15, 23, 42, 230), outline=(0, 240, 215, 220), radius=12, width=2)
        d1 = ImageDraw.Draw(f_16x9)
        d1.text((60, 44), hud_title, font=get_font(20, bold=True), fill=(0, 240, 215))

        # Bottom Subtitle Card (16:9)
        f_16x9 = draw_rounded_card(f_16x9, [360, 930, 1560, 1040], fill=(12, 18, 32, 235), outline=(56, 189, 248, 200), radius=16, width=2)
        d1 = ImageDraw.Draw(f_16x9)
        d1.text((390, 946), sub_title, font=get_font(24, bold=True), fill=(253, 224, 71))
        d1.text((390, 988), sub_desc, font=get_font(20, bold=False), fill=(255, 255, 255))

        writer_16x9.append_data(np.array(f_16x9.convert("RGB")))

        # ----------------------------------------------------
        # 2. PROCESS 9:16 VERTICAL (1080 x 1920)
        # ----------------------------------------------------
        f_9x16 = Image.new("RGBA", (1080, 1920), (12, 18, 30))
        d_bg = ImageDraw.Draw(f_9x16)
        for y in range(1920):
            f_grad = y / 1920
            d_bg.line([(0, y), (1080, y)], fill=(int(10*(1-f_grad)+20*f_grad), int(15*(1-f_grad)+28*f_grad), int(34*(1-f_grad)+52*f_grad), 255))

        # Top Header Bar in 9:16
        if logo:
            f_9x16.paste(logo, (60, 70), logo)
            
        f_9x16 = draw_rounded_card(f_9x16, [600, 75, 1020, 130], fill=(0, 240, 215, 35), outline=(0, 240, 215, 220), radius=12, width=2)
        d2 = ImageDraw.Draw(f_9x16)
        d2.text((630, 88), "LIVE PRODUCT DEMO", font=get_font(18, bold=True), fill=(0, 240, 215))

        # Top HUD Text
        f_9x16 = draw_rounded_card(f_9x16, [60, 180, 1020, 310], fill=(15, 23, 42, 230), outline=(56, 189, 248, 220), radius=18, width=2)
        d2 = ImageDraw.Draw(f_9x16)
        d2.text((90, 205), hud_title, font=get_font(24, bold=True), fill=(0, 240, 215))
        d2.text((90, 250), sub_title, font=get_font(28, bold=True), fill=(255, 255, 255))

        # Center Video Inset (Clean 16:9 crop scaled to fit 9:16 phone width)
        scaled_browser = raw_frame.resize((960, 540), Image.Resampling.LANCZOS)
        mask_9x16 = Image.new("L", (960, 540), 0)
        ImageDraw.Draw(mask_9x16).rounded_rectangle([0, 0, 960, 540], radius=22, fill=255)
        
        f_9x16.paste(scaled_browser, (60, 360), mask_9x16)
        border_box = Image.new("RGBA", (1080, 1920), (0, 0, 0, 0))
        ImageDraw.Draw(border_box).rounded_rectangle([60, 360, 1020, 900], radius=22, outline=(0, 240, 215, 240), width=3)
        f_9x16 = Image.alpha_composite(f_9x16, border_box)

        # Bottom Feature & Pricing Showcase Cards in 9:16
        f_9x16 = draw_rounded_card(f_9x16, [60, 950, 1020, 1500], fill=(16, 24, 46, 245), outline=(234, 179, 8, 230), radius=22, width=3)
        d2 = ImageDraw.Draw(f_9x16)
        d2.text((95, 980), "⚡ BERAXIS OPERATIONS IN ACTION:", font=get_font(26, bold=True), fill=(253, 224, 71))
        d2.text((95, 1035), "✓ 30-Second Company Setup & Ledger Provisioning", font=get_font(22, bold=False), fill=(255, 255, 255))
        d2.text((95, 1085), "✓ Inbound AI Lead Pool & Automated Lead Scoring", font=get_font(22, bold=False), fill=(255, 255, 255))
        d2.text((95, 1135), "✓ Visual CRM Pipeline (Lead to Signed Quotation)", font=get_font(22, bold=False), fill=(255, 255, 255))
        d2.text((95, 1185), "✓ Cloud ERP Accounting & Automated General Ledger", font=get_font(22, bold=False), fill=(255, 255, 255))
        d2.text((95, 1235), "✓ Multi-Warehouse Stock & Reorder Alerts", font=get_font(22, bold=False), fill=(52, 211, 153))

        d2.line([(95, 1290), (985, 1290)], fill=(56, 189, 248, 120), width=2)
        d2.text((95, 1320), "🏆 EARLY BIRD: $1/MO (ANNUAL) • $5/MO (MONTHLY)", font=get_font(26, bold=True), fill=(0, 240, 215))
        d2.text((95, 1370), "Standard Plan Only (Code: EARLYBIRD1) | 1 App Free Forever", font=get_font(20, bold=False), fill=(203, 213, 225))
        d2.text((95, 1420), sub_desc, font=get_font(20, bold=True), fill=(253, 224, 71))

        # Bottom Big Action CTA in 9:16
        f_9x16 = draw_rounded_card(f_9x16, [60, 1560, 1020, 1700], fill=(0, 220, 190, 255), radius=20)
        d2 = ImageDraw.Draw(f_9x16)
        d2.text((180, 1605), "Lock In $1/Mo Rate at Beraxis.online ➔", font=get_font(28, bold=True), fill=(11, 15, 25))

        d2.text((360, 1760), "🌐 www.beraxis.online", font=get_font(28, bold=True), fill=(255, 255, 255))
        d2.text((400, 1810), "Tap link in bio to start", font=get_font(22, bold=False), fill=(148, 163, 184))

        writer_9x16.append_data(np.array(f_9x16.convert("RGB")))

    writer_16x9.close()
    writer_9x16.close()
    print("Both video frame streams completed. Now muxing audio with FFmpeg...")

    # Mux Audio for 16:9
    cmd_16x9 = [
        FFMPEG_EXE, "-y",
        "-i", temp_16x9_video,
        "-i", soundtrack_path,
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        final_16x9_path
    ]
    subprocess.run(cmd_16x9, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    shutil.copyfile(final_16x9_path, art_16x9_path)
    print(f"Generated 16:9 Landscape Video: {final_16x9_path}")

    # Mux Audio for 9:16
    cmd_9x16 = [
        FFMPEG_EXE, "-y",
        "-i", temp_9x16_video,
        "-i", soundtrack_path,
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        final_9x16_path
    ]
    subprocess.run(cmd_9x16, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    shutil.copyfile(final_9x16_path, art_9x16_path)
    print(f"Generated 9:16 Vertical Video: {final_9x16_path}")

    # Generate lightweight animated preview GIF from 16:9
    print("Generating animated preview GIF...")
    gif_path = os.path.join(OUTPUT_DIR_WEB, "beraxis_live_product_demo_preview.gif")
    art_gif_path = os.path.join(OUTPUT_DIR_ARTIFACT, "beraxis_live_product_demo_preview.gif")

    reader_gif = imageio.get_reader(final_16x9_path)
    gif_frames = []
    for idx, frame in enumerate(reader_gif):
        if idx % 15 == 0: # Sample every 15th frame
            img = Image.fromarray(frame).resize((480, 270), Image.Resampling.LANCZOS)
            gif_frames.append(img)
    reader_gif.close()

    if gif_frames:
        gif_frames[0].save(gif_path, save_all=True, append_images=gif_frames[1:], duration=220, loop=0, optimize=True)
        shutil.copyfile(gif_path, art_gif_path)
        print(f"Saved animated preview GIF: {gif_path}")

if __name__ == "__main__":
    assemble_demos()
    print("All live demonstration deliverables produced successfully!")
