// Hop Hop Runner: Game state, HUD, entering worlds, power-ups, stumbles and crashes.

// ---------- state ----------
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const startScreen = document.getElementById('startScreen');
const crashScreen = document.getElementById('crashScreen');
const crashScore = document.getElementById('crashScore');
const crashTitle = document.getElementById('crashTitle');
const coinsEl = document.getElementById('coins');
const comboEl = document.getElementById('combo');
const flashEl = document.getElementById('flash');
const toastEl = document.getElementById('toast');

let best = 0;
try { best = Number(localStorage.getItem('hopRunnerBest')) || 0; } catch (e) {}

const s = {
  mode: 'ready',      // ready | running | crashed
  lane: 1,
  x: 0,
  y: 0,
  vy: 0,
  speed: START_SPEED,
  distance: 0,
  untilNext: 45,
  runPhase: 0,
  jumpBuffer: 0,
  crashT: 0,
  prevLane: 1,
  jet: 0, star: 0, jetF: 0, jetFall: false, combo: 0, comboT: 0, shake: 0, lean: 0, squash: 0, skyLane: 1,
  lastTall: false,
  ground: 0,          // height of whatever is under her feet
  groundPlat: null,
  coins: 0,
  nextPortal: 150,
  copZ: 16,           // how far behind her the policeman is
  copX: 0,
  copY: 0,
  copVy: 0,
  copClose: 0,        // seconds he stays right behind her
  bumpCool: 0,
  stumbleT: 0,
  caught: false,
  lookT: 0,           // > 0 while she's glancing back at the policeman
  nextLook: 2.5,
  board: 0,           // seconds of hoverboard left
  nextBoard: 60,
  nextClimb: 70,
  zoom: 0,            // seconds of speed-portal zoom left
  zoomF: 0,           // 0..1 how fast we're zooming right now
  nextZoom: 110,
  nextBox: 35,
  magnet: 0,          // seconds of coin magnet left
  nextMagnet: 90,
  nextTunnel: 45,
  twirl: 0,           // > 0 while she spins on a big jump
  milestone: 0,
  dark: 0,            // 0..1 how far inside a tunnel
  invuln: 0,
  blinkT: 3,
};

function renderHud() {
  scoreEl.firstChild.nodeValue = Math.floor(s.distance);
  bestEl.firstChild.nodeValue = Math.floor(best);
  coinsEl.lastChild.nodeValue = s.coins;
}
function popCoins() {
  coinsEl.classList.remove('pop');
  void coinsEl.offsetWidth;
  coinsEl.classList.add('pop');
}
let toastTimer = 0, toastHold = 0;
function toast(text, minor = false) {
  // minor toasts (combos) never cover up a big one like "Welcome to Space!"
  if (minor && performance.now() < toastHold) return;
  if (!minor) toastHold = performance.now() + 1400;
  toastEl.textContent = text;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1600);
}
function flash() {
  flashEl.style.transition = 'none';
  flashEl.style.opacity = '1';
  void flashEl.offsetWidth;
  flashEl.style.transition = 'opacity 0.9s ease-out';
  flashEl.style.opacity = '0';
}
function clearWorld() {
  for (const o of obstacles) scene.remove(o);
  obstacles = [];
  for (const p of platforms) scene.remove(p);
  platforms = [];
  for (const t of tunnels) scene.remove(t);
  tunnels = [];
  for (const c of coins) scene.remove(c);
  coins = [];
  for (const o of popping) scene.remove(o);
  popping = [];
  for (const d of ducks) scene.remove(d);
  ducks.length = 0;
}
function teleport() {
  sfx.portal();
  flash();
  clearWorld();
  halloween = Math.random() < 0.35;
  applyTheme(themeIndex >= SPACE ? 0 : (themeIndex + 1) % SPACE);
  toast(halloween ? 'Halloween ' + themes[themeIndex].name + '! 🎃' : themes[themeIndex].name + '!');
  s.nextHallow = s.distance + 250 + Math.random() * 200;
  s.distance += 50;
  s.y = s.ground = 0; s.vy = 0; s.groundPlat = null;
  s.copZ = 30; s.copClose = 0; // the policeman is left far behind
  coinLine(s.lane, -8, 20, 0.8, 1.8); // a welcome trail of coins
  s.untilNext = 45;
  s.nextPortal = s.distance + 160 + Math.random() * 100;
  s.nextCross = s.distance + 200 + Math.random() * 100;
}

function enterSpace() {
  sfx.portal(); sfx.starGo();
  flashEl.style.background = 'radial-gradient(circle at center, #ffffff00 20%, #b388ff 100%)';
  flash();
  setTimeout(() => { flashEl.style.background = ''; }, 900);
  clearWorld();
  applyTheme(SPACE);
  toast('Welcome to Space!');
  if (s.gateReady || s.coins >= s.gateAt) { s.gateReady = false; s.gateAt = s.coins + 150; } // the next golden gate needs 150 more
  s.distance += 50;
  s.y = s.ground = 0; s.vy = 0; s.groundPlat = null;
  s.copZ = 30; s.copClose = 0;
  coinLine(s.lane, -8, 20, 0.8, 1.8);
  s.untilNext = 45;
  s.nextPortal = s.distance + 200 + Math.random() * 100;
  s.nextCross = s.distance + 250 + Math.random() * 100;
}

function enterSea() {
  sfx.splash();
  flashEl.style.background = 'radial-gradient(circle at center, #ffffff00 15%, #3fb6ff 100%)';
  flash();
  setTimeout(() => { flashEl.style.background = ''; }, 900);
  clearWorld();
  applyTheme(UNDER);
  toast('Splash! Under the sea!');
  s.distance += 50;
  s.y = s.ground = 0; s.vy = 0; s.groundPlat = null;
  s.copZ = 30; s.copClose = 0;
  coinLine(s.lane, -8, 20, 0.8, 1.8);
  blowBubbles(s.x, 1, -1, 20);
  s.untilNext = 45;
  s.nextPortal = s.distance + 200 + Math.random() * 100;
  s.nextCross = s.distance + 250 + Math.random() * 100;
  s.nextSea = s.distance + 250 + Math.random() * 150;
}

function enterFair() {
  sfx.portal(); sfx.jingle();
  flashEl.style.background = 'radial-gradient(circle at center, #ffffff00 15%, #ffd23f 100%)';
  flash();
  setTimeout(() => { flashEl.style.background = ''; }, 900);
  clearWorld();
  applyTheme(FAIR);
  toast('Welcome to the Fun Fair! 🎡');
  s.distance += 50;
  s.y = s.ground = 0; s.vy = 0; s.groundPlat = null;
  s.copZ = 30; s.copClose = 0;
  coinLine(s.lane, -8, 20, 0.8, 1.8);
  s.untilNext = 45;
  s.nextPortal = s.distance + 200 + Math.random() * 100;
  s.nextCross = s.distance + 250 + Math.random() * 100;
  s.nextSea = s.distance + 250 + Math.random() * 150;
}

function enterSpooky() {
  sfx.portal(); sfx.boo();
  flashEl.style.background = 'radial-gradient(circle at center, #ffffff00 15%, #7dff9a 100%)';
  flash();
  setTimeout(() => { flashEl.style.background = ''; }, 900);
  clearWorld();
  applyTheme(SPOOKY);
  toast('Spooky World! Boo! 👻');
  s.distance += 50;
  s.y = s.ground = 0; s.vy = 0; s.groundPlat = null;
  s.copZ = 30; s.copClose = 0;
  coinLine(s.lane, -8, 20, 0.8, 1.8);
  s.untilNext = 45;
  s.nextPortal = s.distance + 200 + Math.random() * 100;
  s.nextCross = s.distance + 250 + Math.random() * 100;
  s.nextSea = s.distance + 250 + Math.random() * 150;
}

function reset() {
  clearWorld();
  halloween = Math.random() < 0.25;
  applyTheme(0);
  Object.assign(s, { coins: 0, nextPortal: 150, copZ: 3.2, copX: 0, copY: 0, copVy: 0, copClose: 3.5, bumpCool: 0, stumbleT: 0, caught: false, lookT: 0, nextLook: 1.5, board: 0, nextBoard: 60, nextClimb: 70, zoom: 0, zoomF: 0, nextZoom: 110, nextBox: 35, magnet: 0, nextMagnet: 90, nextTunnel: 45, twirl: 0, milestone: 0, invuln: 0, lane: 1, prevLane: 1, lastTall: false, x: 0, y: 0, vy: 0, speed: START_SPEED, distance: 0, untilNext: 35, jumpBuffer: 0, crashT: 0, ground: 0, groundPlat: null, jet: 0, star: 0, jetF: 0, jetFall: false, nextJet: 140, nextStar: 210, combo: 0, comboT: 0, shake: 0, lean: 0, squash: 0, skyLane: 1, gateAt: 100, gateReady: false, gateHalf: false, nextSea: 170, nextCross: 330, nextHallow: 200 + Math.random() * 250 });
  comboEl.classList.remove('show');
  player.rotation.set(0, 0, 0);
  renderHud();
}

function start() {
  reset();
  s.mode = 'running';
  sfx.music(true);
  startScreen.hidden = true;
  crashScreen.hidden = true;
}

function crash(caught = false) {
  s.mode = 'crashed';
  s.caught = caught;
  s.crashT = 0;
  s.vy = 6;
  if (s.distance > best) {
    best = s.distance;
    try { localStorage.setItem('hopRunnerBest', String(Math.floor(best))); } catch (e) {}
  }
  renderHud();
  setBoard(0);
  setMagnet(0);
  setJet(0);
  setStar(0);
  s.jetFall = false;
  sfx.music(false);
  if (caught) sfx.caught(); else sfx.bonk();
  crashTitle.textContent = caught ? 'Caught!' : 'Bonk!';
  crashScore.textContent = (caught ? 'The policeman caught you! ' : '') + 'You ran ' + Math.floor(s.distance) + ' metres and got ' + s.coins + ' coins!';
}

const boardPill = document.getElementById('boardPill');
const magnetPill = document.getElementById('magnetPill');
const jetPill = document.getElementById('jetPill');
const starPill = document.getElementById('starPill');
const JET_Y = 9, JET_TIME = 8, STAR_TIME = 8;
function setJet(secs) {
  s.jet = secs;
  backJet.visible = secs > 0;
  jetPill.hidden = secs <= 0;
  sfx.roar(secs > 0);
}
// a wavy trail of coins up in the sky
function skyCoins(zFrom, zTo) {
  let n = 0;
  for (let z = zFrom; z > zTo; z -= 2.2) {
    if (++n % 8 === 0) s.skyLane = Math.max(0, Math.min(2, s.skyLane + (s.skyLane === 0 ? 1 : s.skyLane === 2 ? -1 : Math.random() < 0.5 ? -1 : 1)));
    addCoin(s.skyLane, z, JET_Y + 0.9);
  }
}
function startJet() {
  setJet(JET_TIME);
  s.vy = 0; s.jumpBuffer = 0; s.jetFall = false;
  s.copZ = 30; s.copClose = 0;
  s.skyLane = s.lane;
  sfx.jetGo();
  toast('Jetpack!');
  skyCoins(-12, SPAWN_Z);
  s.untilNext = 2;
}
function setStar(secs) {
  s.star = secs;
  aura.visible = secs > 0;
  starPill.hidden = secs <= 0;
  if (secs <= 0) shirt.color.setHex(0xff5d73);
}
function startStar() {
  setStar(STAR_TIME);
  s.copZ = 30; s.copClose = 0;
  sfx.starGo();
  toast('Super star!');
  burst(s.x, 1.5, -0.5, 30);
}
// with the rainbow star she smashes things into confetti
function smash(o) {
  const tall = !!o.userData.tall;
  scene.remove(o);
  burst(o.position.x, tall ? 2.2 : 0.8, Math.min(o.position.z, -0.5), tall ? 40 : 22);
  dust(o.position.x, 0, Math.min(o.position.z, -0.5), 6, 4);
  sfx.smash();
  s.shake = Math.max(s.shake, tall ? 0.45 : 0.22);
  s.coins += tall ? 3 : 1;
  popCoins();
}
function setMagnet(secs) {
  s.magnet = secs;
  headMagnet.visible = secs > 0;
  magnetPill.hidden = secs <= 0;
}
function grabMagnet() {
  setMagnet(15);
  sfx.magnet();
  toast('Magnet!');
}
function startZoom(secs) {
  s.zoom = Math.max(s.zoom, secs);
  s.copZ = 30; s.copClose = 0;
  sfx.zoom();
  toast('Zoom!');
  flashEl.style.background = 'radial-gradient(circle at center, #ffffff00 25%, #ffb020 100%)';
  flash();
  setTimeout(() => { flashEl.style.background = ''; }, 900);
}
function openBox(o) {
  burst(o.position.x, 1.25, o.position.z);
  sfx.mystery();
  o.userData.popT = 0.55;
  popping.push(o);
  const r = Math.random();
  const tunnelNear = tunnels.some(t => t.position.z > -30 && t.position.z - t.userData.length < 2);
  let prize = r < 0.24 ? 'coins' : r < 0.4 ? 'board' : r < 0.54 ? 'magnet' : r < 0.67 ? 'jet' : r < 0.8 ? 'star' : r < 0.88 ? 'zoom' : r < 0.95 ? 'sea' : 'super';
  if ((prize === 'board' && s.board > 0) || (prize === 'magnet' && s.magnet > 0) || (prize === 'jet' && (s.jet > 0 || tunnelNear)) || (prize === 'star' && s.star > 0) || (prize === 'sea' && (awayFromTown || tunnelNear || s.jet > 0))) prize = 'coins';
  if (prize === 'coins') {
    s.coins += 10; popCoins();
    burst(s.x, 1.5, -1, 16, true);
    toast('+10 coins!');
  } else if (prize === 'board') {
    setBoard(20); sfx.boardGet(); toast('Hoverboard!');
  } else if (prize === 'magnet') {
    grabMagnet();
  } else if (prize === 'jet') {
    setTimeout(() => s.mode === 'running' && startJet(), 300);
  } else if (prize === 'star') {
    startStar();
  } else if (prize === 'sea') {
    const boo = Math.random() < 0.5;
    toast(boo ? 'Boo!' : 'Splash!');
    setTimeout(() => s.mode === 'running' && !awayFromTown && (boo ? enterSpooky() : enterSea()), 400);
  } else if (prize === 'zoom') {
    setTimeout(() => s.mode === 'running' && startZoom(4), 350);
  } else {
    s.vy = 15; sfx.bounce(); toast('Super jump!');
  }
}

function setBoard(secs) {
  s.board = secs;
  riding.visible = secs > 0;
  boardPill.hidden = secs <= 0;
  sfx.hum(secs > 0);
}
function breakBoard() {
  setBoard(0);
  s.shake = Math.max(s.shake, 0.4);
  s.invuln = 1.2; // a moment to get clear after the board takes the hit
  sfx.boardBreak();
  flashEl.style.background = 'radial-gradient(circle at center, #ffffff00 30%, #5ee7ff 100%)';
  flash();
  setTimeout(() => { flashEl.style.background = ''; }, 900);
}

// first stumble: she trips and the policeman nearly catches her; a second one while he's close: caught!
function stumble() {
  if (s.bumpCool > 0 || s.mode !== 'running' || s.invuln > 0 || s.zoomF > 0.15 || s.star > 0 || s.jet > 0) return;
  s.bumpCool = 0.8;
  s.comboT = 0;
  if (s.board > 0) { breakBoard(); return; } // the hoverboard takes the bump instead
  if (s.copClose > 0) { crash(true); return; }
  sfx.stumble();
  s.shake = Math.max(s.shake, 0.5);
  setTimeout(() => s.mode === 'running' && sfx.whistle(), 250);
  s.copClose = 6;
  s.stumbleT = 0.5;
  s.speed = Math.max(START_SPEED * 0.8, s.speed * 0.7);
}
