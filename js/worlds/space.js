// Hop Hop Runner: Space World.

// ---------- Space World: through the golden gate once she has collected enough coins ----------
const SPACE = 4;
let inSpace = false, inSea = false, inSpooky = false, inFair = false, awayFromTown = false;
let halloween = false; // now and then the towns put on their Halloween colours
const glowMats = [0xff5dc8, 0x5ee7ff, 0xb388ff, 0x7dff9a, 0xffd23f].map(c => new THREE.MeshBasicMaterial({ color: c }));
const moonRock = lambert(0x8a8fb0), moonDark = lambert(0x5d6285), alienGreen = lambert(0x7dff6a), rocketWhite = lambert(0xf4f6ff);
const alienEye = new THREE.MeshBasicMaterial({ color: 0xffffff }), alienPupil = new THREE.MeshBasicMaterial({ color: 0x2b2350 });
const rockGeo = new THREE.DodecahedronGeometry(1, 0);
function makeCrystals() {
  const g = new THREE.Group();
  const n = 3 + Math.floor(Math.random() * 3);
  for (let k = 0; k < n; k++) {
    const r = 0.5 + Math.random() * 0.5, sy = 2 + Math.random() * 2;
    const m = new THREE.Mesh(new THREE.OctahedronGeometry(r, 0), glowMats[Math.floor(Math.random() * 4)]);
    m.scale.set(0.6, sy, 0.6);
    m.position.set((Math.random() - 0.5) * 2, r * sy * 0.7, (Math.random() - 0.5) * 2);
    m.rotation.z = (Math.random() - 0.5) * 0.7;
    g.add(m);
  }
  const base = new THREE.Mesh(rockGeo, moonDark);
  base.scale.set(1.6, 0.5, 1.6);
  g.add(base);
  return g;
}
function makeRocket() {
  const g = new THREE.Group();
  const ship = new THREE.Group(); // lifts off the pad now and then
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 5, 16), rocketWhite);
  body.position.y = 3.3;
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.9, 16), glowMats[0]);
  nose.position.y = 6.75;
  const win = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.2, 16), glowMats[1]);
  win.rotation.x = Math.PI / 2;
  win.position.set(0, 4.4, 0.85);
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(2, 2.2, 0.4, 18), moonDark);
  pad.position.y = 0.2;
  ship.add(body, nose, win);
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2;
    const fin = box(0.15, 1.6, 0.9, jetRed, Math.sin(a) * 1.05, 1.5, Math.cos(a) * 1.05);
    fin.rotation.y = a;
    ship.add(fin);
  }
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.75, 3, 12), flameMat);
  flame.rotation.x = Math.PI;
  flame.position.y = -0.7;
  const core = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.6, 10), flameCore);
  core.rotation.x = Math.PI;
  core.position.y = 0.1;
  flame.visible = core.visible = false;
  ship.add(flame, core);
  g.add(ship, pad);
  g.scale.setScalar(1.25);
  g.userData.ship = ship;
  g.userData.flames = [flame, core];
  g.userData.vy = 0;
  g.userData.launching = false;
  return g;
}
function makeAlien() {
  const g = new THREE.Group();
  const body = ball(0.55, alienGreen, 0, 0.95, 0, 14);
  body.scale.set(1, 1.2, 0.9);
  const headA = ball(0.5, alienGreen, 0, 1.95, 0, 14);
  const eye = ball(0.24, alienEye, 0, 2.0, 0.38, 12);
  const pupil = ball(0.11, alienPupil, 0, 2.0, 0.6, 8);
  g.add(body, headA, eye, pupil);
  for (const sx of [-1, 1]) {
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 6), alienGreen);
    stalk.position.set(sx * 0.22, 2.6, 0);
    stalk.rotation.z = -sx * 0.35;
    g.add(stalk, ball(0.1, glowMats[sx < 0 ? 0 : 4], sx * 0.33, 2.9, 0, 8));
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.5, 8), alienGreen);
    leg.position.set(sx * 0.25, 0.25, 0);
    g.add(leg);
  }
  const armL = box(0.14, 0.7, 0.14, alienGreen, 0, -0.3, 0);
  const pivL = new THREE.Group(); pivL.position.set(-0.55, 1.25, 0); pivL.rotation.z = -0.4; pivL.add(armL);
  const armR = box(0.14, 0.7, 0.14, alienGreen, 0, 0.3, 0);
  const pivR = new THREE.Group(); pivR.position.set(0.55, 1.25, 0); pivR.add(armR);
  g.add(pivL, pivR);
  g.scale.setScalar(1.6);
  g.userData.arm = pivR;
  return g;
}
function makeMoonRocks() {
  const g = new THREE.Group();
  const crater = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.35, 6, 18), moonDark);
  crater.rotation.x = Math.PI / 2;
  crater.scale.z = 0.6;
  crater.position.y = 0.05;
  g.add(crater);
  for (let k = 0; k < 3; k++) {
    const r = new THREE.Mesh(rockGeo, moonRock);
    r.scale.setScalar(0.5 + Math.random() * 0.8);
    r.position.set(2 + Math.random() * 1.5, 0.3, (Math.random() - 0.5) * 3);
    r.rotation.set(Math.random() * 3, Math.random() * 3, 0);
    g.add(r);
  }
  return g;
}
const spaceMakers = [makeCrystals, makeCrystals, makeRocket, makeAlien, makeAlien, makeMoonRocks];
const SPACE_GAP = 9, SPACE_PER_SIDE = 14;
const spaceProps = [];
function placeSpaceProp(o, z) {
  if (o.userData.ship) { // a new rocket back on its pad
    o.userData.ship.position.y = 0;
    o.userData.launching = false;
    o.userData.vy = 0;
    for (const f of o.userData.flames) f.visible = false;
  }
  o.position.set(o.userData.side * (6.6 + Math.random() * 4), 0, z);
  o.rotation.y = -o.userData.side * Math.PI / 2 * 0.7; // face the track (and the camera a little)
}
for (let i = 0; i < SPACE_PER_SIDE * 2; i++) {
  const o = spaceMakers[Math.floor(Math.random() * spaceMakers.length)]();
  o.userData.side = i % 2 ? 1 : -1;
  o.userData.phase = Math.random() * 6;
  placeSpaceProp(o, 10 - Math.floor(i / 2) * SPACE_GAP - (i % 2) * SPACE_GAP / 2);
  o.visible = false;
  scene.add(o);
  spaceProps.push(o);
}
// craggy grey moon mountains with frosty tops
const mountains = new THREE.Group();
const mountainMat = new THREE.MeshLambertMaterial({ color: 0x9ca1c8, fog: false });
const peakMat = new THREE.MeshLambertMaterial({ color: 0xeef0ff, fog: false });
for (let i = 0; i < 18; i++) {
  const side = i % 2 ? 1 : -1;
  const h = 24 + Math.random() * 28, r = h * (0.5 + Math.random() * 0.25);
  const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 6 + Math.floor(Math.random() * 3), 1), mountainMat);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(r * 0.3, h * 0.3, m.geometry.parameters.radialSegments, 1), peakMat);
  cap.position.y = h * 0.35 + 0.05;
  m.add(cap);
  const mz = -42 - Math.random() * 40, dz = (mz - 7.5) * 0.976;
  m.position.set(side * (30 + Math.random() * 38), h / 2 - 1 - CURVE * dz * dz, mz); // sunk to sit on the curved horizon (they're drawn without the bend)
  m.rotation.y = Math.random() * Math.PI;
  mountains.add(m);
}
mountains.visible = false;
scene.add(mountains);
let nextLiftoff = 2;
// planets far away in the sky
const planets = new THREE.Group();
const earthTex = canvasTexture(256, 128, (ctx, w, h) => {
  ctx.fillStyle = '#3b82f6'; ctx.fillRect(0, 0, w, h);
  for (let k = 0; k < 14; k++) { ctx.fillStyle = k % 3 ? '#4cc96a' : '#ffffff'; ctx.beginPath(); ctx.ellipse(Math.random() * w, Math.random() * h, 10 + Math.random() * 26, 6 + Math.random() * 12, Math.random() * 3, 0, Math.PI * 2); ctx.fill(); }
});
const earth = new THREE.Mesh(new THREE.SphereGeometry(9, 24, 16), new THREE.MeshBasicMaterial({ map: earthTex, fog: false }));
earth.position.set(-48, 36, -165);
const ringTex = canvasTexture(256, 32, (ctx, w, h) => {
  ['#ffb36b', '#ff9e5c', '#ffd08a', '#ffb36b', '#ffc98a'].forEach((c, k) => { ctx.fillStyle = c; ctx.fillRect(0, k * h / 5, w, h / 5); });
});
const ringed = new THREE.Mesh(new THREE.SphereGeometry(12, 24, 16), new THREE.MeshBasicMaterial({ map: ringTex, fog: false }));
const ring = new THREE.Mesh(new THREE.RingGeometry(16, 23, 48), new THREE.MeshBasicMaterial({ color: 0xffe0b0, transparent: true, opacity: 0.7, side: THREE.DoubleSide, fog: false }));
ring.rotation.x = -Math.PI / 2.4;
ringed.add(ring);
ringed.rotation.z = 0.25;
ringed.position.set(58, 44, -180);
const moon = new THREE.Mesh(new THREE.SphereGeometry(3.5, 16, 12), new THREE.MeshBasicMaterial({ color: 0xdcdcf0, fog: false }));
moon.position.set(-18, 58, -170);
planets.add(earth, ringed, moon);
planets.visible = false;
scene.add(planets);
// a UFO zooms across the sky now and then
const ufo = new THREE.Group();
const disc = new THREE.Mesh(new THREE.SphereGeometry(3, 24, 10), lambert(0xc9d3e8));
disc.scale.y = 0.28;
const dome = new THREE.Mesh(new THREE.SphereGeometry(1.4, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x9ff3ff, transparent: true, opacity: 0.75 }));
dome.position.y = 0.4;
ufo.add(disc, dome);
const ufoLights = [];
for (let k = 0; k < 8; k++) {
  const a = (k / 8) * Math.PI * 2;
  const l = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  l.position.set(Math.cos(a) * 2.8, 0, Math.sin(a) * 2.8);
  ufo.add(l);
  ufoLights.push(l);
}
ufo.visible = false;
scene.add(ufo);
let ufoT = 3, ufoDir = 1;
function updateSpace(dt, move) {
  if (!inSpace) return;
  const t = performance.now() / 1000;
  // every few seconds a rocket up ahead blasts off
  nextLiftoff -= dt;
  if (nextLiftoff <= 0) {
    const r = spaceProps.find(o => o.userData.ship && !o.userData.launching && o.position.z < -25 && o.position.z > -75);
    if (r) { r.userData.launching = true; for (const f of r.userData.flames) f.visible = true; sfx.liftoff(); }
    nextLiftoff = r ? 3 + Math.random() * 4 : 0.5;
  }
  for (const o of spaceProps) {
    const u = o.userData;
    if (!u.launching) continue;
    u.vy += dt * (1.5 + u.ship.position.y * 0.4); // slow at first, then whoosh
    u.ship.position.y += u.vy * dt;
    u.ship.rotation.y += dt * 0.5;
    for (const f of u.flames) f.scale.set(1, 0.8 + Math.random() * 0.5, 1);
    if (u.ship.position.y < 40) {
      const y = (u.ship.position.y + 0.3) * 1.25;
      puff(o.position.x + (Math.random() - 0.5) * 1.5, y, o.position.z + (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 3, -1.5, (Math.random() - 0.5) * 3, 0xffffff, 0.9);
    }
    if (u.ship.position.y > 120) { u.launching = false; for (const f of u.flames) f.visible = false; }
  }
  for (const o of spaceProps) {
    o.position.z += move;
    if (o.position.z > DESPAWN_Z + 4) placeSpaceProp(o, o.position.z - SPACE_PER_SIDE * SPACE_GAP);
    const u = o.userData;
    if (u.arm) { u.arm.rotation.z = -2.4 + Math.sin(t * 7 + u.phase) * 0.5; o.position.y = Math.abs(Math.sin(t * 3 + u.phase)) * 0.3; } // aliens wave and hop
  }
  ufoT -= dt;
  if (!ufo.visible && ufoT <= 0) {
    ufoDir = Math.random() < 0.5 ? 1 : -1;
    ufo.position.set(-ufoDir * 80, 16 + Math.random() * 10, -45 - Math.random() * 35);
    ufo.visible = true;
  }
  if (ufo.visible) {
    ufo.position.x += ufoDir * dt * 16;
    ufo.position.y += Math.sin(t * 2) * dt * 2;
    ufo.rotation.y += dt * 2;
    ufo.rotation.z = Math.sin(t * 1.5) * 0.15;
    ufoLights.forEach((l, k) => l.material.color.setHSL(((t * 0.8) + k / 8) % 1, 1, 0.6));
    if (Math.abs(ufo.position.x) > 85) { ufo.visible = false; ufoT = 7 + Math.random() * 10; }
  }
  planets.rotation.y = 0;
  earth.rotation.y += dt * 0.1;
}
// the golden gate to Space: an arch over all three lanes, so she can't miss it
const gateTex = canvasTexture(256, 256, (ctx, w, h) => {
  const g = ctx.createRadialGradient(w / 2, h * 0.55, 8, w / 2, h * 0.55, w * 0.7);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.25, '#d9b8ff'); g.addColorStop(0.6, '#5a3fc0'); g.addColorStop(1, '#140f3a');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#ffffff';
  for (let k = 0; k < 70; k++) { ctx.globalAlpha = 0.4 + Math.random() * 0.6; ctx.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 3, 2 + Math.random() * 3); }
  ctx.globalAlpha = 1;
});
const gateSignTex = canvasTexture(512, 128, (ctx, w, h) => {
  ctx.fillStyle = '#2b2350'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(4, 4, w - 8, h - 8, 40) : ctx.rect(4, 4, w - 8, h - 8); ctx.fill();
  ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 8; ctx.stroke();
  ctx.fillStyle = '#ffd23f'; ctx.font = 'bold 78px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('TO SPACE!', w / 2, h / 2 + 4);
});
const goldMat = new THREE.MeshLambertMaterial({ color: 0xffd23f, emissive: 0x806000 });
function makeSpaceGate() {
  const g = new THREE.Group();
  const W = 4.3, H = 4.6;
  for (const sx of [-1, 1]) {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.7, H, 0.7), goldMat);
    pillar.position.set(sx * (W + 0.35), H / 2, 0);
    const st = new THREE.Mesh(starPickGeo, goldMat);
    st.position.set(sx * (W + 0.35), H + W + 0.6, 0);
    st.scale.setScalar(1.3);
    g.add(pillar, st);
  }
  const arch = new THREE.Mesh(new THREE.TorusGeometry(W + 0.35, 0.35, 10, 40, Math.PI), goldMat);
  arch.position.y = H;
  const shape = new THREE.Shape();
  shape.moveTo(-W, 0); shape.lineTo(-W, H); shape.absarc(0, H, W, Math.PI, 0, true); shape.lineTo(W, 0);
  const geo = new THREE.ShapeGeometry(shape, 24);
  const pos = geo.attributes.position, uv = geo.attributes.uv;
  for (let k = 0; k < pos.count; k++) uv.setXY(k, (pos.getX(k) + W) / (2 * W), pos.getY(k) / (H + W));
  const swirl = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: gateTex, transparent: true, opacity: 0.85, side: THREE.DoubleSide }));
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.25), new THREE.MeshBasicMaterial({ map: gateSignTex, transparent: true }));
  sign.position.set(0, H + W + 0.9, 0.1);
  g.add(swirl, arch, sign);
  g.userData = { spaceGate: true, halfW: 5, halfD: 0.5, height: 0, base: 0, swirl };
  return g;
}
