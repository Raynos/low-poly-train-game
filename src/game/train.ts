export const STEP = 1 / 60;
export const LOOP = Math.PI * 24;
export type Destination = 'meadow' | 'station' | 'orchard';
export type CameraMode = 'overview' | 'follow' | 'cab';
export const CAMERAS: CameraMode[] = ['overview', 'follow', 'cab'];
export interface TrainState {
  distance: number;
  speed: number;
  destination: Destination;
  phase: 'driving' | 'helping' | 'riding' | 'finished';
  cargo: number;
  progress: number;
  stopAt: number;
  selected: number | null;
  seats: number[];
  fruit: number[];
  discoveries: string[];
}
export function createTrain(destination: Destination = 'meadow'): TrainState {
  return { selected: null, seats: [-1, -1, -1], fruit: [], discoveries: [], distance: 4, speed: 0, destination, phase: 'driving', cargo: 0, progress: 0,
    stopAt: destination === 'orchard' ? LOOP * 0.75 : LOOP * 0.25 };
}
/** Every activity is repeatable; nothing can be failed or missed. */
export function stepTrain(state: TrainState, held: boolean, dt = STEP): void {
  const elapsed = Math.min(Math.max(dt, 0), 0.1);
  if (state.phase !== 'driving' && state.phase !== 'riding') { state.speed = 0; return; }
  state.speed = held ? Math.min(4.2, state.speed + elapsed * 4) : 0;
  if (state.destination !== 'meadow') {
    const remaining = state.stopAt - state.distance;
    state.speed = Math.min(state.speed, Math.max(0.7, remaining * 1.8));
    if (held && remaining <= 0.045) {
      state.distance = state.stopAt; state.speed = 0; state.phase = state.phase === 'riding' ? 'finished' : 'helping'; return;
    }
  }
  state.distance += state.speed * elapsed;
  if (state.destination !== 'meadow') state.distance = Math.min(state.distance, state.stopAt);
}
export function choosePassenger(state: TrainState, index: number): boolean {
  if (state.destination !== 'station' || state.phase !== 'helping' || index < 0 || index > 2 || state.seats.includes(index)) return false;
  state.selected = index; return true;
}
export function chooseSeat(state: TrainState, index: number): boolean {
  if (state.destination !== 'station' || state.phase !== 'helping' || state.selected === null || index < 0 || index > 2 || state.seats[index] !== -1) return false;
  state.seats[index] = state.selected; state.selected = null; state.cargo++;
  if (state.cargo === 3) { state.phase = 'riding'; state.stopAt += LOOP; }
  return true;
}
export function pickFruit(state: TrainState, tree: number): boolean {
  if (state.destination !== 'orchard' || state.phase !== 'helping' || tree < 0 || tree > 2 || state.fruit.length >= 3) return false;
  state.fruit.push(tree); state.cargo = state.fruit.length;
  if (state.cargo === 3) { state.phase = 'riding'; state.stopAt += LOOP / 2; }
  return true;
}
export function discover(state: TrainState, name: string): void {
  if (!state.discoveries.includes(name)) state.discoveries.push(name);
}
export function trackPose(distance: number): { x: number; z: number; heading: number } {
  const angle = distance / 12;
  return { x: 12 * Math.sin(angle), z: 8 * Math.cos(angle), heading: Math.atan2(12 * Math.cos(angle), -8 * Math.sin(angle)) };
}
