# Little Train

**Play: https://low-poly-train-game.vercel.app**

A calm low-poly toy railway for three-year-olds, with optional English language play.
Inspired by the approved concepts in assets/design/round-1 and the sibling fire truck
project's PWA foundation. No accounts, ads, scores, timers, microphone or remote game assets.

## Play

Choose a place. Hold the green button to drive; release to stop. One camera button cycles
**overview → follow → cab** without changing the journey.

- **Meadow:** drive freely, ring the bell, and tap sheep, tree, water and bridge discoveries.
- **Station:** stop, choose each friend and a seat, then take everyone around the railway.
- **Orchard:** choose trees to pick three apples, then carry the fruit to the station.

Finished visits return to destination selection through “Where next?”. Every place remains
available, including repeats. Pause, leave or stop at any point. Keyboard Space also drives.

Words follow the action. Tap the speaker to hear a phrase again, or the book for optional
social phrases. Grown-up settings offer single words, short phrases, little sentences,
sound, spoken words, and gentler motion. Narration is synthesized English and bundled offline.
See docs/LANGUAGE-PLAY.md for sources, approach and limits: shared-play support, not therapy.

## Develop and verify

Node 24+, pnpm 10.21.0.

```sh
pnpm install
pnpm dev
pnpm check
pnpm preview --host 127.0.0.1 --port 4187
pnpm check:browser
pnpm check:pwa
pnpm check:webkit
```

Browser tests require agent-browser. WebKit uses Playwright's WebKit installation.
Use `?debug=1&mute=1` for read-only diagnostics and silent headless testing. No diagnostic
API can skip gameplay or modify simulation. Only parent preferences use local storage.

## Offline and installation

Production registers a versioned service worker. After “Ready to play offline”, the whole
game and all 60 voice clips can launch without a network. Development mode does not install
the worker. Updates wait until all game windows close, never reloading active play. HTTPS
or localhost is required. Safari Share → Add to Home Screen installs the app. Device storage
can be evicted; readiness is checked again when reopening. In-progress visits reset on reload.

## Project map

- src/game/train.ts: pure fixed-step journey and activity state.
- src/render/: procedural environment, train, wagon and camera modes.
- src/main.ts / src/ui/: screens, touch lifecycle, choices and phrase controls.
- src/audio/: gesture-unlocked sound and contextual language models.
- public/audio/en/: complete offline speech library.
- docs/design/: approved concepts, prompts, and fire truck audit learnings.
- docs/evidence/: actual runtime verification, separate from concept art.

60 FPS is the target. Desktop frame timings, touch emulation and WebKit are not physical
Safari or toddler usability acceptance. Driving is guided on one loop; free track switching
is not implemented. Baseline device selection and supervised child observation remain open.
