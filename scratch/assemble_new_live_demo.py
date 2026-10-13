import os
import shutil
import subprocess
import imageio_ffmpeg

FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()

SCRATCH_DIR = "D:/ERP_CRM/scratch/live_demo_production"
RAW_WEBM = os.path.join(SCRATCH_DIR, "raw_recordings/page@168d1585394bc45af6334e8e70e6bc43.webm")
SYNCED_AUDIO = os.path.join(SCRATCH_DIR, "synced_soundtrack_111s.wav")

OUT_PUBLIC_DIR = "D:/ERP_CRM/public/social_media_assets"
OUT_ARTIFACTS_DIR = "C:/Users/abuba/.gemini/antigravity/brain/febec71c-e080-4e9d-8c20-15a11a352971/social_posts"
os.makedirs(OUT_PUBLIC_DIR, exist_ok=True)
os.makedirs(OUT_ARTIFACTS_DIR, exist_ok=True)

OUT_16x9_MP4 = os.path.join(OUT_PUBLIC_DIR, "beraxis_live_product_demo_16x9.mp4")
OUT_9x16_MP4 = os.path.join(OUT_PUBLIC_DIR, "beraxis_live_product_demo_9x16.mp4")
OUT_PREVIEW_GIF = os.path.join(OUT_PUBLIC_DIR, "beraxis_live_product_demo_preview.gif")

# 1. Build 16:9 Landscape MP4
print("Rendering 16:9 Full HD Landscape Video...")
cmd_16x9 = [
    FFMPEG_EXE, "-y",
    "-i", RAW_WEBM,
    "-i", SYNCED_AUDIO,
    "-t", "111.5",
    "-c:v", "libx264",
    "-preset", "fast",
    "-crf", "20",
    "-pix_fmt", "yuv420p",
    "-c:a", "aac",
    "-b:a", "192k",
    OUT_16x9_MP4
]
res1 = subprocess.run(cmd_16x9, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
if res1.returncode != 0:
    print("Error rendering 16x9:", res1.stderr[:400])
else:
    print(f"Rendered 16:9 MP4: {OUT_16x9_MP4} ({os.path.getsize(OUT_16x9_MP4)} bytes)")

# 2. Build 9:16 Vertical Full HD MP4 (with blurred background fill)
print("Rendering 9:16 Mobile Vertical Full HD Video...")
vf_9x16 = "split[bg][fg];[bg]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=20:5[bgblur];[fg]scale=1080:608[fgscaled];[bgblur][fgscaled]overlay=(W-w)/2:(H-h)/2"
cmd_9x16 = [
    FFMPEG_EXE, "-y",
    "-i", RAW_WEBM,
    "-i", SYNCED_AUDIO,
    "-t", "111.5",
    "-filter_complex", vf_9x16,
    "-c:v", "libx264",
    "-preset", "fast",
    "-crf", "22",
    "-pix_fmt", "yuv420p",
    "-c:a", "aac",
    "-b:a", "192k",
    OUT_9x16_MP4
]
res2 = subprocess.run(cmd_9x16, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
if res2.returncode != 0:
    print("Error rendering 9x16:", res2.stderr[:400])
else:
    print(f"Rendered 9:16 MP4: {OUT_9x16_MP4} ({os.path.getsize(OUT_9x16_MP4)} bytes)")

# 3. Build Animated Preview GIF (8 seconds highlights loop)
print("Rendering Animated Preview GIF...")
vf_gif = "fps=10,scale=720:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse"
cmd_gif = [
    FFMPEG_EXE, "-y",
    "-ss", "14.0",
    "-t", "8.0",
    "-i", RAW_WEBM,
    "-vf", vf_gif,
    OUT_PREVIEW_GIF
]
res3 = subprocess.run(cmd_gif, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
if res3.returncode != 0:
    print("Error rendering GIF:", res3.stderr[:400])
else:
    print(f"Rendered Preview GIF: {OUT_PREVIEW_GIF} ({os.path.getsize(OUT_PREVIEW_GIF)} bytes)")

# 4. Sync files to Artifacts Directory
for fn in ["beraxis_live_product_demo_16x9.mp4", "beraxis_live_product_demo_9x16.mp4", "beraxis_live_product_demo_preview.gif"]:
    src = os.path.join(OUT_PUBLIC_DIR, fn)
    dst = os.path.join(OUT_ARTIFACTS_DIR, fn)
    shutil.copy2(src, dst)
    print(f"Synced {fn} to artifacts: {dst}")

print("All video productions completed successfully!")
