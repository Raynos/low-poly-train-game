# Round 1 — entry screen concept prompts

Generated with built-in `image_gen` on 2026-09-20. These images are approval concepts, not screenshots of implemented gameplay or performance evidence. All images were visually inspected after generation.

## 01-main-menu.png

Saved path: `assets/design/round-1/01-main-menu.png`

Exact prompt:

```text
Use case: ui-mockup
Asset type: approval concept, game MAIN MENU screenshot, landscape 16:9, 1920x1080 composition.
Primary request: main menu for "Little Train", a calm Montessori-inspired low-poly toddler train simulator for age three. Looks like an achievable Three.js game screenshot, simple visible polygon facets and flat matte toy shapes, not a cinematic painting.
Scene: sage-green meadow with one simple curving wooden railway, rounded low-poly trees and distant pale hills. Chunky teal toy locomotive with ochre boiler, cream cab roof, dark wheels, a small cream wagon. Train is the inviting hero, three-quarter side view at center-left.
Interface: warm cream title "Little Train" at upper center, understated rounded dark teal lettering. One enormous circular warm cream button with a solid dark teal PLAY TRIANGLE at lower center, fully clear against calm ground. Small parent settings cog in warm cream circle upper right, still visibly finger-sized. No other buttons.
Lighting: soft daylight, gentle contact shadows, quiet natural color palette. Full-bleed landscape game view with comfortable safe margins, no device frame.
Constraints: pictorial interaction understandable without reading, no scores, timers, rewards, locks, currency, progress levels, characters, ads, popups, watermarks or annotations. No decorative floating UI. Keep composition uncluttered.
```

## 02-loading.png

Saved path: `assets/design/round-1/02-loading.png`

Exact prompt:

```text
Use case: ui-mockup
Asset type: approval concept, toddler game LOADING SCREEN screenshot, landscape 16:9, 1920x1080 composition.
Primary request: a quiet noninteractive loading screen for a Montessori-inspired low-poly train simulator for age three, simple enough to understand without reading.
Scene: flat warm cream full-screen background, a small island of sage grass in the center, very simple low-poly toy locomotive shown in side profile: teal cab and chassis, ochre boiler, cream roof, dark wheels, one cream wagon. Two low-poly trees and one pale cloud only.
Interface: beneath the small scene, one long simple horizontal railroad-shaped progress indicator, dark teal completed rails over the left two thirds, pale sage remaining rails on the right third; simple evenly spaced ties. A tiny teal locomotive-shaped marker at the end of completed portion, moving left to right. Loading information is conveyed only by this progress track. No text, percentage, buttons, spinner, icons or labels.
Style: achievable low-poly Three.js screenshot-like concept, crisp polygons, matte toy surfaces and gentle soft daylight, calm restrained composition, large generous blank areas. Full bleed no device frame.
Constraints: no timers, scores, locks, currencies, faces, characters, reward effects, confetti, watermarks or concept annotations. Progress is preparation only, never a countdown.
```

## 03-level-selector.png

Saved path: `assets/design/round-1/03-level-selector.png`

Exact prompt:

```text
Use case: ui-mockup
Asset type: approval concept, game DESTINATION SELECTOR screenshot, landscape 16:9.
Primary request: an entirely pictorial level selector for a Montessori-inspired low-poly toddler train simulator for age three. The child chooses freely between three destinations, equally accessible without progression.
Composition: warm cream full-screen background. Three very large equally sized rounded cream cards in one horizontal row, generous separation and margins, with softly shaded edges. Card interiors contain simple cheerful low-poly 3D toy railway dioramas. LEFT: sage meadow with small wooden railway loop, meadow flowers and two trees. CENTER: small familiar cream train station with ochre roof, low platform and straight wooden railway. RIGHT: orchard with three low-poly apple trees, large clearly visible red apples, wooden railway curve. Each card includes the SAME chunky teal toy locomotive with ochre boiler, cream cab roof, dark wheels and one cream wagon. Each card has ONE broad teal play triangle in its lower section. A cream circular back-arrow button in upper left, comfortably large. No header or other text.
Style: achievable crisp low-poly Three.js game screenshot, matte surfaces, simple polygons, soft daylight, pale sage and teal and ochre palette, calm orderly shapes, little detail. Landscape full bleed, no device frame. Child sees three distinct and familiar places at a glance.
Constraints: no words, labels, numbers, scores, progress, stars, reward badges, locks, currencies, timelines, checkmarks, characters, ads, watermarks or annotations. Each choice looks equally active. Cards readable at small phone size.
```

## Review notes

- Main menu: strong primary play affordance; the image includes more environmental detail and texture than a minimal real-time implementation needs. Parent settings location is provisional.
- Loading: quiet preparation state; progress track is not a timer. Production behavior must reflect actual loading/cache preparation, with recovery handled separately.
- Selector: three equally available pictorial destinations. Entire cards should be touch targets; play triangles are secondary cues within each card.
- Train proportions, wheel counts, boiler color coverage and detailing drift between generated screens. A single approved procedural model must replace these concept variations.
- Landscape art is not proof of 64 CSS pixel hit targets, device safe areas, age-three comprehension, 60 FPS or offline operation. Physical-device and supervised play checks remain pending.
- Station's decorative clock is scenery, not a countdown or timed activity.
