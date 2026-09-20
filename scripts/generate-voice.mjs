// Compatibility entry point: all narration now uses the local neural build pipeline.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
execFileSync(`${root}tmp/kokoro/venv/bin/python`, [`${root}scripts/generate-neural-voice.py`, ...process.argv.slice(2)], { cwd: root, stdio: 'inherit' });
