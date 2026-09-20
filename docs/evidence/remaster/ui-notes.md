# Illustrated controls and language dock

Replaced the shared inline SVG icon renderer with one transparent, generated 5×5 toy-illustration atlas at `/ui/toy-icons.png`. Every control, word card, object marker, and passenger/seat choice uses the same artwork family. Coral, blue, and yellow friends retain their identity in occupied seats.

Destination selection uses cached PNG thumbnails rendered from the actual 3D world, replacing the old schematic SVG pictures.

Every destination now has three always-available 64×64 CSS-pixel practice buttons throughout driving, helping, riding, and completion:

- Meadow: train, sheep, bridge.
- Station: train, hello friend, sit down.
- Orchard: train, apple, apple please.

Buttons model the selected parent phrase length and safely release any held driving input. No speaking requirement or assessment was added. Optional word book and phrase replay remain. Renamed the bell control to the train whistle. Removed the CSS pretend boiler; cab framing leaves room for the real 3D engine.

Checked strict TypeScript and an 844×390 Chromium development preview in named agent-browser session `train-ui-remaster`: generated artwork renders correctly, meadow Sheep button selects “Hello, sheep.”, and station exposes three 64×64 practice buttons. Final integrated gameplay and physical-device acceptance remain the parent task's verification scope. This is software/browser evidence, not a 60 FPS iPhone acceptance claim.
