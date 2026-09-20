import { webkit } from 'playwright';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
const out = 'tmp/webkit-offline'; await mkdir(out, { recursive: true });
let unavailable = false;
const types = { '.html':'text/html', '.js':'application/javascript', '.css':'text/css', '.png':'image/png', '.svg':'image/svg+xml', '.webmanifest':'application/manifest+json' };
const server = createServer(async (request, response) => {
  if (unavailable) { request.socket.destroy(); return; }
  const path = new URL(request.url, 'http://localhost').pathname;
  try { const file = path === '/' ? '/index.html' : path;
    const body = await readFile(resolve('dist', `.${file}`));
    response.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream', 'Cache-Control':'no-store' }); response.end(body);
  } catch { response.writeHead(404); response.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await webkit.launch({ headless:true });
const context = await browser.newContext({ viewport: { width:844, height:390 }, isMobile:true, hasTouch:true });
const page = await context.newPage(); const report = {};
try {
  await page.goto(`http://127.0.0.1:${server.address().port}/?debug=1&mute=1`);
  await page.waitForFunction(()=>document.getElementById('pwa-status').textContent.includes('Ready to play offline'));
  report.installed = await page.evaluate(async()=>({controlled:Boolean(navigator.serviceWorker.controller),caches:await caches.keys(),status:document.getElementById('pwa-status').textContent}));
  report.onlineTimeOrigin = await page.evaluate(()=>performance.timeOrigin);
  unavailable = true;
  await page.reload();
  await page.waitForFunction(()=>document.getElementById('game').dataset.ready === 'true');
  report.unavailableOrigin = await page.evaluate(()=>({timeOrigin:performance.timeOrigin,ready:document.getElementById('game').dataset.ready,screen:window.__train.snapshot().screen}));
  await page.screenshot({path:`${out}/origin-unavailable.png`});
  if (report.unavailableOrigin.timeOrigin === report.onlineTimeOrigin) throw new Error('Navigation did not create a fresh document');
  console.log('PASS WebKit starts a fresh cached game when origin connection fails');
  await context.setOffline(true);
  try { await page.reload(); report.emulatedOfflineReload = 'no error'; }
  catch(error) { report.emulatedOfflineReload = String(error); }
  report.afterOffline = await page.evaluate(()=>({timeOrigin:performance.timeOrigin,url:location.href,title:document.title,text:document.body.innerText.slice(0,500),ready:document.getElementById('game')?.dataset.ready})).catch(error=>String(error));
  await page.screenshot({path:`${out}/emulated-offline.png`}).catch(()=>{});
  console.log(JSON.stringify(report,null,2));
} finally { await writeFile(`${out}/report.json`,JSON.stringify(report,null,2)); await browser.close(); server.close(); }
