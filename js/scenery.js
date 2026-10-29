// Hop Hop Runner: Scenery that scrolls past: trees, towers, shops, billboards, cottages, sky, birds and planes.

// ---------- moving things (recycled) ----------
const tieMat = lambert(0xa0704a);
const tieGeo = new THREE.BoxGeometry(8, 0.08, 0.5);
const ties = [];
const TIE_GAP = 2.5;
for (let i = 0; i < 50; i++) {
  const tie = new THREE.Mesh(tieGeo, tieMat);
  tie.position.set(0, 0.04, DESPAWN_Z - i * TIE_GAP);
  scene.add(tie);
  ties.push(tie);
}

const houseColors = [0xff8fa3, 0xffd23f, 0x9b8cff, 0x5ec8e5, 0xffa45c, 0xf7f7ff];
const roofMat = lambert(0xe2475e);
const trunkMat = lambert(0x8a5a36);
const leafMats = [lambert(0x3fae5a), lambert(0x58c46e)];
const scenery = [];
const pineMats = [lambert(0x2f8f4e), lambert(0x3aa35a)];
function makeTree() {
  const g = new THREE.Group();
  if (Math.random() < 0.4) {
    // a tall pine made of stacked cones
    const h = 6 + Math.random() * 4;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 1.6, 8), trunkMat);
    trunk.position.y = 0.8;
    g.add(trunk);
    for (let k = 0; k < 3; k++) {
      const r = 1.9 - k * 0.5, ch = h * 0.42;
      const cone = new THREE.Mesh(new THREE.ConeGeometry(r, ch, 9), pineMats[k % 2]);
      cone.position.y = 1.4 + k * h * 0.26 + ch / 2;
      g.add(cone);
    }
    return g;
  }
  // a big round tree on a tall trunk
  const th = 2.6 + Math.random() * 2;
  const r = 1.6 + Math.random() * 0.9;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.42, th, 8), trunkMat);
  trunk.position.y = th / 2;
  const top = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 9), leafMats[Math.random() < 0.5 ? 0 : 1]);
  top.position.y = th + r * 0.75;
  const top2 = new THREE.Mesh(new THREE.SphereGeometry(r * 0.7, 10, 8), leafMats[1]);
  top2.position.set(r * 0.4, th + r * 1.4, 0.2);
  g.add(trunk, top, top2);
  return g;
}
// rows of windows, tinted by each building's colour
const windowTex = canvasTexture(128, 128, (ctx, w, h) => {
  // two floors of two windows each, with a frame and a sill
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
  for (const x of [12, 76]) for (const y of [14, 78]) {
    ctx.fillStyle = '#d9d9e8'; ctx.fillRect(x - 3, y - 3, 46, 40);
    ctx.fillStyle = '#7fb2ff'; ctx.fillRect(x, y, 40, 34);
    ctx.fillStyle = '#b8d6ff'; ctx.fillRect(x + 4, y + 4, 10, 12);
    ctx.fillStyle = '#d9d9e8'; ctx.fillRect(x, y + 15, 40, 3); ctx.fillRect(x + 19, y, 3, 34);
    ctx.fillStyle = '#c4c4d6'; ctx.fillRect(x - 5, y + 36, 50, 5);
  }
});
windowTex.anisotropy = 4;
windowTex.wrapS = windowTex.wrapT = THREE.RepeatWrapping;
function makeTower() {
  const g = new THREE.Group();
  const w = 4 + Math.random() * 3, h = 14 + Math.random() * 18, d = 4;
  const tex = windowTex.clone();
  tex.needsUpdate = true;
  tex.repeat.set(Math.max(1, Math.round(w / 3.2)), Math.max(1, Math.round(h / 5.6)));
  const color = houseColors[Math.floor(Math.random() * houseColors.length)];
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color, map: tex }));
  body.position.y = h / 2;
  const ledge = new THREE.Mesh(new THREE.BoxGeometry(w + 0.3, 0.3, d + 0.3), lambert(0xf7f7ff));
  ledge.position.y = h + 0.15;
  g.add(body, ledge);
  if (Math.random() < 0.5) {
    // a little water tower on the roof
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.1, 10), lambert(0xa0704a));
    tank.position.set(w * 0.2, h + 1.0, 0);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.7, 0.6, 10), roofMat);
    cap.position.set(w * 0.2, h + 1.85, 0);
    g.add(tank, cap);
  } else {
    // an aerial with a red light
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 5), lambert(0x2b2350));
    mast.position.set(-w * 0.2, h + 1.4, 0);
    const light = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff3b3b }));
    light.position.set(-w * 0.2, h + 2.55, 0);
    g.add(mast, light);
  }
  g.userData.far = true;
  return g;
}
function makeHouse() {
  if (Math.random() < 0.85) return makeTower(); // the shop terraces line the track now
  const g = new THREE.Group();
  const w = 3.5 + Math.random() * 2.5, h = 5 + Math.random() * 5;
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, 3), lambert(houseColors[Math.floor(Math.random() * houseColors.length)]));
  body.position.y = h / 2;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(w * 0.8, 1.6, 4), roofMat);
  roof.position.y = h + 0.8;
  roof.rotation.y = Math.PI / 4;
  g.add(body, roof);
  g.userData.far = true;
  return g;
}
const sceneryMat = (c) => lambert(c);
const petalColors = [0xff5d73, 0xffd23f, 0xffffff, 0x9b8cff, 0xff8fd8];
function makeBush() {
  const g = new THREE.Group();
  const m = leafMats[1];
  for (const [x, y, r] of [[0, 0.45, 0.55], [0.5, 0.35, 0.4], [-0.45, 0.32, 0.38]]) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), m);
    b.position.set(x, y, 0);
    g.add(b);
  }
  g.userData.near = true;
  return g;
}
function makeFlowers() {
  const g = new THREE.Group();
  const stem = sceneryMat(0x2f9e44);
  for (let i = 0; i < 7; i++) {
    const x = (Math.random() - 0.5) * 2.2, z = (Math.random() - 0.5) * 2.2;
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 4), stem);
    st.position.set(x, 0.2, z);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 5), sceneryMat(petalColors[Math.floor(Math.random() * petalColors.length)]));
    head.position.set(x, 0.42, z);
    g.add(st, head);
  }
  g.userData.near = true;
  return g;
}
function makeLamp() {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 3, 6), sceneryMat(0x2b2350));
  pole.position.y = 1.5;
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfff3b0 }));
  bulb.position.y = 3.1;
  g.add(pole, bulb);
  g.userData.near = true;
  g.scale.setScalar(1.45);
  return g;
}
const spinners = [];
function makeWindmill() {
  const g = new THREE.Group();
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1.1, 5, 8), sceneryMat(0xf7f7ff));
  tower.position.y = 2.5;
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.85, 1.1, 8), roofMat);
  cap.position.y = 5.5;
  const hub = new THREE.Group();
  hub.position.set(0, 4.6, 0.9);
  const bladeMat = sceneryMat(0xffd23f);
  for (let i = 0; i < 4; i++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.4, 0.06), bladeMat);
    blade.position.y = 1.2;
    const arm = new THREE.Group();
    arm.rotation.z = i * Math.PI / 2;
    arm.add(blade);
    hub.add(arm);
  }
  g.add(tower, cap, hub);
  spinners.push(hub);
  g.scale.setScalar(1.6);
  return g;
}
const balloonColors = [0xff5d73, 0xffd23f, 0x5ec8e5, 0x9b5de5];
function makeBalloon() {
  const g = new THREE.Group();
  const ball = new THREE.Mesh(new THREE.SphereGeometry(1.1, 14, 12), sceneryMat(balloonColors[Math.floor(Math.random() * balloonColors.length)]));
  ball.scale.y = 1.2;
  ball.position.y = 7.5 + Math.random() * 3;
  const basket = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.5), trunkMat);
  basket.position.y = ball.position.y - 1.8;
  g.add(ball, basket);
  g.userData.far = true;
  g.scale.setScalar(2.4);
  return g;
}
const kinds = [makeTree, makeTree, makeHouse, makeTree, makeBush, makeFlowers, makeLamp, makeHouse, makeFlowers, makeBush, makeTree, makeWindmill, makeTree, makeFlowers, makeHouse, makeBalloon];
function placeScenery(obj, z) {
  const side = obj.userData.side;
  const u = obj.userData;
  const dist = u.near ? 5 + Math.random() * 1.8 : u.far ? 20 + Math.random() * 12 : 7 + Math.random() * 4;
  obj.position.set(side * dist, 0, z);
}
const SCENERY_GAP = 2.2;
for (let i = 0; i < 56; i++) {
  const obj = kinds[i % kinds.length]();
  obj.userData.side = i % 2 === 0 ? -1 : 1;
  if (obj.userData.near === undefined && obj.userData.far === undefined) obj.userData.mid = true;
  placeScenery(obj, DESPAWN_Z - i * SCENERY_GAP);
  scene.add(obj);
  scenery.push(obj);
}

// little white fences along both sides of the track
const fenceMat = sceneryMat(0xffffff);
const fences = [];
const FENCE_GAP = 2;
for (let i = 0; i < 60; i++) {
  for (const side of [-1, 1]) {
    const f = new THREE.Group();
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.7, 0.12), fenceMat);
    post.position.y = 0.35;
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, FENCE_GAP), fenceMat);
    bar.position.set(0, 0.5, -FENCE_GAP / 2);
    f.add(post, bar);
    f.position.set(side * 4.45, 0, DESPAWN_Z - i * FENCE_GAP);
    scene.add(f);
    fences.push(f);
  }
}

// long terraces of shops lining the track, with bunting and waving fans
const SHOPS = ['SWEETS', 'TOYS', 'PIZZA', 'CAFE', 'BAKERY', 'ICE CREAM', 'PETS', 'BOOKS', "ROBYN'S CAFE", 'TOY SHOP', 'CUPCAKES', 'GAMES'];
const signTex = {};
function shopSign(name) {
  if (!signTex[name]) {
    signTex[name] = canvasTexture(256, 64, (ctx, w, h) => {
      ctx.fillStyle = '#2b2350'; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 6; ctx.strokeRect(4, 4, w - 8, h - 8);
      ctx.fillStyle = '#ffffff';
      ctx.font = '400 38px "Lilita One", "Arial Rounded MT Bold", "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(name, w / 2, h / 2 + 2, w - 24);
    });
  }
  return signTex[name];
}
const awningMats = [['#ff5d73', '#ffffff'], ['#3d9bff', '#ffffff'], ['#3fae5a', '#fff3b0'], ['#9b5de5', '#ffffff']].map(([a, b]) => {
  const t = canvasTexture(64, 16, (ctx, w, h) => {
    for (let x = 0; x < w; x += 16) { ctx.fillStyle = a; ctx.fillRect(x, 0, 8, h); ctx.fillStyle = b; ctx.fillRect(x + 8, 0, 8, h); }
  });
  t.wrapS = THREE.RepeatWrapping;
  return new THREE.MeshLambertMaterial({ map: t });
});
const shopGlass = lambert(0x9fdcff);
const shopDoor = lambert(0x6b3e26);
const corniceMat = lambert(0xf7f7ff);
const fanSkin = [lambert(0xf3c39b), lambert(0xc68a5e), lambert(0x8d5a3b)];
const fanShirts = [0xff5d73, 0x3d9bff, 0xffd23f, 0x3fae5a, 0x9b5de5].map(c => lambert(c));
const fanArms = [];
function makeFan() {
  // someone leaning on a little balcony, waving at her
  const g = new THREE.Group();
  const skin = fanSkin[Math.floor(Math.random() * fanSkin.length)];
  const shirt = fanShirts[Math.floor(Math.random() * fanShirts.length)];
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.65, 0.5), shirt);
  body.position.y = 0.45;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 8), skin);
  head.position.y = 1.02;
  const arm = new THREE.Group();
  const limbM = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.6, 0.14), shirt);
  limbM.position.y = 0.3;
  arm.add(limbM);
  arm.position.set(-0.05, 0.7, 0.3);
  arm.userData.phase = Math.random() * 6;
  fanArms.push(arm);
  const rail = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 1.6), corniceMat);
  rail.position.set(-0.45, 0.1, 0);
  g.add(body, head, arm, rail);
  return g;
}
function makeBunting(len) {
  // one strip of little flags in a single mesh, drooping between hooks
  const pos = [], col = [];
  const cols = [0xff5d73, 0xffd23f, 0x3d9bff, 0x3fae5a, 0x9b5de5, 0xffffff].map(c => new THREE.Color(c));
  let k = 0;
  for (let z = -len / 2; z < len / 2 - 0.6; z += 0.75, k++) {
    const t = ((z + len / 2) % 6) / 6, sag = Math.sin(t * Math.PI) * 0.6;
    const y = -sag, c = cols[k % cols.length];
    pos.push(0, y, z, 0, y, z + 0.6, 0, y - 0.6, z + 0.3);
    for (let v = 0; v < 3; v++) col.push(c.r, c.g, c.b);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  return new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }));
}
function makeTerrace() {
  // a long row of joined-up shops; local front faces -x, the group is centred on its length
  const g = new THREE.Group();
  const segs = [];
  let len = 0;
  const n = 5 + Math.floor(Math.random() * 4);
  for (let i = 0; i < n; i++) { const L = 4 + Math.random() * 2.5; segs.push(L); len += L; }
  let z = -len / 2;
  for (const L of segs) {
    const h = 8.8 + Math.random() * 6, cz = z + L / 2;
    const tex = windowTex.clone();
    tex.needsUpdate = true;
    tex.repeat.set(Math.max(1, Math.round(L / 3.2)), Math.max(1, Math.round((h - 3.4) / 5.6)));
    const body = new THREE.Mesh(new THREE.BoxGeometry(5, h - 3.4, L), new THREE.MeshLambertMaterial({ color: houseColors[Math.floor(Math.random() * houseColors.length)], map: tex }));
    body.position.set(2.5, 3.4 + (h - 3.4) / 2, cz);
    const ground = new THREE.Mesh(new THREE.BoxGeometry(5, 3.4, L), corniceMat);
    ground.position.set(2.55, 1.7, cz);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.0, L - 0.8), shopGlass);
    glass.position.set(0, 1.4, cz - 0.3);
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.6, 1.1), shopDoor);
    door.position.set(-0.02, 1.3, cz + L / 2 - 0.8);
    const awning = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.12, L - 0.2), awningMats[Math.floor(Math.random() * awningMats.length)]);
    awning.position.set(-0.6, 2.75, cz);
    awning.rotation.z = -0.35;
    awning.material.map.repeat.set(Math.round(L), 1);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(L - 0.6, 4), 0.75), new THREE.MeshBasicMaterial({ map: shopSign(SHOPS[Math.floor(Math.random() * SHOPS.length)]) }));
    sign.position.set(-0.06, 3.15, cz);
    sign.rotation.y = -Math.PI / 2;
    const cornice = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.4, L), corniceMat);
    cornice.position.set(2.5, h + 0.2, cz);
    g.add(body, ground, glass, door, awning, sign, cornice);
    if (Math.random() < 0.35) {
      const fan = makeFan();
      fan.position.set(-0.2, 4.6 + Math.floor(Math.random() * 2) * 1.6, cz);
      g.add(fan);
    }
    z += L;
  }
  const bunting = makeBunting(len);
  bunting.position.set(-1.3, 5.0, 0);
  g.add(bunting);
  g.userData.len = len;
  return g;
}
const terraces = [];
const TERRACE_X = 5.4; // right up against the track fences
function placeTerrace(t, nearZ) {
  const side = t.userData.side;
  t.position.set(side * TERRACE_X, 0, nearZ - t.userData.len / 2);
  t.rotation.y = side > 0 ? 0 : Math.PI;
  t.userData.far = nearZ - t.userData.len;
}
for (const side of [-1, 1]) {
  let z = side > 0 ? -4 : -20;
  for (let i = 0; i < 4; i++) {
    const t = makeTerrace();
    t.userData.side = side;
    placeTerrace(t, z);
    z = t.userData.far - (12 + Math.random() * 16);
    scene.add(t);
    terraces.push(t);
  }
}
// the terrace on this side covering z (give or take m), if any
function terraceAt(side, z, m) {
  for (const t of terraces) {
    if (t.userData.side === side && z - m < t.position.z + t.userData.len / 2 && z + m > t.userData.far) return t;
  }
  return null;
}
function updateTerraces(dt, move) {
  for (const t of terraces) {
    t.position.z += move;
    t.userData.far += move;
  }
  for (const t of terraces) {
    if (t.position.z - t.userData.len / 2 > DESPAWN_Z + 4) {
      const farthest = Math.min(...terraces.filter(o => o.userData.side === t.userData.side).map(o => o.userData.far));
      placeTerrace(t, farthest - (12 + Math.random() * 16));
    }
  }
  const tt = performance.now() / 1000;
  for (const a of fanArms) a.rotation.x = 0.4 + Math.sin(tt * 9 + a.userData.phase) * 0.6;
}

// billboards beside the track: Dad cheering Robyn on
const CHEERS = [
  'Well done Robyn!',
  'Go Robyn go!',
  "You're a star, Robyn!",
  'Keep running, Robyn!',
  'So proud of you, Robyn!',
  'Super jumping, Robyn!',
  'Robyn is the best runner!',
  'Love you Robyn! x',
];
const BOARD_BGS = [['#ffd23f', '#ffb347'], ['#5ee7ff', '#9b8cff'], ['#ff8fd8', '#ff5d73'], ['#7dff9a', '#3fae5a']];
function drawDad(ctx, cx, cy, r) {
  // a friendly cartoon dad giving a thumbs up
  ctx.save();
  ctx.lineWidth = 6; ctx.strokeStyle = '#2b2350';
  // shirt
  ctx.fillStyle = '#3d5afe';
  ctx.beginPath(); ctx.ellipse(cx, cy + r * 1.55, r * 1.05, r * 0.75, 0, Math.PI, 0); ctx.fill(); ctx.stroke();
  // ears and face
  ctx.fillStyle = '#f3c39b';
  for (const ex of [-1, 1]) { ctx.beginPath(); ctx.arc(cx + ex * r * 0.98, cy + r * 0.05, r * 0.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // short hair
  ctx.fillStyle = '#5a3825';
  ctx.beginPath(); ctx.arc(cx, cy - r * 0.15, r * 1.02, Math.PI * 1.05, Math.PI * 1.95); ctx.quadraticCurveTo(cx, cy - r * 0.55, cx - r * 0.98, cy - r * 0.35); ctx.fill(); ctx.stroke();
  // eyes, eyebrows, cheeks, big smile
  ctx.fillStyle = '#2b2350';
  for (const ex of [-0.38, 0.38]) {
    ctx.beginPath(); ctx.arc(cx + ex * r, cy - r * 0.05, r * 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx + ex * r - r * 0.16, cy - r * 0.3); ctx.lineTo(cx + ex * r + r * 0.16, cy - r * 0.34); ctx.stroke();
  }
  ctx.fillStyle = '#ff9aa8';
  for (const ex of [-0.6, 0.6]) { ctx.beginPath(); ctx.arc(cx + ex * r, cy + r * 0.28, r * 0.13, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(cx, cy + r * 0.25, r * 0.45, 0.1 * Math.PI, 0.9 * Math.PI); ctx.closePath(); ctx.fill(); ctx.stroke();
  // thumbs up
  const hx = cx + r * 1.35, hy = cy + r * 0.85;
  ctx.fillStyle = '#f3c39b';
  ctx.beginPath(); ctx.roundRect ? ctx.roundRect(hx - r * 0.3, hy - r * 0.15, r * 0.6, r * 0.55, r * 0.12) : ctx.rect(hx - r * 0.3, hy - r * 0.15, r * 0.6, r * 0.55); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect ? ctx.roundRect(hx - r * 0.12, hy - r * 0.62, r * 0.24, r * 0.55, r * 0.12) : ctx.rect(hx - r * 0.12, hy - r * 0.62, r * 0.24, r * 0.55); ctx.fill(); ctx.stroke();
  // a speech label
  ctx.fillStyle = '#2b2350';
  ctx.font = '900 ' + Math.round(r * 0.32) + 'px "Nunito", "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('DAD', cx, cy + r * 2.05);
  ctx.restore();
}
// optional photo for the billboards (a data: URL); the cartoon Dad is used when empty
const BOARD_PHOTO = 'img/billboard-photo.jpg';
const boardPhoto = new Image();
function drawPhoto(ctx, cx, cy, r) {
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(cx, cy, r + 9, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = '#2b2350'; ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
  ctx.drawImage(boardPhoto, cx - r, cy - r, r * 2, r * 2);
  ctx.restore();
  // little heart badge
  ctx.save();
  ctx.font = '400 ' + Math.round(r * 0.55) + 'px "Lilita One", "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ff3d71'; ctx.lineWidth = 6; ctx.strokeStyle = '#ffffff';
  ctx.strokeText('\u2665', cx + r * 0.8, cy + r * 0.8); ctx.fillText('\u2665', cx + r * 0.8, cy + r * 0.8);
  ctx.restore();
}
function wrapLines(ctx, text, maxW) {
  const words = text.split(' '), lines = [];
  let line = '';
  for (const w of words) {
    const t = line ? line + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
  }
  lines.push(line);
  return lines;
}
function paintBoard(canvas, msg, k) {
  const ctx = canvas.getContext('2d'), w = canvas.width, h = canvas.height;
  const [c1, c2] = BOARD_BGS[k % BOARD_BGS.length];
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, c1); g.addColorStop(1, c2);
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  // sunburst behind dad
  ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = '#ffffff';
  for (let a = 0; a < 12; a++) { ctx.beginPath(); ctx.moveTo(130, 130); ctx.arc(130, 130, 260, a * Math.PI / 6, a * Math.PI / 6 + 0.25); ctx.fill(); }
  ctx.restore();
  ctx.lineWidth = 14; ctx.strokeStyle = '#ffffff'; ctx.strokeRect(7, 7, w - 14, h - 14);
  if (boardPhoto.complete && boardPhoto.naturalWidth) drawPhoto(ctx, 128, 122, 92);
  else drawDad(ctx, 130, 112, 62);
  ctx.font = '400 54px "Lilita One", "Arial Rounded MT Bold", "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const lines = wrapLines(ctx, msg, 280);
  const lh = 58, top = h / 2 - (lines.length - 1) * lh / 2;
  lines.forEach((ln, i) => {
    ctx.lineWidth = 10; ctx.strokeStyle = '#2b2350'; ctx.strokeText(ln, 365, top + i * lh);
    ctx.fillStyle = '#ffffff'; ctx.fillText(ln, 365, top + i * lh);
  });
}
const boardTextures = CHEERS.map((msg, k) => {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 256;
  paintBoard(c, msg, k);
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 4;
  return { c, t, msg, k };
});
// repaint once the web fonts (and photo) have loaded
const repaintBoards = () => boardTextures.forEach(b => { paintBoard(b.c, b.msg, b.k); b.t.needsUpdate = true; });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(repaintBoards).catch(() => {});
if (BOARD_PHOTO) { boardPhoto.onload = repaintBoards; boardPhoto.src = BOARD_PHOTO; }
const billboards = [];
const BILLBOARD_GAP = 60;
const postMatB = lambert(0x6b6f80);
function makeBillboard() {
  const g = new THREE.Group();
  const face = new THREE.Mesh(new THREE.PlaneGeometry(7, 3.5), new THREE.MeshBasicMaterial({ map: boardTextures[0].t }));
  face.position.y = 5.2;
  const back = new THREE.Mesh(new THREE.BoxGeometry(7.4, 3.9, 0.25), lambert(0xffffff));
  back.position.set(0, 5.2, -0.15);
  g.add(back, face);
  for (const x of [-2.4, 2.4]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.4, 0.3), postMatB);
    post.position.set(x, 1.7, -0.2);
    g.add(post);
  }
  g.userData.face = face;
  return g;
}
let cheerIdx = 0;
function placeBillboard(b, z) {
  const side = b.userData.side;
  b.position.set(side * 7.6, 0, z);
  b.rotation.y = side * -0.8; // angled towards her so she can read it, poking out of a gap
  b.userData.face.material.map = boardTextures[cheerIdx++ % boardTextures.length].t;
}
for (let i = 0; i < 4; i++) {
  const b = makeBillboard();
  b.userData.side = i % 2 === 0 ? 1 : -1;
  placeBillboard(b, -30 - i * BILLBOARD_GAP);
  scene.add(b);
  billboards.push(b);
}

// cottages from a 3D model, standing in the gaps between the shops
// "Painterly Cottage" by glenatron on Sketchfab, CC BY-NC 4.0
const COTTAGE_URL = 'models/cottage.glb';
const cottages = [];
const COTTAGE_GAP = 90;
let COTTAGE_HEIGHT = 15; // tall enough that its front door fits her
function placeCottage(c, z) {
  c.position.set(c.userData.side * c.userData.offX, 0, z);
  c.visible = true;
}
if (THREE.GLTFLoader) {
  const loader = new THREE.GLTFLoader();
  const onCottage = (gltf) => {
    const model = gltf.scene;
    model.traverse(m => {
      if (m.isMesh && m.material && m.material.map) { m.material.map.encoding = THREE.LinearEncoding; m.material.needsUpdate = true; }
    });
    // turn its front door towards the track, and make it about two storeys tall
    model.rotation.y = -Math.PI / 2;
    const holder = new THREE.Group();
    holder.add(model);
    let box = new THREE.Box3().setFromObject(holder), size = box.getSize(new THREE.Vector3());
    const k = COTTAGE_HEIGHT / size.y;
    holder.scale.setScalar(k);
    box = new THREE.Box3().setFromObject(holder);
    const centre = box.getCenter(new THREE.Vector3());
    model.position.x -= centre.x / k; model.position.z -= centre.z / k; model.position.y -= box.min.y / k;
    box = new THREE.Box3().setFromObject(holder); size = box.getSize(new THREE.Vector3());
    // the house sits at the back of a big garden: bring the house up to the fence and trim the
    // garden off at the fence line so it never spills onto the track
    const HOUSE_FRONT = 0.3 * k; // house front, measured from the middle of the garden
    const sideMats = {};
    for (const side of [1, -1]) {
      const plane = new THREE.Plane(new THREE.Vector3(side, 0, 0), -4.7);
      sideMats[side] = new Map();
      holder.traverse(m => { if (m.isMesh && !sideMats[side].has(m.material)) { const mm = m.material.clone(); mm.clippingPlanes = [plane]; mm.side = THREE.DoubleSide; sideMats[side].set(m.material, mm); } });
    }
    for (let i = 0; i < 4; i++) {
      const c = new THREE.Group();
      const side = i % 2 === 0 ? 1 : -1;
      const inner = holder.clone();
      inner.traverse(m => { if (m.isMesh) m.material = sideMats[side].get(m.material); });
      c.add(inner);
      c.userData = { side, offX: 6.3 + HOUSE_FRONT, halfZ: size.z / 2 };
      // the door faces the track on both sides
      if (c.userData.side < 0) inner.rotation.y = Math.PI;
      placeCottage(c, -50 - i * COTTAGE_GAP / 2);
      scene.add(c);
      cottages.push(c);
    }
  };
  if (COTTAGE_URL.startsWith('data:')) {
    // an inlined model: decode it here rather than fetching a data: URL
    try {
      const bin = atob(COTTAGE_URL.slice(COTTAGE_URL.indexOf(',') + 1)), buf = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
      loader.parse(buf.buffer, '', onCottage, () => {});
    } catch (e) {}
  } else {
    loader.load(COTTAGE_URL, onCottage, undefined, () => {});
  }
}
function updateCottages(move) {
  for (const c of cottages) {
    c.position.z += move;
    const u = c.userData;
    // slide it back into the next gap that's big enough
    for (let k = 0; k < 8 && c.position.z < -40; k++) {
      const t = terraceAt(u.side, c.position.z, u.halfZ + 1);
      const b = billboards.find(o => o.userData.side === u.side && Math.abs(o.position.z - c.position.z) < u.halfZ + 4);
      if (t) {
        // stand at the far end of the gap, so she can see it over the near shops
        const next = terraces.filter(o => o.userData.side === u.side && o.position.z + o.userData.len / 2 < t.userData.far)
          .sort((a, b) => b.position.z - a.position.z)[0];
        const nextNear = next ? next.position.z + next.userData.len / 2 : -1e9;
        if (t.userData.far - nextNear >= u.halfZ * 2 + 4) c.position.z = nextNear + u.halfZ + 1.3;
        else c.position.z = nextNear - 1; // too tight: try the gap after that one
      }
      else if (b) c.position.z = b.position.z - u.halfZ - 4.5;
      else break;
    }
    if (c.position.z - u.halfZ > DESPAWN_Z) placeCottage(c, c.position.z - cottages.length * COTTAGE_GAP / 2 - Math.random() * 30);
  }
}
const cottageAt = (side, z, m) => cottages.some(c => c.userData.side === side && Math.abs(c.position.z - z) < c.userData.halfZ + m);

// far away: rolling hills, the sun, drifting clouds (these ignore the fog)
const hillMats = [lambert(0x5cc46e), lambert(0x4bb36a), lambert(0x6fd07a)];
for (let i = 0; i < 14; i++) {
  const side = i % 2 === 0 ? -1 : 1;
  const r = 14 + Math.random() * 12;
  const hill = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), hillMats[i % 3]);
  hill.scale.y = 0.45;
  hill.position.set(side * (30 + Math.random() * 40), -0.5, -60 - Math.random() * 60);
  scene.add(hill);
}
const sun = new THREE.Mesh(new THREE.CircleGeometry(7, 32), new THREE.MeshBasicMaterial({ color: 0xfff176, fog: false }));
sun.position.set(-45, 38, -150);
scene.add(sun);
const sunGlow = new THREE.Mesh(new THREE.CircleGeometry(10, 32), new THREE.MeshBasicMaterial({ color: 0xfff8c4, transparent: true, opacity: 0.45, fog: false }));
sunGlow.position.set(-45, 38, -150.5);
scene.add(sunGlow);
const cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false });
// stars for Starry Night: one cheap point cloud
const starPos = [];
for (let i = 0; i < 260; i++) {
  const a = Math.random() * Math.PI * 2, el = 0.15 + Math.random() * 1.2;
  starPos.push(Math.cos(a) * Math.cos(el) * 180, 20 + Math.sin(el) * 120, -Math.abs(Math.sin(a)) * Math.cos(el) * 180 - 20);
}
const starGeoPts = new THREE.BufferGeometry();
starGeoPts.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
const stars = new THREE.Points(starGeoPts, new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, fog: false }));
stars.visible = false;
scene.add(stars);
// a rainbow far away for the sunny lands
const rainbow = new THREE.Group();
[0xff5d73, 0xffa45c, 0xffd23f, 0x7dff9a, 0x5ec8e5, 0x9b8cff].forEach((c, k) => {
  const band = new THREE.Mesh(new THREE.TorusGeometry(70 - k * 2.2, 1.1, 6, 40, Math.PI), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.45, fog: false, depthWrite: false }));
  rainbow.add(band);
});
rainbow.position.set(40, -38, -185); // low enough that its feet meet the curved horizon
scene.add(rainbow);

const clouds = [];
for (let i = 0; i < 12; i++) {
  const c = new THREE.Group();
  for (let j = 0; j < 4; j++) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(2 + Math.random() * 1.5, 10, 8), cloudMat);
    puff.position.set(j * 2.6 - 4, Math.random() * 1.2, Math.random());
    puff.scale.y = 0.7;
    c.add(puff);
  }
  c.position.set((Math.random() - 0.5) * 140, 22 + Math.random() * 14, -40 - Math.random() * 110);
  scene.add(c);
  clouds.push(c);
}

// a little flock of birds now and then, flapping across the sky
const birdMat = lambert(0x2b2350);
const birds = [];
function makeBird() {
  const b = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), birdMat);
  body.scale.set(1, 0.7, 1.6);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.2, 6), lambert(0xffb347));
  beak.rotation.x = -Math.PI / 2;
  beak.position.z = -0.4;
  b.add(body, beak);
  const wings = [];
  for (const side of [-1, 1]) {
    const pivot = new THREE.Group();
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.04, 0.3), birdMat);
    wing.position.x = side * 0.35;
    pivot.add(wing);
    b.add(pivot);
    wings.push({ pivot, side });
  }
  b.userData.wings = wings;
  return b;
}
const flock = new THREE.Group();
for (let i = 0; i < 11; i++) {
  const b = makeBird();
  b.userData.phase = Math.random() * 6;
  flock.add(b);
  birds.push(b);
}
function arrangeFlock() {
  // a random number of birds in a loose V, each a little different
  const n = 2 + Math.floor(Math.random() * 10);
  birds.forEach((b, i) => {
    b.visible = i < n;
    const row = Math.ceil(i / 2), side = i % 2 ? 1 : -1;
    b.position.set(side * row * (1.1 + Math.random() * 0.6), Math.random() * 1.5 - row * 0.2, row * (1.2 + Math.random() * 0.8));
    b.scale.setScalar(0.8 + Math.random() * 0.5);
  });
}
flock.visible = false;
scene.add(flock);
let flockT = 6, flockDir = 1;

// an aeroplane high up, drawing two white contrails
const planeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false });
const planeTrim = new THREE.MeshBasicMaterial({ color: 0xff5d73, fog: false });
const plane = new THREE.Group();
const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.35, 6, 10), planeMat);
fuselage.rotation.z = Math.PI / 2;
const nose = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8), planeMat);
nose.position.x = 3;
const mainWing = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 7), planeMat);
const tailFin = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.5, 0.12), planeTrim);
tailFin.position.set(-2.6, 0.8, 0);
const tailWing = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.1, 2.4), planeMat);
tailWing.position.x = -2.6;
const planeStripe = new THREE.Mesh(new THREE.CylinderGeometry(0.51, 0.45, 2.5, 10), planeTrim);
planeStripe.rotation.z = Math.PI / 2;
planeStripe.position.x = 0.4;
plane.add(fuselage, nose, mainWing, tailFin, tailWing, planeStripe);
plane.visible = false;
scene.add(plane);
const trailGeo = new THREE.CylinderGeometry(0.3, 0.3, 1, 8, 1, true);
trailGeo.rotateZ(Math.PI / 2); // lie along x
// two sets so an old contrail can linger while the next plane draws a new one
const trailSets = [0, 1].map(() => {
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, fog: false, depthWrite: false });
  const lines = [-1.8, 1.8].map(dz => {
    const m = new THREE.Mesh(trailGeo, mat);
    m.visible = false;
    m.userData.dz = dz;
    scene.add(m);
    return m;
  });
  return { mat, lines, startX: 0, endX: 0, y: 0, z: 0, age: -1, live: false };
});
let trailNow = 0;
let planeT = 9, planeDir = 1;
function drawTrail(t) {
  const len = Math.abs(t.endX - t.startX);
  const spread = t.live ? 1 : 1 + t.age * 0.12;
  for (const m of t.lines) {
    m.visible = !awayFromTown && len > 0.5 && t.mat.opacity > 0.01;
    m.scale.set(Math.max(0.01, len), spread, spread);
    m.position.set((t.startX + t.endX) / 2, t.y - 0.1, t.z + m.userData.dz);
  }
}

function updateSky(dt) {
  // birds
  flockT -= dt;
  if (!awayFromTown && !flock.visible && flockT <= 0) {
    flockDir = Math.random() < 0.5 ? 1 : -1;
    arrangeFlock();
    const far = Math.random();
    flock.position.set(-flockDir * (45 + far * 30), 14 + Math.random() * 16, -35 - far * 50);
    flock.rotation.y = flockDir > 0 ? -Math.PI / 2 : Math.PI / 2;
    flock.visible = true;
  }
  if (flock.visible) {
    flock.position.x += flockDir * dt * 7;
    flock.position.y += Math.sin(performance.now() / 700) * dt * 0.5;
    for (const b of birds) {
      b.userData.phase += dt * 10;
      for (const w of b.userData.wings) w.pivot.rotation.z = w.side * Math.sin(b.userData.phase) * 0.7;
    }
    if (Math.abs(flock.position.x) > 80) { flock.visible = false; flockT = 6 + Math.random() * 12; }
  }
  // plane and contrails
  planeT -= dt;
  if (!awayFromTown && !plane.visible && planeT <= 0) {
    planeDir = Math.random() < 0.5 ? 1 : -1;
    plane.position.set(-planeDir * 110, 34 + Math.random() * 10, -110 - Math.random() * 25);
    plane.rotation.y = planeDir > 0 ? 0 : Math.PI;
    plane.visible = true;
    const t = trailSets[trailNow = (trailNow + 1) % 2];
    t.startX = t.endX = plane.position.x - planeDir * 3;
    t.y = plane.position.y; t.z = plane.position.z;
    t.live = true; t.age = 0; t.mat.opacity = 0.8;
  }
  if (plane.visible) {
    plane.position.x += planeDir * dt * 12;
    trailSets[trailNow].endX = plane.position.x - planeDir * 3.5;
    if (Math.abs(plane.position.x) > 115) {
      plane.visible = false;
      trailSets[trailNow].live = false;
      planeT = 14 + Math.random() * 16;
    }
  }
  for (const t of trailSets) {
    if (t.age < 0) continue;
    if (!t.live) {
      // after the plane has gone, the contrail lingers for about half a minute, spreading out as it fades
      t.age += dt;
      t.mat.opacity = Math.max(0, 0.8 - t.age / 35);
      if (t.mat.opacity <= 0) t.age = -1;
    }
    drawTrail(t);
  }
}
