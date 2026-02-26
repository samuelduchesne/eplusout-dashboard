export function aggregateValues(values: number[], mode: 'sum' | 'avg' | 'min' | 'max'): number {
  if (!values.length) return 0;
  if (mode === 'sum') return values.reduce((a, b) => a + b, 0);
  if (mode === 'avg') return values.reduce((a, b) => a + b, 0) / values.length;
  if (mode === 'min') return Math.min(...values);
  return Math.max(...values);
}
