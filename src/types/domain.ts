export type UnitsMode = 'SI' | 'IP';
export type ViewMode = 'time' | 'ldc' | 'balance' | 'scatter';

export interface SeriesMeta {
  id: number;
  Name: string;
  IndexGroup?: string;
  Units?: string;
  IsMeter?: number;
  key?: string;
  freq?: 'Hourly' | 'Monthly' | string;
}

export interface TimePoint {
  x?: number;
  xLabel?: string;
  y: number;
}

export interface Series {
  id: number;
  meta: SeriesMeta;
  points: TimePoint[];
  color?: string;
  visible?: boolean;
}

export interface DictionaryEntry extends SeriesMeta {
  Type?: string;
}

export interface LoadBalanceCategory {
  id: string;
  label: string;
  names: string[];
  sign: -1 | 0 | 1;
}

export interface RegressionModel {
  intercept: number;
  hCoeff?: number | null;
  cCoeff?: number | null;
  r2: number;
}
