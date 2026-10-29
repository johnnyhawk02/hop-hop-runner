// Hop Hop Runner: Touch, keyboard and the sound button.

// ---------- input ----------
function moveLane(dir) {
  if (s.mode !== 'running') return;
  s.prevLane = s.lane;
  s.lane = Math.max(0, Math.min(2, s.lane + dir));
  if (s.lane !== s.prevLane) {
    sfx.lane();
    if (s.y <= s.ground + 0.05) dust(s.x, s.ground, 0.3, 3, 1.5);
  }
}
function jump() {
  if (s.mode !== 'running') return;
  s.jumpBuffer = 0.18; // a tap just before landing still counts
}
function primaryAction() {
  if (s.mode === 'ready') { start(); return true; }
  if (s.mode === 'crashed') {
    if (s.crashT > 0.7) start();
    return true;
  }
  return false;
}

let touch = null;
const SWIPE_PX = 28;
const soundBtn = document.getElementById('soundBtn');
function renderSoundBtn() {
  soundBtn.textContent = sfx.on ? 'Sound on' : 'Sound off';
  soundBtn.setAttribute('aria-pressed', String(sfx.on));
}
renderSoundBtn();
soundBtn.addEventListener('pointerdown', (e) => {
  e.stopPropagation(); // don't jump or start a run
  e.preventDefault();
  sfx.unlock();
  sfx.toggle();
  if (sfx.on && s.board > 0) sfx.hum(true);
  if (sfx.on && s.jet > 0) sfx.roar(true);
  renderSoundBtn();
});
soundBtn.addEventListener('click', (e) => e.preventDefault());
window.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  sfx.unlock();
  if (primaryAction()) { touch = null; return; }
  touch = { id: e.pointerId, x: e.clientX, y: e.clientY, used: false };
}, { passive: false });
window.addEventListener('pointermove', (e) => {
  if (!touch || touch.id !== e.pointerId || touch.used) return;
  const dx = e.clientX - touch.x, dy = e.clientY - touch.y;
  if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) {
    moveLane(dx > 0 ? 1 : -1);
    touch.used = true;
  } else if (dy < -SWIPE_PX && Math.abs(dy) > Math.abs(dx)) {
    jump();
    touch.used = true;
  }
});
window.addEventListener('pointerup', (e) => {
  if (!touch || touch.id !== e.pointerId) return;
  if (!touch.used) jump(); // a plain tap jumps; swipe down does nothing, there is no ducking
  touch = null;
});
window.addEventListener('pointercancel', () => { touch = null; });
// stop iPad Safari from scrolling, zooming or bouncing
document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('dblclick', (e) => e.preventDefault());

window.addEventListener('keydown', (e) => {
  sfx.unlock();
  const k = e.key;
  if (k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'Enter') {
    e.preventDefault();
    if (!primaryAction()) jump();
  } else if (k === 'ArrowLeft' || k === 'a') { e.preventDefault(); moveLane(-1); }
  else if (k === 'ArrowRight' || k === 'd') { e.preventDefault(); moveLane(1); }
});
