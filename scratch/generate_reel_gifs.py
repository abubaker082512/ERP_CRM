import os
import shutil
from PIL import Image
import imageio

OUTPUT_DIR_WEB = "D:/ERP_CRM/public/social_media_assets"
OUTPUT_DIR_ARTIFACT = "C:/Users/abuba/.gemini/antigravity/brain/febec71c-e080-4e9d-8c20-15a11a352971/social_posts"

reels = [
    "reel_1_3sec_ocr_demo",
    "reel_2_kill_saas_bloat",
    "reel_3_one_app_free_launch"
]

for r in reels:
    mp4_file = os.path.join(OUTPUT_DIR_WEB, f"{r}.mp4")
    gif_file_web = os.path.join(OUTPUT_DIR_WEB, f"{r}.gif")
    gif_file_art = os.path.join(OUTPUT_DIR_ARTIFACT, f"{r}.gif")
    
    if os.path.exists(mp4_file):
        print(f"Creating animated preview GIF for {r}...")
        reader = imageio.get_reader(mp4_file)
        frames = []
        for i, frame in enumerate(reader):
            # Sample every 4th frame and resize to lightweight 400x711 preview
            if i % 4 == 0:
                img = Image.fromarray(frame).resize((400, 711), Image.Resampling.LANCZOS)
                frames.append(img)
        reader.close()
        
        if frames:
            frames[0].save(
                gif_file_web,
                save_all=True,
                append_images=frames[1:],
                duration=160,
                loop=0,
                optimize=True
            )
            shutil.copyfile(gif_file_web, gif_file_art)
            print(f"Saved: {gif_file_web}")

print("All animated GIFs generated!")
