import os
import shutil
import math
import subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from gtts import gTTS
import imageio
import imageio_ffmpeg
from scipy.io import wavfile

OUTPUT_DIR_WEB = "D:/ERP_CRM/public/social_media_assets"
OUTPUT_DIR_ARTIFACT = "C:/Users/abuba/.gemini/antigravity/brain/febec71c-e080-4e9d-8c20-15a11a352971/social_posts"
SCRATCH_DIR = "D:/ERP_CRM/scratch/commercial_32s"
os.makedirs(OUTPUT_DIR_WEB, exist_ok=True)
os.makedirs(OUTPUT_DIR_ARTIFACT, exist_ok=True)
os.makedirs(SCRATCH_DIR, exist_ok=True)

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

def draw_rounded_card(base, rect, fill, outline=None, width=1, radius=24):
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    d.rounded_rectangle(rect, radius=radius, fill=fill, outline=outline, width=width)
    return Image.alpha_composite(base, overlay)

# EXACT SCRIPT SPECS (Total Duration: 32.5 Seconds)
VOICEOVER_CUES = [
    ("Still running your business on five disconnected tools?", 0.0, 4.0),
    ("Meet Beraxis AI — your business operations, connected in one intelligent platform.", 4.0, 8.5),
    ("Manage leads and sales. Handle accounting, invoicing, and multi-warehouse inventory.", 8.5, 13.5),
    ("Scan invoices and receipts in seconds with AI.", 13.5, 18.0),
    ("And now, our early-bird Standard Plan starts at just one dollar per month, billed annually at twelve dollars per year.", 18.0, 24.0),
    ("Prefer monthly? Just five dollars a month.", 24.0, 27.0),
    ("Need only one app? Start free, with no credit card required.", 27.0, 29.5),
    ("Stop juggling tools. Start running smarter. Visit Beraxis dot online today.", 29.5, 32.5)
]

def synthesize_audio():
    print("Synthesizing voiceover cues with gTTS...")
    sr = 44100
    duration = 32.5
    total_samples = int(duration * sr)
    full_voice = np.zeros(total_samples, dtype=np.float32)

    for idx, (text, start_sec, end_sec) in enumerate(VOICEOVER_CUES):
        mp3_path = os.path.join(SCRATCH_DIR, f"cue_{idx}.mp3")
        wav_path = os.path.join(SCRATCH_DIR, f"cue_{idx}.wav")
        tts = gTTS(text, lang='en', tld='com')
        tts.save(mp3_path)
        
        cmd = [FFMPEG_EXE, "-y", "-i", mp3_path, "-ar", str(sr), "-ac", "1", wav_path]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        _, data = wavfile.read(wav_path)
        data = data.astype(np.float32) / 32768.0
        
        start_idx = int(start_sec * sr)
        copy_len = min(len(data), total_samples - start_idx)
        if copy_len > 0:
            full_voice[start_idx:start_idx + copy_len] += data[:copy_len]

    max_v = np.max(np.abs(full_voice))
    if max_v > 0:
        full_voice = full_voice / max_v

    print("Generating corporate electronic soundtrack...")
    t = np.linspace(0, duration, total_samples, False)
    bpm = 114
    beat_len = 60.0 / bpm
    bar_len = beat_len * 4

    bg_music = np.zeros(total_samples, dtype=np.float32)
    for b in range(int(duration / beat_len)):
        beat_time = b * beat_len
        idx = int(beat_time * sr)
        if b % 2 == 0:
            k_len = int(0.18 * sr)
            if idx + k_len < total_samples:
                kt = np.linspace(0, 0.18, k_len, False)
                kick = np.sin(2 * np.pi * (140 * np.exp(-18 * kt)) * kt) * np.exp(-8 * kt)
                bg_music[idx:idx+k_len] += kick * 0.40
        else:
            s_len = int(0.14 * sr)
            if idx + s_len < total_samples:
                st = np.linspace(0, 0.14, s_len, False)
                snare = np.random.uniform(-1, 1, s_len) * np.exp(-20 * st)
                bg_music[idx:idx+s_len] += snare * 0.22

    # Chords
    chords = [
        [220.0, 261.63, 329.63], # Am
        [174.61, 220.0, 261.63], # F
        [130.81, 164.81, 196.0], # C
        [196.0, 246.94, 293.66]  # G
    ]
    for bar in range(int(duration / bar_len)):
        chord = chords[bar % len(chords)]
        for note in chord:
            pad = np.sin(2 * np.pi * note * t) * 0.065
            pad *= (0.7 + 0.3 * np.sin(2 * np.pi * 3.5 * t))
            bg_music += pad

    mixed = (full_voice * 0.88) + (bg_music * 0.18)
    mixed = mixed / np.max(np.abs(mixed) + 1e-6)
    final_audio = (mixed * 30000).astype(np.int16)

    out_audio_path = os.path.join(SCRATCH_DIR, "master_soundtrack_32s.wav")
    wavfile.write(out_audio_path, sr, final_audio)
    return out_audio_path

def build_commercial():
    audio_path = synthesize_audio()

    W, H = 1080, 1920
    fps = 24
    duration = 32.5
    total_frames = int(fps * duration)

    # 1. Load Real Screenshots from D:\ERP_CRM\BERAXIS Screenshots
    sc_dir = r"D:\ERP_CRM\BERAXIS Screenshots"
    leads_pool_raw = Image.open(os.path.join(sc_dir, "Leads Pool Tab.png")).convert("RGBA")
    onboard1_raw = Image.open(os.path.join(sc_dir, "Onboarding 1.png")).convert("RGBA")
    onboard2_raw = Image.open(os.path.join(sc_dir, "Onboarding 2 (Dashboard).png")).convert("RGBA")
    home_raw = Image.open(os.path.join(sc_dir, "Home.png")).convert("RGBA")

    # Crop hero regions from real screenshots (all strictly 940x530)
    target_w, target_h = 940, 530
    leads_crop = leads_pool_raw.crop((0, 0, 1920, 1080)).resize((target_w, target_h), Image.Resampling.LANCZOS)
    onboard1_crop = onboard1_raw.crop((0, 0, 1919, 946)).resize((target_w, target_h), Image.Resampling.LANCZOS)
    onboard2_crop = onboard2_raw.crop((0, 0, 1919, 941)).resize((target_w, target_h), Image.Resampling.LANCZOS)
    home_crop = home_raw.crop((0, 0, 1920, 1080)).resize((target_w, target_h), Image.Resampling.LANCZOS)

    # Pre-render rounded masks for screenshots
    ui_mask = Image.new("L", (target_w, target_h), 0)
    ImageDraw.Draw(ui_mask).rounded_rectangle([0, 0, target_w, target_h], radius=22, fill=255)

    # Also load the cinematic frames
    scene1_hook = Image.open(os.path.join(OUTPUT_DIR_WEB, "scene1_overwhelmed_founder.jpg")).convert("RGBA").resize((W, H), Image.Resampling.LANCZOS)
    scene5_scan = Image.open(os.path.join(OUTPUT_DIR_WEB, "scene5_ai_receipt_scan.jpg")).convert("RGBA").resize((W, H), Image.Resampling.LANCZOS)

    # Official Logo
    logo = None
    if os.path.exists("D:/ERP_CRM/public/logo2.png"):
        logo = Image.open("D:/ERP_CRM/public/logo2.png").convert("RGBA")
        logo.thumbnail((280, 75), Image.Resampling.LANCZOS)

    raw_video = os.path.join(SCRATCH_DIR, "raw_commercial_32s.mp4")
    final_video = os.path.join(OUTPUT_DIR_WEB, "beraxis_master_commercial_32s.mp4")
    artifact_video = os.path.join(OUTPUT_DIR_ARTIFACT, "beraxis_master_commercial_32s.mp4")

    print(f"Generating {total_frames} frames for Master Commercial Video...")
    writer = imageio.get_writer(raw_video, fps=fps, codec='libx264', quality=9, pixelformat='yuv420p', macro_block_size=1)

    for i in range(total_frames):
        t = i / fps

        # ==========================================
        # SCENE 1: (0.0s - 4.0s) THE HOOK
        # ==========================================
        if t < 4.0:
            frame = scene1_hook.copy()
            # Top Notification Banner with red pulsing alert
            pulse_r = abs(math.sin(t * 5))
            frame = draw_rounded_card(frame, [70, 150, 1010, 320], fill=(15, 10, 20, 225), outline=(244, 63, 94, int(180 + 75 * pulse_r)), radius=22, width=3)
            d = ImageDraw.Draw(frame)
            d.text((105, 175), "⚠️ SUBSCRIPTION OVERLOAD", font=get_font(24, bold=True), fill=(244, 63, 94))
            d.text((105, 215), "STILL RUNNING YOUR BUSINESS", font=get_font(42, bold=True), fill=(255, 255, 255))
            d.text((105, 265), "ON 5 DISCONNECTED TOOLS?", font=get_font(42, bold=True), fill=(253, 224, 71))

            # Bottom Floating Pill
            frame = draw_rounded_card(frame, [80, 1480, 1000, 1590], fill=(0, 0, 0, 210), outline=(56, 189, 248, 200), radius=18)
            d = ImageDraw.Draw(frame)
            d.text((115, 1505), "QuickBooks • HubSpot • Inventory • OCR • Spreadsheets", font=get_font(24, bold=False), fill=(203, 213, 225))
            d.text((115, 1545), "❌ Constant sync errors & hours of manual double-entry", font=get_font(20, bold=True), fill=(244, 63, 94))

        # ==========================================
        # SCENE 2: (4.0s - 8.5s) THE TRANSFORMATION (30s Onboarding Setup)
        # ==========================================
        elif t < 8.5:
            frame = Image.new("RGBA", (W, H), (14, 20, 34))
            d_bg = ImageDraw.Draw(frame)
            for y in range(H):
                f = y / H
                d_bg.line([(0, y), (W, y)], fill=(int(12*(1-f)+22*f), int(18*(1-f)+30*f), int(38*(1-f)+56*f), 255))
            
            # Glowing transformation beam
            g = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            ImageDraw.Draw(g).ellipse([200, 120, 880, 800], fill=(0, 220, 190, 45))
            frame = Image.alpha_composite(frame, g)

            # Logo & Brand Reveal
            if logo:
                frame.paste(logo, (80, 80), logo)

            frame = draw_rounded_card(frame, [720, 80, 1000, 140], fill=(0, 220, 190, 40), outline=(0, 220, 190, 220), radius=14, width=2)
            d = ImageDraw.Draw(frame)
            d.text((750, 95), "✨ UNIFIED AI", font=get_font(20, bold=True), fill=(0, 240, 215))

            d.text((80, 190), "MEET BERAXIS AI", font=get_font(64, bold=True), fill=(255, 255, 255))
            d.text((80, 265), "YOUR BUSINESS. ONE INTELLIGENT PLATFORM.", font=get_font(26, bold=True), fill=(0, 240, 215))
            d.text((80, 310), "Set up your entire company in 30 seconds flat.", font=get_font(22, bold=False), fill=(203, 213, 225))

            # Real Screenshot: Onboarding 1 Setup Screen
            frame.paste(onboard1_crop, (70, 380), ui_mask)
            b = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            ImageDraw.Draw(b).rounded_rectangle([70, 380, 1010, 910], radius=22, outline=(0, 240, 215, 220), width=3)
            frame = Image.alpha_composite(frame, b)

            # 30-Second Setup Live Progress Bar
            setup_t = min(1.0, (t - 4.0) / 4.0)
            frame = draw_rounded_card(frame, [70, 950, 1010, 1080], fill=(18, 26, 48, 245), outline=(56, 189, 248, 200), radius=18)
            d = ImageDraw.Draw(frame)
            d.text((105, 975), f"⚡ 30-Second Setup Complete: {int(setup_t * 100)}%", font=get_font(24, bold=True), fill=(255, 255, 255))
            d.rounded_rectangle([105, 1020, 975, 1050], radius=8, fill=(30, 40, 70))
            d.rounded_rectangle([105, 1020, int(105 + 870 * setup_t), 1050], radius=8, fill=(0, 240, 215))

            # Feature Cards
            frame = draw_rounded_card(frame, [70, 1120, 1010, 1480], fill=(16, 22, 40, 245), outline=(234, 179, 8, 220), radius=22)
            d = ImageDraw.Draw(frame)
            d.text((105, 1150), "🚀 Automatic Workspace Provisioning:", font=get_font(26, bold=True), fill=(253, 224, 71))
            d.text((105, 1205), "✓ Full Chart of Accounts & General Ledger", font=get_font(22, bold=False), fill=(255, 255, 255))
            d.text((105, 1255), "✓ Inbound Lead Pool & Sales Pipeline", font=get_font(22, bold=False), fill=(255, 255, 255))
            d.text((105, 1305), "✓ Multi-Warehouse Stock & Reorder Rules", font=get_font(22, bold=False), fill=(52, 211, 153))
            d.text((105, 1355), "✓ Automated Invoice & Tax Calculation Engine", font=get_font(22, bold=False), fill=(255, 255, 255))
            d.text((105, 1405), "✓ Real-Time Executive Dashboard", font=get_font(22, bold=True), fill=(0, 240, 215))

            # CTA
            frame = draw_rounded_card(frame, [70, 1550, 1010, 1670], fill=(0, 220, 190, 255), radius=20)
            d = ImageDraw.Draw(frame)
            d.text((220, 1592), "Start 30-Sec Setup at Beraxis.online ➔", font=get_font(28, bold=True), fill=(11, 15, 25))

        # ==========================================
        # SCENE 3: (8.5s - 13.5s) AI LEADS AND CRM (Real Leads Pool Screenshot)
        # ==========================================
        elif t < 13.5:
            frame = Image.new("RGBA", (W, H), (14, 20, 34))
            d_bg = ImageDraw.Draw(frame)
            for y in range(H):
                f = y / H
                d_bg.line([(0, y), (W, y)], fill=(int(14*(1-f)+24*f), int(16*(1-f)+24*f), int(42*(1-f)+54*f), 255))

            # Ambient glow
            g = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            ImageDraw.Draw(g).ellipse([250, 250, 850, 850], fill=(192, 132, 252, 40))
            frame = Image.alpha_composite(frame, g)

            d = ImageDraw.Draw(frame)
            d.text((70, 110), "AI LEAD SCORING + SMART CRM", font=get_font(30, bold=True), fill=(192, 132, 252))
            d.text((70, 155), "FROM LEAD TO SIGNED QUOTATION", font=get_font(44, bold=True), fill=(255, 255, 255))
            d.text((70, 215), "Real-time inbound lead pool with automated status progression.", font=get_font(24, bold=False), fill=(203, 213, 225))

            # REAL SCREENSHOT: D:\ERP_CRM\BERAXIS Screenshots\Leads Pool Tab.png
            frame.paste(leads_crop, (70, 290), ui_mask)
            b = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            ImageDraw.Draw(b).rounded_rectangle([70, 290, 1010, 820], radius=22, outline=(192, 132, 252, 220), width=3)
            frame = Image.alpha_composite(frame, b)

            # HUD Live Lead Status Pill
            frame = draw_rounded_card(frame, [110, 750, 970, 805], fill=(15, 23, 42, 240), outline=(0, 240, 215, 220), radius=12, width=2)
            d = ImageDraw.Draw(frame)
            d.text((135, 765), "✓ LIVE LEAD POOL: AUTOMATIC LEAD ASSIGNMENT ACTIVE", font=get_font(20, bold=True), fill=(0, 240, 215))

            # 3 Operational Value Cards
            cards_y = 860
            frame = draw_rounded_card(frame, [70, cards_y, 1010, cards_y + 160], fill=(24, 18, 44, 240), outline=(192, 132, 252, 200), radius=18)
            d = ImageDraw.Draw(frame)
            d.text((105, cards_y + 20), "🎯 CENTRALIZED LEAD POOL", font=get_font(24, bold=True), fill=(192, 132, 252))
            d.text((105, cards_y + 60), "Automatically gathers inquiries from web forms, WhatsApp & ads.", font=get_font(20, bold=False), fill=(255, 255, 255))
            d.text((105, cards_y + 95), "Scores prospects based on deal value and conversion likelihood.", font=get_font(18, bold=False), fill=(203, 213, 225))

            c2_y = cards_y + 185
            frame = draw_rounded_card(frame, [70, c2_y, 1010, c2_y + 160], fill=(18, 28, 48, 240), outline=(56, 189, 248, 200), radius=18)
            d = ImageDraw.Draw(frame)
            d.text((105, c2_y + 20), "🤝 VISUAL SALES PIPELINE", font=get_font(24, bold=True), fill=(56, 189, 248))
            d.text((105, c2_y + 60), "Move deals effortlessly across Kanban stages with drag-and-drop.", font=get_font(20, bold=False), fill=(255, 255, 255))
            d.text((105, c2_y + 95), "1-Click conversion from qualified lead to legally binding quotation.", font=get_font(18, bold=False), fill=(203, 213, 225))

            c3_y = c2_y + 185
            frame = draw_rounded_card(frame, [70, c3_y, 1010, c3_y + 160], fill=(16, 32, 38, 240), outline=(0, 240, 215, 200), radius=18)
            d = ImageDraw.Draw(frame)
            d.text((105, c3_y + 20), "⚡ INSTANT E-SIGNATURES & QUOTES", font=get_font(24, bold=True), fill=(0, 240, 215))
            d.text((105, c3_y + 60), "Clients sign digitally directly on mobile or web.", font=get_font(20, bold=False), fill=(255, 255, 255))
            d.text((105, c3_y + 95), "Automatically generates balanced sales invoices in your ledger.", font=get_font(18, bold=False), fill=(203, 213, 225))

            # Bottom CTA
            frame = draw_rounded_card(frame, [70, 1600, 1010, 1720], fill=(0, 220, 190, 255), radius=20)
            d = ImageDraw.Draw(frame)
            d.text((230, 1642), "Explore Leads Pool at Beraxis.online ➔", font=get_font(28, bold=True), fill=(11, 15, 25))

        # ==========================================
        # SCENE 4: (13.5s - 18.0s) CLOUD ERP AND ACCOUNTING (Real Dashboard Screenshot)
        # ==========================================
        elif t < 18.0:
            frame = Image.new("RGBA", (W, H), (14, 20, 34))
            d_bg = ImageDraw.Draw(frame)
            for y in range(H):
                f = y / H
                d_bg.line([(0, y), (W, y)], fill=(int(12*(1-f)+20*f), int(18*(1-f)+28*f), int(36*(1-f)+52*f), 255))

            g = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            ImageDraw.Draw(g).ellipse([300, 300, 800, 800], fill=(56, 189, 248, 40))
            frame = Image.alpha_composite(frame, g)

            d = ImageDraw.Draw(frame)
            d.text((70, 110), "ACCOUNTING. INVOICING. INVENTORY.", font=get_font(30, bold=True), fill=(0, 240, 215))
            d.text((70, 155), "YOUR BUSINESS OPERATIONS, CONNECTED.", font=get_font(42, bold=True), fill=(255, 255, 255))
            d.text((70, 215), "Real-time P&L, balance sheets, and multi-warehouse stock.", font=get_font(24, bold=False), fill=(203, 213, 225))

            # REAL SCREENSHOT: D:\ERP_CRM\BERAXIS Screenshots\Onboarding 2 (Dashboard).png
            frame.paste(onboard2_crop, (70, 290), ui_mask)
            b = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            ImageDraw.Draw(b).rounded_rectangle([70, 290, 1010, 820], radius=22, outline=(56, 189, 248, 220), width=3)
            frame = Image.alpha_composite(frame, b)

            # 3 Module Value Props
            c_y = 860
            frame = draw_rounded_card(frame, [70, c_y, 1010, c_y + 160], fill=(18, 28, 48, 240), outline=(56, 189, 248, 200), radius=18)
            d = ImageDraw.Draw(frame)
            d.text((105, c_y + 20), "📊 AUTOMATED GENERAL LEDGER", font=get_font(24, bold=True), fill=(56, 189, 248))
            d.text((105, c_y + 60), "Every sale, purchase, and payment books automatically.", font=get_font(20, bold=False), fill=(255, 255, 255))
            d.text((105, c_y + 95), "Instant Profit & Loss, Balance Sheet, and VAT reports.", font=get_font(18, bold=False), fill=(203, 213, 225))

            c2_y = c_y + 185
            frame = draw_rounded_card(frame, [70, c2_y, 1010, c2_y + 160], fill=(16, 32, 38, 240), outline=(0, 240, 215, 200), radius=18)
            d = ImageDraw.Draw(frame)
            d.text((105, c2_y + 20), "📦 MULTI-WAREHOUSE INVENTORY", font=get_font(24, bold=True), fill=(0, 240, 215))
            d.text((105, c2_y + 60), "Track stock levels across unlimited branches and warehouses.", font=get_font(20, bold=False), fill=(255, 255, 255))
            d.text((105, c2_y + 95), "Automated low-stock alerts and purchase order generation.", font=get_font(18, bold=False), fill=(203, 213, 225))

            c3_y = c2_y + 185
            frame = draw_rounded_card(frame, [70, c3_y, 1010, c3_y + 160], fill=(24, 20, 48, 240), outline=(192, 132, 252, 200), radius=18)
            d = ImageDraw.Draw(frame)
            d.text((105, c3_y + 20), "💳 MULTI-CURRENCY PAYMENTS", font=get_font(24, bold=True), fill=(192, 132, 252))
            d.text((105, c3_y + 60), "Issue professional invoices with online payment links.", font=get_font(20, bold=False), fill=(255, 255, 255))
            d.text((105, c3_y + 95), "Automatic bank reconciliation with zero spreadsheets.", font=get_font(18, bold=False), fill=(203, 213, 225))

            # Bottom CTA
            frame = draw_rounded_card(frame, [70, 1600, 1010, 1720], fill=(0, 220, 190, 255), radius=20)
            d = ImageDraw.Draw(frame)
            d.text((250, 1642), "Run Connected Operations ➔", font=get_font(28, bold=True), fill=(11, 15, 25))

        # ==========================================
        # SCENE 5: (18.0s - 22.0s) AI INVOICE SCANNER (With 3-Second Countdown)
        # ==========================================
        elif t < 22.0:
            frame = scene5_scan.copy()
            # Top Banner
            frame = draw_rounded_card(frame, [70, 140, 1010, 290], fill=(0, 0, 0, 215), outline=(0, 240, 215, 240), radius=22, width=3)
            d = ImageDraw.Draw(frame)
            d.text((105, 165), "AI INVOICE & RECEIPT SCANNER", font=get_font(32, bold=True), fill=(0, 240, 215))
            d.text((105, 215), "FROM PAPER TO DIGITAL IN SECONDS", font=get_font(40, bold=True), fill=(255, 255, 255))

            # Floating 3-Second Countdown Overlay Box
            scan_remain = max(0.0, 3.0 - (t - 18.0))
            frame = draw_rounded_card(frame, [80, 1380, 1000, 1570], fill=(15, 23, 42, 245), outline=(234, 179, 8, 240), radius=22, width=3)
            d = ImageDraw.Draw(frame)
            d.text((115, 1410), "⚡ AI OCR SPEED: 03.0s GUARANTEED", font=get_font(26, bold=True), fill=(253, 224, 71))
            d.text((115, 1455), f"Processing: {scan_remain:.1f}s Remaining... 100% Tax Accuracy", font=get_font(24, bold=True), fill=(255, 255, 255))
            d.text((115, 1505), "Vendor, totals & line items posted directly to ledger.", font=get_font(20, bold=False), fill=(52, 211, 153))

            # Bottom CTA
            frame = draw_rounded_card(frame, [80, 1610, 1000, 1720], fill=(0, 220, 190, 255), radius=20)
            d = ImageDraw.Draw(frame)
            d.text((220, 1648), "Try AI Scanner at Beraxis.online ➔", font=get_font(28, bold=True), fill=(11, 15, 25))

        # ==========================================
        # SCENE 6: (22.0s - 29.0s) THE EARLY-BIRD OFFER ($1 Annual vs $5 Monthly)
        # ==========================================
        elif t < 29.0:
            frame = Image.new("RGBA", (W, H), (14, 20, 34))
            d_bg = ImageDraw.Draw(frame)
            for y in range(H):
                f = y / H
                d_bg.line([(0, y), (W, y)], fill=(int(12*(1-f)+22*f), int(16*(1-f)+28*f), int(40*(1-f)+56*f), 255))

            # Ambient glow
            g = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            ImageDraw.Draw(g).ellipse([250, 400, 850, 1000], fill=(234, 179, 8, 35))
            frame = Image.alpha_composite(frame, g)

            d = ImageDraw.Draw(frame)
            d.text((70, 95), "LIMITED TIME LAUNCH PRICING", font=get_font(26, bold=True), fill=(253, 224, 71))
            d.text((70, 135), "EARLY-BIRD OFFER", font=get_font(52, bold=True), fill=(255, 255, 255))
            d.text((70, 205), "STANDARD PLAN", font=get_font(34, bold=True), fill=(0, 240, 215))

            # CARD 1: $1 / MONTH ANNUAL PLAN (Primary Hero Offer)
            pulse_a = abs(math.sin(t * 3.5)) * 6
            frame = draw_rounded_card(frame, [70, int(270 - pulse_a), 1010, int(660 - pulse_a)], fill=(15, 28, 48, 250), outline=(0, 240, 215, 240), radius=24, width=3)
            d = ImageDraw.Draw(frame)
            d.text((105, int(305 - pulse_a)), "🏆 ANNUAL PLAN (BEST VALUE)", font=get_font(24, bold=True), fill=(0, 240, 215))
            d.text((105, int(350 - pulse_a)), "$1 / MONTH", font=get_font(72, bold=True), fill=(255, 255, 255))
            d.text((520, int(385 - pulse_a)), "BILLED ANNUALLY: JUST $12 / YEAR", font=get_font(26, bold=True), fill=(253, 224, 71))
            d.text((105, int(460 - pulse_a)), "✓ Full Multi-App Access: Leads Pool, CRM, Invoicing, ERP", font=get_font(22, bold=False), fill=(255, 255, 255))
            d.text((105, int(505 - pulse_a)), "✓ 3-Second AI Invoice Scanner Included", font=get_font(22, bold=False), fill=(255, 255, 255))
            d.text((105, int(550 - pulse_a)), "✓ Promo Code:  EARLYBIRD1", font=get_font(22, bold=True), fill=(52, 211, 153))

            # CARD 2: $5 / MONTH MONTHLY PLAN (Flexible Option)
            frame = draw_rounded_card(frame, [70, int(690 - pulse_a), 1010, int(1030 - pulse_a)], fill=(24, 18, 46, 250), outline=(192, 132, 252, 240), radius=24, width=3)
            d = ImageDraw.Draw(frame)
            d.text((105, int(725 - pulse_a)), "📅 FLEXIBLE MONTHLY PLAN", font=get_font(24, bold=True), fill=(192, 132, 252))
            d.text((105, int(770 - pulse_a)), "OR $5 / MONTH", font=get_font(64, bold=True), fill=(255, 255, 255))
            d.text((540, int(805 - pulse_a)), "MONTH-TO-MONTH, CANCEL ANYTIME", font=get_font(24, bold=False), fill=(203, 213, 225))
            d.text((105, int(875 - pulse_a)), "✓ Standard Plan Full Access • No Annual Commitment", font=get_font(22, bold=False), fill=(255, 255, 255))
            d.text((105, int(920 - pulse_a)), "✓ Promo Code:  EARLYBIRD5", font=get_font(22, bold=True), fill=(224, 231, 255))

            # CARD 3: NEED JUST ONE APP? START FREE
            frame = draw_rounded_card(frame, [70, int(1060 - pulse_a), 1010, int(1360 - pulse_a)], fill=(16, 32, 38, 250), outline=(52, 211, 153, 240), radius=24, width=3)
            d = ImageDraw.Draw(frame)
            d.text((105, int(1095 - pulse_a)), "🎁 NEED JUST ONE APP?", font=get_font(26, bold=True), fill=(52, 211, 153))
            d.text((105, int(1140 - pulse_a)), "START FREE.", font=get_font(56, bold=True), fill=(255, 255, 255))
            d.text((450, int(1160 - pulse_a)), "NO CREDIT CARD REQUIRED.", font=get_font(30, bold=True), fill=(52, 211, 153))
            d.text((105, int(1230 - pulse_a)), "Pick any 1 full app: CRM, Accounting, or Stock. Free Forever.", font=get_font(22, bold=False), fill=(203, 213, 225))

            # Bottom Big Action Button
            frame = draw_rounded_card(frame, [70, 1420, 1010, 1560], fill=(0, 220, 190, 255), radius=22)
            d = ImageDraw.Draw(frame)
            d.text((220, 1465), "Lock In Early-Bird Deal Now ➔", font=get_font(30, bold=True), fill=(11, 15, 25))

            d.text((340, 1620), "🌐 www.beraxis.online", font=get_font(28, bold=True), fill=(255, 255, 255))

        # ==========================================
        # SCENE 7: (29.0s - 32.5s) FINAL BRAND REVEAL AND CTA
        # ==========================================
        else:
            frame = Image.new("RGBA", (W, H), (12, 18, 30))
            d_bg = ImageDraw.Draw(frame)
            for y in range(H):
                f = y / H
                d_bg.line([(0, y), (W, y)], fill=(int(10*(1-f)+18*f), int(15*(1-f)+26*f), int(34*(1-f)+50*f), 255))

            # Center Glowing Logo
            if logo:
                frame.paste(logo, (400, 120), logo)

            d = ImageDraw.Draw(frame)
            d.text((140, 240), "STOP JUGGLING TOOLS.", font=get_font(48, bold=True), fill=(255, 255, 255))
            d.text((140, 310), "START RUNNING SMARTER.", font=get_font(48, bold=True), fill=(0, 240, 215))

            # Real Screen (Home Hero)
            frame.paste(home_crop, (70, 410), ui_mask)
            b = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            ImageDraw.Draw(b).rounded_rectangle([70, 410, 1010, 940], radius=22, outline=(0, 240, 215, 220), width=3)
            frame = Image.alpha_composite(frame, b)

            # Closing Offer Box
            frame = draw_rounded_card(frame, [70, 990, 1010, 1370], fill=(16, 24, 46, 250), outline=(234, 179, 8, 240), radius=22, width=3)
            d = ImageDraw.Draw(frame)
            d.text((110, 1025), "⚡ LOCK IN YOUR EARLY-BIRD RATE:", font=get_font(30, bold=True), fill=(253, 224, 71))
            d.text((110, 1085), "• Standard Annual: $1 / Month ($12 / Year Total)", font=get_font(26, bold=True), fill=(255, 255, 255))
            d.text((110, 1140), "• Standard Monthly: $5 / Month (Cancel Anytime)", font=get_font(26, bold=True), fill=(0, 240, 215))
            d.text((110, 1195), "• Starter Tier: 1 App 100% Free Forever (No CC)", font=get_font(26, bold=True), fill=(52, 211, 153))
            d.text((110, 1270), "All-in-One: Leads Pool • CRM • Accounting • ERP", font=get_font(22, bold=False), fill=(203, 213, 225))

            # Final Push-in Pulse Button
            pulse_cta = abs(math.sin(t * 4))
            glow_col = int(200 + 55 * pulse_cta)
            frame = draw_rounded_card(frame, [70, 1440, 1010, 1590], fill=(0, glow_col, int(glow_col * 0.85), 255), radius=22)
            d = ImageDraw.Draw(frame)
            d.text((180, 1488), "LOCK IN YOUR EARLY-BIRD RATE ➔", font=get_font(32, bold=True), fill=(11, 15, 25))

            # Prominent Website Domain URL
            d.text((280, 1660), "www.beraxis.online", font=get_font(42, bold=True), fill=(255, 255, 255))
            d.text((360, 1730), "Tap link in bio to start free", font=get_font(22, bold=False), fill=(148, 163, 184))

        writer.append_data(np.array(frame.convert("RGB")))

    writer.close()
    print("Video frames generated. Now combining with master soundtrack...")

    cmd = [
        FFMPEG_EXE, "-y",
        "-i", raw_video,
        "-i", audio_path,
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        final_video
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if res.returncode == 0:
        shutil.copyfile(final_video, artifact_video)
        print(f"Master Commercial Video successfully generated at: {final_video}")
    else:
        print(f"FFmpeg error: {res.stderr.decode('utf-8', errors='ignore')}")

if __name__ == "__main__":
    build_commercial()
    print("Master commercial script completed!")
