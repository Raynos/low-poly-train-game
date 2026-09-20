import * as T from 'three';
import { Shapes } from './shapes.ts';

/** Analytic river keeps both railway crossings at their original coordinates. */
export function riverX(z: number): number { return 1.15 * Math.sin(z * Math.PI / 8) + Math.max(0, Math.abs(z) - 12) * Math.sin(z * 0.075) * 0.15; }
function ribbon(width: number, y: number): T.BufferGeometry {
  const vertices: number[] = [];
  for (let i = 0; i < 120; i++) {
    const z = i - 60, next = z + 1;
    const a = riverX(z), b = riverX(next);
    vertices.push(a-width,y,z, b-width,y,next, a+width,y,z, a+width,y,z,b-width,y,next,b+width,y,next);
  }
  const geometry = new T.BufferGeometry(); geometry.setAttribute('position', new T.Float32BufferAttribute(vertices, 3)); geometry.computeVertexNormals(); return geometry;
}
function hill(shapes: Shapes, x: number, z: number, radius: number, height: number, color: string) {
  // A low dome with a flat skirt, rather than an exposed faceted sphere or cliff.
  const g = new T.SphereGeometry(1, 12, 5, 0, Math.PI * 2, 0, Math.PI / 2);
  shapes.add(g, color, x, -0.16, z, radius, height, radius * 0.78);
}
export function tree(shapes: Shapes, x: number, z: number, size: number, pine = false, apples = false) {
  shapes.cylinder(x, 0.83 * size, z, 0.19 * size, 1.75 * size, '#866349', 0, 0, 0.11 * size, 7);
  if (pine) {
    for (let i = 0; i < 3; i++) shapes.add(new T.ConeGeometry((1.05 - i * 0.2) * size, 1.6 * size, 8), ['#4f7662','#628674','#779584'][i]!, x, (1.35 + i * 0.56) * size, z);
  } else {
    shapes.beam(new T.Vector3(x, size, z), new T.Vector3(x + size * 0.6, size * 2.1, z), size * 0.1, '#866349');
    const colors = apples ? ['#668650','#79985c','#8fa76b'] : ['#658b64','#7d9b70','#93aa7b'];
    for (const [dx, dy, dz, r, c] of [[-.48,1.95,0,.85,0],[.48,2.12,.08,.88,1],[0,2.65,-.12,.82,2],[0,2,.55,.73,1]]) {
      shapes.add(new T.IcosahedronGeometry(r!, 1), colors[c!]!, x+dx!*size, dy!*size, z+dz!*size, size, size*.9, size);
    }
  }
  if (apples) for (let i = 0; i < 8; i++) {
    const angle = i * Math.PI / 4, ax = x + Math.sin(angle) * size * 0.86, az = z + Math.cos(angle) * size * 0.85, ay = (2.05 + i % 3 * .24) * size;
    shapes.ball(ax, ay, az, .18 * size, i % 2 ? '#cd634a' : '#b74938');
    shapes.cylinder(ax, ay + .18 * size, az, .023, .11, '#72533d');
  }
}
export function buildScenery(scene: T.Scene, shapes: Shapes) {
  const land = new Shapes(); land.box(0,-.38,0,220,.5,220,'#94ad85');
  // Broad, restrained meadow color islands break up the flat clearing without texture noise.
  for (let i = 0; i < 15; i++) {
    const x = Math.sin(i * 2.4) * 24, z = Math.cos(i * 2.4) * 17;
    land.add(new T.CircleGeometry(2.5 + i % 4, 9), i % 2 ? '#97af87' : '#91aa80', x, -.128 + i * .00005, z, 1.4, 1, 1, -Math.PI / 2, 0, i);
  }
  const ground = land.mesh(); ground.castShadow = false; scene.add(ground);
  const banks = new Shapes(); banks.add(ribbon(2.12,-.095),'#c5ba94',0,0,0); banks.add(ribbon(1.78,-.055),'#a9c4b1',0,0,0);
  const bankMesh = banks.mesh(); bankMesh.castShadow = false; scene.add(bankMesh);
  const water = new Shapes(); water.add(ribbon(1.52,-.025),'#70b3bc',0,0,0);
  for (let i = 0; i < 75; i++) {
    const z = i * 1.3 - 49, x = riverX(z) + Math.sin(i * 4.2) * 1.1;
    water.box(x, -.012, z, .24 + i % 4 * .17, .008, .025, i % 3 ? '#9dced0' : '#d5e3d6');
  }
  const river = water.mesh(); river.castShadow = false; scene.add(river);
  const far = new Shapes();
  for (let i = 0; i < 17; i++) {
    const angle = i / 17 * Math.PI * 2;
    hill(far, Math.cos(angle)*85, Math.sin(angle)*85, 23 + i % 3 * 5, 15 + i % 4 * 3, i % 2 ? '#9caeb6' : '#8fa6af');
    hill(far, Math.cos(angle)*59, Math.sin(angle)*59, 18 + i % 3 * 3, 5 + i % 3 * 2, i % 2 ? '#95ae9c' : '#a4b79e');
    hill(far, Math.cos(angle)*43, Math.sin(angle)*43, 13, 2.7 + i % 3, i % 2 ? '#8fa980' : '#9db58c');
  }
  const mountains = far.mesh(); mountains.castShadow = false; scene.add(mountains);
  // Plant clusters around the playable clearing, keeping sightlines and rail clear.
  for (let i = 0; i < 70; i++) {
    const angle = i * 2.39996, radius = 23 + i % 6 * 2.7;
    const x = Math.cos(angle) * radius, z = Math.sin(angle) * radius * .83;
    if (Math.abs(x-riverX(z)) < 3 || (x > 10 && Math.abs(z)<7) || (x < -12 && Math.abs(z)<7)) continue;
    tree(shapes,x,z,.8 + i % 5 *.12,i%3===0);
  }
  tree(shapes,-7,-3,1.05); tree(shapes,7,2,.85); tree(shapes,-5,-4,.8);
  for (let i=0; i<90; i++) {
    const x=Math.sin(i*7.83)*27,z=Math.cos(i*11.1)*22;
    const radius=Math.sqrt(x*x/144+z*z/64);
    if(Math.abs(x-riverX(z))<2.3 || radius>.78&&radius<1.25 || Math.abs(x)>10&&Math.abs(z)<6) continue;
    if(i%5===0) shapes.ball(x,.16,z,.35,'#a5afa1',1.4,.7,1);
    else {
      for (let j=0;j<3;j++) shapes.add(new T.ConeGeometry(.07,.35+j*.08,3),'#708f63',x+j*.09,.15,z+j*.06,1,1,1,0,0,(j-1)*.3);
      if(i%3===0) for(let j=0;j<3;j++) { const fx=x+j*.12,fz=z-j*.1; shapes.cylinder(fx,.23,fz,.015,.42,'#668357',0,0,.014,4); shapes.ball(fx,.46,fz,.1,j%2?'#f2ddb0':'#fff2d9',1.1,.5,1.1); shapes.ball(fx,.5,fz,.035,'#dba452'); }
    }
  }
  for(let i=0;i<34;i++) {
    const z=i*1.8-30;
    if(Math.abs(Math.abs(z)-8)<2)continue;
    const x=riverX(z)+(i%2?-1:1)*1.95;
    shapes.ball(x,.06,z,.3,'#9bada3',1,.6,.8);
    for(let j=0;j<3;j++){shapes.cylinder(x+j*.12,.3+j*.08,z,.018,.65+j*.1,'#6b8860',0,0,.012,4); if(j===1)shapes.cylinder(x+j*.12,.68,z,.035,.17,'#876343',0,0,.035,5);}
  }
  station(shapes);
  shapes.box(-14.3,.13,0,2.5,.34,5.4,'#c6b698',.05);
  for(const z of [-3.6,0,3.6]) {shapes.cylinder(-17,-.035,z,1.45,.06,'#899c70',0,0,1.45,16); tree(shapes,-17,z,1.25,false,true);}
  for(let i=0;i<8;i++)shapes.box(-19.2,.5,i*1.5-5.25,.12,1.1,.12,'#c1a27b',.025);
  for(const y of [.4,.82])shapes.box(-19.2,y,0,.12,.12,11,'#d2b48c');
}
function station(s: Shapes) {
  s.box(14.5,.16,0,3.5,.4,6.8,'#b2afa0',.06);
  s.box(14.5,.38,0,3.6,.12,6.9,'#e4d7bb',.03);
  for(let i=0;i<15;i++)s.box(12.69,.32,i*.44-3.08,.05,.15,.37,'#b8aa8d');
  s.box(15.8,1.6,-.6,2.5,2.4,3.6,'#eee0bf',.035);
  s.box(15.8,.63,-.6,2.55,.3,3.65,'#b9ac90');
  // Proper closed gable, ridge, roof courses, and cream eaves.
  for(const z of [-2.4,1.2]) {
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([14.55,2.8,z,17.05,2.8,z,15.8,3.65,z],3));g.computeVertexNormals();s.add(g,'#eee0bf',0,0,0);
    const reverse=g.clone();reverse.scale(-1,1,1);s.add(reverse,'#eee0bf',31.6,0,0);
  }
  for(const side of [-1,1]) {
    s.add(new T.BoxGeometry(1.7,.17,4.2),side<0?'#bc7655':'#cc8760',15.8+side*.68,3.2,-.6,1,1,1,0,0,-side*.58);
    for(let i=0;i<4;i++)s.add(new T.BoxGeometry(.035,.025,4.16),'#d69970',15.8+side*(.22+i*.36),3.65-(.22+i*.36)*.65,-.6,1,1,1,0,0,-side*.58);
  }
  s.box(15.8,3.68,-.6,.19,.13,4.23,'#d89b71',.035);
  s.box(16.55,3.6,.45,.44,1.1,.45,'#d5c5a5');s.box(16.55,4.15,.45,.55,.14,.55,'#eadbbb',.035);
  s.box(14.51,1.32,-.6,.09,1.85,.86,'#456f69',.04);
  s.ball(14.44,1.25,-.3,.05,'#d2ac61');
  for(const z of [-1.75,.75]) {
    s.box(14.48,1.86,z,.13,.81,.77,'#f7eccf',.035);
    s.box(14.40,1.86,z,.03,.62,.58,'#719b9c');
    s.box(14.37,1.86,z,.035,.63,.04,'#ede1be');s.box(14.37,1.86,z,.035,.04,.59,'#ede1be');
    s.box(14.32,1.4,z,.34,.11,.94,'#dfcba6',.025);
  }
  s.box(13.62,2.64,-.6,2.1,.15,4.2,'#bc8059',.02);
  for(const z of [-2.5,1.3]){s.box(12.72,1.55,z,.14,2.12,.14,'#e2cda8',.02);s.box(12.72,.65,z,.22,.4,.22,'#d5bb91',.02);}
  // Round platform clock, physically facing the approaching railway.
  s.cylinder(12.56,2.33,-.7,.33,.08,'#446c65',0,Math.PI/2,.33,24);
  s.cylinder(12.50,2.33,-.7,.27,.02,'#fff2d4',0,Math.PI/2,.27,24);
  s.box(12.48,2.4,-.7,.015,.15,.035,'#486c64');s.box(12.48,2.33,-.61,.015,.035,.18,'#486c64');
  for(const z of [2.05,2.8])s.box(14.2,.66,z,.12,.54,.12,'#536b5d');
  for(const x of [13.99,14.2,14.41])s.box(x,.94,2.42,.17,.09,1.24,'#b8885f',.025);
  for(const y of [1.19,1.4])s.box(14.5,y,2.42,.09,.13,1.24,'#c59969',.025);
  for(const z of [-2.95,2.98]){
    s.box(13.4,.63,z,.58,.42,.58,'#b98563',.035);
    for(let i=0;i<3;i++){s.ball(13.4+(i-1)*.17,.92,z,.22,'#729468');s.ball(13.4+(i-1)*.18,1.08,z,.09,i%2?'#ecbd75':'#f1ded0');}
  }
}
