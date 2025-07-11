export function movePacman(p, width, height, validator) {
  const nx = p.x + p.dir.x;
  const ny = p.y + p.dir.y;
  if (nx >= 0 && nx < width && ny >= 0 && ny < height && (!validator || validator(nx, ny))) {
    p.x = nx;
    p.y = ny;
  }
  return p;
}

export function canMoveTo(x, y) {
  const index = y * 28 + x;
  const tile = document.getElementById('game-container').children[index];
  return tile && !tile.classList.contains('wall');
}
