# Bundled neural narration

Replaced macOS Samantha with **Kokoro af_heart**, American English, speed 0.92.
All 60 phrases come directly from `src/audio/phrases.ts`; no duplicate vocabulary bank.
Runtime uses small MP3s, with no model download, API calls, microphone, or paid service.

Build dependencies: Python 3.12, kokoro-onnx==0.4.9, soundfile, numpy, ffmpeg.
Create a venv at `tmp/kokoro/venv` and install the Python dependencies there.
Download into ignored `tmp/kokoro`:

- [ONNX model](https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.1/kokoro-v1.0.onnx) as `model.onnx`.
- [Voice bank](https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.1/voices-v1.0.bin) as `voices.bin`.

Run `node scripts/generate-voice.mjs --preview` for a combined sample, then
`node scripts/generate-voice.mjs` for all clips. MP3 export is 80kbps with 70ms leading
and 140ms trailing padding and peak normalization to 0.84 before encoding.
The generator adapts the speed tensor to the ONNX export's declared float input.

[Kokoro model card](https://huggingface.co/hexgrad/Kokoro-82M) describes the Apache-2.0
model license. [kokoro-onnx](https://github.com/thewh1teagle/kokoro-onnx) uses MIT.
[Voice reference](https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md).
Models and build environment are not shipped. Generated clips are not recordings of a child.

Browser decode checks establish file usability, not pronunciation quality. Caregiver
listening on the child's actual device remains the acceptance check for clarity and warmth.
