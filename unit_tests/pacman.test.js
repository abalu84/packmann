import { describe, it, expect } from '@jest/globals';

function createMockDom() {
  document.body.innerHTML = '<div id="game-container"><div class="wall"></div><div></div></div>';
}

describe('Pacman movement', () => {
  it('moves within bounds', async () => {
    const { movePacman } = await import('../src/pacman.js');
    const p = { x: 1, y: 1, dir: { x: 1, y: 0 } };
    movePacman(p, 28, 31);
    expect(p.x).toBe(2);
  });

  it('does not move when validator blocks', async () => {
    const { movePacman } = await import('../src/pacman.js');
    const validator = () => false;
    const p = { x: 0, y: 0, dir: { x: 1, y: 0 } };
    movePacman(p, 1, 1, validator);
    expect(p.x).toBe(0);
  });

  it('canMoveTo checks class', async () => {
    createMockDom();
    const { canMoveTo } = await import('../src/pacman.js');
    expect(canMoveTo(0,0)).toBe(false);
    expect(canMoveTo(1,0)).toBe(true);
  });
});
