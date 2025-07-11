import { describe, it, expect } from '@jest/globals';
import { movePacman } from '../src/pacman.js';

describe('Pacman movement', () => {
  it('moves within bounds', () => {
    const p = { x: 1, y: 1, dir: { x: 1, y: 0 } };
    movePacman(p, 28, 31);
    expect(p.x).toBe(2);
  });
});
