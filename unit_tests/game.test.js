import { describe, it, expect } from '@jest/globals';

import fs from 'fs';

import path from 'path';

const levelPath = path.resolve('assets/levels/level1.json');

describe('level file', () => {
  it('exists', () => {
    expect(fs.existsSync(levelPath)).toBe(true);
  });

  it('has correct dimensions', () => {
    const data = JSON.parse(fs.readFileSync(levelPath, 'utf-8'));
    expect(data.layout.length).toBe(31);
    expect(data.layout[0].length).toBe(28);
  });
});
