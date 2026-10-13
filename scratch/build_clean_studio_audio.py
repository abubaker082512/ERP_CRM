import os
import subprocess
import numpy as np
from scipy.io import wavfile
import imageio_ffmpeg

FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()
SCRATCH_DIR = "D:/ERP_CRM/scratch/live_demo_production"
sr = 44100
total_duration = 111.5
total_samples = int(total_duration * sr)

SCENE_STARTS = [
    0.5,   # Scene 1: Login & Hook
    14.2,  # Scene 2: Executive Dashboard & Apps
    39.0,  # Scene 3: AI Lead Pool
    56.5,  # Scene 4: Visual Sales CRM
    76.2,  # Scene 5: Accounting & Multi-Warehouse
    89.5   # Scene 6: Early-Bird Pricing & Irresistible CTA
]

# 1. Assemble pure voice wav (clean, zero background noise)
pure_voice = np.zeros(total_samples, dtype=np.float32)

for idx, start_sec in enumerate(SCENE_STARTS):
    wav_path = os.path.join(SCRATCH_DIR, f"v_clean_{idx}.wav")
    _, v_mono = wavfile.read(wav_path)
    v_mono = v_mono.astype(np.float32) / 32768.0
    start_idx = int(start_sec * sr)
    v_len = min(len(v_mono), total_samples - start_idx)
    pure_voice[start_idx:start_idx + v_len] = v_mono[:v_len]

# Normalize voice cleanly to 0.95
max_v = np.max(np.abs(pure_voice))
if max_v > 0:
    pure_voice = (pure_voice / max_v) * 0.95

pure_voice_int16 = (pure_voice * 32767).astype(np.int16)
pure_voice_wav = os.path.join(SCRATCH_DIR, "pure_voice_111s.wav")
wavfile.write(pure_voice_wav, sr, pure_voice_int16)
print(f"Pure voice saved: {pure_voice_wav}")

# 2. Use FFmpeg to mix pure voice with real corporate music
# Voice at full clarity (volume=1.0), gentle acoustic guitar/piano music at volume=0.13, fade out at end
music_ogg = os.path.join(SCRATCH_DIR, "real_corporate_music.ogg")
final_soundtrack = os.path.join(SCRATCH_DIR, "master_studio_soundtrack_111s.wav")

filter_str = (
    "[0:a]volume=1.0,pan=stereo|c0=c0|c1=c0[voice];"
    "[1:a]volume=0.13,afade=t=out:st=110.0:d=1.5[music];"
    "[voice][music]amix=inputs=2:duration=first:dropout_transition=2[out]"
)

cmd = [
    FFMPEG_EXE, "-y",
    "-i", pure_voice_wav,
    "-i", music_ogg,
    "-filter_complex", filter_str,
    "-map", "[out]",
    "-t", str(total_duration),
    "-ar", "44100",
    final_soundtrack
]
subprocess.run(cmd, check=True)
print(f"Master studio soundtrack created: {final_soundtrack} ({os.path.getsize(final_soundtrack)} bytes)")
