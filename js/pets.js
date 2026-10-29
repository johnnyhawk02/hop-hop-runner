// Hop Hop Runner: Izzi the dog and Pixel the cat.

// ---------- pets: border collies and black-and-white cats ----------
const petBlack = lambert(0x1c1a1e), petWhite = lambert(0xf7f4ee), petNose = lambert(0x111111), petPink = lambert(0xff9fb0);
function petLeg(g, mat, sock, len, r, x, y, z) {
  const pv = new THREE.Group(); pv.position.set(x, y, z);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.85, len, 8), mat); m.position.y = -len / 2;
  const s2 = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.9, r * 0.95, len * 0.3, 8), sock); s2.position.y = -len * 0.85;
  pv.add(m, s2);
  g.add(pv);
  return pv;
}
function tailChain(g, n, len, r, mat, tipMat, x, y, z) {
  const root = new THREE.Group(); root.position.set(x, y, z);
  let parent = root; const segs = [];
  for (let k = 0; k < n; k++) {
    const seg = new THREE.Group(); seg.position.z = k ? len : 0;
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r * (1 - k * 0.08), r * (1 - k * 0.08), len, 7), k === n - 1 && tipMat ? tipMat : mat);
    m.rotation.x = Math.PI / 2; m.position.z = len / 2;
    seg.add(m); parent.add(seg); segs.push(seg); parent = seg;
  }
  if (tipMat) parent.add(ball(r * 1.1, tipMat, 0, 0, len, 7));
  g.add(root);
  return segs;
}
function makeCollie() {
  const g = new THREE.Group();
  const body = ball(1, petBlack, 0, 0.72, 0, 14); body.scale.set(0.3, 0.28, 0.58);
  const chest = ball(1, petWhite, 0, 0.74, -0.42, 12); chest.scale.set(0.25, 0.27, 0.2); // a white ruff
  const collar = ball(1, petWhite, 0, 0.92, -0.5, 12); collar.scale.set(0.24, 0.16, 0.16);
  const fluff = ball(1, petBlack, 0, 0.82, 0.1, 12); fluff.scale.set(0.33, 0.24, 0.42); // a fluffy coat
  const head = new THREE.Group(); head.position.set(0, 1.02, -0.6);
  const skull = ball(0.23, petBlack, 0, 0, 0, 14);
  const blaze = ball(1, petWhite, 0, 0.06, -0.17, 10); blaze.scale.set(0.05, 0.14, 0.07);
  const snout = ball(1, petWhite, 0, -0.07, -0.24, 12); snout.scale.set(0.12, 0.1, 0.17);
  const nose = ball(0.045, petNose, 0, -0.04, -0.41, 8);
  const tongue = box(0.06, 0.02, 0.08, petPink, 0, -0.15, -0.3);
  head.add(skull, blaze, snout, nose, tongue);
  for (const sx of [-1, 1]) {
    head.add(ball(0.035, petNose, sx * 0.09, 0.06, -0.19, 8), ball(0.012, petWhite, sx * 0.09 - 0.01, 0.075, -0.225, 6));
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.16, 6), petBlack);
    ear.scale.set(0.8, 0.8, 0.5); ear.position.set(sx * 0.12, 0.2, 0.02); ear.rotation.set(-0.35, 0, -sx * 0.4); // half-up collie ears
    head.add(ear);
  }
  g.add(body, chest, collar, fluff, head);
  const legs = [[-0.16, -0.38], [0.16, -0.38], [-0.16, 0.36], [0.16, 0.36]].map(([x, z]) => petLeg(g, petBlack, petWhite, 0.55, 0.07, x, 0.6, z));
  const tail = tailChain(g, 4, 0.16, 0.06, petBlack, petWhite, 0, 0.8, 0.52);
  g.userData = { kind: 'dog', head, legs, tail, h: 1 };
  return g;
}
function makeCat() {
  const g = new THREE.Group();
  const body = ball(1, petBlack, 0, 0.36, 0, 12); body.scale.set(0.16, 0.16, 0.34);
  const chest = ball(1, petWhite, 0, 0.36, -0.24, 10); chest.scale.set(0.12, 0.13, 0.12);
  const head = new THREE.Group(); head.position.set(0, 0.56, -0.36);
  const skull = ball(0.15, petBlack, 0, 0, 0, 12);
  const muzzle = ball(1, petWhite, 0, -0.04, -0.11, 10); muzzle.scale.set(0.09, 0.065, 0.06);
  head.add(skull, muzzle, ball(0.02, petPink, 0, -0.01, -0.165, 6));
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x9dff5a });
  for (const sx of [-1, 1]) {
    const e = ball(0.032, eyeMat, sx * 0.06, 0.035, -0.125, 8);
    const pu = box(0.01, 0.04, 0.01, petNose, sx * 0.06, 0.035, -0.155);
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.12, 4), petBlack);
    ear.position.set(sx * 0.085, 0.14, 0); ear.rotation.z = -sx * 0.25;
    const whisk = box(0.14, 0.005, 0.005, petWhite, sx * 0.1, -0.04, -0.14); whisk.rotation.z = sx * 0.15;
    head.add(e, pu, ear, whisk);
  }
  g.add(body, chest, head);
  const legs = [[-0.08, -0.22], [0.08, -0.22], [-0.08, 0.22], [0.08, 0.22]].map(([x, z]) => petLeg(g, petBlack, petWhite, 0.3, 0.04, x, 0.32, z));
  const tail = tailChain(g, 5, 0.1, 0.03, petBlack, null, 0, 0.42, 0.32);
  g.userData = { kind: 'cat', head, legs, tail, h: 0.5 };
  return g;
}
// just the two of them: Izzi the border collie and Pixel the cat, each with a little name tag
function nameTag(text, y) {
  const tex = canvasTexture(256, 96, (ctx, w, h) => {
    ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(8, 14, w - 16, h - 28, 30) : ctx.rect(8, 14, w - 16, h - 28); ctx.fill();
    ctx.fillStyle = '#2b2350'; ctx.font = 'bold 48px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, w / 2, h / 2 + 2);
  });
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthWrite: false }));
  sp.scale.set(1.2, 0.45, 1); sp.position.y = y;
  return sp;
}
const izzi = makeCollie(), pixel = makeCat();
izzi.add(nameTag('Izzi', 1.65)); pixel.add(nameTag('Pixel', 1.05));
izzi.userData.name = 'Izzi'; pixel.userData.name = 'Pixel';
const pets = [izzi, pixel];
for (const p of pets) { p.visible = false; p.userData.t = 2 + Math.random() * 4; scene.add(p); }
function startPet(p) {
  const u = p.userData, copSide = Math.random() < 0.5 ? -1 : 1;
  u.copSide = copSide; u.phase = Math.random() * 6; u.speed = 0;
  const r = Math.random();
  if (u.kind === 'dog') u.mode = r < 0.6 ? 'buddy' : 'stroll';
  else u.mode = r < 0.5 ? 'perch' : r < 0.8 ? 'dash' : 'stroll';
  if (u.mode === 'buddy') { toast('Izzi is running with you! 🐕', true); p.position.set(copSide * 3.95, 0, 8); u.life = 6 + Math.random() * 6; } // runs up from behind to keep her company
  else if (u.mode === 'perch') { toast('Pixel is watching you! 🐈‍⬛', true); p.position.set(copSide * 4.45, 0.7, SPAWN_Z + 20 + Math.random() * 30); } // sitting on the fence
  else if (u.mode === 'dash') { p.position.set(-copSide * 6, 0, -32 - Math.random() * 15); u.dir = copSide; } // scampers across the track up ahead
  else { p.position.set(copSide * (3.95 + Math.random() * 0.3), 0, SPAWN_Z + 30 + Math.random() * 30); u.dir = Math.random() < 0.5 ? -1 : 1; }
  p.rotation.set(0, u.mode === 'dash' ? -copSide * Math.PI / 2 : u.mode === 'stroll' && u.dir > 0 ? Math.PI : 0, 0);
  p.visible = true;
}
function updatePets(dt, move) {
  const allowed = !inSpace && !inSea && s.mode === 'running';
  const t = performance.now() / 1000;
  const tunnelClose = tunnels.some(tn => tn.position.z > -40 && tn.position.z - tn.userData.length < 6);
  for (const p of pets) {
    const u = p.userData;
    if (!p.visible) {
      u.t -= dt;
      if (u.t <= 0 && allowed && !tunnelClose) startPet(p);
      continue;
    }
    if (!allowed) { p.visible = false; u.t = 2 + Math.random() * 4; continue; }
    let gait = 0; // how fast the legs go
    if (u.mode === 'buddy') {
      u.life -= dt;
      if (u.life > 0 && !tunnelClose) {
        const target = -2.6 + Math.sin(t * 0.6 + u.phase) * 1.0; // just ahead of her, where we can see
        p.position.z += (target - p.position.z) * Math.min(1, dt * 1.5);
        p.position.y = Math.max(0, (s.y - s.ground) * 0.5); // hops when she hops
        gait = 1.6;
        if (Math.random() < dt * 0.25) sfx.woof();
      } else { p.position.z += move * 0.6; p.position.y = 0; gait = 0.8; } // tired out, drops back
    } else if (u.mode === 'perch') {
      p.position.z += move;
      const look = Math.atan2(s.x - p.position.x, p.position.z) ; // watches her go by
      u.head.rotation.y = Math.max(-1.4, Math.min(1.4, -look * 0.8));
      p.rotation.y = 0;
      if (Math.abs(p.position.z) < 0.5 && Math.random() < 0.5 && !u.mewed) { u.mewed = true; sfx.meow(); }
    } else if (u.mode === 'dash') {
      p.position.z += move;
      p.position.x += u.dir * dt * 7;
      gait = 2.2;
      if (Math.abs(p.position.x) > 7) p.position.z = 99;
    } else {
      p.position.z += move + u.dir * dt * 1.2;
      gait = 0.6;
    }
    const ph = t * 10 * gait + u.phase;
    u.legs.forEach((lg, k) => { lg.rotation.x = gait ? Math.sin(ph + (k === 1 || k === 2 ? Math.PI : 0)) * 0.6 : 0; });
    u.tail.forEach((sg, k) => { sg.rotation.y = Math.sin(t * (u.kind === 'dog' ? 12 : 3) + u.phase + k * 0.5) * (u.kind === 'dog' ? 0.35 : 0.25); sg.rotation.x = u.kind === 'cat' ? -0.35 : 0.2 - k * 0.05; });
    if (u.kind === 'dog' && gait) u.head.position.y = 1.02 + Math.abs(Math.sin(ph)) * 0.04;
    if (p.position.z > DESPAWN_Z + 2 || p.position.z < SPAWN_Z - 10) { p.visible = false; u.mewed = false; u.t = 3 + Math.random() * 8; }
  }
}
