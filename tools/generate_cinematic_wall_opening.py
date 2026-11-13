#!/usr/bin/env python3
"""Generate the NEXUS CORE v1.16 cinematic wall opening.

This generator treats the three supplied art frames as separate cinematography
setups: an establishing traverse, a dense research-board shot, two macro
inserts, and a final access-wall pullback. It deliberately avoids animating
Home-screen elements or stacking UI cards over the film.
"""
from __future__ import annotations

import math
import shutil
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "assets" / "video" / "source"
OUTPUT_DIR = ROOT / "assets" / "video"
DOCS_DIR = ROOT / "docs"

FPS = 30
OUT_W, OUT_H = 1920, 1080
SAMPLE_RATE = 48_000

SPARSE_PATH = SOURCE_DIR / "wall_sparse.png"
DENSE_PATH = SOURCE_DIR / "wall_dense.png"
ACCESS_PATH = SOURCE_DIR / "wall_access.png"
VIDEO_PATH = OUTPUT_DIR / "nexus_cinematic_wall_opening_v2.mp4"
POSTER_PATH = OUTPUT_DIR / "nexus_cinematic_wall_poster_v2.jpg"
STORYBOARD_PATH = DOCS_DIR / "v1_16_cinematic_opening_storyboard.jpg"

# Exact shot lengths are frame-based to keep concat timing deterministic.
SHOTS = [
    ("01_traverse", SPARSE_PATH, 68),
    ("02_field", DENSE_PATH, 73),
    ("03_coil", DENSE_PATH, 10),
    ("04_signal", DENSE_PATH, 8),
    ("05_access", ACCESS_PATH, 134),
]
TOTAL_FRAMES = sum(frames for _, _, frames in SHOTS)
DURATION = TOTAL_FRAMES / FPS

GRADE = (
    "eq=contrast=1.035:brightness=-0.008:saturation=0.91:gamma=0.985,"
    "unsharp=5:5:0.25:5:5:0,"
    "vignette=PI/5,"
    "noise=alls=1.25:allf=t+u,"
    "format=yuv420p"
)


def run(command: list[str]) -> None:
    subprocess.run(command, check=True)


def shot_filter(name: str, frames: int) -> str:
    last = max(1, frames - 1)
    if name == "01_traverse":
        motion = (
            f"zoompan=z='1.38-0.21*on/{last}':"
            f"x='(iw-iw/zoom)*(0.04+0.72*on/{last})':"
            "y='(ih-ih/zoom)*0.48':d=1:s=1920x1080:fps=30,"
            "fade=t=in:st=0:d=0.12,fade=t=out:st=2.20:d=0.067"
        )
    elif name == "02_field":
        motion = (
            f"zoompan=z='1.125-0.080*on/{last}':"
            f"x='(iw-iw/zoom)*(0.43+0.12*on/{last})':"
            f"y='(ih-ih/zoom)*(0.49+0.015*on/{last})':d=1:s=1920x1080:fps=30,"
            "fade=t=in:st=0:d=0.067"
        )
    elif name == "03_coil":
        motion = (
            f"zoompan=z='2.48-0.23*on/{last}':"
            f"x='(iw-iw/zoom)*(0.34+0.02*on/{last})':"
            f"y='(ih-ih/zoom)*(0.69-0.03*on/{last})':d=1:s=1920x1080:fps=30"
        )
    elif name == "04_signal":
        motion = (
            f"zoompan=z='3.15-0.24*on/{last}':"
            f"x='(iw-iw/zoom)*(0.34+0.02*on/{last})':"
            f"y='(ih-ih/zoom)*(0.125+0.025*on/{last})':d=1:s=1920x1080:fps=30,"
            "fade=t=out:st=0.20:d=0.067"
        )
    elif name == "05_access":
        motion = (
            f"zoompan=z='1.34-0.34*on/{last}':"
            f"x='(iw-iw/zoom)*(0.78-0.28*on/{last})':"
            "y='(ih-ih/zoom)*0.50':d=1:s=1920x1080:fps=30,"
            "fade=t=in:st=0:d=0.080"
        )
    else:
        raise ValueError(name)
    return f"scale=2560:1440:flags=lanczos,{motion},{GRADE},setpts=N/({FPS}*TB)"


def render_shot(name: str, source: Path, frames: int, output: Path) -> None:
    command = [
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-loop", "1", "-framerate", str(FPS), "-i", str(source),
        "-vf", shot_filter(name, frames),
        "-frames:v", str(frames), "-an",
        "-c:v", "libx264", "-preset", "medium", "-crf", "12",
        "-profile:v", "high", "-level", "4.1", "-pix_fmt", "yuv420p",
        "-r", str(FPS), "-g", str(FPS * 2), "-video_track_timescale", "90000",
        "-movflags", "+faststart", str(output),
    ]
    run(command)


def fft_band_noise(length: int, low_hz: float, high_hz: float, rng: np.random.Generator) -> np.ndarray:
    noise = rng.normal(0.0, 1.0, length)
    spectrum = np.fft.rfft(noise)
    freqs = np.fft.rfftfreq(length, 1.0 / SAMPLE_RATE)
    spectrum[(freqs < low_hz) | (freqs > high_hz)] = 0
    result = np.fft.irfft(spectrum, n=length)
    return result / (np.max(np.abs(result)) or 1.0)


def add_transient(track: np.ndarray, when: float, duration: float, signal: np.ndarray, gain: float, pan: float = 0.0) -> None:
    start = int(round(when * SAMPLE_RATE))
    count = min(int(round(duration * SAMPLE_RATE)), len(signal), len(track) - start)
    if count <= 0:
        return
    env = np.exp(-np.linspace(0.0, 7.0, count)) * np.sin(np.linspace(0.0, math.pi, count)) ** 0.35
    left = gain * math.sqrt((1.0 - pan) * 0.5)
    right = gain * math.sqrt((1.0 + pan) * 0.5)
    track[start:start + count, 0] += signal[:count] * env * left
    track[start:start + count, 1] += signal[:count] * env * right


def generate_audio(path: Path) -> None:
    samples = int(round(DURATION * SAMPLE_RATE))
    t = np.arange(samples, dtype=np.float64) / SAMPLE_RATE
    rng = np.random.default_rng(16082026)
    track = np.zeros((samples, 2), dtype=np.float64)

    air = fft_band_noise(samples, 70.0, 3400.0, rng) * 0.018
    rumble = (np.sin(2 * math.pi * 43.0 * t) + 0.45 * np.sin(2 * math.pi * 57.0 * t + 0.7)) * 0.015
    movement = 0.55 + 0.45 * np.sin(2 * math.pi * 0.12 * t - 1.1)
    bed = air * movement + rumble
    track[:, 0] += bed * 0.92
    track[:, 1] += bed

    paper = fft_band_noise(int(0.34 * SAMPLE_RATE), 120.0, 4100.0, rng)
    whip = fft_band_noise(int(0.24 * SAMPLE_RATE), 450.0, 8500.0, rng)
    scratch = fft_band_noise(int(2.3 * SAMPLE_RATE), 1800.0, 9200.0, rng)
    sub_t = np.arange(int(1.0 * SAMPLE_RATE)) / SAMPLE_RATE
    sub = np.sin(2 * math.pi * (54.0 - 20.0 * sub_t) * sub_t)

    # Cut points correspond to the edit rather than arbitrary particle hits.
    cut1 = SHOTS[0][2] / FPS
    field_end = (SHOTS[0][2] + SHOTS[1][2]) / FPS
    coil_end = (SHOTS[0][2] + SHOTS[1][2] + SHOTS[2][2]) / FPS
    signal_end = (SHOTS[0][2] + SHOTS[1][2] + SHOTS[2][2] + SHOTS[3][2]) / FPS
    add_transient(track, cut1 - 0.05, 0.22, whip, 0.15, pan=0.25)
    add_transient(track, cut1, 0.28, paper, 0.14, pan=-0.18)
    add_transient(track, field_end, 0.22, paper, 0.12, pan=-0.38)
    add_transient(track, coil_end, 0.18, whip, 0.10, pan=0.34)
    add_transient(track, signal_end - 0.03, 0.22, whip, 0.12, pan=0.0)
    add_transient(track, signal_end, 0.90, sub, 0.22, pan=0.0)
    add_transient(track, DURATION - 1.05, 0.90, sub, 0.12, pan=0.0)

    start = int((cut1 + 0.15) * SAMPLE_RATE)
    count = min(len(scratch), samples - start)
    modulation = 0.28 + 0.72 * np.abs(np.sin(np.linspace(0.0, 18.0 * math.pi, count)))
    envelope = np.sin(np.linspace(0.0, math.pi, count)) ** 0.8
    graphite = scratch[:count] * modulation * envelope * 0.018
    track[start:start + count, 0] += graphite * 0.85
    track[start:start + count, 1] += graphite * 0.70

    fade_in = np.clip(t / 0.35, 0.0, 1.0)
    fade_out = np.clip((DURATION - t) / 0.55, 0.0, 1.0)
    track *= (fade_in * fade_out)[:, None]
    track = track / (np.max(np.abs(track)) or 1.0) * 0.78
    pcm = np.int16(np.clip(track, -1.0, 1.0) * 32767)
    with wave.open(str(path), "wb") as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(SAMPLE_RATE)
        wav.writeframes(pcm.tobytes())


def create_storyboard(video: Path, temp_dir: Path) -> None:
    times = [1.15, 3.35, 4.82, 5.10, 6.75, DURATION - 0.35]
    frames: list[np.ndarray] = []
    for index, when in enumerate(times, 1):
        image_path = temp_dir / f"story_{index}.jpg"
        run([
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
            "-ss", f"{when:.3f}", "-i", str(video), "-frames:v", "1",
            "-q:v", "2", str(image_path),
        ])
        image = cv2.imread(str(image_path), cv2.IMREAD_COLOR)
        if image is None:
            raise RuntimeError(f"Could not read storyboard frame {image_path}")
        frames.append(image)

    thumb_w, thumb_h = 640, 360
    margin, label_h = 28, 42
    canvas = np.full((2 * (thumb_h + label_h) + 3 * margin, 3 * thumb_w + 4 * margin, 3), 234, np.uint8)
    labels = ["01 / TRAVERSE", "02 / FIELD", "03 / COIL INSERT", "04 / SIGNAL INSERT", "05 / ACCESS PULLBACK", "06 / GATE HOLD"]
    for i, (frame, label) in enumerate(zip(frames, labels)):
        row, column = divmod(i, 3)
        x = margin + column * (thumb_w + margin)
        y = margin + row * (thumb_h + label_h + margin)
        canvas[y:y + thumb_h, x:x + thumb_w] = cv2.resize(frame, (thumb_w, thumb_h), interpolation=cv2.INTER_AREA)
        cv2.putText(canvas, label, (x, y + thumb_h + 28), cv2.FONT_HERSHEY_SIMPLEX, 0.64, (24, 24, 24), 1, cv2.LINE_AA)
    cv2.imwrite(str(STORYBOARD_PATH), canvas, [cv2.IMWRITE_JPEG_QUALITY, 94])


def render() -> None:
    if shutil.which("ffmpeg") is None:
        raise RuntimeError("ffmpeg was not found on PATH")
    for path in (SPARSE_PATH, DENSE_PATH, ACCESS_PATH):
        if not path.exists():
            raise FileNotFoundError(path)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    DOCS_DIR.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix="nexus_cinema_") as temp_name:
        temp = Path(temp_name)
        shot_paths: list[Path] = []
        for name, source, frames in SHOTS:
            output = temp / f"{name}.mp4"
            print(f"rendering {name} ({frames} frames)", flush=True)
            render_shot(name, source, frames, output)
            shot_paths.append(output)

        concat_list = temp / "concat.txt"
        concat_list.write_text("".join(f"file '{path.as_posix()}'\n" for path in shot_paths), encoding="utf-8")
        silent = temp / "opening_silent.mp4"
        run([
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
            "-f", "concat", "-safe", "0", "-i", str(concat_list),
            "-c", "copy", "-movflags", "+faststart", str(silent),
        ])

        audio = temp / "opening_audio.wav"
        generate_audio(audio)
        run([
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
            "-i", str(silent), "-i", str(audio),
            "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", str(SAMPLE_RATE),
            "-shortest", "-movflags", "+faststart", str(VIDEO_PATH),
        ])

        run([
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
            "-sseof", "-0.08", "-i", str(VIDEO_PATH), "-frames:v", "1",
            "-q:v", "2", str(POSTER_PATH),
        ])
        create_storyboard(VIDEO_PATH, temp)

    print(f"duration: {DURATION:.3f}s / {TOTAL_FRAMES} frames")
    print(f"video: {VIDEO_PATH}")
    print(f"poster: {POSTER_PATH}")
    print(f"storyboard: {STORYBOARD_PATH}")


def main() -> int:
    try:
        render()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
