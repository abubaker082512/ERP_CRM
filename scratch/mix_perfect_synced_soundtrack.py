import os
import subprocess
import numpy as np
from scipy.io import wavfile

SCRATCH_DIR = "D:/ERP_CRM/scratch/live_demo_production"
sr = 44100
total_duration = 111.5
total_samples = int(total_duration * sr)

# Exact scene start timestamps in the raw recorded video
SCENE_STARTS = [
    0.5,   # Scene 1: Login & Hook
    14.2,  # Scene 2: Executive Dashboard & Apps
    39.0,  # Scene 3: AI Lead Pool
    56.5,  # Scene 4: Visual Sales CRM
    76.2,  # Scene 5: Accounting & Multi-Warehouse
    89.5   # Scene 6: Early-Bird Pricing & Irresistible CTA
]

full_voice = np.zeros(total_samples, dtype=np.float32)

for idx, start_sec in enumerate(SCENE_STARTS):
    wav_path = os.path.join(SCRATCH_DIR, f"v_clean_{idx}.wav")
    _, data = wavfile.read(wav_path)
    data = data.astype(np.float32) / 32768.0
    
    start_idx = int(start_sec * sr)
    end_idx = start_idx + len(data)
    duration = len(data) / sr
    print(f"Voice {idx+1}: starts at {start_sec:.2f}s, ends at {start_sec + duration:.2f}s (duration: {duration:.2f}s)")
    if end_idx <= total_samples:
        full_voice[start_idx:end_idx] = data

# Verify max voice amplitude
max_v = np.max(np.abs(full_voice))
if max_v > 0:
    full_voice = full_voice / max_v

print(f"Generating 111.5s corporate electronic synth soundtrack at {sr}Hz...")
t = np.linspace(0, total_duration, total_samples, False)
bpm = 116
beat_len = 60.0 / bpm
bar_len = beat_len * 4

bg_music = np.zeros(total_samples, dtype=np.float32)

# Electronic Drums (Punchy Kick + Crisp Snare)
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

# Chord progression (C - G - Am - F)
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

# Master Mix: Voice loud & clear (0.92), background music (0.13)
mixed = (full_voice * 0.92) + (bg_music * 0.13)
mixed = mixed / (np.max(np.abs(mixed)) + 1e-6)
final_audio = (mixed * 31500).astype(np.int16)

out_audio = os.path.join(SCRATCH_DIR, "synced_soundtrack_111s.wav")
wavfile.write(out_audio, sr, final_audio)
print(f"Synced soundtrack created successfully: {out_audio}")
