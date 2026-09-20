import * as T from 'three';
import { Shapes } from './shapes.ts';
import { buildScenery, tree } from './scenery.ts';
import { buildTrain, crate, passenger } from './train.ts';
import { trackPose, LOOP } from '../game/train.ts';
import type { TrainState, CameraMode, Destination } from '../game/train.ts';

export function createWorld(canvas: HTMLCanvasElement) {
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.setClearColor('#c5dfe7');
  renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
  const scene = new T.Scene(); scene.fog = new T.Fog('#c5dfe7', 38, 115);
  const camera = new T.PerspectiveCamera(43, 1, 0.1, 160);
  scene.add(new T.HemisphereLight('#e9f5ff', '#798c6f', 1.7));
  const sun = new T.DirectionalLight('#fff3e0', 3); sun.position.set(-16, 30, 15);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -28; sun.shadow.camera.right = 28; sun.shadow.camera.top = 28; sun.shadow.camera.bottom = -28;
  sun.shadow.camera.far = 80; sun.shadow.bias = -0.001; sun.shadow.normalBias = 0.06;
  scene.add(sun);
  const staticWorld = new Shapes();
  buildScenery(scene, staticWorld);
  // Ballast, sleepers and rails follow the same analytic path as the train.
  for (let i = 0; i < 136; i++) {
    const p = trackPose(i / 136 * LOOP);
    staticWorld.box(p.x, 0.04, p.z, 1.95, 0.1, 0.56, '#c8b593', 0, p.heading);
    staticWorld.box(p.x, 0.12, p.z, 1.7, 0.16, 0.22, '#ab805b', 0.015, p.heading);
  }
  for (const offset of [-0.59, 0.59]) {
    const points = Array.from({ length: 193 }, (_, i) => {
      const p = trackPose(i / 192 * LOOP);
      return new T.Vector3(p.x + Math.cos(p.heading) * offset, 0.26, p.z - Math.sin(p.heading) * offset);
    });
    staticWorld.add(new T.TubeGeometry(new T.CatmullRomCurve3(points), 192, 0.065, 5, true), '#687975', 0, 0, 0);
  }
  for (const z of [-8, 8]) {
    staticWorld.box(0, 0.04, z, 4.2, 0.28, 2.5, '#bd986a');
    for (const side of [-1, 1]) {
      staticWorld.box(0, 0.76, z + side * 1.3, 4.5, 0.12, 0.12, '#c9ab7d');
      for (const x of [-2, -1, 0, 1, 2]) staticWorld.box(x, 0.45, z + side * 1.3, 0.16, 0.9, 0.16, '#a77e55');
    }
  }
  scene.add(staticWorld.mesh());
  // Soft cloud groups are geometry, not network textures.
  const clouds = new Shapes();
  for (let i = 0; i < 8; i++) for (let j = 0; j < 3; j++) clouds.add(new T.IcosahedronGeometry(2, 1), '#f9f5e8', i * 13 - 42 + j * 1.5, 14 + i % 3 + (j % 2), -27 - i % 2 * 12, 1.5, 0.7, 0.9);
  const cloudMesh = clouds.mesh(); cloudMesh.material = new T.MeshBasicMaterial({ vertexColors: true }); cloudMesh.castShadow = false; scene.add(cloudMesh);
  const train = buildTrain(); scene.add(train.root, train.wagon);
  // Moving rolling stock casts real sun shadows.
  const shadowMaterial = new T.MeshBasicMaterial({ color: '#3b513c', transparent: true, opacity: 0.15, depthWrite: false });
  const shadows = [train.root, train.wagon].map(() => {
    const mesh = new T.Mesh(new T.CircleGeometry(1, 24), shadowMaterial); mesh.rotation.x = -Math.PI / 2; mesh.scale.set(0.95, 1.65, 1); scene.add(mesh); return mesh;
  });
  const people = ['#c56a4d','#648caa','#d2a748'].map(passenger);
  const crates = Array.from({ length: 3 }, crate);
  for (const obj of [...people, ...crates]) { obj.castShadow = false; scene.add(obj); }
  const steamMaterial = new T.MeshLambertMaterial({ color: '#fff9e7', transparent: true, opacity: 0.65, depthWrite: false });
  const steam = Array.from({ length: 6 }, () => { const p = new T.Mesh(new T.IcosahedronGeometry(0.28, 0), steamMaterial); scene.add(p); return p; });
  const sheepShape = new Shapes();
  sheepShape.ball(0, 0.72, 0, 0.6, '#fff2ce', 1.4, 0.8, 0.85);
  sheepShape.ball(0.7, 0.85, 0, 0.3, '#5f6354', 0.8, 1, 0.8);
  for (const x of [-0.4, 0.4]) for (const z of [-0.25, 0.25]) sheepShape.cylinder(x, 0.25, z, 0.09, 0.5, '#686553');
  const sheep = sheepShape.mesh(); sheep.position.set(-6, 0, 3); scene.add(sheep);
  const leafShape = new Shapes();
  tree(leafShape, 0, 0, 1.1);
  const activeTree = leafShape.mesh(); activeTree.position.set(5, 0, -4); scene.add(activeTree);
  const ripples = new T.Mesh(new T.RingGeometry(0.4, 0.45, 24), new T.MeshBasicMaterial({ color: '#f1f1d5', transparent: true, opacity: 0.8, side: T.DoubleSide }));
  ripples.rotation.x = -Math.PI / 2; ripples.position.set(0, 0.1, 2); scene.add(ripples);
  let lastDiscovery = '', discoveryAge = 10;
  const project = new T.Vector3();
  const cameraPosition = new T.Vector3(), target = new T.Vector3();
  let previousView = '', clock = 0;
  function resize() {
    const width = canvas.clientWidth, height = canvas.clientHeight;
    camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false);
    previousView = '';
  }
  resize(); window.addEventListener('resize', resize);
  return {
    renderer,
    /** Scene-derived place cards. Separate camera/target; simulation and live viewport stay intact. */
    thumbnail(destination: Destination): string {
      const previewCamera = new T.PerspectiveCamera(40, 1.5, .1, 160);
      if (destination === 'station') { previewCamera.position.set(5.9, 7.1, -9.8); previewCamera.lookAt(14.5, 1.5, -.3); }
      else if (destination === 'orchard') { previewCamera.position.set(-7, 7.5, 11); previewCamera.lookAt(-16.4, 1.8, 0); }
      else { previewCamera.position.set(-10, 6.8, 13); previewCamera.lookAt(-2.6, .8, 3); }
      const renderTarget = new T.WebGLRenderTarget(480, 320, { depthBuffer: true });
      renderTarget.texture.colorSpace = T.SRGBColorSpace;
      const previousTarget = renderer.getRenderTarget();
      renderer.setRenderTarget(renderTarget); renderer.render(scene, previewCamera);
      const pixels = new Uint8Array(480 * 320 * 4); renderer.readRenderTargetPixels(renderTarget, 0, 0, 480, 320, pixels);
      renderer.setRenderTarget(previousTarget); renderTarget.dispose();
      const output = document.createElement('canvas'); output.width = 480; output.height = 320;
      const context = output.getContext('2d'); if (!context) return '';
      const data = context.createImageData(480, 320);
      for (let row = 0; row < 320; row++) data.data.set(pixels.subarray((319-row)*480*4, (320-row)*480*4), row*480*4);
      context.putImageData(data, 0, 0); return output.toDataURL('image/png');
    },
    react(id: string) { lastDiscovery = id; discoveryAge = 0; },
    targets(state: TrainState) {
      const targets: { id: string; position: number[] }[] = state.destination === 'orchard' && state.phase === 'helping'
        ? [0, 1, 2].map(i => ({ id: `fruit-${i}`, position: [-17, 3.5, (i - 1) * 3.6] }))
        : state.destination === 'meadow' ? [
          { id: 'sheep', position: [-6, 1.7, 3] }, { id: 'tree', position: [5, 4, -4] },
          { id: 'river', position: [0, 0.5, 2] }, { id: 'bridge', position: [0, 1, 8] },
        ] : [];
      return targets.map(item => {
        project.set(item.position[0]!, item.position[1]!, item.position[2]!).project(camera);
        return { id: item.id, x: (project.x * 0.5 + 0.5) * canvas.clientWidth, y: (-project.y * 0.5 + 0.5) * canvas.clientHeight, visible: project.z > -1 && project.z < 1 && Math.abs(project.x) < 0.91 && Math.abs(project.y) < 0.8 };
      });
    },
    render(state: TrainState, mode: CameraMode, screen: 'home' | 'select' | 'play', dt: number, reduced: boolean) {
      clock += dt;
      const latest = state.discoveries.at(-1) ?? '';
      if (latest !== lastDiscovery) { lastDiscovery = latest; discoveryAge = 0; }
      discoveryAge += dt;
      activeTree.rotation.z = !reduced && lastDiscovery === 'tree' && discoveryAge < 1.6 ? Math.sin(discoveryAge * 9) * 0.07 * (1 - discoveryAge / 1.6) : 0;
      ripples.visible = lastDiscovery === 'river' && discoveryAge < 2;
      ripples.scale.setScalar(1 + Math.min(discoveryAge, 2) * 1.4);
      sheep.position.y = !reduced && lastDiscovery === 'sheep' && discoveryAge < 1 ? Math.sin(discoveryAge * Math.PI) * 0.7 : 0;
      sheep.rotation.y = lastDiscovery === 'sheep' ? Math.sin(Math.min(discoveryAge, 1) * Math.PI / 2) : 0;
      const pose = trackPose(state.distance), wagonPose = trackPose(state.distance - 3.3);
      train.root.position.set(pose.x, 0.08, pose.z); train.root.rotation.y = pose.heading;
      train.wagon.position.set(wagonPose.x, 0.08, wagonPose.z); train.wagon.rotation.y = wagonPose.heading;
      for (const wheel of train.wheels) wheel.rotation.x = state.distance / 0.45;
      shadows[0]!.position.set(pose.x, 0.21, pose.z); shadows[0]!.rotation.z = -pose.heading;
      shadows[1]!.position.set(wagonPose.x, 0.21, wagonPose.z); shadows[1]!.rotation.z = -wagonPose.heading;
      for (let i = 0; i < 3; i++) {
        const person = people[i]!;
        const seat = state.destination === 'station' ? state.seats.indexOf(i) : -1;
        const personTarget = new T.Vector3(13.7, 0.42, (i - 1) * 1.15);
        if (seat >= 0) personTarget.set(wagonPose.x + Math.sin(wagonPose.heading) * (seat - 1) * 0.58, 1.05, wagonPose.z + Math.cos(wagonPose.heading) * (seat - 1) * 0.58);
        if (previousView.startsWith(screen)) person.position.lerp(personTarget, reduced ? 1 : Math.min(1, dt * 5)); else person.position.copy(personTarget);
        person.rotation.y = seat >= 0 ? wagonPose.heading : -Math.PI / 2;
        const box = crates[i]!;
        box.visible = state.destination === 'orchard' && state.fruit.length > i;
        const crateTarget = new T.Vector3(wagonPose.x + Math.sin(wagonPose.heading) * (i - 1) * 0.59, 1.06, wagonPose.z + Math.cos(wagonPose.heading) * (i - 1) * 0.59);
        if (!box.userData.loaded && box.visible) box.position.set(-17, 3, ((state.fruit[i] ?? 1) - 1) * 3.6);
        box.userData.loaded = box.visible;
        box.position.lerp(crateTarget, reduced ? 1 : Math.min(1, dt * 5)); box.rotation.y = wagonPose.heading;
      }
      for (let i = 0; i < steam.length; i++) {
        const puff = steam[i]!; const age = (clock * 0.5 + i / steam.length) % 1;
        puff.visible = state.speed > 0.05 && !reduced && screen === 'play' && mode !== 'cab';
        puff.position.set(pose.x + Math.sin(pose.heading) * (0.95 - age * 1.8), 2.4 + age * 2.1, pose.z + Math.cos(pose.heading) * (0.95 - age * 1.8)); puff.scale.setScalar(0.5 + age * 1.6);
      }
      const fov = screen === 'play' && (state.phase === 'driving' || state.phase === 'riding') ? mode === 'cab' ? 55 : mode === 'follow' ? 48 : 43 : 43;
      if (camera.fov !== fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
      let view = `${screen}-${mode}-${state.phase}`;
      if (screen === 'home') {
        cameraPosition.set(pose.x + 7, 5.7, pose.z + 9); target.set(pose.x - 1.5, 1.1, pose.z - 0.5);
      } else if (screen === 'select') {
        cameraPosition.set(21, 24, 29); target.set(0, 0, 0);
      } else if (state.phase === 'helping' || state.phase === 'finished') {
        const east = state.destination === 'station' || state.phase === 'finished';
        cameraPosition.set(east ? 6.4 : -6.4, 7.3, east ? -10 : 10);
        target.set(east ? 13.6 : -14.8, east ? 1.1 : 2.6, 0);
      } else if (mode === 'overview') {
        const narrow = camera.aspect < 1.55 ? 1.16 : 1;
        cameraPosition.set(19 * narrow, 21 * narrow, 25 * narrow); target.set(0, 0, 0);
      } else if (mode === 'follow') {
        cameraPosition.set(pose.x - Math.sin(pose.heading) * 8 + Math.cos(pose.heading) * 3.4, 5.6, pose.z - Math.cos(pose.heading) * 8 - Math.sin(pose.heading) * 3.4);
        const ahead = trackPose(state.distance + 2.5); target.set(ahead.x, 0.8, ahead.z);
      } else {
        cameraPosition.set(pose.x - Math.sin(pose.heading) * 1.25, 2.75, pose.z - Math.cos(pose.heading) * 1.25);
        const ahead = trackPose(state.distance + 6); target.set(ahead.x, 1.9, ahead.z);
      }
      // Cab roof is above the camera. Hide it only in cab to avoid camera intersections.
      train.cab.visible = !(screen === 'play' && mode === 'cab' && (state.phase === 'driving' || state.phase === 'riding'));
      if (view !== previousView || reduced || mode === 'cab' || mode === 'overview' || screen !== 'play') camera.position.copy(cameraPosition);
      else camera.position.lerp(cameraPosition, 1 - Math.exp(-dt * 10));
      camera.lookAt(target); previousView = view;
      renderer.render(scene, camera);
      renderer.shadowMap.autoUpdate = true;
    },
  };
}
