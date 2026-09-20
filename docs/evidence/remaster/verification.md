# Remaster verification — September 20, 2026

Three implementation passes:

1. Locomotive and rolling stock: physical-looking rough materials, boiler bands and rivets,
   headlamp/buffers/handrails, curved faceted roof, wheel spokes/hubs, wagon battens/seats,
   and faces/hats/scarves for passengers. Cab is a separate assembly for first-person view.
2. Landscape and light: layered terrain, curved river, reeds/rocks/flowers, detailed station
   and orchard, ACES lighting and moving sun shadows. `pass-2/` holds integrated browser
   captures. Its close cab view exposed a real visibility problem, rather than a passing result.
3. Composition and illustration: improved follow framing, higher cab viewpoint with the actual
   engine lower in frame, cloud shading cleanup, generated icon atlas and scene-derived place
   cards. CSS trims atlas edges to prevent neighboring sprites peeking into buttons. Persistent
   contextual practice buttons remain usable in each destination and activity phase.

Artwork provenance is in docs/design/remaster/ICON-PROMPT.md. Neural narration generation
is in docs/design/remaster/VOICE.md. Sound graph checks are in sound-notes.md.

Initial integrated local verification passed strict types, 20 unit tests, 20 Chromium gameplay/
offline checks and 14 WebKit checks including all 60 neural MP3 decodes. Desktop Chromium
captured median and p95 frame intervals of 16.7ms, 37 renderer calls and 125,159 triangles in
the measured scene; these are desktop observations, not physical-phone performance claims.
Browser tests run muted and do not establish listening quality.

Final checks and deployment are recorded below when complete. Real iPhone/iPad performance,
speaker balance/voice listening, and supervised toddler acceptance remain unverified.

## Final build

- `pnpm check` passed; final asset/camera build is `de0daca5bea8d832`, 70 precached local files,
  approximately 4.1 MiB emitted total, including approximately 936 KiB of bundled speech.
- Expanded Chromium suite: 36 local checks passed. In addition to all prior behavior, each
  destination has three illustrated 64px word buttons, and model playback updates phrase
  state in driving/helping/riding/finished phases as applicable.
- Six two-version PWA lifecycle checks passed. Final WebKit origin-failure restart passed.
- Production deployment `dpl_FpYVgPnifuazoaHxaaGuQ1TPLFc6` is ready at the public alias.
  `public-assets.json` records byte-identical generated atlas/app icon, sampled neural clips
  and service worker versus the local emitted build.
- First live Chromium run hit a CLI process timeout after the command had already returned
  successful JSON showing the expected station state. This run is not counted as a pass;
  a fresh-session full rerun was started.

- Fresh-session live rerun passed all 36 checks, including both full task journeys, contextual
  word buttons and offline restart. Final public screenshots are in `public/`. The final
  orchard capture was visually checked: its three picking targets sit below the practice dock.
  All verification browser sessions closed. Physical-device and listening limitations remain.
