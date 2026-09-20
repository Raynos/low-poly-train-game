# Train soundscape — September 20, 2026

Replaced the single sine-wave engine and musical bell with a quiet synthesized steam train:

- Two warm steam breaths per wheel cycle, with a rounded double rail-joint clack.
- Continuous cadence follows simulation speed (0–4.2), plus a soft low rolling tone.
- Normal drive release fades rolling sound and gives a brief pressure-release hiss.
- Existing `bell()` API now plays a rounded, two-part steam whistle. The API remains compatible;
  the visible control should be named Train whistle.
- All train effects duck to 20% while an HTML narration clip is playing, then recover gently.

The wheel texture and hiss are generated once into mono buffers. Movement uses a looping buffer
and one low oscillator; it does not allocate new nodes each frame. Whistle taps are rate-limited
and release hisses have a cooldown. Completed transient nodes disconnect. This needs no remote
service, fetched effects, microphone, speech recognition, or extra audio files to cache.

`stop()` immediately zeros the effects master, cancels motion gain changes, stops and disconnects
all transient sources, and pauses narration. It deliberately does not generate a release hiss;
ordinary `update(0)` during play does. Muting clears running audio. `?mute=1` creates no AudioContext
and never calls media playback, including when the whistle is tapped.

## Validation

- `pnpm check`: passed strict TypeScript, all 20 existing tests, and production/PWA build.
- Focused Node 24 WebAudio/media test doubles: passed silent-mode context/media exclusion,
  increasing wheel cadence with speed, narration duck/recovery, release hiss, repeated-whistle
  bounds, immediate cancellation/disconnection on stop, idle-after-stop silence, and muting while
  effects are running. No actual speaker output was used for automated verification.
- No deployment performed.

## Acceptance still needed

Listen with caregivers on the intended iPhone/iPad to tune warmth, loudness, and clarity under
narration. Test Safari/standalone gesture unlock and interruptions on physical devices. Graph
and lifecycle assertions establish control behavior, not subjective sound quality or device
speaker acceptance. The engine is a stylized steam train, not a recording of a particular model.
