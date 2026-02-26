import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useAppStore } from '../../src/store';
import { ChartLegend } from '../../src/components/charts/ChartLegend';

describe('ChartLegend', () => {
  beforeEach(() => {
    useAppStore.setState({
      selected: new Map(),
      unitPrefs: {
        isIP: false,
        energySI: 'J',
        energyIP: 'kBTU',
        powerIP: 'Btu/h',
        tempSI: 'C',
        tempIP: 'F',
      },
    });
  });

  it('renders nothing when no series are selected', () => {
    const { container } = render(<ChartLegend />);
    expect(container.innerHTML).toBe('');
  });

  it('renders a badge for each selected series', () => {
    const selected = new Map([
      [
        1,
        {
          meta: { id: 1, Name: 'Electricity:Facility', Units: 'J' },
          points: [],
          color: '#2563eb',
          visible: true,
        },
      ],
      [
        2,
        {
          meta: { id: 2, Name: 'Zone Air Temperature', key: 'Zone One', Units: 'C' },
          points: [],
          color: '#16a34a',
          visible: true,
        },
      ],
    ]);
    useAppStore.setState({ selected });
    render(<ChartLegend />);

    expect(screen.getByText(/Electricity:Facility/)).toBeDefined();
    expect(screen.getByText(/Zone Air Temperature/)).toBeDefined();
    expect(screen.getByText(/Zone One/)).toBeDefined();
  });

  it('applies line-through and reduced opacity when series is hidden', () => {
    const selected = new Map([
      [
        1,
        {
          meta: { id: 1, Name: 'Hidden Series', Units: 'J' },
          points: [],
          color: '#dc2626',
          visible: false,
        },
      ],
    ]);
    useAppStore.setState({ selected });
    const { container } = render(<ChartLegend />);

    const badge = container.querySelector('.line-through');
    expect(badge).toBeDefined();
    expect(badge).not.toBeNull();
  });
});
