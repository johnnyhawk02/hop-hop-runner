// Hop Hop Runner: The lands the purple portal takes her to (colour themes).

// ---------- lands the portal can take her to ----------
const themes = [
  { name: 'Sunny Town', sky: 0x8fd8ff, grass: 0x7fd36b, track: 0xe8c48f, hills: [0x5cc46e, 0x4bb36a, 0x6fd07a] },
  { name: 'Candy Land', sky: 0xffc8ef, grass: 0x9df0c8, track: 0xfff0b3, hills: [0x7fe3b8, 0xff9ed8, 0x8ff0c4] },
  { name: 'Sunset Valley', sky: 0xffb38a, grass: 0xa8c86a, track: 0xf0c9a0, hills: [0x8fb85a, 0xd98a5a, 0x9cc46a] },
  { name: 'Starry Night', sky: 0x4b4fae, grass: 0x3f9e6e, track: 0xc9ae8a, hills: [0x2f7d5a, 0x368d62, 0x4aa877] },
  { name: 'Space', sky: 0x140f3a, grass: 0x6d7299, track: 0xb7bad6, hills: [0x4d5280, 0x5d6290, 0x3f4470] }, // only through the golden gate
  { name: 'Under the Sea', sky: 0x1f86c0, grass: 0xe6d29c, track: 0xf2e2b2, hills: [0xff7f9e, 0xff9f5c, 0x6fd6c8] }, // only through the bubble portal
  { name: 'Spooky World', sky: 0x2b1a4a, grass: 0x3d3352, track: 0x9a8aa8, hills: [0x4a2f6b, 0x2b2238, 0x5a3a7a] }, // only through the ghost portal
  { name: 'Fun Fair', sky: 0xffc6e4, grass: 0x8ee07a, track: 0xf2d29b, hills: [0xff9ed8, 0xffd23f, 0x9fe8ff] }, // only through the fairground portal
];
let themeIndex = 0;
function applyTheme(i) {
  themeIndex = i;
  const hallow = halloween && i < SPACE;
  const t = hallow ? { sky: 0x4a2a6e, grass: 0x3a3048, track: 0xa8703a, hills: [0xff7518, 0x6a2fb0, 0x2b2238] } : themes[i]; // Halloween colours
  scene.background.setHex(t.sky);
  scene.fog.color.setHex(t.sky);
  grass.material.color.setHex(t.grass);
  track.material.color.setHex(t.track);
  hillMats.forEach((m, k) => m.color.setHex(t.hills[k]));
  inSpace = i === SPACE;
  inSea = i === UNDER;
  inSpooky = i === SPOOKY;
  inFair = i === FAIR;
  awayFromTown = inSpace || inSea || inSpooky || inFair;
  fairWorld.visible = inFair;
  stars.visible = i === 3 || inSpace || inSpooky || hallow;
  rainbow.visible = (i === 0 || i === 1) && !hallow;
  sun.visible = sunGlow.visible = !awayFromTown && !hallow;
  spookyWorld.visible = inSpooky;
  hallowGroup.visible = inSpooky || hallow;
  witchHat.visible = inSpooky || hallow;
  for (const o of spookyProps) o.visible = inSpooky;
  for (const p of pumpkins) { p.visible = inSpooky || hallow; placePumpkin(p, p.position.z); }
  planets.visible = inSpace;
  mountains.visible = inSpace;
  helmet.visible = inSpace || inSea;
  for (const c of clouds) c.visible = !awayFromTown && !hallow;
  hemiLight.color.setHex(hallow || inSpooky ? 0xd8c0ff : 0xffffff); // a purple dusk glow
  sunLight.color.setHex(hallow || inSpooky ? 0xffb37a : 0xfff1d0);
  for (const f of fences) f.visible = !awayFromTown;
  for (const t of terraces) t.visible = !awayFromTown;
  for (const c of cottages) c.visible = !awayFromTown;
  for (const o of spaceProps) o.visible = inSpace;
  for (const o of seaProps) o.visible = inSea;
  seaWorld.visible = inSea;
  scene.fog.near = inSea ? 22 : inSpooky ? 30 : 50;
  scene.fog.far = inSea ? 115 : inSpooky ? 125 : 140;
  sfx.muffle(inSea);
  if (awayFromTown) { flock.visible = false; plane.visible = false; }
  ufo.visible = false;
}

const blob = new THREE.Mesh(new THREE.CircleGeometry(0.45, 20), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22 }));
blob.rotation.x = -Math.PI / 2;
blob.position.y = 0.05;
scene.add(blob);
