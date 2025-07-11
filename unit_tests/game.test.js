import { describe, it, expect } from '@jest/globals';

import fs from 'fs';

import path from 'path';

const levelPath = path.resolve('assets/levels/level1.json');

describe('level file', () => {
  it('exists', () => {
    expect(fs.existsSync(levelPath)).toBe(true);
  });
});
