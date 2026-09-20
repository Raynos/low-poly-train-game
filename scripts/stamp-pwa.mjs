import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

async function walk(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    result.push(...(entry.isDirectory() ? await walk(path) : [path]));
  }
  return result;
}
const files = (await walk('dist')).filter(path => path !== 'dist/sw.js').sort();
const hash = createHash('sha256');
for (const path of files) { hash.update(path); hash.update(await readFile(path)); }
const template = await readFile('public/sw.js', 'utf8');
hash.update(template);
const build = hash.digest('hex').slice(0, 16);
const urls = files.map(path => `/${path.slice('dist/'.length)}`);
if (!urls.includes('/index.html') || !urls.some(path => path.endsWith('.js'))) {
  throw new Error('Cannot publish an incomplete offline application');
}
const stamped = template.replace("'__BUILD_ID__'", JSON.stringify(build))
  .replace("'__PRECACHE_URLS__'", JSON.stringify(urls));
await writeFile('dist/sw.js', stamped);
console.log(`PWA ${build}: ${urls.length} local files in offline install`);
