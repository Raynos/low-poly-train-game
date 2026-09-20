# Bundled neural narration

The user selected **Kokoro af_nicole (Nicole)** after a five-voice audition.
Bundled narration uses American English at speed 0.92, replacing the earlier af_heart clips.
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

Nicole regeneration verified all 60 MP3s with ffprobe and full ffmpeg PCM decode:
1.106–1.938 seconds per clip, 89.016 seconds total, 941,820 bytes. Every clip contains
non-silent finite audio; the largest decoded absolute sample is 0.832 or less, with
no clipping detected. This is a file-integrity check, not a listening assessment.

Browser decode checks establish file usability, not pronunciation quality. Caregiver
listening on the child's actual device remains the acceptance check for clarity and warmth.
