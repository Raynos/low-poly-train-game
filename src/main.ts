import './style.css';
import { createTrain, stepTrain, STEP, CAMERAS, choosePassenger, chooseSeat, pickFruit, discover } from './game/train.ts';
import type { Destination, CameraMode } from './game/train.ts';
import { createWorld } from './render/world.ts';
import { Sound } from './audio/sound.ts';
import type { Preferences } from './audio/sound.ts';
import type { Word } from './audio/phrases.ts';
import { PHRASES } from './audio/phrases.ts';
import { icon, placePicture } from './ui/icons.ts';

const canvas = document.querySelector<HTMLCanvasElement>('#game')!;
const app = document.querySelector<HTMLElement>('#app')!;
const ui = document.querySelector<HTMLElement>('#ui')!;
const loading = document.querySelector<HTMLElement>('#loading-stage')!;
loading.textContent = 'Building the little railway…';
document.querySelector<HTMLProgressElement>('#loading progress')!.value = 2;
await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
const world = createWorld(canvas);
const placePictures: Partial<Record<Destination, string>> = {};
function destinationPicture(destination: Destination): string {
  return placePictures[destination] ??= world.thumbnail(destination);
}
const preferences: Preferences = { sound: true, speech: true, length: 1, reduced: matchMedia('(prefers-reduced-motion: reduce)').matches };
try {
  const saved = JSON.parse(localStorage.getItem('little-train-preferences') ?? '{}') as Partial<Preferences>;
  for (const name of ['sound','speech','reduced'] as const) if (typeof saved[name] === 'boolean') preferences[name] = saved[name];
  if (saved.length === 0 || saved.length === 1 || saved.length === 2) preferences.length = saved.length;
} catch { /* Storage is optional. */ }
let phrase = 'Little train.';
const sound = new Sound(preferences, text => {
  phrase = text; const label = document.querySelector('#phrase-text'); if (label) label.textContent = text;
});
let state = createTrain();
let screen: 'home' | 'select' | 'play' = 'home';
let mode: CameraMode = 'overview';
let held = false, paused = false, pointer: number | null = null;
let accumulator = 0, last = performance.now(), previousPhase = state.phase;
let frames: number[] = [];
const modal = document.createElement('dialog'); modal.id = 'modal'; app.append(modal);
const practiceWords: Record<Destination, readonly [Word, string, string][]> = {
  meadow: [['train', 'train', 'Train'], ['sheep', 'sheep', 'Sheep'], ['bridge', 'bridge', 'Bridge']],
  station: [['train', 'train', 'Train'], ['passenger', 'person-blue', 'Hello, friend'], ['seat', 'seat', 'Sit down']],
  orchard: [['train', 'train', 'Train'], ['orchard', 'apple', 'Apple'], ['please', 'hand', 'Apple, please']],
};
const personIcons = ['person-coral', 'person-blue', 'person-yellow'] as const;
const names: Record<Destination, string> = { meadow: 'Meadow wander', station: 'Hello, station', orchard: 'Apple orchard' };
function save() { try { localStorage.setItem('little-train-preferences', JSON.stringify(preferences)); } catch { /* Optional. */ } }
function release() { held = false; pointer = null; document.querySelector('#drive')?.classList.remove('held'); stepTrain(state, false); sound.update(0); }
function button(id: string, title: string, symbol: string, cls = 'round'): string {
  return `<button id="${id}" class="${cls}" aria-label="${title}" title="${title}">${icon(symbol)}</button>`;
}
function on(id: string, fn: () => void) { document.getElementById(id)?.addEventListener('click', fn); }
function closeModal() { sound.stop(); modal.close(); paused = false; release(); last = performance.now(); accumulator = 0; }
function go(next: typeof screen) {
  release(); sound.stop(); screen = next; paused = false; modal.close();
  if (screen === 'home') state = createTrain();
  renderUI();
}
function start(destination: Destination) {
  state = createTrain(destination); previousPhase = state.phase; screen = 'play'; paused = false; release();
  renderUI(); document.querySelector<HTMLButtonElement>('#drive')?.focus({ preventScroll: true }); sound.unlock(); sound.speak(destination === 'meadow' ? 'train' : destination, true);
}
function showModal(content: string) {
  release(); sound.stop(); paused = true;
  modal.innerHTML = `${button('close-modal', 'Back to the game', 'close')}<div class="modal-body">${content}</div>`;
  if (!modal.open) modal.showModal(); on('close-modal', closeModal);
}
function showSettings() {
  showModal(`<small class="eyebrow">FOR GROWN-UPS</small><h2>A little room to grow</h2>
    <div class="settings-grid"><label><input id="sound-setting" type="checkbox" ${preferences.sound ? 'checked' : ''}> Sounds</label>
    <label><input id="speech-setting" type="checkbox" ${preferences.speech ? 'checked' : ''}> Spoken words</label>
    <label><input id="motion-setting" type="checkbox" ${preferences.reduced ? 'checked' : ''}> Gentle motion</label>
    <label class="length-label">Language to model<select id="length-setting"><option value="0">Single words · “apple”</option><option value="1">Short phrases · “apple, please”</option><option value="2">Little sentences · “an apple, please”</option></select></label></div>
    <p class="parent-copy">Play together. Follow what interests your child, model a phrase, then leave a quiet pause. A look, gesture, sound or word is welcome. Add a word to what they say: “train” → “train goes.” No need to ask for repeated attempts.</p>
    <p class="parent-copy">The voice models words; it does not listen, record, or judge speech. This is shared-play support, not speech therapy. For concerns, a speech-language therapist and hearing assessment can guide individual support.</p>
    <p class="parent-copy">Try the same words afterward with a toy train or at snack time. “Apple, please.” “Here you go.” “Thank you.”</p>
    <p class="parent-copy"><a href="https://www.asha.org/public/speech/development/" target="_blank" rel="noopener">ASHA language guidance</a> · <a href="https://www.healthychildren.org/English/ages-stages/toddler/Pages/Language-Delay.aspx" target="_blank" rel="noopener">AAP parent guidance</a></p>`);
  const length = document.querySelector<HTMLSelectElement>('#length-setting')!; length.value = String(preferences.length);
  length.addEventListener('change', () => { preferences.length = Number(length.value) as 0 | 1 | 2; save(); });
  for (const [id, key] of [['sound-setting','sound'],['speech-setting','speech'],['motion-setting','reduced']] as const) {
    document.getElementById(id)!.addEventListener('change', event => { preferences[key] = (event.target as HTMLInputElement).checked; sound.stop(); save(); });
  }
}
function showWords() {
  const words: [Word,string][] = [['please','apple'],['help','hand'],['thanks','heart'],['more','apple'],['turn','person'],['sorry','heart']];
  showModal(`<small class="eyebrow">WORDS TO SHARE</small><h2>Let's say it together</h2><div class="word-grid">${words.map(([word, symbol]) => `<button class="word-card" data-word="${word}">${icon(symbol)}<span>${PHRASES[word][preferences.length]}</span></button>`).join('')}</div><p id="word-context" class="parent-copy">Tap to listen together. Talking is always optional.</p>`);
  modal.querySelectorAll<HTMLButtonElement>('[data-word]').forEach(element => element.addEventListener('click', () => {
    sound.unlock(); const word = element.dataset.word as Word; sound.speak(word, true);
    const context: Partial<Record<Word,string>> = {
      please: 'An apple is offered. Model “apple, please,” then give it without requiring words.',
      sorry: 'Pretend your teddy drops a friend’s apple. Model “sorry,” help pick it up, and move on. No forced apology.',
      help: 'Take turns helping a toy climb aboard. Model “help, please.”',
      turn: 'Take turns blowing the train whistle. “My turn.” “Your turn.”',
      more: 'Offer another pretend apple. Pointing or reaching is also a request.',
      thanks: 'Someone helps the train. Model “thank you” warmly, without a test.',
    };
    document.querySelector('#word-context')!.textContent = context[word] ?? '';
  }));
}
function showPause() {
  showModal(`<small class="eyebrow">TAKE YOUR TIME</small><h2>A little rest</h2><div class="pause-actions"><button id="resume" class="pill">${icon('play')}Keep playing</button><button id="choose-place" class="pill">${icon('places')}Choose a place</button><button id="settings-in-pause" class="pill">${icon('gear')}Grown-up settings</button></div>`);
  on('resume', closeModal); on('choose-place', () => go('select')); on('settings-in-pause', showSettings);
}
function renderUI() {
  app.dataset.screen = screen; app.dataset.phase = state.phase; app.dataset.camera = mode;
  if (screen === 'home') {
    ui.innerHTML = `<div class="home-title"><small class="eyebrow">SMALL HANDS. BIG LITTLE JOURNEYS.</small><h1>Little Train<span>Let's go somewhere lovely.</span></h1></div><div class="top-right">${button('settings','Grown-up settings','gear')}</div><div class="home-play">${button('play','Choose a place to play','play','round giant')}<span>All aboard</span></div><div class="home-note">A gentle world to explore together</div>`;
    on('play', () => { sound.unlock(); go('select'); }); on('settings', showSettings);
  } else if (screen === 'select') {
    ui.innerHTML = `<div class="selector"><header>${button('back','Back to main menu','back')}<div><small class="eyebrow">YOUR LITTLE RAILWAY</small><h2>Where shall we go?</h2></div>${button('settings','Grown-up settings','gear')}</header><div class="places">${(['meadow','station','orchard'] as const).map((place, i) => `<button class="place-card" data-place="${place}" aria-label="Visit ${names[place]}">${placePicture(place, destinationPicture(place))}<span class="place-name">${names[place]}</span><span class="place-description">${['Drive & discover','Give friends a ride','Pick & carry apples'][i]}</span><span class="place-play">${icon('play')}</span></button>`).join('')}</div><p class="selector-note">Every place is yours. Take your time.</p></div>`;
    on('back', () => go('home')); on('settings', showSettings);
    ui.querySelectorAll<HTMLButtonElement>('[data-place]').forEach(el => el.addEventListener('click', () => start(el.dataset.place as Destination)));
  } else {
    const helping = state.phase === 'helping', finished = state.phase === 'finished';
    ui.innerHTML = `<header class="play-header"><div class="top-left">${button('pause','Pause the game','pause')}<span class="destination-label">${names[state.destination]}</span></div><div class="top-right">${button('camera','Change camera view','camera')}${button('words','Words to share','book')}</div></header>
      <div id="world-targets"></div><section class="practice-dock" aria-label="Words to practice">${practiceWords[state.destination].map(([word, symbol, label]) => `<button class="practice-word" data-practice="${word}" aria-label="Practice ${label}" title="${label}">${icon(symbol)}</button>`).join('')}</section><div class="cab-frame" aria-hidden="true"><div class="cab-top"></div><div class="cab-dashboard"></div></div>
      <div class="phrase"><button id="repeat" aria-label="Hear the phrase again">${icon('sound')}<span id="phrase-text">${phrase}</span></button></div>
      <div class="bottom-left">${button('bell','Blow the train whistle','whistle')}${button('places','Choose another place','places')}</div>
      ${!helping && !finished ? `${button('drive','Hold to drive the train','play','round drive')}<div class="drive-caption">Hold to go</div>` : ''}
      ${helping && state.destination === 'station' ? `<section class="activity-tray" aria-label="Choose passengers and seats"><span class="tray-label">${state.selected === null ? 'Who is coming along?' : 'Choose a seat'}</span><div class="choices">${[0,1,2].map(i => state.selected === null ? `<button data-passenger="${i}" class="choice person-${i}" aria-label="Invite ${['coral','blue','yellow'][i]} friend" ${state.seats.includes(i) ? 'disabled' : ''}>${icon(personIcons[i]!)}</button>` : `<button data-seat="${i}" class="choice" aria-label="Seat ${i + 1}${state.seats[i] !== -1 ? ', occupied' : ', empty'}">${icon(state.seats[i] === -1 ? 'seat' : personIcons[state.seats[i]!]!)}</button>`).join('')}</div></section>` : ''}
      ${finished ? `<div class="completion"><span>${state.destination === 'station' ? 'A lovely ride together.' : 'Apples delivered.'}</span><button id="finish" class="pill">${icon('places')}Where next?</button></div>` : ''}`;
    ui.querySelectorAll<HTMLButtonElement>('[data-practice]').forEach(el => el.addEventListener('click', () => {
      release(); sound.unlock(); sound.speak(el.dataset.practice as Word, true);
    }));
    on('pause', showPause); on('places', () => go('select')); on('words', showWords);
    on('camera', () => { mode = CAMERAS[(CAMERAS.indexOf(mode) + 1) % CAMERAS.length]!; app.dataset.camera = mode; });
    on('repeat', () => { sound.unlock(); sound.speak(sound.word, true); });
    on('bell', () => { sound.bell(); discover(state, 'bell'); });
    on('finish', () => { go('select'); sound.speak('bye', true); });
    ui.querySelectorAll<HTMLButtonElement>('[data-passenger]').forEach(el => el.addEventListener('click', () => { if (choosePassenger(state, Number(el.dataset.passenger))) { sound.speak('passenger', true); renderUI(); } }));
    ui.querySelectorAll<HTMLButtonElement>('[data-seat]').forEach(el => el.addEventListener('click', () => {
      if (chooseSeat(state, Number(el.dataset.seat))) { sound.speak(state.phase === 'riding' ? 'full' : 'seat', true); previousPhase = state.phase; renderUI(); }
      else { el.classList.add('occupied'); sound.speak('full'); }
    }));
    const drive = document.querySelector<HTMLButtonElement>('#drive');
    drive?.addEventListener('pointerdown', event => {
      if (paused || pointer !== null || event.button !== 0) return;
      event.preventDefault(); sound.unlock(); pointer = event.pointerId; drive.setPointerCapture(pointer); held = true; drive.classList.add('held'); sound.speak('go');
    });
    for (const type of ['pointerup','pointercancel','lostpointercapture']) drive?.addEventListener(type, () => { const wasHeld = held; release(); if (wasHeld) sound.speak('stop'); });
    drive?.addEventListener('contextmenu', event => event.preventDefault());
    const targets = document.querySelector('#world-targets')!;
    for (const target of world.targets(state)) {
      const fruit = target.id.startsWith('fruit');
      const el = document.createElement('button'); el.className = 'world-target'; el.dataset.target = target.id;
      el.setAttribute('aria-label', fruit ? `Pick an apple from tree ${Number(target.id.at(-1)) + 1}` : `Explore ${target.id}`);
      el.innerHTML = icon(fruit ? 'apple' : target.id); targets.append(el);
      el.addEventListener('click', () => {
        sound.unlock();
        if (fruit) { if (pickFruit(state, Number(target.id.at(-1)))) { sound.speak(state.phase === 'riding' ? 'apples' : 'orchard', true); if (state.phase === 'riding') { previousPhase = state.phase; renderUI(); } } }
        else { discover(state, target.id); world.react(target.id); sound.speak(target.id as Word, true); el.classList.add('visited'); }
      });
    }
  }
}
modal.addEventListener('cancel', event => { event.preventDefault(); closeModal(); });
window.addEventListener('keydown', event => {
  if ((event.code === 'Space' || event.key === ' ') && screen === 'play' && !paused && (state.phase === 'driving' || state.phase === 'riding') && !event.repeat && (event.target === document.body || (event.target as HTMLElement).id === 'drive')) {
    event.preventDefault(); sound.unlock(); held = true; document.querySelector('#drive')?.classList.add('held'); sound.speak('go');
  }
  if (event.code === 'Escape' && screen === 'play' && !paused) showPause();
});
window.addEventListener('keyup', event => { if ((event.code === 'Space' || event.key === ' ')) release(); });
window.addEventListener('blur', () => { release(); sound.stop(); });
window.addEventListener('resize', release);
document.addEventListener('visibilitychange', () => { release(); sound.stop(); accumulator = 0; last = performance.now(); });
canvas.addEventListener('webglcontextlost', event => {
  event.preventDefault(); release(); sound.stop(); paused = true;
  document.querySelector<HTMLElement>('#error')!.hidden = false;
  document.querySelector('#error-message')!.textContent = 'The little railway needs to reopen.';
});
function frame(now: number) {
  const elapsed = (now - last) / 1000; const dt = Math.min(elapsed, 0.1); last = now;
  if (!document.hidden) { frames.push(elapsed * 1000); if (frames.length > 600) frames.shift(); }
  if (screen === 'play' && !paused) {
    accumulator += dt;
    while (accumulator >= STEP) { stepTrain(state, held); accumulator -= STEP; }
    if (state.phase !== previousPhase) { release(); previousPhase = state.phase; renderUI(); sound.speak(state.phase === 'finished' ? (state.destination === 'station' ? 'bye' : 'apples') : (state.destination === 'station' ? 'station' : 'orchard'), true); }
  } else accumulator = 0;
  sound.update(!paused && screen === 'play' ? state.speed : 0);
  world.render(state, mode, screen, paused || document.hidden ? 0 : dt, preferences.reduced);
  for (const target of world.targets(state)) {
    const element = document.querySelector<HTMLElement>(`[data-target="${target.id}"]`);
    if (element) { element.hidden = !target.visible; element.style.left = `${target.x}px`; element.style.top = `${target.y}px`; }
  }
  requestAnimationFrame(frame);
}
renderUI(); world.render(state, mode, screen, 0, preferences.reduced);
loading.textContent = 'Ready for a little journey'; document.querySelector<HTMLProgressElement>('#loading progress')!.value = 3;
await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
document.querySelector<HTMLElement>('#loading')!.hidden = true; app.inert = false; canvas.dataset.ready = 'true';
window.dispatchEvent(new Event('game-ready')); last = performance.now(); requestAnimationFrame(frame);
if (new URLSearchParams(location.search).has('debug')) {
  Object.defineProperty(window, '__train', { value: Object.freeze({ snapshot: () => ({ ...structuredClone(state), screen, mode, held, paused, phrase, preferences: { ...preferences }, renderQuality: world.quality(), calls: world.renderer.info.render.calls, triangles: world.renderer.info.render.triangles,
    frameMs: frames.length ? { median: [...frames].sort((a,b) => a-b)[Math.floor(frames.length * 0.5)], p95: [...frames].sort((a,b) => a-b)[Math.floor(frames.length * 0.95)] } : null }) }) });
}
