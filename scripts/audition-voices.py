"""Create comparable local auditions; never replace the game's installed speech clips.

Run with tmp/kokoro/venv/bin/python scripts/audition-voices.py after following
docs/design/remaster/VOICE.md to install the ignored local model and dependencies.
"""
import json
import subprocess
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parent.parent
MODEL_DIR = ROOT / 'tmp/kokoro'
OUTPUT = ROOT / 'tmp/voice-audition'
TEXT = 'Hello, friend! Go, little train! An apple, please. Thank you for helping.'
SPEED = 0.92
VOICES = [
    ('af_heart', 'heart-american', 'en-us'),
    ('af_bella', 'bella-american', 'en-us'),
    ('af_nicole', 'nicole-american', 'en-us'),
    ('bf_emma', 'emma-british', 'en-gb'),
    ('am_michael', 'michael-american', 'en-us'),
]


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    kokoro = Kokoro(str(MODEL_DIR / 'model.onnx'), str(MODEL_DIR / 'voices.bin'))
    run_session = kokoro.sess.run
    speed_type = next(item.type for item in kokoro.sess.get_inputs() if item.name == 'speed')

    # kokoro-onnx 0.4.9 casts speed to int for input_ids exports, but our model
    # declares float. Preserve the requested speed at the inference boundary.
    def run_typed(outputs, inputs, *rest, **kwargs):
        if speed_type == 'tensor(float)':
            inputs = {**inputs, 'speed': np.asarray([SPEED], dtype=np.float32)}
        return run_session(outputs, inputs, *rest, **kwargs)

    kokoro.sess.run = run_typed
    manifest = []
    for voice, name, language in VOICES:
        samples, rate = kokoro.create(TEXT, voice=voice, speed=SPEED, lang=language)
        samples = np.concatenate((np.zeros(int(rate * 0.07)), samples, np.zeros(int(rate * 0.14))))
        peak = np.max(np.abs(samples))
        if peak > 0:
            samples *= 0.84 / peak
        wav = OUTPUT / f'{name}.wav'
        mp3 = OUTPUT / f'{name}.mp3'
        sf.write(str(wav), samples, rate)
        subprocess.run([
            'ffmpeg', '-y', '-loglevel', 'error', '-i', str(wav),
            '-codec:a', 'libmp3lame', '-b:a', '80k', str(mp3),
        ], check=True)
        wav.unlink()
        item = {
            'voice': voice, 'language': language, 'speed': SPEED,
            'text': TEXT, 'path': str(mp3), 'duration': len(samples) / rate,
        }
        manifest.append(item)
        print(json.dumps(item), flush=True)
    (OUTPUT / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')


if __name__ == '__main__':
    main()
