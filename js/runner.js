// Hop Hop Runner: Robyn the runner, her hoverboard, and the pickup models.

// ---------- the runner ----------
const player = new THREE.Group();
const skin = lambert(0xf3c39b);
const shirt = lambert(0xff5d73);
const shorts = lambert(0x3d5afe);
const hairMat = lambert(0x5a3825);
const shoeMat = lambert(0xffffff);

const whiteMat = lambert(0xffffff);
const cheekMat = lambert(0xff9aa8);
const eyeWhite = new THREE.MeshBasicMaterial({ color: 0xffffff });
const eyeDark = new THREE.MeshBasicMaterial({ color: 0x2b2350 });
const mouthMat = new THREE.MeshBasicMaterial({ color: 0xc2185b });
const hairTieMat = lambert(0xffd23f);
const soleMat = lambert(0xff5d73);
const packMat = lambert(0xffd23f);
const packTrim = lambert(0xffa13d);
const box = (w, h, d, mat, x, y, z) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  return m;
};
const ball = (r, mat, x, y, z, seg = 10) => {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.max(6, seg - 2)), mat);
  m.position.set(x, y, z);
  return m;
};

// body: t-shirt with a white stripe, shorts, and a little backpack (we mostly see her back)
const torso = box(0.62, 0.7, 0.38, shirt, 0, 1.15, 0);
const stripe = box(0.64, 0.1, 0.4, whiteMat, 0, 1.22, 0);
const hips = box(0.6, 0.22, 0.36, shorts, 0, 0.76, 0);
const pack = box(0.46, 0.5, 0.2, packMat, 0, 1.18, 0.29);
const packFlap = box(0.48, 0.14, 0.23, packTrim, 0, 1.38, 0.3);
const packPocket = box(0.3, 0.16, 0.05, packTrim, 0, 1.03, 0.41);
const strapL = box(0.07, 0.62, 0.02, packTrim, -0.18, 1.18, -0.2);
const strapR = box(0.07, 0.62, 0.02, packTrim, 0.18, 1.18, -0.2);
const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.11, 0.16, 8), skin);
neck.position.y = 1.56;
const upperBody = new THREE.Group(); // twists a little when she looks back
upperBody.add(torso, stripe, pack, packFlap, packPocket, strapL, strapR);
player.add(upperBody, hips, neck);

// head on its own pivot so she can look back over her shoulder
const headPivot = new THREE.Group();
headPivot.position.y = 1.55;
player.add(headPivot);
// Robyn: dark brown hair in a ponytail, a fringe down to her eyes, and a face drawn on.
// The face is painted onto the head's texture; the front of the head faces -z (u = 0.75).
const robynHair = lambert(0x3b2416);
function paintFace(ctx, w, h, closed) {
  ctx.fillStyle = '#f3c39b'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#3b2416'; ctx.fillRect(0, 0, w, 70); // hair on top, under the 3D hair
  const cx = 384, cy = 128;
  // rosy cheeks
  for (const sx of [-1, 1]) {
    const g = ctx.createRadialGradient(cx + sx * 50, cy + 22, 2, cx + sx * 50, cy + 22, 18);
    g.addColorStop(0, 'rgba(255,120,140,0.55)'); g.addColorStop(1, 'rgba(255,120,140,0)');
    ctx.fillStyle = g; ctx.fillRect(cx + sx * 50 - 20, cy + 2, 40, 40);
  }
  for (const sx of [-1, 1]) {
    const ex = cx + sx * 30, ey = cy;
    if (closed) {
      ctx.strokeStyle = '#2b1a12'; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(ex - sx * 16, ey + 2); ctx.quadraticCurveTo(ex, ey + 9, ex + sx * 16, ey - 3); ctx.stroke();
      continue;
    }
    // almond shaped: pointed corners, the outer corner tipped up a little
    const ix = ex - sx * 16, iy = ey + 3, ox = ex + sx * 16, oy = ey - 3;
    const almond = () => { ctx.beginPath(); ctx.moveTo(ix, iy); ctx.quadraticCurveTo(ex, ey - 19, ox, oy); ctx.quadraticCurveTo(ex, ey + 16, ix, iy); ctx.closePath(); };
    ctx.save();
    almond(); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.clip();
    ctx.fillStyle = '#5a3420'; ctx.beginPath(); ctx.arc(ex, ey + 1, 9.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a0f0a'; ctx.beginPath(); ctx.arc(ex, ey + 1, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(ex - 3.5, ey - 3, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(ex + 3, ey + 4, 1.4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = '#2b1a12'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(ix, iy); ctx.quadraticCurveTo(ex, ey - 19, ox + sx * 2, oy - 1); ctx.stroke(); // upper lid
    ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(43,26,18,0.6)';
    ctx.beginPath(); ctx.moveTo(ix, iy); ctx.quadraticCurveTo(ex, ey + 16, ox, oy); ctx.stroke();
    // eyelashes flicking out from the outer corner
    ctx.strokeStyle = '#2b1a12'; ctx.lineWidth = 2.2;
    for (let k = 0; k < 2; k++) { ctx.beginPath(); ctx.moveTo(ox - sx * k * 5, oy - 1 - k * 3); ctx.lineTo(ox + sx * (6 - k * 2), oy - 6 - k * 4); ctx.stroke(); }
  }
  // little nose
  ctx.strokeStyle = '#cf8f6c'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(cx, cy + 14, 5, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();
  // big happy smile
  ctx.fillStyle = '#b8174f';
  ctx.beginPath(); ctx.moveTo(cx - 15, cy + 27); ctx.quadraticCurveTo(cx, cy + 30, cx + 15, cy + 27); ctx.arc(cx, cy + 27, 15, 0, Math.PI); ctx.fill();
  ctx.fillStyle = '#ff8fa6'; ctx.beginPath(); ctx.ellipse(cx, cy + 37, 7, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.fillRect(cx - 9, cy + 28, 18, 3); // teeth
}
const faceTex = canvasTexture(512, 256, (ctx, w, h) => paintFace(ctx, w, h, false));
const faceBlinkTex = canvasTexture(512, 256, (ctx, w, h) => paintFace(ctx, w, h, true));
const head = new THREE.Mesh(new THREE.SphereGeometry(0.33, 36, 24), new THREE.MeshLambertMaterial({ map: faceTex, emissive: 0xffffff, emissiveMap: faceTex, emissiveIntensity: 0.4 })); // a little glow so her face stays bright
head.position.y = 0.25;
// a shell of hair over the top, cut into a fringe that comes down to her eyes
const hairTex = canvasTexture(512, 128, (ctx, w, h) => {
  ctx.fillStyle = '#3b2416'; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#5b3a25'; ctx.lineWidth = 2;
  for (let x = 0; x < w; x += 7) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + (Math.random() - 0.5) * 6, h); ctx.stroke(); }
  ctx.strokeStyle = '#2a170d'; ctx.lineWidth = 1.5;
  for (let x = 3; x < w; x += 11) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + (Math.random() - 0.5) * 6, h); ctx.stroke(); }
  // cut the fringe: jagged over the face, curving down to the sides by the ears
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  const x0 = 296, x1 = 472;
  ctx.moveTo(x0, h + 2);
  for (let x = x0; x <= x1; x += 6) {
    const edge = Math.min(1, Math.min(x - x0, x1 - x) / 34); // 0 at the sides, 1 over the face
    const tip = (Math.floor((x - x0) / 6) % 2) ? 104 : 111;
    ctx.lineTo(x, h + 2 - edge * (h + 2 - tip));
  }
  ctx.lineTo(x1, h + 2);
  ctx.closePath(); ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
});
const hairShellMat = new THREE.MeshLambertMaterial({ map: hairTex, alphaTest: 0.5, side: THREE.DoubleSide });
const hair = new THREE.Mesh(new THREE.SphereGeometry(0.355, 36, 14, 0, Math.PI * 2, 0, Math.PI * 0.5), hairShellMat);
hair.position.y = 0.25;
// hair down the back of her head to the nape
const backHair = new THREE.Mesh(new THREE.SphereGeometry(0.35, 24, 14, 0, Math.PI, 0, Math.PI * 0.72), robynHair);
backHair.position.y = 0.25;
const earL = ball(0.07, skin, -0.33, 0.22, 0);
const earR = ball(0.07, skin, 0.33, 0.22, 0);
headPivot.add(head, hair, backHair, earL, earR);
// a bubble helmet for Space
const helmet = new THREE.Group();
const bubble = new THREE.Mesh(new THREE.SphereGeometry(0.55, 20, 14), new THREE.MeshBasicMaterial({ color: 0xcff4ff, transparent: true, opacity: 0.28, depthWrite: false }));
bubble.position.y = 0.28;
const collar = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.07, 8, 20), lambert(0xffffff));
collar.rotation.x = Math.PI / 2;
collar.position.y = -0.05;
helmet.add(bubble, collar);
helmet.visible = false;
headPivot.add(helmet);
// a witch hat for Halloween and Spooky World
const witchHat = new THREE.Group();
const hatMat = lambert(0x6a2fb0);
const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.03, 24), hatMat);
const hatCone = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.75, 16), hatMat);
hatCone.position.set(0, 0.37, 0.04); hatCone.rotation.x = 0.25;
const hatBand = new THREE.Mesh(new THREE.CylinderGeometry(0.285, 0.29, 0.08, 16), lambert(0xff8c1a));
hatBand.position.y = 0.05;
witchHat.add(hatBrim, hatCone, hatBand);
witchHat.position.y = 0.6; witchHat.rotation.set(0.12, 0, 0.12);
witchHat.visible = false;
headPivot.add(witchHat);

// a high ponytail with a yellow hair tie; it swings while she runs
const pony = new THREE.Group();
pony.position.set(0, 0.5, 0.3);
const tie = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.032, 8, 14), hairTieMat);
tie.rotation.x = 1.0;
// one smooth, swishy tail with hair strands drawn on
const strandTex = canvasTexture(128, 128, (ctx, w, h) => {
  ctx.fillStyle = '#3b2416'; ctx.fillRect(0, 0, w, h);
  ctx.lineWidth = 2;
  for (let x = 0; x < w; x += 5) { ctx.strokeStyle = x % 10 ? '#5b3a25' : '#2a170d'; ctx.beginPath(); ctx.moveTo(x, 0); ctx.quadraticCurveTo(x + 4, h / 2, x - 2, h); ctx.stroke(); }
});
const tailShape = [[0, 0.02], [0.07, -0.01], [0.12, -0.08], [0.135, -0.18], [0.12, -0.3], [0.09, -0.42], [0.05, -0.52], [0.015, -0.6], [0, -0.62]].map(([r, y]) => new THREE.Vector2(r, y));
const ponyTail = new THREE.Mesh(new THREE.LatheGeometry(tailShape, 16), new THREE.MeshLambertMaterial({ map: strandTex }));
ponyTail.position.set(0, 0, 0.02);
ponyTail.rotation.x = -0.8; // sticks out behind so it swishes
ponyTail.scale.set(1, 1, 0.85);
pony.add(tie, ponyTail);
headPivot.add(pony);

// simple box limb on a pivot (used by the policeman)
function limb(mat, len, w, x, y, parent = player) {
  const pivot = new THREE.Group();
  pivot.position.set(x, y, 0);
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, len, w), mat);
  m.position.y = -len / 2;
  pivot.add(m);
  parent.add(pivot);
  return pivot;
}
function makeLeg(x) {
  const pivot = new THREE.Group();
  pivot.position.set(x, 0.7, 0);
  pivot.add(
    box(0.23, 0.3, 0.23, shorts, 0, -0.15, 0),
    box(0.17, 0.26, 0.17, skin, 0, -0.42, 0),
    box(0.19, 0.1, 0.19, whiteMat, 0, -0.54, 0),
    box(0.26, 0.13, 0.34, shoeMat, 0, -0.62, -0.04),
    box(0.27, 0.05, 0.36, soleMat, 0, -0.68, -0.04),
  );
  player.add(pivot);
  return pivot;
}
function makeArm(x) {
  const pivot = new THREE.Group();
  pivot.position.set(x, 1.45, 0);
  pivot.add(
    box(0.19, 0.22, 0.19, shirt, 0, -0.08, 0),
    box(0.14, 0.32, 0.14, skin, 0, -0.33, 0),
    ball(0.085, skin, 0, -0.52, 0, 8),
  );
  player.add(pivot);
  return pivot;
}
// the hoverboard she rides on when she has one
const boardGlowMat = new THREE.MeshBasicMaterial({ color: 0x5ee7ff, transparent: true, opacity: 0.7 });
function makeBoardModel() {
  const g = new THREE.Group();
  const deck = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.08, 1.4), lambert(0xff5dc8));
  const stripeB = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.085, 1.3), lambert(0xffffff));
  for (const z of [-0.7, 0.7]) {
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.08, 16, 1, false, 0, Math.PI), lambert(0xff5dc8));
    tip.position.z = z;
    tip.rotation.y = z < 0 ? Math.PI / 2 : -Math.PI / 2;
    g.add(tip);
  }
  const glow = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 1.2), boardGlowMat);
  glow.position.y = -0.07;
  for (const z of [-0.45, 0.45]) {
    const jet = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.1, 10), boardGlowMat);
    jet.position.set(0, -0.1, z);
    g.add(jet);
  }
  g.add(deck, stripeB, glow);
  return g;
}
// a red horseshoe magnet with silver tips
const magnetRed = lambert(0xff3b3b);
const magnetTip = lambert(0xe8ecf5);
function makeMagnetModel() {
  const g = new THREE.Group();
  const arc = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.11, 8, 16, Math.PI), magnetRed);
  arc.rotation.z = Math.PI; // the U opens upwards
  g.add(arc);
  for (const x of [-0.3, 0.3]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.3, 0.22), magnetRed);
    leg.position.set(x, 0.15, 0);
    const tip = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.14, 0.23), magnetTip);
    tip.position.set(x, 0.37, 0);
    g.add(leg, tip);
  }
  return g;
}
function makeMagnetPickup() {
  const g = new THREE.Group();
  const m = makeMagnetModel();
  m.position.y = 1.1;
  m.scale.setScalar(1.4);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.05, 6, 28), new THREE.MeshBasicMaterial({ color: 0xff7a7a, transparent: true, opacity: 0.6 }));
  ring.position.y = 1.2;
  g.add(m, ring);
  g.userData = { magnetPickup: true, halfW: 0.7, halfD: 0.7, height: 0, base: 0, spin: m, ring };
  return g;
}
// a little magnet floats above her head while it's working
const headMagnet = makeMagnetModel();
headMagnet.position.y = 2.55;
headMagnet.scale.setScalar(0.8);
headMagnet.visible = false;

const riding = makeBoardModel();
riding.position.y = -0.02;
riding.visible = false;
player.add(riding);

// jetpack: two shiny tanks with flames
const jetMetal = new THREE.MeshLambertMaterial({ color: 0xdfe7f0, emissive: 0x222833 });
const jetRed = lambert(0xff5d73);
const flameMat = new THREE.MeshBasicMaterial({ color: 0xffa13d, transparent: true, opacity: 0.9 });
const flameCore = new THREE.MeshBasicMaterial({ color: 0xfff3a0 });
const tankGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.55, 12);
const nozzleGeo = new THREE.CylinderGeometry(0.07, 0.1, 0.12, 10);
const flameGeo = new THREE.ConeGeometry(0.1, 0.6, 10);
const coreGeo = new THREE.ConeGeometry(0.05, 0.3, 8);
function makeJetModel(flames) {
  const g = new THREE.Group();
  g.userData.flames = [];
  for (const sx of [-0.15, 0.15]) {
    const tank = new THREE.Mesh(tankGeo, jetMetal);
    tank.position.x = sx;
    const nozzle = new THREE.Mesh(nozzleGeo, jetRed);
    nozzle.position.set(sx, -0.33, 0);
    g.add(tank, ball(0.12, jetRed, sx, 0.28, 0), nozzle);
    if (flames) {
      const f = new THREE.Mesh(flameGeo, flameMat);
      f.rotation.x = Math.PI;
      f.position.set(sx, -0.68, 0);
      const c = new THREE.Mesh(coreGeo, flameCore);
      c.rotation.x = Math.PI;
      c.position.set(sx, -0.52, 0);
      g.add(f, c);
      g.userData.flames.push(f, c);
    }
  }
  g.add(box(0.12, 0.3, 0.06, jetRed, 0, 0.02, -0.08));
  return g;
}
const backJet = makeJetModel(true);
backJet.position.set(0, 1.2, 0.5);
backJet.visible = false;
upperBody.add(backJet);
function makeJetPickup() {
  const g = new THREE.Group();
  const m = makeJetModel(false);
  m.position.y = 1.15;
  m.scale.setScalar(1.7);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.05, 6, 28), new THREE.MeshBasicMaterial({ color: 0xffa13d, transparent: true, opacity: 0.7 }));
  ring.position.y = 1.15;
  g.add(m, ring);
  g.userData = { jetPickup: true, halfW: 0.7, halfD: 0.7, height: 0, base: 0, spin: m, ring };
  return g;
}
// rainbow star: a few seconds of smashing through everything
const starShape = new THREE.Shape();
for (let k = 0; k < 10; k++) {
  const r = k % 2 ? 0.27 : 0.62, a = (k / 10) * Math.PI * 2 + Math.PI / 2;
  if (k) starShape.lineTo(Math.cos(a) * r, Math.sin(a) * r); else starShape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
}
const starPickGeo = new THREE.ExtrudeGeometry(starShape, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 2 });
starPickGeo.center();
function makeStarPickup() {
  const g = new THREE.Group();
  const st = new THREE.Mesh(starPickGeo, new THREE.MeshLambertMaterial({ color: 0xffd23f, emissive: 0x806000 }));
  st.position.y = 1.2;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.06, 6, 28), new THREE.MeshBasicMaterial({ color: 0xff5dc8, transparent: true, opacity: 0.75 }));
  ring.position.y = 1.2;
  g.add(st, ring);
  g.userData = { starPickup: true, halfW: 0.7, halfD: 0.7, height: 0, base: 0, spin: st, ring };
  return g;
}
const aura = new THREE.Mesh(new THREE.SphereGeometry(1.0, 18, 14), new THREE.MeshBasicMaterial({ color: 0xff5dc8, transparent: true, opacity: 0.3, depthWrite: false, side: THREE.BackSide }));
aura.position.y = 1.0;
aura.scale.set(0.85, 1.2, 0.85);
aura.visible = false;
player.add(aura);

function makeBoardPickup() {
  const g = new THREE.Group();
  const b = makeBoardModel();
  b.rotation.x = -0.5;
  b.position.y = 1.1;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.05, 6, 28), new THREE.MeshBasicMaterial({ color: 0x5ee7ff, transparent: true, opacity: 0.6 }));
  ring.position.y = 1.1;
  g.add(b, ring);
  g.userData = { boardPickup: true, halfW: 0.7, halfD: 0.7, height: 0, base: 0, spin: b, ring };
  return g;
}

const legL = makeLeg(-0.16);
const legR = makeLeg(0.16);
const armL = makeArm(-0.42);
const armR = makeArm(0.42);
player.add(headMagnet);
scene.add(player);
