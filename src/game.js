import { Howl } from 'howler';
import { movePacman } from "./pacman.js";

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
const gameContainer = document.getElementById('game-container');
const muteBtn = document.getElementById('mute');

let muted = false;
let sound = new Howl({ src: ['assets/audio/chomp.mp3'], volume: 0.5 });

function init() {
  buildLevel();
  state = STATES.PLAYING;
  window.requestAnimationFrame(gameLoop);
}

function buildLevel() {
  gameContainer.innerHTML = '';
  for (let y = 0; y < FIELD_HEIGHT; y++) {
    for (let x = 0; x < FIELD_WIDTH; x++) {
      const tile = document.createElement('div');
      tile.className = 'tile pellet';
      tile.style.left = `${x * TILE_SIZE}px`;
      tile.style.top = `${y * TILE_SIZE}px`;
      gameContainer.appendChild(tile);
    }
  }
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

function update() {
  movePacman(pacman, FIELD_WIDTH, FIELD_HEIGHT);
  eatPellet(pacman.x, pacman.y);
}

function eatPellet(x, y) {
  const index = y * FIELD_WIDTH + x;
  const tile = gameContainer.children[index];
  if (tile && tile.classList.contains('pellet')) {
    tile.classList.remove('pellet');
    score += 10;
    scoreEl.textContent = score;
    if (!muted) sound.play();
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
