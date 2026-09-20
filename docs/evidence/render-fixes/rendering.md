# Edge clarity and HDR follow-up

Compared against the actual local Wildshard singleplayer implementation:
`src/core/Game.ts` uses a HalfFloat composer, AgX tone mapping and SMAA. Its resolution
settings are in `src/core/tier.ts`. This game now uses Three.js's bundled equivalents
without adding remote assets or importing Wildshard's heavier atmosphere effects.

The first SMAA-only screen review still showed visible stepping at devicePixelRatio1.
The final pipeline adds up to4x MSAA on the HDR scene target before SMAA, and uses a
1.5 minimum render scale /2 maximum with a6M-pixel ceiling. OutputPass applies AgX
and sRGB conversion once after linear-space SMAA. Devices without float render-target
support use byte buffers, MSAA and FXAA after output conversion.

Resize updates renderer/composer dimensions together. Place thumbnails use multisampled
HDR and the same tone-map/output conversion. Renderer statistics include all post passes.
Debug snapshots expose actual ratio, dimensions, HDR support, sample count and AA mode.
SMAA lookup textures are embedded in the JS bundle and remain offline.

Initial screenshot review at844×390 confirms much smoother rails, roof and boiler outlines
after MSAA plus supersampling. Final browser performance/compatibility checks follow.
Physical iPhone/iPad frame-time and memory acceptance still require device measurement.

## Integrated acceptance

- Strict types,20 unit tests and production build passed.
- Chromium:47 checks passed, including world sheep/tree phrases in all visits, fixed carriage-local
  passenger positions before/after travel, illustrated success dialogs, main-menu return,
  dismissal without reopening, all practice phases and offline restart.
- WebKit:17 checks passed at844×390 with DPR2, including HDR render quality and all60
  Nicole MP3 decodes. Fresh-document startup with unavailable origin also passed. Playwright
  WebKit setOffline reload retains its prior internal error and is not claimed as a pass.
- Measured desktop Chromium frame intervals: {'median': 16.69999999999709, 'p95': 16.700000000004366}. Full rendering stats
  include composer passes; see chromium.json for the snapshot. Not physical-mobile evidence.
- All automated browser/audio verification remained muted. No user-computer speaker playback.

Published production build a082b6f24dfeef39 as deployment dpl_FbishhAbjDjkEX9GY41zE24ETKiH.
Public asset hashes match the local build, including Nicole samples and the generated success
artwork. GitHub is public at https://github.com/Raynos/low-poly-train-game.

All47 production-origin Chromium checks passed after publication, with every browser session
closed afterward. Full report: public-chromium.json. No audio playback was used.
