/** Generated toy illustrations, cropped to their artwork rather than assumed grid cells. */
const illustrations = [
  'play', 'pause', 'back', 'camera', 'sound',
  'gear', 'places', 'close', 'whistle', 'apple',
  'person-coral', 'person-blue', 'person-yellow', 'seat', 'tree',
  'river', 'bridge', 'sheep', 'book', 'heart',
  'hand', 'train', 'station', 'crate', 'speech',
] as const;
// Opaque artwork bounds measured in the original 1254px atlas. The generated rows
// are uneven (especially the last two); equal fifths misalign and leak neighbors.
const bounds = [
  [69,60,221,240], [308,61,458,238], [531,72,722,235], [777,68,966,232], [1024,66,1213,238],
  [45,290,238,478], [287,299,483,479], [539,297,714,472], [816,281,960,490], [1034,289,1207,482],
  [71,519,207,734], [318,519,454,734], [559,519,695,734], [777,556,966,720], [1032,521,1206,734],
  [42,802,247,947], [283,799,501,944], [534,771,724,954], [767,791,985,951], [1029,790,1210,948],
  [44,996,221,1201], [259,1000,490,1193], [514,989,752,1187], [781,1007,975,1177], [1024,1006,1216,1181],
] as const;
export function icon(name: string): string {
  const aliases: Record<string, string> = { person: 'person-coral', bell: 'whistle' };
  const index = illustrations.findIndex(value => value === (aliases[name] ?? name));
  const cell = index < 0 ? 0 : index;
  const [left, top, right, bottom] = bounds[cell]!;
  const padding = 3; // Preserve the soft antialiased silhouette.
  const width = right - left + padding * 2;
  const height = bottom - top + padding * 2;
  const scale = 88 / Math.max(width, height);
  const optical = cell === 0 ? 'transform:translateX(5%);' : '';
  return `<span class="game-icon" aria-hidden="true"><span class="game-icon-art" style="width:${width * scale}%;height:${height * scale}%;background-size:${1254 / width * 100}% ${1254 / height * 100}%;background-position:${(left - padding) / (1254 - width) * 100}% ${(top - padding) / (1254 - height) * 100}%;${optical}"></span></span>`;
}
export function placePicture(kind: string, picture?: string): string {
  const place = ['meadow', 'station', 'orchard'].includes(kind) ? kind : 'meadow';
  return `<img class="place-picture" src="${picture ?? `/ui/place-${place}.png`}" alt="" draggable="false">`;
}
