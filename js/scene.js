// Hop Hop Runner: Renderer, camera, lights, the little-planet curve and the static ground.

// ---------- renderer / scene ----------
const mount = document.getElementById('game');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.localClippingEnabled = true; // lets the cottage gardens stop at the track fence
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
mount.appendChild(renderer.domElement);

// a little round planet: everything bends down and away with distance, like Subway Surfers.
// It's only how things are drawn, so jumping and bumping work just the same.
const CURVE = 0.0036;
const bend = '\n#ifndef NO_CURVE\nmvPosition.y -= ' + CURVE.toFixed(4) + ' * mvPosition.z * mvPosition.z;\n#endif\ngl_Position = projectionMatrix * mvPosition;';
THREE.ShaderChunk.project_vertex = THREE.ShaderChunk.project_vertex.replace('gl_Position = projectionMatrix * mvPosition;', bend);
THREE.ShaderLib.sprite.vertexShader = THREE.ShaderLib.sprite.vertexShader.replace('gl_Position = projectionMatrix * mvPosition;', bend);
// the bend happens at the corners of shapes, so long things (the ground, rails, tunnels) get cut into short pieces to curve smoothly
const BaseBox = THREE.BoxGeometry, BasePlane = THREE.PlaneGeometry, BaseCyl = THREE.CylinderGeometry;
THREE.BoxGeometry = class extends BaseBox { constructor(w = 1, h = 1, d = 1, ws = 1, hs = 1, ds = 1) { super(w, h, d, ws, Math.max(hs, Math.ceil(h / 4)), Math.max(ds, Math.ceil(d / 4))); } };
THREE.PlaneGeometry = class extends BasePlane { constructor(w = 1, h = 1, ws = 1, hs = 1) { super(w, h, Math.max(ws, Math.ceil(w / 8)), Math.max(hs, Math.ceil(h / 4))); } };
THREE.CylinderGeometry = class extends BaseCyl { constructor(rt = 1, rb = 1, h = 1, rs = 8, hs = 1, open = false, ts = 0, tl = Math.PI * 2) { super(rt, rb, h, rs, Math.max(hs, Math.ceil(h / 4)), open, ts, tl); } };
const scene = new THREE.Scene();
const SKY = 0x8fd8ff;
scene.background = new THREE.Color(SKY);
scene.fog = new THREE.Fog(SKY, 50, 140);

const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 240);
camera.position.set(0, 4.2, 7.5);
const shakeOff = new THREE.Vector3();

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8bd17c, 0.75);
scene.add(hemiLight);
const sunLight = new THREE.DirectionalLight(0xfff1d0, 0.65);
sunLight.position.set(-5, 10, 6);
scene.add(sunLight);

const lambert = (color) => new THREE.MeshLambertMaterial({ color });

function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 4;
  return t;
}

// ---------- static ground ----------
const grass = new THREE.Mesh(new THREE.PlaneGeometry(200, 260), lambert(0x7fd36b));
grass.rotation.x = -Math.PI / 2;
grass.position.set(0, -0.02, -100);
scene.add(grass);

const track = new THREE.Mesh(new THREE.PlaneGeometry(8.4, 260), lambert(0xe8c48f));
track.rotation.x = -Math.PI / 2;
track.position.set(0, 0, -100);
scene.add(track);

const railMat = lambert(0xb7b9d6);
for (const lx of LANES) {
  for (const side of [-0.55, 0.55]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 260), railMat);
    rail.position.set(lx + side, 0.12, -100);
    scene.add(rail);
  }
}
