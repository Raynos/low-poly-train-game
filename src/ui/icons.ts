/** Generated toy illustrations: five equal rows and columns in a transparent PNG atlas. */
const illustrations = [
  'play', 'pause', 'back', 'camera', 'sound',
  'gear', 'places', 'close', 'whistle', 'apple',
  'person-coral', 'person-blue', 'person-yellow', 'seat', 'tree',
  'river', 'bridge', 'sheep', 'book', 'heart',
  'hand', 'train', 'station', 'crate', 'speech',
] as const;
export function icon(name: string): string {
  const aliases: Record<string, string> = { person: 'person-coral', bell: 'whistle' };
  const index = illustrations.findIndex(value => value === (aliases[name] ?? name));
  const cell = index < 0 ? 0 : index;
  return `<span class="game-icon" aria-hidden="true" style="background-position:${(cell % 5) * 25}% ${Math.floor(cell / 5) * 25}%"></span>`;
}
export function placePicture(kind: string, picture?: string): string {
  const place = ['meadow', 'station', 'orchard'].includes(kind) ? kind : 'meadow';
  return `<img class="place-picture" src="${picture ?? `/ui/place-${place}.png`}" alt="" draggable="false">`;
}
