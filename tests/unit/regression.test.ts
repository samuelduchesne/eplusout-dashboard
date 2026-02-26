import { describe, expect, it } from 'vitest';
import { solveLinearSystem } from '../../src/utils/math/Regression';

describe('solveLinearSystem', () => {
  it('solves a simple 2x2 system', () => {
    const solution = solveLinearSystem(
      [
        [2, 1],
        [1, 3],
      ],
      [8, 13],
    );

    expect(solution).not.toBeNull();
    expect(solution?.[0]).toBeCloseTo(2.2, 6);
    expect(solution?.[1]).toBeCloseTo(3.6, 6);
  });
});
