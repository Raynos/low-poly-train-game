import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const exec = promisify(execFile);
const url = process.argv[2] ?? 'http://127.0.0.1:4187';
const session = `train-check-${process.pid}`;
const out = 'tmp/browser-check'; await mkdir(out, { recursive: true });
const checks = [];
async function browser(...args) {
  const { stdout } = await exec('agent-browser', ['--session', session, '--json', ...args], { timeout: 40000 });
  const result = JSON.parse(stdout); if (!result.success) throw new Error(result.error); return result.data;
}
const evaluate = async source => (await browser('eval', source)).result;
const snapshot = () => evaluate('window.__train.snapshot()');
const click = selector => browser('click', selector);
const wait = source => browser('wait', '--fn', source);
function check(label, value) { assert.ok(value, label); checks.push(label); console.log(`PASS ${label}`); }
async function capture(name) { await browser('screenshot', `${out}/${name}.png`); }
async function practice(destination, phase) {
  check(`${destination}/${phase}: three large illustrated word buttons`, await evaluate(`(() => {
    const buttons=[...document.querySelectorAll('[data-practice]')];
    return buttons.length===3 && buttons.every(b=>{const r=b.getBoundingClientRect();return r.width>=64 && r.height>=64 && getComputedStyle(b.querySelector('.game-icon')).backgroundImage.includes('toy-icons.png')});
  })()`));
  await click('[data-practice="train"]');
  check(`${destination}/${phase}: word button models phrase`, (await snapshot()).phrase === 'Little train.');
}
async function holdUntil(condition) {
  const box = await evaluate("(() => {const b=document.querySelector('#drive').getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2}})()");
  await browser('mouse','move',String(Math.round(box.x)),String(Math.round(box.y))); await browser('mouse','down');
  await wait(condition); await browser('mouse','up');
}
try {
  await browser('open', `${url}/?debug=1&mute=1`); await browser('set','viewport','844','390');
  await wait("document.querySelector('#game').dataset.ready === 'true'");
  await wait("document.querySelector('#pwa-status').textContent.includes('Ready to play offline')");
  await capture('home-phone'); await click('#play'); await capture('selector-phone'); await click('[data-place="meadow"]');
  await practice('meadow','driving');
  await holdUntil('window.__train.snapshot().distance > 6');
  const stopped = await snapshot(); check('Holding moves, release stops immediately', stopped.distance > 6 && !stopped.held && stopped.speed === 0);
  await click('#camera'); check('Camera cycles to follow without resetting distance', (await snapshot()).mode === 'follow' && (await snapshot()).distance === stopped.distance); await capture('follow-phone');
  await click('#camera'); check('Camera cycles to cab', (await snapshot()).mode === 'cab'); await capture('cab-phone');
  await click('#camera'); check('Camera cycles back to overview', (await snapshot()).mode === 'overview');
  await click('[data-target="sheep"]'); check('Meadow object exploration changes language context', (await snapshot()).discoveries.includes('sheep')); await capture('meadow-phone');
  await click('#pause'); const paused = await snapshot(); check('Pause clears motion', paused.paused && !paused.held && paused.speed === 0); await click('#resume');
  await click('#words'); await click('[data-word="sorry"]'); check('Optional language models are available', (await snapshot()).phrase === 'Sorry, teddy.'); await capture('words-phone'); await click('#close-modal');
  // Real pointer start, followed by cancellation/rotation/blur at browser boundaries.
  for (const event of ['pointercancel','lostpointercapture','blur','resize']) {
    const b = await evaluate("(() => {const b=document.querySelector('#drive').getBoundingClientRect();return [b.x+b.width/2,b.y+b.height/2]})()");
    await browser('mouse','move',String(Math.round(b[0])),String(Math.round(b[1]))); await browser('mouse','down');
    await wait('window.__train.snapshot().held');
    await evaluate(event === 'pointercancel' || event === 'lostpointercapture' ? `document.querySelector('#drive').dispatchEvent(new PointerEvent('${event}',{bubbles:true}))` : `window.dispatchEvent(new Event('${event}'))`);
    check(`${event} releases input`, !(await snapshot()).held && (await snapshot()).speed === 0); await browser('mouse','up');
  }
  await click('#places'); await click('[data-place="station"]'); await practice('station','driving');
  await holdUntil("window.__train.snapshot().phase === 'helping'"); check('Station arrival does not auto-board passengers', (await snapshot()).cargo === 0); await capture('station-arrival'); await practice('station','helping');
  await click('[data-passenger="2"]'); await click('[data-seat="0"]');
  await click('[data-passenger="0"]'); await click('[data-seat="0"]'); check('Occupied seat preserves child selection', (await snapshot()).selected === 0 && (await snapshot()).cargo === 1);
  await click('[data-seat="2"]'); await click('[data-passenger="1"]'); await click('[data-seat="1"]');
  check('Child-selected seat order is retained', JSON.stringify((await snapshot()).seats) === '[2,1,0]');
  await holdUntil("window.__train.snapshot().phase === 'finished'"); await capture('station-finished'); await practice('station','finished'); await click('#finish');
  check('Finished visit returns to selector', (await snapshot()).screen === 'select');
  await click('[data-place="orchard"]'); await practice('orchard','driving'); await holdUntil("window.__train.snapshot().phase === 'helping'"); await capture('orchard-picking'); await practice('orchard','helping');
  await click('[data-target="fruit-2"]'); await click('[data-target="fruit-0"]'); await click('[data-target="fruit-2"]');
  check('Orchard keeps the child’s chosen fruit order', JSON.stringify((await snapshot()).fruit) === '[2,0,2]'); await practice('orchard','riding');
  await holdUntil("window.__train.snapshot().phase === 'finished'"); await capture('orchard-delivered'); await practice('orchard','finished'); await click('#finish');
  const perf = await snapshot();
  await browser('set','offline','on'); await browser('reload');
  await wait("document.querySelector('#game').dataset.ready === 'true'");
  check('Production app restarts offline', (await snapshot()).screen === 'home');
  check('English narration asset is available offline', await evaluate("fetch('/audio/en/sorry-1.mp3').then(r=>r.ok && r.headers.get('content-type').includes('audio'))"));
  await click('#play'); await click('[data-place="orchard"]'); await holdUntil('window.__train.snapshot().distance > 5');
  check('Gameplay works after offline restart', (await snapshot()).distance > 5); await capture('offline-play');
  await browser('set','offline','off');
  await browser('set','viewport','390','844'); check('Portrait rotate prompt is visible', await evaluate("getComputedStyle(document.querySelector('#rotate')).display !== 'none'"));
  await browser('set','viewport','1180','720'); await click('#places'); await click('#back'); await capture('home-tablet');
  await writeFile(`${out}/report.json`,JSON.stringify({date:new Date().toISOString(),url,checks,perf,physicalDevice:false,audioPlayback:false},null,2));
  console.log(`PASS ${checks.length} checks. Evidence: ${out}`);
} finally { await browser('close'); }
