# Little Train

Read BRIEF.md, project/status/project-status.md, and project/TASK_LIST.md before changes.
Based on ../low-poly-fire-truck. The first approved game is implemented and deployed.
Read docs/LANGUAGE-PLAY.md before changing narration or language interactions.
Preserve meaningful object choices and finish-to-selector flow; see docs/design/AUDIT-LEARNINGS.md.

- Age three, Montessori-inspired: calm child-directed repetition, concrete cause and effect.
  No scores, timers, failure, ads, purchases, accounts, or reading-dependent play.
- Landscape iPhone/iPad Safari first. Large icon-led controls, at least 64 CSS pixels.
- pnpm, strict TypeScript, Three.js, Vite, Node 24+. Run pnpm check.
- Commit early and often. Initialize Git when scaffolding a new project, and make small,
  coherent commits at meaningful checkpoints instead of leaving an entire feature or release
  uncommitted. Review staged changes and run checks appropriate to each change before committing.
  Commit source, intentional game assets, lockfiles and project documentation; keep credentials,
  dependencies, build output, temporary models and local deployment state out of Git.
- Separate simulation from rendering. Fixed 60 Hz steps with bounded catch-up. 60 FPS is a
  target until measured on named physical devices; browser emulation is not iOS acceptance.
- Clear held input on cancellation, lost capture, blur, visibility and rotation.
- Preserve versioned complete offline caching and non-interrupting updates; read docs/PWA.md.
- Before major visual development, generate and compare mockups per docs/design/MOCKUPS.md.
  Keep concept artwork separate from running-game evidence.
- Record requests in docs/tasks/ASKS.md; maintain project/TASK_LIST.md and replace status in place.
- Never copy credentials, sessions, caches, personal tools, project trust or deployment linkage.
- Use named browser sessions and close after testing. Do not push or deploy unless asked.
