import os
import subprocess
import numpy as np
from gtts import gTTS
import imageio_ffmpeg
from scipy.io import wavfile

SCRATCH_DIR = "D:/ERP_CRM/scratch/live_demo_production"
os.makedirs(SCRATCH_DIR, exist_ok=True)
FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()

VOICE_SCRIPTS = [
    # Scene 1: Login & The Hook
    "Stop juggling five disconnected tools to run your business. Sign in to Beraxis AI — your entire company, unified in one intelligent workspace.",
    # Scene 2: Executive Dashboard & Workspace
    "From your central dashboard, monitor live business metrics, company revenue, and access your entire suite of enterprise business apps in one place.",
    # Scene 3: Inbound AI Lead Pool
    "Never lose another customer. Your centralized AI Lead Pool captures inbound prospects, automatically scores buyer intent, and feeds your sales pipeline.",
    # Scene 4: Visual Sales CRM
    "Manage deals effortlessly with your visual CRM. Move opportunities across sales stages and close deals faster with instant quotes.",
    # Scene 5: Cloud Accounting & Multi-Warehouse Inventory
    "Automate your financials with real-time accounting and invoicing, while tracking multi-warehouse inventory seamlessly with zero spreadsheets.",
    # Scene 6: Early-Bird Pricing & Irresistible CTA
    "For our public launch, lock in our Early Bird Standard Plan for just one dollar a month billed annually at twelve dollars, or five dollars monthly. Or start one app completely free with no credit card. Stop juggling tools. Visit Beraxis dot online and start scaling today."
]

def build_voiceover():
    sr = 44100
    scene_timings = []
    current_time = 0.0
    gap = 0.8  # 0.8s breathing room between scenes
    
    voice_buffers = []
    
    print("Generating individual voice tracks with gTTS...")
    for idx, text in enumerate(VOICE_SCRIPTS):
        mp3_path = os.path.join(SCRATCH_DIR, f"v_clean_{idx}.mp3")
        wav_path = os.path.join(SCRATCH_DIR, f"v_clean_{idx}.wav")
        
        tts = gTTS(text=text, lang='en', tld='com', slow=False)
        tts.save(mp3_path)
        
        # Convert to mono 44.1kHz wav
        cmd = [FFMPEG_EXE, "-y", "-i", mp3_path, "-ar", str(sr), "-ac", "1", wav_path]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        _, data = wavfile.read(wav_path)
        data = data.astype(np.float32) / 32768.0
        clip_duration = len(data) / sr
        
        start_sec = current_time
        end_sec = current_time + clip_duration
        scene_timings.append({
            "scene": idx + 1,
            "start": round(start_sec, 2),
            "clip_duration": round(clip_duration, 2),
            "end": round(end_sec + gap, 2),
            "total_scene_duration": round(clip_duration + gap, 2)
        })
        
        voice_buffers.append((start_sec, data))
        current_time = end_sec + gap
        
    total_duration = current_time + 1.0  # +1s outro tail
    print(f"Total video duration needed: {total_duration:.2f} seconds")
    for s in scene_timings:
        print(f"  Scene {s['scene']}: {s['start']}s -> {s['end']}s (Duration: {s['total_scene_duration']}s)")
        
    total_samples = int(total_duration * sr)
    full_voice = np.zeros(total_samples, dtype=np.float32)
    
    # Place each voice track exactly at start_sec with ZERO OVERLAPPING
    for start_sec, data in voice_buffers:
        idx = int(start_sec * sr)
        full_voice[idx:idx + len(data)] = data  # Direct assign, zero overlap!
        
    # Generate energetic, modern corporate synth & lo-fi beat
    t = np.linspace(0, total_duration, total_samples, False)
    bpm = 116
    beat_len = 60.0 / bpm
    bar_len = beat_len * 4
    
    bg_music = np.zeros(total_samples, dtype=np.float32)
    for b in range(int(total_duration / beat_len)):
        beat_time = b * beat_len
        idx = int(beat_time * sr)
        if b % 2 == 0:
            k_len = int(0.18 * sr)
            if idx + k_len < total_samples:
                kt = np.linspace(0, 0.18, k_len, False)
                kick = np.sin(2 * np.pi * (135 * np.exp(-18 * kt)) * kt) * np.exp(-8 * kt)
                bg_music[idx:idx+k_len] += kick * 0.35
        else:
            s_len = int(0.14 * sr)
            if idx + s_len < total_samples:
                st = np.linspace(0, 0.14, s_len, False)
                snare = np.random.uniform(-1, 1, s_len) * np.exp(-22 * st)
                bg_music[idx:idx+s_len] += snare * 0.20

    # Modern uplifting chord progression: Cmaj - Gmaj - Am - Fmaj
    chord_freqs = [
        [261.63, 329.63, 392.00], # C
        [196.00, 246.94, 293.66], # G
        [220.00, 261.63, 329.63], # Am
        [174.61, 220.00, 261.63]  # F
    ]
    for bar in range(int(total_duration / bar_len)):
        chord = chord_freqs[bar % len(chord_freqs)]
        for note in chord:
            pad = np.sin(2 * np.pi * note * t) * 0.055
            pad *= (0.75 + 0.25 * np.sin(2 * np.pi * 3.0 * t))
            bg_music += pad

    # Dynamic ducking: keep music volume low (0.12) so voice is crystal clear
    # Normalize voice
    max_voice = np.max(np.abs(full_voice))
    if max_voice > 0:
        full_voice = full_voice / max_voice

    # Mix: voice at 0.90, background music ducked at 0.14
    mixed = (full_voice * 0.90) + (bg_music * 0.14)
    mixed = mixed / (np.max(np.abs(mixed)) + 1e-6)
    final_audio = (mixed * 31000).astype(np.int16)
    
    out_path = os.path.join(SCRATCH_DIR, "beraxis_perfect_voiceover.wav")
    wavfile.write(out_path, sr, final_audio)
    print(f"Generated perfect non-overlapping soundtrack at: {out_path}")
    
    # Save timings to JSON for playwright sync
    import json
    timings_path = os.path.join(SCRATCH_DIR, "scene_timings.json")
    with open(timings_path, "w") as f:
        json.dump({
            "total_duration": total_duration,
            "scenes": scene_timings
        }, f, indent=2)
    print(f"Saved scene timings to: {timings_path}")

if __name__ == "__main__":
    build_voiceover()
