// Hop Hop Runner: The Fun Fair.

// ---------- the Fun Fair: big rides either side, through the fairground portal ----------
const FAIR = 7;
const fairWorld = new THREE.Group();
fairWorld.visible = false;
scene.add(fairWorld);
const fairStripes = (a, b, n, vertical = true) => canvasTexture(256, 256, (ctx, w, h) => {
  for (let k = 0; k < n; k++) { ctx.fillStyle = k % 2 ? b : a; if (vertical) ctx.fillRect(k * w / n, 0, w / n + 1, h); else ctx.fillRect(0, k * h / n, w, h / n + 1); }
});
const redWhite = fairStripes('#ff4d6d', '#ffffff', 12), yellowRed = fairStripes('#ffd23f', '#ff4d6d', 10), blueWhite = fairStripes('#3fa9ff', '#ffffff', 12), purpleYellow = fairStripes('#9b5de5', '#ffd23f', 12);
const bulbMats = [0xffe45c, 0xff6fb5, 0x6fe8ff, 0xffffff].map(c => new THREE.MeshBasicMaterial({ color: c }));
const bulbGeo = new THREE.SphereGeometry(0.13, 6, 4);
const fairBulb = (k, x, y, z) => { const m = new THREE.Mesh(bulbGeo, bulbMats[k % 4]); m.position.set(x, y, z); return m; };
const steel = lambert(0xf2f2f7), fairGold = new THREE.MeshLambertMaterial({ color: 0xffd23f, emissive: 0x6a4a00 });
const rideCols = [0xff4d6d, 0xffd23f, 0x3fa9ff, 0x7dff9a, 0xc77dff, 0xff9f1c].map(c => lambert(c));
function makeFerris() {
  const g = new THREE.Group(), R = 8, hub = R + 1.6;
  const wheel = new THREE.Group(); wheel.position.y = hub;
  for (const z of [-0.6, 0.6]) {
    const rim = new THREE.Mesh(new THREE.TorusGeometry(R, 0.14, 6, 48), steel); rim.position.z = z; wheel.add(rim);
    const inner = new THREE.Mesh(new THREE.TorusGeometry(R * 0.55, 0.1, 6, 36), steel); inner.position.z = z; wheel.add(inner);
  }
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    const sp = box(0.12, R, 0.12, steel, Math.cos(a) * R / 2, Math.sin(a) * R / 2, 0); sp.rotation.z = a - Math.PI / 2; wheel.add(sp);
  }
  for (let k = 0; k < 36; k++) { const a = (k / 36) * Math.PI * 2; wheel.add(fairBulb(k, Math.cos(a) * R, Math.sin(a) * R, -0.75)); }
  wheel.add(ball(0.6, fairGold, 0, 0, 0, 12));
  const gondolas = [];
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2, gp = new THREE.Group();
    gp.position.set(Math.cos(a) * R, Math.sin(a) * R, 0);
    const cab = box(1.2, 1.0, 1.0, rideCols[k % rideCols.length], 0, -1.0, 0);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.85, 0.5, 4), rideCols[(k + 2) % rideCols.length]); roof.rotation.y = Math.PI / 4; roof.position.y = -0.3;
    gp.add(box(0.06, 0.6, 0.06, steel, 0, -0.3, 0), cab, roof);
    wheel.add(gp); gondolas.push(gp);
  }
  for (const z of [-1.3, 1.3]) for (const sx of [-1, 1]) {
    const leg = box(0.3, hub + 0.6, 0.3, steel, sx * 2.6, hub / 2, z); leg.rotation.z = sx * 0.27; g.add(leg);
  }
  g.add(wheel);
  g.userData = { ride: 'ferris', wheel, gondolas, big: true };
  return g;
}
function makeHorse(mat) {
  const h = new THREE.Group();
  h.add(box(0.35, 0.4, 1.0, lambert(0xffffff), 0, 0, 0), box(0.37, 0.12, 0.4, mat, 0, 0.22, 0.05));
  const neck = box(0.25, 0.55, 0.28, lambert(0xffffff), 0, 0.3, -0.45); neck.rotation.x = 0.4; h.add(neck);
  h.add(box(0.24, 0.24, 0.45, lambert(0xffffff), 0, 0.55, -0.65), box(0.08, 0.3, 0.3, mat, 0, 0.55, -0.4)); // head and mane
  for (const [x, z] of [[-0.12, -0.38], [0.12, -0.38], [-0.12, 0.38], [0.12, 0.38]]) { const l = box(0.08, 0.4, 0.08, lambert(0xffffff), x, -0.35, z); l.rotation.x = z < 0 ? -0.5 : 0.5; h.add(l); }
  return h;
}
function makeCarousel() {
  const g = new THREE.Group();
  const spin = new THREE.Group();
  spin.add(new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.4, 0.5, 24), lambert(0xc77dff)));
  spin.children[0].position.y = 0.4;
  const canopy = new THREE.Mesh(new THREE.ConeGeometry(4.8, 2.2, 24, 1, true), new THREE.MeshLambertMaterial({ map: redWhite, side: THREE.DoubleSide }));
  canopy.position.y = 5.3;
  const valance = new THREE.Mesh(new THREE.CylinderGeometry(4.8, 4.8, 0.6, 24, 1, true), new THREE.MeshLambertMaterial({ map: yellowRed, side: THREE.DoubleSide }));
  valance.position.y = 3.9;
  spin.add(canopy, valance, new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 4, 12), new THREE.MeshLambertMaterial({ map: purpleYellow })), ball(0.35, fairGold, 0, 6.5, 0, 10));
  spin.children[spin.children.length - 2].position.y = 2.6;
  for (let k = 0; k < 24; k++) { const a = (k / 24) * Math.PI * 2; spin.add(fairBulb(k, Math.cos(a) * 4.85, 3.6, Math.sin(a) * 4.85)); }
  const horses = [];
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.4, 6), fairGold);
    pole.position.set(Math.cos(a) * 3.1, 2.4, Math.sin(a) * 3.1);
    const hs = makeHorse(rideCols[k % rideCols.length]);
    hs.position.set(Math.cos(a) * 3.1, 1.8, Math.sin(a) * 3.1); hs.rotation.y = -a;
    hs.userData.phase = k * 0.8;
    spin.add(pole, hs); horses.push(hs);
  }
  g.add(spin);
  g.userData = { ride: 'carousel', spin, horses };
  return g;
}
function makeHelter() {
  const g = new THREE.Group(), H = 11;
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.6, H, 16), new THREE.MeshLambertMaterial({ map: redWhite }));
  tower.position.y = H / 2;
  const top = new THREE.Mesh(new THREE.ConeGeometry(2.0, 2.6, 16), new THREE.MeshLambertMaterial({ map: yellowRed }));
  top.position.y = H + 1.3;
  const flag = box(0.9, 0.5, 0.04, rideCols[2], 0.45, H + 3.4, 0);
  g.add(tower, top, box(0.06, 1.2, 0.06, steel, 0, H + 3.1, 0), flag);
  const turns = 3, pts = [];
  for (let k = 0; k <= 90; k++) { const u = k / 90, a = u * turns * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * 2.3, H - 0.8 - u * (H - 1.4), Math.sin(a) * 2.3)); }
  const curve = new THREE.CatmullRomCurve3(pts);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 160, 0.4, 8, false), new THREE.MeshLambertMaterial({ color: 0xffd23f, side: THREE.DoubleSide })));
  const rider = new THREE.Group(); // someone whizzing down on a mat
  rider.add(box(0.5, 0.08, 0.8, rideCols[4], 0, 0, 0), ball(0.2, lambert(0xf3c39b), 0, 0.45, 0, 8), box(0.3, 0.35, 0.25, rideCols[0], 0, 0.2, 0));
  g.add(rider);
  for (let k = 0; k < 14; k++) g.add(fairBulb(k, Math.cos(k * 0.45) * 2.05, H + 0.05, Math.sin(k * 0.45) * 2.05));
  g.userData = { ride: 'helter', curve, rider, phase: Math.random() };
  return g;
}
function makeCoaster() {
  const g = new THREE.Group(), pts = [];
  for (let k = 0; k < 40; k++) {
    const a = (k / 40) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * 6, 3.5 + Math.max(0, Math.sin(a)) * 7 + Math.sin(a * 3) * 1.6 + 1.6, Math.sin(a) * 13));
  }
  const curve = new THREE.CatmullRomCurve3(pts, true);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 200, 0.22, 6, true), lambert(0xff4d6d)));
  const inner = new THREE.CatmullRomCurve3(pts.map(v => new THREE.Vector3(v.x * 0.88, v.y, v.z * 0.94)), true);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(inner, 200, 0.22, 6, true), lambert(0xff4d6d)));
  for (let k = 0; k < 40; k += 2) {
    const v = pts[k], h = v.y;
    g.add(box(0.2, h, 0.2, steel, v.x * 0.94, h / 2, v.z * 0.97));
    g.add(fairBulb(k, v.x * 0.94, h + 0.25, v.z * 0.97));
  }
  const cars = [];
  for (let k = 0; k < 4; k++) {
    const c = new THREE.Group();
    c.add(box(1.0, 0.55, 1.3, rideCols[(k + 1) % rideCols.length], 0, 0.5, 0), ball(0.18, lambert(0xf3c39b), -0.2, 1.05, 0, 8), ball(0.18, lambert(0xf3c39b), 0.2, 1.05, 0, 8));
    g.add(c); cars.push(c);
  }
  g.userData = { ride: 'coaster', curve: new THREE.CatmullRomCurve3(pts.map(v => new THREE.Vector3(v.x * 0.94, v.y, v.z * 0.97)), true), cars, u: Math.random(), big: true };
  return g;
}
function makeSwings() {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 9, 12), new THREE.MeshLambertMaterial({ map: blueWhite })));
  g.children[0].position.y = 4.5;
  const spin = new THREE.Group(); spin.position.y = 9;
  const top = new THREE.Mesh(new THREE.ConeGeometry(3.6, 1.6, 20), new THREE.MeshLambertMaterial({ map: purpleYellow }));
  top.position.y = 0.6;
  spin.add(top);
  const seats = [];
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2, arm = new THREE.Group();
    arm.position.set(Math.cos(a) * 3.2, 0, Math.sin(a) * 3.2); arm.rotation.y = -a;
    const hang = new THREE.Group();
    hang.add(box(0.04, 3.2, 0.04, steel, 0, -1.6, 0), box(0.6, 0.12, 0.5, rideCols[k % rideCols.length], 0, -3.2, 0), ball(0.16, lambert(0xf3c39b), 0, -2.7, 0, 6));
    arm.add(hang); spin.add(arm); seats.push(hang);
    spin.add(fairBulb(k, Math.cos(a) * 3.55, 0, Math.sin(a) * 3.55));
  }
  g.add(spin);
  g.userData = { ride: 'swings', spin, seats };
  return g;
}
function makeStall() {
  const g = new THREE.Group();
  const tex = [redWhite, blueWhite, yellowRed, purpleYellow][Math.floor(Math.random() * 4)];
  g.add(box(2.4, 1.1, 1.6, lambert(0xfff3d6), 0, 0.55, 0), box(2.5, 0.12, 1.7, rideCols[Math.floor(Math.random() * 6)], 0, 1.15, 0));
  for (const sx of [-1, 1]) g.add(box(0.1, 2.0, 0.1, steel, sx * 1.15, 1.6, -0.75));
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.9, 1.2, 4), new THREE.MeshLambertMaterial({ map: tex }));
  roof.rotation.y = Math.PI / 4; roof.scale.z = 0.75; roof.position.y = 3.1;
  g.add(roof);
  if (Math.random() < 0.5) { // candy floss on sticks
    for (let k = 0; k < 3; k++) g.add(ball(0.25, lambert([0xff9ed8, 0x9fe8ff, 0xfff1a8][k]), -0.6 + k * 0.6, 1.6, -0.3, 10));
  } else { // balloons
    for (let k = 0; k < 4; k++) { const b = ball(0.3, rideCols[k], -0.8 + k * 0.5, 3.6 + (k % 2) * 0.4, -0.75, 10); b.scale.y = 1.2; g.add(b, box(0.02, 1.4, 0.02, steel, -0.8 + k * 0.5, 2.9, -0.75)); }
  }
  g.userData = { stall: true };
  return g;
}
const rideMakers = [makeFerris, makeCarousel, makeHelter, makeCoaster, makeSwings];
const RIDE_GAP = 30, RIDES_PER_SIDE = 5;
const rides = [], stalls = [];
function placeRide(o, z) {
  const side = o.userData.side;
  o.position.set(side * (o.userData.big ? 19 + Math.random() * 3 : 15 + Math.random() * 2), 0, z);
  o.rotation.y = o.userData.ride === 'ferris' ? side * 0.7 : o.userData.ride === 'coaster' ? 0 : Math.random() * Math.PI * 2; // the coaster runs alongside, well clear of the track
}
let rideK = 0;
for (let i = 0; i < RIDES_PER_SIDE * 2; i++) {
  const o = rideMakers[rideK++ % rideMakers.length]();
  o.userData.side = i % 2 ? 1 : -1;
  o.scale.setScalar(1.45); // big rides!
  placeRide(o, 0 - Math.floor(i / 2) * RIDE_GAP - (i % 2) * RIDE_GAP / 2);
  fairWorld.add(o); rides.push(o);
}
for (let i = 0; i < 16; i++) {
  const o = makeStall();
  o.userData.side = i % 2 ? 1 : -1;
  o.position.set(o.userData.side * (6.4 + Math.random() * 1.5), 0, 10 - Math.floor(i / 2) * 14 - (i % 2) * 7);
  o.rotation.y = -o.userData.side * Math.PI / 2; // facing the track
  fairWorld.add(o); stalls.push(o);
}
let bulbT = 0;
const tmpV = new THREE.Vector3();
function updateFair(dt, move) {
  if (!inFair) return;
  const t = performance.now() / 1000;
  bulbT += dt;
  if (bulbT > 0.3) { bulbT = 0; const c = bulbMats.map(m => m.color.getHex()); bulbMats.forEach((m, k) => m.color.setHex(c[(k + 1) % 4])); } // chasing lights
  for (const o of rides) {
    o.position.z += move;
    if (o.position.z > DESPAWN_Z + 25) placeRide(o, o.position.z - RIDES_PER_SIDE * RIDE_GAP);
    const u = o.userData;
    if (u.ride === 'ferris') { u.wheel.rotation.z += dt * 0.25; for (const gp of u.gondolas) gp.rotation.z = -u.wheel.rotation.z; }
    else if (u.ride === 'carousel') { u.spin.rotation.y += dt * 0.7; for (const h of u.horses) h.position.y = 1.8 + Math.sin(t * 2.5 + h.userData.phase) * 0.45; }
    else if (u.ride === 'helter') {
      u.phase = (u.phase + dt * 0.18) % 1;
      u.curve.getPointAt(u.phase, u.rider.position); u.rider.position.y += 0.45;
      u.curve.getTangentAt(u.phase, tmpV); u.rider.rotation.y = Math.atan2(tmpV.x, tmpV.z);
    } else if (u.ride === 'coaster') {
      u.u = (u.u + dt * 0.07) % 1;
      u.cars.forEach((c, k) => {
        const q = (u.u + k * 0.018) % 1;
        u.curve.getPointAt(q, c.position);
        u.curve.getTangentAt(q, tmpV);
        c.lookAt(c.position.x + tmpV.x, c.position.y + tmpV.y, c.position.z + tmpV.z);
      });
    } else if (u.ride === 'swings') {
      u.spin.rotation.y += dt * 1.4;
      for (const h of u.seats) h.rotation.z = -0.75 - Math.sin(t * 0.8) * 0.08; // swung out by the spin
    }
  }
  for (const o of stalls) {
    o.position.z += move;
    if (o.position.z > DESPAWN_Z + 3) o.position.set(o.userData.side * (6.4 + Math.random() * 1.5), 0, o.position.z - 112);
  }
}
// the fairground portal: a red and white striped ring with little lights going round
const fairSwirlTex = canvasTexture(256, 256, (ctx, w, h) => {
  const cols = ['#ff4d6d', '#ffd23f', '#3fa9ff', '#7dff9a', '#c77dff', '#ff9f1c'];
  for (let k = 0; k < 12; k++) { ctx.fillStyle = cols[k % 6]; ctx.beginPath(); ctx.moveTo(w / 2, h / 2); ctx.arc(w / 2, h / 2, w, (k / 12) * Math.PI * 2, ((k + 1) / 12) * Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(w / 2, h / 2, 24, 0, Math.PI * 2); ctx.fill();
});
function makeFairPortal() {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.22, 12, 36), new THREE.MeshLambertMaterial({ map: redWhite, emissive: 0x401018 }));
  ring.position.y = 1.5;
  const swirl = new THREE.Mesh(new THREE.CircleGeometry(1.15, 32), new THREE.MeshBasicMaterial({ map: fairSwirlTex, side: THREE.DoubleSide }));
  swirl.position.y = 1.5;
  const orbit = new THREE.Group(); orbit.position.y = 1.5;
  for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; orbit.add(fairBulb(k, Math.cos(a) * 1.62, Math.sin(a) * 1.62, 0)); }
  g.add(ring, swirl, orbit, portalSign('🎡', '#ff4d6d'));
  g.userData = { fairPortal: true, halfW: 0.9, halfD: 0.5, height: 0, base: 0, swirl, orbit };
  return g;
}
