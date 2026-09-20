import * as T from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const P = { cream: '#fff3d8', red: '#e84e3c', coral: '#f78163', teal: '#337f87', blue: '#75bbc8', dark: '#314d58', green: '#83b976', leaf: '#5f9b70', yellow: '#f3c662', white: '#fff9e9', wood: '#bd8d64', soil: '#98785a', road: '#a2ada8' };
const material = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.83, metalness: 0.02 });
const color = new T.Color();
export class Shapes {
  private geometry: T.BufferGeometry[] = [];
  private matrix = new T.Matrix4();
  private position = new T.Vector3();
  private scale = new T.Vector3();
  private quaternion = new T.Quaternion();
  add(geometry: T.BufferGeometry, tint: string, x: number, y: number, z: number, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0): void {
    this.quaternion.setFromEuler(new T.Euler(rx, ry, rz));
    this.matrix.compose(this.position.set(x, y, z), this.quaternion, this.scale.set(sx, sy, sz));
    let plain = geometry.index ? geometry.toNonIndexed() : geometry;
    if (plain !== geometry) geometry.dispose();
    plain = plain.applyMatrix4(this.matrix);
    plain.deleteAttribute('uv');
    color.set(tint);
    const colors = new Float32Array(plain.getAttribute('position').count * 3);
    for (let i = 0; i < colors.length; i += 3) { colors[i] = color.r; colors[i + 1] = color.g; colors[i + 2] = color.b; }
    plain.setAttribute('color', new T.BufferAttribute(colors, 3));
    this.geometry.push(plain);
  }
  box(x: number, y: number, z: number, w: number, h: number, d: number, tint: string, round = 0, ry = 0): void {
    const geometry = round ? new RoundedBoxGeometry(w, h, d, 1, round) : new T.BoxGeometry(w, h, d);
    this.add(geometry, tint, x, y, z, 1, 1, 1, 0, ry);
  }
  ball(x: number, y: number, z: number, r: number, tint: string, sx = 1, sy = 1, sz = 1): void {
    this.add(new T.IcosahedronGeometry(r, 0), tint, x, y, z, sx, sy, sz);
  }
  cylinder(x: number, y: number, z: number, r: number, h: number, tint: string, rx = 0, rz = 0, top = r, sides = 10): void {
    this.add(new T.CylinderGeometry(top, r, h, sides), tint, x, y, z, 1, 1, 1, rx, 0, rz);
  }
  beam(a: T.Vector3, b: T.Vector3, width: number, tint: string): void {
    const midpoint = a.clone().add(b).multiplyScalar(0.5);
    const geometry = new T.CylinderGeometry(width, width, a.distanceTo(b), 6);
    geometry.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), b.clone().sub(a).normalize()));
    this.add(geometry, tint, midpoint.x, midpoint.y, midpoint.z);
  }
  mesh(): T.Mesh {
    const merged = mergeGeometries(this.geometry);
    if (!merged) throw new Error('Could not build scene geometry');
    for (const geometry of this.geometry) geometry.dispose();
    this.geometry = [];
    const mesh = new T.Mesh(merged, material);
    mesh.castShadow = true; mesh.receiveShadow = true;
    return mesh;
  }
}
export function disposeGroup(group: T.Object3D): void {
  group.traverse(object => {
    if (object instanceof T.Mesh) {
      object.geometry.dispose();
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const entry of materials) if (entry !== material) entry.dispose();
    }
  });
  group.removeFromParent();
}
