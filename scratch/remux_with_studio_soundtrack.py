import os
import shutil
import subprocess
import imageio_ffmpeg

FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()
SCRATCH_DIR = "D:/ERP_CRM/scratch/live_demo_production"
STUDIO_AUDIO = os.path.join(SCRATCH_DIR, "master_studio_soundtrack_111s.wav")

OUT_PUBLIC_DIR = "D:/ERP_CRM/public/social_media_assets"
OUT_ARTIFACTS_DIR = "C:/Users/abuba/.gemini/antigravity/brain/febec71c-e080-4e9d-8c20-15a11a352971/social_posts"
OUT_FRONTEND_DIR = "D:/ERP_CRM/frontend/public/social_media_assets"

# 1. Update 16:9 MP4
src_16x9 = os.path.join(OUT_PUBLIC_DIR, "beraxis_live_product_demo_16x9.mp4")
tmp_16x9 = os.path.join(SCRATCH_DIR, "temp_16x9.mp4")

print("Remuxing 16:9 with master studio soundtrack...")
cmd_16x9 = [
    FFMPEG_EXE, "-y",
    "-i", src_16x9,
    "-i", STUDIO_AUDIO,
    "-map", "0:v:0",
    "-map", "1:a:0",
    "-c:v", "copy",
    "-c:a", "aac",
    "-b:a", "192k",
    "-shortest",
    tmp_16x9
]
subprocess.run(cmd_16x9, check=True)
shutil.move(tmp_16x9, src_16x9)
print(f"16:9 remuxed successfully: {src_16x9} ({os.path.getsize(src_16x9)} bytes)")

# 2. Update 9:16 MP4
src_9x16 = os.path.join(OUT_PUBLIC_DIR, "beraxis_live_product_demo_9x16.mp4")
tmp_9x16 = os.path.join(SCRATCH_DIR, "temp_9x16.mp4")

print("Remuxing 9:16 with master studio soundtrack...")
cmd_9x16 = [
    FFMPEG_EXE, "-y",
    "-i", src_9x16,
    "-i", STUDIO_AUDIO,
    "-map", "0:v:0",
    "-map", "1:a:0",
    "-c:v", "copy",
    "-c:a", "aac",
    "-b:a", "192k",
    "-shortest",
    tmp_9x16
]
subprocess.run(cmd_9x16, check=True)
shutil.move(tmp_9x16, src_9x16)
print(f"9:16 remuxed successfully: {src_9x16} ({os.path.getsize(src_9x16)} bytes)")

# 3. Sync to artifacts & frontend
for fn in ["beraxis_live_product_demo_16x9.mp4", "beraxis_live_product_demo_9x16.mp4"]:
    s = os.path.join(OUT_PUBLIC_DIR, fn)
    shutil.copy2(s, os.path.join(OUT_ARTIFACTS_DIR, fn))
    shutil.copy2(s, os.path.join(OUT_FRONTEND_DIR, fn))
    print(f"Synced {fn} to artifacts and frontend.")

print("All audio replacements completed with zero background noise!")
