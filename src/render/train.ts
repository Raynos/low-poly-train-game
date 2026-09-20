import * as T from 'three';
import { Shapes } from './shapes.ts';
const C = { teal: '#277b77', dark: '#224f50', gold: '#e4ad4d', cream: '#ffebba', wheel: '#394644', wood: '#bf986b' };
export function buildTrain() {
  const root = new T.Group(), wagon = new T.Group(), cab = new T.Group();
  const s = new Shapes();
  s.box(0, 0.63, 0, 1.45, 0.35, 2.8, C.dark, 0.08);
  s.cylinder(0, 1.25, 0.55, 0.62, 1.7, C.gold, Math.PI / 2);
  s.cylinder(0, 1.25, 1.43, 0.63, 0.12, C.dark, Math.PI / 2);
  s.cylinder(0, 1.25, 1.51, 0.46, 0.12, C.cream, Math.PI / 2);
  s.cylinder(0, 1.25, 1.6, 0.19, 0.12, C.gold, Math.PI / 2);
  s.cylinder(0, 2.01, 0.96, 0.22, 0.72, C.dark, 0, 0, 0.29);
  s.cylinder(0, 2.36, 0.96, 0.32, 0.14, C.wheel);
  s.cylinder(0, 1.92, 0.05, 0.21, 0.28, C.gold);
  // The removable cab keeps the actual boiler visible from the driver's seat.
  const c = new Shapes();
  c.box(0, 1.04, -0.95, 1.42, 0.64, 1.06, C.teal, 0.06);
  for (const x of [-0.61, 0.61]) {
    for (const z of [-1.44, -0.48]) c.box(x, 1.79, z, 0.14, 1.1, 0.14, C.teal, 0.025);
    c.box(x, 1.42, -0.98, 0.18, 0.12, 1.1, C.gold, 0.025);
    c.box(x, 2.18, -0.98, 0.18, 0.13, 1.12, C.teal, 0.025);
    c.box(x * 1.22, 0.84, -0.92, 0.3, 0.12, 0.66, C.gold, 0.025);
    c.box(x * 1.19, 1.16, -1.4, 0.07, 0.58, 0.07, C.cream, 0.025);
  }
  c.box(0, 2.2, -0.95, 1.35, 0.17, 1.1, C.teal);
  // Shallow curved roof, assembled as broad facets instead of a flat slab.
  for (let i = -3; i <= 3; i++) {
    c.box(i * 0.25, 2.46 - 0.13 * (i / 3) ** 2, -0.96, 0.265, 0.14, 1.55, C.cream, 0.025);
  }
  c.box(0, 1.48, -1.47, 1.22, 0.12, 0.13, C.gold, 0.02);
  cab.add(c.mesh()); root.add(cab);
  // Boiler bands, running boards, handrails, front lamp and buffers.
  for (const z of [-0.12, 0.63, 1.25]) s.cylinder(0, 1.25, z, 0.637, 0.065, C.cream, Math.PI / 2, 0, 0.637, 16);
  for (const x of [-0.7, 0.7]) {
    s.box(x, 0.86, 0.4, 0.22, 0.12, 1.94, C.teal, 0.025);
    s.beam(new T.Vector3(x, 1.54, -0.27), new T.Vector3(x, 1.54, 1.1), 0.032, C.cream);
    for (const z of [-0.2, 1.02]) s.box(x, 1.38, z, 0.045, 0.3, 0.045, C.gold);
    s.cylinder(x * 0.8, 0.65, 1.88, 0.15, 0.16, C.dark, Math.PI / 2);
  }
  s.cylinder(0, 1.92, 1.46, 0.2, 0.24, C.teal, Math.PI / 2);
  s.cylinder(0, 1.92, 1.6, 0.15, 0.04, '#fff4ce', Math.PI / 2);
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    s.ball(Math.sin(a) * 0.52, 1.25 + Math.cos(a) * 0.52, 1.53, 0.035, C.gold);
  }
  s.box(0, 0.65, 1.63, 1.6, 0.28, 0.35, C.gold, 0.05);
  s.box(0, 0.7, -1.65, 0.3, 0.22, 0.8, C.dark);
  root.add(s.mesh());
  const wheelGroups: T.Group[] = [];
  for (const x of [-0.76, 0.76]) for (const z of [-1, 0, 1]) {
    const wheel = new T.Group(); wheel.position.set(x, 0.48, z);
    const w = new Shapes();
    w.cylinder(0, 0, 0, 0.45, 0.19, C.wheel, 0, Math.PI / 2);
    w.cylinder(Math.sign(x) * 0.12, 0, 0, 0.19, 0.06, C.gold, 0, Math.PI / 2);
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      w.beam(new T.Vector3(Math.sign(x) * 0.14, 0, 0), new T.Vector3(Math.sign(x) * 0.14, Math.cos(a) * 0.33, Math.sin(a) * 0.33), 0.035, C.cream);
    }
    w.cylinder(Math.sign(x) * 0.17, 0, 0, 0.1, 0.08, C.teal, 0, Math.PI / 2);
    wheel.add(w.mesh()); root.add(wheel); wheelGroups.push(wheel);
  }
  const w = new Shapes();
  w.box(0, 0.6, 0, 1.55, 0.22, 2.1, C.dark, 0.05);
  w.box(0, 0.86, 0, 1.55, 0.2, 2.1, C.cream);
  for (const x of [-0.73, 0.73]) {
    w.box(x, 1.12, 0, 0.14, 0.54, 2.1, C.cream);
    w.box(x, 1.42, 0, 0.19, 0.1, 2.17, '#f5dba2', 0.025);
  }
  for (const z of [-0.99, 0.99]) w.box(0, 1.12, z, 1.55, 0.54, 0.12, C.cream);
  w.box(0, 0.64, 1.36, 0.2, 0.15, 0.7, C.dark);
  for (const x of [-0.78, 0.78]) for (const z of [-0.65, 0.65]) {
    w.cylinder(x, 0.4, z, 0.34, 0.15, C.wheel, 0, Math.PI / 2);
    w.cylinder(x * 1.12, 0.4, z, 0.14, 0.03, C.gold, 0, Math.PI / 2);
  }
  for (const x of [-0.815, 0.815]) {
    for (const z of [-0.8, 0, 0.8]) {
      w.box(x, 1.15, z, 0.045, 0.5, 0.07, C.wood, 0.01);
      for (const y of [0.98, 1.31]) w.ball(x * 1.015, y, z, 0.027, C.gold);
    }
  }
  for (const z of [-0.7, 0, 0.7]) w.box(0, 1.04, z, 1.25, 0.1, 0.33, '#d5ac75', 0.025);
  wagon.add(w.mesh());
  return { root, wagon, cab, wheels: wheelGroups };
}
export function crate() {
  const s = new Shapes();
  s.box(0, 0.22, 0, 0.72, 0.4, 0.58, '#c49a65', 0.025);
  for (const z of [-0.3, 0.3]) for (const y of [0.1, 0.25, 0.4]) s.box(0, y, z, 0.78, 0.11, 0.04, '#e0b47a');
  for (const x of [0]) {
    s.ball(x, 0.51, 0, 0.18, '#ca5540');
    s.box(x, 0.7, 0, 0.04, 0.11, 0.04, '#74623f');
    s.ball(x + 0.06, 0.68, 0, 0.08, '#63854a', 1.4, 0.3, 0.7);
  }
  return s.mesh();
}
export function passenger(color: string) {
  const s = new Shapes();
  s.cylinder(0, 0.32, 0, 0.22, 0.55, color, 0, 0, 0.18);
  s.ball(0, 0.76, 0, 0.23, '#e8b686');
  s.cylinder(0, 0.96, 0, 0.26, 0.08, color);
  s.ball(0, 1.02, 0, 0.19, color, 1, 0.65, 1);
  for (const x of [-0.075, 0.075]) {
    s.ball(x, 0.79, 0.196, 0.023, '#394644');
    s.ball(x * 1.65, 0.71, 0.174, 0.038, '#d89478', 1, 0.6, 0.3);
  }
  s.ball(0, 0.735, 0.228, 0.035, '#e8b686');
  s.box(0, 0.56, 0.17, 0.12, 0.12, 0.045, C.cream, 0.02);
  for (const x of [-0.23, 0.23]) s.ball(x, 0.4, 0, 0.1, color, 0.7, 1.5, 0.8);
  return s.mesh();
}
