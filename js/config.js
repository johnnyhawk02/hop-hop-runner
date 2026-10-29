// Hop Hop Runner: Tuning numbers: lanes, speeds, jump and gravity.

// ---------- tuning ----------
const LANES = [-2.4, 0, 2.4];
const BASE_START = 12.5;     // world units per second
const BASE_MAX = 19.5;       // kept gentle for little players
const BOARD_BOOST = 1.22;    // a bit quicker on the hoverboard
// always full speed: no easing off after short runs (Johnny: it made it boring)
const START_SPEED = BASE_START, MAX_SPEED = BASE_MAX;
try { localStorage.removeItem('hopRunnerEase'); } catch (e) {} // forget any slow-down saved by the old helper
const SPEED_RAMP = 0.08;     // speed gained per second of running
const GRAVITY = 26;
const JUMP_V = 10;           // peak ≈ 1.9 units, every obstacle is ≤ 1.0 tall
const SPAWN_Z = -110;
const DESPAWN_Z = 12;
