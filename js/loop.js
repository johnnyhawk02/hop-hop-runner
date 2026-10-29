// Hop Hop Runner: The per-frame update and render loop (loads last).

// ---------- loop ----------
let baseFov = 60;
function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  // keep all three lanes in view on a tall portrait screen
  baseFov = w / h < 0.8 ? 72 : 60;
  camera.fov = baseFov;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

function update(dt) {
  const running = s.mode === 'running';
  const crashed = s.mode === 'crashed';

  if (running) {
    s.speed = Math.min(MAX_SPEED, s.speed + SPEED_RAMP * dt);
    s.distance += s.speed * dt * 0.5;
    if (Math.floor(s.distance / 100) > s.milestone) {
      s.milestone = Math.floor(s.distance / 100);
      const cheers = ['Great running!', 'Super!', 'Amazing!', 'Keep going!', 'Wow!'];
      toast(s.milestone * 100 + ' m! ' + cheers[s.milestone % cheers.length]);
      burst(s.x, 2.5, -2, 30);
      sfx.cheer();
    }
  } else if (crashed) {
    s.speed = Math.max(0, s.speed - 40 * dt);
    s.crashT += dt;
    if (s.crashT > 0.7 && crashScreen.hidden) crashScreen.hidden = false;
  } else {
    s.speed = 4; // gentle jog behind the start screen
  }
  // speed portal: the world rushes past much faster for a few seconds
  if (running && s.zoom > 0) {
    s.zoom -= dt;
    if (s.zoom <= 0) s.invuln = 1.0; // a moment to settle back in
  }
  s.zoomF += ((running && s.zoom > 0 ? 1 : 0) - s.zoomF) * Math.min(1, dt * 3);
  s.boardF = (s.boardF || 0) + ((running && s.board > 0 ? 1 : 0) - (s.boardF || 0)) * Math.min(1, dt * 2);
  s.jetF += ((running && s.jet > 0 ? 1 : 0) - s.jetF) * Math.min(1, dt * 2);
  const boost = (1 + 1.8 * s.zoomF) * (1 + (BOARD_BOOST - 1) * s.boardF) * (1 + 0.25 * s.jetF);
  if (running) s.distance += s.speed * dt * 0.5 * (boost - 1);
  const move = s.speed * dt * boost;
  if (running && s.zoomF > 0.15 && s.jet <= 0) autoPilot();

  // lanes: smooth slide
  s.x += (LANES[s.lane] - s.x) * Math.min(1, dt * 14);

  // what is she standing over? (checked after the world moves, below)
  const wasGrounded = s.y <= s.ground + 0.02 && s.vy <= 0;
  const prevGround = s.ground, prevPlat = s.groundPlat;

  // world scroll
  for (const t of ties) {
    t.position.z += move;
    if (t.position.z > DESPAWN_Z) t.position.z -= ties.length * TIE_GAP;
  }
  for (const o of scenery) {
    o.position.z += move;
    if (o.position.z > DESPAWN_Z) placeScenery(o, o.position.z - scenery.length * SCENERY_GAP);
    // trees and bits that would be inside a shop only show in the gaps
    if (awayFromTown) o.visible = false;
    else if (!o.userData.far) o.visible = !terraceAt(o.userData.side, o.position.z, 2.6) && !cottageAt(o.userData.side, o.position.z, 1.5);
    else o.visible = !cottageAt(o.userData.side, o.position.z, 4);
  }
  updateTerraces(dt, move);
  updateCottages(move);
  if (awayFromTown) for (const c of cottages) c.visible = false;
  updateSpace(dt, move);
  updateSea(dt, move);
  updateSpooky(dt, move);
  updatePets(dt, move);
  updateFair(dt, move);
  updateFireworks(dt);
  updateDucks(dt, move, running);
  for (const b of billboards) {
    b.position.z += move;
    // billboards stand in the gaps between the shops
    for (let k = 0; k < 6 && b.position.z < -40; k++) {
      const t = terraceAt(b.userData.side, b.position.z, 4);
      if (!t) break;
      b.position.z = t.userData.far - 5;
    }
    if (b.position.z > DESPAWN_Z + 6) placeBillboard(b, b.position.z - billboards.length * BILLBOARD_GAP);
  }
  for (const f of fences) {
    f.position.z += move;
    if (f.position.z > DESPAWN_Z) f.position.z -= (fences.length / 2) * FENCE_GAP;
  }
  for (const c of clouds) {
    c.position.z += move * 0.04;
    c.position.x += dt * 0.6;
    if (c.position.z > -30) c.position.z -= 120;
    if (c.position.x > 80) c.position.x = -80;
  }
  for (const h of spinners) h.rotation.z += dt * 1.5;
  updateSky(dt);
  updateSparks(dt, move);
  updateDust(dt, move);
  let inside = false;
  for (let i = tunnels.length - 1; i >= 0; i--) {
    const t = tunnels[i];
    const wasOutside = !(t.position.z > 0 && t.position.z - t.userData.length < 0);
    t.position.z += move;
    if (t.position.z - t.userData.length > DESPAWN_Z + 2) { scene.remove(t); tunnels.splice(i, 1); continue; }
    const inNow = t.position.z > -1 && t.position.z - t.userData.length < 1;
    if (inNow) { inside = true; if (wasOutside && running) sfx.tunnel(); }
  }
  s.dark += ((inside ? 1 : 0) - s.dark) * Math.min(1, dt * 4);
  hemiLight.intensity = 0.75 - 0.35 * s.dark;
  sunLight.intensity = 0.65 - 0.5 * s.dark;
  for (let i = popping.length - 1; i >= 0; i--) {
    const o = popping[i], u = o.userData;
    o.position.z += move;
    u.popT -= dt;
    u.cube.rotation.y += dt * 25;
    const k = u.popT > 0.25 ? 1 + (0.55 - u.popT) * 2 : Math.max(0.01, u.popT * 6);
    u.cube.scale.setScalar(k);
    u.orbit.scale.setScalar(k * 1.6);
    if (u.popT <= 0) { scene.remove(o); popping.splice(i, 1); }
  }
  // speed streaks and a wider view while zooming
  // and faint ones whenever she's going really fast
  const zf = s.zoomF;
  const fast = running ? Math.max(0, Math.min(1, (s.speed * boost - 15) / 8)) : 0;
  const streakA = Math.max(zf * 0.7, s.jetF * 0.5, fast * 0.3);
  streakMat.opacity = streakA;
  for (const m of streaks) {
    m.visible = streakA > 0.02;
    if (!m.visible) continue;
    m.position.z += dt * 90;
    if (m.position.z > 8) m.position.z -= 68;
    m.position.x = camera.position.x + m.userData.ox;
    m.position.y = camera.position.y - 2 + m.userData.oy;
  }
  const wantFov = baseFov + 16 * zf + 6 * s.jetF + 4 * fast;
  if (Math.abs(camera.fov - wantFov) > 0.05) { camera.fov = wantFov; camera.updateProjectionMatrix(); }
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];
    o.position.z += move;
    if (o.position.z > DESPAWN_Z) { scene.remove(o); obstacles.splice(i, 1); continue; }
    if (running) {
      const d = o.userData;
      const hitX = Math.abs(o.position.x - s.x) < d.halfW + 0.22;
      const hitZ = Math.abs(o.position.z) < d.halfD + 0.18;
      const feet = s.y - d.base;
      if (d.seaPortal || d.starPortal || d.ghostPortal || d.fairPortal) {
        if (hitX && o.position.z > -0.6 && o.position.z - move < 0.6) { d.seaPortal ? enterSea() : d.starPortal ? enterSpace() : d.fairPortal ? enterFair() : enterSpooky(); break; }
      } else if (d.spaceGate) {
        if (o.position.z > -0.6 && o.position.z - move < 0.6) { enterSpace(); break; } // can't be skipped over on a slow frame
      } else if (d.portal) {
        if (hitX && Math.abs(o.position.z) < 0.6) { teleport(); break; }
      } else if (d.zoomPortal) {
        if (hitX && Math.abs(o.position.z) < 0.6) { scene.remove(o); obstacles.splice(i, 1); startZoom(6); continue; }
      } else if (d.mystery) {
        if (hitX && Math.abs(o.position.z) < 0.8 && feet < 2.4 && feet > -1.2) { obstacles.splice(i, 1); openBox(o); continue; }
      } else if (d.magnetPickup) {
        if (hitX && Math.abs(o.position.z) < 0.8 && feet < 2.2) {
          scene.remove(o); obstacles.splice(i, 1);
          grabMagnet();
          continue;
        }
      } else if (d.jetPickup) {
        if (hitX && Math.abs(o.position.z) < 0.8 && feet < 2.2) { scene.remove(o); obstacles.splice(i, 1); startJet(); continue; }
      } else if (d.starPickup) {
        if (hitX && Math.abs(o.position.z) < 0.8 && feet < 2.2) { scene.remove(o); obstacles.splice(i, 1); startStar(); continue; }
      } else if (d.boardPickup) {
        if (hitX && Math.abs(o.position.z) < 0.8 && feet < 2.2) {
          scene.remove(o); obstacles.splice(i, 1);
          setBoard(20);
          sfx.boardGet();
          toast('Hoverboard!');
          continue;
        }
      } else if (d.pad) {
        if (hitX && hitZ && feet < 0.4 && feet > -0.3 && s.vy <= 0) { s.vy = awayFromTown ? 11 : 15; d.top.position.y = 0.32; sfx.bounce(); s.twirl = 1; }
      } else if (d.tall) {
        if (hitX && hitZ && Math.abs(o.position.z) < d.halfD - 0.4 && !(d.roof && feet > d.roof - 0.6)) {
          if (s.star > 0) { smash(o); obstacles.splice(i, 1); continue; }
          if (s.zoomF <= 0.15) s.lane = s.prevLane; // swiped into the side of a train: bump back instead of crashing
          stumble();
        }
      } else if (hitX && hitZ && feet < d.height - 0.12 && feet > -0.5) {
        // tripped over something jumpable: knock it flying and stumble
        obstacles.splice(i, 1);
        if (s.star > 0) smash(o);
        else { scene.remove(o); stumble(); }
        continue;
      }
    }
    if (o.userData.portal) { o.userData.swirl.rotation.z -= dt * 4; }
    if (o.userData.seaPortal || o.userData.starPortal || o.userData.ghostPortal || o.userData.fairPortal) { o.userData.swirl.rotation.z += dt * 2; o.userData.orbit.rotation.z -= dt * 1.5; }
    if (o.userData.zoomPortal) { o.userData.ring.rotation.z += dt * 3; }
    if (o.userData.mystery) {
      const u = o.userData;
      u.t += dt;
      u.cube.rotation.y += dt * 1.6; u.cube.rotation.x = Math.sin(u.t) * 0.3;
      u.cube.position.y = u.orbit.position.y = 1.25 + Math.sin(u.t * 2.5) * 0.12;
      u.orbit.rotation.y -= dt * 3;
    }
    if (o.userData.magnetPickup) { o.userData.spin.rotation.y += dt * 2.5; o.userData.ring.rotation.y += dt * 2; }
    if (o.userData.boardPickup) { o.userData.spin.rotation.y += dt * 2; o.userData.ring.rotation.y += dt * 2; }
    if (o.userData.jetPickup || o.userData.starPickup) {
      const u = o.userData;
      u.spin.rotation.y += dt * 2.5; u.ring.rotation.y += dt * 2;
      u.spin.position.y = 1.2 + Math.sin(performance.now() / 300) * 0.1;
      if (u.starPickup) u.ring.material.color.setHSL((performance.now() / 1500) % 1, 1, 0.6);
    }
    if (o.userData.pad) o.userData.top.position.y += (0.2 - o.userData.top.position.y) * Math.min(1, dt * 8);
  }
  for (let i = coins.length - 1; i >= 0; i--) {
    const c = coins[i];
    c.position.z += move;
    c.rotation.y += dt * 4;
    if (c.position.z > DESPAWN_Z) { scene.remove(c); coins.splice(i, 1); continue; }
    if (running && s.magnet > 0 && c.position.z > -28 && c.position.z < 3) {
      const pull = Math.min(1, dt * (6 + (28 + c.position.z) * 0.25));
      c.position.x += (s.x - c.position.x) * pull;
      c.position.y += (s.y + 0.9 - c.position.y) * pull;
      c.position.z += (0 - c.position.z) * pull * 0.6;
    }
    if (running && Math.abs(c.position.x - s.x) < 0.9 && Math.abs(c.position.z) < 0.8 && Math.abs(c.position.y - (s.y + 0.9)) < 1.2) {
      scene.remove(c); coins.splice(i, 1);
      s.coins += awayFromTown ? 2 : 1; // coins are worth double in Space and under the sea
      s.combo++;
      s.comboT = 2.5;
      popCoins();
      sfx.coin(s.combo);
      if (s.combo >= 3) {
        comboEl.textContent = 'x' + s.combo;
        comboEl.classList.add('show');
        comboEl.classList.remove('bump'); void comboEl.offsetWidth; comboEl.classList.add('bump');
      }
      if (s.combo % 10 === 0) {
        // a long chain of coins earns a bonus
        const bonus = Math.min(25, s.combo / 2);
        s.coins += bonus;
        toast('Combo x' + s.combo + '! +' + bonus, true);
        sfx.combo();
        burst(s.x, s.y + 2, -1.5, 24);
      }
      burst(c.position.x, c.position.y, c.position.z, 3, true);
    }
  }
  let copGround = 0;
  s.ground = 0; s.groundPlat = null;
  for (let i = platforms.length - 1; i >= 0; i--) {
    const p = platforms[i];
    p.position.z += move;
    if (p.position.z - p.userData.length > DESPAWN_Z) { scene.remove(p); platforms.splice(i, 1); continue; }
    if (Math.abs(p.position.x - s.x) < 1.0) {
      const h = surfaceAt(p, p.position.z);
      if (p.userData.train && h > s.y + 0.6 && prevPlat !== p) continue;
      if (h > s.ground) { s.ground = h; s.groundPlat = p; }
    }
    if (Math.abs(p.position.x - s.copX) < 1.0) copGround = Math.max(copGround, surfaceAt(p, p.position.z - s.copZ));
  }

  // jumping, falling, and riding up ramps
  const vyBefore = s.vy;
  if (wasGrounded && s.ground < prevGround - 0.05 && prevPlat && prevPlat.userData.launch && running) {
    s.vy = 8.5; // whoosh off the launch ramp
    s.twirl = 1; sfx.twirl();
    sfx.launch();
  }
  if (s.jumpBuffer > 0) {
    s.jumpBuffer -= dt;
    if (s.y <= s.ground + 0.02 && s.vy <= 0 && running) { s.vy = JUMP_V * (inSpace ? 0.85 : inSea ? 0.8 : 1); s.jumpBuffer = 0; sfx.jump(); }
  }
  if (wasGrounded && s.vy <= 0 && s.ground < s.y && s.y - s.ground < 0.35 && !(prevPlat && prevPlat.userData.launch)) {
    s.y = s.ground; // walk down a ramp instead of floating off it
  }
  if (s.jet > 0 && running) {
    // the jetpack lifts her high over everything
    s.y += (Math.max(JET_Y, s.ground + 2) - s.y) * Math.min(1, dt * 4);
    s.vy = 0;
  } else if (s.y > s.ground || s.vy > 0) {
    s.vy -= GRAVITY * (inSpace ? 0.6 : inSea ? 0.45 : 1) * dt; // floaty moon jumps in Space, slow swimmy ones under the sea
    if (s.jetFall) s.vy = Math.max(s.vy, -7); // floats gently back down
    s.y += s.vy * dt;
  }
  if (s.y <= s.ground) {
    // ramps push her up; stepping sideways onto a bridge lifts her quickly but gently
    s.y = s.ground - s.y > 0.3 ? s.y + (s.ground - s.y) * Math.min(1, dt * 18) : s.ground;
    if (s.vy < 0) s.vy = 0;
    if (!wasGrounded && vyBefore < -4 && s.mode !== 'ready') {
      // a squashy landing with a puff of dust
      const v = s.jetFall ? 14 : -vyBefore;
      s.squash = Math.min(1, v / 12);
      dust(s.x, s.ground, 0.3, Math.round(4 + v * 0.5), 1.5 + v * 0.15);
      if (v > 12) s.shake = Math.max(s.shake, 0.25);
      sfx.land(v);
    }
    s.jetFall = false;
  }

  if (running) {
    s.untilNext -= move;
    if (s.untilNext <= 0) spawnRow();
  }

  // power-up timers
  if (s.invuln > 0) s.invuln -= dt;
  if (s.comboT > 0) {
    s.comboT -= dt;
    if (s.comboT <= 0) { s.combo = 0; comboEl.classList.remove('show'); }
  }
  if (s.jet > 0 && running) {
    s.jet -= dt;
    jetPill.lastChild.nodeValue = Math.ceil(Math.max(0, s.jet));
    jetPill.classList.toggle('low', s.jet < 3);
    for (const f of backJet.userData.flames) f.scale.set(1, 0.7 + Math.random() * 0.6, 1);
    const sx = Math.random() < 0.5 ? -0.15 : 0.15;
    if (Math.random() < 0.5) puff(s.x + sx, s.y + 0.5, 0.5, (Math.random() - 0.5) * 0.6, -3, 0, 0xffffff, 0.25);
    if (s.jet <= 0) { setJet(0); s.jetFall = true; s.invuln = 2.2; }
  }
  if (s.star > 0 && running) {
    s.star -= dt;
    starPill.lastChild.nodeValue = Math.ceil(Math.max(0, s.star));
    starPill.classList.toggle('low', s.star < 3);
    const hue = (performance.now() / 600) % 1;
    aura.material.color.setHSL(hue, 1, 0.6);
    shirt.color.setHSL(hue, 0.85, 0.62);
    const pulse = 1 + Math.sin(performance.now() / 90) * 0.06;
    aura.scale.set(0.85 * pulse, 1.2 * pulse, 0.85 * pulse);
    if (Math.random() < dt * 25) {
      burst(s.x + (Math.random() - 0.5) * 0.8, s.y + 0.4 + Math.random() * 1.2, 0.6, 1);
      sparks[(sparkIdx - 1) % sparks.length].material.color.setHSL(Math.random(), 1, 0.6); // rainbow sparkles
    }
    if (s.star <= 0) { setStar(0); s.invuln = Math.max(s.invuln, 1.0); }
  }
  sfx.setMusic(116 + Math.min(28, Math.max(0, (s.speed - 12) * 3.5)) + 16 * Math.max(s.zoomF, s.jetF), s.star > 0 || awayFromTown, running ? Math.max(0, Math.min(1, (s.speed * boost - 14) / 6)) : 0, running && s.zoom > 0, running && (s.jet > 0 || s.star > 0), running && s.magnet > 0);
  if (running && !inSpace) {
    if (!s.gateHalf && s.coins >= s.gateAt / 2 && s.coins < s.gateAt) { s.gateHalf = true; toast('Halfway to Space!'); }
    if (!s.gateReady && s.coins >= s.gateAt) { s.gateReady = true; s.gateHalf = true; toast(s.gateAt + ' coins! Find the gate!'); sfx.cheer(); }
  }
  if (s.magnet > 0 && running) {
    s.magnet -= dt;
    magnetPill.lastChild.nodeValue = Math.ceil(s.magnet);
    magnetPill.classList.toggle('low', s.magnet < 4);
    headMagnet.rotation.y += dt * 3;
    headMagnet.position.y = 2.55 + Math.sin(performance.now() / 250) * 0.06;
    if (s.magnet <= 0) setMagnet(0);
  }
  if (s.board > 0 && running) {
    s.board -= dt;
    boardPill.lastChild.nodeValue = Math.ceil(s.board);
    boardPill.classList.toggle('low', s.board < 4);
    if (s.board <= 0) setBoard(0);
  }
  const onBoard = s.board > 0;
  player.visible = s.invuln <= 0 || Math.floor(s.invuln * 10) % 2 === 0; // blink while safe

  // runner pose
  s.runPhase += dt * (6 + s.speed * 0.6);
  const air = s.y > s.ground + 0.05;
  const swing = onBoard ? Math.sin(s.runPhase * 0.3) * 0.15 : air ? 0.9 : Math.sin(s.runPhase) * 0.9;
  legL.rotation.x = onBoard ? 0.15 : air ? -0.9 : swing;
  legR.rotation.x = onBoard ? -0.15 : air ? 0.5 : -swing;
  armL.rotation.x = onBoard ? 0.3 + swing : air ? 2.4 : -swing;
  armR.rotation.x = onBoard ? 0.3 - swing : air ? 2.4 : swing;
  armL.rotation.z = onBoard ? -0.9 : 0; // arms out for balance on the board
  armR.rotation.z = onBoard ? 0.9 : 0;
  const hover = onBoard ? 0.32 + Math.sin(performance.now() / 180) * 0.05 : 0;
  const tNow = performance.now() / 1000;
  const wob = Math.sin(tNow * 6.3) * 0.09 + Math.sin(tNow * 2.1) * 0.05; // a little wobble on the board
  riding.rotation.z = onBoard ? (LANES[s.lane] - s.x) * 0.25 + wob : 0;
  riding.rotation.x = onBoard ? Math.sin(tNow * 4.7) * 0.05 : 0;
  if (inSea && air && s.jet <= 0 && !onBoard) {
    // swimming: a little breaststroke
    const st = Math.sin(tNow * 6);
    armL.rotation.x = armR.rotation.x = 2.2 + st * 0.5;
    armL.rotation.z = -0.4 - st * 0.4; armR.rotation.z = 0.4 + st * 0.4;
    legL.rotation.x = 0.3 + st * 0.3; legR.rotation.x = 0.3 - st * 0.3;
  }
  if (s.jet > 0) {
    // flying pose: arms out, legs dangling
    legL.rotation.x = 0.35 + Math.sin(tNow * 5) * 0.12;
    legR.rotation.x = 0.1 - Math.sin(tNow * 5) * 0.12;
    armL.rotation.x = armR.rotation.x = 0.5;
    armL.rotation.z = -1.15; armR.rotation.z = 1.15;
  }
  player.position.set(s.x, s.y + hover + (air || onBoard ? 0 : Math.abs(Math.sin(s.runPhase)) * 0.08), 0);
  // squash and stretch
  s.squash = Math.max(0, s.squash - dt * 5);
  let sy = onBoard || s.jet > 0 || !air ? 1 : 1 + Math.max(-0.06, Math.min(0.15, s.vy * 0.015));
  sy -= s.squash * 0.3;
  const sxz = 1 / Math.sqrt(sy);
  player.scale.set(sxz, sy, sxz);
  player.rotation.y = (LANES[s.lane] - s.x) * -0.15;
  if (s.twirl > 0) {
    s.twirl = Math.max(0, s.twirl - dt * 1.4);
    player.rotation.y += (1 - s.twirl) * Math.PI * 2; // a happy spin in the air
  }
  if (crashed) {
    player.rotation.x = Math.min(1.4, s.crashT * 4);
  } else if (s.stumbleT > 0) {
    s.stumbleT -= dt;
    player.rotation.x = Math.sin((0.5 - s.stumbleT) / 0.5 * Math.PI) * -0.6; // a wobbly trip forward
    player.rotation.z = Math.sin(s.stumbleT * 30) * 0.15;
  } else {
    player.rotation.x = 0;
    player.rotation.z = 0;
  }
  if (onBoard && !crashed && s.stumbleT <= 0) {
    player.rotation.z = wob * 0.7; // she sways to keep her balance
    player.rotation.x = Math.sin(tNow * 4.7) * 0.03;
  }
  if (s.jet > 0 && !crashed) {
    player.rotation.x = -0.25;
    player.rotation.z = Math.sin(tNow * 2.3) * 0.08 + (LANES[s.lane] - s.x) * -0.12;
  }
  // every so often she glances back over her shoulder at the policeman, so we see her face
  const canLook = !air && s.stumbleT <= 0 && s.mode !== 'crashed';
  s.nextLook -= dt;
  if (s.lookT <= 0 && s.nextLook <= 0 && canLook) {
    s.lookT = 1.2;
    s.nextLook = (s.copClose > 0 ? 1.8 : 4) + Math.random() * 3;
  }
  let look = 0;
  if (s.lookT > 0) {
    s.lookT -= dt;
    const prog = 1 - s.lookT / 1.2;
    look = Math.min(1, Math.sin(prog * Math.PI) * 1.8);
  }
  if (s.mode === 'crashed' && s.caught) look = Math.min(1, s.crashT * 2); // turns round to face him
  const lookSide = s.copX > s.x ? -1 : 1; // over the shoulder nearest the policeman
  headPivot.rotation.y = lookSide * 2.4 * look;
  headPivot.rotation.x = -0.1 * look;
  upperBody.rotation.y = lookSide * 0.3 * look;
  // blink now and then
  s.blinkT -= dt;
  if (s.blinkT <= 0) s.blinkT = 2.5 + Math.random() * 3;
  const eyeY = s.blinkT < 0.12 ? 0.15 : 1;
  const blinkMap = eyeY < 1 ? faceBlinkTex : faceTex;
  if (head.material.map !== blinkMap) { head.material.map = head.material.emissiveMap = blinkMap; head.material.needsUpdate = true; }
  // ponytail bounces with each step and flies up in the air
  pony.rotation.x = air ? -0.7 : 0.25 + Math.sin(s.runPhase * 2) * 0.25;
  pony.rotation.z = Math.sin(s.runPhase) * 0.2;

  blob.position.set(s.x, s.ground + 0.06, 0);
  const blobScale = 1 - Math.min(0.5, (s.y - s.ground) * 0.25);
  blob.scale.set(blobScale, blobScale, 1);

  // the policeman: right behind at the start and after a stumble, otherwise he falls back out of sight
  s.bumpCool -= dt;
  if (running) s.copClose = Math.max(0, s.copClose - dt);
  const copTarget = crashed ? 1.4 : s.mode === 'ready' ? 16 : s.copClose > 0 ? (s.stumbleT > 0 ? 1.0 : 1.9) : 16;
  s.copZ += (copTarget - s.copZ) * Math.min(1, dt * (s.copClose > 0 || crashed ? 2.5 : 0.6));
  // he runs just off her shoulder so he never hides her from view
  const copSide = s.x > 0.5 ? -1.5 : 1.5;
  s.copX += (s.x + copSide - s.copX) * Math.min(1, dt * 5);
  const copNear = obstacles.some(o => !o.userData.tall && !o.userData.portal && !o.userData.spaceGate && !o.userData.seaPortal && !o.userData.starPortal && !o.userData.ghostPortal && !o.userData.fairPortal && Math.abs(o.position.x - s.copX) < 1.2 && o.position.z - s.copZ > -2.5 && o.position.z - s.copZ < 0);
  if (copNear && s.copY <= copGround + 0.02) s.copVy = JUMP_V;
  s.copVy -= GRAVITY * (inSpace ? 0.6 : inSea ? 0.45 : 1) * dt;
  s.copY = Math.max(copGround, s.copY + s.copVy * dt);
  if (s.copY <= copGround) s.copVy = 0;
  const copAir = s.copY > copGround + 0.05;
  const copStill = crashed && s.speed < 0.5;
  const cs = copStill ? 0 : Math.sin(s.runPhase * 0.95) * 0.9;
  copLegL.rotation.x = copAir ? -0.9 : cs;
  copLegR.rotation.x = copAir ? 0.5 : -cs;
  copArmL.rotation.x = copStill ? 2.6 : -cs; // waving when he's caught up
  copArmR.rotation.x = copStill ? 0.3 * Math.sin(s.crashT * 8) : cs;
  cop.position.set(s.copX, s.copY, s.copZ);
  cop.visible = s.copZ < 12;

  // camera follows lane a little, leans into lane changes and shakes on bumps
  camera.position.sub(shakeOff);
  camera.position.x += (s.x * 0.55 - camera.position.x) * Math.min(1, dt * 6);
  camera.position.y += (4.2 + s.y * (0.7 + 0.3 * s.jetF) - camera.position.y) * Math.min(1, dt * 5); // stays above her when she flies
  s.shake = Math.max(0, s.shake - dt * 2.2);
  shakeOff.set((Math.random() - 0.5) * s.shake, (Math.random() - 0.5) * s.shake, 0);
  camera.position.add(shakeOff);
  camera.lookAt(s.x * 0.4, 1.2 + s.y * (0.6 + 0.35 * s.jetF), -6);
  s.lean += ((s.x - LANES[s.lane]) * 0.035 - s.lean) * Math.min(1, dt * 8);
  camera.rotateZ(s.lean);

  if (running) renderHud();
}

let last = performance.now();
let stare = 0, stareF = 0, nextStare = 18 + Math.random() * 15;
const savedCam = new THREE.Vector3(), savedQuat = new THREE.Quaternion(), stareCam = new THREE.Vector3(), stareLook = new THREE.Vector3(), normalLook = new THREE.Vector3();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const canStare = s.mode === 'running' && s.jet <= 0 && s.star <= 0 && s.zoom <= 0 && s.y - s.ground < 0.3;
  if (s.mode !== 'running') stare = 0;
  else if (stare <= 0 && canStare && (nextStare -= dt) <= 0) {
    stare = 1.6; nextStare = 25 + Math.random() * 25;
    s.copClose = Math.max(s.copClose, 3); s.copZ = Math.min(s.copZ, 3);
    copHead.material.map = copHead.material.emissiveMap = copGlareTex; copHead.material.needsUpdate = true;
    sfx.huff();
  }
  if (stare > 0) { stare -= dt; if (stare <= 0) { copHead.material.map = copHead.material.emissiveMap = copFaceTex; copHead.material.needsUpdate = true; } }
  stareF += ((stare > 0 ? 1 : 0) - stareF) * Math.min(1, dt * 6);
  update(dt * (1 - 0.5 * stareF)); // the world slows down while he glares
  cop.rotation.y = Math.PI * Math.min(1, stareF * 1.3); // he turns round to face us
  if (stareF > 0.01) {
    savedCam.copy(camera.position); savedQuat.copy(camera.quaternion);
    const e = stareF * stareF * (3 - 2 * stareF);
    cop.updateMatrixWorld();
    stareLook.set(cop.position.x, cop.position.y + 1.95, cop.position.z);
    stareCam.set(cop.position.x + 0.15, cop.position.y + 2.0, cop.position.z + 2.0); // a little way in front of his face
    normalLook.set(s.x * 0.4, 1.2 + s.y * 0.6, -6);
    camera.position.lerpVectors(savedCam, stareCam, e);
    camera.lookAt(normalLook.lerp(stareLook, e));
    renderer.render(scene, camera);
    camera.position.copy(savedCam); camera.quaternion.copy(savedQuat);
  } else renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
document.addEventListener('visibilitychange', () => { last = performance.now(); });
renderHud();
// the sky (sun, moon, clouds, planets, rainbow) stays put; only the ground and what's on it curves away
scene.traverse(o => { for (const m of [].concat(o.material || [])) if (m.fog === false) m.defines = Object.assign({}, m.defines, { NO_CURVE: '' }); });
requestAnimationFrame(frame);

// test hook
window.__hop = s;
window.__hopWorld = () => ({ obstacles, platforms, LANES, ducks });
window.__cottages = cottages;
window.__hopPower = { jet: startJet, star: startStar, space: enterSpace, sea: enterSea, spooky: enterSpooky, fair: enterFair, stare: () => { nextStare = 0; }, halloween: () => { s.nextHallow = 0; }, sfx };
