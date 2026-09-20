import { registerPwa } from './pwa.ts';

const stage = document.getElementById('loading-stage');
if (stage) stage.textContent = 'Getting your train ready…';
document.querySelector<HTMLProgressElement>('#loading progress')!.value = 1;
registerPwa(status => {
  const label = document.getElementById('pwa-status');
  if (!label) return;
  label.textContent = status.updateAvailable ? 'Update ready — close and reopen to use it'
    : status.offlineReady ? (status.online ? 'Ready to play offline' : 'Playing offline')
    : status.error ? 'Offline saving unavailable'
    : !status.supported || import.meta.env.DEV ? '' : 'Saving for offline play…';
});
window.addEventListener('game-ready', () => {
  const timer = (window as Window & { littleTrainLoadTimer?: number }).littleTrainLoadTimer;
  window.clearTimeout(timer);
}, { once: true });
void import('./main.ts').catch(error => {
  console.error('Game failed to load', error);
  if (stage) stage.textContent = 'We could not load the playground. Check your connection and try again.';
  const retry = document.getElementById('retry');
  if (retry) retry.hidden = false;
  document.querySelector('#loading progress')?.setAttribute('hidden', '');
});
