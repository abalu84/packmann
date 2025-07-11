import { Howl } from 'howler';
import { movePacman, canMoveTo } from "./pacman.js";

const FPS = 60;
const TILE_SIZE = 20;
const FIELD_WIDTH = 28;
const FIELD_HEIGHT = 31;

const STATES = {
  INIT: 'init',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'game_over',
  LEVEL_COMPLETE: 'level_complete',
  MENU: 'menu'
};

let state = STATES.INIT;
let score = 0;
let level = 1;
let lives = 3;
let highscore = parseInt(localStorage.getItem('highscore') || '0', 10);

const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const livesEl = document.getElementById('lives');
const highscoreEl = document.getElementById('highscore');
const debugEl = document.getElementById('debug');
const gameContainer = document.getElementById('game-container');
const muteBtn = document.getElementById('mute');

let muted = false;
let sound = new Howl({ src: ['assets/audio/chomp.mp3'], volume: 0.5 });
let debug = false;

function init() {
  scoreEl.textContent = score;
  levelEl.textContent = level;
  livesEl.textContent = lives;
  highscoreEl.textContent = highscore;
  buildLevel();
  state = STATES.PLAYING;
  window.requestAnimationFrame(gameLoop);
}

async function buildLevel() {
  gameContainer.innerHTML = '';
  const res = await fetch(`assets/levels/level${level}.json`);
  const data = await res.json();
  data.layout.forEach((row, y) => {
    row.split('').forEach((cell, x) => {
      const tile = document.createElement('div');
      tile.className = 'tile';
      if (cell === 'W') {
        tile.classList.add('wall');
      } else if (cell === '.') {
        tile.classList.add('pellet');
      }
      tile.style.left = `${x * TILE_SIZE}px`;
      tile.style.top = `${y * TILE_SIZE}px`;
      gameContainer.appendChild(tile);
    });
  });
}

let lastTime = 0;
function gameLoop(time) {
  const delta = time - lastTime;
  if (delta > 1000 / FPS) {
    update();
    draw();
    lastTime = time;
  }
  if (state === STATES.PLAYING) {
    window.requestAnimationFrame(gameLoop);
  }
}

let pacman = { x: 14, y: 23, dir: { x: 0, y: 0 } };
let ghosts = [
  { x: 13, y: 14, dir: { x: 0, y: 1 } },
  { x: 14, y: 14, dir: { x: 0, y: -1 } }
];

function update() {
  movePacman(pacman, FIELD_WIDTH, FIELD_HEIGHT, canMoveTo);
  eatPellet(pacman.x, pacman.y);
  moveGhosts();
  checkCollisions();
}

function eatPellet(x, y) {
  const index = y * FIELD_WIDTH + x;
  const tile = gameContainer.children[index];
  if (tile && tile.classList.contains('pellet')) {
    tile.classList.remove('pellet');
    score += 10;
    scoreEl.textContent = score;
    if (!muted) sound.play();
    updateHighscore();
  }
}

function moveGhosts() {
  ghosts.forEach(g => {
    if (Math.random() < 0.3) {
      g.dir = randomDir();
    }
    const nx = g.x + g.dir.x;
    const ny = g.y + g.dir.y;
    if (canMoveTo(nx, ny)) {
      g.x = nx;
      g.y = ny;
    } else {
      g.dir = randomDir();
    }
  });
}

function randomDir() {
  const dirs = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 }
  ];
  return dirs[Math.floor(Math.random() * dirs.length)];
}

function checkCollisions() {
  ghosts.forEach(g => {
    if (g.x === pacman.x && g.y === pacman.y) {
      loseLife();
    }
  });
}

function loseLife() {
  lives -= 1;
  livesEl.textContent = lives;
  if (lives <= 0) {
    state = STATES.GAME_OVER;
    updateHighscore();
    return;
  }
  pacman.x = 14; pacman.y = 23; pacman.dir = { x: 0, y: 0 };
  ghosts.forEach(g => g.x = 13);
}

function updateHighscore() {
  if (score > highscore) {
    highscore = score;
    localStorage.setItem('highscore', highscore.toString());
    highscoreEl.textContent = highscore;
  }
}

function draw() {
  const pacId = 'pacman';
  let el = document.getElementById(pacId);
  if (!el) {
    el = document.createElement('div');
    el.id = pacId;
    el.className = 'tile pacman';
    gameContainer.appendChild(el);
  }
  el.style.transform = `translate(${pacman.x * TILE_SIZE}px, ${pacman.y * TILE_SIZE}px)`;

  ghosts.forEach((g, i) => {
    const id = `ghost-${i}`;
    let gel = document.getElementById(id);
    if (!gel) {
      gel = document.createElement('div');
      gel.id = id;
      gel.className = 'tile ghost';
      gameContainer.appendChild(gel);
    }
    gel.style.transform = `translate(${g.x * TILE_SIZE}px, ${g.y * TILE_SIZE}px)`;
  });

  if (debug) {
    debugEl.textContent = `FPS: ${Math.round(1000 / (performance.now() - lastTime))}\nX:${pacman.x} Y:${pacman.y}`;
  }
}

function handleKey(e) {
  switch (e.key) {
    case 'ArrowUp': pacman.dir = { x: 0, y: -1 }; break;
    case 'ArrowDown': pacman.dir = { x: 0, y: 1 }; break;
    case 'ArrowLeft': pacman.dir = { x: -1, y: 0 }; break;
    case 'ArrowRight': pacman.dir = { x: 1, y: 0 }; break;
    case ' ': togglePause(); break;
    case 'Enter': if (state === STATES.GAME_OVER) restart(); break;
    case 'R': case 'r': restart(); break;
    case 'M': case 'm': toggleMute(); break;
    case 'D': if (e.shiftKey) toggleDebug(); break;
  }
}

function togglePause() {
  if (state === STATES.PLAYING) {
    state = STATES.PAUSED;
  } else if (state === STATES.PAUSED) {
    state = STATES.PLAYING;
    requestAnimationFrame(gameLoop);
  }
}

function restart() {
  score = 0;
  lives = 3;
  level = 1;
  init();
}

function toggleMute() {
  muted = !muted;
  muteBtn.textContent = muted ? 'Unmute' : 'Mute';
}

function toggleDebug() {
  debug = !debug;
  debugEl.style.display = debug ? 'block' : 'none';
}

muteBtn.addEventListener('click', toggleMute);
window.addEventListener('keydown', handleKey);

document.getElementById('touch-controls').addEventListener('click', e => {
  switch (e.target.id) {
    case 'up': pacman.dir = { x: 0, y: -1 }; break;
    case 'down': pacman.dir = { x: 0, y: 1 }; break;
    case 'left': pacman.dir = { x: -1, y: 0 }; break;
    case 'right': pacman.dir = { x: 1, y: 0 }; break;
  }
});

init();
