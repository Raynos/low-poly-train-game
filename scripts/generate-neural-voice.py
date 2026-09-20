"""Offline build tool. Install kokoro-onnx==0.4.9 and soundfile; models stay in ignored tmp/."""
import argparse
import json
import re
import subprocess
from pathlib import Path
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

parser = argparse.ArgumentParser()
parser.add_argument('--preview', action='store_true')
args = parser.parse_args()
root = Path(__file__).resolve().parent.parent
model_dir = root / 'tmp/kokoro'
kokoro = Kokoro(str(model_dir / 'model.onnx'), str(model_dir / 'voices.bin'))
# The v1.1 ONNX export requires float speed, while kokoro-onnx 0.4.9 supplies int32
# for input_ids exports. Normalize to the model's declared input type at this boundary.
run_session = kokoro.sess.run
speed_type = next(item.type for item in kokoro.sess.get_inputs() if item.name == 'speed')
def run_typed(outputs, inputs, *rest, **kwargs):
    if speed_type == 'tensor(float)':
        inputs = {**inputs, 'speed': np.asarray([0.92], dtype=np.float32)}
    return run_session(outputs, inputs, *rest, **kwargs)
kokoro.sess.run = run_typed
source = (root / 'src/audio/phrases.ts').read_text()
phrases = json.loads(re.search(r'PHRASES = (\{.*?\}) as const', source, re.S).group(1))
output = root / ('tmp/voice-preview' if args.preview else 'public/audio/en')
output.mkdir(parents=True, exist_ok=True)
entries = [('preview', 0, 'Hello, friend! Go, little train! An apple, please. Thank you for helping.')] if args.preview else [(key, i, text) for key, texts in phrases.items() for i, text in enumerate(texts)]
for key, i, text in entries:
    samples, rate = kokoro.create(text, voice='af_heart', speed=0.92, lang='en-us')
    # Keep natural pauses; pad edges so mobile decoding never clips the first consonant.
    samples = np.concatenate((np.zeros(int(rate * 0.07)), samples, np.zeros(int(rate * 0.14))))
    peak = np.max(np.abs(samples))
    if peak > 0: samples = samples * (0.84 / peak)
    temp = model_dir / f'{key}-{i}.wav'
    sf.write(str(temp), samples, rate)
    dest = output / f'{key}-{i}.mp3'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(temp), '-codec:a', 'libmp3lame', '-b:a', '80k', str(dest)], check=True)
    print(f'{key}-{i}: {len(samples) / rate:.2f}s', flush=True)
print('Voice: Kokoro af_heart, American English, speed 0.92. No runtime model dependency.')
