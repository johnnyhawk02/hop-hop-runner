// Hop Hop Runner: Under the Sea.

// ---------- Under the Sea: through the bubble portal (or a mystery box splash) ----------
const UNDER = 5;
const seaWorld = new THREE.Group(); // rays, bubbles, fish, jellyfish, dolphin, whale
seaWorld.visible = false;
scene.add(seaWorld);
const coralMats = [0xff6f91, 0xff9f5c, 0xb388ff, 0xffd23f, 0x5ee7d6].map(c => lambert(c));
const weedMat = lambert(0x2fbf71), weedMat2 = lambert(0x7ddf64), sandRock = lambert(0xc9b48a);
const pearlMat = new THREE.MeshBasicMaterial({ color: 0xfff8f0 }), chestMat = lambert(0x8a5a2b), goldMat2 = new THREE.MeshLambertMaterial({ color: 0xffd23f, emissive: 0x6a4a00 });
function makeCoral() {
  const g = new THREE.Group(), mat = coralMats[Math.floor(Math.random() * coralMats.length)];
  const n = 4 + Math.floor(Math.random() * 4);
  for (let k = 0; k < n; k++) {
    const h = 1.2 + Math.random() * 2.2;
    const br = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, h, 7), mat);
    const a = (k / n) * Math.PI * 2, lean = 0.2 + Math.random() * 0.5;
    br.position.set(Math.cos(a) * Math.sin(lean) * h / 2, Math.cos(lean) * h / 2, Math.sin(a) * Math.sin(lean) * h / 2);
    br.rotation.set(Math.sin(a) * lean, 0, -Math.cos(a) * lean);
    const tip = ball(0.22, mat, br.position.x * 2, Math.cos(lean) * h, br.position.z * 2, 8);
    g.add(br, tip);
  }
  g.scale.setScalar(1.3 + Math.random() * 0.8);
  return g;
}
function makeSeaweed() {
  const g = new THREE.Group();
  g.userData.stalks = [];
  for (let k = 0; k < 4 + Math.floor(Math.random() * 3); k++) {
    const st = new THREE.Group();
    st.position.set((Math.random() - 0.5) * 1.6, 0, (Math.random() - 0.5) * 1.6);
    let parent = st;
    for (let j = 0; j < 5; j++) { // a wobbly chain of segments
      const seg = new THREE.Group();
      seg.position.y = j ? 0.9 : 0;
      const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.22 - j * 0.03, 0.95, 0.06), k % 2 ? weedMat : weedMat2);
      leaf.position.y = 0.45;
      seg.add(leaf);
      parent.add(seg);
      st.userData.segs = (st.userData.segs || []).concat(seg);
      parent = seg;
    }
    st.userData.phase = Math.random() * 6;
    g.add(st);
    g.userData.stalks.push(st);
  }
  g.scale.setScalar(1.2 + Math.random() * 0.6);
  return g;
}
function makeClam() {
  const g = new THREE.Group(), mat = coralMats[Math.floor(Math.random() * 3)];
  const bottom = new THREE.Mesh(new THREE.SphereGeometry(0.9, 14, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat);
  bottom.scale.y = 0.45; bottom.position.y = 0.42;
  const lid = new THREE.Group(); lid.position.set(0, 0.42, 0.85);
  const top = new THREE.Mesh(new THREE.SphereGeometry(0.9, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat);
  top.scale.y = 0.45; top.position.z = -0.85;
  lid.add(top);
  const pearl = ball(0.3, pearlMat, 0, 0.6, 0, 12);
  g.add(bottom, lid, pearl);
  g.userData.lid = lid;
  g.scale.setScalar(1.4);
  return g;
}
function makeChest() {
  const g = new THREE.Group();
  g.add(box(1.8, 1.0, 1.1, chestMat, 0, 0.5, 0), box(1.86, 0.12, 1.16, goldMat2, 0, 0.95, 0), box(0.2, 0.3, 0.1, goldMat2, 0, 0.8, -0.58));
  const lid = new THREE.Group(); lid.position.set(0, 1.0, 0.55);
  const lidBox = box(1.8, 0.5, 1.1, chestMat, 0, 0.25, -0.55);
  lid.add(lidBox); lid.rotation.x = -0.7; // open, full of treasure
  for (let k = 0; k < 7; k++) g.add(ball(0.18, goldMat2, (Math.random() - 0.5) * 1.3, 1.0 + Math.random() * 0.2, (Math.random() - 0.5) * 0.6, 8));
  g.add(lid, ball(0.16, pearlMat, 0.3, 1.2, 0, 8));
  g.scale.setScalar(1.3);
  return g;
}
function makeStarRock() {
  const g = new THREE.Group();
  const rock = new THREE.Mesh(rockGeo, sandRock);
  rock.scale.set(1.4, 0.7, 1.2); rock.position.y = 0.35;
  const st = new THREE.Mesh(starPickGeo, coralMats[Math.random() < 0.5 ? 0 : 1]);
  st.rotation.x = -Math.PI / 2 + 0.3; st.position.set(0.2, 0.95, 0); st.scale.setScalar(0.9);
  g.add(rock, st);
  g.scale.setScalar(1.3);
  return g;
}
const seaMakers = [makeCoral, makeCoral, makeSeaweed, makeSeaweed, makeClam, makeChest, makeStarRock];
const SEA_GAP = 8, SEA_PER_SIDE = 16;
const seaProps = [];
function placeSeaProp(o, z) {
  o.position.set(o.userData.side * (5.6 + Math.random() * 5), 0, z);
  o.rotation.y = Math.random() * Math.PI * 2;
  if (o.userData.lid || o.userData.stalks) o.rotation.y = -o.userData.side * Math.PI / 2 * 0.7;
}
for (let i = 0; i < SEA_PER_SIDE * 2; i++) {
  const o = seaMakers[Math.floor(Math.random() * seaMakers.length)]();
  o.userData.side = i % 2 ? 1 : -1;
  o.userData.phase = Math.random() * 6;
  placeSeaProp(o, 10 - Math.floor(i / 2) * SEA_GAP - (i % 2) * SEA_GAP / 2);
  o.visible = false;
  scene.add(o);
  seaProps.push(o);
}
// sunbeams slanting down through the water
const rayMat = new THREE.MeshBasicMaterial({ color: 0xdffaff, transparent: true, opacity: 0.08, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, fog: false });
const rays = [];
for (let i = 0; i < 9; i++) {
  const r = new THREE.Mesh(new THREE.PlaneGeometry(3 + Math.random() * 3, 70), rayMat);
  r.position.set((Math.random() - 0.5) * 40, 25, -10 - i * 12);
  r.rotation.set(0, Math.random() * Math.PI, 0.35);
  r.userData.phase = Math.random() * 6;
  seaWorld.add(r);
  rays.push(r);
}
// bubbles rising everywhere
const bubbleMat = new THREE.MeshBasicMaterial({ color: 0xe8fbff, transparent: true, opacity: 0.55, depthWrite: false });
const bubbleGeo = new THREE.SphereGeometry(0.12, 8, 6);
const bubbles = [];
function resetBubble(b, z) { b.position.set((Math.random() - 0.5) * 30, Math.random() * 2, z); b.userData.v = 1.2 + Math.random() * 1.6; b.scale.setScalar(0.5 + Math.random() * 1.4); }
for (let i = 0; i < 70; i++) {
  const b = new THREE.Mesh(bubbleGeo, bubbleMat);
  resetBubble(b, 5 - Math.random() * 100);
  b.position.y = Math.random() * 14;
  seaWorld.add(b);
  bubbles.push(b);
}
let bubbleIdx = 0;
function blowBubbles(x, y, z, n) {
  for (let k = 0; k < n; k++) {
    const b = bubbles[bubbleIdx++ % bubbles.length];
    b.position.set(x + (Math.random() - 0.5) * 0.4, y + Math.random() * 0.3, z + (Math.random() - 0.5) * 0.4);
    b.userData.v = 2 + Math.random();
    b.scale.setScalar(0.4 + Math.random() * 0.6);
  }
}
// schools of little fish darting across
const fishMats = [0xff9f1c, 0xffd23f, 0x5ec8e5, 0xff5dc8, 0x7dff9a].map(c => lambert(c));
const fishBody = new THREE.SphereGeometry(0.35, 10, 8), fishTail = new THREE.ConeGeometry(0.22, 0.4, 6);
function makeFish(mat) {
  const f = new THREE.Group();
  const b = new THREE.Mesh(fishBody, mat); b.scale.set(1.2, 0.75, 0.45);
  const t = new THREE.Mesh(fishTail, mat); t.rotation.z = Math.PI / 2; t.position.x = -0.55; t.scale.z = 0.4;
  const e = ball(0.06, alienPupil, 0.25, 0.08, 0.14, 6), e2 = ball(0.06, alienPupil, 0.25, 0.08, -0.14, 6);
  f.add(b, t, e, e2);
  f.userData.tail = t;
  return f;
}
const schools = [];
for (let k = 0; k < 3; k++) {
  const sc = new THREE.Group();
  const mat = fishMats[k % fishMats.length];
  for (let j = 0; j < 9; j++) {
    const f = makeFish(Math.random() < 0.8 ? mat : fishMats[(k + 2) % fishMats.length]);
    f.position.set((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 3);
    f.userData.phase = Math.random() * 6;
    sc.add(f);
  }
  sc.visible = false;
  sc.userData.t = 1 + k * 3;
  seaWorld.add(sc);
  schools.push(sc);
}
// jellyfish bobbing about, glowing
const jellies = [];
for (let k = 0; k < 7; k++) {
  const j = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color: [0xff9ee8, 0xb7a3ff, 0x9ff3ff][k % 3], transparent: true, opacity: 0.75 });
  const bell = new THREE.Mesh(new THREE.SphereGeometry(0.7, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat);
  j.add(bell);
  for (let t = 0; t < 6; t++) {
    const a = (t / 6) * Math.PI * 2;
    const ten = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.02, 1.4, 4), mat);
    ten.position.set(Math.cos(a) * 0.4, -0.7, Math.sin(a) * 0.4);
    j.add(ten);
  }
  j.userData = { bell, phase: Math.random() * 6 };
  j.position.set((Math.random() < 0.5 ? -1 : 1) * (4 + Math.random() * 6), 4 + Math.random() * 6, -20 - k * 14);
  seaWorld.add(j);
  jellies.push(j);
}
// a dolphin that leaps right over the track
const dolphinMat = lambert(0x6f9fd0), bellyMat = lambert(0xdcecf7);
const dolphin = new THREE.Group();
const dBody = ball(1, dolphinMat, 0, 0, 0, 16); dBody.scale.set(2.2, 0.7, 0.7);
const dBelly = ball(0.9, bellyMat, 0.2, -0.18, 0, 12); dBelly.scale.set(1.8, 0.5, 0.6);
const snout = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.9, 10), dolphinMat); snout.rotation.z = -Math.PI / 2; snout.position.x = 2.4;
const fin = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.8, 6), dolphinMat); fin.position.set(-0.2, 0.75, 0); fin.rotation.z = 0.4; fin.scale.z = 0.3;
const fluke = box(0.5, 0.12, 1.4, dolphinMat, -2.3, 0, 0);
const dEye = ball(0.09, alienPupil, 1.6, 0.18, 0.42, 6), dEye2 = ball(0.09, alienPupil, 1.6, 0.18, -0.42, 6);
dolphin.add(dBody, dBelly, snout, fin, fluke, dEye, dEye2);
dolphin.visible = false;
seaWorld.add(dolphin);
let dolphinT = 3, dolphinP = -1, dolphinDir = 1, dolphinZ = -30;
// and a big friendly whale far off in the blue
const whale = new THREE.Group();
const wMat = lambert(0x3d6fa8);
const wBody = ball(6, wMat, 0, 0, 0, 18); wBody.scale.set(2.4, 0.9, 1);
const wTail = box(2, 0.5, 7, wMat, -15, 1, 0);
const wEye = ball(0.5, alienPupil, 9, 0.5, 4.6, 8);
whale.add(wBody, wTail, wEye);
whale.position.set(-90, 26, -95);
seaWorld.add(whale);
let blubT = 1;
function updateSea(dt, move) {
  if (!inSea) return;
  const t = performance.now() / 1000;
  for (const o of seaProps) {
    o.position.z += move;
    if (o.position.z > DESPAWN_Z + 4) placeSeaProp(o, o.position.z - SEA_PER_SIDE * SEA_GAP);
    const u = o.userData;
    if (u.stalks) for (const st of u.stalks) st.userData.segs.forEach((seg, j) => { seg.rotation.z = Math.sin(t * 1.6 + st.userData.phase + j * 0.6) * 0.18; seg.rotation.x = Math.cos(t * 1.2 + st.userData.phase) * 0.08; });
    if (u.lid && !u.lid.children[0].isGroup && u.lid.children.length === 1 && u.lid.children[0].geometry && u.lid.children[0].geometry.type === 'SphereGeometry') u.lid.rotation.x = -0.25 - (Math.sin(t * 1.5 + u.phase) * 0.5 + 0.5) * 0.7; // clams open and shut
  }
  for (const r of rays) {
    r.position.z += move * 0.3;
    if (r.position.z > 10) r.position.z -= 110;
    r.material.opacity = 0.06 + Math.sin(t * 0.7 + r.userData.phase) * 0.03;
  }
  for (const b of bubbles) {
    b.position.y += b.userData.v * dt;
    b.position.x += Math.sin(t * 3 + b.position.z) * dt * 0.3;
    b.position.z += move;
    if (b.position.y > 16 || b.position.z > DESPAWN_Z) resetBubble(b, b.position.z > DESPAWN_Z ? -95 + Math.random() * 10 : b.position.z);
  }
  // a little stream of bubbles from her helmet, with a blub now and then
  blubT -= dt;
  if (blubT <= 0) { blowBubbles(s.x, s.y + 2.1, 0.2, 2); blubT = 0.35 + Math.random() * 0.4; if (Math.random() < 0.3) sfx.blub(); }
  for (const sc of schools) {
    sc.userData.t -= dt;
    if (!sc.visible && sc.userData.t <= 0) {
      sc.userData.dir = Math.random() < 0.5 ? 1 : -1;
      sc.position.set(-sc.userData.dir * 30, 2.5 + Math.random() * 7, -12 - Math.random() * 45);
      sc.rotation.y = sc.userData.dir > 0 ? 0 : Math.PI;
      sc.visible = true;
    }
    if (sc.visible) {
      sc.position.x += sc.userData.dir * dt * 7;
      sc.position.z += move * 0.5;
      for (const f of sc.children) { f.userData.tail.rotation.y = Math.sin(t * 14 + f.userData.phase) * 0.6; f.position.y += Math.sin(t * 3 + f.userData.phase) * dt * 0.4; }
      if (Math.abs(sc.position.x) > 32 || sc.position.z > 8) { sc.visible = false; sc.userData.t = 2 + Math.random() * 5; }
    }
  }
  for (const j of jellies) {
    const u = j.userData;
    j.position.z += move * 0.85;
    j.position.y += Math.sin(t * 1.3 + u.phase) * dt * 0.8;
    const pulse = 1 + Math.sin(t * 3 + u.phase) * 0.12;
    u.bell.scale.set(pulse, 1 / pulse, pulse);
    if (j.position.z > DESPAWN_Z) j.position.set((Math.random() < 0.5 ? -1 : 1) * (4 + Math.random() * 6), 4 + Math.random() * 6, -95);
  }
  // the dolphin leaps across the track up ahead every few seconds
  dolphinT -= dt;
  if (dolphinP < 0 && dolphinT <= 0) { dolphinP = 0; dolphinDir = Math.random() < 0.5 ? 1 : -1; dolphinZ = -28 - Math.random() * 15; dolphin.visible = true; blowBubbles(-dolphinDir * 12, 0.5, dolphinZ, 8); }
  if (dolphinP >= 0) {
    dolphinP += dt / 2.2;
    dolphinZ += move;
    const x = -dolphinDir * 13 + dolphinDir * 26 * dolphinP, y = -1 + 11 * Math.sin(Math.PI * dolphinP);
    dolphin.position.set(x, y, dolphinZ);
    dolphin.rotation.set(0, dolphinDir > 0 ? 0 : Math.PI, Math.atan2(11 * Math.PI * Math.cos(Math.PI * dolphinP), 26));
    if (dolphinP >= 1) { dolphinP = -1; dolphin.visible = false; dolphinT = 4 + Math.random() * 5; blowBubbles(dolphinDir * 12, 0.5, dolphinZ, 8); }
  }
  whale.position.x += dt * 2.5;
  whale.position.y = 26 + Math.sin(t * 0.3) * 2;
  if (whale.position.x > 110) whale.position.x = -110;
}
// the bubble portal: an aqua ring full of swirling sea, with fish swimming round it
const seaTex = canvasTexture(256, 256, (ctx, w, h) => {
  const g = ctx.createRadialGradient(w / 2, h / 2, 6, w / 2, h / 2, w / 2);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.3, '#9ff3ff'); g.addColorStop(0.75, '#1f8fd1'); g.addColorStop(1, '#0b4f8a');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 3;
  for (let k = 0; k < 18; k++) { ctx.beginPath(); ctx.arc(Math.random() * w, Math.random() * h, 4 + Math.random() * 12, 0, Math.PI * 2); ctx.stroke(); }
});
function makeSeaPortal() {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.22, 12, 36), new THREE.MeshLambertMaterial({ color: 0x5ee7ff, emissive: 0x1a6a80 }));
  ring.position.y = 1.5;
  const swirl = new THREE.Mesh(new THREE.CircleGeometry(1.15, 32), new THREE.MeshBasicMaterial({ map: seaTex, transparent: true, opacity: 0.9, side: THREE.DoubleSide }));
  swirl.position.y = 1.5;
  const orbit = new THREE.Group(); orbit.position.y = 1.5;
  for (let k = 0; k < 4; k++) {
    const f = makeFish(fishMats[k]);
    const a = (k / 4) * Math.PI * 2;
    f.position.set(Math.cos(a) * 1.75, Math.sin(a) * 1.75, 0);
    f.rotation.z = a + Math.PI / 2;
    f.scale.setScalar(0.8);
    orbit.add(f);
  }
  g.add(ring, swirl, orbit, portalSign('🐠', '#3fb6ff'));
  for (let k = 0; k < 6; k++) g.add(ball(0.08 + Math.random() * 0.08, bubbleMat, (Math.random() - 0.5) * 2.4, 0.4 + Math.random() * 2.6, 0.2, 6));
  g.userData = { seaPortal: true, halfW: 0.9, halfD: 0.5, height: 0, base: 0, swirl, orbit };
  return g;
}
// the rocket portal: a starry ring with little planets going round, straight to Space
const starSwirlTex = canvasTexture(256, 256, (ctx, w, h) => {
  const g = ctx.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.25, '#c9a8ff'); g.addColorStop(0.7, '#2a1a6e'); g.addColorStop(1, '#140f3a');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#ffffff';
  for (let k = 0; k < 40; k++) { ctx.beginPath(); ctx.arc(Math.random() * w, Math.random() * h, 1 + Math.random() * 2.5, 0, Math.PI * 2); ctx.fill(); }
});
function makeStarPortal() {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.22, 12, 36), new THREE.MeshLambertMaterial({ color: 0xff7ad9, emissive: 0x6a1a5a }));
  ring.position.y = 1.5;
  const swirl = new THREE.Mesh(new THREE.CircleGeometry(1.15, 32), new THREE.MeshBasicMaterial({ map: starSwirlTex, side: THREE.DoubleSide }));
  swirl.position.y = 1.5;
  const orbit = new THREE.Group(); orbit.position.y = 1.5;
  [0xffd23f, 0x5ec8e5, 0xff9f5c].forEach((c, k) => {
    const a = (k / 3) * Math.PI * 2;
    orbit.add(ball(0.2 + k * 0.05, new THREE.MeshBasicMaterial({ color: c }), Math.cos(a) * 1.8, Math.sin(a) * 1.8, 0, 10));
  });
  for (const sx of [-1, 1]) {
    const st = new THREE.Mesh(starPickGeo, goldMat2);
    st.scale.setScalar(0.35); st.position.set(sx * 1.25, 2.85, 0);
    g.add(st);
  }
  g.add(ring, swirl, orbit, portalSign('🚀', '#ff7ad9'));
  g.userData = { starPortal: true, halfW: 0.9, halfD: 0.5, height: 0, base: 0, swirl, orbit };
  return g;
}
