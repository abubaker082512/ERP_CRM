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
SCRATCH_DIR = "D:/ERP_CRM/scratch/audio_temp"
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

# 1. Voiceover Script & Timing
# Total length: 30 seconds
VOICEOVER_SEGMENTS = [
    ("Stop paying for QuickBooks, HubSpot, and messy tools.", 0.0, 4.0),
    ("With Beraxis, set up your entire company in thirty seconds.", 4.0, 8.5),
    ("Access your AI Lead Pool, sales CRM, and full cloud ERP.", 8.5, 14.0),
    ("Early bird deal: just one dollar a month on our annual plan,", 14.0, 20.0),
    ("or five dollars a month on our monthly standard plan.", 20.0, 25.0),
    ("Claim your early bird spot now at Beraxis dot online.", 25.0, 30.0)
]

def generate_voiceover_track():
    print("Generating voiceover audio files...")
    segment_wavs = []
    sr = 44100
    total_samples = int(30.0 * sr)
    full_voice = np.zeros(total_samples, dtype=np.float32)

    for idx, (text, start_sec, end_sec) in enumerate(VOICEOVER_SEGMENTS):
        mp3_path = os.path.join(SCRATCH_DIR, f"seg_{idx}.mp3")
        wav_path = os.path.join(SCRATCH_DIR, f"seg_{idx}.wav")
        
        tts = gTTS(text, lang='en', tld='com')
        tts.save(mp3_path)
        
        # Convert to wav 44100Hz mono using ffmpeg
        cmd = [FFMPEG_EXE, "-y", "-i", mp3_path, "-ar", str(sr), "-ac", "1", wav_path]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        # Read wav
        _, data = wavfile.read(wav_path)
        data = data.astype(np.float32) / 32768.0
        
        start_idx = int(start_sec * sr)
        end_idx = min(start_idx + len(data), total_samples)
        copy_len = end_idx - start_idx
        full_voice[start_idx:start_idx + copy_len] += data[:copy_len]

    # Normalize voice
    max_v = np.max(np.abs(full_voice))
    if max_v > 0:
        full_voice = full_voice / max_v

    # Generate energetic music track
    print("Synthesizing background music beat...")
    t = np.linspace(0, 30.0, total_samples, False)
    bpm = 112
    beat_len = 60.0 / bpm
    bar_len = beat_len * 4

    bg_music = np.zeros(total_samples, dtype=np.float32)
    for b in range(int(30.0 / beat_len)):
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

    # Synth Chords
    chords = [
        [220.0, 261.63, 329.63], # Am
        [174.61, 220.0, 261.63], # F
        [130.81, 164.81, 196.0], # C
        [196.0, 246.94, 293.66]  # G
    ]
    for bar in range(int(30.0 / bar_len)):
        chord = chords[bar % len(chords)]
        for note in chord:
            pad = np.sin(2 * np.pi * note * t) * 0.06
            pad *= (0.7 + 0.3 * np.sin(2 * np.pi * 3.5 * t))
            bg_music += pad

    # Mix voice (priority volume 0.90) + music ducking (0.18 background)
    mixed = (full_voice * 0.88) + (bg_music * 0.18)
    mixed = mixed / np.max(np.abs(mixed) + 1e-6)
    final_audio = (mixed * 30000).astype(np.int16)

    out_audio_path = os.path.join(SCRATCH_DIR, "final_soundtrack.wav")
    wavfile.write(out_audio_path, sr, final_audio)
    print(f"Final audio soundtrack saved at: {out_audio_path}")
    return out_audio_path

def build_high_converting_video():
    audio_path = generate_voiceover_track()
    
    W, H = 1080, 1920
    fps = 24
    duration = 30.0
    total_frames = int(fps * duration)
    
    # Load Real Visual Assets
    inf_f1 = Image.open(os.path.join(OUTPUT_DIR_WEB, "influencer_video_frame_1.jpg")).convert("RGBA").resize((W, H), Image.Resampling.LANCZOS)
    inf_f2 = Image.open(os.path.join(OUTPUT_DIR_WEB, "influencer_video_frame_2.jpg")).convert("RGBA").resize((W, H), Image.Resampling.LANCZOS)
    
    crm_img = Image.open("D:/ERP_CRM/public/deck_assets/crm_accounting_view.jpg").convert("RGBA").resize((940, 520), Image.Resampling.LANCZOS)
    dash_img = Image.open("D:/ERP_CRM/public/deck_assets/dashboard_hero.jpg").convert("RGBA").resize((940, 520), Image.Resampling.LANCZOS)
    inv_img = Image.open("D:/ERP_CRM/public/deck_assets/inventory_ops_view.jpg").convert("RGBA").resize((940, 520), Image.Resampling.LANCZOS)
    
    ui_mask = Image.new("L", (940, 520), 0)
    ImageDraw.Draw(ui_mask).rounded_rectangle([0, 0, 940, 520], radius=24, fill=255)

    logo = None
    if os.path.exists("D:/ERP_CRM/public/logo2.png"):
        logo = Image.open("D:/ERP_CRM/public/logo2.png").convert("RGBA")
        logo.thumbnail((260, 65), Image.Resampling.LANCZOS)

    raw_video_path = os.path.join(SCRATCH_DIR, "raw_video_frames.mp4")
    final_video_path = os.path.join(OUTPUT_DIR_WEB, "female_influencer_scale_ad_30s.mp4")
    artifact_video_path = os.path.join(OUTPUT_DIR_ARTIFACT, "female_influencer_scale_ad_30s.mp4")

    print("Rendering 30-Second Commercial Video Frames...")
    writer = imageio.get_writer(raw_video_path, fps=fps, codec='libx264', quality=9, pixelformat='yuv420p', macro_block_size=1)

    for i in range(total_frames):
        t = i / fps
        
        # SCENE 1: (0.0s - 4.5s) Viral Influencer Hook
        if t < 4.5:
            frame = inf_f1.copy()
            # Dynamic animated subtitle badge
            frame = draw_rounded_card(frame, [70, 150, 1010, 310], fill=(0, 0, 0, 210), outline=(56, 189, 248, 240), radius=22, width=3)
            d = ImageDraw.Draw(frame)
            d.text((105, 175), "STOP OVERPAYING FOR SOFTWARE! 🛑", font=get_font(38, bold=True), fill=(244, 63, 94))
            d.text((105, 235), "QuickBooks + HubSpot + messy apps are bleeding you dry.", font=get_font(24, bold=False), fill=(255, 255, 255))

            # Floating Lower Tag
            frame = draw_rounded_card(frame, [80, 1420, 1000, 1550], fill=(15, 23, 42, 235), outline=(234, 179, 8, 230), radius=20, width=2)
            d = ImageDraw.Draw(frame)
            d.text((115, 1445), "⚡ BERAXIS AI • 30-SECOND SETUP", font=get_font(26, bold=True), fill=(253, 224, 71))
            d.text((115, 1490), "Lead Pool • CRM • Invoicing • Cloud ERP", font=get_font(22, bold=False), fill=(203, 213, 225))

        # SCENE 2: (4.5s - 9.0s) 30-Second Company Setup Demo
        elif t < 9.0:
            frame = Image.new("RGBA", (W, H), (14, 20, 34))
            d_bg = ImageDraw.Draw(frame)
            for y in range(H):
                f = y / H
                d_bg.line([(0, y), (W, y)], fill=(int(12*(1-f)+22*f), int(18*(1-f)+30*f), int(38*(1-f)+56*f), 255))
            
            # Subtle glow
            g = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            ImageDraw.Draw(g).ellipse([200, 100, 880, 780], fill=(0, 220, 190, 40))
            frame = Image.alpha_composite(frame, g)

            # Circular Influencer Avatar Top Left
            pip = inf_f1.resize((240, 240), Image.Resampling.LANCZOS)
            pip_mask = Image.new("L", (240, 240), 0)
            ImageDraw.Draw(pip_mask).ellipse([0, 0, 240, 240], fill=255)
            frame.paste(pip, (80, 80), pip_mask)
            
            b = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            ImageDraw.Draw(b).ellipse([80, 80, 320, 320], outline=(0, 240, 215, 255), width=4)
            frame = Image.alpha_composite(frame, b)

            d = ImageDraw.Draw(frame)
            d.text((350, 105), "⚡ 30-SECOND SETUP", font=get_font(34, bold=True), fill=(0, 240, 215))
            d.text((350, 155), "\"Launch your full company in 30 seconds!\"", font=get_font(22, bold=True), fill=(255, 255, 255))
            d.text((350, 195), "Instant automated workspace provisioning", font=get_font(18, bold=False), fill=(148, 163, 184))

            # UI Showcase (Dashboard)
            frame.paste(dash_img, (70, 420), ui_mask)
            b = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            ImageDraw.Draw(b).rounded_rectangle([70, 420, 1010, 940], radius=24, outline=(0, 240, 215, 220), width=3)
            frame = Image.alpha_composite(frame, b)

            # Progress Bar: 30-Sec Setup
            setup_pct = min(1.0, (t - 4.5) / 4.0)
            frame = draw_rounded_card(frame, [70, 990, 1010, 1140], fill=(20, 28, 50, 240), outline=(56, 189, 248, 180), radius=20)
            d = ImageDraw.Draw(frame)
            d.text((105, 1015), f"🚀 Provisioning Workspace... {int(setup_pct*100)}%", font=get_font(24, bold=True), fill=(255, 255, 255))
            
            # Progress track
            d.rounded_rectangle([105, 1065, 975, 1095], radius=8, fill=(35, 45, 75))
            d.rounded_rectangle([105, 1065, int(105 + 870 * setup_pct), 1095], radius=8, fill=(0, 240, 215))

            # Feature Pillars
            frame = draw_rounded_card(frame, [70, 1180, 1010, 1520], fill=(16, 22, 40, 245), outline=(234, 179, 8, 220), radius=22)
            d = ImageDraw.Draw(frame)
            d.text((105, 1210), "✨ What Gets Configured Instantly:", font=get_font(26, bold=True), fill=(253, 224, 71))
            d.text((105, 1265), "✓ Full Chart of Accounts & General Ledger", font=get_font(22, bold=False), fill=(255, 255, 255))
            d.text((105, 1315), "✓ Multi-Currency Payment & Invoice Gateways", font=get_font(22, bold=False), fill=(255, 255, 255))
            d.text((105, 1365), "✓ WhatsApp Business Sync & Customer Support", font=get_font(22, bold=False), fill=(52, 211, 153))
            d.text((105, 1415), "✓ Integrated Warehouse & Inventory Tracking", font=get_font(22, bold=False), fill=(255, 255, 255))
            d.text((105, 1465), "✓ Autonomous AI Financial Assistant", font=get_font(22, bold=True), fill=(0, 240, 215))

            # Bottom CTA
            frame = draw_rounded_card(frame, [70, 1600, 1010, 1720], fill=(0, 220, 190, 255), radius=20)
            d = ImageDraw.Draw(frame)
            d.text((220, 1642), "Set Up Free at www.beraxis.online ➔", font=get_font(28, bold=True), fill=(11, 15, 25))

        # SCENE 3: (9.0s - 14.5s) Lead Pool, CRM & ERP Powerhouse
        elif t < 14.5:
            frame = Image.new("RGBA", (W, H), (14, 20, 34))
            d_bg = ImageDraw.Draw(frame)
            for y in range(H):
                f = y / H
                d_bg.line([(0, y), (W, y)], fill=(int(12*(1-f)+26*f), int(16*(1-f)+24*f), int(42*(1-f)+52*f), 255))

            d = ImageDraw.Draw(frame)
            d.text((70, 110), "POWERHOUSE CAPABILITIES", font=get_font(24, bold=True), fill=(192, 132, 252))
            d.text((70, 155), "Lead Pool • CRM • Cloud ERP", font=get_font(46, bold=True), fill=(255, 255, 255))
            d.text((70, 225), "Never lose a high-value prospect or miss an invoice again.", font=get_font(24, bold=False), fill=(203, 213, 225))

            # Real Screen (CRM View)
            frame.paste(crm_img, (70, 310), ui_mask)
            b = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            ImageDraw.Draw(b).rounded_rectangle([70, 310, 1010, 830], radius=24, outline=(192, 132, 252, 220), width=3)
            frame = Image.alpha_composite(frame, b)

            # 3 Cards Grid: Lead Pool, CRM, ERP
            c_y = 880
            # Card 1: Lead Pool
            frame = draw_rounded_card(frame, [70, c_y, 1010, c_y + 160], fill=(24, 20, 48, 240), outline=(192, 132, 252, 200), radius=18)
            d = ImageDraw.Draw(frame)
            d.text((105, c_y + 20), "🎯 AI LEAD POOL & BANK", font=get_font(24, bold=True), fill=(192, 132, 252))
            d.text((105, c_y + 60), "Centralized inbound prospects with automated lead scoring", font=get_font(20, bold=False), fill=(255, 255, 255))
            d.text((105, c_y + 95), "Instant assignment to sales reps with zero manual friction.", font=get_font(18, bold=False), fill=(203, 213, 225))

            # Card 2: CRM & Sales Pipeline
            c2_y = c_y + 190
            frame = draw_rounded_card(frame, [70, c2_y, 1010, c2_y + 160], fill=(20, 30, 52, 240), outline=(56, 189, 248, 200), radius=18)
            d = ImageDraw.Draw(frame)
            d.text((105, c2_y + 20), "🤝 VISUAL CRM PIPELINE", font=get_font(24, bold=True), fill=(56, 189, 248))
            d.text((105, c2_y + 60), "Interactive Kanban boards from Lead to Signed Quotation.", font=get_font(20, bold=False), fill=(255, 255, 255))
            d.text((105, c2_y + 95), "1-Click conversion from qualified deal to active invoice.", font=get_font(18, bold=False), fill=(203, 213, 225))

            # Card 3: Complete ERP Engine
            c3_y = c2_y + 190
            frame = draw_rounded_card(frame, [70, c3_y, 1010, c3_y + 160], fill=(16, 32, 38, 240), outline=(0, 240, 215, 200), radius=18)
            d = ImageDraw.Draw(frame)
            d.text((105, c3_y + 20), "📊 UNIFIED CLOUD ERP", font=get_font(24, bold=True), fill=(0, 240, 215))
            d.text((105, c3_y + 60), "Accounting, Balance Sheets, Multi-Warehouse Stock & POS.", font=get_font(20, bold=False), fill=(255, 255, 255))
            d.text((105, c3_y + 95), "Everything synced in real time across your entire organization.", font=get_font(18, bold=False), fill=(203, 213, 225))

            # Bottom CTA
            frame = draw_rounded_card(frame, [70, 1620, 1010, 1730], fill=(0, 220, 190, 255), radius=20)
            d = ImageDraw.Draw(frame)
            d.text((260, 1658), "Try Live at www.beraxis.online ➔", font=get_font(28, bold=True), fill=(11, 15, 25))

        # SCENE 4: (14.5s - 25.0s) THE EARLY BIRD PRICING DEAL ($1 Annual vs $5 Monthly)
        elif t < 25.0:
            frame = inf_f2.copy()
            # Big Top Header
            frame = draw_rounded_card(frame, [70, 110, 1010, 280], fill=(0, 0, 0, 215), outline=(234, 179, 8, 240), radius=22, width=3)
            d = ImageDraw.Draw(frame)
            d.text((105, 135), "🔥 EARLY BIRD STANDARD PLAN DEALS", font=get_font(34, bold=True), fill=(253, 224, 71))
            d.text((105, 190), "For Early Bird Users Only • Standard Plan Multi-App Access", font=get_font(22, bold=False), fill=(255, 255, 255))
            d.text((105, 225), "Pick the deal that matches your business:", font=get_font(20, bold=True), fill=(0, 240, 215))

            # Annual Offer Box ($1/mo)
            pulse_a = abs(math.sin(t * 3.5)) * 6
            frame = draw_rounded_card(frame, [70, int(1040 - pulse_a), 1010, int(1260 - pulse_a)], fill=(12, 28, 40, 245), outline=(0, 240, 215, 240), radius=22, width=3)
            d = ImageDraw.Draw(frame)
            d.text((105, int(1065 - pulse_a)), "🏆 ANNUAL EARLY BIRD (BEST DEAL)", font=get_font(24, bold=True), fill=(0, 240, 215))
            d.text((105, int(1110 - pulse_a)), "$1 / MONTH", font=get_font(64, bold=True), fill=(255, 255, 255))
            d.text((480, int(1145 - pulse_a)), "billed annually ($12 / year total!)", font=get_font(24, bold=False), fill=(203, 213, 225))
            d.text((105, int(1200 - pulse_a)), "✓ Full Standard Plan Multi-App Access • Code: EARLYBIRD1", font=get_font(20, bold=True), fill=(52, 211, 153))

            # Monthly Offer Box ($5/mo)
            frame = draw_rounded_card(frame, [70, int(1300 - pulse_a), 1010, int(1520 - pulse_a)], fill=(24, 18, 44, 245), outline=(192, 132, 252, 240), radius=22, width=3)
            d = ImageDraw.Draw(frame)
            d.text((105, int(1325 - pulse_a)), "📅 MONTHLY EARLY BIRD (FLEXIBLE)", font=get_font(24, bold=True), fill=(192, 132, 252))
            d.text((105, int(1370 - pulse_a)), "$5 / MONTH", font=get_font(64, bold=True), fill=(255, 255, 255))
            d.text((480, int(1405 - pulse_a)), "month-to-month, cancel anytime", font=get_font(24, bold=False), fill=(203, 213, 225))
            d.text((105, int(1460 - pulse_a)), "✓ Standard Plan Access • Code: EARLYBIRD5", font=get_font(20, bold=True), fill=(224, 231, 255))

            # Bottom CTA button
            frame = draw_rounded_card(frame, [70, 1600, 1010, 1720], fill=(234, 179, 8, 255), radius=20)
            d = ImageDraw.Draw(frame)
            d.text((200, 1642), "Claim Your $1 Rate at Beraxis.online ➔", font=get_font(30, bold=True), fill=(11, 15, 25))

        # SCENE 5: (25.0s - 30.0s) Final Call To Action & Urgency
        else:
            frame = Image.new("RGBA", (W, H), (14, 20, 34))
            d_bg = ImageDraw.Draw(frame)
            for y in range(H):
                f = y / H
                d_bg.line([(0, y), (W, y)], fill=(int(10*(1-f)+20*f), int(15*(1-f)+30*f), int(36*(1-f)+54*f), 255))
                
            if logo:
                frame.paste(logo, (410, 120), logo)

            d = ImageDraw.Draw(frame)
            d.text((180, 230), "SCALE YOUR BUSINESS TODAY", font=get_font(38, bold=True), fill=(255, 255, 255))
            d.text((160, 290), "Early Bird Pricing Is Strictly Limited", font=get_font(26, bold=False), fill=(253, 224, 71))

            # Final Comparison Summary
            frame = draw_rounded_card(frame, [80, 420, 1000, 1380], fill=(18, 24, 46, 250), outline=(0, 240, 215, 240), radius=24, width=3)
            d = ImageDraw.Draw(frame)
            
            d.text((120, 460), "🚀 BERAXIS STANDARD PLAN:", font=get_font(32, bold=True), fill=(0, 240, 215))
            
            d.text((120, 540), "• 30-Second Company Setup", font=get_font(26, bold=False), fill=(255, 255, 255))
            d.text((120, 600), "• Inbound Lead Pool & Scoring", font=get_font(26, bold=False), fill=(255, 255, 255))
            d.text((120, 660), "• Visual Sales CRM Pipeline", font=get_font(26, bold=False), fill=(255, 255, 255))
            d.text((120, 720), "• Full Accounting & 3-Sec OCR", font=get_font(26, bold=False), fill=(255, 255, 255))
            d.text((120, 780), "• Stock & Multi-Warehouse Ops", font=get_font(26, bold=False), fill=(255, 255, 255))

            d.line([(120, 860), (960, 860)], fill=(56, 189, 248, 100), width=2)
            
            d.text((120, 900), "🏆 ANNUAL EARLY BIRD:", font=get_font(28, bold=True), fill=(0, 240, 215))
            d.text((120, 945), "$1 / MONTH  (Code: EARLYBIRD1)", font=get_font(42, bold=True), fill=(255, 255, 255))
            
            d.text((120, 1050), "📅 MONTHLY EARLY BIRD:", font=get_font(28, bold=True), fill=(192, 132, 252))
            d.text((120, 1095), "$5 / MONTH  (Code: EARLYBIRD5)", font=get_font(42, bold=True), fill=(255, 255, 255))

            d.text((120, 1220), "🎁 Need just 1 App? Starter is 100% Free Forever!", font=get_font(24, bold=True), fill=(52, 211, 153))

            # Huge Final Button
            pulse_btn = abs(math.sin(t * 4))
            glow_col = int(200 + 55 * pulse_btn)
            frame = draw_rounded_card(frame, [80, 1460, 1000, 1600], fill=(0, glow_col, int(glow_col * 0.85), 255), radius=22)
            d = ImageDraw.Draw(frame)
            d.text((180, 1505), "Claim Early Bird at www.beraxis.online ➔", font=get_font(30, bold=True), fill=(11, 15, 25))

            d.text((340, 1670), "🌐 www.beraxis.online", font=get_font(28, bold=True), fill=(255, 255, 255))
            d.text((380, 1720), "Tap link in bio to start", font=get_font(22, bold=False), fill=(148, 163, 184))

        writer.append_data(np.array(frame.convert("RGB")))

    writer.close()
    print("Video frames generated. Now combining with full audio soundtrack...")

    # Combine video and audio using ffmpeg
    cmd = [
        FFMPEG_EXE, "-y",
        "-i", raw_video_path,
        "-i", audio_path,
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        final_video_path
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if res.returncode == 0:
        shutil.copyfile(final_video_path, artifact_video_path)
        print(f"Commercial Video successfully assembled with voiceover & music: {final_video_path}")
    else:
        print(f"FFmpeg error: {res.stderr.decode('utf-8', errors='ignore')}")

if __name__ == "__main__":
    build_high_converting_video()
    print("All tasks finished successfully!")
