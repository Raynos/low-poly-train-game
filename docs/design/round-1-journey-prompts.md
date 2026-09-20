# Journey concept prompts — round 1

Generated 2026-09-20 with built-in `image_gen.imagegen`, three separate calls. These are concept artwork, not screenshots of a running game or acceptance evidence. Source files are preserved under `/Users/raynos/.codex/generated_images/01a0c0b5-bf94-7422-8e11-0b4d270bd89c/`.

## 04 — Meadow driving

Output: `assets/design/round-1/04-meadow-driving.png`
Source: `exec-4fc53417-16a5-471e-8017-065d30fb0bfe.png`
No image reference supplied.

```text
Use case: ui-mockup.
Create one landscape 16:9 screenshot-style concept for Little Train, a calm Montessori-inspired train driving game for age three. No device frame, no title, no text. This is a plausible simple procedural low-poly Three.js game rather than elaborate illustration.
Scene: elevated toy-world overview of a single complete gently oval railway loop on soft sage meadow ground, one tiny cream station near the distant right of the loop, three chunky angular trees, very few flowers, uncluttered pale blue sky strip. Camera three-quarter elevated, whole loop legible. In foreground center-left is a chunky teal toy locomotive with ochre cylindrical boiler, cream cab roof, four dark wheels, pulling one empty ochre open wagon. Recognizable rounded block primitives, flat colors, soft daylight shadows.
Interface: cream circular pause control inset top right with two dark teal bars, visually at least 64 CSS px for a landscape phone. ONE oversized circular green hold-to-go control inset bottom right occupying about one-sixth of screen height, thick cream rim and a simple cream forward triangle, subtle pressed inset appearance. No additional driving controls.
Composition: world uses most of screen; train and track never hidden under controls; comfortable safe margins. Clear direct cause and effect of forward train movement with one tiny steam puff, no motion blur. Calm, orderly, tactile toy aesthetic with crisp low-poly geometry.
Avoid: text, numbers, labels, scores, timers, coins, stars, ads, accounts, purchases, victory effects, steering wheel, cockpit, roads, locomotives with faces, excessive scenery, photorealism.
```

## 05 — Station arrival

Output: `assets/design/round-1/05-station-arrival.png`
Source: `exec-f95cad28-a736-4714-80be-0a7916530f79.png`
Reference: prior meadow concept via `num_last_images_to_include: 1`.

```text
Use case: ui-mockup.
Create one landscape 16:9 screenshot-style concept for Little Train, a calm Montessori-inspired train driving game for age three. Match the immediately preceding toy railway meadow image as the SAME GAME, train, world, elevated camera, palette, framing, and interface. This second moment is station arrival. Train is now stopped on the upper-right curved section of the single complete oval track alongside the tiny cream station's long platform. Locomotive chunky teal body, ochre cylindrical boiler, cream cab roof, dark wheels, one empty ochre open wagon behind it. Maintain realistically aligned wheels on rails and wagon in line following the same track.
Show a broad pale cream stopping area beside the platform, one simple friendly wooden bench and one small faceted tree nearby. Train close enough to the platform for the cause and effect to be concrete, but no people or additional tasks. Whole loop remains visible in the elevated toy-world overview. Terrain soft sage, pale sky, sparse angular green trees, soft daylight. Achievable procedural low-poly geometry.
Interface unchanged: cream circular pause inset top right with two teal bars and ONE oversized circular green hold-to-go button inset bottom right, thick cream rim and cream forward triangle. Button has visibly raised resting state, train no steam to suggest released control and stopping. No written instructions or stop button.
Avoid text, numbers, scores, timers, coins, stars, checkmarks, banners, dialog overlays, success badges, confetti, steering wheel, extra UI, photorealism, clutter.
```

## 06 — Orchard loading

Output: `assets/design/round-1/06-orchard-loading.png`
Source: `exec-614cb60a-a486-48f5-bccb-4404edd4ed2b.png`
References: meadow and station concepts via `num_last_images_to_include: 2`.

```text
Use case: ui-mockup.
Create one landscape 16:9 screenshot-style concept for Little Train, a calm Montessori-inspired train driving game for age three. The two recent reference images define the same game: chunky teal locomotive, ochre cylindrical boiler, cream cab roof, dark wheels, ochre open wagon, sage terrain, achievable simple low-poly toy shapes, soft daylight, cream UI. This concept explores a new optional apple-loading activity; same elevated three-quarter camera direction but framed closer so toddler can see concrete objects.
Scene: locomotive facing right stopped center right on one continuous railway with its ochre open wagon centered. Beside the wagon on an accessible low cream orchard platform at center-left are exactly THREE chunky wooden crates, each with a few large red apples. Each crate is a discrete concrete object. The empty wagon clearly has room for three crates in a row, matching tan wood and one simple red apple pictogram on its side. Behind platform just three chunky faceted apple trees, sparse distant meadow and track, no elaborate scenery. No workers, no crane.
Interface: cream circular pause button inset top right with two dark teal bars, same position and size as reference. Primary control is a SINGLE oversized cream circular button inset bottom right with a vivid red apple in a small wooden crate and a dark teal downward arrow as its pictorial load action. Its meaning: one tap transfers one crate into the wagon; no drag gesture and no simultaneous drive button. No other controls, no text. Crates, wagon and primary button should be visually obvious at landscape phone size.
Constraints: calm child-led repeatable action, no scores, timers, numbers, currencies, written instructions, stars, check marks, win banners, sparkles, confetti, hand cursor, device frame or photorealism. Preserve restrained low-poly procedural aesthetic and same exact train identity.
```

## Visual review and limitations

All three outputs were visually inspected inline. The train identity, palette and control corner positions are consistent. Screens contain no text, scores or timers. Orchard clearly shows three crates, a matching apple wagon and one primary loading action. The generated train uses three visible locomotive wheels rather than the initial four-wheel request; the consistent silhouette is acceptable for this exploratory pass.

Station overview makes the train much smaller; this directly exposes a concern with whole-loop framing on a phone. A closer stationary camera or less perspective would improve legibility. The image cannot prove the hold versus tap affordance: that requires an interactive prototype and supervised age-three play. Pause appears roughly 50 CSS px when scaled to an 844px-wide phone, so implementation must enlarge it to the required 64px minimum independently of raster artwork. Orchard is a closer framing and an optional unapproved activity; its camera transition and a way to freely leave the activity remain design decisions. Its steam puff does not imply actual motion. Its wagon also needs wider or smaller crates for a physically believable three-crate fit. No runtime code was changed.
