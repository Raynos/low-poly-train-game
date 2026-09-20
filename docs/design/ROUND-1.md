# Round 1 — concepts for approval

Generated mockups, not screenshots of implemented gameplay. The user approved this set on September 20, 2026; implementation and deployment followed. Eight separate images were generated and visually inspected
using the built-in imagegen tool across three child agents.

## Screen flow

1. Main menu: one dominant pictorial play action.
2. Loading: clear progress with a calm train motif.
3. Level selector: three illustrated places, no locks or scores.
4. Meadow driving: toy-world overview, hold to go and release to stop.
5. Station arrival: same world and controls, recognizable place to stop.
6. Orchard loading: one concrete cargo action, visible effect on the train.
7. Follow camera: closer external driving alternative.
8. Driver's cab: simple first-person simulator alternative.

The first three gameplay frames explore a coherent overview journey. The last two compare
camera/control directions; they are alternatives, not a five-level commitment. Orchard cargo was approved in the full-set approval. Text on concepts is supplementary; a child
must be able to act through pictures and direct cause-and-effect.

## Review decisions

- Preferred driving view: overview, follow, or driver's cab.
- Train silhouette, palette and scenery density.
- Whether main menu and destination selection feel clear at phone size.
- Hold/release versus a physical-looking lever; no precision dragging should be required.
- Whether station/cargo activities belong in the first playable.

A concept can propose a progress display, but production progress must reflect real loading
work. PWA readiness, touch ergonomics and frame rate require implementation tests later.
The generated screenshots do not establish usability or 60 FPS performance.

## Files and provenance

Review gallery: [review.html](../../assets/design/round-1/review.html).

- [Entry screen prompts](round-1-entry-prompts.md)
- [Journey prompts](round-1-journey-prompts.md)
- [Camera prompts](round-1-camera-prompts.md)

Round-one review notes: unify train proportions across the selected screens; keep the
train larger at the station; standardize pause placement and phone-size touch targets.
Follow-camera rails contain generated geometry artifacts. Cab controls need safe-area
spacing. These are direction concepts, not production-ready screen specifications.
