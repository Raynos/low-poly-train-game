# Icon centering — September 20, 2026

The generated atlas does not have precisely equal cells: the lower rows cross the
assumed grid boundaries and most silhouettes sit away from the cell midpoint.
Each of the 25 icons now uses measured opaque artwork bounds with a three-pixel
antialias margin, fits its longest side to 88% of its icon box, and sits in a
centered grid. The play triangle has a small optical correction. No artwork was
regenerated or resampled; every screen still shares one offline-cached image.

A separate CSS specificity issue reduced the play and driving buttons to 64px
on short landscape screens while retaining their larger artwork. Explicit sizes
restore the 96px menu button and 92px driving button on phones (122px/108px on
taller screens). Other game controls retain their existing 64px minimum targets.

Validation: strict TypeScript passed. A named, muted Chromium session at 844×390
was used to inspect the menu, gameplay controls, word-practice dock, words modal
and a temporary contact sheet of all 25 icons. That inspection caught and removed
an adjacent station-lamp fragment from the crate crop. The session was closed.
This verifies browser layout, not physical-device acceptance.
