export function movePacman(p, width, height) {
  const nx = p.x + p.dir.x;
  const ny = p.y + p.dir.y;
  if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
    p.x = nx;
    p.y = ny;
  }
  return p;
}
