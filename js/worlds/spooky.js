// Hop Hop Runner: Spooky World.

// ---------- Spooky World: friendly ghosts, through the ghost portal ----------
const SPOOKY = 6;
const spookyWorld = new THREE.Group(); // floating ghosts
const hallowGroup = new THREE.Group(); // bats, bigMoon, witch and fireflies: Spooky World and Halloween towns
spookyWorld.visible = hallowGroup.visible = false;
scene.add(spookyWorld, hallowGroup);
const ghostMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xc8d0ff, emissiveIntensity: 0.5, transparent: true, opacity: 0.93, side: THREE.DoubleSide });
const ghostEye = new THREE.MeshBasicMaterial({ color: 0x1a1030 }), ghostCheek = new THREE.MeshBasicMaterial({ color: 0xffa3c4 });
const ghostPts = [new THREE.Vector2(0.72, -0.15), new THREE.Vector2(0.64, 0.2), new THREE.Vector2(0.6, 0.6)];
for (let k = 1; k <= 12; k++) { const a = (k / 12) * Math.PI / 2; ghostPts.push(new THREE.Vector2(Math.cos(a) * 0.6 + 0.0001, 0.6 + Math.sin(a) * 0.62)); }
const ghostGeo = new THREE.LatheGeometry(ghostPts, 20);
function makeGhost() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(ghostGeo, ghostMat);
  g.add(body);
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; g.add(ball(0.17, ghostMat, Math.cos(a) * 0.62, -0.16, Math.sin(a) * 0.62, 8)); } // a wavy hem
  for (const sx of [-1, 1]) {
    const e = ball(0.11, ghostEye, sx * 0.2, 0.78, 0.53, 10); e.scale.set(0.8, 1.2, 0.5);
    const gl = ball(0.035, pearlMat, sx * 0.2 - 0.03, 0.83, 0.585, 6);
    const ch = ball(0.07, ghostCheek, sx * 0.34, 0.6, 0.47, 8); ch.scale.z = 0.4;
    g.add(e, gl, ch);
  }
  const mouth = ball(0.07, ghostEye, 0, 0.52, 0.56, 8); mouth.scale.set(0.8, 1.1, 0.4);
  const armL = ball(0.15, ghostMat, -0.66, 0.45, 0.05, 8), armR = ball(0.15, ghostMat, 0.66, 0.45, 0.05, 8);
  g.add(mouth, armL, armR);
  g.userData.arms = [armL, armR];
  return g;
}
const graveMat = lambert(0x8f8aa3), dirtMat = lambert(0x4a3b4f), barkMat = lambert(0x2b1f33), houseMat = lambert(0x4a2f6b), spookRoofMat = lambert(0x231a30);
const winMat = new THREE.MeshBasicMaterial({ color: 0xffb347 });
const booTex = canvasTexture(128, 64, (ctx, w, h) => { ctx.fillStyle = '#5d5870'; ctx.font = 'bold 40px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('BOO', w / 2, h / 2 + 2); });
function makeGrave() {
  const g = new THREE.Group();
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.25, 16), graveMat);
  top.rotation.x = Math.PI / 2; top.position.y = 1.0;
  const mound = ball(0.6, dirtMat, 0, 0, 0.5, 8); mound.scale.set(1, 0.3, 1.2);
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.3), new THREE.MeshBasicMaterial({ map: booTex, transparent: true }));
  plate.position.set(0, 0.8, 0.13);
  g.add(box(0.9, 1.0, 0.25, graveMat, 0, 0.5, 0), top, mound, plate);
  if (Math.random() < 0.6) { const gh = makeGhost(); gh.scale.setScalar(0.6); gh.position.set(0, 0, -0.45); g.add(gh); g.userData.peek = gh; } // a ghost that peeks out
  g.userData.faces = true;
  g.scale.setScalar(1.3);
  return g;
}
function makeSpookyTree() {
  const g = new THREE.Group();
  const h = 3 + Math.random() * 2;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.35, h, 6), barkMat);
  trunk.position.y = h / 2;
  g.add(trunk);
  for (let k = 0; k < 5; k++) {
    const L = 0.8 + Math.random() * 1.2, a = Math.random() * Math.PI * 2, y = h * (0.5 + Math.random() * 0.45), tilt = 0.6 + Math.random() * 0.6;
    const br = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.1, L, 5), barkMat);
    br.position.set(Math.cos(a) * Math.sin(tilt) * L / 2, y + Math.cos(tilt) * L / 2, Math.sin(a) * Math.sin(tilt) * L / 2);
    br.rotation.set(Math.sin(a) * tilt, 0, -Math.cos(a) * tilt);
    g.add(br);
  }
  g.scale.setScalar(1.2 + Math.random() * 0.5);
  return g;
}
const shroomMats = [0x7dff9a, 0xc77dff, 0x5ee7ff].map(c => new THREE.MeshBasicMaterial({ color: c }));
function makeShrooms() {
  const g = new THREE.Group();
  for (let k = 0; k < 4; k++) {
    const h = 0.3 + Math.random() * 0.5, x = (Math.random() - 0.5) * 1.4, z = (Math.random() - 0.5) * 1.4;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, h, 6), lambert(0xf2eadf));
    stem.position.set(x, h / 2, z);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.22 + Math.random() * 0.12, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), shroomMats[k % 3]);
    cap.position.set(x, h, z);
    g.add(stem, cap);
  }
  g.scale.setScalar(1.5);
  return g;
}
function makeHauntedHouse() {
  const g = new THREE.Group();
  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.3, 2.4, 4), spookRoofMat);
  roof.rotation.y = Math.PI / 4; roof.position.y = 4.7;
  const spire = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1.8, 4), spookRoofMat);
  spire.rotation.y = Math.PI / 4; spire.position.set(1.6, 6.4, 0.6);
  g.add(box(4, 3.5, 3.5, houseMat, 0, 1.75, 0), roof, box(1.4, 5.5, 1.4, houseMat, 1.6, 2.75, 0.6), spire,
    box(0.7, 0.8, 0.05, winMat, -1, 2.3, 1.78), box(0.7, 0.8, 0.05, winMat, 0.4, 2.3, 1.78), box(0.5, 0.6, 0.05, winMat, 1.6, 4.5, 1.32),
    box(0.9, 1.4, 0.05, spookRoofMat, -0.2, 0.7, 1.78));
  g.userData.house = true; g.userData.faces = true;
  g.scale.setScalar(1.3);
  return g;
}
const spookyMakers = [makeSpookyTree, makeSpookyTree, makeGrave, makeGrave, makeGrave, makeShrooms, makeHauntedHouse];
const SPOOK_GAP = 8, SPOOK_PER_SIDE = 16;
const spookyProps = [];
function placeSpookyProp(o, z) {
  const side = o.userData.side;
  o.position.set(side * (o.userData.house ? 15 + Math.random() * 6 : 5.6 + Math.random() * 5), 0, z);
  o.rotation.y = o.userData.faces ? -side * (0.4 + Math.random() * 0.4) : Math.random() * Math.PI * 2;
}
for (let i = 0; i < SPOOK_PER_SIDE * 2; i++) {
  const o = spookyMakers[Math.floor(Math.random() * spookyMakers.length)]();
  o.userData.side = i % 2 ? 1 : -1;
  o.userData.phase = Math.random() * 6;
  placeSpookyProp(o, 10 - Math.floor(i / 2) * SPOOK_GAP - (i % 2) * SPOOK_GAP / 2);
  o.visible = false;
  scene.add(o);
  spookyProps.push(o);
}
// jack-o'-lanterns along the track, glowing
const pumpkinTex = canvasTexture(256, 128, (ctx, w, h) => {
  ctx.fillStyle = '#ff7a1a'; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#e0600c'; ctx.lineWidth = 4;
  for (let x = 0; x < w; x += 21) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
});
const pumpkinGlow = canvasTexture(256, 128, (ctx, w, h) => {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#ffd23f';
  const cx = w * 0.25, cy = h * 0.5; // the face looks towards +z
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx + sx * 10, cy - 6); ctx.lineTo(cx + sx * 28, cy - 6); ctx.lineTo(cx + sx * 19, cy - 24); ctx.fill(); }
  ctx.beginPath(); ctx.moveTo(cx - 30, cy + 8); ctx.quadraticCurveTo(cx, cy + 40, cx + 30, cy + 8); ctx.quadraticCurveTo(cx, cy + 22, cx - 30, cy + 8); ctx.fill();
});
const pumpkinMat = new THREE.MeshLambertMaterial({ map: pumpkinTex, emissive: 0xffffff, emissiveMap: pumpkinGlow, emissiveIntensity: 1 });
const pumpkinGeo = new THREE.SphereGeometry(0.42, 18, 12);
const pumpkins = [];
for (let i = 0; i < 24; i++) {
  const p = new THREE.Group();
  const b = new THREE.Mesh(pumpkinGeo, pumpkinMat); b.scale.y = 0.8; b.position.y = 0.34;
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.2, 6), lambert(0x3f8f3a)); stem.position.y = 0.72;
  p.add(b, stem);
  p.userData.side = i % 2 ? 1 : -1;
  p.position.z = 10 - Math.floor(i / 2) * 9 - (i % 2) * 4.5;
  p.visible = false;
  scene.add(p);
  pumpkins.push(p);
}
function placePumpkin(p, z) {
  p.position.set(p.userData.side * (inSpooky ? 4.3 + Math.random() * 2.5 : 3.95), 0, z);
  p.rotation.y = -p.userData.side * 0.6;
  p.scale.setScalar(0.8 + Math.random() * 0.5);
}
for (const p of pumpkins) placePumpkin(p, p.position.z);
// a big bigMoon, with a witch who whizzes across it now and then
const nofog = c => new THREE.MeshBasicMaterial({ color: c, fog: false });
const bigMoon = ball(9, nofog(0xfff3c4), 30, 38, -130, 24);
const witch = new THREE.Group();
const wBlack = nofog(0x1a1024);
const broom = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 6, 6), wBlack); broom.rotation.z = Math.PI / 2;
const bristle = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.6, 8), wBlack); bristle.rotation.z = Math.PI / 2; bristle.position.x = -3.5;
const witchBody = new THREE.Mesh(new THREE.ConeGeometry(0.9, 2.2, 8), wBlack); witchBody.position.set(0.3, 1.1, 0);
const wHead = ball(0.45, wBlack, 0.5, 2.4, 0, 10);
const wHat = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.5, 8), wBlack); wHat.position.set(0.3, 3.3, 0); wHat.rotation.z = 0.4;
witch.add(broom, bristle, witchBody, wHead, wHat);
witch.position.set(-60, 36, -126);
hallowGroup.add(bigMoon, witch);
let witchT = 3;
// bats
const bats = new THREE.Group();
const batMat = new THREE.MeshBasicMaterial({ color: 0x1a1024, side: THREE.DoubleSide });
const wingGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(1.1, 0.3, 0), new THREE.Vector3(0.9, -0.3, 0), new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.9, -0.3, 0), new THREE.Vector3(0.5, -0.15, 0.2)]);
wingGeo.computeVertexNormals();
for (let k = 0; k < 8; k++) {
  const bt = new THREE.Group();
  const wl = new THREE.Mesh(wingGeo, batMat), wr = new THREE.Mesh(wingGeo, batMat); wr.scale.x = -1;
  bt.add(ball(0.22, batMat, 0, 0, 0, 8), wl, wr);
  bt.position.set((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 6);
  bt.userData = { wl, wr, phase: Math.random() * 6 };
  bats.add(bt);
}
bats.visible = false;
hallowGroup.add(bats);
let batT = 2;
// fireflies
const flyMat = new THREE.MeshBasicMaterial({ color: 0xd4ff6b });
const fireflies = [];
for (let k = 0; k < 40; k++) {
  const f = ball(0.06, flyMat, (Math.random() < 0.5 ? -1 : 1) * (4.5 + Math.random() * 10), 0.5 + Math.random() * 4, 5 - Math.random() * 100, 6);
  f.userData.phase = Math.random() * 6;
  hallowGroup.add(f);
  fireflies.push(f);
}
// friendly ghosts floating along, some drifting right over the track
const ghosts = [];
function resetGhost(g, z) { // out to the sides, or high over the track, so they never float into her face
  const over = Math.random() < 0.3;
  g.position.set(over ? (Math.random() - 0.5) * 4 : (Math.random() < 0.5 ? -1 : 1) * (6 + Math.random() * 7), over ? 7 + Math.random() * 2 : 2.4 + Math.random() * 4, z);
  g.userData.booed = false;
}
for (let k = 0; k < 7; k++) {
  const g = makeGhost();
  g.userData.phase = Math.random() * 6;
  resetGhost(g, -15 - k * 13);
  spookyWorld.add(g);
  ghosts.push(g);
}
function updateSpooky(dt, move) {
  if (!awayFromTown && s.mode === 'running' && s.distance > s.nextHallow) {
    // the town flips into (or out of) its Halloween colours
    halloween = !halloween;
    flash();
    applyTheme(themeIndex);
    toast(halloween ? 'Happy Halloween! 🎃' : themes[themeIndex].name + '!');
    if (halloween) sfx.boo();
    s.nextHallow = s.distance + (halloween ? 200 : 300) + Math.random() * 200;
  }
  if (!hallowGroup.visible) return;
  const t = performance.now() / 1000;
  for (const p of pumpkins) {
    p.position.z += move;
    if (p.position.z > DESPAWN_Z + 2) placePumpkin(p, p.position.z - 108);
  }
  pumpkinMat.emissiveIntensity = 0.85 + Math.sin(t * 9) * 0.08 + Math.sin(t * 23) * 0.06; // candle flicker
  for (const f of fireflies) {
    f.position.z += move * 0.8;
    if (f.position.z > DESPAWN_Z) f.position.z -= 105;
    f.position.y += Math.sin(t * 1.5 + f.userData.phase) * dt * 0.3;
    f.scale.setScalar(0.4 + Math.max(0, Math.sin(t * 2.5 + f.userData.phase)) * 1.2);
  }
  witchT -= dt;
  if (witchT <= 0) {
    witch.position.x += dt * 14;
    witch.position.y = 36 + Math.sin(t * 2) * 1.5;
    if (witch.position.x > 90) { witch.position.x = -60; witchT = 10 + Math.random() * 10; }
  }
  batT -= dt;
  if (!bats.visible && batT <= 0) { bats.userData.dir = Math.random() < 0.5 ? 1 : -1; bats.position.set(-bats.userData.dir * 40, 9 + Math.random() * 6, -30 - Math.random() * 30); bats.visible = true; }
  if (bats.visible) {
    bats.position.x += bats.userData.dir * dt * 11;
    for (const b of bats.children) {
      const fl = Math.sin(t * 16 + b.userData.phase) * 0.9;
      b.userData.wl.rotation.y = fl; b.userData.wr.rotation.y = -fl;
      b.rotation.y = bats.userData.dir > 0 ? 0 : Math.PI;
      b.position.y += Math.sin(t * 4 + b.userData.phase) * dt;
    }
    if (Math.abs(bats.position.x) > 42) { bats.visible = false; batT = 3 + Math.random() * 6; }
  }
  if (!inSpooky) return;
  for (const o of spookyProps) {
    o.position.z += move;
    if (o.position.z > DESPAWN_Z + 4) placeSpookyProp(o, o.position.z - SPOOK_PER_SIDE * SPOOK_GAP);
    const pk = o.userData.peek;
    if (pk) pk.position.y = Math.max(0, Math.sin(t * 1.3 + o.userData.phase)) * 1.25; // peekaboo!
  }
  for (const g of ghosts) {
    const u = g.userData;
    g.position.z += move * 0.75;
    g.position.y += Math.sin(t * 1.6 + u.phase) * dt * 0.9;
    g.position.x += Math.sin(t * 0.7 + u.phase) * dt * 0.8;
    g.rotation.z = Math.sin(t * 1.4 + u.phase) * 0.15;
    u.arms[0].position.y = 0.45 + Math.sin(t * 5 + u.phase) * 0.08;
    u.arms[1].position.y = 0.45 - Math.sin(t * 5 + u.phase) * 0.08;
    if (!u.booed && g.position.z > -3 && Math.abs(g.position.x - s.x) < 5) { u.booed = true; sfx.boo(); }
    if (g.position.z > (Math.abs(g.position.x) < 5 ? 0 : DESPAWN_Z)) resetGhost(g, -100);
  }
}
// the ghost portal: a green glowing ring with little ghosts going round it
const ghostSwirlTex = canvasTexture(256, 256, (ctx, w, h) => {
  const g = ctx.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2);
  g.addColorStop(0, '#eaffd6'); g.addColorStop(0.35, '#7dff9a'); g.addColorStop(0.75, '#6a2fb0'); g.addColorStop(1, '#2b1a4a');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 6;
  ctx.beginPath();
  for (let a = 0; a < 18; a += 0.1) { const r = a * 7; ctx.lineTo(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r); }
  ctx.stroke();
});
function makeGhostPortal() {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.22, 12, 36), new THREE.MeshLambertMaterial({ color: 0x7dff9a, emissive: 0x1a6a2a }));
  ring.position.y = 1.5;
  const swirl = new THREE.Mesh(new THREE.CircleGeometry(1.15, 32), new THREE.MeshBasicMaterial({ map: ghostSwirlTex, side: THREE.DoubleSide }));
  swirl.position.y = 1.5;
  const orbit = new THREE.Group(); orbit.position.y = 1.5;
  for (let k = 0; k < 3; k++) {
    const gh = makeGhost(), a = (k / 3) * Math.PI * 2;
    gh.scale.setScalar(0.35);
    gh.position.set(Math.cos(a) * 1.8, Math.sin(a) * 1.8 - 0.2, 0);
    orbit.add(gh);
  }
  g.add(ring, swirl, orbit, portalSign('👻', '#7dff9a'));
  g.userData = { ghostPortal: true, halfW: 0.9, halfD: 0.5, height: 0, base: 0, swirl, orbit };
  return g;
}
