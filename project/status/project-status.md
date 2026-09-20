# Current status — September 20, 2026

Public GitHub repository: https://github.com/Raynos/low-poly-train-game (main).
Live app: https://low-poly-train-game.vercel.app. Playtest fixes published as
deployment dpl_FbishhAbjDjkEX9GY41zE24ETKiH; PWA build a082b6f24dfeef39.

Implemented follow-up fixes:
- Wildshard-inspired HalfFloat HDR, AgX and MSAA/SMAA with1.5–2× bounded render scale.
- Measured icon crops and corrected small-landscape play/drive button sizes.
- Clearly visible larger apples outside orchard foliage.
- All60 bundled English clips use Nicole (af_nicole); generator/docs updated.
- Passengers and crates attach to carriage local coordinates, preventing trailing/sliding.
- Sheep/tree/water/bridge discovery targets available across all three destinations.
- Generated-art success dialog, Back to menu, optional replay and look-around dismissal.

Strict typing,20 unit tests and build pass.17 WebKit checks passed, including Retina HDR,
world phrases across visits, menu return and all60 Nicole decodes. 47 Chromium checks passed, including stable passenger seats and full offline restart.
WebKit origin-failure offline startup passed. All47 live Chromium checks also passed,
including both completed journeys, stable seating, main-menu return and offline restart. All automated checks muted; no speaker playback.

Physical iPhone/iPad sustained60FPS, memory, speaker balance, Safari interruptions and supervised
age-three engagement remain unverified. World-animation ideas were proposed, not implemented.
Guided travel remains one loop. No therapy or Montessori certification claims.
