import type { UnitsMode, ViewMode } from '../types/domain';

export interface AppState {
  unitsMode: UnitsMode;
  viewMode: ViewMode;
  selectedIds: number[];
  favoriteIds: number[];
}

export class AppStateStore {
  private state: AppState;

  constructor(initial?: Partial<AppState>) {
    this.state = {
      unitsMode: 'SI',
      viewMode: 'time',
      selectedIds: [],
      favoriteIds: [],
      ...initial,
    };
  }

  getState(): AppState {
    return { ...this.state };
  }

  setState(patch: Partial<AppState>): void {
    this.state = { ...this.state, ...patch };
  }
}
