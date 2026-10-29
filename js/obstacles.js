// Hop Hop Runner: Obstacles and trains, plus bridges, ramps, climbs and bounce pads.

// ---------- obstacles (all low enough to jump) ----------
const stripeTex = canvasTexture(128, 32, (ctx, w, h) => {
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#ff4d5e';
  for (let x = -h; x < w + h; x += 32) {
    ctx.beginPath(); ctx.moveTo(x, h); ctx.lineTo(x + 16, h); ctx.lineTo(x + 16 + h, 0); ctx.lineTo(x + h, 0); ctx.fill();
  }
});
const crateTex = canvasTexture(64, 64, (ctx, w, h) => {
  ctx.fillStyle = '#d9954f'; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#8f5a2b'; ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, w - 6, h - 6);
  ctx.beginPath(); ctx.moveTo(6, 6); ctx.lineTo(w - 6, h - 6); ctx.moveTo(w - 6, 6); ctx.lineTo(6, h - 6); ctx.stroke();
});
const postMat = lambert(0x6c63ff);
const boardMat = new THREE.MeshLambertMaterial({ map: stripeTex });
const crateMat = new THREE.MeshLambertMaterial({ map: crateTex });
const hayMat = lambert(0xf2c94c);
const hayBandMat = lambert(0xc99a2e);

function makeBarrier() {
  const g = new THREE.Group();
  for (const sx of [-0.85, 0.85]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.95, 0.16), postMat);
    post.position.set(sx, 0.475, 0);
    g.add(post);
  }
  const board = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.38, 0.14), boardMat);
  board.position.y = 0.72;
  g.add(board);
  g.userData = { halfW: 0.95, halfD: 0.2, height: 0.92 };
  return g;
}
function makeCrate() {
  const g = new THREE.Group();
  const box = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.95, 1.1), crateMat);
  box.position.y = 0.475;
  g.add(box);
  g.userData = { halfW: 0.55, halfD: 0.55, height: 0.95 };
  return g;
}
function makeHay() {
  const g = new THREE.Group();
  const bale = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 1.7, 14), hayMat);
  bale.rotation.z = Math.PI / 2;
  bale.position.y = 0.45;
  g.add(bale);
  for (const sx of [-0.45, 0.45]) {
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.47, 0.47, 0.1, 14), hayBandMat);
    band.rotation.z = Math.PI / 2;
    band.position.set(sx, 0.45, 0);
    g.add(band);
  }
  g.userData = { halfW: 0.85, halfD: 0.45, height: 0.9 };
  return g;
}
const makers = [makeBarrier, makeCrate, makeHay];

// tall ones: too high to jump, she has to change lanes
const carColors = [0x3d5afe, 0x9b5de5, 0x00bbf9];
const windowMat = lambert(0xdff6ff);
const wheelMat = lambert(0x2b2350);
// a commuter train: rounded roof, sloped cab nose, bogies with wheels
const TRAIN_LEN = 6;
const TRAIN_SCALE = 1.25;
const TRAIN_ROOF = 2.95 * TRAIN_SCALE; // she can run along the top
const trainRampMat = lambert(0xffb347);
function makeTrainRamp(ramp, carLen) {
  // a ramp up onto the roof of a parked train; the platform covers the roof too
  const g = new THREE.Group();
  g.add(slab(0, 0.2, trainRampMat, 0, TRAIN_ROOF, 0, -ramp));
  for (const f of [0.35, 0.7]) {
    for (const sx of [-0.8, 0.8]) {
      const h = TRAIN_ROOF * f;
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.18, h, 0.18), pillarMat);
      leg.position.set(sx, h / 2, -ramp * f);
      g.add(leg);
    }
  }
  for (const sx of [-0.55, 0.55]) {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.02, Math.hypot(ramp, TRAIN_ROOF) * 0.9), railMatBridge);
    stripe.rotation.x = Math.atan2(TRAIN_ROOF, ramp);
    stripe.position.set(sx, TRAIN_ROOF / 2 + 0.02, -ramp / 2);
    g.add(stripe);
  }
  g.userData = { length: ramp + carLen, train: true, profile: [{ len: ramp, h0: 0, h1: TRAIN_ROOF }, { len: carLen, h0: TRAIN_ROOF, h1: TRAIN_ROOF }] };
  return g;
}
const trainBodyGeo = (() => {
  const L = TRAIN_LEN / 2, y0 = 0.75, top = 2.95, r = 0.35;
  const sh = new THREE.Shape();
  sh.moveTo(-L, y0);
  sh.lineTo(L, y0);
  sh.lineTo(L, 1.55);                       // flat nose front
  sh.quadraticCurveTo(L - 0.05, 1.75, L - 0.25, 1.95);
  sh.lineTo(L - 0.95, top - 0.1);           // sloped windscreen
  sh.quadraticCurveTo(L - 1.1, top, L - 1.4, top);
  sh.lineTo(-L + r, top);
  sh.quadraticCurveTo(-L, top, -L, top - r);
  sh.lineTo(-L, y0);
  const W = 1.9, b = 0.07;
  const geo = new THREE.ExtrudeGeometry(sh, { depth: W - 2 * b, bevelEnabled: true, bevelSize: b, bevelThickness: b, bevelSegments: 2, curveSegments: 6 });
  geo.rotateY(-Math.PI / 2);
  geo.translate(W / 2 - b, 0, 0);
  return geo;
})();
const trainMats = carColors.map(c => lambert(c));
const trainDark = lambert(0x3a3550);
const trainWhite = lambert(0xffffff);
const trainYellow = lambert(0xffd23f);
const doorMat = lambert(0xe9edf5);
const roofUnitMat = lambert(0xc9cfdb);
const glassMat = lambert(0x7cc8f2);
const lightMat = new THREE.MeshBasicMaterial({ color: 0xfff6b0 });
const tailMat = new THREE.MeshBasicMaterial({ color: 0xff4d5e });
const geoCache = {};
const tbox = (w, h, d) => geoCache[w + ',' + h + ',' + d] || (geoCache[w + ',' + h + ',' + d] = new THREE.BoxGeometry(w, h, d));
const trainWheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.16, 14);
const coachBodyGeo = new THREE.BoxGeometry(1.9, 2.2, TRAIN_LEN - 0.3);
function makeTrainCar(rideable = false, cab = true, last = true, color = null) {
  const g = new THREE.Group();
  const len = TRAIN_LEN, L = len / 2;
  const add = (geo, mat, x, y, z, rx = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.x = rx; g.add(m); return m; };
  const bodyMat = color || trainMats[Math.floor(Math.random() * trainMats.length)];
  // stripes along the sides
  add(tbox(1.96, 0.28, len - 0.2), trainWhite, 0, 1.15, 0);
  add(tbox(1.96, 0.1, len - 0.2), trainYellow, 0, 1.4, 0);
  if (cab) {
    add(trainBodyGeo, bodyMat, 0, 0, 0);
    // sloped windscreen on the cab, plus a dark frame
    const sz = 0.95, sy = 0.95, sl = Math.hypot(sz, sy), a = Math.atan2(sy, sz);
    add(tbox(1.62, 0.06, sl), trainDark, 0, 2.43, L - 0.6, a);
    add(tbox(1.42, 0.07, sl - 0.2), glassMat, 0, 2.45, L - 0.58, a);
    // headlights and a number board on the nose
    for (const x of [-0.6, 0.6]) add(tbox(0.3, 0.18, 0.06), lightMat, x, 1.75, L + 0.05);
    add(tbox(0.6, 0.2, 0.06), trainDark, 0, 1.75, L + 0.05);
    // bumper and coupler
    add(tbox(1.7, 0.22, 0.2), trainDark, 0, 0.82, L + 0.08);
    add(tbox(0.3, 0.2, 0.35), trainDark, 0, 0.62, L + 0.25);
  } else {
    // a passenger coach with a flexible gangway to the carriage in front
    add(coachBodyGeo, bodyMat, 0, 1.85, 0);
    add(tbox(1.2, 1.9, 0.5), trainDark, 0, 1.9, L);
    for (const sx of [-1, 1]) add(tbox(0.06, 0.62, 2.2), glassMat, sx * 0.98, 2.2, 1.6);
  }
  if (last) for (const x of [-0.6, 0.6]) add(tbox(0.18, 0.12, 0.06), tailMat, x, 0.95, -L - 0.05);
  // side windows, doors and roof units
  for (const sx of [-1, 1]) {
    add(tbox(0.06, 0.62, 3.1), glassMat, sx * 0.98, 2.2, -0.45);
    for (const z of [-0.9, 0.3]) add(tbox(0.06, 0.08, 0.06), trainDark, sx * 1.0, 2.2, z); // window pillars
    add(tbox(0.07, 1.75, 0.75), doorMat, sx * 0.98, 1.75, 1.75);
    add(tbox(0.08, 1.2, 0.04), trainDark, sx * 0.99, 1.95, 1.75);
    add(tbox(0.06, 0.2, 0.25), lightMat, sx * 0.98, 1.0, -L + 0.5);
  }
  if (!rideable) {
    // roof clutter only on the trains she can't run along
    add(tbox(1.0, 0.3, 1.4), roofUnitMat, 0, 3.08, -1.2);
    add(tbox(0.12, 0.5, 0.12), trainDark, 0, 3.2, 0.6);
    add(tbox(0.9, 0.06, 0.08), trainDark, 0, 3.47, 0.6);
  }
  // bogies with two axles each, and the dark underframe
  add(tbox(1.5, 0.35, len - 0.8), trainDark, 0, 0.6, 0);
  for (const bz of [-L + 1.05, L - 1.05]) {
    add(tbox(1.65, 0.3, 1.5), trainDark, 0, 0.42, bz);
    for (const dz of [-0.45, 0.45]) {
      for (const sx of [-0.84, 0.84]) {
        const w = add(trainWheelGeo, wheelMat, sx, 0.3, bz + dz);
        w.rotation.z = Math.PI / 2;
      }
    }
  }
  g.scale.setScalar(TRAIN_SCALE);
  g.userData = { halfW: 0.95, halfD: L * TRAIN_SCALE, height: 99, tall: true, roof: TRAIN_ROOF };
  return g;
}
let obstacles = [];

// ---------- things to run over: bridges, launch ramps, bounce pads ----------
// A platform's group sits at its near end (the end she reaches first) and stretches away into -z.
const plankTex = canvasTexture(64, 64, (ctx, w, h) => {
  ctx.fillStyle = '#4fb3e8'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#3a95c9';
  for (let y = 0; y < h; y += 16) ctx.fillRect(0, y, w, 3);
});
plankTex.wrapS = plankTex.wrapT = THREE.RepeatWrapping;
plankTex.repeat.set(1, 5);
const deckMat = new THREE.MeshLambertMaterial({ map: plankTex });
const rampMat = lambert(0xffb347);
const launchMat = lambert(0xff5d73);
const railMatBridge = lambert(0xffffff);
const pillarMat = lambert(0x6c63ff);
let platforms = [];

function slab(len, thick, mat, y0, y1, z0, z1) {
  // a plank running from (y0, z0) to (y1, z1); its top surface follows that line
  const dz = z1 - z0, dy = y1 - y0;
  const m = new THREE.Mesh(new THREE.BoxGeometry(1.9, thick, Math.hypot(dz, dy)), mat);
  m.rotation.x = Math.atan2(dy, -dz);
  m.position.set(0, (y0 + y1) / 2 - thick / 2, (z0 + z1) / 2);
  return m;
}

function makeBridge({ ramp, height, deck, down, rails }) {
  const g = new THREE.Group();
  g.add(slab(0, 0.18, rampMat, 0, height, 0, -ramp));
  g.add(slab(0, 0.22, deckMat, height, height, -ramp, -ramp - deck));
  if (down) g.add(slab(0, 0.18, rampMat, height, 0, -ramp - deck, -2 * ramp - deck));
  for (let z = -ramp - 1; z > -ramp - deck; z -= 3.5) {
    for (const sx of [-0.8, 0.8]) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.22, height, 0.22), pillarMat);
      p.position.set(sx, height / 2 - 0.1, z);
      g.add(p);
    }
  }
  for (const side of rails) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, deck), railMatBridge);
    rail.position.set(side * 0.92, height + 0.55, -ramp - deck / 2);
    g.add(rail);
    for (let z = -ramp; z >= -ramp - deck; z -= 2) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.55, 0.1), railMatBridge);
      post.position.set(side * 0.92, height + 0.28, z);
      g.add(post);
    }
  }
  g.userData = { ramp, height, deck, down, launch: false, length: ramp * (down ? 2 : 1) + deck };
  return g;
}

const pillarGeo = new THREE.BoxGeometry(0.22, 1, 0.22);
function makeClimb(steps, decks, rails) {
  const g = new THREE.Group();
  const profile = [];
  const STEP = 1.8;
  let h = 0;
  for (let k = 0; k < steps; k++) {
    profile.push({ len: 5, h0: h, h1: h + STEP });
    h += STEP;
    profile.push({ len: decks[k], h0: h, h1: h });
  }
  profile.push({ len: h * 2.4, h0: h, h1: 0 }); // a long slide back down to the ground
  let z = 0;
  for (const seg of profile) {
    const flat = seg.h0 === seg.h1;
    g.add(slab(0, flat ? 0.22 : 0.18, flat ? deckMat : rampMat, seg.h0, seg.h1, -z, -z - seg.len));
    if (flat) {
      for (let pz = z + 1; pz < z + seg.len; pz += 3.5) {
        for (const sx of [-0.8, 0.8]) {
          const pil = new THREE.Mesh(pillarGeo, pillarMat);
          pil.scale.y = seg.h0;
          pil.position.set(sx, seg.h0 / 2 - 0.1, -pz);
          g.add(pil);
        }
      }
      for (const side of rails) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, seg.len), railMatBridge);
        rail.position.set(side * 0.92, seg.h0 + 0.55, -z - seg.len / 2);
        g.add(rail);
      }
    }
    z += seg.len;
  }
  g.userData = { ramp: 0, height: h, deck: 0, down: true, launch: false, length: z, profile };
  return g;
}

function makeLaunchRamp() {
  const g = new THREE.Group();
  const ramp = 3.2, height = 1.1;
  g.add(slab(0, 0.18, launchMat, 0, height, 0, -ramp));
  const back = new THREE.Mesh(new THREE.BoxGeometry(1.9, height, 0.2), launchMat);
  back.position.set(0, height / 2, -ramp);
  g.add(back);
  for (const sx of [-0.6, 0, 0.6]) {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.02, ramp * 0.9), railMatBridge);
    stripe.rotation.x = Math.atan2(height, ramp);
    stripe.position.set(sx, height / 2 + 0.01, -ramp / 2);
    g.add(stripe);
  }
  g.userData = { ramp, height, deck: 0, down: false, launch: true, length: ramp };
  return g;
}

// height of a platform's surface, d units past its near end
function surfaceAt(p, d) {
  const u = p.userData;
  if (d < 0 || d > u.length) return 0;
  if (u.profile) {
    let z0 = 0;
    for (const seg of u.profile) {
      if (d <= z0 + seg.len) return seg.h0 + (seg.h1 - seg.h0) * (d - z0) / seg.len;
      z0 += seg.len;
    }
    return 0;
  }
  if (d < u.ramp) return u.height * d / u.ramp;
  if (d <= u.ramp + u.deck) return u.height;
  return u.height * (1 - (d - u.ramp - u.deck) / u.ramp);
}

function makePad() {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.85, 0.16, 20), pillarMat);
  base.position.y = 0.08;
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.08, 20), lambert(0x7dff9a));
  top.position.y = 0.2;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.05, 6, 20), lambert(0xffffff));
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.25;
  g.add(base, top, ring);
  g.userData = { pad: true, halfW: 0.75, halfD: 0.75, height: 0.25, base: 0, top };
  return g;
}
