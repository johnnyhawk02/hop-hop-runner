// Hop Hop Runner: Coins, portals, speed portals and mystery boxes.

// ---------- coins ----------
const coinGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.09, 18);
coinGeo.rotateX(Math.PI / 2);
const coinMat = new THREE.MeshLambertMaterial({ color: 0xffd23f, emissive: 0x7a5200 });
let coins = [];
function addCoin(li, z, y) {
  const c = new THREE.Mesh(coinGeo, coinMat);
  c.position.set(LANES[li], y, z);
  scene.add(c);
  coins.push(c);
}
function coinLine(li, z, n, y, gap = 2) {
  for (let k = 0; k < n; k++) addCoin(li, z - k * gap, y);
}
function coinArc(li, z, y0 = 0) {
  // a hop-shaped arc of coins over something she jumps
  for (let k = -3; k <= 3; k++) addCoin(li, z - k * 1.5, y0 + 0.8 + 1.0 * (1 - (k / 3) * (k / 3)));
}

// ---------- portal ----------
const swirlTex = canvasTexture(128, 128, (ctx, w, h) => {
  const g = ctx.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, '#d7a8ff'); g.addColorStop(1, '#6a2fd1');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 5;
  for (let a = 0; a < 4; a++) {
    ctx.beginPath();
    for (let t = 0; t < 1; t += 0.02) {
      const r = t * w / 2, th = a * Math.PI / 2 + t * 5;
      ctx.lineTo(w / 2 + Math.cos(th) * r, h / 2 + Math.sin(th) * r);
    }
    ctx.stroke();
  }
});
const signCache = {};
function portalSign(emoji, ring) {
  const tex = signCache[emoji] || (signCache[emoji] = canvasTexture(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(64, 64, 58, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 8; ctx.strokeStyle = ring; ctx.stroke();
    ctx.font = '72px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(emoji, 64, 70);
  }));
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthWrite: false }));
  sp.scale.setScalar(1.1);
  sp.position.y = 3.4;
  return sp;
}
function makePortal() {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.18, 10, 32), new THREE.MeshBasicMaterial({ color: 0xc77dff }));
  ring.position.y = 1.35;
  const swirl = new THREE.Mesh(new THREE.CircleGeometry(1.0, 32), new THREE.MeshBasicMaterial({ map: swirlTex, transparent: true, opacity: 0.9, side: THREE.DoubleSide }));
  swirl.position.y = 1.35;
  const glow = new THREE.Mesh(new THREE.CircleGeometry(1.7, 32), new THREE.MeshBasicMaterial({ color: 0xe6c8ff, transparent: true, opacity: 0.35, side: THREE.DoubleSide }));
  glow.position.set(0, 1.35, -0.05);
  g.add(glow, ring, swirl, portalSign('🌈', '#c77dff'));
  g.userData = { portal: true, halfW: 0.9, halfD: 0.5, height: 0, base: 0, swirl };
  return g;
}

// ---------- speed portal: golden ring that zooms her along ----------
const zoomTex = canvasTexture(128, 128, (ctx, w, h) => {
  const g = ctx.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, '#ffe27a'); g.addColorStop(1, '#ff8c1a');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  // chevrons pointing forward
  ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 9; ctx.lineCap = 'round';
  for (const y of [40, 66, 92]) { ctx.beginPath(); ctx.moveTo(34, y + 14); ctx.lineTo(64, y - 10); ctx.lineTo(94, y + 14); ctx.stroke(); }
});
function makeZoomPortal() {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.2, 10, 32), new THREE.MeshBasicMaterial({ color: 0xffb020 }));
  ring.position.y = 1.35;
  const swirl = new THREE.Mesh(new THREE.CircleGeometry(1.0, 32), new THREE.MeshBasicMaterial({ map: zoomTex, transparent: true, opacity: 0.92, side: THREE.DoubleSide }));
  swirl.position.y = 1.35;
  const glow = new THREE.Mesh(new THREE.CircleGeometry(1.75, 32), new THREE.MeshBasicMaterial({ color: 0xfff1a8, transparent: true, opacity: 0.4, side: THREE.DoubleSide }));
  glow.position.set(0, 1.35, -0.05);
  g.add(glow, ring, swirl);
  g.userData = { zoomPortal: true, halfW: 0.9, halfD: 0.5, height: 0, base: 0, ring };
  return g;
}

// ---------- mystery box ----------
const mysteryTex = canvasTexture(128, 128, (ctx, w, h) => {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#ff5dc8'); g.addColorStop(0.5, '#9b5de5'); g.addColorStop(1, '#5ee7ff');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 10; ctx.strokeRect(5, 5, w - 10, h - 10);
  ctx.font = '900 92px "Lilita One", "Arial Rounded MT Bold", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = 10; ctx.strokeStyle = '#2b2350'; ctx.strokeText('?', w / 2, h / 2 + 6);
  ctx.fillStyle = '#ffffff'; ctx.fillText('?', w / 2, h / 2 + 6);
});
const mysteryMat = new THREE.MeshLambertMaterial({ map: mysteryTex, emissive: 0x3a1a55 });
const starGeo = new THREE.OctahedronGeometry(0.12, 0);
function makeMysteryBox() {
  const g = new THREE.Group();
  const cube = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), mysteryMat);
  cube.position.y = 1.25;
  const orbit = new THREE.Group();
  orbit.position.y = 1.25;
  for (let k = 0; k < 3; k++) {
    const st = new THREE.Mesh(starGeo, new THREE.MeshBasicMaterial({ color: [0xffd23f, 0xffffff, 0x5ee7ff][k] }));
    st.position.set(Math.cos(k * 2.1) * 0.85, (k - 1) * 0.3, Math.sin(k * 2.1) * 0.85);
    orbit.add(st);
  }
  g.add(cube, orbit);
  g.userData = { mystery: true, halfW: 0.7, halfD: 0.7, height: 0, base: 0, cube, orbit, t: Math.random() * 6 };
  return g;
}
// boxes that have been hit spin fast, swell and vanish
