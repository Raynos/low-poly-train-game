# Release verification — September 20, 2026

Actual running-game evidence, separate from generated concepts.

- pnpm check: strict TypeScript, 20 simulation/worker tests and production build passed.
- Chromium: 20 end-to-end checks passed on local production preview, 844×390. Includes
  all camera views, pointer hold/release, cancellation/lost capture, blur/resize, choices,
  complete loaded journeys, finish-to-selector, offline reload/play and a cached English clip.
- WebKit: three visits, touch choices, all camera views, preference persistence and decoding
  all 60 MP3s passed. No uncaught errors. All headless runs kept audio silent.
- PWA lifecycle: six checks passed, including old/new complete caches, waiting updates,
  no interruption during play, offline old-version boot and safe next-version activation.
- WebKit unavailable-origin check: fresh document successfully launched from installed
  cache when the server disconnected. Playwright's additional setOffline(true) reload
  returned an internal WebKit error and did not create a new document. That emulation path
  is not counted as a pass. Real Safari airplane-mode/standalone validation remains open.
- Representative Chromium rolling sample: median 16.7 ms, p95 16.8 ms, roughly 22 draw calls
  and 35k triangles. Desktop sample only, not mobile performance certification.

Vercel production deployment dpl_Ek2LV9PmyLe2GPUzXdrDgpzza7s6 is Ready:
https://low-poly-train-game.vercel.app
Build 09ab3aa7a1a19f5c includes 70 precached files (60 are English speech clips).

Still required: named physical iPhone/iPad, listening clarity and loudness, installed offline
voice playback, sustained frame time/memory, child observation and language target review.
Narration is synthesized English; no therapeutic efficacy or speech assessment was tested.
The Vite warning is the bundled Three.js chunk (~574 KB / 149 KB gzip), not a build failure.

Public deployment: all 20 Chromium checks passed again against the public URL, including
complete station/orchard visits, camera cycle, cached narration fetch and fresh offline play.
See public-report.json.

Additional public Chromium media check: after a real play-button gesture and disabling
networking, /audio/en/please-1.mp3 played through to its ended event (1.213696 seconds)
with audio.muted=true. This verifies offline browser playback without emitting sound;
it does not assess pronunciation quality or physical-device speaker volume. A pre-gesture
attempt was correctly blocked by browser autoplay policy.
