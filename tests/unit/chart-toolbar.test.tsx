import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useAppStore } from '../../src/store';
import { ChartToolbar } from '../../src/components/charts/ChartToolbar';

// Minimal DOM stubs for legacy bridge elements
function stubLegacyElements() {
  for (const id of [
    'view-time',
    'view-ldc',
    'view-balance',
    'view-scatter',
    'resample-mode',
    'resample-agg',
    'ldc-normalize',
  ]) {
    if (!document.getElementById(id)) {
      const el = id.startsWith('resample')
        ? document.createElement('select')
        : id === 'ldc-normalize'
          ? document.createElement('input')
          : document.createElement('button');
      el.id = id;
      document.body.appendChild(el);
    }
  }
}

describe('ChartToolbar', () => {
  beforeEach(() => {
    useAppStore.setState({
      viewMode: 'time',
      resampleMode: 'original',
      resampleAgg: 'auto',
      normalize: false,
      selected: new Map(),
    });
    stubLegacyElements();
  });

  it('renders view mode toggle group with all 4 options', () => {
    render(<ChartToolbar />);
    expect(screen.getByText('Time Series')).toBeDefined();
    expect(screen.getByText('Load Duration')).toBeDefined();
    expect(screen.getByText('Load Balance')).toBeDefined();
    expect(screen.getByText('Scatter')).toBeDefined();
  });

  it('shows resolution and aggregation selects in time mode', () => {
    useAppStore.setState({ viewMode: 'time' });
    render(<ChartToolbar />);
    expect(screen.getByText('Resolution:')).toBeDefined();
    expect(screen.getByText('Aggregation:')).toBeDefined();
  });

  it('hides resolution/aggregation in ldc mode and shows normalize', () => {
    useAppStore.setState({ viewMode: 'ldc' });
    render(<ChartToolbar />);
    expect(screen.queryByText('Resolution:')).toBeNull();
    expect(screen.queryByText('Aggregation:')).toBeNull();
    expect(screen.getByText('Normalize to peak')).toBeDefined();
  });

  it('hides extra controls in scatter mode', () => {
    useAppStore.setState({ viewMode: 'scatter' });
    render(<ChartToolbar />);
    expect(screen.queryByText('Resolution:')).toBeNull();
    expect(screen.queryByText('Normalize to peak')).toBeNull();
  });

  it('hides extra controls in balance mode', () => {
    useAppStore.setState({ viewMode: 'balance' });
    render(<ChartToolbar />);
    expect(screen.queryByText('Resolution:')).toBeNull();
    expect(screen.queryByText('Normalize to peak')).toBeNull();
  });
});
