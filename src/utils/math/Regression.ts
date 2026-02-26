export function solveLinearSystem(A: number[][], b: number[]): number[] | null {
  const n = A.length;
  const M = A.map((r) => [...r]);
  const y = [...b];

  for (let i = 0; i < n; i++) {
    let max = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(M[k][i]) > Math.abs(M[max][i])) max = k;
    }
    if (max !== i) {
      [M[i], M[max]] = [M[max], M[i]];
      [y[i], y[max]] = [y[max], y[i]];
    }
    const piv = M[i][i];
    if (Math.abs(piv) < 1e-12) return null;

    for (let j = i; j < n; j++) M[i][j] /= piv;
    y[i] /= piv;

    for (let k = 0; k < n; k++) {
      if (k === i) continue;
      const factor = M[k][i];
      if (factor === 0) continue;
      for (let j = i; j < n; j++) M[k][j] -= factor * M[i][j];
      y[k] -= factor * y[i];
    }
  }
  return y;
}
