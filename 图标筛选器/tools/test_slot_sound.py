from array import array
from math import sqrt
import wave
from pathlib import Path


path = Path("audio/slot-machine-spin.wav")
assert path.exists(), f"missing {path}"

with wave.open(str(path), "rb") as wav:
    assert wav.getframerate() == 48_000
    assert wav.getnchannels() == 2
    assert wav.getsampwidth() == 2
    frames = wav.readframes(wav.getnframes())
    duration = wav.getnframes() / wav.getframerate()

assert 5.75 <= duration <= 5.85, duration
samples = array("h")
samples.frombytes(frames)
peak = max(map(abs, samples)) / 32767
assert 0.88 <= peak <= 0.92, peak

def rms(start, end):
    window = samples[int(start * 48_000) * 2 : int(end * 48_000) * 2]
    return sqrt(sum(sample * sample for sample in window) / len(window))


intro = samples[: int(0.18 * 48_000) * 2]
intro_differences = [intro[i] - intro[i - 2] for i in range(2, len(intro))]
intro_brightness = sqrt(sum(value * value for value in intro_differences) / len(intro_differences)) / rms(0, 0.18)
assert intro_brightness >= 0.4, intro_brightness

for stop in (3.4, 4.5, 5.6):
    assert rms(stop - 0.03, stop + 0.08) > 2500, stop
    window = samples[int((stop - 0.03) * 48_000) * 2 : int((stop + 0.10) * 48_000) * 2]
    differences = [window[i] - window[i - 2] for i in range(2, len(window))]
    brightness = sqrt(sum(value * value for value in differences) / len(differences)) / rms(stop - 0.03, stop + 0.10)
    assert brightness >= 0.55, (stop, brightness)

assert rms(duration - 0.03, duration) < 300
print("slot sound check passed")
