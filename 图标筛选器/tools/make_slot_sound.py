import math
import random
import sys
import wave
from array import array
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "audio/source-slot-reels.wav"
OUTPUT = ROOT / "audio/slot-machine-spin.wav"
RATE = 48_000
DURATION = 5.8
FRAMES = int(RATE * DURATION)
random.seed(20260912)


with wave.open(str(SOURCE), "rb") as wav:
    assert (wav.getframerate(), wav.getnchannels(), wav.getsampwidth()) == (RATE, 2, 2)
    source = array("h")
    source.frombytes(wav.readframes(wav.getnframes()))
if sys.byteorder != "little":
    source.byteswap()

left = [0.0] * FRAMES
right = [0.0] * FRAMES


def add_sample(index, value, pan=0.0):
    if 0 <= index < FRAMES:
        left[index] += value * math.sqrt((1 - pan) / 2)
        right[index] += value * math.sqrt((1 + pan) / 2)


def add_click(at, pan, strength=1.0):
    start = int(at * RATE)
    for i in range(int(0.022 * RATE)):
        t = i / RATE
        envelope = math.exp(-170 * t)
        metal = math.sin(2 * math.pi * 2800 * t) + 0.45 * math.sin(2 * math.pi * 5200 * t)
        add_sample(start + i, strength * envelope * (0.035 * metal + 0.025 * random.uniform(-1, 1)), pan)


def add_thunk(at, pan, pitch):
    start = int(at * RATE)
    for i in range(int(0.17 * RATE)):
        t = i / RATE
        low = 0.56 * math.exp(-26 * t) * math.sin(2 * math.pi * pitch * t)
        clack = 0.23 * math.exp(-75 * t) * math.sin(2 * math.pi * 630 * t)
        noise = 0.16 * math.exp(-95 * t) * random.uniform(-1, 1)
        add_sample(start + i, low + clack + noise, pan)


def add_stop(at, pan):
    start = int(at * RATE)
    previous_noise = 0.0
    for i in range(int(0.15 * RATE)):
        t = i / RATE
        noise = random.uniform(-1, 1)
        bright_noise = noise - previous_noise
        previous_noise = noise
        body = 0.08 * math.exp(-42 * t) * math.sin(2 * math.pi * 180 * t)
        latch = 0.24 * math.exp(-72 * t) * math.sin(2 * math.pi * 1800 * t)
        spring = 0.50 * math.exp(-30 * t) * (
            math.sin(2 * math.pi * 4200 * t) + 0.55 * math.sin(2 * math.pi * 6800 * t)
        )
        add_sample(start + i, body + latch + spring + 0.16 * math.exp(-90 * t) * bright_noise, pan)
    add_click(at + 0.032, pan, 1.5)


# CC0 实体老虎机转轮录音：跳过开头静音，循环稳定的机械段。
segment_start = int(2.90 * RATE)
segment_frames = int(3.10 * RATE)
crossfade = int(0.06 * RATE)
for i in range(int(5.62 * RATE)):
    pos = i % segment_frames
    gain = 0.46 if i < 3.4 * RATE else 0.34 if i < 4.5 * RATE else 0.22
    if i < 0.25 * RATE:
        gain *= i / (0.25 * RATE)
    for channel, output in ((0, left), (1, right)):
        sample = source[(segment_start + pos) * 2 + channel] / 32768
        if pos >= segment_frames - crossfade:
            mix = (pos - segment_frames + crossfade) / crossfade
            start_sample = source[(segment_start + pos - segment_frames + crossfade) * 2 + channel] / 32768
            sample = sample * (1 - mix) + start_sample * mix
        output[i] += sample * gain

# 拉杆：三段金属棘爪声，避免低频“咚”的感觉。
add_click(0.02, -0.12, 2.2)
add_click(0.08, 0.12, 1.5)
add_click(0.145, 0.0, 0.8)

# 三个转轮各自产生逐渐变慢的棘轮声，并从左到右停下。
for stop, pan in ((3.4, -0.55), (4.5, 0.0), (5.6, 0.55)):
    t = 0.18
    while t < stop - 0.06:
        progress = t / stop
        interval = 0.037 + 0.125 * progress**3.2
        add_click(t, pan, 1.05 - 0.28 * progress)
        t += interval

for stop, pan in ((3.4, -0.55), (4.5, 0.0), (5.6, 0.55)):
    add_stop(stop, pan)

# 留出 0.2 秒自然衰减，避免尾部硬切。
fade_start = int(5.72 * RATE)
for i in range(fade_start, FRAMES):
    gain = 1 - (i - fade_start) / (FRAMES - fade_start)
    left[i] *= gain
    right[i] *= gain

peak = max(max(map(abs, left)), max(map(abs, right)))
gain = 0.90 / peak
samples = array("h")
for l, r in zip(left, right):
    samples.extend((round(l * gain * 32767), round(r * gain * 32767)))
if sys.byteorder != "little":
    samples.byteswap()

OUTPUT.parent.mkdir(exist_ok=True)
with wave.open(str(OUTPUT), "wb") as wav:
    wav.setparams((2, 2, RATE, FRAMES, "NONE", "not compressed"))
    wav.writeframes(samples.tobytes())

print(OUTPUT)
