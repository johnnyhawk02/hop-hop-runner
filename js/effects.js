// Hop Hop Runner: Sparkles, dust, ducks, fireworks and speed streaks.

let popping = [];

// sparkle particles (a shared pool)
const sparkColors = [0xffd23f, 0xff5dc8, 0x5ee7ff, 0xffffff, 0x7dff9a];
const sparks = [];
for (let i = 0; i < 120; i++) {
  const m = new THREE.Mesh(starGeo, new THREE.MeshBasicMaterial({ color: sparkColors[i % sparkColors.length], transparent: true, opacity: 0 }));
  m.visible = false;
  m.userData = { v: new THREE.Vector3(), life: 0 };
  scene.add(m);
  sparks.push(m);
}
let sparkIdx = 0;
function burst(x, y, z, n = 26, gold = false) {
  for (let k = 0; k < n; k++) {
    const m = sparks[sparkIdx++ % sparks.length];
    m.position.set(x, y, z);
    const a = Math.random() * Math.PI * 2, up = Math.random();
    m.userData.v.set(Math.cos(a) * (2 + Math.random() * 3), 2 + up * 5, Math.sin(a) * (2 + Math.random() * 3));
    m.userData.life = 0.9 + Math.random() * 0.5;
    if (gold) m.material.color.setHex(0xffd23f);
    else m.material.color.setHex(sparkColors[k % sparkColors.length]);
    m.visible = true;
  }
}
function updateSparks(dt, move) {
  for (const m of sparks) {
    if (!m.visible) continue;
    const u = m.userData;
    u.life -= dt;
    if (u.life <= 0) { m.visible = false; continue; }
    u.v.y -= 9 * dt;
    m.position.addScaledVector(u.v, dt);
    m.position.z += move;
    m.rotation.x += dt * 8; m.rotation.y += dt * 6;
    m.material.opacity = Math.min(1, u.life * 1.5);
    m.scale.setScalar(0.6 + u.life);
  }
}

// little puffs of dust (landing, lane changes) and jetpack smoke
const puffGeo = new THREE.SphereGeometry(0.22, 7, 5);
const puffs = [];
for (let i = 0; i < 80; i++) {
  const m = new THREE.Mesh(puffGeo, new THREE.MeshBasicMaterial({ color: 0xf4ead8, transparent: true, opacity: 0, depthWrite: false }));
  m.visible = false;
  m.userData = { v: new THREE.Vector3(), life: 0, max: 1 };
  scene.add(m);
  puffs.push(m);
}
let puffIdx = 0;
function puff(x, y, z, vx, vy, vz, color, life) {
  const m = puffs[puffIdx++ % puffs.length];
  m.position.set(x, y, z);
  m.userData.v.set(vx, vy, vz);
  m.userData.life = m.userData.max = life;
  m.material.color.setHex(color);
  m.visible = true;
}
function dust(x, y, z, n, spread = 3) {
  for (let k = 0; k < n; k++) {
    const a = Math.random() * Math.PI * 2, sp = spread * (0.4 + Math.random() * 0.6);
    puff(x + (Math.random() - 0.5) * 0.6, y + 0.12, z + (Math.random() - 0.5) * 0.4, Math.cos(a) * sp, 0.6 + Math.random() * 1.4, Math.sin(a) * sp * 0.5, 0xf4ead8, 0.45 + Math.random() * 0.3);
  }
}
function updateDust(dt, move) {
  for (const m of puffs) {
    if (!m.visible) continue;
    const u = m.userData;
    u.life -= dt;
    if (u.life <= 0) { m.visible = false; continue; }
    u.v.multiplyScalar(Math.max(0, 1 - dt * 3));
    m.position.addScaledVector(u.v, dt);
    m.position.z += move;
    const t = u.life / u.max;
    m.material.opacity = 0.7 * t;
    m.scale.setScalar(1 + (1 - t) * 1.8);
  }
}

// a family of ducks waddling across the tracks; they flap away when she gets close
const duckMats = {
  white: lambert(0xffffff), yellow: lambert(0xffe066), beak: lambert(0xff9f1c), eye: lambert(0x2b2350), head: lambert(0x2e9e5b),
};
const duckBodyGeo = new THREE.SphereGeometry(0.32, 10, 8);
const duckHeadGeo = new THREE.SphereGeometry(0.17, 10, 8);
const ducks = [];
let nextDucks = 5;
function makeDuck(baby) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(duckBodyGeo, baby ? duckMats.yellow : duckMats.white);
  body.scale.set(0.85, 0.75, 1.2);
  body.position.y = 0.3;
  const head = new THREE.Mesh(duckHeadGeo, baby ? duckMats.yellow : duckMats.head);
  head.position.set(0, 0.62, 0.3);
  const beak = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.06, 0.16), duckMats.beak);
  beak.position.set(0, 0.6, 0.48);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.22, 6), baby ? duckMats.yellow : duckMats.white);
  tail.rotation.x = -2.2;
  tail.position.set(0, 0.42, -0.4);
  g.add(body, head, beak, tail);
  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 4), duckMats.eye);
    eye.position.set(sx * 0.1, 0.67, 0.42);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.04, 0.16), duckMats.beak);
    foot.position.set(sx * 0.1, 0.02, 0.05);
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.2, 0.42), baby ? duckMats.yellow : duckMats.white);
    wing.position.set(sx * 0.27, 0.36, 0);
    g.add(eye, foot, wing);
    g.userData[sx < 0 ? 'wingL' : 'wingR'] = wing;
    g.userData[sx < 0 ? 'footL' : 'footR'] = foot;
  }
  g.scale.setScalar(baby ? 0.85 : 1.5);
  return g;
}
function trackClearAt(z0, z1) {
  // no trains or bridges for the ducks to walk into
  return !obstacles.some(o => o.userData.tall && o.position.z + o.userData.halfD > z0 && o.position.z - o.userData.halfD < z1)
    && !platforms.some(p => p.position.z > z0 && p.position.z - p.userData.length < z1);
}
function spawnDucks() {
  const z = -62;
  if (!trackClearAt(z - 10, z + 10)) { nextDucks = 1.5; return; }
  const dir = Math.random() < 0.5 ? 1 : -1;
  const n = 2 + Math.floor(Math.random() * 5);
  for (let k = 0; k < n; k++) {
    const d = makeDuck(k > 0);
    d.position.set(-dir * (4.2 + k * 0.75), 0, z + (Math.random() - 0.5) * 0.4);
    d.rotation.y = dir * Math.PI / 2;
    d.userData.dir = dir;
    d.userData.phase = k * 0.7;
    d.userData.flying = 0;
    scene.add(d);
    ducks.push(d);
  }
}
function updateDucks(dt, move, running) {
  if (running) {
    nextDucks -= dt;
    if (nextDucks <= 0) { if (!awayFromTown) spawnDucks(); if (nextDucks <= 0) nextDucks = 9 + Math.random() * 12; }
  }
  const t = performance.now() / 1000;
  let quacked = false;
  for (let i = ducks.length - 1; i >= 0; i--) {
    const d = ducks[i], u = d.userData;
    d.position.z += move;
    if (!u.flying) {
      d.position.x += u.dir * 1.7 * dt;
      d.rotation.z = Math.sin(t * 12 + u.phase) * 0.15; // waddle
      u.footL.position.z = 0.05 + Math.sin(t * 12 + u.phase) * 0.08;
      u.footR.position.z = 0.05 - Math.sin(t * 12 + u.phase) * 0.08;
      // she's coming! flap away, never a crash
      if (running && Math.abs(d.position.z) < 3.5 && Math.abs(d.position.x - s.x) < 1.8 && s.y < 1.5) {
        u.flying = 1;
        u.vy = 4 + Math.random() * 2;
        u.vx = (d.position.x >= s.x ? 1 : -1) * (2 + Math.random() * 2);
        if (!quacked) { sfx.quack(); sfx.quack(0.18); quacked = true; }
        burst(d.position.x, 0.5, d.position.z, 4);
      }
    } else {
      u.flying += dt;
      u.vy -= 4 * dt;
      d.position.y += u.vy * dt;
      d.position.x += u.vx * dt;
      d.rotation.z = 0;
      u.wingL.rotation.z = Math.sin(t * 40) * 0.9;
      u.wingR.rotation.z = -Math.sin(t * 40) * 0.9;
      if (d.position.y < 0) { d.position.y = 0; u.flying = 0; u.vy = 0; }
    }
    if (d.position.z > DESPAWN_Z || Math.abs(d.position.x) > 7) { scene.remove(d); ducks.splice(i, 1); }
  }
}

// fireworks bursting in the sky now and then
const fwMats = [0xff5d73, 0xffd23f, 0x5ee7ff, 0x7dff9a, 0xff8fd8, 0xffffff].map(c => new THREE.MeshBasicMaterial({ color: c, fog: false, transparent: true }));
const fwGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const fwBits = [];
for (let i = 0; i < 90; i++) {
  const m = new THREE.Mesh(fwGeo, fwMats[0]);
  m.visible = false;
  m.userData = { v: new THREE.Vector3(), life: 0 };
  scene.add(m);
  fwBits.push(m);
}
const fwRockets = [];
let fwBit = 0, nextFirework = 6;
function launchFirework() {
  const m = new THREE.Mesh(fwGeo, fwMats[5]);
  m.position.set((Math.random() < 0.5 ? -1 : 1) * (8 + Math.random() * 18), 4, -55 - Math.random() * 25);
  m.userData = { vy: 22 + Math.random() * 6, life: 1.1 + Math.random() * 0.4, mat: fwMats[Math.floor(Math.random() * 5)] };
  scene.add(m);
  fwRockets.push(m);
}
function updateFireworks(dt) {
  nextFirework -= dt;
  if (nextFirework <= 0) {
    const n = 1 + Math.floor(Math.random() * 3);
    for (let k = 0; k < n; k++) setTimeout(launchFirework, k * 350);
    nextFirework = 14 + Math.random() * 18;
  }
  for (let i = fwRockets.length - 1; i >= 0; i--) {
    const r = fwRockets[i], u = r.userData;
    r.position.y += u.vy * dt;
    u.life -= dt;
    if (u.life <= 0) {
      for (let k = 0; k < 30; k++) {
        const b = fwBits[fwBit++ % fwBits.length];
        b.material = Math.random() < 0.7 ? u.mat : fwMats[5];
        b.position.copy(r.position);
        const a = Math.random() * Math.PI * 2, e = Math.random() * Math.PI - Math.PI / 2, sp = 8 + Math.random() * 3;
        b.userData.v.set(Math.cos(a) * Math.cos(e) * sp, Math.sin(e) * sp, Math.sin(a) * Math.cos(e) * sp);
        b.userData.life = 1.4 + Math.random() * 0.5;
        b.visible = true;
      }
      scene.remove(r);
      fwRockets.splice(i, 1);
    }
  }
  for (const b of fwBits) {
    if (!b.visible) continue;
    const u = b.userData;
    u.life -= dt;
    if (u.life <= 0) { b.visible = false; continue; }
    u.v.multiplyScalar(1 - dt * 1.5);
    u.v.y -= 3 * dt;
    b.position.addScaledVector(u.v, dt);
    b.scale.setScalar(Math.min(1, u.life));
  }
}

// white speed streaks rushing past while zooming
const streakMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, fog: false, depthWrite: false });
const streaks = [];
for (let i = 0; i < 36; i++) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 3 + Math.random() * 3), streakMat);
  const a = Math.random() * Math.PI * 2, r = 2.5 + Math.random() * 4;
  m.userData = { ox: Math.cos(a) * r, oy: 2.5 + Math.sin(a) * r * 0.7 };
  m.position.set(m.userData.ox, m.userData.oy, -Math.random() * 60);
  m.visible = false;
  scene.add(m);
  streaks.push(m);
}
