import os
import shutil
import subprocess
import numpy as np
from gtts import gTTS
import imageio_ffmpeg
from scipy.io import wavfile

SCRATCH_DIR = "D:/ERP_CRM/scratch/live_demo_production"
os.makedirs(SCRATCH_DIR, exist_ok=True)

FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()

# Exact Script Segments without ANY OCR claims
VOICE_SEGMENTS = [
    # Scene 1: Hook (0.0s - 7.5s)
    ("Still running your business on five disconnected tools? Meet Beraxis AI — your entire business operations in one intelligent platform.", 0.0, 7.5),
    # Scene 2: 30-Sec Setup (7.5s - 15.0s)
    ("Set up your entire company in thirty seconds flat. Your Chart of Accounts, General Ledger, and executive dashboard are provisioned automatically.", 7.5, 15.0),
    # Scene 3: AI Lead Pool (15.0s - 23.5s)
    ("Access your centralized AI Lead Pool. Inbound prospects are automatically tracked, scored, and routed to your sales team with zero manual entry.", 15.0, 23.5),
    # Scene 4: CRM Pipeline (23.5s - 32.5s)
    ("Manage your visual CRM pipeline. Move opportunities smoothly across Kanban stages, and convert qualified deals into signed quotations.", 23.5, 32.5),
    # Scene 5: Accounting & Inventory (32.5s - 41.5s)
    ("Handle your accounting, customer invoicing, and multi-warehouse inventory seamlessly without spreadsheets.", 32.5, 41.5),
    # Scene 6: Early-Bird Pricing (41.5s - 50.5s)
    ("And for our launch, grab our Early Bird Standard Plan for just one dollar a month on our annual plan, or five dollars a month on our flexible monthly plan. Need only one app? Start free, with no credit card required.", 41.5, 50.5),
    # Scene 7: CTA (50.5s - 55.0s)
    ("Stop juggling tools. Start running smarter. Visit Beraxis dot online today.", 50.5, 55.0)
]

def generate_soundtrack():
    print("Generating voice cues...")
    sr = 44100
    duration = 55.0
    total_samples = int(duration * sr)
    full_voice = np.zeros(total_samples, dtype=np.float32)

    for idx, (text, start_sec, end_sec) in enumerate(VOICE_SEGMENTS):
        mp3_path = os.path.join(SCRATCH_DIR, f"voice_{idx}.mp3")
        wav_path = os.path.join(SCRATCH_DIR, f"voice_{idx}.wav")
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

    print("Generating energetic modern corporate synth track...")
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

    # Chords (Am - F - C - G)
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

    out_audio_path = os.path.join(SCRATCH_DIR, "live_demo_soundtrack_55s.wav")
    wavfile.write(out_audio_path, sr, final_audio)
    print(f"Soundtrack generated successfully: {out_audio_path}")
    return out_audio_path

if __name__ == "__main__":
    generate_soundtrack()
