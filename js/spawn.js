// Hop Hop Runner: Spawning rows of obstacles, coins, tunnels and climbs; the zoom autopilot.

// ---------- spawning ----------
function laneBusy(li, margin = 10) {
  // a lane is busy while a platform in it still reaches back past the spawn line
  return platforms.some(p => p.userData.lane === li && p.position.z - p.userData.length < SPAWN_Z + margin);
}
// a train in this lane still reaching back past the spawn line
const trainBusy = (li, margin = 30) => obstacles.some(o => o.userData.tall && Math.abs(o.position.x - LANES[li]) < 0.5 && o.position.z - o.userData.halfD < SPAWN_Z + margin);
// trains need a long run-up after a bridge so she has time to see them and move
const tallFree = () => [0, 1, 2].filter(li => !laneBusy(li, 35) && !trainBusy(li));
function addObstacle(o, li, z, base = 0) {
  o.position.set(LANES[li], base, z);
  o.userData.base = base;
  scene.add(o);
  obstacles.push(o);
}
function addPlatform(p, li) {
  p.position.set(LANES[li], 0, SPAWN_Z);
  p.userData.lane = li;
  scene.add(p);
  platforms.push(p);
}
function bridgeOpts(rails) {
  return { ramp: 4.5, height: 1.8, deck: 10 + Math.random() * 14, down: Math.random() < 0.6, rails };
}
function spawnStuff(free) {
  const r = Math.random();
  if (r < 0.25 && free.length === 3) {
    // a big bridge across all three lanes
    const opts = bridgeOpts([]);
    for (const li of [0, 1, 2]) {
      opts.rails = li === 0 ? [-1] : li === 2 ? [1] : [];
      addPlatform(makeBridge(opts), li);
    }
    coinLine(Math.floor(Math.random() * 3), SPAWN_Z - opts.ramp - 1, Math.floor(opts.deck / 2.2), opts.height + 0.8, 2.2);
  } else if (r < 0.6) {
    const li = free[Math.floor(Math.random() * free.length)];
    const b = makeBridge(bridgeOpts([-1, 1]));
    addPlatform(b, li);
    // sometimes a hay bale up on the deck to hop over
    const u = b.userData;
    if (u.deck > 14 && Math.random() < 0.5) {
      const hz = SPAWN_Z - u.ramp - u.deck * 0.6;
      addObstacle(makeHay(), li, hz, u.height);
      coinArc(li, hz, u.height);
    } else {
      coinLine(li, SPAWN_Z - u.ramp - 1, Math.floor(u.deck / 2.2), u.height + 0.8, 2.2);
    }
  } else if (r < 0.8) {
    const li = free[Math.floor(Math.random() * free.length)];
    addPlatform(makeLaunchRamp(), li);
    for (let k = 0; k < 7; k++) addCoin(li, SPAWN_Z - 4 - k * 1.8, 2.0 + Math.sin(k / 6 * Math.PI) * 1.6);
  } else {
    for (const li of free) {
      if (Math.random() < 0.6 || li === free[0]) {
        addObstacle(makePad(), li, SPAWN_Z);
        coinLine(li, SPAWN_Z - 3, 6, 3.6, 1.8); // up high, only reachable with a bounce
      }
    }
  }
}
// a tunnel over all three lanes, with lights along the ceiling
const tunnelMat = new THREE.MeshLambertMaterial({ color: 0x8f86b8, side: THREE.DoubleSide });
const tunnelFace = lambert(0xc96a4a);
const tunnelRim = lambert(0xffd23f);
const tunnelLampMat = new THREE.MeshBasicMaterial({ color: 0xfff3b0 });
const stripMats = [new THREE.MeshBasicMaterial({ color: 0xff5dc8 }), new THREE.MeshBasicMaterial({ color: 0x5ee7ff })];
let tunnels = [];
function tunnelFaceAt(z) {
  const f = new THREE.Group();
  for (const x of [-5.5, 5.5]) {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 10.4, 1.2), tunnelFace);
    pillar.position.set(x, 5.2, 0);
    f.add(pillar);
  }
  const top = new THREE.Mesh(new THREE.BoxGeometry(12.6, 2.6, 1.2), tunnelFace);
  top.position.y = 9.2;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(4.75, 0.45, 8, 24, Math.PI), tunnelRim);
  rim.position.y = 3;
  f.add(top, rim);
  f.position.z = z;
  return f;
}
function makeTunnel(len) {
  const g = new THREE.Group();
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(4.7, 4.7, len, 18, 1, true, Math.PI / 2, Math.PI), tunnelMat);
  roof.rotation.x = Math.PI / 2;
  roof.position.set(0, 3, -len / 2);
  g.add(roof);
  for (const side of [-1, 1]) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3, len), tunnelMat);
    wall.position.set(side * 4.7, 1.5, -len / 2);
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.25, len), stripMats[side < 0 ? 0 : 1]);
    strip.position.set(side * 4.45, 2.3, -len / 2);
    g.add(wall, strip);
  }
  for (let z = -3; z > -len; z -= 5) {
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.15, 0.7), tunnelLampMat);
    lamp.position.set(0, 7.55, z);
    g.add(lamp);
  }
  g.add(tunnelFaceAt(0.6), tunnelFaceAt(-len - 0.6));
  g.userData = { length: len };
  return g;
}
function spawnTunnel() {
  const len = 40 + Math.random() * 25;
  const t = makeTunnel(len);
  t.position.z = SPAWN_Z;
  scene.add(t);
  tunnels.push(t);
  coinLine(Math.floor(Math.random() * 3), SPAWN_Z - 4, Math.floor(len / 3), 0.8, 2.6);
  s.untilNext = 14;
}
// while a tunnel covers the spawn line, only low things and trains go in it (no bridges, pads or climbs)
const tunnelOverSpawn = () => tunnels.some(t => t.position.z - t.userData.length < SPAWN_Z + 12);

function spawnClimb() {
  // all three lanes climb together, two to four steps up, higher the further she has run
  const steps = Math.min(4, 2 + Math.floor(s.distance / 250) + (Math.random() < 0.5 ? 1 : 0));
  const decks = [];
  for (let k = 0; k < steps; k++) decks.push(7 + Math.random() * 4);
  for (const li of [0, 1, 2]) addPlatform(makeClimb(steps, decks, li === 0 ? [-1] : li === 2 ? [1] : []), li);
  // coins on every deck, and now and then a hay bale up top to hop
  let z = SPAWN_Z, h = 0;
  const coinLane = Math.floor(Math.random() * 3);
  for (let k = 0; k < steps; k++) {
    z -= 5; h += 1.8;
    coinLine(coinLane, z - 1, Math.floor(decks[k] / 2.2), h + 0.8, 2.2);
    if (k > 0 && Math.random() < 0.5) {
      const li = (coinLane + 1 + Math.floor(Math.random() * 2)) % 3;
      addObstacle(makeHay(), li, z - decks[k] / 2, h);
    }
    z -= decks[k];
  }
  s.untilNext = 30;
}
function spawnRow() {
  if (s.jet > 0) {
    // up in the sky: more coins while there's still time to reach them, nothing on the ground
    if (s.jet - 120 / Math.max(1, s.speed) > 0.4) skyCoins(SPAWN_Z, SPAWN_Z - 20);
    s.untilNext = 20;
    s.lastTall = false;
    return;
  }
  const free = [0, 1, 2].filter(li => !laneBusy(li) && !trainBusy(li, 4));
  const tun = tunnelOverSpawn();
  if (s.gateReady && !tun && tallFree().length === 3 && !obstacles.some(o => o.userData.spaceGate)) {
    addObstacle(makeSpaceGate(), 1, SPAWN_Z);
    coinLine(s.lane, SPAWN_Z + 24, 10, 0.8, 2.2);
    s.untilNext = 40;
    return;
  }
  if (!tun && s.distance > s.nextTunnel && free.length === 3) {
    spawnTunnel();
    s.nextTunnel = s.distance + 160 + Math.random() * 160;
    return;
  }
  if (!tun && s.distance > s.nextClimb && free.length === 3) {
    spawnClimb();
    s.nextClimb = s.distance + 200 + Math.random() * 180;
    return;
  }
  if (!tun && s.distance > s.nextZoom && tallFree().length === 3 && s.zoom <= 0) {
    addObstacle(makeZoomPortal(), Math.floor(Math.random() * 3), SPAWN_Z);
    s.nextZoom = s.distance + 250 + Math.random() * 150;
    s.untilNext = 30;
    return;
  }
  if (!tun && !s.gateReady && s.distance > s.nextCross && tallFree().length === 3) {
    // portal crossroads: a portal in each lane, each to a different world. She picks!
    const makers = [makePortal];
    if (!inSea) makers.push(makeSeaPortal);
    if (!inSpace) makers.push(makeStarPortal);
    if (!inSpooky) makers.push(makeGhostPortal);
    if (!inFair) makers.push(makeFairPortal);
    makers.sort(() => Math.random() - 0.5).splice(3);
    const lanes = [0, 1, 2].sort(() => Math.random() - 0.5);
    makers.forEach((mk, k) => { coinLine(lanes[k], SPAWN_Z + 12, 4, 0.8, 2.2); addObstacle(mk(), lanes[k], SPAWN_Z); });
    if (makers.length < 3) coinLine(lanes[2], SPAWN_Z + 12, 8, 0.8, 2.2);
    toast('Pick a portal!');
    s.nextCross = s.distance + 260 + Math.random() * 120;
    s.nextPortal = Math.max(s.nextPortal, s.distance + 100);
    s.nextSea = Math.max(s.nextSea, s.distance + 100);
    s.untilNext = 40;
    return;
  }
  if (!tun && !s.gateReady && s.distance > s.nextSea && tallFree().length === 3) {
    // the bubble portal sits in one lane at the end of a trail of coins: find it to dive under the sea
    const li = Math.floor(Math.random() * 3);
    coinLine(li, SPAWN_Z + 16, 7, 0.8, 2.2);
    const choices = [!inSea && makeSeaPortal, !inSpooky && makeGhostPortal, !inFair && makeFairPortal].filter(Boolean); // a bubble, ghost or fairground portal
    addObstacle(choices[Math.floor(Math.random() * choices.length)](), li, SPAWN_Z);
    s.nextSea = s.distance + 220 + Math.random() * 150; // missed it? another comes along
    s.untilNext = 40;
    return;
  }
  if (!tun && !s.gateReady && s.distance > s.nextPortal && tallFree().length === 3) {
    // the portal gets a row all to itself, in a random lane
    addObstacle(makePortal(), Math.floor(Math.random() * 3), SPAWN_Z);
    s.nextPortal = s.distance + 160 + Math.random() * 100; // missed it? another comes along
    s.untilNext = 40;
    return;
  }
  if (free.length === 3 && s.distance > 40 && Math.random() < 0.07) {
    // a wiggly trail of coins that weaves across the lanes
    const order = Math.random() < 0.5 ? [0, 1, 2, 1, 0, 1, 2] : [2, 1, 0, 1, 2, 1, 0];
    let z = SPAWN_Z;
    for (const li of order) { coinLine(li, z, 4, 0.8, 1.7); z -= 4 * 1.7 + 1.5; }
    s.lastTall = false;
    s.untilNext = SPAWN_Z - z + 8;
    return;
  }
  if (!tun && free.length && s.distance > 30 && Math.random() < 0.35) {
    spawnStuff(free);
  } else if (s.distance > 20 && !s.lastTall && Math.random() < 0.4 && tallFree().length) {
    // trains of 2 to 5 carriages; at least one lane always stays clear of trains
    const maxNew = 2 - [0, 1, 2].filter(li => trainBusy(li)).length;
    const lanes = tallFree().filter(li => !trainBusy(li)).sort(() => Math.random() - 0.5).slice(0, Math.min(maxNew, Math.random() < 0.6 ? 1 : 2));
    if (!lanes.length) { s.untilNext = 6; return; }
    const carLen = TRAIN_LEN * TRAIN_SCALE;
    for (const li of lanes) {
      const cars = 2 + Math.floor(Math.random() * 4);
      const color = trainMats[Math.floor(Math.random() * trainMats.length)];
      const rideable = Math.random() < 0.55;
      const ramp = rideable ? 8 : 0;
      if (rideable) {
        addPlatform(makeTrainRamp(ramp, carLen * cars), li);
        for (let d = 1; d < ramp + carLen * cars - 0.5; d += 1.8) addCoin(li, SPAWN_Z - d, Math.min(d / ramp, 1) * TRAIN_ROOF + 0.8);
      }
      const z0 = rideable ? SPAWN_Z - ramp - carLen / 2 : SPAWN_Z - 3;
      for (let c = 0; c < cars; c++) addObstacle(makeTrainCar(rideable, c === 0, c === cars - 1, color), li, z0 - c * carLen);
    }
    const open = [0, 1, 2].filter(li => !lanes.includes(li) && !trainBusy(li, 4) && !laneBusy(li));
    if (open.length) coinLine(open[Math.floor(Math.random() * open.length)], SPAWN_Z, 5, 0.8);
    s.lastTall = true;
    s.untilNext = s.speed * 2.0 + Math.random() * s.speed * 0.6 + 6;
    return;
  } else if (free.length) {
    const r = Math.random();
    let count = r < 0.5 ? 1 : r < 0.85 ? 2 : 3;
    if (s.distance < 150) count = Math.min(count, 2);
    const lanes = free.sort(() => Math.random() - 0.5).slice(0, count);
    for (const li of lanes) addObstacle(makers[Math.floor(Math.random() * makers.length)](), li, SPAWN_Z);
    if (Math.random() < 0.75) {
      const li = free[Math.floor(Math.random() * free.length)];
      if (lanes.includes(li)) coinArc(li, SPAWN_Z);
      else coinLine(li, SPAWN_Z + 3, 5, 0.8);
    }
    const open = free.filter(li => !lanes.includes(li));
    if (s.distance > s.nextBoard && s.board <= 0 && open.length) {
      addObstacle(makeBoardPickup(), open[0], SPAWN_Z - 4);
      s.nextBoard = s.distance + 150 + Math.random() * 120;
    } else if (s.distance > s.nextMagnet && s.magnet <= 0 && open.length) {
      addObstacle(makeMagnetPickup(), open[0], SPAWN_Z - 4);
      s.nextMagnet = s.distance + 160 + Math.random() * 120;
    } else if (s.distance > s.nextJet && s.jet <= 0 && !tunnels.length && open.length) {
      addObstacle(makeJetPickup(), open[0], SPAWN_Z - 4);
      s.nextJet = s.distance + 300 + Math.random() * 200;
    } else if (s.distance > s.nextStar && s.star <= 0 && open.length) {
      addObstacle(makeStarPickup(), open[open.length - 1], SPAWN_Z - 4);
      s.nextStar = s.distance + 280 + Math.random() * 200;
    } else if (s.distance > s.nextBox && open.length) {
      addObstacle(makeMysteryBox(), open[open.length - 1], SPAWN_Z - 5);
      s.nextBox = s.distance + 60 + Math.random() * 70;
    }
  }
  s.lastTall = false;
  // always leave room to land and jump again
  s.untilNext = s.speed * 1.5 + Math.random() * s.speed * 0.9;
}

// while zooming she steers and jumps by herself
const isHazard = (u) => !(u.portal || u.zoomPortal || u.boardPickup || u.magnetPickup || u.jetPickup || u.starPickup || u.spaceGate || u.seaPortal || u.starPortal || u.ghostPortal || u.fairPortal || u.pad || u.mystery);
function hazardIn(li, from, to) {
  let near = Infinity, tall = false;
  for (const o of obstacles) {
    const u = o.userData;
    if (!isHazard(u) || Math.abs(o.position.x - LANES[li]) > 0.5) continue;
    const ahead = -(o.position.z + (u.halfD || 0));
    if (ahead < from || ahead > to) continue;
    if (Math.abs(u.base - s.ground) > 1.0 && !u.tall) continue; // on a different level
    if (ahead < near) { near = ahead; tall = !!u.tall; }
  }
  return { near, tall };
}
function autoPilot() {
  const here = hazardIn(s.lane, -1, 30);
  if (here.near < 30 && (here.tall || here.near < 12)) {
    // pick the neighbouring lane that's clear the furthest
    let bestLane = s.lane, bestNear = here.near;
    for (const li of [s.lane - 1, s.lane + 1]) {
      if (li < 0 || li > 2) continue;
      const h = hazardIn(li, -3, 30);
      if (h.near > bestNear + 2) { bestLane = li; bestNear = h.near; }
    }
    if (bestLane !== s.lane) { s.prevLane = s.lane; s.lane = bestLane; sfx.lane(); return; }
  }
  if (!here.tall && here.near < 4.5 && s.y <= s.ground + 0.02 && s.vy <= 0) { s.vy = JUMP_V * (inSpace ? 0.85 : inSea ? 0.8 : 1); sfx.jump(); }
}
