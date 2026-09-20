import { webkit } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const url = process.argv[2] ?? 'http://127.0.0.1:4187';
const out = 'tmp/webkit-check'; await mkdir(out, { recursive: true });
const browser = await webkit.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const page = await context.newPage(); const errors = [], checks = []; page.on('pageerror', e => errors.push(e.message));
function check(name, value) { assert.ok(value, name); checks.push(name); console.log(`PASS ${name}`); }
const state = () => page.evaluate(() => window.__train.snapshot());
async function holdUntil(predicate) {
  const b = await page.locator('#drive').boundingBox(); await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down();
  try { await page.waitForFunction(predicate, null, { timeout: 30000 }); } finally { await page.mouse.up(); }
}
try {
  await page.goto(`${url}/?debug=1&mute=1`); await page.waitForFunction(() => document.querySelector('#game').dataset.ready === 'true');
  check('WebKit dismisses loading and renders home', await page.locator('#loading').isHidden());
  check('WebKit uses Retina HDR antialiasing', (await state()).renderQuality.pixelRatio === 2 && (await state()).renderQuality.hdr);
  await page.locator('#play').tap();
  for (const destination of ['meadow','station','orchard']) {
    await page.locator(`[data-place="${destination}"]`).tap();
    await holdUntil(() => window.__train.snapshot().distance > 5);
    check(`${destination}: touch driving and release`, (await state()).speed === 0);
    if (destination === 'meadow') {
      await page.locator('#camera').tap(); check('Follow view', (await state()).mode === 'follow');
      await page.locator('#camera').tap(); check('Cab view', (await state()).mode === 'cab');
      await page.locator('#camera').tap(); await page.locator('[data-target="tree"]').tap();
      check('World touch target works', (await state()).discoveries.includes('tree'));
      await page.locator('#places').tap(); continue;
    }
    await page.locator('[data-target="sheep"]').tap();
    check(`${destination}: world phrase practice`, (await state()).phrase === 'Hello, sheep.');
    await holdUntil(() => window.__train.snapshot().phase === 'helping');
    if (destination === 'station') {
      for (const i of [2,0,1]) { await page.locator(`[data-passenger="${i}"]`).tap(); await page.locator(`[data-seat="${i}"]`).tap(); }
    } else for (const i of [2,0,1]) await page.locator(`[data-target="fruit-${i}"]`).tap();
    check(`${destination}: chosen objects load`, (await state()).cargo === 3 && (await state()).phase === 'riding');
    await holdUntil(() => window.__train.snapshot().phase === 'finished');
    await page.screenshot({ path: `${out}/${destination}-finished.png` }); await page.locator('#finish').tap();
    check(`${destination}: finished visit returns to menu`, (await state()).screen === 'home'); await page.locator('#play').tap();
  }
  await page.locator('#back').tap(); await page.locator('#settings').tap();
  await page.locator('#length-setting').selectOption('2'); await page.locator('#sound-setting').uncheck(); await page.locator('#close-modal').tap();
  await page.reload(); await page.waitForFunction(() => document.querySelector('#game').dataset.ready === 'true');
  check('Parent preferences persist', (await state()).preferences.length === 2 && !(await state()).preferences.sound);
  await page.waitForFunction(() => document.querySelector('#pwa-status').textContent.includes('Ready to play offline'));
  check('All 60 bundled clips decode without playback', await page.evaluate(async () => {
    const context = new AudioContext();
    try {
      const keys = ['train','go','stop','tree','river','sheep','bridge','station','orchard','passenger','seat','full','apples','please','thanks','help','more','sorry','turn','bye'];
      for (const key of keys) for (let i = 0; i < 3; i++) {
        const response = await fetch(`/audio/en/${key}-${i}.mp3`);
        if (!response.ok) return false;
        const audio = await context.decodeAudioData(await response.arrayBuffer()); if (audio.duration < 0.1) return false;
      }
      return true;
    } finally { await context.close(); }
  }));
  check('No uncaught runtime errors', errors.length === 0);
  await writeFile(`${out}/report.json`,JSON.stringify({date:new Date().toISOString(),engine:'Desktop WebKit with mobile touch viewport, not physical iOS',checks,errors},null,2));
} finally { await browser.close(); }
