import { PHRASES } from './phrases.ts';
import type { Word } from './phrases.ts';
export interface Preferences { sound: boolean; speech: boolean; length: 0 | 1 | 2; reduced: boolean; }

/** A small, entirely offline steam train: looping textures, never a per-frame node queue. */
export class Sound {
  private audio = new Audio();
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private duck: GainNode | null = null;
  private motion: GainNode | null = null;
  private wheels: AudioBufferSourceNode | null = null;
  private rumble: OscillatorNode | null = null;
  private hiss: AudioBuffer | null = null;
  private activeEffects = new Set<AudioScheduledSourceNode>();
  private lastSpeed = 0;
  private lastWhistle = -10000;
  private lastHiss = -10000;
  private lastSpoken = -10000;
  private unlocked = false;
  private silent: boolean;
  word: Word = 'train';
  preferences: Preferences;
  private onPhrase: (text: string) => void;

  constructor(preferences: Preferences, onPhrase: (text: string) => void) {
    this.preferences = preferences; this.onPhrase = onPhrase;
    // No context, destination connection, or media playback exists in headless QA mode.
    this.silent = new URLSearchParams(location.search).has('mute');
    this.audio.volume = 0.75;
    for (const event of ['playing', 'pause', 'ended', 'error']) {
      this.audio.addEventListener(event, () => this.duckNarration());
    }
  }

  private duckNarration() {
    if (!this.context || !this.duck) return;
    const speaking = !this.audio.paused && !this.audio.ended;
    this.duck.gain.setTargetAtTime(speaking ? 0.2 : 1, this.context.currentTime, speaking ? 0.025 : 0.18);
  }

  private initialize() {
    const context = new AudioContext();
    this.context = context;
    const master = this.master = context.createGain();
    const duck = this.duck = context.createGain();
    const motion = this.motion = context.createGain();
    master.gain.value = 0; motion.gain.value = 0;
    motion.connect(duck); duck.connect(master); master.connect(context.destination);

    // One second represents one wheel cycle. Steam breaths and the double rail joint
    // are synthesized once; playbackRate controls cadence continuously with train speed.
    const cycle = context.createBuffer(1, context.sampleRate, context.sampleRate);
    const samples = cycle.getChannelData(0);
    let warmNoise = 0;
    for (let i = 0; i < samples.length; i++) {
      const t = i / context.sampleRate;
      warmNoise = warmNoise * 0.82 + (Math.random() * 2 - 1) * 0.18;
      let value = 0;
      for (const start of [0, 0.5]) {
        const age = t - start;
        if (age >= 0 && age < 0.28) {
          const envelope = Math.min(1, age / 0.018) * Math.exp(-age * 15);
          value += warmNoise * envelope * 0.7;
        }
      }
      for (const start of [0.07, 0.16]) {
        const age = t - start;
        if (age >= 0 && age < 0.08) {
          // Rounded wooden clack, no sharp high-frequency click.
          value += Math.sin(age * Math.PI * 2 * 190) * Math.min(1, age / 0.003) * Math.exp(-age * 90) * 0.18;
        }
      }
      samples[i] = value;
    }
    const wheels = this.wheels = context.createBufferSource();
    wheels.buffer = cycle; wheels.loop = true; wheels.connect(motion); wheels.start();

    // Soft low rolling layer remains deliberately below the chuffs and voice.
    const rumble = this.rumble = context.createOscillator();
    const rumbleGain = context.createGain();
    rumble.type = 'sine'; rumble.frequency.value = 48; rumbleGain.gain.value = 0.018;
    rumble.connect(rumbleGain); rumbleGain.connect(motion); rumble.start();

    const hiss = this.hiss = context.createBuffer(1, Math.floor(context.sampleRate * 0.55), context.sampleRate);
    const hissSamples = hiss.getChannelData(0);
    let softNoise = 0;
    for (let i = 0; i < hissSamples.length; i++) {
      softNoise = softNoise * 0.88 + (Math.random() * 2 - 1) * 0.12;
      const t = i / context.sampleRate;
      hissSamples[i] = softNoise * Math.min(1, t / 0.025) * Math.exp(-t * 8) * 0.2;
    }
  }

  unlock() {
    if (this.silent || !this.preferences.sound) return;
    this.unlocked = true;
    try {
      if (!this.context) this.initialize();
      void this.context?.resume().catch(() => {});
    } catch {
      // A partial graph must not linger if a device denies or fails initialization.
      void this.context?.close().catch(() => {});
      this.context = null; this.master = null; this.duck = null; this.motion = null;
      this.wheels = null; this.rumble = null; this.hiss = null;
    }
  }

  speak(word: Word, explicit = false) {
    this.word = word;
    const text = PHRASES[word][this.preferences.length];
    this.onPhrase(text);
    if (this.silent || !this.unlocked || !this.preferences.speech || !this.preferences.sound) return;
    // Leave conversational space; do not queue a running commentary over the child.
    if (!explicit && performance.now() - this.lastSpoken < 5000) return;
    this.lastSpoken = performance.now(); this.audio.pause();
    this.audio.src = `/audio/en/${word}-${this.preferences.length}.mp3`;
    void this.audio.play().catch(() => this.duckNarration());
    this.duckNarration();
  }

  update(speed: number) {
    if (this.silent || !this.preferences.sound) { this.stop(); return; }
    if (!this.preferences.speech && !this.audio.paused) this.audio.pause();
    const context = this.context;
    if (!context || !this.master || !this.motion || !this.wheels || !this.rumble) return;
    const pace = Number.isFinite(speed) ? Math.max(0, Math.min(4.2, speed)) : 0;
    const now = context.currentTime;
    if (pace > 0) {
      this.master.gain.setValueAtTime(0.7, now);
      this.motion.gain.setTargetAtTime(0.65 + pace * 0.08, now, 0.05);
      this.wheels.playbackRate.setTargetAtTime(0.6 + pace * 0.52, now, 0.08);
      this.rumble.frequency.setTargetAtTime(46 + pace * 5, now, 0.1);
    } else {
      this.motion.gain.setTargetAtTime(0, now, 0.035);
      if (this.lastSpeed > 0 && now - this.lastHiss > 0.7) this.releaseHiss();
    }
    this.lastSpeed = pace;
  }

  private releaseHiss() {
    if (!this.context || !this.duck || !this.hiss) return;
    this.lastHiss = this.context.currentTime;
    try {
      const source = this.context.createBufferSource();
      source.buffer = this.hiss; source.connect(this.duck);
      this.trackEffect(source); source.start();
    } catch { /* Optional effects cannot interrupt driving. */ }
  }

  private trackEffect(source: AudioScheduledSourceNode, gain?: GainNode) {
    this.activeEffects.add(source);
    source.onended = () => {
      source.disconnect(); gain?.disconnect(); this.activeEffects.delete(source);
    };
  }

  /** Lifecycle stop is immediate; only ordinary driving release gets a steam tail. */
  stop() {
    this.audio.pause(); this.lastSpeed = 0;
    const now = this.context?.currentTime ?? 0;
    for (const gain of [this.master, this.motion]) {
      gain?.gain.cancelScheduledValues(now); gain?.gain.setValueAtTime(0, now);
    }
    for (const source of this.activeEffects) {
      try { source.stop(); } catch { /* Already completed. */ }
      source.disconnect();
    }
    this.activeEffects.clear();
  }

  /** Keep the public bell API while sounding like a friendly steam-train whistle. */
  bell() {
    this.unlock();
    const context = this.context;
    if (!context || !this.master || !this.duck || !this.preferences.sound || this.silent) return;
    const now = context.currentTime;
    // Repeated toddler taps cannot produce an increasingly loud/unbounded chorus.
    if (now - this.lastWhistle < 0.8) return;
    this.lastWhistle = now;
    this.master.gain.setValueAtTime(0.7, now);
    try {
      for (const [frequency, level] of [[440, 0.055], [554.37, 0.024], [660, 0.012]] as const) {
        const oscillator = context.createOscillator(), gain = context.createGain();
        oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(frequency * 0.96, now);
        oscillator.frequency.exponentialRampToValueAtTime(frequency, now + 0.12);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(level, now + 0.07);
        gain.gain.setValueAtTime(level, now + 0.32);
        gain.gain.linearRampToValueAtTime(0, now + 0.42);
        gain.gain.linearRampToValueAtTime(level * 0.8, now + 0.49);
        gain.gain.linearRampToValueAtTime(0, now + 0.74);
        oscillator.connect(gain); gain.connect(this.duck);
        this.trackEffect(oscillator, gain); oscillator.start(); oscillator.stop(now + 0.76);
      }
    } catch { /* Optional effects cannot interrupt play. */ }
  }
}
