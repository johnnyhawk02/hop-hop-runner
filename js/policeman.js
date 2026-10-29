// Hop Hop Runner: The policeman chasing her.

// ---------- the policeman ----------
const cop = new THREE.Group();
// a friendly British bobby: tall helmet, hi-vis vest and a big bushy moustache
const uniform = lambert(0x1c2a5e), bootMat = lambert(0x15151a), copSkin = lambert(0xf0c09a);
const hiVis = new THREE.MeshLambertMaterial({ color: 0xd9ff3d, emissive: 0x3a4a00 });
const silver = new THREE.MeshLambertMaterial({ color: 0xe8ecf5, emissive: 0x3a3e48 });
function roundLimb(mat, len, r, x, y, end) {
  const pivot = new THREE.Group();
  pivot.position.set(x, y, 0);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.9, len, 10), mat);
  m.position.y = -len / 2;
  pivot.add(m, ball(r, mat, 0, 0, 0, 10));
  if (end) pivot.add(end);
  cop.add(pivot);
  return pivot;
}
const copTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.33, 0.82, 16), uniform);
copTorso.scale.z = 0.68; copTorso.position.y = 1.2;
const vest = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.35, 0.58, 16), hiVis);
vest.scale.z = 0.7; vest.position.y = 1.3;
const stripes = [1.18, 1.38].map(y => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.385, 0.375, 0.05, 16), silver); m.scale.z = 0.71; m.position.y = y; return m; });
// POLICE across his back, where we see it
const policeTex = canvasTexture(256, 64, (ctx, w, h) => {
  ctx.fillStyle = '#1c2a5e'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 44px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('POLICE', w / 2, h / 2 + 2);
});
const backPatch = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.13), new THREE.MeshBasicMaterial({ map: policeTex }));
backPatch.position.set(0, 1.5, 0.268);
const badge = new THREE.Mesh(starPickGeo, silver);
badge.scale.setScalar(0.12); badge.position.set(0.16, 1.48, -0.27); badge.rotation.y = Math.PI;
const radio = box(0.1, 0.16, 0.06, bootMat, -0.2, 1.52, -0.27);
const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.345, 0.345, 0.1, 16), bootMat);
belt.scale.z = 0.7; belt.position.y = 0.86;
const buckle = box(0.12, 0.08, 0.03, silver, 0, 0.86, -0.25);
const copNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.14, 10), copSkin);
copNeck.position.y = 1.66;
// his face, painted on like Robyn's: a bit cross, and crosser still when he turns round to glare
function paintCopFace(ctx, w, h, glare) {
  ctx.fillStyle = '#f0c09a'; ctx.fillRect(0, 0, w, h);
  const cx = 384, cy = 136;
  ctx.fillStyle = 'rgba(255,120,120,0.3)';
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(cx + sx * 48, cy + 20, 14, 0, Math.PI * 2); ctx.fill(); }
  for (const sx of [-1, 1]) {
    const ex = cx + sx * 27, ey = cy;
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(ex, ey, 9, glare ? 7 : 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2a3b6a'; ctx.beginPath(); ctx.arc(ex - sx * 1.5, ey + 1, 5.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(ex - sx * 1.5, ey + 1, 2.8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex - sx * 1.5 - 2, ey - 2, 1.6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#4a2e1c'; ctx.lineWidth = 6; ctx.lineCap = 'round'; // eyebrows tipped down in a frown
    const tilt = glare ? 9 : 5;
    ctx.beginPath(); ctx.moveTo(ex + sx * 13, ey - 17 - tilt); ctx.lineTo(ex - sx * 11, ey - 14 + tilt * 0.4); ctx.stroke();
  }
  ctx.fillStyle = '#e39a78'; ctx.beginPath(); ctx.ellipse(cx, cy + 14, 9, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#4a2e1c'; // a bushy moustache
  ctx.beginPath(); ctx.moveTo(cx, cy + 21);
  ctx.bezierCurveTo(cx - 14, cy + 16, cx - 32, cy + 20, cx - 38, cy + 30); ctx.bezierCurveTo(cx - 28, cy + 31, cx - 15, cy + 29, cx, cy + 27);
  ctx.bezierCurveTo(cx + 15, cy + 29, cx + 28, cy + 31, cx + 38, cy + 30); ctx.bezierCurveTo(cx + 32, cy + 20, cx + 14, cy + 16, cx, cy + 21); ctx.fill();
  ctx.strokeStyle = '#a3324a'; ctx.lineWidth = 3; ctx.lineCap = 'round'; // a grumpy little mouth
  ctx.beginPath(); ctx.arc(cx, cy + 44, glare ? 9 : 8, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke();
}
const copFaceTex = canvasTexture(512, 256, (ctx, w, h) => paintCopFace(ctx, w, h, false));
const copGlareTex = canvasTexture(512, 256, (ctx, w, h) => paintCopFace(ctx, w, h, true));
const copHead = new THREE.Mesh(new THREE.SphereGeometry(0.31, 28, 20), new THREE.MeshLambertMaterial({ map: copFaceTex, emissive: 0xffffff, emissiveMap: copFaceTex, emissiveIntensity: 0.3 }));
copHead.position.y = 1.9;
const copEarL = ball(0.07, copSkin, -0.31, 1.88, 0), copEarR = ball(0.07, copSkin, 0.31, 1.88, 0);
const copHair = new THREE.Mesh(new THREE.SphereGeometry(0.322, 24, 12, -0.2 * Math.PI, 1.4 * Math.PI, 0.3 * Math.PI, 0.3 * Math.PI), hairMat); // round the sides, under the helmet
copHair.position.y = 1.9;
const copNape = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 10, 0, Math.PI, 0.3 * Math.PI, 0.45 * Math.PI), hairMat); // and down the back to his neck
copNape.position.y = 1.9;
// the custodian helmet
const helmetPts = [[0.0001, 0.64], [0.06, 0.64], [0.07, 0.58], [0.17, 0.53], [0.27, 0.43], [0.32, 0.28], [0.34, 0.1], [0.345, 0.02], [0.37, 0]].map(([x, y]) => new THREE.Vector2(x, y));
const copHelmet = new THREE.Mesh(new THREE.LatheGeometry(helmetPts, 20), new THREE.MeshLambertMaterial({ color: 0x141c3a, side: THREE.DoubleSide }));
copHelmet.position.y = 1.97;
const peak = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.025, 20, 1, false, Math.PI / 2, Math.PI), copHelmet.material);
peak.position.set(0, 1.975, -0.02); peak.rotation.x = 0.12; // the little peak over his eyes
const helmetStar = new THREE.Mesh(starPickGeo, silver);
helmetStar.scale.setScalar(0.16); helmetStar.position.set(0, 2.2, -0.31); helmetStar.rotation.set(-0.2, Math.PI, 0);
const knob = ball(0.05, silver, 0, 2.63, 0, 8);
const chin = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.015, 6, 20, Math.PI), bootMat);
chin.position.set(0, 1.95, -0.06); chin.rotation.set(0.35, 0, Math.PI); // the strap runs under his chin, ear to ear
cop.add(copTorso, vest, ...stripes, backPatch, badge, radio, belt, buckle, copNeck, copHead, copEarL, copEarR, copHair, copNape, copHelmet, peak, helmetStar, knob);
const boot = () => { const b = ball(0.16, bootMat, 0, -0.72, -0.06, 10); b.scale.set(0.95, 0.6, 1.35); return b; };
const hand = () => ball(0.1, copSkin, 0, -0.62, 0, 10);
const copLegL = roundLimb(uniform, 0.7, 0.12, -0.16, 0.8, boot());
const copLegR = roundLimb(uniform, 0.7, 0.12, 0.16, 0.8, boot());
const copArmL = roundLimb(uniform, 0.58, 0.09, -0.44, 1.56, hand());
const copArmR = roundLimb(uniform, 0.58, 0.09, 0.44, 1.56, hand());
copArmL.rotation.z = -0.12; copArmR.rotation.z = 0.12;
cop.position.set(0, 0, 16);
scene.add(cop);
