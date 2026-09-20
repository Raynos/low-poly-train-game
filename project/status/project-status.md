# Current status — September 20, 2026

Remaster deployed to https://low-poly-train-game.vercel.app.
Production deployment: dpl_FpYVgPnifuazoaHxaaGuQ1TPLFc6; PWA build de0daca5bea8d832.

Three graphics passes improved the train/materials, landscape/lighting and illustrated
controls/camera framing. Shared generated toy-icon atlas replaces runtime SVG controls;
loading/app icon is generated too. Place cards use cached views of the actual 3D scene.
Single camera button retains overview/follow/cab, with real boiler visible in the cab.

All three destinations have persistent contextual word-practice buttons in every phase.
60 local Kokoro af_heart English voice clips replace macOS speech; no runtime model/network
needed. Train has speed-linked chuffs, rail clacks, rumble, stop hiss and a soft whistle,
with speech ducking and lifecycle silence. Core choices and finish-to-selector are preserved.

Strict types, 20 unit tests, 36 local Chromium gameplay/word/offline checks, 14 WebKit
checks (including all neural clip decodes), and six PWA lifecycle checks passed. Final
WebKit build starts a fresh cached document with origin unavailable. Playwright WebKit
setOffline reload still errors and is not claimed as a pass. All 36 live Chromium checks passed, including complete visits, word practice and offline restart.
Reports are in docs/evidence/remaster; all headless checks were muted.

Real iPhone/iPad sustained 60 FPS, listening/balance, Safari audio interruptions and supervised
age-three play remain acceptance work. Guided travel remains one loop without switches.
No therapeutic or Montessori certification claims. See docs/LANGUAGE-PLAY.md.
